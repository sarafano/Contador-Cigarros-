// --- CONFIGURAÇÕES INICIAIS ---
function obterDataLocal() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const dataLocal = new Date(d.getTime() - (offset * 60000));
    return dataLocal.toISOString().split('T')[0];
}

const HOJE = obterDataLocal();
const PRECO_MACRO = 5.30; 
const CIG_POR_MACRO = 20;

let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');
let recordeSempre = localStorage.getItem('recordeLimpo') || 0;

if (!dados[HOJE]) {
    dados[HOJE] = { total: 0, gatilhos: {} };
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
}

// --- FUNÇÕES DE INTERFACE ---
function abrirModal() { document.getElementById('modalOverlay').classList.add('active'); }
function fecharModal() { document.getElementById('modalOverlay').classList.remove('active'); }

function abrirSOS() { 
    const frases = [
        "Bebe água gelada. Ajuda a passar a fissura.",
        "A vontade passa em 3 minutos. Tu és mais forte!",
        "Respira fundo 5 vezes. Sente o ar limpo.",
        "Pensa no dinheiro que estás a poupar agora.",
        "Muda de divisão. Sai de perto do cinzeiro.",
        "Lava os dentes. O sabor a menta corta a vontade."
    ];
    document.getElementById('frase-sos').innerText = frases[Math.floor(Math.random() * frases.length)];
    document.getElementById('modalSOS').classList.add('active'); 
}
function fecharSOS() { document.getElementById('modalSOS').classList.remove('active'); }

// --- LÓGICA PRINCIPAL ---
function atualizar() {
    const diaAtual = obterDataLocal();
    if (!dados[diaAtual]) dados[diaAtual] = { total: 0, gatilhos: {} };
    document.getElementById('contador').innerText = dados[diaAtual].total;
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    calcularTempoLimpo();
}

function registar(g) { 
    const diaAtual = obterDataLocal();
    if (!dados[diaAtual]) dados[diaAtual] = { total: 0, gatilhos: {} };
    dados[diaAtual].total++; 
    dados[diaAtual].gatilhos[g] = (dados[diaAtual].gatilhos[g] || 0) + 1; 
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    fecharModal(); 
    atualizar(); 
}

function calcularTempoLimpo() {
    const display = document.getElementById('display-tempo');
    if (!ultimoRegisto) {
        display.innerText = "A contar...";
        return;
    }
    const agora = new Date().getTime();
    const diffMs = agora - ultimoRegisto;
    if (diffMs > recordeSempre) {
        recordeSempre = diffMs;
        localStorage.setItem('recordeLimpo', recordeSempre);
    }
    const horas = Math.floor(diffMs / 3600000);
    const minutos = Math.floor((diffMs % 3600000) / 60000);
    display.innerText = `Limpo há: ${horas}h ${minutos}m`;
}

// --- SISTEMA DE BACKUP E RELATÓRIO ---
function exportarParaFicheiro() {
    let totalSempre = 0;
    Object.values(dados).forEach(dia => totalSempre += dia.total);
    const backupCompleto = {
        versao_app: "12.4-PWA",
        data_geracao: new Date().toLocaleString(),
        historico: dados,
        estatisticas_globais: {
            total_cigarros_acumulado: totalSempre,
            dinheiro_gasto_estimado: ((totalSempre / CIG_POR_MACRO) * PRECO_MACRO).toFixed(2) + "€",
            recorde_limpo_ms: recordeSempre,
            ultimo_cigarro: ultimoRegisto ? new Date(parseInt(ultimoRegisto)).toLocaleString() : "N/A"
        }
    };
    const conteudo = JSON.stringify(backupCompleto, null, 2);
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_cigarros_${HOJE}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';
    input.onchange = e => {
        const ficheiro = e.target.files[0];
        const leitor = new FileReader();
        leitor.onload = eventoLeitura => {
            try {
                const backupBruto = JSON.parse(eventoLeitura.target.result);
                const historicoRecuperado = backupBruto.historico || backupBruto;
                if (historicoRecuperado) {
                    if (confirm("Restaurar histórico?")) {
                        dados = historicoRecuperado;
                        localStorage.setItem('dadosCigarros', JSON.stringify(dados));
                        alert("Dados restaurados!");
                        location.reload();
                    }
                }
            } catch (erro) { alert("Erro ao ler o ficheiro."); }
        };
        leitor.readAsText(ficheiro);
    };
    input.click();
}

// FUNÇÃO DE EMAIL MELHORADA (RELATÓRIO)
function exportarEmail() {
    let totalSempre = 0;
    let relatorioDias = "";
    
    // Organizar os dias por data
    const diasOrdenados = Object.keys(dados).sort().reverse();
    
    diasOrdenados.forEach(dia => {
        totalSempre += dados[dia].total;
        // Formatar gatilhos de forma legível
        let gatilhosTexto = "";
        for (let g in dados[dia].gatilhos) {
            gatilhosTexto += `      - ${g}: ${dados[dia].gatilhos[g]}\n`;
        }
        relatorioDias += `📅 Data: ${dia}\n   🚬 Total: ${dados[dia].total}\n${gatilhosTexto}\n`;
    });

    const economia = ((totalSempre / CIG_POR_MACRO) * PRECO_MACRO).toFixed(2);
    const horasRecorde = Math.floor(recordeSempre / 3600000);

    let corpoEmail = `RELATÓRIO DE PROGRESSO - CONTROLO DE TABACO\n`;
    corpoEmail += `==========================================\n\n`;
    corpoEmail += `📊 RESUMO GERAL:\n`;
    corpoEmail += `------------------------------------------\n`;
    corpoEmail += `🔹 Total de cigarros fumados: ${totalSempre}\n`;
    corpoEmail += `🔹 Dinheiro gasto (estimado): ${economia}€\n`;
    corpoEmail += `🔹 Recorde de tempo limpo: ${horasRecorde} horas\n\n`;
    corpoEmail += `🗓️ HISTÓRICO DETALHADO:\n`;
    corpoEmail += `------------------------------------------\n`;
    corpoEmail += relatorioDias;
    corpoEmail += `\n==========================================\n`;
    corpoEmail += `Enviado pela minha App de Controlo Personalizada.`;

    const assunto = `Relatório de Controlo - ${HOJE}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpoEmail)}`;
}

function resetarDia() { 
    const diaAtual = obterDataLocal();
    if(confirm("Reiniciar o contador de hoje?")) { 
        dados[diaAtual] = { total: 0, gatilhos: {} }; 
        ultimoRegisto = null;
        localStorage.removeItem('ultimoRegistoTime');
        atualizar(); 
    } 
}

// Inicialização
setInterval(calcularTempoLimpo, 30000);
atualizar();

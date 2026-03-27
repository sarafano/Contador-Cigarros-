// --- CONFIGURAÇÕES INICIAIS ---
const HOJE = new Date().toISOString().split('T')[0];
const PRECO_MACRO = 5.30; // Ajusta para o teu preço médio
const CIG_POR_MACRO = 20;

// Carregar dados ou iniciar novo objeto
let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');
let recordeSempre = localStorage.getItem('recordeLimpo') || 0; // em milissegundos

if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };

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
    document.getElementById('contador').innerText = dados[HOJE].total;
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    calcularTempoLimpo();
}

function registar(g) { 
    dados[HOJE].total++; 
    dados[HOJE].gatilhos[g] = (dados[HOJE].gatilhos[g] || 0) + 1; 
    
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    
    fecharModal(); 
    atualizar(); 
}

function calcularTempoLimpo() {
    const display = document.getElementById('display-tempo');
    if (!ultimoRegisto) {
        display.innerText = "Ainda não fumaste hoje! 🎉";
        return;
    }

    const agora = new Date().getTime();
    const diffMs = agora - ultimoRegisto;
    
    // Atualizar Recorde se este tempo for o maior de sempre
    if (diffMs > recordeSempre) {
        recordeSempre = diffMs;
        localStorage.setItem('recordeLimpo', recordeSempre);
    }

    const horas = Math.floor(diffMs / 3600000);
    const minutos = Math.floor((diffMs % 3600000) / 60000);
    display.innerText = `Limpo há: ${horas}h ${minutos}m`;
}

// --- SISTEMA DE BACKUP AVANÇADO ---
function exportarParaFicheiro() {
    // Calculamos estatísticas extras para o backup ser rico em dados
    let totalSempre = 0;
    Object.values(dados).forEach(dia => totalSempre += dia.total);
    
    const backupCompleto = {
        versao_app: "12.3-PWA",
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
    const blob = new Blob([conteudo], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `backup_tabac_${HOJE}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    alert("Backup Avançado guardado com sucesso!");
}

function exportarEmail() {
    const conteudo = JSON.stringify(dados);
    window.location.href = `mailto:?subject=Backup_Cigarros&body=${encodeURIComponent(conteudo)}`;
}

function resetarDia() { 
    if(confirm("Reiniciar o contador de hoje?")) { 
        dados[HOJE] = { total: 0, gatilhos: {} }; 
        ultimoRegisto = null;
        localStorage.removeItem('ultimoRegistoTime');
        atualizar(); 
    } 
}

// Iniciar a App
setInterval(calcularTempoLimpo, 30000);
atualizar();

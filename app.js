// --- CONFIGURAÇÕES INICIAIS ---
const PRECO = 0.25; // Preço por cigarro (ajusta se necessário)
const HOJE = new Date().toISOString().split('T')[0];

let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

// --- FUNÇÃO DE ATUALIZAÇÃO DA INTERFACE ---
function atualizar() {
    if (!dados[HOJE]) {
        dados[HOJE] = { total: 0, gatilhos: {} };
    }
    
    // Atualiza o contador gigante no ecrã
    const countEl = document.getElementById('contador');
    if (countEl) countEl.innerText = dados[HOJE].total;
    
    calcularTempoLimpo();
    
    // Guarda os dados no navegador
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
}

// --- REGISTAR NOVO CIGARRO ---
function registar(gatilho) {
    if (!dados[HOJE]) {
        dados[HOJE] = { total: 0, gatilhos: {} };
    }
    
    dados[HOJE].total++;
    
    // Regista o gatilho específico
    dados[HOJE].gatilhos[gatilho] = (dados[HOJE].gatilhos[gatilho] || 0) + 1;
    
    // Guarda a hora exata para o cronómetro
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    
    // Fecha a janela de gatilhos (esta função está no index.html)
    if (typeof fecharModal === 'function') fecharModal();
    
    atualizar();
}

// --- CRONÓMETRO ---
function calcularTempoLimpo() {
    const display = document.getElementById('display-tempo');
    if (!display || !ultimoRegisto) return;
    
    const agora = new Date().getTime();
    const diffMs = agora - ultimoRegisto;
    
    const horas = Math.floor(diffMs / 3600000);
    const minutos = Math.floor((diffMs % 3600000) / 60000);
    
    display.innerText = `Limpo há: ${horas}h ${minutos}m`;
}

// --- FUNÇÃO DE BACKUP (FICHEIRO) ---
function exportarParaFicheiro() {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tabaco_backup_${HOJE}.txt`;
    a.click();
}

// --- FUNÇÃO DE EMAIL (RELATÓRIO FORMATADO COM GASTOS) ---
function exportarEmail() {
    let relatorio = "📊 RELATÓRIO COMPLETO - CONTROLO DE TABACO\n";
    relatorio += "==========================================\n\n";

    // 1. CÁLCULO DE GASTOS POR MÊS
    relatorio += "📅 RESUMO POR MÊS\n";
    relatorio += "------------------------------------------\n";
    
    let resumoMensal = {};
    Object.keys(dados).forEach(data => {
        let mesAno = data.substring(0, 7); // Extrai o Ano-Mês
        if (!resumoMensal[mesAno]) resumoMensal[mesAno] = { total: 0, gasto: 0 };
        resumoMensal[mesAno].total += dados[data].total;
        resumoMensal[mesAno].gasto += (dados[data].total * PRECO);
    });

    // Ordenar meses do mais recente para o mais antigo
    Object.keys(resumoMensal).sort().reverse().forEach(mes => {
        relatorio += `Mês: ${mes}\n`;
        relatorio += `   - Total fumado: ${resumoMensal[mes].total} cigarros\n`;
        relatorio += `   - Valor gasto:  ${resumoMensal[mes].gasto.toFixed(2)}€\n\n`;
    });

    // 2. DETALHE DIÁRIO
    relatorio += "📝 DETALHE DIÁRIO\n";
    relatorio += "------------------------------------------\n";
    
    const datasOrdenadas = Object.keys(dados).sort().reverse();

    datasOrdenadas.forEach(data => {
        const info = dados[data];
        relatorio += `📅 DATA: ${data}\n`;
        relatorio += `🚬 TOTAL: ${info.total} cigarros (${(info.total * PRECO).toFixed(2)}€)\n`;
        
        if (info.gatilhos && Object.keys(info.gatilhos).length > 0) {
            relatorio += `🎯 GATILHOS:\n`;
            for (const [gatilho, qtd] of Object.entries(info.gatilhos)) {
                relatorio += `   - ${gatilho}: ${qtd}\n`;
            }
        }
        relatorio += "------------------------------------------\n";
    });

    relatorio += "\n\n⚙️ CÓDIGO DE RESTAURO (Não apagar):\n";
    relatorio += JSON.stringify(dados);

    const uri = `mailto:?subject=Relatório de Consumo e Gastos&body=${encodeURIComponent(relatorio)}`;
    window.location.href = uri;
}

// --- RESTAURAR DADOS ---
function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const importado = JSON.parse(event.target.result);
                if (confirm("Deseja substituir os dados atuais pelos do backup?")) {
                    dados = importado;
                    atualizar();
                    alert("Dados restaurados com sucesso!");
                }
            } catch (err) {
                alert("Erro: O ficheiro não é um backup válido.");
            }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

// --- REINICIAR O DIA ---
function reiniciarDia() {
    if(confirm('Limpar a contagem de hoje?')) {
        dados[HOJE] = { total: 0, gatilhos: {} };
        atualizar();
    }
}

// --- INICIALIZAÇÃO AUTOMÁTICA ---
atualizar();
setInterval(calcularTempoLimpo, 30000); // Atualiza o cronómetro a cada 30 segundos

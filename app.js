// Configurações e Dados
const PRECO_UNITARIO = 0.25;
const HOJE = new Date().toISOString().split('T')[0];

let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

// 1. Função de Registo (Ligada ao Modal de Gatilhos)
function registar(gatilho) {
    if (!dados[HOJE]) {
        dados[HOJE] = { total: 0, gatilhos: {} };
    }
    
    dados[HOJE].total++;
    dados[HOJE].gatilhos[gatilho] = (dados[HOJE].gatilhos[gatilho] || 0) + 1;
    
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    
    salvarEAtualizar();
}

// 2. FUNÇÃO BACKUP: Cria um ficheiro de texto com os seus dados
function exportarParaFicheiro() {
    const dataStr = JSON.stringify(dados, null, 2);
    const blob = new Blob([dataStr], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.href = url;
    link.download = `backup_tabaco_${HOJE}.txt`;
    link.click();
    
    URL.revokeObjectURL(url);
}

// 3. FUNÇÃO EMAIL: Prepara um email com os dados para envio manual
function exportarEmail() {
    const dataStr = JSON.stringify(dados);
    const subject = encodeURIComponent("Backup Controlo de Tabaco");
    const body = encodeURIComponent("Aqui estão os meus dados de consumo:\n\n" + dataStr);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

// 4. FUNÇÃO RESTAURAR: Lê um ficheiro de backup e carrega os dados
function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = readerEvent => {
            try {
                const content = readerEvent.target.result;
                const dadosImportados = JSON.parse(content);
                
                if (confirm("Deseja substituir os dados atuais pelos do ficheiro?")) {
                    dados = dadosImportados;
                    salvarEAtualizar();
                    alert("Dados restaurados com sucesso!");
                }
            } catch (err) {
                alert("Erro ao ler o ficheiro. Verifique se é um backup válido.");
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Auxiliares
function salvarEAtualizar() {
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    atualizar();
}

function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    
    const countEl = document.getElementById('contador');
    if (countEl) countEl.innerText = dados[HOJE].total;
    
    calcularTempoLimpo();
}

function calcularTempoLimpo() {
    const display = document.getElementById('display-tempo');
    if (!display || !ultimoRegisto) return;
    
    const agora = new Date().getTime();
    const diffMs = agora - ultimoRegisto;
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    
    display.innerText = `Limpo há: ${h}h ${m}m`;
}

// Inicialização
atualizar();
setInterval(calcularTempoLimpo, 30000);

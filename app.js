const HOJE = new Date().toISOString().split('T')[0];
let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    document.getElementById('contador').innerText = dados[HOJE].total;
    calcularTempoLimpo();
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
}

function registar(g) {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    dados[HOJE].total++;
    dados[HOJE].gatilhos[g] = (dados[HOJE].gatilhos[g] || 0) + 1;
    
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    
    if (typeof fecharModal === 'function') fecharModal();
    atualizar();
}

function calcularTempoLimpo() {
    const display = document.getElementById('display-tempo');
    if (!display || !ultimoRegisto) return;
    const diff = new Date().getTime() - ultimoRegisto;
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    display.innerText = `Limpo há: ${h}h ${m}m`;
}

function exportarParaFicheiro() {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tabaco_backup_${HOJE}.txt`;
    a.click();
}

// --- FUNÇÃO DE EMAIL CORRIGIDA E FORMATADA ---
function exportarEmail() {
    let relatorio = "RELATÓRIO DE CONSUMO - CONTROLO DE TABACO\n";
    relatorio += "==========================================\n\n";

    // Ordenar as datas para o relatório ficar cronológico
    const datasOrdenadas = Object.keys(dados).sort().reverse();

    datasOrdenadas.forEach(data => {
        const info = dados[data];
        relatorio += `📅 DATA: ${data}\n`;
        relatorio += `🚬 TOTAL: ${info.total} cigarros\n`;
        
        if (info.gatilhos && Object.keys(info.gatilhos).length > 0) {
            relatorio += `🎯 GATILHOS:\n`;
            for (const [gatilho, qtd] of Object.entries(info.gatilhos)) {
                relatorio += `   - ${gatilho}: ${qtd}\n`;
            }
        }
        relatorio += "------------------------------------------\n";
    });

    relatorio += "\n\nCÓDIGO DE RESTAURO (Não apagar se quiser importar depois):\n";
    relatorio += JSON.stringify(dados);

    const uri = `mailto:?subject=Relatório de Consumo Tabaco&body=${encodeURIComponent(relatorio)}`;
    window.location.href = uri;
}

function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = event => {
            try {
                dados = JSON.parse(event.target.result);
                atualizar();
                alert("Dados restaurados!");
            } catch (err) { alert("Ficheiro inválido."); }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

function reiniciarDia() {
    if(confirm('Limpar contagem de hoje?')) {
        dados[HOJE] = { total: 0, gatilhos: {} };
        atualizar();
    }
}

atualizar();
setInterval(calcularTempoLimpo, 30000);

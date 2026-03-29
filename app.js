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
    
    fecharModal(); // Fecha a janela após clicar
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

// CORREÇÃO: FUNÇÃO BACKUP
function exportarParaFicheiro() {
    const blob = new Blob([JSON.stringify(dados, null, 2)], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `tabaco_backup_${HOJE}.txt`;
    a.click();
}

// CORREÇÃO: FUNÇÃO EMAIL
function exportarEmail() {
    const uri = `mailto:?subject=Backup Tabaco&body=${encodeURIComponent(JSON.stringify(dados))}`;
    window.location.href = uri;
}

// CORREÇÃO: FUNÇÃO RESTAURAR
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

// Iniciar
atualizar();
setInterval(calcularTempoLimpo, 30000);

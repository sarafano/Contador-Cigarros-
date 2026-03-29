const PRECO = 0.25;
const HOJE = new Date().toISOString().split('T')[0];
let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    document.getElementById('contador').innerText = dados[HOJE].total;
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    calcularTempoLimpo();
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
    a.download = `backup_tabaco.txt`;
    a.click();
}

function exportarEmail() {
    // Aqui chamamos a função que está no relatorio.js
    const corpoEmail = gerarRelatorioEmail(dados, PRECO);
    window.location.href = `mailto:?subject=Relatorio Tabaco&body=${encodeURIComponent(corpoEmail)}`;
}

function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                dados = JSON.parse(ev.target.result);
                atualizar();
                alert("Restaurado!");
            } catch (err) { alert("Ficheiro inválido"); }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

atualizar();
setInterval(calcularTempoLimpo, 30000);

const PRECO = 0.25;
const HOJE = new Date().toISOString().split('T')[0];
let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0 };
    const contadorEl = document.getElementById('contador');
    if (contadorEl) contadorEl.innerText = dados[HOJE].total;
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    calcularTempoLimpo();
}

function registar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0 };
    dados[HOJE].total++;
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    atualizar();
}

// FUNÇÃO DO BOTÃO MENOS
function remover() {
    if (dados[HOJE] && dados[HOJE].total > 0) {
        if(confirm("Descontar 1 cigarro?")) {
            dados[HOJE].total--;
            atualizar();
        }
    }
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
    let relatorio = "📊 RELATÓRIO\n\n";
    let resumoMensal = {};
    Object.keys(dados).forEach(data => {
        let mesAno = data.substring(0, 7);
        if (!resumoMensal[mesAno]) resumoMensal[mesAno] = { total: 0, gasto: 0 };
        resumoMensal[mesAno].total += dados[data].total;
        resumoMensal[mesAno].gasto += (dados[data].total * PRECO);
    });
    Object.keys(resumoMensal).sort().reverse().forEach(mes => {
        relatorio += `${mes}: ${resumoMensal[mes].total} cigs (${resumoMensal[mes].gasto.toFixed(2)}€)\n`;
    });
    relatorio += "\nCÓDIGO:\n" + JSON.stringify(dados);
    window.location.href = `mailto:?subject=Relatorio&body=${encodeURIComponent(relatorio)}`;
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
            } catch (err) { alert("Erro no ficheiro"); }
        };
        reader.readAsText(e.target.files[0]);
    };
    input.click();
}

function reiniciarDia() {
    if(confirm('Reiniciar hoje?')) {
        dados[HOJE] = { total: 0 };
        atualizar();
    }
}

atualizar();
setInterval(calcularTempoLimpo, 30000);

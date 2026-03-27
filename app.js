// --- CONFIGURAÇÕES ---
const PRECO_UNITARIO = 0.25; // Baseado no teu stats v11.1
const MIN_POR_CIG = 11;

function obterDataLocal() {
    const d = new Date();
    const offset = d.getTimezoneOffset();
    const dataLocal = new Date(d.getTime() - (offset * 60000));
    return dataLocal.toISOString().split('T')[0];
}

const HOJE = obterDataLocal();
let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');
let recordeSempre = localStorage.getItem('recordeLimpo') || 0;

// --- LOGICA ---
function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    const cont = document.getElementById('contador');
    if (cont) cont.innerText = dados[HOJE].total;
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
    const agora = new Date().getTime();
    const diffMs = agora - ultimoRegisto;
    if (diffMs > recordeSempre) {
        recordeSempre = diffMs;
        localStorage.setItem('recordeLimpo', recordeSempre);
    }
    const h = Math.floor(diffMs / 3600000);
    const m = Math.floor((diffMs % 3600000) / 60000);
    display.innerText = `Limpo há: ${h}h ${m}m`;
}

// --- EXPORTAÇÃO (O TEU NOVO RELATÓRIO) ---
function exportarEmail() {
    let totalSempre = 0;
    let resumoMensal = {};
    let relatorioDias = "";
    const diasOrdenados = Object.keys(dados).sort().reverse();

    diasOrdenados.forEach(dia => {
        const qtd = dados[dia].total;
        totalSempre += qtd;
        const mes = dia.substring(0, 7);
        resumoMensal[mes] = (resumoMensal[mes] || 0) + qtd;

        let gTexto = "";
        for (let g in dados[dia].gatilhos) {
            gTexto += `      - ${g}: ${dados[dia].gatilhos[g]}\n`;
        }
        relatorioDias += `📅 ${dia} | 🚬 ${qtd}\n${gTexto}`;
    });

    let textoMeses = "";
    for (let m in resumoMensal) {
        const custo = (resumoMensal[m] * PRECO_UNITARIO).toFixed(2);
        textoMeses += `📍 Mês ${m}: ${resumoMensal[m]} cigarros (${custo}€)\n`;
    }

    let corpo = `RESUMO DE CONTROLO\n====================\n\n`;
    corpo += `📊 TOTAIS POR MÊS:\n${textoMeses}\n`;
    corpo += `🗓️ HISTÓRICO DIÁRIO:\n--------------------\n${relatorioDias}`;

    const assunto = `Relatório Tabaco - ${HOJE}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
}

// Funções de Backup (Mantêm o formato JSON para a App ler)
function exportarParaFicheiro() {
    const conteudo = JSON.stringify(dados, null, 2);
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `backup_tabac_${HOJE}.txt`;
    a.click();
}

function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = e => {
        const leitor = new FileReader();
        leitor.onload = ev => {
            dados = JSON.parse(ev.target.result);
            localStorage.setItem('dadosCigarros', JSON.stringify(dados));
            location.reload();
        };
        leitor.readAsText(e.target.files[0]);
    };
    input.click();
}

setInterval(calcularTempoLimpo, 30000);
atualizar();

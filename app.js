// Configurações Iniciais
const PRECO_UNITARIO = 0.25;
const HOJE = new Date().toISOString().split('T')[0];

let dados = JSON.parse(localStorage.getItem('dadosCigarros')) || {};
let ultimoRegisto = localStorage.getItem('ultimoRegistoTime');

function atualizar() {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    
    // Atualiza o número grande no ecrã
    const contadorElemento = document.getElementById('contador');
    if (contadorElemento) {
        contadorElemento.innerText = dados[HOJE].total;
    }
    
    localStorage.setItem('dadosCigarros', JSON.stringify(dados));
    calcularTempoLimpo();
}

// ESTA É A FUNÇÃO QUE O BOTÃO + ATIVA
function abrirModal() {
    // Se não tiveres um modal HTML, esta função simplificada 
    // pergunta o gatilho e regista logo:
    const g = prompt("Qual o gatilho? (Café, Tédio, Hábito, Stress)");
    if (g) {
        registar(g);
    }
}

function registar(g) {
    if (!dados[HOJE]) dados[HOJE] = { total: 0, gatilhos: {} };
    
    dados[HOJE].total++;
    dados[HOJE].gatilhos[g] = (dados[HOJE].gatilhos[g] || 0) + 1;
    
    ultimoRegisto = new Date().getTime();
    localStorage.setItem('ultimoRegistoTime', ultimoRegisto);
    
    atualizar();
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

// Iniciar a app
atualizar();
setInterval(calcularTempoLimpo, 30000);

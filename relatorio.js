// relatorio.js - Especialista em gerar o resumo por email
function gerarRelatorioEmail(dados, precoUnitario) {
    let relatorio = "📊 RELATÓRIO DE CONSUMO E GASTOS\n";
    relatorio += "==========================================\n\n";

    // 1. CÁLCULO DE GASTOS POR MÊS
    relatorio += "📅 RESUMO POR MÊS\n";
    relatorio += "------------------------------------------\n";
    
    let resumoMensal = {};
    Object.keys(dados).forEach(data => {
        let mesAno = data.substring(0, 7); // Extrai "2026-03"
        if (!resumoMensal[mesAno]) resumoMensal[mesAno] = { total: 0, gasto: 0 };
        resumoMensal[mesAno].total += dados[data].total;
        resumoMensal[mesAno].gasto += (dados[data].total * precoUnitario);
    });

    Object.keys(resumoMensal).sort().reverse().forEach(mes => {
        relatorio += `Mês: ${mes}\n`;
        relatorio += `   - Total: ${resumoMensal[mes].total} cigarros\n`;
        relatorio += `   - Gasto: ${resumoMensal[mes].gasto.toFixed(2)}€\n\n`;
    });

    // 2. DETALHE DIÁRIO
    relatorio += "📝 DETALHE DIÁRIO\n";
    relatorio += "------------------------------------------\n";
    
    const datasOrdenadas = Object.keys(dados).sort().reverse();
    datasOrdenadas.forEach(data => {
        const info = dados[data];
        relatorio += `📅 DATA: ${data}\n`;
        relatorio += `🚬 TOTAL: ${info.total} (${(info.total * precoUnitario).toFixed(2)}€)\n`;
        
        if (info.gatilhos && Object.keys(info.gatilhos).length > 0) {
            relatorio += `🎯 GATILHOS:\n`;
            for (const [gatilho, qtd] of Object.entries(info.gatilhos)) {
                relatorio += `   - ${gatilho}: ${qtd}\n`;
            }
        }
        relatorio += "------------------------------------------\n";
    });

    relatorio += "\n\n⚙️ CÓDIGO DE RESTAURO:\n" + JSON.stringify(dados);
    return relatorio;
}

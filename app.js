// ... (manteém o topo do código igual até à função de exportar)

// --- SISTEMA DE BACKUP AVANÇADO (JSON para restauração) ---
function exportarParaFicheiro() {
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
    // Mudamos para .txt se preferires, mas o conteúdo continua estruturado para a App ler
    const blob = new Blob([conteudo], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `backup_tabac_${HOJE}.txt`; 
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

// --- NOVA FUNÇÃO: IMPORTAR DADOS ---
function importarBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.json';

    input.onchange = e => {
        const ficheiro = e.target.files[0];
        const leitor = new FileReader();
        
        leitor.onload = eventoLeitura => {
            try {
                const backupBruto = JSON.parse(eventoLeitura.target.result);
                
                // Verificamos se o ficheiro tem a estrutura correta
                if (backupBruto.historico) {
                    if (confirm("Isto vai substituir os dados atuais. Continuar?")) {
                        dados = backupBruto.historico;
                        recordeSempre = backupBruto.estatisticas_globais.recorde_limpo_ms || 0;
                        
                        localStorage.setItem('dadosCigarros', JSON.stringify(dados));
                        localStorage.setItem('recordeLimpo', recordeSempre);
                        
                        alert("Dados restaurados com sucesso!");
                        location.reload(); // Recarrega a página para mostrar tudo novo
                    }
                } else {
                    alert("Ficheiro inválido.");
                }
            } catch (erro) {
                alert("Erro ao ler o ficheiro. Certifica-te que é o backup correto.");
            }
        };
        leitor.readAsText(ficheiro);
    };
    input.click();
}

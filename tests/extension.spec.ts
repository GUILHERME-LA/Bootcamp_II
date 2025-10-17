import { test, expect, BrowserContext } from '@playwright/test';

// O teste agora aceita 'context' diretamente na função, que será o contexto da extensão
// conforme configurado no playwright.config.ts.
test('Deve configurar e parar o lembrete de água corretamente', async ({ context }) => {
    
    // O Playwright garante que 'context' é o BrowserContext que carrega a extensão.
    let extensionId: string | null = null;
    
    try {
        // 1. Aguarda o Service Worker da extensão carregar
        // Aumentando o timeout para 80 segundos para acomodar ambientes de CI/Docker lentos.
        const serviceWorker = await context.waitForEvent('serviceworker', { timeout: 80000 });
        
        // 2. Obtém o ID da extensão a partir da URL do Service Worker
        const url = serviceWorker.url();
        const match = url.match(/^chrome-extension:\/\/(.+)\//);
        
        if (!match || !match[1]) {
             throw new Error(`Não foi possível extrair o ID da extensão do URL do Service Worker: ${url}`);
        }
        
        extensionId = match[1];

    } catch (e) {
        // Captura o erro, seja timeout ou falha na extração do ID.
        throw new Error(`Falha ao carregar o Service Worker da extensão. Verifique se a pasta 'dist' e o playwright.config.ts estão corretos. Erro: ${e.message}`);
    }

    if (!extensionId) {
        throw new Error("ID da extensão não definido após a tentativa de carregamento.");
    }
    
    // 3. Obtém a URL do popup com o ID
    const popupUrl = `chrome-extension://${extensionId}/src/popup/popup.html`; // Caminho corrigido para MV3

    // 4. Navega para a página do popup (simulando o clique no ícone)
    const popupPage = await context.newPage(); 
    // Aumenta o timeout para a navegação inicial
    await popupPage.goto(popupUrl, { timeout: 60000 });
    
    // 5. Interage com os elementos do popup
    const inputIntervalo = popupPage.locator('#intervalo');
    const btnIniciar = popupPage.locator('#iniciar');
    const statusDiv = popupPage.locator('#status');

    // Intervalo para o teste
    const novoIntervalo = '10'; 

    // 6. Define o novo intervalo e Inicia
    await inputIntervalo.fill(novoIntervalo);
    await btnIniciar.click();
    // Remove o waitForTimeout desnecessário. O 'toHaveText' já espera a atualização do DOM.

    // 7. Verifica o status no popup (após iniciar)
    // Usamos um timeout de 10 segundos para dar tempo do background.js e popup.js se comunicarem.
    const activeStatusText = `Ativo! Próximo lembrete em ${novoIntervalo} min.`;
    await expect(statusDiv).toHaveText(activeStatusText, { timeout: 10000 });
    await expect(btnIniciar).toBeDisabled();
    
    // 8. Validação extra: verifica se a configuração foi salva (recarga o popup para testar chrome.storage.sync.get)
    await popupPage.reload();
    // Aguarda a UI re-renderizar com o status salvo
    await expect(statusDiv).toHaveText(activeStatusText, { timeout: 10000 });
    
    await expect(inputIntervalo).toHaveValue(novoIntervalo);
    
    // 9. Para o alarme
    const btnParar = popupPage.locator('#parar');
    await btnParar.click();
    // Remove o waitForTimeout desnecessário. O 'toHaveText' já espera a atualização do DOM.
    
    // 10. Verifica o status Parado
    await expect(statusDiv).toHaveText('Parado');
    await expect(btnParar).toBeDisabled();
    await expect(btnIniciar).toBeEnabled();
});

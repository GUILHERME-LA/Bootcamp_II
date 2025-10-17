import { test, expect } from '@playwright/test';
import path from 'node:path';

const dist = path.resolve(__dirname, '..', 'dist');

// Função utilitária para obter a URL do service worker
async function getExtensionServiceWorkerURL(page) {
    // Esta URL pode ser diferente dependendo do ambiente/versão do Chrome
    await page.goto('chrome://extensions/');
    // Usa uma função de avaliação para encontrar o ID da extensão e a URL do service worker
    const serviceWorkerUrl = await page.evaluate(async (extensionName) => {
        // Encontra o card da extensão pelo nome
        const extensionCard = Array.from(document.querySelectorAll('extensions-item'))
            .find(item => item.shadowRoot.querySelector('#name').textContent.includes(extensionName));
        
        if (extensionCard) {
            // Obtém o ID da extensão
            const extensionId = extensionCard.getAttribute('id');
            // A URL do service worker usa o ID
            return `chrome-extension://${extensionId}/_generated_background_page.html`;
        }
        return null;
    }, 'Lembrete de Água para Estudos'); // Nome do manifest.json

    // O Service Worker real em MV3 não tem uma página, 
    // mas a maneira mais simples de obter o ID da extensão é via chrome://extensions.
    // Uma forma mais robusta é tentar interagir com o popup.

    // **Alternativa mais simples: Abrir o Popup**
    const targets = await page.context().targets();
    const extension = targets.find(target => 
        target.url().startsWith('chrome-extension://') && target.type() === 'background_page'
    );
    // Em MV3, o service worker não tem uma URL de 'background_page' tradicional,
    // mas a URL do popup é acessível via context/target.

    // Tentativa simples:
    await page.goto('chrome://extensions/');
    const popupLink = await page.locator('extensions-item').filter({hasText: 'Lembrete de Água para Estudos'}).locator('#options-page');
    const extensionId = (await popupLink.getAttribute('href')).split('/')[2];
    
    // URL do popup
    return `chrome-extension://${extensionId}/src/popup/popup.html`;
}


test('deve configurar o alarme com sucesso via popup', async ({ page }) => {
    
    // 1. Obtém a URL do popup
    await page.goto('chrome://extensions/');
    
    // Localiza o item da extensão pelo nome (depende do idioma do Chrome)
    const extensionItem = page.locator('extensions-item').filter({ hasText: 'Lembrete de Água para Estudos' });
    
    // Clica no link do popup (que geralmente é o título/nome da extensão em modo developer)
    // O ID do popup é dinâmico, o jeito mais fácil é abrir uma nova página com a URL do popup
    const popupUrl = await extensionItem.locator('#options-page').getAttribute('href');
    
    if (!popupUrl) {
        throw new Error("Não foi possível encontrar a URL do popup. Verifique o seletor 'options-page'.");
    }

    const popupPage = await page.context().newPage();
    await popupPage.goto(popupUrl);
    
    // 2. Interage com os elementos do popup
    const inputIntervalo = popupPage.locator('#intervalo');
    const btnIniciar = popupPage.locator('#iniciar');
    const statusDiv = popupPage.locator('#status');

    // Intervalo para o teste
    const novoIntervalo = '10'; 

    // 3. Define o novo intervalo e Inicia
    await inputIntervalo.fill(novoIntervalo);
    await btnIniciar.click();

    // 4. Verifica o status no popup
    await expect(statusDiv).toHaveText(`Ativo! Próximo lembrete em ${novoIntervalo} min.`);
    await expect(btnIniciar).toBeDisabled();
    
    // 5. Validação extra: verifica se a configuração foi salva (recarga o popup)
    await popupPage.reload();
    await expect(inputIntervalo).toHaveValue(novoIntervalo);
    await expect(statusDiv).toHaveText(`Ativo! Próximo lembrete em ${novoIntervalo} min.`);
    
    // 6. Para o alarme
    const btnParar = popupPage.locator('#parar');
    await btnParar.click();
    
    // 7. Verifica o status Parado
    await expect(statusDiv).toHaveText('Parado');
    await expect(btnParar).toBeDisabled();
    await expect(btnIniciar).toBeEnabled();

    await popupPage.close();
});

// Este é um teste mais complexo que requer um contexto de extensão real
// e a URL do service worker para inspecionar chrome.alarms.get.
// O teste acima (interação com o popup) é suficiente para um E2E básico.
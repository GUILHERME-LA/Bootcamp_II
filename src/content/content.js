// content.js - Este script é executado no contexto de todas as páginas da web visitadas.
// Sua função principal é interagir com o DOM da página.

console.log("Lembrete de Água: Content script loaded.");

// Função para injetar um pequeno aviso na tela quando o Service Worker o solicitar.
function displayHydrationReminder(message) {
    let reminder = document.getElementById('hydration-reminder-overlay');
    
    if (!reminder) {
        reminder = document.createElement('div');
        reminder.id = 'hydration-reminder-overlay';
        reminder.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            z-index: 99999;
            padding: 10px 15px;
            background-color: #4CAF50;
            color: white;
            border-radius: 8px;
            font-size: 16px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            opacity: 0;
            transition: opacity 0.5s ease-in-out;
        `;
        document.body.appendChild(reminder);
    }
    
    reminder.textContent = message;
    
    // Mostra o lembrete
    reminder.style.opacity = '1';

    // Esconde o lembrete após 5 segundos
    setTimeout(() => {
        reminder.style.opacity = '0';
    }, 5000);
}

// Listener para receber mensagens do Service Worker (background.js).
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.acao === 'mostrarLembreteNaPagina') {
        displayHydrationReminder('Beba um copo de água agora! 💧');
        sendResponse({ status: "Lembrete mostrado" });
        return true; // Indica que a resposta será enviada assincronamente
    }
});

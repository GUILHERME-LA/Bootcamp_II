const DEFAULT_INTERVAL = 30; // Minutos padrão para quando a extensão é instalada pela primeira vez

// Função para enviar notificação
function enviarNotificacao() {
  chrome.notifications.create({
    type: 'basic',
    // Caminho absoluto corrigido (começa na raiz da extensão)
    iconUrl: '/icons/icon48.png', 
    title: 'Hora de Beber Água! 💧',
    message: 'Não esqueça de se hidratar durante os estudos. Beba um copo agora!'
  });
}

// Configura o alarme recorrente
function configurarAlarme(intervaloMinutos) {
  // Cancela alarmes antigos
  chrome.alarms.clear('lembreteAgua');

  // Cria novo alarme a cada X minutos
  chrome.alarms.create('lembreteAgua', {
    delayInMinutes: intervaloMinutos,
    periodInMinutes: intervaloMinutos
  });

  console.log(`Alarme configurado para a cada ${intervaloMinutos} minutos.`);
}

// Quando o alarme dispara
chrome.alarms.onAlarm.addListener((alarme) => {
  if (alarme.name === 'lembreteAgua') {
    enviarNotificacao();
  }
});

// Inicializa ao carregar a extensão (garante que o alarme é restaurado ao reiniciar o Chrome)
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['intervalo'], (resultado) => {
    // Usa o valor salvo ou o padrão se for a primeira vez
    const intervalo = resultado.intervalo || DEFAULT_INTERVAL; 
    configurarAlarme(intervalo);
  });
});

// Escuta MENSAGENS do popup para INICIAR ou PARAR (ÚNICO LISTENER)
chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
  // 1. AÇÃO INICIAR
  if (mensagem.acao === 'configurarAlarme') {
    configurarAlarme(mensagem.intervalo);
    chrome.storage.sync.set({ intervalo: mensagem.intervalo });
    sendResponse({ status: 'sucesso' });
    return true; 
  }
  
  // 2. AÇÃO PARAR
  if (mensagem.acao === 'pararAlarme') {
    chrome.alarms.clear('lembreteAgua');
    sendResponse({ status: 'parado' });
    return true; 
  }
});
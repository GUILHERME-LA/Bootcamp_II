// Configurações padrão
const DEFAULT_INTERVAL = 30; // Minutos padrão

// Função para enviar notificação
function enviarNotificacao() {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png', // Use seu ícone ou remova se não tiver
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

// Inicializa ao carregar a extensão
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.sync.get(['intervalo'], (resultado) => {
    const intervalo = resultado.intervalo || DEFAULT_INTERVAL;
    configurarAlarme(intervalo);
  });
});

// Escuta mensagens do popup para reconfigurar
chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
  if (mensagem.acao === 'configurarAlarme') {
    configurarAlarme(mensagem.intervalo);
    chrome.storage.sync.set({ intervalo: mensagem.intervalo });
    sendResponse({ status: 'sucesso' });
  }
});
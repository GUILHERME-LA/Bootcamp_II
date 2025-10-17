// Configurações padrão
const DEFAULT_INTERVAL = 30; // Minutos padrão
const ALARM_NAME = 'lembreteAgua';

// Função para enviar notificação (chamada quando o alarme dispara)
function enviarNotificacao() {
  chrome.notifications.create('lembreteAguaNotificacao', {
    type: 'basic',
    iconUrl: 'icons/icon48.png', 
    title: 'Hora de Beber Água! 💧',
    message: 'Não esqueça de se hidratar durante os estudos. Beba um copo agora!'
  });
}

// Configura o alarme recorrente
async function configurarAlarme(intervaloMinutos) {
  // Salva o intervalo no storage
  await chrome.storage.sync.set({ intervalo: intervaloMinutos });
  
  // Cancela alarmes antigos
  await chrome.alarms.clear(ALARM_NAME);
  
  // Cria novo alarme. O delayInMinutes inicia o primeiro alarme após o intervalo.
  chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: 1, // Inicia em 1 minuto para testes, depois repete no intervalo
    periodInMinutes: intervaloMinutos
  });
}

// Para o alarme
async function pararAlarme() {
  // Limpa o alarme (essencial para o status 'Parado')
  await chrome.alarms.clear(ALARM_NAME);
  // Define o intervalo como 0 para indicar que está parado, mesmo que o alarme tenha sido limpo
  await chrome.storage.sync.set({ intervalo: 0 }); 
}

// Listener para Alarme (Dispara a notificação)
chrome.alarms.onAlarm.addListener((alarme) => {
  if (alarme.name === ALARM_NAME) {
    enviarNotificacao();
  }
});

// Listener para Mensagens (CRUCIAL para a comunicação com popup.js e os testes)
// DEVE ser assíncrono para garantir que sendResponse seja chamado DEPOIS de storage/alarms.
chrome.runtime.onMessage.addListener((mensagem, sender, sendResponse) => {
    // Flag para indicar que a resposta será enviada de forma assíncrona.
    const isAsync = true; 

    (async () => {
        if (mensagem.acao === 'configurarAlarme' && mensagem.intervalo) {
            try {
                await configurarAlarme(mensagem.intervalo);
                sendResponse({ status: 'sucesso' });
            } catch (error) {
                console.error("Erro ao configurar alarme no Service Worker:", error);
                sendResponse({ status: 'erro', mensagem: 'Falha ao configurar alarme' });
            }
        } else if (mensagem.acao === 'pararAlarme') {
            try {
                await pararAlarme();
                sendResponse({ status: 'sucesso' });
            } catch (error) {
                 console.error("Erro ao parar alarme no Service Worker:", error);
                 sendResponse({ status: 'erro', mensagem: 'Falha ao parar alarme' });
            }
        } else {
             sendResponse({ status: 'erro', mensagem: 'Ação desconhecida' });
        }
    })();

    // Retorna true para indicar que sendResponse será chamada depois que a função async() terminar.
    return isAsync; 
});

// Listener de Instalação (Configuração inicial)
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get(['intervalo'], (resultado) => {
        const intervalo = resultado.intervalo || DEFAULT_INTERVAL;
        // Se o intervalo não estava salvo, salva o padrão (30 min)
        if (!resultado.intervalo) {
            chrome.storage.sync.set({ intervalo: intervalo });
        }
        // Não iniciamos o alarme aqui, apenas configuramos o valor padrão no storage.
    });
});

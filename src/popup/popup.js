document.addEventListener('DOMContentLoaded', function() {
  const intervaloInput = document.getElementById('intervalo');
  const btnIniciar = document.getElementById('iniciar');
  const btnParar = document.getElementById('parar');
  const statusDiv = document.getElementById('status');
  
  // Define o nome do alarme para consistência com o Service Worker
  const ALARM_NAME = 'lembreteAgua';

  // Função auxiliar para mostrar erros no status temporariamente
  function mostrarErro(mensagem) {
    statusDiv.textContent = `ERRO: ${mensagem}`;
    statusDiv.style.backgroundColor = '#fce4ec'; // Rosa claro
    setTimeout(checarStatus, 3000); // Tenta reverter o status após 3s
  }
  
  // Função para atualizar status e botões
  function atualizarStatus(ativo, proximo) {
    if (ativo) {
      statusDiv.textContent = `Ativo! Próximo lembrete em ${proximo} min.`;
      statusDiv.style.backgroundColor = '#e8f5e8'; // Verde claro
      btnIniciar.disabled = true;
      btnParar.disabled = false;
    } else {
      statusDiv.textContent = 'Parado';
      statusDiv.style.backgroundColor = '#ffebee'; // Vermelho claro
      btnIniciar.disabled = false;
      btnParar.disabled = true;
    }
  }

  // Checa o status atual da extensão
  function checarStatus() {
    // Usamos chrome.storage.sync.get para obter o intervalo salvo
    chrome.storage.sync.get(['intervalo'], (data) => {
      const intervalo = data.intervalo || 30; // Valor padrão de 30 min

      // Se o intervalo salvo é maior que zero, o lembrete está logicamente ativo
      if (intervalo > 0) {
        intervaloInput.value = intervalo;
        atualizarStatus(true, intervalo);
      } else {
        // Se o intervalo é 0, está parado
        intervaloInput.value = intervalo; // Exibe 0, ou o último valor salvo (30)
        atualizarStatus(false);
      }
    });
  }

  // Evento de Iniciar (Comunicação Promise-based)
  btnIniciar.addEventListener('click', () => {
    const intervaloString = intervaloInput.value;
    const intervalo = parseInt(intervaloString, 10);
    
    // Validação
    if (isNaN(intervalo) || intervalo < 5 || intervalo > 120) {
      mostrarErro('Intervalo deve ser um número entre 5 e 120 minutos.');
      return;
    }
    
    // Envia mensagem para background e espera a Promise de resposta
    chrome.runtime.sendMessage({
      acao: 'configurarAlarme',
      intervalo: intervalo
    })
    .then((resposta) => {
      // Verifica se houve uma resposta de sucesso do Service Worker
      if (resposta && resposta.status === 'sucesso') {
        atualizarStatus(true, intervalo); 
      } else {
        mostrarErro(resposta.mensagem || 'Falha na configuração. O Service Worker pode estar inativo.');
      }
    })
    .catch((error) => {
      // Captura o erro de falha de conexão com o Service Worker (MV3)
      console.error("Erro ao configurar alarme:", error);
      mostrarErro('Falha de comunicação: Service Worker inativo ou erro interno.');
    });

  });
  
  // Botão Parar (Comunicação Promise-based)
  btnParar.addEventListener('click', () => {
    // Envia mensagem para background e espera a Promise de resposta
    chrome.runtime.sendMessage({
      acao: 'pararAlarme'
    })
    .then((resposta) => {
      // O Service Worker limpa o alarme e define o storage para 0
      if (resposta && resposta.status === 'sucesso') {
        intervaloInput.value = '30'; // Volta o valor do input para o default visualmente
        atualizarStatus(false);
      } else {
         mostrarErro(resposta.mensagem || 'Falha ao parar. O Service Worker pode estar inativo.');
      }
    })
    .catch((error) => {
      console.error("Erro ao parar alarme:", error);
      mostrarErro('Falha de comunicação: Service Worker inativo ou erro interno.');
    });
  });

  // Inicializa o estado do popup
  checarStatus();
});

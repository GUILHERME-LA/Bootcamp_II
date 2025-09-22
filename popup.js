document.addEventListener('DOMContentLoaded', function() {
  const intervaloInput = document.getElementById('intervalo');
  const btnIniciar = document.getElementById('iniciar');
  const btnParar = document.getElementById('parar');
  const statusDiv = document.getElementById('status');
  
  // Carrega configuração salva
  chrome.storage.sync.get(['intervalo'], (resultado) => {
    if (resultado.intervalo) {
      intervaloInput.value = resultado.intervalo;
    }
  });
  
  // Função para atualizar status
  function atualizarStatus(ativo, proximo) {
    if (ativo) {
      statusDiv.textContent = `Ativo! Próximo lembrete em ${proximo} min.`;
      statusDiv.style.backgroundColor = '#e8f5e8';
    } else {
      statusDiv.textContent = 'Parado';
      statusDiv.style.backgroundColor = '#ffebee';
    }
  }
  
  // Botão Iniciar
  btnIniciar.addEventListener('click', () => {
    const intervalo = parseInt(intervaloInput.value);
    if (intervalo < 5 || intervalo > 120) {
      alert('Intervalo deve ser entre 5 e 120 minutos.');
      return;
    }
    
    // Envia mensagem para background
    chrome.runtime.sendMessage({
      acao: 'configurarAlarme',
      intervalo: intervalo
    }, (resposta) => {
      if (resposta && resposta.status === 'sucesso') {
        atualizarStatus(true, intervalo);
        btnIniciar.disabled = true;
        btnParar.disabled = false;
      }
    });
  });
  
  // Botão Parar
  btnParar.addEventListener('click', () => {
    chrome.alarms.clear('lembreteAgua', (foiLimpo) => {
      if (foiLimpo) {
        atualizarStatus(false, 0);
        btnIniciar.disabled = false;
        btnParar.disabled = true;
      }
    });
  });
  
  // Inicializa status (verifica se alarme está ativo)
  chrome.alarms.get('lembreteAgua', (alarme) => {
    if (alarme) {
      atualizarStatus(true, alarme.periodInMinutes);
      btnIniciar.disabled = true;
      btnParar.disabled = false;
    } else {
      btnParar.disabled = true;
    }
  });
});
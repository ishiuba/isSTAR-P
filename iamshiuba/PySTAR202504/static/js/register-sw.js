if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/js/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado com sucesso:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // Mostrar notificação de atualização
              showUpdateNotification();
            }
          });
        });
      })
      .catch(error => {
        console.error('Erro ao registrar Service Worker:', error);
      });
  });
}

// Função para mostrar notificação de atualização
function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <p>Nova versão disponível!</p>
    <button id="update-app">Atualizar</button>
  `;
  
  document.body.appendChild(notification);
  
  document.getElementById('update-app').addEventListener('click', () => {
    // Enviar mensagem para o service worker atualizar
    navigator.serviceWorker.controller.postMessage({ action: 'skipWaiting' });
    
    // Recarregar a página
    window.location.reload();
    
    // Remover notificação
    notification.remove();
  });
}

// Verificar se o app pode ser instalado
let deferredPrompt = null;

// Verificar se o app já está instalado
function isAppInstalled() {
  // Verificar se está sendo executado em modo standalone (instalado)
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Verificar se foi instalado via iOS
  if (window.navigator.standalone === true) {
    return true;
  }
  
  // Verificar se está sendo executado como PWA no desktop
  if (window.matchMedia('(display-mode: window-controls-overlay)').matches) {
    return true;
  }
  
  return false;
}

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir o comportamento padrão
  e.preventDefault();
  
  // Se o app já estiver instalado, não mostrar o botão
  if (isAppInstalled()) {
    return;
  }
  
  // Armazenar o evento para uso posterior
  deferredPrompt = e;
  
  // Mostrar botão de instalação
  const installButton = document.createElement('button');
  installButton.id = 'install-app';
  installButton.className = 'install-button';
  installButton.innerHTML = '<i class="fas fa-download"></i> Instalar App';
  
  // Adicionar ao DOM apenas se não existir
  if (!document.getElementById('install-app')) {
    document.querySelector('footer').appendChild(installButton);
  }
  
  // Adicionar evento de clique
  installButton.addEventListener('click', () => {
    // Mostrar prompt de instalação
    deferredPrompt.prompt();
    
    // Esperar pela resposta do usuário
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('Usuário aceitou a instalação');
      } else {
        console.log('Usuário recusou a instalação');
      }
      
      // Limpar o prompt armazenado
      deferredPrompt = null;
      
      // Remover botão
      installButton.remove();
    });
  });
});

// Adicionar um listener para quando o app é instalado
window.addEventListener('appinstalled', (event) => {
  console.log('App foi instalado');
  
  // Remover o botão de instalação se existir
  const installButton = document.getElementById('install-app');
  if (installButton) {
    installButton.remove();
  }
  
  // Limpar o prompt armazenado
  deferredPrompt = null;
});
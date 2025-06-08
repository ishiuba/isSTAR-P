// Service Worker Registration and Management
let refreshing = false;
let registration = null;

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    registerServiceWorker();
    setupRefreshListener();
  });
}

// Register the service worker
async function registerServiceWorker() {
  try {
    registration = await navigator.serviceWorker.register('/static/js/service-worker.js');
    console.log('[PWA] Service Worker registered successfully:', registration.scope);

    // Check for updates when service worker changes
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('[PWA] New service worker installing...');

      newWorker.addEventListener('statechange', () => {
        console.log('[PWA] Service Worker state changed:', newWorker.state);

        // If there's a new service worker installed and we have a controller
        // (meaning this isn't the first install), show update notification
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('[PWA] New content available!');
          showUpdateNotification();
        }
      });
    });

    // Check if there's already a waiting worker
    if (registration.waiting) {
      console.log('[PWA] Service Worker waiting');
      showUpdateNotification();
    }

  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
  }
}

// Listen for controller change and reload the page
function setupRefreshListener() {
  // When the service worker is updated, reload the page
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    console.log('[PWA] Controller changed, refreshing page...');
    window.location.reload();
  });
}

// Show update notification with improved UI
function showUpdateNotification() {
  // Remove any existing notification first
  const existingNotification = document.querySelector('.update-notification');
  if (existingNotification) {
    existingNotification.remove();
  }

  // Create new notification
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    <div class="update-content">
      <div class="update-icon">
        <i class="fas fa-sync-alt"></i>
      </div>
      <div class="update-text">
        <p>Nova versão disponível!</p>
        <small>Atualize para obter as últimas melhorias</small>
      </div>
      <div class="update-actions">
        <button id="update-later" class="update-btn secondary">Depois</button>
        <button id="update-now" class="update-btn primary">Atualizar agora</button>
      </div>
    </div>
  `;

  document.body.appendChild(notification);

  // Add animation to make it slide in
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  // Setup event listeners
  document.getElementById('update-now').addEventListener('click', () => {
    updateApp();
  });

  document.getElementById('update-later').addEventListener('click', () => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  });
}

// Update the application
function updateApp() {
  if (!registration || !registration.waiting) {
    console.warn('[PWA] No waiting service worker found');
    return;
  }

  console.log('[PWA] Sending skipWaiting message to waiting service worker');
  registration.waiting.postMessage({ action: 'skipWaiting' });
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
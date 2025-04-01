const CACHE_NAME = 'iamshiuba-cache-v1';
const urlsToCache = [
  '/',
  '/static/dist/output.css',
  '/static/js/utils/CurrentPageLink.js',
  '/static/js/utils/ThemeSelector.js',
  '/static/img/is_web.svg',
  '/static/translations/en-US.json',
  '/static/translations/pt-BR.json',
  '/static/translations/jp-JP.json',
  '/static/translations/ru-RU.json',
  '/static/translations/hi-IN.json',
  '/static/translations/zh-CN.json'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Estratégia de cache: Network First, fallback para cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Clonar a resposta para armazenar no cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then(cache => {
            // Armazenar apenas respostas bem-sucedidas
            if (event.request.method === 'GET' && response.status === 200) {
              cache.put(event.request, responseToCache);
            }
          });
          
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tente buscar do cache
        return caches.match(event.request);
      })
  );
});

// Evento de mensagem para atualizar o cache
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});
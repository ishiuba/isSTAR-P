const CACHE_NAME = 'iamshiuba-cache-v2';
const STATIC_CACHE = 'iamshiuba-static-v2';
const DYNAMIC_CACHE = 'iamshiuba-dynamic-v2';

// Assets that should be cached immediately on install
const CORE_ASSETS = [
  '/',
  '/static/dist/output.css',
  '/static/js/utils/ImageOptimizer.js',
  '/static/js/utils/ThemeSelector.js',
  '/static/js/utils/Translations.js',
  '/static/img/is_web.svg',
  '/static/translations/en-US.json',
  '/static/translations/pt-BR.json',
  '/static/translations/jp-JP.json',
  '/static/translations/ru-RU.json',
  '/static/translations/hi-IN.json',
  '/static/translations/zh-CN.json',
  '/static/img/icons/icon-192x192.png',
  '/static/manifest.json',
  '/health'
];

// Additional assets to cache when they're first accessed
const CACHE_EXTENSIONS = [
  '\.css$',
  '\.js$',
  '\.svg$',
  '\.png$',
  '\.jpg$',
  '\.json$',
  '\.ico$'
];

// Installation - Cache core assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Pre-caching core assets');
        return cache.addAll(CORE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
  );
});

// Activation - Clean up old caches
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE];

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (!currentCaches.includes(cacheName)) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Claiming clients');
        return self.clients.claim(); // Take control of all clients
      })
  );
});

// Fetch strategy: Stale-While-Revalidate for most resources
self.addEventListener('fetch', event => {
  const request = event.request;

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || request.url.startsWith('chrome-extension://')) {
    return;
  }

  // Skip cross-origin requests except for specific CDNs we want to cache
  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isTrustedCDN = [
    'cdnjs.cloudflare.com',
    'cdn.jsdelivr.net',
    'fonts.googleapis.com',
    'fonts.gstatic.com'
  ].some(cdn => url.hostname.includes(cdn));

  if (!isSameOrigin && !isTrustedCDN) {
    return;
  }

  // Check if the request matches our cacheable extensions
  const isStaticAsset = CACHE_EXTENSIONS.some(pattern => {
    const regex = new RegExp(pattern);
    return regex.test(url.pathname);
  });

  // API requests - Network only with timeout fallback
  if (url.pathname.includes('/api/') || url.pathname === '/health') {
    event.respondWith(
      timeoutNetworkFirst(request, 3000)
    );
    return;
  }

  // HTML pages - Network first with cache fallback
  if (request.headers.get('Accept').includes('text/html')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then(cache => {
        return fetch(request)
          .then(response => {
            // Cache a copy of the response
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            console.log('[Service Worker] Serving cached HTML for:', request.url);
            return cache.match(request)
              .then(cachedResponse => {
                return cachedResponse || caches.match('/');
              });
          });
      })
    );
    return;
  }

  // Static assets - Cache first, network fallback
  if (isStaticAsset) {
    event.respondWith(
      caches.match(request)
        .then(cachedResponse => {
          // Return cached response if available
          if (cachedResponse) {
            // Refresh cache in the background
            fetch(request)
              .then(response => {
                if (response.status === 200) {
                  caches.open(STATIC_CACHE)
                    .then(cache => cache.put(request, response));
                }
              })
              .catch(() => console.log('[Service Worker] Failed to update cache for:', request.url));

            return cachedResponse;
          }

          // If not in cache, fetch from network and cache
          return fetch(request)
            .then(response => {
              if (!response || response.status !== 200) {
                return response;
              }

              // Cache a copy of the response
              caches.open(STATIC_CACHE)
                .then(cache => cache.put(request, response.clone()));

              return response.clone();
            });
        })
    );
    return;
  }

  // Default strategy for other requests - Network with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, responseToCache));
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Helper function for network requests with timeout
function timeoutNetworkFirst(request, timeout) {
  return new Promise(resolve => {
    // Set a timeout for the network request
    const timeoutId = setTimeout(() => {
      caches.match(request)
        .then(cachedResponse => {
          if (cachedResponse) {
            console.log('[Service Worker] Timeout - Using cached response for:', request.url);
            resolve(cachedResponse);
          }
        });
    }, timeout);

    // Try network first
    fetch(request)
      .then(response => {
        clearTimeout(timeoutId);

        // Cache the response for future use
        if (response.status === 200) {
          const clonedResponse = response.clone();
          caches.open(DYNAMIC_CACHE)
            .then(cache => cache.put(request, clonedResponse));
        }

        resolve(response);
      })
      .catch(() => {
        clearTimeout(timeoutId);

        caches.match(request)
          .then(cachedResponse => {
            resolve(cachedResponse || new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            }));
          });
      });
  });
}

// Message event handler for cache updates and control messages
self.addEventListener('message', event => {
  console.log('[Service Worker] Received message:', event.data);

  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  } else if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('[Service Worker] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      })
    );
  }
});
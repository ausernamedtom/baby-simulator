const CACHE_NAME = 'baby-simulator-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/game.js',
  '/style.css',
  '/images/landscape.png',
  '/images/portrait.png',
  '/manifest.json',
  '/windows11/Square44x44Logo.scale-100.png',
  '/windows11/Square44x44Logo.scale-125.png',
  '/windows11/Square44x44Logo.scale-150.png',
  '/windows11/Square44x44Logo.scale-200.png',
  '/windows11/Square44x44Logo.scale-400.png',
  '/windows11/Square150x150Logo.scale-100.png',
  '/windows11/Square150x150Logo.scale-125.png',
  '/windows11/Square150x150Logo.scale-150.png',
  '/windows11/Square150x150Logo.scale-200.png',
  '/windows11/Square150x150Logo.scale-400.png',
  '/windows11/LargeTile.scale-100.png',
  '/windows11/LargeTile.scale-125.png',
  '/windows11/LargeTile.scale-150.png',
  '/windows11/LargeTile.scale-200.png',
  '/windows11/LargeTile.scale-400.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return Promise.all(
          ASSETS_TO_CACHE.map((url) => {
            return fetch(url)
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
                }
                return cache.put(url, response);
              })
              .catch((error) => {
                console.error(`Failed to cache ${url}:`, error);
                // Continue with other assets even if one fails
                return Promise.resolve();
              });
          })
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event - serve from cache, fall back to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request)
          .then((response) => {
            // Cache new resources
            if (response.ok && event.request.method === 'GET') {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                })
                .catch((error) => {
                  console.error('Failed to cache response:', error);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('Fetch failed:', error);
            // Return a fallback response if needed
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
}); 
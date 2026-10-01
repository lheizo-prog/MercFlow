const CACHE_NAME = 'mercflow-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  const isApiCall = url.pathname.includes('/api/') || url.pathname.includes('/ws/');
  const isCrossOrigin = url.origin !== self.location.origin;

  if (isApiCall || isCrossOrigin) {
    return; // Deixa o navegador fazer fetch (Network Only)
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrar
      if (response) return response;

      // Se não, tenta a rede
      return fetch(event.request).then((networkResponse) => {
        // Se for um asset ou HTML válido, fazemos cache
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        // Em caso de erro de rede, se for navegação, retorna o index.html
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});

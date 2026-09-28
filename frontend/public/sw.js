const CACHE_NAME = 'mercflow-v1';
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
  // Se for requisição da API, sempre ir ao network (sem cache)
  // Isso garante que dados sensíveis (usuários, lojas, produtos) não
  // sejam servidos do cache com dados desatualizados ou de outra loja/usuário
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request).then((networkResponse) => {
        // Não armazenar respostas da API no cache
        return networkResponse;
      }).catch(() => {
        // Em caso de erro de rede, tentar cache (último recurso)
        return caches.match(event.request).then((cached) => cached || fetch(event.request));
      })
    );
    return;
  }

  // Para assets estáticos: cache-first
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;

      return fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => caches.match('/index.html'));
    })
  );
});

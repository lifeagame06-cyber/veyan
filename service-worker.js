
const CACHE = 'vayen-shell-v3';

const FILES = [
  './index.html',
  './style.css',
  './images/icon-192.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(FILES))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key =>
            key.startsWith('vayen-shell-') &&
            key !== CACHE
          )
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('./index.html')
      )
    );
    return;
  }

  if (request.destination === 'style') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
  }
});

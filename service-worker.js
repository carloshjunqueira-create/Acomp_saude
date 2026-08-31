const CACHE = 'painel-saude-v3-20260831b';
const APP = './';
const ASSETS = [
  './',
  './index.html',
  './painel-saude.html',
  './painel-saude.webmanifest',
  './icone-180.png',
  './icone-192.png',
  './icone-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(ASSETS.map(async asset => {
      const response = await fetch(asset, {cache: 'reload'});
      if (response.ok) await cache.put(asset, response);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const fresh = await fetch(request);
        if (fresh.ok) {
          const cache = await caches.open(CACHE);
          await cache.put('./', fresh.clone());
        }
        return fresh;
      } catch (_) {
        return (await caches.match(request)) || (await caches.match('./')) || (await caches.match('./index.html'));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE);
      await cache.put(request, fresh.clone());
    }
    return fresh;
  })());
});

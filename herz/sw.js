// Offline-Unterstützung: erst Netzwerk, bei Fehler aus dem Cache.
const CACHE = 'herzensziel-v5';
const SHELL = ['./', 'index.html', 'style.css', 'app.js', 'fx.js', 'holo.js', 'food.js', 'motivation.js', 'stats.js', 'manifest.webmanifest', 'icons/icon.svg', 'icons/icon-192.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  // Eigene Dateien immer beim Server nachfragen (neue Briefe/Updates sofort), sonst normal laden
  const sameOrigin = new URL(e.request.url).origin === location.origin;
  e.respondWith(
    (sameOrigin ? fetch(e.request, { cache: 'no-cache' }) : fetch(e.request))
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});

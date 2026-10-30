// Offline-first service worker. Bump CACHE_NAME when the asset list changes.
const CACHE_NAME = 'ali-cv-v8';
const CORE_ASSETS = [
  './', './index.html', './styles.css', './noscript.css', './theme-init.js', './script.js', './manifest.json',
  './projects.json', './languages.json',
  './assets/fa/css/all.min.css', './assets/fa/webfonts/fa-solid-900.woff2', './assets/fa/webfonts/fa-brands-400.woff2', './assets/fa/webfonts/fa-regular-400.woff2',
  './favicon.svg', './icon-192.png', './icon-512.png', './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  // allSettled: one missing optional asset must not abort the whole install.
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.allSettled(CORE_ASSETS.map((u) => cache.add(u))))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // fonts/CDN handled by the browser

  // Network-first for everything same-origin: updates show immediately, cache is the offline fallback.
  event.respondWith(
    fetch(request)
      .then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(request, copy)); }
        return res;
      })
      .catch(() => caches.match(request).then((hit) => hit || caches.match('./index.html')))
  );
});

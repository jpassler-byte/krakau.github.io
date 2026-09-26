const CACHE_NAME = 'tagebuch-cache-v1';

// Diese Dateien werden beim ersten Öffnen auf dem Handy gespeichert
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.json',
  './icon.png'
];

// Installation: Dateien in den Cache laden
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Dateien offline verfügbar gemacht.');
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Aktivierung: Alte Caches aufräumen
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch: Wenn das Handy offline ist, lade Daten aus dem Cache!
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Entweder die gespeicherte Offline-Version laden oder übers Netz
        return response || fetch(event.request);
      })
  );
});
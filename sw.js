const CACHE_NAME = 'linguamis-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.png',
  './icon-192x192.png',
  './icon-512x512.png',
  './photo.jpg' // Profil fotoğrafınız
];

// Kurulum Aşaması (Install)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
  );
  self.skipWaiting();
});

// Etkinleştirme Aşaması (Activate)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache); // Eski önbellekleri temizle
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Getirme Aşaması (Fetch)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Önbellekte varsa onu döndür, yoksa ağdan çek
        return response || fetch(event.request);
      })
  );
});

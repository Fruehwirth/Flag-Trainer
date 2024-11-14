const CACHE_NAME = 'flag-trainer-v1';
const BASE_PATH = location.hostname === 'localhost' ? '' : '/flag-trainer';

const urlsToCache = [
  `${BASE_PATH}/assets/translations/en.json`,
  `${BASE_PATH}/assets/translations/de.json`,
  `${BASE_PATH}/assets/translations/ui/en.json`,
  `${BASE_PATH}/assets/translations/ui/de.json`
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.match(/\.(html|js|tsx)$/)) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});

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
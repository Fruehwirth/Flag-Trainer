const VERSION = '1.1.0';
const CACHE_NAME = `flag-trainer-v${VERSION}`;
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
    Promise.all([
      // Clear old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Force all clients to reload
      self.clients.claim(),
      self.clients.matchAll().then(clients => {
        clients.forEach(client => client.navigate(client.url));
      })
    ])
  );
}); 
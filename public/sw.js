const VERSION = '1.1.1';
const CACHE_NAME = `flag-trainer-v${VERSION}`;
const BASE_PATH = '/';

// Add theme colors
const THEME_COLORS = {
  light: '#ffffff',
  dark: '#1e1e1e'
};

// Listen for theme change messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'THEME_CHANGE') {
    const color = event.data.isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    // Update theme-color meta tag in all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'UPDATE_THEME_COLOR',
          color: color
        });
      });
    });
  }
});

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
      // Claim clients but don't force reload
      self.clients.claim()
    ])
  );
}); 
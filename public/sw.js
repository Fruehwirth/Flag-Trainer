const VERSION = '1.1.2';
const CACHE_NAME = `flag-trainer-v${VERSION}`;
const BASE_PATH = '/';

// Add theme colors
const THEME_COLORS = {
  light: '#ffffff',
  dark: '#1e1e1e'
};

// Define regions for flag data
const REGIONS = ['africa', 'asia', 'europe', 'north_america', 'south_america', 'oceania'];

// URLs to cache during installation
const urlsToCache = [
  `${BASE_PATH}`,
  `${BASE_PATH}/index.html`,
  `${BASE_PATH}/assets/translations/en.json`,
  `${BASE_PATH}/assets/translations/de.json`,
  `${BASE_PATH}/assets/translations/es.json`,
  `${BASE_PATH}/assets/translations/ru.json`,
  `${BASE_PATH}/assets/translations/ui/en.json`,
  `${BASE_PATH}/assets/translations/ui/de.json`,
  `${BASE_PATH}/assets/translations/ui/es.json`,
  `${BASE_PATH}/assets/translations/ui/ru.json`,
  ...REGIONS.map(region => `${BASE_PATH}/data/playsets/${region}.json`)
];

// Cache all flag images during installation
async function cacheFlags() {
  const cache = await caches.open(CACHE_NAME);
  const flagUrls = [];
  
  // Fetch and cache flag data from each region
  for (const region of REGIONS) {
    const response = await fetch(`${BASE_PATH}/data/playsets/${region}.json`);
    const flags = await response.json();
    flags.forEach(flag => flagUrls.push(flag.url));
  }
  
  // Cache all flag images
  return Promise.all(flagUrls.map(url => cache.add(url)));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME)
        .then((cache) => cache.addAll(urlsToCache)),
      cacheFlags()
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(response => {
          // Cache new requests that weren't in our initial cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return response;
        });
      })
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
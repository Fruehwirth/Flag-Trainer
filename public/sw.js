const VERSION = '1.2.7';
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
  `${BASE_PATH}index.html`,
  `${BASE_PATH}assets/translations/en.json`,
  `${BASE_PATH}assets/translations/de.json`,
  `${BASE_PATH}assets/translations/es.json`,
  `${BASE_PATH}assets/translations/ru.json`,
  `${BASE_PATH}assets/translations/ui/en.json`,
  `${BASE_PATH}assets/translations/ui/de.json`,
  `${BASE_PATH}assets/translations/ui/es.json`,
  `${BASE_PATH}assets/translations/ui/ru.json`,
  ...REGIONS.map(region => `${BASE_PATH}data/playsets/${region}.json`)
];

// Cache all flag images during installation
async function cacheFlags() {
  const cache = await caches.open(CACHE_NAME);
  const flagUrls = [];
  
  // Fetch and cache flag data from each region
  for (const region of REGIONS) {
    try {
      const response = await fetch(`${BASE_PATH}data/playsets/${region}.json`);
      if (!response.ok) continue;
      const flags = await response.json();
      flags.forEach(flag => flagUrls.push(flag.url));
    } catch (error) {
      console.warn(`Failed to cache flags for ${region}:`, error);
    }
  }
  
  // Cache all flag images
  return Promise.allSettled(
    flagUrls.map(url => 
      fetch(url)
        .then(response => cache.put(url, response))
        .catch(err => console.warn(`Failed to cache flag: ${url}`, err))
    )
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.allSettled([
      caches.open(CACHE_NAME)
        .then((cache) => 
          Promise.allSettled(
            urlsToCache.map(url => 
              cache.add(url).catch(err => 
                console.warn(`Failed to cache: ${url}`, err)
              )
            )
          )
        ),
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
      // Force claim all clients
      self.clients.claim().then(() => {
        // Notify all clients about the update
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'APP_UPDATED',
              version: VERSION,
              forceReload: true
            });
          });
        });
      })
    ])
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CHECK_VERSION') {
    event.ports[0].postMessage({
      type: 'VERSION_INFO',
      version: VERSION
    });
  }
}); 
const CACHE_NAME = 'prayer-times-v8';
const OFFLINE_URL = './offline.html';

// Само критични ресурси за начало
const urlsToCache = [
  './',                    
  './index.php',
  './offline.html',        
  './css/style.css',
  './js/main.js',
  './js/multilingual.js',
  './manifest.json',
  './assets/all_prayer_times_2026.json',
  './assets/bg_cities_coordinates.json',
  './assets/icon-72x72.png',
  './assets/icon-96x96.png',
  './assets/icon-128x128.png',
  './assets/icon-144x144.png',
  './assets/icon-152x152.png',
  './assets/icon-192x192.png',
  './assets/icon-512x512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache opened:', CACHE_NAME);
        
        const cachePromises = urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.warn(`Failed to cache ${url}:`, error);
            return Promise.resolve();
          });
        });
        
        return Promise.all(cachePromises)
          .then(() => {
            console.log('All critical resources cached');
            return self.skipWaiting();
          });
      })
      .catch(error => {
        console.error('Cache opening failed:', error);
      })
  );
});

// Fetch event - СТРАТЕГИЯ ЗА ОФЛАЙН
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  // Стратегия: Network first, fallback to cache, then offline.html
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Успешна мрежова заявка - кешираме и връщаме
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
        }
        return response;
      })
      .catch(() => {
        // Мрежата не е достъпна - опитваме кеш
        return caches.match(event.request)
          .then(cachedResponse => {
            if (cachedResponse) {
              console.log('Serving from cache:', event.request.url);
              return cachedResponse;
            }
            
            // Ако е HTML заявка и няма в кеша - връщаме offline.html
            if (event.request.headers.get('accept')?.includes('text/html')) {
              console.log('Serving offline page for:', event.request.url);
              return caches.match(OFFLINE_URL);
            }
            
            // За други ресурси - връщаме грешка
            return new Response('Offline - ресурсът не е наличен', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Activate event
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activated');
      return self.clients.claim();
    })
  );
});
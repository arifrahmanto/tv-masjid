// Service Worker for TV Masjid PWA
// Handles caching, offline support, and request interception

const CACHE_VERSION = 'v1';
const CACHE_STATIC = `${CACHE_VERSION}-assets`;
const CACHE_DYNAMIC = `${CACHE_VERSION}-pages`;
const CACHE_API = `${CACHE_VERSION}-api`;

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/manifest.json',
  '/offline.html',
  '/pages/grafik.html',
  '/pages/khotib.html',
  '/pages/pengumuman.html',
  '/pages/kegiatan.html'
];

// ============================================================================
// Install Event - Pre-cache critical assets
// ============================================================================
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_STATIC).then(cache => {
      console.log('Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      self.skipWaiting();
    }).catch(error => {
      console.error('Install error:', error);
    })
  );
});

// ============================================================================
// Activate Event - Cleanup old cache versions
// ============================================================================
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete caches that don't match current version
          if (!cacheName.startsWith(CACHE_VERSION)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Monitor and cleanup storage quota
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        navigator.storage.estimate().then(estimate => {
          const { usage, quota } = estimate;
          const usagePercent = (usage / quota) * 100;
          console.log(`Cache usage: ${usagePercent.toFixed(2)}% (${Math.round(usage / 1024 / 1024)}MB / ${Math.round(quota / 1024 / 1024)}MB)`);
          
          // If usage exceeds 80%, trigger cleanup
          if (usagePercent > 80) {
            cleanupOldCaches();
          }
        });
      }
      return self.clients.claim();
    }).catch(error => {
      console.error('Activate error:', error);
    })
  );
});

/**
 * Clean up old cache entries when storage quota is high
 */
async function cleanupOldCaches() {
  const now = Date.now();
  const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
  const QUOTA_THRESHOLD = 40 * 1024 * 1024; // 40MB
  
  try {
    const cacheNames = await caches.keys();
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      
      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          const dateHeader = response.headers.get('date');
          if (dateHeader) {
            const cacheTime = new Date(dateHeader).getTime();
            if (now - cacheTime > MAX_CACHE_AGE) {
              console.log('Deleting old cache entry:', request.url);
              cache.delete(request);
            }
          }
        }
      }
    }
    
    // Check if we're still over quota
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage > QUOTA_THRESHOLD) {
        // Delete least recently used entries
        for (const cacheName of cacheNames) {
          if (cacheName !== CACHE_STATIC && cacheName !== CACHE_DYNAMIC && cacheName !== CACHE_API) {
            console.log('Purging cache due to quota:', cacheName);
            await caches.delete(cacheName);
          }
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup error:', error);
  }
}

// ============================================================================
// Fetch Event - Intercept requests and apply caching strategies
// ============================================================================
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Route-specific strategies
  if (request.method === 'GET') {
    // API calls: network-first
    if (url.pathname.includes('/api/') || url.hostname.includes('github')) {
      event.respondWith(networkFirstStrategy(request));
    }
    // Static assets: cache-first
    else if (isStaticAsset(url.pathname)) {
      event.respondWith(cacheFirstStrategy(request));
    }
    // HTML pages: stale-while-revalidate
    else if (request.headers.get('accept')?.includes('text/html')) {
      event.respondWith(staleWhileRevalidateStrategy(request));
    }
    // Default: network-first
    else {
      event.respondWith(networkFirstStrategy(request));
    }
  }
});

// ============================================================================
// Caching Strategies
// ============================================================================

/**
 * Network-first: Try network, fallback to cache
 * Used for: API calls, dynamic content
 */
function networkFirstStrategy(request) {
  return fetch(request)
    .then(response => {
      // Cache successful responses
      if (response && response.status === 200) {
        const cloned = response.clone();
        caches.open(CACHE_API).then(cache => {
          cache.put(request, cloned);
        });
      }
      return response;
    })
    .catch(() => {
      // Network failed, try cache
      return caches.match(request).then(cached => {
        return cached || createOfflineResponse();
      });
    });
}

/**
 * Cache-first: Try cache, fallback to network
 * Used for: Static assets, images, fonts
 */
function cacheFirstStrategy(request) {
  return caches.match(request)
    .then(cached => {
      if (cached) {
        return cached;
      }
      
      return fetch(request).then(response => {
        if (response && response.status === 200) {
          const cloned = response.clone();
          caches.open(CACHE_STATIC).then(cache => {
            cache.put(request, cloned);
          });
        }
        return response;
      });
    })
    .catch(error => {
      console.error('Cache-first error:', error);
      return createOfflineResponse();
    });
}

/**
 * Stale-while-revalidate: Serve cache immediately, update in background
 * Used for: HTML pages
 */
function staleWhileRevalidateStrategy(request) {
  return caches.match(request).then(cached => {
    const fetchPromise = fetch(request).then(response => {
      if (response && response.status === 200) {
        const cloned = response.clone();
        caches.open(CACHE_DYNAMIC).then(cache => {
          cache.put(request, cloned);
        });
      }
      return response;
    }).catch(() => cached || createOfflineResponse());

    return cached || fetchPromise;
  });
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determine if a URL path is a static asset
 */
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => pathname.includes(ext));
}

/**
 * Create offline response
 */
function createOfflineResponse() {
  return caches.match('/offline.html')
    .then(response => response || new Response('Offline - please try again when connected', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    }));
}

// ============================================================================
// Message Handler - Communication with clients
// ============================================================================
self.addEventListener('message', event => {
  const { type, payload } = event.data;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (type === 'CLEAR_CACHE') {
    caches.keys().then(cacheNames => {
      Promise.all(cacheNames.map(cacheName => caches.delete(cacheName)));
    });
  }

  if (type === 'CACHE_VERSION_CHECK') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

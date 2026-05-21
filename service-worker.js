const CACHE_NAME = 'bizsupport-v2';
const ASSETS_TO_CACHE = [
    './styles/main.css',
    './scripts/app.js',
    './scripts/data.js',
    './manifest.json'
];

// Install: Cache static core assets (excluding HTML to avoid stale pages)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// Activate: Delete all outdated caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting outdated cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch: Network-First for HTML/navigation requests, Cache-First for static assets
self.addEventListener('fetch', (event) => {
    const isNavigation = event.request.mode === 'navigate' || 
                         event.request.url.endsWith('.html') || 
                         event.request.url.endsWith('/');

    if (isNavigation) {
        // Always try network first for documents
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
    } else {
        // Cache first for assets like css, js, json
        event.respondWith(
            caches.match(event.request)
                .then((response) => response || fetch(event.request))
        );
    }
});

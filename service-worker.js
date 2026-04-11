const CACHE = 'td-tools-v1';
const STATIC = [
  '/',
  '/index.html',
  '/manifest.json',
  '/og-image.png',
  '/sample-equipment.csv',
  '/icons/icon-192.svg',
  '/icons/icon-512.svg',
];

// Install: pre-cache static assets
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(STATIC)).then(() => self.skipWaiting())
  );
});

// Activate: purge old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first for static, network-first for API & config
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always network for API calls and config — never serve stale
  if (
    url.pathname.includes('/demo/') ||
    url.pathname.includes('/api/') ||
    url.pathname === '/api-config.json'
  ) {
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ error: 'Offline' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        })
      )
    );
    return;
  }

  // Cache-first for everything else (HTML, fonts, images, icons)
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (resp.ok && e.request.method === 'GET') {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return resp;
      });
    })
  );
});

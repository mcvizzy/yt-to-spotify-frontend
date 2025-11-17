self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  clients.claim();
});

// Simply pass-through all fetches (no caching errors)
self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

const CACHE_VERSION = "daymark-v1";
const PRECACHE_NAME = `${CACHE_VERSION}-precache`;
const RUNTIME_NAME = `${CACHE_VERSION}-runtime`;
const APP_SCOPE = new URL("./", self.registration.scope);
const appUrl = (path) => new URL(path, APP_SCOPE).toString();
const PRECACHE_URLS = [
  "",
  "index.html",
  "manifest.webmanifest",
  "favicon.svg",
  "pwa-192.png",
  "pwa-512.png",
].map(appUrl);

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName.startsWith("daymark-") &&
                ![PRECACHE_NAME, RUNTIME_NAME].includes(cacheName),
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            void caches
              .open(PRECACHE_NAME)
              .then((cache) => cache.put("/index.html", responseCopy));
          }
          return response;
        })
        .catch(() => caches.match(appUrl("index.html"))),
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          void caches
            .open(RUNTIME_NAME)
            .then((cache) => cache.put(event.request, responseCopy));
        }
        return response;
      });
    }),
  );
});

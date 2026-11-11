const CACHE_NAME = "toolkit-pwa-v5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./clampCalculator/index.html",
  "./fluidFontGenerator/index.html",
  "./manifest.webmanifest",
  "./assets/favicon.ico",
  "./assets/css/style.css",
  "./assets/js/pwa.js",
  "./assets/pwa-icons/toolkit-192.png",
  "./assets/pwa-icons/toolkit-512.png",
  "./assets/pwa-icons/toolkit-apple-touch.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
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
                cacheName.startsWith("toolkit-pwa-") &&
                cacheName !== CACHE_NAME,
            )
            .map((cacheName) => caches.delete(cacheName)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const requestUrl = new URL(request.url);

  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseCopy = response.clone();
            event.waitUntil(
              caches
                .open(CACHE_NAME)
                .then((cache) => cache.put(request, responseCopy)),
            );
          }
          return response;
        })
        .catch(async () => {
          const cachedPage = await caches.match(request);
          if (cachedPage) {
            return cachedPage;
          }

          return (
            (await caches.match("./index.html")) ??
            new Response("This page is unavailable while offline.", {
              status: 503,
              statusText: "Offline",
            })
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((response) => {
        if (response.ok) {
          const responseCopy = response.clone();
          event.waitUntil(
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, responseCopy)),
          );
        }
        return response;
      });
    }),
  );
});

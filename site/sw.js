// Makes the demo work offline after its first load. Network first, cache as the fallback, so a
// new deploy shows up on the next online visit. Same-origin GETs only: the demo makes no other
// requests. Paths are relative to this file, so the site works under /receipts/ or at a root.
const CACHE = "receipts-demo";
const FILES = ["./", "index.html", "demo.js", "examples.js", "matcher.js", "favicon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then((cache) => cache.put(request, copy)));
        }
        return response;
      })
      .catch(() => caches.match(request, { ignoreSearch: true }).then((hit) => hit ?? Response.error())),
  );
});

// Offline support for Takt: the app shell is cached, pages try the network first so updates arrive.
const CACHE = "takt-v1";
const SHELL = ["./", "index.html", "app.js", "data.js", "manifest.webmanifest",
  "icons/apple-touch-icon.png", "icons/icon-192.png", "icons/icon-512.png", "icons/favicon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith("takt-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  // Network first, cache as fallback: updates arrive, and the gym without signal still works.
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req.mode === "navigate" ? "index.html" : req, copy)); }
    return r;
  }).catch(() => caches.match(req.mode === "navigate" ? "index.html" : req, { cacheName: CACHE })
    .then(hit => hit || caches.match(req, { cacheName: CACHE, ignoreSearch: true }))));
});

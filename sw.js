// Jamroom service worker: makes the app installable and playable offline.
// - App code (html/css/js): network first, so updates show up right away; cached copy when offline.
// - Sounds and icons: cache first, since they never change under the same name.
// Bump VERSION when you change the sound files so old copies are dropped.
const VERSION = "v1";
const SHELL = `jamroom-shell-${VERSION}`;
const MEDIA = `jamroom-media-${VERSION}`;
const SHELL_FILES = [
  "./", "./index.html", "./styles.css", "./manifest.webmanifest",
  "./src/main.js", "./src/music.js", "./src/audio-engine.js", "./src/rhythm-arranger.js", "./src/keys.js",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => ![SHELL, MEDIA].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  const isMedia = /\/assets\/audio\//.test(url.pathname) || /\/icons\//.test(url.pathname);

  if (isMedia) {
    event.respondWith(caches.open(MEDIA).then(async (cache) => {
      const hit = await cache.match(request);
      if (hit) return hit;
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    }));
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(SHELL);
    try {
      const response = await fetch(request);
      if (response.ok) cache.put(request, response.clone());
      return response;
    } catch {
      return (await cache.match(request)) || (await cache.match("./index.html")) || Response.error();
    }
  })());
});

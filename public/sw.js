/* Service worker de Méridien : fonctionnement hors ligne.
   Stratégie « réseau d'abord, cache en secours » : en ligne, le joueur a toujours la dernière version ;
   sans réseau, la dernière version vue s'ouvre quand même. Aucune donnée du joueur n'y transite
   (la sauvegarde reste dans localStorage). Pour forcer un vidage du cache, changer CACHE. */
const CACHE = "meridien-v1";
const BASE = self.registration.scope;
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new URL(u, BASE).href))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || !req.url.startsWith(BASE)) return; // uniquement les fichiers de l'application
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || (req.mode === "navigate" ? caches.match(new URL("index.html", BASE).href) : Response.error())))
  );
});

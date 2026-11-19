/* Service worker de Méridien : fonctionnement hors ligne.
   Stratégie « réseau d'abord, cache en secours » : en ligne, le joueur a toujours la dernière version ;
   sans réseau, la dernière version vue s'ouvre quand même. Aucune donnée du joueur n'y transite
   (la sauvegarde reste dans localStorage). Pour forcer un vidage du cache, changer CACHE. */
const CACHE = "meridien-v7";
const BASE = self.registration.scope;
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "logo.svg", "icons/favicon-64.png", "icons/icon-192.png", "icons/icon-512.png", "icons/apple-touch-icon.png", "fonts/nunito-latin.woff2", "fonts/nunito-latin-ext.woff2", "fonts/unbounded-latin.woff2"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(async c => {
    await c.addAll(PRECACHE.map(u => new URL(u, BASE).href));
    // drapeaux : mis en cache au mieux (un échec ne bloque pas l'installation)
    try { const list = await (await fetch(new URL("flags/list.json", BASE).href)).json(); await Promise.allSettled(list.map(f => c.add(new URL("flags/" + f, BASE).href))); } catch (err) {}
  }).then(() => self.skipWaiting()));
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

/* Notifications push (v36) : « Nouveau jeu du jour » à 14 h 30 et messages du groupe. Chaque envoi affiche une notification
   (obligatoire sur iPhone) ; un toucher ouvre ou ramène l'application au premier plan. */
// un GIF ou un autocollant s'affiche en clair (même si le serveur envoie encore le code brut « ::g:… » / « ::s:… »)
function cleanBody(b) {
  return String(b).replace(/^(.*?) : ::g:[A-Za-z0-9]+\s*$/, "$1 a envoyé un GIF").replace(/^(.*?) : ::s:[a-z0-9]+\s*$/, "$1 a envoyé un autocollant").replace(/::g:[A-Za-z0-9]+/g, "un GIF").replace(/::s:[a-z0-9]+/g, "un autocollant");
}
self.addEventListener("push", e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (err) {}
  e.waitUntil(self.registration.showNotification(d.title || "Méridien", {
    body: cleanBody(d.body || ""), tag: d.tag || undefined, renotify: false,
    icon: new URL("icons/icon-192.png", BASE).href, badge: new URL("icons/favicon-64.png", BASE).href,
    data: { url: d.url || "./" }
  }));
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  const d = e.notification.data || {}, tag = e.notification.tag || "";
  let gid = "", msg = "";
  try { const u = new URL(d.url || "./", BASE); gid = u.searchParams.get("chat") || ""; msg = u.searchParams.get("msg") || ""; } catch (err) {}
  if (!gid && tag.indexOf("msg-") === 0) gid = tag.slice(4); // message d'un groupe : on retrouve le groupe grâce à la pastille de la notification
  const url = new URL("./", BASE); if (gid) url.searchParams.set("chat", gid); if (msg) url.searchParams.set("msg", msg);
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(wins => {
    const w = wins.find(x => x.url.indexOf(BASE) === 0) || wins[0];
    if (w) { if (gid) w.postMessage({ type: "openchat", gid, msg }); return w.focus(); }
    return self.clients.openWindow(url.href);
  }));
});
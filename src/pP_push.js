/* ============ NOTIFICATIONS PUSH (v36) ============
   Le téléphone s'abonne (service worker + clé publique VAPID donnée par le serveur) puis enregistre son abonnement avec
   save_push_sub. Le serveur (fonction Edge « push ») envoie « Nouveau jeu du jour » à 14 h 30 et les messages du groupe.
   Sur iPhone, les notifications ne marchent que si l'application est installée sur l'écran d'accueil (iOS 16.4 ou plus).
   Uniquement des fonctions déclarées et un objet d'état : fichier chargé avant pB_logic. */
const PUSH = { on: false, msgs: true, daily: true, busy: false, msg: "", checked: false };
const pushSupported = () => !!(("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window) && /^https?:$/.test(location.protocol));
const pushNeedsInstall = () => isIOS() && !isStandalone();
function pushB64(s) { const pad = "=".repeat((4 - (s.length % 4)) % 4), r = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); }

async function pushKey() { // clé publique : lue dans la base, sinon demandée à la fonction Edge (qui la crée au premier appel)
  const k = await srvRpc("push_public_key"); if (typeof k === "string" && k) return k;
  try {
    const c = new AbortController(), t = setTimeout(() => c.abort(), 12000);
    const r = await fetch(SRV_URL + "/functions/v1/push", { signal: c.signal }); clearTimeout(t);
    const j = r.ok ? await r.json() : null; return j && j.publicKey ? j.publicKey : "";
  } catch (e) { return ""; }
}
async function pushSave(sub) {
  const j = sub.toJSON(); if (!j || !j.keys) return false;
  const r = await srvRpc("save_push_sub", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_msgs: PUSH.msgs, p_daily: PUSH.daily });
  return !!(r && r.ok);
}
async function pushStatus() { // état de CET appareil : abonné ou non, et ses choix
  if (!srvOn() || !pushSupported()) { PUSH.checked = true; return; }
  try {
    const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
    PUSH.on = !!sub && Notification.permission === "granted";
    if (PUSH.on) { const r = await srvRpc("my_push_sub", { p_endpoint: sub.endpoint }); if (r && typeof r.msgs === "boolean") { PUSH.msgs = r.msgs; PUSH.daily = r.daily; } else await pushSave(sub); } // abonnement inconnu du serveur : on le réenregistre
  } catch (e) {}
  PUSH.checked = true;
}
async function pushEnable() {
  PUSH.busy = true; PUSH.msg = ""; if (!game) render();
  try {
    if (Notification.permission === "denied") PUSH.msg = "Les notifications sont bloquées pour Méridien : autorise-les dans les réglages de ton téléphone ou de ton navigateur.";
    else if ((await Notification.requestPermission()) !== "granted") PUSH.msg = "Autorisation refusée : tu peux la redonner dans les réglages de ton téléphone.";
    else {
      const key = await pushKey();
      if (!key) PUSH.msg = "Les notifications ne sont pas encore prêtes sur le serveur. Réessaie un peu plus tard.";
      else {
        const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription();
        if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: pushB64(key) });
        PUSH.on = await pushSave(sub); if (!PUSH.on) PUSH.msg = "Impossible d'enregistrer l'abonnement. Réessaie.";
      }
    }
  } catch (e) { PUSH.msg = "Ton navigateur n'a pas pu activer les notifications."; }
  PUSH.busy = false; PUSH.checked = true; if (!game) render();
}
async function pushDisable() {
  PUSH.busy = true; if (!game) render();
  try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) { await srvRpc("drop_push_sub", { p_endpoint: sub.endpoint }); await sub.unsubscribe(); } } catch (e) {}
  PUSH.on = false; PUSH.busy = false; if (!game) render();
}
async function pushPref(k, v) {
  PUSH[k] = v; if (!game) render();
  try { const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription(); if (sub) await pushSave(sub); } catch (e) {}
}

/* ---------- Réglages : bloc « Notifications » ---------- */
function pushBlock() {
  if (!srvOn()) return "";
  const head = `<div class="kicker" style="margin-bottom:6px">Notifications</div>`;
  if (!pushSupported() || pushNeedsInstall()) return `<div>${head}<p class="note">${pushNeedsInstall() ? "Sur iPhone, ajoute d'abord Méridien à ton écran d'accueil, puis ouvre l'application depuis son icône pour activer les notifications." : "Ce navigateur ne gère pas les notifications."}</p>${pushNeedsInstall() ? `<button class="btn ghost" data-act="installpage">📲 Ajouter à l'écran d'accueil</button>` : ""}</div>`;
  const seg = (k, label) => `<div class="kicker" style="margin:8px 0 6px">${label}</div><div class="seg light" role="group" aria-label="${label}">${[[true, "Oui"], [false, "Non"]].map(([v, l]) => `<button data-act="pushpref" data-v="${k}|${v}" aria-pressed="${PUSH[k] === v}">${l}</button>`).join("")}</div>`;
  const msg = PUSH.msg ? `<p class="note" role="status">${esc(PUSH.msg)}</p>` : "";
  if (!PUSH.on) return `<div>${head}<button class="btn ghost" data-act="pushon" ${PUSH.busy ? "disabled" : ""}>🔔 ${PUSH.busy ? "Activation…" : "Activer les notifications"}</button><p class="note">Une notification à 14 h 30 quand le nouveau jeu arrive, et quand un ami écrit dans ton groupe.</p>${msg}</div>`;
  return `<div>${head}<p class="note">✅ Notifications activées sur cet appareil.</p>${seg("daily", "Nouveau jeu à 14 h 30")}${seg("msgs", "Messages du groupe")}<button class="linkbtn" data-act="pushoff">Désactiver sur cet appareil</button>${msg}</div>`;
}
/* ---------- carte discrète sur l'accueil, après la première vraie partie ; « Plus tard » la masque 7 jours ---------- */
function pushNotice() {
  if (!store.profile || !store.profile.pet || !srvOn() || !tutoState().done || !PUSH.checked || PUSH.on) return "";
  if (!pushSupported() || pushNeedsInstall() || Notification.permission === "denied" || progress().plays < 1) return "";
  const until = store.profile.pushLater || ""; if (until && today() < until) return "";
  return `<div class="tnotice" role="note"><span class="kicker">Notifications</span><b>Ne rate plus le nouveau jeu</b><span>Une notification à 14 h 30 quand il arrive, et quand un ami écrit dans ton groupe.</span><span class="btnline"><button class="smallbtn" data-act="pushon">Activer</button><button class="smallbtn ghost" data-act="pushlater">Plus tard</button></span></div>`;
}

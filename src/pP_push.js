/* ============ NOTIFICATIONS PUSH (v36) ============
   Le téléphone s'abonne (service worker + clé publique VAPID donnée par le serveur) puis enregistre son abonnement avec
   save_push_sub. Le serveur (fonction Edge « push ») envoie « Nouveau jeu du jour » à 14 h 30 et les messages du groupe.
   Sur iPhone, les notifications ne marchent que si l'application est installée sur l'écran d'accueil (iOS 16.4 ou plus).
   Uniquement des fonctions déclarées et un objet d'état : fichier chargé avant pB_logic. */
const PUSH = { on: false, msgs: true, daily: true, plays: true, rivals: true, busy: false, msg: "", checked: false };
const pushSupported = () => !!(("serviceWorker" in navigator) && ("PushManager" in window) && ("Notification" in window) && /^https?:$/.test(location.protocol));
const pushNeedsInstall = () => isIOS() && !isStandalone();
function pushB64(s) { const pad = "=".repeat((4 - (s.length % 4)) % 4), r = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from([...r].map(c => c.charCodeAt(0))); }

async function pushKey() { // clé publique : lue dans la base, sinon demandée à la fonction Edge (qui la crée au premier appel)
  const k = await srvRpc("push_public_key"); if (typeof k === "string" && k) return k;
  try {
    const c = new AbortController(), t = setTimeout(() => c.abort(), 12000);
    const r = await fetch(SRV_URL + "/functions/v1/dynamic-handler", { signal: c.signal }); clearTimeout(t);
    const j = r.ok ? await r.json() : null; return j && j.publicKey ? j.publicKey : "";
  } catch (e) { return ""; }
}
async function pushSave(sub) {
  const j = sub.toJSON(); if (!j || !j.keys) return false;
  const r = await srvRpc("save_push_sub", { p_endpoint: j.endpoint, p_p256dh: j.keys.p256dh, p_auth: j.keys.auth, p_msgs: PUSH.msgs, p_daily: PUSH.daily, p_plays: PUSH.plays, p_rivals: PUSH.rivals });
  return !!(r && r.ok);
}
async function pushStatus() { // état de CET appareil : abonné ou non, et ses choix
  if (!srvOn() || !pushSupported()) { PUSH.checked = true; return; }
  try {
    const reg = await navigator.serviceWorker.ready, sub = await reg.pushManager.getSubscription();
    PUSH.on = !!sub && Notification.permission === "granted";
    if (PUSH.on) { const r = await srvRpc("my_push_sub", { p_endpoint: sub.endpoint }); if (r && typeof r.msgs === "boolean") { PUSH.msgs = r.msgs; PUSH.daily = r.daily; if (typeof r.plays === "boolean") { PUSH.plays = r.plays; PUSH.rivals = r.rivals; } } else await pushSave(sub); } // abonnement inconnu du serveur : on le réenregistre
  } catch (e) {}
  PUSH.checked = true;
}
async function pushEnable() {
  PUSH.busy = true; PUSH.msg = ""; if (!game) render();
  try {
    let perm = Notification.permission;
    if (perm !== "denied") perm = await Notification.requestPermission();
    if (perm === "denied") { PUSH.busy = false; PUSH.checked = true; ui.sheet = "pushhelp"; render(); return; } // bloquées : le navigateur ne redemande plus, on explique comment les rouvrir
    else if (perm !== "granted") PUSH.msg = "Pas de réponse à la demande : touche à nouveau pour réessayer.";
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
  if (PUSH.msg) announce(PUSH.msg);
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
  return `<div>${head}<p class="note">✅ Notifications activées sur cet appareil.</p>${seg("daily", "Nouveau jeu à 14 h 30")}${seg("msgs", "Messages du groupe")}${seg("plays", "Un ami a joué")}${seg("rivals", "Records et dépassements")}<button class="linkbtn" data-act="pushoff">Désactiver sur cet appareil</button>${msg}</div>`;
}
/* ---------- fenêtre « Notifications bloquées » : comment les rouvrir (le navigateur ne redemande pas) ---------- */
function vPushHelp() {
  const ios = typeof isIOS === "function" && isIOS(), android = /Android/i.test(navigator.userAgent);
  const steps = ios ? ["Ouvre les <b>Réglages</b> de l’iPhone", "Va dans <b>Notifications</b>, puis <b>Méridien</b>", "Active <b>Autoriser les notifications</b>"]
    : android ? ["Touche le <b>cadenas</b> ou le menu ⋮ à côté de l’adresse", "Choisis <b>Autorisations</b>, puis <b>Notifications</b>", "Mets <b>Autoriser</b>"]
    : ["Clique sur le <b>cadenas</b> à gauche de l’adresse", "Mets <b>Notifications</b> sur <b>Autoriser</b>", "Recharge la page"];
  return `<div class="scrim" data-act="closesheet"><div class="sheet" role="dialog" aria-label="Notifications bloquées" data-stop>
    <div class="sheethead"><div><h3>Notifications bloquées</h3><div class="muted">Le navigateur ne redemande pas. Il faut les rouvrir à la main.</div></div></div>
    <ol class="isteps">${steps.map((t, i) => `<li><span class="in num">${i + 1}</span><span class="tx"><span>${t}</span></span></li>`).join("")}</ol>
    <p class="note">Ensuite, reviens ici et touche « Activer ».</p>
    <button class="btn ghost" data-act="closesheet">Fermer</button></div></div>`;
}
/* ---------- carte discrète sur l'accueil, après la première vraie partie ; « Plus tard » la masque 7 jours ---------- */
function pushNotice() {
  if (!store.profile || !store.profile.pet || !srvOn() || !tutoState().done || !PUSH.checked || PUSH.on) return "";
  if (!pushSupported() || pushNeedsInstall() || progress().plays < 1) return ""; // bloquées : la carte reste, « Activer » explique comment les rouvrir
  const until = store.profile.pushLater || ""; if (until && today() < until) return "";
  return `<div class="tnotice" role="note"><span class="kicker">Notifications</span><b>Ne rate plus le nouveau jeu</b><span>Une notification à 14 h 30 quand il arrive, et quand un ami écrit dans ton groupe.</span><span class="btnline"><button class="smallbtn" data-act="pushon">Activer</button><button class="smallbtn ghost" data-act="pushlater">Plus tard</button></span></div>`;
}

/* ---------- un toucher sur une notification de message ouvre le groupe, la discussion et le message ---------- */
async function pushOpenChat(gid, mid) {
  if (!srvOn() || srvLost() || game) return;
  ui.sheet = false; ui.reveal = null; ui.view = "group"; ui.tab = "chat"; ui.focusMsg = mid || "";
  if (gid && gid !== SRV.gid && SRV.groups.some(g => g.id === gid)) await srvSwitchGroup(gid); else { render(); await srvSync(true); }
  try { await srvLoadChat(); } catch (e) {}
  render(); pushFocusMsg();
}
function pushFocusMsg() {
  setTimeout(() => {
    let el = null; try { el = ui.focusMsg ? document.querySelector(`.msg[data-mid="${CSS.escape(ui.focusMsg)}"]`) : null; } catch (e) {}
    if (!el) { const all = document.querySelectorAll(".msg:not(.me)"); el = all[all.length - 1] || null; } // message précis introuvable : le dernier d'un ami
    if (el) { el.scrollIntoView({ block: "center" }); el.classList.add("flash"); setTimeout(() => el.classList.remove("flash"), 2800); }
    ui.focusMsg = "";
  }, 300);
}
(function () { // ouverture depuis une notification : application déjà ouverte (message du service worker) ou fermée (adresse ?chat=…&msg=…)
  try { if ("serviceWorker" in navigator) navigator.serviceWorker.addEventListener("message", e => { if (e.data && e.data.type === "openchat") pushOpenChat(e.data.gid, e.data.msg); }); } catch (e) {}
  try { const q = new URLSearchParams(location.search); if (q.get("chat")) { ui.pendingChat = { gid: q.get("chat"), msg: q.get("msg") || "" }; history.replaceState(null, "", location.pathname); } } catch (e) {}
})();
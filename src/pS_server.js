/* =================== SERVEUR (Supabase) : lot 3, étape 2 ===================
   Session anonyme (aucune donnée personnelle), profil et groupes réels, récupération du compte par e-mail (code à 6 chiffres).
   Aucune bibliothèque : appels `fetch` vers CE projet uniquement. L'URL et la clé « publishable » sont PUBLIQUES par conception
   (la sécurité vient des règles de la base, voir supabase/). Ne JAMAIS mettre ici la clé « service_role ».
   Placé après pA_core.js : ne pas toucher à `ui` / `game` au chargement (ils sont définis plus tard) ; seulement dans les fonctions. */

const SRV_URL = "https://objfbehephvvaogmblhj.supabase.co";
const SRV_KEY = "sb_publishable_zhfulu2YnJm2DzMx2Zvp8g_EVmnZbdj";
const AUTH_KEY = "meridien.auth";
const SRV = { sess: null, online: true, group: null, members: null, why: "" };

const SRV_MSG = {
  offline: "Pas de connexion. Réessaie quand tu as du réseau.",
  session: "Ta session en ligne n'est plus valable. Utilise « J'ai déjà un compte » pour la retrouver.",
  server: "Le serveur ne répond pas comme prévu. Réessaie dans un instant.",
  invalid_code: "Ce code ne correspond à aucun groupe. Vérifie-le avec ton ami.",
  group_full: "Ce groupe est complet.",
  too_many_attempts: "Trop de codes essayés. Réessaie dans une heure.",
  bad_name: "Le nom du groupe doit faire entre 2 et 24 caractères.",
  already_in_group: "Tu es déjà dans un groupe.",
  no_profile: "Ton profil n'existe pas encore en ligne.",
  rate: "Trop d'e-mails demandés. Réessaie dans quelques minutes.",
  bad_email: "Cette adresse e-mail n'a pas l'air valide.",
  email_taken: "Cette adresse est déjà utilisée par un autre compte.",
  bad_code: "Ce code est incorrect ou périmé. Vérifie-le ou demande-en un nouveau.",
  no_account: "Aucun compte trouvé avec cette adresse."
};
const srvMsg = k => SRV_MSG[k] || SRV_MSG.server;
const fmtCode = c => /^[A-Z0-9]{6}$/.test(c || "") ? c.slice(0, 3) + "-" + c.slice(3) : (c || "");
const maskEmail = e => { const [u, d] = String(e || "").split("@"); return u && d ? u[0] + "•••@" + d : String(e || ""); };

/* ---------- session (stockée à part du profil : meridien.auth) ---------- */
function srvLoad() { try { const s = JSON.parse(localStorage.getItem(AUTH_KEY)); if (s && s.refresh_token && s.user && s.user.id) SRV.sess = s; } catch (e) {} }
function srvSave(s) { SRV.sess = s; try { if (s) localStorage.setItem(AUTH_KEY, JSON.stringify(s)); else localStorage.removeItem(AUTH_KEY); } catch (e) {} }
const srvSessionFrom = d => ({ access_token: d.access_token, refresh_token: d.refresh_token, expires_at: Math.floor(Date.now() / 1000) + (d.expires_in || 3600), user: d.user });
srvLoad();

async function srvFetch(path, o = {}) {
  const c = new AbortController(), t = setTimeout(() => c.abort(), o.timeout || 12000);
  try {
    const h = { apikey: SRV_KEY, "Content-Type": "application/json" };
    if (o.token) h.Authorization = "Bearer " + o.token;
    if (o.prefer) h.Prefer = o.prefer;
    const r = await fetch(SRV_URL + path, { method: o.method || "GET", headers: h, body: o.body === undefined ? undefined : JSON.stringify(o.body), signal: c.signal });
    const txt = await r.text(); let data = null; try { data = txt ? JSON.parse(txt) : null; } catch (e) { data = txt; }
    SRV.online = true;
    return { ok: r.ok, status: r.status, data };
  } catch (e) { SRV.online = false; return { ok: false, status: 0, data: null, offline: true }; }
  finally { clearTimeout(t); }
}

/* jeton valable : crée la session anonyme au premier besoin, la renouvelle avant expiration */
let srvTokP = null;
function srvToken() { return srvTokP || (srvTokP = srvTokenReal().finally(() => { srvTokP = null; })); }
async function srvTokenReal() {
  SRV.why = "";
  if (!SRV.sess) {
    const r = await srvFetch("/auth/v1/signup", { method: "POST", body: {} });
    if (!r.ok) { SRV.why = r.offline ? "offline" : "server"; return null; }
    srvSave(srvSessionFrom(r.data)); return SRV.sess.access_token;
  }
  if (SRV.sess.expires_at - 60 < Date.now() / 1000) {
    const r = await srvFetch("/auth/v1/token?grant_type=refresh_token", { method: "POST", body: { refresh_token: SRV.sess.refresh_token } });
    if (r.ok) srvSave(srvSessionFrom(r.data));
    else { SRV.why = r.offline ? "offline" : "session"; return null; }
  }
  return SRV.sess.access_token;
}

async function srvRpc(fn, args) {
  const tok = await srvToken(); if (!tok) return { ok: false, error: SRV.why || "server" };
  const r = await srvFetch("/rest/v1/rpc/" + fn, { method: "POST", body: args || {}, token: tok });
  if (r.offline) return { ok: false, error: "offline" };
  if (!r.ok) return { ok: false, error: "server", detail: r.data };
  return r.data;
}
async function srvGet(path) {
  const tok = await srvToken(); if (!tok) return { ok: false, error: SRV.why || "server" };
  const r = await srvFetch(path, { token: tok });
  return r.offline ? { ok: false, error: "offline" } : r;
}
const srvLost = () => !!(store.profile && store.profile.srv && (!SRV.sess || SRV.sess.user.id !== store.profile.srv.uid)); // profil lié à un compte en ligne dont la session a disparu

/* ---------- profil et groupe ---------- */
async function srvUpsertProfile(pseudo, pet) {
  const tok = await srvToken(); if (!tok) return { ok: false, error: SRV.why || "server" };
  const r = await srvFetch("/rest/v1/profiles?on_conflict=id", { method: "POST", token: tok, prefer: "resolution=merge-duplicates,return=minimal", body: { id: SRV.sess.user.id, pseudo, pet } });
  return r.ok ? { ok: true } : { ok: false, error: r.offline ? "offline" : "server", detail: r.data };
}
// crée le profil en ligne puis crée ou rejoint un groupe ; renvoie { ok, group:{id,name,code} } ou { ok:false, error }
async function srvOnboard(o, pet) {
  const p = await srvUpsertProfile(o.name, pet); if (!p.ok) return p;
  const call = () => o.mode === "create" ? srvRpc("create_group", { p_name: o.group }) : srvRpc("join_group", { p_code: o.code });
  let r = await call();
  if (r && r.error === "already_in_group") { await srvRpc("leave_group"); r = await call(); } // ex. après une réinitialisation locale
  return r && r.ok ? r : { ok: false, error: (r && r.error) || "server" };
}
async function srvRefreshGroup() {
  if (!store.profile || !store.profile.srv || srvLost()) return;
  const [g, m] = await Promise.all([srvGet("/rest/v1/group_members?select=role,groups(id,name,code,max_members)"), srvGet("/rest/v1/group_members?select=user_id,role,joined_at,profiles(pseudo,pet)&order=joined_at")]);
  if (g.ok && Array.isArray(g.data)) { SRV.group = g.data[0] ? g.data[0].groups : null; if (SRV.group && (store.profile.group !== SRV.group.name || store.profile.code !== SRV.group.code)) { store.profile.group = SRV.group.name; store.profile.code = SRV.group.code; save(); } }
  if (m.ok && Array.isArray(m.data)) SRV.members = m.data;
  const typing = document.activeElement && document.activeElement.matches && document.activeElement.matches("input,textarea");
  if (ui.sheet && !game && !typing) render();
}
async function srvResetAccount() { // « Réinitialiser » : supprime aussi le compte en ligne
  try { if (SRV.sess) await srvRpc("delete_my_account"); } catch (e) {}
  srvSave(null); SRV.group = null; SRV.members = null;
}

/* ---------- récupération du compte par e-mail (code à 6 chiffres) ---------- */
function srvAuthErr(r) {
  if (r.offline) return "offline";
  if (r.status === 429) return "rate";
  const m = JSON.stringify(r.data || "").toLowerCase();
  if (m.includes("already") || m.includes("registered") || m.includes("taken")) return "email_taken";
  if (m.includes("signups not allowed") || m.includes("user not found")) return "no_account";
  if (m.includes("email") && m.includes("invalid")) return "bad_email";
  if (m.includes("expired") || m.includes("invalid") || m.includes("token")) return "bad_code";
  return "server";
}
// sauvegarde : lie une adresse e-mail au compte anonyme actuel (un code est envoyé pour confirmer)
async function srvLinkEmail(email) {
  const tok = await srvToken(); if (!tok) return { ok: false, error: SRV.why || "server" };
  const r = await srvFetch("/auth/v1/user", { method: "PUT", token: tok, body: { email } });
  return r.ok ? { ok: true } : { ok: false, error: srvAuthErr(r) };
}
async function srvConfirmLink(email, code) {
  const r = await srvFetch("/auth/v1/verify", { method: "POST", body: { type: "email_change", email, token: code } });
  if (!r.ok) return { ok: false, error: srvAuthErr(r) };
  if (r.data && r.data.access_token) srvSave(srvSessionFrom(r.data));
  else if (SRV.sess) { const t = await srvToken(); const u = t && await srvFetch("/auth/v1/user", { token: t }); if (u && u.ok) srvSave({ ...SRV.sess, user: u.data }); }
  return { ok: true };
}
// récupération sur un autre téléphone : un code est envoyé à l'adresse du compte
async function srvSendLoginCode(email) {
  const r = await srvFetch("/auth/v1/otp", { method: "POST", body: { email, create_user: false } });
  return r.ok ? { ok: true } : { ok: false, error: srvAuthErr(r) };
}
async function srvVerifyLoginCode(email, code) {
  const r = await srvFetch("/auth/v1/verify", { method: "POST", body: { type: "email", email, token: code } });
  if (!r.ok || !r.data || !r.data.access_token) return { ok: false, error: r.ok ? "bad_code" : srvAuthErr(r) };
  srvSave(srvSessionFrom(r.data)); return { ok: true };
}
// reconstruit le profil local à partir du compte en ligne (pseudo, familier, groupe)
async function srvRestoreProfile() {
  const uid = SRV.sess.user.id;
  const pr = await srvGet("/rest/v1/profiles?select=pseudo,pet,created_at,photo&id=eq." + uid);
  if (!pr.ok || !Array.isArray(pr.data) || !pr.data.length) return { ok: false, error: pr.error || "no_profile" };
  const g = await srvGet("/rest/v1/group_members?select=role,groups(id,name,code,max_members)");
  const grp = g.ok && Array.isArray(g.data) && g.data[0] ? g.data[0].groups : null, p = pr.data[0];
  store.profile = { name: p.pseudo, group: grp ? grp.name : "Sans groupe", code: grp ? grp.code : "", created: (p.created_at || "").slice(0, 10) || today(), pet: p.pet, tuto: { done: true, seen: { joker: true, carnet: true, trophees: true } }, srv: { uid }, seen: [] };
  if (p.photo) store.profile.photo = p.photo; // ma photo suit mon compte
  store.profile.seen = unlockedIds(progress());
  save(); SRV.group = grp; SRV.members = null;
  return { ok: true };
}

/* ---------- écrans : récupération, passage en ligne, bloc « Mon compte » du menu ---------- */
function vRecover() {
  const r = ui.rec = ui.rec || { step: 0, email: "", msg: "" };
  return `<div class="onb">
    <div class="rowtop">${backBtn("recoverback")}<span class="kicker">J'ai déjà un compte</span><span></span></div>
    <div class="ohead"><span class="brand">${logoMark(52)}</span><h1 class="display">Retrouver mon compte</h1>
      <p class="qsub">${r.step === 0 ? "Entre l'adresse e-mail que tu avais liée à ton compte. Tu recevras un code à 6 chiffres." : `Un code a été envoyé à ${esc(r.email)}. Entre-le ci-dessous (il peut mettre une minute à arriver).`}</p></div>
    ${r.step === 0
      ? `<form class="form" id="recForm1" novalidate><div class="field"><label for="recEmail">Adresse e-mail</label><input id="recEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(r.email)}"></div>
         <p class="err" id="recErr" role="alert" ${r.msg ? "" : "hidden"}>${esc(r.msg)}</p><button class="btn" type="submit">Recevoir un code</button></form>`
      : `<form class="form" id="recForm2" novalidate><div class="field"><label for="recCode">Code à 6 chiffres</label><input id="recCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*"></div>
         <p class="err" id="recErr" role="alert" ${r.msg ? "" : "hidden"}>${esc(r.msg)}</p><button class="btn" type="submit">Valider</button>
         <button type="button" class="linkbtn" data-act="recoveragain">Changer d'adresse</button></form>`}
    <p class="note center">Pas encore de compte sauvegardé ? Reviens en arrière et crée un profil.</p>
  </div>`;
}

function vEmailCode() { // juste après la création du profil : confirmer l'e-mail donné au départ
  const a = ui.acct || { email: "", msg: "" };
  return `<div class="onb">
    <div class="ohead"><span class="brand">${logoMark(52)}</span><h1 class="display">Confirme ton e-mail</h1>
      <p class="qsub">Un code à 6 chiffres vient d'être envoyé à ${esc(a.email)}. Entre-le pour sécuriser ton compte (il peut mettre une minute à arriver).</p></div>
    <form class="form" id="acctForm2" novalidate><div class="field"><label for="acctCode">Code à 6 chiffres</label><input id="acctCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*"></div>
      ${a.msg ? `<p class="err" role="alert">${esc(a.msg)}</p>` : ""}<button class="btn" type="submit">Valider</button></form>
    <button class="linkbtn plainlink" data-act="emailskip">Plus tard</button>
    <p class="note center">Tu pourras le faire depuis le menu. Sans e-mail, tu ne pourras pas retrouver ton compte si tu changes de téléphone.</p>
  </div>`;
}
function vOnline() { // profil créé avant le mode en ligne : choisir un groupe réel
  const t = ui.onbTab, p = store.profile;
  return `<div class="onb">
    <div class="rowtop">${backBtn()}<span class="kicker">Jouer avec tes amis</span><span></span></div>
    <div class="ohead"><span class="brand">${logoMark(52)}</span><h1 class="display">Passer en ligne</h1>
      <p class="qsub">${esc(p.name)}, crée un groupe ou rejoins celui d'un ami avec son code. Ton pseudo et ton familier suivent.</p></div>
    <form class="form" id="onlineForm" novalidate>
      <div class="seg light" role="group" aria-label="Groupe">
        <button type="button" data-act="onbtab" data-v="create" aria-pressed="${t === "create"}">Créer un groupe</button>
        <button type="button" data-act="onbtab" data-v="join" aria-pressed="${t === "join"}">Rejoindre</button>
      </div>
      ${t === "create"
        ? `<div class="field"><label for="gname">Nom du groupe</label><input id="gname" maxlength="24" value="${esc(ui.draftGroup)}"></div>`
        : `<div class="field"><label for="gcode">Code du groupe</label><input id="gcode" maxlength="8" placeholder="Ex. : K7Q4ZP" autocapitalize="characters" autocomplete="off" style="text-transform:uppercase" value="${esc(ui.draftCode)}"></div>`}
      <p class="err" id="onbErr" role="alert" hidden></p>
      <button class="btn" type="submit">${t === "create" ? "Créer le groupe" : "Rejoindre"}</button>
    </form>
    <p class="note center">Il faut une connexion pour cette étape.</p>
  </div>`;
}

// cartes de l'accueil : profil pas encore en ligne, ou session perdue
function onlineNotice() {
  if (!store.profile || !tutoState().done) return "";
  if (!store.profile.srv) return `<div class="tnotice" role="note"><span class="kicker">Nouveau</span><b>Joue avec tes amis, pour de vrai</b><span>Passe en ligne : crée un groupe ou rejoins celui d'un ami avec son code. Les autres membres ne seront plus simulés.</span><button class="smallbtn" data-act="goonline">Passer en ligne</button></div>`;
  if (srvLost()) return `<div class="tnotice" role="note"><span class="kicker">Connexion perdue</span><b>Ton compte en ligne n'est plus relié à ce téléphone</b><span>Retrouve-le avec l'adresse e-mail liée à ton compte.</span><button class="smallbtn" data-act="recover">Retrouver mon compte</button></div>`;
  return "";
}

// bloc du menu : mon groupe (membres réels) et sauvegarde du compte par e-mail
function accountSheetBlock() {
  const p = store.profile; if (!p) return "";
  if (!p.srv) return `<div><div class="kicker" style="margin-bottom:6px">Jeu en ligne</div><p class="note">Ton profil n'est pas encore en ligne : tes amis ne peuvent pas te retrouver.</p><button class="btn" data-act="goonline">Passer en ligne</button></div>`;
  if (srvLost()) return `<div><div class="kicker" style="margin-bottom:6px">Compte en ligne</div><p class="note">La connexion à ton compte a été perdue sur ce téléphone.</p><button class="btn ghost" data-act="recover">Retrouver mon compte</button></div>`;
  const me = SRV.sess && SRV.sess.user.id, members = SRV.members;
  const list = members
    ? `<ul class="mlist">${members.map(m => `<li class="mrow">${m.profiles ? petAv(m.profiles.pet, "sm", m.profiles.pseudo) : ""}<span><b>${esc(m.profiles ? m.profiles.pseudo : "Joueur")}</b>${m.user_id === me ? " (toi)" : ""}${m.role === "owner" ? ` <small class="muted">propriétaire</small>` : ""}</span></li>`).join("")}</ul>`
    : `<p class="note">${SRV.online ? "Chargement des membres…" : "Hors ligne : membres indisponibles."}</p>`;
  const a = ui.acct = ui.acct || { step: 0, email: "", msg: "" }, linked = SRV.sess && SRV.sess.user && SRV.sess.user.email;
  const mail = linked
    ? `<p class="note">Compte sauvegardé : <b>${esc(maskEmail(SRV.sess.user.email))}</b>. Sur un autre téléphone, choisis « J'ai déjà un compte ».</p>`
    : a.step === 0
      ? `<form class="plainform" id="acctForm1" novalidate><div class="field"><label for="acctEmail">Ton e-mail (pour retrouver ton compte)</label><input id="acctEmail" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" value="${esc(a.email)}"></div><p class="note">Utilisé uniquement pour retrouver ton compte. Tu recevras un code.</p>${a.msg ? `<p class="err" role="alert">${esc(a.msg)}</p>` : ""}<button class="smallbtn" type="submit">Recevoir un code</button></form>`
      : `<form class="plainform" id="acctForm2" novalidate><div class="field"><label for="acctCode">Code reçu sur ${esc(a.email)}</label><input id="acctCode" inputmode="numeric" autocomplete="one-time-code" maxlength="8" pattern="[0-9]*"></div>${a.msg ? `<p class="err" role="alert">${esc(a.msg)}</p>` : ""}<button class="smallbtn" type="submit">Valider</button> <button type="button" class="linkbtn" data-act="acctagain">Changer d'adresse</button></form>`;
  const blocked = [...SRV.blocks].map(id => { const m = (SRV.members || []).find(x => x.user_id === id); return `<li class="mrow"><span><b>${esc(m && m.profiles ? m.profiles.pseudo : "Joueur bloqué")}</b></span><button class="smallbtn ghost" data-act="unblock" data-v="${id}">Débloquer</button></li>`; }).join("");
  return `<div><div class="kicker" style="margin-bottom:6px">Mon groupe${SRV.group ? ` · ${esc(SRV.group.name)}` : ""}</div>${list}${blocked ? `<div class="kicker" style="margin:10px 0 4px">Joueurs bloqués</div><ul class="mlist">${blocked}</ul>` : ""}</div>
    <div><div class="kicker" style="margin-bottom:6px">Sauvegarde du compte</div>${mail}</div>`;
}

/* =================== MODE EN LIGNE : horloge, classement, essais, scores (lot 3, étape 4) ===================
   Un profil lié à un compte (store.profile.srv) lit TOUT ce qui se compare sur le serveur : jour et heure, essais restants,
   classement du jour et de la saison, boussoles, série. Les fonctions players / dayResults / progress / wallet / feed de pA_core.js
   y renvoient dès que srvOn() est vrai ; les écrans ne changent pas. Plus aucun joueur simulé pour ces profils. */
function srvOn() { try { return !!(store.profile && store.profile.srv); } catch (e) { return false; } }
const myUid = () => (store.profile && store.profile.srv && store.profile.srv.uid) || (SRV.sess && SRV.sess.user && SRV.sess.user.id) || "";
const SRV_TZ = "Europe/Paris", SRV_COLORS = ["#EF6F68", "#17977F", "#F0993B", "#4A86EE", "#D9579E", "#7A9E2E", "#8D78F0", "#2BA3B8"];
const colorOf = id => { let h = 0; for (const c of String(id)) h = (h * 31 + c.charCodeAt(0)) >>> 0; return SRV_COLORS[h % SRV_COLORS.length]; };

/* horloge : heure du serveur + temps écoulé mesuré par le navigateur (insensible aux changements de date du téléphone) */
let srvFmtCache = null;
function srvParts(ms) {
  srvFmtCache = srvFmtCache || new Intl.DateTimeFormat("en-CA", { timeZone: SRV_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  const o = {}; srvFmtCache.formatToParts(new Date(ms)).forEach(p => { o[p.type] = p.value; }); return o;
}
const srvNowMs = () => SRV.base ? SRV.base.server + (performance.now() - SRV.base.perf) : null;
function srvToday() { try { const n = srvNowMs(); if (n === null || !srvOn()) return null; const p = srvParts(n); return `${p.year}-${p.month}-${p.day}`; } catch (e) { return null; } }
function srvMinutes() { try { const n = srvNowMs(); if (n === null || !srvOn()) return null; const p = srvParts(n); return (+p.hour % 24) * 60 + +p.minute; } catch (e) { return null; } }
function srvSecondsLeft() { try { const n = srvNowMs(); if (n === null || !srvOn()) return null; const p = srvParts(n); return 86400 - ((+p.hour % 24) * 3600 + +p.minute * 60 + +p.second); } catch (e) { return null; } }
function minutesOfIso(iso) { try { const p = srvParts(Date.parse(String(iso).replace(/(\.\d{3})\d+/, "$1"))); return (+p.hour % 24) * 60 + +p.minute; } catch (e) { return 0; } }
async function srvSyncClock() {
  const t0 = performance.now(), r = await srvRpc("server_now");
  if (typeof r !== "string") return false;
  const t1 = performance.now(), ms = Date.parse(r.replace(/(\.\d{3})\d+/, "$1"));
  if (!isFinite(ms)) return false;
  SRV.base = { server: ms + (t1 - t0) / 2, perf: t1 }; return true;
}

/* données de la saison du groupe, lues sur le serveur et mises en cache (SRV.ov, SRV.members, SRV.attempts, SRV.sum) */
SRV.attempts = {}; SRV.ov = null; SRV.sum = null;
async function srvSync(force) {
  if (!srvOn() || srvLost()) return false;
  if (SRV.syncing) return SRV.syncing;
  if (!force && SRV.syncedAt && performance.now() - SRV.syncedAt < 4000) return true;
  SRV.syncing = (async () => {
    try {
      const tok = await srvToken(); if (!tok) return false;
      if (!(await srvSyncClock())) return false;
      await srvFlushPending();
      const day = srvToday();
      const [mem, ov, att, sum, grp] = await Promise.all([
        srvGet("/rest/v1/group_members?select=user_id,role,joined_at,profiles(pseudo,pet,photo_v)&order=joined_at"),
        srvRpc("season_overview"),
        srvGet("/rest/v1/attempts?select=day,try_idx,score,submitted_at,fmt,slow&day=eq." + day + "&order=try_idx"),
        srvRpc("my_summary"),
        srvGet("/rest/v1/group_members?select=role,groups(id,name,code,max_members)"),
        srvLoadChat()
      ]);
      if (grp.ok && Array.isArray(grp.data) && grp.data[0]) SRV.group = grp.data[0].groups;
      if (mem.ok && Array.isArray(mem.data)) { SRV.members = mem.data; await srvFetchPhotos(); }
      if (Array.isArray(ov)) SRV.ov = ov;
      if (att.ok && Array.isArray(att.data)) SRV.attempts[day] = att.data;
      if (sum && sum.gems_total !== undefined) SRV.sum = sum;
      SRV.syncedAt = performance.now();
      return true;
    } catch (e) { return false; }
    finally { SRV.syncing = null; }
  })();
  const ok = await SRV.syncing;
  if (ok) srvRepaint();
  return ok;
}
function srvRepaint() { // redessine l'écran courant sans casser une saisie en cours
  try {
    if (ui.evo) return; // ne jamais relancer l'animation d'évolution en cours
    if (typeof game !== "undefined" && game) { if (game.phase === "end" && !ui.confirm) renderGame(); return; } // l'écran de fin suit le classement en direct
    const a = document.activeElement; if (a && a.matches && a.matches("input,textarea")) return;
    if (ui.view === "welcome") return;
    render();
  } catch (e) {}
}
window.addEventListener("load", () => { setTimeout(() => srvSync(true), 50); });
document.addEventListener("visibilitychange", () => { if (!document.hidden) srvSync(true); });
setInterval(() => { if (!document.hidden && srvOn() && (typeof game === "undefined" || !game)) srvSync(); }, 45000);

/* fournisseurs de données (mêmes formes que la version locale : les écrans n'ont pas à changer) */
/* photos de profil : envoyées au serveur, lues seulement quand leur version change, conservées sur le téléphone (meridien.photos) */
SRV.photos = (() => { try { return JSON.parse(localStorage.getItem("meridien.photos")) || {}; } catch (e) { return {}; } })();
const savePhotos = () => { try { localStorage.setItem("meridien.photos", JSON.stringify(SRV.photos)); } catch (e) {} };
async function srvPushPhoto() {
  if (!srvOn() || srvLost()) return;
  const tok = await srvToken(); if (!tok) return;
  await srvFetch("/rest/v1/profiles?id=eq." + myUid(), { method: "PATCH", token: tok, prefer: "return=minimal", body: { photo: store.profile.photo || null, photo_v: Math.floor((srvNowMs() || Date.now()) / 1000) } });
}
async function srvFetchPhotos() {
  let changed = false; const uid = myUid();
  for (const m of SRV.members || []) {
    if (m.user_id === uid) continue;
    const v = (m.profiles && m.profiles.photo_v) || 0, c = SRV.photos[m.user_id];
    if (!v) { if (c) { delete SRV.photos[m.user_id]; changed = true; } continue; }
    if (c && c.v === v) continue;
    const r = await srvGet("/rest/v1/profiles?select=photo&id=eq." + m.user_id);
    if (r.ok && Array.isArray(r.data) && r.data[0] && r.data[0].photo) { SRV.photos[m.user_id] = { v, d: r.data[0].photo }; changed = true; }
  }
  if (changed) savePhotos();
}
function onlinePlayers() {
  const me = { id: "me", name: store.profile.name, color: ME_COLOR, me: true, pet: store.profile.pet, photo: store.profile.photo }, uid = myUid();
  const others = (SRV.members || []).filter(m => m.user_id !== uid).map(m => ({ id: m.user_id, name: m.profiles ? m.profiles.pseudo : "Joueur", color: colorOf(m.user_id), pet: (m.profiles && m.profiles.pet) || defaultPet("renard"), photo: (SRV.photos[m.user_id] || {}).d }));
  return [me, ...others];
}
function onlineDayResults(k) {
  const pl = onlinePlayers(), uid = myUid(), rows = (SRV.ov || []).filter(r => r.play_day === k);
  const played = rows.map(r => {
    const p = r.player_id === uid ? pl[0] : (pl.find(x => x.id === r.player_id) || { id: r.player_id, name: r.pseudo, color: colorOf(r.player_id), pet: defaultPet("renard") });
    return { ...p, plays: [{ at: minutesOfIso(r.at), score: r.best }], best: r.best, tries: r.tries, pos: r.pos, gems: r.gems, win: r.pos === 1 && r.n >= 2, slow: !!r.slow, sk: r.score_key || `${r.player_id}-${r.play_day}` };
  }).sort((a, b) => a.pos - b.pos || String(a.name).localeCompare(String(b.name), "fr"));
  const ids = new Set(played.map(p => p.id));
  return { played, waiting: pl.filter(p => !ids.has(p.id)), N: played.length };
}
function onlineFeed(k) {
  const res = onlineDayResults(k), pl = onlinePlayers(), uid = myUid();
  const ev = res.played.map(p => ({ id: `s-${p.sk}`, rid: p.sk, rtype: "score", type: "score", at: p.plays[0].at, p, score: p.best, best: p.pos === 1 && res.N >= 2 }));
  ev.sort((a, b) => a.at - b.at);
  if (ev.length) ev.unshift({ id: "launch", type: "launch", at: ev[0].at, p: ev[0].p });
  // messages du jour (les auteurs bloqués sont déjà filtrés par le serveur)
  const msgs = (SRV.msgs || []).filter(m => dayOfIso(m.created_at) === k && !(SRV.hidden && SRV.hidden.has(m.id))).map(m => {
    const p = m.user_id === uid ? pl[0] : (pl.find(x => x.id === m.user_id) || { id: m.user_id, name: (m.profiles && m.profiles.pseudo) || "Ancien membre", color: colorOf(m.user_id), pet: (m.profiles && m.profiles.pet) || defaultPet("renard") });
    return { id: `m-${m.id}`, rid: m.id, rtype: "message", type: "msg", at: minutesOfIso(m.created_at), p, text: m.body, mine: m.user_id === uid, mid: m.id };
  });
  return [...ev, ...msgs].sort((a, b) => a.at - b.at || (a.type === "score" ? -1 : 1));
}
function dayOfIso(iso) { try { const p = srvParts(Date.parse(String(iso).replace(/(\.\d{3})\d+/, "$1"))); return `${p.year}-${p.month}-${p.day}`; } catch (e) { return ""; } }
function onlineProgress() {
  const s = SRV.sum || { gems_total: 0, wins: 0, days: 0, wallet: 0, streak: 0 };
  return { gems: s.gems_total, wins: s.wins, streak: s.streak, plays: s.days, games: Object.values(store.stats.fmts || {}).reduce((n, v) => n + v, 0), carnet: Object.keys(store.carnet || {}).length, fmts: Object.keys(store.stats.fmts || {}).length };
}
const onlineWallet = () => (SRV.sum ? SRV.sum.wallet : 0);
// essais du jour (liste de { score }) : serveur en ligne, sauvegarde locale sinon ; l'essai en cours compte avec son score actuel
function playsOf(k) {
  if (!srvOn()) return store.plays[k] || [];
  return (SRV.attempts[k] || []).map(a => ({ score: a.score || 0, at: a.submitted_at ? minutesOfIso(a.submitted_at) : 0 }));
}

/* =================== CHAT DES AMIS (lot 3, étape 6) ===================
   Messages et réactions du groupe, lus sur le serveur (interrogation toutes les 8 s quand l'onglet Chat est ouvert, 45 s sinon).
   Signaler (envoyé à la modération et masqué), bloquer (le serveur ne renvoie plus ses messages), supprimer ses propres messages. */
SRV.msgs = []; SRV.reacts = []; SRV.blocks = new Set(); SRV.hidden = new Set(); SRV.chatSig = "";
const srvBlocked = uid => SRV.blocks.has(uid);
async function srvLoadChat() {
  const since = new Date((srvNowMs() || Date.now()) - 48 * 3600e3).toISOString();
  const [m, r, b] = await Promise.all([
    srvGet("/rest/v1/messages?select=id,user_id,body,created_at,profiles(pseudo,pet)&created_at=gte." + encodeURIComponent(since) + "&order=created_at.asc&limit=300"),
    srvGet("/rest/v1/reactions?select=user_id,target_type,target_id,emoji&limit=3000"),
    srvGet("/rest/v1/blocks?select=blocked_id")
  ]);
  if (b.ok && Array.isArray(b.data)) SRV.blocks = new Set(b.data.map(x => x.blocked_id));
  if (m.ok && Array.isArray(m.data)) SRV.msgs = m.data;
  if (r.ok && Array.isArray(r.data)) SRV.reacts = r.data.filter(x => !SRV.blocks.has(x.user_id));
  const sig = SRV.msgs.map(x => x.id).join() + "|" + SRV.reacts.map(x => x.target_id + x.emoji + x.user_id).join();
  const changed = sig !== SRV.chatSig; SRV.chatSig = sig; return changed;
}
const chatOpen = () => srvOn() && !srvLost() && !document.hidden && typeof game !== "undefined" && !game && ui.view === "group" && ui.tab === "chat" && !ui.sheet && !ui.confirm && !ui.evo;
function srvRepaintFeed() { // met à jour le fil sans toucher au champ de saisie
  const f = document.querySelector(".feed"); if (!f) return render();
  const t = document.createElement("div"); t.innerHTML = vFeed(today()); f.replaceWith(t.firstElementChild);
}
setInterval(async () => {
  if (!chatOpen()) return;
  if (await srvLoadChat()) { const a = document.activeElement; if (a && a.id === "msg") srvRepaintFeed(); else render(); }
}, 8000);
function srvChatInfo(m) { ui.chatMsg = m; clearTimeout(srvChatInfo._t); srvChatInfo._t = setTimeout(() => { ui.chatMsg = ""; const e = document.getElementById("chatmsg"); if (e) e.remove(); }, 5000); const e = document.getElementById("chatmsg"); if (e) e.textContent = m; else if (!game) render(); }
async function srvSendMessage(text, inp) {
  if (!SRV.group) await srvSync(true);
  const gid = SRV.group && SRV.group.id, tok = await srvToken();
  if (!gid || !tok) return srvChatInfo(!tok ? srvMsg(SRV.why || "offline") : "Ton groupe n'est pas chargé. Réessaie dans un instant.");
  const r = await srvFetch("/rest/v1/messages", { method: "POST", token: tok, prefer: "return=representation", body: { group_id: gid, user_id: myUid(), body: text } });
  if (!r.ok) return srvChatInfo(r.offline ? srvMsg("offline") : JSON.stringify(r.data || "").includes("rate_limited") ? "Doucement : trop de messages à la suite. Attends un instant." : "Message non envoyé. Réessaie.");
  const m = Array.isArray(r.data) ? r.data[0] : r.data;
  if (m) { m.profiles = { pseudo: store.profile.name, pet: store.profile.pet }; SRV.msgs.push(m); }
  if (inp) inp.value = "";
  ui.chatMsg = ""; srvRepaintFeed(); window.scrollTo(0, document.body.scrollHeight);
}
const rxTarget = evId => onlineFeed(today()).find(e => e.id === evId);
function onlineReactions(ev) {
  const counts = {}, uid = myUid(); let mine = null;
  (SRV.reacts || []).forEach(r => { if (r.target_id !== ev.rid) return; counts[r.emoji] = (counts[r.emoji] || 0) + 1; if (r.user_id === uid) mine = r.emoji; });
  return { counts, mine };
}
async function srvReact(evId, emoji) {
  const ev = rxTarget(evId), gid = SRV.group && SRV.group.id, uid = myUid(), tok = await srvToken(); ui.reactOpen = null;
  if (!ev || !ev.rid || !gid || !tok) return render();
  const cur = SRV.reacts.find(r => r.user_id === uid && r.target_id === ev.rid), backup = SRV.reacts.slice();
  SRV.reacts = SRV.reacts.filter(r => !(r.user_id === uid && r.target_id === ev.rid)); // affichage immédiat
  let res;
  if (cur && cur.emoji === emoji) res = await srvFetch(`/rest/v1/reactions?user_id=eq.${uid}&target_type=eq.${ev.rtype}&target_id=eq.${ev.rid}`, { method: "DELETE", token: tok });
  else { SRV.reacts.push({ user_id: uid, target_type: ev.rtype, target_id: ev.rid, emoji }); res = await srvFetch("/rest/v1/reactions?on_conflict=user_id,target_type,target_id", { method: "POST", token: tok, prefer: "resolution=merge-duplicates,return=minimal", body: { group_id: gid, user_id: uid, target_type: ev.rtype, target_id: ev.rid, emoji } }); }
  if (!res.ok) { SRV.reacts = backup; srvChatInfo(res.offline ? srvMsg("offline") : "Réaction non enregistrée."); }
  render();
}
// modération : confirmations (via la fenêtre de confirmation de l'application)
function srvAskMod(kind, evId) {
  const ev = rxTarget(evId); if (!ev) return; ui.reactOpen = null;
  const name = ev.p ? ev.p.name : "ce joueur";
  const C = {
    report: { title: "Signaler ce message ?", text: "Il sera envoyé à la modération et masqué pour toi.", yes: "Signaler", run: () => srvReport(ev.rid) },
    block: { title: `Bloquer ${name} ?`, text: "Tu ne verras plus ses messages ni ses réactions. Tu pourras le débloquer depuis le menu.", yes: "Bloquer", run: () => srvBlock(ev.p.id) },
    del: { title: "Supprimer ce message ?", text: "Il disparaîtra pour tout le groupe.", yes: "Supprimer", run: () => srvDeleteMessage(ev.rid) }
  }[kind];
  ui.confirm = { ...C, no: "Annuler" }; render();
}
async function srvReport(mid) {
  const tok = await srvToken(); if (!tok) return srvChatInfo(srvMsg(SRV.why || "offline"));
  const r = await srvFetch("/rest/v1/reports", { method: "POST", token: tok, prefer: "return=minimal", body: { reporter_id: myUid(), message_id: mid, reason: "signalement depuis l'application" } });
  if (!r.ok) return srvChatInfo(r.offline ? srvMsg("offline") : "Signalement non envoyé. Réessaie.");
  SRV.hidden.add(mid); srvChatInfo("Message signalé et masqué. Merci."); render();
}
async function srvBlock(uid) {
  const tok = await srvToken(); if (!tok) return srvChatInfo(srvMsg(SRV.why || "offline"));
  const r = await srvFetch("/rest/v1/blocks", { method: "POST", token: tok, prefer: "return=minimal", body: { blocker_id: myUid(), blocked_id: uid } });
  if (!r.ok) return srvChatInfo(r.offline ? srvMsg("offline") : "Blocage non enregistré. Réessaie.");
  SRV.blocks.add(uid); await srvLoadChat(); srvChatInfo("Joueur bloqué."); render();
}
async function srvUnblock(uid) {
  const tok = await srvToken(); if (!tok) return;
  const r = await srvFetch(`/rest/v1/blocks?blocker_id=eq.${myUid()}&blocked_id=eq.${uid}`, { method: "DELETE", token: tok });
  if (r.ok) { SRV.blocks.delete(uid); await srvLoadChat(); } render();
}
async function srvDeleteMessage(mid) {
  const tok = await srvToken(); if (!tok) return;
  const r = await srvFetch(`/rest/v1/messages?id=eq.${mid}`, { method: "DELETE", token: tok });
  if (r.ok) { SRV.msgs = SRV.msgs.filter(m => m.id !== mid); } else srvChatInfo(r.offline ? srvMsg("offline") : "Suppression impossible.");
  render();
}
// boutons d'action affichés sous un message quand on ouvre le sélecteur de réaction
function msgActions(ev) {
  if (ev.type !== "msg") return "";
  return `<span class="msgacts" role="group" aria-label="Actions sur le message">${ev.mine
    ? `<button class="smallbtn ghost" data-act="msgdel" data-v="${ev.id}">Supprimer</button>`
    : `<button class="smallbtn ghost" data-act="msgreport" data-v="${ev.id}">Signaler</button><button class="smallbtn ghost" data-act="msgblock" data-v="${ev.id}">Bloquer ${esc(ev.p.name)}</button>`}</span>`;
}

/* jouer le défi du jour : synchronisation avec le serveur d'abord (jour, essais restants) */
function srvHomeMsg(m) { ui.homeMsg = m; if (!game) render(); clearTimeout(srvHomeMsg._t); srvHomeMsg._t = setTimeout(() => { ui.homeMsg = ""; if (!game && ui.view === "group") render(); }, 7000); }
const SRV_PLAYMSG = { no_tries_left: "Tu as déjà joué tes 2 essais aujourd'hui. Reviens demain !", no_profile: "Ton profil n'existe pas encore en ligne." };
async function playToday() {
  if (!srvOn()) return startGame(false);
  if (ui.busyPlay) return;
  ui.busyPlay = true; render();
  const ok = await srvSync(true);
  ui.busyPlay = false;
  if (!ok) { render(); return srvHomeMsg(srvLost() ? srvMsg("session") : "Connexion nécessaire pour jouer le défi du jour. Tu peux t'entraîner hors ligne depuis le menu."); }
  if (playsOf(today()).length >= CONFIG.tries) { render(); return srvHomeMsg(SRV_PLAYMSG.no_tries_left); }
  startGame(false);
}
// « C'est parti » : l'essai est compté par le serveur (jour et jeu décidés par lui)
async function srvBeginTry(g) {
  const r = await srvRpc("start_try");
  if (!r || !r.ok) return r || { ok: false, error: "server" };
  if (r.day !== g.k || r.fmt !== g.fmt) return { ok: false, error: "day_changed" };
  g.attemptId = r.attempt_id; g.slow = timeFactor();
  (SRV.attempts[r.day] = SRV.attempts[r.day] || []).push({ day: r.day, try_idx: r.try_idx, score: null, submitted_at: null, fmt: r.fmt, slow: g.slow });
  return r;
}
function srvStartFailed(r) {
  return r && r.error === "day_changed" ? "Le jour a changé pendant que tu te préparais. Relance le défi." : (SRV_PLAYMSG[r && r.error] || srvMsg(r && r.error));
}

/* envoi du score : le serveur recalcule le total ; en cas de coupure, l'envoi est remis à plus tard (store.pending) */
async function srvTrySubmit(job) {
  const r = await srvRpc("submit_score", { p_attempt: job.attempt, p_rounds: job.rounds, p_slow: job.slow });
  if (r && r.ok) { const row = (SRV.attempts[job.day] || []).find(a => a.try_idx === job.try); if (row) row.score = r.score; return { state: "ok", score: r.score }; }
  const retry = !r || ["offline", "server", "session"].includes(r.error);
  if (retry) return { state: "retry", error: r && r.error };
  return { state: r.error === "already_submitted" ? "ok" : "drop", error: r.error };
}
function srvSubmit(g) {
  if (!g.attemptId || g.submit) return;
  g.submit = "pending";
  const job = { attempt: g.attemptId, day: g.k, try: g.tryIdx, slow: g.slow || 1, rounds: [0, 1, 2].map(i => ({ m: (g.manches[i] && g.manches[i].key) || "", diff: g.diffs[i] != null ? g.diffs[i] : 0, pts: g.roundPts[i] || 0 })) };
  srvTrySubmit(job).then(async r => {
    if (r.state === "retry") { store.pending = store.pending || []; if (!store.pending.some(p => p.attempt === job.attempt)) { store.pending.push(job); save(); } g.submit = "queued"; }
    else g.submit = r.state === "ok" ? "ok" : "fail:" + r.error;
    await srvSync(true);
    if (game === g && g.phase === "end") renderGame();
  });
}
async function srvFlushPending() {
  const q = (store.pending || []).slice(); if (!q.length) return;
  for (const job of q) {
    const r = await srvTrySubmit(job);
    if (r.state !== "retry") {
      store.pending = (store.pending || []).filter(p => p.attempt !== job.attempt);
      if (typeof game !== "undefined" && game && game.attemptId === job.attempt) game.submit = r.state === "ok" ? "ok" : "fail:" + r.error; // l'écran de fin n'affiche plus « en attente »
    }
  }
  save();
}
const srvSubmitNote = g => g.submit === "pending" ? "Enregistrement de ton score…" : g.submit === "queued" ? "Score en attente d'envoi : pas de réseau pour l'instant. Il sera envoyé automatiquement." : String(g.submit || "").startsWith("fail:") ? "Ton score n'a pas pu être enregistré. Reviens demain pour un nouveau défi." : "";

/* ---------- formulaires (en plus des écouteurs de pC_events.js) ---------- */
document.addEventListener("submit", async e => {
  const id = e.target.id;
  if (!["onlineForm", "recForm1", "recForm2", "acctForm1", "acctForm2"].includes(id)) return;
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]'), val = n => { const el = document.getElementById(n); return el ? el.value.trim() : ""; };
  const busy = on => { if (btn) btn.disabled = on; };
  const emailOk = s => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s);

  if (id === "onlineForm") { // profil existant → groupe réel
    captureDrafts();
    const err = document.getElementById("onbErr"), fail = m => { err.textContent = m; err.hidden = false; busy(false); };
    const mode = ui.onbTab; let group = "", code = "";
    if (mode === "create") { group = ui.draftGroup.trim(); if (group.length < 2) return fail(srvMsg("bad_name")); }
    else { code = ui.draftCode.toUpperCase().replace(/[^A-Z0-9]/g, ""); if (code.length < 4) return fail("Entre le code que ton ami t'a donné."); }
    busy(true); err.textContent = "Connexion au serveur…"; err.hidden = false;
    const r = await srvOnboard({ name: store.profile.name, mode, group, code }, store.profile.pet);
    if (!r.ok) return fail(srvMsg(r.error));
    Object.assign(store.profile, { group: r.group.name, code: r.group.code, srv: { uid: SRV.sess.user.id } }); save(); SRV.members = null;
    go("group"); srvSync(true); if (store.profile.photo) srvPushPhoto(); return;
  }
  if (id === "recForm1") {
    const email = val("recEmail").toLowerCase(), r = ui.rec; r.email = email;
    if (!emailOk(email)) { r.msg = srvMsg("bad_email"); return render(); }
    busy(true); const s = await srvSendLoginCode(email);
    r.msg = s.ok ? "" : srvMsg(s.error); if (s.ok) r.step = 1; return render();
  }
  if (id === "recForm2") {
    const r = ui.rec, code = val("recCode").replace(/\s/g, "");
    if (code.length < 6) { r.msg = srvMsg("bad_code"); return render(); }
    busy(true); const v = await srvVerifyLoginCode(r.email, code);
    if (!v.ok) { r.msg = srvMsg(v.error); return render(); }
    const rp = await srvRestoreProfile();
    if (!rp.ok) { r.msg = rp.error === "no_profile" ? "Ce compte n'a pas encore de profil. Crée-en un." : srvMsg(rp.error); return render(); }
    ui.rec = null; go("group"); srvSync(true); return;
  }
  if (id === "acctForm1") {
    const email = val("acctEmail").toLowerCase(), a = ui.acct; a.email = email;
    if (!emailOk(email)) { a.msg = srvMsg("bad_email"); return render(); }
    busy(true); const s = await srvLinkEmail(email);
    a.msg = s.ok ? "" : srvMsg(s.error); if (s.ok) a.step = 1; return render();
  }
  if (id === "acctForm2") {
    const a = ui.acct, code = val("acctCode").replace(/\s/g, "");
    if (code.length < 6) { a.msg = srvMsg("bad_code"); return render(); }
    busy(true); const c = await srvConfirmLink(a.email, code);
    a.msg = c.ok ? "" : srvMsg(c.error); if (c.ok) { a.step = 0; if (ui.view === "emailcode") return go("welcome"); ui.toast = "Compte sauvegardé"; setTimeout(() => { ui.toast = ""; if (!game) render(); }, 2200); } return render();
  }
});

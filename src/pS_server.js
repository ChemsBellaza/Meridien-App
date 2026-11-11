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
  const pr = await srvGet("/rest/v1/profiles?select=pseudo,pet,created_at&id=eq." + uid);
  if (!pr.ok || !Array.isArray(pr.data) || !pr.data.length) return { ok: false, error: pr.error || "no_profile" };
  const g = await srvGet("/rest/v1/group_members?select=role,groups(id,name,code,max_members)");
  const grp = g.ok && Array.isArray(g.data) && g.data[0] ? g.data[0].groups : null, p = pr.data[0];
  store.profile = { name: p.pseudo, group: grp ? grp.name : "Sans groupe", code: grp ? grp.code : "", created: (p.created_at || "").slice(0, 10) || today(), pet: p.pet, tuto: { done: true, seen: { joker: true, carnet: true, trophees: true } }, srv: { uid }, seen: [] };
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
  return `<div><div class="kicker" style="margin-bottom:6px">Mon groupe${SRV.group ? ` · ${esc(SRV.group.name)}` : ""}</div>${list}</div>
    <div><div class="kicker" style="margin-bottom:6px">Sauvegarde du compte</div>${mail}</div>`;
}

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
    go("group"); srvRefreshGroup(); return;
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
    ui.rec = null; go("group"); srvRefreshGroup(); return;
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
    a.msg = c.ok ? "" : srvMsg(c.error); if (c.ok) { a.step = 0; ui.toast = "Compte sauvegardé"; setTimeout(() => { ui.toast = ""; if (!game) render(); }, 2200); } return render();
  }
});

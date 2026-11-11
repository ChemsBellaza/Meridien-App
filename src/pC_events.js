// mémorise la page d'origine avant d'ouvrir la saison ou le familier
document.addEventListener("click", e => {
  if (e.target.closest("[data-act='season'],[data-act='pet'],[data-act='carnet'],[data-act='trophees']") && !["season", "pet", "carnet", "trophees"].includes(ui.view)) ui.prevView = ui.view;
}, true);

function copyCode() {
  const txt = store.profile.code;
  const done = () => { ui.toast = "copied"; render(); };
  try { navigator.clipboard.writeText(txt).then(done, () => selectCode()); } catch (e) { selectCode(); }
}
function selectCode() { const el = document.getElementById("gcodeTxt"); if (!el) return; const r = document.createRange(); r.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }

document.addEventListener("submit", e => {
  e.preventDefault();
  if (e.target.id === "onbForm") {
    captureDrafts();
    const name = ui.draftName.trim();
    const err = document.getElementById("onbErr"), btn = e.target.querySelector('button[type="submit"]');
    const fail = m => { err.textContent = m; err.hidden = false; if (btn) btn.disabled = false; };
    if (name.length < 2) return fail("Choisis un pseudo d'au moins 2 caractères.");
    const mail = (ui.draftMail || "").trim().toLowerCase();
    if (mail && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) return fail(srvMsg("bad_email"));
    let group = "", code = "";
    if (ui.onbTab === "create") {
      group = ui.draftGroup.trim(); if (group.length < 2) return fail(srvMsg("bad_name"));
    } else {
      code = ui.draftCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (code.length < 4) return fail("Entre le code que ton ami t'a donné.");
    }
    // le profil et le groupe sont créés sur le serveur (code vérifié, groupe partagé avec les amis)
    if (btn) btn.disabled = true; err.textContent = "Connexion au serveur…"; err.hidden = false;
    const pet = defaultPet(ui.draftPet);
    srvOnboard({ name, mode: ui.onbTab, group, code }, pet).then(r => {
      if (!r.ok) return fail(srvMsg(r.error));
      store.profile = { name, group: r.group.name, code: r.group.code, created: today(), pet, tuto: { done: false, seen: {} }, srv: { uid: SRV.sess.user.id } };
      if (ui.draftPhoto) store.profile.photo = ui.draftPhoto;
      store.profile.seen = unlockedIds(progress());
      save(); SRV.members = null; srvSync(true); if (store.profile.photo) srvPushPhoto(); // horloge et données du serveur dès la création du profil ; photo partagée
      if (!mail) return go("welcome");
      // e-mail donné dès le départ : un code de confirmation est envoyé, à saisir tout de suite (ou plus tard depuis le menu)
      srvLinkEmail(mail).then(s => { ui.acct = { step: s.ok ? 1 : 0, email: mail, msg: s.ok ? "" : srvMsg(s.error) }; go(s.ok ? "emailcode" : "welcome"); });
    });
  }
  if (e.target.id === "msgForm") {
    const inp = document.getElementById("msg"), text = inp.value.trim();
    if (!text) return;
    if (srvOn()) { srvSendMessage(text, inp); inp.focus(); return; } // en ligne : message envoyé au groupe via le serveur
    const k = today(); (store.chat[k] = store.chat[k] || []).push({ from: "me", text, at: minutesNow() });
    save(); render();
    const f = document.getElementById("msg"); if (f) f.focus();
    window.scrollTo(0, document.body.scrollHeight);
  }
});

/* compte à rebours + rafraîchissement des joueurs simulés */
let lastMinute = minutesNow(), lastDay = today();
function updateCountdown() {
  const cd = document.getElementById("cd"); if (!cd) return;
  const d = new Date(), sv = typeof srvSecondsLeft === "function" ? srvSecondsLeft() : null, s = sv !== null ? sv : 86400 - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()); // en ligne : minuit du serveur
  cd.textContent = `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`;
}
setInterval(() => {
  if (document.hidden) return; // rien à rafraîchir en arrière-plan
  updateCountdown();
  const m = minutesNow();
  if ((m !== lastMinute || today() !== lastDay) && !game && ui.view === "group" && store.profile && store.profile.pet && document.activeElement?.id !== "msg" && !ui.sheet) { lastMinute = m; lastDay = today(); render(); }
}, 1000);
function bindAfterRender() {
  updateCountdown();
  const c = document.getElementById("carousel"), sel = c && c.querySelector('[aria-pressed="true"]');
  if (sel) c.scrollLeft = sel.offsetLeft - c.offsetLeft - (c.clientWidth - sel.offsetWidth) / 2;
}


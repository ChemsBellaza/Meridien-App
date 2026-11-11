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
    const err = document.getElementById("onbErr");
    const fail = m => { err.textContent = m; err.hidden = false; };
    if (name.length < 2) return fail("Choisis un pseudo d'au moins 2 caractères.");
    let group, code;
    if (ui.onbTab === "create") {
      group = (ui.draftGroup.trim() || "Les Cartographes");
      const ab = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; code = "MER-" + Array.from({ length: 4 }, () => ab[Math.floor(Math.random() * ab.length)]).join("");
    } else {
      code = ui.draftCode.trim().toUpperCase();
      if (!/^[A-Z0-9-]{4,8}$/.test(code)) return fail("Ce code n'est pas valide. Il ressemble à MER-4K7Q.");
      group = "Groupe " + code;
    }
    store.profile = { name, group, code, created: today(), pet: defaultPet(ui.draftPet) };
    if (ui.draftPhoto) store.profile.photo = ui.draftPhoto;
    store.profile.seen = unlockedIds(progress());
    save(); go("group");
  }
  if (e.target.id === "msgForm") {
    const inp = document.getElementById("msg"), text = inp.value.trim();
    if (!text) return;
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
  const d = new Date(), s = 86400 - (d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds());
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


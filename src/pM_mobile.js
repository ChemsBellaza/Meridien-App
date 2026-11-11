/* =================== CONFORT SMARTPHONE ===================
   1) Clavier : la hauteur du clavier (visualViewport) est exposée dans --kb ; l'écran de jeu et le chat s'arrêtent au-dessus,
      et le champ en cours de saisie est ramené dans la zone visible.
   2) Bouton retour (Android, geste iOS) : ferme la fenêtre / la confirmation, ou revient à l'écran précédent, sans quitter l'app.
   3) Vibrations légères (Android) sur bonne / mauvaise réponse, désactivables.
   4) Installation sur l'écran d'accueil (Android : bouton ; iPhone : mode d'emploi).
   Placé juste après pA_core.js : render() appelle syncBack() dès le chargement. */

/* ---------- 1) clavier ---------- */
(function () {
  const vv = window.visualViewport; if (!vv) return;
  let last = -1;
  const update = () => {
    const raw = Math.round(window.innerHeight - vv.height - vv.offsetTop);
    const kb = raw > 140 ? raw : 0; // en dessous : barre d'adresse qui bouge, pas un clavier
    if (kb === last) return; last = kb;
    document.documentElement.style.setProperty("--kb", kb + "px");
    document.documentElement.classList.toggle("kbopen", kb > 0);
    if (kb > 0) setTimeout(() => { const a = document.activeElement; if (a && a.matches && a.matches("input,textarea")) a.scrollIntoView({ block: "center", behavior: "auto" }); }, 80);
  };
  vv.addEventListener("resize", update); vv.addEventListener("scroll", update); update();
})();

/* ---------- 2) bouton retour ---------- */
let backPushed = false, backIgnore = false, backWant = false;
const backDepth = () => !!(typeof game !== "undefined" && game) || !!ui.sheet || !!ui.confirm || !!(store.profile && !["group", "onboard", "welcome"].includes(ui.view));
function pushBack() { try { history.pushState({ meridien: 1 }, ""); backPushed = true; } catch (e) { backPushed = false; } }
function syncBack() {
  const deep = backDepth();
  if (backIgnore) { backWant = deep; return; } // un retour programmatique est en cours : on conclut à son popstate
  if (deep && !backPushed) pushBack();
  else if (!deep && backPushed) { backPushed = false; backIgnore = true; try { history.back(); } catch (e) { backIgnore = false; } }
}
window.addEventListener("popstate", () => {
  if (backIgnore) { backIgnore = false; if (backWant) { backWant = false; pushBack(); } return; }
  backPushed = false; // l'entrée vient d'être consommée par le joueur
  if (ui.confirm) { ui.confirm = null; game ? renderGame() : render(); }
  else if (game) { const q = document.querySelector('[data-g="quit"]'); if (q) q.click(); else exitGame(); }
  else if (ui.sheet) { ui.sheet = false; render(); }
  else if (store.profile && !["group", "onboard", "welcome"].includes(ui.view)) { const b = document.querySelector('[data-act="back"]'); if (b) b.click(); else go("group"); }
  syncBack();
});

/* ---------- 3) vibrations ---------- */
const hapticsOn = () => !!navigator.vibrate && !(store.prefs && store.prefs.haptics === false);
function buzz(pattern) { try { if (hapticsOn() && !reduceMotion()) navigator.vibrate(pattern); } catch (e) {} }

/* ---------- 4) installation ---------- */
let deferredInstall = null;
const isStandalone = () => (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true;
const isIOS = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
window.addEventListener("beforeinstallprompt", e => { e.preventDefault(); deferredInstall = e; try { if (!game && ui.sheet) render(); } catch (err) {} });
window.addEventListener("appinstalled", () => { deferredInstall = null; try { if (!game) render(); } catch (err) {} });
function installNow() { if (!deferredInstall) return; const d = deferredInstall; deferredInstall = null; d.prompt(); Promise.resolve(d.userChoice).finally(() => { if (!game) render(); }); }

/* blocs du menu : vibrations et installation */
function mobileSheetBlocks() {
  let h = "";
  if (navigator.vibrate) h += `<div><div class="kicker" style="margin-bottom:6px">Vibrations</div><div class="seg light" role="group" aria-label="Vibrations">${[[true, "Oui"], [false, "Non"]].map(([v, l]) => `<button data-act="hapticpref" data-v="${v}" aria-pressed="${hapticsOn() === v}">${l}</button>`).join("")}</div></div>`;
  if (!isStandalone()) {
    if (deferredInstall) h += `<div><div class="kicker" style="margin-bottom:6px">Application</div><button class="btn ghost" data-act="install">Ajouter à l'écran d'accueil</button><p class="note">Elle s'ouvre en plein écran, comme une vraie application, et marche aussi sans connexion.</p></div>`;
    else if (isIOS()) h += `<div><div class="kicker" style="margin-bottom:6px">Application</div><p class="note">Pour l'ajouter à l'écran d'accueil : touche le bouton Partager de Safari (le carré avec une flèche), puis « Sur l'écran d'accueil ».</p></div>`;
  }
  return h;
}

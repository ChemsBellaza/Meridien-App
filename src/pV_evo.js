/* =================== ANIMATION D'ÉVOLUTION ===================
   Plein écran, ~4 s : le familier s'agite et s'illumine, flash blanc, rayons et ondes de lumière, puis la nouvelle forme se révèle
   avec une pluie d'étincelles. Déclenchée à la fin d'une partie qui fait évoluer le familier, et rejouable depuis la fiche du familier.
   Les styles sont écrits pour que l'état de base soit l'état FINAL : avec « réduire les animations » (règle globale), on voit directement le résultat. */
function evoState(pet, from, to, kind) { return { kind: kind || "stage", species: pet.species, stage: String(pet.stage || "1"), shiny: pet.shiny || "normal", bg: pet.bg || "type", from, to }; }

// trois sortes d'animations, même mise en scène : « stage » (évolution), « species » (nouveau familier : la silhouette se révèle), « shiny » (nouvelles couleurs)
function vEvo() {
  const e = ui.evo, S = SPECIES[e.species], col = TYPES[S.type].color, kind = e.kind || "stage";
  let before, after, aria, t1, t2;
  if (kind === "species") {
    const p0 = defaultPet(e.species), nm = S.names[0];
    before = petSVG(p0, { plain: true, sil: true }); after = petSVG(p0, { plain: true });
    aria = `Nouveau familier débloqué : ${nm}`; t1 = "Quoi ? Un mystérieux familier approche…"; t2 = `Nouveau familier : <b>${esc(nm)}</b> !`;
  } else if (kind === "shiny") {
    const base = { species: e.species, stage: e.stage, bg: e.bg }, nm = S.names[(+e.stage || 1) - 1];
    before = petSVG({ ...base, shiny: "normal" }, { plain: true }); after = petSVG({ ...base, shiny: "shiny" }, { plain: true });
    aria = `Couleurs chromatiques débloquées pour ${nm}`; t1 = `Quoi ? Les couleurs de ${esc(nm)} changent…`; t2 = `<b>${esc(nm)}</b> brille de nouvelles couleurs !`;
  } else {
    const old = { species: e.species, stage: String(e.from), shiny: e.shiny, bg: e.bg }, nw = { ...old, stage: String(e.to) }, from = S.names[e.from - 1], to = S.names[e.to - 1];
    before = petSVG(old, { plain: true }); after = petSVG(nw, { plain: true });
    aria = `Évolution : ${from} devient ${to}`; t1 = `Quoi ? ${esc(from)} réagit…`; t2 = `<b>${esc(from)}</b> évolue en <b>${esc(to)}</b> !`;
  }
  const sparks = Array.from({ length: 12 }, (_, i) => `<i class="evospark" style="--a:${i * 30}deg;--d:${92 + (i % 3) * 22}px;animation-delay:${2.4 + (i % 4) * .05}s"></i>`).join("");
  return `<div class="confirm evo"><div class="evobox" role="dialog" aria-label="${esc(aria)}" style="--c:${col}">
    <button class="linkbtn evoskip" data-act="evoclose">Passer</button>
    <div class="evostage">
      <div class="evorays"></div><div class="evoring"></div><div class="evoring r2"></div>
      <div class="evopet before">${before}</div>
      <div class="evopet after">${after}</div>
      <div class="evoflash"></div>${sparks}
    </div>
    <div class="evotxts"><p class="evotxt t1">${t1}</p><p class="evotxt t2" role="status">${t2}</p></div>
    <button class="btn evoclose" data-act="evoclose">Super !</button>
  </div></div>`;
}

// ouvre l'animation (une seule fois par partie ; voir renderGame et la fiche du familier)
function openEvo(pet, from, to) {
  if (ui.evo) return;
  ui.evo = evoState(pet, from, to);
  const S = SPECIES[pet.species];
  setTimeout(() => announce(`Évolution ! ${S.names[from - 1]} évolue en ${S.names[to - 1]}.`), 300);
  setTimeout(() => { if (ui.evo) buzz([30, 50, 30, 50, 160]); }, 2200); // vibration au moment du flash (Android)
}
// à la fin d'une partie : évolution, nouveau familier, nouvelles couleurs, l'un après l'autre (le fond n'a qu'une petite animation sur sa carte)
function openUnlockFx(g) {
  const pet = store.profile.pet, list = [], ev = g.newUnlocks.find(u => u.cat === "stage");
  if (ev) list.push(evoState(pet, +ev.it.id - 1, +ev.it.id));
  g.newUnlocks.filter(u => u.cat === "species").forEach(u => list.push(evoState({ ...pet, species: u.it.id, stage: "1" }, 1, 1, "species")));
  if (g.newUnlocks.some(u => u.cat === "shiny")) list.push(evoState(pet, 1, 1, "shiny"));
  if (!list.length || ui.evo) return;
  ui.evoQueue = list.slice(1); evoShow(list[0]);
}
function evoShow(st) {
  ui.evo = st;
  setTimeout(() => announce(st.kind === "species" ? "Nouveau familier débloqué !" : st.kind === "shiny" ? "Nouvelles couleurs débloquées !" : "Ton familier évolue !"), 300);
  setTimeout(() => { if (ui.evo === st) buzz([30, 50, 30, 50, 160]); }, 2200);
}
function evoNext() { ui.evo = null; const n = (ui.evoQueue || []).shift(); if (n) evoShow(n); }
/* =================== ANIMATION D'ÉVOLUTION ===================
   Plein écran, ~4 s : le familier s'agite et s'illumine, flash blanc, rayons et ondes de lumière, puis la nouvelle forme se révèle
   avec une pluie d'étincelles. Déclenchée à la fin d'une partie qui fait évoluer le familier, et rejouable depuis la fiche du familier.
   Les styles sont écrits pour que l'état de base soit l'état FINAL : avec « réduire les animations » (règle globale), on voit directement le résultat. */
function evoState(pet, from, to) { return { species: pet.species, shiny: pet.shiny || "normal", bg: pet.bg || "type", from, to }; }

function vEvo() {
  const e = ui.evo, S = SPECIES[e.species], old = { species: e.species, stage: String(e.from), shiny: e.shiny, bg: e.bg }, nw = { ...old, stage: String(e.to) };
  const from = S.names[e.from - 1], to = S.names[e.to - 1], col = TYPES[S.type].color;
  const sparks = Array.from({ length: 12 }, (_, i) => `<i class="evospark" style="--a:${i * 30}deg;--d:${92 + (i % 3) * 22}px;animation-delay:${2.4 + (i % 4) * .05}s"></i>`).join("");
  return `<div class="confirm evo"><div class="evobox" role="dialog" aria-label="Évolution : ${esc(from)} devient ${esc(to)}" style="--c:${col}">
    <button class="linkbtn evoskip" data-act="evoclose">Passer</button>
    <div class="evostage">
      <div class="evorays"></div><div class="evoring"></div><div class="evoring r2"></div>
      <div class="evopet before">${petSVG(old, { plain: true })}</div>
      <div class="evopet after">${petSVG(nw, { plain: true })}</div>
      <div class="evoflash"></div>${sparks}
    </div>
    <div class="evotxts"><p class="evotxt t1">Quoi ? ${esc(from)} réagit…</p><p class="evotxt t2" role="status"><b>${esc(from)}</b> évolue en <b>${esc(to)}</b> !</p></div>
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

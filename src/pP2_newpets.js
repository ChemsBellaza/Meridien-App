/* ============ NOUVEAUX FAMILIERS (en préparation, v42) ============
   Huit familiers à valider : Fennec (Désert), Tortue ninja (Ninja), Paon (Soleil), Aigle des vents (Air), Chouette (Nocturne),
   Faon fleuri (Terre), Dragon-perle (Dragon), Colibri (Vol). Ils NE SONT PAS dans le jeu : ils n'existent que si CONFIG.newPets est vrai
   ou si l'adresse contient « ?galerie » (page de présentation de tous les familiers). Même moteur de dessin que les dix premiers (p4_draw.js). */
const NEWPETS_ON = !!CONFIG.newPets || (typeof location !== "undefined" && /[?&]galerie/.test(location.search));
const heart = (x, y, s, c) => pth(`M${pt(x, y + s * .95)}C${pt(x - s * 1.35, y - s * .15)} ${pt(x - s * .6, y - s * 1.25)} ${pt(x, y - s * .4)}C${pt(x + s * .6, y - s * 1.25)} ${pt(x + s * 1.35, y - s * .15)} ${pt(x, y + s * .95)}Z`, c);
const bloom = (x, y, s, c, c2, n = 5) => Array.from({ length: n }, (_, i) => { const a = i / n * Math.PI * 2 - Math.PI / 2; return ell(x + s * Math.cos(a), y + s * Math.sin(a), s * .78, s * .78, c); }).join("") + ell(x, y, s * .72, s * .72, c2, 0, false);

if (NEWPETS_ON) {
  Object.assign(TYPES, {
    air: { label: "Air", color: "#7BD3EA" }, terre: { label: "Terre", color: "#C99A5B" }, soleil: { label: "Soleil", color: "#FFB627" },
    desert: { label: "Désert", color: "#E0A458" }, ninja: { label: "Ninja", color: "#4A5A9A" }, nocturne: { label: "Nocturne", color: "#4B3F8F" }
  });
  Object.assign(TYPE_ICO, {
    air: `<path d="M3 8h10a3 3 0 1 0-3-3h2a1 1 0 1 1 1 1H3zM3 13h14a3 3 0 1 1-3 3h2a1 1 0 1 0 1-1H3zM3 18h7v2H3z"/>`,
    terre: `<circle cx="12" cy="6.5" r="3.4"/><circle cx="6.5" cy="10.5" r="3.4"/><circle cx="17.5" cy="10.5" r="3.4"/><circle cx="8.5" cy="16" r="3.4"/><circle cx="15.5" cy="16" r="3.4"/>`,
    soleil: `<circle cx="12" cy="12" r="5"/><path d="M11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4z"/>`,
    desert: `<path d="M10 22V8a2 2 0 0 1 4 0v14zM6 12h3v5H6zM15 10h3v5h-3z"/>`,
    ninja: `<path d="M12 2l2.2 6.6L21 7l-4.5 5L21 17l-6.8-1.6L12 22l-2.2-6.6L3 17l4.5-5L3 7l6.8 1.6z"/>`,
    nocturne: `<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z"/>`
  });
  Object.assign(EVO_PAL, {
    air: ["#FFFFFF", "#CFF3FF", "#7BD3EA"], terre: ["#FFE0EC", "#FF8FB4", "#5CC24A"], soleil: ["#FFF3B0", "#FFC93C", "#FF8A2A"],
    desert: ["#FFF0C8", "#EBC27A", "#C9964A"], ninja: ["#FFC9C9", "#E5393B", "#4A5A9A"], nocturne: ["#E9E2F7", "#9A86C9", "#3A2E7A"]
  });
  // éléments propres aux nouveaux types (appelés par evoFX)
  window.EVO_EXTRA = {
    air: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => lin(`M${pt(60 + sd * (bx + 8), cy + 16)}Q${pt(60 + sd * (bx + 30), cy + 4)} ${pt(60 + sd * (bx + 22), cy - 14)}Q${pt(60 + sd * (bx + 14), cy - 8)} ${pt(60 + sd * (bx + 20), cy - 2)}`, big ? 3.4 : 2.4, C[0])).join(""), front: [[24, 40, 11, -40], [98, 46, 10, 35], [28, 84, 8, 20], [95, 80, 9, -20]].slice(0, big ? 4 : 2).map(([x, y, l, r]) => feather(x, y, l, 3, r, C[0], C[2])).join("") }),
    terre: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => leaf(60 + sd * (bx - 2), cy + 8, big ? 15 : 10, sd * 60, C[2], "#2E7D32")).join(""), front: [[24, 42, 3.4], [97, 50, 3], [30, 86, 3.2], [92, 82, 3.6]].slice(0, big ? 4 : 2).map(([x, y, s]) => heart(x, y, s, C[1])).join("") }),
    soleil: (C, big, bx, cy) => ({ back: "", front: [[24, 40, 4.6], [98, 44, 4.2], [28, 86, 3.8], [95, 84, 4.4]].slice(0, big ? 4 : 2).map(([x, y, s]) => star4(x, y, s, C[1])).join("") }),
    desert: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => lin(`M${pt(60 + sd * (bx + 6), cy + 22)}Q${pt(60 + sd * (bx + 24), cy + 6)} ${pt(60 + sd * (bx + 16), cy - 10)}`, big ? 3 : 2.2, C[1])).join(""), front: [[24, 44, 2.2], [98, 52, 2], [30, 86, 2.4], [94, 82, 2]].slice(0, big ? 4 : 3).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C[1]}" stroke="${DL}" stroke-width="1"/>`).join("") }),
    ninja: (C, big, bx, cy) => ({ back: [[-1, 14], [1, 18]].map(([sd, y]) => `<circle cx="${f1(60 + sd * (bx + 12))}" cy="${f1(cy + y)}" r="${big ? 7 : 5}" fill="#fff" fill-opacity=".5" stroke="${DL}" stroke-width="1.2"/>`).join(""), front: [[24, 40, 4.4], [98, 46, 4], [28, 86, 3.4], [95, 84, 3.8]].slice(0, big ? 4 : 2).map(([x, y, s]) => star4(x, y, s, C[1])).join("") }),
    nocturne: (C, big, bx, cy) => ({ back: "", front: pth(`M${pt(98, 22)}A9 9 0 1 0 ${pt(98, 39)}A7 7 0 1 1 ${pt(98, 22)}Z`, C[0]) + [[22, 40, 3.4], [100, 62, 3], [26, 84, 3]].slice(0, big ? 3 : 2).map(([x, y, s]) => star4(x, y, s, C[0])).join("") })
  };

  PAL.fennec = { main: "#F4D6A0", shade: "#D9AE6E", belly: "#FFF3DC", dark: "#5A3A1E", inner: "#F6B9A5", cloth: "#E8704A", clothS: "#B5482A", gold: "#FFC93C", gem: "#E5393B", cheek: "#FF9F8A" };
  PAL.tortueninja = { main: "#6FA8A0", shade: "#4E8A83", belly: "#E8F3EA", dark: "#1E2A3A", shell: "#2D3E66", shellS: "#1F2C4D", shellL: "#6F86C8", scarf: "#E5393B", scarfS: "#B12428", metal: "#D9DEE8", cheek: "#FFB3A8" };
  PAL.paon = { main: "#FFC94D", shade: "#E89A22", belly: "#FFF0C2", dark: "#5A2E0E", tail: "#FF9F1C", tailB: "#FFB93D", ocR: "#FFE066", ocM: "#E8401C", ocC: "#5A2E0E", ray: "#FFD93D", gold: "#FFE066", beak: "#E8701C", cheek: "#FF9F7A" };
  PAL.aigleair = { main: "#EEF6FB", shade: "#C5D8E6", belly: "#FFFFFF", dark: "#2D4A63", beak: "#FFC857", beakS: "#D99A1E", wing: "#9ADCF2", wingS: "#5BB8DE", gust: "#CFF3FF", gustS: "#7BD3EA", cap: "#5BB8DE", cheek: "#FFB3A0" };
  PAL.chouette = { main: "#7B6BB8", shade: "#5B4C96", belly: "#E9E2F7", face: "#FFF3DA", dark: "#1E1740", wing: "#5B4C96", wingL: "#8E7DD0", star: "#FFE27A", beak: "#F29A3A", gold: "#FFD45C", cheek: "#E9A0C0" };
  PAL.faon = { main: "#E9B27A", shade: "#CC8F55", belly: "#FFF1DD", dark: "#4B2C17", spot: "#FFF6E8", pink: "#FF8FB4", pinkS: "#E5608F", yellow: "#FFD84A", leaf: "#5CC24A", leafS: "#3C9131", antler: "#B77A4A", cheek: "#FF9FB8" };
  PAL.dragonperle = { main: "#3CC8A0", shade: "#22A07C", belly: "#F4F0C8", dark: "#0E3D33", gold: "#FFC93C", goldS: "#D9961A", mane: "#7DE8D0", maneS: "#43B8A0", pearl: "#F4FBFF", pearlS: "#A9D8F5", cheek: "#FFB3A0" };
  PAL.colibri = { main: "#3DD1A8", shade: "#1E9E80", belly: "#FFF3E0", dark: "#173A33", wing: "#7BE0C9", wingS: "#3DB89A", gorget: "#FF5FA8", crest: "#FF7AB6", crestS: "#D94A8C", bloom: "#FF7AB6", bloomC: "#FFD84A", cheek: "#FFB0C8" };
  Object.assign(SHINY, {
    fennec: { main: "#F6B2A0", shade: "#DB8A78", cloth: "#7B6BE0", clothS: "#4E3FB0", gold: "#9BE8FF" },
    tortueninja: { main: "#F1EDE2", shade: "#CFC8B4", shell: "#C9A24A", shellS: "#8F6F22", shellL: "#F4DC8E", scarf: "#2BB6D9", scarfS: "#1B84A3" },
    paon: { main: "#C9D6F2", shade: "#9FB2DB", tail: "#7C8FD6", tailB: "#97A8E6", ocR: "#E8EEFF", ocM: "#FF9F1C", ray: "#E8EEFF", gold: "#E8EEFF" },
    aigleair: { main: "#FBE7C2", shade: "#E4C690", wing: "#F7B38A", wingS: "#D98756", cap: "#E05A5A", gust: "#FFE3CF", gustS: "#F7B38A" },
    chouette: { main: "#F2F0F8", shade: "#CFCAE0", wing: "#BDB6DA", wingL: "#E4E0F2", belly: "#FFFFFF", star: "#FFC93C" },
    faon: { main: "#FFFFFF", shade: "#E6E1EC", spot: "#F3EAFB", antler: "#E3C98A", pink: "#FFD36B", pinkS: "#E5A93A", yellow: "#B79CFF" },
    dragonperle: { main: "#E5483E", shade: "#B3302B", belly: "#FFE9B0", mane: "#FFB84D", maneS: "#E88A1A", dark: "#4A1410" },
    colibri: { main: "#7C8CFF", shade: "#5565D9", wing: "#B8C2FF", wingS: "#8794EE", gorget: "#FFD84A", crest: "#FFD84A", crestS: "#D9A81A" }
  });

  Object.assign(DRAW, {
    fennec(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, EL = hr * (.98 + st * .1), tx = 92 + st * 3, ty = bcy - by * .1 - st * 5;
      const ear = sd => { const H = hr * (1.7 + st * .1), A = [60 + sd * hr * .24, hy - hr * .8], B = [60 + sd * hr * 1.0, hy - hr * .18], T = [60 + sd * hr * (.98 + st * .04), hy - H], C1 = [60 + sd * hr * .3, hy - H * .8], C2 = [60 + sd * hr * 1.28, hy - hr * .95];
        return pth(`M${pt(...A)}Q${pt(...C1)} ${pt(...T)}Q${pt(...C2)} ${pt(...B)}Z`, P.main) + pth(`M${pt(60 + sd * hr * .45, hy - hr * .72)}Q${pt(60 + sd * hr * .52, hy - H * .72)} ${pt(60 + sd * hr * .95, hy - H * .92)}Q${pt(60 + sd * hr * 1.08, hy - hr * .85)} ${pt(60 + sd * hr * .88, hy - hr * .36)}Z`, P.inner, false) + (st === 2 ? lin(`M${pt(60 + sd * hr * .7, hy - hr * .75)}Q${pt(60 + sd * hr * .76, hy - H * .6)} ${pt(60 + sd * hr * .95, hy - H * .86)}`, 1.8, P.gold) : ""); };
      const tail = pth(`M${pt(66, bcy + by * .62)}C${pt(88, bcy + by * .95)} ${pt(tx + 6, bcy + by * .2)} ${pt(tx, ty)}C${pt(tx - 11, ty + 8)} ${pt(80, bcy - 6)} ${pt(66, bcy - by * .05)}Z`, P.main) + ell(tx - 2, ty + 5, 5.5, 7, P.dark, 28, false);
      const scarf = st ? pth(`M${pt(60 - bx * .92, bcy - by * .66)}Q${pt(60, bcy - by * .3)} ${pt(60 + bx * .92, bcy - by * .66)}L${pt(60 + bx * .86, bcy - by * .4)}Q${pt(60, bcy - by * .05)} ${pt(60 - bx * .86, bcy - by * .4)}Z`, P.cloth) + (st === 2 ? pth(`M${pt(60 + bx * .45, bcy - by * .2)}L${pt(60 + bx * .8, bcy + by * .55)}L${pt(60 + bx * .52, bcy + by * .42)}L${pt(60 + bx * .3, bcy + by * .58)}Z`, P.clothS) : "") : "";
      const top = st === 2 ? lin(`M${pt(60 - hr * .55, hy - hr * .58)}Q${pt(60, hy - hr * 1.0)} ${pt(60 + hr * .55, hy - hr * .58)}`, 3.2, P.gold) + ell(60, hy - hr * .8, 3, 3.5, P.gem) : lin(`M${pt(60, hy - hr * .88)}Q${pt(65, hy - hr * 1.08)} ${pt(60, hy - hr * 1.22)}`, 2.2) + (st === 1 ? ell(60, hy - hr * 1.25, 2.4, 2.4, P.gold) : "");
      return {
        back: tail, bodyFront: scarf, headBack: ear(-1) + ear(1),
        headDeco: ell(60, hy + hr * .44, hr * .44, hr * .3, P.belly, 0, false) + pth(`M${pt(57.4, hy + hr * .27)}L${pt(62.6, hy + hr * .27)}L${pt(60, hy + hr * .39)}Z`, P.dark, false) + [-1, 1].map(sd => lin(`M${pt(60 + sd * hr * .52, hy + hr * .26)}L${pt(60 + sd * hr * .7, hy + hr * .56)}`, 1.7, P.dark)).join(""),
        headTop: top
      };
    },
    tortueninja(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, W = bx + 11, top = bcy - by * .95, base = bcy + by * .8;
      let back = "";
      if (st === 2) back += `<g transform="rotate(-32 60 ${f1(bcy)})">${lin(`M${pt(60, bcy - 4)}L${pt(60, bcy - 56)}`, 5.6)}${lin(`M${pt(60, bcy - 4)}L${pt(60, bcy - 56)}`, 3, P.metal)}${pth(`M${pt(57.4, bcy - 54)}h5.2v-9h-5.2Z`, P.scarfS)}${lin(`M${pt(54, bcy - 54)}h12`, 2.4)}</g>`;
      back += pth(`M${pt(60 - W, base)}C${pt(60 - W - 2, top + 4)} ${pt(60 - W * .55, top - 6)} ${pt(60, top - 6)}C${pt(60 + W * .55, top - 6)} ${pt(60 + W + 2, top + 4)} ${pt(60 + W, base)}Z`, P.shell)
        + pth(`M${pt(60 - W - 1, base - 1)}Q${pt(60, base + 6)} ${pt(60 + W + 1, base - 1)}L${pt(60 + W - 1, base + 4)}Q${pt(60, base + 11)} ${pt(60 - W + 1, base + 4)}Z`, P.shellS)
        + `<path d="M${pt(60 - W * .55, bcy - by * .15)}A${f1(W * .58)} ${f1(by * .55)} 0 1 1 ${pt(60 + W * .5, bcy - by * .32)}" fill="none" stroke="${P.shellL}" stroke-width="2.4" stroke-linecap="round"/>`
        + (st ? star4(60, top + 14, 5.5 + st, P.metal) : "");
      const scarf = st ? pth(`M${pt(60 - bx * .92, bcy - by * .66)}Q${pt(60, bcy - by * .32)} ${pt(60 + bx * .92, bcy - by * .66)}L${pt(60 + bx * .86, bcy - by * .42)}Q${pt(60, bcy - by * .08)} ${pt(60 - bx * .86, bcy - by * .42)}Z`, P.scarf) + pth(`M${pt(60 + bx * .7, bcy - by * .5)}L${pt(60 + bx * (1.35 + st * .3), bcy - by * (.1 + st * .05))}L${pt(60 + bx * (1.15 + st * .25), bcy + by * .12)}L${pt(60 + bx * .55, bcy - by * .25)}Z`, P.scarfS) : "";
      const band = pth(`M${pt(60 - hr * .97, hy - hr * .18)}Q${pt(60, hy - hr * .58)} ${pt(60 + hr * .97, hy - hr * .18)}L${pt(60 + hr * .94, hy + hr * .04)}Q${pt(60, hy - hr * .36)} ${pt(60 - hr * .94, hy + hr * .04)}Z`, P.scarf)
        + pth(`M${pt(60 - hr * .24, hy - hr * .5)}h${f1(hr * .48)}v${f1(hr * .24)}h${f1(-hr * .48)}Z`, P.metal) + lin(`M${pt(60 - hr * .1, hy - hr * .4)}l${f1(hr * .1)} ${f1(-hr * .06)} ${f1(hr * .1)} ${f1(hr * .06)}`, 1.4)
        + pth(`M${pt(60 + hr * .9, hy - hr * .1)}L${pt(60 + hr * 1.45, hy - hr * .35)}L${pt(60 + hr * 1.3, hy - hr * .05)}Z`, P.scarf) + pth(`M${pt(60 + hr * .9, hy - hr * .05)}L${pt(60 + hr * 1.4, hy + hr * .25)}L${pt(60 + hr * 1.1, hy + hr * .25)}Z`, P.scarfS);
      return { back, bodyStyle: "plastron", bodyFront: scarf, headTop: band, headDeco: ell(60, hy + hr * .3, 2, 1.4, P.dark, 0, false) + ell(60 - hr * .12, hy + hr * .3, 1.2, 1, P.dark, 0, false) };
    },
    paon(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, n = [5, 9, 13][st], span = [112, 156, 200][st], len = [40, 44, 48][st], cyb = bcy - by * .15, w = 7 + st;
      let fan = "";
      for (let i = 0; i < n; i++) { const a = -span / 2 + i * span / (n - 1), col = i % 2 ? P.tailB : P.tail;
        fan += `<g transform="translate(60 ${f1(cyb)}) rotate(${f1(a)})">` + pth(`M0 0C${f1(w)} ${f1(-len * .3)} ${f1(w * .9)} ${f1(-len * .75)} 0 ${f1(-len)}C${f1(-w * .9)} ${f1(-len * .75)} ${f1(-w)} ${f1(-len * .3)} 0 0Z`, col) + ell(0, -len * .76, w * .6, w * .76, P.ocR) + ell(0, -len * .76, w * .36, w * .5, P.ocM, 0, false) + ell(0, -len * .76, w * .16, w * .22, P.ocC, 0, false) + `</g>`; }
      const crest = [-1, 0, 1].map(i => lin(`M${pt(60 + i * 4, hy - hr * .86)}Q${pt(60 + i * 9, hy - hr * 1.1)} ${pt(60 + i * (8 + st * 3), hy - hr * (1.3 + st * .1))}`, 2, P.dark) + ell(60 + i * (8 + st * 3), hy - hr * (1.33 + st * .1), 2.8, 2.8, P.gold)).join("");
      return {
        back: fan, feet: P.beak,
        bodyFront: st ? ell(60, bcy + by * .12, 5, 5, P.ray, 0, true) + [0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = k * Math.PI / 4; return lin(`M${pt(60 + 7 * Math.cos(a), bcy + by * .12 + 7 * Math.sin(a))}L${pt(60 + 10.5 * Math.cos(a), bcy + by * .12 + 10.5 * Math.sin(a))}`, 1.8, P.shade); }).join("") : "",
        headBack: st === 2 ? spikes(60, hy, hr * 1.0, hr * 1.28, 12, P.ray, .1) : "",
        headDeco: pth(`M${pt(60 - hr * .2, hy + hr * .2)}L${pt(60 + hr * .2, hy + hr * .2)}L${pt(60, hy + hr * .5)}Z`, P.beak), headTop: crest, noMouth: true
      };
    },
    aigleair(P, R, st) {
      const { hr, hy, bx, by, bcy } = R;
      let back = "";
      if (st === 2) for (let i = 0; i < 6; i++) { const y = bcy + by * .95 - i * 10.5, rx = 36 - i * 4.6, d = `M${pt(60 - rx, y)}Q${pt(60, y + 6)} ${pt(60 + rx, y)}`; back += lin(d, 5.4) + lin(d, 3.2, i % 2 ? P.gust : P.gustS); }
      back += [-22, 0, 22].map(a => feather(60 + a * .2, bcy + by * .75, 12 + st * 3, 4, 180 + a, P.wing, P.wingS)).join("");
      if (st >= 1) back += [-1, 1].map(sd => [0, 1, 2].map(i => feather(60 + sd * bx * .7, bcy - by * .3, (16 + st * 10) - i * 4, 5 + st, sd * (35 + i * 22 + st * 6), i % 2 ? P.wingS : P.wing, P.wingS)).join("")).join("");
      const cap = pth(`M${pt(60 - hr * .78, hy - hr * .3)}Q${pt(60 - hr * .7, hy - hr * .98)} ${pt(60, hy - hr * 1.0)}Q${pt(60 + hr * .7, hy - hr * .98)} ${pt(60 + hr * .78, hy - hr * .3)}Q${pt(60, hy - hr * .62)} ${pt(60 - hr * .78, hy - hr * .3)}Z`, P.cap)
        + [-1, 1].map(sd => feather(60 + sd * hr * .8, hy - hr * .5, 10 + st * 4, 4 + st * .8, sd * 72, "#fff", P.wingS) + (st === 2 ? feather(60 + sd * hr * .78, hy - hr * .62, 8, 3.4, sd * 40, "#fff", P.wingS) : "")).join("");
      return {
        back, feet: P.beak,
        front: st ? [-1, 1].map(sd => feather(60 + sd * bx * .62, 104, 8 + st * 2, 3, sd * 112, "#fff", P.wingS)).join("") : "",
        headDeco: ell(60, hy + hr * .45, hr * .5, hr * .32, P.belly, 0, false) + pth(`M${pt(60 - hr * .3, hy + hr * .14)}Q${pt(60, hy - hr * .04)} ${pt(60 + hr * .3, hy + hr * .14)}Q${pt(60 + hr * .22, hy + hr * .62)} ${pt(60 + hr * .04, hy + hr * .86)}Q${pt(60, hy + hr * .8)} ${pt(60 - hr * .06, hy + hr * .84)}Q${pt(60 - hr * .22, hy + hr * .62)} ${pt(60 - hr * .3, hy + hr * .14)}Z`, P.beak) + lin(`M${pt(60 - hr * .2, hy + hr * .34)}Q${pt(60, hy + hr * .42)} ${pt(60 + hr * .2, hy + hr * .34)}`, 1.2, P.beakS),
        headTop: cap, noMouth: true
      };
    },
    chouette(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, ex = hr * .42, ey = hy + hr * .1, er = hr * (st === 0 ? .23 : .21), fr = hr * .4;
      const tuft = sd => pth(`M${pt(60 + sd * hr * .85, hy - hr * .45)}L${pt(60 + sd * hr * (.62 + .08 * st), hy - hr * (1.12 + .12 * st))}L${pt(60 + sd * hr * .3, hy - hr * .84)}Z`, P.main);
      let back = "";
      if (st === 2) back += [-1, 1].map(sd => { const pts = [[34, -20], [48, -38], [62, -24], [56, -6]];
        return pth(`M${pt(60 + sd * bx * .6, bcy - by * .3)}Q${pt(60 + sd * 52, bcy - 40)} ${pt(60 + sd * 58, bcy - 10)}Q${pt(60 + sd * 48, bcy + 6)} ${pt(60 + sd * bx * .7, bcy + by * .4)}Z`, P.wing)
          + lin(pts.map(([x, y], i) => (i ? "L" : "M") + pt(60 + sd * x, bcy + y + 14)).join(""), 1.1, P.star) + pts.map(([x, y]) => star4(60 + sd * x, bcy + y + 14, 2.4, P.star)).join(""); }).join("");
      return {
        back, feet: P.beak,
        bodyFront: [0, 1, 2].map(r => [-1, 0, 1].map(c => lin(`M${pt(60 + c * 8 - 3.6, bcy + by * (.1 + r * .3))}Q${pt(60 + c * 8, bcy + by * (.1 + r * .3) + 4.4)} ${pt(60 + c * 8 + 3.6, bcy + by * (.1 + r * .3))}`, 1.5, P.shade)).join("")).join(""),
        arms: [-1, 1].map(sd => ell(60 + sd * bx * .92, bcy - by * .08, 5.5 + st, 10 + st, P.wing, sd * 12) + (st ? star4(60 + sd * bx * .92, bcy - by * .08, 2.2, P.star) : "")).join(""),
        headBack: tuft(-1) + tuft(1),
        headDeco: [-1, 1].map(sd => ell(60 + sd * ex, ey, fr, fr * 1.05, P.face, 0, false)).join("") + pth(`M${pt(57.6, hy + hr * .24)}L${pt(62.4, hy + hr * .24)}L${pt(60, hy + hr * .42)}Z`, P.beak),
        headTop: (st === 2 ? [-1, 1].map(sd => `<circle cx="${f1(60 + sd * ex)}" cy="${f1(ey)}" r="${f1(er * 1.55)}" fill="none" stroke="${P.gold}" stroke-width="2.2"/>`).join("") + lin(`M${pt(60 - ex + er * 1.55, ey)}Q${pt(60, ey - 3)} ${pt(60 + ex - er * 1.55, ey)}`, 2, P.gold) : "") + (st < 2 ? star4(60, hy - hr * .62, 3.4 + st, P.star) : star4(60, hy - hr * .86, 3.6, P.star)),
        noMouth: true
      };
    },
    faon(P, R, st) {
      const { hr, hy, bx, by, bcy } = R;
      const ear = sd => ell(60 + sd * hr * .96, hy - hr * .35, hr * .22, hr * .4, P.main, sd * 50) + ell(60 + sd * hr * .96, hy - hr * .33, hr * .11, hr * .26, P.pink, sd * 50, false);
      const br = d => lin(d, 5.6) + lin(d, 3.2, P.antler);
      let top = "";
      if (st === 0) top = ell(60, hy - hr * .95, 3, 4.2, P.pink) + leaf(60, hy - hr * .82, 5.4, -42, P.leaf, P.leafS) + leaf(60, hy - hr * .82, 5.4, 42, P.leaf, P.leafS);
      else [-1, 1].forEach(sd => {
        const tip = [60 + sd * hr * .5, hy - hr * (1.55 + .22 * st)], t1 = [60 + sd * hr * .95, hy - hr * (1.35 + .1 * st)], t2 = [60 + sd * hr * .12, hy - hr * (1.2 + .2 * st)];
        top += br(`M${pt(60 + sd * hr * .32, hy - hr * .85)}Q${pt(60 + sd * hr * .58, hy - hr * 1.2)} ${pt(...tip)}`) + br(`M${pt(60 + sd * hr * .5, hy - hr * 1.12)}Q${pt(60 + sd * hr * .78, hy - hr * 1.15)} ${pt(...t1)}`)
          + (st === 2 ? br(`M${pt(60 + sd * hr * .44, hy - hr * 1.3)}Q${pt(60 + sd * hr * .3, hy - hr * 1.36)} ${pt(...t2)}`) : "")
          + bloom(tip[0], tip[1], 3 + st, P.pink, P.yellow) + bloom(t1[0], t1[1], 2.6 + st * .6, st === 2 ? "#FFFFFF" : P.pink, P.yellow) + (st === 2 ? bloom(t2[0], t2[1], 2.6, P.pink, P.yellow) : ""); });
      const spots = [[-9, -4], [6, -8], [0, 2], [-11, 5], [10, 6]].map(([x, y]) => ell(60 + x * bx / 15, bcy + y * by / 14, 2.2, 3, P.spot, 25, false)).join("");
      const collar = st ? [-1, -.5, 0, .5, 1].map(i => bloom(60 + i * bx * .7, bcy - by * (.66 - Math.abs(i) * .12), 2.6, i % 1 ? P.pink : "#FFFFFF", P.yellow)).join("") : "";
      const hearts = [[26, 34, 3.6], [96, 40, 3.2], [20, 70, 3]].slice(0, [2, 3, 3][st]).concat(st === 2 ? [[100, 74, 3.6], [34, 14, 2.8], [88, 16, 3]] : []).map(([x, y, s]) => heart(x, y, s, P.pink)).join("");
      const vines = st === 2 ? [-1, 1].map(sd => lin(`M${pt(60 + sd * bx * .5, 108)}q${f1(sd * 3)} -5 0 -8t0 -8`, 2.4, P.leafS) + leaf(60 + sd * (bx * .5 + 3), 98, 4, sd * 70, P.leaf, P.leafS)).join("") : "";
      return {
        back: st === 2 ? [-1, 1].map(sd => leaf(60 + sd * bx * .8, bcy + by * .4, 14, sd * 60, P.leaf, P.leafS)).join("") : "",
        bodyFront: spots + collar + vines, headBack: ear(-1) + ear(1),
        headDeco: ell(60, hy + hr * .44, hr * .4, hr * .28, P.belly, 0, false) + ell(60, hy + hr * .3, 3.2, 2.4, P.dark, 0, false) + [-1, 1].map(sd => ell(60 + sd * hr * .3, hy - hr * .42, 1.9, 2.8, P.spot, sd * 20, false)).join(""),
        headTop: top, front: hearts
      };
    },
    dragonperle(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, tx = 94 + st * 2, tipY = bcy - by * (.9 + .2 * st), td = `M${pt(66, bcy + by * .62)}C${pt(94, bcy + by * .95)} ${pt(78, bcy - by * .5)} ${pt(tx + 3, tipY)}`;
      const horn = sd => { const s = [.8, 1.05, 1.3][st]; return pth(`M${pt(60 + sd * hr * .38, hy - hr * .74)}Q${pt(60 + sd * hr * .52, hy - hr * (1.0 + .1 * st))} ${pt(60 + sd * hr * (.72 + .05 * st), hy - hr * (1.2 + .12 * st))}Q${pt(60 + sd * hr * .62, hy - hr * .94)} ${pt(60 + sd * hr * .6, hy - hr * .7)}Z`, P.gold) + (st === 2 ? pth(`M${pt(60 + sd * hr * .5, hy - hr * .98)}Q${pt(60 + sd * hr * .85, hy - hr * 1.02)} ${pt(60 + sd * hr * .95, hy - hr * .86)}Q${pt(60 + sd * hr * .7, hy - hr * .88)} ${pt(60 + sd * hr * .56, hy - hr * .82)}Z`, P.gold) : ""); };
      const whisk = sd => lin(`M${pt(60 + sd * hr * .38, hy + hr * .5)}Q${pt(60 + sd * hr * .95, hy + hr * .75)} ${pt(60 + sd * hr * (1.1 + st * .16), hy + hr * (.35 + st * .12))}${st ? `Q${pt(60 + sd * hr * (1.3 + st * .16), hy + hr * .15)} ${pt(60 + sd * hr * (1.2 + st * .18), hy - hr * .02)}` : ""}`, 1.9, P.gold);
      const px = 100 - st * 3, py = 40 - st * 3, pr = 6 + st * 1.6;
      const pearl = `<circle cx="${px}" cy="${py}" r="${f1(pr + 3.5)}" fill="${P.pearlS}" fill-opacity=".35"/>` + `<circle cx="${px}" cy="${py}" r="${f1(pr)}" fill="${P.pearl}" ${OL()}/><circle cx="${f1(px - pr * .3)}" cy="${f1(py - pr * .3)}" r="${f1(pr * .28)}" fill="#fff"/>`;
      const clouds = st === 2 ? [[26, 110, 6], [34, 108, 7], [44, 110, 6], [76, 110, 6], [86, 108, 7], [94, 110, 6]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".85"/>`).join("") + [[20, 52], [100, 70]].map(([x, y]) => bolt(x, y, 5, P.gold)).join("") : "";
      return {
        back: lin(td, 10.6) + lin(td, 6.4, P.main) + flame(tx + 3, tipY, 3 + st * 1.4, P.mane, P.maneS),
        bodyFront: [0, 1, 2].map(i => lin(`M${pt(60 - bx * (.5 - i * .04), bcy + by * (.05 + i * .26))}Q${pt(60, bcy + by * (.18 + i * .26))} ${pt(60 + bx * (.5 - i * .04), bcy + by * (.05 + i * .26))}`, 1.4, P.goldS)).join(""),
        headBack: (st ? spikes(60, hy + hr * .1, hr * 1.0, hr * (1.22 + .08 * st), 9, P.mane, .15) : [-1, 1].map(sd => pth(`M${pt(60 + sd * hr * .85, hy)}L${pt(60 + sd * hr * 1.3, hy - hr * .2)}L${pt(60 + sd * hr * 1.1, hy + hr * .3)}Z`, P.mane)).join("")),
        headDeco: ell(60, hy + hr * .42, hr * .4, hr * .28, P.belly, 0, false) + [-1, 1].map(sd => ell(60 + sd * hr * .12, hy + hr * .34, 1.5, 1.2, P.dark, 0, false)).join("") + whisk(-1) + whisk(1),
        headTop: horn(-1) + horn(1), front: clouds + pearl
      };
    },
    colibri(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, W = 14 + st * 8;
      const wing = sd => { const x = 60 + sd * (bx + 6), y = bcy - by * .5, rot = sd * (42 + st * 6); return ell(x, y, W * .46, W, P.wing, rot) + ell(x + sd * 1.5, y - 1, W * .28, W * .72, P.wingS, rot, false) + lin(`M${pt(x + sd * W * .75, y - W * 1.05)}Q${pt(x + sd * W * 1.05, y - W * .5)} ${pt(x + sd * W * .9, y + W * .1)}`, 1.4, P.wing); };
      const tail = [-1, 1].map(sd => feather(60 + sd * 3, bcy + by * .85, 12 + st * 7, 3.4, 180 + sd * (10 + st * 3), P.wing, P.wingS)).join("");
      const bloomF = bloom(60 + hr * 1.55, hy + hr * .78, 3.8 + st * .6, P.bloom, P.bloomC);
      return {
        back: wing(-1) + wing(1) + tail,
        bodyFront: ell(60, bcy - by * .42, bx * .72, by * .4, P.gorget, 0, false),
        headDeco: pth(`M${pt(60 + hr * .12, hy + hr * .26)}L${pt(60 + hr * 1.42, hy + hr * .66)}L${pt(60 + hr * .12, hy + hr * .42)}Z`, P.dark),
        headTop: [-1, 0, 1].map(i => feather(60 + i * 4, hy - hr * .88, 7 + st * 3, 2.6, i * 22, P.crest, P.crestS)).join(""),
        front: bloomF + (st ? [[24, 30, 3], [100, 26, 3.4]].map(([x, y, s]) => star4(x, y, s, "#fff")).join("") : ""), noMouth: true
      };
    }
  });

  const NP = (names, type, num, bg, traits, quote, dex, ex, lines, need, story) => ({ names, name: names[0], kind: "Type " + TYPES[type].label, type, num, bg, traits, quote, dex, ex, lines, need, story });
  Object.assign(SPECIES, {
    fennec: NP(["Dunette", "Mirafennec", "Saharaja"], "desert", 11, "saffron", ["Attentive", "Débrouillarde"], "Écoute : même le silence parle.",
      ["Ses énormes oreilles entendent l'eau sous le sable. Elle entend aussi les secrets, mais ne les répète jamais.", "Une écharpe de sable flotte derrière lui. Il trouve l'oasis en écoutant, pas en courant.", "Un cercle d'or sur le front, une oasis dans le cœur : il guide les voyageurs perdus jusqu'au puits."],
      { eye: "round", iris: "#8A4B1F", lid: [0, 0], mouth: "smile" },
      { hello: ["Chut… j'entends le défi arriver.", "Le désert est calme. Parfait pour réfléchir."], good: ["J'avais tout entendu d'avance.", "Un vrai mirage… de réussite !"], mid: ["Je tends l'oreille : on peut mieux faire.", "Une goutte de plus et c'est l'oasis."], bad: ["Même le désert a ses tempêtes.", "J'écouterai mieux demain."] }, { k: "streak", v: 10 }),
    tortueninja: NP(["Carapin", "Shinotortue", "Kagetortue"], "ninja", 12, "night", ["Disciplinée", "Silencieuse"], "On gagne en silence.",
      ["Elle s'entraîne la nuit, sans témoin, à répéter le même geste mille fois. Lentement. Sans jamais le rater.", "Son écharpe rouge ne fait aucun bruit. Sa carapace, elle, a déjà vu mille entraînements.", "Ombre du groupe, jamais devant, toujours là. Elle n'a pas besoin qu'on la félicite."],
      { eye: "round", iris: "#2D3E66", lid: [.3, .3], mouth: "calm" },
      { hello: ["…Chut. Le défi est là.", "Je me suis entraînée toute la nuit."], good: ["Tu m'as entendue ? Non. Parfait.", "Un geste. Un seul. Sans bruit."], mid: ["Un geste de plus et c'était parfait.", "Je recommence. Doucement."], bad: ["Personne ne m'a vue rater. Personne.", "La discipline se répare avec la discipline."] }, { k: "wins", v: 10 }),
    paon: NP(["Paonnet", "Solipaon", "Héliopaon"], "soleil", 13, "saffron", ["Optimiste", "Rayonnant"], "Briller, c'est éclairer les autres.",
      ["Sa queue ne s'ouvre pas encore : il est timide. Mais chaque plume cache déjà un petit soleil.", "Sa roue de rayons s'ouvre quand quelqu'un doute. Il ne la montre jamais pour être admiré.", "Un soleil entier sur le dos. Il éclaire les nuits des joueurs qui veulent abandonner."],
      { eye: "round", iris: "#E8701C", lid: [0, 0], mouth: "none" },
      { hello: ["Debout là-haut ! Nouveau jour, nouveau jeu !", "Je déplie mes plumes pour toi."], good: ["Ça brille ! On éclaire tout le classement !", "Quelle roue magnifique !"], mid: ["Un petit nuage, rien de grave.", "Ma roue est à moitié ouverte : demain, en grand."], bad: ["La nuit passe. La lumière revient à 14 h 30.", "Même un soleil se couche, pour mieux se lever."] }, { k: "podium", v: 1 }),
    aigleair: NP(["Brisaiglon", "Aquilon", "Tornaigle"], "air", 14, "sky", ["Voyageur", "Bavard"], "Un savoir qui ne voyage pas s'éteint.",
      ["Un casque ailé trop grand pour sa tête et des sandales à ailettes : il livre déjà les messages du vent.", "Il apprend chaque message par cœur avant de partir, puis il attend la réponse. L'écoute fait les bons messagers.", "Une tornade douce l'accompagne : là où il passe, les savoirs dispersés se rejoignent."],
      { eye: "sharp", iris: "#F2C230", mouth: "none" },
      { hello: ["Message pour toi : le défi est arrivé !", "Le vent m'a soufflé la question du jour."], good: ["Livraison express, mission accomplie !", "Ça, c'est un message bien reçu !"], mid: ["Message reçu… à moitié. Je le relis.", "Le vent tourne, on remet les voiles."], bad: ["Le vent a emporté ma réponse. Demain, je l'attache.", "Une bourrasque, rien de plus."] }, { k: "gems", v: 600 }),
    chouette: NP(["Hibouton", "Chouplume", "Athénuit"], "nocturne", 15, "night", ["Posée", "Observatrice"], "Douter, c'est commencer à voir.",
      ["Elle refuse de dormir de peur de manquer une question. Une petite étoile brille sur son front.", "Elle vole sans bruit : pour entendre, il faut se taire. Ses ailes se couvrent de points de lumière.", "Ses ailes sont une carte du ciel : chaque constellation est une question qu'on a fini par résoudre."],
      { eye: "round", iris: "#FFD45C", lid: [0, 0], mouth: "none", spark: true },
      { hello: ["Hou ! J'ai veillé pour toi.", "La nuit porte conseil. Le jour aussi."], good: ["Hou-là ! Tout s'éclaire.", "Une étoile de plus au tableau !"], mid: ["Je relis mes étoiles et je recommence.", "À moitié éclairé : on cherche le reste."], bad: ["Même la nuit a ses nuages. Je reste éveillée.", "Douter, c'est déjà avancer."] }, { k: "plays", v: 20 }),
    faon: NP(["Pétalou", "Floribiche", "Édencerf"], "terre", 16, "pine", ["Tendre", "Têtu"], "Tout ce qu'on arrose finit par fleurir.",
      ["Un bourgeon pousse sur sa tête. Il n'ose plus marcher : il a peur d'écraser les fleurs qui le suivent.", "Ses bois fleurissent et ses pétales en forme de cœur apaisent ceux qui viennent de perdre.", "Une forêt entière le suit. La terre rend toujours ce qu'on lui donne, et mille fois plus."],
      { eye: "round", iris: "#6B4226", lid: [0, 0], mouth: "smile", spark: true },
      { hello: ["J'ai semé une question rien que pour toi.", "Bonjour ! Le jardin t'attend."], good: ["Quelle belle récolte ! Je t'offre une fleur.", "Ça pousse, ça pousse !"], mid: ["Belles racines. Ça poussera.", "Un peu d'eau et de patience."], bad: ["Même les fleurs ont besoin d'un peu d'orage. Câlin ?", "On replante demain, ensemble."] }, { k: "games", v: 40 }),
    dragonperle: NP(["Écaillon", "Dracolong", "Perlodragon"], "dragon", 17, "cobalt", ["Mystérieux", "Curieux"], "La bonne question vaut mille réponses.",
      ["Il est né d'une perle tombée au fond d'un fleuve. Il y cache ses questions, de peur qu'on se moque.", "Sa perle brille plus fort quand il la partage. Garder une question pour soi, c'est la laisser s'éteindre.", "Il sait presque tout, mais ne donne jamais de réponse : il pose des questions. On n'oublie pas ce qu'on a trouvé seul."],
      { eye: "round", iris: "#1E9E80", lid: [.1, .1], mouth: "smile" },
      { hello: ["Je garde une perle de savoir. Tu me poses la tienne ?", "Une question, ça se mérite."], good: ["La perle brille ! Voilà la sagesse.", "Tu as trouvé tout seul. Magnifique."], mid: ["Tu as les écailles de la persévérance.", "Bonne question. Réponse… demain."], bad: ["Un dragon ne perd jamais : il apprend très lentement.", "Pose-toi la bonne question."] }, { k: "champ", v: 1 }),
    colibri: NP(["Colibrin", "Colibrillant", "Vibracolibri"], "vol", 18, "sky", ["Curieux", "Attentif"], "Je ne me pose jamais, mais je ne perds rien.",
      ["Il ne se pose jamais : s'arrêter lui fait peur. Pourtant il sait rester immobile en plein vol.", "Il butine tous les savoirs, un par un, pour goûter le meilleur nectar.", "Ses ailes battent si vite qu'on ne les voit plus. Il fait du sur-place pour mieux observer."],
      { eye: "round", iris: "#FF5FA8", lid: [0, 0], mouth: "none", spark: true },
      { hello: ["Bzzz ! Je survole le défi.", "Rien ne m'échappe, même en vol."], good: ["Bzzz-ravo ! Du nectar de victoire !", "Plus rapide que mes ailes !"], mid: ["Je butine encore un peu.", "Presque. Je fais du sur-place et je retente."], bad: ["Un faux pas, un coup d'aile et ça repart.", "Je reviens plus vif."] }, { k: "games", v: 25 })
  });
}

/* ---------- galerie : tous les familiers, trois stades et la variante chromatique (adresse ?galerie) ---------- */
function vGalerie() {
  const keys = Object.keys(SPECIES), css = `<style>.gal{max-width:980px;margin:0 auto;padding:18px 14px 60px;color:var(--ink);font-family:inherit}.gal h1{font-family:var(--fd);font-size:26px;margin:0 0 4px}.gal .sub{color:var(--ink-2);font-weight:700;margin:0 0 18px}
    .gcardx{background:var(--card);border-radius:22px;padding:14px;margin-bottom:16px;box-shadow:0 4px 0 var(--lip)}.gcardx.new{outline:3px solid #FFC24A}.gh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}.gh b{font-family:var(--fd);font-size:18px}
    .gtiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.gt{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;font-size:12px;text-align:center}.gt .tile{width:100%;aspect-ratio:1;border-radius:18px;overflow:hidden}.gt svg{display:block;width:100%;height:100%}
    .gq{font-style:italic;color:var(--ink-2);font-weight:700;margin:8px 0 2px}.gs{margin:6px 0 0;padding-left:18px;font-size:13.5px;font-weight:600;display:flex;flex-direction:column;gap:3px}.newtag{background:#FFC24A;color:#1C1C1E;border-radius:999px;padding:2px 10px;font-weight:900;font-size:12px}@media(max-width:560px){.gtiles{grid-template-columns:repeat(2,1fr)}}</style>`;
  const isNew = k => (SPECIES[k].num || 0) > 10;
  const card = k => { const S = SPECIES[k], tile = (st, shiny, lab) => `<div class="gt"><span class="tile">${petSVG({ species: k, stage: String(st), shiny: shiny ? "shiny" : "normal", bg: "type" })}</span>${esc(lab)}</div>`;
    return `<section class="gcardx ${isNew(k) ? "new" : ""}"><div class="gh"><b>${esc(S.names.join(" → "))}</b>${typeBadge(S.type, 13)}${isNew(k) ? `<span class="newtag">Nouveau</span>` : ""}<span class="muted">${(S.traits || []).map(esc).join(" · ")}</span></div>
      <div class="gtiles">${tile(1, false, S.names[0] + " · stade 1")}${tile(2, false, S.names[1] + " · stade 2")}${tile(3, false, S.names[2] + " · stade 3")}${tile(3, true, "Chromatique · stade 3")}</div>
      <p class="gq">« ${esc(S.quote)} »</p><ul class="gs">${S.dex.map(d => `<li>${esc(d)}</li>`).join("")}</ul></section>`; };
  return css + `<div class="gal"><h1>Galerie des familiers</h1><p class="sub">${keys.length} familiers, 3 stades chacun et une variante chromatique. Les familiers marqués « Nouveau » sont des propositions à valider.</p>${keys.map(card).join("")}</div>`;
}

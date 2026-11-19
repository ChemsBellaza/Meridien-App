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
    desert: { label: "Désert", color: "#E0A458" }, ninja: { label: "Ninja", color: "#4A5A9A" }, nocturne: { label: "Nocturne", color: "#4B3F8F" }, mythe: { label: "Mythe", color: "#C8372D" }, or: { label: "Or", color: "#E3A72F" }
  });
  Object.assign(TYPE_ICO, {
    air: `<path d="M3 8h10a3 3 0 1 0-3-3h2a1 1 0 1 1 1 1H3zM3 13h14a3 3 0 1 1-3 3h2a1 1 0 1 0 1-1H3zM3 18h7v2H3z"/>`,
    terre: `<circle cx="12" cy="6.5" r="3.4"/><circle cx="6.5" cy="10.5" r="3.4"/><circle cx="17.5" cy="10.5" r="3.4"/><circle cx="8.5" cy="16" r="3.4"/><circle cx="15.5" cy="16" r="3.4"/>`,
    soleil: `<circle cx="12" cy="12" r="5"/><path d="M11 1h2v4h-2zM11 19h2v4h-2zM1 11h4v2H1zM19 11h4v2h-4z"/>`,
    desert: `<path d="M10 22V8a2 2 0 0 1 4 0v14zM6 12h3v5H6zM15 10h3v5h-3z"/>`,
    ninja: `<path d="M12 2l2.2 6.6L21 7l-4.5 5L21 17l-6.8-1.6L12 22l-2.2-6.6L3 17l4.5-5L3 7l6.8 1.6z"/>`,
    nocturne: `<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z"/>`,
    mythe: `<path d="M6 19a4 4 0 0 1 0-8 5 5 0 0 1 9.6-1.4A4.5 4.5 0 0 1 17 19z"/>`,
    or: `<path d="M3 19V8l5 4 4-7 4 7 5-4v11z"/>`
  });
  Object.assign(EVO_PAL, {
    air: ["#FFFFFF", "#CFF3FF", "#7BD3EA"], terre: ["#FFE0EC", "#FF8FB4", "#5CC24A"], soleil: ["#FFF3B0", "#FFC93C", "#FF8A2A"],
    desert: ["#FFF0C8", "#EBC27A", "#C9964A"], ninja: ["#FFC9C9", "#E5393B", "#4A5A9A"], nocturne: ["#E9E2F7", "#9A86C9", "#3A2E7A"], mythe: ["#FFE9A8", "#FFC93C", "#D93A2B"], or: ["#FFF6C8", "#FFD24A", "#C9921A"]
  });
  // éléments propres aux nouveaux types (appelés par evoFX)
  window.EVO_EXTRA = {
    air: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => lin(`M${pt(60 + sd * (bx + 8), cy + 16)}Q${pt(60 + sd * (bx + 30), cy + 4)} ${pt(60 + sd * (bx + 22), cy - 14)}Q${pt(60 + sd * (bx + 14), cy - 8)} ${pt(60 + sd * (bx + 20), cy - 2)}`, big ? 3.4 : 2.4, C[0])).join(""), front: [[24, 40, 11, -40], [98, 46, 10, 35], [28, 84, 8, 20], [95, 80, 9, -20]].slice(0, big ? 4 : 2).map(([x, y, l, r]) => feather(x, y, l, 3, r, C[0], C[2])).join("") }),
    terre: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => leaf(60 + sd * (bx - 2), cy + 8, big ? 15 : 10, sd * 60, C[2], "#2E7D32")).join(""), front: [[24, 42, 3.4], [97, 50, 3], [30, 86, 3.2], [92, 82, 3.6]].slice(0, big ? 4 : 2).map(([x, y, s]) => heart(x, y, s, C[1])).join("") }),
    soleil: (C, big, bx, cy) => ({ back: "", front: [[24, 40, 4.6], [98, 44, 4.2], [28, 86, 3.8], [95, 84, 4.4]].slice(0, big ? 4 : 2).map(([x, y, s]) => star4(x, y, s, C[1])).join("") }),
    desert: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => lin(`M${pt(60 + sd * (bx + 6), cy + 22)}Q${pt(60 + sd * (bx + 24), cy + 6)} ${pt(60 + sd * (bx + 16), cy - 10)}`, big ? 3 : 2.2, C[1])).join(""), front: [[24, 44, 2.2], [98, 52, 2], [30, 86, 2.4], [94, 82, 2]].slice(0, big ? 4 : 3).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${C[1]}" stroke="${DL}" stroke-width="1"/>`).join("") }),
    ninja: (C, big, bx, cy) => ({ back: [[-1, 14], [1, 18]].map(([sd, y]) => `<circle cx="${f1(60 + sd * (bx + 12))}" cy="${f1(cy + y)}" r="${big ? 7 : 5}" fill="#fff" fill-opacity=".5" stroke="${DL}" stroke-width="1.2"/>`).join(""), front: [[24, 40, 4.4], [98, 46, 4], [28, 86, 3.4], [95, 84, 3.8]].slice(0, big ? 4 : 2).map(([x, y, s]) => star4(x, y, s, C[1])).join("") }),
    mythe: (C, big, bx, cy) => ({ back: [-1, 1].map(sd => `<circle cx="${f1(60 + sd * (bx + 14))}" cy="${f1(cy + 16)}" r="${big ? 8 : 6}" fill="#fff" fill-opacity=".8" stroke="${DL}" stroke-width="1.2"/>`).join(""), front: [[24, 40, 4.4], [98, 46, 4], [28, 86, 3.4], [95, 84, 3.8]].slice(0, big ? 4 : 2).map(([x, y, s]) => star4(x, y, s, C[1])).join("") }),
    or: (C, big, bx, cy) => ({ back: "", front: [[24, 42, 3.4], [98, 50, 3.2], [28, 86, 3.6], [95, 84, 3]].slice(0, big ? 4 : 2).map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 1.4}" fill="${C[1]}" stroke="${DL}" stroke-width="1.1"/><circle cx="${x - 1}" cy="${y - 1}" r="${r * .35}" fill="#fff"/>`).join("") + [[20, 20, 3.4], [100, 26, 3]].map(([x, y, s]) => star4(x, y, s, "#fff")).join("") }),
    nocturne: (C, big, bx, cy) => ({ back: "", front: pth(`M${pt(98, 22)}A9 9 0 1 0 ${pt(98, 39)}A7 7 0 1 1 ${pt(98, 22)}Z`, C[0]) + [[22, 40, 3.4], [100, 62, 3], [26, 84, 3]].slice(0, big ? 3 : 2).map(([x, y, s]) => star4(x, y, s, C[0])).join("") })
  };

  PAL.fennec = { main: "#F4D6A0", shade: "#D9AE6E", belly: "#FFF3DC", dark: "#5A3A1E", inner: "#F6B9A5", cloth: "#E8704A", clothS: "#B5482A", gold: "#FFC93C", gem: "#E5393B", cheek: "#FF9F8A" };
  PAL.tortueninja = { main: "#6BBF59", shade: "#4C9A3E", belly: "#F2E9B8", dark: "#1E2A3A", shell: "#7B5B35", shellS: "#5A3F22", shellL: "#A9824E", scarf: "#E5393B", scarfS: "#B12428", metal: "#D9DEE8", gold: "#FFC93C", wrap: "#F3E3C0", cheek: "#FFB3A8" };
  PAL.singe = { main: "#B8793A", shade: "#8F5A24", belly: "#F6D9A8", face: "#F9DDB5", dark: "#3B2312", gold: "#FFC93C", goldS: "#D9961A", red: "#D93A2B", redS: "#A5261B", feather: "#E8401C", cheek: "#FF9F7A" };
  PAL.pandapo = { main: "#FFFFFF", shade: "#D9DAE3", belly: "#FFFFFF", dark: "#2A2A36", vest: "#E8A317", trim: "#3A2A16", beltR: "#D93A2B", beltB: "#2A2A36", wrap: "#F3E3C0", gold: "#FFD45C", bamboo: "#6CBF4A", cheek: "#FFB3C0" };
  PAL.lionor = { main: "#F4BC4F", shade: "#D79A2B", belly: "#FFEBB8", dark: "#4E2C14", mane: "#F2C230", maneS: "#C9921A", maneL: "#FFE27A", gold: "#FFD24A", jewel: "#E5393B", turq: "#2BC4B0", cheek: "#FF9F7A" };
  PAL.paon = { main: "#FFC94D", shade: "#E89A22", belly: "#FFF0C2", dark: "#5A2E0E", tail: "#FF9F1C", tailB: "#FFB93D", ocR: "#FFE066", ocM: "#E8401C", ocC: "#5A2E0E", ray: "#FFD93D", gold: "#FFE066", beak: "#E8701C", cheek: "#FF9F7A" };
  PAL.aigleair = { main: "#EEF6FB", shade: "#C5D8E6", belly: "#FFFFFF", dark: "#2D4A63", beak: "#FFC857", beakS: "#D99A1E", wing: "#9ADCF2", wingS: "#5BB8DE", gust: "#CFF3FF", gustS: "#7BD3EA", cap: "#5BB8DE", cheek: "#FFB3A0" };
  PAL.chouette = { main: "#7B6BB8", shade: "#5B4C96", belly: "#E9E2F7", face: "#FFF3DA", dark: "#1E1740", wing: "#5B4C96", wingL: "#8E7DD0", star: "#FFE27A", beak: "#F29A3A", gold: "#FFD45C", cheek: "#E9A0C0" };
  PAL.faon = { main: "#E9B27A", shade: "#CC8F55", belly: "#FFF1DD", dark: "#4B2C17", spot: "#FFF6E8", pink: "#FF8FB4", pinkS: "#E5608F", yellow: "#FFD84A", leaf: "#5CC24A", leafS: "#3C9131", antler: "#B77A4A", cheek: "#FF9FB8" };
  PAL.dragonperle = { main: "#3CC8A0", shade: "#22A07C", belly: "#F4F0C8", dark: "#0E3D33", gold: "#FFC93C", goldS: "#D9961A", mane: "#7DE8D0", maneS: "#43B8A0", pearl: "#F4FBFF", pearlS: "#A9D8F5", cheek: "#FFB3A0" };
  PAL.colibri = { main: "#3DD1A8", shade: "#1E9E80", belly: "#FFF3E0", dark: "#173A33", wing: "#7BE0C9", wingS: "#3DB89A", gorget: "#FF5FA8", crest: "#FF7AB6", crestS: "#D94A8C", bloom: "#FF7AB6", bloomC: "#FFD84A", cheek: "#FFB0C8" };
  Object.assign(SHINY, {
    fennec: { main: "#F6B2A0", shade: "#DB8A78", cloth: "#7B6BE0", clothS: "#4E3FB0", gold: "#9BE8FF" },
    tortueninja: { main: "#F1EDE2", shade: "#CFC8B4", belly: "#FFFFFF", shell: "#C9A24A", shellS: "#8F6F22", shellL: "#F4DC8E", scarf: "#2BB6D9", scarfS: "#1B84A3" },
    singe: { main: "#F2F0EA", shade: "#CFCAC0", face: "#FFFFFF", red: "#2BB6D9", redS: "#1B84A3", feather: "#2BB6D9" },
    pandapo: { main: "#F6E6CF", shade: "#DCC6A6", dark: "#7A4426", vest: "#2E7DE0", beltR: "#1D5AB0" },
    lionor: { main: "#E4ECF7", shade: "#B8C6DB", belly: "#FFFFFF", mane: "#DDE4EE", maneS: "#A9B6C8", maneL: "#F4F8FF", gold: "#E8EEF8" },
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
      const { hr, hy, bx, by, bcy } = R, W = bx + 11, top = bcy - by * .95, base = bcy + by * .8, ex = hr * .42, ey = hy + hr * .1, er = hr * (st === 0 ? .23 : .21);
      let back = "";
      // deux katanas croisés dans le dos (les poignées dépassent au-dessus des épaules)
      if (st >= 1) back += [-1, 1].map(sd => `<g transform="rotate(${sd * (26 + st * 3)} 60 ${f1(bcy)})">${lin(`M${pt(60, bcy + 6)}L${pt(60, bcy - 54 - st * 4)}`, 6.4)}${lin(`M${pt(60, bcy + 6)}L${pt(60, bcy - 54 - st * 4)}`, 3.6, P.metal)}${pth(`M${pt(56.6, bcy - 52 - st * 4)}h6.8v-12h-6.8Z`, P.scarfS)}${lin(`M${pt(52, bcy - 52 - st * 4)}h16`, 3, P.gold)}</g>`).join("");
      // carapace brune à écailles, ceinture à boucle
      back += pth(`M${pt(60 - W, base)}C${pt(60 - W - 2, top + 4)} ${pt(60 - W * .55, top - 6)} ${pt(60, top - 6)}C${pt(60 + W * .55, top - 6)} ${pt(60 + W + 2, top + 4)} ${pt(60 + W, base)}Z`, P.shell)
        + pth(`M${pt(60 - W - 1, base - 1)}Q${pt(60, base + 6)} ${pt(60 + W + 1, base - 1)}L${pt(60 + W - 1, base + 4)}Q${pt(60, base + 11)} ${pt(60 - W + 1, base + 4)}Z`, P.shellS)
        + lin(`M${pt(60, top - 4)}V${f1(base - 2)}M${pt(60 - W * .62, top + 8)}Q${pt(60 - W * .55, bcy)} ${pt(60 - W * .8, base - 4)}M${pt(60 + W * .62, top + 8)}Q${pt(60 + W * .55, bcy)} ${pt(60 + W * .8, base - 4)}M${pt(60 - W * .95, bcy - by * .1)}H${f1(60 + W * .95)}`, 1.7, P.shellL);
      const belt = pth(`M${pt(60 - bx * .98, bcy + by * .28)}Q${pt(60, bcy + by * .5)} ${pt(60 + bx * .98, bcy + by * .28)}L${pt(60 + bx * .96, bcy + by * .52)}Q${pt(60, bcy + by * .74)} ${pt(60 - bx * .96, bcy + by * .52)}Z`, P.scarfS) + star4(60, bcy + by * .52, 4.6, P.metal)
        + (st >= 1 ? pth(`M${pt(60 + bx * .5, bcy + by * .55)}l5 9 3-6 4 7 1-11Z`, P.scarf) : "");
      const wraps = [-1, 1].map(sd => ell(60 + sd * bx * .9, bcy - by * .12, 4.4, 7.8, P.main, sd * -28) + ell(60 + sd * bx * .97, bcy + by * .12, 5.4, 3, P.wrap, sd * -28) + (st ? ell(60 + sd * bx * .86, bcy - by * .38, 4.4, 2.8, P.wrap, sd * -28) : "")).join("");
      // masque de ninja sur les yeux, avec deux longs pans qui flottent
      const mask = pth(`M${pt(60 - hr * 1.0, hy - hr * .14)}Q${pt(60, hy - hr * .46)} ${pt(60 + hr * 1.0, hy - hr * .14)}L${pt(60 + hr * .97, hy + hr * .34)}Q${pt(60, hy + hr * .1)} ${pt(60 - hr * .97, hy + hr * .34)}Z`, P.scarf)
        + [-1, 1].map(sd => ell(60 + sd * ex, ey, er * 1.55, er * 1.3, "#FFFFFF", sd * 8, false)).join("");
      const tails = pth(`M${pt(60 + hr * .92, hy - hr * .02)}L${pt(60 + hr * (1.5 + st * .18), hy - hr * .42)}L${pt(60 + hr * (1.34 + st * .14), hy - hr * .08)}Z`, P.scarf) + pth(`M${pt(60 + hr * .92, hy + hr * .1)}L${pt(60 + hr * (1.46 + st * .18), hy + hr * .32)}L${pt(60 + hr * (1.16 + st * .1), hy + hr * .3)}Z`, P.scarfS);
      return {
        back, bodyStyle: "plastron", bodyFront: belt, arms: wraps,
        headBack: st === 2 ? pth(`M${pt(60 - hr * 1.05, hy + hr * .1)}Q${pt(60, hy - hr * 1.2)} ${pt(60 + hr * 1.05, hy + hr * .1)}Q${pt(60, hy - hr * .2)} ${pt(60 - hr * 1.05, hy + hr * .1)}Z`, P.dark) : "",
        headDeco: mask, headTop: tails + (st === 2 ? star4(60, hy - hr * .78, 4.2, P.metal) : "")
      };
    },
    singe(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, tx = 97 + st * 2, ty = bcy - by * (.15 + st * .22), td = `M${pt(66, bcy + by * .62)}C${pt(98, bcy + by * .95)} ${pt(82, bcy - by * 1.1)} ${pt(tx, ty)}`;
      const ear = sd => ell(60 + sd * hr * .98, hy - hr * .02, hr * .3, hr * .32, P.main) + ell(60 + sd * hr * .98, hy, hr * .17, hr * .19, P.face, 0, false);
      let back = lin(td, 9.6) + lin(td, 5.6, P.main) + ell(tx, ty, 3.6, 3.6, P.goldS) ;
      if (st >= 1) back += `<g transform="translate(${[0, 30, 32][st]} 6) rotate(${[0, -8, -10][st]} 60 ${f1(bcy)})">${lin(`M${pt(60, bcy + 60)}V${f1(bcy - 60)}`, 7.6)}${lin(`M${pt(60, bcy + 60)}V${f1(bcy - 60)}`, 4.6, P.red)}${pth(`M${pt(56.2, bcy - 60)}h7.6v8h-7.6Z`, P.gold)}${pth(`M${pt(56.2, bcy + 52)}h7.6v8h-7.6Z`, P.gold)}</g>`;
      // nuage porteur sous les pieds
      if (st >= 1) back += [[34, 110, 8], [48, 108, 9], [62, 111, 9.5], [76, 108, 9], [88, 110, 8]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" fill-opacity=".92"/>`).join("") + lin(`M${pt(40, 108)}q4 -4 8 0M${pt(70, 109)}q4 -4 8 0`, 1.6, "#BCD4EC");
      const armor = st >= 1 ? pth(`M${pt(60 - bx * .88, bcy - by * .6)}Q${pt(60, bcy - by * .22)} ${pt(60 + bx * .88, bcy - by * .6)}L${pt(60 + bx * .78, bcy + by * .45)}Q${pt(60, bcy + by * .72)} ${pt(60 - bx * .78, bcy + by * .45)}Z`, P.red) + lin(`M${pt(60 - bx * .78, bcy + by * .28)}Q${pt(60, bcy + by * .55)} ${pt(60 + bx * .78, bcy + by * .28)}`, 3, P.gold) + [-1, 0, 1].map(i => ell(60 + i * bx * .3, bcy - by * .02, 2.2, 2.2, P.gold)).join("") + lin(`M${pt(60 - bx * .5, bcy - by * .5)}Q${pt(60, bcy - by * .25)} ${pt(60 + bx * .5, bcy - by * .5)}`, 2.4, P.gold) : "";
      const fl = (sd, len, rot) => feather(60 + sd * hr * .46, hy - hr * .66, len, 4.6, sd * rot, P.feather, P.redS);
      const crown = lin(`M${pt(60 - hr * .88, hy - hr * .26)}Q${pt(60, hy - hr * .8)} ${pt(60 + hr * .88, hy - hr * .26)}`, 6.2) + lin(`M${pt(60 - hr * .88, hy - hr * .26)}Q${pt(60, hy - hr * .8)} ${pt(60 + hr * .88, hy - hr * .26)}`, 4, P.gold) + ell(60, hy - hr * .6, 3, 3.2, P.red)
        + fl(-1, 10 + st * 8, 18 + st * 6) + fl(1, 10 + st * 8, 18 + st * 6);
      return {
        back, bodyFront: armor,
        arms: st === 2 ? [-1, 1].map(sd => ell(60 + sd * bx * .88, bcy - by * .12, 4.2, 7.5, P.main, sd * -28) + ell(60 + sd * bx * .9, bcy - by * .5, 6.4, 5, P.gold, sd * -20)).join("") : null,
        headBack: ear(-1) + ear(1),
        headDeco: ell(60 - hr * .3, hy + hr * .08, hr * .36, hr * .38, P.face, 0, false) + ell(60 + hr * .3, hy + hr * .08, hr * .36, hr * .38, P.face, 0, false) + ell(60, hy + hr * .42, hr * .5, hr * .36, P.face, 0, false) + ell(60, hy + hr * .3, 3, 2.2, P.dark, 0, false),
        headTop: crown
      };
    },
    pandapo(P, R, st) {
      const { hr, hy, bx, by, bcy } = R, ex = hr * .42, ey = hy + hr * .12;
      const fist = sd => ell(60 + sd * bx * 1.12, bcy - by * (.55 + st * .12), 6.6 + st * .6, 6.6 + st * .6, P.dark) + ell(60 + sd * bx * 1.12, bcy - by * (.55 + st * .12), 6.6 + st * .6, 2.4, P.wrap, 0, false);
      const vest = pth(`M${pt(60 - bx * .96, bcy - by * .5)}Q${pt(60 - bx * .3, bcy - by * .42)} ${pt(60 - 4, bcy - by * .2)}L${pt(60 - bx * .5, bcy + by * .62)}Q${pt(60 - bx * .96, bcy + by * .5)} ${pt(60 - bx * 1.02, bcy)}Z`, P.vest) + pth(`M${pt(60 + bx * .96, bcy - by * .5)}Q${pt(60 + bx * .3, bcy - by * .42)} ${pt(60 + 4, bcy - by * .2)}L${pt(60 + bx * .5, bcy + by * .62)}Q${pt(60 + bx * .96, bcy + by * .5)} ${pt(60 + bx * 1.02, bcy)}Z`, P.vest)
        + lin(`M${pt(60 - 4, bcy - by * .2)}L${pt(60 - bx * .5, bcy + by * .62)}M${pt(60 + 4, bcy - by * .2)}L${pt(60 + bx * .5, bcy + by * .62)}`, 2.6, P.trim)
        + (st >= 1 ? pth(`M${pt(60 - bx * .5, bcy + by * .62)}L${pt(60 + bx * .5, bcy + by * .62)}L${pt(60 + bx * .46, bcy + by * .9)}Q${pt(60, bcy + by * 1.02)} ${pt(60 - bx * .46, bcy + by * .9)}Z`, P.dark) : "");
      const belt = pth(`M${pt(60 - bx * .78, bcy + by * .48)}Q${pt(60, bcy + by * .74)} ${pt(60 + bx * .78, bcy + by * .48)}L${pt(60 + bx * .76, bcy + by * .66)}Q${pt(60, bcy + by * .92)} ${pt(60 - bx * .76, bcy + by * .66)}Z`, st >= 1 ? P.beltB : P.beltR)
        + pth(`M${pt(60 + 2, bcy + by * .7)}l-3 11 5-3 3 9 2-10Z`, st >= 1 ? P.beltB : P.beltR);
      const emblem = st === 2 ? lin(`M${pt(60, bcy - by * .02)}m-5 0a5 5 0 1 1 5 5a2.6 2.6 0 1 1 -2.6 -2.6`, 2.2, P.gold) + ell(60 + 5, bcy - by * .02 + 5, 1.4, 1.4, P.gold, 0, false) : "";
      const brows = [-1, 1].map(sd => lin(`M${pt(60 + sd * ex - sd * hr * .26, hy - hr * .16)}L${pt(60 + sd * ex + sd * hr * .24, hy - hr * .27)}`, 3, P.dark)).join("");
      return {
        back: st === 2 ? `<g transform="rotate(32 60 ${bcy})">${lin(`M${pt(56.5, bcy - 52)}h7v102h-7Z`, 2)}${pth(`M${pt(56.5, bcy - 52)}h7v102h-7Z`, P.bamboo)}${[-38, -12, 14, 40].map(d => lin(`M${pt(56.5, bcy + d)}h7`, 2)).join("")}</g>` : "",
        limb: P.dark,
        bodyFront: vest + belt + emblem,
        arms: [-1, 1].map(fist).join(""),
        headBack: [-1, 1].map(sd => ell(60 + sd * hr * .76, hy - hr * .7, hr * .27, hr * .27, P.dark)).join(""),
        headDeco: [-1, 1].map(sd => ell(60 + sd * ex, ey, hr * .27, hr * .33, P.dark, sd * -25, false)).join("") + ell(60, hy + hr * .32, 3.2, 2.3, P.dark, 0, false),
        headTop: brows + (st === 2 ? lin(`M${pt(60 - hr * .5, hy - hr * .92)}Q${pt(60, hy - hr * 1.12)} ${pt(60 + hr * .5, hy - hr * .92)}`, 2.6, P.gold) : "")
      };
    },
    lionor(P, R, st) {
      const { hr, hy, bx, by, bcy } = R;
      const tail = lin(`M${pt(66, bcy + by * .72)}Q${pt(90, bcy + by * .9)} ${pt(94, bcy - by * .1)}`, 6.5) + lin(`M${pt(66, bcy + by * .72)}Q${pt(90, bcy + by * .9)} ${pt(94, bcy - by * .1)}`, 3.6, P.main) + ell(94, bcy - by * .2, 4.8, 6, P.mane);
      const mane = st === 0 ? spikes(60, hy - hr * .55, hr * .36, hr * .66, 6, P.mane, Math.PI) : spikes(60, hy + hr * .05, hr * (1.05 + st * .05), hr * (1.32 + st * .12), 11 + st * 2, P.mane, .1) + (st === 2 ? spikes(60, hy + hr * .05, hr * 1.0, hr * 1.2, 13, P.maneL, .35) : "");
      const gems = st >= 1 ? [0, 1, 2, 3, 4, 5].map(i => { const a = -Math.PI * .08 + i * Math.PI / 5.2 + Math.PI * .95; return `<circle cx="${f1(60 + hr * (1.18 + st * .06) * Math.cos(a))}" cy="${f1(hy + hr * .05 + hr * (1.18 + st * .06) * Math.sin(a))}" r="${f1(1.6 + st * .5)}" fill="${i % 2 ? P.jewel : P.turq}" stroke="${DL}" stroke-width="1"/>`; }).join("") : "";
      const crown = st === 0 ? ell(60 + hr * .55, hy - hr * .72, 2.6, 2.6, P.mane) : pth(`M${pt(60 - hr * .52, hy - hr * .62)}L${pt(60 - hr * .6, hy - hr * (1.0 + st * .12))}L${pt(60 - hr * .26, hy - hr * .82)}L${pt(60, hy - hr * (1.18 + st * .16))}L${pt(60 + hr * .26, hy - hr * .82)}L${pt(60 + hr * .6, hy - hr * (1.0 + st * .12))}L${pt(60 + hr * .52, hy - hr * .62)}Q${pt(60, hy - hr * .5)} ${pt(60 - hr * .52, hy - hr * .62)}Z`, P.gold) + ell(60, hy - hr * .74, 2.6, 2.6, P.jewel);
      return {
        back: tail,
        bodyFront: st === 2 ? [-1, 1].map(sd => ell(60 + sd * bx * .86, bcy - by * .58, 6.5, 4.6, P.gold, sd * -25)).join("") + lin(`M${pt(60 - 7, bcy - by * .22)}q7 5 14 0`, 1.6, P.shade) : (st === 1 ? lin(`M${pt(60 - 7, bcy - by * .22)}q7 5 14 0`, 1.6, P.shade) : ""),
        headBack: mane + [-1, 1].map(sd => ell(60 + sd * hr * .78, hy - hr * .62, hr * .2, hr * .2, P.main)).join("") + gems,
        headDeco: ell(60, hy + hr * .44, hr * .42, hr * .3, P.belly, 0, false) + pth(`M${pt(57, hy + hr * .26)}L${pt(63, hy + hr * .26)}L${pt(60, hy + hr * .38)}Z`, P.dark, false),
        headTop: crown
      };
    },    paon(P, R, st) {
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
      ["Un masque rouge, deux poings bandés et une carapace qui a déjà tout vu. Elle s'entraîne la nuit, mille fois le même geste.", "Deux katanas croisés dans le dos, une ceinture à étoile : elle disparaît dans un nuage de fumée avant la fin de ta phrase.", "Capuche noire, longs pans de masque au vent. On ne l'entend jamais arriver, mais on retrouve toujours la bonne réponse."],
      { eye: "round", iris: "#1E2A3A", lid: [.3, .3], mouth: "calm" },
      { hello: ["…Chut. Le défi est là.", "Je me suis entraînée toute la nuit."], good: ["Tu m'as entendue ? Non. Parfait.", "Un geste. Un seul. Sans bruit."], mid: ["Un geste de plus et c'était parfait.", "Je recommence. Doucement."], bad: ["Personne ne m'a vue rater. Personne.", "La discipline se répare avec la discipline."] }, { k: "wins", v: 10 }),
    singe: NP(["Ouki", "Sunwu", "Wukong"], "mythe", 19, "vermil", ["Espiègle", "Intrépide"], "Le Ciel n'est qu'un toit à escalader.",
      ["Il est né d'un œuf de pierre. Il a déjà escaladé trois montagnes pour voir ce qu'il y avait derrière.", "Son bâton grandit ou rétrécit selon son humeur. Son humeur, elle, grandit plus vite que lui.", "Grand Sage égal au Ciel, il rit de tout, sauf de ceux qui trichent."],
      { eye: "round", iris: "#F2B035", lid: [.22, .22], brow: [-8, -8], mouth: "smirk" },
      { hello: ["Haha ! Le Ciel m'attend, mais ce défi d'abord !", "Un nuage, un bâton, un défi : parfait."], good: ["Soixante-douze tours de magie, un seul gagnant !", "Même le Ciel m'applaudit !"], mid: ["J'ai encore un tour dans ma manche.", "Pas mal pour un singe de pierre."], bad: ["Même le Roi-Singe tombe de son nuage.", "Aïe… j'aurais dû lire la question avant de bondir."] }, { k: "streak", v: 21 }),
    pandapo: Object.assign(NP(["Pandoux", "Pandojo", "Grandmaîtrao"], "combat", 8, "violet", ["Zen", "Gourmand"], SPECIES.panda.quote,
      ["Il apprend le kung-fu entre deux siestes et trois bambous. Ses poings bandés sont plus doux qu'ils n'en ont l'air.", "Sa ceinture noire, il l'a gagnée en tombant mille fois et en riant à chaque fois.", "Guerrier du Dragon d'or : il esquive tout, même les compliments. Il préfère les nouilles."],
      { eye: "ringed", lid: [.12, .12], mouth: "smile" }, SPECIES.panda.lines, SPECIES.panda.need), { refonte: "panda" }),
    lionor: Object.assign(NP(["Orceau", "Dorlion", "Rugior"], "or", 10, "vermil", ["Fier", "Généreux"], "L'or ne vaut que ce qu'on donne.",
      ["Une mèche d'or est née dans sa crinière le jour où il a partagé son repas. Il ne sait pas encore pourquoi.", "Sa crinière se couvre d'or, une mèche par bonne action. Il brille, mais ne s'en vante pas.", "Couronne d'or, crinière de lingots : le trône ne se prête pas, il se mérite en donnant."],
      { eye: "round", iris: "#C2410C", lid: [.32, .32], mouth: "smug" }, SPECIES.lion.lines, SPECIES.lion.need), { refonte: "lion" }),
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
  const raw = Object.keys(SPECIES), keys = []; raw.filter(k => !SPECIES[k].refonte).forEach(k => { keys.push(k); raw.filter(x => SPECIES[x].refonte === k).forEach(x => keys.push(x)); });
  const css = `<style>.gal{max-width:980px;margin:0 auto;padding:18px 14px 60px;color:var(--ink);font-family:inherit}.gal h1{font-family:var(--fd);font-size:26px;margin:0 0 4px}.gal .sub{color:var(--ink-2);font-weight:700;margin:0 0 18px}
    .gcardx{background:var(--card);border-radius:22px;padding:14px;margin-bottom:16px;box-shadow:0 4px 0 var(--lip)}.gcardx.new{outline:3px solid #FFC24A}.gcardx.ref{outline:3px solid #7BD3EA}.gh{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:8px}.gh b{font-family:var(--fd);font-size:18px}
    .gtiles{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.gt{display:flex;flex-direction:column;align-items:center;gap:4px;font-weight:800;font-size:12px;text-align:center}.gt .tile{width:100%;aspect-ratio:1;border-radius:18px;overflow:hidden}.gt svg{display:block;width:100%;height:100%}
    .gq{font-style:italic;color:var(--ink-2);font-weight:700;margin:8px 0 2px}.gs{margin:6px 0 0;padding-left:18px;font-size:13.5px;font-weight:600;display:flex;flex-direction:column;gap:3px}.newtag{background:#FFC24A;color:#1C1C1E;border-radius:999px;padding:2px 10px;font-weight:900;font-size:12px}@media(max-width:560px){.gtiles{grid-template-columns:repeat(2,1fr)}}</style>`;
  const isNew = k => (SPECIES[k].num || 0) > 10 && !SPECIES[k].refonte;
  const card = k => { const S = SPECIES[k], tile = (st, shiny, lab) => `<div class="gt"><span class="tile">${petSVG({ species: k, stage: String(st), shiny: shiny ? "shiny" : "normal", bg: "type" })}</span>${esc(lab)}</div>`;
    return `<section class="gcardx ${isNew(k) ? "new" : ""} ${S.refonte ? "ref" : ""}"><div class="gh"><b>${esc(S.names.join(" → "))}</b>${typeBadge(S.type, 13)}${isNew(k) ? `<span class="newtag">Nouveau</span>` : ""}${S.refonte ? `<span class="newtag" style="background:#7BD3EA">Refonte proposée de ${esc(SPECIES[S.refonte].names[0])}</span>` : ""}<span class="muted">${(S.traits || []).map(esc).join(" · ")}</span></div>
      <div class="gtiles">${tile(1, false, S.names[0] + " · stade 1")}${tile(2, false, S.names[1] + " · stade 2")}${tile(3, false, S.names[2] + " · stade 3")}${tile(3, true, "Chromatique · stade 3")}</div>
      <p class="gq">« ${esc(S.quote)} »</p><ul class="gs">${S.dex.map(d => `<li>${esc(d)}</li>`).join("")}</ul></section>`; };
  return css + `<div class="gal"><h1>Galerie des familiers</h1><p class="sub">${keys.length} familiers, 3 stades chacun et une variante chromatique. Cadre doré : nouveaux familiers ; cadre bleu : refonte proposée d'un familier existant (juste après l'original). Tout est à valider.</p>${keys.map(card).join("")}</div>`;
}

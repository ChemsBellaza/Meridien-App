/* ---------- dessin des familiers (v9) : créatures à types, contour épais, ombrage en aplat ---------- */
const SIL = "#1F1A2B";
const f1 = n => +n.toFixed(2);
const PATTERN = (() => {
  let d = "", s = "";
  for (let r = 0, y = -6; y <= 130; y += 26, r++) for (let x = -10; x <= 130; x += 26) {
    const cx = x + (r % 2 ? 13 : 0), cy = y;
    d += `M${cx} ${cy - 8}L${cx + 8} ${cy}L${cx} ${cy + 8}L${cx - 8} ${cy}Z`;
    s += `M${cx} ${cy - 3}Q${cx} ${cy} ${cx + 3} ${cy}Q${cx} ${cy} ${cx} ${cy + 3}Q${cx} ${cy} ${cx - 3} ${cy}Q${cx} ${cy} ${cx} ${cy - 3}Z`;
  }
  return `<path d="${d}" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.4"/><path d="${s}" fill="#fff" fill-opacity=".2"/>`;
})();

/* contexte de dessin : couleur du trait (noire, ou silhouette) */
let DL = "#2B2240";
const OL = () => `stroke="${DL}" stroke-width="2.3" stroke-linejoin="round" stroke-linecap="round"`;
const ell = (cx, cy, rx, ry, fill, rot = 0, line = true) => `<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${fill}"${rot ? ` transform="rotate(${rot} ${f1(cx)} ${f1(cy)})"` : ""} ${line ? OL() : ""}/>`;
// ellipse ombrée : ombre en bas à droite, lumière en haut à gauche
const sell = (cx, cy, rx, ry, main, shade, rot = 0) => ell(cx, cy, rx, ry, shade, rot) + ell(cx - rx * .1, cy - ry * .1, rx * .86, ry * .86, main, rot, false);
const pth = (d, fill, line = true) => `<path d="${d}" fill="${fill}" ${line ? OL() : ""}/>`;
const lin = (d, w = 1.8, c) => `<path d="${d}" fill="none" stroke="${c || DL}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const pt = (x, y) => `${f1(x)} ${f1(y)}`;

/* éléments réutilisables */
function flame(x, y, s, c1, c2, c3) { // base en (x, y), pointe vers le haut
  const o = `M${pt(x, y - s * 1.7)}C${pt(x + s * .4, y - s * 1)} ${pt(x + s * 1.15, y - s * .6)} ${pt(x + s * .9, y + s * .2)}C${pt(x + s * .75, y + s * .8)} ${pt(x + s * .3, y + s)} ${pt(x, y + s)}C${pt(x - s * .3, y + s)} ${pt(x - s * .75, y + s * .8)} ${pt(x - s * .9, y + s * .2)}C${pt(x - s * 1.15, y - s * .6)} ${pt(x - s * .5, y - s * .8)} ${pt(x - s * .2, y - s * 1.25)}C${pt(x - s * .05, y - s * 1.1)} ${pt(x, y - s * 1.4)} ${pt(x, y - s * 1.7)}Z`;
  const k = .58, i = `M${pt(x, y - s * 1.2 * k - s * .2)}C${pt(x + s * .5 * k, y - s * .5 * k)} ${pt(x + s * .8 * k, y + s * .2)} ${pt(x, y + s * .85)}C${pt(x - s * .8 * k, y + s * .2)} ${pt(x - s * .5 * k, y - s * .5 * k)} ${pt(x, y - s * 1.2 * k - s * .2)}Z`;
  return pth(o, c2) + pth(i, c1, false) + (c3 ? `<path d="${o}" fill="none" stroke="${c3}" stroke-width=".9" opacity=".5"/>` : "");
}
function leaf(x, y, s, rot, c, cs) { // pétiole en (x, y)
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})">${pth(`M0 0Q${f1(s * .62)} ${f1(-s * .45)} 0 ${f1(-s * 1.5)}Q${f1(-s * .62)} ${f1(-s * .45)} 0 0Z`, c)}${lin(`M0 ${f1(-s * .1)}L0 ${f1(-s * 1.2)}`, 1.1, cs)}</g>`;
}
function bolt(x, y, s, c) {
  return pth(`M${pt(x - s * .25, y - s)}L${pt(x + s * .55, y - s * .1)}L${pt(x + s * .08, y - s * .02)}L${pt(x + s * .3, y + s)}L${pt(x - s * .55, y + s * .02)}L${pt(x - s * .08, y - s * .06)}Z`, c);
}
function rock(x, y, s, c, cs, cl, seed = 1) {
  const n = 7; let d = "";
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 - Math.PI / 2, r = s * (.78 + .22 * Math.abs(Math.sin(seed * 3.1 + i * 1.7))); d += (i ? "L" : "M") + pt(x + r * Math.cos(a), y + r * Math.sin(a) * .85); }
  return pth(d + "Z", c) + pth(`M${pt(x - s * .5, y - s * .1)}L${pt(x - s * .1, y - s * .6)}L${pt(x + s * .3, y - s * .45)}L${pt(x, y)}Z`, cl, false) + pth(`M${pt(x + s * .1, y + s * .2)}L${pt(x + s * .7, y)}L${pt(x + s * .45, y + s * .55)}Z`, cs, false);
}
function crystal(x, y, w, h, c, cs, rot = 0) { // pointe vers le haut, base en (x, y)
  return `<g transform="rotate(${rot} ${f1(x)} ${f1(y)})">${pth(`M${pt(x - w, y)}L${pt(x - w, y - h * .7)}L${pt(x, y - h)}L${pt(x + w, y - h * .7)}L${pt(x + w, y)}Z`, c)}${pth(`M${pt(x, y - h)}L${pt(x + w, y - h * .7)}L${pt(x + w, y)}L${pt(x, y)}Z`, cs, false)}${lin(`M${pt(x, y - h)}L${pt(x, y)}`, 1.2)}</g>`;
}
function spikes(cx, cy, r1, r2, n, fill, rotOff = 0) { // anneau pointu (crinière)
  let d = "";
  for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 + rotOff, r = i % 2 ? r1 : r2; d += (i ? "L" : "M") + pt(cx + r * Math.cos(a), cy + r * Math.sin(a)); }
  return pth(d + "Z", fill);
}
function feather(x, y, len, w, rot, c, cs) { // base en (x, y), vers le haut
  return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${rot})">${pth(`M0 0C${f1(w)} ${f1(-len * .3)} ${f1(w * .8)} ${f1(-len * .8)} 0 ${f1(-len)}C${f1(-w * .8)} ${f1(-len * .8)} ${f1(-w)} ${f1(-len * .3)} 0 0Z`, c)}${lin(`M0 ${f1(-len * .1)}L0 ${f1(-len * .85)}`, 1, cs)}</g>`;
}

/* gabarit commun : plus le stade est élevé, plus la créature est grande */
const RIG = [
  { hr: 23, hy: 62, bx: 15, by: 14, bcy: 92, fs: 6.5 },
  { hr: 22, hy: 54, bx: 17.5, by: 18, bcy: 86, fs: 7.5 },
  { hr: 21.5, hy: 46, bx: 20, by: 22.5, bcy: 81, fs: 8.5 }
];

/* yeux et bouches, style dessin animé : grands yeux sombres, deux reflets */
function eye(x, y, r, o, side, lidC, mood) {
  if (mood === "joy") return lin(`M${pt(x - r * .9, y + r * .25)}Q${pt(x, y - r * 1.15)} ${pt(x + r * .9, y + r * .25)}`, 2.8);
  if (o.zzz && mood !== "sad") return lin(`M${pt(x - r * .85, y)}Q${pt(x, y + r * .7)} ${pt(x + r * .85, y)}`, 2.6);
  let s = "";
  if (o.eye === "ringed") {
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * .82)}" ry="${f1(r)}" fill="#fff"/><circle cx="${f1(x + side * -r * .05)}" cy="${f1(y + r * .1)}" r="${f1(r * .55)}" fill="#1F1830"/><circle cx="${f1(x - r * .22)}" cy="${f1(y - r * .15)}" r="${f1(r * .22)}" fill="#fff"/>`;
  } else {
    s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r * .8)}" ry="${f1(r)}" fill="#1F1830"/>`;
    if (o.iris) s += `<ellipse cx="${f1(x)}" cy="${f1(y + r * .36)}" rx="${f1(r * .55)}" ry="${f1(r * .5)}" fill="${o.iris}"/>`;
    s += `<circle cx="${f1(x - r * .26)}" cy="${f1(y - r * .4)}" r="${f1(r * .32)}" fill="#fff"/><circle cx="${f1(x + r * .3)}" cy="${f1(y + r * .32)}" r="${f1(r * .14)}" fill="#fff"/>`;
    if (o.spark) s += `<circle cx="${f1(x - r * .05)}" cy="${f1(y - r * .05)}" r="${f1(r * .1)}" fill="#fff"/>`;
  }
  // paupière : droite (calme) ou en biais (regard perçant), plus basse si triste
  const lid = mood === "sad" ? Math.max(o.lid || 0, .35) : o.lid || 0;
  if (o.eye === "sharp" || lid > 0) {
    const inner = x - side * r, outer = x + side * r;
    const yo = o.eye === "sharp" ? y - r * .55 : y - r + 2 * r * lid, yi = o.eye === "sharp" ? y - r * .05 + (mood === "sad" ? -r * .5 : 0) : yo;
    const yo2 = mood === "sad" ? yo + r * .25 : yo;
    s += `<path d="M${pt(outer + side * 1.5, y - r * 1.4)}L${pt(inner - side * 1.5, y - r * 1.4)}L${pt(inner - side * 1.5, yi)}L${pt(outer + side * 1.5, yo2)}Z" fill="${lidC}"/>` + lin(`M${pt(inner - side * .6, yi)}L${pt(outer + side * .6, yo2)}`, 2.2);
  }
  if (mood === "sad" && side > 0) s += pth(`M${pt(x + r * .7, y + r * .8)}q${f1(r * .35)} ${f1(r * .6)} 0 ${f1(r * .85)}q${f1(-r * .35)} ${f1(-r * .25)} 0 ${f1(-r * .85)}Z`, "#7FD0FF");
  return s;
}
function mouth(type, mx, my, mood, hr) {
  const k = hr / 22, M = "#7A2638", T = "#FF8DA1";
  if (type === "none") return "";
  if (mood === "sad") return lin(`M${pt(mx - 4 * k, my + 2 * k)}Q${pt(mx, my - 1.5 * k)} ${pt(mx + 4 * k, my + 2 * k)}`, 2);
  if (mood === "joy" || type === "open") return pth(`M${pt(mx - 5.5 * k, my - .5)}Q${pt(mx, my + 9 * k)} ${pt(mx + 5.5 * k, my - .5)}Q${pt(mx, my + 1.2 * k)} ${pt(mx - 5.5 * k, my - .5)}Z`, M) + `<ellipse cx="${f1(mx)}" cy="${f1(my + 4.6 * k)}" rx="${f1(3 * k)}" ry="${f1(1.9 * k)}" fill="${T}"/>`;
  if (type === "fang") return pth(`M${pt(mx - 6 * k, my - 1)}Q${pt(mx, my + 6 * k)} ${pt(mx + 6 * k, my - 1)}Q${pt(mx, my + 1.5 * k)} ${pt(mx - 6 * k, my - 1)}Z`, M) + `<path d="M${pt(mx - 4.2 * k, my - .2)}l${f1(1.3 * k)} ${f1(3 * k)} ${f1(1.2 * k)}-${f1(2.6 * k)}Z" fill="#fff"/><path d="M${pt(mx + 4.2 * k, my - .2)}l-${f1(1.3 * k)} ${f1(3 * k)}-${f1(1.2 * k)}-${f1(2.6 * k)}Z" fill="#fff"/>`;
  if (type === "buck") return lin(`M${pt(mx - 4.5 * k, my - 1)}Q${pt(mx - 2.2 * k, my + 2 * k)} ${pt(mx, my - .5)}Q${pt(mx + 2.2 * k, my + 2 * k)} ${pt(mx + 4.5 * k, my - 1)}`, 1.9) + `<rect x="${f1(mx - 2.4 * k)}" y="${f1(my)}" width="${f1(4.8 * k)}" height="${f1(3.6 * k)}" rx="1" fill="#fff" ${OL().replace("2.3", "1.2")}/>`;
  if (type === "smirk") return lin(`M${pt(mx - 5 * k, my)}Q${pt(mx + 1 * k, my + 3.4 * k)} ${pt(mx + 6 * k, my - 2 * k)}`, 2);
  if (type === "o") return `<ellipse cx="${f1(mx)}" cy="${f1(my + 1)}" rx="${f1(2 * k)}" ry="${f1(2.6 * k)}" fill="${M}"/>`;
  if (type === "smug") return lin(`M${pt(mx - 6 * k, my - 1.2)}Q${pt(mx, my + 5 * k)} ${pt(mx + 6 * k, my - 1.2)}`, 2.1);
  if (type === "calm") return lin(`M${pt(mx - 3.5 * k, my)}Q${pt(mx, my + 2.2 * k)} ${pt(mx + 3.5 * k, my)}`, 1.9);
  return lin(`M${pt(mx - 4.5 * k, my - .5)}Q${pt(mx, my + 3.5 * k)} ${pt(mx + 4.5 * k, my - .5)}`, 2); // smile
}

/* ---------- les dix créatures ---------- */
const DRAW = {
  renard(P, R, st) {
    const { hr, hy, bx, by, bcy } = R, tx = 92 + st * 4, ty = bcy - by - 4 - st * 5;
    const ear = sd => { const A = [60 + sd * hr * .92, hy - hr * .2], B = [60 + sd * hr * (.82 + .06 * st), hy - hr * (1.45 + .15 * st)], C = [60 + sd * hr * .2, hy - hr * .8];
      const m = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t];
      return pth(`M${pt(...A)}L${pt(...B)}L${pt(...C)}Z`, P.main) + pth(`M${pt(...m(A, B, .3))}L${pt(...B)}L${pt(...m(C, B, .3))}Z`, P.dark, false) + lin(`M${pt(...A)}L${pt(...B)}L${pt(...C)}`, 2.3); };
    return {
      back: pth(`M${pt(66, bcy + by * .55)}C${pt(84, bcy + by * .7)} ${pt(tx + 2, bcy)} ${pt(tx, ty)}C${pt(tx - 9, ty + 12)} ${pt(80, bcy - 4)} ${pt(66, bcy - by * .1)}Z`, P.main) + ell(tx - 2, ty + 7, 5, 6, P.belly, 30, false) + flame(tx, ty + 2, [4.5, 7, 10][st], P.fl1, P.fl2),
      bodyFront: st === 2 ? [-2, -1, 0, 1, 2].map(i => flame(60 + i * 7.5, bcy - by * .62 + Math.abs(i) * 2.5, 4.4, P.fl1, P.fl2)).join("") : "",
      headBack: ear(-1) + ear(1),
      headDeco: pth(`M${pt(60 - hr * .88, hy + hr * .12)}Q${pt(60, hy - hr * .02)} ${pt(60 + hr * .88, hy + hr * .12)}Q${pt(60 + hr * .72, hy + hr * .86)} ${pt(60, hy + hr * .9)}Q${pt(60 - hr * .72, hy + hr * .86)} ${pt(60 - hr * .88, hy + hr * .12)}Z`, P.belly, false) + pth(`M${pt(57, hy + hr * .3)}L${pt(63, hy + hr * .3)}L${pt(60, hy + hr * .42)}Z`, P.dark, false),
      headTop: st ? flame(60, hy - hr * .82, [0, 5, 7][st], P.fl1, P.fl2) : ""
    };
  },
  loutre(P, R, st) {
    const { hr, hy, bx, by, bcy } = R;
    let tail = ell(84 + st * 2, bcy + by * .62, 12 + st * 3, 5, P.main, -28);
    if (st) { const x = 96 + st * 4, y = bcy + by * .1 - st * 2; tail += pth(`M${pt(x - 4, y + 4)}C${pt(x + 2, y - 6)} ${pt(x + 8, y - 8)} ${pt(x + 12, y - 10)}C${pt(x + 9, y - 2)} ${pt(x + 10, y + 4)} ${pt(x + 14, y + 9)}C${pt(x + 6, y + 8)} ${pt(x, y + 10)} ${pt(x - 4, y + 4)}Z`, P.accent); }
    const fin = st === 0 ? pth(`M${pt(60, hy - hr * 1.38)}C${pt(64, hy - hr * 1.1)} ${pt(64, hy - hr * .92)} ${pt(60, hy - hr * .92)}C${pt(56, hy - hr * .92)} ${pt(56, hy - hr * 1.1)} ${pt(60, hy - hr * 1.38)}Z`, P.accent)
      : pth(`M${pt(60 - hr * .35, hy - hr * .88)}C${pt(60 - hr * .3, hy - hr * (1.35 + st * .2))} ${pt(60 + hr * .1, hy - hr * (1.6 + st * .2))} ${pt(60 + hr * (.45 + st * .1), hy - hr * (1.5 + st * .15))}C${pt(60 + hr * .25, hy - hr * 1.25)} ${pt(60 + hr * .35, hy - hr * 1.05)} ${pt(60 + hr * .4, hy - hr * .86)}Z`, P.accent) + (st === 2 ? pth(`M${pt(60 - hr * .7, hy - hr * .6)}C${pt(60 - hr * 1.1, hy - hr * 1)} ${pt(60 - hr * 1.0, hy - hr * 1.3)} ${pt(60 - hr * .8, hy - hr * 1.45)}C${pt(60 - hr * .7, hy - hr * 1.1)} ${pt(60 - hr * .45, hy - hr * .95)} ${pt(60 - hr * .4, hy - hr * .82)}Z`, P.accentS) : "");
    const waves = st === 2 ? (() => { let d = `M${pt(60 - bx * .9, bcy - by * .55)}`; for (let i = 0; i < 5; i++) { const x0 = 60 - bx * .9 + i * bx * .36; d += `Q${pt(x0 + bx * .09, bcy - by * .85)} ${pt(x0 + bx * .18, bcy - by * .6)}Q${pt(x0 + bx * .27, bcy - by * .35)} ${pt(x0 + bx * .36, bcy - by * .55)}`; } return pth(d + `L${pt(60 + bx * .9, bcy - by * .3)}Q${pt(60, bcy - by * .1)} ${pt(60 - bx * .9, bcy - by * .3)}Z`, P.accent); })() : "";
    return {
      back: tail,
      bodyFront: waves,
      headBack: [-1, 1].map(sd => ell(60 + sd * hr * .8, hy - hr * .55, hr * .22, hr * .22, P.main) + ell(60 + sd * hr * .8, hy - hr * .53, hr * .11, hr * .11, P.dark, 0, false)).join(""),
      headDeco: ell(60, hy + hr * .43, hr * .44, hr * .3, P.belly, 0, false) + ell(60, hy + hr * .26, 3.6, 2.6, P.dark, 0, false) + lin(`M${pt(60 - hr * .5, hy + hr * .42)}L${pt(60 - hr * .85, hy + hr * .36)}M${pt(60 - hr * .5, hy + hr * .52)}L${pt(60 - hr * .85, hy + hr * .56)}M${pt(60 + hr * .5, hy + hr * .42)}L${pt(60 + hr * .85, hy + hr * .36)}M${pt(60 + hr * .5, hy + hr * .52)}L${pt(60 + hr * .85, hy + hr * .56)}`, 1.1),
      headTop: fin
    };
  },
  koala(P, R, st) {
    const { hr, hy, bx, by, bcy } = R;
    const ears = [-1, 1].map(sd => sell(60 + sd * hr * .95, hy - hr * .32, hr * .44, hr * .42, P.main, P.shade) + ell(60 + sd * hr * .95, hy - hr * .29, hr * .24, hr * .22, P.inner, 0, false) + (st ? leaf(60 + sd * hr * 1.1, hy - hr * .68, 5 + st, sd * 35, P.leaf, P.leafS) : "")).join("");
    let top = "";
    if (st === 0) top = lin(`M${pt(60, hy - hr * .9)}Q${pt(61, hy - hr * 1.15)} ${pt(60, hy - hr * 1.3)}`, 2.2) + leaf(60, hy - hr * 1.25, 6, -50, P.leaf, P.leafS) + leaf(60, hy - hr * 1.25, 6, 50, P.leaf, P.leafS);
    if (st === 1) top = [-40, 0, 40].map(a => leaf(60, hy - hr * .9, 8, a, P.leaf, P.leafS)).join("");
    if (st === 2) top = [-1, 0, 1].map(i => { const x = 60 + i * hr * .55, y = hy - hr * (.9 - Math.abs(i) * .12); return [0, 72, 144, 216, 288].map(a => ell(x + 3.4 * Math.cos(a * Math.PI / 180), y + 3.4 * Math.sin(a * Math.PI / 180), 2.8, 2.8, P.flower)).join("") + ell(x, y, 2.4, 2.4, P.flowerC, 0, false); }).join("");
    return {
      back: st === 2 ? [-1, 1].map(sd => leaf(60 + sd * bx * .7, bcy + by * .5, 18, sd * 55, P.leaf, P.leafS) + leaf(60 + sd * bx * .5, bcy + by * .3, 15, sd * 30, P.leafS, P.leaf)).join("") : "",
      bodyFront: st ? [-28, 0, 28].map(a => leaf(60, bcy - by * .55, 7 + st, 180 + a, P.leaf, P.leafS)).join("") : "",
      headBack: ears,
      headDeco: ell(60, hy + hr * .25, hr * .17, hr * .26, P.dark) + ell(60 - hr * .05, hy + hr * .14, hr * .05, hr * .08, "#fff", 0, false),
      headTop: top
    };
  },
  lapin(P, R, st) {
    const { hr, hy, bx, by, bcy } = R, L = .62 + st * .14;
    const ears = [-1, 1].map(sd => { const cx = 60 + sd * hr * .38, cy = hy - hr * (.95 + L * .55), rot = sd * (10 + st * 4);
      return ell(cx, cy, hr * .25, hr * L, P.main, rot) + ell(cx, cy + hr * .05, hr * .13, hr * L * .72, P.inner, rot, false) + (st ? `<g transform="rotate(${rot} ${f1(cx)} ${f1(cy)})">${bolt(cx, cy - hr * L * .55, 3.5 + st, P.bolt)}</g>` : ""); }).join("");
    return {
      back: ell(60 - bx - 2, bcy + by * .45, 6 + st, 6 + st, P.belly) + (st ? bolt(60 - bx - 3, bcy + by * .45, 3.6, P.bolt) : ""),
      bodyFront: st ? bolt(60, bcy + by * .15, 4 + st * 1.5, P.bolt) : "",
      headBack: ears,
      headDeco: ell(60, hy + hr * .42, hr * .34, hr * .24, P.belly, 0, false) + pth(`M${pt(57.6, hy + hr * .26)}L${pt(62.4, hy + hr * .26)}L${pt(60, hy + hr * .37)}Z`, P.dark, false) + [-1, 1].map(sd => bolt(60 + sd * hr * .66, hy + hr * .38, 3, P.cheek)).join(""),
      front: st === 2 ? [[22, 40], [98, 50], [18, 78], [102, 86]].map(([x, y], i) => bolt(x, y, 4, P.bolt)).join("") : ""
    };
  },
  ours(P, R, st) {
    const { hr, hy, bx, by, bcy } = R;
    let top = "";
    if (st === 0) top = rock(60, hy - hr * .62, 4.5, P.rock, P.rockS, P.rockL, 2);
    if (st === 1) top = [-1, 0, 1].map(i => rock(60 + i * hr * .4, hy - hr * (.82 - Math.abs(i) * .1), i ? 4 : 5.5, P.rock, P.rockS, P.rockL, i + 3)).join("");
    if (st === 2) top = [-1, 0, 1].map(i => crystal(60 + i * hr * .45, hy - hr * (.72 - Math.abs(i) * .08), i ? 4 : 5, i ? 11 : 15, P.rock, P.rockS, i * 18)).join("");
    return {
      back: st === 2 ? [-1, 1].map(sd => crystal(60 + sd * bx * .75, bcy - by * .2, 5, 18, P.rock, P.rockS, sd * 35)).join("") : "",
      bodyFront: st ? [-1, 1].map(sd => rock(60 + sd * bx * .82, bcy - by * .62, 6 + st * 1.5, P.rock, P.rockS, P.rockL, sd + 5)).join("") + (st === 2 ? rock(60, bcy + by * .1, 6, P.rock, P.rockS, P.rockL, 9) : "") : "",
      headBack: [-1, 1].map(sd => sell(60 + sd * hr * .72, hy - hr * .72, hr * .27, hr * .27, P.main, P.shade) + ell(60 + sd * hr * .72, hy - hr * .7, hr * .14, hr * .14, P.belly, 0, false)).join(""),
      headDeco: ell(60, hy + hr * .43, hr * .46, hr * .33, P.belly, 0, false) + pth(`M${pt(60 - 4.5, hy + hr * .22)}Q${pt(60, hy + hr * .16)} ${pt(60 + 4.5, hy + hr * .22)}Q${pt(60 + 2, hy + hr * .42)} ${pt(60, hy + hr * .42)}Q${pt(60 - 2, hy + hr * .42)} ${pt(60 - 4.5, hy + hr * .22)}Z`, P.dark, false),
      headTop: top
    };
  },
  tortue(P, R, st) {
    const { hr, hy, bx, by, bcy } = R, W = bx + 11, top = bcy - by * .95, base = bcy + by * .8;
    // carapace en dôme, plus large que le corps ; les cristaux poussent sur ses épaules, de part et d'autre de la tête
    let shell = pth(`M${pt(60 - W, base)}C${pt(60 - W - 2, top + 4)} ${pt(60 - W * .55, top - 6)} ${pt(60, top - 6)}C${pt(60 + W * .55, top - 6)} ${pt(60 + W + 2, top + 4)} ${pt(60 + W, base)}Z`, P.shell);
    shell += pth(`M${pt(60 - W * .62, base - 2)}L${pt(60 - W * .8, bcy - by * .15)}L${pt(60 - W * .5, top + 4)}`, "none", false) + lin(`M${pt(60 - W * .8, bcy - by * .15)}L${pt(60 - W * .98, bcy - by * .1)}M${pt(60 + W * .8, bcy - by * .15)}L${pt(60 + W * .98, bcy - by * .1)}M${pt(60 - W * .8, bcy - by * .15)}L${pt(60 - W * .55, top + 2)}M${pt(60 + W * .8, bcy - by * .15)}L${pt(60 + W * .55, top + 2)}`, 1.6, P.shellS);
    shell += pth(`M${pt(60 - W - 1, base - 1)}Q${pt(60, base + 6)} ${pt(60 + W + 1, base - 1)}L${pt(60 + W - 1, base + 4)}Q${pt(60, base + 11)} ${pt(60 - W + 1, base + 4)}Z`, P.shellS);
    const cr = [[[.72, 0, 4, 10, 28]], [[.7, 0, 4.5, 13, 30], [-.7, 0, 4.5, 13, -30], [.92, 8, 3.5, 9, 55]], [[.62, -2, 5.5, 20, 22], [-.62, -2, 5.5, 20, -22], [.9, 6, 4.5, 14, 48], [-.9, 6, 4.5, 14, -48], [0, -8, 6, 24, 0]]][st];
    shell += cr.map(([fx, dy, w, h, rot]) => crystal(60 + fx * W, top + 10 + dy + Math.abs(fx) * 6, w, h, P.ice, P.iceS, rot)).join("");
    return {
      back: shell,
      bodyStyle: "plastron",
      headDeco: st ? `<g transform="translate(60 ${f1(hy - hr * .55)})">${lin("M0 -4V4M-3.5 -2L3.5 2M-3.5 2L3.5 -2", 1.6, "#fff")}</g>` : "",
      headBack: ""
    };
  },
  aigle(P, R, st) {
    const { hr, hy, bx, by, bcy } = R;
    let back = [-22, 0, 22].map(a => feather(60 + a * .2, bcy + by * .75, 12 + st * 3, 4, 180 + a, P.wing, P.wingS)).join("");
    if (st >= 1) back += [-1, 1].map(sd => [0, 1, 2].map(i => feather(60 + sd * bx * .7, bcy - by * .3, (18 + st * 9) - i * 4, 5 + st, sd * (35 + i * 22 + st * 6), i % 2 ? P.wingS : P.wing, P.wingS)).join("")).join("");
    const crest = [[1], [-1, 1], [-1, 0, 1]][st].map(i => feather(60 + i * 3, hy - hr * .85, 9 + st * 4 - Math.abs(i) * 2, 3 + st * .5, i * 22, P.crest, P.crestS)).join("");
    return {
      back, feet: P.beak,
      arms: st === 0 ? [-1, 1].map(sd => feather(60 + sd * bx * .9, bcy + by * .2, 12, 4.5, sd * 110, P.wing, P.wingS)).join("") : "",
      headDeco: ell(60, hy + hr * .45, hr * .5, hr * .32, P.belly, 0, false) + pth(`M${pt(60 - hr * .22, hy + hr * .2)}Q${pt(60, hy + hr * .06)} ${pt(60 + hr * .22, hy + hr * .2)}Q${pt(60 + hr * .14, hy + hr * .56)} ${pt(60, hy + hr * .66)}Q${pt(60 - hr * .14, hy + hr * .56)} ${pt(60 - hr * .22, hy + hr * .2)}Z`, P.beak) + lin(`M${pt(60 - hr * .15, hy + hr * .32)}Q${pt(60, hy + hr * .38)} ${pt(60 + hr * .15, hy + hr * .32)}`, 1.2, P.beakS),
      headTop: crest, noMouth: true
    };
  },
  panda(P, R, st) {
    const { hr, hy, bx, by, bcy } = R, ex = hr * .42, ey = hy + hr * .12;
    const band = pth(`M${pt(60 - hr * .97, hy - hr * .18)}Q${pt(60, hy - hr * .58)} ${pt(60 + hr * .97, hy - hr * .18)}L${pt(60 + hr * .94, hy + hr * .04)}Q${pt(60, hy - hr * .36)} ${pt(60 - hr * .94, hy + hr * .04)}Z`, P.band)
      + pth(`M${pt(60 + hr * .9, hy - hr * .1)}L${pt(60 + hr * 1.45, hy - hr * .35)}L${pt(60 + hr * 1.3, hy - hr * .05)}Z`, P.band) + pth(`M${pt(60 + hr * .9, hy - hr * .05)}L${pt(60 + hr * 1.4, hy + hr * .25)}L${pt(60 + hr * 1.1, hy + hr * .25)}Z`, P.bandS);
    return {
      back: st === 2 ? `<g transform="rotate(-38 60 ${bcy})">${pth(`M${pt(56.5, bcy - 52)}h7v100h-7Z`, P.bamboo)}${[-38, -12, 14, 40].map(d => lin(`M${pt(56.5, bcy + d)}h7`, 2)).join("")}</g>` : "",
      limb: P.dark,
      bodyFront: st ? pth(`M${pt(60 - bx * .98, bcy + by * .05)}Q${pt(60, bcy + by * .25)} ${pt(60 + bx * .98, bcy + by * .05)}L${pt(60 + bx * .96, bcy + by * .3)}Q${pt(60, bcy + by * .5)} ${pt(60 - bx * .96, bcy + by * .3)}Z`, P.dark) + pth(`M${pt(56, bcy + by * .3)}l-3 10 5-2 2 5 3-11Z`, P.dark) : "",
      arms: st ? [-1, 1].map(sd => ell(60 + sd * bx * .88, bcy - by * .25, 6 + st, 6 + st, P.dark)).join("") : "",
      headBack: [-1, 1].map(sd => ell(60 + sd * hr * .76, hy - hr * .7, hr * .27, hr * .27, P.dark)).join(""),
      headDeco: [-1, 1].map(sd => ell(60 + sd * ex, ey, hr * .27, hr * .33, P.dark, sd * -25, false)).join("") + ell(60, hy + hr * .32, 3.2, 2.3, P.dark, 0, false),
      headTop: band
    };
  },
  tigre(P, R, st) {
    const { hr, hy, bx, by, bcy } = R, tx = 94 + st * 3, ty = bcy - by * .4 - st * 6;
    let back = lin(`M${pt(68, bcy + by * .7)}Q${pt(96, bcy + by)} ${pt(tx, ty)}`, 8.5) + lin(`M${pt(68, bcy + by * .7)}Q${pt(96, bcy + by)} ${pt(tx, ty)}`, 5.2, P.main) + lin(`M${pt(84, bcy + by * .93)}l2 -4M${pt(92, bcy + by * .55)}l4 -2`, 2.2, P.dark);
    if (st) back += flame(tx, ty - 1, 4 + st * 2.5, P.wispL, P.wisp);
    const ear = sd => pth(`M${pt(60 + sd * hr * .95, hy - hr * .25)}Q${pt(60 + sd * hr * 1.05, hy - hr * 1.1)} ${pt(60 + sd * hr * .62, hy - hr * 1.12)}Q${pt(60 + sd * hr * .35, hy - hr * 1.0)} ${pt(60 + sd * hr * .25, hy - hr * .82)}Z`, P.main) + pth(`M${pt(60 + sd * hr * .82, hy - hr * .5)}Q${pt(60 + sd * hr * .88, hy - hr * .95)} ${pt(60 + sd * hr * .62, hy - hr * .95)}Q${pt(60 + sd * hr * .45, hy - hr * .88)} ${pt(60 + sd * hr * .4, hy - hr * .78)}Z`, P.dark, false);
    return {
      back,
      bodyFront: lin(`M${pt(60 - bx * .95, bcy - by * .2)}l6 2M${pt(60 - bx, bcy + by * .15)}l6 1M${pt(60 + bx * .95, bcy - by * .2)}l-6 2M${pt(60 + bx, bcy + by * .15)}l-6 1`, 2.6, P.dark),
      headBack: (st === 2 ? spikes(60, hy + hr * .25, hr * 1.12, hr * 1.42, 9, P.wisp, .2) : "") + ear(-1) + ear(1),
      headDeco: ell(60, hy + hr * .44, hr * .48, hr * .32, P.belly, 0, false) + lin(`M60 ${f1(hy - hr * .95)}v${f1(hr * .28)}M${pt(60 - hr * .3, hy - hr * .88)}l${f1(hr * .1)} ${f1(hr * .25)}M${pt(60 + hr * .3, hy - hr * .88)}l-${f1(hr * .1)} ${f1(hr * .25)}M${pt(60 - hr * .98, hy + hr * .05)}l${f1(hr * .3)} ${f1(hr * .06)}M${pt(60 + hr * .98, hy + hr * .05)}l-${f1(hr * .3)} ${f1(hr * .06)}`, 2.4, P.dark) + pth(`M${pt(57.4, hy + hr * .28)}L${pt(62.6, hy + hr * .28)}L${pt(60, hy + hr * .4)}Z`, P.dark, false)
        + (st === 2 ? pth(`M${pt(60 - 4, hy - hr * .5)}A5 5 0 1 0 ${pt(60 + 4, hy - hr * .5)}A4 4 0 1 1 ${pt(60 - 4, hy - hr * .5)}Z`, P.glow, false) : "")
    };
  },
  lion(P, R, st) {
    const { hr, hy, bx, by, bcy } = R;
    let back = lin(`M${pt(66, bcy + by * .72)}Q${pt(90, bcy + by * .9)} ${pt(94, bcy - by * .1)}`, 6.5) + lin(`M${pt(66, bcy + by * .72)}Q${pt(90, bcy + by * .9)} ${pt(94, bcy - by * .1)}`, 3.6, P.main) + ell(94, bcy - by * .2, 4.5, 5.5, P.mane);
    if (st) back = [-1, 1].map(sd => { const s = st === 1 ? .6 : 1, x = 60 + sd * bx * .6, y = bcy - by * .5;
      return pth(`M${pt(x, y)}L${pt(x + sd * 34 * s, y - 30 * s)}Q${pt(x + sd * 36 * s, y - 8 * s)} ${pt(x + sd * 30 * s, y + 4 * s)}Q${pt(x + sd * 22 * s, y)} ${pt(x + sd * 20 * s, y + 10 * s)}Q${pt(x + sd * 12 * s, y + 6 * s)} ${pt(x + sd * 8 * s, y + 14 * s)}Z`, P.wing) + lin(`M${pt(x, y)}L${pt(x + sd * 30 * s, y + 4 * s)}M${pt(x, y)}L${pt(x + sd * 20 * s, y + 10 * s)}`, 1.2, P.wingS); }).join("") + back;
    const horn = sd => { const s = [.45, .75, 1.05][st], x = 60 + sd * hr * .42, y = hy - hr * .8;
      return pth(`M${pt(x - sd * 3 * s, y + 2)}Q${pt(x + sd * 2 * s, y - 14 * s)} ${pt(x + sd * 12 * s, y - 16 * s)}Q${pt(x + sd * 5 * s, y - 8 * s)} ${pt(x + sd * 5 * s, y + 2)}Z`, P.horn); };
    const mane = st === 0 ? spikes(60, hy - hr * .55, hr * .35, hr * .62, 5, P.mane, Math.PI) : spikes(60, hy + hr * .05, hr * (1.05 + st * .05), hr * (1.32 + st * .12), 11 + st * 2, P.mane, .1) + (st === 2 ? spikes(60, hy + hr * .05, hr * 1.0, hr * 1.18, 13, P.maneS, .35) : "");
    return {
      back,
      bodyFront: st === 2 ? lin([0, 1, 2].map(i => `M${pt(60 - 6, bcy - by * .25 + i * 7)}q6 4 12 0`).join(""), 1.5, P.shade) : "",
      headBack: mane + [-1, 1].map(sd => ell(60 + sd * hr * .78, hy - hr * .62, hr * .2, hr * .2, P.main)).join(""),
      headDeco: ell(60, hy + hr * .44, hr * .42, hr * .3, P.belly, 0, false) + pth(`M${pt(57, hy + hr * .26)}L${pt(63, hy + hr * .26)}L${pt(60, hy + hr * .38)}Z`, P.dark, false),
      headTop: horn(-1) + horn(1)
    };
  }
};

function creatureSVG(pet, opt = {}) {
  const key = pet.species in SPECIES ? pet.species : "renard", st = stageOf(pet) - 1, R = RIG[st], S = SPECIES[key];
  const base = { ...PAL[key], ...(pet.shiny === "shiny" ? SHINY[key] : {}) };
  const P = opt.sil ? new Proxy({}, { get: () => SIL }) : base;
  DL = opt.sil ? SIL : "#2B2240";
  const L = DRAW[key](P, R, st), { hr, hy, bx, by, bcy, fs } = R, o = S.ex, mood = opt.mood;
  let h = `<ellipse cx="60" cy="108" rx="${f1(bx + 12)}" ry="4.5" fill="#000" opacity=".16"/>`;
  h += L.back || "";
  const limb = L.limb || P.main, limbS = L.limb || P.shade;
  h += [-1, 1].map(sd => ell(60 + sd * bx * .55, 105, fs, fs * .58, L.feet || limb)).join("");
  if (L.bodyStyle === "plastron") h += sell(60, bcy, bx, by, P.belly, P.iceS || P.shade) + lin(`M${pt(60 - bx * .7, bcy - by * .1)}H${f1(60 + bx * .7)}M${pt(60 - bx * .6, bcy + by * .35)}H${f1(60 + bx * .6)}`, 1.4, P.iceS || P.shade);
  else h += sell(60, bcy, bx, by, P.main, P.shade) + ell(60, bcy + by * .18, bx * .62, by * .62, P.belly, 0, false);
  h += L.bodyFront || "";
  h += L.arms != null ? L.arms : [-1, 1].map(sd => ell(60 + sd * bx * .86, bcy - by * .12, 4.2, 7.5, limb, sd * -28)).join("");
  h += L.headBack || "";
  h += sell(60, hy, hr, hr * .94, P.main, P.shade);
  h += L.headDeco || "";
  if (!opt.sil) {
    const ex = hr * .42, ey = hy + hr * .1, er = hr * (st === 0 ? .23 : .21);
    h += [-1, 1].map(sd => eye(60 + sd * ex, ey, er, o, sd, P.main, mood)).join("");
    if (key !== "aigle" && key !== "panda") h += [-1, 1].map(sd => `<ellipse cx="${f1(60 + sd * hr * .7)}" cy="${f1(hy + hr * .45)}" rx="${f1(hr * .13)}" ry="${f1(hr * .08)}" fill="${P.cheek}" opacity="${mood === "sad" ? .3 : .6}"/>`).join("");
    if (!L.noMouth) h += mouth(o.mouth, 60, hy + hr * .55, mood, hr);
    if (o.zzz && mood !== "sad" && mood !== "joy") h += `<g fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" opacity=".9"><path d="M92 16h7l-7 8h7"/><path d="M103 6h5l-5 6h5"/></g>`;
  }
  h += L.headTop || "";
  h += L.front || "";
  DL = "#2B2240";
  return { svg: h, hr, hy };
}

// opt.head : cadrage sur la tête (avatars) · opt.sil : silhouette (verrouillé) · opt.mood : "joy" | "sad"
function petSVG(pet, opt = {}) {
  const key = pet.species in SPECIES ? pet.species : "renard";
  const bg = BGS[pet.bg] || TYPES[SPECIES[key].type].color;
  const c = creatureSVG(pet, opt);
  const vb = opt.head ? `${f1(60 - c.hr * 1.6)} ${f1(c.hy - c.hr * 1.5)} ${f1(c.hr * 3.2)} ${f1(c.hr * 3.2)}` : "0 0 120 120";
  return `<svg viewBox="${vb}" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect x="-10" y="-10" width="140" height="140" fill="${bg}"/>${opt.plain ? "" : PATTERN}${opt.head ? "" : `<rect x="-10" y="101" width="140" height="30" fill="#000" opacity=".09"/>`}${c.svg}</svg>`;
}
const petLine = (key, kind, seed) => { const L = SPECIES[key].lines[kind]; return L[hashSeed(seed + key + kind) % L.length]; };
const TYPE_ICO = {
  feu: `<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3-1-6 1-9z"/>`,
  eau: `<path d="M12 2c3 5 7 9 7 13a7 7 0 0 1-14 0c0-4 4-8 7-13z"/>`,
  plante: `<path d="M20 4C10 4 4 9 4 16c0 1.5.4 2.8 1 3.8C7 15 10.5 11.5 15 10c-4 2.5-7 6-8 10.5.9.3 1.9.5 3 .5 7 0 10-7 10-17z"/>`,
  electrik: `<path d="M13.5 2L4 14h7l-1.5 8L20 10h-7z"/>`,
  roche: `<path d="M4 18l2-8 5-5 6 2 3 6-2 6z"/>`,
  glace: `<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" fill="none"/>`,
  vol: `<path d="M3 15c5-1 9-5 11-11 2 4 3 8 1 12 3 0 5-1 6-2-1 4-5 7-10 7-4 0-7-3-8-6z"/>`,
  combat: `<path d="M6 10V6a2 2 0 0 1 4 0v3-4a2 2 0 0 1 4 0v4-3a2 2 0 0 1 4 0v8a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-2a2 2 0 0 1 2-2z"/>`,
  tenebres: `<path d="M15 3a9 9 0 1 0 6 13A7 7 0 0 1 15 3z"/>`,
  dragon: `<path d="M3 20c2-6 6-9 10-9-1-2-3-3-5-3 3-3 8-3 11 0 2 2 2 6 0 8-2-1-4-1-6 0 1 2 1 3 0 4-3-1-6-1-10 0z"/>`
};
const typeBadge = (t, s = 14) => `<span class="tbadge" style="--c:${TYPES[t].color}"><svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${TYPE_ICO[t]}</svg>${esc(TYPES[t].label)}</span>`;

/* avatars ronds ; avec photo, le familier se pose en médaillon */
function avatar(p, cls = "") {
  const inner = p.photo ? `<img src="${p.photo}" alt="">` : p.pet ? petSVG(p.pet, { head: true, plain: true }) : "";
  const badge = p.photo && p.pet ? `<span class="badge">${petSVG(p.pet, { head: true, plain: true })}</span>` : "";
  return `<span class="av ${cls}" role="img" aria-label="${esc(p.name)}"><span class="in">${inner}</span>${badge}</span>`;
}
const petAv = (pet, cls = "", label = "Familier", opt = {}) => `<span class="av ${cls}" role="img" aria-label="${esc(label)}"><span class="in">${petSVG(pet, { head: true, plain: true, ...opt })}</span></span>`;
const speciesOpen = (k, prog) => !SPECIES[k].need || (prog && isUnlocked(SPECIES[k], prog));
const SPECIES_ORDER = () => Object.keys(SPECIES).sort((a, b) => SPECIES[a].num - SPECIES[b].num);
function petPicker() {
  const prog = store.profile ? progress() : null, keys = SPECIES_ORDER(), sel = ui.draftPet, S = SPECIES[sel];
  return `<div class="carousel" id="carousel" role="group" aria-label="Choisis ton familier">${keys.map(k => {
    const Sk = SPECIES[k], open = speciesOpen(k, prog);
    return `<button type="button" class="gtile ${open ? "" : "locked"}" data-act="pickpet" data-v="${k}" aria-pressed="${sel === k}" aria-label="${esc(open ? Sk.names[0] + ", type " + TYPES[Sk.type].label : "Familier verrouillé")}">
      <span class="tile">${petSVG(defaultPet(k), { sil: !open })}${open ? "" : `<span class="lockb">${I.lock}</span>`}</span>
      <b>${open ? Sk.names[0] : "???"}</b><span class="t">${open ? typeBadge(Sk.type, 12) : reqText(Sk.need)}</span></button>`;
  }).join("")}</div>
  <div class="dots" aria-hidden="true">${keys.map(k => `<i class="${sel === k ? "on" : ""}"></i>`).join("")}</div>
  <div class="petcard"><div class="traits">${S.traits.map(t => `<span>${t}</span>`).join("")}</div><p class="say">${fr(S.dex[0])}</p></div>`;
}

const { chromium, URL: APP, OUT } = require('./lib');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({});
  for (const dark of [false, true]) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: dark ? 'dark' : 'light' });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue(); return r.abort(); });
  await page.goto(APP); await page.waitForTimeout(300);
  await page.click('[data-act=onbnext]'); await page.fill('#pseudo', 'Chems'); await page.click('button[type=submit]'); await page.waitForTimeout(300);
  const P = dark ? 'd_' : '';
  if (!dark) {
    const res = await page.evaluate(() => {
      const D = pbDict();
      const test = (val, L, cat) => { const x = norm(val); const other0 = PB_ANY.get(x), o0 = other0 && !other0.has(cat); let hit = D[cat].findIndex(e => e.keys.includes(x)); if (hit < 0 && !o0) hit = D[cat].findIndex(e => !e.x && matchKeys(val, e.keys)); const other = PB_ANY.get(x); return `${val} [${cat} ${L}] lettre:${pbLetterOk(val, L, cat)} dico:${hit >= 0} autre:${other ? [...other].join('/') : '-'}`; };
      return [test('Jessica Alba', 'a', 'celeb'), test('Jessica Alba', 'j', 'celeb'), test('Alba', 'a', 'celeb'), test('Bernard Madoff', 'm', 'celeb'), test('Madoff', 'm', 'celeb'), test('Blatte', 'b', 'animal'), test('Brésil', 'b', 'animal'), test('Bombe', 'b', 'objet'), test('De Gaulle', 'g', 'celeb'), test('Charles de Gaulle', 'g', 'celeb'), test('Kylian Mbappe', 'm', 'celeb'), test('pommes', 'p', 'fruitleg'), test('Lépilémur', 'l', 'animal'), test('Gagny', 'g', 'ville'), test('Truelle', 't', 'objet'), test('Tapiokiste', 't', 'metier'), test('Bombe', 'b', 'objet'), test('Blablou', 'b', 'animal'), test('Quiche lorraine', 'q', 'plat'), test('Inoxtag', 'i', 'celeb'),
        'sizes ' + Object.keys(D).map(k => k + ':' + D[k].length).join(' '),
        'letters ' + [0, 1, 2].map(d => PB_LETTERS[d].split('').filter(L => PB_POOL_D[d].filter(c => D[c].filter(e => e.keys.some(k => k[0] === L.toLowerCase())).length >= 3).length < PB_N[d]).join('')).join(' | ')];
    });
    console.log(res.join('\n'));
  }
  await page.screenshot({ path: P + 'c_home.png' });
  // compte est bon puzzle
  await page.click('[data-act=menu]'); await page.click('[data-act=practice][data-v=comptebon]'); await page.click('[data-g=start]');
  for (let r = 0; r < 3; r++) {
    const key = await page.evaluate(() => game.manches[game.round].key);
    await page.click('[data-g=diff][data-v="1"]'); await page.waitForTimeout(60);
    if (key === 'compte') { await page.click('.cbt >> nth=0'); await page.click('[data-g=cbo][data-v="×"]'); await page.waitForTimeout(40); await page.screenshot({ path: P + 'c_compte.png' }); await page.click('[data-g=cbok]'); await page.waitForTimeout(60); await page.screenshot({ path: P + 'c_compte_rev.png', fullPage: true }); break; }
    await page.evaluate(() => { game.T.ms = 0; }); await page.waitForTimeout(100); await page.click('[data-g=next]');
  }
  await page.evaluate(() => { stopTimer(); game = null; render(); });
  // distance reveal
  await page.click('[data-act=menu]'); await page.click('[data-act=practice][data-v=distance]'); await page.click('[data-g=start]'); await page.click('[data-g=diff][data-v="0"]'); await page.click('[data-g=kmok]'); await page.waitForTimeout(80);
  await page.screenshot({ path: P + 'c_dist.png', fullPage: true });
  await page.evaluate(() => { stopTimer(); game = null; render(); });
  // neavant + petit bac moyen
  await page.click('[data-act=menu]'); await page.click('[data-act=practice][data-v=neavant]'); await page.click('[data-g=start]'); await page.click('[data-g=diff][data-v="1"]'); await page.waitForTimeout(80);
  await page.screenshot({ path: P + 'c_neavant.png' });
  await page.evaluate(() => { stopTimer(); game = null; render(); });
  await page.click('[data-act=menu]'); await page.click('[data-act=practice][data-v=petitbac]'); await page.click('[data-g=start]'); await page.click('[data-g=diff][data-v="2"]'); await page.waitForTimeout(80);
  await page.screenshot({ path: P + 'c_pb10.png', fullPage: true });
  console.log(await page.evaluate(() => game.qs[0].L + ' ' + game.qs[0].cats.join(',')));
  await page.evaluate(() => { stopTimer(); game = null; render(); });
  await page.click('[data-act=menu]'); await page.waitForTimeout(80); await page.screenshot({ path: P + 'c_menu.png' });
  console.log(dark ? 'dark' : 'light', errs.length ? errs : 'no errors');
  await ctx.close();
  }
  await browser.close();
})();

const { chromium, URL: APP, OUT } = require('./lib');
const fs = require('fs');
const DIR = OUT + (process.argv.includes('--dark') ? '/v8d/' : '/v8/');
fs.mkdirSync(DIR, { recursive: true });
const ONLY = process.argv[2] ? process.argv[2].split(',') : null;
const DARK = process.argv.includes('--dark');

(async () => {
  const browser = await chromium.launch({});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, colorScheme: DARK ? 'dark' : 'light' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 3).join('\n')));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|net::/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await page.route('**/*', r => {
    const u = r.request().url();
    if (u.startsWith('file:')) return r.continue();
    return r.abort();
  });
  await page.goto(APP);
  await page.waitForTimeout(400);
  await page.click('[data-act=onbnext]');
  await page.fill('#pseudo', 'Chems');
  await page.click('button[type=submit]');
  await page.waitForTimeout(300);
  await page.screenshot({ path: DIR + 'home.png', fullPage: true });
  const fmts = await page.evaluate(() => Object.keys(FORMATS));
  const sleep = ms => page.waitForTimeout(ms);
  const st = () => page.evaluate(() => game && { phase: game.phase, eng: FORMATS[game.fmt].eng, round: game.round, qi: game.qi, n: game.qs.length });

  async function playStep(eng, round, shot) {
    // une étape de la manche, en jouant plutôt bien
    if (eng === 'mcq') {
      if (round === 1 && await page.$('[data-g=joker]')) { await page.click('[data-g=joker]'); await sleep(50); }
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click(round === 2 ? '.opt:not(.gone)[data-v="1"], .opt:not(.gone)[data-v="2"]' : '[data-g=opt][data-v="0"]');
    } else if (eng === 'carte') {
      const box = await (await page.$('#map')).boundingBox();
      await page.mouse.click(box.x + box.width * .5, box.y + box.height * .5);
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=validate]');
    } else if (eng === 'frise') {
      await page.click('[data-g=yr][data-v="10"]');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=validate]');
    } else if (eng === 'sprint') {
      await sleep(100);
      for (let k = 0; k < 6; k++) {
        const pt = await page.evaluate((wrong) => {
          const id = game.st.queue[game.st.i], s = MAP.shapes[wrong ? (id === 'NGA' ? 'MLI' : 'NGA') : id], grp = document.getElementById('mapg');
          if (!s) return null;
          const [l0, a0, l1, a1] = s.mb, p = grp.ownerSVGElement.createSVGPoint(); p.x = (l0 + l1) / 2; p.y = -(a0 + a1) / 2;
          const sp = p.matrixTransform(grp.getScreenCTM()); return { x: sp.x, y: sp.y };
        }, k === 2);
        if (pt) await page.mouse.click(pt.x, pt.y);
        await sleep(60);
      }
      if (round === 0) { await page.click('[data-g=zin]'); await sleep(450); }
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=spskip]');
      await page.evaluate(() => { game.T.ms = 0; });
      await sleep(80);
    } else if (eng === 'capitales') {
      for (let k = 0; k < 4; k++) {
        const cap = await page.evaluate(() => CBY[game.qs[0].queue[game.st.i]].cap);
        await page.fill('#typein', k === 1 ? cap.slice(0, -1) + 'x' : cap);
        if (k === 1) await page.press('#typein', 'Enter');
        await sleep(40);
      }
      await page.fill('#typein', 'Zzzzz'); await page.press('#typein', 'Enter');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=capskip]');
      await page.evaluate(() => { game.T.ms = 0; }); await sleep(80);
    } else if (eng === 'listtype') {
      const labels = await page.evaluate(() => game.qs[0].items.map(i => i.label));
      for (const l of labels.slice(0, Math.ceil(labels.length / 2))) { await page.fill('#typein', l); await sleep(30); }
      await page.fill('#typein', 'Atlantide'); await page.press('#typein', 'Enter');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=listdone]');
    } else if (eng === 'petitbac') {
      const ans = await page.evaluate(() => { const D = pbDict(), L = game.qs[0].L.toLowerCase(); return game.qs[0].cats.map((c, i) => { const e = D[c].filter(x => x.keys.some(k => k[0] === L)); return i === 4 ? 'Zorglub' : e[Math.min(e.length - 1, i + 2)] ? e[Math.min(e.length - 1, i + 2)].label : ''; }); });
      for (let i = 0; i < ans.length; i++) await page.fill('#pb' + i, ans[i]);
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=pbdone]');
    } else if (eng === 'plusmoins') {
      for (let k = 0; k < 4; k++) {
        const up = await page.evaluate(() => { const q = game.qs[0], s = game.st; return q.chain[s.i + 1].v > q.chain[s.i].v; });
        const right = k < 3;
        if (k === 1 && shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
        await page.click(`[data-g=pm][data-v=${(up === right) ? 'up' : 'down'}]`);
        await sleep(right ? 950 : 1400);
      }
    } else if (eng === 'order') {
      const ord = await page.evaluate(() => { const q = game.qs[game.qi]; const s = q.items.slice().sort((a, b) => q.stat === 'chrono' ? a.v - b.v : b.v - a.v); return s.map(x => q.items.indexOf(x)); });
      const seq = round === 1 ? [ord[1], ord[0], ...ord.slice(2)] : ord;
      for (const i of seq) await page.click(`[data-g=ord][data-v="${i}"]`);
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=ordok]');
    } else if (eng === 'rafale') {
      for (let k = 0; k < 8; k++) {
        const ans = await page.evaluate(() => game.st && game.qs[0].items[game.st.i] ? game.qs[0].items[game.st.i].ans : null);
        if (ans == null || !(await page.$('[data-g=rf]'))) break;
        const nb = (await page.$$('[data-g=rf]')).length;
        if (k === 2 && shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
        const pick = k < 5 ? ans : (ans + 1) % nb;
        await page.click(`[data-g=rf][data-v="${pick}"]`);
        await sleep(k < 5 ? 470 : 950);
      }
      if (await page.evaluate(() => game.phase === 'q')) { await page.evaluate(() => { if (game.T) game.T.ms = 0; }); await sleep(80); }
    } else if (eng === 'connex') {
      const groups = await page.evaluate(() => [0, 1, 2, 3].map(gi => game.st.words.map((x, i) => x.gi === gi ? i : -1).filter(i => i >= 0)));
      // une erreur, puis les familles
      const wrong = [groups[0][0], groups[0][1], groups[0][2], groups[1][0]];
      for (const i of wrong) await page.click(`#cx${i}`);
      await page.click('#cxok'); await sleep(50); await page.click('[data-g=cxclr]');
      for (let gi = 0; gi < (round === 2 ? 2 : 4); gi++) {
        if (shot && gi === 1) await page.screenshot({ path: shot + '_q.png', fullPage: true });
        const ids = await page.evaluate(gi => game.st.words.map((x, i) => x.gi === gi ? i : -1).filter(i => i >= 0), gi);
        for (const i of ids) await page.click(`#cx${i}`);
        await page.click('#cxok'); await sleep(40);
      }
      if (round === 2) { for (let m = 0; m < 3; m++) { const ids = await page.evaluate(() => { const l = game.st.words.map((x, i) => i).filter(i => !game.st.solved.includes(game.st.words[i].gi)); const g2 = game.st.words[l[0]].gi; return [...l.filter(i => game.st.words[i].gi === g2).slice(0, 3), l.find(i => game.st.words[i].gi !== g2)]; }); for (const i of ids) await page.click(`#cx${i}`); await page.click('#cxok'); await sleep(40); } }
    } else if (eng === 'wordle') {
      const w = await page.evaluate(() => game.qs[0].word);
      const wrong = w.split('').reverse().join('');
      await page.keyboard.type(wrong); await page.keyboard.press('Enter'); await sleep(40);
      if (round === 1) { await page.click('[data-g=joker]'); }
      await page.click('[data-g=key][data-v=A]'); await page.click('[data-g=key][data-v=BK]');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      if (round === 2) { for (let k = 0; k < 5; k++) { await page.keyboard.type(wrong); await page.keyboard.press('Enter'); await sleep(30); } }
      else { await page.keyboard.type(w); await page.keyboard.press('Enter'); }
    } else if (eng === 'clues') {
      await page.fill('#typein', 'Bidule'); await page.press('#typein', 'Enter'); await sleep(40);
      if (round === 0 && await page.$('[data-g=joker]')) await page.click('[data-g=joker]');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      const a = await page.evaluate(() => game.qs[game.qi].ans);
      await page.fill('#typein', round === 2 ? 'zzz' : a); await page.press('#typein', 'Enter');
      if (round === 2) { await page.click('[data-g=clpass]').catch(() => {}); }
    } else if (eng === 'calc') {
      const key = await page.evaluate(() => game.manches[game.round].key);
      if (key !== 'compte') return playStep('rafale', round, shot);
      await page.click('.cbt >> nth=0'); await page.click('[data-g=cbo][data-v="+"]'); await page.click('.cbt >> nth=1'); await sleep(40);
      await page.click('.cbt >> nth=0'); await page.click('[data-g=cbo][data-v="÷"]'); await page.click('.cbt >> nth=2'); await sleep(40);
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      if (round === 1) { await page.click('[data-g=cbundo]'); }
      await page.click('[data-g=cbok]');
    } else if (eng === 'mystere') {
      await sleep(80);
      const info = await page.evaluate(() => { const t = CBY[game.st.target]; const others = COUNTRIES.filter(c => c.cont === t.cont && c.id !== t.id && MAP.shapes[c.id] && MAP.shapes[c.id].cen).slice(0, 3).map(c => c.name); return { name: t.name, others }; });
      for (const o of info.others) { await page.fill('#typein', o); await page.press('#typein', 'Enter'); await sleep(60); }
      await page.fill('#typein', 'Fr'); await page.dispatchEvent('#typein', 'input'); await sleep(40);
      if (round === 1 && await page.$('[data-g=joker]')) { await page.click('[data-g=joker]'); await sleep(50); }
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      if (round === 0) {
        const pt = await page.evaluate(() => { const s = MAP.shapes[game.st.target], grp = document.getElementById('mapg'); const p = grp.ownerSVGElement.createSVGPoint(); p.x = s.cen[0]; p.y = -s.cen[1]; const sp = p.matrixTransform(grp.getScreenCTM()); return { x: sp.x, y: sp.y }; });
        await page.mouse.click(pt.x, pt.y); await sleep(60);
        if (await page.$('[data-g=mygo]')) await page.click('[data-g=mygo]'); else { await page.fill('#typein', info.name); await page.press('#typein', 'Enter'); }
      } else if (round === 1) { await page.fill('#typein', info.name); await page.press('#typein', 'Enter'); }
      else { for (let k = 0; k < 8 && await page.evaluate(() => game.phase === 'q'); k++) { const n = await page.evaluate(k => COUNTRIES.filter(c => MAP.shapes[c.id] && MAP.shapes[c.id].cen && c.id !== game.st.target && !game.st.guesses.some(g => g.id === c.id))[k * 7].name, k); await page.fill('#typein', n); await page.press('#typein', 'Enter'); await sleep(40); } }
    } else if (eng === 'distance') {
      await page.click('[data-g=km] >> nth=3'); await page.click('[data-g=km] >> nth=2');
      if (round === 0) { const km = await page.evaluate(() => game.qs[game.qi].km); await page.evaluate(km => { game.km = km; }, Math.round(km * 1.04)); }
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=kmok]');
    } else if (eng === 'chaine') {
      for (let k = 0; k < 5; k++) { const w = await page.evaluate(() => { const o = chOptions(game); return o.length ? o[0].label : null; }); if (!w) break; await page.fill('#typein', w); await sleep(30); if (await page.evaluate(() => document.getElementById('typein').value)) { await page.press('#typein', 'Enter'); await sleep(30); } }
      await page.fill('#typein', 'Zzzqq'); await page.press('#typein', 'Enter');
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=chskip]');
      await page.evaluate(() => { game.T.ms = 0; }); await sleep(80);
    } else if (eng === 'anagram') {
      if (round === 1 && await page.$('[data-g=joker]')) { await page.click('[data-g=joker]'); }
      for (let k = 0; k < 3; k++) { const w = await page.evaluate(() => game.qs[0].items[game.st.i].label); await page.fill('#typein', w); await sleep(60); }
      if (shot) await page.screenshot({ path: shot + '_q.png', fullPage: true });
      await page.click('[data-g=anskip]'); await sleep(40);
      await page.fill('#typein', 'mauvais'); await page.press('#typein', 'Enter');
      await page.evaluate(() => { game.T.ms = 0; }); await sleep(120);
    } else if (eng === 'pairs') {
      await page.click('[data-g=pl][data-v="0"]'); await page.click('[data-g=pr][data-v="1"]');
      for (let i = 0; i < 5; i++) { await page.click(`[data-g=pl][data-v="${i}"]`); if (shot && i === 2) await page.screenshot({ path: shot + '_q.png', fullPage: true }); await page.click(`[data-g=pr][data-v="${i}"]`); }
    }
  }

  const summary = [];
  for (const f of fmts) {
    if (ONLY && !ONLY.includes(f)) continue;
    await page.click('[data-act=menu]'); await sleep(60);
    await page.click(`[data-act=practice][data-v=${f}]`); await sleep(60);
    if (f === fmts[0] || f === 'petitbac' || f === 'comptebon') await page.screenshot({ path: DIR + f + '_intro.png', fullPage: true });
    await page.click('[data-g=start]');
    let guard = 0;
    while (guard++ < 40) {
      const s = await st();
      if (!s || s.phase === 'end') break;
      if (s.phase === 'diff') { if (s.round === 0 && f === 'sprint') await page.screenshot({ path: DIR + f + '_diff.png', fullPage: true }); await page.click(`[data-g=diff][data-v="${s.round}"]`); await sleep(60); continue; }
      if (s.phase === 'q') {
        const shot = s.round === 0 && s.qi === 0 ? DIR + f : (s.round === 2 && s.qi === 0 ? DIR + f + '_r3' : null);
        try { await playStep(s.eng, s.round, shot); } catch (e) { errs.push(`STEP ${f} r${s.round}: ${e.message.split('\n')[0]}`); await page.evaluate(() => { if (game.phase === 'q') award(0, { ans: 'test' }); }); }
        await sleep(80);
        continue;
      }
      if (s.phase === 'reveal') {
        if (s.round === 0 && s.qi === 0) await page.screenshot({ path: DIR + f + '_rev.png', fullPage: true });
        await page.click('[data-g=next]'); await sleep(60); continue;
      }
    }
    console.log('done', f, JSON.stringify(await st()));
    await page.screenshot({ path: DIR + f + '_end.png', fullPage: true });
    const res = await page.evaluate(() => ({ score: game.score, rounds: game.roundPts.join('/'), stamps: (game.newStamps || []).length, ach: (game.newAch || []).map(a => a.id).join(',') }));
    const ov = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    summary.push(`${f}: ${res.score} (${res.rounds}) stamps+${res.stamps} ${res.ach}${ov ? ' OVERFLOW' : ''}`);
    await page.click('[data-g=exit]'); await sleep(60);
  }
  console.log(summary.join('\n'));
  // vues annexes
  await page.click('[data-act=menu]'); await sleep(60); await page.screenshot({ path: DIR + 'menu.png', fullPage: false });
  await page.click('.sheet [data-act=carnet]'); await sleep(100); await page.screenshot({ path: DIR + 'carnet.png', fullPage: true });
  await page.click('[data-act=back]'); await page.click('[data-act=menu]'); await sleep(60); await page.click('.sheet [data-act=trophees]'); await sleep(80); await page.screenshot({ path: DIR + 'trophees.png', fullPage: true });
  await page.click('[data-act=back]');
  await page.click('[data-act=tab][data-v=chat]'); await sleep(50);
  try { await page.click('[data-act=reactopen] >> nth=0'); await sleep(80); await page.click('.rxpick button >> nth=0'); } catch (e) { errs.push('TEST react ' + e.message.split('\n')[0]); }
  await page.screenshot({ path: DIR + 'home_after.png', fullPage: true });
  // défi du jour réel
  await page.click('[data-act=play]'); await sleep(60); await page.screenshot({ path: DIR + 'daily_intro.png', fullPage: true });
  await page.click('[data-g=start]');
  let guard = 0;
  while (guard++ < 40) {
    const s = await st(); if (!s || s.phase === 'end') break;
    if (s.phase === 'diff') { await page.click(`[data-g=diff][data-v="${s.round % 3}"]`); continue; }
    if (s.phase === 'q') { await playStep(s.eng, s.round, null); await sleep(60); continue; }
    if (s.phase === 'reveal') { await page.click('[data-g=next]'); continue; }
  }
  console.log('daily', JSON.stringify(await st()), await page.evaluate(() => today() + ' ' + fmtOf(today())));
  await page.screenshot({ path: DIR + 'daily_end.png', fullPage: true });
  if (errs.length) console.log(errs.join('\n'));
  await page.evaluate(() => { window.__shared = shareText(true); });
  console.log('SHARE:\n' + await page.evaluate(() => window.__shared));
  await page.click('[data-g=exit]', { timeout: 3000 }).catch(e => errs.push('TEST exit ' + e.message.split('\n')[0])); await sleep(100);
  await page.screenshot({ path: DIR + 'scores_after.png', fullPage: true });
  await page.click('[data-act=history]'); await sleep(80); await page.screenshot({ path: DIR + 'history.png', fullPage: true });
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();

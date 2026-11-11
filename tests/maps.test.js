const { chromium, URL: APP, OUT } = require('./lib');
(async () => {
  const browser = await chromium.launch({});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage(); const errs = [], reqs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue(); reqs.push(u.split('/')[2]); return r.abort(); });
  await page.goto(APP); await page.waitForTimeout(600);
  await page.click('[data-act=onbnext]'); await page.fill('#pseudo', 'Chems'); await page.click('button[type=submit]'); await page.waitForTimeout(500);
  const out = { ready: await page.evaluate(() => [MAP.ready, MAP.failed, Object.keys(MAP.shapes || {}).length]) };
  for (const f of ['paysmystere', 'carte', 'distance']) {
    await page.click('[data-act=menu]'); await page.click(`[data-act=practice][data-v=${f}]`); await page.waitForTimeout(300);
    await page.click('[data-g=start]'); await page.waitForTimeout(300);
    await page.click('[data-g=diff][data-v="0"]').catch(() => {}); await page.waitForTimeout(900);
    await page.screenshot({ path: `r12_${f}.png` });
    await page.evaluate(() => { exitGame ? (ui.confirm = null, game = null, render()) : 0; });
    await page.waitForTimeout(200);
  }
  out.errors = errs; out.hosts = [...new Set(reqs)];
  console.log(JSON.stringify(out));
  await browser.close();
})();

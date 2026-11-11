const { chromium, URL: APP, OUT } = require('./lib');
(async () => {
  const browser = await chromium.launch({});
  for (const dark of [false, true]) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: dark ? 'dark' : 'light' });
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(e.message));
    await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
    await page.goto(APP); await page.waitForTimeout(300);
    const P = dark ? 'd_' : '';
    await page.screenshot({ path: P + 'e_onb.png' });
    await page.click('[data-act=onbnext]'); await page.fill('#pseudo', 'Chems'); await page.click('button[type=submit]'); await page.waitForTimeout(200);
    await page.evaluate(() => { store.stats.fmts = { quiz: 7 }; save(); render(); });
    await page.evaluate(() => { startGame(true, 'petitbac'); }); await page.click('[data-g=start]'); // partie interne (plus d'entraînement dans le menu) : indépendante du jeu du jour
    for (let r = 0; r < 3; r++) { await page.click(`[data-g=diff][data-v="${r}"]`); await page.fill('#pb0', 'Paris'); await page.click('[data-g=pbdone]'); await page.click('[data-g=next]'); }
    await page.waitForTimeout(150);
    await page.screenshot({ path: P + 'e_end.png', fullPage: true });
    console.log(await page.evaluate(() => JSON.stringify(store.profile.pet) + ' ' + game.newUnlocks.map(u => u.cat + ':' + u.it.id).join(',')));
    await page.click('[data-g=topet]'); await page.waitForTimeout(150);
    await page.screenshot({ path: P + 'e_pet.png', fullPage: true });
    await page.click('[data-act=back]'); await page.waitForTimeout(100);
    await page.screenshot({ path: P + 'e_home.png' });
    console.log(dark ? 'dark' : 'light', errs.length ? errs : 'no errors');
    if (!(await page.evaluate(() => store.profile.pet.stage === '2'))) { console.log('EVOLUTION ATTENDUE : stade 2 après 8 parties'); process.exitCode = 1; }
    await ctx.close();
  }
  await browser.close();
})();

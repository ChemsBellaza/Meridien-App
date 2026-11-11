const { chromium, URL: APP, OUT } = require('./lib');
const fs = require('fs');
(async () => {
  const browser = await chromium.launch({});
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => { const u = r.request().url(); if (u.startsWith('file:')) return r.continue(); return r.abort(); });
  // migration : ancienne sauvegarde v1
  await page.addInitScript(() => { if (!localStorage.getItem("meridien.v1")) localStorage.setItem("meridien.v1", JSON.stringify({ v: 1, profile: { name: "Ancien", group: "G", code: "MER-AAAA", pet: { species: "renard", stage: "1", shiny: "normal", bg: "type" } }, plays: {}, chat: {}, carnet: {}, spent: 0, stats: { fmts: {}, perfect: 0, best: {} }, react: {}, ach: {} })); });
  await page.goto(APP); await page.waitForTimeout(500);
  const out = {};
  out.lang = await page.evaluate(() => document.documentElement.lang);
  out.viewport = await page.evaluate(() => !!document.querySelector('meta[name=viewport]'));
  out.migrated = await page.evaluate(() => [store.v, store.profile && store.profile.name]);
  // menu : focus dans le dialogue, Tab piégé, Échap ferme, focus rendu
  await page.focus('[data-act=menu]'); await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  out.dlgFocus = await page.evaluate(() => [!!document.querySelector('.sheet[aria-modal=true]'), document.activeElement.closest('.sheet') ? 'inside' : 'outside']);
  for (let i = 0; i < 60; i++) await page.keyboard.press('Tab');
  out.tabTrapped = await page.evaluate(() => document.activeElement.closest('.sheet') ? 'inside' : 'outside');
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  out.afterEsc = await page.evaluate(() => [!!document.querySelector('.sheet'), document.activeElement.dataset.act || document.activeElement.tagName]);
  // annonce
  await page.evaluate(() => announce("Test annonce")); await page.waitForTimeout(200);
  out.live = await page.evaluate(() => document.getElementById('live').textContent);
  // quota plein -> alerte
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('quota'); }; save(); });
  out.warn = await page.evaluate(() => { const w = document.getElementById('savewarn'); return w ? [w.getAttribute('role'), w.textContent.slice(0, 30)] : null; });
  await page.evaluate(() => { delete Storage.prototype.setItem; });
  await page.click('[data-act=menu]'); await page.click('[data-act=practice][data-v=petitbac]'); await page.waitForTimeout(300);
  await page.click('[data-g=start]'); await page.waitForTimeout(300);
  await page.click('[data-g=diff][data-v="0"]'); await page.waitForTimeout(400);
  out.timerRole = await page.evaluate(() => { const t = document.getElementById('timer'); return t ? t.getAttribute('role') : 'no-timer'; });
  // focus conservé après re-rendu : bouton quitter
  await page.focus('[data-g=quit]'); await page.evaluate(() => renderGame()); 
  out.focusKept = await page.evaluate(() => document.activeElement.dataset.g || document.activeElement.tagName);
  await page.keyboard.press('Enter'); await page.waitForTimeout(200);
  out.confirm = await page.evaluate(() => [!!document.querySelector('.confirm [aria-modal=true]'), document.activeElement.dataset.act]);
  await page.keyboard.press('Escape'); await page.waitForTimeout(200);
  out.afterConfirmEsc = await page.evaluate(() => [!!document.querySelector('.confirm'), document.activeElement.dataset.g || document.activeElement.tagName]);
  out.errors = errs;
  console.log(JSON.stringify(out, null, 1));
  await browser.close();
})();

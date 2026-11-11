const { chromium, URL: APP, OUT } = require('./lib');
(async () => {
  const browser = await chromium.launch({});
  const page = await browser.newPage({ viewport: { width: 1300, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(e.message));
  await page.route('**/*', r => r.request().url().startsWith('file:') ? r.continue() : r.abort());
  await page.goto(APP); await page.waitForTimeout(300);
  const shiny = process.argv[2] === 'shiny', mode = process.argv[3] || '';
  await page.evaluate(([shiny, mode]) => {
    const keys = SPECIES_ORDER();
    document.body.innerHTML = `<div style="display:grid;grid-template-columns:repeat(10,124px);gap:6px;padding:8px;background:#F4F2EC">${[1, 2, 3].map(st => keys.map(k => `<div style="width:124px;height:124px;border-radius:14px;overflow:hidden">${petSVG({ species: k, stage: String(st), shiny: shiny ? 'shiny' : 'normal', bg: 'type' }, { mood: mode || null })}</div>`).join('')).join('')}
      ${keys.map(k => `<div style="display:flex;gap:4px">${[1, 2, 3].map(st => `<span style="width:38px;height:38px;border-radius:50%;overflow:hidden;display:inline-block">${petSVG({ species: k, stage: String(st), bg: 'type' }, { head: true, plain: true })}</span>`).join('')}</div>`).join('')}</div>`;
    document.querySelectorAll('svg').forEach(s => { s.style.width = '100%'; s.style.height = '100%'; });
  }, [shiny, mode]);
  await page.screenshot({ path: `pets_${shiny ? 'shiny' : 'normal'}${mode}.png`, fullPage: true });
  console.log(errs.length ? errs : 'ok');
  await browser.close();
})();

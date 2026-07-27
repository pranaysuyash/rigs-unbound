// Step 21: fit Lug tyres at the silo.
const path = require('path');
const playwright = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const PROFILE = path.resolve(__dirname, 'playtest2-achiever/.profile');
const SHOT_DIR = path.resolve(__dirname, 'playtest2-achiever');
let n = 30;
async function shot(page, label) {
  n++;
  const f = path.join(SHOT_DIR, String(n).padStart(2, '0') + '-' + label + '.png');
  await page.screenshot({ path: f }); console.log('SHOT', f);
}

(async () => {
  const ctx = await playwright.chromium.launchPersistentContext(PROFILE, {
    headless: false, channel: 'chrome', viewport: { width: 1280, height: 800 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  page.on('pageerror', e => console.log('PAGE-ERR', String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#enter-world'); if (b && b.offsetParent) b.click(); });
  await page.waitForTimeout(1500);
  await page.evaluate(() => { [...document.querySelectorAll('button')].forEach(b => { if (/Got it/i.test(b.innerText)) b.click(); }); });

  // brake to a stop
  await page.keyboard.down('s'); await page.waitForTimeout(1500); await page.keyboard.up('s');
  await page.waitForTimeout(800);

  // look for a parts menu in DOM
  const menu = await page.evaluate(() => {
    const t = document.body.innerText;
    const idx = t.search(/fit a part|lug|module|parts|tyres|tires/i);
    return { idx, around: idx >= 0 ? t.slice(Math.max(0, idx - 300), idx + 1200) : null };
  });
  console.log('MENU:', JSON.stringify(menu, null, 1));
  await shot(page, 'parts-menu');

  // try number keys 1..6 and observe salvage/capability changes
  for (const k of ['1', '2', '3']) {
    const before = await page.evaluate(() => {
      const t = document.body.innerText;
      return { salv: (t.match(/SALVAGE\n(\d+)/) || [])[1], cap: (t.match(/CAPABILITY\n([^\n]+)/) || [])[1], quest: (t.match(/FIRST FIT\n([^\n]+)/) || [])[1] };
    });
    await page.keyboard.press(k);
    await page.waitForTimeout(900);
    const after = await page.evaluate(() => {
      const t = document.body.innerText;
      return { salv: (t.match(/SALVAGE\n(\d+)/) || [])[1], cap: (t.match(/CAPABILITY\n([^\n]+)/) || [])[1], quest: (t.match(/FIRST FIT\n([^\n]+)/) || [])[1] };
    });
    console.log('key', k, JSON.stringify(before), '->', JSON.stringify(after));
    if (before.salv !== after.salv || before.cap !== after.cap) { console.log('CHANGE DETECTED on key', k); break; }
  }
  await shot(page, 'after-fit-attempt');
  const lines = await page.evaluate(() => document.body.innerText.split('\n').filter(l => /lug|tyre|tire|fitted|module|part/i.test(l)).slice(0, 10));
  console.log('LINES:', JSON.stringify(lines));
  await ctx.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

// Step 23: plough more, then try cargo-relay tow.
const path = require('path');
const playwright = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const PROFILE = path.resolve(__dirname, 'playtest2-achiever/.profile');
const SHOT_DIR = path.resolve(__dirname, 'playtest2-achiever');
let n = 34;
async function shot(page, label) {
  n++;
  const f = path.join(SHOT_DIR, String(n).padStart(2, '0') + '-' + label + '.png');
  await page.screenshot({ path: f }); console.log('SHOT', f);
}
const probe = (page) => page.evaluate(() => {
  const t = document.body.innerText;
  const g = (re) => { const m = t.match(re); return m && m[1]; };
  return {
    x: +(g(/X:\s*([-\d.]+)/) || 0), z: +(g(/Z:\s*([-\d.]+)/) || 0),
    cond: g(/CONDITION\n(\d+)%/), salv: g(/SALVAGE\n(\d+)/),
    speed: g(/(\d+)\s*km\/h/), quest: g(/FIRST FIT\n([^\n]+)/),
    disabled: /Rig disabled/i.test(t),
  };
});

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
  await page.evaluate(() => { [...document.querySelectorAll('button')].forEach(b => { if (/Got it|CLOSE/i.test(b.innerText)) b.click(); }); });

  console.log('start', JSON.stringify(await probe(page)));

  // plough: blade down, drive slow arcs for ~25s
  await page.keyboard.press(' '); // ensure blade state? check quest text after
  await page.waitForTimeout(500);
  const bstate = await page.evaluate(() => /raise blade/i.test(document.body.innerText));
  console.log('blade down now?', bstate);
  if (!bstate) { await page.keyboard.press(' '); await page.waitForTimeout(400); }
  for (let k = 0; k < 6; k++) {
    await page.keyboard.down('w');
    await page.keyboard.down(k % 2 ? 'a' : 'd');
    await page.waitForTimeout(2200);
    await page.keyboard.up(k % 2 ? 'a' : 'd');
    await page.keyboard.up('w');
    const p = await probe(page);
    console.log('plough k' + k, JSON.stringify(p));
    if (p.disabled) break;
  }
  await shot(page, 'ploughing');
  // raise blade
  await page.keyboard.press(' ');

  // check quest/cargo state via RGT (#4)
  const rgt = await page.evaluate(() => {
    const d = JSON.parse(window.render_game_to_text());
    return { activity: d.activity, quest: d.progression && d.progression.firstRung, furrows: d.worldMemory };
  });
  console.log('RGT:', JSON.stringify(rgt).slice(0, 1200));
  await ctx.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

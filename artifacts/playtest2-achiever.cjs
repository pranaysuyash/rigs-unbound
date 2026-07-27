// Step 22: drive to Long Furrow, lower blade, till.
const path = require('path');
const playwright = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const PROFILE = path.resolve(__dirname, 'playtest2-achiever/.profile');
const SHOT_DIR = path.resolve(__dirname, 'playtest2-achiever');
let n = 32;
async function shot(page, label) {
  n++;
  const f = path.join(SHOT_DIR, String(n).padStart(2, '0') + '-' + label + '.png');
  await page.screenshot({ path: f }); console.log('SHOT', f);
}
const probe = (page) => page.evaluate(() => {
  const t = document.body.innerText;
  const pos = t.match(/X:\s*([-\d.]+)\s*Z:\s*([-\d.]+)/);
  const cond = t.match(/CONDITION\n(\d+)%/);
  const salv = t.match(/SALVAGE\n(\d+)/);
  const speed = t.match(/(\d+)\s*km\/h/);
  const quest = t.match(/FIRST FIT\n([^\n]+)/);
  const grip = t.match(/GRIP[\s\S]{0,40}?(\d+)%/);
  return { x: pos && +pos[1], z: pos && +pos[2], cond: cond && +cond[1], salv: salv && +salv[1],
           speed: speed && +speed[1], quest: quest && quest[1], grip: grip && grip[1], disabled: /Rig disabled/i.test(t) };
});
function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }
async function driveTo(page, tx, tz, arrive = 6, maxIter = 120) {
  let travelH = null, prev = null;
  for (let i = 0; i < maxIter; i++) {
    const p = await probe(page);
    if (p.disabled) { await page.keyboard.press('x'); await page.waitForTimeout(3000); travelH = null; prev = null; continue; }
    const dist = Math.hypot(tx - p.x, tz - p.z);
    if (dist < arrive) return true;
    const desiredH = Math.atan2(tx - p.x, tz - p.z);
    let steer = null;
    if (travelH !== null) {
      const err = wrapPi(desiredH - travelH);
      if (err > 0.45) steer = 'd'; else if (err < -0.45) steer = 'a';
    }
    if (dist < 8 && p.speed > 6) { await page.keyboard.down('s'); await page.waitForTimeout(200); await page.keyboard.up('s'); }
    await page.keyboard.down('w');
    if (steer) await page.keyboard.down(steer);
    await page.waitForTimeout(dist > 20 ? 450 : 200);
    if (steer) await page.keyboard.up(steer);
    await page.keyboard.up('w');
    const q = await probe(page);
    if (prev) {
      const mv = Math.hypot(q.x - prev.x, q.z - prev.z);
      if (mv > 0.25) travelH = Math.atan2(q.x - prev.x, q.z - prev.z);
      else { await page.keyboard.down('s'); await page.waitForTimeout(900); await page.keyboard.up('s'); travelH = null; }
    }
    prev = q;
    if (i % 10 === 0) console.log('i' + i, JSON.stringify(q));
  }
  return false;
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
  await page.evaluate(() => { [...document.querySelectorAll('button')].forEach(b => { if (/Got it|CLOSE/i.test(b.innerText)) b.click(); }); });

  console.log('start', JSON.stringify(await probe(page)));
  await driveTo(page, 18, -46, 8);
  console.log('at Long Furrow', JSON.stringify(await probe(page)));
  await shot(page, 'at-long-furrow');

  // lower blade and drive to till
  await page.keyboard.press(' ');
  await page.waitForTimeout(600);
  console.log('blade lowered?', JSON.stringify(await probe(page)));
  await page.keyboard.down('w');
  await page.waitForTimeout(4000);
  await page.keyboard.up('w');
  console.log('after till drive', JSON.stringify(await probe(page)));
  await shot(page, 'after-till');
  const lines = await page.evaluate(() => document.body.innerText.split('\n').filter(l => /furrow|till|plough|blade|soil|ground/i.test(l)).slice(0, 10));
  console.log('LINES:', JSON.stringify(lines));
  await ctx.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

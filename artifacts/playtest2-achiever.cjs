// Step 19: recover, then slow-approach the first cache from the silo.
const path = require('path');
const playwright = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const PROFILE = path.resolve(__dirname, 'playtest2-achiever/.profile');
const SHOT_DIR = path.resolve(__dirname, 'playtest2-achiever');
let n = 27;
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
  return { x: pos && +pos[1], z: pos && +pos[2], cond: cond && +cond[1], salv: salv && +salv[1],
           speed: speed && +speed[1], inReach: /Salvage in reach/i.test(t), disabled: /Rig disabled/i.test(t) };
});
function wrapPi(a) { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; }

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

  let p = await probe(page);
  console.log('start', JSON.stringify(p));
  if (p.disabled || Math.hypot(p.x - 0, p.z - 3) > 40) {
    await page.keyboard.press('x');
    await page.waitForTimeout(3000);
    p = await probe(page);
    console.log('recovered:', JSON.stringify(p));
    await shot(page, 'recovered-2');
  }

  const TX = -18, TZ = 5;
  let travelH = null;
  let prevPos = { x: p.x, z: p.z };

  for (let i = 0; i < 250; i++) {
    p = await probe(page);
    if (p.salv > 0) { console.log('COLLECTED!', JSON.stringify(p)); break; }
    if (p.disabled) { await page.keyboard.press('x'); await page.waitForTimeout(3000); prevPos = null; travelH = null; continue; }
    const dist = Math.hypot(TX - p.x, TZ - p.z);
    if (p.inReach && p.speed <= 2) {
      await page.keyboard.press(' ');
      await page.waitForTimeout(900);
      const q = await probe(page);
      console.log('SPACE at dist', dist.toFixed(1), '-> salv', q.salv, 'inReach', q.inReach);
      if (q.salv > 0) { console.log('COLLECTED!'); break; }
      continue;
    }
    if (p.inReach && p.speed > 2) { await page.keyboard.down('s'); await page.waitForTimeout(250); await page.keyboard.up('s'); continue; }

    // steering
    const desiredH = Math.atan2(TX - p.x, TZ - p.z);
    // speed management
    if (dist < 7 && p.speed > 4) { await page.keyboard.down('s'); await page.waitForTimeout(200); await page.keyboard.up('s'); prevPos = { x: p.x, z: p.z }; continue; }
    let steer = null;
    if (travelH !== null) {
      const err = wrapPi(desiredH - travelH);
      if (err > 0.45) steer = 'd'; else if (err < -0.45) steer = 'a';
    }
    const tap = dist > 15 ? 350 : 140;
    await page.keyboard.down('w');
    if (steer) await page.keyboard.down(steer);
    await page.waitForTimeout(tap);
    if (steer) await page.keyboard.up(steer);
    await page.keyboard.up('w');
    const q = await probe(page);
    const mv = prevPos ? Math.hypot(q.x - prevPos.x, q.z - prevPos.z) : 0;
    if (mv > 0.25) travelH = Math.atan2(q.x - prevPos.x, q.z - prevPos.z);
    prevPos = { x: q.x, z: q.z };
    if (i % 6 === 0) console.log('i' + i, 'pos', q.x.toFixed(1) + ',' + q.z.toFixed(1), 'dist', Math.hypot(TX - q.x, TZ - q.z).toFixed(1), 'spd', q.speed, 'cond', q.cond, 'inReach', q.inReach);
  }
  const end = await probe(page);
  console.log('END', JSON.stringify(end));
  await shot(page, 'collect3-end');
  const questLine = await page.evaluate(() => { const m = document.body.innerText.match(/FIRST FIT\n([^\n]+)/); return m && m[1]; });
  console.log('quest:', questLine);
  await ctx.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

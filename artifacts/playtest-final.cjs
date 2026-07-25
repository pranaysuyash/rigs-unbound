// Final combined run as Torque:
// 1) engage plough, drive toward Long Furrow (TILL) and till soil
// 2) then careful salvage approach with v4 logic
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  const readHud = async () => page.evaluate(() => {
    const t = document.body.innerText;
    const g = t.match(/([NSEW]{1,2})\s*·\s*salvage\s*([\d.]+)\s*m\s*·\s*(\d+)\s*unit/i);
    const block = t.match(/CONDITION\s*\n\s*(\d+)%\s*\n\s*SALVAGE\s*\n\s*(\d+)\s*\n\s*SURVEYED\s*\n\s*(\d+)%/i);
    const spd = t.match(/SPEED\s*\n\s*([\d.]+)\s*km\/h/i);
    const cap = t.match(/CAPABILITY\s*\n\s*([^\n]+)/i);
    const lf = t.match(/Long Furrow[\s\S]{0,30}?([\d.]+)\s*m/i);
    return {
      dist: g ? parseFloat(g[2]) : null, bearing: g?.[1], units: g ? parseInt(g[3]) : null,
      salvage: block ? parseInt(block[2]) : null, condition: block ? parseInt(block[1]) : null,
      speed: spd ? parseFloat(spd[1]) : null, cap: cap?.[1], longFurrow: lf ? parseFloat(lf[1]) : null,
    };
  });
  const dismissModal = async () => {
    const m = await page.getByText('ENTER THE FIELD', { exact: false }).first();
    if (await m.isVisible().catch(() => false)) { await m.click(); await page.waitForTimeout(250); }
  };
  const shot = (n) => page.screenshot({ path: `artifacts/playtest-achiever/${n}.png` });
  const drive = async (keys, ms) => {
    for (const k of keys) await page.keyboard.down(k);
    await page.waitForTimeout(ms);
    for (const k of keys) await page.keyboard.up(k);
  };

  await dismissModal();
  // engage plough and drive forward, weaving, for ~40s of tilling
  await page.keyboard.press('Space');
  await page.waitForTimeout(300);
  let h = await readHud();
  console.log('plough engaged?', h.cap);
  const t0 = Date.now();
  let shotN = 90;
  while (Date.now() - t0 < 45000) {
    await dismissModal();
    await drive(['w'], 3000);
    await drive(['w', 'a'], 900);
    await drive(['w'], 2000);
    await drive(['w', 'd'], 900);
    h = await readHud();
    console.log(`till t=${((Date.now() - t0) / 1000).toFixed(0)}s`, JSON.stringify(h));
    if ((Date.now() - t0) > 20000 && shotN === 90) { await shot('90-tilling'); shotN++; }
  }
  await shot('91-tilled');
  await page.keyboard.press('Space'); // disengage
  await page.waitForTimeout(300);

  // salvage approach, Torque, patient
  let lastSalvage = h.salvage ?? 0, stuckTicks = 0;
  const t1 = Date.now();
  while (Date.now() - t1 < 130000) {
    await dismissModal();
    const h0 = await readHud();
    if (h0.salvage !== null && h0.salvage > lastSalvage) {
      lastSalvage = h0.salvage;
      console.log(`*** SALVAGE = ${lastSalvage}`);
      await shot(`92-salvage-${lastSalvage}`);
      if (lastSalvage >= 2) break;
    }
    if (h0.dist === null) { await drive(['w'], 600); continue; }
    const close = h0.dist < 15;
    if (h0.speed !== null && h0.speed < 1.5) {
      stuckTicks++;
      if (stuckTicks >= 6) {
        await drive(['s'], 1500);
        await drive(['s', 'a'], 900);
        stuckTicks = 0;
        continue;
      }
    } else stuckTicks = 0;
    await drive(['w'], close ? 350 : 700);
    const h1 = await readHud();
    if (h1.dist === null) continue;
    if (h1.dist < h0.dist - 0.05) continue;
    await drive(['w', 'd'], 400);
    const h2 = await readHud();
    if (h2.dist !== null && h2.dist < h1.dist - 0.05) continue;
    await drive(['w', 'a'], 700);
  }
  const fin = await readHud();
  console.log('FINAL', JSON.stringify(fin));
  await shot('93-end');
  await browser.close();
})();

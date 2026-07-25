// Explorer: (a) try R to cycle rigs and compare, (b) drive to Long Furrow and plough.
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

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
  const hud = async () => page.evaluate(() => {
    const t = document.body.innerText;
    const rig = t.match(/RIG\s*\n\s*(\S+)/i);
    const block = t.match(/CONDITION\s*\n\s*(\d+)%\s*\n\s*SALVAGE\s*\n\s*(\d+)\s*\n\s*SURVEYED\s*\n\s*(\d+)%/i);
    const spd = t.match(/SPEED\s*\n\s*([\d.]+)\s*km\/h/i);
    const cap = t.match(/CAPABILITY\s*\n\s*([^\n]+)/i);
    return { rig: rig?.[1], salvage: block?.[2], condition: block?.[1], surveyed: block?.[3], speed: spd?.[1], cap: cap?.[1] };
  });

  await dismissModal();
  // (a) cycle rigs with R
  await page.keyboard.press('r');
  await page.waitForTimeout(600);
  await shot('60-rig-R');
  console.log('after R:', JSON.stringify(await hud()));
  await page.keyboard.press('r');
  await page.waitForTimeout(600);
  await shot('61-rig-R2');
  console.log('after R2:', JSON.stringify(await hud()));
  // drive whatever we have now
  await drive(['w'], 2500);
  await shot('62-rig-drive');
  console.log('driving:', JSON.stringify(await hud()));
  await page.keyboard.press('r');
  await page.waitForTimeout(600);
  await shot('63-rig-R3');
  console.log('after R3:', JSON.stringify(await hud()));

  await browser.close();
})();

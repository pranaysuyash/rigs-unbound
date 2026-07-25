const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('console', m => console.log('[console]', m.type(), m.text().slice(0, 200)));
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'artifacts/playtest-casual/01-first-load.png' });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'artifacts/playtest-casual/02-after-6s.png' });
  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

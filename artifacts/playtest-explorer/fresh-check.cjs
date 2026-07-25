const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(4500);
  await page.screenshot({ path: 'artifacts/playtest-explorer/86-fresh-profile.png' });
  const t = await page.evaluate(() => document.body.innerText.slice(0, 500));
  const ls = await page.evaluate(() => Object.keys(localStorage));
  console.log('LS KEYS:', JSON.stringify(ls));
  console.log('TEXT:', t.replace(/\n/g, ' | ').slice(0, 400));
  await browser.close();
})();

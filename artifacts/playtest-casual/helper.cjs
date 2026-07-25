const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

let n = 20;
let page;
async function boot() {
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => console.log('[pageerror]', String(e).slice(0, 300)));
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'load', timeout: 30000 });
  await page.waitForTimeout(4000);
  return browser;
}
async function shot(label) {
  const f = `/Users/pranay/Projects/Game_dev/rigs-unbound/artifacts/playtest-casual/${String(n++).padStart(2,'0')}-${label}.png`;
  await page.screenshot({ path: f });
  console.log('shot:', f);
}
async function dismiss() {
  await page.mouse.click(463, 447); // ENTER THE FIELD button (real coords in 1280x800)
  await page.waitForTimeout(800);
}
module.exports = { boot, shot, dismiss, get page() { return page; } };

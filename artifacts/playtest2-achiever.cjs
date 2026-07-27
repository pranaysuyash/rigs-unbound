// Step 29: Space to engage blade; watch quest line only (no RGT).
const path = require('path');
const playwright = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const PROFILE = path.resolve(__dirname, 'playtest2-achiever/.profile');

(async () => {
  const ctx = await playwright.chromium.launchPersistentContext(PROFILE, {
    headless: false, channel: 'chrome', viewport: { width: 1280, height: 800 },
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.evaluate(() => { const b = document.querySelector('#enter-world'); if (b && b.offsetParent) b.click(); });
  await page.waitForTimeout(1500);
  const quest = () => page.evaluate(() => { const m = document.body.innerText.match(/FIRST FIT\n([^\n]+)/); return m && m[1]; });
  console.log('quest before:', await quest());
  await page.keyboard.press(' ');
  await page.waitForTimeout(1000);
  console.log('quest after Space:', await quest());
  await page.keyboard.down('w'); await page.waitForTimeout(3000); await page.keyboard.up('w');
  console.log('quest after drive:', await quest());
  const toast = await page.evaluate(() => document.body.innerText.split('\n').filter(l => /blade|furrow|plough|cut/i.test(l)).slice(0, 8));
  console.log('lines:', JSON.stringify(toast));
  await ctx.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });

// Playtest driver: runs a list of steps from a JSON file against the live game.
// Step types:
//  {shot:"name"}                       -> screenshot
//  {wait:ms}
//  {click:[x,y]}
//  {clickText:"ENTER THE FIELD"}       -> click element containing text
//  {key:"w", ms:1500}                  -> hold key for ms (down, wait, up)
//  {keys:["w","a"], ms:2000}           -> hold multiple keys
//  {tap:"m"}                           -> quick press
//  {text:"window.render_game_to_text()"} -> evaluate and print (counted separately)
//  {eval:"..."}                        -> arbitrary evaluate, print result
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');
const fs = require('fs');

(async () => {
  const stepsFile = process.argv[2];
  const steps = JSON.parse(fs.readFileSync(stepsFile, 'utf8'));
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);

  for (const s of steps) {
    try {
      // auto-dismiss the intro/briefing modal if it has (re)appeared
      const modal = await page.getByText('ENTER THE FIELD', { exact: false }).first();
      if (await modal.isVisible().catch(() => false)) {
        await modal.click();
        await page.waitForTimeout(250);
      }
      if (s.shot) {
        await page.screenshot({ path: `artifacts/playtest-achiever/${s.shot}.png` });
        console.log('shot:', s.shot);
      } else if (s.wait) {
        await page.waitForTimeout(s.wait);
      } else if (s.click) {
        await page.mouse.click(s.click[0], s.click[1]);
        await page.waitForTimeout(300);
      } else if (s.clickText) {
        await page.getByText(s.clickText, { exact: false }).first().click();
        await page.waitForTimeout(300);
      } else if (s.key) {
        await page.keyboard.down(s.key);
        await page.waitForTimeout(s.ms || 1000);
        await page.keyboard.up(s.key);
      } else if (s.keys) {
        for (const k of s.keys) await page.keyboard.down(k);
        await page.waitForTimeout(s.ms || 1000);
        for (const k of s.keys) await page.keyboard.up(k);
      } else if (s.tap) {
        await page.keyboard.press(s.tap);
        await page.waitForTimeout(200);
      } else if (s.text) {
        const r = await page.evaluate(() => window.render_game_to_text());
        console.log('[text]', typeof r === 'string' ? r.slice(0, 3000) : JSON.stringify(r).slice(0, 3000));
      } else if (s.eval) {
        const r = await page.evaluate(s.eval);
        console.log('[eval]', JSON.stringify(r).slice(0, 2000));
      }
    } catch (e) {
      console.log('[step-error]', JSON.stringify(s), e.message);
    }
  }
  await browser.close();
})();

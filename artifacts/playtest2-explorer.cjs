// Explorer persona playtest driver. Reads a plan file (JSON array of steps) and executes.
// Steps: {shot:"name"} | {key:"KeyW", ms:2000} | {keys:["w","a"], ms:1000} | {click:[x,y]} |
//        {wait:ms} | {text:true} (render_game_to_text) | {eval:"js"} | {reload:true}
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

const SHOTS = path.join(__dirname, 'playtest2-explorer');
const planFile = process.argv[2];
const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Users/pranay/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const consoleMsgs = [];
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') consoleMsgs.push(`[${m.type()}] ${m.text()}`); });
  page.on('pageerror', (e) => consoleMsgs.push(`[pageerror] ${e.message}`));

  if (!plan.resume) {
    await page.goto('http://127.0.0.1:4180/', { waitUntil: 'networkidle', timeout: 30000 }).catch(e => console.log('goto warn:', e.message));
    await page.waitForTimeout(3000);
  } else {
    // resume mode: connect to nothing, just note
  }

  for (const step of plan.steps) {
    try {
      if (step.wait) { await page.waitForTimeout(step.wait); }
      else if (step.shot) { await page.screenshot({ path: path.join(SHOTS, step.shot + '.png') }); console.log('shot:', step.shot); }
      else if (step.key) { await page.keyboard.down(step.key); await page.waitForTimeout(step.ms || 500); await page.keyboard.up(step.key); }
      else if (step.keys) { for (const k of step.keys) await page.keyboard.down(k); await page.waitForTimeout(step.ms || 500); for (const k of step.keys) await page.keyboard.up(k); }
      else if (step.tap) { await page.keyboard.press(step.tap); await page.waitForTimeout(step.after || 150); }
      else if (step.click) { await page.mouse.click(step.click[0], step.click[1]); await page.waitForTimeout(step.after || 300); }
      else if (step.move) { await page.mouse.move(step.move[0], step.move[1]); }
      else if (step.drag) { await page.mouse.move(step.drag[0], step.drag[1]); await page.mouse.down(); await page.mouse.move(step.drag[2], step.drag[3], { steps: 10 }); await page.mouse.up(); }
      else if (step.text) { const t = await page.evaluate(() => (typeof window.render_game_to_text === 'function') ? window.render_game_to_text() : 'NO_FN'); console.log('TEXT>>>', String(t).slice(0, 4000), '<<<TEXT'); }
      else if (step.eval) { const r = await page.evaluate(step.eval); console.log('EVAL>>>', JSON.stringify(r)?.slice(0, 2000), '<<<EVAL'); }
      else if (step.reload) { await page.reload({ waitUntil: 'networkidle' }).catch(()=>{}); await page.waitForTimeout(3000); }
    } catch (e) { console.log('step error:', step, e.message); }
  }
  if (consoleMsgs.length) { console.log('CONSOLE:'); for (const m of consoleMsgs.slice(0, 30)) console.log(' ', m); }
  await browser.close();
})();

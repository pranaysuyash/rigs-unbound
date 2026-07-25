// Persistent playtest driver. Watches queue.ndjson for commands, one JSON per line.
const fs = require('fs');
const path = require('path');
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

const DIR = 'artifacts/playtest-explorer';
const QUEUE = path.join(DIR, 'queue.ndjson');
const OUT = path.join(DIR, 'out.ndjson');

function out(obj) {
  fs.appendFileSync(OUT, JSON.stringify({ t: new Date().toISOString(), ...obj }) + '\n');
}

(async () => {
  fs.writeFileSync(OUT, '');
  fs.writeFileSync(QUEUE, '');
  const browser = await chromium.launch({ channel: 'chrome', headless: true, args: ['--enable-webgl'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => out({ err: 'PAGEERROR: ' + e.message }));
  page.on('console', m => { if (m.type() === 'error') out({ err: 'CONSOLE: ' + m.text().slice(0, 300) }); });
  await page.goto('http://127.0.0.1:4174/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3500);
  out({ ok: 'booted' });

  let offset = 0;
  const keysDown = new Set();
  async function exec(cmd) {
    try {
      switch (cmd.op) {
        case 'shot': await page.screenshot({ path: `${DIR}/${cmd.name}.png` }); out({ ok: 'shot ' + cmd.name }); break;
        case 'wait': await page.waitForTimeout(cmd.ms); out({ ok: 'waited' }); break;
        case 'keydown': await page.keyboard.down(cmd.key); keysDown.add(cmd.key); out({ ok: 'down ' + cmd.key }); break;
        case 'keyup': await page.keyboard.up(cmd.key); keysDown.delete(cmd.key); out({ ok: 'up ' + cmd.key }); break;
        case 'hold': await page.keyboard.down(cmd.key); await page.waitForTimeout(cmd.ms); await page.keyboard.up(cmd.key); out({ ok: 'held ' + cmd.key }); break;
        case 'press': await page.keyboard.press(cmd.key); out({ ok: 'pressed ' + cmd.key }); break;
        case 'click': await page.click(`text=${cmd.text}`, { timeout: 3000 }); out({ ok: 'clicked ' + cmd.text }); break;
        case 'clickxy': await page.mouse.click(cmd.x, cmd.y); out({ ok: 'clickxy' }); break;
        case 'move': await page.mouse.move(cmd.x, cmd.y, { steps: 10 }); out({ ok: 'move' }); break;
        case 'text': { const t = await page.evaluate(() => document.body.innerText); out({ text: t.slice(0, cmd.n || 2500) }); break; }
        case 'rgt': { const t = await page.evaluate(() => window.render_game_to_text()); out({ rgt: String(t).slice(0, cmd.n || 3000) }); break; }
        case 'eval': { const r = await page.evaluate(cmd.js); out({ eval: JSON.stringify(r)?.slice(0, 2000) }); break; }
        case 'releaseAll': for (const k of keysDown) await page.keyboard.up(k); keysDown.clear(); out({ ok: 'released' }); break;
        default: out({ err: 'unknown op ' + cmd.op });
      }
    } catch (e) { out({ err: cmd.op + ' failed: ' + e.message.slice(0, 300) }); }
  }

  setInterval(async () => {
    const data = fs.readFileSync(QUEUE, 'utf8');
    if (data.length <= offset) return;
    const chunk = data.slice(offset);
    offset = data.length;
    for (const line of chunk.split('\n')) {
      if (!line.trim()) continue;
      let cmd; try { cmd = JSON.parse(line); } catch { out({ err: 'bad json: ' + line }); continue; }
      await exec(cmd);
    }
  }, 400);
})();

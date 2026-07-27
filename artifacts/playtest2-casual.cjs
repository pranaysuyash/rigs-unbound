// First-time casual player driver. Usage:
//   node artifacts/playtest2-casual.cjs launch     -> start persistent headless chromium w/ CDP
//   node artifacts/playtest2-casual.cjs <step>     -> connect, run step, screenshot
const path = require('path');
const fs = require('fs');
const { chromium } = require('/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright');

const SHOTS = path.join(__dirname, 'playtest2-casual');
const PROFILE = path.join(__dirname, 'playtest2-casual-profile');
const URL = 'http://127.0.0.1:4174/';
const CDP = 'http://127.0.0.1:9222';

function shot(page, name) {
  return page.screenshot({ path: path.join(SHOTS, name + '.png'), timeout: 90000 });
}

async function press(page, key, ms) {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
}

const steps = {
  // ---- boot: look at exactly what the game shows a first-timer ----
  async boot(page) {
    await page.goto(URL, { waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await shot(page, '01-boot');
    await page.waitForTimeout(3000);
    await shot(page, '02-boot-later');
    const txt = await page.evaluate(() => document.body.innerText.slice(0, 2000));
    console.log('BODYTEXT>>>' + txt + '<<<');
  },
  async shot(page, name) {
    await shot(page, name);
  },
  async click(page, x, y, name) {
    await page.mouse.click(Number(x), Number(y));
    await page.waitForTimeout(1200);
    await shot(page, name);
  },
  async key(page, k, ms, name) {
    await press(page, k, Number(ms));
    await page.waitForTimeout(400);
    await shot(page, name);
  },
  async keys(page, spec, name) {
    // spec like "KeyW:2000,KeyD:500"
    for (const part of spec.split(',')) {
      const [k, ms] = part.split(':');
      await press(page, k, Number(ms));
      await page.waitForTimeout(150);
    }
    await shot(page, name);
  },
  async hold(page, spec, name) {
    // hold multiple keys simultaneously: "KeyW+KeyD:2000"
    const [keys, ms] = spec.split(':');
    const list = keys.split('+');
    for (const k of list) await page.keyboard.down(k);
    await page.waitForTimeout(Number(ms));
    for (const k of list) await page.keyboard.up(k);
    await page.waitForTimeout(300);
    await shot(page, name);
  },
  async reload(page, name) {
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(4000);
    await shot(page, name);
  },
  async text(page) {
    const has = await page.evaluate(() => typeof window.render_game_to_text === 'function');
    if (has) {
      const t = await page.evaluate(() => window.render_game_to_text());
      console.log('GAMETEXT>>>' + String(t).slice(0, 3000) + '<<<');
    } else {
      console.log('GAMETEXT>>>NOT AVAILABLE<<<');
    }
  },
  async eval(page, expr) {
    const r = await page.evaluate(expr);
    console.log('EVAL>>>' + JSON.stringify(r) + '<<<');
  },
};

(async () => {
  const [cmd, ...args] = process.argv.slice(2);
  if (cmd === 'launch') {
    const ctx = await chromium.launchPersistentContext(PROFILE, {
      headless: true,
      executablePath: '/Users/pranay/Library/Caches/ms-playwright/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing',
      viewport: { width: 1280, height: 720 },
      args: ['--remote-debugging-port=9222', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
    });
    console.log('LAUNCHED pages=' + ctx.pages().length);
    process.on('uncaughtException', (e) => console.error('UNCAUGHT', e.message));
    // keep alive forever
    setInterval(() => {}, 10000);
    return;
  }
  const browser = await chromium.connectOverCDP(CDP);
  const ctx = browser.contexts()[0];
  let page = ctx.pages()[0];
  if (!page) page = await ctx.newPage();
  page.on('dialog', async (d) => {
    console.log('DIALOG>>>[' + d.type() + '] ' + d.message() + '<<<');
    await d.accept();
  });
  await steps[cmd](page, ...args);
  await browser.close(); // disconnects only
})().catch((e) => { console.error(e); process.exit(1); });

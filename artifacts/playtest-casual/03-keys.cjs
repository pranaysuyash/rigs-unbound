const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await h.dismiss();
  await h.shot('modal-dismissed');

  // drive forward a bit to feel acceleration
  await page.keyboard.down('w');
  await page.waitForTimeout(2500);
  await h.shot('torque-driving');
  await page.keyboard.up('w');

  // try the map key M
  await page.keyboard.press('m');
  await page.waitForTimeout(800);
  await h.shot('map-open');
  await page.keyboard.press('m');
  await page.waitForTimeout(500);

  // cycle camera C
  await page.keyboard.press('c');
  await page.waitForTimeout(600);
  await h.shot('camera-2');
  await page.keyboard.press('c');
  await page.waitForTimeout(600);
  await h.shot('camera-3');
  await page.keyboard.press('c');
  await page.waitForTimeout(600);
  await h.shot('camera-4-or-back');

  // pause P
  await page.keyboard.press('p');
  await page.waitForTimeout(600);
  await h.shot('paused');
  await page.keyboard.press('p');
  await page.waitForTimeout(400);

  // lights N
  await page.keyboard.press('n');
  await page.waitForTimeout(600);
  await h.shot('lights-toggle');

  // Space - "act"?
  await page.keyboard.press(' ');
  await page.waitForTimeout(800);
  await h.shot('space-act');

  // X winch
  await page.keyboard.down('x');
  await page.waitForTimeout(1200);
  await h.shot('winch');
  await page.keyboard.up('x');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

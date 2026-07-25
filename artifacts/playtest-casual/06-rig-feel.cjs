const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  // --- TORQUE feel test: acceleration from standstill
  await page.keyboard.down('w');
  await page.waitForTimeout(1000); await h.shot('tq-1s');
  await page.waitForTimeout(2000); await h.shot('tq-3s');
  await page.waitForTimeout(3000); await h.shot('tq-6s');
  // hard turn at speed
  await page.keyboard.down('a');
  await page.waitForTimeout(1200); await h.shot('tq-turn-at-speed');
  await page.keyboard.up('a');
  await page.keyboard.up('w');
  await page.waitForTimeout(300);
  // brake/reverse
  await page.keyboard.down('s');
  await page.waitForTimeout(1500); await h.shot('tq-brake');
  await page.keyboard.up('s');

  // plough while driving
  await page.keyboard.press(' ');
  await page.keyboard.down('w');
  await page.waitForTimeout(2500); await h.shot('tq-ploughing');
  await page.keyboard.up('w');
  await page.keyboard.press(' ');

  // --- SPARK feel test
  await page.keyboard.press('r');
  await page.waitForTimeout(1000);
  await h.shot('spark-spawned');
  await page.keyboard.down('w');
  await page.waitForTimeout(1000); await h.shot('sp-1s');
  await page.waitForTimeout(2000); await h.shot('sp-3s');
  await page.waitForTimeout(3000); await h.shot('sp-6s');
  // jump while driving
  await page.keyboard.press(' ');
  await page.waitForTimeout(400); await h.shot('sp-jump');
  await page.waitForTimeout(800); await h.shot('sp-landed');
  await page.keyboard.up('w');

  // --- DRIFT feel test
  await page.keyboard.press('r');
  await page.keyboard.press('r');
  await page.waitForTimeout(1000);
  await h.shot('drift-spawned');
  await page.keyboard.down('w');
  await page.waitForTimeout(1000); await h.shot('dr-1s');
  await page.waitForTimeout(2000); await h.shot('dr-3s');
  await page.waitForTimeout(3000); await h.shot('dr-6s');
  await page.keyboard.down('d');
  await page.waitForTimeout(1200); await h.shot('dr-turn');
  await page.keyboard.up('d');
  await page.keyboard.up('w');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

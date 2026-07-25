const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  // cycle to Drift: Torque -> Spark -> Drift
  await page.keyboard.press('r');
  await page.waitForTimeout(400);
  await page.keyboard.press('r');
  await page.waitForTimeout(1000);
  await h.shot('drift-where');

  // drive the hovercraft
  await page.keyboard.down('w');
  await page.waitForTimeout(2000); await h.shot('drift-2s');
  await page.waitForTimeout(3000); await h.shot('drift-5s');
  // turn while moving - hovercraft should slide
  await page.keyboard.down('a');
  await page.waitForTimeout(1500); await h.shot('drift-slide');
  await page.keyboard.up('a');
  await page.keyboard.up('w');
  // drift space action?
  await page.keyboard.press(' ');
  await page.waitForTimeout(800); await h.shot('drift-space');

  // back to Torque (R x3 -> Spark -> Drift -> Torque? no: from Drift, R -> Torque)
  await page.keyboard.press('r');
  await page.waitForTimeout(600);
  await h.shot('back-to-torque');

  // drive toward salvage marker (HUD said S · salvage ~48m). Try heading south-ish by turning
  // just drive forward for a long stretch and watch the HUD distance
  await page.keyboard.down('w');
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(2000);
    await h.shot('salvage-hunt-' + i);
  }
  await page.keyboard.up('w');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

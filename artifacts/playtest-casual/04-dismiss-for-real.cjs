const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  // click the actual ENTER THE FIELD button by its visible text
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);
  await h.shot('really-dismissed');

  // feel acceleration from standstill in Torque
  await page.keyboard.down('w');
  await page.waitForTimeout(3000);
  await h.shot('torque-3s');
  await page.waitForTimeout(2000);
  await h.shot('torque-5s');
  await page.keyboard.up('w');
  await page.waitForTimeout(1500);
  await h.shot('torque-coast');

  // map again, now without modal
  await page.keyboard.press('m');
  await page.waitForTimeout(800);
  await h.shot('map-clean');
  // click CLOSE
  await page.getByText('CLOSE').click();
  await page.waitForTimeout(500);
  await h.shot('map-closed');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

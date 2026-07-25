const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  // U-turn: hold w+a to turn around
  await page.keyboard.down('w'); await page.keyboard.down('a');
  await page.waitForTimeout(2200);
  await page.keyboard.up('a');
  await h.shot('uturn-done');
  // drive straight
  await page.waitForTimeout(3000);
  await h.shot('south-1');
  await page.waitForTimeout(3000);
  await h.shot('south-2');
  await page.keyboard.up('w');
  await h.shot('south-stop');
  // check map
  await page.keyboard.press('m');
  await page.waitForTimeout(800);
  await h.shot('map-after-south');
  await page.keyboard.press('m');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

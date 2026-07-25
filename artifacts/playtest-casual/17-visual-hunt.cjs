const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  // spawn faces north (-z). cargo ~60deg to the right. small D tap then look.
  await page.keyboard.down('d');
  await page.waitForTimeout(500);
  await page.keyboard.up('d');
  await page.waitForTimeout(300);
  await h.shot('aim-1');

  await page.keyboard.down('w');
  await page.waitForTimeout(1800);
  await page.keyboard.up('w');
  await h.shot('aim-2');

  await page.keyboard.down('w');
  await page.waitForTimeout(1800);
  await page.keyboard.up('w');
  await h.shot('aim-3');

  // look around: full 360 scan in 4 shots using A taps
  for (let i = 0; i < 4; i++) {
    await page.keyboard.down('a');
    await page.waitForTimeout(700);
    await page.keyboard.up('a');
    await page.waitForTimeout(300);
    await h.shot('scan-' + i);
  }

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

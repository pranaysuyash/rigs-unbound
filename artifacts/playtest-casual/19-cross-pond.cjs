const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  // reproduce arc into pond edge
  await page.keyboard.down('w'); await page.keyboard.down('d');
  await page.waitForTimeout(750);
  await page.keyboard.up('d');
  // keep going across pond, aim slightly left toward the red cube seen earlier
  await page.waitForTimeout(1500);
  await page.keyboard.down('a');
  await page.waitForTimeout(500);
  await page.keyboard.up('a');
  await page.waitForTimeout(2500);
  await page.keyboard.up('w');
  await h.shot('cross-1');

  await page.keyboard.down('w');
  await page.waitForTimeout(2500);
  await page.keyboard.up('w');
  await h.shot('cross-2');

  await page.keyboard.down('w');
  await page.waitForTimeout(2500);
  await page.keyboard.up('w');
  await h.shot('cross-3');
  const txt = await page.evaluate(() => document.body.innerText);
  console.log(txt.slice(0, 500));

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

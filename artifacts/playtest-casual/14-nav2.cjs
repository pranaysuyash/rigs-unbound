const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  const readHud = async () => {
    const txt = await page.evaluate(() => document.body.innerText);
    const m = txt.match(/([NSEW]+)\s*·\s*salvage\s*(\d+)\s*m\s*·\s*(\d+)\s*unit/i);
    const rig = txt.match(/\n(Torque|Spark|Drift)\n/);
    return { dir: m && m[1], dist: m && +m[2], units: m && +m[3], rig: rig && rig[1] };
  };

  await page.keyboard.press('r'); await page.waitForTimeout(1500);
  console.log('rig now:', JSON.stringify(await readHud()));
  await page.keyboard.press('r'); await page.waitForTimeout(1500);
  console.log('rig now:', JSON.stringify(await readHud()));

  // drive off the pad to get the salvage readout
  await page.keyboard.down('w'); await page.waitForTimeout(2500); await page.keyboard.up('w');
  await page.waitForTimeout(500);
  console.log('hud:', JSON.stringify(await readHud()));
  await h.shot('drift-off-pad');

  for (let i = 0; i < 40; i++) {
    const before = await readHud();
    if (before.dist == null) {
      // maybe back in a workshop zone or readout hidden; drive a bit
      await page.keyboard.down('w'); await page.waitForTimeout(1000); await page.keyboard.up('w');
      continue;
    }
    if (before.dist <= 5) { console.log(i, 'CLOSE', JSON.stringify(before)); break; }
    await page.keyboard.down('w');
    await page.waitForTimeout(1100);
    await page.keyboard.up('w');
    await page.waitForTimeout(300);
    const after = await readHud();
    console.log(i, before.dir, before.dist, '->', after.dir, after.dist);
    if (after.dist != null && after.dist > before.dist + 1) {
      await page.keyboard.down('w'); await page.keyboard.down('d');
      await page.waitForTimeout(800);
      await page.keyboard.up('d'); await page.keyboard.up('w');
    }
    if (i % 8 === 7) await h.shot('nav-' + i);
  }
  await h.shot('nav-final');
  console.log('final:', JSON.stringify(await readHud()));
  await page.keyboard.press(' ');
  await page.waitForTimeout(700);
  await h.shot('collect-space');
  await page.keyboard.down('x'); await page.waitForTimeout(1000); await page.keyboard.up('x');
  await h.shot('collect-winch');
  console.log('after collect attempts:', JSON.stringify(await readHud()));

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

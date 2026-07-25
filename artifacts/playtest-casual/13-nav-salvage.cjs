const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  const readHud = async () => {
    const txt = await page.evaluate(() => document.body.innerText);
    const m = txt.match(/([NSEW]+)\s*·\s*salvage\s*(\d+)\s*m\s*·\s*(\d+)\s*unit/i);
    const rig = txt.match(/(Torque|Spark|Drift)\n/);
    return m ? { dir: m[1], dist: +m[2], units: +m[3], rig: rig && rig[1] } : { raw: txt.slice(0, 200), rig: rig && rig[1] };
  };

  // switch to Drift (Torque -> Spark -> Drift)
  await page.keyboard.press('r'); await page.waitForTimeout(400);
  await page.keyboard.press('r'); await page.waitForTimeout(900);
  console.log('after switch:', JSON.stringify(await readHud()));
  await h.shot('drift-nav-start');

  let turns = 0;
  for (let i = 0; i < 45; i++) {
    const before = await readHud();
    if (!before.dist) { console.log(i, 'no hud', JSON.stringify(before)); break; }
    if (before.dist <= 5) { console.log(i, 'CLOSE ENOUGH', JSON.stringify(before)); break; }
    await page.keyboard.down('w');
    await page.waitForTimeout(1200);
    await page.keyboard.up('w');
    await page.waitForTimeout(300);
    const after = await readHud();
    console.log(i, JSON.stringify(before), '->', JSON.stringify(after));
    if (after.dist > before.dist + 1) {
      // getting farther: turn right ~90deg
      await page.keyboard.down('w'); await page.keyboard.down('d');
      await page.waitForTimeout(900);
      await page.keyboard.up('d'); await page.keyboard.up('w');
      turns++;
    }
    if (i % 6 === 5) await h.shot('nav-' + i);
  }
  await h.shot('nav-final');
  // try collecting
  await page.keyboard.press(' ');
  await page.waitForTimeout(700);
  await h.shot('collect-space');
  await page.keyboard.down('x');
  await page.waitForTimeout(1000);
  await page.keyboard.up('x');
  await h.shot('collect-winch');
  console.log('final hud:', JSON.stringify(await readHud()));

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

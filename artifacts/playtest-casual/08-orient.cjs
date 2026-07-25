const h = require('./helper.cjs');
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText('ENTER THE FIELD').click();
  await page.waitForTimeout(1000);

  const rgt = async () => {
    try {
      const t = await page.evaluate(() => typeof window.render_game_to_text === 'function' ? window.render_game_to_text() : 'N/A');
      console.log('--- render_game_to_text ---');
      console.log(typeof t === 'string' ? t.slice(0, 1500) : JSON.stringify(t).slice(0, 1500));
    } catch (e) { console.log('rgt error', e.message); }
  };

  await rgt();

  // drive forward and check how heading/distance change
  await page.keyboard.down('w');
  await page.waitForTimeout(3000);
  await page.keyboard.up('w');
  await rgt();
  await h.shot('orient-1');

  await browser.close();
  console.log('done');
})().catch(e => { console.error(e); process.exit(1); });

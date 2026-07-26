const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // one accessibility call: where is the nearest salvage relative to me?
  const info = await page.evaluate(() => {
    const t = JSON.parse(window.render_game_to_text());
    const me = t.activeRig;
    const keys = Object.keys(t).filter(
      (k) => !["activeRig", "rigs"].includes(k),
    );
    return {
      topLevelKeys: keys,
      me: { x: me.x, z: me.z, heading: me.heading },
      salvage: t.salvage || t.salvageUnits || t.pickups || null,
      pois: t.signals || t.pois || t.discoveries || null,
    };
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 2500));

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

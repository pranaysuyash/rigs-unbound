const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);
  const info = await page.evaluate(() => {
    const t = JSON.parse(window.render_game_to_text());
    return {
      progression: t.progression,
      activity: t.activity,
      worldMemory: t.worldMemory,
      lastDiagnostic: t.lastDiagnostic,
    };
  });
  console.log(JSON.stringify(info, null, 1).slice(0, 4000));
  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

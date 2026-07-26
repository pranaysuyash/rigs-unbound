const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  // Persistence check: does the intro modal show again? what survived?
  await h.shot("reload-first-view");
  const modalVisible = await page
    .getByText("ENTER THE FIELD")
    .isVisible()
    .catch(() => false);
  console.log("intro modal visible after reload:", modalVisible);
  if (modalVisible) {
    await page.getByText("ENTER THE FIELD").click();
    await page.waitForTimeout(1000);
  }
  await h.shot("reload-in-game");

  // Am I still the drowned tractor in the pond?
  // try driving
  await page.keyboard.down("w");
  await page.waitForTimeout(2500);
  await h.shot("reload-driving");
  await page.keyboard.up("w");

  // switch rig to Spark and drive to salvage
  await page.keyboard.press("r");
  await page.waitForTimeout(900);
  await h.shot("reload-spark");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

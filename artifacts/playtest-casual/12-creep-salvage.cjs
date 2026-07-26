const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // U-turn at spawn
  await page.keyboard.down("w");
  await page.keyboard.down("a");
  await page.waitForTimeout(2000);
  await page.keyboard.up("a");
  await page.keyboard.up("w");
  await h.shot("facing-south");

  // creep forward in short taps, watching distance
  for (let i = 0; i < 8; i++) {
    await page.keyboard.down("w");
    await page.waitForTimeout(700);
    await page.keyboard.up("w");
    await page.waitForTimeout(400);
    await h.shot("creep-" + i);
  }

  // look around with side cam
  await page.keyboard.press("c");
  await page.keyboard.press("c");
  await page.waitForTimeout(500);
  await h.shot("look-around-side");
  await page.keyboard.press("c");
  await page.keyboard.press("c");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

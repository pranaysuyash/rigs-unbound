const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);
  await h.shot("start-clean");

  // R = rig switch? press it and see
  await page.keyboard.press("r");
  await page.waitForTimeout(800);
  await h.shot("pressed-r-1");
  await page.keyboard.press("r");
  await page.waitForTimeout(800);
  await h.shot("pressed-r-2");
  await page.keyboard.press("r");
  await page.waitForTimeout(800);
  await h.shot("pressed-r-3");

  // drive with current rig
  await page.keyboard.down("w");
  await page.waitForTimeout(3000);
  await h.shot("rig3-driving");
  await page.keyboard.up("w");

  // camera views
  await page.keyboard.press("c");
  await page.waitForTimeout(600);
  await h.shot("cam2");
  await page.keyboard.press("c");
  await page.waitForTimeout(600);
  await h.shot("cam3");
  await page.keyboard.press("c");
  await page.waitForTimeout(600);
  await h.shot("cam4");
  await page.keyboard.press("c");
  await page.waitForTimeout(600);

  // pause
  await page.keyboard.press("p");
  await page.waitForTimeout(700);
  await h.shot("paused-clean");
  await page.keyboard.press("p");
  await page.waitForTimeout(400);

  // lights
  await page.keyboard.press("n");
  await page.waitForTimeout(700);
  await h.shot("lights-on");
  await page.keyboard.press("n");
  await page.waitForTimeout(400);

  // space = act
  await page.keyboard.press(" ");
  await page.waitForTimeout(900);
  await h.shot("space-act-clean");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

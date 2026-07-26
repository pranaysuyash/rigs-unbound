const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // north 2s
  await page.keyboard.down("w");
  await page.waitForTimeout(2000);
  // arc right ~60 deg
  await page.keyboard.down("d");
  await page.waitForTimeout(700);
  await page.keyboard.up("d");
  await page.keyboard.up("w");
  await h.shot("route-turned-east");
  // east 2s
  await page.keyboard.down("w");
  await page.waitForTimeout(2000);
  await page.keyboard.up("w");
  await h.shot("route-east-1");
  await page.keyboard.down("w");
  await page.waitForTimeout(1500);
  await page.keyboard.up("w");
  await h.shot("route-east-2");
  const txt = await page.evaluate(() => document.body.innerText);
  console.log(txt.slice(0, 400));
  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

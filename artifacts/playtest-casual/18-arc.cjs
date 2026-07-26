const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // arc right ~60-70 deg while moving
  await page.keyboard.down("w");
  await page.keyboard.down("d");
  await page.waitForTimeout(750);
  await page.keyboard.up("d");
  await page.waitForTimeout(1500);
  await page.keyboard.up("w");
  await h.shot("arc-1");

  await page.keyboard.down("w");
  await page.waitForTimeout(1500);
  await page.keyboard.up("w");
  await h.shot("arc-2");
  const txt = await page.evaluate(() => document.body.innerText);
  console.log(txt.slice(0, 700));

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

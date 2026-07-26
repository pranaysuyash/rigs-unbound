const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // Hood cam verify (C once from Chase)
  await page.keyboard.press("c");
  await page.waitForTimeout(700);
  await h.shot("hood-verify");
  // drive in hood view
  await page.keyboard.down("w");
  await page.waitForTimeout(1500);
  await h.shot("hood-driving");
  await page.keyboard.up("w");
  await page.keyboard.press("c");
  await page.keyboard.press("c");
  await page.keyboard.press("c");
  await page.keyboard.press("c");
  await page.keyboard.press("c");
  await page.waitForTimeout(400);

  // Reset field
  await page.getByText("Reset field").click();
  await page.waitForTimeout(2000);
  await h.shot("after-reset");
  const modal = await page
    .getByText("ENTER THE FIELD")
    .isVisible()
    .catch(() => false);
  console.log("modal after reset:", modal);
  const txt = await page.evaluate(() => document.body.innerText);
  console.log("surveyed line:", (txt.match(/SURVEYED\n(\d+%)/) || [])[1]);

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

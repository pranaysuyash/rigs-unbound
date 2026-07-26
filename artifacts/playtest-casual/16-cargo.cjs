const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  const dump = async (label) => {
    const txt = await page.evaluate(() => document.body.innerText);
    console.log("=== " + label + " ===");
    console.log(txt.slice(0, 1200));
  };
  await dump("spawn");

  // turn right ~90 deg and drive toward where cargo should be (east-ish)
  await page.keyboard.down("w");
  await page.keyboard.down("d");
  await page.waitForTimeout(1400);
  await page.keyboard.up("d");
  await page.waitForTimeout(1800);
  await page.keyboard.up("w");
  await h.shot("cargo-hunt-1");
  await dump("after-turn");

  await page.keyboard.down("w");
  await page.waitForTimeout(2000);
  await page.keyboard.up("w");
  await h.shot("cargo-hunt-2");
  await dump("after-drive");

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

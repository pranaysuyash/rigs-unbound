const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  // top-down view to spot salvage near spawn
  await page.selectOption("select", { label: "Top-down" });
  await page.waitForTimeout(800);
  await h.shot("topdown-spawn");

  // salvage was reported "S" of spawn. From top-down, drive "down-screen" (reverse-ish = S key?)
  // try short S taps and watch
  for (let i = 0; i < 6; i++) {
    await page.keyboard.down("s");
    await page.waitForTimeout(800);
    await page.keyboard.up("s");
    await page.waitForTimeout(300);
    await h.shot("topdown-s-" + i);
  }
  const txt = await page.evaluate(() => document.body.innerText);
  const m = txt.match(/([NSEW]+)\s*·\s*salvage\s*(\d+)\s*m/i);
  console.log("salvage readout:", m && m[0]);
  await page.keyboard.press(" ");
  await page.waitForTimeout(600);
  await h.shot("topdown-space");
  const txt2 = await page.evaluate(() => document.body.innerText);
  const m2 = txt2.match(/([NSEW]+)\s*·\s*salvage\s*(\d+)\s*m/i);
  console.log(
    "after space:",
    m2 && m2[0],
    "| SALVAGE line:",
    (txt2.match(/SALVAGE\n(\d+)/) || [])[1],
  );

  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

const h = require("./helper.cjs");
(async () => {
  const browser = await h.boot();
  const page = h.page;
  await page.getByText("ENTER THE FIELD").click();
  await page.waitForTimeout(1000);

  const panel = async () => {
    const txt = await page.evaluate(() => document.body.innerText);
    // left panel headline: line after the terrain line
    const lines = txt
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    const idx = lines.findIndex(
      (l) =>
        /·/.test(l) &&
        /(TRACK|SOIL|MUD|WATER|ROCK|PASTURE|FARMLAND|VALLEY|FLATS|RIDGE|SHELF)/i.test(
          l,
        ),
    );
    return lines.slice(Math.max(0, idx), idx + 3).join(" | ");
  };
  let last = "";
  const watch = async () => {
    const p = await panel();
    if (p !== last) {
      console.log("PANEL:", p);
      last = p;
    }
  };

  // route: north 2.2s, arc right, east
  await page.keyboard.down("w");
  await page.waitForTimeout(2200);
  await page.keyboard.down("d");
  await page.waitForTimeout(600);
  await page.keyboard.up("d");
  await page.waitForTimeout(2000);
  await page.keyboard.up("w");
  await watch();
  await h.shot("tow-near");

  // sweep: creep and press Space, watching panel
  for (let i = 0; i < 20; i++) {
    await page.keyboard.down("w");
    await page.waitForTimeout(700);
    await page.keyboard.up("w");
    await page.waitForTimeout(200);
    await watch();
    await page.keyboard.press(" ");
    await page.waitForTimeout(300);
    await watch();
    const p = await panel();
    if (/cargo|tow|attach|hook|deliver/i.test(p)) {
      console.log("*** TOW PROMPT SPOTTED at step", i);
      await h.shot("tow-prompt");
      break;
    }
    if (i === 9) {
      // turn and sweep back
      await page.keyboard.down("w");
      await page.keyboard.down("a");
      await page.waitForTimeout(1500);
      await page.keyboard.up("a");
      await page.keyboard.up("w");
    }
  }
  await h.shot("tow-end");
  // full text dump for clues
  const txt = await page.evaluate(() => document.body.innerText);
  console.log("=== FULL ===");
  console.log(txt.slice(0, 900));
  await browser.close();
  console.log("done");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

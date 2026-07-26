// Hunter v4: buggy, but cautious — pulse the throttle, creep when close,
// back off gently when condition is dropping.
const {
  chromium,
} = require("/Users/pranay/Projects/Game_dev/rigs-unbound/experiments/deterministic-kernel-probe/node_modules/playwright");

(async () => {
  const browser = await chromium.launch({ headless: true, channel: "chrome" });
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  page.on("pageerror", (e) => console.log("[pageerror]", e.message));
  await page.goto("http://127.0.0.1:4174/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);

  const readHud = async () =>
    page.evaluate(() => {
      const t = document.body.innerText;
      const g = t.match(
        /([NSEW]{1,2})\s*·\s*salvage\s*([\d.]+)\s*m\s*·\s*(\d+)\s*unit/i,
      );
      const block = t.match(
        /CONDITION\s*\n\s*(\d+)%\s*\n\s*SALVAGE\s*\n\s*(\d+)\s*\n\s*SURVEYED\s*\n\s*(\d+)%/i,
      );
      const spd = t.match(/SPEED\s*\n\s*([\d.]+)\s*km\/h/i);
      return {
        dist: g ? parseFloat(g[2]) : null,
        bearing: g?.[1],
        units: g ? parseInt(g[3]) : null,
        salvage: block ? parseInt(block[2]) : null,
        condition: block ? parseInt(block[1]) : null,
        speed: spd ? parseFloat(spd[1]) : null,
      };
    });
  const dismissModal = async () => {
    const m = await page.getByText("ENTER THE FIELD", { exact: false }).first();
    if (await m.isVisible().catch(() => false)) {
      await m.click();
      await page.waitForTimeout(250);
    }
  };
  const shot = (n) =>
    page.screenshot({ path: `artifacts/playtest-achiever/${n}.png` });
  const drive = async (keys, ms) => {
    for (const k of keys) await page.keyboard.down(k);
    await page.waitForTimeout(ms);
    for (const k of keys) await page.keyboard.up(k);
  };

  await dismissModal();
  await page.keyboard.press("r");
  await page.waitForTimeout(500);

  let lastSalvage = 0,
    stuckTicks = 0;
  const t0 = Date.now();
  while (Date.now() - t0 < 170000) {
    await dismissModal();
    const h0 = await readHud();
    if (h0.salvage !== null && h0.salvage > lastSalvage) {
      lastSalvage = h0.salvage;
      console.log(
        `*** SALVAGE = ${lastSalvage} t=${((Date.now() - t0) / 1000).toFixed(0)}s`,
      );
      await shot(`80-salvage-${lastSalvage}`);
      if (lastSalvage >= 2) break;
    }
    if (h0.dist === null) {
      await drive(["w"], 500);
      continue;
    }
    const close = h0.dist < 15;
    const burst = close ? 300 : 600; // creep near target / rocks
    if (h0.speed !== null && h0.speed < 2) {
      stuckTicks++;
      if (stuckTicks >= 5) {
        await drive(["s"], 1500);
        await drive(["s", "d"], 900);
        stuckTicks = 0;
        continue;
      }
    } else stuckTicks = 0;
    await drive(["w"], burst);
    const h1 = await readHud();
    if (h1.dist === null) continue;
    if (h1.dist < h0.dist - 0.05) continue;
    await drive(["w", "d"], 350);
    const h2 = await readHud();
    if (h2.dist !== null && h2.dist < h1.dist - 0.05) continue;
    await drive(["w", "a"], 600);
  }
  const fin = await readHud();
  console.log("FINAL", JSON.stringify(fin));
  await shot("81-end");
  await browser.close();
})();

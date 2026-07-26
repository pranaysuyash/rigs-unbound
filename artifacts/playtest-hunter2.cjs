// Hunter v2: steer toward salvage using the visible HUD guidance (bearing+distance).
// Robust gradient descent: try straight, then probe left/right, pick what shrinks distance.
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
        bearing: g ? g[1] : null,
        units: g ? parseInt(g[3]) : null,
        salvage: block ? parseInt(block[2]) : null,
        condition: block ? parseInt(block[1]) : null,
        surveyed: block ? parseInt(block[3]) : null,
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
  let lastSalvage = 0;
  const t0 = Date.now();
  let stuckCount = 0;

  while (Date.now() - t0 < 220000) {
    await dismissModal();
    const h0 = await readHud();
    if (h0.salvage !== null && h0.salvage > lastSalvage) {
      lastSalvage = h0.salvage;
      console.log(
        `*** SALVAGE = ${lastSalvage} at t=${((Date.now() - t0) / 1000).toFixed(0)}s`,
      );
      await shot(`50-salvage-${lastSalvage}`);
    }
    if (h0.dist === null) {
      await drive(["w"], 800);
      continue;
    }
    if (h0.dist < 3.5) {
      console.log("very close to salvage, dist", h0.dist, "- creeping");
      await drive(["w"], 500);
      continue;
    }
    // stuck detection
    if (h0.speed !== null && h0.speed < 2 && h0.condition < 100) {
      stuckCount++;
      if (stuckCount > 6) {
        console.log("stuck, reversing out");
        await drive(["s"], 2000);
        await drive(["s", "a"], 1200);
        stuckCount = 0;
        continue;
      }
    } else stuckCount = 0;

    // probe: straight 900ms, measure delta
    await drive(["w"], 900);
    const h1 = await readHud();
    if (h1.dist === null) continue;
    const dStraight = h1.dist - h0.dist;
    if (dStraight < -0.15) continue; // good, keep going straight
    // try turning right for 500ms then straight
    await drive(["w", "d"], 500);
    const h2 = await readHud();
    if (h2.dist !== null && h2.dist < h1.dist - 0.1) continue; // right helps; loop continues straight
    // try left instead
    await drive(["w", "a"], 900);
    const h3 = await readHud();
    if (h3 && h3.dist !== null)
      console.log(
        `steer: ${h0.dist.toFixed(1)} -> ${h3.dist.toFixed(1)} bearing=${h3.bearing} units=${h3.units} spd=${h3.speed}`,
      );
  }
  await shot("51-hunt-end");
  const fin = await readHud();
  console.log("FINAL", JSON.stringify(fin));
  await browser.close();
})();

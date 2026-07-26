// Closed-loop player: steers by reading the VISIBLE HUD text from the DOM
// (the same guidance a player reads on screen). No game internals.
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
      const sal = t.match(/SALVAGE\s*\n?\s*(\d+)/i);
      const cond = t.match(/CONDITION\s*\n?\s*(\d+)%/i);
      const spd = t.match(/SPEED\s*\n?\s*([\d.]+)\s*km\/h/i);
      const surv = t.match(/SURVEYED\s*\n?\s*(\d+)%/i);
      return {
        guidance: g
          ? { bearing: g[1], dist: parseFloat(g[2]), units: parseInt(g[3]) }
          : null,
        salvage: sal ? parseInt(sal[1]) : null,
        condition: cond ? parseInt(cond[1]) : null,
        speed: spd ? parseFloat(spd[1]) : null,
        surveyed: surv ? parseInt(surv[1]) : null,
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

  await dismissModal();
  await shot("40-cl-start");

  // Hill-climb steering toward salvage: drive forward, sample distance,
  // if distance grew, steer right a bit; if still growing, steer left.
  let lastDist = null;
  let turnDir = "d";
  let turnUntil = 0;
  let noProgress = 0;
  const start = Date.now();
  let collected = 0;
  let phase = "toSalvage";
  let ticks = 0;

  while (Date.now() - start < 200000) {
    ticks++;
    await dismissModal();
    const hud = await readHud();
    if (ticks % 10 === 0)
      console.log(
        `t=${((Date.now() - start) / 1000).toFixed(0)}s`,
        JSON.stringify(hud),
        "phase:",
        phase,
      );

    if (hud.salvage !== null && hud.salvage > collected) {
      collected = hud.salvage;
      console.log("*** SALVAGE COLLECTED! total =", collected);
      await shot(`41-collected-${collected}`);
      phase = "toHome";
    }

    if (phase === "toSalvage") {
      if (!hud.guidance) {
        console.log("no guidance visible");
      }
      const d = hud.guidance ? hud.guidance.dist : null;
      if (d !== null && d < 4) {
        console.log("on top of salvage, dist", d);
      }
      // steering decision every tick (~350ms)
      if (lastDist !== null && d !== null) {
        if (d < lastDist - 0.05) {
          noProgress = 0;
        } else if (d > lastDist + 0.3) {
          noProgress++;
          if (noProgress >= 2) {
            // turn until distance shrinks again
            await page.keyboard.up("w");
            await page.keyboard.down(turnDir);
            await page.waitForTimeout(450);
            await page.keyboard.up(turnDir);
            await page.keyboard.down("w");
            noProgress = 0;
          }
        }
      }
      if (d !== null) lastDist = d;
      if (!(await page.keyboard.isPressed?.("w").catch(() => false))) {
        // ensure w held
      }
      await page.keyboard.down("w");
      await page.waitForTimeout(350);
    } else {
      // toHome: signals list shows distances; read them
      const dists = await page.evaluate(() => {
        const t = document.body.innerText;
        const m = t.match(/Home Silo[\s\S]{0,40}?([\d.]+)\s*m/i);
        return m ? parseFloat(m[1]) : null;
      });
      console.log("home dist:", dists);
      await page.keyboard.down("w");
      await page.waitForTimeout(350);
      if (dists !== null && dists < 12) {
        console.log("near home silo, stopping");
        await page.keyboard.up("w");
        await shot("42-at-home");
        break;
      }
    }
  }
  await page.keyboard.up("w");
  await shot("43-end");
  await browser.close();
})();

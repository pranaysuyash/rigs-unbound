const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");
const { switchToRig } = require("./acceptance-helpers.cjs");

armWatchdog({ minutes: 15, label: "prop-count evidence" });

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

async function flushRenderFrames(page, count = 4) {
  // Force multiple render frames so the prop rebuild completes.
  for (let i = 0; i < count; i += 1) {
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
  }
}

async function captureVisibility(page) {
  await flushRenderFrames(page);
  return page.evaluate(() => {
    const snap = window.getPerformanceSnapshot();
    return snap.visibility || null;
  });
}

(async () => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
    slowMo: 18,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
  const consoleProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push(`pageerror: ${error.message}`),
  );

  // Navigate and enter world
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );

  // Enter world
  await page.keyboard.press("Space");
  await page.waitForTimeout(1500);

  // Place tractor in open area for consistent testing
  await page.evaluate(() => window.placeRig(4, 6, Math.PI));
  await page.waitForTimeout(500);

  const rigIds = ["utility-tractor", "toy-buggy", "marsh-skimmer"];
  const tiers = [
    { id: "full", label: "Full (168m)", profile: "full" },
    { id: "standard", label: "Standard (168m)", profile: "standard" },
    { id: "mobile-safe", label: "Conservative (132m)", profile: "mobile-safe" },
  ];
  const results = [];

  for (const rigId of rigIds) {
    console.log(`\n=== Testing rig: ${rigId} ===`);
    await switchToRig(page, rigId);

    for (const tier of tiers) {
      // Force the visibility profile and flush render frames
      await page.evaluate((profileId) => {
        window.__forceProfile(profileId);
      }, tier.profile);
      await flushRenderFrames(page, 6);

      // Capture visibility metrics
      const vis = await captureVisibility(page);

      // Also capture raw render metrics
      const metrics = await page.evaluate(() => {
        const snap = window.getPerformanceSnapshot();
        return {
          drawCalls: snap.drawCalls,
          triangles: snap.triangles,
          geometries: snap.geometries,
          textures: snap.textures,
          heapUsedMb: snap.heapUsedMb,
          fps: snap.framesPerSecond,
        };
      });

      const result = {
        rigId,
        tier: tier.id,
        tierLabel: tier.label,
        candidates: vis?.candidates ?? 0,
        submitted: vis?.submitted ?? 0,
        capacityLimited: vis?.capacityLimited ?? 0,
        near: vis?.near ?? 0,
        mid: vis?.mid ?? 0,
        far: vis?.far ?? 0,
        culled: vis?.culled ?? 0,
        drawCalls: metrics.drawCalls,
        triangles: metrics.triangles,
        geometries: metrics.geometries,
        textures: metrics.textures,
        heapUsedMb: metrics.heapUsedMb,
        fps: metrics.fps,
      };
      results.push(result);

      console.log(
        `  ${tier.label.padEnd(22)} submitted=${result.submitted} ` +
          `candidates=${result.candidates} culled=${result.culled} ` +
          `near=${result.near} mid=${result.mid} far=${result.far} ` +
          `drawCalls=${result.drawCalls} tris=${result.triangles}`,
      );
    }
  }

  // Summary comparison: three tiers
  console.log(
    "\n\n=== PROP COUNT COMPARISON: FULL vs STANDARD vs CONSERVATIVE ===\n",
  );
  console.log(
    "Rig".padEnd(20) +
      "Full".padEnd(10) +
      "Standard".padEnd(12) +
      "Conservative".padEnd(14) +
      "F→S Δ".padEnd(10) +
      "S→C Δ".padEnd(10) +
      "Full%".padEnd(8) +
      "Std%".padEnd(8) +
      "Con%",
  );
  console.log("-".repeat(100));

  for (const rigId of rigIds) {
    const full = results.find((r) => r.rigId === rigId && r.tier === "full");
    const balanced = results.find(
      (r) => r.rigId === rigId && r.tier === "standard",
    );
    const conservative = results.find(
      (r) => r.rigId === rigId && r.tier === "mobile-safe",
    );
    if (!full || !balanced || !conservative) continue;

    const fullToStd = full.submitted - balanced.submitted;
    const stdToCon = balanced.submitted - conservative.submitted;
    const fullPct =
      full.submitted > 0
        ? ((fullToStd / full.submitted) * 100).toFixed(1)
        : "0.0";
    const stdPct =
      balanced.submitted > 0
        ? ((stdToCon / balanced.submitted) * 100).toFixed(1)
        : "0.0";
    const conPct =
      full.submitted > 0
        ? (
            ((full.submitted - conservative.submitted) / full.submitted) *
            100
          ).toFixed(1)
        : "0.0";

    console.log(
      rigId.padEnd(20) +
        String(full.submitted).padEnd(10) +
        String(balanced.submitted).padEnd(12) +
        String(conservative.submitted).padEnd(14) +
        String(fullToStd).padEnd(10) +
        String(stdToCon).padEnd(10) +
        `${fullPct}%`.padEnd(8) +
        `${stdPct}%`.padEnd(8) +
        `${conPct}%`,
    );
  }

  // Totals
  const totalFull = results
    .filter((r) => r.tier === "full")
    .reduce((s, r) => s + r.submitted, 0);
  const totalBalanced = results
    .filter((r) => r.tier === "standard")
    .reduce((s, r) => s + r.submitted, 0);
  const totalConservative = results
    .filter((r) => r.tier === "mobile-safe")
    .reduce((s, r) => s + r.submitted, 0);
  const totalFullToStd = totalFull - totalBalanced;
  const totalStdToCon = totalBalanced - totalConservative;
  const totalFullPct =
    totalFull > 0 ? ((totalFullToStd / totalFull) * 100).toFixed(1) : "0.0";
  const totalStdPct =
    totalBalanced > 0
      ? ((totalStdToCon / totalBalanced) * 100).toFixed(1)
      : "0.0";
  const totalConPct =
    totalFull > 0
      ? (((totalFull - totalConservative) / totalFull) * 100).toFixed(1)
      : "0.0";

  console.log("-".repeat(100));
  console.log(
    "TOTAL".padEnd(20) +
      String(totalFull).padEnd(10) +
      String(totalBalanced).padEnd(12) +
      String(totalConservative).padEnd(14) +
      String(totalFullToStd).padEnd(10) +
      String(totalStdToCon).padEnd(10) +
      `${totalFullPct}%`.padEnd(8) +
      `${totalStdPct}%`.padEnd(8) +
      `${totalConPct}%`,
  );

  // Draw call comparison: all three tiers
  console.log("\n\n=== RENDER COST COMPARISON ===\n");
  console.log(
    "Rig".padEnd(20) +
      "Full DrawCalls".padEnd(16) +
      "Std DrawCalls".padEnd(16) +
      "Con DrawCalls".padEnd(16) +
      "Full Tris".padEnd(12) +
      "Std Tris".padEnd(12) +
      "Con Tris",
  );
  console.log("-".repeat(100));
  for (const rigId of rigIds) {
    const full = results.find((r) => r.rigId === rigId && r.tier === "full");
    const balanced = results.find(
      (r) => r.rigId === rigId && r.tier === "standard",
    );
    const conservative = results.find(
      (r) => r.rigId === rigId && r.tier === "mobile-safe",
    );
    if (!full || !balanced || !conservative) continue;
    console.log(
      rigId.padEnd(20) +
        String(full.drawCalls).padEnd(16) +
        String(balanced.drawCalls).padEnd(16) +
        String(conservative.drawCalls).padEnd(16) +
        String(full.triangles).padEnd(12) +
        String(balanced.triangles).padEnd(12) +
        conservative.triangles,
    );
  }

  // Save results to JSON
  const outputPath = path.join(artifactDirectory, "prop-count-evidence.json");
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        url: TARGET_URL,
        profiles: {
          full: { farMeters: 168, midMeters: 132, nearMeters: 72 },
          standard: { farMeters: 168, midMeters: 120, nearMeters: 64 },
          "mobile-safe": { farMeters: 132, midMeters: 96, nearMeters: 48 },
        },
        results,
        comparison: {
          totalFull,
          totalBalanced,
          totalConservative,
          totalFullToStd: `${totalFullPct}%`,
          totalStdToCon: `${totalStdPct}%`,
          totalFullToCon: `${totalConPct}%`,
        },
      },
      null,
      2,
    ),
  );
  console.log(`\nResults saved to: ${outputPath}`);

  if (consoleProblems.length > 0) {
    console.log(`\nConsole problems: ${consoleProblems.length}`);
    for (const problem of consoleProblems.slice(0, 10)) {
      console.log(`  ${problem}`);
    }
  }

  await Promise.race([
    (async () => {
      await context.close();
      await browser.close();
    })(),
    new Promise((resolve) =>
      setTimeout(() => {
        console.warn("Chrome teardown exceeded 5 seconds.");
        resolve();
      }, 5000),
    ),
  ]);
  browser = null;
  process.exit(0);
})().catch(async (error) => {
  console.error(error);
  if (browser) {
    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }
  process.exit(1);
});

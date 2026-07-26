const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 15, label: "prop-count evidence" });

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function captureVisibility(page) {
  return page.evaluate(() => {
    const snap = window.getPerformanceSnapshot();
    return snap.visibility || null;
  });
}

async function switchToRig(page, rigId) {
  await page.evaluate((id) => {
    const before = JSON.parse(window.render_game_to_text());
    const target = before.rigs[id];
    if (!target) throw new Error(`Unknown rig id: ${id}`);
    window.placeRig(target.x, target.z);
    window.selectRig(id);
    const after = JSON.parse(window.render_game_to_text());
    if (after.activeRigId !== id) {
      throw new Error(
        `Rig switch to ${id} was refused: ${after.lastDiagnostic}`,
      );
    }
  }, rigId);
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
    { id: "standard", label: "Balanced (168m)", profile: "standard" },
    { id: "mobile-safe", label: "Conservative (132m)", profile: "mobile-safe" },
  ];
  const results = [];

  for (const rigId of rigIds) {
    console.log(`\n=== Testing rig: ${rigId} ===`);
    await switchToRig(page, rigId);

    for (const tier of tiers) {
      // Force the visibility profile
      await page.evaluate((profileId) => {
        window.__forceProfile(profileId);
      }, tier.profile);
      await page.waitForTimeout(800);

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

  // Summary comparison
  console.log("\n\n=== PROP COUNT COMPARISON: BALANCED vs CONSERVATIVE ===\n");
  console.log(
    "Rig".padEnd(20) +
      "Balanced".padEnd(12) +
      "Conservative".padEnd(14) +
      "Reduction".padEnd(12) +
      "Reduction%".padEnd(12) +
      "BalCulled".padEnd(12) +
      "ConCulled",
  );
  console.log("-".repeat(92));

  for (const rigId of rigIds) {
    const balanced = results.find(
      (r) => r.rigId === rigId && r.tier === "standard",
    );
    const conservative = results.find(
      (r) => r.rigId === rigId && r.tier === "mobile-safe",
    );
    if (!balanced || !conservative) continue;

    const reduction = balanced.submitted - conservative.submitted;
    const reductionPct =
      balanced.submitted > 0
        ? ((reduction / balanced.submitted) * 100).toFixed(1)
        : "0.0";

    console.log(
      rigId.padEnd(20) +
        String(balanced.submitted).padEnd(12) +
        String(conservative.submitted).padEnd(14) +
        String(reduction).padEnd(12) +
        `${reductionPct}%`.padEnd(12) +
        String(balanced.culled).padEnd(12) +
        conservative.culled,
    );
  }

  // Totals
  const totalBalanced = results
    .filter((r) => r.tier === "standard")
    .reduce((s, r) => s + r.submitted, 0);
  const totalConservative = results
    .filter((r) => r.tier === "mobile-safe")
    .reduce((s, r) => s + r.submitted, 0);
  const totalReduction = totalBalanced - totalConservative;
  const totalReductionPct =
    totalBalanced > 0
      ? ((totalReduction / totalBalanced) * 100).toFixed(1)
      : "0.0";

  console.log("-".repeat(92));
  console.log(
    "TOTAL".padEnd(20) +
      String(totalBalanced).padEnd(12) +
      String(totalConservative).padEnd(14) +
      String(totalReduction).padEnd(12) +
      `${totalReductionPct}%`,
  );

  // Draw call comparison
  console.log("\n\n=== RENDER COST COMPARISON ===\n");
  for (const rigId of rigIds) {
    const balanced = results.find(
      (r) => r.rigId === rigId && r.tier === "standard",
    );
    const conservative = results.find(
      (r) => r.rigId === rigId && r.tier === "mobile-safe",
    );
    if (!balanced || !conservative) continue;
    console.log(
      `${rigId}: ` +
        `drawCalls ${balanced.drawCalls}→${conservative.drawCalls} ` +
        `(${conservative.drawCalls - balanced.drawCalls}), ` +
        `triangles ${balanced.triangles}→${conservative.triangles} ` +
        `(${conservative.triangles - balanced.triangles}), ` +
        `geometries ${balanced.geometries}→${conservative.geometries}`,
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
          standard: { farMeters: 168, midMeters: 120, nearMeters: 64 },
          "mobile-safe": { farMeters: 132, midMeters: 96, nearMeters: 48 },
        },
        results,
        comparison: {
          totalBalanced,
          totalConservative,
          totalReduction,
          totalReductionPct: `${totalReductionPct}%`,
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

const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 15, label: "cross-rig camera evidence" });

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
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
  assert(
    (await page.title()) === "Rigs Unbound",
    "The document title should preserve the universe-level product identity.",
  );
  assert(
    ((await page.locator("#world-designation").textContent()) ?? "").startsWith(
      "Field 02 ·",
    ),
    "The developer surface should identify Field 02 without making it the product title.",
  );

  // Enter world
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);

  const rigIds = ["utility-tractor", "toy-buggy", "marsh-skimmer"];
  const cameraModes = [
    "chase",
    "hood",
    "side",
    "tactical",
    "top-down",
    "survey",
  ];
  const results = [];

  // Place tractor in open area for consistent testing
  await page.evaluate(() => window.placeRig(4, 6, Math.PI));

  for (const rigId of rigIds) {
    console.log(`\n=== Testing rig: ${rigId} ===`);
    await switchToRig(page, rigId);

    for (const mode of cameraModes) {
      // Select camera
      await page.evaluate((m) => window.selectCamera(m), mode);
      await page.waitForTimeout(300);

      // Capture camera evidence
      const evidence = await page.evaluate(() =>
        window.getCameraResolutionEvidence(),
      );

      const result = {
        rigId,
        mode,
        pathClear: evidence.pathClear,
        selfIntersecting: evidence.selfIntersecting,
        obstructionSource: evidence.obstructionSource,
        obstructionId: evidence.obstructionId,
        resolvedDistance: evidence.resolvedDistance,
        idealDistance: evidence.idealDistance,
        behindRig: evidence.behindRig,
        forwardOffset: evidence.forwardOffset,
      };

      results.push(result);

      const status = result.pathClear ? "✓" : "✗";
      const obstruction = result.obstructionSource
        ? ` [${result.obstructionSource}:${result.obstructionId}]`
        : "";
      console.log(
        `  ${status} ${mode.padEnd(10)} pathClear=${result.pathClear} ` +
          `selfIntersect=${result.selfIntersecting} ` +
          `dist=${result.resolvedDistance.toFixed(2)}/${result.idealDistance.toFixed(2)}${obstruction}`,
      );
    }

    // Switch back to chase
    await page.evaluate(() => window.selectCamera("chase"));
  }

  // Summary table
  console.log("\n\n=== CROSS-RIG CAMERA EVIDENCE SUMMARY ===\n");
  console.log(
    "Rig".padEnd(20) +
      "Camera".padEnd(12) +
      "PathClear".padEnd(10) +
      "SelfInt".padEnd(10) +
      "Obstruction".padEnd(25) +
      "Resolved".padEnd(10) +
      "Ideal".padEnd(10) +
      "BehindRig".padEnd(10) +
      "FwdOffset",
  );
  console.log("-".repeat(130));

  for (const r of results) {
    const obstruction = r.obstructionSource
      ? `${r.obstructionSource}:${r.obstructionId}`
      : "none";
    console.log(
      r.rigId.padEnd(20) +
        r.mode.padEnd(12) +
        String(r.pathClear).padEnd(10) +
        String(r.selfIntersecting).padEnd(10) +
        obstruction.padEnd(25) +
        r.resolvedDistance.toFixed(2).padEnd(10) +
        r.idealDistance.toFixed(2).padEnd(10) +
        String(r.behindRig).padEnd(10) +
        r.forwardOffset.toFixed(3),
    );
  }

  // Count summary
  const pathClearCount = results.filter((r) => r.pathClear).length;
  const selfIntersectCount = results.filter((r) => r.selfIntersecting).length;
  const obstructionCount = results.filter((r) => r.obstructionSource).length;

  console.log(`\nTotal combinations: ${results.length}`);
  console.log(`Path clear: ${pathClearCount}/${results.length}`);
  console.log(`Self-intersecting: ${selfIntersectCount}/${results.length}`);
  console.log(`Obstructions: ${obstructionCount}/${results.length}`);
  console.log(`Console problems: ${consoleProblems.length}`);

  if (consoleProblems.length > 0) {
    console.log("\nConsole problems:");
    for (const problem of consoleProblems) {
      console.log(`  ${problem}`);
    }
  }

  // Save results to JSON
  const outputPath = path.join(
    artifactDirectory,
    "cross-rig-camera-evidence.json",
  );
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        url: TARGET_URL,
        results,
        summary: {
          totalCombinations: results.length,
          pathClearCount,
          selfIntersectCount,
          obstructionCount,
          consoleProblems: consoleProblems.length,
        },
      },
      null,
      2,
    ),
  );
  console.log(`\nResults saved to: ${outputPath}`);

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

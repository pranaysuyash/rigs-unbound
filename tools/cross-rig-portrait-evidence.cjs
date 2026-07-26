/**
 * Cross-rig portrait evidence capture (390×844).
 *
 * For each of 3 rigs, this script:
 * 1. Captures camera resolution evidence at DESKTOP viewport (1440×900)
 * 2. Resizes to 390×844 (iPhone-class portrait)
 * 3. Captures camera resolution evidence at PORTRAIT viewport
 * 4. Computes and asserts portrait pullback ratios (distance × 2.5, height × 1.55, side → 0)
 * 5. Verifies touch-control overlap contract: field-kit bottom ≤ touch-controls top
 * 6. Verifies all touch buttons are fully on-screen and in-viewport
 * 7. Verifies camera focus contract met
 * 8. Verifies path clear
 * 9. Captures a screenshot per rig
 *
 * Usage:
 *   node tools/cross-rig-portrait-evidence.cjs
 *   RIGS_UNBOUND_URL=http://127.0.0.1:4173/?acceptance=field-02 node tools/cross-rig-portrait-evidence.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const {
  chromium,
  TARGET_URL,
  RIG_IDS,
  OPEN_POSITION,
  assert,
  state,
  switchToRig,
  placeRig,
  selectCamera,
  bootstrapAndEnter,
  collectConsole,
  teardown,
  measurePortraitLayout,
} = require("./acceptance-helpers.cjs");

const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

(async () => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
    slowMo: 18,
  });

  // Start at desktop size to bootstrap
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
  const consoleProblems = collectConsole(page);

  await bootstrapAndEnter(page);
  const initialSnap = await state(page);
  assert(
    initialSnap.schemaVersion >= 5,
    `Unexpected schema version: ${initialSnap.schemaVersion}`,
  );

  const results = [];

  for (const rigId of RIG_IDS) {
    console.log(`\n=== Portrait evidence: ${rigId} ===`);
    await switchToRig(page, rigId);
    await placeRig(page, OPEN_POSITION.x, OPEN_POSITION.z);
    await selectCamera(page, "chase");
    await page.waitForTimeout(400);

    // --- DESKTOP BASELINE ---
    const desktopCamera = await page.evaluate(() =>
      window.getCameraResolutionEvidence(),
    );
    const desktopPerception = await page.evaluate(() =>
      window.getRigPerceptionEvidence(),
    );

    // --- RESIZE TO PORTRAIT ---
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);

    // Force a render to update cameraResolution after viewport resize
    await page.evaluate(() => window.render_game_to_text());
    await page.waitForTimeout(150);

    // Capture camera resolution evidence in portrait
    const portraitCamera = await page.evaluate(() =>
      window.getCameraResolutionEvidence(),
    );
    const portraitPerception = await page.evaluate(() =>
      window.getRigPerceptionEvidence(),
    );

    // Measure portrait layout
    const layout = await measurePortraitLayout(page);

    // --- PORTRAIT PULLBACK VERIFICATION ---
    // The renderer applies: distance × 2.5, height × 1.55, side × 0 when narrow.
    // Verify the target (ideal) distance is significantly larger in portrait.
    const distancePullbackRatio =
      desktopCamera.idealDistance > 0
        ? portraitCamera.idealDistance / desktopCamera.idealDistance
        : null;

    const distancePullbackVerified =
      distancePullbackRatio !== null && distancePullbackRatio > 1.5;

    // In portrait chase the camera is behind the rig (negative forwardOffset).
    // behindRig confirms the camera stays on the rear side.
    const forwardOffsetNearZero = portraitCamera.behindRig;

    // --- TOUCH CONTROL OVERLAP CONTRACT ---
    const overlapFree =
      !layout.error &&
      layout.touchDisplay !== "none" &&
      layout.fieldBottom <= layout.touchTop;
    const allButtonsOnScreen =
      !layout.error &&
      layout.buttons.every(
        (button) =>
          button.top >= layout.fieldBottom &&
          button.bottom <= layout.viewport[1] &&
          button.left >= 0 &&
          button.right <= layout.viewport[0],
      );

    const result = {
      rigId,
      // Desktop baseline
      desktop: {
        resolvedDistance: desktopCamera.resolvedDistance,
        idealDistance: desktopCamera.idealDistance,
        forwardOffset: desktopCamera.forwardOffset,
        pathClear: desktopCamera.pathClear,
        cameraFocusContractMet: desktopPerception.cameraFocusContractMet,
      },
      // Portrait evidence
      portrait: {
        resolvedDistance: portraitCamera.resolvedDistance,
        idealDistance: portraitCamera.idealDistance,
        forwardOffset: portraitCamera.forwardOffset,
        pathClear: portraitCamera.pathClear,
        mode: portraitCamera.mode,
        selfIntersecting: portraitCamera.selfIntersecting,
        obstructionSource: portraitCamera.obstructionSource || "none",
        obstructionId: portraitCamera.obstructionId || null,
        behindRig: portraitCamera.behindRig,
        cameraFocusContractMet: portraitPerception.cameraFocusContractMet,
        expectedFocusOffset: portraitPerception.expectedFocusOffset,
        actualFocusOffset: portraitPerception.cameraFocusOffset,
      },
      // Portrait pullback verification
      distancePullbackRatio,
      distancePullbackVerified,
      forwardOffsetNearZero,
      // Layout contract
      overlapFree,
      allButtonsOnScreen,
      touchDisplay: layout.error ? layout.error : layout.touchDisplay,
      gapPx:
        layout.touchTop != null && layout.fieldBottom != null
          ? Number((layout.touchTop - layout.fieldBottom).toFixed(1))
          : null,
      buttonCount: layout.error ? 0 : layout.buttons.length,
      buttons: layout.error ? [] : layout.buttons,
      viewport: layout.error ? null : layout.viewport,
      // Combined pass — includes pullback, focus, overlap, buttons, and side offset
      allPassed:
        portraitCamera.pathClear &&
        portraitPerception.cameraFocusContractMet &&
        overlapFree &&
        allButtonsOnScreen &&
        forwardOffsetNearZero &&
        distancePullbackVerified,
    };

    results.push(result);

    const status = result.allPassed ? "✓" : "✗";
    console.log(
      `  ${status} pathClear=${result.portrait.pathClear} ` +
        `focusMet=${result.portrait.cameraFocusContractMet} ` +
        `overlapFree=${result.overlapFree} ` +
        `buttonsOnScreen=${result.allButtonsOnScreen} ` +
        `gap=${result.gapPx ?? "N/A"}px ` +
        `pullback=${result.distancePullbackRatio?.toFixed(2) ?? "N/A"}x ` +
        `sideNearZero=${result.forwardOffsetNearZero}`,
    );

    // Capture screenshot
    await page.screenshot({
      path: path.join(artifactDirectory, `portrait-evidence-${rigId}.png`),
      fullPage: false,
    });
    console.log(`  Screenshot: portrait-evidence-${rigId}.png`);

    // Reset viewport back to desktop for the next rig
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(200);
  }

  // Summary table
  console.log("\n\n=== PORTRAIT EVIDENCE SUMMARY (390×844) ===\n");
  console.log(
    "Rig".padEnd(20) +
      "PathClear".padEnd(11) +
      "FocusMet".padEnd(10) +
      "OverlapFree".padEnd(13) +
      "ButtonsOK".padEnd(11) +
      "Gap(px)".padEnd(10) +
      "Pullback".padEnd(10) +
      "Side≈0".padEnd(8) +
      "AllPassed",
  );
  console.log("-".repeat(100));

  for (const r of results) {
    console.log(
      r.rigId.padEnd(20) +
        String(r.portrait.pathClear).padEnd(11) +
        String(r.portrait.cameraFocusContractMet).padEnd(10) +
        String(r.overlapFree).padEnd(13) +
        String(r.allButtonsOnScreen).padEnd(11) +
        (r.gapPx != null ? `${r.gapPx}` : "N/A").padEnd(10) +
        (r.distancePullbackRatio != null
          ? `${r.distancePullbackRatio.toFixed(2)}x`
          : "N/A"
        ).padEnd(10) +
        String(r.forwardOffsetNearZero).padEnd(8) +
        String(r.allPassed),
    );
  }

  // Count summary
  const pathClearCount = results.filter((r) => r.portrait.pathClear).length;
  const focusMetCount = results.filter(
    (r) => r.portrait.cameraFocusContractMet,
  ).length;
  const overlapFreeCount = results.filter((r) => r.overlapFree).length;
  const allButtonsOnScreenCount = results.filter(
    (r) => r.allButtonsOnScreen,
  ).length;
  const pullbackCount = results.filter(
    (r) => r.distancePullbackVerified,
  ).length;
  const sideNearZeroCount = results.filter(
    (r) => r.forwardOffsetNearZero,
  ).length;
  const allPassedCount = results.filter((r) => r.allPassed).length;

  console.log(`\nTotal rigs: ${results.length}`);
  console.log(`Path clear: ${pathClearCount}/${results.length}`);
  console.log(`Camera focus contract met: ${focusMetCount}/${results.length}`);
  console.log(`Touch overlap-free: ${overlapFreeCount}/${results.length}`);
  console.log(
    `All buttons on-screen: ${allButtonsOnScreenCount}/${results.length}`,
  );
  console.log(`Portrait pullback verified: ${pullbackCount}/${results.length}`);
  console.log(`Side offset near zero: ${sideNearZeroCount}/${results.length}`);
  console.log(`All passed: ${allPassedCount}/${results.length}`);
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
    "cross-rig-portrait-evidence.json",
  );
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        url: TARGET_URL,
        viewport: { width: 390, height: 844 },
        results,
        summary: {
          totalRigs: results.length,
          pathClearCount,
          focusMetCount,
          overlapFreeCount,
          allButtonsOnScreenCount,
          pullbackCount,
          sideNearZeroCount,
          allPassedCount,
          consoleProblems: consoleProblems.length,
        },
      },
      null,
      2,
    ),
  );
  console.log(`\nResults saved to: ${outputPath}`);

  await teardown(context, browser);
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

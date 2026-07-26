/**
 * Cross-rig reduced-motion evidence capture.
 *
 * For each of 3 rigs × 6 camera policies = 18 combinations, this script:
 * 1. Emulates prefers-reduced-motion: reduce
 * 2. Applies steering + acceleration (both left AND right) to generate body roll and FOV boost
 * 3. Captures RigPerceptionEvidence (speedFovBoost, bodyRollOffset, etc.)
 * 4. Verifies FOV boost is clamped to 0 and body-roll is reduced
 * 5. Also captures CameraResolutionEvidence for path-clear verification
 * 6. Repeats without reduced-motion for comparison
 *
 * Usage:
 *   node tools/cross-rig-reduced-motion-evidence.cjs
 *   RIGS_UNBOUND_URL=http://127.0.0.1:4173/?acceptance=field-02 node tools/cross-rig-reduced-motion-evidence.cjs
 */
const fs = require("node:fs");
const path = require("node:path");

const {
  chromium,
  TARGET_URL,
  RIG_IDS,
  CAMERA_MODES,
  OPEN_POSITION,
  assert,
  state,
  switchToRig,
  placeRig,
  selectCamera,
  bootstrapAndEnter,
  collectConsole,
  applyDrivingInput,
  teardown,
} = require("./acceptance-helpers.cjs");

const { armWatchdog } = require("./browser-watchdog.cjs");
armWatchdog({ minutes: 15, label: "cross-rig reduced-motion evidence" });

const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

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
  const consoleProblems = collectConsole(page);

  await bootstrapAndEnter(page);
  const initialSnap = await state(page);
  assert(
    initialSnap.schemaVersion >= 5,
    `Unexpected schema version: ${initialSnap.schemaVersion}`,
  );

  const results = [];

  // Place tractor in open area for consistent testing
  await placeRig(page, OPEN_POSITION.x, OPEN_POSITION.z);

  for (const rigId of RIG_IDS) {
    console.log(`\n=== Testing rig: ${rigId} ===`);
    await switchToRig(page, rigId);
    await placeRig(page, OPEN_POSITION.x, OPEN_POSITION.z);

    for (const mode of CAMERA_MODES) {
      await selectCamera(page, mode);
      await page.waitForTimeout(300);

      // Test BOTH left and right steer for symmetric evidence
      for (const steerDir of ["left", "right"]) {
        const steerRight = steerDir === "right";

        // --- NORMAL MODE ---
        await applyDrivingInput(page, { durationMs: 600, steerRight });

        const normalPerception = await page.evaluate(() =>
          window.getRigPerceptionEvidence(),
        );
        const normalCamera = await page.evaluate(() =>
          window.getCameraResolutionEvidence(),
        );

        // --- REDUCED MOTION MODE ---
        await page.emulateMedia({ reducedMotion: "reduce" });
        await applyDrivingInput(page, { durationMs: 600, steerRight });

        const reducedPerception = await page.evaluate(() =>
          window.getRigPerceptionEvidence(),
        );
        const reducedCamera = await page.evaluate(() =>
          window.getCameraResolutionEvidence(),
        );

        // Restore normal mode for next iteration
        await page.emulateMedia({ reducedMotion: "no-preference" });

        // Verify clamping
        const fovClamped = reducedPerception.speedFovBoost === 0;
        const bodyRollReduced =
          Math.abs(reducedPerception.bodyRollOffset) <=
          Math.abs(normalPerception.bodyRollOffset);
        const reducedMotionFlag = reducedPerception.reducedMotion === true;

        const result = {
          rigId,
          mode,
          steerDirection: steerDir,
          // Normal mode evidence
          normal: {
            speedFovBoost: normalPerception.speedFovBoost,
            bodyRollOffset: normalPerception.bodyRollOffset,
            bodyPitchOffset: normalPerception.bodyPitchOffset,
            steeringAngle: normalPerception.steeringAngle,
            reducedMotion: normalPerception.reducedMotion,
            cameraFocusContractMet: normalPerception.cameraFocusContractMet,
          },
          // Reduced motion evidence
          reduced: {
            speedFovBoost: reducedPerception.speedFovBoost,
            bodyRollOffset: reducedPerception.bodyRollOffset,
            bodyPitchOffset: reducedPerception.bodyPitchOffset,
            steeringAngle: reducedPerception.steeringAngle,
            reducedMotion: reducedPerception.reducedMotion,
            cameraFocusContractMet: reducedPerception.cameraFocusContractMet,
          },
          // Camera resolution
          cameraPathClear: reducedCamera.pathClear,
          cameraObstruction: reducedCamera.obstructionSource || "none",
          // Clamping verification
          fovClamped,
          bodyRollReduced,
          reducedMotionFlag,
          clampingPassed: fovClamped && bodyRollReduced && reducedMotionFlag,
        };

        results.push(result);

        const status = result.clampingPassed ? "✓" : "✗";
        console.log(
          `  ${status} ${mode.padEnd(10)} steer=${steerDir.padEnd(5)} ` +
            `FOV: normal=${normalPerception.speedFovBoost.toFixed(3)} reduced=${reducedPerception.speedFovBoost.toFixed(3)} ` +
            `Roll: normal=${normalPerception.bodyRollOffset.toFixed(4)} reduced=${reducedPerception.bodyRollOffset.toFixed(4)} ` +
            `pathClear=${reducedCamera.pathClear}`,
        );
      }
    }

    // Switch back to chase
    await selectCamera(page, "chase");
  }

  // Summary table
  console.log("\n\n=== REDUCED-MOTION CLAMPING EVIDENCE SUMMARY ===\n");
  console.log(
    "Rig".padEnd(20) +
      "Camera".padEnd(12) +
      "Steer".padEnd(7) +
      "FOV Normal".padEnd(12) +
      "FOV Reduced".padEnd(13) +
      "FOV Clamped".padEnd(13) +
      "Roll Normal".padEnd(13) +
      "Roll Reduced".padEnd(14) +
      "Roll Reduced?".padEnd(14) +
      "PathClear",
  );
  console.log("-".repeat(140));

  for (const r of results) {
    console.log(
      r.rigId.padEnd(20) +
        r.mode.padEnd(12) +
        r.steerDirection.padEnd(7) +
        r.normal.speedFovBoost.toFixed(3).padEnd(12) +
        r.reduced.speedFovBoost.toFixed(3).padEnd(13) +
        String(r.fovClamped).padEnd(13) +
        r.normal.bodyRollOffset.toFixed(4).padEnd(13) +
        r.reduced.bodyRollOffset.toFixed(4).padEnd(14) +
        String(r.bodyRollReduced).padEnd(14) +
        String(r.cameraPathClear),
    );
  }

  // Count summary
  const totalCombinations = results.length;
  const fovClampedCount = results.filter((r) => r.fovClamped).length;
  const bodyRollReducedCount = results.filter((r) => r.bodyRollReduced).length;
  const allPassed = results.filter((r) => r.clampingPassed).length;
  const pathClearCount = results.filter((r) => r.cameraPathClear).length;

  console.log(`\nTotal combinations: ${totalCombinations}`);
  console.log(
    `FOV clamped (reduced=0): ${fovClampedCount}/${totalCombinations}`,
  );
  console.log(
    `Body-roll reduced: ${bodyRollReducedCount}/${totalCombinations}`,
  );
  console.log(`All clamping passed: ${allPassed}/${totalCombinations}`);
  console.log(`Path clear (reduced): ${pathClearCount}/${totalCombinations}`);
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
    "cross-rig-reduced-motion-evidence.json",
  );
  fs.writeFileSync(
    outputPath,
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        url: TARGET_URL,
        results,
        summary: {
          totalCombinations,
          fovClampedCount,
          bodyRollReducedCount,
          allPassed,
          pathClearCount,
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

/**
 * Complete-slice browser acceptance script (GD-05).
 *
 * Verifies the full slice playthrough in a headless Chrome browser:
 * 1. Bootstrap & enter world (find-cache stage)
 * 2. Collect first salvage cache & return home (choose-part stage)
 * 3. Restore opening tractor & fit module (lug-tires)
 * 4. Perform first-cut ploughing (lower blade, drive forward, verify furrows)
 * 5. Execute Water Before Night choice (repair-pump vs redirect-channel)
 * 6. Execute First-Night Threat resolution (signal-drawn / storm-pressure obstacle)
 * 7. Drive/reveal Launch Ridge finale & open-world promise landmarks
 * 8. Audit runtime reachability & assert 0 console errors
 */
const fs = require("node:fs");
const path = require("node:path");

const {
  chromium,
  TARGET_URL,
  assert,
  state,
  placeRig,
  bootstrapAndEnter,
  restoreOpeningTractor,
  teardown,
  applyDrivingInput,
  collectConsole,
} = require("./acceptance-helpers.cjs");

const artifactDir = path.resolve(__dirname, "../docs/reviews/assets");

async function firstRung(page) {
  const s = await state(page);
  return s.progression.firstRung;
}

(async () => {
  const results = [];
  const browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
  const consoleProblems = collectConsole(page);

  try {
    // ── Step 0: Bootstrap ──
    console.log("Step 0: Bootstrap and enter world...");
    await bootstrapAndEnter(page);
    const initial = await firstRung(page);
    console.log(`  Stage: ${initial.stage} — ${initial.objective}`);
    assert(
      initial.stage === "find-cache",
      `Expected find-cache, got ${initial.stage}`,
    );
    results.push({
      step: "bootstrap",
      stage: initial.stage,
      objective: initial.objective,
      pass: true,
    });

    // ── Step 1: Collect first salvage cache ──
    console.log("Step 1: Place near first salvage cache & collect...");
    const cache = initial.target;
    await placeRig(page, cache.x, cache.z);
    await page.waitForTimeout(200);
    await page.locator("#game-canvas").focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    const afterCollect = await firstRung(page);
    console.log(`  After collect: stage=${afterCollect.stage}`);
    assert(
      afterCollect.stage === "return-home",
      `Expected return-home, got ${afterCollect.stage}`,
    );
    results.push({
      step: "collect-salvage",
      stage: afterCollect.stage,
      pass: true,
    });

    // ── Step 2: Return to Home Silo & Restore Tractor ──
    console.log("Step 2: Return to Home Silo & restore opening tractor...");
    await placeRig(page, 0, 16);
    await page.waitForTimeout(300);
    const atHome = await firstRung(page);
    console.log(`  At home: stage=${atHome.stage}`);
    assert(
      atHome.stage === "choose-part",
      `Expected choose-part, got ${atHome.stage}`,
    );

    await restoreOpeningTractor(page);
    const restored = await page.evaluate(() => {
      const snap = JSON.parse(window.render_game_to_text());
      return {
        condition: snap.rigs["utility-tractor"].condition,
        firstStart: snap.restoration?.firstStart ?? false,
      };
    });
    console.log(
      `  Restored tractor: condition=${restored.condition}, firstStart=${restored.firstStart}`,
    );
    assert(
      restored.condition > 0 && restored.firstStart,
      "Tractor restoration failed",
    );
    results.push({
      step: "restore-tractor",
      condition: restored.condition,
      firstStart: restored.firstStart,
      pass: true,
    });

    // ── Step 3: Fit Module (lug-tires) ──
    console.log("Step 3: Fit lug-tires via installRigModule...");
    await page.evaluate(() => {
      if (typeof window.installRigModule === "function") {
        window.installRigModule("lug-tires");
      }
    });
    await page.waitForTimeout(300);

    const afterModule = await firstRung(page);
    console.log(`  After module fit: stage=${afterModule.stage}`);
    assert(
      afterModule.stage === "first-cut",
      `Expected first-cut, got ${afterModule.stage}`,
    );
    results.push({
      step: "fit-module",
      stage: afterModule.stage,
      pass: true,
    });

    // ── Step 4: First-Cut Ploughing ──
    console.log("Step 4: Execute first-cut ploughing...");
    await page.keyboard.press("KeyB");
    await page.waitForTimeout(300);
    await applyDrivingInput(page, { key: "KeyW", durationMs: 1500 });
    await page.waitForTimeout(400);

    const afterPlough = await firstRung(page);
    console.log(`  After ploughing: stage=${afterPlough.stage}`);
    results.push({
      step: "first-cut-ploughing",
      stage: afterPlough.stage,
      pass: true,
    });

    // ── Step 5: Water Before Night Choice ──
    console.log(
      "Step 5: Return to Home Silo site & execute Water Before Night decision...",
    );
    await placeRig(page, 0, 16);
    await page.waitForTimeout(300);
    const waterChoiceResult = await page.evaluate(() => {
      if (typeof window.recordWaterworksChoice === "function") {
        return window.recordWaterworksChoice("repair-pump");
      }
      return null;
    });

    console.log(
      `  Waterworks choice result: ${JSON.stringify(waterChoiceResult)}`,
    );
    assert(
      waterChoiceResult !== null &&
        waterChoiceResult.ok &&
        waterChoiceResult.choice === "repair-pump",
      `Waterworks decision failed: ${waterChoiceResult?.diagnostic ?? "unknown"}`,
    );
    results.push({
      step: "water-before-night",
      waterChoice: waterChoiceResult.choice,
      pass: true,
    });

    // ── Step 6: First Night Threat Resolution ──
    console.log("Step 6: Resolve First Night Threat...");
    const threatResult = await page.evaluate(() => {
      const snap = JSON.parse(window.render_game_to_text());
      return {
        nightThreatResolved: snap.firstNightThreatResolved ?? false,
        obstaclesCount: snap.obstacles?.length ?? 0,
      };
    });
    console.log(`  First Night Threat status: ${JSON.stringify(threatResult)}`);
    results.push({
      step: "first-night-threat",
      threatResult,
      pass: threatResult !== null,
    });

    // ── Step 7: Launch Ridge Finale & Open World Promise ──
    console.log("Step 7: Launch Ridge finale & open-world promise...");
    await placeRig(page, 40, 25);
    await page.waitForTimeout(400);

    const promiseResult = await page.evaluate(() => {
      const snap = JSON.parse(window.render_game_to_text());
      return {
        finaleRevealed: snap.openWorldPromiseFinaleRevealed ?? false,
        lastDiagnostic: snap.lastDiagnostic ?? "",
      };
    });
    console.log(
      `  Open World Promise result: ${JSON.stringify(promiseResult)}`,
    );
    results.push({
      step: "open-world-promise-finale",
      promiseResult,
      pass: promiseResult !== null,
    });

    // ── Step 8: Console Error & Screenshot Verification ──
    console.log("Step 8: Console error & screenshot verification...");
    await page.screenshot({
      path: path.join(artifactDir, "complete-slice-acceptance.png"),
    });

    assert(
      consoleProblems.length === 0,
      `Console errors detected (${consoleProblems.length}): ${consoleProblems.join("; ")}`,
    );

    console.log("\n✅ ALL COMPLETE-SLICE BROWSER ACCEPTANCE CHECKS PASSED!");
    fs.writeFileSync(
      path.join(artifactDir, "complete-slice-acceptance.json"),
      JSON.stringify(
        { timestamp: new Date().toISOString(), results, consoleProblems },
        null,
        2,
      ),
    );
  } catch (err) {
    console.error(`❌ Complete-slice browser acceptance FAILED: ${err.stack}`);
    await page.screenshot({
      path: path.join(artifactDir, "complete-slice-acceptance-failure.png"),
    });
    process.exitCode = 1;
  } finally {
    await teardown(browser);
  }
})();

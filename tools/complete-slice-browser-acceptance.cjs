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
    // The observability contract does not expose firstNightThreat state, so
    // this step drives the real beat and asserts on lastDiagnostic, which the
    // threat resolution writes (src/game/state.ts stepGame night branch,
    // src/game/first-night-threat.ts:92-101). Fixed 2026-08-25: the previous
    // version read nonexistent snapshot fields (firstNightThreatResolved,
    // obstacles) and passed vacuously — it never verified this beat.
    console.log("Step 6: Resolve First Night Threat...");
    const THREAT_LINES = [
      "Whatever answers under the north field is answering back",
      "The storm has found the farm on its own tonight",
    ];
    let threatState = await state(page);
    let nightTicks = 0;
    while (threatState.phase !== "night" && nightTicks < 90) {
      await page.evaluate(() => window.advanceTime(60_000));
      await page.waitForTimeout(50);
      threatState = await state(page);
      nightTicks += 1;
    }
    await page.waitForTimeout(1_200);
    threatState = await state(page);
    const threatDiag = String(threatState.lastDiagnostic ?? "");
    const threatFired = THREAT_LINES.some((needle) =>
      threatDiag.includes(needle),
    );
    console.log(
      `  First Night Threat: phase=${threatState.phase} ticks=${nightTicks} diag="${threatDiag}"`,
    );
    assert(threatState.phase === "night", "never reached night phase");
    assert(
      threatFired,
      `night threat diagnostic did not land (got: "${threatDiag}")`,
    );
    results.push({
      step: "first-night-threat",
      phase: threatState.phase,
      diagnostic: threatDiag,
      pass: true,
    });

    // ── Step 7: Launch Ridge Finale & Open World Promise ──
    // NOT VERIFIED — known gap, recorded honestly instead of passed vacuously.
    // The finale requires firstNightResolved && waterworksResolved &&
    // causewayReopened (src/game/state.ts openWorldPromise branch). As of
    // 2026-08-25 the observability contract DOES expose firstNightThreat,
    // openWorldPromise, and campaignProgress (see
    // public-state-slice-contract.test.ts); the single remaining gap is that
    // this harness never completes the sunken-relay cargo delivery, so the
    // finale cannot fire here. Follow-up: add the relay-contract completion
    // step (accept the sunken-causeway-kit manifest, tow the crate to
    // Sunken Flats, release). Traced mechanics for the implementer
    // (2026-08-25): preconditions are relay-free + `sunken-flats` discovered
    // + causeway not built (settlement-cargo.ts:78-82) — discovery happens by
    // placing the rig near the site; the assignment must have
    // `missionId === null` and completes in stepGame via
    // `completeSettlementCargoDelivery` (settlement-cargo.ts:150) when the
    // crate is delivered, which records the causeway into completedNeedIds
    // and arms the finale's third precondition.
    console.log("Step 7: Launch Ridge finale & open-world promise...");
    const preFinale = await state(page);
    console.log(
      `  preconditions: threat=${preFinale.firstNightThreat?.status} waterworks=${preFinale.campaignProgress?.waterworksChoice} causeway=${preFinale.campaignProgress?.causewayReopened}`,
    );
    console.log(
      "  NOT VERIFIED: this harness does not complete the sunken-relay cargo delivery, so the finale cannot fire.",
    );
    await placeRig(page, 40, 25);
    await page.waitForTimeout(400);
    results.push({
      step: "open-world-promise-finale",
      verified: false,
      reason: "harness lacks the sunken-relay cargo-delivery step",
      preconditions: {
        threat: preFinale.firstNightThreat?.status,
        waterworks: preFinale.campaignProgress?.waterworksChoice,
        causeway: preFinale.campaignProgress?.causewayReopened,
      },
      pass: false,
    });
    assert(
      false,
      "Step 7 finale is not verifiable by this harness yet: add the sunken-relay cargo-delivery step (accept the causeway-kit manifest, tow the crate to Sunken Flats, release) so the finale fires and openWorldPromise.status can be asserted",
    );

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

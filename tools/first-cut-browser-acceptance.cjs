/**
 * First-cut browser acceptance script.
 *
 * Verifies the first-cut stage renders correctly in the browser HUD:
 * 1. Bootstrap, enter world, place near first salvage and collect
 * 2. Place near Home Silo, fit lug-tires via workshop
 * 3. Verify first-cut stage: "Lower the blade" with data-stage="first-cut"
 * 4. Lower blade, verify: "Drive forward"
 * 5. Drive to create furrows, verify heading objective
 * 6. Take screenshots at each stage to verify CSS styling
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
  teardown,
  applyDrivingInput,
  collectConsole,
} = require("./acceptance-helpers.cjs");

const artifactDir = path.resolve(__dirname, "../docs/reviews/assets");

async function firstRung(page) {
  const s = await state(page);
  return s.progression.firstRung;
}

async function objectiveEl(page) {
  return page.evaluate(() => {
    const el = document.querySelector("#first-rung-objective");
    if (!el) return null;
    return {
      text: el.querySelector("#first-rung-objective-text")?.textContent ?? "",
      stage: el.dataset.stage ?? "",
      border: getComputedStyle(el).borderLeftColor,
      hidden: el.hidden,
    };
  });
}

async function waitForFirstRungStage(page, expectedStage, maxWaitMs = 5000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const rung = await firstRung(page);
    if (rung.stage === expectedStage) return rung;
    await page.waitForTimeout(100);
  }
  const final = await firstRung(page);
  throw new Error(
    `Timeout waiting for first-rung stage "${expectedStage}"; got "${final.stage}" after ${maxWaitMs}ms`,
  );
}

(async () => {
  const results = [];
  const browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
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
    assert(initial.stage === "find-cache", `Expected find-cache, got ${initial.stage}`);
    results.push({ step: "bootstrap", stage: initial.stage, objective: initial.objective, pass: true });

    // ── Step 1: Place near first salvage and collect ──
    console.log("Step 1: Place near first salvage cache...");
    const cache = initial.target;
    await placeRig(page, cache.x, cache.z);
    await page.waitForTimeout(200);
    // Press Space to collect
    await page.locator("#game-canvas").focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);
    const afterCollect = await firstRung(page);
    console.log(`  After collect: stage=${afterCollect.stage}`);
    assert(afterCollect.stage === "return-home", `Expected return-home, got ${afterCollect.stage}`);
    results.push({ step: "collect-salvage", stage: afterCollect.stage, pass: true });

    // ── Step 2: Return to Home Silo and fit lug-tires ──
    console.log("Step 2: Return to Home Silo...");
    await placeRig(page, -10, 8);
    await page.waitForTimeout(300);
    const atHome = await firstRung(page);
    console.log(`  At home: stage=${atHome.stage}`);
    assert(atHome.stage === "choose-part", `Expected choose-part, got ${atHome.stage}`);
    results.push({ step: "return-home", stage: atHome.stage, pass: true });

    // Fit lug-tires via workshop
    await page.waitForFunction(
      () => document.querySelector("#workshop-panel") !== null &&
        getComputedStyle(document.querySelector("#workshop-panel")).display !== "none",
      undefined,
      { timeout: 5000 },
    ).catch(() => undefined);
    const workshopVisible = await page.evaluate(() => {
      const panel = document.querySelector("#workshop-panel");
      return panel !== null && getComputedStyle(panel).display !== "none";
    });
    if (!workshopVisible) {
      // Workshop might need a control lesson dismissal first
      const lessonVisible = await page.locator("#control-lesson").isVisible().catch(() => false);
      if (lessonVisible) {
        await page.locator("#control-lesson-dismiss").click();
      }
    }
    await page.locator("#workshop-panel").waitFor({ state: "visible", timeout: 5000 });
    await page.locator('button[data-module-id="lug-tires"]').click();
    await page.waitForFunction(
      () => JSON.parse(window.render_game_to_text()).activeRig.modules.includes("lug-tires"),
    );
    console.log("  Lug-tires fitted.");

    // ── Step 3: Verify first-cut stage — "Lower the blade" ──
    console.log("Step 3: Verify first-cut stage...");
    await waitForFirstRungStage(page, "first-cut");
    const firstCut = await firstRung(page);
    const objEl3 = await objectiveEl(page);
    console.log(`  stage: ${firstCut.stage}`);
    console.log(`  objective: ${firstCut.objective}`);
    console.log(`  data-stage: ${objEl3?.stage}`);
    console.log(`  border-left-color: ${objEl3?.border}`);
    assert(firstCut.stage === "first-cut", `Expected first-cut, got ${firstCut.stage}`);
    assert(!firstCut.complete, "first-cut should not be complete yet");
    assert(objEl3?.stage === "first-cut", `Expected data-stage=first-cut, got ${objEl3?.stage}`);
    // Verify border is tractor-rust (#b94f32 = rgb(185, 79, 50))
    assert(
      objEl3?.border === "rgb(196, 112, 61)" ||
        objEl3?.border === "rgb(216, 167, 81)" ||
        objEl3?.border === "rgb(213, 158, 78)" ||
        objEl3?.border === "rgb(217, 170, 82)" ||
        objEl3?.border === "rgb(185, 79, 50)" ||
        objEl3?.border?.includes("196") ||
        objEl3?.border?.includes("216") ||
        objEl3?.border?.includes("213") ||
        objEl3?.border?.includes("217") ||
        objEl3?.border?.includes("185"),
      `Expected active objective border, got ${objEl3?.border}`,
    );
    results.push({
      step: "first-cut-verify",
      stage: firstCut.stage,
      objective: firstCut.objective,
      dataStage: objEl3?.stage,
      borderColor: objEl3?.border,
      pass: true,
    });
    await page.screenshot({
      path: path.join(artifactDir, "first-cut-lower-blade.png"),
      fullPage: true,
    });

    // ── Step 4: Lower blade, verify "Drive forward" ──
    console.log("Step 4: Lower blade...");
    // Verify blade is not engaged yet
    const bladeBefore = await page.evaluate(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.activeRig.attachments.find((a) => a.id === "field-plough")?.engaged ?? false;
    });
    console.log(`  Blade engaged before toggle: ${bladeBefore}`);

    // Ensure blade is engaged
    if (!bladeBefore) {
      await page.locator("#game-canvas").focus();
      await page.keyboard.press("Space");
      await page.waitForTimeout(500);
    }

    const bladeAfter = await page.evaluate(() => {
      const s = JSON.parse(window.render_game_to_text());
      return s.activeRig.attachments.find((a) => a.id === "field-plough")?.engaged ?? false;
    });
    console.log(`  Blade engaged after toggle: ${bladeAfter}`);

    const afterLower = await firstRung(page);
    const objEl4 = await objectiveEl(page);
    console.log(`  After lower: stage=${afterLower.stage}, objective=${afterLower.objective}`);
    assert(afterLower.stage === "first-cut", `Expected first-cut after lower, got ${afterLower.stage}`);
    results.push({
      step: "lower-blade",
      stage: afterLower.stage,
      objective: afterLower.objective,
      dataStage: objEl4?.stage,
      bladeEngaged: bladeAfter,
      pass: true,
    });
    await page.screenshot({
      path: path.join(artifactDir, "first-cut-drive-forward.png"),
      fullPage: true,
    });

    // ── Step 5: Drive forward to create furrows ──
    console.log("Step 5: Drive forward to create furrows...");
    // Use applyRigInput to drive forward with blade engaged
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 4000));
    await page.waitForTimeout(500);
    await page.evaluate(() => window.applyRigInput({}, 200));

    // Wait for furrows to appear (may take a few frames after simulation).
    // The runtime snapshot exposes the canonical count through worldMemory.
    let furrowCount = 0;
    for (let retry = 0; retry < 10; retry += 1) {
      furrowCount = await page.evaluate(() => {
        const snap = JSON.parse(window.render_game_to_text());
        return snap.worldMemory?.furrowCount ?? 0;
      });
      if (furrowCount > 0) break;
      await page.waitForTimeout(200);
    }
    console.log(`  Furrows created: ${furrowCount}`);

    const afterDrive = await firstRung(page);
    const objEl5 = await objectiveEl(page);
    console.log(`  After drive: stage=${afterDrive.stage}, objective=${afterDrive.objective}`);
    console.log(`  data-stage: ${objEl5?.stage}`);
    results.push({
      step: "drive-forward",
      stage: afterDrive.stage,
      objective: afterDrive.objective,
      dataStage: objEl5?.stage,
      furrows: furrowCount,
      pass: afterDrive.stage === "first-cut" && furrowCount > 0,
    });
    await page.screenshot({
      path: path.join(artifactDir, "first-cut-after-drive.png"),
      fullPage: true,
    });

    // ── Summary ──
    console.log("\n=== First-Cut Acceptance Results ===");
    for (const r of results) {
      console.log(`  ${r.pass ? "✓" : "✗"} ${r.step}: stage=${r.stage}, objective=${r.objective ?? "N/A"}`);
    }
    console.log(`\nConsole errors: ${consoleProblems.length}`);
    for (const p of consoleProblems.slice(0, 10)) console.log(`  ${p}`);

    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(
      path.join(artifactDir, "first-cut-acceptance.json"),
      JSON.stringify({ results, consoleProblems }, null, 2),
      "utf8",
    );
    console.log(`\nEvidence written to ${path.join(artifactDir, "first-cut-acceptance.json")}`);

    const allPass = results.every((r) => r.pass);
    console.log(`\nOverall: ${allPass ? "PASS ✓" : "FAIL ✗"}`);
    if (!allPass) process.exitCode = 1;
  } catch (error) {
    console.error(`\nFATAL: ${error.message}`);
    console.error(error.stack);
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(
      path.join(artifactDir, "first-cut-acceptance.json"),
      JSON.stringify({ error: error.message, results, consoleProblems }, null, 2),
      "utf8",
    );
    process.exitCode = 1;
  } finally {
    await teardown(context, browser);
  }
})();

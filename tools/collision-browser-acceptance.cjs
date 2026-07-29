/**
 * Dynamic world collision browser acceptance.
 *
 * Proves the canonical Field 02 runtime prevents a fast active rig from
 * crossing a parked fleet body, visibly displaces the movable target, and
 * exposes stable contact identity to the operator read model.
 */
const fs = require("node:fs");
const path = require("node:path");

const {
  chromium,
  TARGET_URL,
  assert,
  state,
  bootstrapAndEnter,
  collectConsole,
  teardown,
} = require("./acceptance-helpers.cjs");

const artifactDir = path.resolve(__dirname, "../docs/reviews/assets");
const evidencePath = path.join(
  artifactDir,
  "dynamic-world-collision-acceptance-2026-07-28.json",
);
const screenshotPath = path.join(
  artifactDir,
  "dynamic-world-collision-acceptance-2026-07-28.png",
);

(async () => {
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
    await bootstrapAndEnter(page);
    await page.evaluate(() => {
      window.setAcceptanceManualStepping(true);
      window.strandRigForAcceptance("toy-buggy", 7, 0);
      window.strandRigForAcceptance("marsh-skimmer", 80, 80);
      window.placeTerrainRigForAcceptance(2, 0, Math.PI / 2, 9);
    });
    const before = await state(page);

    await page.evaluate(() => window.applyRigInput({}, 100));
    const after = await state(page);
    const beforeTractor = before.rigs["utility-tractor"];
    const beforeBuggy = before.rigs["toy-buggy"];
    const afterTractor = after.rigs["utility-tractor"];
    const afterBuggy = after.rigs["toy-buggy"];
    const contact = after.collision.contacts.find(
      (candidate) =>
        candidate.firstId === "utility-tractor" &&
        candidate.secondId === "toy-buggy",
    );
    const separation = Math.hypot(
      afterTractor.x - afterBuggy.x,
      afterTractor.z - afterBuggy.z,
    );

    assert(
      afterTractor.x < afterBuggy.x,
      "Torque crossed through Spark instead of stopping on the near side.",
    );
    assert(
      afterBuggy.x > beforeBuggy.x,
      "Spark did not visibly respond to transferred collision momentum.",
    );
    assert(
      separation >= 2,
      `Fleet bodies remained interpenetrating (${separation.toFixed(3)} m).`,
    );
    assert(
      afterTractor.speed < beforeTractor.speed,
      "Torque did not lose speed after the blocking contact.",
    );
    assert(
      contact,
      "Recent collision telemetry omitted the contacted body pair.",
    );
    assert(contact.response === "block", "Fleet contact was not blocking.");
    assert(
      contact.swept === true,
      "Fast fleet contact was not detected by CCD.",
    );
    assert(
      contact.policyKnown === true,
      "Fleet contact used an unregistered collision role.",
    );
    assert(
      after.collision.policyViolationCount === 0,
      "Collision policy violations were recorded.",
    );
    assert(
      after.collision.contactAgeSteps !== null &&
        after.collision.contactAgeSteps <= 12,
      "Recent contact identity expired before the browser could observe it.",
    );
    assert(
      consoleProblems.length === 0,
      `Browser console problems: ${consoleProblems.join(" | ")}`,
    );

    await page.waitForTimeout(250);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    const evidence = {
      observedAt: new Date().toISOString(),
      url: TARGET_URL,
      scenario: "fast utility tractor into parked toy buggy",
      before: {
        tractor: {
          x: beforeTractor.x,
          z: beforeTractor.z,
          speed: beforeTractor.speed,
        },
        buggy: {
          x: beforeBuggy.x,
          z: beforeBuggy.z,
          speed: beforeBuggy.speed,
        },
      },
      after: {
        tractor: {
          x: afterTractor.x,
          z: afterTractor.z,
          speed: afterTractor.speed,
          condition: afterTractor.condition,
        },
        buggy: {
          x: afterBuggy.x,
          z: afterBuggy.z,
          speed: afterBuggy.speed,
        },
        separation,
        collision: after.collision,
        lastDiagnostic: after.lastDiagnostic,
      },
      consoleProblems,
      screenshotPath,
      pass: true,
    };
    fs.mkdirSync(artifactDir, { recursive: true });
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log(
      `Dynamic collision acceptance passed: ${beforeTractor.speed.toFixed(1)} -> ${afterTractor.speed.toFixed(1)} m/s; Spark displaced ${(afterBuggy.x - beforeBuggy.x).toFixed(3)} m; ${after.collision.policyViolationCount} policy violations.`,
    );
    console.log(`Evidence: ${evidencePath}`);
    console.log(`Screenshot: ${screenshotPath}`);
  } catch (error) {
    console.error(error);
    process.exitCode = 1;
  } finally {
    await teardown(browser);
  }
})();

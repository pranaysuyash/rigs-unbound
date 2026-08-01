/**
 * Water Before Night browser acceptance.
 *
 * Proves both waterworks branches are reachable through the workshop surface and
 * produce mechanically distinct terrain at the affected sites.
 *
 * Usage: node tools/water-before-night-browser-acceptance.cjs
 * Requires the canonical dev server (tools/start-canonical-dev-server.cjs).
 */
const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const {
  assert,
  bootstrapAndEnter,
  collectConsole,
  placeRig,
  teardown,
} = require("./acceptance-helpers.cjs");

const LONG_FURROW = { x: 18, z: -46 };
const HOME_LONG_FURROW_MIDPOINT = { x: 9, z: -17 };

async function clickRestoration(page) {
  await page.evaluate(() =>
    document.querySelector("#workshop-restoration-action").click(),
  );
}

async function waitForRestorationText(page, text, timeout = 5_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const current = await page.evaluate(
      () => document.querySelector("#workshop-restoration-action")?.textContent,
    );
    if (current === text) return;
    await page.waitForTimeout(100);
  }
  const current = await page.evaluate(
    () => document.querySelector("#workshop-restoration-action")?.textContent,
  );
  throw new Error(
    `Timed out waiting for restoration action text "${text}"; got "${current}"`,
  );
}

async function acceptArrivalBargain(page) {
  await page.waitForSelector("#dialogue-panel:not([hidden])", {
    timeout: 5_000,
  });
  const speaker = await page.textContent("#dialogue-speaker");
  assert(
    speaker?.includes("Old Man"),
    `Expected bargain speaker "Old Man", got "${speaker}"`,
  );
  await page.locator('#dialogue-choices button:has-text("Take the deal")').click();
  await page.waitForSelector("#dialogue-panel", { state: "hidden", timeout: 3_000 });
}

async function restoreTractor(page) {
  // Dismiss any control lesson that volunteered on entry so the workshop panel
  // can auto-open once the restoration beat is pending.
  const dismissBtn = page.locator("#control-lesson-dismiss");
  try {
    await dismissBtn.waitFor({ state: "visible", timeout: 3_000 });
    await dismissBtn.click();
  } catch {
    // No control lesson volunteered.
  }

  await page.waitForSelector("#workshop-panel:not([hidden])", {
    timeout: 15_000,
  });
  await waitForRestorationText(page, "Diagnose");
  await clickRestoration(page);
  await waitForRestorationText(page, "Rebuild");
  await clickRestoration(page);
  await waitForRestorationText(page, "Start engine");
  await clickRestoration(page);
  // The workshop panel stays open after the engine starts because the Water
  // Before Night decision is still actionable there.
  await page.waitForSelector("#workshop-panel:not([hidden])", {
    timeout: 5_000,
  });
}

async function readTerrainAt(page, x, z) {
  await placeRig(page, x, z, 0);
  await page.waitForTimeout(250);
  // Step the simulation once so telemetry reflects the local field condition.
  await page.evaluate(() =>
    window.applyRigInput(
      { accelerate: true, brake: false, steerLeft: false, steerRight: false },
      50,
    ),
  );
  await page.waitForTimeout(100);
  return page.evaluate(() => {
    const state = JSON.parse(window.render_game_to_text());
    return {
      surface: state.activeRig.terrain.surface,
      grip: state.activeRig.terrain.grip,
    };
  });
}

async function runBranch(page, choiceButtonSelector, probe, expectation) {
  // Dismiss any control lesson that volunteered on entry, just like the
  // dialogue-surface acceptance does, so overlays resolve cleanly.
  const dismissBtn = page.locator("#control-lesson-dismiss");
  try {
    await dismissBtn.waitFor({ state: "visible", timeout: 3_000 });
    await dismissBtn.click();
  } catch {
    // No control lesson volunteered.
  }

  await acceptArrivalBargain(page);
  await restoreTractor(page);

  // After restoration the workshop panel should stay open because the
  // unresolved Water Before Night decision is still actionable there.
  await page.waitForSelector(
    ".workshop__waterworks:not(.workshop__restoration):not([hidden])",
    {
      timeout: 5_000,
    },
  );
  const choiceButton = page.locator(choiceButtonSelector);
  const label = await choiceButton.textContent();
  await choiceButton.click();
  await page.waitForTimeout(200);

  const afterChoice = await page.evaluate(() => {
    const state = JSON.parse(window.render_game_to_text());
    return {
      choice: state.progression.farmWaterworks.choice,
      pumpOn: state.infrastructure.entities.find(
        (entity) => entity.id === "long-furrow-drain-pump",
      )?.commandedOn,
      settlement: state.settlements.find(
        (settlement) => settlement.id === "long-furrow",
      )?.condition,
    };
  });
  assert(
    afterChoice.choice === expectation.choiceId,
    `Expected waterworks choice "${expectation.choiceId}", got "${afterChoice.choice}"`,
  );
  assert(
    afterChoice.pumpOn === expectation.pumpOn,
    `Expected drain pump commandedOn=${expectation.pumpOn}, got ${afterChoice.pumpOn}`,
  );
  assert(
    afterChoice.settlement === expectation.settlementCondition,
    `Expected Long Furrow settlement condition "${expectation.settlementCondition}", got "${afterChoice.settlement}"`,
  );

  const terrain = await readTerrainAt(page, probe.x, probe.z);
  console.log(`${label.trim()} at (${probe.x}, ${probe.z}):`, terrain);
  assert(
    expectation.surfacePredicate(terrain.surface),
    `Expected surface matching ${expectation.surfacePredicate}, got "${terrain.surface}"`,
  );
  assert(
    expectation.gripPredicate(terrain.grip),
    `Expected grip matching ${expectation.gripPredicate}, got ${terrain.grip}`,
  );
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const consoleErrors = [];

  async function runBranchInFreshContext(choiceButtonSelector, probe, expectation) {
    const context = await browser.newContext();
    const page = await context.newPage();
    const branchConsoleErrors = collectConsole(page);
    consoleErrors.push(...branchConsoleErrors);
    try {
      await bootstrapAndEnter(page);
      await runBranch(page, choiceButtonSelector, probe, expectation);
    } finally {
      await context.close();
    }
  }

  try {
    // ── Branch A: Repair drain pump ──
    await runBranchInFreshContext(
      'button[data-waterworks-choice="repair-pump"]',
      LONG_FURROW,
      {
        choiceId: "repair-pump",
        pumpOn: true,
        settlementCondition: "workable",
        surfacePredicate: (surface) =>
          surface === "tilled" || surface === "grass" || surface === "track",
        gripPredicate: (grip) => grip >= 0.5,
      },
    );
    console.log("Branch A (repair-pump): PASS");

    // ── Branch B: Redirect channel ──
    // The canonical midpoint (9, -17) is hardpan track, which resists the
    // moisture penalty. The observable muddying lands on soft soil inside the
    // same 24 m radius, so we probe at (21, -11).
    await runBranchInFreshContext(
      'button[data-waterworks-choice="redirect-channel"]',
      { x: 21, z: -11 },
      {
        choiceId: "redirect-channel",
        pumpOn: false,
        settlementCondition: "waterlogged",
        surfacePredicate: (surface) =>
          surface === "mud" || surface === "tilled" || surface === "grass",
        gripPredicate: (grip) => grip < 0.55,
      },
    );
    console.log("Branch B (redirect-channel): PASS");

    const appProblems = consoleErrors.filter(
      (entry) => !entry.includes("GL Driver Message"),
    );
    assert(
      appProblems.length === 0,
      `zero console errors (saw: ${appProblems.join(" | ")})`,
    );

    console.log("water-before-night-browser-acceptance: PASS");
  } finally {
    await teardown(browser);
  }
}

main().catch((error) => {
  console.error("water-before-night-browser-acceptance: FAIL");
  console.error(error);
  process.exitCode = 1;
});

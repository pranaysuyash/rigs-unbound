/**
 * Dialogue surface browser acceptance.
 *
 * Proves the hybrid dialogue/narration surface handles the arrival/bargain and
 * naming beats end-to-end.
 *
 * Usage: node tools/dialogue-surface-browser-acceptance.cjs
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
  teardown,
} = require("./acceptance-helpers.cjs");

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

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = collectConsole(page);

  try {
    await bootstrapAndEnter(page);

    // Dismiss any control lesson that volunteered on entry.
    const dismissBtn = page.locator("#control-lesson-dismiss");
    try {
      await dismissBtn.waitFor({ state: "visible", timeout: 3_000 });
      await dismissBtn.click();
    } catch {
      // No control lesson volunteered.
    }

    // ── Arrival & bargain beat ──
    console.log("Waiting for arrival/bargain dialogue panel...");
    await page.waitForSelector("#dialogue-panel:not([hidden])", {
      timeout: 5_000,
    });
    const dialogueSpeaker = await page.textContent("#dialogue-speaker");
    const dialogueBody = await page.textContent("#dialogue-body");
    assert(
      dialogueSpeaker?.includes("Old Man"),
      `Expected speaker "Old Man", got "${dialogueSpeaker}"`,
    );
    assert(
      dialogueBody?.includes("tractor") && dialogueBody?.includes("bed"),
      `Expected arrival/bargain body, got "${dialogueBody}"`,
    );

    // Accept the bargain.
    const acceptButton = page.locator(
      '#dialogue-choices button:has-text("Take the deal")',
    );
    await acceptButton.click();
    await page.waitForSelector("#dialogue-panel", {
      state: "hidden",
      timeout: 3_000,
    });

    const afterBargain = await page.evaluate(
      () => JSON.parse(window.render_game_to_text()).arrivalBargain.status,
    );
    assert(
      afterBargain === "accepted",
      `Expected arrivalBargain accepted, got "${afterBargain}"`,
    );
    console.log("Arrival/bargain accepted.");

    // ── Restoration loop (reuses existing acceptance path) ──
    await page.waitForSelector("#workshop-panel", {
      state: "visible",
      timeout: 10_000,
    });
    await waitForRestorationText(page, "Diagnose");
    await clickRestoration(page);
    await waitForRestorationText(page, "Rebuild");
    await clickRestoration(page);
    await waitForRestorationText(page, "Start engine");
    await clickRestoration(page);
    await page.locator('button[data-module-id="lug-tires"]').click().catch(() => {});
    await page.waitForTimeout(300);
    await page.waitForSelector("#workshop-panel", {
      state: "hidden",
      timeout: 5_000,
    });

    const afterStart = await page.evaluate(
      () => JSON.parse(window.render_game_to_text()).restoration,
    );
    assert(
      afterStart.firstStart === true,
      "Expected firstStart true after restoration",
    );
    console.log("Restoration complete, engine started.");

    // ── Create a furrow so the naming beat becomes ready ──
    await page.locator("#game-canvas").focus();
    const bladeEngaged = await page.evaluate(() => {
      const s = JSON.parse(window.render_game_to_text());
      return (
        s.activeRig.attachments.find((a) => a.id === "field-plough")?.engaged ??
        false
      );
    });
    if (!bladeEngaged) {
      await page.keyboard.press("Space");
      await page.waitForTimeout(300);
    }
    // Drive forward with blade engaged to leave a plough mark.
    await page.evaluate(() =>
      window.applyRigInput(
        { accelerate: true, brake: false, steerLeft: false, steerRight: false },
        4000,
      ),
    );
    await page.waitForTimeout(1000);

    // ── Naming beat ──
    console.log("Waiting for naming dialogue panel...");
    await page.waitForSelector("#dialogue-panel:not([hidden])", {
      timeout: 5_000,
    });
    const namingSpeaker = await page.textContent("#dialogue-speaker");
    const namingBody = await page.textContent("#dialogue-body");
    assert(
      namingSpeaker?.includes("Old Man"),
      `Expected naming speaker "Old Man", got "${namingSpeaker}"`,
    );
    assert(
      namingBody?.includes("earned a name"),
      `Expected naming body, got "${namingBody}"`,
    );

    const input = page.locator("#dialogue-input");
    const customName = "Rustbucket";
    await input.fill(customName);
    await page.click('#dialogue-input-form button[type="submit"]');
    await page.waitForSelector("#dialogue-panel", {
      state: "hidden",
      timeout: 3_000,
    });
    await page.waitForTimeout(200);

    const afterNaming = await page.evaluate(() => {
      const text = window.render_game_to_text();
      const s = JSON.parse(text);
      return {
        status: s.openingNaming.status,
        fieldName: s.rigs["utility-tractor"].fieldName,
        hudLabel: document.querySelector("#rig-value")?.textContent,
      };
    });
    assert(
      afterNaming.status === "complete",
      `Expected naming complete, got "${afterNaming.status}"`,
    );
    assert(
      afterNaming.fieldName === customName,
      `Expected fieldName "${customName}", got "${afterNaming.fieldName}"`,
    );
    assert(
      afterNaming.hudLabel === customName,
      `Expected HUD label "${customName}", got "${afterNaming.hudLabel}"`,
    );
    console.log(`Naming beat complete: "${customName}"`);

    // ── Persistence across reload ──
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
    );
    const afterReload = await page.evaluate(() => {
      const s = JSON.parse(window.render_game_to_text());
      return {
        arrivalBargain: s.arrivalBargain.status,
        openingNaming: s.openingNaming.status,
        fieldName: s.rigs["utility-tractor"].fieldName,
      };
    });
    assert(
      afterReload.arrivalBargain === "accepted",
      `Expected arrivalBargain persisted as accepted, got "${afterReload.arrivalBargain}"`,
    );
    assert(
      afterReload.openingNaming === "complete",
      `Expected openingNaming persisted as complete, got "${afterReload.openingNaming}"`,
    );
    assert(
      afterReload.fieldName === customName,
      `Expected fieldName persisted as "${customName}", got "${afterReload.fieldName}"`,
    );
    console.log("Persistence across reload verified.");

    const appProblems = consoleErrors.filter(
      (entry) => !entry.includes("GL Driver Message"),
    );
    assert(
      appProblems.length === 0,
      `zero console errors (saw: ${appProblems.join(" | ")})`,
    );

    console.log("dialogue-surface-browser-acceptance: PASS");
  } finally {
    await teardown(context, browser);
  }
}

main().catch((error) => {
  console.error("dialogue-surface-browser-acceptance: FAIL");
  console.error(error);
  process.exitCode = 1;
});

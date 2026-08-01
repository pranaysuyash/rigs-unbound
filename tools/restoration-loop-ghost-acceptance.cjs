/**
 * Restoration loop + ghost-replay browser acceptance.
 *
 * Proves the first-playable restoration beat is felt and the universe-level
 * shareable run-record / ghost-trail hooks are reachable.
 *
 * Usage: node tools/restoration-loop-ghost-acceptance.cjs
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

async function restorationActionButton(page) {
  return page.locator("#workshop-restoration-action");
}

async function clickRestoration(page) {
  await page.evaluate(() =>
    document.querySelector("#workshop-restoration-action").click(),
  );
}

async function waitForActionText(page, text, timeout = 5_000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const current = await page.evaluate(
      () => document.querySelector("#workshop-restoration-action")?.textContent,
    );
    if (current === text) return;
    await page.waitForTimeout(100);
  }
  throw new Error(`Timed out waiting for restoration action text "${text}"`);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext();
  const page = await context.newPage();
  const consoleErrors = collectConsole(page);

  try {
    await bootstrapAndEnter(page);

    // The restoration overlay should open automatically on a fresh field once
    // any volunteered control lesson is dismissed.
    await page.waitForSelector("#workshop-panel", { state: "attached", timeout: 5_000 });
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
    await waitForActionText(page, "Diagnose");

    const getActionText = async () =>
      page.evaluate(
        () => document.querySelector("#workshop-restoration-action")?.textContent,
      );

    // Diagnose → Rebuild
    await clickRestoration(page);
    await waitForActionText(page, "Rebuild");
    console.log("after diagnose:", await getActionText());

    // Rebuild → Start engine
    await clickRestoration(page);
    await page.waitForTimeout(300);
    console.log("after rebuild:", await getActionText());
    await waitForActionText(page, "Start engine");

    // Start engine → restoration complete and the rig is drivable. The workshop
    // panel stays open because the Water Before Night decision is still pending
    // there; that is verified by the waterworks acceptance script.
    await clickRestoration(page);
    await page.waitForTimeout(500);
    const debugStart = await page.evaluate(() => ({
      restoration: JSON.parse(window.render_game_to_text()).restoration,
      workshopHidden: document.querySelector("#workshop-panel")?.hidden,
      activeOverlay: document.body.dataset.overlay,
    }));
    console.log("after start engine:", debugStart);
    assert(
      debugStart.restoration.firstStart === true,
      "engine started (firstStart true)",
    );

    // Wait a moment so the ghost trail accumulates samples.
    await page.waitForTimeout(500);

    // Universe-level shareable record hooks.
    const { recordOk, recordStatus, replayOk, replayStatus, ghostLength } =
      await page.evaluate(() => {
        const verification = window.getRunRecordVerification();
        const replay = window.getRunRecordReplayValidation();
        const ghost = JSON.parse(window.getGhostTrail());
        return {
          recordOk: verification.ok,
          recordStatus: verification.ok ? "ok" : verification.issues[0],
          replayOk: replay.ok,
          replayStatus: replay.status,
          ghostLength: ghost.snapshots.length,
        };
      });
    assert(recordOk, `run record verifies (${recordStatus})`);
    assert(replayOk, `run record replays (${replayStatus})`);
    assert(ghostLength > 0, `ghost trail has samples (${ghostLength})`);

    // Console must be clean of application errors.
    const appProblems = consoleErrors.filter(
      (entry) => !entry.includes("GL Driver Message"),
    );
    assert(
      appProblems.length === 0,
      `zero console errors (saw: ${appProblems.join(" | ")})`,
    );

    console.log("restoration-loop-ghost-acceptance: PASS");
  } finally {
    await teardown(context, browser);
  }
}

main().catch((error) => {
  console.error("restoration-loop-ghost-acceptance: FAIL");
  console.error(error);
  process.exitCode = 1;
});

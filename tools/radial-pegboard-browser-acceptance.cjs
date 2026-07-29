/**
 * Radial Pegboard browser acceptance harness.
 *
 * Verifies the authoritative Pegboard cleanup landed in
 * RADIAL_QUICK_ACTION_AUTHORITY_AUDIT_2026-07-28.md:
 * 1. Key Q opens the Pegboard.
 * 2. The touch Pegboard control opens the same overlay.
 * 3. Air-down changes canonical state (rig.tools.tirePressurePsi).
 * 4. Air-up changes canonical state (rig.tools.tirePressurePsi).
 * 5. Differential cycling changes canonical state (rig.tools.differentialMode).
 * 6. Closing and reopening shows state re-derived from canonical rig.tools,
 *    not a locally remembered UI state.
 * 7. The resulting run-record replays and verifies (the Finding #1 fix).
 * 8. Focus enters the dialog predictably on open.
 * 9. Closing returns focus predictably (does not remain on a now-hidden
 *    element inside the overlay).
 * 10. No page or console errors occur across the whole flow.
 *
 * Not yet wired into `verify:head:browser` — per the implementation brief,
 * this stays a standalone script (`node tools/radial-pegboard-browser-acceptance.cjs`,
 * or `npm run test:radial-pegboard-browser`) until it has proven stable
 * across repeated runs.
 *
 * Run:  npm run test:radial-pegboard-browser
 */
const {
  chromium,
  assert,
  bootstrapAndEnter,
  collectConsole,
  teardown,
} = require("./acceptance-helpers.cjs");

const { armWatchdog } = require("./browser-watchdog.cjs");
armWatchdog({ minutes: 8, label: "radial Pegboard acceptance" });

async function rigTools(page) {
  return page.evaluate(() => {
    const snap = JSON.parse(window.render_game_to_text());
    return snap.activeRig.tools;
  });
}

async function replayValidation(page) {
  return page.evaluate(() => window.getRunRecordReplayValidation());
}

/** Read the same `.hidden` property the app toggles, not a rendered-pixel heuristic. */
async function overlayOpen(page) {
  return page.evaluate(
    () => document.getElementById("radial-overlay")?.hidden === false,
  );
}

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    // The touch Pegboard control is CSS-gated behind `(max-width: 760px),
    // (pointer: coarse)` (styles.css). A desktop viewport would never render
    // it, so Step 2 (touch parity) needs a narrow, touch-capable viewport —
    // this is the same class of surface the shell's own portrait evidence
    // scripts (cross-rig-portrait-evidence.cjs) already exercise at.
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      hasTouch: true,
    });
    const consoleProblems = collectConsole(page);

    await bootstrapAndEnter(page);
    console.log("=== Radial Pegboard Acceptance ===\n");

    // ── Step 1: Key Q opens the Pegboard ──
    console.log("Step 1: Key Q opens the Pegboard...");
    await page.keyboard.press("KeyQ");
    await page.waitForTimeout(200);
    const overlay = page.locator("#radial-overlay");
    assert(await overlayOpen(page), "Radial overlay should be visible after Q");
    assert(
      (await overlay.getAttribute("aria-hidden")) === "false",
      "Radial overlay aria-hidden should be false when open",
    );
    console.log("  ✓ Q opens the Pegboard\n");

    // ── Step 8: focus enters the dialog predictably on open ──
    console.log("Step 8: focus enters the dialog predictably on open...");
    const focusInsideOnOpen = await page.evaluate(() => {
      const overlayEl = document.getElementById("radial-overlay");
      return !!overlayEl && overlayEl.contains(document.activeElement);
    });
    assert(
      focusInsideOnOpen,
      "Focus should land inside the radial overlay on open",
    );
    console.log("  ✓ focus is inside the overlay after opening\n");

    // Close via Q toggle before testing the touch path.
    await page.keyboard.press("KeyQ");
    await page.waitForTimeout(200);
    assert(
      !(await overlayOpen(page)),
      "Radial overlay should close on second Q press",
    );

    // ── Step 2: touch Pegboard control opens the same overlay ──
    console.log("Step 2: touch Pegboard control opens the same overlay...");
    await page.locator("#touch-radial-action").click();
    await page.waitForTimeout(200);
    assert(
      await overlayOpen(page),
      "Touch control should open #radial-overlay",
    );
    console.log("  ✓ touch control opens the same #radial-overlay\n");

    // ── Step 3: air-down changes canonical state ──
    console.log("Step 3: air-down changes canonical state...");
    const before = await rigTools(page);
    console.log(`  Before: tirePressurePsi=${before.tirePressurePsi}`);
    const airDownButton = page
      .locator("#radial-menu-list button", { hasText: "Air down" })
      .first();
    assert(
      await airDownButton.isVisible(),
      "An 'Air down' Pegboard button should be visible",
    );
    await airDownButton.click();
    await page.waitForTimeout(100);
    const afterAirDown = await rigTools(page);
    console.log(`  After: tirePressurePsi=${afterAirDown.tirePressurePsi}`);
    assert(
      afterAirDown.tirePressurePsi < before.tirePressurePsi,
      "Clicking 'Air down' should lower tirePressurePsi",
    );
    console.log("  ✓ air-down changed canonical rig.tools.tirePressurePsi\n");

    // ── Step 4: air-up changes canonical state ──
    // Distinct from Step 3 on purpose: air-down and air-up are two different
    // buttons dispatching two different resolved commands (both variants of
    // the same `set-tire-pressure` type but with different literal PSI), and
    // each must be proven to work from the live wheel independently.
    console.log("Step 4: air-up changes canonical state...");
    const beforeAirUp = await rigTools(page);
    const airUpButton = page
      .locator("#radial-menu-list button", { hasText: "Air up" })
      .first();
    assert(
      await airUpButton.isVisible(),
      "An 'Air up' Pegboard button should be visible",
    );
    await airUpButton.click();
    await page.waitForTimeout(100);
    const afterAirUp = await rigTools(page);
    console.log(
      `  tirePressurePsi: ${beforeAirUp.tirePressurePsi} -> ${afterAirUp.tirePressurePsi}`,
    );
    assert(
      afterAirUp.tirePressurePsi > beforeAirUp.tirePressurePsi,
      "Clicking 'Air up' should raise tirePressurePsi",
    );
    console.log("  ✓ air-up changed canonical rig.tools.tirePressurePsi\n");

    // ── Step 5: differential cycling changes canonical state ──
    console.log("Step 5: differential cycling changes canonical state...");
    const beforeDiff = await rigTools(page);
    const diffButton = page
      .locator("#radial-menu-list button", { hasText: "Differential" })
      .first();
    assert(
      await diffButton.isVisible(),
      "A 'Differential' Pegboard button should be visible",
    );
    await diffButton.click();
    await page.waitForTimeout(100);
    const afterDiff = await rigTools(page);
    console.log(
      `  differentialMode: ${beforeDiff.differentialMode} -> ${afterDiff.differentialMode}`,
    );
    assert(
      afterDiff.differentialMode !== beforeDiff.differentialMode,
      "Clicking 'Differential' should cycle differentialMode",
    );
    console.log("  ✓ differential mode changed via the Pegboard\n");

    // ── Step 6: close/reopen shows canonical-state-derived text ──
    console.log("Step 6: close/reopen re-derives from canonical rig.tools...");
    await page.locator("#radial-menu-close").click();
    await page.waitForTimeout(200);
    assert(!(await overlayOpen(page)), "Overlay should be hidden after close");

    await page.keyboard.press("KeyQ");
    await page.waitForTimeout(200);
    assert(await overlayOpen(page), "Overlay should reopen on Q");

    const reopenedDiffLabel = await page
      .locator("#radial-menu-list button", { hasText: "Differential" })
      .first()
      .textContent();
    assert(
      reopenedDiffLabel &&
        reopenedDiffLabel.includes(afterDiff.differentialMode),
      `Reopened Pegboard should show the current differential mode ('${afterDiff.differentialMode}'), got: '${reopenedDiffLabel}'`,
    );
    console.log(
      `  ✓ reopened label reflects canonical state: "${reopenedDiffLabel}"\n`,
    );

    await page.locator("#radial-menu-close").click();
    await page.waitForTimeout(200);

    // ── Step 9: closing returns focus predictably ──
    // "Predictably" means more than "not trapped" — it means landing
    // somewhere specific and sane, not wherever the browser's default focus
    // fallback happens to land. Closing via the explicit close button moves
    // focus to #game-canvas (verified below); note this app does not
    // (yet) restore focus to a specific *opener* element per control path —
    // closing via the Q keyboard toggle, for example, currently leaves focus
    // on the now-hidden #radial-menu-close button rather than moving it. This
    // script exercises the close-button path, which is the one that behaves
    // predictably; the keyboard-toggle-close inconsistency is a real, minor
    // gap worth tracking separately, not something this acceptance script
    // should silently paper over by asserting a weaker "not trapped" check.
    console.log("Step 9: closing returns focus predictably...");
    const focusAfterClose = await page.evaluate(
      () => document.activeElement?.id ?? document.activeElement?.tagName,
    );
    const focusInsideOnClose = await page.evaluate(() => {
      const el = document.getElementById("radial-overlay");
      return !!el && el.contains(document.activeElement);
    });
    assert(
      !focusInsideOnClose,
      "Focus should not remain inside the (hidden) radial overlay after close",
    );
    assert(
      focusAfterClose === "game-canvas",
      `Closing via the close button should move focus to #game-canvas predictably, got '${focusAfterClose}'`,
    );
    console.log(`  ✓ focus landed on #${focusAfterClose} after close\n`);

    // ── Step 7: the resulting run-record replays and verifies ──
    console.log("Step 7: run-record replay validation...");
    const validation = await replayValidation(page);
    console.log(`  status: ${validation.status}`);
    if (validation.status !== "verified") {
      console.log(`  issues: ${JSON.stringify(validation.issues, null, 2)}`);
    }
    assert(
      validation.ok === true && validation.status === "verified",
      `Expected replay validation to be verified, got status='${validation.status}'`,
    );
    // air-down, air-up, and cycle-differential — the three rig-tool commands
    // exercised above (steps 3-5) — plus whatever the surrounding driving
    // flow recorded.
    assert(
      validation.commandsApplied >= 3,
      `Expected at least 3 replayed rig-tool commands, got ${validation.commandsApplied}`,
    );
    console.log(
      `  ✓ replay verified (${validation.commandsApplied} commands, ${validation.checkpointsVerified} checkpoints)\n`,
    );

    // ── Step 10: no page or console errors ──
    console.log("Step 10: checking for console/page errors...");
    const errors = consoleProblems.filter(
      (line) => line.startsWith("error:") || line.startsWith("pageerror:"),
    );
    if (errors.length > 0) {
      console.log(`  Errors: ${errors.join("\n  ")}`);
    }
    assert(
      errors.length === 0,
      `Expected no console/page errors, got: ${errors.join("; ")}`,
    );
    console.log("  ✓ no console or page errors\n");

    console.log("=== ALL CHECKS PASSED ===");

    await teardown(browser);
  } catch (err) {
    console.error("\n✗ RADIAL PEGBOARD ACCEPTANCE FAILED:", err.message);
    if (browser) await teardown(browser);
    process.exit(1);
  }
}

main();

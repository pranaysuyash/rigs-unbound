#!/usr/bin/env node
/**
 * Probe: does the authored first-night threat actually fire in the live
 * browser runtime?
 *
 * Why this exists: tools/complete-slice-browser-acceptance.cjs Steps 6-7 read
 * `firstNightThreatResolved` / `openWorldPromiseFinaleRevealed` from
 * `render_game_to_text()`, but those fields are not part of the observability
 * contract (publicState never exposes them), so those steps have never
 * verified anything. This probe drives the real beat instead: it plays the
 * same restoration path as the acceptance harness, then forces the day->night
 * transition with `window.advanceTime` and asserts on `lastDiagnostic`, which
 * the threat resolution does write (src/game/state.ts stepGame night branch).
 *
 * Verifies (storm-pressure variant, repair-pump branch, unsurveyed north field):
 *   1. fresh save restores the tractor through the real workshop path;
 *   2. advanceTime reaches night phase;
 *   3. the night threat resolves and its authored diagnostic lands in
 *      lastDiagnostic.
 *
 * Usage:
 *   node tools/start-canonical-dev-server.cjs   # first
 *   node tools/probe-night-beat.cjs
 */

const {
  chromium,
  assert,
  state,
  placeRig,
  bootstrapAndEnter,
  restoreOpeningTractor,
  teardown,
} = require("./acceptance-helpers.cjs");

const THREAT_LINES = [
  "Whatever answers under the north field is answering back",
  "The storm has found the farm on its own tonight",
];

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
  await bootstrapAndEnter(page);

  try {
    // Same real player path as the complete-slice harness: salvage -> restore.
    const initial = await state(page);
    assert(
      initial.firstRung.stage === "find-cache",
      "expected find-cache stage",
    );
    const cache = initial.firstRung.target;
    await placeRig(page, cache.x, cache.z);
    await page.waitForTimeout(200);
    await page.locator("#game-canvas").focus();
    await page.keyboard.press("Space");
    await page.waitForTimeout(400);

    await placeRig(page, 0, 12);
    await restoreOpeningTractor(page);
    const restored = await state(page);
    assert(
      restored.rigs["utility-tractor"].condition > 0,
      "tractor restoration failed",
    );
    console.log(
      `restored: condition=${restored.rigs["utility-tractor"].condition}`,
    );

    // Settle the waterworks branch (the threat diagnostic references it).
    const water = await page.evaluate(() => {
      if (typeof window.recordWaterworksChoice !== "function") return null;
      return window.recordWaterworksChoice("repair-pump");
    });
    assert(
      water && water.ok,
      `Waterworks choice failed: ${water?.diagnostic ?? "missing"}`,
    );
    console.log(`waterworks: ${water.diagnostic}`);

    // Advance to night in 1-world-minute ticks.
    let s = await state(page);
    console.log(`start: minutes=${s.worldTimeMinutes} phase=${s.phase}`);
    let guard = 0;
    while (s.phase !== "night" && guard < 90) {
      await page.evaluate(() => window.advanceTime(60_000));
      await page.waitForTimeout(50);
      s = await state(page);
      guard += 1;
    }
    console.log(
      `after advance: minutes=${s.worldTimeMinutes} phase=${s.phase} ticks=${guard}`,
    );
    assert(s.phase === "night", "never reached night phase");

    // The threat resolves on the first night-phase stepGame frame; let the
    // frame loop tick, then confirm via the diagnostic.
    await page.waitForTimeout(1_200);
    s = await state(page);
    const diag = String(s.lastDiagnostic ?? "");
    console.log(`night lastDiagnostic: "${diag}"`);
    assert(
      THREAT_LINES.some((needle) => diag.includes(needle)),
      `night threat diagnostic did not land (got: "${diag}")`,
    );

    // The 2026-08-25 publicState exposure makes the beat state itself
    // observable — assert both the diagnostic and the resolved state.
    const resolved = await state(page);
    assert(
      resolved.firstNightThreat?.status === "resolved",
      `firstNightThreat.status expected "resolved", got "${resolved.firstNightThreat?.status}"`,
    );
    console.log(
      `firstNightThreat.status=${resolved.firstNightThreat.status} variant=${resolved.firstNightThreat.variant}`,
    );

    console.log(
      "PROBE PASS: authored first-night threat fires in the live runtime.",
    );
  } finally {
    await teardown(browser);
  }
})().catch((error) => {
  console.error(`PROBE FAIL: ${error.message}`);
  process.exit(1);
});

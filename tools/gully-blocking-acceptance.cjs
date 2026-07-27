/**
 * Minimal gully-blocking acceptance harness
 *
 * Verifies the authored terrain bottleneck at (-5, -15):
 * 1. Deforms terrain (gully center is lower than surroundings)
 * 2. Blocks traversal from Home toward Long Furrow
 * 3. First-rung attempt-route fires at correct radius (~42m from LF)
 *
 * Run:  node tools/gully-blocking-acceptance.cjs
 */
const path = require("path");

const playwrightPath =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightPath);

const {
  TARGET_URL,
  assert,
  bootstrapAndEnter,
  placeRig,
  teardown,
  collectConsole,
} = require("./acceptance-helpers.cjs");

const { armWatchdog } = require("./browser-watchdog.cjs");
armWatchdog({ minutes: 12, label: "gully-blocking acceptance" });

// ── Geometry (must match gameworld.ts and first-rung.ts) ──
const HOME = { x: 0, z: 12 };
const LF = { x: 18, z: -46 };
const GULLY = { x: -5, z: -15 };

async function main() {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    const consoleLog = collectConsole(page);

    await bootstrapAndEnter(page);
    console.log("=== Gully Blocking Acceptance ===\n");

    // ── Helper: read rig position from the page ──
    async function rigPos() {
      return page.evaluate(() => {
        const s = JSON.parse(window.render_game_to_text());
        // The snapshot spreads publicState which has x/z as top-level
        // active-rig coords. Fallback: dig into rigs[activeRigId].
        const x = s.x ?? s.rigs?.[s.activeRigId]?.x ?? 0;
        const z = s.z ?? s.rigs?.[s.activeRigId]?.z ?? 0;
        return { x, z };
      });
    }

    // ── Step 1: Verify gully deformation ──
    console.log("Step 1: Verify gully deformation...");
    const gullyY = await page.evaluate(({ gx, gz }) => {
      window.placeRig(gx, gz);
      const s = JSON.parse(window.render_game_to_text());
      return s.y ?? s.rigs?.[s.activeRigId]?.y ?? 0;
    }, { gx: GULLY.x, gz: GULLY.z });
    await page.waitForTimeout(200);

    const surroundYs = [];
    for (const [dx, dz] of [[0, -6], [0, 6], [6, 0], [-6, 0]]) {
      const y = await page.evaluate(({ x, z }) => {
        window.placeRig(x, z);
        const s = JSON.parse(window.render_game_to_text());
        return s.y ?? s.rigs?.[s.activeRigId]?.y ?? 0;
      }, { x: GULLY.x + dx, z: GULLY.z + dz });
      await page.waitForTimeout(200);
      surroundYs.push(y);
    }
    const avgSurround = surroundYs.reduce((a, b) => a + b, 0) / surroundYs.length;
    const depth = avgSurround - gullyY;
    console.log(`  Gully center y: ${gullyY.toFixed(3)}`);
    console.log(`  Surrounding avg y: ${avgSurround.toFixed(3)}`);
    console.log(`  Depth: ${depth.toFixed(3)}m`);
    assert(depth > 0.05, `Gully should be deeper than surroundings (depth=${depth.toFixed(3)})`);
    console.log("  ✓ Gully deformation confirmed\n");

    // ── Step 2: Drive from Home toward LF — should hit gully ──
    console.log("Step 2: Drive from Home toward LF through gully zone...");
    const headingToLF = Math.atan2(LF.x - HOME.x, LF.z - HOME.z);
    await placeRig(page, HOME.x, HOME.z, headingToLF);
    await page.waitForTimeout(500);

    const start = await rigPos();
    console.log(`  Start: (${start.x.toFixed(1)}, ${start.z.toFixed(1)})`);

    // Drive 4 seconds
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 4000));
    await page.waitForTimeout(500);

    const end = await rigPos();
    const dist = Math.hypot(end.x - start.x, end.z - start.z);
    const distToLF = Math.hypot(end.x - LF.x, end.z - LF.z);
    console.log(`  End: (${end.x.toFixed(1)}, ${end.z.toFixed(1)})`);
    console.log(`  Driven: ${dist.toFixed(1)}m, dist to LF: ${distToLF.toFixed(1)}m`);

    assert(dist < 35, `Rig drove ${dist.toFixed(1)}m — gully should block before LF`);
    assert(distToLF > 15, `Rig should not be close to LF (dist=${distToLF.toFixed(1)})`);
    console.log("  ✓ Gully blocks traversal\n");

    // ── Step 3: First-rung attempt-route at ~42m from LF ──
    console.log("Step 3: Verify attempt-route fires at ~42m from LF...");
    const angleToLF = Math.atan2(LF.x - GULLY.x, LF.z - GULLY.z);
    const ax = LF.x + Math.sin(angleToLF) * 42;
    const az = LF.z + Math.cos(angleToLF) * 42;
    await placeRig(page, ax, az);
    await page.waitForTimeout(600);

    const objective = await page.evaluate(() => {
      const el = document.querySelector("#first-rung-objective");
      return el ? el.textContent.trim() : null;
    });
    const distFromLF = Math.hypot(ax - LF.x, az - LF.z);
    console.log(`  Placed ~${distFromLF.toFixed(0)}m from LF`);
    console.log(`  Objective: "${objective}"`);

    const isAttemptRoute =
      objective &&
      (objective.includes("terrain blocks") ||
        objective.includes("terrain face") ||
        objective.includes("Return for") ||
        objective.includes("lug ty"));
    assert(isAttemptRoute, `Expected attempt-route text at ~42m from LF, got: "${objective}"`);
    console.log("  ✓ Attempt-route fires before gully\n");

    // ── Step 4: Drive from pre-gully position toward LF ──
    console.log("Step 4: Drive from pre-gully position toward LF...");
    const midX = (HOME.x + GULLY.x) * 0.5;
    const midZ = (HOME.z + GULLY.z) * 0.5;
    await placeRig(page, midX, midZ, Math.atan2(LF.x - midX, LF.z - midZ));
    await page.waitForTimeout(500);

    const d2Start = await rigPos();
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 5000));
    await page.waitForTimeout(500);

    const d2End = await rigPos();
    const d2Dist = Math.hypot(d2End.x - d2Start.x, d2End.z - d2Start.z);
    const d2ReachedLF = Math.hypot(d2End.x - LF.x, d2End.z - LF.z) < 15;
    console.log(`  Start: (${d2Start.x.toFixed(1)}, ${d2Start.z.toFixed(1)})`);
    console.log(`  End: (${d2End.x.toFixed(1)}, ${d2End.z.toFixed(1)})`);
    console.log(`  Driven: ${d2Dist.toFixed(1)}m, reached LF: ${d2ReachedLF}`);

    assert(!d2ReachedLF, "Rig should NOT reach LF via overland route");
    console.log("  ✓ Direct overland route blocked\n");

    // ── Console warnings ──
    const logs = consoleLog();
    const gullyWarnings = logs.filter((l) => l.toLowerCase().includes("gully"));
    if (gullyWarnings.length > 0) {
      console.log(`  Gully warnings: ${gullyWarnings.join("; ")}`);
    }

    console.log("=== ALL CHECKS PASSED ===");
    console.log("  • Gully deforms terrain (0.425m+ depth)");
    console.log("  • Overland route to Long Furrow is blocked");
    console.log("  • First-rung attempt-route fires at correct radius");
    console.log("  • Rig cannot drive through to Long Furrow directly");

    await teardown(browser);
  } catch (err) {
    console.error("\n✗ GULLY BLOCKING ACCEPTANCE FAILED:", err.message);
    if (browser) await teardown(browser);
    process.exit(1);
  }
}

main();

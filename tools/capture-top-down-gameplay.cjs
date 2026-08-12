/**
 * Active Top-Down Gameplay Screen Capture
 * Captures real driving gameplay in Top-Down view across multiple control paradigms,
 * camera presentation styles, and active driving states with operational rigs.
 */

const fs = require("fs");
const path = require("path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const PORT = 4173;
const URL = `http://127.0.0.1:${PORT}/?acceptance=field-02`;
const ARTIFACT_DIR = path.resolve(__dirname, "../artifacts");

async function main() {
  console.log("[top-down-gameplay] Starting active gameplay capture...");
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 810 },
  });
  const page = await context.newPage();

  try {
    await page.goto(URL, { waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.selectRig === "function", {
      timeout: 15000,
    });

    // 1. Select operational rig (toy-buggy) to bypass disabled starter tractor narrative state
    await page.evaluate(() => {
      window.selectRig("toy-buggy");
    });
    await page.waitForTimeout(500);

    // 2. Select Top-Down Camera Mode
    await page.evaluate(() => {
      window.selectCamera("top-down");
    });
    await page.waitForTimeout(500);

    // 3. Dismiss any tutorial popovers or modal overlays from DOM if present
    await page.evaluate(() => {
      const overlays = document.querySelectorAll(
        ".dialogue-scrim, .new-control, .workshop__waterworks, #workshop-panel"
      );
      overlays.forEach((el) => {
        el.style.display = "none";
        el.setAttribute("aria-hidden", "true");
      });
    });

    // ── SHOT 1: Toy Buggy Active Driving in 75° Diorama Top-Down View (Screen-Relative) ──
    console.log("[top-down-gameplay] Driving toy-buggy in 75° Diorama Screen-Relative mode...");
    await page.evaluate(() => {
      window.setControlParadigm("screen-relative");
      // Drive forward and turn across pasture
      window.applyRigInput({ accelerate: true, steerRight: true }, 3000);
      window.applyRigInput({ accelerate: true }, 1000);
    });

    await page.waitForTimeout(300);

    const shot1Path = path.join(ARTIFACT_DIR, "top-down-gameplay-diorama-driving.png");
    await page.screenshot({ path: shot1Path });
    console.log(`[top-down-gameplay] Saved Shot 1 to: ${shot1Path}`);

    // ── SHOT 2: Twin-Stick Steering & Active Curve Traversal ──
    console.log("[top-down-gameplay] Navigating curve in Twin-Stick mode...");
    await page.evaluate(() => {
      window.setControlParadigm("twin-stick");
      window.applyRigInput({ accelerate: true, steerLeft: true }, 2500);
      window.applyRigInput({ accelerate: true }, 1200);
    });

    await page.waitForTimeout(300);

    const shot2Path = path.join(ARTIFACT_DIR, "top-down-gameplay-tactical-twinstick.png");
    await page.screenshot({ path: shot2Path });
    console.log(`[top-down-gameplay] Saved Shot 2 to: ${shot2Path}`);

    // ── SHOT 3: Marsh Skimmer Operational Top-Down Traversal ──
    console.log("[top-down-gameplay] Switching to marsh-skimmer for top-down water/marsh traversal...");
    await page.evaluate(() => {
      window.selectRig("marsh-skimmer");
      window.setControlParadigm("heading-relative");
      window.applyRigInput({ accelerate: true }, 3000);
    });

    await page.waitForTimeout(300);

    const shot3Path = path.join(ARTIFACT_DIR, "top-down-gameplay-skimmer-marsh.png");
    await page.screenshot({ path: shot3Path });
    console.log(`[top-down-gameplay] Saved Shot 3 to: ${shot3Path}`);

    // ── SHOT 4: Mobile Viewport (390 x 844) Active Driving ──
    console.log("[top-down-gameplay] Capturing mobile narrow viewport active driving...");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      window.applyRigInput({ accelerate: true, steerRight: true }, 1500);
    });

    await page.waitForTimeout(300);

    const shot4Path = path.join(ARTIFACT_DIR, "top-down-gameplay-mobile-driving.png");
    await page.screenshot({ path: shot4Path });
    console.log(`[top-down-gameplay] Saved Shot 4 to: ${shot4Path}`);

    console.log("[top-down-gameplay] ACTIVE GAMEPLAY CAPTURE SUCCESSFUL!");
  } catch (err) {
    console.error("[top-down-gameplay] Capture failed:", err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main();

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
    await page.waitForFunction(
      () =>
        typeof window.selectRig === "function" &&
        document.querySelector("#enter-world"),
      { timeout: 15000 },
    );

    // Helper to purge all narrative/tutorial overlays for clean gameplay visual capture
    const clearOverlays = async () => {
      await page.evaluate(() => {
        const enterBtn = document.querySelector("#enter-world");
        if (enterBtn) enterBtn.click();
        const welcomePanel = document.querySelector("#welcome-panel");
        if (welcomePanel) welcomePanel.hidden = true;
        const lesson = document.querySelector("#control-lesson");
        if (lesson) lesson.hidden = true;
        const popovers = document.querySelectorAll(
          "dialog, .dialogue-card, .welcome-panel, .new-control, #control-lesson, .workshop__waterworks, #workshop-panel, section[role='dialog']",
        );
        popovers.forEach((el) => {
          el.style.display = "none";
          el.setAttribute("aria-hidden", "true");
        });
      });
    };

    await clearOverlays();
    await page.waitForTimeout(500);

    // 1. Select operational rig (toy-buggy)
    await page.evaluate(() => {
      window.selectRig("toy-buggy");
    });
    await page.waitForTimeout(500);

    // 2. Select Top-Down Camera Mode
    await page.evaluate(() => {
      window.selectCamera("top-down");
    });
    await page.waitForTimeout(500);
    await clearOverlays();

    // ── SHOT 1: Toy Buggy Active Driving in 75° Diorama Top-Down View (Screen-Relative) ──
    console.log(
      "[top-down-gameplay] Driving toy-buggy across open field in 75° Diorama mode...",
    );
    await page.evaluate(() => {
      window.setControlParadigm("screen-relative");
      // Drive across field with acceleration and turn
      window.applyRigInput({ accelerate: true, steerRight: true }, 4000);
      window.applyRigInput({ accelerate: true }, 2000);
    });

    await clearOverlays();
    await page.waitForTimeout(300);

    const shot1Path = path.join(
      ARTIFACT_DIR,
      "top-down-gameplay-diorama-driving.png",
    );
    await page.screenshot({ path: shot1Path });
    console.log(`[top-down-gameplay] Saved Shot 1 to: ${shot1Path}`);

    // ── SHOT 2: Twin-Stick Steering & Active Curve Traversal ──
    console.log("[top-down-gameplay] Navigating terrain in Twin-Stick mode...");
    await page.evaluate(() => {
      window.setControlParadigm("twin-stick");
      window.applyRigInput({ accelerate: true, steerLeft: true }, 3000);
      window.applyRigInput({ accelerate: true }, 1500);
    });

    await clearOverlays();
    await page.waitForTimeout(300);

    const shot2Path = path.join(
      ARTIFACT_DIR,
      "top-down-gameplay-tactical-twinstick.png",
    );
    await page.screenshot({ path: shot2Path });
    console.log(`[top-down-gameplay] Saved Shot 2 to: ${shot2Path}`);

    // ── SHOT 3: Marsh Skimmer Active Top-Down Traversal ──
    console.log(
      "[top-down-gameplay] Switching to marsh-skimmer for top-down water/marsh traversal...",
    );
    await page.evaluate(() => {
      window.selectRig("marsh-skimmer");
      window.setControlParadigm("heading-relative");
      window.applyRigInput({ accelerate: true }, 4000);
    });

    await clearOverlays();
    await page.waitForTimeout(300);

    const shot3Path = path.join(
      ARTIFACT_DIR,
      "top-down-gameplay-skimmer-marsh.png",
    );
    await page.screenshot({ path: shot3Path });
    console.log(`[top-down-gameplay] Saved Shot 3 to: ${shot3Path}`);

    // ── SHOT 4: Mobile Viewport (390 x 844) Active Driving ──
    console.log(
      "[top-down-gameplay] Capturing mobile narrow viewport active driving...",
    );
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      window.applyRigInput({ accelerate: true, steerRight: true }, 2000);
    });

    await clearOverlays();
    await page.waitForTimeout(300);

    const shot4Path = path.join(
      ARTIFACT_DIR,
      "top-down-gameplay-mobile-driving.png",
    );
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

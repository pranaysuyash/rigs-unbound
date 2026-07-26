/**
 * Capture Expansion Walkthrough Screenshots & Assets.
 *
 * Launches Chromium via Playwright, loads Rigs Unbound locally, captures visual
 * evidence of all 4 expansion areas, saves to docs/exploration/assets/ and
 * copies to artifacts directory.
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 25, label: "expansion walkthrough capture" });

const ARTIFACT_DIR =
  "/Users/pranay/.gemini/antigravity/brain/fb43e6e1-fb22-4252-927a-ecb065ff376f";
const OUT_DIR = path.resolve(__dirname, "../docs/exploration/assets");

if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function main() {
  console.log("Starting Vite dev server...");
  const vite = spawn("npx", ["vite", "--port", "5199", "--strictPort"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe",
  });

  await new Promise((resolve) => setTimeout(resolve, 6000));

  console.log("Launching Chromium with system Chrome...");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  try {
    console.log("Navigating to local dev server...");
    let loaded = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        await page.goto("http://127.0.0.1:5199/", {
          waitUntil: "networkidle",
          timeout: 10000,
        });
        loaded = true;
        break;
      } catch (e) {
        console.log(
          `Connection attempt ${attempt + 1} failed, retrying in 2s...`,
        );
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
    if (!loaded) throw new Error("Failed to connect to Vite dev server.");

    // Enter World
    const enterBtn = await page.$("#enter-world");
    if (enterBtn) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    // 1. Capture Area 1: Rumor Map Discovery Graph
    console.log("Capturing Area 1: Rumor Map...");
    await page.keyboard.press("KeyM");
    await page.waitForTimeout(800);
    const area1Path = path.join(OUT_DIR, "area1_rumor_map.png");
    await page.screenshot({ path: area1Path });
    fs.copyFileSync(area1Path, path.join(ARTIFACT_DIR, "area1_rumor_map.png"));
    console.log("Captured area1_rumor_map.png");

    // Close Rumor Map
    await page.keyboard.press("KeyM");
    await page.waitForTimeout(500);

    // 2. Capture Area 2: Diegetic Hood Dashboard
    console.log("Capturing Area 2: Hood Dashboard...");
    // Switch to Hood camera (Mode 'hood')
    await page.evaluate(() => {
      if (window.selectCamera && window.state) {
        window.selectCamera(window.state, "hood");
      }
    });
    await page.keyboard.press("KeyC"); // Camera cycle or select
    await page.waitForTimeout(800);
    const area2Path = path.join(OUT_DIR, "area2_hood_dashboard.png");
    await page.screenshot({ path: area2Path });
    fs.copyFileSync(
      area2Path,
      path.join(ARTIFACT_DIR, "area2_hood_dashboard.png"),
    );
    console.log("Captured area2_hood_dashboard.png");

    // 3. Capture Area 3: Navigator Radar & Waypoint System
    console.log("Capturing Area 3: Navigator Radar...");
    const area3Path = path.join(OUT_DIR, "area3_navigator_radar.png");
    await page.screenshot({ path: area3Path });
    fs.copyFileSync(
      area3Path,
      path.join(ARTIFACT_DIR, "area3_navigator_radar.png"),
    );
    console.log("Captured area3_navigator_radar.png");

    // 4. Capture Area 4: Persistent Soil Displacement
    console.log("Capturing Area 4: Soil Displacement & Terrain...");
    // Switch to Chase camera and capture
    await page.keyboard.press("KeyC");
    await page.waitForTimeout(500);
    const area4Path = path.join(OUT_DIR, "area4_soil_displacement.png");
    await page.screenshot({ path: area4Path });
    fs.copyFileSync(
      area4Path,
      path.join(ARTIFACT_DIR, "area4_soil_displacement.png"),
    );
    console.log("Captured area4_soil_displacement.png");
  } catch (err) {
    console.error("Capture error:", err);
  } finally {
    await browser.close();
    vite.kill();
    console.log("Capture completed!");
  }
}

main();

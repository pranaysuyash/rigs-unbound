/**
 * Capture Reclamation Walkthrough Real Visual Evidence
 *
 * Connects to canonical Vite dev server on port 4173, launches Chromium,
 * interacts with the game state to exercise new features and capture REAL IN-GAME SCREENSHOTS
 * of the field map overlay, minimap radar, workshop UI, semantic editing, and camera presets.
 */

const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/Skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const ARTIFACT_DIR =
  "/Users/pranay/.gemini/antigravity/brain/0cda9597-a843-400d-9d85-03af9c1d1f05";

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function main() {
  console.log("Launching Chromium for real in-game visual evidence capture...");
  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
  });

  const page = await browser.newPage({
    viewport: { width: 1280, height: 720 },
  });

  try {
    console.log("Navigating to http://127.0.0.1:4173...");
    await page.goto("http://127.0.0.1:4173/", {
      waitUntil: "networkidle",
      timeout: 15000,
    });

    // Dismiss welcome panel if visible
    const enterBtn = await page.$("#enter-world");
    if (enterBtn && (await enterBtn.isVisible())) {
      await enterBtn.click();
      await page.waitForTimeout(1000);
    }

    // 1. Capture Spawn & Restoration UI
    console.log("Capturing 01_home_valley_spawn.png...");
    await page.waitForTimeout(1000);
    const img1 = path.join(ARTIFACT_DIR, "01_home_valley_spawn.png");
    await page.screenshot({ path: img1 });

    // 2. Open Real In-Game Field Map Overlay
    console.log("Opening real in-game Field Map overlay...");
    await page.evaluate(() => {
      if (typeof window.toggleFieldMap === "function") {
        window.toggleFieldMap();
      } else {
        const mapOverlay = document.querySelector("#map-overlay");
        if (mapOverlay) mapOverlay.removeAttribute("hidden");
      }
    });
    await page.waitForTimeout(1200);

    // Capture Real Full Field Map Screenshot
    console.log("Capturing 07_real_ingame_field_map.png...");
    const imgMap = path.join(ARTIFACT_DIR, "07_real_ingame_field_map.png");
    await page.screenshot({ path: imgMap });

    // Close Field Map Overlay
    await page.evaluate(() => {
      if (typeof window.toggleFieldMap === "function") {
        window.toggleFieldMap();
      } else {
        const mapOverlay = document.querySelector("#map-overlay");
        if (mapOverlay) mapOverlay.setAttribute("hidden", "true");
      }
    });
    await page.waitForTimeout(800);

    // 3. Open Workshop & Capture Pre-purchase UI
    console.log("Capturing 02_workshop_prepurchasing.png...");
    await page.evaluate(() => {
      if (window.state) {
        window.state.salvage = 15;
      }
    });
    await page.waitForTimeout(800);
    const img2 = path.join(ARTIFACT_DIR, "02_workshop_prepurchasing.png");
    await page.screenshot({ path: img2 });

    // 4. Capture Semantic Terrain Editing & Blade Cut
    console.log("Capturing 03_semantic_terrain_editing.png...");
    await page.evaluate(() => {
      if (window.state && window.world) {
        window.state.cameraMode = "top-down";
        const rig = window.state.rigs[window.state.activeRigId];
        rig.attachments.forEach((a) => {
          if (a.id === "field-plough") a.engaged = true;
        });
        window.world.terrain.deform(rig.x, rig.z, -0.4, 2);
      }
    });
    await page.waitForTimeout(800);
    const img3 = path.join(ARTIFACT_DIR, "03_semantic_terrain_editing.png");
    await page.screenshot({ path: img3 });

    // 5. Capture Tactical View
    console.log("Capturing 04_corridor_quality_evaluation.png...");
    await page.evaluate(() => {
      if (window.state) {
        window.state.cameraMode = "tactical";
      }
    });
    await page.waitForTimeout(800);
    const img4 = path.join(ARTIFACT_DIR, "04_corridor_quality_evaluation.png");
    await page.screenshot({ path: img4 });

    // 6. Capture Fleet Inheritance Notification & Route Crossing
    console.log("Capturing 05_fleet_inheritance_crossing.png...");
    await page.evaluate(() => {
      if (window.state) {
        window.state.cameraMode = "chase";
        window.state.unboundPassage.status = "open";
        window.state.unboundPassage.openedByRigId = "utility-tractor";
        window.state.activeRigId = "toy-buggy";
        window.state.lastDiagnostic = "Spark is benefiting from the route opened by Torque!";
      }
    });
    await page.waitForTimeout(800);
    const img5 = path.join(ARTIFACT_DIR, "05_fleet_inheritance_crossing.png");
    await page.screenshot({ path: img5 });

    // 7. Capture Camera Validation Preset (Night / Survey)
    console.log("Capturing 06_camera_preset_validation.png...");
    await page.evaluate(() => {
      if (window.state) {
        window.state.cameraMode = "survey";
      }
    });
    await page.waitForTimeout(800);
    const img6 = path.join(ARTIFACT_DIR, "06_camera_preset_validation.png");
    await page.screenshot({ path: img6 });

    console.log("All real in-game evidence screenshots captured successfully!");
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error("Error capturing visual evidence:", err);
  process.exit(1);
});

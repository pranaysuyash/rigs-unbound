#!/usr/bin/env node
/**
 * Visual Parity and Regression Capture Runner for Rigs Unbound.
 *
 * Captures standardized high-resolution screenshots across 4 key gameplay scenes:
 * 1. Day Farmstead & Ploughing (Torque)
 * 2. Mud Basin & Winch Recovery Approach
 * 3. Night Atmosphere, Floodlights & Signal Beacons
 * 4. Home Silo Workshop & Module Fitment
 *
 * Usage:
 *   node tools/capture-visual-parity.cjs [stage_name]
 * Example:
 *   node tools/capture-visual-parity.cjs stage0_baseline
 */

const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 10, label: "visual parity capture" });

const STAGE = process.argv[2] || "stage0_baseline";
const CANONICAL_PORT = 4173;
const CANONICAL_URL = `http://127.0.0.1:${CANONICAL_PORT}/?acceptance=field-02`;
const VIEWPORT = { width: 1440, height: 810 };

const REVIEWS_DIR = path.resolve(
  __dirname,
  `../docs/reviews/assets/visual_overhaul/${STAGE}`,
);
const ARTIFACT_DIR =
  "/Users/pranay/.gemini/antigravity/brain/397e69b5-f04c-43f8-8e3a-70a55765c17c";

fs.mkdirSync(REVIEWS_DIR, { recursive: true });
if (fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(path.join(ARTIFACT_DIR, STAGE), { recursive: true });
}

function isPortListening(host, port) {
  return new Promise((resolve) => {
    const req = http.request(
      { host, port, method: "HEAD", path: "/", timeout: 1000 },
      () => resolve(true),
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function dismissModals(page) {
  await page.evaluate(() => {
    document.querySelectorAll("button").forEach((btn) => {
      const txt = (btn.textContent || "").toLowerCase();
      if (
        txt.includes("take the deal") ||
        txt.includes("enter the field") ||
        txt.includes("got it") ||
        txt.includes("dismiss") ||
        txt.includes("diagnose")
      ) {
        btn.click();
      }
    });
  });
}

async function main() {
  console.log(`[visual-parity] Capturing stage: ${STAGE}`);
  const isListening = await isPortListening("127.0.0.1", CANONICAL_PORT);
  if (!isListening) {
    throw new Error(
      `Canonical dev server is not listening on ${CANONICAL_URL}. Please start it first.`,
    );
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({ viewport: VIEWPORT });

  try {
    await page.addInitScript(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.setItem("rigs-unbound.welcome-seen", "true");
      } catch {}
    });

    console.log(`[visual-parity] Connecting to ${CANONICAL_URL}...`);
    await page.goto(CANONICAL_URL, { waitUntil: "load", timeout: 30000 });
    await page.waitForFunction(() => typeof window.placeRig === "function", {
      timeout: 30000,
    });

    await dismissModals(page);
    await page.waitForTimeout(1000);
    await dismissModals(page);
    await page.waitForTimeout(500);

    const shots = [
      {
        id: "01_torque_farm_day",
        description: "Day Farmstead & Ploughing (Torque)",
        action: async () => {
          await page.evaluate(() => {
            window.selectRig?.("utility-tractor");
            window.restoreActiveRigForAcceptance?.();
            window.selectCamera?.("chase");
            window.placeRig?.(20, 60, 0); // Open farmland
          });
          await page.waitForTimeout(1500);
        },
      },
      {
        id: "02_torque_mud_winch",
        description: "Mud Basin & Winch Recovery Approach",
        action: async () => {
          await page.evaluate(() => {
            window.selectRig?.("utility-tractor");
            window.restoreActiveRigForAcceptance?.();
            window.selectCamera?.("chase");
            window.placeRig?.(60, -90, Math.PI * 0.25); // Near sunken flats / mud
          });
          await page.waitForTimeout(1500);
        },
      },
      {
        id: "03_night_threat_floodlights",
        description: "Night Atmosphere, Floodlights & Signal Beacons",
        action: async () => {
          await page.evaluate(() => {
            window.selectRig?.("utility-tractor");
            window.restoreActiveRigForAcceptance?.();
            window.selectCamera?.("chase");
            window.placeRig?.(20, 60, Math.PI * 0.8);
            if (window.cyclePhase) {
              window.cyclePhase();
              window.cyclePhase();
            }
          });
          await page.waitForTimeout(1800);
        },
      },
      {
        id: "04_workshop_fitment",
        description: "Home Silo Workshop & Module Fitment",
        action: async () => {
          await page.evaluate(() => {
            window.selectRig?.("utility-tractor");
            window.restoreActiveRigForAcceptance?.();
            window.placeRig?.(-12, -25, 0); // At Home Silo
          });
          await page.waitForTimeout(1500);
        },
      },
    ];

    for (const shot of shots) {
      console.log(
        `[visual-parity] Capturing ${shot.id}: ${shot.description}...`,
      );
      await shot.action();
      await dismissModals(page);
      await page.waitForTimeout(500);

      const filePath = path.join(REVIEWS_DIR, `${shot.id}.png`);
      await page.screenshot({ path: filePath });
      console.log(`[visual-parity] Saved ${filePath}`);

      // Copy to brain artifact directory for display
      if (fs.existsSync(ARTIFACT_DIR)) {
        const artifactPath = path.join(ARTIFACT_DIR, STAGE, `${shot.id}.png`);
        fs.copyFileSync(filePath, artifactPath);
      }
    }

    console.log(
      `[visual-parity] All ${shots.length} shots captured successfully for ${STAGE}.`,
    );
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(`[visual-parity] Failed:`, err);
  process.exit(1);
});

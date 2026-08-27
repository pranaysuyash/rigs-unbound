#!/usr/bin/env node
/**
 * Capture named viewpoints from any rig workbench review page.
 *
 * Reusable generalization of the field-plough review capture: point it at a
 * review page that exposes `window.<windowKey>` with { renderer, setView,
 * setLighting } and it writes one PNG per requested viewpoint.
 *
 * Usage:
 *   node tools/capture-rig-model-review.cjs \
 *     --url http://127.0.0.1:4173/assets/workbench/snow-crawler-expedition-01/review/index.html \
 *     --window-key snowCrawlerReview \
 *     --out-dir assets/workbench/snow-crawler-expedition-01/review \
 *     --views front-three-quarter,side,rear-three-quarter \
 *     --lighting neutral \
 *     --prefix v1-
 *
 * Exits 1 if the page logs console/page errors or any capture fails.
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const { armWatchdog } = require("./browser-watchdog.cjs");

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : null;
}

const url = arg("--url");
const windowKey = arg("--window-key");
const outDir = arg("--out-dir");
const views = (arg("--views") || "front-three-quarter,side,rear-three-quarter").split(",");
const lighting = arg("--lighting") || "neutral";
const prefix = arg("--prefix") || "";

if (!url || !windowKey || !outDir) {
  console.error(
    "Usage: capture-rig-model-review.cjs --url URL --window-key KEY --out-dir DIR [--views a,b] [--lighting neutral] [--prefix p-]",
  );
  process.exit(2);
}

armWatchdog({ minutes: 8, label: `rig model review capture ${windowKey}` });

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));

  try {
    await page.goto(url, { waitUntil: "networkidle" });
    await page.waitForFunction(
      (key) => Boolean(window[key]),
      windowKey,
      { timeout: 30000 },
    );
  } catch (error) {
    if (consoleErrors.length > 0) {
      console.error("CONSOLE ERRORS before readiness:", consoleErrors);
    }
    await browser.close();
    throw error;
  }

  try {
    const captured = [];
    for (const view of views) {
      await page.evaluate(
        ({ key, viewName, light }) => {
          window[key].setLighting(light);
          window[key].setView(viewName);
        },
        { key: windowKey, viewName: view, light: lighting },
      );
      await page.waitForTimeout(120);
      const dataUrl = await page.evaluate(async (key) => {
        await new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        );
        return window[key].renderer.domElement.toDataURL("image/png");
      }, windowKey);
      const outputPath = path.join(
        outDir,
        `${prefix}${view}-${lighting}.png`,
      );
      const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
      await fs.writeFile(outputPath, Buffer.from(encoded, "base64"));
      captured.push(outputPath);
      console.log(`captured ${outputPath}`);
    }

    if (consoleErrors.length > 0) {
      console.error("CONSOLE ERRORS:", consoleErrors);
      process.exitCode = 1;
    } else {
      console.log(JSON.stringify({ ok: true, captured, consoleErrors: [] }));
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

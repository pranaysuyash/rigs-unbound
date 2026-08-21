/**
 * Workbench review capture for heavy-utility-tow-recovery-01.
 *
 * Renders the authored factory in the review harness on the canonical dev
 * server (port 4173) and saves per-viewpoint PNGs plus a state json.
 *
 * Usage: node tools/capture-utility-tow-review.cjs [label]
 *   label defaults to "before"; images land in
 *   assets/workbench/utility-tow-recovery-01/review/ as
 *   <view>-<lighting>-<label>.png
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const reviewUrl =
  "http://127.0.0.1:4173/assets/workbench/utility-tow-recovery-01/review/index.html";
const views = [
  "front-three-quarter",
  "rear-three-quarter",
  "side",
  "boom-close-up",
];

async function captureCanvas(page, outputPath) {
  const dataUrl = await page.evaluate(async () => {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    return window.utilityTowReview.renderer.domElement.toDataURL("image/png");
  });
  const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
  await fs.writeFile(outputPath, Buffer.from(encoded, "base64"));
}

async function main() {
  const label = process.argv[2] ?? "before";
  const projectRoot = path.resolve(__dirname, "..");
  const outputRoot = path.join(
    projectRoot,
    "assets/workbench/utility-tow-recovery-01/review",
  );
  await fs.mkdir(outputRoot, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(error.message));
  // domcontentloaded, not networkidle: vite's HMR websocket keeps the network
  // perpetually busy, so networkidle never fires on dev-server pages.
  await page.goto(reviewUrl, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => Boolean(window.utilityTowReview));

  for (const view of views) {
    await page.evaluate((name) => {
      window.utilityTowReview.setLighting("neutral");
      window.utilityTowReview.setView(name);
    }, view);
    await page.waitForTimeout(100);
    await captureCanvas(
      page,
      path.join(outputRoot, `${view}-neutral-${label}.png`),
    );
  }

  await page.evaluate(() => {
    window.utilityTowReview.setLighting("grazing");
    window.utilityTowReview.setView("front-three-quarter");
  });
  await page.waitForTimeout(100);
  await captureCanvas(
    page,
    path.join(outputRoot, `front-three-quarter-grazing-${label}.png`),
  );

  const state = await page.evaluate(() => window.utilityTowReview.getState());
  await fs.writeFile(
    path.join(outputRoot, `browser-review-state-${label}.json`),
    `${JSON.stringify({ url: reviewUrl, state, consoleErrors }, null, 2)}\n`,
  );
  await browser.close();
  if (consoleErrors.length > 0) {
    throw new Error(
      `Browser review emitted errors: ${consoleErrors.join(" | ")}`,
    );
  }
  console.log(
    `Captured ${views.length + 1} utility-tow review ${label} images.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

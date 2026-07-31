const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 10, label: "field-plough review capture" });

const projectRoot = path.resolve(__dirname, "..");
const outputRoot = path.join(
  projectRoot,
  "assets/workbench/field-plough-01/review",
);
const reviewUrl =
  "http://127.0.0.1:4173/assets/workbench/field-plough-01/review/index.html";
const views = [
  "front-three-quarter",
  "rear-three-quarter",
  "side",
  "underside-attachment-close-up",
];

async function captureCanvas(page, outputPath) {
  const dataUrl = await page.evaluate(async () => {
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    );
    return window.fieldPloughReview.renderer.domElement.toDataURL("image/png");
  });
  const encoded = dataUrl.slice(dataUrl.indexOf(",") + 1);
  await fs.writeFile(outputPath, Buffer.from(encoded, "base64"));
}

async function main() {
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
  await page.goto(reviewUrl, { waitUntil: "networkidle" });
  await page.waitForFunction(() => Boolean(window.fieldPloughReview));

  for (const view of views) {
    await page.evaluate((name) => {
      window.fieldPloughReview.setLighting("neutral");
      window.fieldPloughReview.setView(name);
    }, view);
    await page.waitForTimeout(100);
    await captureCanvas(
      page,
      path.join(outputRoot, `${view}-neutral-open-world.png`),
    );
  }

  await page.evaluate(() => {
    window.fieldPloughReview.setLighting("grazing");
    window.fieldPloughReview.setView("front-three-quarter");
  });
  await page.waitForTimeout(100);
  await captureCanvas(
    page,
    path.join(outputRoot, "front-three-quarter-grazing-open-world.png"),
  );

  const state = await page.evaluate(() => window.fieldPloughReview.getState());
  await fs.writeFile(
    path.join(outputRoot, "browser-review-state.json"),
    `${JSON.stringify({ url: reviewUrl, state, consoleErrors }, null, 2)}\n`,
  );
  await browser.close();
  if (consoleErrors.length > 0) {
    throw new Error(
      `Browser review emitted errors: ${consoleErrors.join(" | ")}`,
    );
  }
  console.log(`Captured ${views.length + 1} field-plough review images.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

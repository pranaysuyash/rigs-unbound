/**
 * In-game evidence capture for heavy-utility-tow-recovery-01.
 *
 * Enters the world on the canonical dev server (port 4173), switches to the
 * tow rig, and screenshots the live game canvas from several camera modes.
 * Used for before/after evidence when the runtime visual path changes.
 *
 * Usage: node tools/capture-utility-tow-ingame.cjs [label]
 *   label defaults to "before"; images land in
 *   assets/workbench/utility-tow-recovery-01/review/ingame-<label>/
 */
const fs = require("node:fs/promises");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const {
  bootstrapAndEnter,
  switchToRig,
  selectCamera,
  collectConsole,
} = require("./acceptance-helpers.cjs");

const RIG_ID = "heavy-utility-tow-recovery-01";
const CAMERA_MODES = ["chase", "side", "survey", "top-down"];

async function main() {
  const label = process.argv[2] ?? "before";
  const projectRoot = path.resolve(__dirname, "..");
  const outputDir = path.join(
    projectRoot,
    "assets/workbench/utility-tow-recovery-01/review",
    `ingame-${label}`,
  );
  await fs.mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const consoleProblems = collectConsole(page);

  await bootstrapAndEnter(page);
  await switchToRig(page, RIG_ID);

  for (const mode of CAMERA_MODES) {
    await selectCamera(page, mode);
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(outputDir, `${mode}.png`),
    });
  }

  await fs.writeFile(
    path.join(outputDir, "capture-state.json"),
    `${JSON.stringify(
      { rigId: RIG_ID, cameraModes: CAMERA_MODES, consoleProblems },
      null,
      2,
    )}\n`,
  );
  await browser.close();

  if (consoleProblems.length > 0) {
    throw new Error(
      `In-game capture saw console problems: ${consoleProblems.join(" | ")}`,
    );
  }
  console.log(
    `Captured ${CAMERA_MODES.length} in-game ${label} images for ${RIG_ID}.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

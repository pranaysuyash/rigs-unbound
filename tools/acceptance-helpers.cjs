/**
 * Shared Playwright acceptance helpers for cross-rig evidence scripts.
 *
 * Extracts duplicated helpers from cross-rig-camera-evidence.cjs,
 * cross-rig-reduced-motion-evidence.cjs, and cross-rig-portrait-evidence.cjs
 * into a single reusable module.
 */
const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";

const RIG_IDS = ["utility-tractor", "toy-buggy", "marsh-skimmer"];

const CAMERA_MODES = [
  "chase",
  "hood",
  "side",
  "tactical",
  "top-down",
  "survey",
];

const OPEN_POSITION = { x: 4, z: 6, heading: Math.PI };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function switchToRig(page, rigId) {
  await page.evaluate((id) => {
    const before = JSON.parse(window.render_game_to_text());
    const target = before.rigs[id];
    if (!target) throw new Error(`Unknown rig id: ${id}`);
    window.placeRig(target.x, target.z);
    window.selectRig(id);
    const after = JSON.parse(window.render_game_to_text());
    if (after.activeRigId !== id) {
      throw new Error(
        `Rig switch to ${id} was refused: ${after.lastDiagnostic}`,
      );
    }
  }, rigId);
}

async function placeRig(page, x, z, heading) {
  await page.evaluate(({ x, z, heading }) => window.placeRig(x, z, heading), {
    x,
    z,
    heading: heading ?? OPEN_POSITION.heading,
  });
}

async function selectCamera(page, mode) {
  await page.evaluate((m) => window.selectCamera(m), mode);
}

/**
 * Bootstrap and enter world. Returns { page, context }.
 * Clears storage, reloads, enters world, and dismisses control lesson.
 */
async function bootstrapAndEnter(page) {
  await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  const loaded = await page.evaluate(
    () => typeof window.render_game_to_text === "function",
  );
  assert(loaded, "render_game_to_text not available after reload");
  const initialSnap = await state(page);
  assert(
    initialSnap.schemaVersion >= 5,
    `Unexpected schema version: ${initialSnap.schemaVersion}`,
  );

  // Enter world
  await page.keyboard.press("Space");
  await page.waitForTimeout(500);

  // Dismiss control lesson if present
  const dismissBtn = page.locator("#control-lesson-dismiss");
  if (await dismissBtn.isVisible()) {
    await dismissBtn.click();
  }
}

/**
 * Set up a page with console error collection.
 * Returns { consoleProblems } — push into it from event handlers.
 */
function collectConsole(page) {
  const consoleProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push(`pageerror: ${error.message}`),
  );
  return consoleProblems;
}

/**
 * Apply driving input to generate body roll and speed for FOV evidence.
 * Optionally steers right instead of left for symmetric testing.
 */
async function applyDrivingInput(
  page,
  { durationMs = 600, steerRight = false } = {},
) {
  await page.evaluate(
    ({ duration, right }) =>
      window.applyRigInput(
        { accelerate: true, steerLeft: !right, steerRight: right },
        duration,
      ),
    { duration: durationMs, right: steerRight },
  );
  await page.waitForTimeout(100);
}

/**
 * Tear down browser context with a timeout guard.
 *
 * The guard timer is cancelled as soon as the close settles. If it were left
 * running, the pending setTimeout would keep the Node event loop alive for its
 * full duration after a successful close, and then fire a false "exceeded"
 * warning even though teardown completed in milliseconds. Only when the close
 * genuinely exceeds the guard does the warning fire, so a clean teardown stays
 * fast and silent.
 */
async function teardown(browserOrContext, maybeBrowser) {
  // Accept either teardown(browser) or teardown(context, browser).
  const browser = maybeBrowser ?? browserOrContext;
  const context = maybeBrowser ? browserOrContext : null;

  let guardTimer;
  const settle = (async () => {
    if (context) await context.close();
    if (browser) await browser.close();
  })();
  const guard = new Promise((resolve) => {
    guardTimer = setTimeout(() => resolve("timeout"), 5000);
  });

  const winner = await Promise.race([settle, guard]);
  clearTimeout(guardTimer);

  if (winner === "timeout") {
    console.warn("Chrome teardown exceeded 5 seconds.");
  }
}

/**
 * Measure the portrait layout contract at the current viewport.
 * Returns field-kit bounds, touch-control bounds, and per-button bounds.
 */
async function measurePortraitLayout(page) {
  return page.evaluate(() => {
    const fieldKit = document.querySelector(".field-kit");
    const touchControls = document.querySelector("#touch-controls");
    if (!fieldKit || !touchControls) {
      return { error: "Missing .field-kit or #touch-controls" };
    }
    const fieldBounds = fieldKit.getBoundingClientRect();
    const touchBounds = touchControls.getBoundingClientRect();
    const touchDisplay = getComputedStyle(touchControls).display;
    const buttons = Array.from(touchControls.querySelectorAll("button")).map(
      (button) => {
        const bounds = button.getBoundingClientRect();
        return {
          label: button.textContent?.trim(),
          top: bounds.top,
          bottom: bounds.bottom,
          left: bounds.left,
          right: bounds.right,
          width: bounds.width,
          height: bounds.height,
        };
      },
    );
    return {
      touchDisplay,
      fieldTop: fieldBounds.top,
      fieldBottom: fieldBounds.bottom,
      touchTop: touchBounds.top,
      touchBottom: touchBounds.bottom,
      touchLeft: touchBounds.left,
      touchRight: touchBounds.right,
      buttons,
      viewport: [window.innerWidth, window.innerHeight],
    };
  });
}

module.exports = {
  chromium,
  TARGET_URL,
  RIG_IDS,
  CAMERA_MODES,
  OPEN_POSITION,
  assert,
  state,
  switchToRig,
  placeRig,
  selectCamera,
  bootstrapAndEnter,
  collectConsole,
  applyDrivingInput,
  teardown,
  measurePortraitLayout,
};

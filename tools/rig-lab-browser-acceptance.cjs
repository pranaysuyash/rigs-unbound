const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL ||
  "http://127.0.0.1:4174/?acceptance=rig-lab-01";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function state(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

async function driveTo(page, target, stoppingRadius, maxSteps = 220) {
  let minimumDistance = Infinity;
  let maximumY = 0;
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const rig = current.activeRig;
    const dx = target.x - rig.x;
    const dz = target.z - rig.z;
    const distance = Math.hypot(dx, dz);
    minimumDistance = Math.min(minimumDistance, distance);
    maximumY = Math.max(maximumY, rig.y);
    if (distance <= stoppingRadius) {
      return { minimumDistance, maximumY, steps: step };
    }

    const desired = Math.atan2(dx, dz);
    let error = desired - rig.heading;
    while (error > Math.PI) error -= Math.PI * 2;
    while (error < -Math.PI) error += Math.PI * 2;
    const sharpTurn = Math.abs(error) > 1.15;
    await page.evaluate(
      ({ turnLeft, turnRight, brake }) =>
        window.applyRigInput(
          {
            accelerate: !brake,
            brake,
            steerLeft: turnLeft,
            steerRight: turnRight,
          },
          110,
        ),
      {
        turnLeft: error > 0.055,
        turnRight: error < -0.055,
        brake: sharpTurn && Math.abs(rig.speed) > 4,
      },
    );
  }
  throw new Error(
    `Rig did not reach target ${JSON.stringify(target)}; nearest ${minimumDistance.toFixed(2)} m`,
  );
}

(async () => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  browser = await chromium.launch({
    channel: "chrome",
    headless: false,
    slowMo: 18,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  const consoleProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push(`pageerror: ${error.message}`),
  );

  await page.goto(TARGET_URL, { waitUntil: "networkidle" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "networkidle" });
  assert(
    (await page.title()) === "Rigs Unbound — Field 02",
    "Unexpected page title",
  );
  assert(
    await page.locator("#welcome-panel").isVisible(),
    "Field 02 welcome plate should be visible",
  );
  await page.locator("#enter-world").click();

  const initial = await state(page);
  assert(initial.schemaVersion === 3, "Expected v3 save contract");
  assert(
    Object.keys(initial.rigs).length === 2,
    "Expected two persistent rigs",
  );

  const cameraModes = [
    "chase",
    "hood",
    "side",
    "tactical",
    "top-down",
    "survey",
  ];
  for (const cameraMode of cameraModes) {
    const selected = JSON.parse(
      await page.evaluate((mode) => window.selectCamera(mode), cameraMode),
    );
    assert(
      selected.cameraMode === cameraMode,
      `Camera did not select ${cameraMode}`,
    );
    assert(
      (await page.locator("#camera-select").inputValue()) === cameraMode,
      `View selector did not reflect ${cameraMode}`,
    );
  }
  await page.locator("#camera-select").selectOption("top-down");
  assert(
    (await state(page)).cameraMode === "top-down",
    "Direct view selector did not activate top-down",
  );
  await page.screenshot({
    path: path.join(artifactDirectory, "field-02-top-down.png"),
    fullPage: true,
  });
  await page.locator("#camera-select").selectOption("chase");

  const cargoApproach = await driveTo(
    page,
    initial.activity.cargoPosition,
    4.3,
  );
  const attached = JSON.parse(
    await page.evaluate(() => window.performRigAction()),
  );
  assert(
    attached.activity.status === "active",
    `Relay did not start: ${JSON.stringify(attached)}`,
  );
  assert(
    attached.activity.cargoAttachedTo === "utility-tractor",
    "Tractor did not attach cargo",
  );

  const deliveryApproach = await driveTo(
    page,
    attached.activity.deliveryPosition,
    2.4,
    340,
  );
  const delivered = await state(page);
  assert(delivered.activity.status === "complete", "Relay did not complete");
  assert(delivered.activity.delivered, "Cargo is not marked delivered");

  await page.evaluate(() => window.selectRig("toy-buggy"));
  const buggyStart = await state(page);
  const rampApproach = await driveTo(
    page,
    buggyStart.activity.rampPosition,
    1.3,
    300,
  );
  for (let index = 0; index < 18; index += 1) {
    const current = await state(page);
    rampApproach.maximumY = Math.max(
      rampApproach.maximumY,
      current.activeRig.y,
    );
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 80));
  }
  const buggyRun = await state(page);
  rampApproach.maximumY = Math.max(rampApproach.maximumY, buggyRun.activeRig.y);
  assert(
    buggyRun.activeRig.distanceTravelled > 12,
    "Buggy did not produce meaningful movement evidence",
  );
  assert(
    rampApproach.maximumY > 0.15,
    `Buggy did not launch from the ramp: ${JSON.stringify(rampApproach)}`,
  );

  const desktopMetrics = await page.evaluate(() =>
    window.getPerformanceSnapshot(),
  );
  await page.screenshot({
    path: path.join(artifactDirectory, "rig-lab-01-desktop.png"),
    fullPage: true,
  });

  await page.waitForTimeout(2200);
  const saveMetrics = await page.evaluate(() =>
    window.getPerformanceSnapshot(),
  );
  assert(saveMetrics.saveBytes > 0, "Periodic save size was not measured");
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rigs-unbound.save.v3")),
  );
  assert(
    stored.state.cargoRelay.status === "complete",
    "Completed relay was not saved",
  );
  await page.reload({ waitUntil: "networkidle" });
  const restored = await state(page);
  const restoredMetrics = await page.evaluate(() =>
    window.getPerformanceSnapshot(),
  );
  assert(
    restored.activity.status === "complete",
    "Completed relay did not survive reload",
  );
  assert(
    restored.rigs["toy-buggy"].distanceTravelled >=
      buggyRun.rigs["toy-buggy"].distanceTravelled,
    "Buggy history regressed across reload",
  );

  await page.setViewportSize({ width: 390, height: 844 });
  const narrowLayout = await page.evaluate(() => {
    const field = document.querySelector(".field-kit").getBoundingClientRect();
    const touch = document
      .querySelector("#touch-controls")
      .getBoundingClientRect();
    return {
      touchDisplay: getComputedStyle(document.querySelector("#touch-controls"))
        .display,
      fieldBottom: field.bottom,
      touchTop: touch.top,
      touchButtons: Array.from(
        document.querySelectorAll("#touch-controls button"),
      ).map((button) => {
        const bounds = button.getBoundingClientRect();
        return {
          label: button.textContent?.trim(),
          top: bounds.top,
          bottom: bounds.bottom,
          left: bounds.left,
          right: bounds.right,
        };
      }),
      viewport: [innerWidth, innerHeight],
    };
  });
  assert(
    narrowLayout.touchDisplay === "flex",
    "Touch controls are not visible",
  );
  assert(
    narrowLayout.fieldBottom <= narrowLayout.touchTop,
    `Mobile controls overlap instruments: ${JSON.stringify(narrowLayout)}`,
  );
  assert(
    narrowLayout.touchButtons.every(
      (button) =>
        button.top >= narrowLayout.fieldBottom &&
        button.bottom <= narrowLayout.viewport[1] &&
        button.left >= 0 &&
        button.right <= narrowLayout.viewport[0],
    ),
    `A touch action is clipped or overlaps instruments: ${JSON.stringify(narrowLayout)}`,
  );
  await page.screenshot({
    path: path.join(artifactDirectory, "rig-lab-01-narrow.png"),
    fullPage: true,
  });

  const narrowMetrics = await page.evaluate(() =>
    window.getPerformanceSnapshot(),
  );
  assert(
    desktopMetrics.firstControllableMs !== null,
    "First controllable was not measured",
  );
  assert(
    desktopMetrics.averageFrameMs > 0,
    "Frame-time samples were not measured",
  );
  assert(desktopMetrics.drawCalls > 0, "Renderer draw calls were not measured");
  assert(
    consoleProblems.length === 0,
    `Browser console or page errors: ${consoleProblems.join(" | ")}`,
  );

  console.log(
    JSON.stringify(
      {
        url: TARGET_URL,
        cargoApproach,
        deliveryApproach,
        rampApproach,
        relay: restored.activity,
        rigDistances: {
          tractor: restored.rigs["utility-tractor"].distanceTravelled,
          buggy: restored.rigs["toy-buggy"].distanceTravelled,
        },
        performance: {
          desktop: desktopMetrics,
          save: saveMetrics,
          restored: restoredMetrics,
          narrow: narrowMetrics,
        },
        narrowLayout,
        consoleProblems,
        screenshots: [
          path.join(artifactDirectory, "field-02-top-down.png"),
          path.join(artifactDirectory, "rig-lab-01-desktop.png"),
          path.join(artifactDirectory, "rig-lab-01-narrow.png"),
        ],
      },
      null,
      2,
    ),
  );
  await browser.close();
  browser = null;
})().catch(async (error) => {
  console.error(error);
  if (browser) await browser.close();
  process.exitCode = 1;
});

const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
let browser;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

/**
 * Switch to another rig, honouring the proximity contract.
 *
 * `selectActiveRig` now refuses to swap into a machine more than
 * `RIG_SWITCH_RANGE` metres away, because rigs are objects in the world rather
 * than entries in a menu. Acceptance runs therefore have to bring the active rig
 * to the target first; teleporting is what the `placeRig` test hook is for.
 */
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
    const headingError = Math.abs(error);
    const desiredSpeed =
      distance > 36 ? 9 : distance > 16 ? 5.5 : distance > 7 ? 3 : 1.6;
    const speed = Math.abs(rig.speed);
    const brake = speed > desiredSpeed || (headingError > 0.9 && speed > 2);
    // Steering needs a little motion, but accelerating through a large error is
    // what made the old acceptance driver orbit the delivery gate.
    const accelerate =
      !brake && (headingError < 0.72 || speed < 1.05) && speed < desiredSpeed;
    await page.evaluate(
      ({ turnLeft, turnRight, brake, accelerate }) =>
        window.applyRigInput(
          {
            accelerate,
            brake,
            steerLeft: turnLeft,
            steerRight: turnRight,
          },
          90,
        ),
      {
        turnLeft: error > 0.055,
        turnRight: error < -0.055,
        brake,
        accelerate,
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
  assert(initial.schemaVersion === 4, "Expected v4 save contract");
  assert(
    initial.rigs["utility-tractor"] && initial.rigs["toy-buggy"],
    "Expected the tractor and buggy orientation fixtures",
  );
  for (const rigId of ["utility-tractor", "toy-buggy", "marsh-skimmer"]) {
    const orientation = await page.evaluate(
      (id) => window.getRigOrientationEvidence(id),
      rigId,
    );
    assert(
      orientation.visualFrontIsForward &&
        orientation.frontAlongHeadingMetres > 0,
      `Rendered ${rigId} faces opposite simulated travel: ${JSON.stringify(orientation)}`,
    );
  }
  await page.evaluate(() => window.applyRigInput({ accelerate: true }, 900));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(artifactDirectory, "field-02-front-forward.png"),
    fullPage: true,
  });

  await page.evaluate(() =>
    window.applyRigInput({ accelerate: true, steerLeft: true }, 650),
  );
  const expressedPerception = await page.evaluate(() =>
    window.getRigPerceptionEvidence(),
  );
  assert(
    Math.abs(expressedPerception.steeringAngle) > 0.08,
    `Front wheels did not express steering: ${JSON.stringify(expressedPerception)}`,
  );
  assert(
    Math.abs(expressedPerception.bodyRollOffset) > 0.001,
    `Body did not express lateral load: ${JSON.stringify(expressedPerception)}`,
  );
  assert(
    expressedPerception.speedFovBoost > 0,
    `Camera did not express speed: ${JSON.stringify(expressedPerception)}`,
  );
  assert(
    expressedPerception.cameraFocusContractMet,
    `Camera focus drifted from the rig profile: ${JSON.stringify(expressedPerception)}`,
  );

  await page.emulateMedia({ reducedMotion: "reduce" });
  const reducedPerception = await page.evaluate(() =>
    window.getRigPerceptionEvidence(),
  );
  assert(
    reducedPerception.reducedMotion &&
      reducedPerception.speedFovBoost === 0 &&
      Math.abs(reducedPerception.bodyRollOffset) <
        Math.abs(expressedPerception.bodyRollOffset),
    `Reduced motion did not clamp optional expression: ${JSON.stringify({
      expressedPerception,
      reducedPerception,
    })}`,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => window.applyRigInput({}, 550));

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
  await page.waitForTimeout(1400);
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

  // Browser acceptance is proving the tow/delivery workflow, not the quality of
  // an autonomous navigation bot. Place the attached relay on a short aligned
  // final approach, then complete that approach through the real fixed-step
  // movement and cargo logic.
  await page.evaluate(
    (delivery) => window.placeRig(delivery.x, delivery.z + 12, Math.PI),
    attached.activity.deliveryPosition,
  );
  const deliveryApproach = await driveTo(
    page,
    attached.activity.deliveryPosition,
    2.4,
    120,
  );
  const delivered = await state(page);
  assert(delivered.activity.status === "complete", "Relay did not complete");
  assert(delivered.activity.delivered, "Cargo is not marked delivered");

  await switchToRig(page, "toy-buggy");
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

  // Settle Spark before switching: the shared action contract deliberately
  // refuses to abandon an unstable rig, and now also refuses to reach a rig that
  // is not nearby.
  await page.evaluate(() => window.placeRig(0, 0));
  await switchToRig(page, "marsh-skimmer");
  // Use Drift's offset berth rather than aiming the chase camera through the
  // site's navigation mast at the basin centre.
  await page.evaluate(() => window.placeRig(-118, -123));
  const skimmerStart = await state(page);
  await page.evaluate(() => window.applyRigInput({ accelerate: true }, 1600));
  const skimmerRun = await state(page);
  assert(
    skimmerRun.activeRig.mobility.kind === "hover" &&
      skimmerRun.activeRig.mobility.wheels === undefined,
    `Skimmer leaked a ground mobility contract: ${JSON.stringify(skimmerRun.activeRig.mobility)}`,
  );
  assert(
    skimmerRun.activeRig.terrain.waterDepth > 1.1,
    "Skimmer did not exercise water deeper than Torque can ford",
  );
  assert(
    skimmerRun.activeRig.distanceTravelled >
      skimmerStart.activeRig.distanceTravelled + 2,
    "Skimmer did not produce meaningful water traversal",
  );
  assert(
    skimmerRun.activeRig.condition === skimmerStart.activeRig.condition,
    "Hover traversal incorrectly applied ground-rig drowning damage",
  );
  assert(
    (await page.locator("#mobility-label").textContent()) === "Cushion",
    "HUD did not expose hover authority as cushion pressure",
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
    JSON.parse(localStorage.getItem("rigs-unbound.save.v4")),
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
  assert(
    restored.rigs["marsh-skimmer"].distanceTravelled >=
      skimmerRun.rigs["marsh-skimmer"].distanceTravelled,
    "Skimmer history regressed across reload",
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
        perception: {
          expressed: expressedPerception,
          reduced: reducedPerception,
        },
        relay: restored.activity,
        rigDistances: {
          tractor: restored.rigs["utility-tractor"].distanceTravelled,
          buggy: restored.rigs["toy-buggy"].distanceTravelled,
          skimmer: restored.rigs["marsh-skimmer"].distanceTravelled,
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
          path.join(artifactDirectory, "field-02-front-forward.png"),
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

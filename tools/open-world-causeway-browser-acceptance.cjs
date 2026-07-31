/**
 * Open-world Sunken causeway browser acceptance.
 *
 * Proves one voluntary material consequence through the actual player-facing
 * cargo path: a personally known Sunken Flats exposes a physical Home Silo
 * stock bay, the Marsh Skimmer loads and attaches the kit, fixed-step input
 * carries it through flooded terrain, and delivery changes persistent local
 * capacity without creating a mission or route permission.
 *
 * The Playwright context is always new and is closed after the run. It never
 * reads or writes a developer's interactive browser profile or local save.
 */
const fs = require("node:fs");
const path = require("node:path");

const { chromium, assert, state, teardown } = require("./acceptance-helpers.cjs");
const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 10, label: "open-world causeway acceptance" });

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL ||
  "http://127.0.0.1:4173/?acceptance=field-02&causeway-proof=1";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
const screenshotPath = path.join(
  artifactDirectory,
  "open-world-causeway-browser-acceptance-2026-07-29.png",
);
const evidencePath = path.join(
  artifactDirectory,
  "open-world-causeway-browser-acceptance-2026-07-29.json",
);

function normalizeAngle(angle) {
  let normalized = angle;
  while (normalized > Math.PI) normalized -= Math.PI * 2;
  while (normalized < -Math.PI) normalized += Math.PI * 2;
  return normalized;
}

async function driveCargoThroughCrossing(page, target, maxSteps = 420) {
  for (let step = 0; step < maxSteps; step += 1) {
    const snapshot = await state(page);
    if (snapshot.activity.delivered) {
      return { step, delivered: true, x: snapshot.activeRig.x, z: snapshot.activeRig.z };
    }

    const rig = snapshot.activeRig;
    const distance = Math.hypot(target.x - rig.x, target.z - rig.z);
    const headingError = normalizeAngle(
      Math.atan2(target.x - rig.x, target.z - rig.z) - rig.heading,
    );
    const speed = Math.abs(rig.speed);
    const desiredSpeed = distance > 36 ? 7 : distance > 14 ? 4.5 : 2;
    const brake =
      speed > desiredSpeed || (Math.abs(headingError) > 0.9 && speed > 1.8);
    const accelerate =
      !brake &&
      (Math.abs(headingError) < 0.72 || speed < 0.9) &&
      speed < desiredSpeed;

    await page.evaluate(
      ({ accelerate, brake, headingError: error }) =>
        window.applyRigInput(
          {
            accelerate,
            brake,
            steerLeft: error < -0.055,
            steerRight: error > 0.055,
          },
          90,
        ),
      { accelerate, brake, headingError },
    );
  }

  const snapshot = await state(page);
  throw new Error(
    `Causeway cargo did not deliver: ${JSON.stringify({
      rig: snapshot.activeRig,
      cargo: snapshot.activity,
      diagnostic: snapshot.lastDiagnostic,
    })}`,
  );
}

async function main() {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  const browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
    );

    // Acceptance setup only establishes personal knowledge and positions the
    // selected rig at the real yard bay. Loading, attachment, traversal, and
    // delivery remain their normal player-facing authority paths.
    await page.evaluate(() => {
      window.placeRig(13, 5);
      window.selectRig("marsh-skimmer");
      window.placeRig(-126, -130);
      window.placeRig(12, 1, -2.33);
    });

    const beforeLoad = await state(page);
    assert(
      beforeLoad.worldMemory.discoveries.includes("sunken-flats"),
      "Sunken Flats must be personally known before the voluntary kit appears",
    );
    assert(
      beforeLoad.activeRig.id === "marsh-skimmer" &&
        beforeLoad.activeRig.condition === 100,
      "The ready Marsh Skimmer must reach the clear physical cargo bay",
    );

    await page.evaluate(() => window.performRigAction());
    const loaded = await state(page);
    assert(
      loaded.activity.cargoManifestId === "sunken-causeway-kit",
      "The Sunken causeway kit must load at its own physical bay",
    );
    assert(
      loaded.mission === null && loaded.activeSideMissions.length === 0,
      "Voluntary causeway loading must not create a mission",
    );

    await page.evaluate(() => window.performRigAction());
    const attached = await state(page);
    assert(
      attached.activity.cargoAttachedTo === "marsh-skimmer",
      "The loaded causeway kit must expose the ordinary attach action",
    );

    // The rig drives a little past the crossing center so its trailing crate,
    // not merely the rig's body, passes through the delivery radius.
    const leg = await driveCargoThroughCrossing(page, { x: -128.1, z: -132.0 });
    const delivered = await state(page);
    const sunken = delivered.settlements.find((entry) => entry.id === "sunken-flats");
    const waterworks = delivered.infrastructure.entities.find(
      (entry) => entry.id === "sunken-flats-waterworks",
    );
    assert(
      delivered.activity.delivered && delivered.activity.cargoAttachedTo === null,
      "The crate must complete delivery and detach",
    );
    assert(
      delivered.activeRig.mobility.kind === "hover" &&
        delivered.activeRig.terrain.waterDepth > 0 &&
        delivered.activeRig.condition > 0,
      "The skimmer must remain viable while towing through flooded terrain",
    );
    assert(
      sunken?.condition === "connected",
      "Sunken Flats must derive connected capacity from delivered material",
    );
    assert(
      delivered.mission === null && delivered.activeSideMissions.length === 0,
      "Delivery must not create a mission or side mission",
    );
    assert(
      waterworks?.name === "Sunken Flats Waterworks",
      "Sunken Flats must publish its canonical regional waterworks, not the retired singleton identity",
    );
    assert(errors.length === 0, `Browser errors: ${errors.join(" | ")}`);

    const enterField = page.getByRole("button", { name: "Enter the field" });
    if (await enterField.isVisible()) {
      await enterField.click();
    }
    await page.evaluate(() => window.selectCamera("survey"));
    await page.waitForTimeout(450);
    await page.evaluate(() => {
      const controls = [...document.querySelectorAll("button")];
      controls.find((button) => button.textContent?.trim() === "Got it")?.click();
    });
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
    );
    const restored = await state(page);
    const restoredSunken = restored.settlements.find(
      (entry) => entry.id === "sunken-flats",
    );
    const restoredWaterworks = restored.infrastructure.entities.find(
      (entry) => entry.id === "sunken-flats-waterworks",
    );
    assert(
      restored.activity.delivered && restoredSunken?.condition === "connected",
      "Reload must retain delivered cargo and Sunken's material-derived capacity",
    );
    assert(
      restored.mission === null && restored.activeSideMissions.length === 0,
      "Reload must retain the no-mission state",
    );
    assert(
      restoredWaterworks?.name === "Sunken Flats Waterworks",
      "Reload must retain the canonical regional waterworks identity",
    );

    const evidence = {
      targetUrl: TARGET_URL,
      leg,
      active: {
        x: delivered.activeRig.x,
        z: delivered.activeRig.z,
        condition: delivered.activeRig.condition,
        distanceTravelled: delivered.activeRig.distanceTravelled,
        mobility: delivered.activeRig.mobility,
        terrain: delivered.activeRig.terrain,
      },
      activity: delivered.activity,
      sunken,
      waterworks,
      restored: {
        delivered: restored.activity.delivered,
        condition: restoredSunken?.condition,
        waterworks: restoredWaterworks,
        mission: restored.mission,
        sideMissionCount: restored.activeSideMissions.length,
      },
      errors,
    };
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log("open-world-causeway-browser-acceptance: PASS");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await context.close();
    await teardown(browser);
  }
}

main().catch((error) => {
  console.error("open-world-causeway-browser-acceptance: FAIL");
  console.error(error.stack || error);
  process.exitCode = 1;
});

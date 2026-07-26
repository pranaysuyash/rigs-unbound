const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
const ru0110ArtifactDirectory = path.join(artifactDirectory, "ru-0110");
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
  fs.mkdirSync(ru0110ArtifactDirectory, { recursive: true });
  browser = await chromium.launch({
    channel: "chrome",
    // Deterministic automation should not depend on an interactive Chrome
    // window staying alive. Set RIGS_BROWSER_HEADLESS=0 only for supervised
    // visual debugging; screenshots are captured in either mode.
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
    slowMo: 18,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
  const consoleProblems = [];
  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push(`pageerror: ${error.message}`),
  );

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
  assert(
    (await page.title()) === "Rigs Unbound — Field 02",
    "Unexpected page title",
  );
  assert(
    await page.locator("#physics-lab-link").isVisible(),
    "Acceptance/developer surface should expose Physics Lab navigation",
  );
  assert(
    await page.locator("#runtime-diagnostics").isVisible(),
    "Acceptance/developer surface should expose runtime diagnostics",
  );
  const publicContext = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const publicPage = await publicContext.newPage();
  publicPage.setDefaultTimeout(90_000);
  publicPage.setDefaultNavigationTimeout(90_000);
  await publicPage.goto(new URL(TARGET_URL).origin, {
    waitUntil: "domcontentloaded",
  });
  await publicPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  assert(
    !(await publicPage.locator("#physics-lab-link").isVisible()) &&
      !(await publicPage.locator("#runtime-diagnostics").isVisible()),
    "Default player surface leaked developer navigation or diagnostics",
  );
  assert(
    !/fps|calls|heap/i.test(
      (await publicPage.locator("#save-status").textContent()) ?? "",
    ),
    "Default player persistence status leaked runtime tuning metrics",
  );
  await publicContext.close();
  assert(
    await page.locator("#welcome-panel").isVisible(),
    "Field 02 welcome plate should be visible",
  );
  const coveredBefore = await state(page);
  await page.waitForTimeout(700);
  const coveredAfter = await state(page);
  assert(
    coveredBefore.welcomeOpen === true &&
      coveredAfter.elapsedMs === coveredBefore.elapsedMs,
    `Welcome panel allowed background simulation: ${JSON.stringify({
      coveredBefore: coveredBefore.elapsedMs,
      coveredAfter: coveredAfter.elapsedMs,
    })}`,
  );
  await page.keyboard.press("Space");
  assert(
    !(await page.locator("#welcome-panel").isVisible()) &&
      (await state(page)).welcomeOpen === false,
    "Keyboard entry did not close the welcome panel",
  );
  assert(
    (await page.evaluate(() => document.activeElement?.id)) === "game-canvas",
    "Welcome entry did not transfer focus to the game canvas",
  );
  await page.keyboard.press("Space");
  assert(
    !(await page.locator("#welcome-panel").isVisible()),
    "Primary action re-opened the welcome panel",
  );
  assert(
    (await state(page)).activeRig.attachments.find(
      (item) => item.id === "field-plough",
    )?.engaged === true,
    "Space did not become the primary rig action after entry",
  );
  await page.keyboard.press("Space");

  const initial = await state(page);
  const freshAcquisition = await page.evaluate(() => {
    const snapshots = [];
    for (const rigId of ["toy-buggy", "marsh-skimmer", "utility-tractor"]) {
      window.selectRig(rigId);
      const current = JSON.parse(window.render_game_to_text());
      snapshots.push({
        requested: rigId,
        active: current.activeRigId,
        x: current.activeRig.x,
        z: current.activeRig.z,
        diagnostic: current.lastDiagnostic,
      });
    }
    return snapshots;
  });
  assert(
    freshAcquisition.every((entry) => entry.requested === entry.active),
    `Fresh Home berth chain is not reachable without teleportation: ${JSON.stringify(freshAcquisition)}`,
  );
  await page.waitForTimeout(120);
  const spawnCamera = await page.evaluate(() =>
    window.getCameraResolutionEvidence(),
  );
  assert(
    spawnCamera.mode === "chase" &&
      spawnCamera.obstructionSource === "structure" &&
      spawnCamera.obstructionId?.startsWith("home-") &&
      spawnCamera.resolvedDistance >= 2.8 &&
      spawnCamera.pathClear === true &&
      spawnCamera.selfIntersecting === false,
    `Fresh chase camera did not resolve the Home Silo obstruction: ${JSON.stringify(spawnCamera)}`,
  );

  // Prove the procedural obstacle query against a real standing tree, then
  // mutate the same canonical world-memory record to its felled state. The
  // fixture hooks exist only on ?acceptance=field-02 and are not player UI.
  const cameraTreeFixture = await page.evaluate(async () => {
    const fixtures = window.getCameraTreeFixtures();
    const offsets = [
      { dx: 0, dz: 6, heading: 0 },
      { dx: 0, dz: -6, heading: Math.PI },
      { dx: 6, dz: 0, heading: -Math.PI / 2 },
      { dx: -6, dz: 0, heading: Math.PI / 2 },
    ];
    window.selectRig("utility-tractor");
    window.selectCamera("chase");
    for (const fixture of fixtures) {
      for (const offset of offsets) {
        window.placeRig(
          fixture.x + offset.dx,
          fixture.z + offset.dz,
          offset.heading,
        );
        await new Promise((resolve) => setTimeout(resolve, 70));
        const standing = window.getCameraResolutionEvidence();
        if (
          standing.obstructionSource === "obstacle" &&
          standing.obstructionId === fixture.id &&
          standing.resolvedDistance < standing.idealDistance - 0.5 &&
          standing.pathClear
        ) {
          window.fellObstacleForAcceptance(fixture.id);
          await new Promise((resolve) => setTimeout(resolve, 900));
          const felled = window.getCameraResolutionEvidence();
          return { fixture, standing, felled };
        }
      }
    }
    return null;
  });
  assert(
    cameraTreeFixture &&
      cameraTreeFixture.standing.obstructionSource === "obstacle" &&
      cameraTreeFixture.felled.obstructionId !== cameraTreeFixture.fixture.id &&
      cameraTreeFixture.felled.pathClear === true &&
      cameraTreeFixture.felled.resolvedDistance >
        cameraTreeFixture.standing.resolvedDistance + 0.5,
    `Standing→felled tree camera contract failed: ${JSON.stringify(cameraTreeFixture)}`,
  );
  await page.evaluate(() => window.placeRig(4, 6, Math.PI));

  const terrainFaceEvidence = [];
  await page.evaluate(() => window.setAcceptanceManualStepping(true));
  for (const rigId of ["utility-tractor", "toy-buggy", "marsh-skimmer"]) {
    await switchToRig(page, rigId);
    const fixture = await page.evaluate(
      (id) => window.getTerrainFaceFixture(id),
      rigId,
    );
    await page.evaluate(
      ({ x, z, heading }) => window.placeTerrainRigForAcceptance(x, z, heading),
      fixture,
    );
    const atRestStart = await state(page);
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 500));
    const atRestBlocked = await state(page);
    const atRestAdvance =
      (atRestBlocked.activeRig.x - atRestStart.activeRig.x) * fixture.outwardX +
      (atRestBlocked.activeRig.z - atRestStart.activeRig.z) * fixture.outwardZ;
    assert(
      atRestAdvance < 0.3 &&
        atRestBlocked.activeRig.mobility.grounded !== false,
      `${rigId} penetrated the terrain face from rest: ${JSON.stringify({
        fixture,
        atRestAdvance,
        rig: atRestBlocked.activeRig,
        diagnostic: atRestBlocked.lastDiagnostic,
      })}`,
    );

    const runUpDistance = 1.5;
    await page.evaluate(
      ({ x, z, heading, outwardX, outwardZ, runUpDistance }) =>
        window.placeTerrainRigForAcceptance(
          x - outwardX * runUpDistance,
          z - outwardZ * runUpDistance,
          heading,
          10,
        ),
      { ...fixture, runUpDistance },
    );
    const runUpStart = await state(page);
    let runUpBlocked = runUpStart;
    let runUpAdvance = 0;
    let faceOvershoot = -Infinity;
    let sawFaceBlock = false;
    for (let step = 0; step < 24; step += 1) {
      await page.evaluate(() => window.applyRigInput({ accelerate: true }, 16));
      const current = await state(page);
      const advance =
        (current.activeRig.x - runUpStart.activeRig.x) * fixture.outwardX +
        (current.activeRig.z - runUpStart.activeRig.z) * fixture.outwardZ;
      const overshoot =
        (current.activeRig.x - fixture.x) * fixture.outwardX +
        (current.activeRig.z - fixture.z) * fixture.outwardZ;
      runUpAdvance = Math.max(runUpAdvance, advance);
      faceOvershoot = Math.max(faceOvershoot, overshoot);
      runUpBlocked = current;
      if (current.lastDiagnostic?.includes("near-vertical terrain face")) {
        sawFaceBlock = true;
        break;
      }
    }
    assert(
      Math.abs(runUpStart.activeRig.speed) >= 8 &&
        faceOvershoot <= 0.5 &&
        sawFaceBlock,
      `${rigId} did not reach and stop at the swept terrain face: ${JSON.stringify(
        {
          fixture,
          runUpStart: runUpStart.activeRig,
          runUpAdvance,
          faceOvershoot,
          sawFaceBlock,
          rig: runUpBlocked.activeRig,
          diagnostic: runUpBlocked.lastDiagnostic,
        },
      )}`,
    );

    await page.evaluate(
      ({ x, z, heading }) =>
        window.placeTerrainRigForAcceptance(x, z, heading + Math.PI),
      fixture,
    );
    const escapeStart = await state(page);
    await page.evaluate(() => window.applyRigInput({ accelerate: true }, 900));
    const escaped = await state(page);
    const inwardAdvance = -(
      (escaped.activeRig.x - escapeStart.activeRig.x) * fixture.outwardX +
      (escaped.activeRig.z - escapeStart.activeRig.z) * fixture.outwardZ
    );
    assert(
      inwardAdvance > 0.2,
      `${rigId} could not escape downhill from the face: ${JSON.stringify({
        fixture,
        inwardAdvance,
        rig: escaped.activeRig,
      })}`,
    );
    terrainFaceEvidence.push({
      rigId,
      fixture,
      atRestAdvance,
      runUpAdvance,
      faceOvershoot,
      inwardAdvance,
    });
    await page.evaluate(() => window.restoreActiveRigForAcceptance());
  }
  await switchToRig(page, "utility-tractor");
  await page.evaluate(() => window.placeRig(4, 6, Math.PI));

  assert(initial.schemaVersion === 6, "Expected v6 save contract");
  assert(
    initial.progression.nearestSalvage?.id === "first-recovery-cache" &&
      initial.progression.nearestSalvage.distance < 30,
    `First salvage cache is not reachable from spawn: ${JSON.stringify(initial.progression.nearestSalvage)}`,
  );
  const worldTimes = [initial.worldTimeMinutes];
  const phases = [];
  for (let index = 0; index < 3; index += 1) {
    await page.keyboard.press("KeyN");
    const cycled = await state(page);
    worldTimes.push(cycled.worldTimeMinutes);
    phases.push(cycled.phase);
  }
  assert(
    phases.join(",") === "gloam,night,day" &&
      worldTimes.every(
        (value, index) => index === 0 || value > worldTimes[index - 1],
      ),
    `World phase cycle is not monotonic: ${JSON.stringify({ phases, worldTimes })}`,
  );

  const firstSalvage = initial.progression.nearestSalvage;
  await page.evaluate((node) => window.placeRig(node.x, node.z), firstSalvage);
  assert(
    (await page.locator("#current-prompt").textContent()).includes(
      "press Space or Act",
    ),
    "First salvage prompt did not teach the canonical action",
  );
  assert(
    (await page.locator("#touch-primary-action").textContent()).includes(
      "Collect",
    ) &&
      (
        await page.locator("#touch-primary-action").getAttribute("aria-label")
      )?.includes("Collect"),
    "Touch action label did not resolve the salvage action",
  );
  await page.keyboard.press("Space");
  const firstReward = await state(page);
  assert(
    firstReward.progression.salvage === firstSalvage.value &&
      firstReward.progression.salvageCollected === firstSalvage.value &&
      firstReward.progression.nearestSalvage?.id !== "first-recovery-cache",
    `First salvage reward did not complete: ${JSON.stringify(firstReward.progression)}`,
  );
  await page.evaluate(() => window.placeRig(4, 6, Math.PI));
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

  const hoodEvidence = [];
  const hoodCaptureNames = {
    "utility-tractor": "b5-utility-tractor-hood-after.png",
    "toy-buggy": "b5-toy-buggy-hood-after.png",
    "marsh-skimmer": "b5-marsh-skimmer-hood-after.png",
  };

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
  await page.waitForFunction(
    () => document.querySelector("#mobility-label")?.textContent === "Cushion",
  );

  // Capture each hood only after the traversal assertions. The proximity-aware
  // helper intentionally moves the current rig to the next one; doing this
  // earlier would rewrite the ramp/water fixture positions the same run still
  // needs to exercise.
  for (const rigId of ["utility-tractor", "toy-buggy", "marsh-skimmer"]) {
    await switchToRig(page, rigId);
    await page.evaluate(() => window.placeRig(18, -46, 0));
    const selected = JSON.parse(
      await page.evaluate(() => window.selectCamera("hood")),
    );
    assert(
      selected.activeRigId === rigId && selected.cameraMode === "hood",
      `Hood capture did not assert active rig ${rigId}: ${JSON.stringify(selected)}`,
    );
    await page.waitForTimeout(120);
    const evidence = await page.evaluate(() =>
      window.getCameraResolutionEvidence(),
    );
    assert(
      evidence.rigId === rigId &&
        evidence.mode === "hood" &&
        evidence.pathClear === true &&
        Math.abs(evidence.resolvedDistance - evidence.idealDistance) < 0.08 &&
        evidence.selfIntersecting === false,
      `Hood socket intersects ${rigId}: ${JSON.stringify(evidence)}`,
    );
    hoodEvidence.push(evidence);
    await page.screenshot({
      path: path.join(ru0110ArtifactDirectory, hoodCaptureNames[rigId]),
      fullPage: true,
    });
  }
  await page.evaluate(() => window.selectCamera("chase"));
  await page.evaluate(() => window.setAcceptanceManualStepping(false));

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
    JSON.parse(localStorage.getItem("rigs-unbound.save.v6")),
  );
  assert(
    stored.state.cargoRelay.status === "complete",
    "Completed relay was not saved",
  );
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
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
  assert(
    restored.progression.salvageCollected >= firstSalvage.value &&
      restored.worldTimeMinutes >= worldTimes.at(-1),
    "First reward or monotonic world time did not survive reload",
  );

  await page.addInitScript(() => {
    const payload = JSON.parse(localStorage.getItem("rigs-unbound.save.v6"));
    if (!payload?.state?.rigs?.["utility-tractor"]) return;
    payload.state.activeRigId = "utility-tractor";
    payload.state.rigs["utility-tractor"].x = -126;
    payload.state.rigs["utility-tractor"].z = -130;
    payload.state.rigs["utility-tractor"].condition = 0;
    localStorage.setItem("rigs-unbound.save.v6", JSON.stringify(payload));
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  const disabled = await state(page);
  await page.keyboard.press("KeyX");
  const recoveredByKeyboard = await state(page);
  await page.keyboard.press("KeyX");
  const repeatedRecovery = await state(page);
  assert(
    disabled.activeRig.condition === 0 &&
      recoveredByKeyboard.activeRig.condition === 25 &&
      recoveredByKeyboard.progression.recovery.emergencyCount === 1 &&
      recoveredByKeyboard.progression.workshopInReach === "home-silo" &&
      repeatedRecovery.progression.recovery.emergencyCount === 1 &&
      repeatedRecovery.progression.salvageCollected ===
        recoveredByKeyboard.progression.salvageCollected,
    `Keyboard recovery or repeat protection failed: ${JSON.stringify({
      disabled: disabled.activeRig,
      recovered: recoveredByKeyboard.activeRig,
      repeated: repeatedRecovery.activeRig,
      recovery: repeatedRecovery.progression.recovery,
    })}`,
  );

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  const disabledPayload = await page.evaluate(() =>
    localStorage.getItem("rigs-unbound.save.v6"),
  );
  await page.locator("#emergency-recover").click();
  const recoveredByMouse = await state(page);
  assert(
    recoveredByMouse.activeRig.condition === 25 &&
      recoveredByMouse.progression.recovery.emergencyCount === 2 &&
      recoveredByMouse.progression.workshopInReach === "home-silo",
    `Mouse emergency recovery failed: ${JSON.stringify({
      recovered: recoveredByMouse.activeRig,
      recovery: recoveredByMouse.progression.recovery,
    })}`,
  );

  const touchContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
  });
  await touchContext.addInitScript(
    ({ payload }) => {
      localStorage.setItem("rigs-unbound.save.v6", payload);
      sessionStorage.setItem("rigs-unbound.welcome-seen", "true");
    },
    { payload: disabledPayload },
  );
  const touchPage = await touchContext.newPage();
  touchPage.setDefaultTimeout(90_000);
  touchPage.setDefaultNavigationTimeout(90_000);
  await touchPage.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
  await touchPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await touchPage.locator('[data-tap-action="recover"]').tap();
  const recoveredByTouch = await state(touchPage);
  assert(
    recoveredByTouch.activeRig.condition === 25 &&
      recoveredByTouch.progression.recovery.emergencyCount === 2,
    `Touch emergency recovery failed: ${JSON.stringify({
      recovered: recoveredByTouch.activeRig,
      recovery: recoveredByTouch.progression.recovery,
    })}`,
  );
  await touchContext.close();

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
    desktopMetrics.firstInputReadyMs !== null &&
      desktopMetrics.firstInputReadyMs <= desktopMetrics.firstControllableMs,
    "First processed input was not measured before the first controllable frame",
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
        camera: {
          spawn: spawnCamera,
          standingToFelledTree: cameraTreeFixture,
          hoods: hoodEvidence,
        },
        freshAcquisition,
        terrainFaces: terrainFaceEvidence,
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
  await context.close();
  await browser.close();
  browser = null;
})().catch(async (error) => {
  console.error(error);
  if (browser) {
    await Promise.race([
      browser.close(),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }
  // A failed acceptance run must not become an unbounded monitoring process.
  // Exiting this harness closes its Playwright transport; it does not touch the
  // development server or any independently owned browser daemon.
  process.exit(1);
});

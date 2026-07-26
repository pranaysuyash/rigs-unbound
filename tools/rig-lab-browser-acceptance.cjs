const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 15, label: "rig lab acceptance" });

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/?acceptance=field-02";
const expectDeveloperBridges =
  process.env.RIGS_EXPECT_DEVELOPER_BRIDGES !== "0";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
const ru0110ArtifactDirectory = path.join(artifactDirectory, "ru-0110");
const slowMotionMs = Number(process.env.RIGS_BROWSER_SLOW_MO ?? 0);
let browser;
let firstRungBrowser;
let context;
let page;

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
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await page.evaluate(() =>
        JSON.parse(window.render_game_to_text()),
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const transientNavigation =
        /Execution context was destroyed|most likely because of a navigation/i.test(
          message,
        );
      if (!transientNavigation || attempt === 2) throw error;
      await page.waitForLoadState("domcontentloaded").catch(() => undefined);
      await page.waitForFunction(
        () => typeof window.render_game_to_text === "function",
        { timeout: 5_000 },
      );
    }
  }
  throw new Error("Unreachable state retry boundary");
}

function planPlayerDrivePulse(rig, target) {
  const dx = target.x - rig.x;
  const dz = target.z - rig.z;
  const distance = Math.hypot(dx, dz);
  const desired = Math.atan2(dx, dz);
  const normalizeAngle = (angle) => {
    let normalized = angle;
    while (normalized > Math.PI) normalized -= Math.PI * 2;
    while (normalized < -Math.PI) normalized += Math.PI * 2;
    return normalized;
  };
  const forwardError = normalizeAngle(desired - rig.heading);
  const reverseError = normalizeAngle(desired - (rig.heading + Math.PI));
  const reversing =
    distance < 12 && Math.abs(reverseError) + 0.35 < Math.abs(forwardError);
  const travelError = reversing ? reverseError : forwardError;
  const headingError = Math.abs(travelError);
  let desiredSpeed =
    distance > 18 ? 4.5 : distance > 9 ? 3 : distance > 5 ? 1.6 : 0.8;
  if (headingError > 0.9) desiredSpeed = Math.min(desiredSpeed, 0.8);
  if (reversing) desiredSpeed = -Math.min(desiredSpeed, 1.6);
  const speedError = desiredSpeed - rig.speed;
  const driveAction =
    speedError > 0.18 ? "accelerate" : speedError < -0.18 ? "brake" : null;
  const turnRight = reversing ? travelError < -0.06 : travelError > 0.06;
  const turnLeft = reversing ? travelError > 0.06 : travelError < -0.06;
  const steerAction = turnLeft ? "steerLeft" : turnRight ? "steerRight" : null;
  return {
    distance,
    travelError,
    headingError,
    driveAction,
    steerAction,
  };
}

async function driveTo(page, target, stoppingRadius, maxSteps = 220) {
  let minimumDistance = Infinity;
  let maximumY = 0;
  let finalRig = null;
  let finalHeadingError = null;
  let finalDiagnostic = null;
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const rig = current.activeRig;
    finalRig = rig;
    finalDiagnostic = current.lastDiagnostic;
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
    finalHeadingError = error;
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
        turnLeft: error < -0.055,
        turnRight: error > 0.055,
        brake,
        accelerate,
      },
    );
  }
  throw new Error(
    `Rig did not reach target ${JSON.stringify(target)}; nearest ${minimumDistance.toFixed(2)} m; final ${JSON.stringify({ rig: finalRig, headingError: finalHeadingError, diagnostic: finalDiagnostic })}`,
  );
}

/**
 * Drive through the public input layer for first-rung proof.
 *
 * Unlike the deterministic long-distance fixtures above, this helper presses
 * the same W/A/D keys a player uses. It may read the public text snapshot for
 * steering feedback, but it never teleports, grants currency, or invokes a
 * mutation hook.
 */
async function driveToWithKeyboard(
  page,
  target,
  stoppingRadius,
  maxSteps = 220,
  terminalFirstRungStage = null,
) {
  let nearestDistance = Number.POSITIVE_INFINITY;
  let finalRig = null;
  let finalHeadingError = null;
  let finalDiagnostic = null;
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const rig = current.activeRig;
    if (
      terminalFirstRungStage !== null &&
      current.progression.firstRung.stage === terminalFirstRungStage
    ) {
      await page.keyboard.up("KeyW");
      await page.keyboard.up("KeyS");
      await page.keyboard.up("KeyA");
      await page.keyboard.up("KeyD");
      return {
        steps: step,
        nearestDistance,
        terminalFirstRungStage,
      };
    }
    finalRig = rig;
    finalDiagnostic = current.lastDiagnostic;
    const dx = target.x - rig.x;
    const dz = target.z - rig.z;
    const distance = Math.hypot(dx, dz);
    nearestDistance = Math.min(nearestDistance, distance);
    if (distance <= stoppingRadius) {
      await page.keyboard.up("KeyW");
      await page.keyboard.up("KeyS");
      await page.keyboard.up("KeyA");
      await page.keyboard.up("KeyD");
      return { steps: step, nearestDistance };
    }
    if (rig.condition <= 0) {
      throw new Error(
        `Keyboard driver disabled ${rig.id} before reaching ${JSON.stringify(target)}; nearest ${nearestDistance.toFixed(2)} m; final ${JSON.stringify({ rig, diagnostic: current.lastDiagnostic })}`,
      );
    }

    const desired = Math.atan2(dx, dz);
    const normalizeAngle = (angle) => {
      let normalized = angle;
      while (normalized > Math.PI) normalized -= Math.PI * 2;
      while (normalized < -Math.PI) normalized += Math.PI * 2;
      return normalized;
    };
    const forwardError = normalizeAngle(desired - rig.heading);
    const reverseError = normalizeAngle(desired - (rig.heading + Math.PI));
    const reversing =
      distance < 12 && Math.abs(reverseError) + 0.35 < Math.abs(forwardError);
    const travelError = reversing ? reverseError : forwardError;
    finalHeadingError = travelError;
    const headingError = Math.abs(travelError);
    let desiredSpeed =
      distance > 18 ? 4.5 : distance > 9 ? 3 : distance > 5 ? 1.6 : 0.8;
    if (headingError > 0.9) desiredSpeed = Math.min(desiredSpeed, 0.8);
    if (reversing) desiredSpeed = -Math.min(desiredSpeed, 1.6);
    const speedError = desiredSpeed - rig.speed;
    const driveKey =
      speedError > 0.18 ? "KeyW" : speedError < -0.18 ? "KeyS" : null;
    const turnRight = reversing ? travelError < -0.06 : travelError > 0.06;
    const turnLeft = reversing ? travelError > 0.06 : travelError < -0.06;
    const turnKey = turnLeft ? "KeyA" : turnRight ? "KeyD" : null;
    if (driveKey) await page.keyboard.down(driveKey);
    if (turnKey) await page.keyboard.down(turnKey);
    await page.waitForTimeout(headingError > 1 ? 90 : 70);
    if (turnKey) await page.keyboard.up(turnKey);
    if (driveKey) await page.keyboard.up(driveKey);
  }
  throw new Error(
    `Keyboard driver did not reach ${JSON.stringify(target)}; nearest ${nearestDistance.toFixed(2)} m; final ${JSON.stringify({ rig: finalRig, headingError: finalHeadingError, diagnostic: finalDiagnostic })}`,
  );
}

/** Bring the rig to rest through the same forward/brake keys a player uses. */
async function stopWithKeyboard(page, maxSteps = 40) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const speed = current.activeRig.speed;
    if (Math.abs(speed) <= 0.2) {
      await page.keyboard.up("KeyW");
      await page.keyboard.up("KeyS");
      return { steps: step, speed };
    }
    const brakeKey = speed > 0 ? "KeyS" : "KeyW";
    await page.keyboard.down(brakeKey);
    await page.waitForTimeout(70);
    await page.keyboard.up(brakeKey);
  }
  const current = await state(page);
  throw new Error(
    `Keyboard stop did not settle ${current.activeRig.id}: ${JSON.stringify({ speed: current.activeRig.speed, diagnostic: current.lastDiagnostic })}`,
  );
}

async function dispatchTouchHold(page, cdp, actions, durationMs) {
  const points = [];
  for (const [index, action] of actions.entries()) {
    const bounds = await page.evaluate((holdAction) => {
      const element = document.querySelector(
        `[data-hold-action="${holdAction}"]`,
      );
      if (!(element instanceof HTMLElement)) return null;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return null;
      return {
        x: rect.x,
        y: rect.y,
        width: rect.width,
        height: rect.height,
      };
    }, action);
    assert(bounds !== null, `Touch control ${action} has no visible bounds`);
    points.push({
      x: Math.round(bounds.x + bounds.width / 2),
      y: Math.round(bounds.y + bounds.height / 2),
      radiusX: 4,
      radiusY: 4,
      force: 1,
      id: index + 1,
    });
  }
  if (points.length === 0) {
    await page.waitForTimeout(durationMs);
    return;
  }
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: points,
  });
  await page.waitForTimeout(durationMs);
  await cdp.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
}

async function driveToWithTouch(
  page,
  cdp,
  target,
  stoppingRadius,
  maxSteps = 220,
  terminalFirstRungStage = null,
  terminalLessonIncludes = null,
) {
  let nearestDistance = Number.POSITIVE_INFINITY;
  let finalRig = null;
  let finalHeadingError = null;
  let finalDiagnostic = null;
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const rig = current.activeRig;
    if (
      terminalLessonIncludes !== null &&
      (await page.evaluate(
        (expected) =>
          document
            .querySelector("#control-lesson-title")
            ?.textContent?.includes(expected) === true,
        terminalLessonIncludes,
      ))
    ) {
      return {
        steps: step,
        nearestDistance,
        terminalLessonIncludes,
      };
    }
    if (
      terminalFirstRungStage !== null &&
      current.progression.firstRung.stage === terminalFirstRungStage
    ) {
      return {
        steps: step,
        nearestDistance,
        terminalFirstRungStage,
      };
    }
    finalRig = rig;
    finalDiagnostic = current.lastDiagnostic;
    const pulse = planPlayerDrivePulse(rig, target);
    nearestDistance = Math.min(nearestDistance, pulse.distance);
    if (terminalLessonIncludes === null && pulse.distance <= stoppingRadius) {
      return { steps: step, nearestDistance };
    }
    if (rig.condition <= 0) {
      throw new Error(
        `Touch driver disabled ${rig.id} before reaching ${JSON.stringify(target)}; nearest ${nearestDistance.toFixed(2)} m; final ${JSON.stringify({ rig, diagnostic: current.lastDiagnostic })}`,
      );
    }
    finalHeadingError = pulse.travelError;
    const actions = [pulse.driveAction, pulse.steerAction].filter(Boolean);
    await dispatchTouchHold(
      page,
      cdp,
      actions,
      pulse.headingError > 1 ? 90 : 70,
    );
  }
  throw new Error(
    `Touch driver did not reach ${JSON.stringify(target)}; nearest ${nearestDistance.toFixed(2)} m; final ${JSON.stringify({ rig: finalRig, headingError: finalHeadingError, diagnostic: finalDiagnostic })}`,
  );
}

async function stopWithTouch(page, cdp, maxSteps = 40) {
  for (let step = 0; step < maxSteps; step += 1) {
    const current = await state(page);
    const speed = current.activeRig.speed;
    if (Math.abs(speed) <= 0.2) return { steps: step, speed };
    await dispatchTouchHold(
      page,
      cdp,
      [speed > 0 ? "brake" : "accelerate"],
      70,
    );
  }
  const current = await state(page);
  throw new Error(
    `Touch stop did not settle ${current.activeRig.id}: ${JSON.stringify({ speed: current.activeRig.speed, diagnostic: current.lastDiagnostic })}`,
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
    slowMo:
      Number.isFinite(slowMotionMs) && slowMotionMs > 0 ? slowMotionMs : 0,
  });
  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  page = await context.newPage();
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
  await page.waitForFunction(() => {
    const bridges = JSON.parse(
      window.render_game_to_text(),
    ).runtimeAssetBridges;
    return (
      Array.isArray(bridges) &&
      bridges.every((bridge) => bridge.status !== "loading")
    );
  });
  const developerBridges = (await state(page)).runtimeAssetBridges;
  assert(
    expectDeveloperBridges
      ? developerBridges.length > 0
      : developerBridges.length === 0,
    `Developer asset bridge expectation did not match this build: ${JSON.stringify(
      developerBridges,
    )}`,
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
    (await page.title()) === "Rigs Unbound",
    "The document title should preserve the universe-level product identity.",
  );
  assert(
    ((await page.locator("#world-designation").textContent()) ?? "").startsWith(
      "Field 02 ·",
    ),
    "The developer surface should identify Field 02 without making it the product title.",
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
  const publicSnapshot = await state(publicPage);
  assert(
    Array.isArray(publicSnapshot.runtimeAssetBridges) &&
      publicSnapshot.runtimeAssetBridges.length === 0,
    `Default player surface admitted non-public runtime assets: ${JSON.stringify(
      publicSnapshot.runtimeAssetBridges,
    )}`,
  );
  await publicContext.close();

  // The first-rung proof uses real-time keyboard input. Release the main
  // developer renderer while it runs so its continuous Three.js frame loop
  // cannot starve the traversal. A fresh developer page is created for the
  // remaining checks so its timing markers retain their normal boot baseline.
  await context.close();

  // Keep the heavy developer renderer alive for the later contract checks, but
  // run the real-key first-rung traversal in a separate Chrome process. The
  // traversal is timing-sensitive by design; an active renderer elsewhere in
  // the acceptance run can starve input frames without changing game behavior.
  firstRungBrowser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_BROWSER_HEADLESS !== "0",
    slowMo:
      Number.isFinite(slowMotionMs) && slowMotionMs > 0 ? slowMotionMs : 0,
  });
  const firstRungContext = await firstRungBrowser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const firstRungPage = await firstRungContext.newPage();
  firstRungPage.setDefaultTimeout(90_000);
  firstRungPage.setDefaultNavigationTimeout(90_000);
  await firstRungPage.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
  await firstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await firstRungPage.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await firstRungPage.reload({ waitUntil: "domcontentloaded" });
  await firstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await firstRungPage.keyboard.press("Space");
  const firstRungStart = await state(firstRungPage);
  assert(
    firstRungStart.progression.firstRung.stage === "find-cache" &&
      (await firstRungPage.locator("#first-rung-objective").isVisible()),
    `Fresh first-rung guidance missing: ${JSON.stringify(firstRungStart.progression.firstRung)}`,
  );
  const firstCacheArrival = await driveToWithKeyboard(
    firstRungPage,
    firstRungStart.progression.firstRung.target,
    // Keep enough margin inside the canonical 4.6 m action radius for normal
    // key-dispatch latency without requiring the exact cache centre.
    3.5,
    300,
  );
  const cacheStop = await stopWithKeyboard(firstRungPage);
  const keyboardCacheReady = await state(firstRungPage);
  assert(
    keyboardCacheReady.progression.nearestSalvage?.id ===
      "first-recovery-cache" &&
      keyboardCacheReady.progression.nearestSalvage.distance <= 4.6,
    `Keyboard route stopped outside the first cache action radius: ${JSON.stringify(
      {
        rig: keyboardCacheReady.activeRig,
        nearestSalvage: keyboardCacheReady.progression.nearestSalvage,
      },
    )}`,
  );
  await firstRungPage.locator("#game-canvas").focus();
  await firstRungPage.keyboard.press("Space");
  await firstRungPage.waitForTimeout(250);
  const keyboardCollected = await state(firstRungPage);
  assert(
    keyboardCollected.progression.firstRung.stage === "return-home",
    `Keyboard Space did not collect the ready first cache: ${JSON.stringify({
      before: keyboardCacheReady.progression,
      after: keyboardCollected.progression,
      diagnostic: keyboardCollected.lastDiagnostic,
    })}`,
  );
  await firstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung.stage ===
      "return-home",
  );
  const returnTarget = (await state(firstRungPage)).progression.firstRung
    .target;
  assert(
    returnTarget.x === 0 && returnTarget.z === 12,
    `First-rung return target drifted from Home Silo: ${JSON.stringify(returnTarget)}`,
  );
  // The gameplay contract is to re-enter Home Silo's 15 m service area, not to
  // drive to the site's centre. This meadow point is safely inside that radius
  // and only a short real-keyboard drive from the authored first cache.
  const homeApproach = await driveToWithKeyboard(
    firstRungPage,
    { x: -10, z: 8 },
    4,
    180,
    "choose-part",
  );
  const homeStop = await stopWithKeyboard(firstRungPage);
  await firstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung.stage ===
      "choose-part",
  );
  await firstRungPage.waitForFunction(
    () =>
      document.querySelector("#control-lesson-title")?.textContent ===
      "Fit a part at Home Silo",
  );
  assert(
    (
      (await firstRungPage.locator("#control-lesson-keyboard").textContent()) ??
      ""
    ).includes("1–6"),
    "Keyboard return did not explain the newly relevant workshop controls.",
  );
  await firstRungPage.locator("#control-lesson-dismiss").click();
  await firstRungPage.locator("#workshop-panel").waitFor({ state: "visible" });
  const recommendedButton = firstRungPage.locator(
    'button[data-module-id="lug-tires"]',
  );
  assert(
    (await recommendedButton.isEnabled()) &&
      ((await recommendedButton.getAttribute("aria-label")) ?? "").startsWith(
        "Recommended.",
      ),
    "Recommended first workshop choice was not enabled and named.",
  );
  await recommendedButton.click();
  await firstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung
        .complete === true,
  );
  const firstRungFitted = await state(firstRungPage);
  const fittedPerception = await firstRungPage.evaluate(() =>
    window.getRigPerceptionEvidence(),
  );
  assert(
    firstRungFitted.activeRig.modules.includes("lug-tires") &&
      fittedPerception.visibleModules.includes("lug-tires"),
    `First fit did not reach simulation and presentation: ${JSON.stringify({
      modules: firstRungFitted.activeRig.modules,
      visibleModules: fittedPerception.visibleModules,
    })}`,
  );
  await firstRungPage.keyboard.press("c");
  await firstRungPage.keyboard.press("c");
  await firstRungPage.screenshot({
    path: path.join(artifactDirectory, "first-rung-desktop.png"),
    fullPage: true,
  });
  await firstRungPage.waitForFunction(
    () => window.getPerformanceSnapshot().saveBytes > 0,
    undefined,
    { timeout: 12_000 },
  );
  await firstRungPage.reload({ waitUntil: "domcontentloaded" });
  await firstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  const firstRungRestored = await state(firstRungPage);
  const restoredPerception = await firstRungPage.evaluate(() =>
    window.getRigPerceptionEvidence(),
  );
  assert(
    firstRungRestored.activeRig.modules.includes("lug-tires") &&
      firstRungRestored.progression.firstRung.complete === true &&
      restoredPerception.visibleModules.includes("lug-tires"),
    "Fitted first-rung module did not survive save/reload in state and presentation.",
  );
  const firstRungEvidence = {
    firstCacheApproach: firstCacheArrival,
    cacheStop,
    homeApproach,
    homeStop,
    start: firstRungStart.progression.firstRung,
    fitted: firstRungFitted.progression.firstRung,
    restored: firstRungRestored.progression.firstRung,
    fittedModules: firstRungRestored.activeRig.modules,
    visibleModules: restoredPerception.visibleModules,
  };
  await firstRungContext.close();

  const touchFirstRungContext = await firstRungBrowser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const touchFirstRungPage = await touchFirstRungContext.newPage();
  touchFirstRungPage.setDefaultTimeout(90_000);
  touchFirstRungPage.setDefaultNavigationTimeout(90_000);
  await touchFirstRungPage.goto(TARGET_URL, {
    waitUntil: "domcontentloaded",
  });
  await touchFirstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await touchFirstRungPage.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await touchFirstRungPage.reload({ waitUntil: "domcontentloaded" });
  await touchFirstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  await touchFirstRungPage.locator("#enter-world").tap();
  await touchFirstRungPage.waitForFunction(
    () => JSON.parse(window.render_game_to_text()).welcomeOpen === false,
  );
  await touchFirstRungPage.waitForFunction(
    () =>
      document.querySelector("#control-lesson-title")?.textContent ===
      "Drive the active rig",
  );
  assert(
    (await touchFirstRungPage
      .locator("#control-lesson-title")
      .textContent()) === "Drive the active rig" &&
      (
        (await touchFirstRungPage
          .locator("#control-lesson-touch")
          .textContent()) ?? ""
      ).includes("direction arrows"),
    "Fresh touch entry did not explain the driving controls before movement",
  );
  await touchFirstRungPage.locator("#control-lesson-dismiss").tap();
  const touchStart = await state(touchFirstRungPage);
  assert(
    touchStart.progression.firstRung.stage === "find-cache",
    `Fresh touch first-rung guidance missing: ${JSON.stringify(touchStart.progression.firstRung)}`,
  );
  const touchCdp =
    await touchFirstRungContext.newCDPSession(touchFirstRungPage);
  const touchCacheApproach = await driveToWithTouch(
    touchFirstRungPage,
    touchCdp,
    touchStart.progression.firstRung.target,
    4.6,
    300,
    null,
    "Collect the salvage",
  );
  await touchFirstRungPage.waitForFunction(
    () =>
      document
        .querySelector("#control-lesson-title")
        ?.textContent?.includes("Collect the salvage") === true,
  );
  assert(
    (
      (await touchFirstRungPage
        .locator("#control-lesson-touch")
        .textContent()) ?? ""
    ).includes("Act"),
    "Touch collection became relevant without explaining the contextual Act control",
  );
  await touchFirstRungPage.locator("#control-lesson-dismiss").tap();
  await touchFirstRungPage.locator('[data-tap-action="primary"]').tap();
  await touchFirstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung.stage ===
      "return-home",
  );
  const touchCacheStop = await stopWithTouch(touchFirstRungPage, touchCdp);
  const touchReturnTarget = (await state(touchFirstRungPage)).progression
    .firstRung.target;
  assert(
    touchReturnTarget.x === 0 && touchReturnTarget.z === 12,
    `Touch first-rung return target drifted from Home Silo: ${JSON.stringify(touchReturnTarget)}`,
  );
  const touchHomeApproach = await driveToWithTouch(
    touchFirstRungPage,
    touchCdp,
    { x: -10, z: 8 },
    4,
    180,
    "choose-part",
  );
  const touchHomeStop = await stopWithTouch(touchFirstRungPage, touchCdp);
  await touchFirstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung.stage ===
      "choose-part",
  );
  await touchFirstRungPage.waitForFunction(
    () =>
      document.querySelector("#control-lesson-title")?.textContent ===
      "Fit a part at Home Silo",
  );
  assert(
    (
      (await touchFirstRungPage
        .locator("#control-lesson-touch")
        .textContent()) ?? ""
    ).includes("choose a part"),
    "Touch return did not explain the newly relevant workshop control",
  );
  await touchFirstRungPage.locator("#control-lesson-dismiss").tap();
  await touchFirstRungPage
    .locator("#workshop-panel")
    .waitFor({ state: "visible" });
  const touchRecommendedButton = touchFirstRungPage.locator(
    'button[data-module-id="lug-tires"]',
  );
  assert(
    (await touchRecommendedButton.isEnabled()) &&
      (
        (await touchRecommendedButton.getAttribute("aria-label")) ?? ""
      ).startsWith("Recommended."),
    "Recommended first workshop choice was not touch-accessible and named",
  );
  await touchRecommendedButton.tap();
  await touchFirstRungPage.waitForFunction(
    () =>
      JSON.parse(window.render_game_to_text()).progression.firstRung
        .complete === true,
  );
  await touchFirstRungPage.waitForFunction(() => {
    const raw = localStorage.getItem("rigs-unbound.save.v7");
    if (!raw) return false;
    const saved = JSON.parse(raw);
    return (
      saved?.state?.rigs?.["utility-tractor"]?.modules?.includes(
        "lug-tires",
      ) === true
    );
  });
  await touchFirstRungPage.reload({ waitUntil: "domcontentloaded" });
  await touchFirstRungPage.waitForFunction(
    () => typeof window.render_game_to_text === "function",
  );
  const touchRestored = await state(touchFirstRungPage);
  const touchRestoredPerception = await touchFirstRungPage.evaluate(() =>
    window.getRigPerceptionEvidence(),
  );
  assert(
    touchRestored.progression.firstRung.complete === true &&
      touchRestored.activeRig.modules.includes("lug-tires") &&
      touchRestoredPerception.visibleModules.includes("lug-tires"),
    "Touch-fitted first-rung module did not survive save/reload in state and presentation",
  );
  const touchFirstRungEvidence = {
    cacheApproach: touchCacheApproach,
    cacheStop: touchCacheStop,
    homeApproach: touchHomeApproach,
    homeStop: touchHomeStop,
    start: touchStart.progression.firstRung,
    restored: touchRestored.progression.firstRung,
    fittedModules: touchRestored.activeRig.modules,
    visibleModules: touchRestoredPerception.visibleModules,
  };
  await touchCdp.detach();
  await touchFirstRungContext.close();

  context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  page = await context.newPage();
  page.setDefaultTimeout(90_000);
  page.setDefaultNavigationTimeout(90_000);
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
  await page.waitForFunction(() => {
    const bridges = JSON.parse(
      window.render_game_to_text(),
    ).runtimeAssetBridges;
    return (
      Array.isArray(bridges) &&
      bridges.every((bridge) => bridge.status !== "loading")
    );
  });
  const restoredDeveloperBridges = (await state(page)).runtimeAssetBridges;
  assert(
    expectDeveloperBridges
      ? restoredDeveloperBridges.length > 0
      : restoredDeveloperBridges.length === 0,
    `Restored developer asset bridge expectation did not match this build: ${JSON.stringify(
      restoredDeveloperBridges,
    )}`,
  );

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
  const firstControlLesson = page.locator("#control-lesson");
  await firstControlLesson.waitFor({ state: "visible" });
  assert(
    (await firstControlLesson.getAttribute("data-lesson-id")) === "drive" &&
      /W A S D|arrow keys/i.test(
        (await firstControlLesson.textContent()) ?? "",
      ) &&
      /touch|direction arrows/i.test(
        (await firstControlLesson.textContent()) ?? "",
      ),
    `Fresh field did not explain its first driving control: ${JSON.stringify({
      lessonId: await firstControlLesson.getAttribute("data-lesson-id"),
      text: await firstControlLesson.textContent(),
    })}`,
  );
  await page.keyboard.down("KeyW");
  await page.waitForFunction(() => {
    const learned = JSON.parse(
      localStorage.getItem("rigs-unbound.control-lessons.v1") ?? "[]",
    );
    return Array.isArray(learned) && learned.includes("drive");
  });
  await page.keyboard.up("KeyW");
  await page.waitForFunction(
    () =>
      document
        .querySelector("#control-lesson")
        ?.getAttribute("data-lesson-id") !== "drive",
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
  const spawnObstructionContractMet =
    spawnCamera.obstructionSource === null
      ? Math.abs(spawnCamera.resolvedDistance - spawnCamera.idealDistance) < 0.1
      : spawnCamera.obstructionSource === "structure" &&
        spawnCamera.obstructionId?.startsWith("home-") &&
        spawnCamera.resolvedDistance >= 2.8 &&
        spawnCamera.resolvedDistance < spawnCamera.idealDistance;
  assert(
    spawnCamera.mode === "chase" &&
      spawnObstructionContractMet &&
      spawnCamera.behindRig === true &&
      spawnCamera.forwardOffset < 0 &&
      spawnCamera.pathClear === true &&
      spawnCamera.selfIntersecting === false,
    `Fresh chase camera violated the clear-or-resolved Home berth contract: ${JSON.stringify(spawnCamera)}`,
  );

  const launchStructure = await page.evaluate(() => {
    const launch = JSON.parse(window.render_game_to_text()).sites.find(
      (site) => site.id === "launch-ridge",
    );
    if (!launch) throw new Error("Missing Launch Ridge browser fixture.");
    window.placeTerrainRigForAcceptance(launch.x, launch.z + 0.2, 0, 4);
    window.applyRigInput({}, 1000 / 60);
    const rig = JSON.parse(window.render_game_to_text()).activeRig;
    window.selectCamera("chase");
    return {
      launch,
      rig,
      distance: Math.hypot(rig.x - launch.x, rig.z - launch.z),
      camera: window.getCameraResolutionEvidence(),
    };
  });
  assert(
    launchStructure.distance >= 3.04 &&
      launchStructure.camera.behindRig === true &&
      launchStructure.camera.forwardOffset < 0 &&
      launchStructure.camera.pathClear === true &&
      launchStructure.camera.selfIntersecting === false,
    `Launch Ridge structure/camera contract failed: ${JSON.stringify(launchStructure)}`,
  );
  await page.evaluate(() =>
    window.placeTerrainRigForAcceptance(0, 3, Math.PI, 0),
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

  assert(initial.schemaVersion === 7, "Expected v7 save contract");
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

  const steeringStart = await state(page);
  await page.evaluate(() => window.applyRigInput({ accelerate: true }, 900));
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(artifactDirectory, "field-02-front-forward.png"),
    fullPage: true,
  });

  await page.evaluate(() =>
    window.applyRigInput({ accelerate: true, steerLeft: true }, 650),
  );
  const steeringEnd = await state(page);
  let leftHeadingDelta =
    steeringEnd.activeRig.heading - steeringStart.activeRig.heading;
  while (leftHeadingDelta > Math.PI) leftHeadingDelta -= Math.PI * 2;
  while (leftHeadingDelta < -Math.PI) leftHeadingDelta += Math.PI * 2;
  const displacementX = steeringEnd.activeRig.x - steeringStart.activeRig.x;
  const displacementZ = steeringEnd.activeRig.z - steeringStart.activeRig.z;
  const leftwardDisplacement =
    displacementX * -Math.cos(steeringStart.activeRig.heading) +
    displacementZ * Math.sin(steeringStart.activeRig.heading);
  assert(
    leftHeadingDelta < -0.01 && leftwardDisplacement > 0.05,
    `Left input did not turn and move to the rig's left: ${JSON.stringify({
      start: steeringStart.activeRig,
      end: steeringEnd.activeRig,
      leftHeadingDelta,
      leftwardDisplacement,
    })}`,
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

  // Approach the relay on a short, aligned path. This proves the real movement
  // and interaction contract without making acceptance depend on an obstacle-
  // avoidance bot that the product does not claim to provide.
  await page.evaluate((cargo) => {
    window.placeRig(cargo.x, cargo.z + 12, Math.PI);
  }, initial.activity.cargoPosition);
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
  // Use the open west basin lane rather than driving through the authored stilt
  // platform. Collision stays authoritative; this fixture isolates deep-water
  // hover traversal from an unrelated structure impact.
  await page.evaluate(() => window.placeRig(-134, -123, Math.PI));
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
    `Hover traversal changed condition despite infinite fording depth: ${JSON.stringify(
      {
        start: {
          condition: skimmerStart.activeRig.condition,
          x: skimmerStart.activeRig.x,
          z: skimmerStart.activeRig.z,
          y: skimmerStart.activeRig.y,
          diagnostic: skimmerStart.lastDiagnostic,
        },
        end: {
          condition: skimmerRun.activeRig.condition,
          x: skimmerRun.activeRig.x,
          z: skimmerRun.activeRig.z,
          y: skimmerRun.activeRig.y,
          diagnostic: skimmerRun.lastDiagnostic,
        },
      },
    )}`,
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

  await page.waitForFunction(
    () => {
      const raw = localStorage.getItem("rigs-unbound.save.v7");
      if (!raw) return false;
      try {
        const payload = JSON.parse(raw);
        return (
          payload?.state?.cargoRelay?.status === "complete" &&
          window.getPerformanceSnapshot().saveBytes > 0
        );
      } catch {
        return false;
      }
    },
    undefined,
    { timeout: 12_000 },
  );
  const saveMetrics = await page.evaluate(() =>
    window.getPerformanceSnapshot(),
  );
  assert(saveMetrics.saveBytes > 0, "Periodic save size was not measured");
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("rigs-unbound.save.v7")),
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
    const payload = JSON.parse(localStorage.getItem("rigs-unbound.save.v7"));
    if (!payload?.state?.rigs?.["utility-tractor"]) return;
    payload.state.activeRigId = "utility-tractor";
    payload.state.rigs["utility-tractor"].x = -126;
    payload.state.rigs["utility-tractor"].z = -130;
    payload.state.rigs["utility-tractor"].condition = 0;
    localStorage.setItem("rigs-unbound.save.v7", JSON.stringify(payload));
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
    localStorage.getItem("rigs-unbound.save.v7"),
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
      localStorage.setItem("rigs-unbound.save.v7", payload);
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
    desktopMetrics.firstInputReadyMs !== null,
    "First processed input was not measured",
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
          launchStructure,
          standingToFelledTree: cameraTreeFixture,
          hoods: hoodEvidence,
        },
        freshAcquisition,
        firstRung: firstRungEvidence,
        touchFirstRung: touchFirstRungEvidence,
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

  // Chrome can occasionally leave a renderer transport open after every
  // assertion and screenshot has completed. Bound teardown so a successful
  // one-shot acceptance run cannot turn into an unbounded monitor.
  await Promise.race([
    (async () => {
      await context.close();
      await firstRungBrowser?.close();
      await browser.close();
    })(),
    new Promise((resolve) =>
      setTimeout(() => {
        console.warn(
          "Acceptance assertions passed, but Chrome teardown exceeded 5 seconds.",
        );
        resolve();
      }, 5000),
    ),
  ]);
  firstRungBrowser = null;
  browser = null;
  process.exit(0);
})().catch(async (error) => {
  console.error(error);
  if (firstRungBrowser) {
    await Promise.race([
      firstRungBrowser.close(),
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
  }
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

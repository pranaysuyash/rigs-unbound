const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const TARGET_URL =
  process.env.RIGS_PHYSICS_LAB_URL ||
  "http://127.0.0.1:4173/physics-lab.html?acceptance=physics-lab-01";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function snapshot(page) {
  return page.evaluate(() => JSON.parse(window.render_physics_lab_to_text()));
}

(async () => {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  const browser = await chromium.launch({
    channel: "chrome",
    headless: false,
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

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForFunction(
      () => typeof window.render_physics_lab_to_text === "function",
    );
    await page.evaluate(() => window.setPhysicsLabPaused(true));

    assert(
      (await page.title()) === "Rigs Unbound — Physics Lab 01",
      "Unexpected Physics Lab title",
    );
    const initial = await snapshot(page);
    assert(initial.mode === "physics-lab-01", "Wrong laboratory mode");
    assert(
      initial.physics.engine === "Rapier 3D" &&
        initial.physics.engineVersion === "0.19.3",
      `Unexpected dynamics engine: ${JSON.stringify(initial.physics)}`,
    );
    assert(initial.vehicle.wheels.length === 4, "Expected four raycast wheels");
    assert(
      initial.physics.wheelContactCount === 4,
      `Expected a settled chassis: ${JSON.stringify(initial.physics)}`,
    );
    assert(
      initial.render.firstControllableMilliseconds > 0,
      "First-controllable timing was not recorded",
    );

    await page.screenshot({
      path: path.join(artifactDirectory, "physics-lab-01-desktop.png"),
      fullPage: true,
    });

    const forward = JSON.parse(
      await page.evaluate(() =>
        window.applyPhysicsLabIntent({ throttle: 1 }, 1300),
      ),
    );
    assert(
      forward.vehicle.body.position.z > initial.vehicle.body.position.z + 2,
      `Positive throttle did not move along visual local +Z: ${JSON.stringify({
        initial: initial.vehicle.body.position,
        forward: forward.vehicle.body.position,
      })}`,
    );
    assert(
      forward.vehicle.forwardSpeed > 0,
      "Positive throttle reported reverse forward speed",
    );

    const steered = JSON.parse(
      await page.evaluate(() =>
        window.applyPhysicsLabIntent({ throttle: 1, steering: 0.7 }, 800),
      ),
    );
    assert(
      Math.abs(steered.vehicle.steering) > 0.03,
      `Steering did not reach the raycast wheels: ${JSON.stringify(steered.vehicle)}`,
    );
    assert(
      Math.abs(steered.vehicle.body.rotation.y) > 0.01,
      "Steering did not rotate the dynamic chassis",
    );

    await page.evaluate(() => window.resetPhysicsLab());
    let surfaceRun = await snapshot(page);
    const encountered = new Map([[surfaceRun.surface.id, surfaceRun.surface]]);
    for (let index = 0; index < 14 && encountered.size < 4; index += 1) {
      surfaceRun = JSON.parse(
        await page.evaluate(() =>
          window.applyPhysicsLabIntent({ throttle: 1 }, 700),
        ),
      );
      encountered.set(surfaceRun.surface.id, surfaceRun.surface);
    }
    assert(
      encountered.has("asphalt") &&
        encountered.has("gravel") &&
        encountered.has("mud") &&
        encountered.has("ice"),
      `The scripted run did not traverse every surface: ${JSON.stringify([
        ...encountered.keys(),
      ])}`,
    );
    assert(
      encountered.get("ice").frictionSlip <
        encountered.get("mud").frictionSlip &&
        encountered.get("mud").frictionSlip <
          encountered.get("gravel").frictionSlip &&
        encountered.get("gravel").frictionSlip <
          encountered.get("asphalt").frictionSlip,
      `Surface grip profiles are not ordered: ${JSON.stringify([
        ...encountered.values(),
      ])}`,
    );

    const cameraModes = [
      "chase",
      "hood",
      "side",
      "tactical",
      "top-down",
      "survey",
    ];
    for (const mode of cameraModes) {
      const selected = JSON.parse(
        await page.evaluate(
          (cameraMode) => window.selectPhysicsLabCamera(cameraMode),
          mode,
        ),
      );
      assert(
        selected.cameraMode === mode,
        `Physics Lab camera did not select ${mode}`,
      );
      assert(
        (await page.locator("#lab-camera").inputValue()) === mode,
        `Physics Lab selector did not reflect ${mode}`,
      );
    }

    await page.evaluate(() => window.selectPhysicsLabCamera("top-down"));
    await page.screenshot({
      path: path.join(artifactDirectory, "physics-lab-01-top-down.png"),
      fullPage: true,
    });
    const debug = JSON.parse(
      await page.evaluate(() => window.togglePhysicsLabDebug(true)),
    );
    assert(debug.debugGeometry, "Debug geometry did not activate");
    await page.screenshot({
      path: path.join(artifactDirectory, "physics-lab-01-debug.png"),
      fullPage: true,
    });

    await page.locator("#physics-frequency").selectOption("120");
    assert(
      (await snapshot(page)).physicsFrequency === 120,
      "120 Hz laboratory frequency did not apply",
    );

    const reset = JSON.parse(
      await page.evaluate(() => window.resetPhysicsLab()),
    );
    assert(
      Math.abs(
        reset.vehicle.body.position.x - initial.vehicle.body.position.x,
      ) < 0.001 &&
        Math.abs(
          reset.vehicle.body.position.z - initial.vehicle.body.position.z,
        ) < 0.001,
      `Reset did not restore the project-owned capture: ${JSON.stringify({
        initial: initial.vehicle.body.position,
        reset: reset.vehicle.body.position,
      })}`,
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.selectPhysicsLabCamera("chase"));
    await page.screenshot({
      path: path.join(artifactDirectory, "physics-lab-01-narrow.png"),
      fullPage: true,
    });
    const narrow = await page.evaluate(() => {
      const telemetry = document
        .querySelector(".lab-telemetry")
        .getBoundingClientRect();
      const touch = document
        .querySelector(".lab-touch")
        .getBoundingClientRect();
      return {
        telemetryBottom: telemetry.bottom,
        touchTop: touch.top,
        overlap: telemetry.bottom > touch.top,
        canvas: {
          width: document.querySelector("#physics-canvas").clientWidth,
          height: document.querySelector("#physics-canvas").clientHeight,
        },
      };
    });
    assert(
      !narrow.overlap,
      `Narrow controls overlap telemetry: ${JSON.stringify(narrow)}`,
    );
    assert(
      narrow.canvas.width === 390 && narrow.canvas.height === 844,
      `Canvas did not fill the narrow viewport: ${JSON.stringify(narrow)}`,
    );
    assert(
      consoleProblems.length === 0,
      `Physics Lab console problems: ${consoleProblems.join("\n")}`,
    );

    console.log(
      JSON.stringify(
        {
          target: TARGET_URL,
          initial: {
            firstControllableMilliseconds:
              initial.render.firstControllableMilliseconds,
            physicsStepMilliseconds: initial.physics.stepMilliseconds,
            drawCalls: initial.render.drawCalls,
            triangles: initial.render.triangles,
          },
          forward: {
            z: forward.vehicle.body.position.z,
            speedKph: forward.vehicle.forwardSpeed * 3.6,
          },
          surfaces: [...encountered.values()],
          cameraModes,
          narrow,
          consoleProblems,
        },
        null,
        2,
      ),
    );
  } finally {
    await context.close();
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

const fs = require("node:fs");
const path = require("node:path");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 15, label: "box3d lab acceptance" });

const TARGET_URL =
  process.env.RIGS_BOX3D_LAB_URL ||
  "http://127.0.0.1:4173/box3d-lab.html?acceptance=box3d-probe-01";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function snapshot(page) {
  return page.evaluate(() => JSON.parse(window.render_box3d_lab_to_text()));
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
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(
      () => typeof window.render_box3d_lab_to_text === "function",
    );
    await page.evaluate(() => window.setBox3DLabPaused(true));

    assert(
      (await page.title()) === "Rigs Unbound — Box3D Probe 01",
      "Unexpected Box3D probe title",
    );
    const initial = await snapshot(page);
    assert(initial.mode === "box3d-probe-01", "Wrong Box3D probe mode");
    assert(
      initial.controllerFamily === "physical-wheel",
      "Box3D probe did not identify the physical-wheel family",
    );
    assert(
      initial.physics.engine === "Box3D" &&
        initial.physics.engineVersion === "0.1.0 / box3d-wasm 0.2.0",
      `Unexpected dynamics engine: ${JSON.stringify(initial.physics)}`,
    );
    assert(
      initial.vehicle.wheels.length === 4,
      "Expected four physical wheel joints",
    );
    assert(
      initial.physics.wheelContactCount === 4,
      `Expected a settled physical-wheel assembly: ${JSON.stringify(initial.physics)}`,
    );
    assert(
      initial.physics.bodyCount === 13 && initial.physics.colliderCount === 13,
      `Expected eight static bodies plus the five-body rig: ${JSON.stringify(initial.physics)}`,
    );
    assert(
      initial.render.firstControllableMilliseconds > 0,
      "First-controllable timing was not recorded",
    );

    await page.screenshot({
      path: path.join(artifactDirectory, "box3d-probe-01-desktop.png"),
      fullPage: true,
    });

    const forward = JSON.parse(
      await page.evaluate(() =>
        window.applyBox3DLabIntent({ throttle: 1 }, 1400),
      ),
    );
    assert(
      forward.vehicle.body.position.z > initial.vehicle.body.position.z + 2,
      `Positive throttle did not move visual local +Z: ${JSON.stringify({
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
        window.applyBox3DLabIntent({ throttle: 1, steering: 0.65 }, 750),
      ),
    );
    assert(
      Math.abs(steered.vehicle.steering) > 0.03,
      "Semantic steering did not reach the Box3D wheel joints",
    );
    assert(
      Math.abs(steered.vehicle.body.rotation.y) > 0.01,
      "Physical-wheel steering did not rotate the chassis",
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
          (cameraMode) => window.selectBox3DLabCamera(cameraMode),
          mode,
        ),
      );
      assert(selected.cameraMode === mode, `Box3D camera missed ${mode}`);
      assert(
        (await page.locator("#lab-camera").inputValue()) === mode,
        `Box3D selector did not reflect ${mode}`,
      );
    }

    await page.evaluate(() => window.selectBox3DLabCamera("top-down"));
    await page.screenshot({
      path: path.join(artifactDirectory, "box3d-probe-01-top-down.png"),
      fullPage: true,
    });

    const reset = JSON.parse(await page.evaluate(() => window.resetBox3DLab()));
    assert(
      Math.abs(
        reset.vehicle.body.position.x - initial.vehicle.body.position.x,
      ) < 0.003 &&
        Math.abs(
          reset.vehicle.body.position.z - initial.vehicle.body.position.z,
        ) < 0.003,
      `Reset did not restore the complete physical-wheel capture: ${JSON.stringify(
        {
          initial: initial.vehicle.body.position,
          reset: reset.vehicle.body.position,
        },
      )}`,
    );
    assert(
      reset.physics.wheelContactCount === 4,
      "Restored physical wheel assembly lost ground proximity",
    );

    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.selectBox3DLabCamera("chase"));
    await page.screenshot({
      path: path.join(artifactDirectory, "box3d-probe-01-narrow.png"),
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
        overlap: telemetry.bottom > touch.top,
        canvas: {
          width: document.querySelector("#physics-canvas").clientWidth,
          height: document.querySelector("#physics-canvas").clientHeight,
        },
      };
    });
    assert(
      !narrow.overlap,
      `Narrow overlays overlap: ${JSON.stringify(narrow)}`,
    );
    assert(
      narrow.canvas.width === 390 && narrow.canvas.height === 844,
      `Narrow canvas did not fill the viewport: ${JSON.stringify(narrow.canvas)}`,
    );
    assert(
      consoleProblems.length === 0,
      `Box3D probe emitted console problems:\n${consoleProblems.join("\n")}`,
    );

    console.log(
      JSON.stringify(
        {
          target: TARGET_URL,
          engine: initial.physics,
          controllerFamily: initial.controllerFamily,
          firstControllableMilliseconds:
            initial.render.firstControllableMilliseconds,
          forwardDeltaZ:
            forward.vehicle.body.position.z - initial.vehicle.body.position.z,
          steeredHeadingY: steered.vehicle.body.rotation.y,
          cameras: cameraModes,
          narrow,
          consoleProblems,
          screenshots: [
            "docs/reviews/assets/box3d-probe-01-desktop.png",
            "docs/reviews/assets/box3d-probe-01-top-down.png",
            "docs/reviews/assets/box3d-probe-01-narrow.png",
          ],
        },
        null,
        2,
      ),
    );
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/**
 * Open-world ecology browser acceptance.
 *
 * Proves that persistent ecological groups are visible world actors in a fresh
 * player-facing context. It creates no mission, task, route permission, or
 * mutation in an interactive player profile.
 */
const fs = require("node:fs");
const path = require("node:path");

const { chromium, assert, state, teardown } = require("./acceptance-helpers.cjs");
const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({ minutes: 10, label: "open-world ecology acceptance" });

const targetUrl =
  process.env.RIGS_UNBOUND_URL ||
  "http://127.0.0.1:4173/?acceptance=field-02&ecology-proof=1";
const artifactDirectory = path.resolve(__dirname, "../docs/reviews/assets");
const screenshotPath = path.join(
  artifactDirectory,
  "open-world-ecology-browser-acceptance-2026-07-29.png",
);
const evidencePath = path.join(
  artifactDirectory,
  "open-world-ecology-browser-acceptance-2026-07-29.json",
);

async function dismissControlLesson(page) {
  await page.evaluate(() => {
    const controls = [...document.querySelectorAll("button")];
    controls.find((button) => button.textContent?.trim() === "Got it")?.click();
  });
}

async function main() {
  fs.mkdirSync(artifactDirectory, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });

  try {
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForFunction(() => typeof window.render_game_to_text === "function");
    await page.keyboard.press("Space");
    await page.waitForTimeout(450);
    await dismissControlLesson(page);

    const before = await state(page);
    assert(Array.isArray(before.ecology), "Public state must expose ecology actors.");
    assert(before.ecology.length >= 3, "Fresh world must expose the first three ecology groups.");
    assert(
      before.mission === null && before.activeSideMissions.length === 0,
      "Ecology must not create a mission or side mission.",
    );
    const herd = before.ecology.find((actor) => actor.id === "long-furrow-herd");
    assert(herd, "Long Furrow herd must exist in persistent ecology state.");

    await page.evaluate((actor) => {
      window.selectRig("marsh-skimmer");
      window.placeRig(actor.x, actor.z, 0);
      window.selectCamera("survey");
    }, herd);
    await page.evaluate(() => {
      for (let step = 0; step < 10; step += 1) {
        window.applyRigInput(
          { accelerate: true, brake: false, steerLeft: false, steerRight: false },
          180,
        );
      }
    });
    await page.waitForTimeout(1200);

    const observed = await state(page);
    assert(observed.activeRig.id === "marsh-skimmer", "Skimmer must remain player-controlled.");
    assert(
      observed.ecology.some((actor) => actor.id === herd.id),
      "Observed herd must remain world state after moving the player.",
    );
    const displacedHerd = observed.ecology.find((actor) => actor.id === herd.id);
    const displacement = Math.hypot(displacedHerd.x - herd.x, displacedHerd.z - herd.z);
    assert(displacement > 0.1, "Real Skimmer movement must make the nearby herd relocate.");
    assert(
      observed.mission === null && observed.activeSideMissions.length === 0,
      "Approaching ecology must not create a mission or side mission.",
    );
    assert(errors.length === 0, `Browser errors: ${errors.join(" | ")}`);

    await page.screenshot({ path: screenshotPath, fullPage: false });
    const evidence = {
      targetUrl,
      actors: before.ecology,
      observed: {
        activeRig: observed.activeRig,
        mission: observed.mission,
        sideMissionCount: observed.activeSideMissions.length,
        herdPresent: observed.ecology.some((actor) => actor.id === herd.id),
        herdDisplacementMeters: displacement,
      },
      errors,
      note:
        "Screenshot is world-observation evidence, not a final art-composition approval."
    };
    fs.writeFileSync(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`);
    console.log("open-world-ecology-browser-acceptance: PASS");
    console.log(JSON.stringify(evidence, null, 2));
  } finally {
    await context.close();
    await teardown(browser);
  }
}

main().catch((error) => {
  console.error("open-world-ecology-browser-acceptance: FAIL");
  console.error(error.stack || error);
  process.exitCode = 1;
});

/**
 * Weather scene-presence browser acceptance.
 *
 * Proves the weather clock actually reaches the 3D scene rather than only the
 * CSS shell: rain fades the instanced rain cloud in, thickens exp-2 fog above
 * the phase base, and the diegetic terrain hazard readout is populated.
 *
 * Usage: node tools/weather-scene-browser-acceptance.cjs
 * Requires the canonical dev server (tools/start-canonical-dev-server.cjs).
 */
const {
  chromium,
  assert,
  bootstrapAndEnter,
  collectConsole,
  teardown,
} = require("./acceptance-helpers.cjs");

/** Wait until the eased rain scene converges, then snapshot the evidence. */
async function pollSceneConvergence(page) {
  let after = null;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    after = await page.evaluate(() => ({
      phase: JSON.parse(window.render_game_to_text()).weather?.phase,
      scene: window.getWeatherSceneEvidence(),
      hazard: document.querySelector("#terrain-hazard-label")?.textContent,
    }));
    if (after.scene.easedRain > 0.5) break;
    await page.waitForTimeout(150);
  }
  return after;
}

/** Advance until the deterministic weather clock enters the rain/storm window. */
async function advanceToRain(page) {
  let phase = null;
  let attempts = 0;
  while (phase !== "rain" && phase !== "storm" && attempts < 40) {
    const snap = await page.evaluate(() => {
      window.advanceTime(120_000);
      return JSON.parse(window.render_game_to_text());
    });
    phase = snap.weather?.phase ?? null;
    attempts += 1;
  }
  return phase;
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const consoleProblems = collectConsole(page);
  try {
    await bootstrapAndEnter(page);

    const before = await page.evaluate(() => ({
      phase: JSON.parse(window.render_game_to_text()).weather?.phase,
      scene: window.getWeatherSceneEvidence(),
    }));

    const wetPhase = await advanceToRain(page);
    assert(
      wetPhase === "rain" || wetPhase === "storm",
      `Weather clock never reached rain/storm; ended at ${wetPhase}`,
    );

    // The scene evidence is read after easing has converged. The rain cloud
    // fades in over several animation frames, and rAF may be throttled when the
    // Chrome tab is not focused, so poll until it visibly converges instead of
    // guessing a fixed settle delay.
    const after = await pollSceneConvergence(page);

    assert(
      after.scene.rainVisible,
      `Rain cloud should be visible in ${wetPhase}; evidence=${JSON.stringify(after.scene)}`,
    );
    assert(
      after.scene.rainOpacity > 0.2,
      `Rain opacity should be meaningfully above 0; got ${after.scene.rainOpacity}`,
    );
    assert(
      after.scene.easedRain > 0.5,
      `Eased rain should track intensity near 1; got ${after.scene.easedRain}`,
    );
    assert(
      after.scene.fogDensity > after.scene.phaseBaseFogDensity + 0.0005,
      `Fog should thicken above the phase base; base=${after.scene.phaseBaseFogDensity} got=${after.scene.fogDensity}`,
    );
    assert(
      typeof after.hazard === "string" && after.hazard.includes("ground"),
      `Terrain hazard readout missing; got ${after.hazard}`,
    );

    assert(
      consoleProblems.length === 0,
      `Console problems: ${consoleProblems.join(" | ")}`,
    );

    console.log(
      JSON.stringify(
        {
          ok: true,
          before,
          wetPhase,
          after,
        },
        null,
        2,
      ),
    );
  } finally {
    await teardown(context, browser);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

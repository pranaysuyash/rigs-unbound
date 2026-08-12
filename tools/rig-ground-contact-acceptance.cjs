/**
 * Rig ground-contact browser acceptance.
 *
 * Proves that the rig a player sees is touching the ground they see it on, for
 * every rig, at several places on the terrain.
 *
 * ## Why this exists as a browser check
 *
 * Every rig shipped floating. Both ground rigs sat exactly `rideHeight` above
 * the terrain (0.95 m and 0.62 m) and the hover rig 0.63 m above its own
 * shadow, because the models were authored with y = 0 at the ground while the
 * simulation positions their root at the *body origin* — two reasonable frames
 * that differ by exactly the ride height.
 *
 * No unit test could catch it. `rig-blockout.test.ts` proves the authored
 * geometry agrees with `RIG_PROFILES`, but a model can be internally perfect and
 * still be mounted at the wrong height; the bug lived in the relationship
 * between the scene graph and the terrain mesh. This script measures that
 * relationship directly: world-space tyre extents and shadow positions against
 * `world.terrain.height` beneath each.
 *
 * It also samples more than one location, because a flat-ground check would pass
 * on a rig whose contact is right at spawn and wrong on a slope.
 *
 * Usage: node tools/rig-ground-contact-acceptance.cjs
 * Requires the canonical dev server (tools/start-canonical-dev-server.cjs).
 */
const {
  chromium,
  RIG_IDS,
  assert,
  bootstrapAndEnter,
  collectConsole,
  placeRig,
  switchToRig,
  teardown,
} = require("./acceptance-helpers.cjs");

/**
 * Places chosen to vary the terrain under the rig rather than to be scenic.
 * A rig mounted in the wrong frame floats identically everywhere, but a rig
 * whose contact is only correct on the flat spawn pad fails here.
 */
const SAMPLE_PLACES = [
  { label: "spawn-flat", x: 4, z: 6 },
  { label: "north-rise", x: 26, z: -38 },
  { label: "west-fall", x: -44, z: 18 },
];

/** Loose enough for suspension and terrain interpolation, tight enough to catch a frame error. */
const SHADOW_TOLERANCE = 0.25;

async function readGroundContact(page, rigId) {
  return page.evaluate((id) => window.getRigGroundContactEvidence(id), rigId);
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const consoleProblems = collectConsole(page);
  const samples = [];
  try {
    await bootstrapAndEnter(page);

    for (const rigId of RIG_IDS) {
      await switchToRig(page, rigId);

      for (const place of SAMPLE_PLACES) {
        await placeRig(page, place.x, place.z);
        // The suspension settles over several fixed steps; reading immediately
        // after placement measures a rig still falling into its rest height.
        await page.evaluate(() => window.advanceTime(600));
        await page.waitForTimeout(60);

        const evidence = await readGroundContact(page, rigId);
        samples.push({ rigId, place: place.label, evidence });

        const detail = `${rigId} @ ${place.label}: ${JSON.stringify(evidence)}`;

        // The body origin must sit a ride height above the ground. This is the
        // simulation's own contract, checked here so a failure downstream can be
        // attributed to presentation rather than to the traversal model.
        assert(
          Math.abs(
            evidence.bodyOriginY - evidence.terrainY - evidence.rideHeight,
          ) <= 1,
          `Body origin is not near its ride height above terrain — ${detail}`,
        );

        // The cue a player actually reads. A shadow off the surface is the
        // failure mode that shipped, and the one that hid every other float.
        assert(
          Math.abs(evidence.shadowGap) <= SHADOW_TOLERANCE,
          `Blob shadow is ${evidence.shadowGap} m off the terrain — ${detail}`,
        );

        if (evidence.worstWheelContactGap !== null) {
          assert(
            evidence.wheelContactGaps.length === 4,
            `Expected four measured tyres — ${detail}`,
          );
          // Every tyre, not just the worst: a rig can be level and floating, or
          // sitting correctly at one axle and buried at the other.
          for (const [index, gap] of evidence.wheelContactGaps.entries()) {
            assert(
              Math.abs(gap) <= 0.6,
              `Tyre ${index} sits ${gap} m off the terrain — ${detail}`,
            );
          }
        }

        if (evidence.hoverSkirtGap !== null) {
          // A hover skirt is meant to be clear of the ground. It is checked
          // against the cushion it should hold, so "floating" and "riding" stay
          // distinguishable rather than both passing.
          assert(
            evidence.hoverSkirtGap > 0.1 && evidence.hoverSkirtGap < 1.2,
            `Hover skirt gap ${evidence.hoverSkirtGap} m does not read as a cushion — ${detail}`,
          );
        }

        assert(
          evidence.contactsGround,
          `Renderer reports the rig is not contacting ground — ${detail}`,
        );
      }
    }

    assert(
      consoleProblems.length === 0,
      `Console problems: ${consoleProblems.join(" | ")}`,
    );

    console.log(
      JSON.stringify({ ok: true, rigs: RIG_IDS.length, samples }, null, 2),
    );
  } finally {
    await teardown(context, browser);
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exit(1);
});

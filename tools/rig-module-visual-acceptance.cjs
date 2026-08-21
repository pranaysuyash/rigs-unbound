/**
 * Rig module-visual browser acceptance.
 *
 * Proves that a module a player buys is something a player can see: it appears
 * when fitted, hides when not, stands clear of the ground, and does not sit
 * inside the rig or inside another module the same rig can carry.
 *
 * ## Why this exists as a browser check
 *
 * `rig-blockout.test.ts` already proves the derived mount boxes clear the
 * ground, the tyres, each other, and the hood camera. But it is comparing
 * authored numbers with authored numbers: the mounts and the assertions both
 * come out of `RIG_PROFILES` and `RIG_MODULE_FORMS`. Three things live outside
 * that table, and a module can be wrong against any of them while every unit
 * test passes:
 *
 * 1. **The terrain's real height.** The blockout knows a ground-frame offset,
 *    not what `world.terrain.height` returns under this rig at this place.
 * 2. **The form built inside the mount box.** `buildModuleForm` is meant to keep
 *    every dimension a ratio of the mount, but nothing outside the browser
 *    checks that the rendered mesh actually stayed inside it.
 * 3. **Hand-authored superstructure.** The tractor's cab and roof are literals
 *    in `createTractor`. The blockout has never seen them, so it cannot know a
 *    survey mast is inside the cab.
 *
 * It also fits *every* module the rig is offered at once and measures at full
 * steering lock, because the defect this surface was built after was exactly
 * that combination: lug tyres stand ~10 cm proud of the tyre per side, and at
 * full lock that put the tractor's flotation pontoons 6.8 cm inside its own
 * tread bands — on a rig the garage sells both modules to. A one-module,
 * wheels-straight check sees none of it.
 *
 * Usage: node tools/rig-module-visual-acceptance.cjs
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
 * Where the rig stands while the workshop sells it modules.
 *
 * `installModule` refuses outside a workshop service area, so this must be
 * inside Home Silo's (site at 0,12 with `serviceRadius: 15`). 7.2 m out, on the
 * open pad rather than inside the buildings.
 */
const WORKSHOP_PLACE = { x: 4, z: 6 };

/**
 * Total salvage granted before fitting. The six modules cost 40 between them
 * and the workshop repair below costs 6; the surplus means a cost change does
 * not quietly turn this check into a "module refused, nothing rendered, nothing
 * measured, pass".
 */
const SALVAGE_GRANT = 80;

/**
 * Places chosen to vary the ground under the rig, not to be scenic. A module
 * mounted in the wrong vertical frame clips identically everywhere; one whose
 * clearance only holds on the flat spawn pad fails here.
 */
const SAMPLE_PLACES = [
  { label: "spawn-flat", x: 4, z: 6 },
  { label: "north-rise", x: 26, z: -38 },
  { label: "west-fall", x: -44, z: 18 },
];

/**
 * Steering states to measure in. Full lock is the case that matters: the wheel
 * clearance envelope `rig-blockout.ts` derives is a *swept* volume, and the only
 * way to check the sweep against the real rendered transform is to turn the
 * wheels and look.
 */
const STEERING_CASES = [
  { label: "centred", steer: null },
  { label: "full-left", steer: "left" },
  { label: "full-right", steer: "right" },
];

/**
 * How long to hold steering input. `rig.steering` blends toward ±1 at
 * `profile.steeringResponse` per second (4.5 slowest), so 600 ms saturates on
 * every rig with room to spare.
 */
const STEER_HOLD_MS = 600;

/**
 * Minimum steering angle that counts as measuring "at lock", radians.
 *
 * The tractor's maximum is 0.30 and the buggy's 0.48 (`feedback.ts`), so this
 * proves the tractor reached ≥83% of lock and refuses to let a silently
 * un-steered measurement pass as a swept one. It earned its keep immediately:
 * the first run of this script reported zero on every lock case, because the
 * tractor ships *disabled* and a disabled rig ignores steering input entirely.
 */
const LOCK_ANGLE_FLOOR = 0.25;

/**
 * How far a wheel-anchored tread may hang below the tyre it wraps, metres.
 *
 * Derived, from two terms. The lug form reaches `radius * lugReachScale` (1.1)
 * while the tyre's surface is at `radius`, so the real drop is `0.1 * radius`.
 * Then the tyre is a 14-sided cylinder, and the bounding box of a 14-gon is the
 * *inscribed* figure — `cos(pi/14)` = 0.975 of the true circle — so the reading
 * picks up another `0.025 * radius` that is an artefact of measuring a faceted
 * wheel with a box, not clearance the player can see. Together `0.1251 * radius`,
 * which on the tractor's 0.85 m rear tyre — the largest on any rig — is 10.6 cm.
 * Rounded up to the nearest centimetre.
 *
 * Measured against the *tyre* rather than the terrain on purpose: on a slope the
 * ground under the tread's centre is not the ground the tyre rests on, and
 * suspension travel moves the whole wheel, so a terrain-relative bound has to be
 * loosened until it stops meaning anything.
 */
const TREAD_HOST_DROP = 0.11;

/**
 * How far a tread's centre may sit from its tyre's centre, metres.
 *
 * A tread is concentric with its tyre by construction, so this is the check that
 * keeps the structure-overlap exemption honest: treads are exempt from "must not
 * interpenetrate the rig" because a tyre passes under its own fender by design,
 * and this is what still proves the tread is on the wheel rather than loose in
 * the body where it could foul anything at all.
 */
const TREAD_HOST_OFFSET = 0.05;

/**
 * Largest believable distance from body origin to a module's centre, metres.
 *
 * The longest rig is 4.59 m, so every mount centre is inside ~3 m. This catches
 * the failure where a module group is parented wrong and renders at the world
 * origin while the rig drives away from it.
 */
const MAX_MODULE_OFFSET = 6;

/**
 * How deep a hull bolt-on may seat into the chassis it mounts to, metres.
 *
 * Not a defect tolerance — a bolt-on modelled with a visible gap under it reads
 * as a part falling off the machine, so some interpenetration with its mounting
 * face is correct art. The bound exists so that "seated" cannot silently become
 * "swallowed": at 8 cm a module the player paid for is mostly inside the hull.
 * Overlap with any part that is *not* the mounting face fails at any depth.
 *
 * Measured, this bound currently governs an empty population: `deepestSeating` is
 * 0 on all 18 measurements, because `standoffScale` in `RIG_MODULE_FORMS` holds
 * every hull mount box clear of the surface it bolts to, so no module reaches its
 * mounting face at all. That is a real finding about the art, not about this file
 * — the modules read as hovering a few centimetres off the hull, and the fix is
 * a negative standoff on the faces where seating is wanted. Until then this bound
 * is retained and *not* counted as evidence of anything: it would pass unchanged
 * if the seating logic were deleted. `docs/WORKLOG_ADDENDUM_2026-08-12.md` records
 * it as open work.
 */
const SEATING_DEPTH = 0.08;

/**
 * How far a module's geometry may escape the mount box it was built inside, m.
 *
 * Zero, to floating-point noise. This is not a tolerance — it is the contract
 * every other clearance in the blockout rests on. `rig-blockout.test.ts` proves
 * the mount boxes clear the ground, the tyres, each other and the hood camera;
 * all of that is void for a module whose rendered form sticks out of its box.
 * Two did. The pontoon's brackets reached `width * 0.27` outside theirs, which is
 * the 3.4 cm of pontoon-inside-tyre the browser measured at every place and every
 * steering angle, and the survey mast's sensor head reached `depth * 0.25`
 * outside its own, landing 4.1 cm inside the tractor's cab across a 2.2 cm gap
 * that the box itself was clearing correctly.
 */
const ENVELOPE_BREACH = 0.001;

/**
 * How much smaller than authored a module's form may render, as a scale factor.
 *
 * `fitFormToEnvelope` shrinks a form that would escape its mount box, which makes
 * `ENVELOPE_BREACH` above structurally true rather than hopefully true. That clamp
 * must not become a way to author forms carelessly: a module rendering at 0.26 of
 * its intended size is still a defect, just an invisible one, and the mast would
 * have done exactly that. So the guarantee is asserted *and* the need for it is.
 *
 * 0.999 rather than 1: the clamp compares floating-point extents against
 * floating-point half-widths, and a part authored exactly flush with a face can
 * land a few ulps outside it.
 */
const ENVELOPE_FIT_FLOOR = 0.999;

/**
 * Report every measurement and exit 0 without asserting.
 *
 * Bounds in this file are supposed to be derived or measured, and the honest way
 * to set a measured one is to look at the distribution first. `RIGS_SURVEY=1`
 * turns the check into the instrument that produces that distribution, so
 * calibrating a bound never means editing the assertions out and forgetting to
 * put them back.
 */
const SURVEY_ONLY = process.env.RIGS_SURVEY === "1";

/** Every violation this sample commits, as readable lines. Empty means clean. */
function sampleViolations(sample) {
  const problems = [];
  if (sample.anchoredTo === "unknown") {
    problems.push(
      `${sample.label} has no recorded anchor, so its measurements cannot be read`,
    );
  }
  if (sample.worldMin === null || sample.worldMax === null) {
    // Nothing further is measurable, and every check below would read null.
    problems.push(
      `${sample.label} is fitted and visible but draws no geometry`,
    );
    return problems;
  }

  // Checked before anything else, because everything else depends on it. Each
  // mount box was proved clear of the ground, the tyres and the other modules by
  // `rig-blockout.test.ts`; a form that renders outside its box makes every one of
  // those proofs a statement about a volume the module no longer occupies.
  if (
    sample.envelopeBreach !== null &&
    sample.envelopeBreach > ENVELOPE_BREACH
  ) {
    problems.push(
      `${sample.label} renders ${sample.envelopeBreach} m outside its own mount box`,
    );
  }
  // The other half of the same contract: the clamp keeps the rig correct, this
  // keeps the form honest. Without it, every future breach becomes a silent
  // shrink instead of a failure, and the measurement above reads clean forever.
  if (sample.envelopeFit !== null && sample.envelopeFit < ENVELOPE_FIT_FLOOR) {
    problems.push(
      `${sample.label} had to be scaled to ${sample.envelopeFit} to fit its own ` +
        `mount box, so it renders smaller than authored`,
    );
  }

  if (sample.anchoredTo === "wheel") {
    // A tread is judged against the tyre it wraps, not against the rig and not
    // against the terrain. Both of those readings are dominated by things that
    // are correct: the tyre already passes under its own fender, and the lugs
    // already reach below the contact patch by design.
    if (sample.hostGap === null || sample.hostOffset === null) {
      problems.push(
        `${sample.label} is wheel-anchored but no tyre was found to measure it against`,
      );
    } else {
      if (!(sample.hostGap <= 0 && sample.hostGap >= -TREAD_HOST_DROP)) {
        problems.push(
          `${sample.label} hangs ${sample.hostGap} m below its tyre (allowed -${TREAD_HOST_DROP}..0)`,
        );
      }
      if (!(sample.hostOffset <= TREAD_HOST_OFFSET)) {
        problems.push(
          `${sample.label} is ${sample.hostOffset} m off its tyre's centre (limit ${TREAD_HOST_OFFSET})`,
        );
      }
    }
  } else {
    // Hull bolt-ons get the strict reading: clear of the ground, and touching
    // nothing but the face they bolt to.
    if (!(sample.groundGap > 0)) {
      problems.push(
        `${sample.label} sits ${sample.groundGap} m against the terrain`,
      );
    }
    for (const hit of sample.structureOverlaps) {
      if (!hit.mountSurface) {
        problems.push(
          `${sample.label} is ${hit.depth} m inside ${hit.part}, which is not its mounting face`,
        );
      } else if (hit.depth > SEATING_DEPTH) {
        problems.push(
          `${sample.label} is swallowed ${hit.depth} m into ${hit.part} (seating limit ${SEATING_DEPTH})`,
        );
      }
    }
  }

  // Module-vs-module applies to every anchor. This is the pontoon/lug-tread
  // defect, and it was a tread fouling a bolt-on, so exempting either side of
  // that pair would exempt the bug.
  for (const hit of sample.moduleOverlaps) {
    problems.push(`${sample.label} is ${hit.depth} m inside ${hit.module}`);
  }

  if (!(sample.offsetFromRig > 0 && sample.offsetFromRig < MAX_MODULE_OFFSET)) {
    problems.push(
      `${sample.label} is ${sample.offsetFromRig} m from the body origin`,
    );
  }

  return problems;
}

/**
 * Deepest legitimate seating seen, so the bound above stays evidence-backed.
 *
 * Restricted to hull bolt-ons, because `SEATING_DEPTH` only governs those — the
 * wheel branch exempts a tread's structure overlaps entirely. Counting treads here
 * reported 0.483 m against a 0.08 m bound while the check passed, which reads as a
 * bound violated 6× over and is really a statistic measured over a population its
 * bound was never applied to.
 */
function deepestSeating(samples) {
  let deepest = 0;
  for (const sample of samples) {
    if (sample.anchoredTo === "wheel") continue;
    for (const hit of sample.structureOverlaps) {
      if (hit.mountSurface) deepest = Math.max(deepest, hit.depth);
    }
  }
  return Number(deepest.toFixed(4));
}

/** Worst tread-below-tyre drop seen, for the same reason. */
function worstHostGap(samples) {
  const gaps = samples
    .filter((sample) => typeof sample.hostGap === "number")
    .map((sample) => sample.hostGap);
  return gaps.length > 0 ? Math.min(...gaps) : null;
}

/** Worst escape from a mount box seen, which should be zero. */
function worstEnvelopeBreach(samples) {
  const breaches = samples
    .filter((sample) => typeof sample.envelopeBreach === "number")
    .map((sample) => sample.envelopeBreach);
  return breaches.length > 0 ? Math.max(...breaches) : null;
}

/** Hardest shrink the envelope clamp had to apply, which should be 1. */
function worstEnvelopeFit(samples) {
  const fits = samples
    .filter((sample) => typeof sample.envelopeFit === "number")
    .map((sample) => sample.envelopeFit);
  return fits.length > 0 ? Math.min(...fits) : null;
}

async function readModuleVisuals(page, rigId) {
  return page.evaluate((id) => window.getRigModuleVisualEvidence(id), rigId);
}

async function readRig(page, rigId) {
  return page.evaluate((id) => {
    const report = JSON.parse(window.render_game_to_text());
    return report.rigs[id];
  }, rigId);
}

/**
 * Make the active rig driveable, through the workshop the way a player would.
 *
 * Torque ships at condition 0 — the whole opening of the game is reclaiming a
 * derelict — and a disabled rig ignores drive and steer input, so every "at full
 * lock" reading on an unrepaired tractor is silently a reading at centre. The
 * repair is the ordinary paid one bound to `T`, which needs the Home Silo
 * workshop pad in reach and 6 salvage; the free one-time restoration is a
 * narrative beat this check has no business consuming.
 */
async function repairIfDisabled(page, rigId) {
  const before = await readRig(page, rigId);
  if (before.condition > 0)
    return { repaired: false, condition: before.condition };
  await page.keyboard.press("KeyT");
  await page.waitForTimeout(120);
  const after = await readRig(page, rigId);
  assert(
    after.condition >= 99.5,
    `${rigId} is disabled and the workshop repair did not take: condition ${after.condition}`,
  );
  return { repaired: true, condition: after.condition };
}

async function steerToLock(page, direction) {
  await page.evaluate(
    ({ dir, ms }) =>
      window.applyRigInput(
        { steerLeft: dir === "left", steerRight: dir === "right" },
        ms,
      ),
    { dir: direction, ms: STEER_HOLD_MS },
  );
}

async function main() {
  const browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
  });
  const page = await context.newPage();
  const consoleProblems = collectConsole(page);
  const measurements = [];
  try {
    await bootstrapAndEnter(page);

    for (const rigId of RIG_IDS) {
      await switchToRig(page, rigId);

      // Nothing fitted yet. Every group the rig carries must be hidden, which is
      // the half of the contract that a check on fitted modules alone would miss:
      // a module permanently visible from spawn passes every "is it there?" test.
      const baseline = await readModuleVisuals(page, rigId);
      assert(
        baseline.fittedModules.length === 0,
        `${rigId} starts with modules fitted: ${baseline.fittedModules.join(", ")}`,
      );
      assert(
        baseline.visibilityMismatches.length === 0,
        `${rigId} shows an unfitted module: ${baseline.visibilityMismatches.join(" | ")}`,
      );
      for (const sample of baseline.samples) {
        assert(
          !sample.visible,
          `${rigId} renders ${sample.label} before it is bought`,
        );
      }

      if (baseline.offeredModules.length === 0) {
        // The marsh skimmer is sold nothing, and derives no mounts. Recorded
        // rather than skipped: "no modules offered" must stay a measured fact,
        // so a rig that quietly loses its garage listing shows up here.
        assert(
          baseline.samples.length === 0,
          `${rigId} is offered no modules but renders ${baseline.samples.length} module groups`,
        );
        measurements.push({ rigId, offered: [], baselineOnly: true });
        continue;
      }

      // Fit everything, at the workshop, through the real install path.
      await placeRig(page, WORKSHOP_PLACE.x, WORKSHOP_PLACE.z);
      await page.evaluate(
        (amount) => window.grantSalvageForAcceptance(amount),
        SALVAGE_GRANT,
      );
      const repair = await repairIfDisabled(page, rigId);
      for (const moduleId of baseline.offeredModules) {
        const report = await page.evaluate(
          (id) => JSON.parse(window.installRigModule(id)),
          moduleId,
        );
        // The install path refuses silently — it writes a diagnostic and returns.
        // Reading the fitted list back is the only way to know it took.
        assert(
          (report.rigs[rigId].modules ?? []).includes(moduleId),
          `${rigId} refused ${moduleId}: ${report.lastDiagnostic}`,
        );
      }

      const fittedEvidence = await readModuleVisuals(page, rigId);
      assert(
        fittedEvidence.fittedModules.join(",") ===
          [...baseline.offeredModules].sort().join(","),
        `${rigId} fitted ${fittedEvidence.fittedModules.join(",")} of offered ${baseline.offeredModules.join(",")}`,
      );

      // Freeze the world so full lock survives long enough to be measured. The
      // frame loop otherwise steps the simulation with empty input, and steering
      // decays to centre in about a fifth of a second — every "at lock" reading
      // would silently be a reading at centre.
      await page.evaluate(() => window.setAcceptanceManualStepping(true));

      for (const place of SAMPLE_PLACES) {
        for (const steering of STEERING_CASES) {
          await placeRig(page, place.x, place.z);
          // Suspension settles over several fixed steps; measuring straight after
          // placement measures a rig still falling into its rest height.
          await page.evaluate(() => window.advanceTime(600));
          if (steering.steer) await steerToLock(page, steering.steer);

          const evidence = await readModuleVisuals(page, rigId);
          /**
           * Collected rather than thrown. A geometry sweep that stops at the
           * first foul tells you one number and hides the shape of the problem;
           * the pontoon/lug-tread defect looked like one module until all four
           * wheels were measured. Everything found is reported together below.
           */
          const violations = [];

          if (steering.steer === null) {
            if (!(Math.abs(evidence.steeringAngle) < 0.01)) {
              violations.push(`Expected centred wheels`);
            }
          } else {
            const expectedSign = steering.steer === "left" ? 1 : -1;
            if (!(
              Math.abs(evidence.steeringAngle) >= LOCK_ANGLE_FLOOR &&
              Math.sign(evidence.steeringAngle) === expectedSign
            )) {
              violations.push(`Wheels did not reach ${steering.label}`);
            }
          }

          if (evidence.missingVisuals.length > 0) {
            violations.push(
              `Fitted modules render nothing: ${evidence.missingVisuals.join(", ")}`,
            );
          }
          if (evidence.visibilityMismatches.length > 0) {
            violations.push(
              `Module visibility disagrees with what is fitted: ${evidence.visibilityMismatches.join(" | ")}`,
            );
          }
          if (evidence.samples.length === 0) {
            violations.push(`No module geometry measured at all`);
          }

          for (const sample of evidence.samples) {
            if (!sample.visible) {
              violations.push(`${sample.label} is fitted but not visible`);
            }
            violations.push(...sampleViolations(sample));
          }

          measurements.push({
            rigId,
            place: place.label,
            steering: steering.label,
            steeringAngle: evidence.steeringAngle,
            condition: repair.condition,
            repaired: repair.repaired,
            worstGroundGap: Math.min(
              ...evidence.samples.map((sample) => sample.groundGap),
            ),
            worstHostGap: worstHostGap(evidence.samples),
            worstEnvelopeBreach: worstEnvelopeBreach(evidence.samples),
            worstEnvelopeFit: worstEnvelopeFit(evidence.samples),
            deepestSeating: deepestSeating(evidence.samples),
            samples: evidence.samples.length,
            violations,
            // Survey mode keeps the raw rows so a bound can be calibrated from
            // the distribution instead of from a guess.
            ...(SURVEY_ONLY ? { detail: evidence.samples } : {}),
          });
        }
      }

      await page.evaluate(() => window.setAcceptanceManualStepping(false));
    }

    const failures = measurements.flatMap((entry) =>
      (entry.violations ?? []).map(
        (problem) =>
          `${entry.rigId} @ ${entry.place} ${entry.steering}: ${problem}`,
      ),
    );
    if (!SURVEY_ONLY) {
      assert(
        failures.length === 0,
        `${failures.length} module-visual violations:\n  ${failures.join("\n  ")}`,
      );

      assert(
        consoleProblems.length === 0,
        `Console problems: ${consoleProblems.join(" | ")}`,
      );
    }

    console.log(
      JSON.stringify(
        {
          ok: !SURVEY_ONLY,
          survey: SURVEY_ONLY || undefined,
          rigs: RIG_IDS.length,
          failures: SURVEY_ONLY ? failures : undefined,
          measurements,
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

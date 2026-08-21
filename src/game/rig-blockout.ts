/**
 * Rig blockout: the dimensional bridge between a rig's simulated profile and
 * the model a player looks at.
 *
 * ## Why this module exists
 *
 * `RIG_PROFILES` already carries every physical dimension the simulation uses:
 * `track` and `wheelbase` locate the four terrain contacts, `wheelRadius` sets
 * the rolling radius that converts distance into wheel spin, and `rideHeight`
 * is the distance from the contact plane up to the body origin. The renderer
 * used to hand-write its own copies of those numbers as literals, and they
 * drifted — asymmetrically, which is the signature of hand-copied constants:
 *
 *   - the buggy's authored track (2.9) and wheelbase (2.2) matched its profile
 *     exactly, while its authored wheel radius (0.56) was 30% over the 0.43 the
 *     simulation spins it at;
 *   - the tractor's authored footprint matched nothing — 2.72 front and 3.00
 *     rear track against a profile track of 2.6, and a 2.90 wheelbase against a
 *     profile 3.1 — so the wheel a player watched was not the wheel that read
 *     the ground.
 *
 * Nothing detected any of that, because a literal cannot disagree with itself.
 * Deriving the geometry makes the disagreement impossible to express.
 *
 * ## The two vertical frames
 *
 * This is the part that was silently wrong, and it is worth stating precisely
 * because both frames are reasonable and they differ by exactly `rideHeight`.
 *
 *   BODY frame   `RigState.y` is documented as "body origin elevation in world
 *                space", and the traversal model rests it at
 *                `meanContact + rideHeight`. The presentation system assigns
 *                that straight to `parts.root.position.y`, so **root-local
 *                y = 0 is the body origin**, sitting `rideHeight` above ground.
 *
 *   GROUND frame The natural frame to author a vehicle in: y = 0 is the ground
 *                the wheels rest on, so a wheel of radius r has its centre at
 *                y = r, a blob shadow sits at y ≈ 0, and every superstructure
 *                height reads as "metres above the ground".
 *
 * Every rig here was authored in the GROUND frame — wheel pivots at y = radius,
 * blob shadows at y = 0.04 — and then mounted as though it were the BODY frame.
 * The result is a rig floating `rideHeight` above the terrain: 0.95 m for the
 * tractor, 0.62 m for the buggy. It went unnoticed because the two cues that
 * would betray it were both independently degraded — the ground has no texture
 * to parallax against, and the blob shadows have no crisp contact edge.
 *
 * The fix is one offset applied in one place: {@link groundFrameOffsetY}. Models
 * keep their readable GROUND-frame numbers, and the blockout lowers the whole
 * assembly into the BODY frame the runtime expects.
 *
 * ## Derived versus authored
 *
 * The split is deliberate, and it is the whole design of this module:
 *
 *   DERIVED   Anything the simulation also uses: contact positions, the contact
 *             plane, rolling radius, spin rate. These are read from the profile
 *             and may never be restated as a literal.
 *   AUTHORED  Proportions that are pure art direction — how much bigger a
 *             tractor's rear wheels are than its front, how far the hull
 *             overhangs the wheelbase. These are declared as *ratios* in
 *             {@link RIG_SILHOUETTES}, never as absolute dimensions, so a
 *             profile change rescales the whole rig coherently instead of
 *             leaving the art behind.
 *
 * An authored ratio that could contradict the simulation is constrained rather
 * than trusted: per-axle wheel scales must average to 1, which is what makes
 * `profile.wheelRadius` genuinely the mean rolling radius rather than a number
 * the art happens to ignore. `rig-blockout.test.ts` enforces it.
 */

import {
  MODULES,
  RIG_PROFILES,
  WHEEL_LABELS,
  WHEEL_LOCAL_SIGNS,
  type ModuleId,
  type RigId,
  type RigProfile,
} from "./contracts";
import { maximumSteeringAngleFor } from "./feedback";
import { clamp } from "./noise";

/**
 * Dimensions this module needs from a profile.
 *
 * Narrower than `RigProfile` on purpose, so the blockout can be exercised
 * against a synthetic profile in tests without constructing a whole rig.
 */
export type RigBlockoutProfile = Pick<
  RigProfile,
  | "id"
  | "mobilityAdapter"
  | "track"
  | "wheelbase"
  | "wheelRadius"
  | "rideHeight"
  | "suspensionTravel"
>;

/**
 * Art-directed proportions, expressed only as multiples of profile dimensions.
 *
 * Every field is a ratio. That is the constraint that keeps the art honest: a
 * ratio cannot silently disagree with the simulation the way an absolute
 * dimension can, and re-tuning a profile rescales the silhouette with it.
 */
export interface RigSilhouette {
  /**
   * Front and rear wheel radius as multiples of `profile.wheelRadius`.
   *
   * A tractor's oversized rear wheels are its most recognisable feature, so
   * this exists to keep that silhouette while `wheelRadius` stays the single
   * simulated truth. The pair must average to 1 — see the module docblock.
   */
  readonly frontWheelScale: number;
  readonly rearWheelScale: number;
  /** Tyre width as a multiple of that wheel's own radius. */
  readonly tyreWidthScale: number;
  /** Hull width as a multiple of `track`. Below 1 keeps the wheels proud. */
  readonly hullWidthScale: number;
  /** Hull length as a multiple of `wheelbase`. Above 1 gives nose/tail overhang. */
  readonly hullLengthScale: number;
  /** Hull thickness as a multiple of `rideHeight`. */
  readonly hullThicknessScale: number;
}

/**
 * One wheel's placement, in the BODY frame, ready to hand to a scene graph.
 *
 * Indexed to match `WHEEL_LOCAL_SIGNS`, so `mounts[i]` is the visible wheel for
 * the simulation's wheel `i` — the invariant whose absence caused the drift.
 */
export interface RigWheelMount {
  /** Simulation wheel index: 0 FL, 1 FR, 2 RL, 3 RR. */
  readonly index: number;
  readonly label: (typeof WHEEL_LABELS)[number];
  /** Lateral offset, `±track / 2`. Exactly where the terrain is sampled. */
  readonly x: number;
  /** Longitudinal offset, `±wheelbase / 2`. Positive is forward. */
  readonly z: number;
  readonly radius: number;
  readonly width: number;
  /**
   * Mount height in the GROUND frame, i.e. equal to `radius`, so the tyre's
   * lowest point touches y = 0. The presentation system writes suspension
   * travel relative to this, so it stays in the frame models are authored in.
   */
  readonly restY: number;
  /** True for the steered axle (the front pair). */
  readonly steers: boolean;
  /**
   * Multiplier turning the kernel's single `wheelRotation` into this wheel's
   * true rotation.
   *
   * The kernel integrates `distance / profile.wheelRadius` once for the whole
   * rig. Rolling without slip means angle is `distance / r`, so a wheel of
   * radius `r` turns `wheelRadius / r` times as far as that reference. Without
   * this, differently-sized wheels all spin at the reference rate and visibly
   * skid — the tractor's 1.05 m rear wheels were turning as though they were
   * 0.72 m, about 46% too fast for their size.
   */
  readonly spinScale: number;
  /**
   * How far this wheel turns at full lock, radians. Zero for a fixed axle.
   *
   * Read from `feedback.ts`, which owns the number the animation actually
   * applies, so the volume this wheel sweeps cannot disagree with the volume it
   * visibly sweeps.
   */
  readonly steerLimit: number;
  /**
   * Standing extents of this wheel with the widest tread the garage sells for
   * it already fitted — see {@link LUG_TREAD_FORM}.
   *
   * `radius` and `width` describe the stock tyre and are what the tyre mesh is
   * built from. These are what anything *beside* the wheel has to clear, because
   * a player can bolt lug tyres on at any time and the pontoons do not move when
   * they do.
   */
  readonly treadHalfWidth: number;
  readonly treadRadius: number;
  /**
   * The widest this wheel ever gets: {@link treadHalfWidth} / {@link treadRadius}
   * projected across the whole steering range, not just at centre.
   *
   * A tyre is a cylinder lying on the X axis, so at rest its footprint is
   * `width / 2` across and `radius` deep. Turned, it rotates about its own
   * vertical axis and both extents grow: the buggy's front wheel reaches 40 cm
   * outboard of its hub at full lock against 23 cm straight ahead. Anything
   * bolted beside a steered wheel has to clear the swept figure, not the
   * standing one.
   *
   * Named for the job rather than for the geometry on purpose. A field called
   * `sweptHalfWidth` reads like a property of the tyre, and the first thing that
   * happened when it was one was that the *stock* sweep got used as a clearance
   * bound — which put the tractor's pontoons 6.8 cm inside its own lug treads.
   * This name has only one legitimate use.
   */
  readonly clearanceHalfWidth: number;
  readonly clearanceHalfDepth: number;
}

/**
 * A hover rig's lift skirt, in the GROUND frame.
 *
 * Only two facts about a skirt are coupled to the simulation, and both are the
 * ones that were wrong: its bottom edge is the air gap the adapter holds, and
 * its top meets the hull's underside. Everything else about a skirt — how far
 * it flares past the deck, how many segments it has — is art.
 */
export interface RigHoverSkirt {
  readonly height: number;
  readonly centreY: number;
}

/**
 * Which face of the hull a bought module hangs off.
 *
 * This enum exists so that the one number a module's placement genuinely cares
 * about is *derived* rather than authored. "Bolt a skid plate under the frame"
 * is a fact about `hull.bottomY`; writing `y: 0.49` instead would be a literal
 * that silently stops meaning "under the frame" the moment a profile is retuned
 * — which is exactly the failure this whole module was created to remove.
 *
 * So each anchor derives one axis from the hull (or from the wheels, for
 * `outboard`) and leaves the rest to authored ratios.
 */
export type RigModuleAnchor =
  /** Ahead of the hull's front face, bottom flush with the hull's underside. */
  | "nose"
  /** Standing on the hull's upper face. */
  | "hull-top"
  /** A mirrored pair, clear of the widest thing the rig owns — hull or tyre. */
  | "outboard"
  /** Hanging below the hull's lower face. */
  | "underbody";

/**
 * Art-directed proportions for one module's visual, as ratios only.
 *
 * Same discipline as {@link RigSilhouette}: no absolute dimension appears here,
 * so a module reads at the same relative size on a 2.2 m buggy and a 3.1 m
 * tractor without a per-rig table.
 */
export interface RigModuleForm {
  readonly anchor: RigModuleAnchor;
  /** Extent along X as a multiple of `hull.width`. */
  readonly widthScale: number;
  /** Extent along Y as a multiple of `hull.height`. */
  readonly heightScale: number;
  /** Extent along Z as a multiple of `hull.depth`. */
  readonly depthScale: number;
  /**
   * Longitudinal centre as a multiple of `hull.depth`; 0 is the hull's centre
   * and positive is forward. Ignored by `nose`, whose z is the hull's front
   * face — the one place a module's longitudinal position is not art direction.
   */
  readonly zCentreScale: number;
  /**
   * How far the module stands off its anchor face, as a multiple of
   * `hull.height`. Zero means flush, which is right for a bolted plate and
   * wrong for a bumper winch.
   */
  readonly standoffScale: number;
}

/**
 * One module's placement on one rig, in the GROUND frame, as an axis-aligned box.
 *
 * A box rather than a mesh description on purpose: the box is the part the
 * simulation's dimensions determine, so it is the part that can be tested. What
 * goes inside it — a drum, a lattice mast, a pontoon's taper — is form, and form
 * is the renderer's business.
 */
export interface RigModuleMount {
  readonly moduleId: ModuleId;
  /** `"single"`, or which half of a mirrored pair this is. */
  readonly slot: "single" | "left" | "right";
  readonly anchor: RigModuleAnchor;
  readonly x: number;
  /** Centre height in the GROUND frame. */
  readonly y: number;
  readonly z: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

/**
 * Modules whose visual belongs to a wheel rather than to the hull.
 *
 * Listed rather than left implicit so that `rig-blockout.test.ts` can assert
 * every buyable module is accounted for. When this file was written, five of the
 * six modules in `MODULES` had no visual at all — including `winch`, which is
 * `SECOND_RUNG_RECOMMENDED_MODULE` and grants a capability — so the progression's
 * only visible feedback stopped after the first purchase. A completeness test is
 * the thing that would have caught that, and is the reason this constant exists
 * instead of a comment.
 */
export const WHEEL_MOUNTED_MODULE_IDS: readonly ModuleId[] = ["lug-tires"];

/**
 * One solid volume of a rig's hand-authored bodywork, in the GROUND frame.
 *
 * Not art — the *space art occupies*. A cab, a hood, a roll bar, a roof: the parts
 * a bolt-on module must not be placed inside. The blockout could always derive a
 * hull box and a wheel box, and it placed every module against those; it had never
 * seen the cab, because the cab was a literal in `createTractor`. So the survey
 * mast's `zCentreScale` was hand-tuned until the mast looked clear of a box the
 * derivation could not measure, and the browser then found it 4.1 cm inside that
 * cab — a class of collision no unit test could see, because the model being
 * tested did not contain the colliding object.
 *
 * Resolved metres, produced from {@link RigSuperstructureForm} by
 * {@link resolveSuperstructure}. `label` is for the acceptance failure message:
 * naming the volume is what turns "0.045 m inside BoxGeometry@0.00,2.70,-1.05" into
 * a sentence that says which part of the rig is in the way.
 */
export interface RigSuperstructureVolume {
  readonly label: string;
  /** Centre in the GROUND frame. */
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly width: number;
  readonly height: number;
  readonly depth: number;
}

/**
 * One bodywork volume as authored: every dimension a ratio of the hull.
 *
 * Ratios for the reason the module docblock gives — "never as absolute
 * dimensions, so a profile change rescales the whole rig coherently instead of
 * leaving the art behind". The first draft of this type held metres lifted straight
 * from the renderer, and `rig-blockout.test.ts`'s doubling test caught it inside a
 * minute: a rig whose profile doubled kept its old cab, so the module standing on
 * that cab moved by 1.27× while everything around it moved by 2.
 *
 * `yAboveTopScale` is measured up from the hull's top face rather than from the
 * ground, because that is what bodywork sits on. A cab authored from y = 0 would
 * dive into a hull that got thicker.
 */
export interface RigSuperstructureForm {
  readonly label: string;
  /** Lateral centre, × hull width. 0 for everything authored so far. */
  readonly xScale: number;
  /** Centre height above the hull's top face, × hull height. */
  readonly yAboveTopScale: number;
  /** Longitudinal centre, × hull depth. */
  readonly zScale: number;
  readonly widthScale: number;
  readonly heightScale: number;
  readonly depthScale: number;
}

export interface RigBlockout {
  readonly id: RigId;
  readonly profile: RigBlockoutProfile;
  readonly silhouette: RigSilhouette;
  /**
   * Offset to lower a GROUND-frame assembly into the BODY frame the runtime
   * mounts. Always `-rideHeight`; see the module docblock.
   */
  readonly groundFrameOffsetY: number;
  /** Contact plane expressed in the BODY frame. The negation of `rideHeight`. */
  readonly contactPlaneY: number;
  /** Empty for hover rigs, which own no wheels the simulation would spin. */
  readonly wheelMounts: readonly RigWheelMount[];
  readonly hull: {
    readonly width: number;
    readonly height: number;
    readonly depth: number;
    /** Hull centre height in the GROUND frame. */
    readonly centreY: number;
    /**
     * Hull underside and upper face in the GROUND frame.
     *
     * Exposed rather than left as `centreY ± height / 2` for callers to redo,
     * because by the time module mounts, the hover skirt, and the asset envelope
     * all needed them, that expression had been written out five times. Five
     * copies of a frame conversion is how the original drift started.
     */
    readonly bottomY: number;
    readonly topY: number;
  };
  /**
   * Where each module the player can buy for *this* rig attaches.
   *
   * Empty when no module in `MODULES` lists this rig in `fits` — which is why
   * the hover skimmer needs no special case here. Wheel-mounted modules
   * (see {@link WHEEL_MOUNTED_MODULE_IDS}) are absent by design: their placement
   * derives from a `RigWheelMount`, not from the hull.
   */
  readonly moduleMounts: readonly RigModuleMount[];
  /**
   * The rig's own bodywork, as volumes a module must not be placed inside.
   *
   * Authored per rig in {@link RIG_SUPERSTRUCTURES} rather than derived, because a
   * cab's shape is a design decision and not a function of the wheelbase. What is
   * derived is where a module goes *given* these — which is the half that used to
   * be a hand-tuned constant, and the half that was wrong.
   */
  readonly superstructure: readonly RigSuperstructureVolume[];
  /**
   * Ground clearance under a hover rig's skirt, in the GROUND frame.
   *
   * Derived from `suspensionTravel`, which for a hover adapter describes the
   * air cushion's compliance — the closest thing the profile has to "how far
   * this rig floats". Zero for ground rigs, whose tyres are the contact.
   */
  readonly hoverClearance: number;
  /** Null for ground rigs, which lift on tyres rather than a cushion. */
  readonly hoverSkirt: RigHoverSkirt | null;
  /**
   * Where a ground decal — a blob shadow, a contact scorch — belongs in the
   * GROUND frame: on the ground, lifted just enough to beat depth precision.
   *
   * This is a one-line field for a reason. The blob shadow is the single cue a
   * player reads to judge whether a rig is touching the terrain, and every rig
   * had its own literal for it; the hover rig's was the one that disagreed, and
   * a floating shadow is invisible as a bug precisely because a shadow is what
   * you would use to notice floating.
   */
  readonly shadowY: number;
}

/**
 * How far a ground decal is lifted off the contact plane.
 *
 * Large enough to survive depth-buffer precision at the far end of the draw
 * distance, small enough to read as contact rather than hover.
 */
export const GROUND_DECAL_LIFT = 0.04;

/**
 * Authored silhouettes.
 *
 * Ratios were chosen to preserve each rig's recognisable shape while bringing
 * the wheels back onto the profile. Two deliberate departures from what was
 * previously drawn, both following the 2026-08-01 visual audit, which called
 * out "oversized" wheels on both ground rigs:
 *
 *   - the buggy's wheels were a flat 1.30× its profile radius, with no design
 *     reason; they are now 1.0, so what is drawn is what is simulated.
 *   - the tractor kept its front/rear differential — it is the feature the same
 *     audit praised as reading "as designed rather than assembled" — but the
 *     pair now averages to 1 rather than to 1.16, so the mean rolling radius is
 *     honestly `wheelRadius`.
 */
export const RIG_SILHOUETTES: Readonly<Record<RigId, RigSilhouette>> = {
  "utility-tractor": {
    // A working tractor's drive wheels dwarf its steering wheels. 0.82/1.18
    // averages to 1 while keeping a 1.44:1 rear-to-front ratio.
    frontWheelScale: 0.82,
    rearWheelScale: 1.18,
    tyreWidthScale: 0.92,
    hullWidthScale: 0.96,
    hullLengthScale: 1.48,
    hullThicknessScale: 0.74,
  },
  "toy-buggy": {
    frontWheelScale: 1,
    rearWheelScale: 1,
    tyreWidthScale: 1.07,
    hullWidthScale: 0.83,
    hullLengthScale: 1.55,
    hullThicknessScale: 0.68,
  },
  "marsh-skimmer": {
    // A hover rig draws no wheels, so these scales only describe the footprint
    // its pontoons and skirt occupy. Kept at 1 so the deck reads at the same
    // width the adapter's footprint declares.
    frontWheelScale: 1,
    rearWheelScale: 1,
    tyreWidthScale: 1,
    hullWidthScale: 1.12,
    hullLengthScale: 1.6,
    hullThicknessScale: 0.31,
  },
  "heavy-utility-tow-recovery-01": {
    frontWheelScale: 0.9,
    rearWheelScale: 1.1,
    tyreWidthScale: 1.0,
    hullWidthScale: 1.05,
    hullLengthScale: 1.4,
    hullThicknessScale: 0.7,
  },
  "heavy-salvage-crane-02": {
    frontWheelScale: 0.95,
    rearWheelScale: 1.05,
    tyreWidthScale: 1.1,
    hullWidthScale: 1.1,
    hullLengthScale: 1.5,
    hullThicknessScale: 0.8,
  },
  "snow-crawler-expedition-01": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.2,
    hullWidthScale: 1.0,
    hullLengthScale: 1.45,
    hullThicknessScale: 0.75,
  },
  "harvester-combined-cultivator-01": {
    frontWheelScale: 0.75,
    rearWheelScale: 1.25,
    tyreWidthScale: 1.05,
    hullWidthScale: 1.15,
    hullLengthScale: 1.35,
    hullThicknessScale: 0.8,
  },
  "sentinel-mobile-fort-01": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.3,
    hullWidthScale: 1.2,
    hullLengthScale: 1.6,
    hullThicknessScale: 0.85,
  },
  "aero-skimmer-survey-01": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.0,
    hullWidthScale: 1.0,
    hullLengthScale: 1.4,
    hullThicknessScale: 0.35,
  },
  "aero-cargo-freighter-02": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.0,
    hullWidthScale: 1.25,
    hullLengthScale: 1.5,
    hullThicknessScale: 0.4,
  },
  "torque-field-cutter-02": {
    frontWheelScale: 0.85,
    rearWheelScale: 1.15,
    tyreWidthScale: 1.1,
    hullWidthScale: 1.0,
    hullLengthScale: 1.4,
    hullThicknessScale: 0.72,
  },
  "spark-dune-runner-02": {
    frontWheelScale: 0.95,
    rearWheelScale: 1.05,
    tyreWidthScale: 1.15,
    hullWidthScale: 0.85,
    hullLengthScale: 1.5,
    hullThicknessScale: 0.65,
  },
  "marsh-dredger-heavy-02": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.0,
    hullWidthScale: 1.2,
    hullLengthScale: 1.55,
    hullThicknessScale: 0.38,
  },
  "hauler-road-train-01": {
    frontWheelScale: 0.95,
    rearWheelScale: 1.05,
    tyreWidthScale: 0.98,
    hullWidthScale: 0.98,
    hullLengthScale: 1.6,
    hullThicknessScale: 0.75,
  },
  "construction-excavator-01": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.25,
    hullWidthScale: 1.1,
    hullLengthScale: 1.4,
    hullThicknessScale: 0.82,
  },
  "micro-scout-pipe-crawler-01": {
    frontWheelScale: 1.0,
    rearWheelScale: 1.0,
    tyreWidthScale: 1.1,
    hullWidthScale: 0.9,
    hullLengthScale: 1.3,
    hullThicknessScale: 0.6,
  },
} as const;

/** Mean of the two axle scales. Must be 1 for `wheelRadius` to mean anything. */
export function meanAxleScale(silhouette: RigSilhouette): number {
  return (silhouette.frontWheelScale + silhouette.rearWheelScale) / 2;
}

/**
 * Each rig's bodywork, as the volumes a bolt-on module must stay out of.
 *
 * Ratios of the derived hull, for the reason the module docblock gives about every
 * other authored number in this file. The shapes themselves came verbatim from the
 * three rig builders in `renderer.ts`, which is what makes this a refactor rather
 * than a redesign, but they arrived as absolute metres and had to be divided through
 * by the canonical hull to become authorable. Two bugs came out of that conversion,
 * both worth naming because both were invisible to a green test suite:
 *
 *   1. Metres pinned the cab while the hull scaled. `rig-blockout.test.ts`'s
 *      doubling test caught it in one run — a rig whose profile doubled kept its old
 *      cab, so a module standing on that cab moved 1.27× while the rig moved 2×.
 *   2. The first fix scaled the metres by `profile.rideHeight` ratios *and* added
 *      `rideHeight` back on top, which is a third vertical frame that exists
 *      nowhere. It passed every test, because a doubling test asks whether geometry
 *      scales proportionally, not whether it lands in the right place: the tractor's
 *      cab sat at y = 3.65 with the hull's top face at 1.30, a 1.15 m gap under a
 *      cab that is supposed to be bolted down. Proportional and wrong.
 *
 * Hence `yAboveTopScale`: measured up from the hull's top face, which is the surface
 * bodywork actually rests on, so there is no frame left to get wrong. `xScale` and
 * `zScale` are plain hull fractions because the hull is centred on both.
 *
 * Only *solid* volumes belong here. Glass, lenses, beacons and exhaust stacks are
 * omitted: a mast passing near an exhaust pipe is a near miss a player will never
 * notice, while a mast inside the cab is a hole in the rig. Listing every mesh
 * would make the derivation refuse placements that are visually fine, and the
 * measured surface in `renderer.ts` already checks the rendered result against
 * every mesh regardless of what is listed here.
 */
export const RIG_SUPERSTRUCTURES: Readonly<
  Record<RigId, readonly RigSuperstructureForm[]>
> = {
  "utility-tractor": [
    {
      label: "hood",
      xScale: 0,
      yAboveTopScale: 0.63798,
      zScale: 0.261552,
      widthScale: 0.841346,
      heightScale: 1.991465,
      depthScale: 0.566696,
    },
    {
      label: "cab",
      xScale: 0,
      yAboveTopScale: 1.989331,
      zScale: -0.228858,
      widthScale: 0.961538,
      heightScale: 3.41394,
      depthScale: 0.457716,
    },
    {
      label: "roof",
      xScale: 0,
      yAboveTopScale: 3.909673,
      zScale: -0.228858,
      widthScale: 1.161859,
      heightScale: 0.312945,
      depthScale: 0.5449,
    },
  ],
  "toy-buggy": [
    {
      label: "nose",
      xScale: 0,
      yAboveTopScale: 0.282732,
      zScale: 0.337243,
      widthScale: 0.893228,
      heightScale: 1.470588,
      depthScale: 0.410557,
    },
    {
      label: "cockpit",
      xScale: 0,
      yAboveTopScale: 0.757116,
      zScale: -0.16129,
      widthScale: 0.706273,
      heightScale: 1.42315,
      depthScale: 0.395894,
    },
    // The roll bar is a half-torus of major radius 0.85 and tube 0.1, so it sweeps
    // 1.9 across and 0.95 up from its centre, in a 0.2-deep band. Boxed here
    // because what matters is the space it denies, not its curvature.
    {
      label: "roll bar",
      xScale: 0,
      yAboveTopScale: 2.713947,
      zScale: -0.205279,
      widthScale: 0.789364,
      heightScale: 2.253321,
      depthScale: 0.058651,
    },
  ],
  "marsh-skimmer": [
    {
      label: "cabin",
      xScale: 0,
      yAboveTopScale: 1.507168,
      zScale: 0.068359,
      widthScale: 0.643382,
      heightScale: 2.986858,
      depthScale: 0.410156,
    },
    {
      label: "roof",
      xScale: 0,
      yAboveTopScale: 3.203704,
      zScale: 0.054687,
      widthScale: 0.735294,
      heightScale: 0.430108,
      depthScale: 0.458984,
    },
    // The prow is a 4-sided cone laid along z and spun 45°, so its square
    // cross-section presents corner-to-corner: 1.82 half-diagonal each way. That
    // makes `heightScale` 8.7 — the hull plate is only 0.42 m thick on this rig, so
    // a 3.64 m volume is a large multiple of it. Not a typo; the skimmer is a hull
    // with a very tall nose.
    {
      label: "prow",
      xScale: 0,
      yAboveTopScale: -0.022103,
      zScale: 0.595703,
      widthScale: 0.955882,
      heightScale: 8.69773,
      depthScale: 0.410156,
    },
  ],
  "heavy-utility-tow-recovery-01": [
    {
      label: "cab",
      xScale: 0,
      yAboveTopScale: 1.5,
      zScale: 0.25,
      widthScale: 0.95,
      heightScale: 3.0,
      depthScale: 0.45,
    },
    {
      label: "boom",
      xScale: 0,
      yAboveTopScale: 1.1,
      zScale: -0.3,
      widthScale: 0.7,
      heightScale: 2.2,
      depthScale: 0.5,
    },
  ],
  "heavy-salvage-crane-02": [
    {
      label: "cab",
      xScale: 0,
      yAboveTopScale: 1.6,
      zScale: 0.35,
      widthScale: 0.9,
      heightScale: 3.2,
      depthScale: 0.35,
    },
    {
      label: "crane house",
      xScale: 0,
      yAboveTopScale: 1.75,
      zScale: -0.1,
      widthScale: 0.85,
      heightScale: 3.5,
      depthScale: 0.55,
    },
  ],
  "snow-crawler-expedition-01": [
    {
      label: "cabin",
      xScale: 0,
      yAboveTopScale: 1.4,
      zScale: 0.0,
      widthScale: 0.88,
      heightScale: 2.8,
      depthScale: 0.6,
    },
  ],
  "harvester-combined-cultivator-01": [
    {
      label: "cab",
      xScale: 0.25,
      yAboveTopScale: 1.6,
      zScale: 0.2,
      widthScale: 0.45,
      heightScale: 3.2,
      depthScale: 0.4,
    },
    {
      label: "grain tank",
      xScale: 0,
      yAboveTopScale: 1.3,
      zScale: -0.15,
      widthScale: 0.9,
      heightScale: 2.6,
      depthScale: 0.5,
    },
  ],
  "sentinel-mobile-fort-01": [
    {
      label: "fortress hull",
      xScale: 0,
      yAboveTopScale: 1.25,
      zScale: 0,
      widthScale: 0.95,
      heightScale: 2.5,
      depthScale: 0.8,
    },
    {
      label: "command bridge",
      xScale: 0,
      yAboveTopScale: 1.0,
      zScale: 0.1,
      widthScale: 0.7,
      heightScale: 2.0,
      depthScale: 0.4,
    },
  ],
  "aero-skimmer-survey-01": [
    {
      label: "cockpit",
      xScale: 0,
      yAboveTopScale: 1.2,
      zScale: 0.15,
      widthScale: 0.6,
      heightScale: 2.4,
      depthScale: 0.45,
    },
  ],
  "aero-cargo-freighter-02": [
    {
      label: "deck house",
      xScale: 0,
      yAboveTopScale: 1.3,
      zScale: 0.2,
      widthScale: 0.7,
      heightScale: 2.6,
      depthScale: 0.35,
    },
    {
      label: "cargo bay",
      xScale: 0,
      yAboveTopScale: 1.0,
      zScale: -0.1,
      widthScale: 0.9,
      heightScale: 2.0,
      depthScale: 0.55,
    },
  ],
  "torque-field-cutter-02": [
    {
      label: "hood",
      xScale: 0,
      yAboveTopScale: 1.0,
      zScale: 0.26,
      widthScale: 0.85,
      heightScale: 2.0,
      depthScale: 0.55,
    },
    {
      label: "cab",
      xScale: 0,
      yAboveTopScale: 1.7,
      zScale: -0.22,
      widthScale: 0.96,
      heightScale: 3.4,
      depthScale: 0.46,
    },
  ],
  "spark-dune-runner-02": [
    {
      label: "cockpit",
      xScale: 0,
      yAboveTopScale: 0.75,
      zScale: -0.1,
      widthScale: 0.72,
      heightScale: 1.5,
      depthScale: 0.4,
    },
    {
      label: "roll cage",
      xScale: 0,
      yAboveTopScale: 1.1,
      zScale: -0.15,
      widthScale: 0.8,
      heightScale: 2.2,
      depthScale: 0.5,
    },
  ],
  "marsh-dredger-heavy-02": [
    {
      label: "control cabin",
      xScale: 0,
      yAboveTopScale: 1.4,
      zScale: 0.1,
      widthScale: 0.65,
      heightScale: 2.8,
      depthScale: 0.4,
    },
  ],
  "hauler-road-train-01": [
    {
      label: "sleeper cab",
      xScale: 0,
      yAboveTopScale: 1.8,
      zScale: 0.3,
      widthScale: 0.92,
      heightScale: 3.6,
      depthScale: 0.42,
    },
  ],
  "construction-excavator-01": [
    {
      label: "operator cab",
      xScale: -0.3,
      yAboveTopScale: 1.5,
      zScale: 0.1,
      widthScale: 0.35,
      heightScale: 3.0,
      depthScale: 0.45,
    },
    {
      label: "engine housing",
      xScale: 0.1,
      yAboveTopScale: 1.2,
      zScale: -0.2,
      widthScale: 0.7,
      heightScale: 2.4,
      depthScale: 0.5,
    },
  ],
  "micro-scout-pipe-crawler-01": [
    {
      label: "sensor shell",
      xScale: 0,
      yAboveTopScale: 0.6,
      zScale: 0,
      widthScale: 0.8,
      heightScale: 1.2,
      depthScale: 0.6,
    },
  ],
} as const;

/**
 * Turn authored bodywork ratios into GROUND-frame metres against a real hull.
 *
 * The whole conversion is six multiplications, and it exists as a named function
 * anyway, because the vertical one is the one that was wrong twice. Writing
 * `hull.topY + yAboveTopScale * hull.height` in exactly one place is what makes the
 * frame a property of this module rather than a convention every caller has to
 * remember.
 */
export function resolveSuperstructure(
  forms: readonly RigSuperstructureForm[],
  hull: { width: number; height: number; depth: number; topY: number },
): readonly RigSuperstructureVolume[] {
  return forms.map((form) => ({
    label: form.label,
    x: form.xScale * hull.width,
    y: hull.topY + form.yAboveTopScale * hull.height,
    z: form.zScale * hull.depth,
    width: form.widthScale * hull.width,
    height: form.heightScale * hull.height,
    depth: form.depthScale * hull.depth,
  }));
}

/**
 * Largest projection of a rotated half-extent pair onto one axis.
 *
 * A box with half-extents `halfAlong` (on the axis of interest) and `halfAcross`
 * (perpendicular), yawed by θ, projects to `halfAlong·cos θ + halfAcross·sin θ`.
 * That peaks at `atan2(halfAcross, halfAlong)` and is clamped to the steering
 * limit, since the wheel cannot turn further than the steering does.
 *
 * The clamp is not decoration. For both shipped rigs the peak happens to lie just
 * beyond full lock, so evaluating at the limit is currently the same answer — but
 * that is a coincidence of the current tuning, and a wider steering limit would
 * make evaluating at the limit an *under*-estimate of the swept volume, which is
 * the direction that lets a collision through.
 */
function sweptHalfExtent(
  halfAlong: number,
  halfAcross: number,
  steerLimit: number,
): number {
  const peak = Math.min(steerLimit, Math.atan2(halfAcross, halfAlong));
  return halfAlong * Math.cos(peak) + halfAcross * Math.sin(peak);
}

/**
 * Authored form of a fitted lug tread, as ratios of the tyre it wraps.
 *
 * The one module whose visual hangs off a wheel instead of the hull, so it gets
 * a form of its own rather than a {@link RigModuleForm}. It lives here, and not
 * in the renderer that draws it, because a tread that stands proud of the tyre
 * changes the wheel's *clearance envelope* — and the thing that has to respect
 * that envelope is a pontoon derived in this file.
 *
 * The renderer previously owned these as its own literals, two of them absolute:
 * a lug block `width + 0.18` wide and a band standing off `0.035` m. Absolute
 * proud-ness on a ratio-scaled wheel is drift by construction — 0.09 m per side
 * is 33% of the tractor's front tyre half-width and 39% of the buggy's. Both are
 * radius ratios now, which is what makes the tread the same *shape* on a 0.43 m
 * wheel and a 1.05 m one.
 */
export const LUG_TREAD_FORM = {
  /** Band ring radius, × tyre radius. */
  bandRingScale: 0.92,
  /** Band tube radius, × tyre radius. */
  bandTubeScale: 0.105,
  /** Band centre offset outboard of the tyre's face, × tyre radius. */
  bandStandoffScale: 0.06,
  /** How far a lug block reaches past each tyre face, × tyre radius. */
  lugOverhangScale: 0.16,
  /**
   * Outer surface of a lug block, from the wheel's axis, × tyre radius.
   *
   * True only because the renderer points the block's {@link lugThicknessScale}
   * axis radially outward. It pointed {@link lugDepthScale} outward once, which
   * made the rendered reach 1.18 radii while every clearance in this file was
   * still derived from 1.1 — and the browser measured the flotation pontoons
   * inside the treads again as a result. If either number moves, the pairing has
   * to be re-measured, not re-reasoned: `tools/rig-module-visual-acceptance.cjs`
   * reports each tread's drop below its own tyre as `hostGap`, which should come
   * out at about `-(lugReachScale - 1) × radius`.
   */
  lugReachScale: 1.1,
  /** Radial thickness of a lug block: how proud of the tyre it stands, × radius. */
  lugThicknessScale: 0.14,
  /** Length of a lug block along the direction of travel, × tyre radius. */
  lugDepthScale: 0.3,
  lugCount: 12,
} as const;

/**
 * Half-extents of the widest tread this wheel can wear, standing.
 *
 * Two contributors, and which one wins depends on the tyre's aspect ratio, so
 * both are measured rather than one assumed: the side bands stand off the tyre
 * face and add their own tube radius, while the lug blocks overhang it directly.
 */
function treadEnvelope(
  radius: number,
  width: number,
): { halfWidth: number; radius: number } {
  const band =
    width / 2 +
    radius * (LUG_TREAD_FORM.bandStandoffScale + LUG_TREAD_FORM.bandTubeScale);
  const lug = width / 2 + radius * LUG_TREAD_FORM.lugOverhangScale;
  return {
    halfWidth: Math.max(band, lug),
    radius:
      radius *
      Math.max(
        LUG_TREAD_FORM.lugReachScale,
        LUG_TREAD_FORM.bandRingScale + LUG_TREAD_FORM.bandTubeScale,
      ),
  };
}

/**
 * Authored module forms.
 *
 * Every module in `MODULES` appears here or in {@link WHEEL_MOUNTED_MODULE_IDS};
 * `rig-blockout.test.ts` fails if one is missing, so a new buyable module cannot
 * ship invisible.
 *
 * The ratios below were not free choices — they are the loosest values that
 * satisfy the invariants the test enforces on both ground rigs, and several were
 * tightened after a measured collision:
 *
 *   - the survey mast began at `zCentreScale: -0.455`, which drove it through the
 *     tractor's cab — hand-authored superstructure the blockout does not model.
 *     -0.49 stands it on the rear deck edge, behind the cab's rear face.
 *   - the gearing case began at `zCentreScale: -0.28`, overlapping the skid
 *     plate. Two modules the player can own at once must not share a volume.
 *
 * A third case is no longer here, and its absence is the point. The skid plate's
 * `widthScale` was hand-tuned twice against the tractor's rear tyre and was wrong
 * both times, so the wheels now bound underbody width directly — see the clamp in
 * `placeModuleMount`. `widthScale: 0.66` below is what the plate *wants* to be;
 * on the tractor the wheels cut it to 0.545, and on the buggy they do not bind at
 * all. A ratio that has to be recomputed by hand whenever an unrelated dimension
 * moves belongs to the thing that moves, not to this table.
 */
export const RIG_MODULE_FORMS: Readonly<
  Partial<Record<ModuleId, RigModuleForm>>
> = {
  winch: {
    // A bumper drum: low and wide across the nose, ahead of the front tyres,
    // under the grille. The standoff is what stops it reading as part of the
    // hull rather than as something bolted on.
    anchor: "nose",
    widthScale: 0.34,
    heightScale: 0.62,
    depthScale: 0.075,
    zCentreScale: 0,
    standoffScale: 0.08,
  },
  "survey-mast": {
    // Slim and nearly three hull-thicknesses tall: the only module that changes
    // the rig's silhouette from a distance, which is the point of a mast.
    //
    // `widthScale` describes the *dish*, not the pole. The mast's widest parts are
    // its head and dish, and a box sized to the pole cannot contain them — measured,
    // the form rendered 19 cm outside a 14 cm-wide box. x is the free axis up here:
    // the hull top is 2.5 m across and nothing else is mounted beside the mast, so
    // the box takes its room there. `depthScale` stays pole-slim because z is the
    // tight axis — the cab is 20 cm forward of this mount.
    anchor: "hull-top",
    widthScale: 0.21,
    heightScale: 2.9,
    depthScale: 0.055,
    zCentreScale: -0.49,
    standoffScale: 0.1,
  },
  "flotation-pontoons": {
    anchor: "outboard",
    widthScale: 0.14,
    heightScale: 0.55,
    depthScale: 0.66,
    zCentreScale: 0,
    standoffScale: 0.06,
  },
  "skid-plate": {
    // Flush to the underside, because a plate that stands off the frame is not
    // taking the hit the frame would have taken.
    anchor: "underbody",
    widthScale: 0.66,
    heightScale: 0.15,
    depthScale: 0.55,
    zCentreScale: 0.06,
    standoffScale: 0,
  },
  "low-range-gearing": {
    // The one module with no capability and no silhouette claim — a transfer
    // case behind the skid plate. It still gets a visual: "I bought something"
    // is a promise the garage makes, and six purchases with one visible result
    // teaches the player that upgrades are invisible.
    anchor: "underbody",
    widthScale: 0.3,
    heightScale: 0.42,
    depthScale: 0.16,
    zCentreScale: -0.35,
    standoffScale: 0,
  },
} as const;

interface ModuleMountContext {
  readonly hullWidth: number;
  readonly hullHeight: number;
  readonly hullDepth: number;
  readonly hullBottomY: number;
  readonly hullTopY: number;
  /** Half-extent of the widest thing the rig owns: hull side or outermost tyre. */
  readonly outerHalfWidth: number;
  /**
   * Half-width of the clear tunnel between the wheels, at their innermost sweep.
   * `Infinity` on a rig with no wheels, meaning no wheel bounds anything.
   */
  readonly innerHalfWidth: number;
  /** The rig's own bodywork, which a hull-top module has to be placed around. */
  readonly superstructure: readonly RigSuperstructureVolume[];
}

/**
 * Longitudinal margin a hull-top module keeps from the bodywork beside it, metres.
 *
 * A mast flush against the cab's rear face reads as welded to the cab; a couple of
 * centimetres reads as bolted to the deck behind it. Absolute rather than a ratio
 * because it describes a visible seam, and a seam looks the same on any rig.
 */
const HULL_TOP_BODYWORK_MARGIN = 0.03;

/**
 * Stand a module on the highest surface of the rig that can hold it.
 *
 * `hull-top` used to mean "on the hull plate, at the z this form asked for", and the
 * z was a hand-tuned ratio. That reading has two problems, and the tractor shows
 * both. Measured, its hood and cab together span the entire deck — merged, they
 * occupy z ∈ [-2.13, 2.53] of a deck reaching to ±2.29 — so there is no deck gap for
 * a 25 cm box at all, and the previous ratio only looked right because the mast was
 * hanging 8 cm off the back of the rig. And the mast's own purpose is to be "the
 * only module that changes the rig's silhouette from a distance", which it failed:
 * standing behind the cab it finished 53 cm *below* the cab roof.
 *
 * So the anchor means what its name says — the top of the rig. Supports are the hull
 * deck and the upper face of each bodywork volume; the highest one wide enough and
 * long enough wins, and within it the module sits as near as it can to the z the form
 * asked for. On the tractor that is the cab roof, which is both the only surface that
 * fits and the one that makes the module do its job.
 *
 * Returns null when no surface can hold the box — a design failure worth a thrown
 * error, not a number to round off.
 */
function placeOnTopOfRig(
  desiredZ: number,
  width: number,
  height: number,
  depth: number,
  standoff: number,
  context: ModuleMountContext,
): { y: number; z: number } | null {
  const supports = [
    {
      // The hull plate itself, which is the support when a rig has bare bodywork.
      y: context.hullTopY,
      zMin: -context.hullDepth / 2,
      zMax: context.hullDepth / 2,
      halfWidth: context.hullWidth / 2,
    },
    ...context.superstructure.map((volume) => ({
      y: volume.y + volume.height / 2,
      zMin: volume.z - volume.depth / 2,
      zMax: volume.z + volume.depth / 2,
      halfWidth: volume.width / 2,
    })),
  ].sort((a, b) => b.y - a.y);

  for (const support of supports) {
    if (support.halfWidth < width / 2) continue;
    // A ledge only just longer than the box is not a mounting surface; it is a
    // coincidence. Requiring the margin on both sides is what stops the buggy's
    // mast being stood on the 20 cm apex of its roll bar — the highest surface it
    // owns, and a worse answer than the clear rear deck one step down.
    if (support.zMax - support.zMin < depth + HULL_TOP_BODYWORK_MARGIN * 2)
      continue;

    const y = support.y + standoff + height / 2;
    const boxMinY = y - height / 2;
    const boxMaxY = y + height / 2;

    // Only bodywork this module would actually reach can block it. The volume it is
    // standing on never does: the standoff puts the box above that volume's top
    // face, so the y test excludes it without a special case.
    const walls: { min: number; max: number }[] = [];
    for (const volume of context.superstructure) {
      if (Math.abs(volume.x) - volume.width / 2 >= width / 2) continue;
      if (volume.y - volume.height / 2 >= boxMaxY) continue;
      if (volume.y + volume.height / 2 <= boxMinY) continue;
      walls.push({
        min: volume.z - volume.depth / 2 - HULL_TOP_BODYWORK_MARGIN,
        max: volume.z + volume.depth / 2 + HULL_TOP_BODYWORK_MARGIN,
      });
    }
    walls.sort((a, b) => a.min - b.min);

    // Merge overlapping walls so a hood and a cab that touch present one obstacle
    // rather than a phantom gap between them.
    const merged: { min: number; max: number }[] = [];
    for (const wall of walls) {
      const last = merged[merged.length - 1];
      if (last && wall.min <= last.max) last.max = Math.max(last.max, wall.max);
      else merged.push({ ...wall });
    }

    const gaps: { min: number; max: number }[] = [];
    let cursor = support.zMin;
    for (const wall of merged) {
      if (wall.min > cursor) {
        gaps.push({ min: cursor, max: Math.min(wall.min, support.zMax) });
      }
      cursor = Math.max(cursor, wall.max);
    }
    if (cursor < support.zMax) gaps.push({ min: cursor, max: support.zMax });

    let best: number | null = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const gap of gaps) {
      if (gap.max - gap.min < depth) continue;
      const candidate = clamp(
        desiredZ,
        gap.min + depth / 2,
        gap.max - depth / 2,
      );
      const distance = Math.abs(candidate - desiredZ);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = candidate;
      }
    }
    if (best !== null) return { y, z: best };
  }
  return null;
}

/**
 * Lateral margin an underbody module keeps from the wheels, × `hull.width`.
 *
 * Small, but not zero: a plate whose edge is flush with a tyre's swept face is a
 * plate that scrapes the tyre the first time the terrain rolls the rig. Three per
 * cent of hull width is 7.5 cm on the tractor.
 */
const UNDERBODY_WHEEL_MARGIN_SCALE = 0.03;

/**
 * Place one module's box from its anchor face.
 *
 * Split out so the switch is exhaustive over {@link RigModuleAnchor} in one
 * place; adding an anchor is then a type error here rather than a silent
 * fallthrough that stacks a new module at the origin.
 */
function placeModuleMount(
  moduleId: ModuleId,
  form: RigModuleForm,
  context: ModuleMountContext,
  sign: -1 | 1,
): RigModuleMount {
  // An underbody module's width is bounded by the wheels, so the wheels own the
  // number and `widthScale` is an aspiration the bound may cut down.
  //
  // This is a clamp and not a hand-tuned ratio because the ratio has now lost
  // that argument twice: 0.7 put the plate's edge 3.5 cm inside the tractor's
  // rear tyre, and 0.66 — chosen to fix that — put it 6.8 cm inside the same
  // tyre's lug tread once both modules were owned at once. A number that has to
  // be re-derived by hand every time an unrelated dimension moves was never
  // authored data; it was a measurement written down in the wrong file.
  //
  // Conservative on purpose: no check for whether this module actually overlaps a
  // wheel longitudinally. On both ground rigs the axle-to-axle window is shorter
  // than any plate worth fitting, so the exact test would buy nothing and would
  // add a case that only a fourth rig could exercise. A needlessly narrow plate
  // is cosmetic; a plate inside a tyre is not.
  const widthCeiling =
    form.anchor === "underbody"
      ? Math.max(
          0,
          (context.innerHalfWidth -
            context.hullWidth * UNDERBODY_WHEEL_MARGIN_SCALE) *
            2,
        )
      : Number.POSITIVE_INFINITY;
  const width = Math.min(context.hullWidth * form.widthScale, widthCeiling);
  const height = context.hullHeight * form.heightScale;
  const depth = context.hullDepth * form.depthScale;
  const standoff = context.hullHeight * form.standoffScale;
  // `zCentreScale` names where the module's *centre* wants to be, as a fraction of
  // hull length. Taken literally it lets a box hang off the end of the rig: the
  // survey mast asked for -0.49 and, once its box was widened to contain its own
  // dish, ended up 8 cm behind the tractor's rear face standing on nothing. The
  // scale stays authored data — it is how a form says "as far back as it can go" —
  // and the rig's own length is what decides what that means.
  const zLimit = Math.max(0, (context.hullDepth - depth) / 2);
  const z = clamp(context.hullDepth * form.zCentreScale, -zLimit, zLimit);
  const mirrored = form.anchor === "outboard";

  const base = {
    moduleId,
    slot: (mirrored ? (sign < 0 ? "left" : "right") : "single") as
      "single" | "left" | "right",
    anchor: form.anchor,
    width,
    height,
    depth,
  };

  switch (form.anchor) {
    case "nose":
      return {
        ...base,
        x: 0,
        y: context.hullBottomY + height / 2,
        z: context.hullDepth / 2 + standoff + depth / 2,
      };
    case "hull-top": {
      // The one anchor that has to negotiate with the rig's own bodywork: it stands
      // a box on top of the rig, where the cab already is. Every other anchor faces
      // outward — under the hull, ahead of the nose, outboard of the tyres — into
      // space no hand-authored part occupies.
      const placed = placeOnTopOfRig(
        z,
        width,
        height,
        depth,
        standoff,
        context,
      );
      if (placed === null) {
        throw new Error(
          `${moduleId} needs a ${width.toFixed(2)}×${depth.toFixed(2)} m surface ` +
            `on top of the rig and none of its ${context.superstructure.length} ` +
            `bodywork volumes or its deck offers one; give the module a smaller ` +
            `box or the rig a mounting platform`,
        );
      }
      return { ...base, x: 0, y: placed.y, z: placed.z };
    }
    case "outboard":
      return {
        ...base,
        x: sign * (context.outerHalfWidth + standoff + width / 2),
        y: context.hullBottomY + height / 2,
        z,
      };
    case "underbody":
      return {
        ...base,
        x: 0,
        y: context.hullBottomY - standoff - height / 2,
        z,
      };
  }
}

/**
 * Derive every module mount this rig can carry.
 *
 * Gated on `MODULES[id].fits`, so a rig is never given a mount for a module the
 * garage will not sell it. That single check is what lets the renderer build
 * visuals from this list unconditionally.
 */
function deriveModuleMounts(
  rigId: RigId,
  context: ModuleMountContext,
): RigModuleMount[] {
  const mounts: RigModuleMount[] = [];
  for (const [moduleId, form] of Object.entries(RIG_MODULE_FORMS) as [
    ModuleId,
    RigModuleForm,
  ][]) {
    if (!MODULES[moduleId].fits.includes(rigId)) continue;
    if (form.anchor === "outboard") {
      mounts.push(placeModuleMount(moduleId, form, context, -1));
      mounts.push(placeModuleMount(moduleId, form, context, 1));
    } else {
      mounts.push(placeModuleMount(moduleId, form, context, 1));
    }
  }
  return mounts;
}

/**
 * Derive a rig's blockout from its profile and authored silhouette.
 *
 * Pure and side-effect free: it returns numbers, not scene-graph objects, so it
 * can be tested without a WebGL context and reused by any presentation surface.
 */
export function rigBlockout(
  profile: RigBlockoutProfile,
  silhouette: RigSilhouette,
): RigBlockout {
  const halfTrack = profile.track / 2;
  const halfWheelbase = profile.wheelbase / 2;
  const isHover = profile.mobilityAdapter === "hover";
  const steerLimit = maximumSteeringAngleFor(profile.id);
  // Gated on what the garage sells this rig, not on a rig list, for the same
  // reason `deriveModuleMounts` is: a rig with no lug tyres on offer gets the
  // bare-tyre envelope because nothing can be bolted to its wheels, which is the
  // actual reason — and it stays true when a future rig's fitment list changes.
  const wearsLugs = MODULES["lug-tires"].fits.includes(profile.id);

  const wheelMounts: RigWheelMount[] = isHover
    ? []
    : WHEEL_LOCAL_SIGNS.map(([signX, signZ], index) => {
        const isFront = signZ > 0;
        const radius =
          profile.wheelRadius *
          (isFront ? silhouette.frontWheelScale : silhouette.rearWheelScale);
        const width = radius * silhouette.tyreWidthScale;
        const limit = isFront ? steerLimit : 0;
        const tread = wearsLugs
          ? treadEnvelope(radius, width)
          : { halfWidth: width / 2, radius };
        return {
          index,
          label: WHEEL_LABELS[index]!,
          x: signX * halfTrack,
          z: signZ * halfWheelbase,
          radius,
          width,
          restY: radius,
          steers: isFront,
          spinScale: profile.wheelRadius / radius,
          steerLimit: limit,
          treadHalfWidth: tread.halfWidth,
          treadRadius: tread.radius,
          clearanceHalfWidth: sweptHalfExtent(
            tread.halfWidth,
            tread.radius,
            limit,
          ),
          clearanceHalfDepth: sweptHalfExtent(
            tread.radius,
            tread.halfWidth,
            limit,
          ),
        };
      });

  const hullHeight = profile.rideHeight * silhouette.hullThicknessScale;
  // Centred on the body origin, which in the GROUND frame is `rideHeight`.
  const hullCentreY = profile.rideHeight;
  const hullBottomY = hullCentreY - hullHeight / 2;
  const hullTopY = hullCentreY + hullHeight / 2;
  const hullWidth = profile.track * silhouette.hullWidthScale;
  const hullDepth = profile.wheelbase * silhouette.hullLengthScale;
  const hoverClearance = isHover ? profile.suspensionTravel : 0;

  // An outboard module has to clear whichever is wider — and on both ground rigs
  // that is the tyre, not the hull, by about 40 cm. Deriving from the hull alone
  // would bury a pair of pontoons inside the rear wheels.
  //
  // `clearanceHalfWidth` and not `width / 2`, twice over. A steered wheel's
  // outboard corner swings past its standing envelope: against the standing
  // figure the tractor cleared by 1 mm and the buggy fouled by 15 cm. And a
  // wheel wearing lug tyres is wider still: against the bare-tyre sweep the
  // tractor's pontoons sat 6.8 cm inside its own tread bands, on a rig that can
  // legally own both modules at once.
  const outerHalfWidth = wheelMounts.reduce(
    (widest, mount) =>
      Math.max(widest, Math.abs(mount.x) + mount.clearanceHalfWidth),
    hullWidth / 2,
  );

  // And the mirror of it: the clear tunnel between the wheels, which is what an
  // underbody plate has to fit inside. Seeded at infinity so a rig with no wheels
  // reports "no wheel bounds this" rather than zero width.
  const innerHalfWidth = wheelMounts.reduce(
    (narrowest, mount) =>
      Math.min(narrowest, Math.abs(mount.x) - mount.clearanceHalfWidth),
    Number.POSITIVE_INFINITY,
  );

  // Authored, not derived — see `RIG_SUPERSTRUCTURES`. Resolved against the hull
  // this profile produced, so a synthetic profile in a test gets bodywork that
  // scales with it, and hull-top placement always has something to negotiate with.
  const superstructure = resolveSuperstructure(
    RIG_SUPERSTRUCTURES[profile.id] ?? [],
    {
      width: hullWidth,
      height: hullHeight,
      depth: hullDepth,
      topY: hullTopY,
    },
  );

  return {
    id: profile.id,
    profile,
    silhouette,
    groundFrameOffsetY: -profile.rideHeight,
    contactPlaneY: -profile.rideHeight,
    wheelMounts,
    hull: {
      width: hullWidth,
      height: hullHeight,
      depth: hullDepth,
      centreY: hullCentreY,
      bottomY: hullBottomY,
      topY: hullTopY,
    },
    moduleMounts: deriveModuleMounts(profile.id, {
      hullWidth,
      hullHeight,
      hullDepth,
      hullBottomY,
      hullTopY,
      outerHalfWidth,
      innerHalfWidth,
      superstructure,
    }),
    superstructure,
    hoverClearance,
    hoverSkirt: isHover
      ? {
          // Spans the whole gap: bottom edge on the air cushion, top edge
          // meeting the hull, so the skirt visibly does the lifting.
          height: hullBottomY - hoverClearance,
          centreY: (hullBottomY + hoverClearance) / 2,
        }
      : null,
    shadowY: GROUND_DECAL_LIFT,
  };
}

/** Blockout for a canonical rig, using its shipped profile and silhouette. */
export function blockoutFor(rigId: RigId): RigBlockout {
  return rigBlockout(RIG_PROFILES[rigId], RIG_SILHOUETTES[rigId]);
}

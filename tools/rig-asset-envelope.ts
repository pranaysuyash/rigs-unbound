/**
 * Rig asset envelope: the dimensional contract an imported or generated rig
 * model must satisfy.
 *
 * ## Why this exists
 *
 * The `img2threejs` forge pipeline reconstructs a Three.js model from a
 * reference plate. It works: `field-plough-01` went through it end to end. But a
 * plough and a rig are not the same kind of object, and the difference is
 * exactly the one this codebase has already been bitten by.
 *
 * `field-plough-01.asset.json` declares its root as
 * `{width: 3.8, height: 1.8, depth: 1.35, confidence: 0.3}`. That confidence is
 * honest and harmless: a plough has **no dimensional contract with the
 * simulation**. Nothing in `physics.ts` reads a plough's width.
 *
 * A rig is the opposite case. `track` and `wheelbase` locate the four points
 * where the traversal model samples terrain; `wheelRadius` is the rolling radius
 * that converts distance travelled into wheel rotation; `rideHeight` is the
 * distance from the contact plane to the body origin the kernel positions. Those
 * are *simulation inputs*. Estimating them from a photograph is structurally the
 * same act as hand-writing them as literals in the renderer — which is precisely
 * the drift that left every rig in this game floating above the terrain by
 * exactly its ride height (see `rig-blockout.ts` and the 2026-08-11 worklog
 * addendum).
 *
 * So for rigs the pipeline is inverted at the dimensional layer:
 *
 *   the reference plate supplies FORM      — which subassemblies exist, their
 *                                            proportions, materials, greebles
 *   `RIG_PROFILES` supplies DIMENSIONS     — footprint, ride height, wheel radii
 *
 * This module emits the second half as a machine-checkable envelope, and can
 * check a candidate spec against it. That turns "remember to keep the generated
 * rig on the profile" from a review instruction into a failing test.
 *
 * ## Frame
 *
 * Everything here is in the GROUND frame — y = 0 is the surface the rig rests
 * on. That is deliberate and is the same choice `rig-blockout.ts` documents: in
 * the ground frame a contact cue is `y ≈ 0` and needs no knowledge of
 * `rideHeight`, so the float bug becomes unrepresentable rather than merely
 * discouraged. An imported mesh authored in any other frame will fail
 * `tools/rig-ground-contact-acceptance.cjs` once mounted.
 *
 * ## Why this lives in `tools/` and not `src/game/`
 *
 * It was first written under `src/game/`, for the wrong reason: `vitest.config.ts`
 * only collected `src/` tests, so that was the cheap way to get it inside
 * `npm run test`. `npm run audit:slice-bindings` immediately and correctly
 * rejected it, and the objection generalises.
 *
 * `audit-runtime-reachability.mjs` scans `src/` and closes with "a module with
 * tests but no entry path is tested behaviour the player cannot reach." True of
 * gameplay code; false of an authoring-time contract checker. This module is not
 * behaviour a player should reach, so counting it against the unreachable budget
 * dilutes a number whose whole job is to apply pressure to *unwired gameplay* —
 * and at 452 lines it became the largest entry in that list, above real rig
 * systems like `winch-physics.ts`.
 *
 * More importantly, the directory encodes the permitted import direction. Tools
 * may depend on the runtime; the runtime must never depend on a tool. Sitting in
 * `src/game/`, nothing stopped a future gameplay module from importing this and
 * shipping authoring-time code to players. Sitting here, such an import is an
 * upward dependency a reviewer spots on sight. `vitest.config.ts` was widened to
 * collect TypeScript tool tests instead, which is the change that should have
 * been made first.
 */

import { RIG_PROFILES, type RigId } from "../src/game/contracts";
import { blockoutFor, type RigBlockout } from "../src/game/rig-blockout";

/** Tolerance for comparing a candidate dimension against a derived one, in metres. */
export const ENVELOPE_TOLERANCE = 0.005;

/**
 * One node of the envelope, shaped to merge into an asset spec's `components`.
 *
 * Deliberately a *fragment* rather than a whole component: `role`, `materials`,
 * `collider`, and `action` are genuinely image- and gameplay-derived and are not
 * this module's to invent. What is emitted is only what the profile determines.
 */
export interface RigEnvelopeNode {
  /** Matches the asset-spec component id pattern. */
  readonly id: string;
  readonly parent: string | null;
  readonly level: "macro" | "meso" | "micro";
  /** Position in the GROUND frame, as `[x, y, z]`. */
  readonly localPosition: readonly [number, number, number];
  readonly dimensions: Readonly<Record<string, number>>;
  /**
   * Why this node's numbers are what they are, in terms a reviewer can check
   * against `RIG_PROFILES` by hand.
   */
  readonly derivation: string;
}

export interface RigAssetEnvelope {
  readonly rigId: RigId;
  readonly displayName: string;
  readonly frame: "ground";
  /**
   * Free-text frame declaration for the asset spec's required
   * `coordinateFrame`, which the schema demands carry `front`, `up`, `units`.
   */
  readonly coordinateFrame: {
    readonly front: string;
    readonly up: string;
    readonly right: string;
    readonly units: string;
    readonly origin: string;
  };
  readonly nodes: readonly RigEnvelopeNode[];
  /**
   * Facts a reconstruction is free to decide, stated so that a reviewer can
   * tell "not derived" from "forgotten".
   */
  readonly authorable: readonly string[];
}

/** One disagreement between a candidate spec and the derived envelope. */
export interface EnvelopeDrift {
  readonly nodeId: string;
  readonly field: string;
  readonly expected: number;
  readonly actual: number | null;
  readonly delta: number | null;
  readonly reason: string;
}

/** A candidate node read out of an asset spec, in the shape this module checks. */
export interface CandidateNode {
  readonly id: string;
  readonly localPosition?: readonly number[];
  readonly dimensions?: Readonly<Record<string, unknown>>;
}

/** Tokens that make a free-text origin declaration plausibly the ground frame. */
const GROUND_FRAME_TOKENS = ["ground", "contact", "y = 0", "y=0"];

/**
 * Whether an asset spec's free-text `coordinateFrame.origin` reads as the ground
 * frame.
 *
 * Weak evidence on purpose. Prose cannot be parsed, and the alternative — saying
 * nothing — is worse: every position `compareEnvelope` checks is measured from
 * y = 0 at the contact plane, so a spec authored around its body origin instead
 * disagrees by exactly `rideHeight` on every node at once. That reads as a
 * catalogue of unrelated drift when it is really one frame error, which is
 * precisely how the shipped rigs' float stayed unexplained for so long. A false
 * negative here costs one sentence of prose; a missed frame error costs a
 * misleading drift report.
 */
export function looksGroundFramed(origin: unknown): boolean {
  if (typeof origin !== "string") return false;
  const lowered = origin.toLowerCase();
  return GROUND_FRAME_TOKENS.some((token) => lowered.includes(token));
}

/**
 * Map an asset spec's `components` array into the candidate shape.
 *
 * Only `id`, `pivot.localPosition`, and `dimensions` participate, because those
 * are the only fields the profile determines. Everything else in a component —
 * role, topology, sockets, collider, materials, action — is form, and form is the
 * reference plate's job.
 *
 * Throws on a shape it cannot read rather than silently yielding an empty list,
 * since an empty candidate list would make every required node "missing" and bury
 * a parse failure inside a plausible-looking drift report.
 */
export function candidatesFromSpecComponents(
  components: unknown,
): CandidateNode[] {
  if (!Array.isArray(components)) {
    throw new Error('spec has no "components" array');
  }

  return components.map((raw, index) => {
    const component = raw as {
      id?: unknown;
      pivot?: { localPosition?: unknown };
      dimensions?: unknown;
    };
    if (typeof component.id !== "string") {
      throw new Error(`components[${index}] has no string id`);
    }
    const localPosition = component.pivot?.localPosition;
    return {
      id: component.id,
      localPosition: Array.isArray(localPosition)
        ? (localPosition as readonly number[])
        : undefined,
      dimensions:
        component.dimensions !== null &&
        typeof component.dimensions === "object"
          ? (component.dimensions as Record<string, unknown>)
          : undefined,
    };
  });
}

function node(
  id: string,
  parent: string | null,
  level: RigEnvelopeNode["level"],
  localPosition: readonly [number, number, number],
  dimensions: Readonly<Record<string, number>>,
  derivation: string,
): RigEnvelopeNode {
  return { id, parent, level, localPosition, dimensions, derivation };
}

/**
 * Widest and longest extents the rig's derived parts occupy, in the ground frame.
 *
 * Height is reported as a *floor* rather than a total, and the floor is the hull's
 * top face. It used to be described as unknowable — "a cab, roll bar, or mast sits
 * above the hull and is pure art direction" — which was true when the blockout could
 * not see a cab. It can now: `RIG_SUPERSTRUCTURES` models each bodywork volume, so
 * the true total is derivable. It stays a floor anyway, because a *reconstruction* of
 * this rig is free to restyle its cab, and an envelope that pinned total height would
 * reject a taller silhouette that is otherwise faithful. What a reconstruction may not
 * do is come in *under* the hull it stands on.
 */
function rootExtent(blockout: RigBlockout): Record<string, number> {
  const { hull, wheelMounts } = blockout;
  let width = hull.width;
  let depth = hull.depth;

  // Both are FULL extents, so each term doubles: a mount sits at ±x and ±z, and
  // the tyre sticks out by half its width to each side and by its radius fore
  // and aft. Reporting a half-extent here would understate the box and let a
  // reconstruction's wheels legitimately poke outside the root it declares.
  for (const mount of wheelMounts) {
    width = Math.max(width, Math.abs(mount.x) * 2 + mount.width);
    depth = Math.max(depth, Math.abs(mount.z) * 2 + mount.radius * 2);
  }

  return {
    width,
    depth,
    // `hull.topY`, not `centreY + height / 2`. The blockout exposes the face
    // precisely so this conversion is not written out a sixth time; five copies of
    // it is how the original drift started.
    heightAtLeast: hull.topY,
  };
}

/**
 * Derive the dimensional envelope a reconstruction of this rig must satisfy.
 *
 * Pure. Every number traces to `RIG_PROFILES` through `rigBlockout()`, so this
 * cannot drift from what the simulation and the renderer already agree on.
 */
export function rigAssetEnvelope(rigId: RigId): RigAssetEnvelope {
  const blockout = blockoutFor(rigId);
  const profile = RIG_PROFILES[rigId];
  const nodes: RigEnvelopeNode[] = [
    node(
      "root",
      null,
      "macro",
      [0, 0, 0],
      rootExtent(blockout),
      "Presentation root, on the contact plane. `heightAtLeast` is the hull top; " +
        "superstructure above it is art direction and is not derived.",
    ),
    node(
      "hull",
      "root",
      "macro",
      [0, blockout.hull.centreY, 0],
      {
        width: blockout.hull.width,
        height: blockout.hull.height,
        depth: blockout.hull.depth,
      },
      `track x hullWidthScale, wheelbase x hullLengthScale, rideHeight x hullThicknessScale; centred on the body origin at y = rideHeight (${profile.rideHeight}).`,
    ),
  ];

  for (const mount of blockout.wheelMounts) {
    nodes.push(
      node(
        `wheel-${mount.label.toLowerCase()}`,
        "root",
        "meso",
        [mount.x, mount.restY, mount.z],
        {
          radius: mount.radius,
          width: mount.width,
          spinScale: mount.spinScale,
          simulationWheelIndex: mount.index,
        },
        `Simulation wheel ${mount.index} (${mount.label}) at ±track/2, ±wheelbase/2 — the exact point terrain is sampled. ` +
          `Centre at y = radius so the tyre touches y = 0. spinScale = wheelRadius / radius. ` +
          `simulationWheelIndex is an ordinal, not a measurement: it binds this mesh to the contact ` +
          `the kernel animates it from, so a mislabelled pair reads as a mirrored axle.`,
      ),
    );
  }

  if (blockout.hoverSkirt) {
    nodes.push(
      node(
        "hover-skirt",
        "root",
        "macro",
        [0, blockout.hoverSkirt.centreY, 0],
        {
          height: blockout.hoverSkirt.height,
          groundClearance: blockout.hoverClearance,
        },
        `Bottom edge on the air cushion at y = suspensionTravel (${blockout.hoverClearance}), top edge meeting the hull underside, so the skirt visibly does the lifting.`,
      ),
    );
  }

  nodes.push(
    node(
      "ground-decal",
      "root",
      "micro",
      [0, blockout.shadowY, 0],
      { lift: blockout.shadowY },
      "Contact shadow, lifted off the plane only enough to beat depth precision. " +
        "This is the cue a player reads to judge contact; it may not be authored higher.",
    ),
  );

  return {
    rigId,
    displayName: profile.displayName,
    frame: "ground",
    coordinateFrame: {
      front: "rig forward, positive Z",
      up: "world positive Y",
      right: "rig right, positive X",
      units:
        "metres, derived from RIG_PROFILES — not estimated from reference imagery",
      origin:
        "centre of the contact patch rectangle, on the ground plane (y = 0). " +
        "GROUND frame: the runtime lowers the assembly by rideHeight when mounting it " +
        "under the body origin — see rig-blockout.ts groundFrameOffsetY.",
    },
    nodes,
    authorable: [
      "Which subassemblies exist beyond the derived ones (cab, boom, winch, drawers, beacon).",
      "Superstructure heights above the hull top, and all proportions within a derived extent.",
      "Materials, surface detail, wear, and emissive treatment.",
      "Socket placement, collider decomposition, and destruction grouping.",
      "Silhouette ratios, by editing RIG_SILHOUETTES — which rescales this envelope rather than contradicting it.",
    ],
  };
}

/**
 * Check a candidate spec's nodes against the derived envelope.
 *
 * Reports drift rather than throwing, so a caller can print every disagreement
 * at once instead of one per run. A node the candidate omits is reported with
 * `actual: null`; extra candidate nodes are ignored, because a reconstruction is
 * expected to add form the profile knows nothing about.
 */
export function compareEnvelope(
  envelope: RigAssetEnvelope,
  candidates: readonly CandidateNode[],
): EnvelopeDrift[] {
  const byId = new Map(candidates.map((entry) => [entry.id, entry]));
  const drift: EnvelopeDrift[] = [];

  for (const expected of envelope.nodes) {
    const candidate = byId.get(expected.id);
    if (!candidate) {
      drift.push({
        nodeId: expected.id,
        field: "*",
        expected: Number.NaN,
        actual: null,
        delta: null,
        reason: `Envelope requires a node "${expected.id}" and the candidate has none. ${expected.derivation}`,
      });
      continue;
    }

    const axes = ["x", "y", "z"] as const;
    for (const [axis, want] of expected.localPosition.entries()) {
      const got = candidate.localPosition?.[axis];
      const actual = typeof got === "number" ? got : null;
      if (actual === null || Math.abs(actual - want) > ENVELOPE_TOLERANCE) {
        drift.push({
          nodeId: expected.id,
          field: `localPosition.${axes[axis]}`,
          expected: want,
          actual,
          delta: actual === null ? null : actual - want,
          reason: expected.derivation,
        });
      }
    }

    for (const [field, want] of Object.entries(expected.dimensions)) {
      const got = candidate.dimensions?.[field];
      const actual = typeof got === "number" ? got : null;
      if (actual === null || Math.abs(actual - want) > ENVELOPE_TOLERANCE) {
        drift.push({
          nodeId: expected.id,
          field: `dimensions.${field}`,
          expected: want,
          actual,
          delta: actual === null ? null : actual - want,
          reason: expected.derivation,
        });
      }
    }
  }

  return drift;
}

/** A single offset that explains many drifts at once. */
export interface UniformOffsetDiagnosis {
  readonly axis: "x" | "y" | "z";
  readonly offset: number;
  readonly nodeIds: readonly string[];
  /**
   * True when a y-offset matches the rig's ride height, which is the specific
   * signature of a spec authored around its body origin.
   */
  readonly matchesRideHeight: boolean;
}

/**
 * Detect the case where every position drift is the *same* offset on the same
 * axis — one frame error wearing the costume of many position errors.
 *
 * This is the whole diagnostic lesson of the 2026-08-11 float, promoted into
 * code. The shipped rigs were not each independently misplaced; they shared one
 * unnamed frame, and the reason it survived review is that the symptom presented
 * as a scattered list of unrelated wrongness. Reported as "seven nodes are at the
 * wrong height", a reviewer edits seven numbers and the frame stays broken.
 * Reported as "seven nodes share a −0.95 offset, which is this rig's ride
 * height", the actual fix is obvious.
 *
 * Requires at least three agreeing nodes, so that a genuine pair of
 * coincidentally-equal mistakes is not dressed up as a systemic cause.
 */
export function diagnoseUniformOffset(
  envelope: RigAssetEnvelope,
  drift: readonly EnvelopeDrift[],
): UniformOffsetDiagnosis | null {
  const positional = drift.filter(
    (item) => item.field.startsWith("localPosition.") && item.delta !== null,
  );
  if (positional.length < 3 || positional.length !== drift.length) return null;

  const axis = positional[0]!.field.slice("localPosition.".length);
  if (axis !== "x" && axis !== "y" && axis !== "z") return null;
  if (!positional.every((item) => item.field === positional[0]!.field)) {
    return null;
  }

  const offset = positional[0]!.delta!;
  if (
    !positional.every(
      (item) => Math.abs(item.delta! - offset) <= ENVELOPE_TOLERANCE,
    )
  ) {
    return null;
  }

  const rideHeight = RIG_PROFILES[envelope.rigId].rideHeight;
  return {
    axis,
    offset,
    nodeIds: positional.map((item) => item.nodeId),
    matchesRideHeight:
      axis === "y" &&
      Math.abs(Math.abs(offset) - rideHeight) <= ENVELOPE_TOLERANCE,
  };
}

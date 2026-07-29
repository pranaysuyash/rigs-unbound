/**
 * Rig tool projections — what the Pegboard shows and what each entry does.
 *
 * A **pure selector**. The UI owns only whether the wheel is open, which entry
 * has focus, and animation. Everything else — label, current state, whether an
 * entry is usable, and why not — is derived here from canonical state.
 *
 * This replaces `RadialMenuItem.active`, a local boolean that was gameplay
 * authority living in a UI module. With projections, the wheel cannot disagree
 * with the simulation because it is not storing anything the simulation owns.
 *
 * Every entry carries its cost in the label. A tool state that reads as pure
 * upgrade is not a decision; it is a delay before the obvious choice.
 */

import {
  DEFAULT_TIRE_PRESSURE_PSI,
  MAX_TIRE_PRESSURE_PSI,
  MIN_TIRE_PRESSURE_PSI,
  type GameState,
} from "./contracts";

export type RigToolCommand =
  { type: "set-tire-pressure"; psi: number } | { type: "cycle-differential" };

/** The set of Pegboard entries that record a `rig-tool` replay command. */
export type RigToolId =
  "air-down-tires" | "air-up-tires" | "cycle-differential";

export type RigToolStatus = "available" | "engaged" | "blocked";

export interface RigToolProjection {
  id: string;
  label: string;
  /** What committing to this buys and what it costs, in the player's terms. */
  detail: string;
  status: RigToolStatus;
  /** Present only when `status` is `blocked`. */
  blockedReason: string | null;
  command: RigToolCommand | null;
}

/** Pressure the "air down" entry commits to. Deep enough to feel in mud. */
export const AIRED_DOWN_PSI = 16;

/**
 * The stable tool-id -> command contract.
 *
 * This is the single source of truth for what a Pegboard entry resolves to.
 * Both the live click handler (via `deriveRigToolProjections` below) and
 * replay validation (`replay-validator.ts`) read this same mapping, so a
 * recorded `{ toolId, command }` payload and a freshly-derived projection
 * can never drift into two different ideas of what "air-down-tires" means.
 */
export function expectedRigToolCommand(toolId: string): RigToolCommand | null {
  switch (toolId as RigToolId) {
    case "air-down-tires":
      return { type: "set-tire-pressure", psi: AIRED_DOWN_PSI };
    case "air-up-tires":
      return { type: "set-tire-pressure", psi: DEFAULT_TIRE_PRESSURE_PSI };
    case "cycle-differential":
      return { type: "cycle-differential" };
    default:
      return null;
  }
}

/**
 * Strictly parse a recorded `{ toolId, command }` replay payload against the
 * contract above. Accepts only the exact known toolId/command pairing —
 * not merely a well-typed command — so a corrupted or hand-edited record
 * (right shape, wrong psi; right psi, wrong toolId; extra fields) fails
 * loudly instead of silently reproducing an action nobody actually
 * requested. Live play may defensively clamp an out-of-range value; a
 * replayed command must reproduce the exact accepted historical intent or
 * be rejected.
 */
export function parseStrictRigToolCommand(
  toolId: unknown,
  command: unknown,
): RigToolCommand | null {
  if (typeof toolId !== "string" || toolId.length === 0) return null;
  const expected = expectedRigToolCommand(toolId);
  if (!expected) return null;
  if (!command || typeof command !== "object") return null;

  const keys = Object.keys(command as Record<string, unknown>).sort();
  if (expected.type === "set-tire-pressure") {
    if (keys.length !== 2 || keys[0] !== "psi" || keys[1] !== "type") {
      return null;
    }
    const candidate = command as { type?: unknown; psi?: unknown };
    if (candidate.type !== "set-tire-pressure") return null;
    if (typeof candidate.psi !== "number" || !Number.isFinite(candidate.psi)) {
      return null;
    }
    // Exact match, not "in range": a replayed command reproduces the exact
    // historical intent, and this contract only ever resolves to one of two
    // literal PSI values per toolId — anything else is not this tool's
    // command, whether or not it is a physically plausible pressure.
    if (candidate.psi !== expected.psi) return null;
    return expected;
  }

  if (keys.length !== 1 || keys[0] !== "type") return null;
  const candidate = command as { type?: unknown };
  if (candidate.type !== "cycle-differential") return null;
  return expected;
}

export function deriveRigToolProjections(
  state: GameState,
): readonly RigToolProjection[] {
  const rig = state.rigs[state.activeRigId];
  const tools = rig.tools;

  // Hover rigs have no tyres and no axle. Presenting these entries greyed out
  // would be noise; a rig simply does not carry tools it has no body for.
  const wheeled = rig.mobility.kind === "ground";

  const projections: RigToolProjection[] = [];

  if (wheeled) {
    const airedDown = tools.tirePressurePsi <= AIRED_DOWN_PSI;
    projections.push({
      id: "air-down-tires",
      label: `Air down · ${AIRED_DOWN_PSI} PSI`,
      detail: "More float in mud. Slower on hardpan.",
      status: airedDown ? "engaged" : "available",
      blockedReason: null,
      command: airedDown ? null : expectedRigToolCommand("air-down-tires"),
    });
    projections.push({
      id: "air-up-tires",
      label: `Air up · ${DEFAULT_TIRE_PRESSURE_PSI} PSI`,
      detail: "Faster on hardpan. Digs in on soft ground.",
      status:
        tools.tirePressurePsi >= DEFAULT_TIRE_PRESSURE_PSI
          ? "engaged"
          : "available",
      blockedReason: null,
      command:
        tools.tirePressurePsi >= DEFAULT_TIRE_PRESSURE_PSI
          ? null
          : expectedRigToolCommand("air-up-tires"),
    });

    projections.push({
      id: "cycle-differential",
      label: `Differential · ${tools.differentialMode}`,
      detail:
        tools.differentialMode === "locked"
          ? "Locked: climbs better, turns wider."
          : tools.differentialMode === "limited-slip"
            ? "Limited slip: some climb gain, mild scrub."
            : "Open: turns freely, spins a wheel in mud.",
      status: tools.differentialMode === "open" ? "available" : "engaged",
      blockedReason: null,
      command: expectedRigToolCommand("cycle-differential"),
    });
  }

  return projections;
}

/** Clamp helper shared with the command layer so bounds cannot drift apart. */
export function clampTirePressure(psi: number): number {
  return Math.min(MAX_TIRE_PRESSURE_PSI, Math.max(MIN_TIRE_PRESSURE_PSI, psi));
}

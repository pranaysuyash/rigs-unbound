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
  effectiveProfile,
  MAX_TIRE_PRESSURE_PSI,
  MIN_TIRE_PRESSURE_PSI,
  type GameState,
} from "./contracts";

export type RigToolCommand =
  { type: "set-tire-pressure"; psi: number } | { type: "cycle-differential" };

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

export function deriveRigToolProjections(
  state: GameState,
): readonly RigToolProjection[] {
  const rig = state.rigs[state.activeRigId];
  const profile = effectiveProfile(rig.id, rig.modules);
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
      command: airedDown
        ? null
        : { type: "set-tire-pressure", psi: AIRED_DOWN_PSI },
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
          : { type: "set-tire-pressure", psi: DEFAULT_TIRE_PRESSURE_PSI },
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
      command: { type: "cycle-differential" },
    });
  }

  // The winch is a fitted module, so its absence is a real, explainable block
  // rather than a hidden entry — the player should learn the part exists.
  const hasWinch = profile.capabilities.includes("winch");
  projections.push({
    id: "winch",
    label: "Winch",
    detail: "Pull the rig, or another rig, out of trouble.",
    status: hasWinch ? "available" : "blocked",
    blockedReason: hasWinch ? null : "No winch fitted.",
    command: null,
  });

  return projections;
}

/** Clamp helper shared with the command layer so bounds cannot drift apart. */
export function clampTirePressure(psi: number): number {
  return Math.min(MAX_TIRE_PRESSURE_PSI, Math.max(MIN_TIRE_PRESSURE_PSI, psi));
}

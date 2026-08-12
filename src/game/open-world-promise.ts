/**
 * The slice finale named in `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`
 * §5, "the open-world promise." Once the first night is survived, the
 * waterworks are settled, and the causeway to Sunken Flats is reopened, the
 * valley is legible as an open world rather than a single farmstead — the
 * player already has the freedom (the mission board already lists locked,
 * capability-gated contracts for Launch Ridge and Marsh Depot) and this
 * module marks the moment that freedom becomes narratively visible.
 *
 * Deliberately scoped: this does not build an escorted-ride cutscene (no
 * NPC-follow/escort system exists in this codebase to build that on) or a
 * new "choose next contract" UI (the mission board already is that UI;
 * duplicating it here would be a second contract-selection authority). What
 * it ships is the honest increment: a one-time state transition, a vista
 * narration naming the visible destinations, and — wired by the caller — a
 * camera change to the existing, already-connected `survey` mode. It does
 * not resurrect the still-orphaned `CAMERA_PRESETS["night-completion"]`
 * multiplier system (a separate, later camera-tuning task).
 */

export type OpenWorldPromiseStatus = "pending" | "revealed";

export interface OpenWorldPromiseState {
  id: "open-world-promise";
  status: OpenWorldPromiseStatus;
  revealedAtWorldMinutes: number | null;
}

export interface OpenWorldPromiseInputs {
  firstNightResolved: boolean;
  waterworksResolved: boolean;
  causewayReopened: boolean;
}

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export function createOpenWorldPromise(): OpenWorldPromiseState {
  return {
    id: "open-world-promise",
    status: "pending",
    revealedAtWorldMinutes: null,
  };
}

/**
 * Resolve the finale once all three prior beats are true. Idempotent: once
 * revealed, later calls return the same state unchanged regardless of what
 * the inputs say, so a save that reloads after dawn cannot un-reveal it.
 */
export function resolveOpenWorldPromise(
  state: OpenWorldPromiseState,
  worldMinutes: number,
  inputs: OpenWorldPromiseInputs,
): OpenWorldPromiseState {
  if (state.status !== "pending") return state;
  if (
    !inputs.firstNightResolved ||
    !inputs.waterworksResolved ||
    !inputs.causewayReopened
  ) {
    return state;
  }
  return {
    id: "open-world-promise",
    status: "revealed",
    revealedAtWorldMinutes: Math.max(0, worldMinutes),
  };
}

export const OPEN_WORLD_PROMISE_NARRATION =
  "Dawn breaks over the valley. From the lower switchback the old man points out what the night hid: the reopened causeway to Sunken Flats behind you, Marsh Depot waiting beyond the flooded basin for a rig that can ford it, the Launch Ridge summit for one that can jump the gap, and two signal sources the scanner can hear but not yet decode. The bargain is kept. Where you go next is yours to choose.";

/** The player-visible vista line, or null before the promise reveals. */
export function openWorldPromiseNarration(
  state: OpenWorldPromiseState,
): string | null {
  return state.status === "revealed" ? OPEN_WORLD_PROMISE_NARRATION : null;
}

/** Lenient recovery preserves older saves and rejects malformed/foreign records. */
export function recoverOpenWorldPromise(
  value: unknown,
): OpenWorldPromiseState {
  const fallback = createOpenWorldPromise();
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Record<string, unknown>;
  if (candidate.id !== "open-world-promise") return fallback;
  const revealed = candidate.status === "revealed";
  return {
    id: "open-world-promise",
    status: revealed ? "revealed" : "pending",
    revealedAtWorldMinutes:
      revealed && isFiniteNumber(candidate.revealedAtWorldMinutes)
        ? Math.max(0, candidate.revealedAtWorldMinutes)
        : null,
  };
}

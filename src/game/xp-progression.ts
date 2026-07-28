/**
 * ⚠️ QUARANTINED — DO NOT IMPORT FROM RUNTIME CODE (ADR-0036)
 *
 * This module implements universal XP and player levels. **ADR-0018 —
 * accepted by explicit operator sign-off — rejects exactly that:** the
 * canonical progression spine is per-rig Journey, per-verb Mastery, and
 * profile-level Insight, with no universal XP and no player level.
 *
 * The module is preserved as a record of an alternative progression policy that
 * was explored and not adopted. It is not dead code awaiting wiring.
 *
 * Importing this from any module reachable from an entry point fails
 * `npm run audit:reachability` and therefore `npm run verify:head`. That is
 * deliberate. If XP becomes a product direction, it needs a new ADR superseding
 * ADR-0018 with operator sign-off — not an import.
 */

/**
 * Optional Universal XP policy kernel.
 *
 * This namespace is deliberately separate from ProgressionState. It is usable
 * by an XP-first mode or an explicit hybrid mode, but the campaign's Journey,
 * Mastery, and Insight state remains the authority for capability progression.
 * Level and rung are derived from account XP so saved state has one numeric
 * source of truth per mode.
 */

export const XP_POLICY_SCHEMA_VERSION = 1 as const;

export interface XpRungDefinition {
  rung: number;
  requiredXp: number;
  label: string;
}

export const XP_RUNG_DEFINITIONS: readonly XpRungDefinition[] = [
  { rung: 0, requiredXp: 0, label: "Scavenger" },
  { rung: 1, requiredXp: 100, label: "Apprentice" },
  { rung: 2, requiredXp: 500, label: "Journeyman" },
  { rung: 3, requiredXp: 1_200, label: "Craftsman" },
  { rung: 4, requiredXp: 2_500, label: "Master" },
  { rung: 5, requiredXp: 5_000, label: "Grandmaster" },
  { rung: 6, requiredXp: 10_000, label: "Legend" },
];

export interface XpProgressionState {
  schemaVersion: typeof XP_POLICY_SCHEMA_VERSION;
  modeId: string;
  rulesetVersion: string;
  accountXp: number;
  perRigRestorationXp: Record<string, number>;
  prestige: number;
  awardedEventIds: readonly string[];
}

export interface XpRewardEvent {
  eventId: string;
  modeId: string;
  accountXp: number;
  rigId?: string;
  restorationXp?: number;
  sourceId: string;
}

export type XpRewardStatus =
  "applied" | "duplicate" | "mode-mismatch" | "invalid";

export interface XpRewardResult {
  state: XpProgressionState;
  status: XpRewardStatus;
}

export interface XpProgressionSnapshot {
  accountXp: number;
  level: number;
  rung: XpRungDefinition;
  nextRung: XpRungDefinition | null;
  xpIntoRung: number;
  perRigRestorationXp: Record<string, number>;
  prestige: number;
}

export function createInitialXpProgressionState(
  modeId: string,
  rulesetVersion = "xp-v1",
): XpProgressionState {
  return {
    schemaVersion: XP_POLICY_SCHEMA_VERSION,
    modeId,
    rulesetVersion,
    accountXp: 0,
    perRigRestorationXp: {},
    prestige: 0,
    awardedEventIds: [],
  };
}

/** Historical XP curve retained as a mode policy, not campaign authority. */
export function xpForLevel(level: number): number {
  if (!Number.isFinite(level) || level <= 1) return 0;
  return Math.floor(100 * Math.pow(Math.floor(level), 1.5));
}

export function levelFromXp(xp: number): number {
  if (!Number.isFinite(xp) || xp <= 0) return 1;
  return Math.max(1, Math.floor(Math.pow(xp / 100, 2 / 3)) + 1);
}

export function rungForXp(xp: number): XpRungDefinition {
  const normalizedXp = Number.isFinite(xp) ? Math.max(0, xp) : 0;
  let current = XP_RUNG_DEFINITIONS[0]!;
  for (const definition of XP_RUNG_DEFINITIONS) {
    if (normalizedXp >= definition.requiredXp) current = definition;
  }
  return current;
}

function nextRungForXp(xp: number): XpRungDefinition | null {
  const current = rungForXp(xp);
  return (
    XP_RUNG_DEFINITIONS.find(
      (definition) => definition.rung === current.rung + 1,
    ) ?? null
  );
}

function nonNegativeInteger(value: number): number | null {
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.floor(value);
}

/**
 * Apply one explicitly routed event. Replaying an event ID is a no-op, making
 * retries safe for hybrid modes and future persisted ledgers.
 */
export function applyXpReward(
  state: XpProgressionState,
  event: XpRewardEvent,
): XpRewardResult {
  if (!event.eventId || !event.sourceId || event.modeId !== state.modeId) {
    return {
      state,
      status: event.modeId !== state.modeId ? "mode-mismatch" : "invalid",
    };
  }
  if (state.awardedEventIds.includes(event.eventId)) {
    return { state, status: "duplicate" };
  }

  const accountXp = nonNegativeInteger(event.accountXp);
  const restorationXp = nonNegativeInteger(event.restorationXp ?? 0);
  const rigId = event.rigId?.trim();
  if (
    accountXp === null ||
    restorationXp === null ||
    (restorationXp > 0 && !rigId)
  ) {
    return { state, status: "invalid" };
  }

  return {
    state: {
      ...state,
      accountXp: state.accountXp + accountXp,
      perRigRestorationXp:
        rigId && restorationXp > 0
          ? {
              ...state.perRigRestorationXp,
              [rigId]: (state.perRigRestorationXp[rigId] ?? 0) + restorationXp,
            }
          : { ...state.perRigRestorationXp },
      awardedEventIds: [...state.awardedEventIds, event.eventId],
    },
    status: "applied",
  };
}

export function snapshotXpProgression(
  state: XpProgressionState,
): XpProgressionSnapshot {
  const rung = rungForXp(state.accountXp);
  return {
    accountXp: state.accountXp,
    level: levelFromXp(state.accountXp),
    rung,
    nextRung: nextRungForXp(state.accountXp),
    xpIntoRung: state.accountXp - rung.requiredXp,
    perRigRestorationXp: { ...state.perRigRestorationXp },
    prestige: state.prestige,
  };
}

/**
 * Local persistence.
 *
 * A save record is two halves composed into one payload: the strictly validated
 * `GameState`, and the bounded spatial sets in `GameWorld` (see the comment at
 * the top of `gameworld.ts` for why the split exists). Both are written together
 * and restored together, so there is never a moment where the rig's position and
 * the ground it ploughed disagree.
 *
 * Keys are versioned rather than migrated in place, which means an older build
 * still finds its own record if the player rolls back.
 */

import type { GameState } from "./contracts";
import type { GameWorld, WorldMemoryRecord } from "./gameworld";
import { createInitialState, recoverState, settleWorld } from "./state";

export const SAVE_KEY = "rigs-unbound.save.v7";
export const PREVIOUS_SAVE_KEY = "rigs-unbound.save.v6";
export const DRIFT_BERTH_SAVE_KEY = "rigs-unbound.save.v5";
export const FIELD_CLOCK_SAVE_KEY = "rigs-unbound.save.v4";
export const FIELD_02_SAVE_KEY = "rigs-unbound.save.v3";
export const RIG_LAB_SAVE_KEY = "rigs-unbound.save.v2";
export const LEGACY_SAVE_KEY = "rigs-unbound.save.v1";

/** Every key this build knows how to read, newest first. */
const READ_KEYS = [
  SAVE_KEY,
  PREVIOUS_SAVE_KEY,
  DRIFT_BERTH_SAVE_KEY,
  FIELD_CLOCK_SAVE_KEY,
  FIELD_02_SAVE_KEY,
  RIG_LAB_SAVE_KEY,
  LEGACY_SAVE_KEY,
] as const;

interface SavePayload {
  state: GameState;
  worldMemory: WorldMemoryRecord;
}

export interface LoadResult {
  state: GameState;
  status: "fresh" | "restored" | "migrated" | "recovered";
  message: string;
  loadDurationMs: number;
  /** The versioned storage slot read, when any. */
  sourceKey: (typeof READ_KEYS)[number] | null;
  /** Schema observed before recovery normalizes the state to the current shape. */
  sourceSchemaVersion: number | null;
  /** Whether the successful source payload included a world-memory half. */
  worldMemoryPresent: boolean;
  /** Populated only when a source record was rejected and replaced. */
  recoveryReason: "invalid-payload" | "storage-unavailable" | null;
}

export interface SaveResult {
  durationMs: number;
  bytes: number;
  saveKey: typeof SAVE_KEY;
  schemaVersion: GameState["schemaVersion"];
  /** Non-null when the write failed (e.g. quota exceeded, storage unavailable). */
  error?: string;
}

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

function schemaVersionOf(value: unknown): number | null {
  if (!value || typeof value !== "object") return null;
  const schemaVersion = (value as { schemaVersion?: unknown }).schemaVersion;
  return typeof schemaVersion === "number" && Number.isFinite(schemaVersion)
    ? schemaVersion
    : null;
}

/**
 * Read the newest record the browser holds and apply it to `world`.
 *
 * `world` is mutated (terrain deformation, felled trees, mapped cells) and the
 * returned state is settled onto the terrain before the caller's first step, so a
 * restored session never begins mid-fall.
 */
/**
 * Read only the seed from the newest save record, without applying anything.
 *
 * The world has to be constructed for the *right* seed before `loadState` pours
 * spatial memory into it. Previously boot built a default world, restored
 * deformation, felled obstacles, collected nodes and surveyed cells into it, and
 * then — if the record carried a different seed — threw that entire world away and
 * built another. The rigs survived; every trace they had left on the ground did not.
 *
 * Returns null when there is no readable record, so callers fall back to the
 * default seed.
 */
export function peekSavedSeed(storage: Storage): string | null {
  for (const key of READ_KEYS) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      return null;
    }
    if (raw === null) continue;
    try {
      const parsed = JSON.parse(raw) as unknown;
      const container = parsed as { state?: unknown };
      const stateCandidate =
        container && typeof container === "object" && container.state
          ? container.state
          : parsed;
      // Seed admission is state admission. Trusting a seed before the enclosing
      // record passes recovery can construct procedural terrain from a record
      // that loadState later rejects, leaving GameWorld and GameState divergent.
      return recoverState(stateCandidate)?.seed ?? null;
    } catch {
      // Unreadable record; the caller's default seed is the right fallback.
    }
    return null;
  }
  return null;
}

export function loadState(storage: Storage, world: GameWorld): LoadResult {
  const startedAt = now();

  let raw: string | null = null;
  let sourceKey: (typeof READ_KEYS)[number] | null = null;
  for (const key of READ_KEYS) {
    let value: string | null;
    try {
      value = storage.getItem(key);
    } catch {
      world.reset();
      const state = createInitialState(world.seed);
      state.lastDiagnostic =
        "Local storage is unavailable; this field will not restore progress.";
      settleWorld(state, world);
      return {
        state,
        status: "recovered",
        message: state.lastDiagnostic,
        loadDurationMs: now() - startedAt,
        sourceKey: null,
        sourceSchemaVersion: null,
        worldMemoryPresent: false,
        recoveryReason: "storage-unavailable",
      };
    }
    if (value !== null) {
      raw = value;
      sourceKey = key;
      break;
    }
  }

  if (raw === null) {
    const state = createInitialState();
    settleWorld(state, world);
    return {
      state,
      status: "fresh",
      message: "New field ready · progress saves locally",
      loadDurationMs: now() - startedAt,
      sourceKey: null,
      sourceSchemaVersion: null,
      worldMemoryPresent: false,
      recoveryReason: null,
    };
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    // v3+ wrap state alongside world memory; v1 and v2 stored state directly.
    const container = parsed as Partial<SavePayload>;
    const stateCandidate =
      container && typeof container === "object" && container.state
        ? container.state
        : parsed;
    const sourceSchemaVersion = schemaVersionOf(stateCandidate);

    const recovered = recoverState(stateCandidate);
    if (recovered) {
      if (recovered.seed !== world.seed) {
        throw new Error(
          `Save seed ${recovered.seed} does not match world seed ${world.seed}.`,
        );
      }
      const worldMemory =
        container && typeof container === "object"
          ? container.worldMemory
          : undefined;
      const worldMemoryPresent =
        worldMemory !== undefined && worldMemory !== null;
      if (worldMemory !== undefined && worldMemory !== null) {
        world.restore(worldMemory);
      } else {
        world.reset();
      }
      settleWorld(recovered, world);
      const migrated = sourceKey !== SAVE_KEY;
      return {
        state: recovered,
        status: migrated ? "migrated" : "restored",
        message: migrated
          ? "Earlier local save migrated"
          : "Local save restored",
        loadDurationMs: now() - startedAt,
        sourceKey,
        sourceSchemaVersion,
        worldMemoryPresent,
        recoveryReason: null,
      };
    }
  } catch {
    // The invalid payload is replaced below with a clean, versioned record.
  }

  world.reset();
  // Recovery must preserve the constructor invariant even when a caller did not
  // run seed preflight (or storage changed between preflight and load).
  const state = createInitialState(world.seed);
  state.lastDiagnostic =
    "An incompatible local record was replaced with a clean field.";
  settleWorld(state, world);
  return {
    state,
    status: "recovered",
    message: state.lastDiagnostic,
    loadDurationMs: now() - startedAt,
    sourceKey,
    sourceSchemaVersion:
      raw === null
        ? null
        : schemaVersionOf(
            (() => {
              try {
                const parsed = JSON.parse(raw) as unknown;
                const container = parsed as Partial<SavePayload>;
                return container &&
                  typeof container === "object" &&
                  container.state
                  ? container.state
                  : parsed;
              } catch {
                return null;
              }
            })(),
          ),
    worldMemoryPresent: false,
    recoveryReason: "invalid-payload",
  };
}

export function saveState(
  storage: Storage,
  state: GameState,
  world: GameWorld,
): SaveResult {
  const startedAt = now();
  const payload: SavePayload = { state, worldMemory: world.snapshot() };
  const serialized = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(serialized).byteLength;

  // Web Storage replaces one key atomically: if setItem throws, the prior value
  // remains unchanged. Never remove the canonical record before this write; that
  // creates a data-loss window and a temporary key that the load path cannot
  // truthfully order against the canonical save.
  try {
    storage.setItem(SAVE_KEY, serialized);
  } catch (err) {
    // Quota exceeded or storage unavailable: the game continues but the player
    // must know progress was not persisted. The prior save (if any) is intact.
    return {
      durationMs: now() - startedAt,
      bytes,
      saveKey: SAVE_KEY,
      schemaVersion: state.schemaVersion,
      error: err instanceof Error ? err.message : String(err),
    };
  }

  return {
    durationMs: now() - startedAt,
    bytes,
    saveKey: SAVE_KEY,
    schemaVersion: state.schemaVersion,
  };
}

export function clearState(storage: Storage): void {
  for (const key of READ_KEYS) {
    storage.removeItem(key);
  }
}

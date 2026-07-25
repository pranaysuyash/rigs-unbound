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

export const SAVE_KEY = "rigs-unbound.save.v4";
export const FIELD_02_SAVE_KEY = "rigs-unbound.save.v3";
export const RIG_LAB_SAVE_KEY = "rigs-unbound.save.v2";
export const LEGACY_SAVE_KEY = "rigs-unbound.save.v1";

/** Every key this build knows how to read, newest first. */
const READ_KEYS = [
  SAVE_KEY,
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
}

export interface SaveResult {
  durationMs: number;
  bytes: number;
}

function now(): number {
  return globalThis.performance?.now() ?? Date.now();
}

/**
 * Read the newest record the browser holds and apply it to `world`.
 *
 * `world` is mutated (terrain deformation, felled trees, mapped cells) and the
 * returned state is settled onto the terrain before the caller's first step, so a
 * restored session never begins mid-fall.
 */
export function loadState(storage: Storage, world: GameWorld): LoadResult {
  const startedAt = now();

  let raw: string | null = null;
  let sourceKey: (typeof READ_KEYS)[number] | null = null;
  for (const key of READ_KEYS) {
    const value = storage.getItem(key);
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
      message: "New field record. Home Valley surveyed.",
      loadDurationMs: now() - startedAt,
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

    const recovered = recoverState(stateCandidate);
    if (recovered) {
      if (container && typeof container === "object" && container.worldMemory) {
        world.restore(container.worldMemory);
      } else {
        world.reset();
      }
      settleWorld(recovered, world);
      const migrated = sourceKey !== SAVE_KEY;
      return {
        state: recovered,
        status: migrated ? "migrated" : "restored",
        message: migrated
          ? "Earlier record migrated onto the terrain world."
          : "Field record restored.",
        loadDurationMs: now() - startedAt,
      };
    }
  } catch {
    // The invalid payload is replaced below with a clean, versioned record.
  }

  world.reset();
  const state = createInitialState();
  state.lastDiagnostic =
    "An incompatible local record was replaced with a clean field.";
  settleWorld(state, world);
  return {
    state,
    status: "recovered",
    message: state.lastDiagnostic,
    loadDurationMs: now() - startedAt,
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
  storage.setItem(SAVE_KEY, serialized);
  return {
    durationMs: now() - startedAt,
    bytes: new TextEncoder().encode(serialized).byteLength,
  };
}

export function clearState(storage: Storage): void {
  for (const key of READ_KEYS) {
    storage.removeItem(key);
  }
}

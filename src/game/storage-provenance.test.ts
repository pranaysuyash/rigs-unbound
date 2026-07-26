import { describe, expect, it } from "vitest";
import { GameWorld } from "./gameworld";
import { FIELD_02_SAVE_KEY, SAVE_KEY, loadState, saveState } from "./storage";
import { createInitialState } from "./state";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  } as Storage;
}

describe("storage provenance", () => {
  it("describes a fresh field without inventing a source record", () => {
    const storage = memoryStorage();
    const result = loadState(storage, new GameWorld("FRESH-PROVENANCE"));

    expect(result).toMatchObject({
      status: "fresh",
      sourceKey: null,
      sourceSchemaVersion: null,
      worldMemoryPresent: false,
      recoveryReason: null,
    });
  });

  it("retains source-key and schema provenance when an older slot migrates", () => {
    const storage = memoryStorage();
    const state = createInitialState("MIGRATION-PROVENANCE");
    storage.setItem(FIELD_02_SAVE_KEY, JSON.stringify(state));

    const result = loadState(storage, new GameWorld(state.seed));

    expect(result).toMatchObject({
      status: "migrated",
      sourceKey: FIELD_02_SAVE_KEY,
      sourceSchemaVersion: state.schemaVersion,
      worldMemoryPresent: false,
      recoveryReason: null,
    });
  });

  it("reports rejected source provenance without retaining invalid world memory", () => {
    const storage = memoryStorage();
    storage.setItem(SAVE_KEY, "{not-json");

    const result = loadState(storage, new GameWorld("RECOVERY-PROVENANCE"));

    expect(result).toMatchObject({
      status: "recovered",
      sourceKey: SAVE_KEY,
      sourceSchemaVersion: null,
      worldMemoryPresent: false,
      recoveryReason: "invalid-payload",
    });
  });

  it("returns the canonical save key and schema from the existing save path", () => {
    const storage = memoryStorage();
    const state = createInitialState("SAVE-PROVENANCE");
    const result = saveState(storage, state, new GameWorld(state.seed));

    expect(result).toMatchObject({
      saveKey: SAVE_KEY,
      schemaVersion: state.schemaVersion,
    });
  });
});

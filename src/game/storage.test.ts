import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { GameWorld } from "./gameworld";
import { createUnboundPassageState } from "./unbound-passage";
import {
  DRIFT_BERTH_SAVE_KEY,
  FIELD_CLOCK_SAVE_KEY,
  FIELD_02_SAVE_KEY,
  loadState,
  peekSavedSeed,
  PREVIOUS_SAVE_KEY,
  SAVE_KEY,
  saveState,
} from "./storage";

function memoryStorage(): Storage {
  const values = new Map<string, string>();
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => {
      values.delete(key);
    },
    setItem: (key, value) => {
      values.set(key, value);
    },
  };
}

describe("versioned local persistence", () => {
  it("migrates a wrapped v3 state and restores its world memory into v7", () => {
    const storage = memoryStorage();
    const source = createInitialState("FIELD-02-WORLD-MIGRATION");
    source.rigs["utility-tractor"].distanceTravelled = 212;

    const flattenGroundRig = (id: "utility-tractor" | "toy-buggy") => {
      const rig = source.rigs[id];
      if (rig.mobility.kind !== "ground") {
        throw new Error("expected a legacy ground rig");
      }
      const { mobility, ...shared } = rig;
      return { ...shared, ...mobility };
    };

    storage.setItem(
      FIELD_02_SAVE_KEY,
      JSON.stringify({
        state: {
          ...source,
          schemaVersion: 3,
          surveyRoute: undefined,
          rigs: {
            "utility-tractor": flattenGroundRig("utility-tractor"),
            "toy-buggy": flattenGroundRig("toy-buggy"),
          },
        },
        worldMemory: {
          deformation: [{ cx: 1, cz: -2, delta: -0.13 }],
          felled: ["tree-proof"],
          collected: ["salvage-proof"],
          surveyed: [1234],
        },
      }),
    );

    const world = new GameWorld(source.seed);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("migrated");
    expect(loaded.state.schemaVersion).toBe(7);
    expect(loaded.state.rigs["utility-tractor"].distanceTravelled).toBe(212);
    expect(loaded.state.rigs["marsh-skimmer"].mobility.kind).toBe("hover");
    expect(world.felledObstacles.has("tree-proof")).toBe(true);
    expect(world.collectedNodes.has("salvage-proof")).toBe(true);
    expect(world.surveyedCells.has(1234)).toBe(true);
    expect(world.terrain.deformationCount()).toBe(1);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("reads the prior v5 slot before older records", () => {
    const storage = memoryStorage();
    const source = createInitialState("V5-SLOT");
    const prior = JSON.parse(JSON.stringify(source));
    prior.schemaVersion = 5;
    delete prior.surveyRoute;
    prior.salvage = 17;
    storage.setItem(
      DRIFT_BERTH_SAVE_KEY,
      JSON.stringify({
        state: prior,
        worldMemory: {
          deformation: [],
          felled: [],
          collected: [],
          surveyed: [],
        },
      }),
    );
    storage.setItem(
      FIELD_CLOCK_SAVE_KEY,
      JSON.stringify({ state: { schemaVersion: 99 }, worldMemory: {} }),
    );

    const world = new GameWorld(source.seed);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("migrated");
    expect(loaded.state.schemaVersion).toBe(7);
    expect(loaded.state.salvage).toBe(17);
  });

  it("migrates a v4 field record into the monotonic clock and recovery log", () => {
    const storage = memoryStorage();
    const source = createInitialState("V4-CLOCK-MIGRATION");
    const legacy = JSON.parse(JSON.stringify(source)) as Record<
      string,
      unknown
    >;
    legacy.schemaVersion = 4;
    legacy.phase = "gloam";
    legacy.elapsedMs = 24_000;
    delete legacy.worldTimeMinutes;
    delete legacy.recovery;
    delete legacy.surveyRoute;

    storage.setItem(
      FIELD_CLOCK_SAVE_KEY,
      JSON.stringify({
        state: legacy,
        worldMemory: {
          deformation: [],
          felled: [],
          collected: [],
          surveyed: [],
        },
      }),
    );

    const world = new GameWorld(source.seed);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("migrated");
    expect(loaded.state.schemaVersion).toBe(7);
    expect(loaded.state.worldTimeMinutes).toBe(1135);
    expect(loaded.state.phase).toBe("gloam");
    expect(loaded.state.recovery).toEqual({
      emergencyCount: 0,
      lastEmergencyAtMs: null,
    });
  });

  it("migrates the v6 slot into a fresh survey contract without overwriting it", () => {
    const storage = memoryStorage();
    const source = createInitialState("V6-SURVEY-MIGRATION");
    const prior = JSON.parse(JSON.stringify(source));
    prior.schemaVersion = 6;
    delete prior.surveyRoute;
    prior.salvage = 11;
    storage.setItem(
      PREVIOUS_SAVE_KEY,
      JSON.stringify({
        state: prior,
        worldMemory: {
          deformation: [],
          felled: [],
          collected: [],
          surveyed: [],
        },
      }),
    );

    const loaded = loadState(storage, new GameWorld(source.seed));

    expect(loaded).toMatchObject({
      status: "migrated",
      sourceKey: PREVIOUS_SAVE_KEY,
      sourceSchemaVersion: 6,
      state: {
        schemaVersion: 7,
        salvage: 11,
        surveyRoute: {
          id: "survey-route",
          status: "ready",
          startedAtMinutes: null,
          sighted: [],
          bestSightedCount: 0,
        },
      },
    });
    expect(storage.getItem(PREVIOUS_SAVE_KEY)).not.toBeNull();
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });

  it("rejects a current v7 record that omits its required survey contract", () => {
    const storage = memoryStorage();
    const source = createInitialState("V7-MISSING-SURVEY");
    const invalid = JSON.parse(JSON.stringify(source));
    delete invalid.surveyRoute;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        state: invalid,
        worldMemory: {
          deformation: [],
          felled: [],
          collected: [],
          surveyed: [],
        },
      }),
    );

    const loaded = loadState(storage, new GameWorld(source.seed));

    expect(loaded).toMatchObject({
      status: "recovered",
      sourceKey: SAVE_KEY,
      sourceSchemaVersion: 7,
      recoveryReason: "invalid-payload",
    });
  });

  it("persists the unbound passage contract through save and load", () => {
    const storage = memoryStorage();
    const source = createInitialState("UNBOUND-PASSAGE-STORAGE");
    source.unboundPassage = {
      ...createUnboundPassageState(),
      status: "open",
      revision: 3,
      openedByRigId: "utility-tractor",
      openedByLaneId: "jump-and-scout",
      failureCount: 1,
      recoveryLaneId: null,
      recoveryReason: null,
    };

    const saveResult = saveState(storage, source, new GameWorld(source.seed));
    expect(saveResult.error).toBeUndefined();

    const loaded = loadState(storage, new GameWorld(source.seed));
    expect(loaded.status).toBe("restored");
    expect(loaded.state.unboundPassage).toEqual(source.unboundPassage);
  });

  it("restores a fresh unbound passage contract when a current record lacks one", () => {
    const storage = memoryStorage();
    const source = JSON.parse(
      JSON.stringify(createInitialState("UNBOUND-PASSAGE-MISSING")),
    ) as Record<string, unknown>;
    delete source.unboundPassage;
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        state: source,
        worldMemory: {
          deformation: [],
          felled: [],
          collected: [],
          surveyed: [],
        },
      }),
    );

    const loaded = loadState(
      storage,
      new GameWorld(String(source.seed)),
    );
    expect(loaded.status).toBe("restored");
    expect(loaded.state.unboundPassage).toEqual(
      createUnboundPassageState(),
    );
  });

  it("admits a custom seed only after the full saved state is accepted", () => {
    const storage = memoryStorage();
    const source = createInitialState("ACCEPTED-CUSTOM-SEED");
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        state: source,
        worldMemory: {
          deformation: [{ cx: 2, cz: 3, delta: -0.08 }],
          felled: ["tree-custom-seed"],
          collected: [],
          surveyed: [42],
        },
      }),
    );

    const seed = peekSavedSeed(storage);
    expect(seed).toBe(source.seed);
    const world = new GameWorld(seed!);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("restored");
    expect(loaded.state.seed).toBe(world.seed);
    expect(world.felledObstacles.has("tree-custom-seed")).toBe(true);
    expect(world.surveyedCells.has(42)).toBe(true);
    expect(world.terrain.deformationCount()).toBe(1);
  });

  it("rejects an unaccepted saved seed before GameWorld construction", () => {
    const storage = memoryStorage();
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        state: {
          schemaVersion: 99,
          seed: "UNACCEPTED-SEED",
        },
        worldMemory: {
          deformation: [{ cx: 2, cz: 3, delta: -0.08 }],
          felled: ["tree-invalid"],
          collected: [],
          surveyed: [42],
        },
      }),
    );

    const initial = createInitialState();
    const seed = peekSavedSeed(storage);
    expect(seed).toBeNull();
    const world = new GameWorld(seed ?? initial.seed);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("recovered");
    expect(loaded.state.seed).toBe(world.seed);
    expect(loaded.state.seed).not.toBe("UNACCEPTED-SEED");
    expect(world.felledObstacles.size).toBe(0);
    expect(world.surveyedCells.size).toBe(0);
    expect(world.terrain.deformationCount()).toBe(0);
  });

  it("recovers onto the supplied world seed when preflight and load disagree", () => {
    const storage = memoryStorage();
    const source = createInitialState("SAVED-SEED");
    storage.setItem(
      SAVE_KEY,
      JSON.stringify({
        state: source,
        worldMemory: {
          deformation: [],
          felled: ["tree-wrong-world"],
          collected: [],
          surveyed: [],
        },
      }),
    );

    const world = new GameWorld("CALLER-WORLD-SEED");
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("recovered");
    expect(loaded.recoveryReason).toBe("invalid-payload");
    expect(loaded.state.seed).toBe(world.seed);
    expect(world.felledObstacles.size).toBe(0);
  });

  it("recovers without seed drift when storage reads are unavailable", () => {
    const storage = memoryStorage();
    storage.getItem = () => {
      throw new Error("storage disabled");
    };
    const world = new GameWorld("STORAGE-UNAVAILABLE-SEED");

    expect(peekSavedSeed(storage)).toBeNull();
    const loaded = loadState(storage, world);

    expect(loaded).toMatchObject({
      status: "recovered",
      recoveryReason: "storage-unavailable",
      sourceKey: null,
      worldMemoryPresent: false,
    });
    expect(loaded.state.seed).toBe(world.seed);
    expect(world.terrain.deformationCount()).toBe(0);
  });

  it("propagates storage.setItem errors into the SaveResult.error field", () => {
    const errorMessage = "Failed to execute 'setItem' on 'Storage': quota exceeded";
    const failingStorage: Storage = {
      get length() {
        return 0;
      },
      clear: () => {},
      getItem: () => null,
      key: () => null,
      removeItem: () => {},
      setItem: () => {
        throw new Error(errorMessage);
      },
    };

    const state = createInitialState();
    const world = new GameWorld(state.seed);
    const result = saveState(failingStorage, state, world);

    expect(result.error).toBeDefined();
    expect(result.error).toContain("quota exceeded");
    expect(result.bytes).toBeGreaterThan(0);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

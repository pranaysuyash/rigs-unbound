import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { GameWorld } from "./gameworld";
import {
  FIELD_CLOCK_SAVE_KEY,
  FIELD_02_SAVE_KEY,
  loadState,
  peekSavedSeed,
  PREVIOUS_SAVE_KEY,
  SAVE_KEY,
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
  it("migrates a wrapped v3 state and restores its world memory into v6", () => {
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
    expect(loaded.state.schemaVersion).toBe(6);
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
    prior.salvage = 17;
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
    storage.setItem(
      FIELD_CLOCK_SAVE_KEY,
      JSON.stringify({ state: { schemaVersion: 99 }, worldMemory: {} }),
    );

    const world = new GameWorld(source.seed);
    const loaded = loadState(storage, world);

    expect(loaded.status).toBe("migrated");
    expect(loaded.state.schemaVersion).toBe(6);
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
    expect(loaded.state.schemaVersion).toBe(6);
    expect(loaded.state.worldTimeMinutes).toBe(1135);
    expect(loaded.state.phase).toBe("gloam");
    expect(loaded.state.recovery).toEqual({
      emergencyCount: 0,
      lastEmergencyAtMs: null,
    });
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
});

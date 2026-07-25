import { describe, expect, it } from "vitest";
import { createInitialState } from "./state";
import { GameWorld } from "./gameworld";
import { FIELD_02_SAVE_KEY, loadState, SAVE_KEY } from "./storage";

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
  it("migrates a wrapped v3 state and restores its world memory into v4", () => {
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
    expect(loaded.state.schemaVersion).toBe(4);
    expect(loaded.state.rigs["utility-tractor"].distanceTravelled).toBe(212);
    expect(loaded.state.rigs["marsh-skimmer"].mobility.kind).toBe("hover");
    expect(world.felledObstacles.has("tree-proof")).toBe(true);
    expect(world.collectedNodes.has("salvage-proof")).toBe(true);
    expect(world.surveyedCells.has(1234)).toBe(true);
    expect(world.terrain.deformationCount()).toBe(1);
    expect(storage.getItem(SAVE_KEY)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { deriveSoilDisplacement, soilCellOf } from "./world-memory";
import { GameWorld } from "./gameworld";
import { advanceGame, createInitialState, publicState } from "./state";

describe("World Memory Soil Displacement System", () => {
  it("converts world coordinates to soil cell coordinates", () => {
    const [cx, cz] = soilCellOf(16, -24);
    expect(cx).toBe(4);
    expect(cz).toBe(-6);
  });

  it("derives displacement map from furrow marks in state", () => {
    const state = createInitialState("test-seed");
    state.furrows.push(
      {
        x: 10,
        z: 20,
        heading: 0,
        createdAt: 100,
        rigId: "utility-tractor",
        mode: "cut" as const,
      },
      {
        x: 10,
        z: 20,
        heading: 0,
        createdAt: 101,
        rigId: "utility-tractor",
        mode: "cut" as const,
      },
    );

    const map = deriveSoilDisplacement(state);
    expect(map.size).toBeGreaterThan(0);

    const cell = map.get("2,5");
    expect(cell).toBeDefined();
    expect(cell?.depth).toBeGreaterThan(0.12);
    expect(cell?.surfaceOverride).toBe("tilled");
  });
});

describe("horizon signal visibility is published once", () => {
  /**
   * The rail and the map must not each decide for themselves what the machine can
   * see, or a player ends up with two overlays disagreeing about the same hill. This
   * locks the single publication point, and locks that it is *derived* — a fresh
   * world publishes nothing until the kernel has stepped and looked.
   */
  it("publishes what the kernel measured, and nothing before it looks", () => {
    const world = new GameWorld("UNBOUND-260725");
    const state = createInitialState(world.seed);

    const before = publicState(state, world) as {
      worldMemory: { visibleSignals: string[] };
    };
    expect(before.worldMemory.visibleSignals).toEqual([]);

    advanceGame(state, world, 1000);

    const after = publicState(state, world) as {
      worldMemory: { visibleSignals: string[] };
    };
    expect(after.worldMemory.visibleSignals).toEqual([...world.visibleSignals]);
    // Standing at the Home Silo, its own signal is overhead and unmissable.
    expect(after.worldMemory.visibleSignals).toContain("home-silo");
  });

  it("keeps survey cadence runtime-only and rebuilds derived visibility after reset", () => {
    const world = new GameWorld("SURVEY-CADENCE");

    expect(world.claimSurveyRefresh("utility-tractor", 0, 0)).toBe(true);
    expect(world.claimSurveyRefresh("utility-tractor", 0, 0)).toBe(false);
    expect(world.claimSurveyRefresh("utility-tractor", 2, 0)).toBe(false);
    expect(world.claimSurveyRefresh("utility-tractor", 3, 0)).toBe(true);

    world.visibleSignals.add("home-silo");
    world.reset();

    expect(world.visibleSignals.size).toBe(0);
    expect(world.claimSurveyRefresh("utility-tractor", 3, 0)).toBe(true);
  });
});

describe("persistent field-condition memory", () => {
  it("keeps disturbed ground and its world-time response through spatial restore", () => {
    const world = new GameWorld("FIELD-CONDITION-MEMORY");
    const initialRevision = world.fieldConditionRevisionNumber();
    world.noteFieldWork(18, -24, 0.72);
    world.advanceFieldConditions(180, 0, () => 0.24);

    const before = world.fieldConditionAt(18, -24);
    const resistance = world.fieldErosionResistanceAt(18, -24);
    const restored = new GameWorld("FIELD-CONDITION-MEMORY");
    restored.restore(JSON.parse(JSON.stringify(world.snapshot())));
    const after = restored.fieldConditionAt(18, -24);

    expect(before).not.toBeNull();
    expect(after).toEqual(before);
    expect(after?.moistureRatio).toBeLessThan(0.72);
    expect(resistance).toBeLessThan(1);
    expect(world.fieldConditionRevisionNumber()).toBeGreaterThan(
      initialRevision,
    );
  });
});

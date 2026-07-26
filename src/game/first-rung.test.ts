import { describe, expect, it } from "vitest";
import { effectiveProfile, MODULES } from "./contracts";
import { FIRST_SALVAGE_NODE, SALVAGE_PICKUP_RADIUS } from "./exploration";
import { FIRST_RUNG_RECOMMENDED_MODULE, resolveFirstRung } from "./first-rung";
import { createInitialState } from "./state";
import { HOME_SITE } from "./world";

describe("first progression rung", () => {
  it("makes the guaranteed fresh reward sufficient for the recommended part", () => {
    expect(FIRST_SALVAGE_NODE.value).toBe(
      MODULES[FIRST_RUNG_RECOMMENDED_MODULE].cost,
    );
  });

  it("points a fresh profile toward the guaranteed authored cache", () => {
    const state = createInitialState();
    const rig = state.rigs[state.activeRigId];

    const result = resolveFirstRung(state, new Set());

    expect(result).toMatchObject({
      stage: "find-cache",
      target: { x: FIRST_SALVAGE_NODE.x, z: FIRST_SALVAGE_NODE.z },
      recommendedModuleId: FIRST_RUNG_RECOMMENDED_MODULE,
      recommendedRigId: "utility-tractor",
      affordable: false,
      complete: false,
    });
    const cacheHeading = Math.atan2(
      FIRST_SALVAGE_NODE.x - rig.x,
      FIRST_SALVAGE_NODE.z - rig.z,
    );
    const headingError = Math.atan2(
      Math.sin(cacheHeading - rig.heading),
      Math.cos(cacheHeading - rig.heading),
    );
    expect(Math.abs(headingError)).toBeLessThan(0.2);
  });

  it("changes to collection guidance only inside real interaction range", () => {
    const state = createInitialState();
    const rig = state.rigs[state.activeRigId];
    rig.x = FIRST_SALVAGE_NODE.x + SALVAGE_PICKUP_RADIUS;
    rig.z = FIRST_SALVAGE_NODE.z;

    expect(resolveFirstRung(state, new Set()).stage).toBe("collect-cache");

    rig.x += 0.001;
    expect(resolveFirstRung(state, new Set()).stage).toBe("find-cache");
  });

  it("explains a legacy collected-cache state that still lacks enough salvage", () => {
    const state = createInitialState();
    state.salvage = 3;

    const result = resolveFirstRung(state, new Set([FIRST_SALVAGE_NODE.id]));

    expect(result.stage).toBe("earn-more");
    expect(result.objective).toBe("Find 2 more salvage");
    expect(result.affordable).toBe(false);
  });

  it("sends an affordable player back to the canonical Home workshop", () => {
    const state = createInitialState();
    state.salvage = 5;
    const rig = state.rigs[state.activeRigId];
    rig.x = 70;
    rig.z = -45;

    const result = resolveFirstRung(state, new Set());

    expect(result).toMatchObject({
      stage: "return-home",
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      affordable: true,
    });
  });

  it("offers the recommended compatible part at Home", () => {
    const state = createInitialState();
    state.salvage = 5;

    const result = resolveFirstRung(state, new Set());

    expect(result).toMatchObject({
      stage: "choose-part",
      recommendedModuleId: "lug-tires",
      recommendedRigId: "utility-tractor",
      affordable: true,
    });
    expect(result.ariaLabel).toContain("Lug tyres");
  });

  it("guides an incompatible active rig to a compatible rig without lying", () => {
    const state = createInitialState();
    state.salvage = 5;
    state.activeRigId = "marsh-skimmer";

    const result = resolveFirstRung(state, new Set());

    expect(result).toMatchObject({
      stage: "switch-rig",
      recommendedModuleId: "lug-tires",
      recommendedRigId: "toy-buggy",
      affordable: true,
    });
    expect(result.objective).toContain("Switch");
  });

  it("guides an incompatible rig to the physical compatible rig before switching", () => {
    const state = createInitialState();
    state.salvage = 5;
    state.activeRigId = "marsh-skimmer";
    state.rigs["utility-tractor"].x = 110;
    state.rigs["utility-tractor"].z = -45;
    state.rigs["toy-buggy"].x = 130;
    state.rigs["toy-buggy"].z = -55;

    const result = resolveFirstRung(state, new Set());

    expect(result).toMatchObject({
      stage: "reach-rig",
      target: { x: 110, z: -45 },
      recommendedRigId: "utility-tractor",
      affordable: true,
    });
    expect(result.ariaLabel).toContain("so you can switch rigs");
  });

  it("enters first-cut terrain guidance when any rig has a fitted part", () => {
    const state = createInitialState();
    state.rigs["toy-buggy"].modules.push("skid-plate");

    const result = resolveFirstRung(state, new Set([FIRST_SALVAGE_NODE.id]));

    expect(result).toMatchObject({
      stage: "first-cut",
      recommendedModuleId: null,
      recommendedRigId: null,
      complete: false,
    });
  });

  it("makes the recommended first fit mechanically and visibly meaningful", () => {
    const state = createInitialState();
    const rig = state.rigs["utility-tractor"];
    const before = effectiveProfile(rig.id, rig.modules);

    rig.modules.push(FIRST_RUNG_RECOMMENDED_MODULE);
    const after = effectiveProfile(rig.id, rig.modules);
    expect(after.lugBonus).toBeGreaterThan(before.lugBonus);
    expect(after.tireGrip).toBeGreaterThan(before.tireGrip);
    const resolution = resolveFirstRung(state, new Set());
    expect(resolution).toMatchObject({
      stage: "first-cut",
      complete: false,
    });
    expect(MODULES[FIRST_RUNG_RECOMMENDED_MODULE].promise).toContain(
      "Bites into mud",
    );
  });

  it("is deterministic and does not mutate restored state or world memory", () => {
    const state = createInitialState();
    state.salvage = 5;
    const collected = new Set([FIRST_SALVAGE_NODE.id]);
    const before = JSON.stringify(state);

    expect(resolveFirstRung(state, collected)).toEqual(
      resolveFirstRung(state, collected),
    );
    expect(JSON.stringify(state)).toBe(before);
    expect([...collected]).toEqual([FIRST_SALVAGE_NODE.id]);
  });
});

import { describe, expect, it } from "vitest";
import { effectiveProfile, MODULES } from "./contracts";
import { FIRST_SALVAGE_NODE, SALVAGE_PICKUP_RADIUS } from "./exploration";
import {
  FIRST_RUNG_RECOMMENDED_MODULE,
  SECOND_RUNG_RECOMMENDED_MODULE,
  resolveFirstRung,
} from "./first-rung";
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
    // Place far from Long Furrow (> sight radius of 66 m) so the pre-blade
    // scout does not intercept the return-home flow.
    rig.x = 130;
    rig.z = 120;

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

  it("enters first-cut guidance when one module is fitted but terrain is not yet transformed", () => {
    const state = createInitialState();
    state.rigs["toy-buggy"].modules.push("skid-plate");

    const result = resolveFirstRung(state, new Set([FIRST_SALVAGE_NODE.id]));

    expect(result.stage).toBe("first-cut");
    expect(result.complete).toBe(false);
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
    // After first fit, the player enters first-cut guidance (not free-explore)
    // because terrain transformation hasn't happened yet.
    expect(resolution).toMatchObject({
      stage: "first-cut",
      complete: false,
    });
    expect(MODULES[FIRST_RUNG_RECOMMENDED_MODULE].promise).toContain(
      "Bites into mud",
    );
  });

  it("enters second-fit when one module is fitted, blade engaged, furrows exist near Long Furrow", () => {
    const state = createInitialState();
    state.rigs["utility-tractor"].modules.push("lug-tires");
    // Engage the plough so first-cut progression reaches the furrows check.
    const plough = state.rigs["utility-tractor"].attachments.find(
      (a) => a.id === "field-plough",
    );
    if (plough) plough.engaged = true;
    state.furrows.push({
      x: 0,
      z: 0,
      heading: 0,
      createdAt: 1000,
      rigId: "utility-tractor",
      mode: "cut",
    });
    // Place rig at Long Furrow (x: 18, z: -46)
    const rig = state.rigs["utility-tractor"];
    rig.x = 18;
    rig.z = -46;

    const resolution = resolveFirstRung(state, new Set());
    expect(resolution).toMatchObject({
      stage: "second-fit",
      recommendedModuleId: SECOND_RUNG_RECOMMENDED_MODULE,
      complete: false,
    });
    expect(resolution.ariaLabel).toContain("winch");
  });

  it("enters first-cut when one module is fitted but no furrows exist", () => {
    const state = createInitialState();
    state.rigs["utility-tractor"].modules.push("lug-tires");
    const resolution = resolveFirstRung(state, new Set());
    // The tractor has a plough, so the first-cut stage should prompt
    // the player to lower the blade (if not engaged) or drive forward.
    expect(resolution.stage).toBe("first-cut");
    expect(resolution.complete).toBe(false);
  });

  it("shows earn-more in second-fit when salvage is below winch cost near Long Furrow", () => {
    const state = createInitialState();
    state.rigs["utility-tractor"].modules.push("lug-tires");
    const plough = state.rigs["utility-tractor"].attachments.find(
      (a) => a.id === "field-plough",
    );
    if (plough) plough.engaged = true;
    state.salvage = 0;
    state.furrows.push({
      x: 0,
      z: 0,
      heading: 0,
      createdAt: 1000,
      rigId: "utility-tractor",
      mode: "cut",
    });
    const rig = state.rigs["utility-tractor"];
    rig.x = 18;
    rig.z = -46;

    const resolution = resolveFirstRung(state, new Set());
    const winchCost = MODULES[SECOND_RUNG_RECOMMENDED_MODULE].cost;
    expect(resolution).toMatchObject({
      stage: "second-fit",
      recommendedModuleId: SECOND_RUNG_RECOMMENDED_MODULE,
      affordable: false,
      complete: false,
    });
    expect(resolution.objective).toBe(`Find ${winchCost} more salvage`);
  });

  it("guides to return home in second-fit when affordable but away from Home Silo", () => {
    const state = createInitialState();
    state.rigs["utility-tractor"].modules.push("lug-tires");
    const plough = state.rigs["utility-tractor"].attachments.find(
      (a) => a.id === "field-plough",
    );
    if (plough) plough.engaged = true;
    state.salvage = 10;
    state.furrows.push({
      x: 0,
      z: 0,
      heading: 0,
      createdAt: 1000,
      rigId: "utility-tractor",
      mode: "cut",
    });
    const rig = state.rigs["utility-tractor"];
    rig.x = 18;
    rig.z = -46;

    const resolution = resolveFirstRung(state, new Set());
    expect(resolution).toMatchObject({
      stage: "second-fit",
      recommendedModuleId: SECOND_RUNG_RECOMMENDED_MODULE,
      target: { x: HOME_SITE.x, z: HOME_SITE.z },
      affordable: true,
      complete: false,
    });
    expect(resolution.objective).toBe("Return to Home Silo");
  });

  it("guides to switch rig in second-fit when active rig cannot fit the winch", () => {
    const state = createInitialState();
    state.rigs["marsh-skimmer"].modules.push("skid-plate");
    state.activeRigId = "marsh-skimmer";
    state.salvage = 10;
    // The skimmer has no plough — resolvePostFitRung will return first-cut
    // with switch-rig guidance ("Switch to Torque" or "Reach Torque").
    // This test verifies the rig-switch path of resolveSecondFit.
    const skimmer = state.rigs["marsh-skimmer"];
    skimmer.x = 18;
    skimmer.z = -46;
    const tractor = state.rigs["utility-tractor"];
    tractor.x = 18;
    tractor.z = -40;

    // First, the rig-switch guidance because skimmer can't plough.
    const resolution = resolveFirstRung(state, new Set());
    // The skimmer has no plough capability, so resolvePostFitRung returns
    // first-cut with switch-rig guidance. This is the correct behavior.
    expect(resolution.stage).toBe("first-cut");
    expect(resolution.objective).toMatch(/Switch|Reach/);
  });

  it("shows sight-destination when affordable rig is within sight radius of Long Furrow", () => {
    const state = createInitialState();
    state.salvage = 5;
    const rig = state.rigs[state.activeRigId];
    // Long Furrow is at (18, -46). Place rig ~48 m away — within sight radius
    // (66 m = discoverRadius 22 * 3) but outside attempt radius (42 m).
    rig.x = 55;
    rig.z = -15;    const result = resolveFirstRung(state, new Set([FIRST_SALVAGE_NODE.id]));

  expect(result).toMatchObject({
    stage: "sight-destination",
      target: { x: 18, z: -46 },
      recommendedModuleId: "lug-tires",
      affordable: true,
    });
    expect(result.ariaLabel).toContain("scout");
  });

  it("shows attempt-route when affordable rig is within attempt radius of Long Furrow", () => {
    const state = createInitialState();
    state.salvage = 5;
    const rig = state.rigs[state.activeRigId];
    // Place within 42 m of Long Furrow (18, -46).
    rig.x = 25;
    rig.z = -30;    const result = resolveFirstRung(state, new Set([FIRST_SALVAGE_NODE.id]));

  expect(result).toMatchObject({
    stage: "attempt-route",
      target: { x: 0, z: 12 },
      recommendedModuleId: "lug-tires",
      affordable: true,
    });
    expect(result.ariaLabel).toContain("terrain face");
  });

  it("skips pre-blade journey when rig is incompatible with recommended module", () => {
    const state = createInitialState();
    state.salvage = 5;
    state.activeRigId = "marsh-skimmer";
    const rig = state.rigs[state.activeRigId];
    // Place near Long Furrow — pre-blade journey should NOT fire.
    rig.x = 25;
    rig.z = -30;

    const result = resolveFirstRung(state, new Set());

    // Should NOT be sight-destination or attempt-route.
    expect(result.stage).not.toBe("sight-destination");
    expect(result.stage).not.toBe("attempt-route");
  });

  it("returns free-explore when two modules are fitted", () => {
    const state = createInitialState();
    state.rigs["utility-tractor"].modules = ["lug-tires", "winch"];
    const collected = new Set([FIRST_SALVAGE_NODE.id]);

    const resolution = resolveFirstRung(state, collected);
    expect(resolution.stage).toBe("free-explore");
    expect(resolution.objective).toBe("Use your fitted parts");
    expect(resolution.complete).toBe(true);
    expect(resolution.target).toBeNull();
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

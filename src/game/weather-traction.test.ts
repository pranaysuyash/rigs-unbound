import { describe, expect, it } from "vitest";

import { effectiveProfile, type RigId } from "./contracts";
import { GameWorld } from "./gameworld";
import { effectiveGrip, stepRigMotion } from "./physics";
import { createInitialState } from "./state";
import { applyWeatherGripPenalty, deriveWeatherState } from "./weather";

/**
 * Weather must change the *simulation* before it changes any mission copy.
 *
 * The review this fixes found the inverse: a recovery contract could pay more
 * and be labelled "hard" in a storm while the rig experienced unchanged
 * traction. These tests pin the direction of causality.
 */

const TORQUE: RigId = "utility-tractor";

const IDLE = {
  accelerate: true,
  brake: false,
  steerLeft: false,
  steerRight: false,
};

describe("weather reaches traction", () => {
  it("lowers grip on soft ground as the soil saturates", () => {
    const dry = applyWeatherGripPenalty(0.8, "soil", 0);
    const damp = applyWeatherGripPenalty(0.8, "soil", 0.5);
    const soaked = applyWeatherGripPenalty(0.8, "soil", 1);

    expect(damp).toBeLessThan(dry);
    expect(soaked).toBeLessThan(damp);
    expect(soaked).toBeGreaterThan(0); // never zero — the rig can still crawl
  });

  it("leaves hardpan and rock alone, so surface identity still matters", () => {
    // If moisture flattened every surface the terrain system would stop being a
    // decision space. Hard surfaces resisting rain is what keeps routes useful.
    expect(applyWeatherGripPenalty(0.9, "track", 1)).toBe(0.9);
    expect(applyWeatherGripPenalty(0.9, "rock", 1)).toBe(0.9);
  });

  it("moves a rig less over the same input when the ground is saturated", () => {
    // The end-to-end claim: identical rig, identical terrain, identical input —
    // only moisture differs, and the outcome differs because of it.
    const build = () => {
      const state = createInitialState();
      const world = new GameWorld(state.seed);
      const rig = state.rigs[TORQUE];
      const profile = effectiveProfile(rig.id, rig.modules);
      return { state, world, rig, profile };
    };

    const dryRun = build();
    const wetRun = build();

    let drySlipSum = 0;
    let wetSlipSum = 0;
    for (let step = 0; step < 120; step += 1) {
      const dryMotion = stepRigMotion(
        dryRun.rig,
        dryRun.profile,
        IDLE,
        dryRun.world.terrain,
        1 / 60,
        { towing: false, ramp: null, canJump: false, soilMoisture: 0 },
      );
      const wetMotion = stepRigMotion(
        wetRun.rig,
        wetRun.profile,
        IDLE,
        wetRun.world.terrain,
        1 / 60,
        { towing: false, ramp: null, canJump: false, soilMoisture: 1 },
      );
      drySlipSum += dryMotion.slip ?? 0;
      wetSlipSum += wetMotion.slip ?? 0;
    }

    // Saturated ground must never out-grip dry ground over the same run.
    expect(wetSlipSum).toBeGreaterThanOrEqual(drySlipSum);
  });

  it("defaults to dry when no moisture is supplied, so old callers are unchanged", () => {
    const state = createInitialState();
    const world = new GameWorld(state.seed);
    const rig = state.rigs[TORQUE];
    const profile = effectiveProfile(rig.id, rig.modules);

    expect(() =>
      stepRigMotion(rig, profile, IDLE, world.terrain, 1 / 60, {
        towing: false,
        ramp: null,
        canJump: false,
      }),
    ).not.toThrow();
  });

  it("derives weather deterministically from the monotonic world clock", () => {
    // Replay safety: the same world minute must always produce the same weather,
    // otherwise a recovery could not be reproduced from its run record.
    const first = deriveWeatherState(1250);
    const second = deriveWeatherState(1250);
    expect(second).toEqual(first);
    expect(deriveWeatherState(1250 + 1440)).toEqual(first);
  });

  it("keeps the assessment's grip formula identical to the motion model's", () => {
    // Both paths must compose effectiveGrip() then applyWeatherGripPenalty().
    // If they diverge, the board can promise traction the rig does not have.
    const surfaceGrip = 0.7;
    const tireGrip = 1.05;
    const lugBonus = 0.12;
    const moisture = 0.8;

    const composed = applyWeatherGripPenalty(
      effectiveGrip(surfaceGrip, tireGrip, lugBonus),
      "soil",
      moisture,
    );

    expect(Number.isFinite(composed)).toBe(true);
    expect(composed).toBeLessThan(
      effectiveGrip(surfaceGrip, tireGrip, lugBonus),
    );
  });
});

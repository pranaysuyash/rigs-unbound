import { describe, expect, it } from "vitest";

import { effectiveProfile, type RigId } from "./contracts";
import { deriveRigFeedback } from "./feedback";
import { GameWorld } from "./gameworld";
import { stepRigMotion } from "./physics";
import { createInitialState } from "./state";

/**
 * Steering direction, pinned to what the player sees.
 *
 * The chase camera sits BEHIND the rig looking along +forward. For a rig facing
 * world +Z, Three.js `lookAt` gives the camera a right-axis of world −X, so
 * **screen-right is world −X**. The Right key must therefore move the rig
 * toward −X, and the visible front wheels must yaw toward −X.
 *
 * These tests exist because the two halves disagreed in production: the wheels
 * yawed the correct way while the body's heading integrated the opposite way —
 * a mirror error introduced by deriving "left" from a head-on view of the rig
 * instead of the chase viewer's seat. Asserting both halves against the same
 * world axis makes the agreement itself the invariant.
 */

const TORQUE: RigId = "utility-tractor";
const DRIFT: RigId = "marsh-skimmer";

const RIGHT = {
  accelerate: true,
  brake: false,
  steerLeft: false,
  steerRight: true,
};
const LEFT = {
  accelerate: true,
  brake: false,
  steerLeft: true,
  steerRight: false,
};

function driveStraightFacingPlusZ(
  rigId: RigId,
  input: typeof RIGHT,
  steps: number,
) {
  const state = createInitialState();
  const world = new GameWorld(state.seed);
  const rig = state.rigs[rigId];
  // Face world +Z exactly: forward = (sin 0, cos 0) = (0, +1).
  rig.heading = 0;
  rig.x = 0;
  rig.z = -60;
  const profile = effectiveProfile(rig.id, rig.modules);
  for (let step = 0; step < steps; step += 1) {
    stepRigMotion(rig, profile, input, world.terrain, 1 / 60, {
      towing: false,
      ramp: null,
      canJump: false,
      soilMoisture: 0,
      tools: rig.tools,
    });
  }
  return rig;
}

describe("the Right key moves the rig toward screen-right", () => {
  it("carries a ground rig toward world −X when facing +Z", () => {
    const rig = driveStraightFacingPlusZ(TORQUE, RIGHT, 240);
    // Screen-right for the chase viewer is world −X.
    expect(rig.x).toBeLessThan(-0.5);
    // And the mirrored key goes the mirrored way.
    const leftRig = driveStraightFacingPlusZ(TORQUE, LEFT, 240);
    expect(leftRig.x).toBeGreaterThan(0.5);
  });

  it("carries the hover rig the same way — one steering convention", () => {
    const rig = driveStraightFacingPlusZ(DRIFT, RIGHT, 240);
    expect(rig.x).toBeLessThan(-0.5);
  });

  it("keeps the visible front wheels agreeing with the travel direction", () => {
    // The regression this file exists for: wheels correct, body mirrored.
    const state = createInitialState();
    const world = new GameWorld(state.seed);
    const rig = state.rigs[TORQUE];
    rig.heading = 0;
    rig.x = 0;
    rig.z = -60;
    const profile = effectiveProfile(rig.id, rig.modules);
    for (let step = 0; step < 120; step += 1) {
      stepRigMotion(rig, profile, RIGHT, world.terrain, 1 / 60, {
        towing: false,
        ramp: null,
        canJump: false,
        soilMoisture: 0,
        tools: rig.tools,
      });
    }

    const feedback = deriveRigFeedback(rig, profile, false);
    // Front pivots get rotation.y = steeringAngle relative to the body. A
    // negative yaw at heading 0 points the wheel toward world −X.
    const wheelPointsTowardX = Math.sin(rig.heading + feedback.steeringAngle);
    const bodyDriftedTowardX = Math.sign(rig.x);

    expect(Math.sign(wheelPointsTowardX)).toBe(bodyDriftedTowardX);
    expect(bodyDriftedTowardX).toBe(-1); // both toward −X: screen-right
  });

  it("backs toward its right with the wheel turned right, like a real car", () => {
    const REVERSE_RIGHT = {
      accelerate: false,
      brake: true,
      steerLeft: false,
      steerRight: true,
    };
    const rig = driveStraightFacingPlusZ(TORQUE, REVERSE_RIGHT, 300);
    // Bicycle model: heading rate = (v/L)·tan(δ). In reverse (v<0) with the
    // wheels at δ<0 (toward −X), the NOSE swings toward +X while the tail-first
    // path curves toward −X — the car backs up and to its right, exactly like a
    // real car. The position therefore still drifts toward −X (screen-right).
    expect(rig.x).toBeLessThan(-0.05);
    expect(rig.heading).toBeGreaterThan(0); // nose visibly swings the other way
  });
});

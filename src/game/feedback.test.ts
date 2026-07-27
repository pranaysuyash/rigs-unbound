import { describe, expect, it } from "vitest";
import { effectiveProfile } from "./contracts";
import { deriveRigFeedback } from "./feedback";
import { createInitialState } from "./state";

describe("rig perception contract", () => {
  it("turns simulation telemetry into bounded shared feedback", () => {
    const state = createInitialState("FEEDBACK");
    const rig = state.rigs["toy-buggy"];
    const profile = effectiveProfile(rig.id, rig.modules);
    rig.speed = profile.topSpeed * 0.8;
    rig.steering = 0.7;
    rig.strain = 0.35;
    rig.telemetry.engineLoad = 0.9;
    rig.telemetry.grip = 0.82;
    rig.telemetry.slip = 0.4;

    const feedback = deriveRigFeedback(rig, profile);

    expect(feedback.speedRatio).toBeCloseTo(0.8);
    expect(feedback.tractionLoss).toBe(0.4);
    expect(feedback.driveLoad).toBeGreaterThan(0.7);
    expect(feedback.lateralLoad).toBeGreaterThan(0);
    expect(feedback.steeringAngle).toBeGreaterThan(0.2);
    expect(feedback.bodyRollOffset).toBeLessThan(0);
    expect(feedback.bodyPitchOffset).toBeLessThan(0);
    expect(feedback.cameraForwardLook).toBeGreaterThan(0);
    expect(feedback.cameraLateralLook).toBeLessThan(0);
    expect(feedback.speedFovBoost).toBeGreaterThan(0);
  });

  it("clamps optional camera and body exaggeration under reduced motion", () => {
    const state = createInitialState("REDUCED-MOTION");
    const rig = state.rigs["utility-tractor"];
    const profile = effectiveProfile(rig.id, rig.modules);
    rig.speed = profile.topSpeed;
    rig.steering = 1;
    rig.strain = 1;
    rig.telemetry.engineLoad = 1;
    rig.telemetry.grip = 1;
    rig.telemetry.slip = 0.5;

    const normal = deriveRigFeedback(rig, profile);
    const reduced = deriveRigFeedback(rig, profile, true);

    expect(reduced.motionScale).toBe(0.32);
    expect(reduced.speedFovBoost).toBe(0);
    expect(Math.abs(reduced.bodyRollOffset)).toBeLessThan(
      Math.abs(normal.bodyRollOffset),
    );
    expect(Math.abs(reduced.bodyPitchOffset)).toBeLessThan(
      Math.abs(normal.bodyPitchOffset),
    );
    expect(reduced.cameraForwardLook).toBeLessThan(normal.cameraForwardLook);
    expect(reduced.steeringAngle).toBe(normal.steeringAngle);
  });

  it("uses bank and cushion loss for hover feedback without inventing wheels", () => {
    const state = createInitialState("HOVER-FEEDBACK");
    const rig = state.rigs["marsh-skimmer"];
    const profile = effectiveProfile(rig.id, rig.modules);
    rig.speed = profile.topSpeed * 0.6;
    rig.steering = -0.8;
    rig.telemetry.grip = 0.65;
    rig.telemetry.slip = 0.35;

    const feedback = deriveRigFeedback(rig, profile);

    expect(feedback.steeringAngle).toBe(0);
    expect(feedback.lateralLoad).toBeLessThan(0);
    expect(feedback.bodyRollOffset).toBeGreaterThan(0);
    expect(feedback.tractionLoss).toBe(0.35);
  });
});

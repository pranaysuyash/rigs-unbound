import * as THREE from "three";
import { beforeEach, describe, expect, it } from "vitest";

import { VehicleAnimationSystem, type RigPresentationFrame } from "./animation";
import { effectiveProfile, type RigId, type RigState } from "./contracts";
import { deriveRigFeedback } from "./feedback";
import type { RigParts } from "./renderer";
import { createInitialState } from "./state";

const RIG: RigId = "utility-tractor";

function buildParts(wheelCount = 4): RigParts {
  const root = new THREE.Group();
  const wheels: THREE.Group[] = [];
  const steeringPivots: THREE.Group[] = [];
  const wheelRestY: number[] = [];

  for (let index = 0; index < wheelCount; index += 1) {
    const steeringPivot = new THREE.Group();
    const spin = new THREE.Group();
    steeringPivot.position.y = 1;
    steeringPivot.add(spin);
    root.add(steeringPivot);
    wheels.push(spin);
    steeringPivots.push(steeringPivot);
    wheelRestY.push(1);
  }

  // The cockpit control is discovered by name, exactly as the rigs author it.
  const steeringColumn = new THREE.Group();
  const steeringWheel = new THREE.Group();
  steeringWheel.name = "steeringWheel";
  steeringColumn.add(steeringWheel);
  root.add(steeringColumn);

  const ploughPivot = new THREE.Group();
  root.add(ploughPivot);

  const lugVisual = new THREE.Object3D();
  const marker = new THREE.Object3D();

  return {
    root,
    hoodCameraSocket: new THREE.Object3D(),
    wheels,
    steeringPivots,
    wheelRestY,
    moduleVisuals: { "lug-tires": [lugVisual] },
    ploughPivot,
    headlights: new THREE.SpotLight(),
    frontMarker: marker,
    rearMarker: marker,
  };
}

function frameFor(rigState: RigState, conditionImpact = false) {
  const profile = effectiveProfile(rigState.id, rigState.modules);
  return {
    rigState,
    feedback: deriveRigFeedback(rigState, profile, false),
    conditionImpact,
  } satisfies RigPresentationFrame;
}

function tick(
  system: VehicleAnimationSystem,
  rigState: RigState,
  delta = 1 / 60,
  time = 1,
): void {
  system.update(delta, time, new Map([[RIG, frameFor(rigState)]]));
}

describe("vehicle animation system", () => {
  let system: VehicleAnimationSystem;
  let parts: RigParts;
  let rigState: RigState;

  beforeEach(() => {
    system = new VehicleAnimationSystem();
    parts = buildParts();
    system.registerRig(RIG, parts);
    rigState = structuredClone(createInitialState().rigs[RIG]);
  });

  it("composes simulation attitude with the presentation lean offset", () => {
    // Regression guard for the boundary this module previously got wrong:
    // dropping the kernel's pitch/roll/heading would leave the rig visually
    // flat on sloped terrain while still looking animated.
    rigState.x = 12;
    rigState.y = 3;
    rigState.z = -7;
    rigState.heading = 0.8;
    rigState.pitch = 0.25;
    rigState.roll = -0.15;

    const frame = frameFor(rigState);
    tick(system, rigState);

    expect(parts.root.position.toArray()).toEqual([12, 3, -7]);
    expect(parts.root.rotation.y).toBeCloseTo(0.8, 6);
    expect(parts.root.rotation.x).toBeCloseTo(
      -0.25 + frame.feedback.bodyPitchOffset,
      6,
    );
    expect(parts.root.rotation.z).toBeCloseTo(
      -0.15 + frame.feedback.bodyRollOffset,
      6,
    );
  });

  it("reads wheel rotation from the kernel instead of integrating its own", () => {
    // The kernel integrates `wheelRotation` in the fixed step, persists it, and
    // replay-validates it. Two presentation frames at the same simulation state
    // must therefore produce the same wheel pose — a presentation-side
    // integrator would advance it and drift away from the save.
    if (rigState.mobility.kind !== "ground") throw new Error("expected ground");
    rigState.speed = 9;
    rigState.mobility.wheelRotation = 1.234;

    tick(system, rigState);
    const first = parts.wheels[0]!.rotation.x;
    tick(system, rigState);
    const second = parts.wheels[0]!.rotation.x;

    expect(first).toBeCloseTo(1.234, 6);
    expect(second).toBe(first);
  });

  it("derives suspension travel from kernel compression, not from drive load", () => {
    if (rigState.mobility.kind !== "ground") throw new Error("expected ground");
    const rest = parts.wheelRestY[0]!;

    rigState.mobility.wheels[0]!.compression = 0.5;
    tick(system, rigState);
    expect(parts.steeringPivots[0]!.position.y).toBeCloseTo(rest, 6);

    // Above the resting compression the wheel rides up into the arch.
    rigState.mobility.wheels[0]!.compression = 1;
    tick(system, rigState);
    expect(parts.steeringPivots[0]!.position.y).toBeGreaterThan(rest);

    rigState.mobility.wheels[0]!.compression = 0;
    tick(system, rigState);
    expect(parts.steeringPivots[0]!.position.y).toBeLessThan(rest);
  });

  it("steers only the front pivots", () => {
    rigState.steering = 1;
    tick(system, rigState);

    const front = parts.steeringPivots[0]!.rotation.y;
    expect(parts.steeringPivots[1]!.rotation.y).toBeCloseTo(front, 6);
    expect(parts.steeringPivots[2]!.rotation.y).toBe(0);
    expect(parts.steeringPivots[3]!.rotation.y).toBe(0);
  });

  it("turns the cockpit control further than the road wheels, and the other way", () => {
    rigState.steering = 1;
    const frame = frameFor(rigState);
    tick(system, rigState);

    const control = parts.root.getObjectByName("steeringWheel")!;
    expect(control.rotation.z).toBeCloseTo(
      -frame.feedback.steeringAngle * 2.5,
      6,
    );
    // A hand control that moved less than the wheels would read as broken.
    expect(Math.abs(control.rotation.z)).toBeGreaterThan(
      Math.abs(frame.feedback.steeringAngle),
    );
  });

  it("leaves a rig without an authored cockpit control untouched", () => {
    const bare = buildParts();
    bare.root.getObjectByName("steeringWheel")!.removeFromParent();
    const hoverSystem = new VehicleAnimationSystem();
    hoverSystem.registerRig(RIG, bare);

    rigState.steering = 1;
    expect(() =>
      hoverSystem.update(1 / 60, 1, new Map([[RIG, frameFor(rigState)]])),
    ).not.toThrow();
  });

  it("eases the plough toward engaged and back to stowed", () => {
    rigState.attachments = [
      { id: "field-plough", engaged: true, mode: "cut" },
    ] as RigState["attachments"];

    for (let step = 0; step < 120; step += 1) tick(system, rigState);
    expect(parts.ploughPivot!.rotation.x).toBeCloseTo(0.3, 2);

    rigState.attachments = [
      { id: "field-plough", engaged: false, mode: "cut" },
    ] as RigState["attachments"];
    for (let step = 0; step < 120; step += 1) tick(system, rigState);
    expect(parts.ploughPivot!.rotation.x).toBeCloseTo(-0.22, 2);
  });

  it("shows module visuals from the fitted module list generically", () => {
    const lug = parts.moduleVisuals["lug-tires"]![0]!;

    rigState.modules = [];
    tick(system, rigState);
    expect(lug.visible).toBe(false);

    rigState.modules = ["lug-tires"];
    tick(system, rigState);
    expect(lug.visible).toBe(true);
  });

  it("binds, plays, and advances authored clips from an imported asset", () => {
    // The imported-asset path is the first real producer of authored clips.
    // Before this seam existed, `gltf.animations` was loaded and then ignored.
    const target = new THREE.Object3D();
    target.name = "fan";
    const clip = new THREE.AnimationClip("spin", 1, [
      new THREE.NumberKeyframeTrack("fan.rotation[y]", [0, 1], [0, Math.PI]),
    ]);

    expect(system.registerClips("kenney-fan", target, [clip])).toBe(1);
    expect(system.clipEvidence("kenney-fan")).toEqual({
      ownerId: "kenney-fan",
      clipNames: ["spin"],
      playing: [],
    });

    expect(system.playAllClips("kenney-fan")).toBe(1);
    expect(system.clipEvidence("kenney-fan")?.playing).toEqual(["spin"]);

    system.update(0.5, 1, new Map());
    expect(target.rotation.y).toBeGreaterThan(0);
  });

  it("reports no clip evidence for an owner that never bound any", () => {
    expect(system.clipEvidence("kenney-fan")).toBeNull();
    expect(system.registerClips("kenney-fan", new THREE.Object3D(), [])).toBe(
      0,
    );
    expect(system.playClip("kenney-fan", "spin")).toBe(false);
  });

  it("disposes bound clips and clears ownership", () => {
    const target = new THREE.Object3D();
    const clip = new THREE.AnimationClip("spin", 1, [
      new THREE.NumberKeyframeTrack(".rotation[y]", [0, 1], [0, Math.PI]),
    ]);

    expect(system.registerClips("kenney-fan", target, [clip])).toBe(1);
    expect(system.clipEvidence("kenney-fan")?.clipNames).toEqual(["spin"]);

    system.dispose();
    expect(system.clipEvidence("kenney-fan")).toBeNull();

    expect(system.playClip("kenney-fan", "spin")).toBe(false);
    expect(system.playAllClips("kenney-fan")).toBe(0);
  });
});

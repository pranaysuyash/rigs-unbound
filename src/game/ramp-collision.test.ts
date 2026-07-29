import { describe, expect, it } from "vitest";

import { BUGGY_RAMP, effectiveProfile, type RigId } from "./contracts";
import { GameWorld } from "./gameworld";
import { settleRig, stepRigMotion } from "./physics";
import { createInitialState } from "./state";

/**
 * The reported bug: a rig could drive straight through the relay ramp's
 * visible footprint with zero deflection, because wheel contact only ever
 * sampled flat terrain height — the ramp had no effect on ground contact at
 * all, only a separate same-tick launch-impulse check for jump-capable rigs at
 * speed. Torque (no jump capability) and a slow buggy both clipped through it.
 *
 * A first draft of these tests compared `rig.y` against a "flat" baseline
 * taken *before* the rig's suspension had settled at its new spawn position,
 * and checked a fixed step count without accounting for how far the rig had
 * actually travelled by then. Both drafts passed identically whether the ramp
 * fix was present or removed — confirmed by temporarily reverting the fix.
 * Fixed by settling with `settleRig()` first, comparing against each rig's own
 * ride-height baseline (not raw terrain height), and sampling while the rig is
 * actually within the deck's Z footprint rather than at an arbitrary step.
 *
 * A genuine, welcome discovery while building this: a rig fast enough to crest
 * the ramp's far edge goes briefly airborne even with `canJump: false`. That
 * is the same "cresting a hill fast" physics already documented in
 * `physics.ts` — air time is a consequence of terrain and speed, not a jump
 * flag — and it is exactly what a physical ramp should do. The scripted
 * launch impulse is an *additional* boost gated on jump capability and speed,
 * layered on top of this, not the only way to leave the ground.
 */

const TORQUE: RigId = "utility-tractor";
const BUGGY: RigId = "toy-buggy";

const FORWARD = {
  accelerate: true,
  brake: false,
  steerLeft: false,
  steerRight: false,
};

const DECK_LOW_Z = BUGGY_RAMP.z - BUGGY_RAMP.deckDepth / 2;
const DECK_HIGH_Z = BUGGY_RAMP.z + BUGGY_RAMP.deckDepth / 2;

function settledRig(rigId: RigId, x: number, z: number) {
  const state = createInitialState();
  const world = new GameWorld(state.seed);
  const rig = state.rigs[rigId];
  rig.heading = 0; // forward = +Z, matching the ramp's approach axis
  rig.x = x;
  rig.z = z;
  const profile = effectiveProfile(rig.id, rig.modules);
  settleRig(rig, profile, world.terrain);
  return { state, world, rig, profile };
}

/** Ride height above raw terrain once a rig has settled on flat ground. */
function rideHeightAbove(terrainY: number, restedY: number): number {
  return restedY - terrainY;
}

describe("the relay ramp is a physical surface, not a hole", () => {
  it("lifts a non-jump-capable rig above its normal ride height while crossing the deck", () => {
    // Torque has no jump capability, so this is the exact reported case: a rig
    // that can never trigger the scripted launch impulse still must not clip
    // through the ramp.
    const { world, rig, profile } = settledRig(
      TORQUE,
      BUGGY_RAMP.x,
      BUGGY_RAMP.z - BUGGY_RAMP.deckDepth - 2,
    );
    expect(profile.capabilities).not.toContain("jump");
    const baselineRideHeight = rideHeightAbove(
      world.terrain.height(rig.x, rig.z),
      rig.y,
    );

    let maxRideHeightOverDeck = -Infinity;
    for (let step = 0; step < 500; step += 1) {
      stepRigMotion(rig, profile, FORWARD, world.terrain, 1 / 60, {
        towing: false,
        ramp: BUGGY_RAMP,
        canJump: false,
        soilMoisture: 0,
        tools: rig.tools,
      });
      if (rig.z >= DECK_LOW_Z && rig.z <= DECK_HIGH_Z) {
        const current = rideHeightAbove(
          world.terrain.height(rig.x, rig.z),
          rig.y,
        );
        maxRideHeightOverDeck = Math.max(maxRideHeightOverDeck, current);
      }
    }

    expect(maxRideHeightOverDeck).toBeGreaterThan(-Infinity); // crossed the deck at all
    expect(maxRideHeightOverDeck).toBeGreaterThan(baselineRideHeight + 0.3);
  });

  it("keeps a slow buggy (below launch speed) on the deck surface, not through it", () => {
    const { world, rig, profile } = settledRig(
      BUGGY,
      BUGGY_RAMP.x,
      BUGGY_RAMP.z - BUGGY_RAMP.deckDepth / 2, // start already over the deck
    );
    const baselineRideHeight = rideHeightAbove(
      world.terrain.height(rig.x, rig.z),
      rig.y,
    );

    // Few steps, low resulting speed: the scripted launch impulse never fires,
    // isolating the surface-contact fix from that existing mechanic.
    for (let step = 0; step < 8; step += 1) {
      stepRigMotion(rig, profile, FORWARD, world.terrain, 1 / 60, {
        towing: false,
        ramp: BUGGY_RAMP,
        canJump: profile.capabilities.includes("jump"),
        soilMoisture: 0,
        tools: rig.tools,
      });
    }

    expect(Math.abs(rig.speed)).toBeLessThan(BUGGY_RAMP.minimumSpeed);
    expect(rig.mobility.kind).toBe("ground");
    expect(rig.mobility.kind === "ground" ? rig.mobility.grounded : false).toBe(
      true,
    ); // never launched
    const current = rideHeightAbove(world.terrain.height(rig.x, rig.z), rig.y);
    expect(current).toBeGreaterThan(baselineRideHeight + 0.15);
  });

  it("returns the rig to its normal ride height once clear of the deck footprint", () => {
    // A surface that never lets go would be its own bug.
    const { world, rig, profile } = settledRig(
      TORQUE,
      BUGGY_RAMP.x,
      BUGGY_RAMP.z - BUGGY_RAMP.deckDepth - 2,
    );
    const baselineRideHeight = rideHeightAbove(
      world.terrain.height(rig.x, rig.z),
      rig.y,
    );

    for (let step = 0; step < 500; step += 1) {
      stepRigMotion(rig, profile, FORWARD, world.terrain, 1 / 60, {
        towing: false,
        ramp: BUGGY_RAMP,
        canJump: false,
        soilMoisture: 0,
        tools: rig.tools,
      });
    }

    expect(rig.z).toBeGreaterThan(DECK_HIGH_Z + 3); // genuinely clear of the deck
    const finalRideHeight = rideHeightAbove(
      world.terrain.height(rig.x, rig.z),
      rig.y,
    );
    expect(Math.abs(finalRideHeight - baselineRideHeight)).toBeLessThan(0.3);
  });

  it("still launches a fast, jump-capable rig off the far edge (existing mechanic, unaffected)", () => {
    const { world, rig, profile } = settledRig(
      BUGGY,
      BUGGY_RAMP.x,
      BUGGY_RAMP.z - BUGGY_RAMP.deckDepth - 2,
    );
    expect(profile.capabilities).toContain("jump");
    rig.speed = BUGGY_RAMP.minimumSpeed + 2; // already at launch speed

    let becameAirborne = false;
    for (let step = 0; step < 90; step += 1) {
      stepRigMotion(rig, profile, FORWARD, world.terrain, 1 / 60, {
        towing: false,
        ramp: BUGGY_RAMP,
        canJump: true,
        soilMoisture: 0,
        tools: rig.tools,
      });
      if (rig.mobility.kind === "ground" && !rig.mobility.grounded) {
        becameAirborne = true;
      }
    }
    expect(becameAirborne).toBe(true);
  });
});

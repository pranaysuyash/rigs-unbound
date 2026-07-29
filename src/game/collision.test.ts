import { describe, expect, it } from "vitest";

import {
  collisionPolicyFor,
  resolveDynamicBodyCollisions,
  sweepCircleAgainstCircle,
  type DynamicCollisionBody,
} from "./collision";
import { RIG_PROFILES, rigCollisionRadius } from "./contracts";
import { GameWorld } from "./gameworld";
import { findSite } from "./world";

describe("semantic collision policy", () => {
  it("is symmetric for solid, overlap-only, and decorative roles", () => {
    expect(collisionPolicyFor("rig", "structure")).toMatchObject({
      response: "block",
      known: true,
    });
    expect(collisionPolicyFor("structure", "rig")).toMatchObject({
      response: "block",
      known: true,
    });
    expect(collisionPolicyFor("rig", "trigger")).toMatchObject({
      response: "overlap",
      known: true,
    });
    expect(collisionPolicyFor("sensor", "cargo")).toMatchObject({
      response: "overlap",
      known: true,
    });
    expect(collisionPolicyFor("decorative", "rig")).toMatchObject({
      response: "ignore",
      known: true,
    });
  });

  it("fails closed and identifies unknown physical roles", () => {
    expect(collisionPolicyFor("rig", "unregistered-import")).toEqual({
      firstRole: "rig",
      secondRole: "unregistered-import",
      response: "block",
      known: false,
    });
  });

  it("retains the strongest identified contact long enough for operator reads", () => {
    const world = new GameWorld("COLLISION-TELEMETRY");
    const contact = {
      firstId: "utility-tractor",
      firstRole: "rig",
      secondId: "toy-buggy",
      secondRole: "rig",
      response: "block",
      impactSpeed: 9,
      normalX: -1,
      normalZ: 0,
      swept: true,
      policyKnown: true,
    } as const;
    world.noteCollisionContacts([contact]);
    world.beginCollisionStep();
    world.noteCollisionContacts([{ ...contact, impactSpeed: 2.5 }]);

    expect(world.collisionTelemetry()).toMatchObject({
      totalContacts: 2,
      policyViolationCount: 0,
      contactAgeSteps: 0,
      contacts: [expect.objectContaining({ impactSpeed: 9 })],
    });

    for (let step = 0; step < 13; step += 1) {
      world.beginCollisionStep();
    }
    expect(world.collisionTelemetry()).toMatchObject({
      contactAgeSteps: null,
      contacts: [],
    });
  });
});

describe("continuous planar collision", () => {
  it("encloses each authored rig footprint instead of using width alone", () => {
    for (const profile of Object.values(RIG_PROFILES)) {
      const halfLength = profile.wheelbase * 0.5 + profile.wheelRadius;
      const halfWidth = profile.track * 0.5 + 0.15;
      const radius = rigCollisionRadius(profile);
      expect(radius).toBeCloseTo(Math.hypot(halfLength, halfWidth), 8);
      expect(radius).toBeGreaterThan(halfLength);
      expect(radius).toBeGreaterThan(halfWidth);
    }
  });

  it("finds a thin circle crossed between two non-overlapping endpoints", () => {
    const hit = sweepCircleAgainstCircle(
      { x: -5, z: 0 },
      { x: 5, z: 0 },
      { x: 0, z: 0 },
      1,
    );
    expect(hit).toMatchObject({
      fraction: 0.4,
      normalX: -1,
      normalZ: 0,
      startedInside: false,
    });
  });

  it("separates moving bodies, transfers momentum, and identifies the pair", () => {
    const moving: DynamicCollisionBody = {
      id: "utility-tractor",
      role: "rig",
      x: 5,
      z: 0,
      speed: 10,
      heading: Math.PI / 2,
      mass: 4.8,
      radius: 1,
    };
    const parked: DynamicCollisionBody = {
      id: "toy-buggy",
      role: "rig",
      x: 0,
      z: 0,
      speed: 0,
      heading: Math.PI / 2,
      mass: 1.2,
      radius: 1,
    };

    const outcome = resolveDynamicBodyCollisions(moving, [parked], {
      x: -5,
      z: 0,
    });

    expect(outcome.hit).toBe(true);
    expect(outcome.policyViolationCount).toBe(0);
    expect(outcome.contacts).toEqual([
      expect.objectContaining({
        firstId: "utility-tractor",
        firstRole: "rig",
        secondId: "toy-buggy",
        secondRole: "rig",
        response: "block",
        swept: true,
        policyKnown: true,
      }),
    ]);
    expect(
      Math.hypot(moving.x - parked.x, moving.z - parked.z),
    ).toBeGreaterThanOrEqual(2);
    expect(parked.speed).toBeGreaterThan(0);
    expect(moving.speed).toBeLessThan(10);
  });

  it("resolves the nearest body first regardless of fleet iteration order", () => {
    const moving: DynamicCollisionBody = {
      id: "utility-tractor",
      role: "rig",
      x: 8,
      z: 0,
      speed: 16,
      heading: Math.PI / 2,
      mass: 4.8,
      radius: 1,
    };
    const farther: DynamicCollisionBody = {
      id: "marsh-skimmer",
      role: "rig",
      x: 4,
      z: 0,
      speed: 0,
      heading: Math.PI / 2,
      mass: 2.1,
      radius: 1,
    };
    const nearer: DynamicCollisionBody = {
      id: "toy-buggy",
      role: "rig",
      x: 0,
      z: 0,
      speed: 0,
      heading: Math.PI / 2,
      mass: 1.2,
      radius: 1,
    };

    const outcome = resolveDynamicBodyCollisions(moving, [farther, nearer], {
      x: -8,
      z: 0,
    });

    expect(outcome.contacts.map((contact) => contact.secondId)).toEqual([
      "toy-buggy",
    ]);
    expect(moving.x).toBeLessThan(nearer.x);
    expect(nearer.x).toBeGreaterThan(0);
    expect(farther.x).toBe(4);
    expect(
      Math.hypot(moving.x - nearer.x, moving.z - nearer.z),
    ).toBeGreaterThanOrEqual(2);
  });

  it("does not let a fast body tunnel through a generated rock", () => {
    const world = new GameWorld("SWEPT-OBSTACLE");
    const rock = world.obstacles
      .near(0, 0, 190)
      .find((obstacle) => obstacle.kind === "rock");
    if (!rock) throw new Error("missing deterministic rock fixture");
    const previous = { x: rock.x - 8, z: rock.z };
    const rig = {
      x: rock.x + 8,
      z: rock.z,
      speed: 16,
      heading: Math.PI / 2,
    };

    const outcome = world.obstacles.resolve(rig, 1.2, 1.2, new Set(), previous);

    expect(outcome.hit).toBe(true);
    expect(outcome.swept).toBe(true);
    expect(outcome.blockedBy?.id).toBe(rock.id);
    expect(rig.x).toBeLessThan(rock.x);
    expect(Math.hypot(rig.x - rock.x, rig.z - rock.z)).toBeGreaterThanOrEqual(
      rock.radius + 1.2,
    );
  });

  it("does not let a fast body tunnel through authored structure proxies", () => {
    const world = new GameWorld("SWEPT-STRUCTURE");
    const launch = findSite("launch-ridge");
    if (!launch) throw new Error("missing Launch Ridge fixture");
    const previous = { x: launch.x, z: launch.z - 12 };
    const rig = {
      x: launch.x,
      z: launch.z + 12,
      speed: 18,
      heading: 0,
    };

    const outcome = world.structureCollision(rig, 1.2, previous);

    expect(outcome.hit).toBe(true);
    expect(outcome.swept).toBe(true);
    expect(outcome.blockedBy?.siteId).toBe("launch-ridge");
    expect(rig.z).toBeLessThan(launch.z);
  });
});

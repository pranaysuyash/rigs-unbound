import { describe, expect, it } from "vitest";

import { RIG_HOOD_CAMERA_MOUNTS } from "./camera";
import {
  MODULES,
  MODULE_IDS,
  RIG_PROFILES,
  WHEEL_LOCAL_SIGNS,
  type ModuleId,
  type RigId,
  type RigProfile,
} from "./contracts";
import { maximumSteeringAngleFor } from "./feedback";
import { RIG_IDS } from "./rig-ids";
import {
  GROUND_DECAL_LIFT,
  RIG_MODULE_FORMS,
  RIG_SILHOUETTES,
  WHEEL_MOUNTED_MODULE_IDS,
  blockoutFor,
  meanAxleScale,
  rigBlockout,
  type RigBlockout,
  type RigBlockoutProfile,
  type RigModuleMount,
  type RigSilhouette,
} from "./rig-blockout";

/**
 * These tests exist because the renderer previously hand-wrote its own copies of
 * the profile's dimensions and they drifted from the simulation without anything
 * noticing. A literal cannot disagree with itself, so the only durable guard is
 * to assert the presentation geometry against `RIG_PROFILES` independently — the
 * same numbers the traversal model reads.
 *
 * The historical drift, recorded here so a regression is recognisable rather
 * than merely red:
 *
 *   tractor  front track 2.72 and rear track 3.00 against profile track 2.6;
 *            wheelbase 2.90 against 3.1; wheel radii 0.62 / 1.05 against 0.72.
 *   buggy    track and wheelbase correct, wheel radius 0.56 against 0.43.
 *   both     mounted as though authored in the BODY frame while actually
 *            authored in the GROUND frame, floating them `rideHeight` off the
 *            terrain — 0.95 m and 0.62 m respectively.
 */

/** A synthetic profile, so derivation is provable independently of shipped tuning. */
function syntheticProfile(
  overrides: Partial<RigBlockoutProfile> = {},
): RigBlockoutProfile {
  return {
    id: "utility-tractor",
    mobilityAdapter: "ground",
    track: 4,
    wheelbase: 6,
    wheelRadius: 1,
    rideHeight: 2,
    suspensionTravel: 0.5,
    ...overrides,
  };
}

const NEUTRAL: RigSilhouette = {
  frontWheelScale: 1,
  rearWheelScale: 1,
  tyreWidthScale: 1,
  hullWidthScale: 1,
  hullLengthScale: 1,
  hullThicknessScale: 1,
};

describe("rigBlockout wheel placement", () => {
  it("places every wheel exactly where the traversal model samples terrain", () => {
    const profile = syntheticProfile();
    const { wheelMounts } = rigBlockout(profile, NEUTRAL);

    expect(wheelMounts).toHaveLength(4);
    // Recomputed from the shared sign contract, exactly as physics.ts does.
    for (const [index, [signX, signZ]] of WHEEL_LOCAL_SIGNS.entries()) {
      const mount = wheelMounts[index]!;
      expect(mount.x).toBeCloseTo((signX * profile.track) / 2, 10);
      expect(mount.z).toBeCloseTo((signZ * profile.wheelbase) / 2, 10);
    }
  });

  it("keeps wheel index aligned with the simulation's wheel order", () => {
    const { wheelMounts } = rigBlockout(syntheticProfile(), NEUTRAL);

    expect(wheelMounts.map((mount) => mount.label)).toEqual([
      "front-left",
      "front-right",
      "rear-left",
      "rear-right",
    ]);
    expect(wheelMounts.map((mount) => mount.index)).toEqual([0, 1, 2, 3]);
    // Only the front pair steers, matching applyWheels' `index < 2`.
    expect(wheelMounts.map((mount) => mount.steers)).toEqual([
      true,
      true,
      false,
      false,
    ]);
  });

  it("rests each tyre's lowest point on the ground plane", () => {
    const { wheelMounts } = rigBlockout(
      syntheticProfile(),
      // Deliberately unequal axles, so a single shared rest height cannot pass.
      { ...NEUTRAL, frontWheelScale: 0.5, rearWheelScale: 1.5 },
    );

    for (const mount of wheelMounts) {
      expect(mount.restY - mount.radius).toBeCloseTo(0, 10);
    }
    expect(wheelMounts[0]!.radius).toBeCloseTo(0.5, 10);
    expect(wheelMounts[2]!.radius).toBeCloseTo(1.5, 10);
  });

  it("scales wheel spin so differently-sized wheels roll without skidding", () => {
    const profile = syntheticProfile({ wheelRadius: 1 });
    const { wheelMounts } = rigBlockout(profile, {
      ...NEUTRAL,
      frontWheelScale: 0.5,
      rearWheelScale: 1.5,
    });

    // The kernel integrates one reference rotation: distance / wheelRadius.
    const distance = 10;
    const referenceRotation = distance / profile.wheelRadius;

    for (const mount of wheelMounts) {
      // Rolling without slip: the arc the tyre sweeps equals ground covered.
      const sweptArc = referenceRotation * mount.spinScale * mount.radius;
      expect(sweptArc).toBeCloseTo(distance, 10);
    }
  });

  it("gives hover rigs no wheels, since the simulation spins none", () => {
    const blockout = rigBlockout(
      syntheticProfile({ mobilityAdapter: "hover" }),
      NEUTRAL,
    );

    expect(blockout.wheelMounts).toEqual([]);
    expect(blockout.hoverClearance).toBeCloseTo(0.5, 10);
  });

  it("gives ground rigs no hover clearance, since their tyres are the contact", () => {
    expect(rigBlockout(syntheticProfile(), NEUTRAL).hoverClearance).toBe(0);
  });
});

describe("the two vertical frames", () => {
  it("lowers a ground-frame assembly by exactly rideHeight", () => {
    const blockout = rigBlockout(syntheticProfile({ rideHeight: 2 }), NEUTRAL);

    expect(blockout.groundFrameOffsetY).toBeCloseTo(-2, 10);
    expect(blockout.contactPlaneY).toBeCloseTo(-2, 10);
  });

  it("puts each tyre's contact patch on the contact plane in the body frame", () => {
    // The whole float bug in one assertion. `restY` is GROUND-frame, the offset
    // converts to BODY-frame, and the tyre bottom must land on contactPlaneY —
    // which physics defines as `meanContact - rigState.y`, i.e. -rideHeight.
    const blockout = rigBlockout(syntheticProfile({ rideHeight: 2 }), NEUTRAL);

    for (const mount of blockout.wheelMounts) {
      const bottomInBodyFrame =
        mount.restY - mount.radius + blockout.groundFrameOffsetY;
      expect(bottomInBodyFrame).toBeCloseTo(blockout.contactPlaneY, 10);
    }
  });

  it("tracks rideHeight rather than restating it", () => {
    const shallow = rigBlockout(syntheticProfile({ rideHeight: 0.5 }), NEUTRAL);
    const tall = rigBlockout(syntheticProfile({ rideHeight: 3 }), NEUTRAL);

    expect(shallow.groundFrameOffsetY).toBeCloseTo(-0.5, 10);
    expect(tall.groundFrameOffsetY).toBeCloseTo(-3, 10);
  });

  /**
   * The blob shadow is the cue a player reads for "is this thing touching the
   * ground", so a shadow that floats hides every other floating bug behind it.
   * The hover rig's shadow was authored at -0.72 against a contact plane at
   * -1.35, i.e. hovering 0.63 m in the air.
   */
  it("puts a ground decal on the contact plane, whatever the ride height", () => {
    for (const rideHeight of [0.5, 0.95, 1.35, 3]) {
      const blockout = rigBlockout(syntheticProfile({ rideHeight }), NEUTRAL);
      const shadowInBodyFrame =
        blockout.shadowY + blockout.groundFrameOffsetY - blockout.contactPlaneY;
      expect(shadowInBodyFrame).toBeCloseTo(GROUND_DECAL_LIFT, 10);
    }
  });

  it("lifts a ground decal off the plane, but only enough to beat z-fighting", () => {
    expect(GROUND_DECAL_LIFT).toBeGreaterThan(0);
    expect(GROUND_DECAL_LIFT).toBeLessThan(0.1);
  });
});

describe("hover skirt", () => {
  it("spans from the air cushion up to the hull's underside", () => {
    const profile = syntheticProfile({
      mobilityAdapter: "hover",
      rideHeight: 2,
      suspensionTravel: 0.5,
    });
    const blockout = rigBlockout(profile, {
      ...NEUTRAL,
      hullThicknessScale: 0.5,
    });
    const skirt = blockout.hoverSkirt;

    expect(skirt).not.toBeNull();
    // Hull: 1.0 thick, centred at 2 -> underside at 1.5. Cushion: 0.5.
    expect(skirt!.centreY - skirt!.height / 2).toBeCloseTo(
      blockout.hoverClearance,
      10,
    );
    expect(skirt!.centreY + skirt!.height / 2).toBeCloseTo(
      blockout.hull.centreY - blockout.hull.height / 2,
      10,
    );
    expect(skirt!.height).toBeCloseTo(1, 10);
  });

  it("gives ground rigs no skirt, since tyres do their lifting", () => {
    expect(rigBlockout(syntheticProfile(), NEUTRAL).hoverSkirt).toBeNull();
  });

  it("keeps the skirt clear of the ground by the cushion depth", () => {
    const blockout = blockoutFor("marsh-skimmer");
    const skirt = blockout.hoverSkirt!;

    expect(skirt.height).toBeGreaterThan(0);
    // Bottom edge above the contact plane by exactly the cushion, in the body
    // frame — the thing the old skirt got wrong by 0.27 m in the wrong direction.
    const bottomInBodyFrame =
      skirt.centreY - skirt.height / 2 + blockout.groundFrameOffsetY;
    expect(bottomInBodyFrame - blockout.contactPlaneY).toBeCloseTo(
      RIG_PROFILES["marsh-skimmer"].suspensionTravel,
      10,
    );
  });
});

describe("hull derivation", () => {
  it("derives hull extents from track and wheelbase", () => {
    const blockout = rigBlockout(syntheticProfile({ track: 4, wheelbase: 6 }), {
      ...NEUTRAL,
      hullWidthScale: 0.5,
      hullLengthScale: 2,
      hullThicknessScale: 0.25,
    });

    expect(blockout.hull.width).toBeCloseTo(2, 10);
    expect(blockout.hull.depth).toBeCloseTo(12, 10);
    expect(blockout.hull.height).toBeCloseTo(0.5, 10);
    // Centred on the body origin, which sits at rideHeight in the ground frame.
    expect(blockout.hull.centreY).toBeCloseTo(2, 10);
  });

  it("rescales the whole silhouette when the profile is retuned", () => {
    const small = rigBlockout(syntheticProfile({ track: 2 }), NEUTRAL);
    const wide = rigBlockout(syntheticProfile({ track: 8 }), NEUTRAL);

    expect(wide.hull.width / small.hull.width).toBeCloseTo(4, 10);
    expect(wide.wheelMounts[0]!.x / small.wheelMounts[0]!.x).toBeCloseTo(4, 10);
  });
});

describe("shipped rigs", () => {
  it("declares a silhouette for every canonical rig and no others", () => {
    expect(Object.keys(RIG_SILHOUETTES).sort()).toEqual([...RIG_IDS].sort());
  });

  /**
   * The one authored ratio that could contradict the simulation, so it is
   * constrained rather than trusted. If the axle scales did not average to 1,
   * `profile.wheelRadius` would not be the mean rolling radius and the kernel's
   * distance-to-spin conversion would be biased for the whole rig.
   */
  it("keeps every axle pair averaging to 1, so wheelRadius stays the mean", () => {
    for (const rigId of RIG_IDS) {
      expect(meanAxleScale(RIG_SILHOUETTES[rigId])).toBeCloseTo(1, 10);
    }
  });

  it.each([...RIG_IDS])(
    "%s agrees with its profile on every simulated dimension",
    (rigId: RigId) => {
      const profile: RigProfile = RIG_PROFILES[rigId];
      const blockout = blockoutFor(rigId);

      expect(blockout.contactPlaneY).toBeCloseTo(-profile.rideHeight, 10);

      for (const mount of blockout.wheelMounts) {
        const [signX, signZ] = WHEEL_LOCAL_SIGNS[mount.index]!;
        expect(mount.x).toBeCloseTo((signX * profile.track) / 2, 10);
        expect(mount.z).toBeCloseTo((signZ * profile.wheelbase) / 2, 10);
        // Rolling without slip, per wheel, against this rig's real tuning.
        const distance = 7.5;
        expect(
          (distance / profile.wheelRadius) * mount.spinScale * mount.radius,
        ).toBeCloseTo(distance, 10);
      }
    },
  );

  it("gives the tractor visibly larger rear wheels, its defining feature", () => {
    const { wheelMounts } = blockoutFor("utility-tractor");
    const front = wheelMounts[0]!.radius;
    const rear = wheelMounts[2]!.radius;

    expect(rear).toBeGreaterThan(front * 1.3);
  });

  it("draws the buggy's wheels at exactly its simulated radius", () => {
    const profile = RIG_PROFILES["toy-buggy"];
    for (const mount of blockoutFor("toy-buggy").wheelMounts) {
      expect(mount.radius).toBeCloseTo(profile.wheelRadius, 10);
      expect(mount.spinScale).toBeCloseTo(1, 10);
    }
  });

  it("keeps wheels from poking through the hull sides", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const mount of blockout.wheelMounts) {
        // Outer tyre face must sit outside the hull, or the wheel is buried.
        const outerFace = Math.abs(mount.x) + mount.width / 2;
        expect(outerFace).toBeGreaterThan(blockout.hull.width / 2);
      }
    }
  });

  it("only gives the hover rig a hover clearance", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const isHover = RIG_PROFILES[rigId].mobilityAdapter === "hover";
      expect(blockout.hoverClearance > 0).toBe(isHover);
      expect(blockout.hoverSkirt !== null).toBe(isHover);
      expect(blockout.wheelMounts.length).toBe(isHover ? 0 : 4);
    }
  });
});

interface Box {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

function boxOf(mount: RigModuleMount): Box {
  return {
    minX: mount.x - mount.width / 2,
    maxX: mount.x + mount.width / 2,
    minY: mount.y - mount.height / 2,
    maxY: mount.y + mount.height / 2,
    minZ: mount.z - mount.depth / 2,
    maxZ: mount.z + mount.depth / 2,
  };
}

/**
 * The volume a wheel occupies across its whole steering range, wearing the
 * widest tread it can.
 *
 * `clearanceHalfWidth` / `clearanceHalfDepth` rather than `width / 2` / `radius`,
 * so a module that only collides at full lock — or only once lug tyres are
 * fitted — still fails here. Neither is hypothetical: both are how the pontoon
 * placement was found to be wrong, in that order.
 */
function wheelBoxes(blockout: RigBlockout): { label: string; box: Box }[] {
  return blockout.wheelMounts.map((wheel) => ({
    label: wheel.label,
    box: {
      minX: wheel.x - wheel.clearanceHalfWidth,
      maxX: wheel.x + wheel.clearanceHalfWidth,
      minY: 0,
      maxY: wheel.restY + wheel.treadRadius,
      minZ: wheel.z - wheel.clearanceHalfDepth,
      maxZ: wheel.z + wheel.clearanceHalfDepth,
    },
  }));
}

/** Touching faces are not an overlap, so every comparison is strict. */
function overlaps(a: Box, b: Box): boolean {
  return (
    a.minX < b.maxX &&
    b.minX < a.maxX &&
    a.minY < b.maxY &&
    b.minY < a.maxY &&
    a.minZ < b.maxZ &&
    b.minZ < a.maxZ
  );
}

function mountsFor(
  blockout: RigBlockout,
  moduleId: ModuleId,
): RigModuleMount[] {
  return blockout.moduleMounts.filter((mount) => mount.moduleId === moduleId);
}

/**
 * Module mounts.
 *
 * These tests exist for the same reason as the ones above, one level up. The
 * renderer had exactly one module visual — `lug-tires` — while five other buyable
 * modules, three of them capability-granting, changed nothing about the rig. The
 * fix is only durable if the placement is derived and the derivation is
 * constrained, so what follows is the set of ways a bolt-on module can be wrong
 * in a way a player would see.
 */
describe("module mounts", () => {
  it("gives every buyable module a home, so none can ship invisible", () => {
    const missing = MODULE_IDS.filter(
      (moduleId) =>
        RIG_MODULE_FORMS[moduleId] === undefined &&
        !WHEEL_MOUNTED_MODULE_IDS.includes(moduleId),
    );

    // The point of this assertion is the failure message: a new module added to
    // MODULES with no form and no wheel mount is a purchase with no visible
    // result, which is how the garage came to have five of them.
    expect(missing).toEqual([]);
  });

  it("declares no form for a module that mounts to a wheel instead", () => {
    for (const moduleId of WHEEL_MOUNTED_MODULE_IDS) {
      expect(RIG_MODULE_FORMS[moduleId]).toBeUndefined();
    }
  });

  it("only mounts modules the garage will actually sell this rig", () => {
    for (const rigId of RIG_IDS) {
      for (const mount of blockoutFor(rigId).moduleMounts) {
        expect(MODULES[mount.moduleId].fits).toContain(rigId);
      }
    }
  });

  /**
   * No `mobilityAdapter === "hover"` branch exists in the derivation. The hover
   * rig gets nothing because nothing in `MODULES` fits it — the actual reason —
   * so this stays correct if a module is ever written for it.
   */
  it("mounts nothing on a rig no module fits", () => {
    expect(blockoutFor("marsh-skimmer").moduleMounts).toEqual([]);
  });

  it("mounts every fitting module exactly once, or twice when mirrored", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const moduleId of MODULE_IDS) {
        const form = RIG_MODULE_FORMS[moduleId];
        const fits = MODULES[moduleId].fits.includes(rigId);
        const expected =
          form === undefined || !fits ? 0 : form.anchor === "outboard" ? 2 : 1;
        expect(mountsFor(blockout, moduleId)).toHaveLength(expected);
      }
    }
  });

  it("names the two halves of a mirrored pair and places them symmetrically", () => {
    for (const rigId of RIG_IDS) {
      const pair = mountsFor(blockoutFor(rigId), "flotation-pontoons");
      if (pair.length === 0) continue;

      const left = pair.find((mount) => mount.slot === "left");
      const right = pair.find((mount) => mount.slot === "right");
      expect(left).toBeDefined();
      expect(right).toBeDefined();
      expect(left!.x).toBeLessThan(0);
      expect(right!.x).toBeCloseTo(-left!.x, 10);
      expect(right!.y).toBeCloseTo(left!.y, 10);
      expect(right!.z).toBeCloseTo(left!.z, 10);
    }
  });

  it("labels an unmirrored mount as the single one it is", () => {
    for (const rigId of RIG_IDS) {
      for (const mount of blockoutFor(rigId).moduleMounts) {
        const mirrored =
          RIG_MODULE_FORMS[mount.moduleId]!.anchor === "outboard";
        expect(mount.slot === "single").toBe(!mirrored);
      }
    }
  });

  /**
   * The contact plane really is the floor: `physics.ts` clamps `rig.y` up to
   * `restY` whenever it crosses down through it, so the body never sinks below
   * `rideHeight` above mean contact. That makes `minY > 0` sufficient rather than
   * merely necessary — there is no compression case to also allow for.
   */
  it("keeps every module clear of the ground it rests on", () => {
    for (const rigId of RIG_IDS) {
      for (const mount of blockoutFor(rigId).moduleMounts) {
        expect(boxOf(mount).minY).toBeGreaterThan(0);
      }
    }
  });

  it("keeps every module out of every wheel, at any steering angle", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const wheels = wheelBoxes(blockout);
      for (const mount of blockout.moduleMounts) {
        const box = boxOf(mount);
        const fouled = wheels
          .filter((wheel) => overlaps(box, wheel.box))
          .map((wheel) => `${mount.moduleId}/${mount.slot} × ${wheel.label}`);
        expect(fouled).toEqual([]);
      }
    }
  });

  /**
   * The wheels bound an underbody module's width, not its authored `widthScale`.
   *
   * Asserted as a property of the derivation rather than left implied by the
   * no-fouling test above, because the two fail differently: that test says "this
   * particular ratio happens to fit today", and this one says "no ratio can ever
   * not fit". The skid plate was hand-tuned twice and was wrong twice before the
   * clamp existed.
   */
  it("bounds an underbody module by the wheel tunnel, not by its authored width", () => {
    let clamped = 0;
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const tunnelHalfWidth = Math.min(
        ...blockout.wheelMounts.map(
          (wheel) => Math.abs(wheel.x) - wheel.clearanceHalfWidth,
        ),
      );
      for (const mount of blockout.moduleMounts) {
        if (mount.anchor !== "underbody") continue;
        expect(mount.width / 2).toBeLessThan(tunnelHalfWidth);

        const form = RIG_MODULE_FORMS[mount.moduleId]!;
        if (mount.width < blockout.hull.width * form.widthScale - 1e-9) {
          clamped += 1;
        }
      }
    }
    // The clamp must actually bind somewhere, or it is untested code that will
    // rot: the tractor's plate is cut from 0.66 to about 0.545 of hull width.
    expect(clamped).toBeGreaterThan(0);
  });

  /**
   * The other side of that clamp. Narrowing silently is right for a plate that
   * loses a few centimetres and wrong for one reduced to a rail, so the floor is
   * asserted here instead of trusted. A skid plate under a third of the hull is
   * not protecting the hull.
   */
  it("leaves a clamped underbody plate wide enough to be worth fitting", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const mount of mountsFor(blockout, "skid-plate")) {
        expect(mount.width).toBeGreaterThan(blockout.hull.width * 0.34);
      }
    }
  });

  /**
   * A player can own all six modules at once, so two of them sharing a volume is
   * a real state and not a theoretical one. Same-module mounts are exempt: a
   * mirrored pair is one module, and the symmetry test covers it.
   */
  it("keeps two modules the player can own together from sharing a volume", () => {
    for (const rigId of RIG_IDS) {
      const mounts = blockoutFor(rigId).moduleMounts;
      const collisions: string[] = [];
      for (let i = 0; i < mounts.length; i += 1) {
        for (let j = i + 1; j < mounts.length; j += 1) {
          const a = mounts[i]!;
          const b = mounts[j]!;
          if (a.moduleId === b.moduleId) continue;
          if (overlaps(boxOf(a), boxOf(b))) {
            collisions.push(
              `${a.moduleId}/${a.slot} × ${b.moduleId}/${b.slot}`,
            );
          }
        }
      }
      expect(collisions).toEqual([]);
    }
  });

  /**
   * The hood camera renders from inside the model, so anything it sits inside is
   * a black screen rather than a visible defect. This is the same class of
   * cross-module frame dependency that put the skimmer's socket inside its own
   * cabin (see `RIG_HOOD_CAMERA_MOUNTS`), which is why it is asserted here rather
   * than trusted: `camera.ts` authors that socket as absolute metres, so nothing
   * moves it when a profile is retuned and the mast is.
   */
  it("keeps a tall module out of the hood camera socket", () => {
    for (const rigId of RIG_IDS) {
      const socket = RIG_HOOD_CAMERA_MOUNTS[rigId];
      for (const mount of blockoutFor(rigId).moduleMounts) {
        const box = boxOf(mount);
        const inside =
          socket.localX >= box.minX &&
          socket.localX <= box.maxX &&
          socket.localY >= box.minY &&
          socket.localY <= box.maxY &&
          socket.localZ >= box.minZ &&
          socket.localZ <= box.maxZ;
        expect({ rigId, moduleId: mount.moduleId, inside }).toEqual({
          rigId,
          moduleId: mount.moduleId,
          inside: false,
        });
      }
    }
  });

  it("anchors each module to the hull face its form names", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const mount of blockout.moduleMounts) {
        const box = boxOf(mount);
        switch (mount.anchor) {
          case "nose":
            // Ahead of the hull's front face, sitting on its underside.
            expect(box.minZ).toBeGreaterThanOrEqual(blockout.hull.depth / 2);
            expect(box.minY).toBeCloseTo(blockout.hull.bottomY, 10);
            break;
          case "hull-top":
            expect(box.minY).toBeGreaterThanOrEqual(blockout.hull.topY);
            break;
          case "outboard":
            expect(Math.abs(mount.x) - mount.width / 2).toBeGreaterThanOrEqual(
              blockout.hull.width / 2,
            );
            break;
          case "underbody":
            expect(box.maxY).toBeLessThanOrEqual(blockout.hull.bottomY);
            break;
        }
      }
    }
  });

  it("keeps a hull-top module's footprint on the hull it stands on", () => {
    // `hull-top` places a box on the roof, and the existing anchor test only
    // proves it starts at or above `topY`. Nothing proved its *footprint* is on
    // the hull, so a module could stand with half its base over thin air and
    // still pass — which is exactly what a `widthScale` chosen for the module's
    // widest part risks. The survey mast's box was widened 3.8× to contain its
    // own dish (see `RIG_MODULE_FORMS`); this is the bound that widening has to
    // respect, and it is the reason x was the axis chosen to grow into.
    let checked = 0;
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const mount of blockout.moduleMounts) {
        if (mount.anchor !== "hull-top") continue;
        checked += 1;
        const box = boxOf(mount);
        expect({
          rigId,
          moduleId: mount.moduleId,
          overhangsSide: box.minX < -blockout.hull.width / 2,
          overhangsOtherSide: box.maxX > blockout.hull.width / 2,
          overhangsFront: box.maxZ > blockout.hull.depth / 2,
          overhangsRear: box.minZ < -blockout.hull.depth / 2,
        }).toEqual({
          rigId,
          moduleId: mount.moduleId,
          overhangsSide: false,
          overhangsOtherSide: false,
          overhangsFront: false,
          overhangsRear: false,
        });
      }
    }
    // Asserting over an empty set would prove nothing: two rigs are offered the
    // mast, so this loop has to have run.
    expect(checked).toBeGreaterThanOrEqual(2);
  });

  it("rests every bodywork volume on the rig instead of floating it", () => {
    // The invariant the doubling test structurally cannot see.
    //
    // `RIG_SUPERSTRUCTURES` arrived as absolute metres and was converted twice. The
    // second attempt scaled those metres by a `rideHeight` ratio *and* added
    // `rideHeight` on top — a third vertical frame, existing nowhere. Every test
    // passed, including the doubling test, because a proportionality check asks
    // whether geometry scales and not where it lands: both the right formula and
    // `rideHeight + y * k` double exactly under a doubled profile. The tractor's cab
    // sat at y = 3.65 with the hull's top face at 1.30, floating 1.15 m over the
    // hull it is bolted to, and the suite was green.
    //
    // So the claim has to be about contact, not proportion: bodywork is bolted on,
    // therefore each volume's underside must meet the hull's top face or another
    // volume that does. A tolerance is needed because these are art-directed shapes
    // — a hood may sink into the hull or sit a centimetre proud — but a gap the size
    // of a ride height is not a styling choice.
    //
    // Two-sided on purpose. Sinking is tolerated with no depth limit, since how far
    // a hood beds into the hull is genuine art direction, so the far side of that
    // tolerance needs its own bound: a volume whose *top* has gone under the hull's
    // top face is not styled, it is buried and invisible. Without that, dropping the
    // `hull.topY` term — the mirror-image frame error, and just as easy to write —
    // would pass this test by sinking rather than floating.
    const MAX_FLOAT = 0.05;
    let checked = 0;
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      expect(blockout.superstructure.length).toBeGreaterThan(0);
      // Ascending, so each volume is only ever tested against supports that are
      // already known to be grounded themselves.
      const ordered = [...blockout.superstructure].sort((a, b) => a.y - b.y);
      const grounded: typeof ordered = [];
      for (const volume of ordered) {
        checked += 1;
        const bottom = volume.y - volume.height / 2;
        const supports = [blockout.hull.topY];
        for (const other of grounded) {
          const overlapsX =
            Math.abs(other.x - volume.x) < (other.width + volume.width) / 2;
          const overlapsZ =
            Math.abs(other.z - volume.z) < (other.depth + volume.depth) / 2;
          if (overlapsX && overlapsZ) supports.push(other.y + other.height / 2);
        }
        // The best support is the one it comes closest to touching.
        const gap = Math.min(...supports.map((top) => bottom - top));
        expect({
          rigId,
          label: volume.label,
          floating: gap > MAX_FLOAT,
          buried: volume.y + volume.height / 2 <= blockout.hull.topY,
        }).toEqual({
          rigId,
          label: volume.label,
          floating: false,
          buried: false,
        });
        grounded.push(volume);
      }
    }
    // Nine volumes across three rigs; an empty sweep would assert nothing.
    expect(checked).toBeGreaterThanOrEqual(9);
  });

  it("keeps bodywork inside the rig's own plan view", () => {
    // Bodywork wider or longer than the hull is not automatically wrong — a roof
    // overhangs, and the tractor's is 1.16× the hull on purpose. What would be wrong
    // is bodywork resolved against the *wrong* hull dimension, which a ratio table
    // makes possible by transposing two fields. Bounding the plan view to a small
    // multiple catches a transposition without forbidding an eave.
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      for (const volume of blockout.superstructure) {
        expect({
          rigId,
          label: volume.label,
          widerThanRig: volume.width > blockout.hull.width * 1.5,
          longerThanRig: volume.depth > blockout.hull.depth * 1.5,
        }).toEqual({
          rigId,
          label: volume.label,
          widerThanRig: false,
          longerThanRig: false,
        });
      }
    }
  });

  it("scales a module with the profile rather than pinning it in metres", () => {
    // Every length in the profile doubles, not just the hull's inputs. An
    // outboard module's x derives from the swept tyre, so leaving `wheelRadius`
    // alone tests a rig that got wider without its wheels growing — which is a
    // different claim, and one whose answer is correctly not 2.
    const small = rigBlockout(
      syntheticProfile({
        track: 2,
        wheelbase: 3,
        wheelRadius: 0.5,
        rideHeight: 1,
      }),
      NEUTRAL,
    );
    const large = rigBlockout(
      syntheticProfile({
        track: 4,
        wheelbase: 6,
        wheelRadius: 1,
        rideHeight: 2,
      }),
      NEUTRAL,
    );

    expect(small.moduleMounts.length).toBeGreaterThan(0);
    expect(large.moduleMounts).toHaveLength(small.moduleMounts.length);
    for (const [index, mount] of small.moduleMounts.entries()) {
      const doubled = large.moduleMounts[index]!;
      expect(doubled.moduleId).toBe(mount.moduleId);
      expect(doubled.width / mount.width).toBeCloseTo(2, 10);
      expect(doubled.height / mount.height).toBeCloseTo(2, 10);
      expect(doubled.depth / mount.depth).toBeCloseTo(2, 10);
      expect(doubled.y / mount.y).toBeCloseTo(2, 10);
      if (mount.x !== 0) expect(doubled.x / mount.x).toBeCloseTo(2, 10);
      if (mount.z !== 0) expect(doubled.z / mount.z).toBeCloseTo(2, 10);
    }
  });

  it("gives the survey mast a silhouette a player could read at distance", () => {
    // The module's promise is "sees far more of the land", and its cost is 7. If
    // it does not visibly change the rig's outline there is nothing to read.
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const mast = mountsFor(blockout, "survey-mast")[0];
      if (!mast) continue;
      expect(boxOf(mast).maxY).toBeGreaterThan(blockout.hull.topY * 2);
    }
  });
});

describe("wheel clearance envelope", () => {
  it("grows both extents once a wheel can turn", () => {
    for (const rigId of RIG_IDS) {
      for (const wheel of blockoutFor(rigId).wheelMounts) {
        if (wheel.steerLimit === 0) {
          expect(wheel.clearanceHalfWidth).toBeCloseTo(wheel.treadHalfWidth, 10);
          expect(wheel.clearanceHalfDepth).toBeCloseTo(wheel.treadRadius, 10);
        } else {
          expect(wheel.clearanceHalfWidth).toBeGreaterThan(wheel.treadHalfWidth);
          expect(wheel.clearanceHalfDepth).toBeGreaterThan(wheel.treadRadius);
        }
      }
    }
  });

  /**
   * The envelope has to cover a wheel wearing lug tyres, because the player can
   * buy them at any time and nothing beside the wheel moves when they do. Against
   * the bare-tyre sweep the tractor's pontoons sat 6.8 cm inside its own tread
   * bands — a collision that needed two owned modules to appear, which is why it
   * survived the first version of these tests.
   */
  it("covers the widest tread the garage sells for the wheel", () => {
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const fitsLugs = MODULES["lug-tires"].fits.includes(rigId);
      for (const wheel of blockout.wheelMounts) {
        if (fitsLugs) {
          expect(wheel.treadHalfWidth).toBeGreaterThan(wheel.width / 2);
          expect(wheel.treadRadius).toBeGreaterThan(wheel.radius);
        } else {
          // Not a hover special case: a wheel with no tread on offer has the
          // bare-tyre envelope because the garage sells it nothing.
          expect(wheel.treadHalfWidth).toBeCloseTo(wheel.width / 2, 10);
          expect(wheel.treadRadius).toBeCloseTo(wheel.radius, 10);
        }
      }
    }
  });

  /**
   * The tread's proud-ness is a ratio of the tyre, so a small wheel gets a small
   * tread. It was previously absolute — `width + 0.18` — which put 9 cm per side
   * on the buggy's 0.46 m front tyre and the same 9 cm on the tractor's 0.85 m
   * rear, i.e. the same block on wheels that differ by a factor of two.
   */
  it("scales the tread with the tyre rather than adding fixed metres", () => {
    const tractor = blockoutFor("utility-tractor");
    const front = tractor.wheelMounts.find((wheel) => wheel.steers)!;
    const rear = tractor.wheelMounts.find((wheel) => !wheel.steers)!;
    const proud = (wheel: (typeof tractor.wheelMounts)[number]) =>
      wheel.treadHalfWidth - wheel.width / 2;

    expect(rear.radius).toBeGreaterThan(front.radius * 1.2);
    expect(proud(rear) / proud(front)).toBeCloseTo(rear.radius / front.radius, 6);
    expect(rear.treadRadius / rear.radius).toBeCloseTo(
      front.treadRadius / front.radius,
      10,
    );
  });

  it("reads the steering limit the animation actually applies", () => {
    for (const rigId of RIG_IDS) {
      const limit = maximumSteeringAngleFor(rigId);
      for (const wheel of blockoutFor(rigId).wheelMounts) {
        expect(wheel.steerLimit).toBe(wheel.steers ? limit : 0);
      }
    }
  });

  /**
   * The projection `halfAlong·cos θ + halfAcross·sin θ` peaks at
   * `atan2(halfAcross, halfAlong)`, which for both shipped rigs lies just outside
   * full lock — so evaluating at the limit gives the same answer today. This
   * asserts the general case instead, because a wider steering limit would make
   * the shortcut under-report the swept volume.
   */
  it("bounds the sweep at its true maximum, not merely at full lock", () => {
    const wide = rigBlockout(
      { ...RIG_PROFILES["toy-buggy"], id: "toy-buggy" },
      RIG_SILHOUETTES["toy-buggy"],
    ).wheelMounts.find((wheel) => wheel.steers)!;

    for (let angle = 0; angle <= wide.steerLimit; angle += 0.01) {
      const halfWidth =
        wide.treadHalfWidth * Math.cos(angle) +
        wide.treadRadius * Math.sin(angle);
      const halfDepth =
        wide.treadRadius * Math.cos(angle) +
        wide.treadHalfWidth * Math.sin(angle);
      expect(halfWidth).toBeLessThanOrEqual(wide.clearanceHalfWidth + 1e-9);
      expect(halfDepth).toBeLessThanOrEqual(wide.clearanceHalfDepth + 1e-9);
    }
  });
});

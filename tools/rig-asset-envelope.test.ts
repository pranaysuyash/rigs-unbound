import { describe, expect, it } from "vitest";

import { RIG_IDS, RIG_PROFILES, type RigId } from "../src/game/contracts";
import { GROUND_DECAL_LIFT, blockoutFor } from "../src/game/rig-blockout";
import {
  ENVELOPE_TOLERANCE,
  candidatesFromSpecComponents,
  compareEnvelope,
  diagnoseUniformOffset,
  looksGroundFramed,
  rigAssetEnvelope,
  type CandidateNode,
} from "./rig-asset-envelope";

/** Turn an envelope back into the candidate shape, so a clean spec can be simulated. */
function candidatesFrom(rigId: RigId): CandidateNode[] {
  return rigAssetEnvelope(rigId).nodes.map((entry) => ({
    id: entry.id,
    localPosition: [...entry.localPosition],
    dimensions: { ...entry.dimensions },
  }));
}

describe("rig asset envelope", () => {
  it("emits an envelope for every shipped rig", () => {
    for (const rigId of RIG_IDS) {
      const envelope = rigAssetEnvelope(rigId);
      expect(envelope.rigId).toBe(rigId);
      expect(envelope.displayName).toBe(RIG_PROFILES[rigId].displayName);
      // The frame is the whole point of the module; an envelope that did not
      // declare it would be as ambiguous as the models were before it existed.
      expect(envelope.frame).toBe("ground");
      expect(envelope.nodes.map((entry) => entry.id)).toEqual(
        expect.arrayContaining(["root", "hull", "ground-decal"]),
      );
    }
  });

  it("uses asset-spec-legal component ids", () => {
    // The envelope is meant to be merged into an `.asset.json`, whose schema
    // constrains component ids to kebab-case. Emitting an id the schema rejects
    // would make the derivation useless at exactly the point of use.
    const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    for (const rigId of RIG_IDS) {
      for (const entry of rigAssetEnvelope(rigId).nodes) {
        expect(entry.id).toMatch(pattern);
      }
    }
  });

  it("places every wheel where the simulation samples terrain", () => {
    const profile = RIG_PROFILES["utility-tractor"];
    const wheels = rigAssetEnvelope("utility-tractor").nodes.filter((entry) =>
      entry.id.startsWith("wheel-"),
    );

    expect(wheels).toHaveLength(4);
    for (const wheel of wheels) {
      const [x, , z] = wheel.localPosition;
      expect(Math.abs(x)).toBeCloseTo(profile.track / 2, 10);
      expect(Math.abs(z)).toBeCloseTo(profile.wheelbase / 2, 10);
    }
  });

  it("puts every wheel centre exactly its own radius above the ground", () => {
    // This is the float bug expressed at the asset layer. In the ground frame
    // the statement "the tyre touches the ground" is `y === radius`, which
    // mentions no ride height and so cannot be got wrong by forgetting one.
    for (const rigId of RIG_IDS) {
      for (const entry of rigAssetEnvelope(rigId).nodes) {
        if (!entry.id.startsWith("wheel-")) continue;
        expect(entry.localPosition[1]).toBeCloseTo(
          entry.dimensions.radius!,
          10,
        );
      }
    }
  });

  it("keeps the tractor's axle differential while averaging the spin scale to one", () => {
    const wheels = rigAssetEnvelope("utility-tractor").nodes.filter((entry) =>
      entry.id.startsWith("wheel-"),
    );
    const front = wheels.find((entry) => entry.id === "wheel-front-left")!;
    const rear = wheels.find((entry) => entry.id === "wheel-rear-left")!;

    // Rear wheels are drawn larger, so they need a *smaller* multiple of the
    // kernel's single reference rotation, not a larger one.
    expect(rear.dimensions.radius!).toBeGreaterThan(front.dimensions.radius!);
    expect(rear.dimensions.spinScale!).toBeLessThan(
      front.dimensions.spinScale!,
    );

    const meanRadius = (front.dimensions.radius! + rear.dimensions.radius!) / 2;
    expect(meanRadius).toBeCloseTo(
      RIG_PROFILES["utility-tractor"].wheelRadius,
      10,
    );
  });

  it("gives a hover rig a skirt on its cushion and no wheels at all", () => {
    const envelope = rigAssetEnvelope("marsh-skimmer");
    const ids = envelope.nodes.map((entry) => entry.id);
    expect(ids).not.toEqual(expect.arrayContaining(["wheel-front-left"]));

    const skirt = envelope.nodes.find((entry) => entry.id === "hover-skirt")!;
    const clearance = RIG_PROFILES["marsh-skimmer"].suspensionTravel;
    expect(skirt.dimensions.groundClearance).toBeCloseTo(clearance, 10);
    // Bottom edge sits on the cushion — the number the shipped skimmer got wrong.
    expect(skirt.localPosition[1] - skirt.dimensions.height! / 2).toBeCloseTo(
      clearance,
      10,
    );
  });

  it("reports the hull top as a floor, not as a total height", () => {
    // A cab or mast sits above the hull and is art direction. Claiming a total
    // height would assert something RIG_PROFILES does not know.
    const envelope = rigAssetEnvelope("utility-tractor");
    const root = envelope.nodes.find((entry) => entry.id === "root")!;
    const hull = envelope.nodes.find((entry) => entry.id === "hull")!;

    expect(root.dimensions.heightAtLeast).toBeCloseTo(
      hull.localPosition[1] + hull.dimensions.height! / 2,
      10,
    );
    expect(root.dimensions.height).toBeUndefined();
    expect(
      envelope.authorable.some((line) => /superstructure/i.test(line)),
    ).toBe(true);
  });

  it("keeps the root extent wide and long enough to contain the wheels", () => {
    // Compare half-extent against half-extent. An earlier version of this test
    // compared the root's *full* width against a wheel's distance-from-centre,
    // which is satisfied by almost anything — and it duly passed while the depth
    // formula was understating the box by a whole half-wheelbase. A containment
    // check that cannot fail is not a containment check.
    for (const rigId of RIG_IDS) {
      const envelope = rigAssetEnvelope(rigId);
      const root = envelope.nodes.find((entry) => entry.id === "root")!;
      for (const entry of envelope.nodes) {
        if (!entry.id.startsWith("wheel-")) continue;
        const [x, , z] = entry.localPosition;
        expect(root.dimensions.width! / 2).toBeGreaterThanOrEqual(
          Math.abs(x) + entry.dimensions.width! / 2 - ENVELOPE_TOLERANCE,
        );
        expect(root.dimensions.depth! / 2).toBeGreaterThanOrEqual(
          Math.abs(z) + entry.dimensions.radius! - ENVELOPE_TOLERANCE,
        );
      }
    }
  });

  it("reports the root extent as a box that actually bounds the derived parts", () => {
    // Stated independently of the wheel loop above, so that a rig with no wheels
    // (the skimmer) is covered too: the hull is a derived part and the root has
    // to contain it whatever else exists.
    for (const rigId of RIG_IDS) {
      const envelope = rigAssetEnvelope(rigId);
      const root = envelope.nodes.find((entry) => entry.id === "root")!;
      const hull = envelope.nodes.find((entry) => entry.id === "hull")!;
      expect(root.dimensions.width!).toBeGreaterThanOrEqual(
        hull.dimensions.width! - ENVELOPE_TOLERANCE,
      );
      expect(root.dimensions.depth!).toBeGreaterThanOrEqual(
        hull.dimensions.depth! - ENVELOPE_TOLERANCE,
      );
    }
  });

  it("pins the contact decal to the shared ground-decal lift", () => {
    for (const rigId of RIG_IDS) {
      const decal = rigAssetEnvelope(rigId).nodes.find(
        (entry) => entry.id === "ground-decal",
      )!;
      expect(decal.localPosition[1]).toBeCloseTo(GROUND_DECAL_LIFT, 10);
      expect(decal.dimensions.lift).toBeCloseTo(GROUND_DECAL_LIFT, 10);
    }
  });

  it("tracks the blockout rather than restating it", () => {
    // The guarantee that makes this module safe to check specs against: every
    // number is the blockout's number. If these ever diverge, the envelope has
    // become a second source of truth — the exact failure it exists to prevent.
    for (const rigId of RIG_IDS) {
      const blockout = blockoutFor(rigId);
      const envelope = rigAssetEnvelope(rigId);
      const hull = envelope.nodes.find((entry) => entry.id === "hull")!;

      expect(hull.dimensions.width).toBeCloseTo(blockout.hull.width, 10);
      expect(hull.dimensions.height).toBeCloseTo(blockout.hull.height, 10);
      expect(hull.dimensions.depth).toBeCloseTo(blockout.hull.depth, 10);
      expect(hull.localPosition[1]).toBeCloseTo(blockout.hull.centreY, 10);

      for (const mount of blockout.wheelMounts) {
        const wheel = envelope.nodes.find(
          (entry) => entry.id === `wheel-${mount.label.toLowerCase()}`,
        )!;
        expect(wheel.localPosition).toEqual([mount.x, mount.restY, mount.z]);
        expect(wheel.dimensions.radius).toBeCloseTo(mount.radius, 10);
        expect(wheel.dimensions.spinScale).toBeCloseTo(mount.spinScale, 10);
      }
    }
  });

  it("explains every derived node, so a reviewer can check it by hand", () => {
    for (const rigId of RIG_IDS) {
      for (const entry of rigAssetEnvelope(rigId).nodes) {
        expect(entry.derivation.length).toBeGreaterThan(20);
      }
    }
  });
});

describe("envelope comparison", () => {
  it("passes a candidate that matches the derivation", () => {
    for (const rigId of RIG_IDS) {
      expect(
        compareEnvelope(rigAssetEnvelope(rigId), candidatesFrom(rigId)),
      ).toEqual([]);
    }
  });

  it("catches a footprint that drifted off the profile", () => {
    // The original drift, replayed: the tractor's authored track was 2.72/3.00
    // against a profile 2.6. A reconstruction estimating from a photo would
    // land somewhere similar, and this is what refuses it.
    //
    // Front-left sits at *negative* x, so the drifted half-track is -1.36. That
    // sign matters: a check that compared magnitudes would pass a model with
    // its left and right wheels swapped.
    const driftedHalfTrack = -1.36;
    const candidates = candidatesFrom("utility-tractor").map((entry) =>
      entry.id === "wheel-front-left"
        ? {
            ...entry,
            localPosition: [
              driftedHalfTrack,
              entry.localPosition![1]!,
              entry.localPosition![2]!,
            ],
          }
        : entry,
    );

    const drift = compareEnvelope(
      rigAssetEnvelope("utility-tractor"),
      candidates,
    );
    expect(drift).toHaveLength(1);
    expect(drift[0]!.nodeId).toBe("wheel-front-left");
    expect(drift[0]!.field).toBe("localPosition.x");
    expect(drift[0]!.delta).toBeCloseTo(
      driftedHalfTrack + RIG_PROFILES["utility-tractor"].track / 2,
      10,
    );
  });

  it("catches a wheel drawn at the wrong radius", () => {
    // The buggy shipped with a 0.56 drawn radius against a 0.43 simulated one.
    const candidates = candidatesFrom("toy-buggy").map((entry) =>
      entry.id === "wheel-rear-right"
        ? { ...entry, dimensions: { ...entry.dimensions, radius: 0.56 } }
        : entry,
    );

    const drift = compareEnvelope(rigAssetEnvelope("toy-buggy"), candidates);
    expect(drift.map((item) => item.field)).toContain("dimensions.radius");
    expect(drift.every((item) => item.nodeId === "wheel-rear-right")).toBe(
      true,
    );
  });

  it("catches a shadow lifted off the ground", () => {
    // The skimmer's shadow floated 0.63 m. At the asset layer that is a decal
    // authored above the shared lift, and it is now a failure rather than a
    // stylistic choice nobody measured.
    const candidates = candidatesFrom("marsh-skimmer").map((entry) =>
      entry.id === "ground-decal"
        ? { ...entry, localPosition: [0, 0.67, 0] }
        : entry,
    );

    const drift = compareEnvelope(
      rigAssetEnvelope("marsh-skimmer"),
      candidates,
    );
    expect(drift.some((item) => item.field === "localPosition.y")).toBe(true);
  });

  it("catches a model whose left and right wheels are swapped", () => {
    // A reconstruction built from a three-quarter reference plate has to infer
    // the hidden side, and mirroring it is the obvious way to get that wrong.
    // The comparison is signed rather than by magnitude precisely so this fails:
    // `WHEEL_LOCAL_SIGNS` binds each index to a side, and the simulation samples
    // terrain at that side. A mirrored pair puts the visible wheel on the
    // opposite contact from the one it is animated by.
    const envelope = rigAssetEnvelope("toy-buggy");
    const left = envelope.nodes.find(
      (entry) => entry.id === "wheel-front-left",
    )!;
    const right = envelope.nodes.find(
      (entry) => entry.id === "wheel-front-right",
    )!;

    const candidates = candidatesFrom("toy-buggy").map((entry) => {
      if (entry.id === "wheel-front-left") {
        return { ...entry, localPosition: [...right.localPosition] };
      }
      if (entry.id === "wheel-front-right") {
        return { ...entry, localPosition: [...left.localPosition] };
      }
      return entry;
    });

    const drift = compareEnvelope(envelope, candidates);
    expect(drift.map((item) => item.nodeId).sort()).toEqual([
      "wheel-front-left",
      "wheel-front-right",
    ]);
    expect(drift.every((item) => item.field === "localPosition.x")).toBe(true);
  });

  it("reports a required node the candidate never modelled", () => {
    const candidates = candidatesFrom("toy-buggy").filter(
      (entry) => entry.id !== "hull",
    );

    const drift = compareEnvelope(rigAssetEnvelope("toy-buggy"), candidates);
    expect(drift).toHaveLength(1);
    expect(drift[0]!.nodeId).toBe("hull");
    expect(drift[0]!.actual).toBeNull();
  });

  it("treats a missing dimension as drift rather than as agreement", () => {
    // An absent field is the quiet failure mode: a comparison that skipped it
    // would pass a spec that simply declined to state its radius.
    const candidates = candidatesFrom("toy-buggy").map((entry) =>
      entry.id === "wheel-front-left" ? { ...entry, dimensions: {} } : entry,
    );

    const drift = compareEnvelope(rigAssetEnvelope("toy-buggy"), candidates);
    expect(drift.length).toBeGreaterThan(0);
    expect(drift.every((item) => item.actual === null)).toBe(true);
  });

  it("ignores extra nodes a reconstruction adds", () => {
    // A reconstruction is expected to model a cab, a boom, a beacon. The
    // envelope constrains what the simulation determines and nothing else.
    const candidates = [
      ...candidatesFrom("toy-buggy"),
      {
        id: "roll-bar",
        localPosition: [0, 1.4, -0.2],
        dimensions: { width: 1.1 },
      },
    ];

    expect(compareEnvelope(rigAssetEnvelope("toy-buggy"), candidates)).toEqual(
      [],
    );
  });

  it("accepts a candidate within tolerance but not beyond it", () => {
    const envelope = rigAssetEnvelope("toy-buggy");
    const near = candidatesFrom("toy-buggy").map((entry) =>
      entry.id === "hull"
        ? {
            ...entry,
            dimensions: {
              ...entry.dimensions,
              width: entry.dimensions!.width as number,
            },
          }
        : entry,
    );
    expect(compareEnvelope(envelope, near)).toEqual([]);

    const hullWidth = envelope.nodes.find((entry) => entry.id === "hull")!
      .dimensions.width!;
    const inside = candidatesFrom("toy-buggy").map((entry) =>
      entry.id === "hull"
        ? {
            ...entry,
            dimensions: {
              ...entry.dimensions,
              width: hullWidth + ENVELOPE_TOLERANCE * 0.5,
            },
          }
        : entry,
    );
    expect(compareEnvelope(envelope, inside)).toEqual([]);

    const outside = candidatesFrom("toy-buggy").map((entry) =>
      entry.id === "hull"
        ? {
            ...entry,
            dimensions: {
              ...entry.dimensions,
              width: hullWidth + ENVELOPE_TOLERANCE * 3,
            },
          }
        : entry,
    );
    expect(compareEnvelope(envelope, outside)).toHaveLength(1);
  });
});

/**
 * Build the `components` fragment a real rig `.asset.json` would carry, in the
 * schema's shape (`pivot.localPosition`, `dimensions`) rather than the module's.
 * This is the seam the CLI's `--check` mode crosses, so it is exercised here
 * rather than only by running the tool by hand.
 */
function specComponentsFor(rigId: RigId): unknown[] {
  return rigAssetEnvelope(rigId).nodes.map((entry) => ({
    id: entry.id,
    parent: entry.parent,
    level: entry.level,
    role: "authored by a reconstruction, not derived",
    topology: { class: "assembled-solid", primitiveStrategy: "named pivots" },
    pivot: {
      mode: "derived-envelope",
      localPosition: [...entry.localPosition],
      axis: [1, 0, 0],
    },
    sockets: [],
    collider: {
      type: "compound-proxy",
      authority: "simulation-owned",
      isTrigger: false,
    },
    materials: ["painted-steel"],
    action: { animationRole: "static", states: ["default"], detachable: false },
    dimensions: { ...entry.dimensions },
  }));
}

describe("asset spec adapter", () => {
  it("reads pivot.localPosition and dimensions out of schema-shaped components", () => {
    // The schema nests position under `pivot`, the module reads it flat. If this
    // mapping is wrong every position reads as absent, which surfaces as a full
    // drift report rather than as a parse error — so it is worth pinning.
    for (const rigId of RIG_IDS) {
      const drift = compareEnvelope(
        rigAssetEnvelope(rigId),
        candidatesFromSpecComponents(specComponentsFor(rigId)),
      );
      expect(drift).toEqual([]);
    }
  });

  it("still catches drift once the spec has been through the adapter", () => {
    // End to end: a spec whose front-left wheel sits at the drifted half-track
    // the shipped tractor actually had.
    const components = specComponentsFor("utility-tractor").map((raw) => {
      const component = raw as {
        id: string;
        pivot: { localPosition: number[] };
      };
      if (component.id !== "wheel-front-left") return raw;
      return {
        ...component,
        pivot: { ...component.pivot, localPosition: [-1.36, 0.5904, 1.55] },
      };
    });

    const drift = compareEnvelope(
      rigAssetEnvelope("utility-tractor"),
      candidatesFromSpecComponents(components),
    );
    expect(drift.map((item) => item.field)).toContain("localPosition.x");
  });

  it("throws rather than returning nothing when the shape is unreadable", () => {
    // An empty candidate list would make every required node "missing", burying a
    // parse failure inside a plausible-looking drift report.
    expect(() => candidatesFromSpecComponents(undefined)).toThrow(/components/);
    expect(() => candidatesFromSpecComponents({})).toThrow(/components/);
    expect(() => candidatesFromSpecComponents([{ parent: null }])).toThrow(
      /components\[0\] has no string id/,
    );
  });

  it("tolerates a component that omits pivot or dimensions entirely", () => {
    // Missing is reported as drift by compareEnvelope, not thrown here: an
    // under-specified component is an authoring gap, and the drift report names
    // exactly which field is absent.
    const candidates = candidatesFromSpecComponents([{ id: "hull" }]);
    expect(candidates[0]!.localPosition).toBeUndefined();
    expect(candidates[0]!.dimensions).toBeUndefined();

    const drift = compareEnvelope(rigAssetEnvelope("toy-buggy"), candidates);
    expect(drift.some((item) => item.nodeId === "hull")).toBe(true);
    expect(drift.some((item) => item.nodeId === "root")).toBe(true);
  });
});

describe("uniform-offset diagnosis", () => {
  /** Lower every node by `offset`, i.e. author the spec in some other frame. */
  function shiftedBy(rigId: RigId, offset: number): CandidateNode[] {
    return candidatesFrom(rigId).map((entry) => ({
      ...entry,
      localPosition: [
        entry.localPosition![0]!,
        entry.localPosition![1]! + offset,
        entry.localPosition![2]!,
      ],
    }));
  }

  it("names ride height as the single cause of a whole-rig y drift", () => {
    // The shipped float, at the asset layer: a spec authored around the body
    // origin is every node low by exactly rideHeight.
    for (const rigId of RIG_IDS) {
      const envelope = rigAssetEnvelope(rigId);
      const rideHeight = RIG_PROFILES[rigId].rideHeight;
      const drift = compareEnvelope(envelope, shiftedBy(rigId, -rideHeight));

      const diagnosis = diagnoseUniformOffset(envelope, drift)!;
      expect(diagnosis).not.toBeNull();
      expect(diagnosis.axis).toBe("y");
      expect(diagnosis.offset).toBeCloseTo(-rideHeight, 6);
      expect(diagnosis.matchesRideHeight).toBe(true);
      expect(diagnosis.nodeIds.length).toBe(envelope.nodes.length);
    }
  });

  it("reports a shared offset that is not ride height as a frame error anyway", () => {
    const envelope = rigAssetEnvelope("toy-buggy");
    const drift = compareEnvelope(envelope, shiftedBy("toy-buggy", 0.4));

    const diagnosis = diagnoseUniformOffset(envelope, drift)!;
    expect(diagnosis.offset).toBeCloseTo(0.4, 6);
    // Still one cause — just not the rideHeight one, so the message must not
    // claim a diagnosis it has not earned.
    expect(diagnosis.matchesRideHeight).toBe(false);
  });

  it("stays silent when the drifts have genuinely different causes", () => {
    // A drifted footprint plus an oversized tyre plus a lifted shadow is three
    // separate defects. Presenting them as one systemic cause would be a
    // confident wrong answer, which is worse than no answer.
    const envelope = rigAssetEnvelope("utility-tractor");
    const candidates = candidatesFrom("utility-tractor").map((entry) => {
      if (entry.id === "wheel-front-left") {
        return { ...entry, localPosition: [-1.36, 0.5904, 1.55] };
      }
      if (entry.id === "wheel-rear-right") {
        return { ...entry, dimensions: { ...entry.dimensions, radius: 0.95 } };
      }
      if (entry.id === "ground-decal") {
        return { ...entry, localPosition: [0, 0.31, 0] };
      }
      return entry;
    });

    const drift = compareEnvelope(envelope, candidates);
    expect(drift).toHaveLength(3);
    expect(diagnoseUniformOffset(envelope, drift)).toBeNull();
  });

  it("refuses to generalise from only two agreeing nodes", () => {
    // Two equal deltas are as likely to be coincidence as cause.
    const envelope = rigAssetEnvelope("utility-tractor");
    const candidates = candidatesFrom("utility-tractor").map((entry) =>
      entry.id === "wheel-front-left" || entry.id === "wheel-front-right"
        ? {
            ...entry,
            localPosition: [
              entry.localPosition![0]!,
              entry.localPosition![1]! + 0.2,
              entry.localPosition![2]!,
            ],
          }
        : entry,
    );

    const drift = compareEnvelope(envelope, candidates);
    expect(drift).toHaveLength(2);
    expect(diagnoseUniformOffset(envelope, drift)).toBeNull();
  });

  it("stays silent when a dimension drift accompanies the shared offset", () => {
    // A uniform offset only explains everything if it explains *everything*. With
    // a stray radius in the list, "one cause" would be a false summary.
    const envelope = rigAssetEnvelope("toy-buggy");
    const candidates = shiftedBy("toy-buggy", -0.62).map((entry) =>
      entry.id === "wheel-rear-left"
        ? { ...entry, dimensions: { ...entry.dimensions, radius: 0.7 } }
        : entry,
    );

    const drift = compareEnvelope(envelope, candidates);
    expect(drift.some((item) => item.field === "dimensions.radius")).toBe(true);
    expect(diagnoseUniformOffset(envelope, drift)).toBeNull();
  });
});

describe("ground-frame declaration", () => {
  it("accepts the frame the derivation itself declares", () => {
    // If the envelope's own origin string failed this check the guard would be
    // useless, so tie them together rather than testing a hand-written sample.
    for (const rigId of RIG_IDS) {
      expect(
        looksGroundFramed(rigAssetEnvelope(rigId).coordinateFrame.origin),
      ).toBe(true);
    }
  });

  it("rejects a body-frame origin, and anything that is not a string", () => {
    // A body-frame spec disagrees by exactly rideHeight on every node at once,
    // which reads as a catalogue of unrelated drift instead of one frame error.
    expect(
      looksGroundFramed(
        "centre of the chassis at the body origin the kernel positions",
      ),
    ).toBe(false);
    expect(looksGroundFramed("hub centreline, mid-wheelbase")).toBe(false);
    expect(looksGroundFramed(undefined)).toBe(false);
    expect(looksGroundFramed(null)).toBe(false);
    expect(looksGroundFramed(0)).toBe(false);
  });

  it("accepts the plausible ways an author names the contact plane", () => {
    expect(looksGroundFramed("on the ground plane")).toBe(true);
    expect(looksGroundFramed("centre of the CONTACT patch")).toBe(true);
    expect(looksGroundFramed("tyre contact, y = 0")).toBe(true);
    expect(looksGroundFramed("y=0 at the surface")).toBe(true);
  });
});

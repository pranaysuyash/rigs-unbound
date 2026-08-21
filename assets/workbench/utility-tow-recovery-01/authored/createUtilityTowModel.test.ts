import { describe, expect, it } from "vitest";
import * as THREE from "three";
import envelope from "../rig-envelope.json";
import { createUtilityTowModel } from "./createUtilityTowModel";

type EnvelopeWheelNode = {
  id: string;
  localPosition: [number, number, number];
  dimensions: {
    radius: number;
    width: number;
    spinScale: number;
    simulationWheelIndex: number;
  };
};

const envelopeWheels = (envelope.nodes as EnvelopeWheelNode[]).filter(
  (node) => node.id.startsWith("wheel-"),
);

function findWheel(root: THREE.Object3D, id: string): THREE.Object3D {
  const wheel = root.getObjectByName(id);
  if (!wheel) throw new Error(`Missing wheel node: ${id}`);
  return wheel;
}

describe("createUtilityTowModel", () => {
  it("builds a valid Three.js model root with expected subassemblies", () => {
    const model = createUtilityTowModel();

    expect(model).toBeInstanceOf(THREE.Group);
    expect(model.name).toBe("heavy-utility-tow-recovery-01");

    const names = model.children.map((child) => child.name);
    expect(names).toContain("chassis-frame");
    expect(names).toContain("operator-cab");
    expect(names).toContain("recovery-boom-assembly");
    expect(names).toContain("winch-spool-unit");
    expect(names).toContain("outrigger-pads");
    expect(names).toContain("rear-hazard-bumper");
    expect(names).toContain("service-drawers");
    expect(names).toContain("fuel-and-chain-locker");
    expect(names).toContain("6x6-wheels");
    expect(names).toContain("ground-decal");
  });

  it("keeps 6x6 wheel identity with the four simulated contacts bound to the envelope", () => {
    const model = createUtilityTowModel();
    const wheels = model.getObjectByName("6x6-wheels");
    expect(wheels?.children.length).toBe(6);

    for (const node of envelopeWheels) {
      const wheel = findWheel(model, node.id);
      expect(wheel.userData.simulationWheelIndex).toBe(
        node.dimensions.simulationWheelIndex,
      );
      // Envelope localPosition is GROUND-frame: x/z must match exactly and
      // the wheel centre must sit at y = radius so the tyre touches y = 0.
      expect(wheel.position.x).toBeCloseTo(node.localPosition[0], 5);
      expect(wheel.position.z).toBeCloseTo(node.localPosition[2], 5);
      expect(wheel.position.y).toBeCloseTo(node.dimensions.radius, 5);

      // The tyre mesh is the widest child of the wheel group.
      let tyre: THREE.Mesh | undefined;
      let widest = -Infinity;
      wheel.children.forEach((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const geo = child.geometry as THREE.CylinderGeometry;
        if (geo.parameters?.height === undefined) return;
        if (geo.parameters.height > widest) {
          widest = geo.parameters.height;
          tyre = child as THREE.Mesh;
        }
      });
      const tyreGeometry = tyre?.geometry as THREE.CylinderGeometry;
      expect(tyreGeometry.parameters.radiusTop).toBeCloseTo(
        node.dimensions.radius,
        5,
      );
      expect(tyreGeometry.parameters.height).toBeCloseTo(
        node.dimensions.width,
        5,
      );

      // Ground contact: no simulated wheel may float or sink.
      const box = new THREE.Box3().setFromObject(wheel);
      expect(box.min.y).toBeGreaterThanOrEqual(-0.01);
      expect(box.min.y).toBeLessThanOrEqual(0.01);
    }
  });

  it("calculates a non-empty bounding box inside the derived root extents", () => {
    const model = createUtilityTowModel();
    const box = new THREE.Box3().setFromObject(model);

    expect(box.isEmpty()).toBe(false);
    const size = new THREE.Vector3();
    box.getSize(size);

    // Derived root: width 3.935, depth 6.07 — the wheel track spans 3.77 and
    // bumpers/boom overhang must stay inside the root extent.
    expect(size.x).toBeGreaterThan(3.4);
    expect(size.x).toBeLessThanOrEqual(3.935 + 0.01);
    expect(size.z).toBeGreaterThan(5.5);
    expect(size.z).toBeLessThanOrEqual(6.07 + 0.02);
    // Hull top is 1.485; cab + beacon + raised boom push above it.
    expect(size.y).toBeGreaterThan(2.8);
  });

  it("poses the boom and outriggers through options without breaking the envelope", () => {
    const deployed = createUtilityTowModel({
      boomAngleDeg: 62,
      boomExtension: 1,
      outriggersDeployed: true,
    });
    const box = new THREE.Box3().setFromObject(deployed);
    expect(box.min.y).toBeGreaterThanOrEqual(-0.02);

    const stowed = createUtilityTowModel({ outriggersDeployed: false });
    const pads = stowed.getObjectByName("outrigger-pads");
    expect(pads).toBeDefined();
    const padBox = new THREE.Box3().setFromObject(pads!);
    // Stowed pads must clear the ground — they are not terrain clamps at rest.
    expect(padBox.min.y).toBeGreaterThan(0.3);
  });
});

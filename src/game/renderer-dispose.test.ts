import { describe, expect, it, vi } from "vitest";
import * as THREE from "three";

import { disposeObjectGraph } from "./renderer";

function meshWithSpies(): {
  mesh: THREE.Mesh;
  geometrySpy: ReturnType<typeof vi.spyOn>;
  materialSpy: ReturnType<typeof vi.spyOn>;
} {
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshStandardMaterial();
  const mesh = new THREE.Mesh(geometry, material);
  return {
    mesh,
    geometrySpy: vi.spyOn(geometry, "dispose"),
    materialSpy: vi.spyOn(material, "dispose"),
  };
}

describe("disposeObjectGraph", () => {
  it("disposes the geometry and material of a single mesh", () => {
    const { mesh, geometrySpy, materialSpy } = meshWithSpies();
    disposeObjectGraph(mesh);
    expect(geometrySpy).toHaveBeenCalledOnce();
    expect(materialSpy).toHaveBeenCalledOnce();
  });

  it("reaches every mesh in a nested group, not just the root", () => {
    const group = new THREE.Group();
    const nested = new THREE.Group();
    const a = meshWithSpies();
    const b = meshWithSpies();
    group.add(a.mesh);
    group.add(nested);
    nested.add(b.mesh);

    disposeObjectGraph(group);

    expect(a.geometrySpy).toHaveBeenCalledOnce();
    expect(a.materialSpy).toHaveBeenCalledOnce();
    expect(b.geometrySpy).toHaveBeenCalledOnce();
    expect(b.materialSpy).toHaveBeenCalledOnce();
  });

  it("disposes every material in a multi-material mesh", () => {
    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const materials = [
      new THREE.MeshStandardMaterial(),
      new THREE.MeshStandardMaterial(),
    ];
    const spies = materials.map((m) => vi.spyOn(m, "dispose"));
    const mesh = new THREE.Mesh(geometry, materials);

    disposeObjectGraph(mesh);

    for (const spy of spies) {
      expect(spy).toHaveBeenCalledOnce();
    }
  });

  it("does not throw on a graph with no meshes (empty group, lights, cameras)", () => {
    const group = new THREE.Group();
    group.add(new THREE.PointLight());
    group.add(new THREE.PerspectiveCamera());
    expect(() => disposeObjectGraph(group)).not.toThrow();
  });
});

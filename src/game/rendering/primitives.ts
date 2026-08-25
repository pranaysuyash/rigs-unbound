import * as THREE from "three";
import { createPbrMaterial } from "../pbr-materials";

/** Shared presentation palette (canonical home; renderer imports from here). */
export const COLORS = {
  rust: 0xb94f32,
  bone: 0xead8b8,
  gold: 0xd9aa52,
  cyan: 0x6bc9c4,
  tire: 0x242421,
  night: 0x13283c,
} as const;

export function material(
  color: number,
  roughness = 0.76,
  metalness = 0.08,
): THREE.MeshPhysicalMaterial {
  return createPbrMaterial(color, {
    roughness,
    metalness,
    clearcoat: 0.35,
    clearcoatRoughness: 0.3,
    type: "metal",
  });
}

export function box(
  width: number,
  height: number,
  depth: number,
  color: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth),
    material(color),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function cylinder(
  radiusTop: number,
  radiusBottom: number,
  height: number,
  segments: number,
  color: number,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
    material(color),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

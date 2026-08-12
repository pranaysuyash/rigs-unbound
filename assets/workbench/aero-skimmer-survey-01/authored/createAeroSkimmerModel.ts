import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type AeroSkimmerModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  tiltAngleDeg?: number; // 0 (forward flight) to 90 (hover)
  sensorGimbalActive?: boolean;
};

function fabricatedBoxGeometry(
  width: number,
  height: number,
  depth: number,
): RoundedBoxGeometry {
  const smallestDimension = Math.min(width, height, depth);
  return new RoundedBoxGeometry(
    width,
    height,
    depth,
    2,
    Math.min(0.028, smallestDimension * 0.12),
  );
}

const aviationWhite = new THREE.MeshStandardMaterial({
  color: 0xebf0f5,
  metalness: 0.2,
  roughness: 0.3,
});

const cyanShroud = new THREE.MeshStandardMaterial({
  color: 0x00a8b5,
  metalness: 0.4,
  roughness: 0.4,
});

const titaniumDark = new THREE.MeshStandardMaterial({
  color: 0x3d434a,
  metalness: 0.85,
  roughness: 0.35,
});

const floatYellow = new THREE.MeshStandardMaterial({
  color: 0xffcc00,
  metalness: 0.15,
  roughness: 0.6,
});

const canopyGlass = new THREE.MeshPhysicalMaterial({
  color: 0x9be2f5,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.85,
  transparent: true,
  opacity: 0.8,
});

const sensorOptic = new THREE.MeshStandardMaterial({
  color: 0x11161b,
  emissive: 0x004455,
  emissiveIntensity: 0.6,
  metalness: 0.9,
  roughness: 0.1,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: AeroSkimmerModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createAeroSkimmerModel(
  options: AeroSkimmerModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "aero-skimmer-survey-01";

  const hullMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.2,
        roughness: 0.3,
      })
    : aviationWhite;

  // 1. Composite Fuselage
  const fuselageGroup = new THREE.Group();
  fuselageGroup.name = "composite-fuselage";

  const mainBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.3, 0.95, 3.4), hullMat),
    options,
  );
  mainBody.position.set(0, 0.8, 0);
  fuselageGroup.add(mainBody);

  // Glass Bubble Canopy
  const canopy = finishMesh(
    new THREE.Mesh(new THREE.SphereGeometry(0.62, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55), canopyGlass),
    options,
  );
  canopy.position.set(0, 0.95, 0.6);
  canopy.scale.set(1.0, 0.85, 1.6);
  fuselageGroup.add(canopy);

  // Twin Tail Fins
  for (const side of [-0.45, 0.45]) {
    const fin = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.06, 0.7, 0.5), cyanShroud),
      options,
    );
    fin.position.set(side, 1.25, -1.5);
    fin.rotation.x = -Math.PI / 12;
    fuselageGroup.add(fin);
  }

  root.add(fuselageGroup);

  // 2 & 3. Tilt-Fan Thrusters (Left & Right Pylons)
  const tiltRad = ((options.tiltAngleDeg ?? 45) * Math.PI) / 180;

  for (const side of [-1, 1]) {
    const fanName = side < 0 ? "tilt-fan-left" : "tilt-fan-right";
    const fanGroup = new THREE.Group();
    fanGroup.name = fanName;
    fanGroup.position.set(side * 1.3, 0.85, 0.1);

    // Wing Pylon
    const pylon = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.7, 0.12, 0.4), hullMat),
      options,
    );
    pylon.position.set(-side * 0.35, 0, 0);
    fanGroup.add(pylon);

    // Ducted Fan Shroud Container (Rotates for tilt VTOL)
    const shroudGroup = new THREE.Group();
    shroudGroup.rotation.x = tiltRad;

    const shroudMesh = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.48, 0.45, 24, 1, true), cyanShroud),
      options,
    );
    shroudMesh.rotation.z = Math.PI / 2;
    shroudGroup.add(shroudMesh);

    // Fan Rotor Spinner & 3 Blades
    const spinner = finishMesh(
      new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.3, 16), titaniumDark),
      options,
    );
    spinner.rotation.x = Math.PI / 2;
    spinner.position.set(0, 0, 0.12);
    shroudGroup.add(spinner);

    for (let b = 0; b < 3; b++) {
      const blade = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(0.42, 0.06, 0.02), titaniumDark),
        options,
      );
      blade.rotation.z = (b * Math.PI * 2) / 3;
      shroudGroup.add(blade);
    }

    fanGroup.add(shroudGroup);
    root.add(fanGroup);
  }

  // 4. Lidar / Optical Sensor Gimbal Sphere (Nose)
  const sensorGroup = new THREE.Group();
  sensorGroup.name = "sensor-gimbal";
  sensorGroup.position.set(0, 0.5, 1.7);

  const gimbalSphere = finishMesh(
    new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 16), sensorOptic),
    options,
  );
  sensorGroup.add(gimbalSphere);
  root.add(sensorGroup);

  // 5. Landing Skids with Yellow Floats
  const skidsGroup = new THREE.Group();
  skidsGroup.name = "landing-skids";
  skidsGroup.position.set(0, 0.15, 0);

  for (const side of [-1, 1]) {
    // Tubular Skid Rail
    const rail = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.8, 12), titaniumDark),
      options,
    );
    rail.position.set(side * 0.85, 0, 0);
    rail.rotation.x = Math.PI / 2;
    skidsGroup.add(rail);

    // Yellow Flotation Pack
    const floatPack = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.18, 0.16, 1.8), floatYellow),
      options,
    );
    floatPack.position.set(side * 0.85, 0.08, 0);
    skidsGroup.add(floatPack);

    // Struts to Hull
    for (const zOffset of [-0.8, 0.8]) {
      const strut = finishMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.5, 12), titaniumDark),
        options,
      );
      strut.position.set(side * 0.72, 0.28, zOffset);
      strut.rotation.z = -side * (Math.PI / 8);
      skidsGroup.add(strut);
    }
  }

  root.add(skidsGroup);

  return root;
}

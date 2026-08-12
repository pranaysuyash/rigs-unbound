import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type CargoFreighterModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  rampOpen?: boolean;
  rotorsTilting?: boolean;
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

const freighterGrey = new THREE.MeshStandardMaterial({
  color: 0x909ca6,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x22262a,
  metalness: 0.75,
  roughness: 0.5,
});

const nacelleGrey = new THREE.MeshStandardMaterial({
  color: 0x48525c,
  metalness: 0.6,
  roughness: 0.4,
});

const propellerBlade = new THREE.MeshStandardMaterial({
  color: 0x181a1c,
  metalness: 0.8,
  roughness: 0.3,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x88c4dc,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.8,
  transparent: true,
  opacity: 0.75,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: CargoFreighterModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createCargoFreighterModel(
  options: CargoFreighterModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "aero-cargo-freighter-02";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : freighterGrey;

  // 1. Cargo Fuselage
  const fuselageGroup = new THREE.Group();
  fuselageGroup.name = "cargo-fuselage";

  const mainBay = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.8, 2.2, 7.6), paintMat),
    options,
  );
  mainBay.position.set(0, 1.8, 0);
  fuselageGroup.add(mainBay);

  // Wings (High-wing configuration)
  const mainWing = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(7.2, 0.25, 1.6), paintMat),
    options,
  );
  mainWing.position.set(0, 2.85, 0.4);
  fuselageGroup.add(mainWing);

  // Tail Vertical Stabilizers
  for (const side of [-1.0, 1.0]) {
    const vTail = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.12, 1.6, 1.2), nacelleGrey),
      options,
    );
    vTail.position.set(side, 3.2, -3.2);
    vTail.rotation.x = -Math.PI / 12;
    fuselageGroup.add(vTail);
  }

  root.add(fuselageGroup);

  // 2. Cockpit Cabin
  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = "cockpit-cabin";
  cockpitGroup.position.set(0, 2.1, 3.8);

  const noseNacelle = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 1.6, 1.4), paintMat),
    options,
  );
  cockpitGroup.add(noseNacelle);

  const glassCockpit = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.2, 0.8, 0.1), glassMaterial),
    options,
  );
  glassCockpit.position.set(0, 0.3, 0.71);
  cockpitGroup.add(glassCockpit);

  root.add(cockpitGroup);

  // 3. Quad Tilt Rotors (2 Left, 2 Right on wings)
  const quadRotorsGroup = new THREE.Group();
  quadRotorsGroup.name = "quad-tilt-rotors";

  const nacellePositions: [number, number, number][] = [
    [-2.8, 2.85, 1.2],
    [2.8, 2.85, 1.2],
    [-3.5, 2.85, -0.4],
    [3.5, 2.85, -0.4],
  ];

  const tiltRad = options.rotorsTilting ? Math.PI / 3 : 0;

  for (const pos of nacellePositions) {
    const nacelleNode = new THREE.Group();
    nacelleNode.position.set(...pos);

    const tiltGroup = new THREE.Group();
    tiltGroup.rotation.x = tiltRad;

    const engineNacelle = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 1.6, 24), nacelleGrey),
      options,
    );
    engineNacelle.rotation.x = Math.PI / 2;
    tiltGroup.add(engineNacelle);

    // Propeller Hub & 3 Blades
    const hub = finishMesh(
      new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 16), frameDark),
      options,
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, 0, 0.9);
    tiltGroup.add(hub);

    for (let b = 0; b < 3; b++) {
      const blade = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(1.4, 0.08, 0.03), propellerBlade),
        options,
      );
      blade.rotation.z = (b * Math.PI * 2) / 3;
      blade.position.set(0, 0, 0.85);
      tiltGroup.add(blade);
    }

    nacelleNode.add(tiltGroup);
    quadRotorsGroup.add(nacelleNode);
  }

  root.add(quadRotorsGroup);

  // 4. Rear Loading Ramp
  const rampGroup = new THREE.Group();
  rampGroup.name = "rear-loading-ramp";
  rampGroup.position.set(0, 1.0, -3.8);

  const rampDoor = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 0.12, 1.8), frameDark),
    options,
  );
  if (options.rampOpen) {
    rampDoor.rotation.x = Math.PI / 6; // Hinge down to ground
    rampDoor.position.set(0, -0.4, -0.8);
  } else {
    rampDoor.rotation.x = Math.PI / 2.2; // Sealed flush
    rampDoor.position.set(0, 0.4, 0);
  }
  rampGroup.add(rampDoor);
  root.add(rampGroup);

  // 5. Multi-Wheel Landing Gear (6 Wheels)
  const landingGearGroup = new THREE.Group();
  landingGearGroup.name = "multi-wheel-landing-gear";

  const gearPositions: [number, number, number][] = [
    [0, 0.4, 3.2], // Nose wheel
    [-1.2, 0.4, -0.5],
    [1.2, 0.4, -0.5],
    [-1.2, 0.4, -1.8],
    [1.2, 0.4, -1.8],
  ];

  const gearTyreGeo = new THREE.CylinderGeometry(0.4, 0.4, 0.35, 20);
  for (const pos of gearPositions) {
    const wheel = finishMesh(new THREE.Mesh(gearTyreGeo, propellerBlade), options);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    landingGearGroup.add(wheel);
  }
  root.add(landingGearGroup);

  return root;
}

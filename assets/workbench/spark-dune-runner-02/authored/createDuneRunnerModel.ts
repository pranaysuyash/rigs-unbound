import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type DuneRunnerModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
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

const cyanCage = new THREE.MeshStandardMaterial({
  color: 0x00c4cc,
  metalness: 0.5,
  roughness: 0.35,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x1d2124,
  metalness: 0.8,
  roughness: 0.45,
});

const shockSpring = new THREE.MeshStandardMaterial({
  color: 0xff3344,
  metalness: 0.6,
  roughness: 0.3,
});

const rubberBlack = new THREE.MeshStandardMaterial({
  color: 0x181a1c,
  metalness: 0.1,
  roughness: 0.85,
});

const seatFabric = new THREE.MeshStandardMaterial({
  color: 0x33383d,
  metalness: 0.1,
  roughness: 0.9,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: DuneRunnerModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createDuneRunnerModel(
  options: DuneRunnerModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "spark-dune-runner-02";

  const cageMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.5,
        roughness: 0.35,
      })
    : cyanCage;

  // 1. Roll-Cage Chassis
  const cageGroup = new THREE.Group();
  cageGroup.name = "roll-cage-chassis";

  // Main tubular perimeter structure
  const mainTray = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.6, 0.2, 3.8), frameDark),
    options,
  );
  mainTray.position.set(0, 0.4, 0);
  cageGroup.add(mainTray);

  // Tubular Roll Bar Pillars (Left & Right A & B Pillars)
  for (const side of [-0.75, 0.75]) {
    const aPillar = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12), cageMat),
      options,
    );
    aPillar.position.set(side, 1.0, 0.8);
    aPillar.rotation.x = -Math.PI / 8;
    cageGroup.add(aPillar);

    const bPillar = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12), cageMat),
      options,
    );
    bPillar.position.set(side, 1.0, -0.6);
    bPillar.rotation.x = Math.PI / 12;
    cageGroup.add(bPillar);

    const roofRail = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 12), cageMat),
      options,
    );
    roofRail.position.set(side, 1.55, 0.1);
    roofRail.rotation.x = Math.PI / 2;
    cageGroup.add(roofRail);
  }

  root.add(cageGroup);

  // 2. Cockpit Seats
  const cockpitGroup = new THREE.Group();
  cockpitGroup.name = "cockpit-seats";

  for (const side of [-0.35, 0.35]) {
    const seat = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.5, 0.7, 0.5), seatFabric),
      options,
    );
    seat.position.set(side, 0.75, 0.1);
    cockpitGroup.add(seat);
  }
  root.add(cockpitGroup);

  // 3. Battery Belly Pack
  const batteryGroup = new THREE.Group();
  batteryGroup.name = "battery-belly-pack";

  const batteryTray = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.4, 0.18, 2.2), frameDark),
    options,
  );
  batteryTray.position.set(0, 0.22, 0);
  batteryGroup.add(batteryTray);
  root.add(batteryGroup);

  // 4. Coilover Suspension (Front & Rear Shocks)
  const suspensionGroup = new THREE.Group();
  suspensionGroup.name = "coilover-suspension";

  for (const side of [-1, 1]) {
    for (const zPos of [1.2, -1.2]) {
      const shock = finishMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12), shockSpring),
        options,
      );
      shock.position.set(side * 0.85, 0.7, zPos);
      shock.rotation.z = -side * (Math.PI / 8);
      suspensionGroup.add(shock);
    }
  }
  root.add(suspensionGroup);

  // 5. Sand Paddle Wheels (Front: Ribbed, Rear: Paddle)
  const wheelsGroup = new THREE.Group();
  wheelsGroup.name = "sand-paddle-wheels";

  // Front Wheels (z=1.35)
  const frontTyreGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.3, 20);
  for (const side of [-1, 1]) {
    const tyre = finishMesh(new THREE.Mesh(frontTyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(side * 1.05, 0.45, 1.35);
    wheelsGroup.add(tyre);
  }

  // Rear Wheels (z=-1.4, Wider Sand Paddles)
  const rearTyreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.45, 20);
  for (const side of [-1, 1]) {
    const tyre = finishMesh(new THREE.Mesh(rearTyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(side * 1.15, 0.5, -1.4);
    wheelsGroup.add(tyre);
  }

  root.add(wheelsGroup);

  return root;
}

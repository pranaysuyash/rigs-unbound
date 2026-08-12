import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type SalvageCraneModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  boomAngleDeg?: number;
  outriggersDeployed?: boolean;
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

const craneYellow = new THREE.MeshStandardMaterial({
  color: 0xf5b014,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x24282c,
  metalness: 0.8,
  roughness: 0.5,
});

const latticeOrange = new THREE.MeshStandardMaterial({
  color: 0xd65319,
  metalness: 0.65,
  roughness: 0.4,
});

const hydraulicChrome = new THREE.MeshStandardMaterial({
  color: 0xd8dcde,
  metalness: 0.95,
  roughness: 0.15,
});

const rubberBlack = new THREE.MeshStandardMaterial({
  color: 0x1b1d1f,
  metalness: 0.1,
  roughness: 0.85,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x8cc8dc,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.8,
  transparent: true,
  opacity: 0.75,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: SalvageCraneModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createSalvageCraneModel(
  options: SalvageCraneModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "heavy-salvage-crane-02";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : craneYellow;

  // 1. Chassis 8x8
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-8x8";

  const mainFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.4, 0.4, 7.8), frameDark),
    options,
  );
  mainFrame.position.set(0, 0.5, 0);
  chassisGroup.add(mainFrame);

  // 8 Wheels (4 axles: z = 2.8, 1.4, -1.4, -2.8)
  const wheelPositions: [number, number, number][] = [
    [-1.35, 0.5, 2.8],
    [1.35, 0.5, 2.8],
    [-1.35, 0.5, 1.4],
    [1.35, 0.5, 1.4],
    [-1.35, 0.5, -1.4],
    [1.35, 0.5, -1.4],
    [-1.35, 0.5, -2.8],
    [1.35, 0.5, -2.8],
  ];

  const tyreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.45, 24);
  for (const pos of wheelPositions) {
    const tyre = finishMesh(new THREE.Mesh(tyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(...pos);
    chassisGroup.add(tyre);
  }

  root.add(chassisGroup);

  // 2. Operator Cab
  const cabGroup = new THREE.Group();
  cabGroup.name = "operator-cab";
  cabGroup.position.set(0, 1.4, 2.6);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.5, 1.3, 1.9), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const windshield = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.3, 0.65, 0.1), glassMaterial),
    options,
  );
  windshield.position.set(0, 0.2, 0.91);
  cabGroup.add(windshield);

  root.add(cabGroup);

  // 3. Slewing Turntable & Lattice Crane Boom
  const craneGroup = new THREE.Group();
  craneGroup.name = "slewing-turntable-crane";
  craneGroup.position.set(0, 0.9, -0.6);

  const slewingRing = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.95, 0.25, 32), frameDark),
    options,
  );
  craneGroup.add(slewingRing);

  const craneHouse = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.6, 1.1, 1.8), frameDark),
    options,
  );
  craneHouse.position.set(0, 0.7, 0);
  craneGroup.add(craneHouse);

  // Boom Pivot Arm
  const boomAngle = (options.boomAngleDeg ?? 30) * (Math.PI / 180);
  const boomArmGroup = new THREE.Group();
  boomArmGroup.position.set(0, 1.1, 0.3);
  boomArmGroup.rotation.x = -boomAngle;

  const latticeBoom = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.7, 0.7, 5.2), latticeOrange),
    options,
  );
  latticeBoom.position.set(0, 0, -2.4);
  boomArmGroup.add(latticeBoom);

  // Lift Cylinders
  const liftCyl = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 1.8, 16), hydraulicChrome),
    options,
  );
  liftCyl.position.set(0, 0.3, -1.0);
  liftCyl.rotation.x = Math.PI / 6;
  craneGroup.add(liftCyl);

  // 4. Hook Block Assembly
  const hookGroup = new THREE.Group();
  hookGroup.name = "hook-block-assembly";
  hookGroup.position.set(0, 0, -5.0);

  const blockMesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.4, 0.5, 0.3), paintMat),
    options,
  );
  hookGroup.add(blockMesh);

  const forgedHook = finishMesh(
    new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.04, 12, 24, Math.PI * 1.5), frameDark),
    options,
  );
  forgedHook.position.set(0, -0.4, 0);
  forgedHook.rotation.z = Math.PI;
  hookGroup.add(forgedHook);

  boomArmGroup.add(hookGroup);
  craneGroup.add(boomArmGroup);
  root.add(craneGroup);

  // 5. Four Hydraulic Outriggers
  const outriggersGroup = new THREE.Group();
  outriggersGroup.name = "hydraulic-outriggers";
  outriggersGroup.position.set(0, 0.5, 0);

  const isDeployed = options.outriggersDeployed ?? false;
  const deployOffset = isDeployed ? 0.7 : 0;

  for (const side of [-1, 1]) {
    for (const zPos of [1.8, -2.4]) {
      const leg = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(0.9, 0.22, 0.4), frameDark),
        options,
      );
      leg.position.set(side * (1.2 + deployOffset), isDeployed ? -0.2 : 0, zPos);
      outriggersGroup.add(leg);

      const footPad = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(0.45, 0.08, 0.45), frameDark),
        options,
      );
      footPad.position.set(side * (1.6 + deployOffset), isDeployed ? -0.38 : -0.1, zPos);
      outriggersGroup.add(footPad);
    }
  }

  root.add(outriggersGroup);

  // 6. Dual Winch Spools
  const winchesGroup = new THREE.Group();
  winchesGroup.name = "dual-winch-spools";
  winchesGroup.position.set(0, 1.2, -1.3);

  for (const side of [-0.4, 0.4]) {
    const drum = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.5, 24), frameDark),
      options,
    );
    drum.rotation.z = Math.PI / 2;
    drum.position.set(side, 0, 0);
    winchesGroup.add(drum);
  }

  root.add(winchesGroup);

  return root;
}

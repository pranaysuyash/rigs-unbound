import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type UtilityTowModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  boomAngleDeg?: number;
  boomExtension?: number; // 0 to 1
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

const cabOrange = new THREE.MeshStandardMaterial({
  color: 0xda5a1b,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x222629,
  metalness: 0.8,
  roughness: 0.5,
});

const craneWhite = new THREE.MeshStandardMaterial({
  color: 0xe0e4e8,
  metalness: 0.65,
  roughness: 0.35,
});

const hydraulicChrome = new THREE.MeshStandardMaterial({
  color: 0xd0d5dd,
  metalness: 0.95,
  roughness: 0.15,
});

const rubberBlack = new THREE.MeshStandardMaterial({
  color: 0x1a1c1e,
  metalness: 0.1,
  roughness: 0.85,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x88c4dc,
  metalness: 0.1,
  roughness: 0.1,
  transmission: 0.6,
  transparent: true,
  opacity: 0.7,
});

const beaconAmber = new THREE.MeshStandardMaterial({
  color: 0xffa500,
  emissive: 0xff7700,
  emissiveIntensity: 0.6,
  metalness: 0.2,
  roughness: 0.2,
});

const steelCable = new THREE.MeshStandardMaterial({
  color: 0x808588,
  metalness: 0.9,
  roughness: 0.3,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: UtilityTowModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createUtilityTowModel(
  options: UtilityTowModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "heavy-utility-tow-recovery-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : cabOrange;

  // 1. Chassis Frame (6x6)
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-frame";

  const mainFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.2, 0.35, 6.2), frameDark),
    options,
  );
  mainFrame.position.set(0, 0.4, 0);
  chassisGroup.add(mainFrame);

  // Deck plate
  const deckPlate = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 0.1, 4.0), frameDark),
    options,
  );
  deckPlate.position.set(0, 0.6, -1.0);
  chassisGroup.add(deckPlate);

  // Front push bumper
  const pushBumper = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.5, 0.4, 0.25), frameDark),
    options,
  );
  pushBumper.position.set(0, 0.35, 3.15);
  chassisGroup.add(pushBumper);

  root.add(chassisGroup);

  // 2. Operator Cabin
  const cabGroup = new THREE.Group();
  cabGroup.name = "operator-cab";
  cabGroup.position.set(0, 1.3, 1.7);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.3, 1.4, 1.8), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  // Windshield
  const windshield = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.1, 0.7, 0.1), glassMaterial),
    options,
  );
  windshield.position.set(0, 0.25, 0.86);
  cabGroup.add(windshield);

  // Roof Beacon Light Bar
  const beaconBar = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.2, 0.15, 0.25), beaconAmber),
    options,
  );
  beaconBar.position.set(0, 0.78, 0.1);
  cabGroup.add(beaconBar);

  root.add(cabGroup);

  // 3. Recovery Boom Assembly
  const boomGroup = new THREE.Group();
  boomGroup.name = "recovery-boom-assembly";
  boomGroup.position.set(0, 0.8, -0.6);

  // Slewing Turntable
  const turntable = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.75, 0.2, 24), frameDark),
    options,
  );
  boomGroup.add(turntable);

  // Crane Pivot Base
  const pivotBase = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.8, 0.6, 0.9), craneWhite),
    options,
  );
  pivotBase.position.set(0, 0.4, 0);
  boomGroup.add(pivotBase);

  // Main Boom Arm
  const boomAngle = (options.boomAngleDeg ?? 25) * (Math.PI / 180);
  const mainBoomArm = new THREE.Group();
  mainBoomArm.position.set(0, 0.6, 0.2);
  mainBoomArm.rotation.x = -boomAngle;

  const baseBoomMesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.5, 0.5, 3.2), craneWhite),
    options,
  );
  baseBoomMesh.position.set(0, 0, -1.4);
  mainBoomArm.add(baseBoomMesh);

  // Telescoping extension section
  const extensionRatio = options.boomExtension ?? 0.3;
  const extBoomMesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.38, 0.38, 2.8), frameDark),
    options,
  );
  extBoomMesh.position.set(0, 0, -1.4 - extensionRatio * 1.8);
  mainBoomArm.add(extBoomMesh);

  // Hydraulic lift cylinder
  const liftCylinder = finishMesh(
    new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16),
      hydraulicChrome,
    ),
    options,
  );
  liftCylinder.position.set(0, 0.1, -0.6);
  liftCylinder.rotation.x = Math.PI / 6;
  boomGroup.add(liftCylinder);

  // Pulley block & Hook at tip
  const hookGroup = new THREE.Group();
  hookGroup.position.set(0, 0, -2.8 - extensionRatio * 1.8);
  const hookBlock = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.3, 0.4, 0.25), craneWhite),
    options,
  );
  hookGroup.add(hookBlock);

  const forgedHook = finishMesh(
    new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 12, 24, Math.PI * 1.5), frameDark),
    options,
  );
  forgedHook.position.set(0, -0.3, 0);
  forgedHook.rotation.z = Math.PI;
  hookGroup.add(forgedHook);

  mainBoomArm.add(hookGroup);
  boomGroup.add(mainBoomArm);
  root.add(boomGroup);

  // 4. Winch Spool Unit
  const winchGroup = new THREE.Group();
  winchGroup.name = "winch-spool-unit";
  winchGroup.position.set(0, 0.75, -0.2);

  const spoolDrum = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.7, 24), steelCable),
    options,
  );
  spoolDrum.rotation.z = Math.PI / 2;
  winchGroup.add(spoolDrum);
  root.add(winchGroup);

  // 5. Outrigger Pads (Left / Right Rear)
  const outriggerGroup = new THREE.Group();
  outriggerGroup.name = "outrigger-pads";
  outriggerGroup.position.set(0, 0.4, -2.6);

  const deployOffset = options.outriggersDeployed ? 0.6 : 0;
  for (const side of [-1, 1]) {
    const leg = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.8, 0.2, 0.35), frameDark),
      options,
    );
    leg.position.set(side * (1.1 + deployOffset), options.outriggersDeployed ? -0.2 : 0, 0);
    outriggerGroup.add(leg);

    const pad = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.4, 0.08, 0.4), frameDark),
      options,
    );
    pad.position.set(side * (1.5 + deployOffset), options.outriggersDeployed ? -0.35 : -0.1, 0);
    outriggerGroup.add(pad);
  }
  root.add(outriggerGroup);

  // 6. 6x6 Wheels (Front: z=1.8, Mid: z=-0.8, Rear: z=-2.2)
  const wheelsGroup = new THREE.Group();
  wheelsGroup.name = "6x6-wheels";

  const wheelPositions: [number, number, number][] = [
    [-1.25, 0.55, 1.8],
    [1.25, 0.55, 1.8],
    [-1.25, 0.55, -0.8],
    [1.25, 0.55, -0.8],
    [-1.25, 0.55, -2.2],
    [1.25, 0.55, -2.2],
  ];

  const tyreGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.42, 24);
  const rimGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.44, 16);

  for (const pos of wheelPositions) {
    const wheelNode = new THREE.Group();
    wheelNode.position.set(...pos);

    const tyreMesh = finishMesh(new THREE.Mesh(tyreGeo, rubberBlack), options);
    tyreMesh.rotation.z = Math.PI / 2;
    wheelNode.add(tyreMesh);

    const rimMesh = finishMesh(new THREE.Mesh(rimGeo, frameDark), options);
    rimMesh.rotation.z = Math.PI / 2;
    wheelNode.add(rimMesh);

    wheelsGroup.add(wheelNode);
  }
  root.add(wheelsGroup);

  return root;
}

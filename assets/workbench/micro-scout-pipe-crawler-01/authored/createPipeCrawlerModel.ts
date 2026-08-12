import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type PipeCrawlerModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  cameraElevated?: boolean;
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

const titaniumYellow = new THREE.MeshStandardMaterial({
  color: 0xebad14,
  metalness: 0.5,
  roughness: 0.35,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x1c1f22,
  metalness: 0.85,
  roughness: 0.4,
});

const cameraLens = new THREE.MeshStandardMaterial({
  color: 0x11161b,
  emissive: 0x0066aa,
  emissiveIntensity: 0.7,
  metalness: 0.9,
  roughness: 0.1,
});

const magneticWheel = new THREE.MeshStandardMaterial({
  color: 0x3a424a,
  metalness: 0.9,
  roughness: 0.2,
});

const ledSpot = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  emissive: 0xfff0aa,
  emissiveIntensity: 0.9,
  metalness: 0.5,
  roughness: 0.2,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: PipeCrawlerModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createPipeCrawlerModel(
  options: PipeCrawlerModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "micro-scout-pipe-crawler-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.5,
        roughness: 0.35,
      })
    : titaniumYellow;

  // 1. Sealed Cylindrical Chassis Pod
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-tubular-pod";

  const podBody = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.75, 24), paintMat),
    options,
  );
  podBody.rotation.x = Math.PI / 2;
  podBody.position.set(0, 0.25, 0);
  chassisGroup.add(podBody);

  root.add(chassisGroup);

  // 2. 6-Wheeled Magnetic Traction Drive
  const driveGroup = new THREE.Group();
  driveGroup.name = "6-wheeled-magnetic-drive";

  const wheelGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 20);
  const wheelPositions: [number, number, number][] = [
    [-0.32, 0.15, 0.28],
    [0.32, 0.15, 0.28],
    [-0.32, 0.15, 0.0],
    [0.32, 0.15, 0.0],
    [-0.32, 0.15, -0.28],
    [0.32, 0.15, -0.28],
  ];

  for (const pos of wheelPositions) {
    const wheel = finishMesh(new THREE.Mesh(wheelGeo, magneticWheel), options);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(...pos);
    driveGroup.add(wheel);
  }

  root.add(driveGroup);

  // 3. Pantograph Elevating HD Camera Mast
  const mastGroup = new THREE.Group();
  mastGroup.name = "pantograph-camera-mast";

  const mastHeight = options.cameraElevated ? 0.35 : 0.12;
  mastGroup.position.set(0, 0.35 + mastHeight, 0.15);

  const cameraHead = finishMesh(
    new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 16), cameraLens),
    options,
  );
  mastGroup.add(cameraHead);

  root.add(mastGroup);

  // 4. Dual LED Spotlights
  const lightsGroup = new THREE.Group();
  lightsGroup.name = "dual-led-spotlights";
  lightsGroup.position.set(0, 0.3, 0.35);

  for (const side of [-0.12, 0.12]) {
    const spot = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.08, 16), ledSpot),
      options,
    );
    spot.rotation.x = Math.PI / 2;
    spot.position.set(side, 0, 0);
    lightsGroup.add(spot);
  }

  root.add(lightsGroup);

  // 5. Rear Tether Spool Connector
  const tetherGroup = new THREE.Group();
  tetherGroup.name = "tether-spool-connector";
  tetherGroup.position.set(0, 0.25, -0.42);

  const spool = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16), frameDark),
    options,
  );
  spool.rotation.x = Math.PI / 2;
  tetherGroup.add(spool);

  root.add(tetherGroup);

  return root;
}

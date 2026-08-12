import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type MarshDredgerModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  boomAngleDeg?: number;
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

const dredgerYellow = new THREE.MeshStandardMaterial({
  color: 0xdfa010,
  metalness: 0.3,
  roughness: 0.5,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x222528,
  metalness: 0.8,
  roughness: 0.5,
});

const hydraulicChrome = new THREE.MeshStandardMaterial({
  color: 0xd0d5d8,
  metalness: 0.95,
  roughness: 0.15,
});

const pontoonSteel = new THREE.MeshStandardMaterial({
  color: 0x424a52,
  metalness: 0.6,
  roughness: 0.45,
});

const rubberTrack = new THREE.MeshStandardMaterial({
  color: 0x181a1c,
  metalness: 0.1,
  roughness: 0.85,
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
  options: MarshDredgerModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createMarshDredgerModel(
  options: MarshDredgerModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "marsh-dredger-heavy-02";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.3,
        roughness: 0.5,
      })
    : dredgerYellow;

  // 1. Pontoon Chassis (Dual Buoyant Steel Pontoons)
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "pontoon-chassis";

  const centerPlatform = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.0, 0.4, 4.4), frameDark),
    options,
  );
  centerPlatform.position.set(0, 1.1, 0);
  chassisGroup.add(centerPlatform);

  for (const side of [-1.8, 1.8]) {
    const pontoon = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.9, 0.9, 5.2), pontoonSteel),
      options,
    );
    pontoon.position.set(side, 0.65, 0);
    chassisGroup.add(pontoon);
  }

  root.add(chassisGroup);

  // 2. Amphibious Track Pods
  const tracksGroup = new THREE.Group();
  tracksGroup.name = "amphibious-track-pods";

  for (const side of [-1.8, 1.8]) {
    const trackMesh = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.95, 0.4, 5.4), rubberTrack),
      options,
    );
    trackMesh.position.set(side, 0.2, 0);
    tracksGroup.add(trackMesh);
  }

  root.add(tracksGroup);

  // 3. Excavator Boom & Dipper Arm
  const boomGroup = new THREE.Group();
  boomGroup.name = "excavator-arm";
  boomGroup.position.set(0, 1.4, 1.2);

  const boomAngle = (options.boomAngleDeg ?? 35) * (Math.PI / 180);
  const boomArmNode = new THREE.Group();
  boomArmNode.rotation.x = -boomAngle;

  // Main Boom
  const mainBoom = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.5, 0.6, 3.8), paintMat),
    options,
  );
  mainBoom.position.set(0, 0, 1.8);
  boomArmNode.add(mainBoom);

  // Dipper Stick
  const dipperNode = new THREE.Group();
  dipperNode.position.set(0, 0, 3.6);
  dipperNode.rotation.x = Math.PI / 3;

  const dipperStick = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.4, 0.45, 2.6), paintMat),
    options,
  );
  dipperStick.position.set(0, 0, 1.2);
  dipperNode.add(dipperStick);

  // 4. Dredging Bucket
  const bucketGroup = new THREE.Group();
  bucketGroup.name = "dredging-bucket";
  bucketGroup.position.set(0, 0, 2.5);

  const bucketMesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.9, 0.8, 0.9), frameDark),
    options,
  );
  bucketMesh.rotation.x = Math.PI / 4;
  bucketGroup.add(bucketMesh);

  // Cutter Teeth
  for (const xPos of [-0.35, -0.12, 0.12, 0.35]) {
    const tooth = finishMesh(
      new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.25, 12), hydraulicChrome),
      options,
    );
    tooth.position.set(xPos, -0.4, 0.45);
    tooth.rotation.x = Math.PI / 2;
    bucketGroup.add(tooth);
  }

  dipperNode.add(bucketGroup);
  boomArmNode.add(dipperNode);
  boomGroup.add(boomArmNode);
  root.add(boomGroup);

  // 5. Operator Cab
  const cabGroup = new THREE.Group();
  cabGroup.name = "operator-cab";
  cabGroup.position.set(-0.8, 1.9, 0.4);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.2, 1.2, 1.4), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const glassWindow = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.1, 0.7, 0.1), glassMaterial),
    options,
  );
  glassWindow.position.set(0, 0.2, 0.66);
  cabGroup.add(glassWindow);

  root.add(cabGroup);

  return root;
}

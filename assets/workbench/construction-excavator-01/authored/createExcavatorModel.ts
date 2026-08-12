import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type ExcavatorModelOptions = {
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

const catYellow = new THREE.MeshStandardMaterial({
  color: 0xeb9e14,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x202428,
  metalness: 0.8,
  roughness: 0.5,
});

const hydraulicChrome = new THREE.MeshStandardMaterial({
  color: 0xd8e0e5,
  metalness: 0.95,
  roughness: 0.15,
});

const trackSteel = new THREE.MeshStandardMaterial({
  color: 0x363c42,
  metalness: 0.7,
  roughness: 0.5,
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
  options: ExcavatorModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createExcavatorModel(
  options: ExcavatorModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "construction-excavator-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : catYellow;

  // 1. Tracked Undercarriage
  const undercarriageGroup = new THREE.Group();
  undercarriageGroup.name = "tracked-undercarriage";

  const crossCarbody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.6, 0.4, 3.2), frameDark),
    options,
  );
  crossCarbody.position.set(0, 0.6, 0);
  undercarriageGroup.add(crossCarbody);

  for (const side of [-1.35, 1.35]) {
    const trackPod = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.65, 0.75, 4.4), trackSteel),
      options,
    );
    trackPod.position.set(side, 0.45, 0);
    undercarriageGroup.add(trackPod);
  }

  root.add(undercarriageGroup);

  // 2. Upper Revolving House & Counterweight
  const houseGroup = new THREE.Group();
  houseGroup.name = "upper-revolving-house";
  houseGroup.position.set(0, 0.85, 0);

  const slewingRing = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.85, 0.2, 32), frameDark),
    options,
  );
  slewingRing.position.set(0, 0.1, 0);
  houseGroup.add(slewingRing);

  const engineHouse = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.5, 1.1, 3.0), paintMat),
    options,
  );
  engineHouse.position.set(0, 0.75, -0.2);
  houseGroup.add(engineHouse);

  // Heavy Counterweight at rear
  const counterweight = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.5, 0.9, 0.8), frameDark),
    options,
  );
  counterweight.position.set(0, 0.75, -1.6);
  houseGroup.add(counterweight);

  root.add(houseGroup);

  // 3. Left-Hand Operator Glass Cab
  const cabGroup = new THREE.Group();
  cabGroup.name = "operator-glass-cab";
  cabGroup.position.set(-0.75, 1.6, 0.4);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.1, 1.2, 1.4), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const glassWindow = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.0, 0.7, 0.1), glassMaterial),
    options,
  );
  glassWindow.position.set(0, 0.2, 0.66);
  cabGroup.add(glassWindow);

  root.add(cabGroup);

  // 4. Two-Stage Articulated Boom & Dipper Arm
  const boomGroup = new THREE.Group();
  boomGroup.name = "articulated-boom-stick";
  boomGroup.position.set(0.45, 1.6, 0.6);

  const boomAngle = (options.boomAngleDeg ?? 30) * (Math.PI / 180);
  const boomNode = new THREE.Group();
  boomNode.rotation.x = -boomAngle;

  const mainBoom = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.4, 0.6, 4.2), paintMat),
    options,
  );
  mainBoom.position.set(0, 0, 1.9);
  boomNode.add(mainBoom);

  // Hydraulic Cylinders
  const cyl = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 16), hydraulicChrome),
    options,
  );
  cyl.position.set(0, 0.4, 1.2);
  cyl.rotation.x = Math.PI / 8;
  boomNode.add(cyl);

  // Dipper Stick
  const dipperNode = new THREE.Group();
  dipperNode.position.set(0, 0, 4.0);
  dipperNode.rotation.x = Math.PI / 2.8;

  const dipperStick = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.35, 0.45, 2.8), paintMat),
    options,
  );
  dipperStick.position.set(0, 0, 1.3);
  dipperNode.add(dipperStick);

  // 5. Heavy Rock Digging Bucket
  const bucketGroup = new THREE.Group();
  bucketGroup.name = "heavy-digging-bucket";
  bucketGroup.position.set(0, 0, 2.7);

  const bucketMesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.85, 0.7, 0.8), frameDark),
    options,
  );
  bucketMesh.rotation.x = Math.PI / 4;
  bucketGroup.add(bucketMesh);

  dipperNode.add(bucketGroup);
  boomNode.add(dipperNode);
  boomGroup.add(boomNode);
  root.add(boomGroup);

  return root;
}

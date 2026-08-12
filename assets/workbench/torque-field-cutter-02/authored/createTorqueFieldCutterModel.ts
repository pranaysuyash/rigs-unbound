import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type TorqueFieldCutterModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  mulcherActive?: boolean;
  wingsFolded?: boolean;
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

const cutterOrange = new THREE.MeshStandardMaterial({
  color: 0xe05a1b,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x222629,
  metalness: 0.8,
  roughness: 0.45,
});

const flailSteel = new THREE.MeshStandardMaterial({
  color: 0xa0a8b0,
  metalness: 0.9,
  roughness: 0.3,
});

const rubberBlack = new THREE.MeshStandardMaterial({
  color: 0x191b1d,
  metalness: 0.1,
  roughness: 0.85,
});

const glassMaterial = new THREE.MeshPhysicalMaterial({
  color: 0x88c8dc,
  metalness: 0.05,
  roughness: 0.05,
  transmission: 0.8,
  transparent: true,
  opacity: 0.75,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: TorqueFieldCutterModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createTorqueFieldCutterModel(
  options: TorqueFieldCutterModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "torque-field-cutter-02";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : cutterOrange;

  // 1. Heavy Tractor Frame
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "heavy-tractor-frame";

  const mainBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.8, 1.1, 3.8), paintMat),
    options,
  );
  mainBody.position.set(0, 1.0, 0);
  chassisGroup.add(mainBody);

  const subFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.6, 0.35, 4.2), frameDark),
    options,
  );
  subFrame.position.set(0, 0.45, 0);
  chassisGroup.add(subFrame);

  root.add(chassisGroup);

  // 2. Climate Control Operator Cab
  const cabGroup = new THREE.Group();
  cabGroup.name = "climate-control-cab";
  cabGroup.position.set(0, 1.85, -0.4);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.7, 1.1, 1.4), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const windshield = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.5, 0.6, 0.1), glassMaterial),
    options,
  );
  windshield.position.set(0, 0.15, 0.66);
  cabGroup.add(windshield);

  root.add(cabGroup);

  // 3. Front Flail Mulcher Drum
  const mulcherGroup = new THREE.Group();
  mulcherGroup.name = "front-mulcher-head";
  mulcherGroup.position.set(0, 0.45, 2.3);

  const mulcherHood = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 0.5, 0.7), frameDark),
    options,
  );
  mulcherGroup.add(mulcherHood);

  const drum = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 2.2, 24), flailSteel),
    options,
  );
  drum.rotation.z = Math.PI / 2;
  drum.position.set(0, -0.1, 0.1);
  mulcherGroup.add(drum);

  root.add(mulcherGroup);

  // 4. Flail Mower Wings (Left & Right Folding Wings)
  const wingsGroup = new THREE.Group();
  wingsGroup.name = "flail-mower-wings";
  wingsGroup.position.set(0, 0.7, 0.2);

  const wingAngle = options.wingsFolded ? Math.PI / 3 : 0;

  for (const side of [-1, 1]) {
    const wingNode = new THREE.Group();
    wingNode.position.set(side * 1.0, 0, 0);
    wingNode.rotation.z = side * wingAngle;

    const wingDeck = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(1.2, 0.2, 1.4), paintMat),
      options,
    );
    wingDeck.position.set(side * 0.6, 0, 0);
    wingNode.add(wingDeck);

    wingsGroup.add(wingNode);
  }
  root.add(wingsGroup);

  // 5. High-Clearance Wheels
  const wheelsGroup = new THREE.Group();
  wheelsGroup.name = "high-clearance-wheels";

  // Front Wheels (smaller: r=0.5m)
  const frontTyreGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.4, 20);
  for (const side of [-1, 1]) {
    const tyre = finishMesh(new THREE.Mesh(frontTyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(side * 1.15, 0.5, 1.3);
    wheelsGroup.add(tyre);
  }

  // Rear Wheels (larger: r=0.75m)
  const rearTyreGeo = new THREE.CylinderGeometry(0.75, 0.75, 0.5, 24);
  for (const side of [-1, 1]) {
    const tyre = finishMesh(new THREE.Mesh(rearTyreGeo, rubberBlack), options);
    tyre.rotation.z = Math.PI / 2;
    tyre.position.set(side * 1.2, 0.75, -1.2);
    wheelsGroup.add(tyre);
  }

  root.add(wheelsGroup);

  return root;
}

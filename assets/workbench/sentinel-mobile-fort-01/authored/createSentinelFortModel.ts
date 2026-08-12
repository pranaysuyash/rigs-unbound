import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type SentinelFortModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  barricadesDeployed?: boolean;
  spotlightActive?: boolean;
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

const charcoalArmor = new THREE.MeshStandardMaterial({
  color: 0x272a2e,
  metalness: 0.8,
  roughness: 0.4,
});

const hazardOrange = new THREE.MeshStandardMaterial({
  color: 0xeb6b1c,
  metalness: 0.3,
  roughness: 0.5,
});

const trackDark = new THREE.MeshStandardMaterial({
  color: 0x16181a,
  metalness: 0.2,
  roughness: 0.8,
});

const visionSlitGlass = new THREE.MeshStandardMaterial({
  color: 0x0a0c0e,
  metalness: 0.9,
  roughness: 0.1,
});

const spotlightLens = new THREE.MeshStandardMaterial({
  color: 0xfff0c2,
  emissive: 0xffc44d,
  emissiveIntensity: 0.95,
  metalness: 0.3,
  roughness: 0.1,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: SentinelFortModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createSentinelFortModel(
  options: SentinelFortModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "sentinel-mobile-fort-01";

  const armorMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.8,
        roughness: 0.4,
      })
    : charcoalArmor;

  // 1. Chassis Fortress Frame
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-fortress";

  const mainBase = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.6, 0.7, 4.4), armorMat),
    options,
  );
  mainBase.position.set(0, 0.65, 0);
  chassisGroup.add(mainBase);

  // Ground Anchor Pins (Front & Rear)
  for (const z of [2.1, -2.1]) {
    const pin = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.05, 0.6, 16), charcoalArmor),
      options,
    );
    pin.position.set(0, 0.2, z);
    chassisGroup.add(pin);
  }

  root.add(chassisGroup);

  // 2. Quad Track Pods (4 Corners)
  const quadTracksGroup = new THREE.Group();
  quadTracksGroup.name = "quad-track-pods";

  const podWidth = 0.6;
  const podLength = 1.6;
  const podHeight = 0.7;
  const cornerX = 1.5;
  const cornerZ = 1.35;

  for (const signX of [-1, 1]) {
    for (const signZ of [-1, 1]) {
      const podGroup = new THREE.Group();
      podGroup.position.set(signX * cornerX, 0.45, signZ * cornerZ);

      const podTrack = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(podWidth, podHeight, podLength), trackDark),
        options,
      );
      podGroup.add(podTrack);

      const podGuard = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(podWidth + 0.1, 0.15, podLength + 0.1), hazardOrange),
        options,
      );
      podGuard.position.set(0, podHeight / 2 + 0.05, 0);
      podGroup.add(podGuard);

      quadTracksGroup.add(podGroup);
    }
  }

  root.add(quadTracksGroup);

  // 3. Armored Command Core
  const cabGroup = new THREE.Group();
  cabGroup.name = "armored-command-core";
  cabGroup.position.set(0, 1.4, 0.4);

  const commandHull = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 0.9, 2.2), armorMat),
    options,
  );
  cabGroup.add(commandHull);

  // Front Sloped Armor & Vision Slit
  const visionSlit = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.8, 0.12, 0.05), visionSlitGlass),
    options,
  );
  visionSlit.position.set(0, 0.2, 1.11);
  cabGroup.add(visionSlit);

  root.add(cabGroup);

  // 4 & 5. Barricade Wings (Left & Right)
  const isDeployed = options.barricadesDeployed ?? false;

  for (const side of [-1, 1]) {
    const wingName = side < 0 ? "barricade-wing-left" : "barricade-wing-right";
    const wingGroup = new THREE.Group();
    wingGroup.name = wingName;
    wingGroup.position.set(side * 1.35, 1.0, 0);

    if (isDeployed) {
      wingGroup.rotation.z = side * (Math.PI / 4); // Unfolded outwards
    }

    const blastPlate = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.12, 1.1, 3.2), armorMat),
      options,
    );
    wingGroup.add(blastPlate);

    const stripe = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(0.14, 0.15, 3.0), hazardOrange),
      options,
    );
    stripe.position.set(side * 0.02, 0, 0);
    wingGroup.add(stripe);

    root.add(wingGroup);
  }

  // 6. Spotlight Lattice Mast
  const mastGroup = new THREE.Group();
  mastGroup.name = "spotlight-mast";
  mastGroup.position.set(0, 1.85, -1.2);

  // Steel Lattice Tower
  const tower = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 1.6, 8), charcoalArmor),
    options,
  );
  mastGroup.add(tower);

  // Searchlight Head
  const lightHead = finishMesh(
    new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.4, 16), options.spotlightActive ?? true ? spotlightLens : charcoalArmor),
    options,
  );
  lightHead.rotation.x = Math.PI / 2;
  lightHead.position.set(0, 1.0, 0.1);
  mastGroup.add(lightHead);

  root.add(mastGroup);

  return root;
}

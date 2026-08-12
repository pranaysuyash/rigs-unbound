import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type RoadTrainModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  trailerAttached?: boolean;
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

const haulerRed = new THREE.MeshStandardMaterial({
  color: 0xba2222,
  metalness: 0.35,
  roughness: 0.45,
});

const frameDark = new THREE.MeshStandardMaterial({
  color: 0x1f2225,
  metalness: 0.8,
  roughness: 0.5,
});

const chromeMat = new THREE.MeshStandardMaterial({
  color: 0xe0e6eb,
  metalness: 0.95,
  roughness: 0.1,
});

const rubberBlack = new THREE.MeshStandardMaterial({
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
  options: RoadTrainModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createRoadTrainModel(
  options: RoadTrainModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "hauler-road-train-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.35,
        roughness: 0.45,
      })
    : haulerRed;

  // 1. Prime Mover Chassis Frame
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "prime-mover-chassis";

  const mainFrame = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.2, 0.4, 6.8), frameDark),
    options,
  );
  mainFrame.position.set(0, 0.5, 0);
  chassisGroup.add(mainFrame);

  // Bullbar
  const bullbar = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 0.9, 0.3), chromeMat),
    options,
  );
  bullbar.position.set(0, 0.75, 3.4);
  chassisGroup.add(bullbar);

  // Twin Exhaust Stacks
  for (const side of [-1.1, 1.1]) {
    const stack = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.6, 16), chromeMat),
      options,
    );
    stack.position.set(side, 2.0, 1.1);
    chassisGroup.add(stack);
  }

  root.add(chassisGroup);

  // 2. Sleeper Cab Unit
  const cabGroup = new THREE.Group();
  cabGroup.name = "sleeper-cab-unit";
  cabGroup.position.set(0, 1.7, 1.8);

  const cabBody = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.4, 1.8, 2.8), paintMat),
    options,
  );
  cabGroup.add(cabBody);

  const windshield = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.2, 0.7, 0.1), glassMaterial),
    options,
  );
  windshield.position.set(0, 0.4, 1.36);
  cabGroup.add(windshield);

  // Chrome Grille
  const grille = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.6, 1.0, 0.1), chromeMat),
    options,
  );
  grille.position.set(0, -0.2, 1.36);
  cabGroup.add(grille);

  root.add(cabGroup);

  // 3. Fifth Wheel Coupling Plate
  const fifthWheelGroup = new THREE.Group();
  fifthWheelGroup.name = "fifth-wheel-hitch";
  fifthWheelGroup.position.set(0, 0.75, -1.6);

  const fifthPlate = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(0.9, 0.1, 0.9), frameDark),
    options,
  );
  fifthWheelGroup.add(fifthPlate);
  root.add(fifthWheelGroup);

  // 4. Triple Rear Axles & Steering Wheels
  const axlesGroup = new THREE.Group();
  axlesGroup.name = "triple-rear-axles";

  const tyreGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.45, 24);

  // Front Steer Axle (z=2.4)
  for (const side of [-1.15, 1.15]) {
    const wheel = finishMesh(new THREE.Mesh(tyreGeo, rubberBlack), options);
    wheel.rotation.z = Math.PI / 2;
    wheel.position.set(side, 0.55, 2.4);
    axlesGroup.add(wheel);
  }

  // Triple Rear Drive Axles (z = -1.0, -2.1, -3.2)
  for (const zPos of [-1.0, -2.1, -3.2]) {
    for (const side of [-1.2, 1.2]) {
      const wheel = finishMesh(new THREE.Mesh(tyreGeo, rubberBlack), options);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(side, 0.55, zPos);
      axlesGroup.add(wheel);
    }
  }
  root.add(axlesGroup);

  // 5. Primary Flatbed Cargo Trailer
  const trailerGroup = new THREE.Group();
  trailerGroup.name = "primary-flatbed-trailer";
  trailerGroup.position.set(0, 1.0, -7.2);

  if (options.trailerAttached ?? true) {
    const flatbed = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(2.5, 0.35, 9.0), frameDark),
      options,
    );
    trailerGroup.add(flatbed);

    // Trailer Triple Rear Axles
    for (const zPos of [-2.8, -3.8, -4.8]) {
      for (const side of [-1.2, 1.2]) {
        const wheel = finishMesh(new THREE.Mesh(tyreGeo, rubberBlack), options);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(side, -0.45, zPos);
        trailerGroup.add(wheel);
      }
    }
  }
  root.add(trailerGroup);

  return root;
}

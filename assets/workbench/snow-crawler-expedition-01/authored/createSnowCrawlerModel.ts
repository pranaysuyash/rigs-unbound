import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type SnowCrawlerModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  paintColor?: THREE.ColorRepresentation;
  plowActive?: boolean;
  thermalGlowActive?: boolean;
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

const sageGreenPaint = new THREE.MeshStandardMaterial({
  color: 0x5a7362,
  metalness: 0.25,
  roughness: 0.55,
});

const arcticSteel = new THREE.MeshStandardMaterial({
  color: 0x3a4045,
  metalness: 0.75,
  roughness: 0.45,
});

const trackRubber = new THREE.MeshStandardMaterial({
  color: 0x1f2224,
  metalness: 0.15,
  roughness: 0.85,
});

const thermalGlowMat = new THREE.MeshStandardMaterial({
  color: 0xff3300,
  emissive: 0xff2200,
  emissiveIntensity: 0.9,
  metalness: 0.2,
  roughness: 0.2,
});

const windowGlass = new THREE.MeshPhysicalMaterial({
  color: 0x7aa4b8,
  metalness: 0.1,
  roughness: 0.15,
  transmission: 0.65,
  transparent: true,
  opacity: 0.75,
});

const spotlightMat = new THREE.MeshStandardMaterial({
  color: 0xffeaad,
  emissive: 0xffd277,
  emissiveIntensity: 0.8,
  metalness: 0.3,
  roughness: 0.2,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: SnowCrawlerModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

export function createSnowCrawlerModel(
  options: SnowCrawlerModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "snow-crawler-expedition-01";

  const paintMat = options.paintColor
    ? new THREE.MeshStandardMaterial({
        color: options.paintColor,
        metalness: 0.25,
        roughness: 0.55,
      })
    : sageGreenPaint;

  // 1. Chassis Frame
  const chassisGroup = new THREE.Group();
  chassisGroup.name = "chassis-frame";

  const mainHull = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.2, 0.6, 4.2), arcticSteel),
    options,
  );
  mainHull.position.set(0, 0.6, 0);
  chassisGroup.add(mainHull);

  const skidPlate = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.0, 0.12, 3.8), arcticSteel),
    options,
  );
  skidPlate.position.set(0, 0.25, 0);
  chassisGroup.add(skidPlate);

  root.add(chassisGroup);

  // 2 & 3. Caterpillar Tracks (Left & Right)
  const trackWidth = 0.65;
  const trackLength = 4.0;
  const trackHeight = 0.75;
  const halfTrackX = 1.25;

  for (const side of [-1, 1]) {
    const trackGroup = new THREE.Group();
    trackGroup.name = side < 0 ? "caterpillar-track-left" : "caterpillar-track-right";
    trackGroup.position.set(side * halfTrackX, 0.45, 0);

    // Continuous Track Belt Outer Loop
    const beltMesh = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(trackWidth, trackHeight, trackLength), trackRubber),
      options,
    );
    trackGroup.add(beltMesh);

    // Track Wheels & Drive Sprockets (5 rollers per side)
    for (let i = -2; i <= 2; i++) {
      const roller = finishMesh(
        new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, trackWidth + 0.05, 16), arcticSteel),
        options,
      );
      roller.rotation.z = Math.PI / 2;
      roller.position.set(0, -0.05, i * 0.85);
      trackGroup.add(roller);
    }

    // Ice cleats along the track top and bottom
    for (let j = -4; j <= 4; j++) {
      const cleat = finishMesh(
        new THREE.Mesh(fabricatedBoxGeometry(trackWidth + 0.08, 0.04, 0.08), arcticSteel),
        options,
      );
      cleat.position.set(0, trackHeight / 2 + 0.02, j * 0.45);
      trackGroup.add(cleat);
    }

    root.add(trackGroup);
  }

  // 4. Pressurized Cab
  const cabGroup = new THREE.Group();
  cabGroup.name = "pressurized-cab";
  cabGroup.position.set(0, 1.5, 0.2);

  const mainCabin = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(2.1, 1.3, 3.2), paintMat),
    options,
  );
  cabGroup.add(mainCabin);

  // Sloped front windshield
  const windshield = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.9, 0.65, 0.1), windowGlass),
    options,
  );
  windshield.position.set(0, 0.2, 1.56);
  windshield.rotation.x = -Math.PI / 12;
  cabGroup.add(windshield);

  // Dual roof searchlights & Radar dome
  const radarDome = finishMesh(
    new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.7), arcticSteel),
    options,
  );
  radarDome.position.set(0, 0.8, -0.8);
  cabGroup.add(radarDome);

  for (const side of [-0.6, 0.6]) {
    const light = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.18, 16), spotlightMat),
      options,
    );
    light.rotation.x = Math.PI / 2;
    light.position.set(side, 0.75, 1.4);
    cabGroup.add(light);
  }

  root.add(cabGroup);

  // 5. Ice-Breaker V-Plow
  const plowGroup = new THREE.Group();
  plowGroup.name = "ice-breaker-plow";
  plowGroup.position.set(0, 0.55, 2.3);

  // V-Plow Wings (Left & Right Blade)
  for (const side of [-1, 1]) {
    const bladeWing = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(1.25, 0.8, 0.15), arcticSteel),
      options,
    );
    bladeWing.position.set(side * 0.55, 0, 0.25);
    bladeWing.rotation.y = side * (Math.PI / 6);
    plowGroup.add(bladeWing);

    // Thermal Glow Heating Strip
    const glowStrip = finishMesh(
      new THREE.Mesh(fabricatedBoxGeometry(1.1, 0.1, 0.05), options.thermalGlowActive ?? true ? thermalGlowMat : arcticSteel),
      options,
    );
    glowStrip.position.set(side * 0.55, 0.05, 0.34);
    glowStrip.rotation.y = side * (Math.PI / 6);
    plowGroup.add(glowStrip);
  }

  root.add(plowGroup);

  // 6. Diesel Power Core
  const powerCoreGroup = new THREE.Group();
  powerCoreGroup.name = "diesel-power-core";
  powerCoreGroup.position.set(0, 1.1, -1.5);

  const engineBlock = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(1.4, 0.8, 1.1), arcticSteel),
    options,
  );
  powerCoreGroup.add(engineBlock);

  // Dual Vertical Exhaust Stacks
  for (const side of [-0.65, 0.65]) {
    const exhaustPipe = finishMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.4, 16), arcticSteel),
      options,
    );
    exhaustPipe.position.set(side, 0.8, -0.3);
    powerCoreGroup.add(exhaustPipe);
  }

  root.add(powerCoreGroup);

  return root;
}

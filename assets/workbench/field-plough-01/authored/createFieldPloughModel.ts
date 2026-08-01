import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";

export type FieldPloughModelOptions = {
  castShadow?: boolean;
  receiveShadow?: boolean;
  qualityPriority?: "reference-fidelity" | "balanced";
  shareCount?: 3 | 4;
  wearLevel?: number;
  paintColor?: THREE.ColorRepresentation;
};

export type FieldPloughVariant = {
  shareCount?: 3 | 4;
  wearLevel?: number;
  paintColor?: THREE.ColorRepresentation;
};

type BeamOptions = {
  width: number;
  depth: number;
  material: THREE.Material;
  name: string;
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

const paintedSteel = new THREE.MeshStandardMaterial({
  color: 0x252a2c,
  metalness: 0.78,
  roughness: 0.62,
});
const moldboardSteel = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  vertexColors: true,
  metalness: 0.28,
  roughness: 0.94,
  envMapIntensity: 0.18,
  side: THREE.DoubleSide,
});
const wornSteel = new THREE.MeshStandardMaterial({
  color: 0xa09d95,
  metalness: 0.92,
  roughness: 0.38,
});
const darkSteel = new THREE.MeshStandardMaterial({
  color: 0x121719,
  metalness: 0.82,
  roughness: 0.7,
});
const rust = new THREE.MeshStandardMaterial({
  color: 0x54291c,
  metalness: 0.48,
  roughness: 0.9,
});
const soil = new THREE.MeshStandardMaterial({
  color: 0x4a3427,
  metalness: 0.05,
  roughness: 1,
});

function finishMesh(
  mesh: THREE.Mesh,
  options: FieldPloughModelOptions,
): THREE.Mesh {
  mesh.castShadow = options.castShadow ?? true;
  mesh.receiveShadow = options.receiveShadow ?? true;
  return mesh;
}

function clampWearLevel(value: number | undefined): number {
  return THREE.MathUtils.clamp(value ?? 0.72, 0, 1);
}

function box(
  name: string,
  size: [number, number, number],
  position: [number, number, number],
  material: THREE.Material,
  options: FieldPloughModelOptions,
): THREE.Mesh {
  const mesh = finishMesh(
    new THREE.Mesh(fabricatedBoxGeometry(...size), material),
    options,
  );
  mesh.name = name;
  mesh.position.set(...position);
  return mesh;
}

function cylinder(
  name: string,
  radius: number,
  length: number,
  position: [number, number, number],
  rotation: [number, number, number],
  material: THREE.Material,
  options: FieldPloughModelOptions,
  segments = 24,
): THREE.Mesh {
  const mesh = finishMesh(
    new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, length, segments),
      material,
    ),
    options,
  );
  mesh.name = name;
  mesh.position.set(...position);
  mesh.rotation.set(...rotation);
  return mesh;
}

function beamBetween(
  start: THREE.Vector3,
  end: THREE.Vector3,
  beamOptions: BeamOptions,
  options: FieldPloughModelOptions,
): THREE.Mesh {
  const midpoint = start.clone().add(end).multiplyScalar(0.5);
  const direction = end.clone().sub(start);
  const mesh = finishMesh(
    new THREE.Mesh(
      fabricatedBoxGeometry(
        beamOptions.width,
        direction.length(),
        beamOptions.depth,
      ),
      beamOptions.material,
    ),
    options,
  );
  mesh.name = beamOptions.name;
  mesh.position.copy(midpoint);
  mesh.quaternion.setFromUnitVectors(
    new THREE.Vector3(0, 1, 0),
    direction.normalize(),
  );
  return mesh;
}

function makeMoldboardGeometry(): THREE.BufferGeometry {
  const columns = 28;
  const rows = 24;
  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const sections = [
    {
      station: 0,
      width: 0.52,
      sweep: -0.12,
      concavity: 0.22,
      twistDegrees: -8,
    },
    {
      station: 0.5,
      width: 0.76,
      sweep: -0.02,
      concavity: 0.3,
      twistDegrees: 10,
    },
    {
      station: 1,
      width: 0.48,
      sweep: 0.16,
      concavity: 0.2,
      twistDegrees: 24,
    },
  ];

  const sectionAt = (station: number) => {
    const upperIndex = sections.findIndex(
      (section) => section.station >= station,
    );
    if (upperIndex <= 0) return sections[0]!;
    const lower = sections[upperIndex - 1]!;
    const upper = sections[upperIndex]!;
    const blend = (station - lower.station) / (upper.station - lower.station);
    return {
      station,
      width: THREE.MathUtils.lerp(lower.width, upper.width, blend),
      sweep: THREE.MathUtils.lerp(lower.sweep, upper.sweep, blend),
      concavity: THREE.MathUtils.lerp(lower.concavity, upper.concavity, blend),
      twistDegrees: THREE.MathUtils.lerp(
        lower.twistDegrees,
        upper.twistDegrees,
        blend,
      ),
    };
  };

  for (let row = 0; row <= rows; row += 1) {
    const v = row / rows;
    const section = sectionAt(v);
    const twist = THREE.MathUtils.degToRad(section.twistDegrees);
    for (let column = 0; column <= columns; column += 1) {
      const u = column / columns;
      const across = (u - 0.43) * section.width;
      const x =
        section.sweep + across * Math.cos(twist) + Math.pow(u, 2) * 0.08;
      const y = (v - 0.5) * 0.96;
      const z =
        Math.sin(u * Math.PI) * section.concavity +
        across * Math.sin(twist) +
        Math.pow(u, 2) * (0.08 + v * 0.08);
      positions.push(x, y, z);
      const lowerWear = THREE.MathUtils.clamp((0.48 - v) / 0.48, 0, 1);
      const wearVariation =
        0.45 + 0.55 * (Math.sin(u * 17 + v * 9) * 0.5 + 0.5);
      const rustBlend = lowerWear * wearVariation * 0.55;
      const edgeWear =
        Math.max(
          THREE.MathUtils.clamp((0.08 - Math.min(u, 1 - u)) / 0.08, 0, 1),
          THREE.MathUtils.clamp((0.06 - v) / 0.06, 0, 1),
        ) * 0.3;
      let red = THREE.MathUtils.lerp(0.015, 0.16, rustBlend);
      let green = THREE.MathUtils.lerp(0.018, 0.045, rustBlend);
      let blue = THREE.MathUtils.lerp(0.02, 0.018, rustBlend);
      red = THREE.MathUtils.lerp(red, 0.3, edgeWear);
      green = THREE.MathUtils.lerp(green, 0.28, edgeWear);
      blue = THREE.MathUtils.lerp(blue, 0.25, edgeWear);
      colors.push(red, green, blue);
      uvs.push(u, v);
    }
  }

  const stride = columns + 1;
  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const a = row * stride + column;
      const b = a + 1;
      const c = a + stride;
      const d = c + 1;
      indices.push(a, c, b, b, c, d);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(positions, 3),
  );
  geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function makeCuttingPointGeometry(): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  shape.moveTo(-0.48, -0.055);
  shape.lineTo(0.5, 0.015);
  shape.lineTo(0.04, 0.19);
  shape.lineTo(-0.38, 0.13);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelSize: 0.018,
    bevelThickness: 0.018,
    bevelSegments: 1,
  });
  geometry.center();
  return geometry;
}

function addWearStrip(
  parent: THREE.Object3D,
  name: string,
  position: [number, number, number],
  size: [number, number, number],
  options: FieldPloughModelOptions,
): void {
  const strip = box(name, size, position, rust, options);
  parent.add(strip);
}

function makeShareUnit(
  index: number,
  x: number,
  options: FieldPloughModelOptions,
): THREE.Group {
  const share = new THREE.Group();
  share.name = `share-${index + 1}`;
  share.position.x = x;
  share.position.z = (index - 1.5) * 0.075;
  share.rotation.y = -0.08;

  const shank = beamBetween(
    new THREE.Vector3(0, 1.46, 0.05),
    new THREE.Vector3(-0.08, 0.64, -0.08),
    {
      width: 0.15,
      depth: 0.18,
      material: darkSteel,
      name: `share-${index + 1}-shank`,
    },
    options,
  );
  share.add(shank);

  const moldboard = finishMesh(
    new THREE.Mesh(makeMoldboardGeometry(), moldboardSteel),
    options,
  );
  moldboard.name = `share-${index + 1}-moldboard`;
  moldboard.position.set(0.03, 0.6, -0.08);
  moldboard.rotation.set(-0.06, -0.18, -0.13);
  moldboard.scale.set(0.98, 0.96, 1);
  share.add(moldboard);

  const cuttingPoint = finishMesh(
    new THREE.Mesh(makeCuttingPointGeometry(), wornSteel),
    options,
  );
  cuttingPoint.name = `share-${index + 1}-cutting-point`;
  cuttingPoint.position.set(-0.02, 0.13, 0.12);
  cuttingPoint.rotation.set(-0.08, -0.36, 0.01);
  cuttingPoint.scale.set(1.14, 0.82, 0.72);
  share.add(cuttingPoint);

  const bolt = cylinder(
    `share-${index + 1}-bolt`,
    0.052,
    0.18,
    [0.08, 0.62, 0.2],
    [Math.PI / 2, 0, 0],
    wornSteel,
    options,
    18,
  );
  share.add(bolt);

  const washer = cylinder(
    `share-${index + 1}-washer`,
    0.068,
    0.025,
    [0.08, 0.62, 0.17],
    [Math.PI / 2, 0, 0],
    rust,
    options,
    20,
  );
  share.add(washer);
  share.add(
    cylinder(
      `share-${index + 1}-lower-bolt`,
      0.038,
      0.16,
      [-0.05, 0.42, 0.18],
      [Math.PI / 2, 0, 0],
      wornSteel,
      options,
      16,
    ),
  );

  const soilPatch = box(
    `share-${index + 1}-soil`,
    [0.34, 0.12, 0.025],
    [0.04, 0.29, 0.145],
    soil,
    options,
  );
  soilPatch.rotation.z = -0.18;
  share.add(soilPatch);

  const clamp = box(
    `share-${index + 1}-beam-clamp`,
    [0.24, 0.48, 0.12],
    [0, 1.47, 0.26],
    paintedSteel,
    options,
  );
  share.add(clamp);
  share.add(
    cylinder(
      `share-${index + 1}-clamp-pin`,
      0.072,
      0.52,
      [0, 1.48, 0.27],
      [Math.PI / 2, 0, 0],
      wornSteel,
      options,
      18,
    ),
  );

  const shareMountSocket = new THREE.Object3D();
  shareMountSocket.name = `share-${index + 1}-mount-socket`;
  shareMountSocket.position.set(0, 1.48, 0.27);
  shareMountSocket.userData.socketRole = "replaceable-share-mount";
  share.add(shareMountSocket);

  const cuttingEdgeSocket = new THREE.Object3D();
  cuttingEdgeSocket.name = `share-${index + 1}-cutting-edge-socket`;
  cuttingEdgeSocket.position.set(-0.02, 0.13, 0.12);
  cuttingEdgeSocket.userData.socketRole = "replaceable-cutting-edge";
  share.add(cuttingEdgeSocket);

  return share;
}

function applyVariantMetadata(
  root: THREE.Group,
  variant: Required<FieldPloughVariant>,
): void {
  root.userData.variant = {
    shareCount: variant.shareCount,
    wearLevel: variant.wearLevel,
    paintColor: new THREE.Color(variant.paintColor).getHexString(),
  };
  root.userData.customizationSlots = {
    shareCount: {
      type: "enum",
      values: [3, 4],
      default: 4,
      affects: "share assembly count and spacing",
    },
    wearLevel: {
      type: "normalized",
      range: [0, 1],
      default: 0.72,
      affects: "paint loss, rust, and cutting-edge material response",
    },
    paintColor: {
      type: "color",
      default: "252a2c",
      affects: "painted steel material slot",
    },
  };
  root.userData.materialSlots = {
    paintedSteel: ["cross-beam", "left-triangle-brace", "right-triangle-brace"],
    darkSteel: ["rear-stiffener", "share-shank"],
    moldboardSteel: ["share-moldboard"],
    cuttingEdgeSteel: ["share-cutting-point"],
    fastenerSteel: ["share-bolt", "share-washer", "hitch-pin"],
    soil: ["share-soil"],
  };
}

export function applyFieldPlough01Variant(
  root: THREE.Group,
  variant: FieldPloughVariant = {},
): THREE.Group {
  const resolved: Required<FieldPloughVariant> = {
    shareCount: variant.shareCount ?? 4,
    wearLevel: clampWearLevel(variant.wearLevel),
    paintColor: variant.paintColor ?? 0x252a2c,
  };
  const paint = new THREE.Color(resolved.paintColor);
  root.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    const originalMaterial = object.material;
    const material =
      originalMaterial === paintedSteel || originalMaterial === moldboardSteel
        ? originalMaterial.clone()
        : originalMaterial;
    if (material !== originalMaterial) object.material = material;
    if (material instanceof THREE.MeshStandardMaterial) {
      if (material === paintedSteel || object.name.includes("paint")) {
        material.color.copy(paint);
      }
      if (object.name.includes("moldboard")) {
        material.roughness = THREE.MathUtils.lerp(
          0.78,
          0.96,
          resolved.wearLevel,
        );
      }
      if (object.name.includes("rust")) {
        object.visible = resolved.wearLevel > 0.08;
        material.opacity = THREE.MathUtils.lerp(0.25, 1, resolved.wearLevel);
        material.transparent = resolved.wearLevel < 0.98;
      }
    }
    if (object.name.includes("moldboard")) {
      object.userData.materialSlot = "moldboardSteel";
    } else if (object.name.includes("cutting-point")) {
      object.userData.materialSlot = "cuttingEdgeSteel";
    } else if (object.name.includes("bolt") || object.name.includes("pin")) {
      object.userData.materialSlot = "fastenerSteel";
    } else if (object.name.includes("soil")) {
      object.userData.materialSlot = "soil";
    } else if (object.name.includes("shank")) {
      object.userData.materialSlot = "darkSteel";
    } else {
      object.userData.materialSlot = "paintedSteel";
    }
  });
  for (let index = 1; index <= 4; index += 1) {
    const share = root.getObjectByName(`share-${index}`);
    if (share) share.visible = index <= resolved.shareCount;
  }
  applyVariantMetadata(root, resolved);
  return root;
}

function addHitchClevis(
  root: THREE.Group,
  side: "left" | "right",
  x: number,
  options: FieldPloughModelOptions,
): void {
  const sign = side === "left" ? -1 : 1;
  root.add(
    box(
      `lower-${side}-hitch-plate-front`,
      [0.18, 0.54, 0.13],
      [x, 1.58, -0.27],
      paintedSteel,
      options,
    ),
    box(
      `lower-${side}-hitch-plate-rear`,
      [0.18, 0.54, 0.13],
      [x, 1.58, 0.02],
      paintedSteel,
      options,
    ),
  );
  const pin = cylinder(
    `lower-${side}-hitch-pin`,
    0.09,
    0.5,
    [x, 1.53, -0.12],
    [Math.PI / 2, 0, 0],
    wornSteel,
    options,
  );
  root.add(pin);
  addWearStrip(
    root,
    `lower-${side}-hitch-rust`,
    [x + sign * 0.095, 1.44, -0.295],
    [0.035, 0.28, 0.035],
    options,
  );
}

export function createFieldPlough01Model(
  options: FieldPloughModelOptions = {},
): THREE.Group {
  const root = new THREE.Group();
  root.name = "field-plough-01";
  root.userData.assetId = "field-plough-01";
  root.userData.lifecycle = "visual-rebuild";
  root.userData.visualAuthority = "authored procedural presentation";
  root.userData.collisionAuthority = "simulation-owned";
  const shareCount = options.shareCount ?? 4;
  const wearLevel = clampWearLevel(options.wearLevel);

  root.add(
    box("cross-beam", [4.7, 0.34, 0.42], [0, 1.47, 0], paintedSteel, options),
    box(
      "rear-stiffener",
      [4.05, 0.18, 0.22],
      [0, 1.25, -0.28],
      darkSteel,
      options,
    ),
  );

  const beamWearPatches: Array<
    [string, [number, number, number], [number, number, number]]
  > = [
    ["cross-beam-wear-left", [-1.78, 1.64, 0.12], [0.46, 0.035, 0.12]],
    ["cross-beam-wear-center", [-0.12, 1.64, 0.13], [0.31, 0.035, 0.1]],
    ["cross-beam-wear-right", [1.48, 1.64, 0.11], [0.52, 0.035, 0.12]],
  ];
  for (const [name, position, size] of beamWearPatches) {
    addWearStrip(root, name, position, size, options);
  }

  const top = new THREE.Vector3(0, 2.45, 0.08);
  root.add(
    beamBetween(
      new THREE.Vector3(-1.45, 1.62, 0.04),
      top,
      {
        width: 0.15,
        depth: 0.17,
        material: paintedSteel,
        name: "left-triangle-brace",
      },
      options,
    ),
    beamBetween(
      new THREE.Vector3(1.45, 1.62, 0.04),
      top,
      {
        width: 0.15,
        depth: 0.17,
        material: paintedSteel,
        name: "right-triangle-brace",
      },
      options,
    ),
    beamBetween(
      new THREE.Vector3(-0.8, 1.43, 0.32),
      new THREE.Vector3(0, 2.28, 0.2),
      {
        width: 0.12,
        depth: 0.13,
        material: darkSteel,
        name: "left-rear-brace",
      },
      options,
    ),
    beamBetween(
      new THREE.Vector3(0.8, 1.43, 0.32),
      new THREE.Vector3(0, 2.28, 0.2),
      {
        width: 0.12,
        depth: 0.13,
        material: darkSteel,
        name: "right-rear-brace",
      },
      options,
    ),
  );

  root.add(
    box(
      "top-link-left-plate",
      [0.13, 0.5, 0.3],
      [-0.12, 2.42, 0.04],
      paintedSteel,
      options,
    ),
    box(
      "top-link-right-plate",
      [0.13, 0.5, 0.3],
      [0.12, 2.42, 0.04],
      paintedSteel,
      options,
    ),
    cylinder(
      "top-link-pin",
      0.095,
      0.46,
      [0, 2.5, 0.04],
      [0, 0, Math.PI / 2],
      wornSteel,
      options,
    ),
  );

  const hydraulic = new THREE.Group();
  hydraulic.name = "hydraulic-ram";
  hydraulic.add(
    cylinder(
      "hydraulic-body",
      0.14,
      0.68,
      [0, 1.93, 0.02],
      [0, 0, 0],
      paintedSteel,
      options,
    ),
    cylinder(
      "hydraulic-rod",
      0.075,
      0.34,
      [0, 2.34, 0.02],
      [0, 0, 0],
      wornSteel,
      options,
    ),
    cylinder(
      "hydraulic-lower-pin",
      0.09,
      0.48,
      [0, 1.58, 0.02],
      [0, 0, Math.PI / 2],
      rust,
      options,
    ),
    cylinder(
      "hydraulic-wear-ring",
      0.155,
      0.055,
      [0, 2.16, 0.02],
      [0, 0, 0],
      rust,
      options,
    ),
  );
  root.add(hydraulic);

  addHitchClevis(root, "left", -1.35, options);
  addHitchClevis(root, "right", 1.35, options);

  const sharePositions =
    shareCount === 3 ? [-1.42, 0, 1.42] : [-1.68, -0.56, 0.56, 1.68];
  for (const [index, x] of sharePositions.entries()) {
    root.add(makeShareUnit(index, x, options));
  }

  const sockets: Record<string, THREE.Object3D> = {};
  const socketData: Array<[string, [number, number, number]]> = [
    ["top-link-socket", [0, 2.5, 0.04]],
    ["lower-left-hitch", [-1.35, 1.53, -0.12]],
    ["lower-right-hitch", [1.35, 1.53, -0.12]],
    ["soil-contact-row", [0, 0.08, -0.34]],
  ];
  for (const [id, position] of socketData) {
    const socket = new THREE.Object3D();
    socket.name = id;
    socket.position.set(...position);
    socket.userData.socketRole = id;
    root.add(socket);
    sockets[id] = socket;
  }
  root.userData.sockets = sockets;

  const runtimeNodes: Record<string, THREE.Object3D> = {};
  const runtimeMeshes: Record<string, THREE.Mesh> = {};
  root.traverse((object) => {
    if (!object.name) return;
    runtimeNodes[object.name] = object;
    if (object instanceof THREE.Mesh) runtimeMeshes[object.name] = object;
  });
  root.userData.sculptRuntime = {
    nodes: runtimeNodes,
    meshes: runtimeMeshes,
    sockets,
    colliders: {
      root: {
        type: "compound-proxy",
        authority: "simulation-owned",
      },
      "share-assembly": {
        type: "wedge-proxy",
        authority: "simulation-owned terrain-tool proxy",
      },
    },
    destructionGroups: Object.fromEntries(
      sharePositions.map((_, index) => [
        `share-${index + 1}`,
        [runtimeNodes[`share-${index + 1}`]],
      ]),
    ),
  };
  root.userData.actionReadiness = {
    note: "Use sculptRuntime nodes for transforms, sockets for attachments, colliders as simulation-owned proxy intent, and destructionGroups for detachable share assemblies.",
  };

  applyFieldPlough01Variant(root, {
    shareCount,
    wearLevel,
    paintColor: options.paintColor ?? 0x252a2c,
  });

  return root;
}

export function createFieldPlough01LookDevLights(
  mode: "neutral" | "grazing" | "reference" = "neutral",
): THREE.Group {
  const lights = new THREE.Group();
  const key = new THREE.DirectionalLight(
    0xfff1dc,
    mode === "grazing" ? 4.2 : 3,
  );
  key.position.set(
    mode === "grazing" ? -5 : -3,
    6,
    mode === "reference" ? -5 : 4,
  );
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.1;
  key.shadow.camera.far = 30;
  const fill = new THREE.DirectionalLight(0xc8dcff, 1.35);
  fill.position.set(4, 3, 5);
  const rim = new THREE.DirectionalLight(0xffc285, 1.5);
  rim.position.set(0, 4, -6);
  const ambient = new THREE.HemisphereLight(0xe7edf2, 0x51473c, 1.1);
  lights.add(key, fill, rim, ambient);
  return lights;
}

export function createFieldPlough01Environment(
  renderer: THREE.WebGLRenderer,
): THREE.Texture {
  const generator = new THREE.PMREMGenerator(renderer);
  const texture = generator.fromScene(new RoomEnvironment(), 0.04).texture;
  generator.dispose();
  return texture;
}

export function frameFieldPlough01Camera(
  camera: THREE.PerspectiveCamera,
  model: THREE.Object3D,
  options: {
    azimuthDeg?: number;
    elevationDeg?: number;
    margin?: number;
  } = {},
): void {
  const bounds = new THREE.Box3().setFromObject(model);
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  const margin = options.margin ?? 1.06;
  const azimuth = THREE.MathUtils.degToRad(options.azimuthDeg ?? -24);
  const elevation = THREE.MathUtils.degToRad(options.elevationDeg ?? 10);
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const horizontalFov =
    2 * Math.atan(Math.tan(verticalFov / 2) * camera.aspect);
  const verticalDistance = size.y / (2 * Math.tan(verticalFov / 2));
  const horizontalDistance = size.x / (2 * Math.tan(horizontalFov / 2));
  const distance = Math.max(verticalDistance, horizontalDistance) * margin;
  const radius = Math.max(size.x, size.y, size.z) * 0.5;
  camera.position.set(
    center.x + Math.sin(azimuth) * Math.cos(elevation) * distance,
    center.y + Math.sin(elevation) * distance,
    center.z + Math.cos(azimuth) * Math.cos(elevation) * distance,
  );
  camera.lookAt(center.x, center.y + size.y * 0.01, center.z);
  camera.near = Math.max(0.01, distance - radius * 2);
  camera.far = distance + radius * 4;
  camera.updateProjectionMatrix();
}

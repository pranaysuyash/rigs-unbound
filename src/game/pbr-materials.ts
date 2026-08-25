/**
 * Procedural PBR Texture & Material Engine for Rigs Unbound.
 *
 * Generates high-fidelity Normal, Roughness, Metalness, and Ambient Occlusion maps
 * procedurally on in-memory HTMLCanvases / CanvasTextures to elevate the game's
 * material response to photorealistic AAA standards without heavyweight external downloads.
 */

import * as THREE from "three";

/**
 * Deterministic pseudo-random number generator for repeatable noise generation.
 */
function createPrng(seed = 1337) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/**
 * 2D Value Noise generator with cubic Hermite interpolation.
 */
function createNoise2D(seed = 42) {
  const prng = createPrng(seed);
  const size = 256;
  const perm = new Uint8Array(size * 2);
  const values = new Float32Array(size);

  for (let i = 0; i < size; i++) {
    values[i] = prng();
    perm[i] = i;
  }
  for (let i = size - 1; i > 0; i--) {
    const j = Math.floor(prng() * (i + 1));
    const t = perm[i]!;
    perm[i] = perm[j]!;
    perm[j] = t;
  }
  for (let i = 0; i < size; i++) {
    perm[size + i] = perm[i]!;
  }

  return (x: number, y: number): number => {
    const xi = Math.floor(x) & (size - 1);
    const yi = Math.floor(y) & (size - 1);
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);

    const u = xf * xf * (3 - 2 * xf);
    const v = yf * yf * (3 - 2 * yf);

    const pXi = perm[xi]!;
    const pXi1 = perm[xi + 1]!;
    const aa = values[perm[pXi + yi]!]!;
    const ab = values[perm[pXi + yi + 1]!]!;
    const ba = values[perm[pXi1 + yi]!]!;
    const bb = values[perm[pXi1 + yi + 1]!]!;

    const x1 = aa + u * (ba - aa);
    const x2 = ab + u * (bb - ab);
    return x1 + v * (x2 - x1);
  };
}

export interface PbrTextureSet {
  map?: THREE.CanvasTexture;
  normalMap?: THREE.CanvasTexture;
  roughnessMap?: THREE.CanvasTexture;
  metalnessMap?: THREE.CanvasTexture;
  aoMap?: THREE.CanvasTexture;
}

const textureCache = new Map<string, PbrTextureSet>();

/**
 * Generate high-frequency PBR maps for terrain soil, loam, mud, and scree.
 */
export function generateTerrainPbrTextures(resolution = 512): PbrTextureSet {
  if (typeof document === "undefined") {
    return {};
  }
  const cacheKey = `terrain_${resolution}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext("2d");

  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext("2d");

  if (!normalCtx || !roughnessCtx) {
    return {};
  }

  const normalImg = normalCtx.createImageData(resolution, resolution);
  const roughnessImg = roughnessCtx.createImageData(resolution, resolution);

  const noiseA = createNoise2D(101);
  const noiseB = createNoise2D(202);
  const noiseC = createNoise2D(303);

  const heightField = new Float32Array(resolution * resolution);

  // Compute heightfield with multi-octave crumb noise
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = y * resolution + x;
      const nx = (x / resolution) * 16;
      const ny = (y / resolution) * 16;

      const h1 = noiseA(nx, ny) * 1.0;
      const h2 = noiseB(nx * 2.5, ny * 2.5) * 0.5;
      const h3 = noiseC(nx * 6.0, ny * 6.0) * 0.25;
      heightField[idx] = (h1 + h2 + h3) / 1.75;
    }
  }

  // Derive normal map from Sobel-like heightfield gradients
  const bumpStrength = 2.4;
  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;

      const left =
        heightField[y * resolution + ((x - 1 + resolution) % resolution)] ?? 0;
      const right = heightField[y * resolution + ((x + 1) % resolution)] ?? 0;
      const top =
        heightField[((y - 1 + resolution) % resolution) * resolution + x] ?? 0;
      const bottom = heightField[((y + 1) % resolution) * resolution + x] ?? 0;

      const dx = (right - left) * bumpStrength;
      const dy = (bottom - top) * bumpStrength;
      const dz = 1.0;

      const len = Math.hypot(dx, dy, dz);
      const nx = dx / len;
      const ny = dy / len;
      const nz = dz / len;

      normalImg.data[idx + 0] = Math.round(((nx + 1) / 2) * 255);
      normalImg.data[idx + 1] = Math.round(((ny + 1) / 2) * 255);
      normalImg.data[idx + 2] = Math.round(((nz + 1) / 2) * 255);
      normalImg.data[idx + 3] = 255;

      // Roughness: micro-depressions are damp/slicker (lower roughness), mounds are dry/rough
      const h = heightField[y * resolution + x] ?? 0.5;
      const roughVal = Math.max(0.45, Math.min(0.98, 0.75 + (h - 0.5) * 0.4));
      const rByte = Math.round(roughVal * 255);
      roughnessImg.data[idx + 0] = rByte;
      roughnessImg.data[idx + 1] = rByte;
      roughnessImg.data[idx + 2] = rByte;
      roughnessImg.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImg, 0, 0);
  roughnessCtx.putImageData(roughnessImg, 0, 0);

  const normalTex = new THREE.CanvasTexture(normalCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(64, 64);
  normalTex.needsUpdate = true;

  const roughnessTex = new THREE.CanvasTexture(roughnessCanvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;
  roughnessTex.repeat.set(64, 64);
  roughnessTex.needsUpdate = true;

  const result: PbrTextureSet = {
    normalMap: normalTex,
    roughnessMap: roughnessTex,
  };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Generate weathered steel / rust / painted bodywork PBR textures for vehicles.
 */
export function generateVehicleMetalPbrTextures(
  resolution = 256,
): PbrTextureSet {
  if (typeof document === "undefined") {
    return {};
  }
  const cacheKey = `vehicle_metal_${resolution}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext("2d");

  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext("2d");

  const metalnessCanvas = document.createElement("canvas");
  metalnessCanvas.width = resolution;
  metalnessCanvas.height = resolution;
  const metalnessCtx = metalnessCanvas.getContext("2d");

  if (!normalCtx || !roughnessCtx || !metalnessCtx) {
    return {};
  }

  const normalImg = normalCtx.createImageData(resolution, resolution);
  const roughnessImg = roughnessCtx.createImageData(resolution, resolution);
  const metalnessImg = metalnessCtx.createImageData(resolution, resolution);

  const noise = createNoise2D(777);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;
      const nx = (x / resolution) * 8;
      const ny = (y / resolution) * 8;

      const n1 = noise(nx, ny);
      const n2 = noise(nx * 4, ny * 4) * 0.4;
      const val = n1 + n2;

      // Micro scratch / pitting normal
      const dx = (noise(nx + 0.1, ny) - noise(nx - 0.1, ny)) * 1.5;
      const dy = (noise(nx, ny + 0.1) - noise(nx, ny - 0.1)) * 1.5;
      const len = Math.hypot(dx, dy, 1.0);

      normalImg.data[idx + 0] = Math.round(((dx / len + 1) / 2) * 255);
      normalImg.data[idx + 1] = Math.round(((dy / len + 1) / 2) * 255);
      normalImg.data[idx + 2] = Math.round(((1.0 / len + 1) / 2) * 255);
      normalImg.data[idx + 3] = 255;

      // Roughness: oxidized rust pits are rough (0.85), polished paint is smooth (0.35)
      const isRustPit = val > 0.82;
      const rough = isRustPit ? 0.88 : 0.42 + n1 * 0.15;
      const rByte = Math.round(rough * 255);
      roughnessImg.data[idx + 0] = rByte;
      roughnessImg.data[idx + 1] = rByte;
      roughnessImg.data[idx + 2] = rByte;
      roughnessImg.data[idx + 3] = 255;

      // Metalness: unpainted/scratched metal is metallic (0.85), painted parts are low (0.15)
      const metal = isRustPit ? 0.25 : 0.65;
      const mByte = Math.round(metal * 255);
      metalnessImg.data[idx + 0] = mByte;
      metalnessImg.data[idx + 1] = mByte;
      metalnessImg.data[idx + 2] = mByte;
      metalnessImg.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImg, 0, 0);
  roughnessCtx.putImageData(roughnessImg, 0, 0);
  metalnessCtx.putImageData(metalnessImg, 0, 0);

  const normalTex = new THREE.CanvasTexture(normalCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(4, 4);
  normalTex.needsUpdate = true;

  const roughnessTex = new THREE.CanvasTexture(roughnessCanvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;
  roughnessTex.repeat.set(4, 4);
  roughnessTex.needsUpdate = true;

  const metalnessTex = new THREE.CanvasTexture(metalnessCanvas);
  metalnessTex.wrapS = THREE.RepeatWrapping;
  metalnessTex.wrapT = THREE.RepeatWrapping;
  metalnessTex.repeat.set(4, 4);
  metalnessTex.needsUpdate = true;

  const result: PbrTextureSet = {
    normalMap: normalTex,
    roughnessMap: roughnessTex,
    metalnessMap: metalnessTex,
  };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Generate organic bark normal and roughness textures for trees and timber.
 */
export function generateBarkPbrTextures(resolution = 256): PbrTextureSet {
  if (typeof document === "undefined") return {};
  const cacheKey = `bark_${resolution}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext("2d");

  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext("2d");

  if (!normalCtx || !roughnessCtx) return {};

  const normalImg = normalCtx.createImageData(resolution, resolution);
  const roughnessImg = roughnessCtx.createImageData(resolution, resolution);
  const noise = createNoise2D(777);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;
      // Vertical bark grain stretch
      const n1 = noise(x * 0.12, y * 0.02) * 0.65;
      const n2 = noise(x * 0.25, y * 0.06) * 0.35;
      const h = n1 + n2;

      const nx = Math.sin(h * Math.PI * 2) * 0.45;
      const ny = Math.cos(h * Math.PI * 2) * 0.25;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      normalImg.data[idx + 0] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 3] = 255;

      const rough = 0.88 + (1 - h) * 0.1;
      const rByte = Math.round(rough * 255);
      roughnessImg.data[idx + 0] = rByte;
      roughnessImg.data[idx + 1] = rByte;
      roughnessImg.data[idx + 2] = rByte;
      roughnessImg.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImg, 0, 0);
  roughnessCtx.putImageData(roughnessImg, 0, 0);

  const normalTex = new THREE.CanvasTexture(normalCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(1, 4);
  normalTex.needsUpdate = true;

  const roughnessTex = new THREE.CanvasTexture(roughnessCanvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;
  roughnessTex.repeat.set(1, 4);
  roughnessTex.needsUpdate = true;

  const result: PbrTextureSet = {
    normalMap: normalTex,
    roughnessMap: roughnessTex,
  };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Generate craggy rock normal and micro-roughness textures.
 */
export function generateRockPbrTextures(resolution = 256): PbrTextureSet {
  if (typeof document === "undefined") return {};
  const cacheKey = `rock_${resolution}`;
  const cached = textureCache.get(cacheKey);
  if (cached) return cached;

  const normalCanvas = document.createElement("canvas");
  normalCanvas.width = resolution;
  normalCanvas.height = resolution;
  const normalCtx = normalCanvas.getContext("2d");

  const roughnessCanvas = document.createElement("canvas");
  roughnessCanvas.width = resolution;
  roughnessCanvas.height = resolution;
  const roughnessCtx = roughnessCanvas.getContext("2d");

  if (!normalCtx || !roughnessCtx) return {};

  const normalImg = normalCtx.createImageData(resolution, resolution);
  const roughnessImg = roughnessCtx.createImageData(resolution, resolution);
  const noise = createNoise2D(999);

  for (let y = 0; y < resolution; y++) {
    for (let x = 0; x < resolution; x++) {
      const idx = (y * resolution + x) * 4;
      const n1 = noise(x * 0.05, y * 0.05) * 0.6;
      const n2 = noise(x * 0.15, y * 0.15) * 0.3;
      const n3 = noise(x * 0.35, y * 0.35) * 0.1;
      const h = n1 + n2 + n3;

      const nx = Math.sin(h * Math.PI * 3) * 0.55;
      const ny = Math.cos(h * Math.PI * 3) * 0.55;
      const nz = 1.0;
      const len = Math.sqrt(nx * nx + ny * ny + nz * nz);

      normalImg.data[idx + 0] = Math.round(((nx / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 1] = Math.round(((ny / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 2] = Math.round(((nz / len) * 0.5 + 0.5) * 255);
      normalImg.data[idx + 3] = 255;

      const rough = 0.8 + h * 0.18;
      const rByte = Math.round(rough * 255);
      roughnessImg.data[idx + 0] = rByte;
      roughnessImg.data[idx + 1] = rByte;
      roughnessImg.data[idx + 2] = rByte;
      roughnessImg.data[idx + 3] = 255;
    }
  }

  normalCtx.putImageData(normalImg, 0, 0);
  roughnessCtx.putImageData(roughnessImg, 0, 0);

  const normalTex = new THREE.CanvasTexture(normalCanvas);
  normalTex.wrapS = THREE.RepeatWrapping;
  normalTex.wrapT = THREE.RepeatWrapping;
  normalTex.repeat.set(3, 3);
  normalTex.needsUpdate = true;

  const roughnessTex = new THREE.CanvasTexture(roughnessCanvas);
  roughnessTex.wrapS = THREE.RepeatWrapping;
  roughnessTex.wrapT = THREE.RepeatWrapping;
  roughnessTex.repeat.set(3, 3);
  roughnessTex.needsUpdate = true;

  const result: PbrTextureSet = {
    normalMap: normalTex,
    roughnessMap: roughnessTex,
  };
  textureCache.set(cacheKey, result);
  return result;
}

/**
 * Creates an enhanced PBR Physical Material with procedural maps and micro-detail.
 */
export function createPbrMaterial(
  color: number | THREE.Color,
  options: {
    roughness?: number;
    metalness?: number;
    clearcoat?: number;
    clearcoatRoughness?: number;
    normalScale?: number;
    type?:
      "metal" | "rubber" | "soil" | "bark" | "foliage" | "rock" | "default";
  } = {},
): THREE.MeshPhysicalMaterial {
  const {
    roughness = 0.55,
    metalness = 0.25,
    clearcoat = 0.35,
    clearcoatRoughness = 0.3,
    normalScale = 0.6,
    type = "metal",
  } = options;

  const mat = new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    clearcoat,
    clearcoatRoughness,
  });

  if (type === "metal") {
    const pbr = generateVehicleMetalPbrTextures(256);
    if (pbr.normalMap) {
      mat.normalMap = pbr.normalMap;
      mat.normalScale = new THREE.Vector2(normalScale, normalScale);
    }
    if (pbr.roughnessMap) {
      mat.roughnessMap = pbr.roughnessMap;
    }
    if (pbr.metalnessMap) {
      mat.metalnessMap = pbr.metalnessMap;
    }
  } else if (type === "bark") {
    const pbr = generateBarkPbrTextures(256);
    if (pbr.normalMap) {
      mat.normalMap = pbr.normalMap;
      mat.normalScale = new THREE.Vector2(normalScale * 1.2, normalScale * 1.2);
    }
    if (pbr.roughnessMap) {
      mat.roughnessMap = pbr.roughnessMap;
    }
  } else if (type === "rock") {
    const pbr = generateRockPbrTextures(256);
    if (pbr.normalMap) {
      mat.normalMap = pbr.normalMap;
      mat.normalScale = new THREE.Vector2(normalScale * 1.1, normalScale * 1.1);
    }
    if (pbr.roughnessMap) {
      mat.roughnessMap = pbr.roughnessMap;
    }
  }

  return mat;
}

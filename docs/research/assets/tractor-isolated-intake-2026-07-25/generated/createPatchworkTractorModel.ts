import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';

export type ProceduralModelOptions = {
  wireframe?: boolean;
  castShadow?: boolean;
  receiveShadow?: boolean;
  textureSize?: number;
  textureAnisotropy?: number;
  qualityPriority?: 'reference-fidelity' | 'balanced';
};

export type ProceduralModelRuntime = {
  nodes: Record<string, THREE.Object3D>;
  meshes: Record<string, THREE.Mesh>;
  sockets: Record<string, THREE.Object3D>;
  colliders: Record<string, unknown>;
  destructionGroups: Record<string, THREE.Object3D[]>;
};

type SculptMaterialSpec = Record<string, any>;

function hashString(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function readLayerNumber(value: unknown, keys: string[], fallback: number): number {
  if (typeof value === 'number') return value;
  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    for (const key of keys) {
      if (typeof record[key] === 'number') return record[key] as number;
    }
  }
  return fallback;
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{3}$/i.test(hex)
    ? '#' + hex.slice(1).split('').map((part) => part + part).join('')
    : hex;
  const value = /^#[0-9a-f]{6}$/i.test(normalized) ? Number.parseInt(normalized.slice(1), 16) : 0x8a7a5f;
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function materialPalette(spec: SculptMaterialSpec): string[] {
  const palette = spec.colorVariation?.palette;
  if (Array.isArray(palette) && palette.length > 0) return palette.filter((value) => typeof value === 'string');
  const secondary = spec.albedo?.secondary;
  const colors = [spec.baseColor ?? spec.color ?? spec.albedo?.dominant, ...(Array.isArray(secondary) ? secondary : [])];
  return colors.filter((value): value is string => typeof value === 'string' && value.startsWith('#'));
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function smoothCurve(value: number): number {
  return value * value * (3 - 2 * value);
}

function periodicHash(x: number, y: number, seed: number, periodX: number, periodY: number): number {
  const wrappedX = ((x % periodX) + periodX) % periodX;
  const wrappedY = ((y % periodY) + periodY) % periodY;
  let value = Math.imul(wrappedX + seed * 17, 374761393) ^ Math.imul(wrappedY + seed * 31, 668265263);
  value = Math.imul(value ^ (value >>> 13), 1274126177);
  return ((value ^ (value >>> 16)) >>> 0) / 4294967295;
}

function periodicValueNoise(u: number, v: number, seed: number, periodX: number, periodY: number): number {
  const x = u * periodX;
  const y = v * periodY;
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const tx = smoothCurve(x - x0);
  const ty = smoothCurve(y - y0);
  const a = periodicHash(x0, y0, seed, periodX, periodY);
  const b = periodicHash(x0 + 1, y0, seed, periodX, periodY);
  const c = periodicHash(x0, y0 + 1, seed, periodX, periodY);
  const d = periodicHash(x0 + 1, y0 + 1, seed, periodX, periodY);
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(a, b, tx), THREE.MathUtils.lerp(c, d, tx), ty);
}

type SurfaceBand = {
  frequency: number;
  amplitude: number;
  stretchX: number;
  stretchY: number;
  ridge: boolean;
};

function surfaceBands(spec: SculptMaterialSpec): SurfaceBand[] {
  const source = Array.isArray(spec.surfaceFrequencyBands) ? spec.surfaceFrequencyBands : [];
  const parsed = source.flatMap((item: unknown) => {
    if (!item || typeof item !== 'object') return [];
    const band = item as Record<string, unknown>;
    const frequency = typeof band.frequency === 'number' ? band.frequency : 0;
    const amplitude = typeof band.amplitude === 'number' ? band.amplitude : 0;
    if (frequency <= 0 || amplitude <= 0) return [];
    const stretch = Array.isArray(band.stretch) ? band.stretch : [1, 1];
    const description = `${String(band.pattern ?? '')} ${String(band.role ?? '')}`.toLowerCase();
    return [{
      frequency,
      amplitude,
      stretchX: typeof stretch[0] === 'number' ? Math.max(0.1, stretch[0]) : 1,
      stretchY: typeof stretch[1] === 'number' ? Math.max(0.1, stretch[1]) : 1,
      ridge: /(ridge|groove|grain|fiber|striated|crack)/.test(description),
    }];
  });
  return parsed.length > 0 ? parsed : [
    { frequency: 2, amplitude: 0.42, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 12, amplitude: 0.22, stretchX: 1, stretchY: 1, ridge: false },
    { frequency: 56, amplitude: 0.08, stretchX: 1, stretchY: 1, ridge: false },
  ];
}

function sampleSurface(u: number, v: number, bands: SurfaceBand[], seed: number): number {
  let value = 0;
  let weight = 0;
  for (let index = 0; index < bands.length; index += 1) {
    const band = bands[index];
    const periodX = Math.max(1, Math.round(band.frequency * band.stretchX));
    const periodY = Math.max(1, Math.round(band.frequency * band.stretchY));
    let sample = periodicValueNoise(u, v, seed + index * 1013, periodX, periodY);
    if (band.ridge) sample = 1 - Math.abs(sample * 2 - 1);
    value += sample * band.amplitude;
    weight += band.amplitude;
  }
  return weight > 0 ? clamp01(value / weight) : 0.5;
}

function mixPalette(colors: [number, number, number][], value: number): [number, number, number] {
  if (colors.length === 1) return colors[0];
  const scaled = clamp01(value) * (colors.length - 1);
  const index = Math.min(colors.length - 2, Math.floor(scaled));
  const mix = scaled - index;
  const a = colors[index];
  const b = colors[index + 1];
  return [
    Math.round(THREE.MathUtils.lerp(a[0], b[0], mix)),
    Math.round(THREE.MathUtils.lerp(a[1], b[1], mix)),
    Math.round(THREE.MathUtils.lerp(a[2], b[2], mix)),
  ];
}

type ColorGradientStop = { offset: number; color: string };
type ColorGradientSpec = {
  type: 'linear' | 'radial';
  axis: [number, number];
  stops: ColorGradientStop[];
};

function parseRgba(value: string): [number, number, number] {
  const match = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(value);
  if (!match) return [138, 122, 95];
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

// Analytical per-pixel gradient sample. The extraction schema's colorGradient carries
// exact rgba(...) stop colors (see extract_part_color_recipe.py), so this samples the
// same trend directly in JS math rather than round-tripping through a Canvas 2D
// createLinearGradient/createRadialGradient object — same visual result, and it composes
// directly with the existing noise/height-correlated colorVariation blend below.
function sampleColorGradient(gradient: ColorGradientSpec, u: number, v: number): [number, number, number] {
  const stops = gradient.stops.length >= 2 ? gradient.stops : [{ offset: 0, color: 'rgba(138,122,95,1)' }, { offset: 1, color: 'rgba(138,122,95,1)' }];
  let t: number;
  if (gradient.type === 'radial') {
    const [cx, cy] = gradient.axis;
    const dx = u - cx;
    const dy = v - cy;
    const maxRadius = Math.max(0.001, Math.hypot(Math.max(cx, 1 - cx), Math.max(cy, 1 - cy)));
    t = clamp01(Math.hypot(dx, dy) / maxRadius);
  } else {
    const [ax, ay] = gradient.axis;
    const projection = (u - 0.5) * ax + (v - 0.5) * ay;
    const maxProjection = 0.5 * (Math.abs(ax) + Math.abs(ay)) || 0.5;
    t = clamp01(projection / maxProjection + 0.5);
  }
  const scaled = t * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.max(0, Math.floor(scaled)));
  const mix = scaled - index;
  const a = parseRgba(stops[index].color);
  const b = parseRgba(stops[index + 1].color);
  return [
    THREE.MathUtils.lerp(a[0], b[0], mix),
    THREE.MathUtils.lerp(a[1], b[1], mix),
    THREE.MathUtils.lerp(a[2], b[2], mix),
  ];
}

function writePixel(data: Uint8ClampedArray, offset: number, red: number, green: number, blue: number): void {
  data[offset] = Math.max(0, Math.min(255, Math.round(red)));
  data[offset + 1] = Math.max(0, Math.min(255, Math.round(green)));
  data[offset + 2] = Math.max(0, Math.min(255, Math.round(blue)));
  data[offset + 3] = 255;
}

function makeCanvas(size: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function createMapTexture(
  canvas: HTMLCanvasElement,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.CanvasTexture {
  const texture = new THREE.CanvasTexture(canvas);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [2, 2];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 2,
    typeof repeat[1] === 'number' ? repeat[1] : 2,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  texture.needsUpdate = true;
  return texture;
}

type ProceduralTextureSet = {
  albedo: THREE.Texture;
  roughness: THREE.Texture;
  height: THREE.Texture;
  normal: THREE.Texture;
  ao: THREE.Texture;
  source: 'reference-pixel-extraction' | 'procedural';
};

function referenceMapUrl(spec: SculptMaterialSpec, channel: string): string | null {
  const reference = spec.referencePbr;
  if (!reference || typeof reference !== 'object') return null;
  if (reference.usable === false) return null;
  const confidence = typeof reference.confidence === 'number'
    ? reference.confidence
    : (typeof reference.estimatedFidelity === 'number' ? reference.estimatedFidelity : 0);
  const threshold = typeof reference.targetThreshold === 'number' ? reference.targetThreshold : 0.7;
  if (confidence < threshold) return null;
  const maps = reference.maps;
  if (!maps || typeof maps !== 'object') return null;
  const map = (maps as Record<string, unknown>)[channel];
  if (!map || typeof map !== 'object') return null;
  const record = map as Record<string, unknown>;
  const url = typeof record.url === 'string' && record.url.trim() ? record.url : record.path;
  return typeof url === 'string' && url.trim() ? url : null;
}

function createLoadedMapTexture(
  url: string,
  colorSpace: THREE.ColorSpace,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): THREE.Texture {
  const texture = new THREE.TextureLoader().load(url);
  const projection = spec.textureProjection && typeof spec.textureProjection === 'object' ? spec.textureProjection : {};
  const repeat = Array.isArray(projection.repeat) ? projection.repeat : [1, 1];
  texture.colorSpace = colorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(
    typeof repeat[0] === 'number' ? repeat[0] : 1,
    typeof repeat[1] === 'number' ? repeat[1] : 1,
  );
  texture.anisotropy = Math.max(1, Math.round(options.textureAnisotropy ?? projection.anisotropy ?? 8));
  // TextureLoader marks the texture for update after image data arrives;
  // setting needsUpdate here races that load and triggers WebGL warnings.
  return texture;
}

function makeReferenceTextureSet(spec: SculptMaterialSpec, options: ProceduralModelOptions): ProceduralTextureSet | null {
  const albedo = referenceMapUrl(spec, 'albedo');
  const roughness = referenceMapUrl(spec, 'roughness');
  const height = referenceMapUrl(spec, 'height');
  const normal = referenceMapUrl(spec, 'normal');
  const ao = referenceMapUrl(spec, 'ao');
  if (!albedo || !roughness || !height || !normal || !ao) return null;
  return {
    albedo: createLoadedMapTexture(albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createLoadedMapTexture(roughness, THREE.NoColorSpace, spec, options),
    height: createLoadedMapTexture(height, THREE.NoColorSpace, spec, options),
    normal: createLoadedMapTexture(normal, THREE.NoColorSpace, spec, options),
    ao: createLoadedMapTexture(ao, THREE.NoColorSpace, spec, options),
    source: 'reference-pixel-extraction',
  };
}

function makeProceduralTextureSet(
  id: string,
  spec: SculptMaterialSpec,
  options: ProceduralModelOptions,
): ProceduralTextureSet | null {
  if (typeof document === 'undefined') return null;
  const qualityFirst = (options.qualityPriority ?? 'reference-fidelity') === 'reference-fidelity';
  const requested = options.textureSize ?? spec.textureResolution;
  const requestedSize = typeof requested === 'number' && Number.isFinite(requested)
    ? requested
    : (qualityFirst ? 1024 : 512);
  const size = Math.max(256, Math.min(2048, 2 ** Math.round(Math.log2(requestedSize))));
  const canvases = {
    albedo: makeCanvas(size),
    roughness: makeCanvas(size),
    height: makeCanvas(size),
    normal: makeCanvas(size),
    ao: makeCanvas(size),
  };
  const contexts = {
    albedo: canvases.albedo.getContext('2d'),
    roughness: canvases.roughness.getContext('2d'),
    height: canvases.height.getContext('2d'),
    normal: canvases.normal.getContext('2d'),
    ao: canvases.ao.getContext('2d'),
  };
  if (!contexts.albedo || !contexts.roughness || !contexts.height || !contexts.normal || !contexts.ao) return null;
  const images = {
    albedo: contexts.albedo.createImageData(size, size),
    roughness: contexts.roughness.createImageData(size, size),
    height: contexts.height.createImageData(size, size),
    normal: contexts.normal.createImageData(size, size),
    ao: contexts.ao.createImageData(size, size),
  };
  const seed = hashString(id);
  const bands = surfaceBands(spec);
  const heightField = new Float32Array(size * size);
  const roughnessField = new Float32Array(size * size);
  const palette = materialPalette(spec);
  const fallback = typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F';
  const colors = (palette.length >= 2 ? palette : [fallback, '#6E614B', '#A08F70']).map(hexToRgb);
  const baseRoughness = clamp01(readLayerNumber(spec.roughness, ['base'], 0.76));
  const roughnessVariation = clamp01(readLayerNumber(spec.roughness, ['variation'], 0.18));
  const colorAmplitude = clamp01(readLayerNumber(spec.colorVariation, ['amplitude', 'variation'], 0.18));
  const heightCorrelation = clamp01(readLayerNumber(spec.colorVariation, ['heightCorrelation'], 0.3));
  const colorGradient: ColorGradientSpec | undefined = spec.colorGradient;
  for (let y = 0; y < size; y += 1) {
    const v = y / size;
    for (let x = 0; x < size; x += 1) {
      const u = x / size;
      const index = y * size + x;
      const height = sampleSurface(u, v, bands, seed + 101);
      const roughNoise = sampleSurface(u, v, bands, seed + 7001);
      const colorNoise = sampleSurface(u, v, bands, seed + 15013);
      heightField[index] = height;
      roughnessField[index] = clamp01(baseRoughness + (roughNoise - 0.5) * roughnessVariation * 2);
      let color: [number, number, number];
      if (colorGradient) {
        // Evidence-derived spatial gradient (Plan 1.3 Workstream C) takes priority
        // over the noise-based palette blend below — it is a measured trend, not a guess.
        color = sampleColorGradient(colorGradient, u, v);
      } else {
        const paletteValue = clamp01(
          0.5 + (colorNoise - 0.5) * colorAmplitude * 2 + (height - 0.5) * heightCorrelation
        );
        color = mixPalette(colors, paletteValue);
      }
      writePixel(images.albedo.data, index * 4, color[0], color[1], color[2]);
    }
  }
  const normalStrength = Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35));
  const aoStrength = clamp01(readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35));
  for (let y = 0; y < size; y += 1) {
    const up = ((y - 1 + size) % size) * size;
    const down = ((y + 1) % size) * size;
    for (let x = 0; x < size; x += 1) {
      const left = (x - 1 + size) % size;
      const right = (x + 1) % size;
      const index = y * size + x;
      const center = heightField[index];
      const dx = (heightField[y * size + right] - heightField[y * size + left]) * normalStrength * 6;
      const dy = (heightField[down + x] - heightField[up + x]) * normalStrength * 6;
      const inverseLength = 1 / Math.sqrt(dx * dx + dy * dy + 1);
      const normalX = -dx * inverseLength;
      const normalY = -dy * inverseLength;
      const normalZ = inverseLength;
      const neighborAverage = (
        heightField[y * size + left] + heightField[y * size + right]
        + heightField[up + x] + heightField[down + x]
      ) * 0.25;
      const cavity = Math.max(0, neighborAverage - center);
      const ao = clamp01(1 - aoStrength * (cavity * 12 + (1 - center) * 0.16));
      const offset = index * 4;
      const heightByte = center * 255;
      const roughnessByte = roughnessField[index] * 255;
      writePixel(images.height.data, offset, heightByte, heightByte, heightByte);
      writePixel(images.roughness.data, offset, roughnessByte, roughnessByte, roughnessByte);
      writePixel(
        images.normal.data, offset,
        (normalX * 0.5 + 0.5) * 255,
        (normalY * 0.5 + 0.5) * 255,
        (normalZ * 0.5 + 0.5) * 255,
      );
      writePixel(images.ao.data, offset, ao * 255, ao * 255, ao * 255);
    }
  }
  contexts.albedo.putImageData(images.albedo, 0, 0);
  contexts.roughness.putImageData(images.roughness, 0, 0);
  contexts.height.putImageData(images.height, 0, 0);
  contexts.normal.putImageData(images.normal, 0, 0);
  contexts.ao.putImageData(images.ao, 0, 0);
  return {
    albedo: createMapTexture(canvases.albedo, THREE.SRGBColorSpace, spec, options),
    roughness: createMapTexture(canvases.roughness, THREE.NoColorSpace, spec, options),
    height: createMapTexture(canvases.height, THREE.NoColorSpace, spec, options),
    normal: createMapTexture(canvases.normal, THREE.NoColorSpace, spec, options),
    ao: createMapTexture(canvases.ao, THREE.NoColorSpace, spec, options),
    source: 'procedural',
  };
}

function createSculptMaterial(id: string, spec: SculptMaterialSpec, options: ProceduralModelOptions): THREE.MeshPhysicalMaterial {
  const textures = makeReferenceTextureSet(spec, options) ?? makeProceduralTextureSet(id, spec, options);
  const material = new THREE.MeshPhysicalMaterial({
    color: textures ? 0xffffff : new THREE.Color(typeof spec.baseColor === 'string' ? spec.baseColor : '#8A7A5F'),
    roughness: textures ? 1 : clamp01(readLayerNumber(spec.roughness, ['base'], 0.76)),
    metalness: clamp01(readLayerNumber(spec.metalness, ['base'], 0.0)),
    clearcoat: clamp01(readLayerNumber(spec.clearcoat, ['base', 'amount'], 0)),
    clearcoatRoughness: clamp01(readLayerNumber(spec.clearcoatRoughness, ['base'], 0.25)),
    transmission: clamp01(readLayerNumber(spec.transmission, ['base', 'amount'], 0)),
    ior: Math.max(1, readLayerNumber(spec.ior, ['base', 'value'], 1.5)),
    thickness: Math.max(0, readLayerNumber(spec.thickness, ['base', 'amount'], 0)),
    attenuationDistance: Math.max(0.001, readLayerNumber(spec.attenuationDistance, ['base', 'value'], Infinity)),
    attenuationColor: new THREE.Color(typeof spec.attenuationColor === 'string' ? spec.attenuationColor : '#ffffff'),
    sheen: clamp01(readLayerNumber(spec.sheen, ['base', 'amount'], 0)),
    sheenColor: new THREE.Color(typeof spec.sheenColor === 'string' ? spec.sheenColor : '#ffffff'),
    sheenRoughness: clamp01(readLayerNumber(spec.sheenRoughness, ['base'], 1.0)),
    iridescence: clamp01(readLayerNumber(spec.iridescence, ['base', 'amount'], 0)),
    iridescenceIOR: Math.max(1, readLayerNumber(spec.iridescenceIOR, ['base', 'value'], 1.3)),
    anisotropy: clamp01(readLayerNumber(spec.anisotropy, ['base', 'amount'], 0)),
    anisotropyRotation: readLayerNumber(spec.anisotropy, ['rotation'], 0),
    specularIntensity: clamp01(readLayerNumber(spec.specularIntensity, ['base'], 1.0)),
    specularColor: new THREE.Color(typeof spec.specularColor === 'string' ? spec.specularColor : '#ffffff'),
    emissive: new THREE.Color(typeof spec.emissive === 'string' ? spec.emissive : '#000000'),
    emissiveIntensity: Math.max(0, readLayerNumber(spec.emissiveIntensity, ['base'], 1.0)),
    opacity: clamp01(readLayerNumber(spec.opacity, ['base'], 1)),
    transparent: readLayerNumber(spec.transmission, ['base', 'amount'], 0) > 0 || readLayerNumber(spec.opacity, ['base'], 1) < 1,
    alphaTest: Math.max(0, readLayerNumber(spec.alpha, ['cutoff', 'alphaTest'], 0)),
    wireframe: options.wireframe ?? false,
    side: spec.doubleSided === true ? THREE.DoubleSide : THREE.FrontSide,
  });
  if (textures) {
    material.map = textures.albedo;
    material.roughnessMap = textures.roughness;
    material.normalMap = textures.normal;
    material.normalScale.setScalar(Math.max(0.05, readLayerNumber(spec.normal, ['strength', 'amplitude'], 0.35)));
    material.aoMap = textures.ao;
    material.aoMap.channel = 0;
    material.aoMapIntensity = readLayerNumber(spec.ambientOcclusion, ['cavityStrength', 'strength'], 0.35);
    const bumpScale = Math.max(0, readLayerNumber(spec.bump, ['amplitude', 'strength'], 0));
    if (bumpScale > 0) {
      material.bumpMap = textures.height;
      material.bumpScale = bumpScale;
    }
    const displacementScale = Math.max(0, readLayerNumber(spec.displacement, ['amplitude', 'strength'], 0));
    if (displacementScale > 0) {
      material.displacementMap = textures.height;
      material.displacementScale = displacementScale;
      material.displacementBias = -displacementScale * 0.5;
    }
  }
  material.envMapIntensity = readLayerNumber(spec, ['envMapIntensity'], 0.8);
  material.userData.sculptMaterial = spec;
  material.userData.proceduralMapsIndependent = true;
  material.userData.pbrTextureSource = textures?.source ?? 'flat-fallback';
  material.userData.referencePbr = spec.referencePbr ?? null;
  material.needsUpdate = true;
  return material;
}

type AttachmentEndpoint = {
  start: THREE.Vector3;
  midpoint: THREE.Vector3;
  quaternion: THREE.Quaternion;
  length: number;
  baseRadius: number;
  endRadius: number;
};

function readVector3(value: unknown, fallback: [number, number, number]): THREE.Vector3 {
  if (Array.isArray(value) && value.length === 3 && value.every((item) => typeof item === 'number')) {
    return new THREE.Vector3(value[0], value[1], value[2]);
  }
  return new THREE.Vector3(fallback[0], fallback[1], fallback[2]);
}

function readNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}

function makeAttachmentEndpoint(attachment: unknown): AttachmentEndpoint | null {
  if (!attachment || typeof attachment !== 'object') return null;
  const record = attachment as Record<string, unknown>;
  const start = readVector3(record.localStart, [0, 0, 0]);
  const end = readVector3(record.localEnd, [0, 1, 0]);
  const delta = end.clone().sub(start);
  const length = delta.length();
  if (length <= 0.0001) return null;
  const direction = delta.clone().normalize();
  const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction);
  const baseRadius = Math.max(0.005, readNumber(record.baseRadius, 0.06));
  const endRadius = Math.max(0.003, readNumber(record.endRadius, baseRadius * 0.55));
  return {
    start,
    midpoint: delta.multiplyScalar(0.5),
    quaternion,
    length,
    baseRadius,
    endRadius,
  };
}

// Generated from ObjectSculptSpec target: Patchwork Tractor
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createPatchworkTractorModel(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "Patchwork Tractor";

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["painted-metal"] = createSculptMaterial(
    "painted-metal",
    {"id": "painted-metal", "name": "Painted aged metal", "type": "standard", "baseColor": "#593F2B", "albedo": {"dominant": "#593F2B", "secondary": ["#89664B", "#C1A17F", "#322417"]}, "roughness": {"base": 0.717, "variation": 0.143, "map": {"path": "pbr-base/base_roughness.png", "url": "pbr-base/base_roughness.png", "channel": "roughness", "source": "reference-pixel-extraction"}}, "metalness": {"base": 0.35, "variation": 0.1}, "normal": {"strength": 0.238, "map": {"path": "pbr-base/base_normal.png", "url": "pbr-base/base_normal.png", "channel": "normal", "source": "reference-pixel-extraction"}}, "ambientOcclusion": {"map": {"path": "pbr-base/base_ao.png", "url": "pbr-base/base_ao.png", "channel": "ao", "source": "reference-pixel-extraction"}}, "localOverrides": [{"id": "panel-seam-darkening", "type": "seam", "roughness": 0.82}, {"id": "patina-cavity-mask", "type": "stain", "dirtAmount": 0.35}, {"id": "edge-wear-mask", "type": "scratch", "roughness": 0.28}], "surfaceFrequencyBands": [{"id": "macro", "frequency": 2, "amplitude": 0.5}, {"id": "meso", "frequency": 14, "amplitude": 0.35}, {"id": "micro", "frequency": 72, "amplitude": 0.14}], "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2, 2]}, "referencePbr": {"usable": true, "verdict": "pass", "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "maps": {"albedo": {"path": "pbr-base/base_albedo.png", "url": "pbr-base/base_albedo.png"}, "roughness": {"path": "pbr-base/base_roughness.png", "url": "pbr-base/base_roughness.png"}, "height": {"path": "pbr-base/base_height.png", "url": "pbr-base/base_height.png"}, "normal": {"path": "pbr-base/base_normal.png", "url": "pbr-base/base_normal.png"}, "ao": {"path": "pbr-base/base_ao.png", "url": "pbr-base/base_ao.png"}}}},
    options
  );
  materialMap["rubber"] = createSculptMaterial(
    "rubber",
    {"id": "rubber", "name": "Tire rubber", "type": "standard", "qualityTier": "utility", "baseColor": "#130D07", "roughness": {"base": 0.82, "variation": 0.08}, "metalness": {"base": 0, "variation": 0}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 1, "amplitude": 0.2}, {"id": "meso", "frequency": 18, "amplitude": 0.5}, {"id": "micro", "frequency": 80, "amplitude": 0.1}], "localOverrides": [{"id": "tire-dirt", "type": "stain", "dirtAmount": 0.4}]},
    options
  );
  materialMap["glass"] = createSculptMaterial(
    "glass",
    {"id": "glass", "name": "Cab glass", "type": "physical", "qualityTier": "utility", "baseColor": "#283038", "roughness": {"base": 0.24, "variation": 0.05}, "metalness": {"base": 0, "variation": 0}, "localOverrides": [{"id": "window-reflection", "type": "gloss", "roughness": 0.16}]},
    options
  );
  materialMap["aged-hardware"] = createSculptMaterial(
    "aged-hardware",
    {"id": "aged-hardware", "name": "Dark hardware", "type": "standard", "qualityTier": "utility", "baseColor": "#322417", "roughness": {"base": 0.55, "variation": 0.12}, "metalness": {"base": 0.7, "variation": 0.1}, "localOverrides": [{"id": "hardware-patina", "type": "stain", "dirtAmount": 0.25}]},
    options
  );
  materialMap["emissive-lamp"] = createSculptMaterial(
    "emissive-lamp",
    {"id": "emissive-lamp", "name": "Warm lamps", "type": "physical", "qualityTier": "utility", "baseColor": "#FFEFB8", "roughness": {"base": 0.18, "variation": 0.02}, "metalness": {"base": 0, "variation": 0}, "localOverrides": [{"id": "headlight-emissive", "type": "emissive", "emissive": "#FFD27A", "emissiveIntensity": 2.2}, {"id": "beacon-emissive", "type": "emissive", "emissive": "#FF9D22", "emissiveIntensity": 1.8}]},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const attachment_root_0 = null;
  const endpoint_root_0 = makeAttachmentEndpoint(attachment_root_0);
  const node_root_0 = new THREE.Group();
  node_root_0.name = "Vehicle root__pivot";
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
    node_root_0.scale.set(1, 1, 1);
  } else {
    node_root_0.position.set(0.0, 0.0, 0.0);
    node_root_0.rotation.set(0.0, 0.0, 0.0);
    node_root_0.scale.set(1.0, 1.0, 1.0);
  }
  node_root_0.userData.sculptComponent = {"id": "root", "name": "Vehicle root", "level": "macro", "role": "root", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Origin and bounds are inferred from the complete isolated vehicle silhouette.", "parent": null, "material": "painted-metal", "materialLayers": ["painted-metal"], "dimensions": {"width": 4.2, "height": 2.4, "depth": 2.1, "units": "meters", "confidence": 0.55}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(89, 63, 43, 1.0)", "secondaryAlbedo": "rgba(193, 161, 127, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86}, "localFeatures": ["root-bounds"], "evidenceRefs": ["full-object"]};
  node_root_0.userData.actionProfile = {};
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0
    ? new THREE.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_root_0 = new THREE.Mesh(
    mesh_root_0Geometry,
    materialMap["painted-metal"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_root_0.name = "Vehicle root";
  // Root is a runtime pivot/bounds record, not visible geometry.
  mesh_root_0.visible = false;
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  if (!endpoint_root_0) {
    mesh_root_0.scale.set(4.2, 2.4, 2.1);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = {"id": "root", "name": "Vehicle root", "level": "macro", "role": "root", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Origin and bounds are inferred from the complete isolated vehicle silhouette.", "parent": null, "material": "painted-metal", "materialLayers": ["painted-metal"], "dimensions": {"width": 4.2, "height": 2.4, "depth": 2.1, "units": "meters", "confidence": 0.55}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(89, 63, 43, 1.0)", "secondaryAlbedo": "rgba(193, 161, 127, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86}, "localFeatures": ["root-bounds"], "evidenceRefs": ["full-object"]};
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = {};

  const attachment_chassis_system_1 = null;
  const endpoint_chassis_system_1 = makeAttachmentEndpoint(attachment_chassis_system_1);
  const node_chassis_system_1 = new THREE.Group();
  node_chassis_system_1.name = "Chassis system__pivot";
  if (endpoint_chassis_system_1) {
    node_chassis_system_1.position.copy(endpoint_chassis_system_1.start);
    node_chassis_system_1.rotation.set(0, 0, 0);
    node_chassis_system_1.scale.set(1, 1, 1);
  } else {
    node_chassis_system_1.position.set(0.0, 0.65, 0.0);
    node_chassis_system_1.rotation.set(0.0, 0.0, 0.0);
    node_chassis_system_1.scale.set(1.0, 1.0, 1.0);
  }
  node_chassis_system_1.userData.sculptComponent = {"id": "chassis-system", "name": "Chassis system", "level": "macro", "role": "body", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "The visible lower frame is a rigid assembled support inferred from wheel and body alignment.", "parent": "root", "material": "aged-hardware", "materialLayers": ["aged-hardware"], "dimensions": {"width": 3.8, "height": 0.7, "depth": 1.7, "units": "meters", "confidence": 0.55}, "transform": {"position": [0, 0.65, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(50, 36, 23, 1.0)", "secondaryAlbedo": "rgba(89, 63, 43, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.78}, "localFeatures": ["chassis-frame", "underbody-collider"], "evidenceRefs": ["full-object"]};
  node_chassis_system_1.userData.actionProfile = {};
  (nodes["root"] ?? root).add(node_chassis_system_1);
  nodes["chassis-system"] = node_chassis_system_1;
  const mesh_chassis_system_1Geometry = endpoint_chassis_system_1
    ? new THREE.CylinderGeometry(endpoint_chassis_system_1.endRadius, endpoint_chassis_system_1.baseRadius, endpoint_chassis_system_1.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_chassis_system_1 = new THREE.Mesh(
    mesh_chassis_system_1Geometry,
    materialMap["aged-hardware"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_chassis_system_1.name = "Chassis system";
  if (endpoint_chassis_system_1) {
    mesh_chassis_system_1.position.copy(endpoint_chassis_system_1.midpoint);
    mesh_chassis_system_1.quaternion.copy(endpoint_chassis_system_1.quaternion);
  }
  if (!endpoint_chassis_system_1) {
    mesh_chassis_system_1.scale.set(3.8, 0.7, 1.7);
  }
  mesh_chassis_system_1.castShadow = options.castShadow ?? true;
  mesh_chassis_system_1.receiveShadow = options.receiveShadow ?? true;
  mesh_chassis_system_1.userData.sculptComponent = {"id": "chassis-system", "name": "Chassis system", "level": "macro", "role": "body", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "The visible lower frame is a rigid assembled support inferred from wheel and body alignment.", "parent": "root", "material": "aged-hardware", "materialLayers": ["aged-hardware"], "dimensions": {"width": 3.8, "height": 0.7, "depth": 1.7, "units": "meters", "confidence": 0.55}, "transform": {"position": [0, 0.65, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(50, 36, 23, 1.0)", "secondaryAlbedo": "rgba(89, 63, 43, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.78}, "localFeatures": ["chassis-frame", "underbody-collider"], "evidenceRefs": ["full-object"]};
  node_chassis_system_1.add(mesh_chassis_system_1);
  meshes["chassis-system"] = mesh_chassis_system_1;
  colliders["chassis-system"] = {};

  const attachment_body_and_attachments_2 = null;
  const endpoint_body_and_attachments_2 = makeAttachmentEndpoint(attachment_body_and_attachments_2);
  const node_body_and_attachments_2 = new THREE.Group();
  node_body_and_attachments_2.name = "Body and attachments__pivot";
  if (endpoint_body_and_attachments_2) {
    node_body_and_attachments_2.position.copy(endpoint_body_and_attachments_2.start);
    node_body_and_attachments_2.rotation.set(0, 0, 0);
    node_body_and_attachments_2.scale.set(1, 1, 1);
  } else {
    node_body_and_attachments_2.position.set(0.15, 1.45, 0.0);
    node_body_and_attachments_2.rotation.set(0.0, 0.0, 0.0);
    node_body_and_attachments_2.scale.set(1.0, 1.0, 1.0);
  }
  node_body_and_attachments_2.userData.sculptComponent = {"id": "body-and-attachments", "name": "Body and attachments", "level": "macro", "role": "body", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Cab, hood, fenders, and attachment hardware form distinct rigid assemblies around the chassis.", "parent": "root", "material": "painted-metal", "materialLayers": ["painted-metal", "glass", "emissive-lamp"], "dimensions": {"width": 3.4, "height": 2.2, "depth": 1.8, "units": "meters", "confidence": 0.6}, "transform": {"position": [0.15, 1.45, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(193, 161, 127, 1.0)", "secondaryAlbedo": "rgba(137, 102, 75, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86}, "localFeatures": ["body-panel-seams", "attachment-sockets"], "evidenceRefs": ["full-object"]};
  node_body_and_attachments_2.userData.actionProfile = {};
  (nodes["root"] ?? root).add(node_body_and_attachments_2);
  nodes["body-and-attachments"] = node_body_and_attachments_2;
  const mesh_body_and_attachments_2Geometry = endpoint_body_and_attachments_2
    ? new THREE.CylinderGeometry(endpoint_body_and_attachments_2.endRadius, endpoint_body_and_attachments_2.baseRadius, endpoint_body_and_attachments_2.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_body_and_attachments_2 = new THREE.Mesh(
    mesh_body_and_attachments_2Geometry,
    materialMap["painted-metal"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_body_and_attachments_2.name = "Body and attachments";
  if (endpoint_body_and_attachments_2) {
    mesh_body_and_attachments_2.position.copy(endpoint_body_and_attachments_2.midpoint);
    mesh_body_and_attachments_2.quaternion.copy(endpoint_body_and_attachments_2.quaternion);
  }
  if (!endpoint_body_and_attachments_2) {
    mesh_body_and_attachments_2.scale.set(3.4, 2.2, 1.8);
  }
  mesh_body_and_attachments_2.castShadow = options.castShadow ?? true;
  mesh_body_and_attachments_2.receiveShadow = options.receiveShadow ?? true;
  mesh_body_and_attachments_2.userData.sculptComponent = {"id": "body-and-attachments", "name": "Body and attachments", "level": "macro", "role": "body", "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Cab, hood, fenders, and attachment hardware form distinct rigid assemblies around the chassis.", "parent": "root", "material": "painted-metal", "materialLayers": ["painted-metal", "glass", "emissive-lamp"], "dimensions": {"width": 3.4, "height": 2.2, "depth": 1.8, "units": "meters", "confidence": 0.6}, "transform": {"position": [0.15, 1.45, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(193, 161, 127, 1.0)", "secondaryAlbedo": "rgba(137, 102, 75, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.86}, "localFeatures": ["body-panel-seams", "attachment-sockets"], "evidenceRefs": ["full-object"]};
  node_body_and_attachments_2.add(mesh_body_and_attachments_2);
  meshes["body-and-attachments"] = mesh_body_and_attachments_2;
  colliders["body-and-attachments"] = {};

  const attachment_wheel_system_3 = null;
  const endpoint_wheel_system_3 = makeAttachmentEndpoint(attachment_wheel_system_3);
  const node_wheel_system_3 = new THREE.Group();
  node_wheel_system_3.name = "Four-wheel system__pivot";
  if (endpoint_wheel_system_3) {
    node_wheel_system_3.position.copy(endpoint_wheel_system_3.start);
    node_wheel_system_3.rotation.set(0, 0, 0);
    node_wheel_system_3.scale.set(1, 1, 1);
  } else {
    node_wheel_system_3.position.set(0.0, 0.7, 0.0);
    node_wheel_system_3.rotation.set(0.0, 0.0, 0.0);
    node_wheel_system_3.scale.set(1.0, 1.0, 1.0);
  }
  node_wheel_system_3.userData.sculptComponent = {"id": "wheel-system", "name": "Four-wheel system", "level": "meso", "role": "body", "primitive": "instanced-cluster", "topologyClass": "assembled-solid", "topologyRationale": "Four repeated wheel assemblies define mobility and require shared geometry with independent pivots.", "parent": "chassis-system", "material": "rubber", "materialLayers": ["rubber", "aged-hardware"], "dimensions": {"width": 3.8, "height": 1.35, "depth": 1.8, "units": "meters", "confidence": 0.82}, "transform": {"position": [0, 0.7, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(50, 36, 23, 1.0)", "secondaryAlbedo": "rgba(19, 13, 7, 1.0)", "materialClass": "rubber", "materialClassConfidence": 0.86}, "localFeatures": ["tread-and-hub-instancing", "fastener-instancing"], "evidenceRefs": ["full-object"]};
  node_wheel_system_3.userData.actionProfile = {};
  (nodes["chassis-system"] ?? root).add(node_wheel_system_3);
  nodes["wheel-system"] = node_wheel_system_3;
  const mesh_wheel_system_3Geometry = endpoint_wheel_system_3
    ? new THREE.CylinderGeometry(endpoint_wheel_system_3.endRadius, endpoint_wheel_system_3.baseRadius, endpoint_wheel_system_3.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_wheel_system_3 = new THREE.Mesh(
    mesh_wheel_system_3Geometry,
    materialMap["rubber"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_wheel_system_3.name = "Four-wheel system";
  if (endpoint_wheel_system_3) {
    mesh_wheel_system_3.position.copy(endpoint_wheel_system_3.midpoint);
    mesh_wheel_system_3.quaternion.copy(endpoint_wheel_system_3.quaternion);
  }
  if (!endpoint_wheel_system_3) {
    mesh_wheel_system_3.scale.set(3.8, 1.35, 1.8);
  }
  mesh_wheel_system_3.castShadow = options.castShadow ?? true;
  mesh_wheel_system_3.receiveShadow = options.receiveShadow ?? true;
  mesh_wheel_system_3.userData.sculptComponent = {"id": "wheel-system", "name": "Four-wheel system", "level": "meso", "role": "body", "primitive": "instanced-cluster", "topologyClass": "assembled-solid", "topologyRationale": "Four repeated wheel assemblies define mobility and require shared geometry with independent pivots.", "parent": "chassis-system", "material": "rubber", "materialLayers": ["rubber", "aged-hardware"], "dimensions": {"width": 3.8, "height": 1.35, "depth": 1.8, "units": "meters", "confidence": 0.82}, "transform": {"position": [0, 0.7, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "colorMaterialRecipe": {"dominantAlbedo": "rgba(50, 36, 23, 1.0)", "secondaryAlbedo": "rgba(19, 13, 7, 1.0)", "materialClass": "rubber", "materialClassConfidence": 0.86}, "localFeatures": ["tread-and-hub-instancing", "fastener-instancing"], "evidenceRefs": ["full-object"]};
  node_wheel_system_3.add(mesh_wheel_system_3);
  meshes["wheel-system"] = mesh_wheel_system_3;
  colliders["wheel-system"] = {};

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true}, "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim light", "exposure", "tone mapping", "contact shadow"]}};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createPatchworkTractorLookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "Patchwork Tractor look-dev lights";
  const hemi = new THREE.HemisphereLight(
    mode === 'reference' ? 0xfff0d6 : 0xf2f4ff,
    0x363b42,
    mode === 'grazing' ? 0.28 : mode === 'reference' ? 0.72 : 0.85,
  );
  lights.add(hemi);
  const key = new THREE.DirectionalLight(
    mode === 'reference' ? 0xffcf8a : 0xfff4e8,
    mode === 'grazing' ? 4.2 : mode === 'reference' ? 2.6 : 2.15,
  );
  if (mode === 'grazing') key.position.set(7.5, 1.1, 4.0);
  else if (mode === 'reference') key.position.set(-4.5, 7.5, 5.0);
  else key.position.set(-4.0, 6.0, 5.5);
  key.castShadow = true;
  key.shadow.mapSize.set(4096, 4096);
  key.shadow.bias = -0.00025;
  key.shadow.normalBias = 0.018;
  key.shadow.radius = 7;
  key.shadow.blurSamples = 24;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 30;
  key.shadow.camera.left = -2.6;
  key.shadow.camera.right = 2.6;
  key.shadow.camera.top = 2.6;
  key.shadow.camera.bottom = -2.6;
  key.shadow.camera.updateProjectionMatrix();
  lights.add(key);
  const fill = new THREE.DirectionalLight(0xa8c4ff, mode === 'grazing' ? 0.12 : 0.42);
  fill.position.set(4.0, 3.0, 3.5);
  lights.add(fill);
  const rim = new THREE.DirectionalLight(0xfff1c4, mode === 'grazing' ? 0.28 : 0.85);
  rim.position.set(0.5, 4.5, -6.0);
  lights.add(rim);
  lights.userData.reviewMode = mode;
  lights.userData.lightingFromPhoto = [{"name": "key light", "direction": "upper-front-left", "notes": "Soft neutral studio key; preserve panel readability."}, {"name": "fill light", "direction": "camera-front", "notes": "Low-intensity fill prevents cab/wheel cavities from collapsing."}, {"name": "environment and contact", "direction": "neutral-background", "notes": "Use exposure, tone mapping, and contact shadow to separate the silhouette."}];
  lights.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true}, "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim light", "exposure", "tone mapping", "contact shadow"]}};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createPatchworkTractorEnvironment(renderer: THREE.WebGLRenderer): THREE.Texture {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const texture = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();
  return texture;
}

// Plan 1.3 §3.2 — auto-framing by bounding box. The Divine Eye can only compare a
// render to the reference if the object is FRAMED consistently (an object framed
// differently scores as wrong even when its shape is right). This positions the camera
// deterministically from the object's bounding box so it fills the frame at a stable
// margin, and sets near/far to the object scale. Call after adding the model to the
// scene, and again on resize (after updating camera.aspect).
export function framePatchworkTractorCamera(
  camera: THREE.PerspectiveCamera,
  object: THREE.Object3D,
  options: { margin?: number; azimuthDeg?: number; elevationDeg?: number } = {},
): void {
  const box = new THREE.Box3().setFromObject(object);
  if (box.isEmpty()) return;
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const margin = options.margin ?? 1.15;
  const maxDim = Math.max(size.x, size.y, size.z) * margin;
  const fov = (camera.fov * Math.PI) / 180;
  // distance so the largest object dimension fits vertically in the frame
  const distance = (maxDim / 2) / Math.tan(fov / 2);
  const az = ((options.azimuthDeg ?? 0) * Math.PI) / 180;
  const el = ((options.elevationDeg ?? 0) * Math.PI) / 180;
  const dir = new THREE.Vector3(
    Math.sin(az) * Math.cos(el),
    Math.sin(el),
    Math.cos(az) * Math.cos(el),
  );
  camera.position.copy(center).addScaledVector(dir, distance);
  camera.near = Math.max(0.01, distance - maxDim);
  camera.far = distance + maxDim * 2;
  camera.lookAt(center);
  camera.updateProjectionMatrix();
}

// Plan 1.3 §3.2c — PRESENTATION composer (DOF + bloom). CRITICAL (R-POSTFX): this is
// for the showcase/hero render ONLY. The Divine Eye's EVALUATION render MUST use a
// plain renderer with NO composer — bloom blows highlights and DOF blurs edges, which
// would corrupt the deterministic IoU/DCD/edge/blowout signals. Enable dof/bloom ONLY
// when the reference photo actually exhibits them (detect_reference_effects.py authorizes).
export function createPatchworkTractorPresentationComposer(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
  options: { dof?: boolean; bloom?: boolean; bloomStrength?: number; dofFocus?: number; dofAperture?: number } = {},
): EffectComposer {
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  if (options.dof) {
    composer.addPass(new BokehPass(scene, camera, {
      focus: options.dofFocus ?? 10.0,
      aperture: options.dofAperture ?? 0.0002,
      maxblur: 0.01,
    }));
  }
  if (options.bloom) {
    const size = new THREE.Vector2();
    renderer.getSize(size);
    composer.addPass(new UnrealBloomPass(size, options.bloomStrength ?? 0.4, 0.4, 0.85));
  }
  return composer;
}

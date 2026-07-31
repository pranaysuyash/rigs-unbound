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

// bevelEnabled defaults to true on THREE.ExtrudeGeometry and rounds every
// corner — sharp/pointed profiles (blades, fork tines, spikes) need
// bevelEnabled: false plus lineTo()-only path segments near the tip, since a
// curve command cannot produce a true converging point.
function buildExtrudeShape(points: [number, number][], holes?: [number, number][][]): THREE.Shape {
  const shape = new THREE.Shape();
  if (points.length > 0) {
    shape.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length; i += 1) {
      shape.lineTo(points[i][0], points[i][1]);
    }
  }
  // Cutouts (e.g. an oval wire-cutter hole) as THREE.Path added to shape.holes —
  // dep-free boolean subtraction via the tessellator, no CSG library needed.
  for (const loop of holes ?? []) {
    if (loop.length < 3) continue;
    const path = new THREE.Path();
    path.moveTo(loop[0][0], loop[0][1]);
    for (let i = 1; i < loop.length; i += 1) path.lineTo(loop[i][0], loop[i][1]);
    path.closePath();
    shape.holes.push(path);
  }
  return shape;
}

// Build an N-gon oval loop (for hole authoring from a compact {cx,cy,rx,ry} descriptor).
function ovalLoop(cx: number, cy: number, rx: number, ry: number, seg = 24): [number, number][] {
  const loop: [number, number][] = [];
  for (let i = 0; i < seg; i += 1) {
    const a = (i / seg) * Math.PI * 2;
    loop.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return loop;
}

function buildExtrudeGeometry(profile: { points: [number, number][]; depth: number; holes?: [number, number][][]; ovalHoles?: { cx: number; cy: number; rx: number; ry: number }[] }): THREE.ExtrudeGeometry {
  const holes = [...(profile.holes ?? []), ...((profile.ovalHoles ?? []).map((o) => ovalLoop(o.cx, o.cy, o.rx, o.ry)))];
  const shape = buildExtrudeShape(profile.points, holes);
  return new THREE.ExtrudeGeometry(shape, {
    depth: profile.depth,
    bevelEnabled: false,
    steps: 1,
  });
}

function buildTubeGeometry(
  path: { points: [number, number, number][]; radius?: number; radialSegments?: number; closed?: boolean },
): THREE.TubeGeometry {
  const vectors = path.points.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(vectors, path.closed ?? false);
  const tubularSegments = Math.max(8, path.points.length * 6);
  return new THREE.TubeGeometry(curve, tubularSegments, path.radius ?? 0.05, path.radialSegments ?? 8, path.closed ?? false);
}

// Plan 1.3 F.6 — sweep a thin 2D cross-section along a 3D spine so a curved
// form (hooked blade, handle) reads correctly from EVERY camera angle, not just
// the reference angle a flat extrude happens to match. Uses ExtrudeGeometry's
// native extrudePath; bevelEnabled: false keeps sharp tips (same rule as F.5).
function buildCurveSweepGeometry(
  sweep: { spine: [number, number, number][]; crossSection: { points: [number, number][] }; closed?: boolean },
): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const cs = sweep.crossSection.points;
  if (cs.length > 0) {
    shape.moveTo(cs[0][0], cs[0][1]);
    for (let i = 1; i < cs.length; i += 1) shape.lineTo(cs[i][0], cs[i][1]);
    shape.closePath();
  }
  const spine = sweep.spine.map(([x, y, z]) => new THREE.Vector3(x, y, z));
  const path = new THREE.CatmullRomCurve3(spine, sweep.closed ?? false);
  return new THREE.ExtrudeGeometry(shape, {
    extrudePath: path,
    steps: Math.max(24, spine.length * 8),
    bevelEnabled: false,
  });
}

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

// Generated from ObjectSculptSpec target: Field Plough 01
// Sculpt build pass: blockout
// This factory is intentionally pass-gated. Finish browser screenshot review before unlocking deeper passes.
export function createFieldPlough01Model(options: ProceduralModelOptions = {}): THREE.Group {
  const root = new THREE.Group();
  root.name = "Field Plough 01";

  const materialMap: Record<string, THREE.Material> = {};
  materialMap["painted-steel"] = createSculptMaterial(
    "painted-steel",
    {"id": "painted-steel", "name": "worn dark protective paint over steel", "type": "standard", "qualityTier": "hero", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#3E4A4D", "color": "#3E4A4D", "albedo": {"dominant": "#3E4A4D", "secondary": ["#566365", "#293033"], "samplingNotes": "Canonical asset definition; source pixels remain evidence, not measured truth."}, "colorVariation": {"palette": ["#3E4A4D", "#566365", "#293033"], "pattern": "localized procedural variation", "amplitude": 0.2, "heightCorrelation": 0.35}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2, 2], "anisotropy": 8, "texelDensityIntent": "Stable object-scale detail"}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2, "amplitude": 0.42, "role": "broad breakup"}, {"id": "meso", "frequency": 12, "amplitude": 0.22, "role": "wear and seams"}, {"id": "micro", "frequency": 56, "amplitude": 0.08, "role": "grazing-light breakup"}], "roughness": {"base": 0.78, "variation": 0.18, "map": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_roughness.png"}, "metalness": {"base": 0.82, "variation": 0.08}, "normal": {"pattern": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_normal.png", "strength": 0.42, "scale": 24, "space": "tangent"}, "bump": {"pattern": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_height.png", "amplitude": 0.2, "scale": 1}, "displacement": {"pattern": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_height.png", "amplitude": 0.04, "scale": 1, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.55, "contactShadowBias": 0.35, "notes": "Independent cavity and contact response"}, "wear": {"edgeWear": 0.45, "scratches": [{"id": "paint-chip-mask", "kind": "chip", "region": "beam edges and upper hitch plates", "affect": "expose bare steel and rust"}, {"id": "edge-wear-mask", "kind": "scratch", "region": "beam corners and share supports", "affect": "lower roughness and expose warm underlayer"}], "chips": [{"id": "paint-chip-mask", "kind": "chip", "region": "beam edges and upper hitch plates", "affect": "expose bare steel and rust"}]}, "dirt": {"amount": 0.28, "cavityBias": 0.7, "color": "#3E4A4D"}, "localOverrides": [{"id": "paint-chip-mask", "kind": "chip", "region": "beam edges and upper hitch plates", "affect": "expose bare steel and rust"}, {"id": "edge-wear-mask", "kind": "scratch", "region": "beam corners and share supports", "affect": "lower roughness and expose warm underlayer"}, {"id": "cavity-dirt-mask", "kind": "stain", "region": "pin recesses and underside joints", "affect": "darken albedo and increase roughness"}], "referencePbr": {"version": "1", "sourceImage": "assets/generated/field-plough-01-object-reference-2026-07-29.png", "extractor": "extract_pbr_evidence.py", "method": "reference-derived pixel evidence", "verdict": "usable for derived material pass", "hardLimit": "not inverse rendering", "usable": true, "confidence": 0.86, "estimatedFidelity": 0.86, "targetThreshold": 0.7, "maps": {"albedo": {"path": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_albedo.png", "channel": "albedo"}, "roughness": {"path": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_roughness.png", "channel": "roughness"}, "height": {"path": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_height.png", "channel": "height"}, "normal": {"path": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_normal.png", "channel": "normal"}, "ao": {"path": "assets/workbench/field-plough-01/pbr-painted-steel/painted-steel_ao.png", "channel": "ao"}}}, "shaderNotes": ["Keep albedo, roughness, height, normal, and AO independent.", "Do not turn visual texture into collision or gameplay authority."]},
    options
  );
  materialMap["bare-steel"] = createSculptMaterial(
    "bare-steel",
    {"id": "bare-steel", "name": "exposed and polished steel cutting/pin surfaces", "type": "standard", "qualityTier": "utility", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#A7A6A0", "color": "#A7A6A0", "albedo": {"dominant": "#A7A6A0", "secondary": ["#686B69", "#D0CDC0"], "samplingNotes": "Canonical asset definition; source pixels remain evidence, not measured truth."}, "colorVariation": {"palette": ["#A7A6A0", "#686B69", "#D0CDC0"], "pattern": "localized procedural variation", "amplitude": 0.2, "heightCorrelation": 0.35}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2, 2], "anisotropy": 8, "texelDensityIntent": "Stable object-scale detail"}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2, "amplitude": 0.42, "role": "broad breakup"}, {"id": "meso", "frequency": 12, "amplitude": 0.22, "role": "wear and seams"}, {"id": "micro", "frequency": 56, "amplitude": 0.08, "role": "grazing-light breakup"}], "roughness": {"base": 0.36, "variation": 0.22, "map": "independent-procedural-metal-roughness"}, "metalness": {"base": 0.94, "variation": 0.08}, "normal": {"pattern": "independent-machined-surface-normal", "strength": 0.26, "scale": 24, "space": "tangent"}, "bump": {"pattern": "independent-edge-and-machining-height", "amplitude": 0.2, "scale": 1}, "displacement": {"pattern": "independent-edge-and-machining-height", "amplitude": 0.04, "scale": 1, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.48, "contactShadowBias": 0.35, "notes": "Independent cavity and contact response"}, "wear": {"edgeWear": 0.45, "scratches": [{"id": "machining-scratches", "kind": "scratch", "region": "pin crowns and exposed plates", "affect": "directional normal and roughness breakup"}], "chips": []}, "dirt": {"amount": 0.28, "cavityBias": 0.7, "color": "#A7A6A0"}, "localOverrides": [{"id": "cutting-edge-polish", "kind": "gloss", "region": "share leading edges", "affect": "roughness 0.18 with grazing-light readability", "roughness": 0.18, "clearcoat": 0.35}, {"id": "machining-scratches", "kind": "scratch", "region": "pin crowns and exposed plates", "affect": "directional normal and roughness breakup"}], "shaderNotes": ["Keep albedo, roughness, height, normal, and AO independent.", "Do not turn visual texture into collision or gameplay authority."]},
    options
  );
  materialMap["rust"] = createSculptMaterial(
    "rust",
    {"id": "rust", "name": "oxidation and paint-loss overlay", "type": "standard", "qualityTier": "utility", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#8A4D32", "color": "#8A4D32", "albedo": {"dominant": "#8A4D32", "secondary": ["#B26A3E", "#4A3028"], "samplingNotes": "Canonical asset definition; source pixels remain evidence, not measured truth."}, "colorVariation": {"palette": ["#8A4D32", "#B26A3E", "#4A3028"], "pattern": "localized procedural variation", "amplitude": 0.2, "heightCorrelation": 0.35}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2, 2], "anisotropy": 8, "texelDensityIntent": "Stable object-scale detail"}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2, "amplitude": 0.42, "role": "broad breakup"}, {"id": "meso", "frequency": 12, "amplitude": 0.22, "role": "wear and seams"}, {"id": "micro", "frequency": 56, "amplitude": 0.08, "role": "grazing-light breakup"}], "roughness": {"base": 0.92, "variation": 0.2, "map": "independent-rust-roughness"}, "metalness": {"base": 0.18, "variation": 0.08}, "normal": {"pattern": "independent-rust-bloom-normal", "strength": 0.3, "scale": 24, "space": "tangent"}, "bump": {"pattern": "rust-bloom-height", "amplitude": 0.2, "scale": 1}, "displacement": {"pattern": "rust-bloom-height", "amplitude": 0.04, "scale": 1, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.65, "contactShadowBias": 0.35, "notes": "Independent cavity and contact response"}, "wear": {"edgeWear": 0.45, "scratches": [], "chips": []}, "dirt": {"amount": 0.28, "cavityBias": 0.7, "color": "#8A4D32"}, "localOverrides": [{"id": "rust-bloom", "kind": "stain", "region": "pin seams, lower share plates, beam scratches", "affect": "warm oxidation with cavity bias"}, {"id": "sun-fade", "kind": "stain", "region": "upper exposed beam", "affect": "desaturate and raise roughness"}], "shaderNotes": ["Keep albedo, roughness, height, normal, and AO independent.", "Do not turn visual texture into collision or gameplay authority."]},
    options
  );
  materialMap["soil-residue"] = createSculptMaterial(
    "soil-residue",
    {"id": "soil-residue", "name": "mud and worked-soil residue", "type": "standard", "qualityTier": "utility", "shaderModel": "MeshStandardMaterial / PBR approximation", "baseColor": "#5A4230", "color": "#5A4230", "albedo": {"dominant": "#5A4230", "secondary": ["#876546", "#2E2925"], "samplingNotes": "Canonical asset definition; source pixels remain evidence, not measured truth."}, "colorVariation": {"palette": ["#5A4230", "#876546", "#2E2925"], "pattern": "localized procedural variation", "amplitude": 0.2, "heightCorrelation": 0.35}, "textureResolution": 1024, "textureProjection": {"mode": "uv", "repeat": [2, 2], "anisotropy": 8, "texelDensityIntent": "Stable object-scale detail"}, "surfaceFrequencyBands": [{"id": "macro", "frequency": 2, "amplitude": 0.42, "role": "broad breakup"}, {"id": "meso", "frequency": 12, "amplitude": 0.22, "role": "wear and seams"}, {"id": "micro", "frequency": 56, "amplitude": 0.08, "role": "grazing-light breakup"}], "roughness": {"base": 0.97, "variation": 0.12, "map": "independent-wet-dry-soil-roughness"}, "metalness": {"base": 0, "variation": 0.08}, "normal": {"pattern": "independent-soil-clump-normal", "strength": 0.38, "scale": 24, "space": "tangent"}, "bump": {"pattern": "shallow-soil-clump-height", "amplitude": 0.2, "scale": 1}, "displacement": {"pattern": "shallow-soil-clump-height", "amplitude": 0.04, "scale": 1, "silhouetteAffects": false}, "ambientOcclusion": {"cavityStrength": 0.7, "contactShadowBias": 0.35, "notes": "Independent cavity and contact response"}, "wear": {"edgeWear": 0.45, "scratches": [], "chips": []}, "dirt": {"amount": 0.9, "cavityBias": 0.7, "color": "#5A4230"}, "localOverrides": [{"id": "soil-cavity-bias", "kind": "stain", "region": "lower share recesses and backs", "affect": "darken with gravity/cavity bias"}, {"id": "wet-soil-gloss", "kind": "gloss", "region": "freshly worked lower edges", "affect": "roughness 0.62 with restrained specular response", "roughness": 0.18, "clearcoat": 0.35}], "shaderNotes": ["Keep albedo, roughness, height, normal, and AO independent.", "Do not turn visual texture into collision or gameplay authority."]},
    options
  );

  const nodes: Record<string, THREE.Object3D> = { root };
  const meshes: Record<string, THREE.Mesh> = {};
  const sockets: Record<string, THREE.Object3D> = {};
  const colliders: Record<string, unknown> = {};
  const destructionGroups: Record<string, THREE.Object3D[]> = {};

  const attachment_root_0 = null;
  // Keep attachment_root_0 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_root_0 = makeAttachmentEndpoint(null);
  const node_root_0 = new THREE.Group();
  node_root_0.name = "whole implement presentation root__pivot";
  if (endpoint_root_0) {
    node_root_0.position.copy(endpoint_root_0.start);
    node_root_0.rotation.set(0, 0, 0);
    node_root_0.scale.set(1, 1, 1);
  } else {
    node_root_0.position.set(0.0, 0.0, 0.0);
    node_root_0.rotation.set(0.0, 0.0, 0.0);
    node_root_0.scale.set(1.0, 1.0, 1.0);
  }
  node_root_0.userData.sculptComponent = {"id": "root", "name": "whole implement presentation root", "level": "macro", "semanticLevel": "macro", "role": "whole implement presentation root", "importance": 0.95, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; named child pivots and compound primitives.", "geometryDescriptor": {"topologyIntent": "named child pivots and compound primitives", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": null, "parent": null, "attachment": null, "dimensions": {"width": 3.8, "height": 1.8, "depth": 1.35, "units": "relative", "confidence": 0.3}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "whole-implement-state", "pivot": {"mode": "custom-attachment-origin", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": null, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "root-attachment-envelope", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0], "role": "adapter alignment"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned; visual mesh is not a collider"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "root", "seamRefs": ["root-edge-wear", "root-contact-shadow"], "detachableFragments": ["root"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "root-attachment-envelope", "type": "hinge-or-socket", "parent": "root"}], "seams": [], "localFeatures": ["root-edge-wear", "root-contact-shadow"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["root-edge-wear", "root-contact-shadow"], "fidelityTier": "blockout"};
  node_root_0.userData.actionProfile = {"animationRole": "whole-implement-state", "pivot": {"mode": "custom-attachment-origin", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": null, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "root-attachment-envelope", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0], "role": "adapter alignment"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned; visual mesh is not a collider"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "root", "seamRefs": ["root-edge-wear", "root-contact-shadow"], "detachableFragments": ["root"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}};
  (nodes["root"] ?? root).add(node_root_0);
  nodes["root"] = node_root_0;
  const mesh_root_0Geometry = endpoint_root_0
    ? new THREE.CylinderGeometry(endpoint_root_0.endRadius, endpoint_root_0.baseRadius, endpoint_root_0.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_root_0 = new THREE.Mesh(
    mesh_root_0Geometry,
    materialMap["painted-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_root_0.name = "whole implement presentation root";
  // Root is a runtime pivot/bounds record, not visible geometry.
  mesh_root_0.visible = false;
  if (endpoint_root_0) {
    mesh_root_0.position.copy(endpoint_root_0.midpoint);
    mesh_root_0.quaternion.copy(endpoint_root_0.quaternion);
  }
  if (!endpoint_root_0) {
    mesh_root_0.scale.set(3.8, 1.8, 1.35);
  }
  mesh_root_0.castShadow = options.castShadow ?? true;
  mesh_root_0.receiveShadow = options.receiveShadow ?? true;
  mesh_root_0.userData.sculptComponent = {"id": "root", "name": "whole implement presentation root", "level": "macro", "semanticLevel": "macro", "role": "whole implement presentation root", "importance": 0.95, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; named child pivots and compound primitives.", "geometryDescriptor": {"topologyIntent": "named child pivots and compound primitives", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": null, "parent": null, "attachment": null, "dimensions": {"width": 3.8, "height": 1.8, "depth": 1.35, "units": "relative", "confidence": 0.3}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "whole-implement-state", "pivot": {"mode": "custom-attachment-origin", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": null, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "root-attachment-envelope", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0], "role": "adapter alignment"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned; visual mesh is not a collider"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "root", "seamRefs": ["root-edge-wear", "root-contact-shadow"], "detachableFragments": ["root"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "root-attachment-envelope", "type": "hinge-or-socket", "parent": "root"}], "seams": [], "localFeatures": ["root-edge-wear", "root-contact-shadow"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["root-edge-wear", "root-contact-shadow"], "fidelityTier": "blockout"};
  node_root_0.add(mesh_root_0);
  meshes["root"] = mesh_root_0;
  colliders["root"] = {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned; visual mesh is not a collider"};
  destructionGroups["root"] ??= [];
  destructionGroups["root"].push(node_root_0);
  const socket_root_root_attachment_envelope_0 = new THREE.Object3D();
  socket_root_root_attachment_envelope_0.name = "root-attachment-envelope";
  socket_root_root_attachment_envelope_0.position.set(0.0, 0.0, 0.0);
  socket_root_root_attachment_envelope_0.rotation.set(0.0, 0.0, 0.0);
  socket_root_root_attachment_envelope_0.userData.socket = {"id": "root-attachment-envelope", "localPosition": [0, 0, 0], "localRotation": [0, 0, 0], "role": "adapter alignment"};
  node_root_0.add(socket_root_root_attachment_envelope_0);
  sockets["root:root-attachment-envelope"] = socket_root_root_attachment_envelope_0;

  const attachment_attachment_frame_1 = {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_attachment_frame_1 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_attachment_frame_1 = makeAttachmentEndpoint(null);
  const node_attachment_frame_1 = new THREE.Group();
  node_attachment_frame_1.name = "three-point attachment frame__pivot";
  if (endpoint_attachment_frame_1) {
    node_attachment_frame_1.position.copy(endpoint_attachment_frame_1.start);
    node_attachment_frame_1.rotation.set(0, 0, 0);
    node_attachment_frame_1.scale.set(1, 1, 1);
  } else {
    node_attachment_frame_1.position.set(0.0, 0.55, 0.18);
    node_attachment_frame_1.rotation.set(0.0, 0.0, 0.0);
    node_attachment_frame_1.scale.set(1.0, 1.0, 1.0);
  }
  node_attachment_frame_1.userData.sculptComponent = {"id": "attachment-frame", "name": "three-point attachment frame", "level": "macro", "semanticLevel": "macro", "role": "three-point attachment frame", "importance": 0.95, "confidence": 0.72, "primitive": "curve-sweep", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; beveled box beams and pin cylinders.", "geometryDescriptor": {"topologyIntent": "beveled box beams and pin cylinders", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "curveSweep": {"spine": [[-0.5, 0, 0], [0, 0.9, 0], [0.5, 0, 0]], "crossSection": {"points": [[-0.045, -0.045], [0.045, -0.045], [0.045, 0.045], [-0.045, 0.045]]}, "closed": false}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 1.4, "depth": 0.5, "units": "relative", "confidence": 0.5}, "transform": {"position": [0, 0.55, 0.18], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-root", "pivot": {"mode": "custom", "localPosition": [0, 0.55, 0.18], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-socket", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor upper link"}, {"id": "lower-left-hitch", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}, {"id": "lower-right-hitch", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "attachment-frame", "seamRefs": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "detachableFragments": ["attachment-frame"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "bare-steel", "rust"], "deformations": [], "joints": [{"id": "top-link-socket", "type": "hinge-or-socket", "parent": "attachment-frame"}, {"id": "lower-left-hitch", "type": "hinge-or-socket", "parent": "attachment-frame"}, {"id": "lower-right-hitch", "type": "hinge-or-socket", "parent": "attachment-frame"}], "seams": ["rust-at-pin-seams"], "localFeatures": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "fidelityTier": "blockout"};
  node_attachment_frame_1.userData.actionProfile = {"animationRole": "attachment-root", "pivot": {"mode": "custom", "localPosition": [0, 0.55, 0.18], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-socket", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor upper link"}, {"id": "lower-left-hitch", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}, {"id": "lower-right-hitch", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "attachment-frame", "seamRefs": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "detachableFragments": ["attachment-frame"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}};
  (nodes["root"] ?? root).add(node_attachment_frame_1);
  nodes["attachment-frame"] = node_attachment_frame_1;
  const mesh_attachment_frame_1Geometry = endpoint_attachment_frame_1
    ? new THREE.CylinderGeometry(endpoint_attachment_frame_1.endRadius, endpoint_attachment_frame_1.baseRadius, endpoint_attachment_frame_1.length, 32, 12)
    : buildCurveSweepGeometry({"spine": [[-0.5, 0, 0], [0, 0.9, 0], [0.5, 0, 0]], "crossSection": {"points": [[-0.045, -0.045], [0.045, -0.045], [0.045, 0.045], [-0.045, 0.045]]}, "closed": false});
  const mesh_attachment_frame_1 = new THREE.Mesh(
    mesh_attachment_frame_1Geometry,
    materialMap["painted-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_attachment_frame_1.name = "three-point attachment frame";
  if (endpoint_attachment_frame_1) {
    mesh_attachment_frame_1.position.copy(endpoint_attachment_frame_1.midpoint);
    mesh_attachment_frame_1.quaternion.copy(endpoint_attachment_frame_1.quaternion);
  }
  if (!endpoint_attachment_frame_1) {
    mesh_attachment_frame_1.scale.set(2.8, 1.4, 0.5);
  }
  mesh_attachment_frame_1.castShadow = options.castShadow ?? true;
  mesh_attachment_frame_1.receiveShadow = options.receiveShadow ?? true;
  mesh_attachment_frame_1.userData.sculptComponent = {"id": "attachment-frame", "name": "three-point attachment frame", "level": "macro", "semanticLevel": "macro", "role": "three-point attachment frame", "importance": 0.95, "confidence": 0.72, "primitive": "curve-sweep", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; beveled box beams and pin cylinders.", "geometryDescriptor": {"topologyIntent": "beveled box beams and pin cylinders", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "curveSweep": {"spine": [[-0.5, 0, 0], [0, 0.9, 0], [0.5, 0, 0]], "crossSection": {"points": [[-0.045, -0.045], [0.045, -0.045], [0.045, 0.045], [-0.045, 0.045]]}, "closed": false}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 1.4, "depth": 0.5, "units": "relative", "confidence": 0.5}, "transform": {"position": [0, 0.55, 0.18], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-root", "pivot": {"mode": "custom", "localPosition": [0, 0.55, 0.18], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.55, 0.18], "localEnd": [0, 0.65, 0.07999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-socket", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor upper link"}, {"id": "lower-left-hitch", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}, {"id": "lower-right-hitch", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "attachment-frame", "seamRefs": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "detachableFragments": ["attachment-frame"], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "bare-steel", "rust"], "deformations": [], "joints": [{"id": "top-link-socket", "type": "hinge-or-socket", "parent": "attachment-frame"}, {"id": "lower-left-hitch", "type": "hinge-or-socket", "parent": "attachment-frame"}, {"id": "lower-right-hitch", "type": "hinge-or-socket", "parent": "attachment-frame"}], "seams": ["rust-at-pin-seams"], "localFeatures": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["attachment-bevels", "hitch-fasteners", "rust-at-pin-seams"], "fidelityTier": "blockout"};
  node_attachment_frame_1.add(mesh_attachment_frame_1);
  meshes["attachment-frame"] = mesh_attachment_frame_1;
  colliders["attachment-frame"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["attachment-frame"] ??= [];
  destructionGroups["attachment-frame"].push(node_attachment_frame_1);
  const socket_attachment_frame_top_link_socket_0 = new THREE.Object3D();
  socket_attachment_frame_top_link_socket_0.name = "top-link-socket";
  socket_attachment_frame_top_link_socket_0.position.set(0.0, 1.55, 0.1);
  socket_attachment_frame_top_link_socket_0.rotation.set(0.0, 0.0, 0.0);
  socket_attachment_frame_top_link_socket_0.userData.socket = {"id": "top-link-socket", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor upper link"};
  node_attachment_frame_1.add(socket_attachment_frame_top_link_socket_0);
  sockets["attachment-frame:top-link-socket"] = socket_attachment_frame_top_link_socket_0;
  const socket_attachment_frame_lower_left_hitch_1 = new THREE.Object3D();
  socket_attachment_frame_lower_left_hitch_1.name = "lower-left-hitch";
  socket_attachment_frame_lower_left_hitch_1.position.set(-1.25, 0.55, 0.2);
  socket_attachment_frame_lower_left_hitch_1.rotation.set(0.0, 0.0, 0.0);
  socket_attachment_frame_lower_left_hitch_1.userData.socket = {"id": "lower-left-hitch", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"};
  node_attachment_frame_1.add(socket_attachment_frame_lower_left_hitch_1);
  sockets["attachment-frame:lower-left-hitch"] = socket_attachment_frame_lower_left_hitch_1;
  const socket_attachment_frame_lower_right_hitch_2 = new THREE.Object3D();
  socket_attachment_frame_lower_right_hitch_2.name = "lower-right-hitch";
  socket_attachment_frame_lower_right_hitch_2.position.set(1.25, 0.55, 0.2);
  socket_attachment_frame_lower_right_hitch_2.rotation.set(0.0, 0.0, 0.0);
  socket_attachment_frame_lower_right_hitch_2.userData.socket = {"id": "lower-right-hitch", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"};
  node_attachment_frame_1.add(socket_attachment_frame_lower_right_hitch_2);
  sockets["attachment-frame:lower-right-hitch"] = socket_attachment_frame_lower_right_hitch_2;

  const attachment_share_assembly_2 = {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_share_assembly_2 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_share_assembly_2 = makeAttachmentEndpoint(null);
  const node_share_assembly_2 = new THREE.Group();
  node_share_assembly_2.name = "soil-cutting repeated system__pivot";
  if (endpoint_share_assembly_2) {
    node_share_assembly_2.position.copy(endpoint_share_assembly_2.start);
    node_share_assembly_2.rotation.set(0, 0, 0);
    node_share_assembly_2.scale.set(1, 1, 1);
  } else {
    node_share_assembly_2.position.set(0.0, 0.2, -0.5);
    node_share_assembly_2.rotation.set(0.0, 0.0, 0.0);
    node_share_assembly_2.scale.set(1.0, 1.0, 1.0);
  }
  node_share_assembly_2.userData.sculptComponent = {"id": "share-assembly", "name": "soil-cutting repeated system", "level": "macro", "semanticLevel": "macro", "role": "soil-cutting repeated system", "importance": 0.95, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; four handed helicoidal moldboard shells with section-by-section twist, depth staggering, and integrated forward cutting-share transitions.", "geometryDescriptor": {"topologyIntent": "four handed helicoidal moldboard shells with section-by-section twist, depth staggering, and integrated forward cutting-share transitions", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 3.4, "height": 1.1, "depth": 1, "units": "relative", "confidence": 0.55}, "transform": {"position": [0, 0.2, -0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "lowered-tool", "pivot": {"mode": "base-row", "localPosition": [0, 0.2, -0.5], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "soil-contact-row", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "terrain contact envelope"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-assembly", "seamRefs": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "detachableFragments": ["share-assembly"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "painted-steel", "soil-residue"], "deformations": [], "joints": [{"id": "soil-contact-row", "type": "hinge-or-socket", "parent": "share-assembly"}], "seams": [], "localFeatures": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "fidelityTier": "blockout"};
  node_share_assembly_2.userData.actionProfile = {"animationRole": "lowered-tool", "pivot": {"mode": "base-row", "localPosition": [0, 0.2, -0.5], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "soil-contact-row", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "terrain contact envelope"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-assembly", "seamRefs": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "detachableFragments": ["share-assembly"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_share_assembly_2);
  nodes["share-assembly"] = node_share_assembly_2;
  const mesh_share_assembly_2Geometry = endpoint_share_assembly_2
    ? new THREE.CylinderGeometry(endpoint_share_assembly_2.endRadius, endpoint_share_assembly_2.baseRadius, endpoint_share_assembly_2.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24});
  const mesh_share_assembly_2 = new THREE.Mesh(
    mesh_share_assembly_2Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_share_assembly_2.name = "soil-cutting repeated system";
  if (endpoint_share_assembly_2) {
    mesh_share_assembly_2.position.copy(endpoint_share_assembly_2.midpoint);
    mesh_share_assembly_2.quaternion.copy(endpoint_share_assembly_2.quaternion);
  }
  if (!endpoint_share_assembly_2) {
    mesh_share_assembly_2.scale.set(3.4, 1.1, 1.0);
  }
  mesh_share_assembly_2.castShadow = options.castShadow ?? true;
  mesh_share_assembly_2.receiveShadow = options.receiveShadow ?? true;
  mesh_share_assembly_2.userData.sculptComponent = {"id": "share-assembly", "name": "soil-cutting repeated system", "level": "macro", "semanticLevel": "macro", "role": "soil-cutting repeated system", "importance": 0.95, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; four handed helicoidal moldboard shells with section-by-section twist, depth staggering, and integrated forward cutting-share transitions.", "geometryDescriptor": {"topologyIntent": "four handed helicoidal moldboard shells with section-by-section twist, depth staggering, and integrated forward cutting-share transitions", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 3.4, "height": 1.1, "depth": 1, "units": "relative", "confidence": 0.55}, "transform": {"position": [0, 0.2, -0.5], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "lowered-tool", "pivot": {"mode": "base-row", "localPosition": [0, 0.2, -0.5], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.2, -0.5], "localEnd": [0, 0.30000000000000004, -0.6], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "soil-contact-row", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "terrain contact envelope"}], "collider": {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-assembly", "seamRefs": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "detachableFragments": ["share-assembly"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "painted-steel", "soil-residue"], "deformations": [], "joints": [{"id": "soil-contact-row", "type": "hinge-or-socket", "parent": "share-assembly"}], "seams": [], "localFeatures": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-curvature", "cutting-edge-bevel", "soil-cavity-residue"], "fidelityTier": "blockout"};
  node_share_assembly_2.add(mesh_share_assembly_2);
  meshes["share-assembly"] = mesh_share_assembly_2;
  colliders["share-assembly"] = {"type": "compound-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"};
  destructionGroups["share-assembly"] ??= [];
  destructionGroups["share-assembly"].push(node_share_assembly_2);
  const socket_share_assembly_soil_contact_row_0 = new THREE.Object3D();
  socket_share_assembly_soil_contact_row_0.name = "soil-contact-row";
  socket_share_assembly_soil_contact_row_0.position.set(0.0, -0.65, -0.9);
  socket_share_assembly_soil_contact_row_0.rotation.set(0.0, 0.0, 0.0);
  socket_share_assembly_soil_contact_row_0.userData.socket = {"id": "soil-contact-row", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "terrain contact envelope"};
  node_share_assembly_2.add(socket_share_assembly_soil_contact_row_0);
  sockets["share-assembly:soil-contact-row"] = socket_share_assembly_soil_contact_row_0;

  const attachment_hydraulic_ram_3 = {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_hydraulic_ram_3 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_hydraulic_ram_3 = makeAttachmentEndpoint(null);
  const node_hydraulic_ram_3 = new THREE.Group();
  node_hydraulic_ram_3.name = "raise/lower actuator__pivot";
  if (endpoint_hydraulic_ram_3) {
    node_hydraulic_ram_3.position.copy(endpoint_hydraulic_ram_3.start);
    node_hydraulic_ram_3.rotation.set(0, 0, 0);
    node_hydraulic_ram_3.scale.set(1, 1, 1);
  } else {
    node_hydraulic_ram_3.position.set(0.0, 0.95, 0.12);
    node_hydraulic_ram_3.rotation.set(0.0, 0.0, 0.0);
    node_hydraulic_ram_3.scale.set(1.0, 1.0, 1.0);
  }
  node_hydraulic_ram_3.userData.sculptComponent = {"id": "hydraulic-ram", "name": "raise/lower actuator", "level": "meso", "semanticLevel": "meso", "role": "raise/lower actuator", "importance": 0.8, "confidence": 0.72, "primitive": "tube", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; cylinders, tube, and hinge pin.", "geometryDescriptor": {"topologyIntent": "cylinders, tube, and hinge pin", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "tubePath": {"points": [[0, 0, 0], [0, 0.7, 0]], "radius": 0.5, "radialSegments": 16, "closed": false}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.9, "height": 0.2, "depth": 0.2, "units": "relative", "confidence": 0.4}, "transform": {"position": [0, 0.95, 0.12], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "linear-actuator", "pivot": {"mode": "hinge", "localPosition": [0, 0.95, 0.12], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "hydraulic-upper-eye", "localPosition": [0, 1.18, 0.12], "localRotation": [0, 0, 0], "role": "frame hinge"}, {"id": "hydraulic-lower-eye", "localPosition": [0, 0.45, -0.35], "localRotation": [0, 0, 0], "role": "beam hinge"}], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "retracted", "source": "canonical asset definition"}, {"state": "extended", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "hydraulic-ram", "seamRefs": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "detachableFragments": ["hydraulic-ram"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "hydraulic-upper-eye", "type": "hinge-or-socket", "parent": "hydraulic-ram"}, {"id": "hydraulic-lower-eye", "type": "hinge-or-socket", "parent": "hydraulic-ram"}], "seams": ["ram-rust-collar"], "localFeatures": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "fidelityTier": "structural"};
  node_hydraulic_ram_3.userData.actionProfile = {"animationRole": "linear-actuator", "pivot": {"mode": "hinge", "localPosition": [0, 0.95, 0.12], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "hydraulic-upper-eye", "localPosition": [0, 1.18, 0.12], "localRotation": [0, 0, 0], "role": "frame hinge"}, {"id": "hydraulic-lower-eye", "localPosition": [0, 0.45, -0.35], "localRotation": [0, 0, 0], "role": "beam hinge"}], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "retracted", "source": "canonical asset definition"}, {"state": "extended", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "hydraulic-ram", "seamRefs": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "detachableFragments": ["hydraulic-ram"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_hydraulic_ram_3);
  nodes["hydraulic-ram"] = node_hydraulic_ram_3;
  const mesh_hydraulic_ram_3Geometry = endpoint_hydraulic_ram_3
    ? new THREE.CylinderGeometry(endpoint_hydraulic_ram_3.endRadius, endpoint_hydraulic_ram_3.baseRadius, endpoint_hydraulic_ram_3.length, 32, 12)
    : buildTubeGeometry({"points": [[0, 0, 0], [0, 0.7, 0]], "radius": 0.5, "radialSegments": 16, "closed": false});
  const mesh_hydraulic_ram_3 = new THREE.Mesh(
    mesh_hydraulic_ram_3Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_hydraulic_ram_3.name = "raise/lower actuator";
  if (endpoint_hydraulic_ram_3) {
    mesh_hydraulic_ram_3.position.copy(endpoint_hydraulic_ram_3.midpoint);
    mesh_hydraulic_ram_3.quaternion.copy(endpoint_hydraulic_ram_3.quaternion);
  }
  if (!endpoint_hydraulic_ram_3) {
    mesh_hydraulic_ram_3.scale.set(0.9, 0.2, 0.2);
  }
  mesh_hydraulic_ram_3.castShadow = options.castShadow ?? true;
  mesh_hydraulic_ram_3.receiveShadow = options.receiveShadow ?? true;
  mesh_hydraulic_ram_3.userData.sculptComponent = {"id": "hydraulic-ram", "name": "raise/lower actuator", "level": "meso", "semanticLevel": "meso", "role": "raise/lower actuator", "importance": 0.8, "confidence": 0.72, "primitive": "tube", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; cylinders, tube, and hinge pin.", "geometryDescriptor": {"topologyIntent": "cylinders, tube, and hinge pin", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "tubePath": {"points": [[0, 0, 0], [0, 0.7, 0]], "radius": 0.5, "radialSegments": 16, "closed": false}}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.9, "height": 0.2, "depth": 0.2, "units": "relative", "confidence": 0.4}, "transform": {"position": [0, 0.95, 0.12], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "linear-actuator", "pivot": {"mode": "hinge", "localPosition": [0, 0.95, 0.12], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0.95, 0.12], "localEnd": [0, 1.05, 0.01999999999999999], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "hydraulic-upper-eye", "localPosition": [0, 1.18, 0.12], "localRotation": [0, 0, 0], "role": "frame hinge"}, {"id": "hydraulic-lower-eye", "localPosition": [0, 0.45, -0.35], "localRotation": [0, 0, 0], "role": "beam hinge"}], "collider": {"type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "retracted", "source": "canonical asset definition"}, {"state": "extended", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "hydraulic-ram", "seamRefs": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "detachableFragments": ["hydraulic-ram"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "hydraulic-upper-eye", "type": "hinge-or-socket", "parent": "hydraulic-ram"}, {"id": "hydraulic-lower-eye", "type": "hinge-or-socket", "parent": "hydraulic-ram"}], "seams": ["ram-rust-collar"], "localFeatures": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["ram-polished-rod", "ram-rust-collar", "ram-pivot-pin"], "fidelityTier": "structural"};
  node_hydraulic_ram_3.add(mesh_hydraulic_ram_3);
  meshes["hydraulic-ram"] = mesh_hydraulic_ram_3;
  colliders["hydraulic-ram"] = {"type": "capsule", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["hydraulic-ram"] ??= [];
  destructionGroups["hydraulic-ram"].push(node_hydraulic_ram_3);
  const socket_hydraulic_ram_hydraulic_upper_eye_0 = new THREE.Object3D();
  socket_hydraulic_ram_hydraulic_upper_eye_0.name = "hydraulic-upper-eye";
  socket_hydraulic_ram_hydraulic_upper_eye_0.position.set(0.0, 1.18, 0.12);
  socket_hydraulic_ram_hydraulic_upper_eye_0.rotation.set(0.0, 0.0, 0.0);
  socket_hydraulic_ram_hydraulic_upper_eye_0.userData.socket = {"id": "hydraulic-upper-eye", "localPosition": [0, 1.18, 0.12], "localRotation": [0, 0, 0], "role": "frame hinge"};
  node_hydraulic_ram_3.add(socket_hydraulic_ram_hydraulic_upper_eye_0);
  sockets["hydraulic-ram:hydraulic-upper-eye"] = socket_hydraulic_ram_hydraulic_upper_eye_0;
  const socket_hydraulic_ram_hydraulic_lower_eye_1 = new THREE.Object3D();
  socket_hydraulic_ram_hydraulic_lower_eye_1.name = "hydraulic-lower-eye";
  socket_hydraulic_ram_hydraulic_lower_eye_1.position.set(0.0, 0.45, -0.35);
  socket_hydraulic_ram_hydraulic_lower_eye_1.rotation.set(0.0, 0.0, 0.0);
  socket_hydraulic_ram_hydraulic_lower_eye_1.userData.socket = {"id": "hydraulic-lower-eye", "localPosition": [0, 0.45, -0.35], "localRotation": [0, 0, 0], "role": "beam hinge"};
  node_hydraulic_ram_3.add(socket_hydraulic_ram_hydraulic_lower_eye_1);
  sockets["hydraulic-ram:hydraulic-lower-eye"] = socket_hydraulic_ram_hydraulic_lower_eye_1;

  const attachment_top_link_bracket_4 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_top_link_bracket_4 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_top_link_bracket_4 = makeAttachmentEndpoint(null);
  const node_top_link_bracket_4 = new THREE.Group();
  node_top_link_bracket_4.name = "upper hitch bracket__pivot";
  if (endpoint_top_link_bracket_4) {
    node_top_link_bracket_4.position.copy(endpoint_top_link_bracket_4.start);
    node_top_link_bracket_4.rotation.set(0, 0, 0);
    node_top_link_bracket_4.scale.set(1, 1, 1);
  } else {
    node_top_link_bracket_4.position.set(0.0, 1.5, 0.1);
    node_top_link_bracket_4.rotation.set(0.0, 0.0, 0.0);
    node_top_link_bracket_4.scale.set(1.0, 1.0, 1.0);
  }
  node_top_link_bracket_4.userData.sculptComponent = {"id": "top-link-bracket", "name": "upper hitch bracket", "level": "meso", "semanticLevel": "meso", "role": "upper hitch bracket", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.8, "height": 0.3, "depth": 0.28, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 1.5, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "hinged-attachment", "pivot": {"mode": "hinge", "localPosition": [0, 1.5, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-contact", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor top-link contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "top-link-bracket", "seamRefs": ["top-link-pin", "top-link-bevel"], "detachableFragments": ["top-link-bracket"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "top-link-contact", "type": "hinge-or-socket", "parent": "top-link-bracket"}], "seams": [], "localFeatures": ["top-link-pin", "top-link-bevel"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["top-link-pin", "top-link-bevel"], "fidelityTier": "structural"};
  node_top_link_bracket_4.userData.actionProfile = {"animationRole": "hinged-attachment", "pivot": {"mode": "hinge", "localPosition": [0, 1.5, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-contact", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor top-link contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "top-link-bracket", "seamRefs": ["top-link-pin", "top-link-bevel"], "detachableFragments": ["top-link-bracket"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_top_link_bracket_4);
  nodes["top-link-bracket"] = node_top_link_bracket_4;
  const mesh_top_link_bracket_4Geometry = endpoint_top_link_bracket_4
    ? new THREE.CylinderGeometry(endpoint_top_link_bracket_4.endRadius, endpoint_top_link_bracket_4.baseRadius, endpoint_top_link_bracket_4.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  const mesh_top_link_bracket_4 = new THREE.Mesh(
    mesh_top_link_bracket_4Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_top_link_bracket_4.name = "upper hitch bracket";
  if (endpoint_top_link_bracket_4) {
    mesh_top_link_bracket_4.position.copy(endpoint_top_link_bracket_4.midpoint);
    mesh_top_link_bracket_4.quaternion.copy(endpoint_top_link_bracket_4.quaternion);
  }
  if (!endpoint_top_link_bracket_4) {
    mesh_top_link_bracket_4.scale.set(0.8, 0.3, 0.28);
  }
  mesh_top_link_bracket_4.castShadow = options.castShadow ?? true;
  mesh_top_link_bracket_4.receiveShadow = options.receiveShadow ?? true;
  mesh_top_link_bracket_4.userData.sculptComponent = {"id": "top-link-bracket", "name": "upper hitch bracket", "level": "meso", "semanticLevel": "meso", "role": "upper hitch bracket", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.8, "height": 0.3, "depth": 0.28, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 1.5, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "hinged-attachment", "pivot": {"mode": "hinge", "localPosition": [0, 1.5, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 1.5, 0.1], "localEnd": [0, 1.6, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "top-link-contact", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor top-link contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "top-link-bracket", "seamRefs": ["top-link-pin", "top-link-bevel"], "detachableFragments": ["top-link-bracket"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "top-link-contact", "type": "hinge-or-socket", "parent": "top-link-bracket"}], "seams": [], "localFeatures": ["top-link-pin", "top-link-bevel"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["top-link-pin", "top-link-bevel"], "fidelityTier": "structural"};
  node_top_link_bracket_4.add(mesh_top_link_bracket_4);
  meshes["top-link-bracket"] = mesh_top_link_bracket_4;
  colliders["top-link-bracket"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["top-link-bracket"] ??= [];
  destructionGroups["top-link-bracket"].push(node_top_link_bracket_4);
  const socket_top_link_bracket_top_link_contact_0 = new THREE.Object3D();
  socket_top_link_bracket_top_link_contact_0.name = "top-link-contact";
  socket_top_link_bracket_top_link_contact_0.position.set(0.0, 1.55, 0.1);
  socket_top_link_bracket_top_link_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_top_link_bracket_top_link_contact_0.userData.socket = {"id": "top-link-contact", "localPosition": [0, 1.55, 0.1], "localRotation": [0, 0, 0], "role": "tractor top-link contact"};
  node_top_link_bracket_4.add(socket_top_link_bracket_top_link_contact_0);
  sockets["top-link-bracket:top-link-contact"] = socket_top_link_bracket_top_link_contact_0;

  const attachment_lower_left_hitch_5 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_lower_left_hitch_5 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_lower_left_hitch_5 = makeAttachmentEndpoint(null);
  const node_lower_left_hitch_5 = new THREE.Group();
  node_lower_left_hitch_5.name = "left lower hitch clevis__pivot";
  if (endpoint_lower_left_hitch_5) {
    node_lower_left_hitch_5.position.copy(endpoint_lower_left_hitch_5.start);
    node_lower_left_hitch_5.rotation.set(0, 0, 0);
    node_lower_left_hitch_5.scale.set(1, 1, 1);
  } else {
    node_lower_left_hitch_5.position.set(-1.25, 0.55, 0.2);
    node_lower_left_hitch_5.rotation.set(0.0, 0.0, 0.0);
    node_lower_left_hitch_5.scale.set(1.0, 1.0, 1.0);
  }
  node_lower_left_hitch_5.userData.sculptComponent = {"id": "lower-left-hitch", "name": "left lower hitch clevis", "level": "meso", "semanticLevel": "meso", "role": "left lower hitch clevis", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.3, "height": 0.5, "depth": 0.38, "units": "relative", "confidence": 0.35}, "transform": {"position": [-1.25, 0.55, 0.2], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [-1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-left-contact", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-left-hitch", "seamRefs": ["left-clevis-pin", "left-clevis-wear"], "detachableFragments": ["lower-left-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "lower-left-contact", "type": "hinge-or-socket", "parent": "lower-left-hitch"}], "seams": [], "localFeatures": ["left-clevis-pin", "left-clevis-wear"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["left-clevis-pin", "left-clevis-wear"], "fidelityTier": "structural"};
  node_lower_left_hitch_5.userData.actionProfile = {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [-1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-left-contact", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-left-hitch", "seamRefs": ["left-clevis-pin", "left-clevis-wear"], "detachableFragments": ["lower-left-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_lower_left_hitch_5);
  nodes["lower-left-hitch"] = node_lower_left_hitch_5;
  const mesh_lower_left_hitch_5Geometry = endpoint_lower_left_hitch_5
    ? new THREE.CylinderGeometry(endpoint_lower_left_hitch_5.endRadius, endpoint_lower_left_hitch_5.baseRadius, endpoint_lower_left_hitch_5.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  const mesh_lower_left_hitch_5 = new THREE.Mesh(
    mesh_lower_left_hitch_5Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_lower_left_hitch_5.name = "left lower hitch clevis";
  if (endpoint_lower_left_hitch_5) {
    mesh_lower_left_hitch_5.position.copy(endpoint_lower_left_hitch_5.midpoint);
    mesh_lower_left_hitch_5.quaternion.copy(endpoint_lower_left_hitch_5.quaternion);
  }
  if (!endpoint_lower_left_hitch_5) {
    mesh_lower_left_hitch_5.scale.set(0.3, 0.5, 0.38);
  }
  mesh_lower_left_hitch_5.castShadow = options.castShadow ?? true;
  mesh_lower_left_hitch_5.receiveShadow = options.receiveShadow ?? true;
  mesh_lower_left_hitch_5.userData.sculptComponent = {"id": "lower-left-hitch", "name": "left lower hitch clevis", "level": "meso", "semanticLevel": "meso", "role": "left lower hitch clevis", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.3, "height": 0.5, "depth": 0.38, "units": "relative", "confidence": 0.35}, "transform": {"position": [-1.25, 0.55, 0.2], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [-1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-1.25, 0.55, 0.2], "localEnd": [-1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-left-contact", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-left-hitch", "seamRefs": ["left-clevis-pin", "left-clevis-wear"], "detachableFragments": ["lower-left-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "lower-left-contact", "type": "hinge-or-socket", "parent": "lower-left-hitch"}], "seams": [], "localFeatures": ["left-clevis-pin", "left-clevis-wear"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["left-clevis-pin", "left-clevis-wear"], "fidelityTier": "structural"};
  node_lower_left_hitch_5.add(mesh_lower_left_hitch_5);
  meshes["lower-left-hitch"] = mesh_lower_left_hitch_5;
  colliders["lower-left-hitch"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["lower-left-hitch"] ??= [];
  destructionGroups["lower-left-hitch"].push(node_lower_left_hitch_5);
  const socket_lower_left_hitch_lower_left_contact_0 = new THREE.Object3D();
  socket_lower_left_hitch_lower_left_contact_0.name = "lower-left-contact";
  socket_lower_left_hitch_lower_left_contact_0.position.set(-1.25, 0.55, 0.2);
  socket_lower_left_hitch_lower_left_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_lower_left_hitch_lower_left_contact_0.userData.socket = {"id": "lower-left-contact", "localPosition": [-1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"};
  node_lower_left_hitch_5.add(socket_lower_left_hitch_lower_left_contact_0);
  sockets["lower-left-hitch:lower-left-contact"] = socket_lower_left_hitch_lower_left_contact_0;

  const attachment_lower_right_hitch_6 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_lower_right_hitch_6 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_lower_right_hitch_6 = makeAttachmentEndpoint(null);
  const node_lower_right_hitch_6 = new THREE.Group();
  node_lower_right_hitch_6.name = "right lower hitch clevis__pivot";
  if (endpoint_lower_right_hitch_6) {
    node_lower_right_hitch_6.position.copy(endpoint_lower_right_hitch_6.start);
    node_lower_right_hitch_6.rotation.set(0, 0, 0);
    node_lower_right_hitch_6.scale.set(1, 1, 1);
  } else {
    node_lower_right_hitch_6.position.set(1.25, 0.55, 0.2);
    node_lower_right_hitch_6.rotation.set(0.0, 0.0, 0.0);
    node_lower_right_hitch_6.scale.set(1.0, 1.0, 1.0);
  }
  node_lower_right_hitch_6.userData.sculptComponent = {"id": "lower-right-hitch", "name": "right lower hitch clevis", "level": "meso", "semanticLevel": "meso", "role": "right lower hitch clevis", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.3, "height": 0.5, "depth": 0.38, "units": "relative", "confidence": 0.35}, "transform": {"position": [1.25, 0.55, 0.2], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-right-contact", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-right-hitch", "seamRefs": ["right-clevis-pin", "right-clevis-wear"], "detachableFragments": ["lower-right-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "lower-right-contact", "type": "hinge-or-socket", "parent": "lower-right-hitch"}], "seams": [], "localFeatures": ["right-clevis-pin", "right-clevis-wear"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["right-clevis-pin", "right-clevis-wear"], "fidelityTier": "structural"};
  node_lower_right_hitch_6.userData.actionProfile = {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-right-contact", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-right-hitch", "seamRefs": ["right-clevis-pin", "right-clevis-wear"], "detachableFragments": ["lower-right-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_lower_right_hitch_6);
  nodes["lower-right-hitch"] = node_lower_right_hitch_6;
  const mesh_lower_right_hitch_6Geometry = endpoint_lower_right_hitch_6
    ? new THREE.CylinderGeometry(endpoint_lower_right_hitch_6.endRadius, endpoint_lower_right_hitch_6.baseRadius, endpoint_lower_right_hitch_6.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  const mesh_lower_right_hitch_6 = new THREE.Mesh(
    mesh_lower_right_hitch_6Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_lower_right_hitch_6.name = "right lower hitch clevis";
  if (endpoint_lower_right_hitch_6) {
    mesh_lower_right_hitch_6.position.copy(endpoint_lower_right_hitch_6.midpoint);
    mesh_lower_right_hitch_6.quaternion.copy(endpoint_lower_right_hitch_6.quaternion);
  }
  if (!endpoint_lower_right_hitch_6) {
    mesh_lower_right_hitch_6.scale.set(0.3, 0.5, 0.38);
  }
  mesh_lower_right_hitch_6.castShadow = options.castShadow ?? true;
  mesh_lower_right_hitch_6.receiveShadow = options.receiveShadow ?? true;
  mesh_lower_right_hitch_6.userData.sculptComponent = {"id": "lower-right-hitch", "name": "right lower hitch clevis", "level": "meso", "semanticLevel": "meso", "role": "right lower hitch clevis", "importance": 0.8, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; paired plates and pin cylinder.", "geometryDescriptor": {"topologyIntent": "paired plates and pin cylinder", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.3, "height": 0.5, "depth": 0.38, "units": "relative", "confidence": 0.35}, "transform": {"position": [1.25, 0.55, 0.2], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "attachment-clevis", "pivot": {"mode": "hinge", "localPosition": [1.25, 0.55, 0.2], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [1.25, 0.55, 0.2], "localEnd": [1.25, 0.65, 0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "lower-right-contact", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "attached", "source": "canonical asset definition"}, {"state": "detached", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "lower-right-hitch", "seamRefs": ["right-clevis-pin", "right-clevis-wear"], "detachableFragments": ["lower-right-hitch"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [{"id": "lower-right-contact", "type": "hinge-or-socket", "parent": "lower-right-hitch"}], "seams": [], "localFeatures": ["right-clevis-pin", "right-clevis-wear"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["right-clevis-pin", "right-clevis-wear"], "fidelityTier": "structural"};
  node_lower_right_hitch_6.add(mesh_lower_right_hitch_6);
  meshes["lower-right-hitch"] = mesh_lower_right_hitch_6;
  colliders["lower-right-hitch"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["lower-right-hitch"] ??= [];
  destructionGroups["lower-right-hitch"].push(node_lower_right_hitch_6);
  const socket_lower_right_hitch_lower_right_contact_0 = new THREE.Object3D();
  socket_lower_right_hitch_lower_right_contact_0.name = "lower-right-contact";
  socket_lower_right_hitch_lower_right_contact_0.position.set(1.25, 0.55, 0.2);
  socket_lower_right_hitch_lower_right_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_lower_right_hitch_lower_right_contact_0.userData.socket = {"id": "lower-right-contact", "localPosition": [1.25, 0.55, 0.2], "localRotation": [0, 0, 0], "role": "tractor lower link"};
  node_lower_right_hitch_6.add(socket_lower_right_hitch_lower_right_contact_0);
  sockets["lower-right-hitch:lower-right-contact"] = socket_lower_right_hitch_lower_right_contact_0;

  const attachment_cross_beam_7 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_cross_beam_7 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_cross_beam_7 = makeAttachmentEndpoint(null);
  const node_cross_beam_7 = new THREE.Group();
  node_cross_beam_7.name = "horizontal load beam__pivot";
  if (endpoint_cross_beam_7) {
    node_cross_beam_7.position.copy(endpoint_cross_beam_7.start);
    node_cross_beam_7.rotation.set(0, 0, 0);
    node_cross_beam_7.scale.set(1, 1, 1);
  } else {
    node_cross_beam_7.position.set(0.0, 0.75, -0.15);
    node_cross_beam_7.rotation.set(0.0, 0.0, 0.0);
    node_cross_beam_7.scale.set(1.0, 1.0, 1.0);
  }
  node_cross_beam_7.userData.sculptComponent = {"id": "cross-beam", "name": "horizontal load beam", "level": "meso", "semanticLevel": "meso", "role": "horizontal load beam", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; beveled box beam with end plates.", "geometryDescriptor": {"topologyIntent": "beveled box beam with end plates", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 3, "height": 0.28, "depth": 0.3, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0.75, -0.15], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "beam-body", "pivot": {"mode": "fixed", "localPosition": [0, 0.75, -0.15], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "share-row-mount", "localPosition": [0, 0.3, -0.5], "localRotation": [0, 0, 0], "role": "share support row"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "cross-beam", "seamRefs": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "share-row-mount", "type": "hinge-or-socket", "parent": "cross-beam"}], "seams": ["beam-rust-streaks"], "localFeatures": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "fidelityTier": "structural"};
  node_cross_beam_7.userData.actionProfile = {"animationRole": "beam-body", "pivot": {"mode": "fixed", "localPosition": [0, 0.75, -0.15], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "share-row-mount", "localPosition": [0, 0.3, -0.5], "localRotation": [0, 0, 0], "role": "share support row"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "cross-beam", "seamRefs": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}};
  (nodes["root"] ?? root).add(node_cross_beam_7);
  nodes["cross-beam"] = node_cross_beam_7;
  const mesh_cross_beam_7Geometry = endpoint_cross_beam_7
    ? new THREE.CylinderGeometry(endpoint_cross_beam_7.endRadius, endpoint_cross_beam_7.baseRadius, endpoint_cross_beam_7.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_cross_beam_7 = new THREE.Mesh(
    mesh_cross_beam_7Geometry,
    materialMap["painted-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_cross_beam_7.name = "horizontal load beam";
  if (endpoint_cross_beam_7) {
    mesh_cross_beam_7.position.copy(endpoint_cross_beam_7.midpoint);
    mesh_cross_beam_7.quaternion.copy(endpoint_cross_beam_7.quaternion);
  }
  if (!endpoint_cross_beam_7) {
    mesh_cross_beam_7.scale.set(3.0, 0.28, 0.3);
  }
  mesh_cross_beam_7.castShadow = options.castShadow ?? true;
  mesh_cross_beam_7.receiveShadow = options.receiveShadow ?? true;
  mesh_cross_beam_7.userData.sculptComponent = {"id": "cross-beam", "name": "horizontal load beam", "level": "meso", "semanticLevel": "meso", "role": "horizontal load beam", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; beveled box beam with end plates.", "geometryDescriptor": {"topologyIntent": "beveled box beam with end plates", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 3, "height": 0.28, "depth": 0.3, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0.75, -0.15], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "beam-body", "pivot": {"mode": "fixed", "localPosition": [0, 0.75, -0.15], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0, 0.75, -0.15], "localEnd": [0, 0.85, -0.25], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "share-row-mount", "localPosition": [0, 0.3, -0.5], "localRotation": [0, 0, 0], "role": "share support row"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "cross-beam", "seamRefs": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "share-row-mount", "type": "hinge-or-socket", "parent": "cross-beam"}], "seams": ["beam-rust-streaks"], "localFeatures": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["beam-edge-bevel", "beam-rust-streaks", "beam-fastener-row"], "fidelityTier": "structural"};
  node_cross_beam_7.add(mesh_cross_beam_7);
  meshes["cross-beam"] = mesh_cross_beam_7;
  colliders["cross-beam"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["cross-beam"] ??= [];
  destructionGroups["cross-beam"].push(node_cross_beam_7);
  const socket_cross_beam_share_row_mount_0 = new THREE.Object3D();
  socket_cross_beam_share_row_mount_0.name = "share-row-mount";
  socket_cross_beam_share_row_mount_0.position.set(0.0, 0.3, -0.5);
  socket_cross_beam_share_row_mount_0.rotation.set(0.0, 0.0, 0.0);
  socket_cross_beam_share_row_mount_0.userData.socket = {"id": "share-row-mount", "localPosition": [0, 0.3, -0.5], "localRotation": [0, 0, 0], "role": "share support row"};
  node_cross_beam_7.add(socket_cross_beam_share_row_mount_0);
  sockets["cross-beam:share-row-mount"] = socket_cross_beam_share_row_mount_0;

  const attachment_brace_left_8 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_brace_left_8 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_brace_left_8 = makeAttachmentEndpoint(null);
  const node_brace_left_8 = new THREE.Group();
  node_brace_left_8.name = "left triangular reinforcement__pivot";
  if (endpoint_brace_left_8) {
    node_brace_left_8.position.copy(endpoint_brace_left_8.start);
    node_brace_left_8.rotation.set(0, 0, 0);
    node_brace_left_8.scale.set(1, 1, 1);
  } else {
    node_brace_left_8.position.set(-0.75, 0.75, 0.1);
    node_brace_left_8.rotation.set(0.0, 0.0, 0.0);
    node_brace_left_8.scale.set(1.0, 1.0, 1.0);
  }
  node_brace_left_8.userData.sculptComponent = {"id": "brace-left", "name": "left triangular reinforcement", "level": "meso", "semanticLevel": "meso", "role": "left triangular reinforcement", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; endpoint-aligned beveled beam.", "geometryDescriptor": {"topologyIntent": "endpoint-aligned beveled beam", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 1, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [-0.75, 0.75, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [-0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-left-root", "localPosition": [-0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-left", "seamRefs": ["left-brace-bevel", "left-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "brace-left-root", "type": "hinge-or-socket", "parent": "brace-left"}], "seams": ["left-brace-rust"], "localFeatures": ["left-brace-bevel", "left-brace-rust"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["left-brace-bevel", "left-brace-rust"], "fidelityTier": "structural"};
  node_brace_left_8.userData.actionProfile = {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [-0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-left-root", "localPosition": [-0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-left", "seamRefs": ["left-brace-bevel", "left-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}};
  (nodes["root"] ?? root).add(node_brace_left_8);
  nodes["brace-left"] = node_brace_left_8;
  const mesh_brace_left_8Geometry = endpoint_brace_left_8
    ? new THREE.CylinderGeometry(endpoint_brace_left_8.endRadius, endpoint_brace_left_8.baseRadius, endpoint_brace_left_8.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_brace_left_8 = new THREE.Mesh(
    mesh_brace_left_8Geometry,
    materialMap["painted-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_brace_left_8.name = "left triangular reinforcement";
  if (endpoint_brace_left_8) {
    mesh_brace_left_8.position.copy(endpoint_brace_left_8.midpoint);
    mesh_brace_left_8.quaternion.copy(endpoint_brace_left_8.quaternion);
  }
  if (!endpoint_brace_left_8) {
    mesh_brace_left_8.scale.set(0.16, 1.0, 0.16);
  }
  mesh_brace_left_8.castShadow = options.castShadow ?? true;
  mesh_brace_left_8.receiveShadow = options.receiveShadow ?? true;
  mesh_brace_left_8.userData.sculptComponent = {"id": "brace-left", "name": "left triangular reinforcement", "level": "meso", "semanticLevel": "meso", "role": "left triangular reinforcement", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; endpoint-aligned beveled beam.", "geometryDescriptor": {"topologyIntent": "endpoint-aligned beveled beam", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 1, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [-0.75, 0.75, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [-0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [-0.75, 0.75, 0.1], "localEnd": [-0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-left-root", "localPosition": [-0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-left", "seamRefs": ["left-brace-bevel", "left-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "brace-left-root", "type": "hinge-or-socket", "parent": "brace-left"}], "seams": ["left-brace-rust"], "localFeatures": ["left-brace-bevel", "left-brace-rust"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["left-brace-bevel", "left-brace-rust"], "fidelityTier": "structural"};
  node_brace_left_8.add(mesh_brace_left_8);
  meshes["brace-left"] = mesh_brace_left_8;
  colliders["brace-left"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["brace-left"] ??= [];
  destructionGroups["brace-left"].push(node_brace_left_8);
  const socket_brace_left_brace_left_root_0 = new THREE.Object3D();
  socket_brace_left_brace_left_root_0.name = "brace-left-root";
  socket_brace_left_brace_left_root_0.position.set(-0.75, 0.75, 0.1);
  socket_brace_left_brace_left_root_0.rotation.set(0.0, 0.0, 0.0);
  socket_brace_left_brace_left_root_0.userData.socket = {"id": "brace-left-root", "localPosition": [-0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"};
  node_brace_left_8.add(socket_brace_left_brace_left_root_0);
  sockets["brace-left:brace-left-root"] = socket_brace_left_brace_left_root_0;

  const attachment_brace_right_9 = {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_brace_right_9 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_brace_right_9 = makeAttachmentEndpoint(null);
  const node_brace_right_9 = new THREE.Group();
  node_brace_right_9.name = "right triangular reinforcement__pivot";
  if (endpoint_brace_right_9) {
    node_brace_right_9.position.copy(endpoint_brace_right_9.start);
    node_brace_right_9.rotation.set(0, 0, 0);
    node_brace_right_9.scale.set(1, 1, 1);
  } else {
    node_brace_right_9.position.set(0.75, 0.75, 0.1);
    node_brace_right_9.rotation.set(0.0, 0.0, 0.0);
    node_brace_right_9.scale.set(1.0, 1.0, 1.0);
  }
  node_brace_right_9.userData.sculptComponent = {"id": "brace-right", "name": "right triangular reinforcement", "level": "meso", "semanticLevel": "meso", "role": "right triangular reinforcement", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; endpoint-aligned beveled beam.", "geometryDescriptor": {"topologyIntent": "endpoint-aligned beveled beam", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 1, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [0.75, 0.75, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-right-root", "localPosition": [0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-right", "seamRefs": ["right-brace-bevel", "right-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "brace-right-root", "type": "hinge-or-socket", "parent": "brace-right"}], "seams": ["right-brace-rust"], "localFeatures": ["right-brace-bevel", "right-brace-rust"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["right-brace-bevel", "right-brace-rust"], "fidelityTier": "structural"};
  node_brace_right_9.userData.actionProfile = {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-right-root", "localPosition": [0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-right", "seamRefs": ["right-brace-bevel", "right-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}};
  (nodes["root"] ?? root).add(node_brace_right_9);
  nodes["brace-right"] = node_brace_right_9;
  const mesh_brace_right_9Geometry = endpoint_brace_right_9
    ? new THREE.CylinderGeometry(endpoint_brace_right_9.endRadius, endpoint_brace_right_9.baseRadius, endpoint_brace_right_9.length, 32, 12)
    : new THREE.BoxGeometry(1, 1, 1, 12, 12, 12);
  const mesh_brace_right_9 = new THREE.Mesh(
    mesh_brace_right_9Geometry,
    materialMap["painted-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_brace_right_9.name = "right triangular reinforcement";
  if (endpoint_brace_right_9) {
    mesh_brace_right_9.position.copy(endpoint_brace_right_9.midpoint);
    mesh_brace_right_9.quaternion.copy(endpoint_brace_right_9.quaternion);
  }
  if (!endpoint_brace_right_9) {
    mesh_brace_right_9.scale.set(0.16, 1.0, 0.16);
  }
  mesh_brace_right_9.castShadow = options.castShadow ?? true;
  mesh_brace_right_9.receiveShadow = options.receiveShadow ?? true;
  mesh_brace_right_9.userData.sculptComponent = {"id": "brace-right", "name": "right triangular reinforcement", "level": "meso", "semanticLevel": "meso", "role": "right triangular reinforcement", "importance": 0.8, "confidence": 0.72, "primitive": "box", "topologyClass": "assembled-solid", "topologyRationale": "Observed assembled-solid evidence in the isolated field-plough reference; endpoint-aligned beveled beam.", "geometryDescriptor": {"topologyIntent": "endpoint-aligned beveled beam", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "attachment-frame", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 1, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [0.75, 0.75, 0.1], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "reinforcement", "pivot": {"mode": "custom", "localPosition": [0.75, 0.75, 0.1], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "attachment-frame", "parentSocket": "attachment-frame-socket", "localStart": [0.75, 0.75, 0.1], "localEnd": [0.75, 0.85, 0], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [{"id": "brace-right-root", "localPosition": [0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"}], "collider": {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "brace-right", "seamRefs": ["right-brace-bevel", "right-brace-rust"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "painted-steel"}}, "material": "painted-steel", "materialLayers": ["painted-steel", "rust"], "deformations": [], "joints": [{"id": "brace-right-root", "type": "hinge-or-socket", "parent": "brace-right"}], "seams": ["right-brace-rust"], "localFeatures": ["right-brace-bevel", "right-brace-rust"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(62, 74, 77, 1.0)", "secondaryAlbedo": "rgba(86, 99, 101, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(62, 74, 77, 1.0)"}, {"position": 1, "color": "rgba(41, 48, 51, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["right-brace-bevel", "right-brace-rust"], "fidelityTier": "structural"};
  node_brace_right_9.add(mesh_brace_right_9);
  meshes["brace-right"] = mesh_brace_right_9;
  colliders["brace-right"] = {"type": "box", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned proxy"};
  destructionGroups["brace-right"] ??= [];
  destructionGroups["brace-right"].push(node_brace_right_9);
  const socket_brace_right_brace_right_root_0 = new THREE.Object3D();
  socket_brace_right_brace_right_root_0.name = "brace-right-root";
  socket_brace_right_brace_right_root_0.position.set(0.75, 0.75, 0.1);
  socket_brace_right_brace_right_root_0.rotation.set(0.0, 0.0, 0.0);
  socket_brace_right_brace_right_root_0.userData.socket = {"id": "brace-right-root", "localPosition": [0.75, 0.75, 0.1], "localRotation": [0, 0, 0], "role": "beam contact"};
  node_brace_right_9.add(socket_brace_right_brace_right_root_0);
  sockets["brace-right:brace-right-root"] = socket_brace_right_brace_right_root_0;

  const attachment_share_left_10 = {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_share_left_10 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_share_left_10 = makeAttachmentEndpoint(null);
  const node_share_left_10 = new THREE.Group();
  node_share_left_10.name = "left repeated soil share instance__pivot";
  if (endpoint_share_left_10) {
    node_share_left_10.position.copy(endpoint_share_left_10.start);
    node_share_left_10.rotation.set(0, 0, 0);
    node_share_left_10.scale.set(1, 1, 1);
  } else {
    node_share_left_10.position.set(-1.25, 0.15, -0.55);
    node_share_left_10.rotation.set(0.0, 0.0, 0.0);
    node_share_left_10.scale.set(1.0, 1.0, 1.0);
  }
  node_share_left_10.userData.sculptComponent = {"id": "share-left", "name": "left repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "left repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [-1.25, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [-1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-left-contact", "localPosition": [-1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-left", "seamRefs": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "detachableFragments": ["share-left"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-left-contact", "type": "hinge-or-socket", "parent": "share-left"}], "seams": [], "localFeatures": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "fidelityTier": "structural"};
  node_share_left_10.userData.actionProfile = {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [-1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-left-contact", "localPosition": [-1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-left", "seamRefs": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "detachableFragments": ["share-left"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_share_left_10);
  nodes["share-left"] = node_share_left_10;
  const mesh_share_left_10Geometry = endpoint_share_left_10
    ? new THREE.CylinderGeometry(endpoint_share_left_10.endRadius, endpoint_share_left_10.baseRadius, endpoint_share_left_10.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24});
  const mesh_share_left_10 = new THREE.Mesh(
    mesh_share_left_10Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_share_left_10.name = "left repeated soil share instance";
  if (endpoint_share_left_10) {
    mesh_share_left_10.position.copy(endpoint_share_left_10.midpoint);
    mesh_share_left_10.quaternion.copy(endpoint_share_left_10.quaternion);
  }
  if (!endpoint_share_left_10) {
    mesh_share_left_10.scale.set(0.82, 0.86, 0.24);
  }
  mesh_share_left_10.castShadow = options.castShadow ?? true;
  mesh_share_left_10.receiveShadow = options.receiveShadow ?? true;
  mesh_share_left_10.userData.sculptComponent = {"id": "share-left", "name": "left repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "left repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [-1.25, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [-1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [-1.25, 0.15, -0.55], "localEnd": [-1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-left-contact", "localPosition": [-1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-left", "seamRefs": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "detachableFragments": ["share-left"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-left-contact", "type": "hinge-or-socket", "parent": "share-left"}], "seams": [], "localFeatures": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-left-cutting-edge", "share-left-soil-stain", "share-left-fasteners"], "fidelityTier": "structural"};
  node_share_left_10.add(mesh_share_left_10);
  meshes["share-left"] = mesh_share_left_10;
  colliders["share-left"] = {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"};
  destructionGroups["share-left"] ??= [];
  destructionGroups["share-left"].push(node_share_left_10);
  const socket_share_left_share_left_contact_0 = new THREE.Object3D();
  socket_share_left_share_left_contact_0.name = "share-left-contact";
  socket_share_left_share_left_contact_0.position.set(-1.25, -0.65, -0.9);
  socket_share_left_share_left_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_share_left_share_left_contact_0.userData.socket = {"id": "share-left-contact", "localPosition": [-1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"};
  node_share_left_10.add(socket_share_left_share_left_contact_0);
  sockets["share-left:share-left-contact"] = socket_share_left_share_left_contact_0;

  const attachment_share_center_11 = {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_share_center_11 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_share_center_11 = makeAttachmentEndpoint(null);
  const node_share_center_11 = new THREE.Group();
  node_share_center_11.name = "center repeated soil share instance__pivot";
  if (endpoint_share_center_11) {
    node_share_center_11.position.copy(endpoint_share_center_11.start);
    node_share_center_11.rotation.set(0, 0, 0);
    node_share_center_11.scale.set(1, 1, 1);
  } else {
    node_share_center_11.position.set(0.0, 0.15, -0.55);
    node_share_center_11.rotation.set(0.0, 0.0, 0.0);
    node_share_center_11.scale.set(1.0, 1.0, 1.0);
  }
  node_share_center_11.userData.sculptComponent = {"id": "share-center", "name": "center repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "center repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [0, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-center-contact", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-center", "seamRefs": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "detachableFragments": ["share-center"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-center-contact", "type": "hinge-or-socket", "parent": "share-center"}], "seams": [], "localFeatures": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "fidelityTier": "structural"};
  node_share_center_11.userData.actionProfile = {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [0, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-center-contact", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-center", "seamRefs": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "detachableFragments": ["share-center"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_share_center_11);
  nodes["share-center"] = node_share_center_11;
  const mesh_share_center_11Geometry = endpoint_share_center_11
    ? new THREE.CylinderGeometry(endpoint_share_center_11.endRadius, endpoint_share_center_11.baseRadius, endpoint_share_center_11.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24});
  const mesh_share_center_11 = new THREE.Mesh(
    mesh_share_center_11Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_share_center_11.name = "center repeated soil share instance";
  if (endpoint_share_center_11) {
    mesh_share_center_11.position.copy(endpoint_share_center_11.midpoint);
    mesh_share_center_11.quaternion.copy(endpoint_share_center_11.quaternion);
  }
  if (!endpoint_share_center_11) {
    mesh_share_center_11.scale.set(0.82, 0.86, 0.24);
  }
  mesh_share_center_11.castShadow = options.castShadow ?? true;
  mesh_share_center_11.receiveShadow = options.receiveShadow ?? true;
  mesh_share_center_11.userData.sculptComponent = {"id": "share-center", "name": "center repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "center repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [0, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, 0.15, -0.55], "localEnd": [0, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-center-contact", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-center", "seamRefs": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "detachableFragments": ["share-center"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-center-contact", "type": "hinge-or-socket", "parent": "share-center"}], "seams": [], "localFeatures": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-center-cutting-edge", "share-center-soil-stain", "share-center-fasteners"], "fidelityTier": "structural"};
  node_share_center_11.add(mesh_share_center_11);
  meshes["share-center"] = mesh_share_center_11;
  colliders["share-center"] = {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"};
  destructionGroups["share-center"] ??= [];
  destructionGroups["share-center"].push(node_share_center_11);
  const socket_share_center_share_center_contact_0 = new THREE.Object3D();
  socket_share_center_share_center_contact_0.name = "share-center-contact";
  socket_share_center_share_center_contact_0.position.set(0.0, -0.65, -0.9);
  socket_share_center_share_center_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_share_center_share_center_contact_0.userData.socket = {"id": "share-center-contact", "localPosition": [0, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"};
  node_share_center_11.add(socket_share_center_share_center_contact_0);
  sockets["share-center:share-center-contact"] = socket_share_center_share_center_contact_0;

  const attachment_share_right_12 = {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_share_right_12 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_share_right_12 = makeAttachmentEndpoint(null);
  const node_share_right_12 = new THREE.Group();
  node_share_right_12.name = "right repeated soil share instance__pivot";
  if (endpoint_share_right_12) {
    node_share_right_12.position.copy(endpoint_share_right_12.start);
    node_share_right_12.rotation.set(0, 0, 0);
    node_share_right_12.scale.set(1, 1, 1);
  } else {
    node_share_right_12.position.set(1.25, 0.15, -0.55);
    node_share_right_12.rotation.set(0.0, 0.0, 0.0);
    node_share_right_12.scale.set(1.0, 1.0, 1.0);
  }
  node_share_right_12.userData.sculptComponent = {"id": "share-right", "name": "right repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "right repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [1.25, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-right-contact", "localPosition": [1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-right", "seamRefs": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "detachableFragments": ["share-right"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-right-contact", "type": "hinge-or-socket", "parent": "share-right"}], "seams": [], "localFeatures": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "fidelityTier": "structural"};
  node_share_right_12.userData.actionProfile = {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-right-contact", "localPosition": [1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-right", "seamRefs": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "detachableFragments": ["share-right"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_share_right_12);
  nodes["share-right"] = node_share_right_12;
  const mesh_share_right_12Geometry = endpoint_share_right_12
    ? new THREE.CylinderGeometry(endpoint_share_right_12.endRadius, endpoint_share_right_12.baseRadius, endpoint_share_right_12.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24});
  const mesh_share_right_12 = new THREE.Mesh(
    mesh_share_right_12Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_share_right_12.name = "right repeated soil share instance";
  if (endpoint_share_right_12) {
    mesh_share_right_12.position.copy(endpoint_share_right_12.midpoint);
    mesh_share_right_12.quaternion.copy(endpoint_share_right_12.quaternion);
  }
  if (!endpoint_share_right_12) {
    mesh_share_right_12.scale.set(0.82, 0.86, 0.24);
  }
  mesh_share_right_12.castShadow = options.castShadow ?? true;
  mesh_share_right_12.receiveShadow = options.receiveShadow ?? true;
  mesh_share_right_12.userData.sculptComponent = {"id": "share-right", "name": "right repeated soil share instance", "level": "meso", "semanticLevel": "meso", "role": "right repeated soil share instance", "importance": 0.8, "confidence": 0.72, "primitive": "extrude", "topologyClass": "continuous-sculpt", "topologyRationale": "Observed continuous-sculpt evidence in the isolated field-plough reference; handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition.", "geometryDescriptor": {"topologyIntent": "handed helicoidal shell, narrow upper standard connection, broader swept trailing edge, concave soil-turning face, and integrated lower cutting-share transition", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.04, "segments": 2}, "deformationStack": ["curved-profile", "edge-wear"], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.5, -0.42], [-0.43, 0.35], [-0.16, 0.5], [0.35, 0.38], [0.5, 0.04], [0.25, -0.2], [-0.1, -0.44]], "depth": 0.24}, "helicoidalSurface": {"handedness": "consistent soil throw toward implement left", "sectionCount": 9, "longitudinalSegments": 28, "transverseSegments": 24, "sectionProfiles": [{"station": 0, "width": 0.52, "sweep": -0.12, "concavity": 0.22, "twistDegrees": -8}, {"station": 0.5, "width": 0.76, "sweep": -0.02, "concavity": 0.3, "twistDegrees": 10}, {"station": 1, "width": 0.48, "sweep": 0.16, "concavity": 0.2, "twistDegrees": 24}], "lowerTransition": "continuous tangent into the forward cutting-share plate without a visible air gap", "failureModes": ["bilaterally symmetric paddle silhouette", "flat extruded plate", "detached centered cutting triangle"]}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.82, "height": 0.86, "depth": 0.24, "units": "relative", "confidence": 0.35}, "transform": {"position": [1.25, 0.15, -0.55], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "share-instance", "pivot": {"mode": "base", "localPosition": [1.25, 0.15, -0.55], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [1.25, 0.15, -0.55], "localEnd": [1.25, 0.25, -0.65], "contactType": "embedded", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [{"id": "share-right-contact", "localPosition": [1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"}], "collider": {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"}, "constraints": [{"state": "raised", "source": "canonical asset definition"}, {"state": "lowered", "source": "canonical asset definition"}, {"state": "cutting", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "share-right", "seamRefs": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "detachableFragments": ["share-right"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "soil-residue"], "deformations": [], "joints": [{"id": "share-right-contact", "type": "hinge-or-socket", "parent": "share-right"}], "seams": [], "localFeatures": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["share-right-cutting-edge", "share-right-soil-stain", "share-right-fasteners"], "fidelityTier": "structural"};
  node_share_right_12.add(mesh_share_right_12);
  meshes["share-right"] = mesh_share_right_12;
  colliders["share-right"] = {"type": "wedge-proxy", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "simulation-owned terrain-tool proxy"};
  destructionGroups["share-right"] ??= [];
  destructionGroups["share-right"].push(node_share_right_12);
  const socket_share_right_share_right_contact_0 = new THREE.Object3D();
  socket_share_right_share_right_contact_0.name = "share-right-contact";
  socket_share_right_share_right_contact_0.position.set(1.25, -0.65, -0.9);
  socket_share_right_share_right_contact_0.rotation.set(0.0, 0.0, 0.0);
  socket_share_right_share_right_contact_0.userData.socket = {"id": "share-right-contact", "localPosition": [1.25, -0.65, -0.9], "localRotation": [0, 0, 0], "role": "soil contact"};
  node_share_right_12.add(socket_share_right_share_right_contact_0);
  sockets["share-right:share-right-contact"] = socket_share_right_share_right_contact_0;

  const attachment_fastener_groups_13 = {"parentId": "root", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_fastener_groups_13 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_fastener_groups_13 = makeAttachmentEndpoint(null);
  const node_fastener_groups_13 = new THREE.Group();
  node_fastener_groups_13.name = "repeated visible pins and bolts__pivot";
  if (endpoint_fastener_groups_13) {
    node_fastener_groups_13.position.copy(endpoint_fastener_groups_13.start);
    node_fastener_groups_13.rotation.set(0, 0, 0);
    node_fastener_groups_13.scale.set(1, 1, 1);
  } else {
    node_fastener_groups_13.position.set(0.0, 0.0, 0.0);
    node_fastener_groups_13.rotation.set(0.0, 0.0, 0.0);
    node_fastener_groups_13.scale.set(1.0, 1.0, 1.0);
  }
  node_fastener_groups_13.userData.sculptComponent = {"id": "fastener-groups", "name": "repeated visible pins and bolts", "level": "micro", "semanticLevel": "micro", "role": "repeated visible pins and bolts", "importance": 0.65, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; instanced cylinders and hex heads.", "geometryDescriptor": {"topologyIntent": "instanced cylinders and hex heads", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "cross-beam", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 0.16, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "surface-detail", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "cross-beam", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "fastener-groups", "seamRefs": ["fastener-heads", "fastener-cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["fastener-heads", "fastener-cavity-darkening"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["fastener-heads", "fastener-cavity-darkening"], "fidelityTier": "structural"};
  node_fastener_groups_13.userData.actionProfile = {"animationRole": "surface-detail", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "cross-beam", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "fastener-groups", "seamRefs": ["fastener-heads", "fastener-cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_fastener_groups_13);
  nodes["fastener-groups"] = node_fastener_groups_13;
  const mesh_fastener_groups_13Geometry = endpoint_fastener_groups_13
    ? new THREE.CylinderGeometry(endpoint_fastener_groups_13.endRadius, endpoint_fastener_groups_13.baseRadius, endpoint_fastener_groups_13.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  const mesh_fastener_groups_13 = new THREE.Mesh(
    mesh_fastener_groups_13Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_fastener_groups_13.name = "repeated visible pins and bolts";
  if (endpoint_fastener_groups_13) {
    mesh_fastener_groups_13.position.copy(endpoint_fastener_groups_13.midpoint);
    mesh_fastener_groups_13.quaternion.copy(endpoint_fastener_groups_13.quaternion);
  }
  if (!endpoint_fastener_groups_13) {
    mesh_fastener_groups_13.scale.set(0.16, 0.16, 0.16);
  }
  mesh_fastener_groups_13.castShadow = options.castShadow ?? true;
  mesh_fastener_groups_13.receiveShadow = options.receiveShadow ?? true;
  mesh_fastener_groups_13.userData.sculptComponent = {"id": "fastener-groups", "name": "repeated visible pins and bolts", "level": "micro", "semanticLevel": "micro", "role": "repeated visible pins and bolts", "importance": 0.65, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; instanced cylinders and hex heads.", "geometryDescriptor": {"topologyIntent": "instanced cylinders and hex heads", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "cross-beam", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.16, "height": 0.16, "depth": 0.16, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "surface-detail", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "cross-beam", "parentSocket": "cross-beam-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "fastener-groups", "seamRefs": ["fastener-heads", "fastener-cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["fastener-heads", "fastener-cavity-darkening"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["fastener-heads", "fastener-cavity-darkening"], "fidelityTier": "structural"};
  node_fastener_groups_13.add(mesh_fastener_groups_13);
  meshes["fastener-groups"] = mesh_fastener_groups_13;
  colliders["fastener-groups"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"};
  destructionGroups["fastener-groups"] ??= [];
  destructionGroups["fastener-groups"].push(node_fastener_groups_13);

  const attachment_cutting_edge_group_14 = {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_cutting_edge_group_14 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_cutting_edge_group_14 = makeAttachmentEndpoint(null);
  const node_cutting_edge_group_14 = new THREE.Group();
  node_cutting_edge_group_14.name = "bright sharpened cutting edges__pivot";
  if (endpoint_cutting_edge_group_14) {
    node_cutting_edge_group_14.position.copy(endpoint_cutting_edge_group_14.start);
    node_cutting_edge_group_14.rotation.set(0, 0, 0);
    node_cutting_edge_group_14.scale.set(1, 1, 1);
  } else {
    node_cutting_edge_group_14.position.set(0.0, -0.6, -0.9);
    node_cutting_edge_group_14.rotation.set(0.0, 0.0, 0.0);
    node_cutting_edge_group_14.scale.set(1.0, 1.0, 1.0);
  }
  node_cutting_edge_group_14.userData.sculptComponent = {"id": "cutting-edge-group", "name": "bright sharpened cutting edges", "level": "micro", "semanticLevel": "micro", "role": "bright sharpened cutting edges", "importance": 0.65, "confidence": 0.72, "primitive": "extrude", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; four narrow forward-projecting beveled shares with continuous lower cutting edges transitioning into the corresponding moldboard shells.", "geometryDescriptor": {"topologyIntent": "four narrow forward-projecting beveled shares with continuous lower cutting edges transitioning into the corresponding moldboard shells", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.52, -0.06], [0.5, 0.01], [0.02, 0.18], [-0.4, 0.12]], "depth": 0.11}, "integration": {"count": 4, "projection": "forward from each moldboard lower leading edge", "edgeContinuity": "lower cutting edge remains visually continuous into its moldboard", "staggering": "each share follows the same depth-staggered order as the four moldboards"}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.08, "depth": 0.12, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, -0.6, -0.9], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "cutting-edge", "pivot": {"mode": "fixed", "localPosition": [0, -0.6, -0.9], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only; terrain tool role is semantic"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "cutting-edge-group", "seamRefs": ["edge-bevel", "edge-polish", "edge-chips"], "detachableFragments": ["cutting-edge-group"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["edge-bevel", "edge-polish", "edge-chips"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["edge-bevel", "edge-polish", "edge-chips"], "fidelityTier": "structural"};
  node_cutting_edge_group_14.userData.actionProfile = {"animationRole": "cutting-edge", "pivot": {"mode": "fixed", "localPosition": [0, -0.6, -0.9], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only; terrain tool role is semantic"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "cutting-edge-group", "seamRefs": ["edge-bevel", "edge-polish", "edge-chips"], "detachableFragments": ["cutting-edge-group"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_cutting_edge_group_14);
  nodes["cutting-edge-group"] = node_cutting_edge_group_14;
  const mesh_cutting_edge_group_14Geometry = endpoint_cutting_edge_group_14
    ? new THREE.CylinderGeometry(endpoint_cutting_edge_group_14.endRadius, endpoint_cutting_edge_group_14.baseRadius, endpoint_cutting_edge_group_14.length, 32, 12)
    : buildExtrudeGeometry({"points": [[-0.52, -0.06], [0.5, 0.01], [0.02, 0.18], [-0.4, 0.12]], "depth": 0.11});
  const mesh_cutting_edge_group_14 = new THREE.Mesh(
    mesh_cutting_edge_group_14Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_cutting_edge_group_14.name = "bright sharpened cutting edges";
  if (endpoint_cutting_edge_group_14) {
    mesh_cutting_edge_group_14.position.copy(endpoint_cutting_edge_group_14.midpoint);
    mesh_cutting_edge_group_14.quaternion.copy(endpoint_cutting_edge_group_14.quaternion);
  }
  if (!endpoint_cutting_edge_group_14) {
    mesh_cutting_edge_group_14.scale.set(2.8, 0.08, 0.12);
  }
  mesh_cutting_edge_group_14.castShadow = options.castShadow ?? true;
  mesh_cutting_edge_group_14.receiveShadow = options.receiveShadow ?? true;
  mesh_cutting_edge_group_14.userData.sculptComponent = {"id": "cutting-edge-group", "name": "bright sharpened cutting edges", "level": "micro", "semanticLevel": "micro", "role": "bright sharpened cutting edges", "importance": 0.65, "confidence": 0.72, "primitive": "extrude", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; four narrow forward-projecting beveled shares with continuous lower cutting edges transitioning into the corresponding moldboard shells.", "geometryDescriptor": {"topologyIntent": "four narrow forward-projecting beveled shares with continuous lower cutting edges transitioning into the corresponding moldboard shells", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response", "profile2D": {"points": [[-0.52, -0.06], [0.5, 0.01], [0.02, 0.18], [-0.4, 0.12]], "depth": 0.11}, "integration": {"count": 4, "projection": "forward from each moldboard lower leading edge", "edgeContinuity": "lower cutting edge remains visually continuous into its moldboard", "staggering": "each share follows the same depth-staggered order as the four moldboards"}}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.08, "depth": 0.12, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, -0.6, -0.9], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "cutting-edge", "pivot": {"mode": "fixed", "localPosition": [0, -0.6, -0.9], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.6, -0.9], "localEnd": [0, -0.5, -1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": true, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only; terrain tool role is semantic"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": true, "fractureGroup": "cutting-edge-group", "seamRefs": ["edge-bevel", "edge-polish", "edge-chips"], "detachableFragments": ["cutting-edge-group"], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["edge-bevel", "edge-polish", "edge-chips"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["edge-bevel", "edge-polish", "edge-chips"], "fidelityTier": "structural"};
  node_cutting_edge_group_14.add(mesh_cutting_edge_group_14);
  meshes["cutting-edge-group"] = mesh_cutting_edge_group_14;
  colliders["cutting-edge-group"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only; terrain tool role is semantic"};
  destructionGroups["cutting-edge-group"] ??= [];
  destructionGroups["cutting-edge-group"].push(node_cutting_edge_group_14);

  const attachment_rust_wear_group_15 = {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_rust_wear_group_15 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_rust_wear_group_15 = makeAttachmentEndpoint(null);
  const node_rust_wear_group_15 = new THREE.Group();
  node_rust_wear_group_15.name = "paint loss and oxidation regions__pivot";
  if (endpoint_rust_wear_group_15) {
    node_rust_wear_group_15.position.copy(endpoint_rust_wear_group_15.start);
    node_rust_wear_group_15.rotation.set(0, 0, 0);
    node_rust_wear_group_15.scale.set(1, 1, 1);
  } else {
    node_rust_wear_group_15.position.set(0.0, 0.0, 0.0);
    node_rust_wear_group_15.rotation.set(0.0, 0.0, 0.0);
    node_rust_wear_group_15.scale.set(1.0, 1.0, 1.0);
  }
  node_rust_wear_group_15.userData.sculptComponent = {"id": "rust-wear-group", "name": "paint loss and oxidation regions", "level": "micro", "semanticLevel": "micro", "role": "paint loss and oxidation regions", "importance": 0.65, "confidence": 0.72, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Observed material-only evidence in the isolated field-plough reference; material masks on parent surfaces.", "geometryDescriptor": {"topologyIntent": "material masks on parent surfaces", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.12, "depth": 0.32, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "wear-state", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "intact", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}, {"state": "damaged", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "rust-wear-group", "seamRefs": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "rust"}}, "material": "rust", "materialLayers": ["rust"], "deformations": [], "joints": [], "seams": ["rust-bloom"], "localFeatures": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(138, 77, 50, 1.0)", "secondaryAlbedo": "rgba(178, 106, 62, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(138, 77, 50, 1.0)"}, {"position": 1, "color": "rgba(74, 48, 40, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "fidelityTier": "structural"};
  node_rust_wear_group_15.userData.actionProfile = {"animationRole": "wear-state", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "intact", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}, {"state": "damaged", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "rust-wear-group", "seamRefs": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "rust"}};
  (nodes["root"] ?? root).add(node_rust_wear_group_15);
  nodes["rust-wear-group"] = node_rust_wear_group_15;
  const mesh_rust_wear_group_15Geometry = endpoint_rust_wear_group_15
    ? new THREE.CylinderGeometry(endpoint_rust_wear_group_15.endRadius, endpoint_rust_wear_group_15.baseRadius, endpoint_rust_wear_group_15.length, 32, 12)
    : new THREE.PlaneGeometry(1, 1, 24, 24);
  const mesh_rust_wear_group_15 = new THREE.Mesh(
    mesh_rust_wear_group_15Geometry,
    materialMap["rust"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_rust_wear_group_15.name = "paint loss and oxidation regions";
  if (endpoint_rust_wear_group_15) {
    mesh_rust_wear_group_15.position.copy(endpoint_rust_wear_group_15.midpoint);
    mesh_rust_wear_group_15.quaternion.copy(endpoint_rust_wear_group_15.quaternion);
  }
  if (!endpoint_rust_wear_group_15) {
    mesh_rust_wear_group_15.scale.set(2.8, 0.12, 0.32);
  }
  mesh_rust_wear_group_15.castShadow = options.castShadow ?? true;
  mesh_rust_wear_group_15.receiveShadow = options.receiveShadow ?? true;
  mesh_rust_wear_group_15.userData.sculptComponent = {"id": "rust-wear-group", "name": "paint loss and oxidation regions", "level": "micro", "semanticLevel": "micro", "role": "paint loss and oxidation regions", "importance": 0.65, "confidence": 0.72, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Observed material-only evidence in the isolated field-plough reference; material masks on parent surfaces.", "geometryDescriptor": {"topologyIntent": "material masks on parent surfaces", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "root", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.12, "depth": 0.32, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "wear-state", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "root", "parentSocket": "root-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "intact", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}, {"state": "damaged", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "rust-wear-group", "seamRefs": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "rust"}}, "material": "rust", "materialLayers": ["rust"], "deformations": [], "joints": [], "seams": ["rust-bloom"], "localFeatures": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(138, 77, 50, 1.0)", "secondaryAlbedo": "rgba(178, 106, 62, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(138, 77, 50, 1.0)"}, {"position": 1, "color": "rgba(74, 48, 40, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["rust-bloom", "paint-chip-mask", "edge-wear-mask"], "fidelityTier": "structural"};
  node_rust_wear_group_15.add(mesh_rust_wear_group_15);
  meshes["rust-wear-group"] = mesh_rust_wear_group_15;
  colliders["rust-wear-group"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"};
  destructionGroups["rust-wear-group"] ??= [];
  destructionGroups["rust-wear-group"].push(node_rust_wear_group_15);

  const attachment_soil_residue_group_16 = {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_soil_residue_group_16 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_soil_residue_group_16 = makeAttachmentEndpoint(null);
  const node_soil_residue_group_16 = new THREE.Group();
  node_soil_residue_group_16.name = "mud and soil residue in lower recesses__pivot";
  if (endpoint_soil_residue_group_16) {
    node_soil_residue_group_16.position.copy(endpoint_soil_residue_group_16.start);
    node_soil_residue_group_16.rotation.set(0, 0, 0);
    node_soil_residue_group_16.scale.set(1, 1, 1);
  } else {
    node_soil_residue_group_16.position.set(0.0, -0.4, -0.75);
    node_soil_residue_group_16.rotation.set(0.0, 0.0, 0.0);
    node_soil_residue_group_16.scale.set(1.0, 1.0, 1.0);
  }
  node_soil_residue_group_16.userData.sculptComponent = {"id": "soil-residue-group", "name": "mud and soil residue in lower recesses", "level": "micro", "semanticLevel": "micro", "role": "mud and soil residue in lower recesses", "importance": 0.65, "confidence": 0.72, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Observed material-only evidence in the isolated field-plough reference; localized projected mask plus optional shallow geometry.", "geometryDescriptor": {"topologyIntent": "localized projected mask plus optional shallow geometry", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.16, "depth": 0.42, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, -0.4, -0.75], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "soil-state", "pivot": {"mode": "fixed", "localPosition": [0, -0.4, -0.75], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "clean", "source": "canonical asset definition"}, {"state": "worked", "source": "canonical asset definition"}, {"state": "wet", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "soil-residue-group", "seamRefs": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "soil-residue"}}, "material": "soil-residue", "materialLayers": ["soil-residue"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(90, 66, 48, 1.0)", "secondaryAlbedo": "rgba(135, 101, 70, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(90, 66, 48, 1.0)"}, {"position": 1, "color": "rgba(46, 41, 37, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "fidelityTier": "structural"};
  node_soil_residue_group_16.userData.actionProfile = {"animationRole": "soil-state", "pivot": {"mode": "fixed", "localPosition": [0, -0.4, -0.75], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "clean", "source": "canonical asset definition"}, {"state": "worked", "source": "canonical asset definition"}, {"state": "wet", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "soil-residue-group", "seamRefs": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "soil-residue"}};
  (nodes["root"] ?? root).add(node_soil_residue_group_16);
  nodes["soil-residue-group"] = node_soil_residue_group_16;
  const mesh_soil_residue_group_16Geometry = endpoint_soil_residue_group_16
    ? new THREE.CylinderGeometry(endpoint_soil_residue_group_16.endRadius, endpoint_soil_residue_group_16.baseRadius, endpoint_soil_residue_group_16.length, 32, 12)
    : new THREE.PlaneGeometry(1, 1, 24, 24);
  const mesh_soil_residue_group_16 = new THREE.Mesh(
    mesh_soil_residue_group_16Geometry,
    materialMap["soil-residue"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_soil_residue_group_16.name = "mud and soil residue in lower recesses";
  if (endpoint_soil_residue_group_16) {
    mesh_soil_residue_group_16.position.copy(endpoint_soil_residue_group_16.midpoint);
    mesh_soil_residue_group_16.quaternion.copy(endpoint_soil_residue_group_16.quaternion);
  }
  if (!endpoint_soil_residue_group_16) {
    mesh_soil_residue_group_16.scale.set(2.8, 0.16, 0.42);
  }
  mesh_soil_residue_group_16.castShadow = options.castShadow ?? true;
  mesh_soil_residue_group_16.receiveShadow = options.receiveShadow ?? true;
  mesh_soil_residue_group_16.userData.sculptComponent = {"id": "soil-residue-group", "name": "mud and soil residue in lower recesses", "level": "micro", "semanticLevel": "micro", "role": "mud and soil residue in lower recesses", "importance": 0.65, "confidence": 0.72, "primitive": "plane-card", "topologyClass": "material-only", "topologyRationale": "Observed material-only evidence in the isolated field-plough reference; localized projected mask plus optional shallow geometry.", "geometryDescriptor": {"topologyIntent": "localized projected mask plus optional shallow geometry", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "share-assembly", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 2.8, "height": 0.16, "depth": 0.42, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, -0.4, -0.75], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "soil-state", "pivot": {"mode": "fixed", "localPosition": [0, -0.4, -0.75], "axis": [0, 1, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "share-assembly", "parentSocket": "share-assembly-socket", "localStart": [0, -0.4, -0.75], "localEnd": [0, -0.30000000000000004, -0.85], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "clean", "source": "canonical asset definition"}, {"state": "worked", "source": "canonical asset definition"}, {"state": "wet", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "soil-residue-group", "seamRefs": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "soil-residue"}}, "material": "soil-residue", "materialLayers": ["soil-residue"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(90, 66, 48, 1.0)", "secondaryAlbedo": "rgba(135, 101, 70, 1.0)", "materialClass": "stone", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(90, 66, 48, 1.0)"}, {"position": 1, "color": "rgba(46, 41, 37, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["soil-cavity-bias", "wet-soil-darkening", "soil-clump-breakup"], "fidelityTier": "structural"};
  node_soil_residue_group_16.add(mesh_soil_residue_group_16);
  meshes["soil-residue-group"] = mesh_soil_residue_group_16;
  colliders["soil-residue-group"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"};
  destructionGroups["soil-residue-group"] ??= [];
  destructionGroups["soil-residue-group"].push(node_soil_residue_group_16);

  const attachment_hinge_pin_group_17 = {"parentId": "root", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]};
  // Keep attachment_hinge_pin_group_17 in sculpt metadata; visual review uses authored component geometry.
  const endpoint_hinge_pin_group_17 = makeAttachmentEndpoint(null);
  const node_hinge_pin_group_17 = new THREE.Group();
  node_hinge_pin_group_17.name = "hinge and pin hardware__pivot";
  if (endpoint_hinge_pin_group_17) {
    node_hinge_pin_group_17.position.copy(endpoint_hinge_pin_group_17.start);
    node_hinge_pin_group_17.rotation.set(0, 0, 0);
    node_hinge_pin_group_17.scale.set(1, 1, 1);
  } else {
    node_hinge_pin_group_17.position.set(0.0, 0.0, 0.0);
    node_hinge_pin_group_17.rotation.set(0.0, 0.0, 0.0);
    node_hinge_pin_group_17.scale.set(1.0, 1.0, 1.0);
  }
  node_hinge_pin_group_17.userData.sculptComponent = {"id": "hinge-pin-group", "name": "hinge and pin hardware", "level": "micro", "semanticLevel": "micro", "role": "hinge and pin hardware", "importance": 0.65, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; instanced pin cylinders with washers.", "geometryDescriptor": {"topologyIntent": "instanced pin cylinders with washers", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "hydraulic-ram", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.14, "height": 0.14, "depth": 0.55, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "hinge-hardware", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "hydraulic-ram", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "hinge-pin-group", "seamRefs": ["pin-crown", "washer-ring", "cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["pin-crown", "washer-ring", "cavity-darkening"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["pin-crown", "washer-ring", "cavity-darkening"], "fidelityTier": "structural"};
  node_hinge_pin_group_17.userData.actionProfile = {"animationRole": "hinge-hardware", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "hydraulic-ram", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "hinge-pin-group", "seamRefs": ["pin-crown", "washer-ring", "cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}};
  (nodes["root"] ?? root).add(node_hinge_pin_group_17);
  nodes["hinge-pin-group"] = node_hinge_pin_group_17;
  const mesh_hinge_pin_group_17Geometry = endpoint_hinge_pin_group_17
    ? new THREE.CylinderGeometry(endpoint_hinge_pin_group_17.endRadius, endpoint_hinge_pin_group_17.baseRadius, endpoint_hinge_pin_group_17.length, 32, 12)
    : new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
  const mesh_hinge_pin_group_17 = new THREE.Mesh(
    mesh_hinge_pin_group_17Geometry,
    materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 })
  );
  mesh_hinge_pin_group_17.name = "hinge and pin hardware";
  if (endpoint_hinge_pin_group_17) {
    mesh_hinge_pin_group_17.position.copy(endpoint_hinge_pin_group_17.midpoint);
    mesh_hinge_pin_group_17.quaternion.copy(endpoint_hinge_pin_group_17.quaternion);
  }
  if (!endpoint_hinge_pin_group_17) {
    mesh_hinge_pin_group_17.scale.set(0.14, 0.14, 0.55);
  }
  mesh_hinge_pin_group_17.castShadow = options.castShadow ?? true;
  mesh_hinge_pin_group_17.receiveShadow = options.receiveShadow ?? true;
  mesh_hinge_pin_group_17.userData.sculptComponent = {"id": "hinge-pin-group", "name": "hinge and pin hardware", "level": "micro", "semanticLevel": "micro", "role": "hinge and pin hardware", "importance": 0.65, "confidence": 0.72, "primitive": "cylinder", "topologyClass": "surface-relief", "topologyRationale": "Observed surface-relief evidence in the isolated field-plough reference; instanced pin cylinders with washers.", "geometryDescriptor": {"topologyIntent": "instanced pin cylinders with washers", "edgeTreatment": {"type": "chamfer", "bevelRadius": 0.01, "segments": 2}, "deformationStack": [], "uvStrategy": "generated procedural coordinates with object-scale projection", "normalStrategy": "vertex normals plus independent reference-derived or procedural normal response"}, "semanticParent": "hydraulic-ram", "parent": "root", "attachment": {"parentId": "root", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "dimensions": {"width": 0.14, "height": 0.14, "depth": 0.55, "units": "relative", "confidence": 0.35}, "transform": {"position": [0, 0, 0], "rotation": [0, 0, 0], "scale": [1, 1, 1]}, "actionProfile": {"animationRole": "hinge-hardware", "pivot": {"mode": "fixed", "localPosition": [0, 0, 0], "axis": [1, 0, 0], "confidence": 0.65}, "attachmentContract": {"parentId": "hydraulic-ram", "parentSocket": "hydraulic-ram-socket", "localStart": [0, 0, 0], "localEnd": [0, 0.1, -0.1], "contactType": "hinge", "overlap": 0.05, "gapTolerance": 0.01, "evidenceRefs": ["primary-reference"]}, "transformChannels": {"translate": false, "rotate": true, "scale": false, "bend": false, "twist": false, "detach": false, "visibility": true, "materialState": true}, "sockets": [], "collider": {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"}, "constraints": [{"state": "visible", "source": "canonical asset definition"}, {"state": "worn", "source": "canonical asset definition"}], "destruction": {"breakable": false, "fractureGroup": "hinge-pin-group", "seamRefs": ["pin-crown", "washer-ring", "cavity-darkening"], "detachableFragments": [], "breakImpulse": 0, "debrisMaterial": "bare-steel"}}, "material": "bare-steel", "materialLayers": ["bare-steel", "rust"], "deformations": [], "joints": [], "seams": [], "localFeatures": ["pin-crown", "washer-ring", "cavity-darkening"], "colorMaterialRecipe": {"dominantAlbedo": "rgba(167, 166, 160, 1.0)", "secondaryAlbedo": "rgba(104, 107, 105, 1.0)", "materialClass": "metal", "materialClassConfidence": 0.82, "colorGradient": {"type": "linear", "stops": [{"position": 0, "color": "rgba(167, 166, 160, 1.0)"}, {"position": 1, "color": "rgba(208, 205, 192, 1.0)"}]}, "evidenceRefs": ["primary-reference"]}, "surfaceDetail": {"macroRoughness": 0.78, "microRoughness": 0.18, "bumpAmplitude": 0.32, "normalPattern": "independent material normal", "displacementPattern": "localized wear where silhouette permits", "occlusionPattern": "cavity and contact AO", "edgeWearPattern": "paint loss on exposed edges", "notes": "Derived from the canonical material and detail definition."}, "evidenceRefs": ["primary-reference"], "details": ["pin-crown", "washer-ring", "cavity-darkening"], "fidelityTier": "structural"};
  node_hinge_pin_group_17.add(mesh_hinge_pin_group_17);
  meshes["hinge-pin-group"] = mesh_hinge_pin_group_17;
  colliders["hinge-pin-group"] = {"type": "none", "offset": [0, 0, 0], "scale": [1, 1, 1], "isTrigger": false, "notes": "visual-only"};
  destructionGroups["hinge-pin-group"] ??= [];
  destructionGroups["hinge-pin-group"].push(node_hinge_pin_group_17);

  // repetition system: plough-share-row (InstancedMesh, linear, count=4, level=macro)
  {
    const parent = nodes["share-assembly"] ?? root;
    const geo = buildExtrudeGeometry({"points": [[-0.3, -0.3], [0.3, -0.3], [0.3, 0.3], [-0.3, 0.3]], "depth": 0.1});
    const mat = materialMap["bare-steel"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 });
    const scl = [0.55, 0.65, 0.18];
    const axis = new THREE.Vector3(1.0, 0.0, 0.0).normalize();
    const radius = 0.0;
    const seed = Math.abs(axis.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(axis, seed).normalize();
    // One InstancedMesh = one draw call for all repeated parts (teeth/fasteners/spokes),
    // replacing the former per-instance Mesh clone loop (real-time perf principle).
    const cluster = new THREE.InstancedMesh(geo, mat, 4);
    const _m = new THREE.Matrix4();
    const _p = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const _s = new THREE.Vector3(scl[0], scl[1], scl[2]);
    for (let i = 0; i < 4; i++) {
      const ang = ((0.0) + (i * 360) / 4) * Math.PI / 180;
      const dir = perp.clone().applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, ang));
      _p.copy(radius > 0 ? dir.clone().multiplyScalar(radius * 0.5) : new THREE.Vector3());
      _q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
      _m.compose(_p, _q, _s);
      cluster.setMatrixAt(i, _m);
    }
    cluster.instanceMatrix.needsUpdate = true;
    cluster.castShadow = options.castShadow ?? true;
    cluster.receiveShadow = options.receiveShadow ?? true;
    cluster.name = "plough-share-row";
    parent.add(cluster);
  }

  // repetition system: visible-fastener-rows (InstancedMesh, linear, count=12, level=macro)
  {
    const parent = nodes["cross-beam"] ?? root;
    const geo = new THREE.CylinderGeometry(0.5, 0.5, 1, 48, 16);
    const mat = materialMap["rust"] ?? new THREE.MeshStandardMaterial({ color: 0x888888 });
    const scl = [0.08, 0.08, 0.08];
    const axis = new THREE.Vector3(1.0, 0.0, 0.0).normalize();
    const radius = 0.0;
    const seed = Math.abs(axis.z) < 0.9 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
    const perp = new THREE.Vector3().crossVectors(axis, seed).normalize();
    // One InstancedMesh = one draw call for all repeated parts (teeth/fasteners/spokes),
    // replacing the former per-instance Mesh clone loop (real-time perf principle).
    const cluster = new THREE.InstancedMesh(geo, mat, 12);
    const _m = new THREE.Matrix4();
    const _p = new THREE.Vector3();
    const _q = new THREE.Quaternion();
    const _s = new THREE.Vector3(scl[0], scl[1], scl[2]);
    for (let i = 0; i < 12; i++) {
      const ang = ((0.0) + (i * 360) / 12) * Math.PI / 180;
      const dir = perp.clone().applyQuaternion(new THREE.Quaternion().setFromAxisAngle(axis, ang));
      _p.copy(radius > 0 ? dir.clone().multiplyScalar(radius * 0.5) : new THREE.Vector3());
      _q.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);
      _m.compose(_p, _q, _s);
      cluster.setMatrixAt(i, _m);
    }
    cluster.instanceMatrix.needsUpdate = true;
    cluster.castShadow = options.castShadow ?? true;
    cluster.receiveShadow = options.receiveShadow ?? true;
    cluster.name = "visible-fastener-rows";
    parent.add(cluster);
  }

  root.userData.sculptRuntime = { nodes, meshes, sockets, colliders, destructionGroups } satisfies ProceduralModelRuntime;
  root.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  root.userData.actionReadiness = {
    note: 'Use root.userData.sculptRuntime.nodes for transforms, sockets for attachments, colliders for physics proxies, and destructionGroups for breakable sets.',
  };
  return root;
}

export function createFieldPlough01LookDevLights(
  mode: 'neutral' | 'grazing' | 'reference' = 'neutral',
): THREE.Group {
  const lights = new THREE.Group();
  lights.name = "Field Plough 01 look-dev lights";
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
  lights.userData.lightingFromPhoto = [{"role": "key light", "description": "large warm upper-left studio key defining beam and share bevels"}, {"role": "fill light", "description": "soft cool frontal fill preserving dark cavities and hitch separation"}, {"role": "rim light", "description": "subtle rear rim separating the top-link triangle and share silhouettes"}, {"role": "environment", "description": "warm light-gray background, ACES tone mapping, exposure near neutral, grounded contact shadow and ambient occlusion"}];
  lights.userData.lookDevTargets = {"qualityPriority": "reference-fidelity", "materialPass": {"albedoPaletteRequired": true, "roughnessVariationRequired": true, "normalOrBumpRequired": true, "localOverridesRequired": true, "minimumTextureResolution": 1024, "preferredTextureResolution": 2048, "independentMapChannels": ["albedo", "roughness", "height", "normal", "ambient-occlusion"], "requiredSurfaceFrequencyBands": ["macro", "meso", "micro"], "geometryReliefRequiredWhenSilhouetteAffected": true, "referencePbrExtraction": {"requiredWhenSourceImagePresent": true, "targetThreshold": 0.7, "stopOnLowConfidence": true, "script": "forge/stage1_intake/extract_pbr_evidence.py", "acceptedLimitation": "single-image extraction is reference-derived inference, not exact photogrammetry"}, "mustAvoid": ["single flat albedo per material", "uniform roughness", "albedo texture reused as roughness/height/normal/AO", "single-frequency random noise", "plastic-looking smooth bark, stone, cloth, foliage, or aged material", "local color/detail described only in prose without material masks", "claiming exact PBR recovery when confidence is below the target threshold"]}, "lightingPass": {"requiredTerms": ["key light", "fill light", "rim or environment light", "exposure", "tone mapping", "background", "contact shadow"], "mustAvoid": ["ambient-only lighting", "flat value range", "missing contact shadow", "reference lighting copied without separating material readability"]}, "screenshotReview": ["Compare albedo palette and local color zones.", "Compare roughness/normal/bump response under light.", "Compare cavity dirt, edge wear, stains, moss, scratches, or other local masks.", "Compare key/fill/rim structure, exposure, tone mapping, background, and contact shadows.", "Capture a neutral-light render to verify material readability without reference lighting.", "Capture a grazing-light close-up to expose flat normals, uniform roughness, tiling, and plastic highlights.", "Capture a reference-matched render from the same camera framing as the source."]};
  return lights;
}

// PBR materials (clearcoat/iridescence/transmission/anisotropy) need an environment
// map to visually behave as intended — call this once per renderer and assign the
// result to scene.environment before rendering. No external HDR asset required.
export function createFieldPlough01Environment(renderer: THREE.WebGLRenderer): THREE.Texture {
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
export function frameFieldPlough01Camera(
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
export function createFieldPlough01PresentationComposer(
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

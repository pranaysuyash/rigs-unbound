/**
 * Deterministic coherent-noise primitives for Rigs Unbound.
 *
 * These are written for this project rather than imported so that the world
 * substrate has no runtime dependency and no cross-build reproducibility
 * question (see ADR-0007). Every function here is pure, integer-hash seeded,
 * and stable for a given `(coordinate, seed)` pair on any platform with IEEE-754
 * doubles and `Math.imul`.
 *
 * Two properties are load-bearing and must be preserved by any future edit:
 *
 * 1. **C2 continuity.** Terrain normals are taken by central difference of the
 *    height field, and suspension springs differentiate that again. A C1 fade
 *    curve (classic cubic smoothstep) produces visible faceting and audible
 *    suspension chatter on lattice boundaries, so `fade` is quintic.
 * 2. **Range normalisation.** `gradientNoise2` is scaled to approximately
 *    `[-1, 1]` so that amplitude parameters in `terrain.ts` are readable as
 *    metres rather than as arbitrary multipliers.
 */

/** Number of distinct lattice gradient directions. */
const GRADIENT_COUNT = 16;

/**
 * Unit gradients on a 16-spoke wheel. More spokes than the classic 8 measurably
 * reduces the axis-aligned "plus sign" artefact that shows up as unnaturally
 * straight ridge lines when several octaves stack.
 */
const GRADIENTS: readonly (readonly [number, number])[] = Array.from(
  { length: GRADIENT_COUNT },
  (_unused, index) => {
    const angle = (index * Math.PI * 2) / GRADIENT_COUNT;
    return [Math.cos(angle), Math.sin(angle)] as const;
  },
);

/** Convert an arbitrary label (a save seed, a channel name) into a uint32. */
export function seedFromText(text: string): number {
  let seed = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    seed ^= text.charCodeAt(index);
    seed = Math.imul(seed, 16777619);
  }
  return seed >>> 0;
}

/**
 * Integer hash for a 2D lattice point. A two-round xorshift-multiply finaliser
 * is used because single-round mixes leave enough structure to produce visible
 * diagonal banding once octaves are summed.
 */
export function hash2i(ix: number, iz: number, seed: number): number {
  let h =
    (seed ^ Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iz | 0, 0x85ebca6b)) >>>
    0;
  h = Math.imul(h ^ (h >>> 15), 0x2c1b3c6d);
  h = Math.imul(h ^ (h >>> 12), 0x297a2d39);
  h ^= h >>> 15;
  return h >>> 0;
}

/** Integer hash for a 2D lattice point plus a discriminator channel. */
export function hash3i(
  ix: number,
  iz: number,
  channel: number,
  seed: number,
): number {
  return hash2i(ix, iz, (seed ^ Math.imul(channel | 0, 0x9e3779b1)) >>> 0);
}

/** Deterministic value in `[0, 1)` for a lattice cell and channel. */
export function cellRandom(
  ix: number,
  iz: number,
  channel: number,
  seed: number,
): number {
  return hash3i(ix, iz, channel, seed) / 4294967296;
}

/** Quintic interpolant: zero first *and* second derivative at both ends. */
function fade(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function gradientDot(
  ix: number,
  iz: number,
  dx: number,
  dz: number,
  seed: number,
): number {
  const gradient = GRADIENTS[hash2i(ix, iz, seed) % GRADIENT_COUNT]!;
  return gradient[0] * dx + gradient[1] * dz;
}

/**
 * 2D gradient (Perlin-family) noise, normalised to approximately `[-1, 1]`.
 *
 * Raw 2D gradient noise is bounded by `±sqrt(2)/2`; the constant below restores
 * unit range so callers can treat amplitudes as metres.
 */
export function gradientNoise2(x: number, z: number, seed: number): number {
  const ix = Math.floor(x);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fz = z - iz;

  const u = fade(fx);
  const v = fade(fz);

  const n00 = gradientDot(ix, iz, fx, fz, seed);
  const n10 = gradientDot(ix + 1, iz, fx - 1, fz, seed);
  const n01 = gradientDot(ix, iz + 1, fx, fz - 1, seed);
  const n11 = gradientDot(ix + 1, iz + 1, fx - 1, fz - 1, seed);

  const lower = n00 + u * (n10 - n00);
  const upper = n01 + u * (n11 - n01);
  return (lower + v * (upper - lower)) * 1.4142135623730951;
}

export interface FbmOptions {
  /** Octave count. Each octave roughly doubles cost. */
  octaves: number;
  /** Frequency multiplier per octave. ~2 is standard; 1.97 avoids harmonic lock. */
  lacunarity?: number;
  /** Amplitude multiplier per octave. */
  gain?: number;
  /** Starting frequency, in cycles per world unit. */
  frequency?: number;
}

/**
 * Fractional Brownian motion. Output is amplitude-normalised to `[-1, 1]`, so
 * changing `octaves` changes detail without changing overall elevation scale —
 * which matters because octave count is a performance dial we want to be able to
 * turn without retuning the world.
 *
 * `lacunarity` defaults to 1.97 rather than 2.0 deliberately: exact doubling
 * makes octave lattices coincide on integer coordinates, concentrating detail
 * into a visible grid.
 */
export function fbm2(
  x: number,
  z: number,
  seed: number,
  options: FbmOptions,
): number {
  const octaves = Math.max(1, options.octaves | 0);
  const lacunarity = options.lacunarity ?? 1.97;
  const gain = options.gain ?? 0.5;
  let frequency = options.frequency ?? 1;
  let amplitude = 1;
  let total = 0;
  let normalisation = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    total +=
      gradientNoise2(
        x * frequency,
        z * frequency,
        (seed + octave * 0x9e37) >>> 0,
      ) * amplitude;
    normalisation += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return total / normalisation;
}

/**
 * Ridged multifractal. `1 - |noise|` folds the field at zero to create sharp
 * crests, and squaring sharpens them further while pushing valleys flat.
 *
 * Returned in `[0, 1]`, where 1 is a ridge crest. Used for mountain spines that
 * bound the playable region — a ridge you cannot climb reads as world edge far
 * better than an invisible wall does.
 */
export function ridged2(
  x: number,
  z: number,
  seed: number,
  options: FbmOptions,
): number {
  const octaves = Math.max(1, options.octaves | 0);
  const lacunarity = options.lacunarity ?? 2.03;
  const gain = options.gain ?? 0.5;
  let frequency = options.frequency ?? 1;
  let amplitude = 1;
  let total = 0;
  let normalisation = 0;

  for (let octave = 0; octave < octaves; octave += 1) {
    const raw = gradientNoise2(
      x * frequency,
      z * frequency,
      (seed + octave * 0x6f21) >>> 0,
    );
    const crest = 1 - Math.abs(raw);
    total += crest * crest * amplitude;
    normalisation += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return total / normalisation;
}

/**
 * Smooth `0 → 1` ramp with zero derivative at both ends.
 *
 * Used for every blend weight in the terrain field. Linear blends leave a
 * derivative discontinuity at the blend boundary, which the suspension model
 * reads as a step and reports as a bump — an authored anchor should not feel
 * like a pothole at its own edge.
 */
export function smoothStep(
  edge0: number,
  edge1: number,
  value: number,
): number {
  if (edge1 === edge0) {
    return value < edge0 ? 0 : 1;
  }
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Smooth falloff from 1 at the centre of a disc to 0 at `radius`. */
export function radialFalloff(
  distance: number,
  radius: number,
  feather = 0.45,
): number {
  if (radius <= 0) return 0;
  const inner = radius * (1 - Math.min(0.95, Math.max(0, feather)));
  return 1 - smoothStep(inner, radius, distance);
}

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

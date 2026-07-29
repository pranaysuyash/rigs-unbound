import { describe, expect, it } from "vitest";

import { fbm2, gradientNoise2, ridged2, seedFromText } from "./noise";
import { DEFORM_CELL, MAX_DEFORM_CELLS, TerrainField } from "./terrain";
import {
  HOME_SITE,
  RESOLVED_ROUTES,
  RIDGE_OUTER_RADIUS,
  WATER_LEVEL,
  WORLD_ROUTES,
  WORLD_SITES,
  findSite,
} from "./world";

const SEED = "UNBOUND-260725";

function field(seed = SEED): TerrainField {
  return new TerrainField(seed);
}

function findProbePoint(
  predicate: (x: number, z: number) => boolean,
): { x: number; z: number } | null {
  for (let offset = 0; offset < 2; offset += 1) {
    const shift = offset * 2;
    for (let x = -180 + shift; x <= 180; x += 4) {
      for (let z = -180 + shift; z <= 180; z += 4) {
        if (predicate(x, z)) {
          return { x, z };
        }
      }
    }
  }
  return null;
}

describe("noise primitives", () => {
  it("is deterministic for a coordinate and seed", () => {
    const a = gradientNoise2(12.25, -88.5, 42);
    const b = gradientNoise2(12.25, -88.5, 42);
    expect(a).toBe(b);
  });

  it("decorrelates across seeds", () => {
    const seedA = seedFromText("alpha");
    const seedB = seedFromText("beta");
    expect(gradientNoise2(3.5, 7.25, seedA)).not.toBe(
      gradientNoise2(3.5, 7.25, seedB),
    );
  });

  it("keeps gradient noise inside the normalised range", () => {
    let minimum = Infinity;
    let maximum = -Infinity;
    for (let index = 0; index < 4000; index += 1) {
      const value = gradientNoise2(index * 0.37, index * 0.91, 7);
      minimum = Math.min(minimum, value);
      maximum = Math.max(maximum, value);
    }
    expect(minimum).toBeGreaterThanOrEqual(-1.05);
    expect(maximum).toBeLessThanOrEqual(1.05);
  });

  it("keeps fbm amplitude-normalised regardless of octave count", () => {
    // Octave count is a performance dial. If it changed elevation scale, tuning
    // the world would be coupled to tuning performance.
    for (const octaves of [1, 3, 6]) {
      let maximum = 0;
      for (let index = 0; index < 3000; index += 1) {
        maximum = Math.max(
          maximum,
          Math.abs(fbm2(index * 0.13, index * 0.29, 11, { octaves })),
        );
      }
      expect(maximum).toBeLessThanOrEqual(1.05);
    }
  });

  it("keeps ridged noise in [0, 1] with crests near 1", () => {
    let maximum = 0;
    for (let index = 0; index < 3000; index += 1) {
      const value = ridged2(index * 0.17, index * 0.41, 5, { octaves: 3 });
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
      maximum = Math.max(maximum, value);
    }
    expect(maximum).toBeGreaterThan(0.5);
  }, 15000);
});

describe("terrain field determinism", () => {
  it("reproduces identical heights for the same seed", () => {
    const a = field();
    const b = field();
    for (const [x, z] of [
      [0, 0],
      [37.5, -112.25],
      [-158, 140],
      [200, 200],
    ] as const) {
      expect(a.height(x, z)).toBe(b.height(x, z));
    }
  });

  it("produces a different world for a different seed", () => {
    const a = field("seed-one");
    const b = field("seed-two");
    let differences = 0;
    for (let index = 0; index < 40; index += 1) {
      const x = index * 4.5 - 90;
      const z = index * -3.1 + 60;
      if (Math.abs(a.height(x, z) - b.height(x, z)) > 0.5) {
        differences += 1;
      }
    }
    expect(differences).toBeGreaterThan(20);
  });
});

describe("terrain field invariants", () => {
  it("bounds elevation", () => {
    const terrain = field();
    for (let index = 0; index < 2500; index += 1) {
      const angle = index * 0.618;
      const radius = (index / 2500) * RIDGE_OUTER_RADIUS;
      const height = terrain.height(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
      expect(Number.isFinite(height)).toBe(true);
      expect(height).toBeGreaterThanOrEqual(-10);
      expect(height).toBeLessThanOrEqual(150);
    }
  }, 15000);

  it("stays continuous, so suspension never reads a step discontinuity", () => {
    // The world legitimately contains cliffs (ridge spines, the boundary rim), so
    // this asserts *continuity*, not gentleness: shrinking the sample step must
    // shrink the height delta proportionally. A jump discontinuity would keep the
    // delta roughly constant as the step shrinks, and the suspension model would
    // read it as an impact.
    const terrain = field();
    for (let index = 0; index < 600; index += 1) {
      const x = index * 0.83 - 180;
      const z = Math.sin(index * 0.21) * 150;
      const coarse = Math.abs(
        terrain.height(x + 0.4, z) - terrain.height(x, z),
      );
      const fine = Math.abs(terrain.height(x + 0.01, z) - terrain.height(x, z));
      expect(Number.isFinite(coarse)).toBe(true);
      // 0.09 over a 1 cm step is a gradient of 9 — a near-vertical rock face, which
      // is legitimate content. This assertion exists to catch a *discontinuity*, and
      // the `fine < coarse` scaling check below is what actually does that: a jump
      // keeps the delta roughly constant as the step shrinks. The ceiling only has to
      // be loose enough not to outlaw cliffs, which blended biome relief now produces
      // at region transitions by design.
      expect(fine).toBeLessThan(0.09);
      if (coarse > 0.05) {
        expect(fine).toBeLessThan(coarse);
      }
    }
  });

  it("keeps slope finite and below vertical everywhere in the play area", () => {
    const terrain = field();
    let steepest = 0;
    for (let index = 0; index < 2000; index += 1) {
      const angle = index * 2.399963;
      const radius = Math.sqrt(index / 2000) * 190;
      steepest = Math.max(
        steepest,
        terrain.slope(Math.cos(angle) * radius, Math.sin(angle) * radius),
      );
    }
    expect(Number.isFinite(steepest)).toBe(true);
    // Near-vertical rock faces are legitimate content — they are what makes a
    // route matter. The ceiling exists to catch a runaway layer, not to flatten
    // the world, so it sits well above the steepest authored cliff.
    // A runaway layer would produce hundreds, not single digits. 8.5 is an ~83-degree
    // rock face; raising the ceiling to 11 keeps the guard meaningful while allowing
    // the sharper region transitions that blended biome relief creates.
    expect(steepest).toBeLessThan(11);
    // A world with no steep ground has no traversal challenge to gate.
    expect(steepest).toBeGreaterThan(0.7);
  });

  it("holds every authored site at its anchored elevation", () => {
    const terrain = field();
    for (const site of WORLD_SITES) {
      const height = terrain.height(site.x, site.z);
      expect(
        Math.abs(height - site.elevation),
        `${site.id} drifted from its anchor`,
      ).toBeLessThan(1.2);
    }
  });

  it("keeps the spawn area flat and dry", () => {
    const terrain = field();
    for (let index = 0; index < 24; index += 1) {
      const angle = (index / 24) * Math.PI * 2;
      const x = HOME_SITE.x + Math.cos(angle) * 8;
      const z = HOME_SITE.z + Math.sin(angle) * 8;
      expect(terrain.slope(x, z)).toBeLessThan(0.2);
      expect(terrain.height(x, z)).toBeGreaterThan(WATER_LEVEL + 0.5);
    }
  });

  it("submerges Sunken Flats and floods nothing at Home", () => {
    const terrain = field();
    const marsh = findSite("sunken-flats")!;
    expect(terrain.isSubmerged(marsh.x, marsh.z)).toBe(true);
    expect(terrain.surfaceIdAt(marsh.x, marsh.z)).toBe("water");
    expect(terrain.isSubmerged(HOME_SITE.x, HOME_SITE.z)).toBe(false);
  });

  it("raises Launch Ridge far above the valley so it reads as a climb", () => {
    const terrain = field();
    const ridge = findSite("launch-ridge")!;
    const climb =
      terrain.height(ridge.x, ridge.z) -
      terrain.height(HOME_SITE.x, HOME_SITE.z);
    expect(climb).toBeGreaterThan(35);
  });

  it("walls the world with an impassable boundary ridge", () => {
    const terrain = field();
    for (let index = 0; index < 32; index += 1) {
      const angle = (index / 32) * Math.PI * 2;
      const radius = RIDGE_OUTER_RADIUS - 4;
      const height = terrain.height(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
      );
      expect(height).toBeGreaterThan(35);
    }
  });

  it("keeps authored routes on hardpan and drivably graded", () => {
    const terrain = field();
    expect(RESOLVED_ROUTES.length).toBeGreaterThan(0);
    for (const route of RESOLVED_ROUTES) {
      for (let step = 1; step < 20; step += 1) {
        const t = step / 20;
        const x = route.ax + (route.bx - route.ax) * t;
        const z = route.az + (route.bz - route.az) * t;
        expect(terrain.routeWeight(x, z)).toBeGreaterThan(0.9);
        // Authored service pads deliberately override the corridor surface: the
        // quarry is rock and Long Furrow is tilled even where the track crosses.
        const insidePad = WORLD_SITES.some(
          (site) =>
            site.serviceRadius !== undefined &&
            Math.hypot(x - site.x, z - site.z) <= site.serviceRadius,
        );
        // The Sunken Flats causeway deliberately runs below the waterline for
        // its final stretch; water outranks the corridor surface.
        if (!insidePad && !terrain.isSubmerged(x, z)) {
          expect(terrain.surfaceIdAt(x, z)).toBe("track");
        }
        // A graded corridor must never present a wall to the weakest rig.
        expect(
          terrain.slope(x, z),
          `route slope too steep at ${x.toFixed(1)},${z.toFixed(1)}`,
        ).toBeLessThan(0.4);
      }
    }
  });

  it("grade-limits every route profile by construction", () => {
    // This is the reachability guarantee, asserted rather than assumed: if a
    // future site placement makes a route impossible to grade, this fails instead
    // of shipping an unreachable landmark.
    expect(field().steepestRouteGrade()).toBeLessThan(0.17);
  });

  it("connects every site except the deliberate terrain gate", () => {
    const routed = new Set<string>();
    for (const segment of WORLD_ROUTES) {
      routed.add(segment.from);
      routed.add(segment.to);
    }
    const unrouted = WORLD_SITES.filter((site) => !routed.has(site.id)).map(
      (site) => site.id,
    );
    // Launch Ridge is intentionally roadless — reaching it is the progression
    // gate. North Field is a bare survey site meant to be found off-road, not
    // driven to. Marsh Depot is reached by the Sunken Flats causeway, a
    // conditional community passage rather than an authored WORLD_ROUTE (see
    // settlement-needs.ts) — before that passage exists the water and ground
    // between are still the player's to read. Anything *else* unrouted is an
    // authoring mistake.
    expect(unrouted).toEqual(["north-field", "marsh-depot", "launch-ridge"]);
  });

  it("reports a signed grade that agrees with travel direction", () => {
    const terrain = field();
    const ridge = findSite("launch-ridge")!;
    // Heading from the valley toward the ridge, sampled partway up the slope.
    const midX = (HOME_SITE.x + ridge.x) * 0.5;
    const midZ = (HOME_SITE.z + ridge.z) * 0.5;
    const length = Math.hypot(ridge.x - midX, ridge.z - midZ);
    const dirX = (ridge.x - midX) / length;
    const dirZ = (ridge.z - midZ) / length;
    const uphill = terrain.gradeAlong(midX, midZ, dirX, dirZ);
    const downhill = terrain.gradeAlong(midX, midZ, -dirX, -dirZ);
    expect(uphill).toBeCloseTo(-downhill, 6);
  });
});

describe("terrain surfaces", () => {
  it("assigns each authored service pad its authored surface", () => {
    const terrain = field();
    for (const site of WORLD_SITES) {
      if (!site.padSurface || !site.serviceRadius) continue;
      if (site.elevation < WATER_LEVEL) continue;
      expect(terrain.surfaceIdAt(site.x, site.z), site.id).toBe(
        site.padSurface,
      );
    }
  });

  it("exposes a plausible spread of surfaces across the world", () => {
    const terrain = field();
    const seen = new Set<string>();
    for (let index = 0; index < 3000; index += 1) {
      const angle = index * 2.399963;
      const radius = Math.sqrt(index / 3000) * 190;
      seen.add(
        terrain.surfaceIdAt(Math.cos(angle) * radius, Math.sin(angle) * radius),
      );
    }
    // A world with only one or two ground types cannot make grip a mechanic.
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

describe("terrain deformation", () => {
  it("cuts deformable ground and reads the cut back", () => {
    const terrain = field();
    const site = findSite("long-furrow")!;
    const before = terrain.height(site.x, site.z);
    expect(terrain.deform(site.x, site.z, -0.25, 1)).toBe(true);
    const after = terrain.height(site.x, site.z);
    expect(after).toBeLessThan(before);
    expect(before - after).toBeGreaterThan(0.05);
  });

  it("reclassifies deeply cut gentle ground as tilled soil", () => {
    const terrain = field();
    const point = findProbePoint((x, z) => {
      return (
        terrain.surfaceIdAt(x, z) === "grass" &&
        terrain.slope(x, z) <= 0.25 &&
        terrain.routeWeight(x, z) <= 0.5 &&
        !terrain.isSubmerged(x, z)
      );
    });
    expect(point).not.toBeNull();
    const { x, z } = point!;

    expect(terrain.surfaceIdAt(x, z)).toBe("grass");
    terrain.deform(x, z, -0.2, 1);
    terrain.deform(x, z, -0.2, 1);
    expect(terrain.surfaceIdAt(x, z)).toBe("tilled");
  });

  it("keeps steep deformed ground in its natural classification", () => {
    const terrain = field();
    const point = findProbePoint((x, z) => {
      return (
        terrain.slope(x, z) > 0.25 &&
        terrain.slope(x, z) < 0.62 &&
        terrain.routeWeight(x, z) <= 0.5 &&
        !terrain.isSubmerged(x, z)
      );
    });
    expect(point).not.toBeNull();
    const { x, z } = point!;

    terrain.deform(x, z, -0.2, 1);
    terrain.deform(x, z, -0.2, 1);
    expect(terrain.surfaceIdAt(x, z)).not.toBe("tilled");
  });

  it("keeps shallowly cut grass as grass — single pass is below the tilled threshold", () => {
    const terrain = field();
    const point = findProbePoint((x, z) => {
      return (
        terrain.surfaceIdAt(x, z) === "grass" &&
        terrain.slope(x, z) <= 0.25 &&
        terrain.routeWeight(x, z) <= 0.5 &&
        !terrain.isSubmerged(x, z)
      );
    });
    expect(point).not.toBeNull();
    const { x, z } = point!;

    expect(terrain.surfaceIdAt(x, z)).toBe("grass");
    // One plough pass ≈ -0.13 m; the tilled threshold is DEFORM_MIN × 0.6
    // ≈ -0.252 m. A single pass does not cross it.
    terrain.deform(x, z, -0.13, 1);
    expect(terrain.surfaceIdAt(x, z)).toBe("grass");
  });

  it("does not classify fill deformation as tilled — positive delta moves away from threshold", () => {
    const terrain = field();
    const point = findProbePoint((x, z) => {
      return (
        terrain.surfaceIdAt(x, z) === "grass" &&
        terrain.slope(x, z) <= 0.25 &&
        terrain.routeWeight(x, z) <= 0.5 &&
        !terrain.isSubmerged(x, z)
      );
    });
    expect(point).not.toBeNull();
    const { x, z } = point!;

    expect(terrain.surfaceIdAt(x, z)).toBe("grass");
    // Fill deformation (positive delta) raises the cumulative value above
    // the tilled threshold — it should never produce tilled soil.
    terrain.deform(x, z, 0.15, 1);
    expect(terrain.surfaceIdAt(x, z)).toBe("grass");
  });

  it("refuses to carve non-deformable ground", () => {
    const terrain = field();
    const quarry = findSite("quarry-shelf")!;
    expect(terrain.surfaceIdAt(quarry.x, quarry.z)).toBe("rock");
    expect(terrain.deform(quarry.x, quarry.z, -0.3, 1)).toBe(false);
    expect(terrain.deformationCount()).toBe(0);
  });

  it("clamps cumulative deformation depth", () => {
    const terrain = field();
    const site = findSite("long-furrow")!;
    const before = terrain.height(site.x, site.z);
    for (let index = 0; index < 200; index += 1) {
      terrain.deform(site.x, site.z, -0.3, 0);
    }
    expect(before - terrain.height(site.x, site.z)).toBeLessThan(0.5);
  });

  it("bounds the stored cell count", () => {
    const terrain = field();
    const site = findSite("long-furrow")!;
    for (let index = 0; index < MAX_DEFORM_CELLS + 800; index += 1) {
      terrain.deform(
        site.x + (index % 60) * DEFORM_CELL,
        site.z + Math.floor(index / 60) * DEFORM_CELL,
        -0.2,
        0,
      );
    }
    expect(terrain.deformationCount()).toBeLessThanOrEqual(MAX_DEFORM_CELLS);
  });

  it("round-trips deformation through the save representation", () => {
    const terrain = field();
    const site = findSite("long-furrow")!;
    for (let index = 0; index < 12; index += 1) {
      terrain.deform(site.x + index * 1.6, site.z, -0.2, 1);
    }
    const entries = terrain.deformationEntries();
    expect(entries.length).toBeGreaterThan(10);
    const probeX = site.x + 4;
    const expected = terrain.height(probeX, site.z);

    const restored = field();
    restored.loadDeformations(entries);
    expect(restored.height(probeX, site.z)).toBeCloseTo(expected, 2);
  });

  it("interpolates deformation smoothly rather than in cell steps", () => {
    const terrain = field();
    const site = findSite("long-furrow")!;
    terrain.deform(site.x, site.z, -0.4, 0);
    let maximumStep = 0;
    let previous = terrain.height(site.x - 4, site.z);
    for (let offset = -4; offset <= 4; offset += 0.1) {
      const current = terrain.height(site.x + offset, site.z);
      maximumStep = Math.max(maximumStep, Math.abs(current - previous));
      previous = current;
    }
    expect(maximumStep).toBeLessThan(0.1);
  });
});

describe("terrain raymarch", () => {
  it("reports a clear line high above flat ground", () => {
    const terrain = field();
    const y = terrain.height(HOME_SITE.x, HOME_SITE.z) + 40;
    expect(
      terrain.raymarchBlocked(
        HOME_SITE.x,
        y,
        HOME_SITE.z,
        HOME_SITE.x + 30,
        y,
        HOME_SITE.z,
      ),
    ).toBe(1);
  });

  it("reports a blocked line through a ridge", () => {
    const terrain = field();
    const ridge = findSite("launch-ridge")!;
    const fromY = terrain.height(HOME_SITE.x, HOME_SITE.z) + 3;
    const blocked = terrain.raymarchBlocked(
      HOME_SITE.x,
      fromY,
      HOME_SITE.z,
      ridge.x,
      fromY,
      ridge.z,
      24,
    );
    expect(blocked).toBeLessThan(1);
  });
});

describe("terrain bulk sampling", () => {
  it("matches point sampling on the grid it returns", () => {
    const terrain = field();
    const cells = 8;
    const step = 4;
    const heights = terrain.sampleHeightGrid(-16, -16, cells, step);
    expect(heights.length).toBe((cells + 1) * (cells + 1));
    for (let iz = 0; iz <= cells; iz += 1) {
      for (let ix = 0; ix <= cells; ix += 1) {
        expect(heights[iz * (cells + 1) + ix]).toBeCloseTo(
          terrain.height(-16 + ix * step, -16 + iz * step),
          5,
        );
      }
    }
  });
});

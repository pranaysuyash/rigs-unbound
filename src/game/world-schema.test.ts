import { describe, expect, it } from "vitest";

import { RIG_PROFILES } from "./contracts";
import {
  RESOLVED_ROUTES,
  WORLD_ROUTES,
  WORLD_SITES,
  WORLD_SITE_VERBS,
  WORLD_STRUCTURE_PARTS,
  type WorldStructurePart,
} from "./world";

describe("authored world schema", () => {
  it("keeps each site identity and promised verb within the canonical tables", () => {
    const ids = WORLD_SITES.map((site) => site.id);

    expect(new Set(ids)).toHaveLength(ids.length);
    expect(
      WORLD_SITES.every((site) => WORLD_SITE_VERBS.includes(site.verb)),
    ).toBe(true);
  });

  it("resolves every authored route instead of silently dropping invalid endpoints", () => {
    expect(RESOLVED_ROUTES).toHaveLength(WORLD_ROUTES.length);
  });
});

describe("authored site landmarks", () => {
  /** Widest authored rig footprint: `track * 0.5 + 0.25` (state.ts). */
  const RIG_RADIUS =
    Math.max(...Object.values(RIG_PROFILES).map((profile) => profile.track)) *
      0.5 +
    0.25;

  /** Conservative circumscribed radius, so small authored rotations cannot matter. */
  function blockingRadius(part: WorldStructurePart): number {
    if (part.shape.kind === "box") {
      return Math.hypot(part.shape.width, part.shape.depth) * 0.5;
    }
    if (part.shape.kind === "cylinder") {
      return Math.max(
        part.shape.radius,
        part.shape.radiusTop ?? 0,
        part.shape.radiusBottom ?? 0,
      );
    }
    return part.shape.radius;
  }

  /**
   * Every site is a route endpoint, so landmarks must not ring the place they mark.
   * Discovery fires inside `discoverRadius`, which is where an approaching rig has
   * to be able to get — not the exact centre, which authored barns have always
   * occupied. This walks rays inward from outside the footprint and counts the
   * approach bearings that stay clear of every collider the whole way.
   */
  it("leaves open approach bearings into the discovery radius of every site", () => {
    const BEARINGS = 72;

    for (const site of WORLD_SITES) {
      const colliders = WORLD_STRUCTURE_PARTS.filter(
        (part) => part.siteId === site.id && part.rigCollider,
      ).map((part) => ({
        x: part.localX,
        z: part.localZ,
        radius: blockingRadius(part) + RIG_RADIUS,
      }));

      let open = 0;
      for (let index = 0; index < BEARINGS; index += 1) {
        const angle = (index / BEARINGS) * Math.PI * 2;
        const dirX = Math.cos(angle);
        const dirZ = Math.sin(angle);
        let clear = true;
        for (
          let distance = site.anchorRadius + RIG_RADIUS;
          distance >= site.discoverRadius;
          distance -= 0.5
        ) {
          const x = dirX * distance;
          const z = dirZ * distance;
          if (
            colliders.some(
              (part) => Math.hypot(x - part.x, z - part.z) < part.radius,
            )
          ) {
            clear = false;
            break;
          }
        }
        if (clear) open += 1;
      }

      // A quarter of the compass keeps arrival forgiving rather than a threading
      // exercise, and still fails loudly if a landmark encircles a site.
      expect(
        open / BEARINGS,
        `${site.id} open approach fraction`,
      ).toBeGreaterThan(0.25);
    }
  });

  it("gives every site exactly one discovery signal, so no place is unmarked", () => {
    for (const site of WORLD_SITES) {
      const signals = WORLD_STRUCTURE_PARTS.filter(
        (part) => part.siteId === site.id && part.discoverySignal === true,
      );
      expect(signals, `site ${site.id} discovery signals`).toHaveLength(1);
    }
  });

  it("keeps every landmark inside the site footprint it belongs to", () => {
    for (const part of WORLD_STRUCTURE_PARTS) {
      const site = WORLD_SITES.find((entry) => entry.id === part.siteId);
      expect(site, `site for ${part.id}`).toBeDefined();
      const reach = Math.hypot(part.localX, part.localZ) + blockingRadius(part);
      expect(reach, `${part.id} reach`).toBeLessThanOrEqual(site!.anchorRadius);
    }
  });

  it("raises a signal high enough to read over the terrain it stands on", () => {
    for (const part of WORLD_STRUCTURE_PARTS) {
      if (!part.discoverySignal) continue;
      expect(part.localY, `${part.id} height`).toBeGreaterThanOrEqual(10);
    }
  });
});

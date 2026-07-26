/**
 * Solver-independent scene queries.
 *
 * Gameplay state must never depend on Three.js meshes or a particular physics
 * engine. Cameras still need a truthful view of the authored world, so this
 * module composes the project-owned terrain, procedural obstacle field, felled
 * state, and authored structure records into one typed nearest-hit result.
 */

import {
  rockVisualHalfHeight,
  treeCrownCenterY,
  treeCrownRadius,
  treeTrunkHeight,
  type ObstacleField,
} from "./collision";
import type { TerrainField } from "./terrain";
import {
  WORLD_STRUCTURE_PARTS,
  findSite,
  type WorldStructurePart,
} from "./world";

const EPSILON = 1e-7;

export interface ScenePoint {
  x: number;
  y: number;
  z: number;
}

export type CameraObstructionSource = "terrain" | "obstacle" | "structure";

export interface CameraObstructionHit {
  source: CameraObstructionSource;
  id: string;
  /** Fraction along the focus→camera segment, in the closed range 0..1. */
  fraction: number;
  /** Distance from the focus to the first hit, in metres. */
  distance: number;
}

export interface CameraObstructionOptions {
  includeTerrain?: boolean;
  includeObstacles?: boolean;
  includeStructures?: boolean;
}

export interface SceneQuerySource {
  terrain: TerrainField;
  obstacles: Pick<ObstacleField, "near">;
  felledObstacles: ReadonlySet<string>;
}

interface Bounds {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
}

interface StructureWorldCentre {
  x: number;
  y: number;
  z: number;
}

function structureWorldCentre(
  part: WorldStructurePart,
  terrain: TerrainField,
): StructureWorldCentre | null {
  const site = findSite(part.siteId);
  if (!site) return null;
  const baseY = terrain.height(site.x, site.z);
  return {
    x: site.x + part.localX,
    y: baseY + part.localY,
    z: site.z + part.localZ,
  };
}

function finitePoint(point: ScenePoint): boolean {
  return (
    Number.isFinite(point.x) &&
    Number.isFinite(point.y) &&
    Number.isFinite(point.z)
  );
}

function segmentLength(from: ScenePoint, to: ScenePoint): number {
  return Math.hypot(to.x - from.x, to.y - from.y, to.z - from.z);
}

/** First hit against an axis-aligned box expanded by the camera radius. */
export function firstSegmentAabbHit(
  from: ScenePoint,
  to: ScenePoint,
  bounds: Bounds,
  radius = 0,
): number | null {
  let tMinimum = 0;
  let tMaximum = 1;

  for (const [origin, delta, minimum, maximum] of [
    [from.x, to.x - from.x, bounds.minX - radius, bounds.maxX + radius],
    [from.y, to.y - from.y, bounds.minY - radius, bounds.maxY + radius],
    [from.z, to.z - from.z, bounds.minZ - radius, bounds.maxZ + radius],
  ] as const) {
    if (Math.abs(delta) <= EPSILON) {
      if (origin < minimum || origin > maximum) return null;
      continue;
    }

    const inverse = 1 / delta;
    let entry = (minimum - origin) * inverse;
    let exit = (maximum - origin) * inverse;
    if (entry > exit) [entry, exit] = [exit, entry];
    tMinimum = Math.max(tMinimum, entry);
    tMaximum = Math.min(tMaximum, exit);
    if (tMinimum > tMaximum) return null;
  }

  return tMinimum >= 0 && tMinimum <= 1 ? tMinimum : null;
}

/** First hit against a sphere expanded by the camera radius. */
export function firstSegmentSphereHit(
  from: ScenePoint,
  to: ScenePoint,
  centre: ScenePoint,
  radius: number,
): number | null {
  const expanded = Math.max(0, radius);
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dz = to.z - from.z;
  const mx = from.x - centre.x;
  const my = from.y - centre.y;
  const mz = from.z - centre.z;
  const a = dx * dx + dy * dy + dz * dz;
  const c = mx * mx + my * my + mz * mz - expanded * expanded;

  if (c <= 0) return 0;
  if (a <= EPSILON) return null;

  const b = mx * dx + my * dy + mz * dz;
  if (b > 0) return null;
  const discriminant = b * b - a * c;
  if (discriminant < 0) return null;
  const fraction = (-b - Math.sqrt(discriminant)) / a;
  return fraction >= 0 && fraction <= 1 ? fraction : null;
}

function structureBounds(
  part: WorldStructurePart,
  terrain: TerrainField,
): Bounds | null {
  const centre = structureWorldCentre(part, terrain);
  if (!centre) return null;

  let halfX: number;
  let halfY: number;
  let halfZ: number;
  if (part.shape.kind === "box") {
    halfX = part.shape.width * 0.5;
    halfY = part.shape.height * 0.5;
    halfZ = part.shape.depth * 0.5;
  } else {
    // AABB is intentionally conservative for cylinders/cones. Camera collision
    // should pull in a little early rather than expose half a silo through the
    // near plane.
    halfX = part.shape.radius;
    halfY = part.shape.height * 0.5;
    halfZ =
      part.shape.radius *
      (part.shape.kind === "cone" ? (part.shape.scaleZ ?? 1) : 1);
    const rotated = Math.max(halfX, halfZ);
    halfX = rotated;
    halfZ = rotated;
  }

  return {
    minX: centre.x - halfX,
    minY: centre.y - halfY,
    minZ: centre.z - halfZ,
    maxX: centre.x + halfX,
    maxY: centre.y + halfY,
    maxZ: centre.z + halfZ,
  };
}

function nearer(
  current: CameraObstructionHit | null,
  source: CameraObstructionSource,
  id: string,
  fraction: number | null,
  distance: number,
): CameraObstructionHit | null {
  if (fraction === null || fraction < 0 || fraction > 1) return current;
  if (current && current.fraction <= fraction) return current;
  return {
    source,
    id,
    fraction,
    distance: fraction * distance,
  };
}

export function queryCameraObstruction(
  source: SceneQuerySource,
  from: ScenePoint,
  to: ScenePoint,
  cameraRadius = 0.45,
  options: CameraObstructionOptions = {},
): CameraObstructionHit | null {
  if (!finitePoint(from) || !finitePoint(to)) return null;
  const distance = segmentLength(from, to);
  const radius = Math.max(0, Number.isFinite(cameraRadius) ? cameraRadius : 0);
  let nearest: CameraObstructionHit | null = null;

  if (options.includeTerrain !== false && distance > EPSILON) {
    const samples = Math.max(12, Math.ceil(distance / 1.4));
    const fraction = source.terrain.raymarchBlocked(
      from.x,
      from.y,
      from.z,
      to.x,
      to.y,
      to.z,
      samples,
      radius + 0.35,
    );
    if (fraction < 1) {
      nearest = nearer(nearest, "terrain", "terrain", fraction, distance);
    }
  }

  if (options.includeStructures !== false) {
    for (const part of WORLD_STRUCTURE_PARTS) {
      if (!part.cameraOccluder) continue;
      const bounds = structureBounds(part, source.terrain);
      if (!bounds) continue;
      nearest = nearer(
        nearest,
        "structure",
        part.id,
        firstSegmentAabbHit(from, to, bounds, radius),
        distance,
      );
    }
  }

  if (options.includeObstacles !== false) {
    const middleX = (from.x + to.x) * 0.5;
    const middleZ = (from.z + to.z) * 0.5;
    for (const obstacle of source.obstacles.near(
      middleX,
      middleZ,
      distance * 0.5 + 8,
    )) {
      if (obstacle.kind === "tree" && source.felledObstacles.has(obstacle.id)) {
        // Once felled, a tree becomes a low traversal memory rather than a
        // camera-height wall. Terrain clearance still keeps the camera above it.
        continue;
      }

      if (obstacle.kind === "tree") {
        const trunkHeight = treeTrunkHeight(obstacle);
        nearest = nearer(
          nearest,
          "obstacle",
          obstacle.id,
          firstSegmentAabbHit(
            from,
            to,
            {
              minX: obstacle.x - obstacle.radius,
              minY: obstacle.groundY,
              minZ: obstacle.z - obstacle.radius,
              maxX: obstacle.x + obstacle.radius,
              maxY: obstacle.groundY + trunkHeight,
              maxZ: obstacle.z + obstacle.radius,
            },
            radius,
          ),
          distance,
        );
        const crownRadius = treeCrownRadius(obstacle);
        nearest = nearer(
          nearest,
          "obstacle",
          obstacle.id,
          firstSegmentSphereHit(
            from,
            to,
            {
              x: obstacle.x,
              y: treeCrownCenterY(obstacle),
              z: obstacle.z,
            },
            crownRadius * 1.3 + radius,
          ),
          distance,
        );
      } else {
        nearest = nearer(
          nearest,
          "obstacle",
          obstacle.id,
          firstSegmentSphereHit(
            from,
            to,
            {
              x: obstacle.x,
              y: obstacle.groundY + obstacle.radius * 0.35,
              z: obstacle.z,
            },
            Math.max(obstacle.radius, rockVisualHalfHeight(obstacle)) + radius,
          ),
          distance,
        );
      }
    }
  }

  return nearest;
}

export interface StructureCollisionBody {
  x: number;
  z: number;
  speed: number;
  heading: number;
}

export interface StructureCollisionOutcome {
  hit: boolean;
  impactSpeed: number;
  blockedBy: WorldStructurePart | null;
}

const NO_STRUCTURE_COLLISION: StructureCollisionOutcome = {
  hit: false,
  impactSpeed: 0,
  blockedBy: null,
};

/**
 * Resolve a circular rig footprint against canonical authored structures.
 *
 * The same records drive rendering and camera queries, so a visible landmark
 * cannot become renderer-only scenery that rigs pass through. Mutating the body
 * here mirrors procedural-obstacle resolution while keeping solver choice out
 * of authored-world truth.
 */
export function resolveRigStructureCollision(
  source: Pick<SceneQuerySource, "terrain">,
  rig: StructureCollisionBody,
  rigRadius: number,
): StructureCollisionOutcome {
  const radius = Math.max(0, Number.isFinite(rigRadius) ? rigRadius : 0);
  let outcome: StructureCollisionOutcome = NO_STRUCTURE_COLLISION;

  const registerHit = (
    part: WorldStructurePart,
    normalX: number,
    normalZ: number,
  ): void => {
    const forwardX = Math.sin(rig.heading);
    const forwardZ = Math.cos(rig.heading);
    const closing = Math.max(
      0,
      -(forwardX * normalX + forwardZ * normalZ) * rig.speed,
    );
    if (closing > 0) {
      const retained = Math.min(
        0.75,
        Math.max(-0.15, 1 - closing / Math.max(1, Math.abs(rig.speed))),
      );
      rig.speed *= retained;
    }
    if (!outcome.hit || closing >= outcome.impactSpeed) {
      outcome = {
        hit: true,
        impactSpeed: Math.max(outcome.impactSpeed, closing),
        blockedBy: part,
      };
    }
  };

  for (const part of WORLD_STRUCTURE_PARTS) {
    if (!part.rigCollider) continue;
    const centre = structureWorldCentre(part, source.terrain);
    if (!centre) continue;

    if (part.shape.kind === "box") {
      const rotation = part.rotationY ?? 0;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);
      const deltaX = rig.x - centre.x;
      const deltaZ = rig.z - centre.z;
      const localX = cosine * deltaX - sine * deltaZ;
      const localZ = sine * deltaX + cosine * deltaZ;
      const extentX = part.shape.width * 0.5 + radius;
      const extentZ = part.shape.depth * 0.5 + radius;
      if (Math.abs(localX) >= extentX || Math.abs(localZ) >= extentZ) {
        continue;
      }

      const penetrationX = extentX - Math.abs(localX);
      const penetrationZ = extentZ - Math.abs(localZ);
      let localNormalX = 0;
      let localNormalZ = 0;
      let overlap: number;
      if (penetrationX < penetrationZ) {
        localNormalX = localX < 0 ? -1 : 1;
        overlap = penetrationX;
      } else {
        localNormalZ = localZ < 0 ? -1 : 1;
        overlap = penetrationZ;
      }
      const normalX = cosine * localNormalX + sine * localNormalZ;
      const normalZ = -sine * localNormalX + cosine * localNormalZ;
      rig.x += normalX * (overlap + 0.001);
      rig.z += normalZ * (overlap + 0.001);
      registerHit(part, normalX, normalZ);
      continue;
    }

    const minimum = part.shape.radius + radius;
    const deltaX = rig.x - centre.x;
    const deltaZ = rig.z - centre.z;
    const distance = Math.hypot(deltaX, deltaZ);
    if (distance >= minimum) continue;
    const normalX =
      distance > EPSILON ? deltaX / distance : -Math.sin(rig.heading);
    const normalZ =
      distance > EPSILON ? deltaZ / distance : -Math.cos(rig.heading);
    const overlap = minimum - distance;
    rig.x += normalX * (overlap + 0.001);
    rig.z += normalZ * (overlap + 0.001);
    registerHit(part, normalX, normalZ);
  }

  return outcome;
}

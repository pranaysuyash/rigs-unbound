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
  sweepCircleAgainstCircle,
  treeCrownCenterY,
  treeCrownRadius,
  treeTrunkHeight,
  type Obstacle,
  type ObstacleField,
  type PlanarPoint,
} from "./collision";
import type { TerrainField } from "./terrain";
import {
  WORLD_SITES,
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
  /** Optional persistent obstacles that are not part of procedural generation. */
  incidentObstaclesNear?: (
    x: number,
    z: number,
    range: number,
  ) => readonly Obstacle[];
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

/**
 * Collider parts grouped by the site they belong to, with the radius that bounds
 * them, precomputed once at module load.
 *
 * `resolveRigStructureCollision` runs inside the fixed-step kernel. Walking every
 * authored part every step means one `findSite` scan and one `terrain.height`
 * evaluation per part per step, and `terrain.height` is domain-warped fBm — the
 * most expensive pure function in the project. That cost was tolerable while a
 * handful of parts existed and became the dominant per-step cost as soon as the
 * sites were given real landmarks. A rig is near at most one site, so grouping
 * lets the whole valley be rejected with one distance test per site and evaluates
 * terrain height once per *nearby site* rather than once per part.
 *
 * This is a pure reorganisation of the same arithmetic: the parts iterated, the
 * order they are iterated in, and the centre each one resolves to are unchanged.
 */
interface SiteColliderGroup {
  siteX: number;
  siteZ: number;
  /** Bounds every collider in the group, measured from the site centre. */
  reach: number;
  parts: readonly WorldStructurePart[];
}

function partReach(part: WorldStructurePart): number {
  const half =
    part.shape.kind === "box"
      ? Math.hypot(part.shape.width, part.shape.depth) * 0.5
      : part.shape.radius;
  return Math.hypot(part.localX, part.localZ) + half;
}

const SITE_COLLIDER_GROUPS: readonly SiteColliderGroup[] = WORLD_SITES.map(
  (site) => {
    const parts = WORLD_STRUCTURE_PARTS.filter(
      (part) => part.siteId === site.id && part.rigCollider,
    );
    return {
      siteX: site.x,
      siteZ: site.z,
      reach: parts.reduce(
        (widest, part) => Math.max(widest, partReach(part)),
        0,
      ),
      parts,
    };
  },
).filter((group) => group.parts.length > 0);

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
    const queryRange = distance * 0.5 + 8;
    const obstacles = [
      ...source.obstacles.near(middleX, middleZ, queryRange),
      ...(source.incidentObstaclesNear?.(middleX, middleZ, queryRange) ?? []),
    ];
    for (const obstacle of obstacles) {
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
  normalX: number;
  normalZ: number;
  swept: boolean;
}

const NO_STRUCTURE_COLLISION: StructureCollisionOutcome = {
  hit: false,
  impactSpeed: 0,
  blockedBy: null,
  normalX: 0,
  normalZ: 0,
  swept: false,
};

interface PlanarAabbSweepHit {
  fraction: number;
  normalX: number;
  normalZ: number;
  startedInside: boolean;
}

function sweepPointAgainstAabb(
  from: PlanarPoint,
  to: PlanarPoint,
  extentX: number,
  extentZ: number,
): PlanarAabbSweepHit | null {
  const inside = Math.abs(from.x) <= extentX && Math.abs(from.z) <= extentZ;
  const moveX = to.x - from.x;
  const moveZ = to.z - from.z;
  if (inside) {
    const penetrationX = extentX - Math.abs(from.x);
    const penetrationZ = extentZ - Math.abs(from.z);
    if (penetrationX < penetrationZ) {
      return {
        fraction: 0,
        normalX: from.x < 0 ? -1 : 1,
        normalZ: 0,
        startedInside: true,
      };
    }
    return {
      fraction: 0,
      normalX: 0,
      normalZ: from.z < 0 ? -1 : 1,
      startedInside: true,
    };
  }

  let entry = 0;
  let exit = 1;
  let normalX = 0;
  let normalZ = 0;
  for (const axis of [
    { origin: from.x, movement: moveX, extent: extentX, axis: "x" },
    { origin: from.z, movement: moveZ, extent: extentZ, axis: "z" },
  ] as const) {
    if (Math.abs(axis.movement) <= EPSILON) {
      if (axis.origin < -axis.extent || axis.origin > axis.extent) return null;
      continue;
    }
    let near = (-axis.extent - axis.origin) / axis.movement;
    let far = (axis.extent - axis.origin) / axis.movement;
    const nearNormal = axis.movement > 0 ? -1 : 1;
    if (near > far) {
      [near, far] = [far, near];
    }
    if (near > entry) {
      entry = near;
      normalX = axis.axis === "x" ? nearNormal : 0;
      normalZ = axis.axis === "z" ? nearNormal : 0;
    }
    exit = Math.min(exit, far);
    if (entry > exit) return null;
  }

  if (entry < 0 || entry > 1) return null;
  return {
    fraction: entry,
    normalX,
    normalZ,
    startedInside: false,
  };
}

function pointToSegmentDistance(
  pointX: number,
  pointZ: number,
  from: PlanarPoint,
  to: PlanarPoint,
): number {
  const moveX = to.x - from.x;
  const moveZ = to.z - from.z;
  const lengthSquared = moveX * moveX + moveZ * moveZ;
  if (lengthSquared <= EPSILON) {
    return Math.hypot(pointX - from.x, pointZ - from.z);
  }
  const fraction = Math.max(
    0,
    Math.min(
      1,
      ((pointX - from.x) * moveX + (pointZ - from.z) * moveZ) / lengthSquared,
    ),
  );
  return Math.hypot(
    pointX - (from.x + moveX * fraction),
    pointZ - (from.z + moveZ * fraction),
  );
}

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
  previous: PlanarPoint = rig,
): StructureCollisionOutcome {
  const radius = Math.max(0, Number.isFinite(rigRadius) ? rigRadius : 0);
  let outcome: StructureCollisionOutcome = NO_STRUCTURE_COLLISION;
  const path = {
    from: { x: previous.x, z: previous.z },
    to: { x: rig.x, z: rig.z },
  };

  const registerHit = (
    part: WorldStructurePart,
    normalX: number,
    normalZ: number,
    swept: boolean,
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
        normalX,
        normalZ,
        swept,
      };
    }
  };

  type Candidate = {
    part: WorldStructurePart;
    centreX: number;
    centreZ: number;
    fraction: number;
    normalX: number;
    normalZ: number;
    startedInside: boolean;
  };
  const candidates: Candidate[] = [];

  for (const group of SITE_COLLIDER_GROUPS) {
    if (
      pointToSegmentDistance(group.siteX, group.siteZ, path.from, path.to) >
      group.reach + radius
    ) {
      continue;
    }
    // One fBm evaluation per nearby site rather than one per part.
    const baseY = source.terrain.height(group.siteX, group.siteZ);

    for (const part of group.parts) {
      const centre = {
        x: group.siteX + part.localX,
        y: baseY + part.localY,
        z: group.siteZ + part.localZ,
      };

      if (part.shape.kind === "box") {
        const rotation = part.rotationY ?? 0;
        const cosine = Math.cos(rotation);
        const sine = Math.sin(rotation);
        const fromDeltaX = path.from.x - centre.x;
        const fromDeltaZ = path.from.z - centre.z;
        const toDeltaX = path.to.x - centre.x;
        const toDeltaZ = path.to.z - centre.z;
        const localFrom = {
          x: cosine * fromDeltaX - sine * fromDeltaZ,
          z: sine * fromDeltaX + cosine * fromDeltaZ,
        };
        const localTo = {
          x: cosine * toDeltaX - sine * toDeltaZ,
          z: sine * toDeltaX + cosine * toDeltaZ,
        };
        const extentX = part.shape.width * 0.5 + radius;
        const extentZ = part.shape.depth * 0.5 + radius;
        const hit = sweepPointAgainstAabb(localFrom, localTo, extentX, extentZ);
        if (!hit) continue;
        candidates.push({
          part,
          centreX: centre.x,
          centreZ: centre.z,
          fraction: hit.fraction,
          normalX: cosine * hit.normalX + sine * hit.normalZ,
          normalZ: -sine * hit.normalX + cosine * hit.normalZ,
          startedInside: hit.startedInside,
        });
        continue;
      }

      const minimum = part.shape.radius + radius;
      const hit = sweepCircleAgainstCircle(path.from, path.to, centre, minimum);
      if (!hit) continue;
      candidates.push({
        part,
        centreX: centre.x,
        centreZ: centre.z,
        fraction: hit.fraction,
        normalX: hit.normalX,
        normalZ: hit.normalZ,
        startedInside: hit.startedInside,
      });
    }
  }

  candidates.sort(
    (first, second) =>
      first.fraction - second.fraction ||
      first.part.id.localeCompare(second.part.id),
  );

  for (const candidate of candidates) {
    const moveX = path.to.x - path.from.x;
    const moveZ = path.to.z - path.from.z;
    if (!candidate.startedInside) {
      const movementLength = Math.hypot(moveX, moveZ);
      const skinFraction =
        movementLength > EPSILON
          ? Math.min(candidate.fraction, 0.001 / movementLength)
          : 0;
      const resolvedFraction = Math.max(0, candidate.fraction - skinFraction);
      rig.x = path.from.x + moveX * resolvedFraction;
      rig.z = path.from.z + moveZ * resolvedFraction;
    }

    let normalX = candidate.normalX;
    let normalZ = candidate.normalZ;
    if (candidate.part.shape.kind === "box") {
      const rotation = candidate.part.rotationY ?? 0;
      const cosine = Math.cos(rotation);
      const sine = Math.sin(rotation);
      const deltaX = rig.x - candidate.centreX;
      const deltaZ = rig.z - candidate.centreZ;
      const localX = cosine * deltaX - sine * deltaZ;
      const localZ = sine * deltaX + cosine * deltaZ;
      const extentX = candidate.part.shape.width * 0.5 + radius;
      const extentZ = candidate.part.shape.depth * 0.5 + radius;
      if (Math.abs(localX) < extentX && Math.abs(localZ) < extentZ) {
        const penetrationX = extentX - Math.abs(localX);
        const penetrationZ = extentZ - Math.abs(localZ);
        const localNormalX =
          penetrationX < penetrationZ ? (localX < 0 ? -1 : 1) : 0;
        const localNormalZ =
          penetrationX < penetrationZ ? 0 : localZ < 0 ? -1 : 1;
        const overlap = Math.min(penetrationX, penetrationZ);
        normalX = cosine * localNormalX + sine * localNormalZ;
        normalZ = -sine * localNormalX + cosine * localNormalZ;
        rig.x += normalX * (overlap + 0.001);
        rig.z += normalZ * (overlap + 0.001);
      }
    } else {
      const minimum = candidate.part.shape.radius + radius;
      const deltaX = rig.x - candidate.centreX;
      const deltaZ = rig.z - candidate.centreZ;
      const distance = Math.hypot(deltaX, deltaZ);
      if (distance < minimum) {
        normalX = distance > EPSILON ? deltaX / distance : candidate.normalX;
        normalZ = distance > EPSILON ? deltaZ / distance : candidate.normalZ;
        const overlap = minimum - distance;
        rig.x += normalX * (overlap + 0.001);
        rig.z += normalZ * (overlap + 0.001);
      }
    }
    registerHit(
      candidate.part,
      normalX,
      normalZ,
      !candidate.startedInside && candidate.fraction < 1,
    );
    if (!candidate.startedInside) break;
  }

  return outcome;
}

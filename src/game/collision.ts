/**
 * Obstacle field and collision resolution.
 *
 * Obstacles are **generated on demand from the seed**, not stored. A cell
 * coordinate plus a slot index hashes to a stable position, size, and kind, so
 * the field is effectively unbounded, costs no memory, needs no save data, and is
 * identical for every player on the same seed.
 *
 * Only two things are persisted: which obstacles the player has knocked down.
 * That is the smallest possible representation of "the world remembers".
 *
 * Before ADR-0007 the renderer scattered 42 decorative props with its own RNG
 * and the kernel could not collide with any of them. This module is the single
 * source both sides read.
 */

import { cellRandom, clamp, seedFromText } from "./noise";
import type { TerrainField } from "./terrain";
import { WATER_LEVEL, type BiomeId } from "./world";

/**
 * Project-owned physical roles.
 *
 * Solver adapters may translate these to native groups/layers, but gameplay,
 * saves, diagnostics, and presentation must never depend on solver handles.
 */
export const COLLISION_ROLES = [
  "terrain",
  "rig",
  "cargo",
  "obstacle",
  "structure",
  "hazard",
  "projectile",
  "trigger",
  "sensor",
  "decorative",
] as const;

export type CollisionRole = (typeof COLLISION_ROLES)[number];
export type CollisionResponse = "block" | "overlap" | "ignore";

export interface CollisionPairPolicy {
  firstRole: string;
  secondRole: string;
  response: CollisionResponse;
  /** False means an unknown role used the fail-closed fallback. */
  known: boolean;
}

const COLLISION_ROLE_SET: ReadonlySet<string> = new Set(COLLISION_ROLES);
const SOLID_COLLISION_ROLES: ReadonlySet<CollisionRole> = new Set([
  "terrain",
  "rig",
  "cargo",
  "obstacle",
  "structure",
]);
const OVERLAP_COLLISION_ROLES: ReadonlySet<CollisionRole> = new Set([
  "hazard",
  "projectile",
  "trigger",
  "sensor",
]);

/**
 * Semantic pair policy shared by the authored runtime and future solver ports.
 *
 * Unknown roles fail closed. That is intentionally conservative: an unregistered
 * imported object must not silently become pass-through scenery. The caller also
 * gets `known: false`, so operator telemetry can expose the policy defect.
 */
export function collisionPolicyFor(
  firstRole: string,
  secondRole: string,
): CollisionPairPolicy {
  const known =
    COLLISION_ROLE_SET.has(firstRole) && COLLISION_ROLE_SET.has(secondRole);
  if (!known) {
    return { firstRole, secondRole, response: "block", known: false };
  }

  const first = firstRole as CollisionRole;
  const second = secondRole as CollisionRole;
  if (first === "decorative" || second === "decorative") {
    return { firstRole, secondRole, response: "ignore", known: true };
  }
  if (
    OVERLAP_COLLISION_ROLES.has(first) ||
    OVERLAP_COLLISION_ROLES.has(second)
  ) {
    return { firstRole, secondRole, response: "overlap", known: true };
  }
  if (SOLID_COLLISION_ROLES.has(first) && SOLID_COLLISION_ROLES.has(second)) {
    return { firstRole, secondRole, response: "block", known: true };
  }
  return { firstRole, secondRole, response: "ignore", known: true };
}

export interface PlanarPoint {
  x: number;
  z: number;
}

export interface SweptCircleHit {
  /** Fraction along `from` -> `to`, in the closed range 0..1. */
  fraction: number;
  /** Contact normal pointing from the stationary circle toward the mover. */
  normalX: number;
  normalZ: number;
  /** True when the movement started inside the expanded circle. */
  startedInside: boolean;
}

/**
 * Sweep a moving point against a circle expanded by both body radii.
 *
 * This is the current runtime's CCD primitive. It prevents a fast fixed step
 * from starting on one side of a tree/rig/cargo body and ending on the other
 * without ever reporting contact.
 */
export function sweepCircleAgainstCircle(
  from: PlanarPoint,
  to: PlanarPoint,
  centre: PlanarPoint,
  combinedRadius: number,
): SweptCircleHit | null {
  if (
    !Number.isFinite(from.x) ||
    !Number.isFinite(from.z) ||
    !Number.isFinite(to.x) ||
    !Number.isFinite(to.z) ||
    !Number.isFinite(centre.x) ||
    !Number.isFinite(centre.z)
  ) {
    return null;
  }

  const radius = Math.max(
    0,
    Number.isFinite(combinedRadius) ? combinedRadius : 0,
  );
  const moveX = to.x - from.x;
  const moveZ = to.z - from.z;
  const offsetX = from.x - centre.x;
  const offsetZ = from.z - centre.z;
  const radiusSquared = radius * radius;
  const startDistanceSquared = offsetX * offsetX + offsetZ * offsetZ;

  const contactNormal = (
    x: number,
    z: number,
  ): Pick<SweptCircleHit, "normalX" | "normalZ"> => {
    const dx = x - centre.x;
    const dz = z - centre.z;
    const distance = Math.hypot(dx, dz);
    if (distance > 1e-7) {
      return { normalX: dx / distance, normalZ: dz / distance };
    }
    const movementLength = Math.hypot(moveX, moveZ);
    if (movementLength > 1e-7) {
      return {
        normalX: -moveX / movementLength,
        normalZ: -moveZ / movementLength,
      };
    }
    return { normalX: 1, normalZ: 0 };
  };

  if (startDistanceSquared <= radiusSquared) {
    return {
      fraction: 0,
      ...contactNormal(from.x, from.z),
      startedInside: true,
    };
  }

  const a = moveX * moveX + moveZ * moveZ;
  if (a <= 1e-12) return null;
  const b = 2 * (offsetX * moveX + offsetZ * moveZ);
  const c = startDistanceSquared - radiusSquared;
  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;
  const fraction = (-b - Math.sqrt(discriminant)) / (2 * a);
  if (fraction < 0 || fraction > 1) return null;
  const hitX = from.x + moveX * fraction;
  const hitZ = from.z + moveZ * fraction;
  return {
    fraction,
    ...contactNormal(hitX, hitZ),
    startedInside: false,
  };
}

export interface DynamicCollisionBody {
  id: string;
  role: "rig" | "cargo";
  x: number;
  z: number;
  speed: number;
  heading: number;
  mass: number;
  radius: number;
  /** False models an infinite-mass body while preserving the same contact API. */
  movable?: boolean;
}

export interface DynamicCollisionContact {
  firstId: string;
  firstRole: CollisionRole;
  secondId: string;
  secondRole: CollisionRole;
  response: CollisionResponse;
  impactSpeed: number;
  normalX: number;
  normalZ: number;
  /** True when path intersection, rather than final overlap, found the contact. */
  swept: boolean;
  policyKnown: boolean;
}

/** Common contact envelope used by runtime collision telemetry. */
export type WorldCollisionContact = DynamicCollisionContact;

export interface DynamicCollisionOutcome {
  hit: boolean;
  impactSpeed: number;
  contacts: DynamicCollisionContact[];
  policyViolationCount: number;
}

const DYNAMIC_COLLISION_SKIN = 0.001;
const DYNAMIC_COLLISION_RESTITUTION = 0.08;

/**
 * Resolve one moving body against a stable ordered set of other movable bodies.
 *
 * The response is intentionally planar and solver-independent because current
 * `RigState` owns heading plus scalar speed rather than a 3D velocity vector.
 * Both bodies still separate by inverse mass and exchange normal momentum.
 */
export function resolveDynamicBodyCollisions(
  moving: DynamicCollisionBody,
  others: readonly DynamicCollisionBody[],
  previous: PlanarPoint = moving,
): DynamicCollisionOutcome {
  const contacts: DynamicCollisionContact[] = [];
  let impactSpeed = 0;
  let policyViolationCount = 0;

  /*
   * Sort broad-phase candidates by time of impact. Fleet iteration order must
   * not decide which body stops a fast mover first. Each candidate is then
   * re-tested against the already-resolved path so a body beyond the first
   * blocker cannot produce a phantom contact.
   */
  const intended = { x: moving.x, z: moving.z };
  const candidates = others
    .filter((other) => other.id !== moving.id)
    .map((other) => {
      const combinedRadius =
        Math.max(0, moving.radius) + Math.max(0, other.radius);
      const finalDistance = Math.hypot(
        intended.x - other.x,
        intended.z - other.z,
      );
      const finalOverlap = finalDistance < combinedRadius;
      const sweep = sweepCircleAgainstCircle(
        previous,
        intended,
        other,
        combinedRadius,
      );
      return {
        other,
        sortFraction: sweep?.fraction ?? (finalOverlap ? 1 : Infinity),
      };
    })
    .filter((candidate) => Number.isFinite(candidate.sortFraction))
    .sort(
      (first, second) =>
        first.sortFraction - second.sortFraction ||
        first.other.id.localeCompare(second.other.id),
    );

  for (const candidate of candidates) {
    const other = candidate.other;
    const policy = collisionPolicyFor(moving.role, other.role);
    if (!policy.known) policyViolationCount += 1;
    if (policy.response === "ignore") continue;

    const combinedRadius =
      Math.max(0, moving.radius) + Math.max(0, other.radius);
    const finalDistance = Math.hypot(moving.x - other.x, moving.z - other.z);
    const finalOverlap = finalDistance < combinedRadius;
    const sweep = sweepCircleAgainstCircle(
      previous,
      moving,
      other,
      combinedRadius,
    );
    if (!finalOverlap && !sweep) continue;

    const hit = sweep ?? {
      fraction: 1,
      normalX:
        finalDistance > 1e-7
          ? (moving.x - other.x) / finalDistance
          : -Math.sin(moving.heading),
      normalZ:
        finalDistance > 1e-7
          ? (moving.z - other.z) / finalDistance
          : -Math.cos(moving.heading),
      startedInside: finalOverlap,
    };

    const firstVelocityX = Math.sin(moving.heading) * moving.speed;
    const firstVelocityZ = Math.cos(moving.heading) * moving.speed;
    const secondVelocityX = Math.sin(other.heading) * other.speed;
    const secondVelocityZ = Math.cos(other.heading) * other.speed;
    const relativeNormalVelocity =
      (firstVelocityX - secondVelocityX) * hit.normalX +
      (firstVelocityZ - secondVelocityZ) * hit.normalZ;
    const closingSpeed = Math.max(0, -relativeNormalVelocity);
    impactSpeed = Math.max(impactSpeed, closingSpeed);

    contacts.push({
      firstId: moving.id,
      firstRole: moving.role,
      secondId: other.id,
      secondRole: other.role,
      response: policy.response,
      impactSpeed: closingSpeed,
      normalX: hit.normalX,
      normalZ: hit.normalZ,
      swept: !hit.startedInside && hit.fraction < 1,
      policyKnown: policy.known,
    });

    if (policy.response !== "block") continue;

    if (sweep && !sweep.startedInside) {
      const moveX = moving.x - previous.x;
      const moveZ = moving.z - previous.z;
      const movementLength = Math.hypot(moveX, moveZ);
      const skinFraction =
        movementLength > 1e-7
          ? Math.min(sweep.fraction, DYNAMIC_COLLISION_SKIN / movementLength)
          : 0;
      const resolvedFraction = Math.max(0, sweep.fraction - skinFraction);
      moving.x = previous.x + moveX * resolvedFraction;
      moving.z = previous.z + moveZ * resolvedFraction;
    }

    const dx = moving.x - other.x;
    const dz = moving.z - other.z;
    const distance = Math.hypot(dx, dz);
    const normalX = distance > 1e-7 ? dx / distance : hit.normalX;
    const normalZ = distance > 1e-7 ? dz / distance : hit.normalZ;
    const penetration = Math.max(0, combinedRadius - distance);
    const firstInverseMass =
      moving.movable === false ? 0 : 1 / Math.max(0.001, moving.mass);
    const secondInverseMass =
      other.movable === false ? 0 : 1 / Math.max(0.001, other.mass);
    const inverseMassSum = firstInverseMass + secondInverseMass;
    if (inverseMassSum > 0) {
      /*
       * The kernel stores scalar longitudinal speed rather than full rigid-body
       * velocity. A small mass-weighted contact yield makes an otherwise exact
       * swept hit visibly nudge a movable parked body now, instead of storing
       * momentum that would only become apparent after the player switches rigs.
       */
      const contactYield =
        closingSpeed > 0 && secondInverseMass > 0
          ? Math.min(0.12, closingSpeed * 0.012)
          : 0;
      const correction =
        penetration > 0
          ? penetration + DYNAMIC_COLLISION_SKIN + contactYield
          : contactYield;
      moving.x += normalX * correction * (firstInverseMass / inverseMassSum);
      moving.z += normalZ * correction * (firstInverseMass / inverseMassSum);
      other.x -= normalX * correction * (secondInverseMass / inverseMassSum);
      other.z -= normalZ * correction * (secondInverseMass / inverseMassSum);
    }

    if (inverseMassSum > 0 && closingSpeed > 0) {
      const impulse =
        ((1 + DYNAMIC_COLLISION_RESTITUTION) * closingSpeed) / inverseMassSum;
      const nextFirstVelocityX =
        firstVelocityX + normalX * impulse * firstInverseMass;
      const nextFirstVelocityZ =
        firstVelocityZ + normalZ * impulse * firstInverseMass;
      const nextSecondVelocityX =
        secondVelocityX - normalX * impulse * secondInverseMass;
      const nextSecondVelocityZ =
        secondVelocityZ - normalZ * impulse * secondInverseMass;
      const speedLimit = Math.max(
        1,
        Math.abs(moving.speed),
        Math.abs(other.speed),
      );
      moving.speed = clamp(
        nextFirstVelocityX * Math.sin(moving.heading) +
          nextFirstVelocityZ * Math.cos(moving.heading),
        -speedLimit,
        speedLimit,
      );
      other.speed = clamp(
        nextSecondVelocityX * Math.sin(other.heading) +
          nextSecondVelocityZ * Math.cos(other.heading),
        -speedLimit,
        speedLimit,
      );
    }
  }

  return {
    hit: contacts.length > 0,
    impactSpeed,
    contacts,
    policyViolationCount,
  };
}

/** Edge length of an obstacle cell, in metres. */
export const OBSTACLE_CELL = 13;

/** Maximum obstacles considered per cell. */
const SLOTS_PER_CELL = 2;

/** Cap on memoised cell slots before the memo is dropped wholesale. */
const MAX_CACHED_CELLS = 40_000;

export type ObstacleKind = "tree" | "rock" | "stump";

export interface Obstacle {
  id: string;
  x: number;
  z: number;
  /** Ground elevation at the obstacle's base. */
  groundY: number;
  /** Collision radius, in metres. */
  radius: number;
  /** Visual height, in metres. */
  height: number;
  kind: ObstacleKind;
  /** Whether a heavy enough rig can knock this down. */
  fellable: boolean;
  /** Stable 0..1 variation value for rendering (rotation, tint, scale jitter). */
  variation: number;
}

/** Shared visual dimensions used by both instancing and camera obstruction. */
export function treeTrunkHeight(obstacle: Obstacle): number {
  return obstacle.height * 0.55;
}

/** Horizontal crown radius before the renderer's 1.3× vertical stretch. */
export function treeCrownRadius(obstacle: Obstacle): number {
  return 1.25 + obstacle.variation * 0.85;
}

export function treeCrownCenterY(obstacle: Obstacle): number {
  return obstacle.groundY + obstacle.height * 0.78;
}

export function felledTrunkLength(obstacle: Obstacle): number {
  return obstacle.height * 0.8;
}

export function rockVisualHalfHeight(obstacle: Obstacle): number {
  return obstacle.radius * (0.6 + obstacle.variation * 0.5);
}

/**
 * Obstacle density per biome, as a probability per cell slot.
 *
 * Farmland is nearly clear on purpose — the tilled field must stay ploughable —
 * and the grove is dense enough that navigating it is a skill.
 */
const BIOME_DENSITY: Readonly<Record<BiomeId, number>> = {
  meadow: 0.3,
  farmland: 0.07,
  badlands: 0.34,
  grove: 0.72,
  highland: 0.4,
  marsh: 0.2,
};

/** Probability that an obstacle in a biome is a rock rather than a tree. */
const BIOME_ROCKINESS: Readonly<Record<BiomeId, number>> = {
  meadow: 0.25,
  farmland: 0.4,
  badlands: 0.85,
  grove: 0.12,
  highland: 0.75,
  marsh: 0.2,
};

export interface CollisionOutcome {
  /** True when the rig was pushed out of an obstacle this step. */
  hit: boolean;
  /** Closing speed at impact, in m/s. */
  impactSpeed: number;
  /** Obstacle the rig knocked down, if any. */
  felled: Obstacle | null;
  /** Obstacle that stopped the rig, if any. */
  blockedBy: Obstacle | null;
  normalX: number;
  normalZ: number;
  /** True when the path crossed the collider without ending overlapped. */
  swept: boolean;
}

const NO_COLLISION: CollisionOutcome = {
  hit: false,
  impactSpeed: 0,
  felled: null,
  blockedBy: null,
  normalX: 0,
  normalZ: 0,
  swept: false,
};

export class ObstacleField {
  private readonly seed: number;

  /**
   * Memo of resolved cell slots, including proven-empty ones (`null`).
   *
   * `obstacleAt` is a pure function of `(cell, slot, seed)`, but deriving one
   * candidate costs a `terrain.sample` (five `height()` queries) plus a biome scan
   * and a route projection. `resolve` examines ~50 candidates per simulation step
   * and the renderer examines ~1,400 per prop rebuild, so recomputing them was
   * costing ~250 terrain queries *per step* — measured at 18 ms/step against a
   * 16.7 ms frame budget, i.e. the kernel alone exceeded the entire frame.
   *
   * Because the field is deterministic and static apart from felling (tracked
   * separately in `GameWorld.felledObstacles`), caching cannot change behaviour.
   */
  private readonly cache = new Map<number, Obstacle | null>();

  constructor(
    seedText: string,
    private readonly terrain: TerrainField,
  ) {
    this.seed = seedFromText(`${seedText}:obstacles`);
  }

  /**
   * Terrain route profiles decide which natural obstacles may exist. A newly
   * restored community corridor therefore invalidates this pure memo; felled
   * history remains owned separately by GameWorld.
   */
  invalidateTerrainRoutes(): void {
    this.cache.clear();
  }

  /**
   * Resolve the obstacle in a given cell slot, or null when the slot is empty.
   *
   * Rejection rules matter as much as placement: nothing grows in standing water,
   * on bare rock faces, on the authored track network, or inside a service pad.
   * Without those rules the generator would block its own roads.
   */
  private obstacleAt(cx: number, cz: number, slot: number): Obstacle | null {
    // Pack the cell and slot into one integer key. The 4096 stride matches the
    // deformation grid's convention and comfortably covers the world disc.
    const key = ((cz + 2048) * 4096 + (cx + 2048)) * 4 + slot;
    const cached = this.cache.get(key);
    if (cached !== undefined) return cached;
    const resolved = this.resolveObstacleAt(cx, cz, slot);
    if (this.cache.size >= MAX_CACHED_CELLS) {
      // Pure memo, so dropping everything is always safe; a session that ranges
      // far enough to fill this simply pays the derivation cost again.
      this.cache.clear();
    }
    this.cache.set(key, resolved);
    return resolved;
  }

  private resolveObstacleAt(
    cx: number,
    cz: number,
    slot: number,
  ): Obstacle | null {
    const channel = slot * 977;
    const presence = cellRandom(cx, cz, channel + 1, this.seed);

    const jitterX = cellRandom(cx, cz, channel + 2, this.seed);
    const jitterZ = cellRandom(cx, cz, channel + 3, this.seed);
    const x = (cx + jitterX) * OBSTACLE_CELL;
    const z = (cz + jitterZ) * OBSTACLE_CELL;

    const biome = this.terrain.biomeAt(x, z);
    if (presence > BIOME_DENSITY[biome]) return null;

    // Keep the authored network and pads clear.
    if (this.terrain.routeWeight(x, z) > 0.25) return null;

    const ground = this.terrain.sample(x, z, 1.1);
    if (ground.height < WATER_LEVEL + 0.15) return null;
    if (ground.slope > 0.55) return null;

    const variation = cellRandom(cx, cz, channel + 4, this.seed);
    const isRock =
      cellRandom(cx, cz, channel + 5, this.seed) < BIOME_ROCKINESS[biome];

    if (isRock) {
      const radius = 0.75 + variation * 1.35;
      return {
        id: `r${cx}:${cz}:${slot}`,
        x,
        z,
        groundY: ground.height,
        radius,
        height: radius * (1.1 + variation * 0.6),
        kind: "rock",
        fellable: false,
        variation,
      };
    }

    const trunk = 0.42 + variation * 0.38;
    return {
      id: `t${cx}:${cz}:${slot}`,
      x,
      z,
      groundY: ground.height,
      radius: trunk,
      height: 4.2 + variation * 3.4,
      kind: "tree",
      fellable: true,
      variation,
    };
  }

  /** Every obstacle whose centre lies within `range` metres of a point. */
  near(x: number, z: number, range: number): Obstacle[] {
    const found: Obstacle[] = [];
    const span = Math.ceil(range / OBSTACLE_CELL) + 1;
    const centreX = Math.floor(x / OBSTACLE_CELL);
    const centreZ = Math.floor(z / OBSTACLE_CELL);
    const rangeSquared = range * range;

    for (let cz = centreZ - span; cz <= centreZ + span; cz += 1) {
      for (let cx = centreX - span; cx <= centreX + span; cx += 1) {
        for (let slot = 0; slot < SLOTS_PER_CELL; slot += 1) {
          const obstacle = this.obstacleAt(cx, cz, slot);
          if (!obstacle) continue;
          const dx = obstacle.x - x;
          const dz = obstacle.z - z;
          if (dx * dx + dz * dz <= rangeSquared) {
            found.push(obstacle);
          }
        }
      }
    }
    return found;
  }

  /**
   * Push a rig out of any obstacle it overlaps, and report what happened.
   *
   * A heavy rig moving fast fells a tree instead of stopping; a light one bounces
   * off it. That is the clearest capability contrast in the game that costs no
   * new content: the same tree is scenery to the tractor and a wall to the buggy.
   */
  resolve(
    rig: { x: number; z: number; speed: number; heading: number },
    rigRadius: number,
    mass: number,
    felledIds: ReadonlySet<string>,
    previous: PlanarPoint = rig,
    extraObstacles: readonly Obstacle[] = [],
  ): CollisionOutcome {
    const middleX = (previous.x + rig.x) * 0.5;
    const middleZ = (previous.z + rig.z) * 0.5;
    const movementRadius = Math.hypot(rig.x - previous.x, rig.z - previous.z);
    const queryRange = movementRadius * 0.5 + rigRadius + 3.2;
    const candidates = [
      ...this.near(middleX, middleZ, queryRange),
      ...extraObstacles.filter(
        (obstacle) =>
          Math.hypot(obstacle.x - middleX, obstacle.z - middleZ) <= queryRange,
      ),
    ];
    if (candidates.length === 0) return NO_COLLISION;

    let outcome: CollisionOutcome = NO_COLLISION;
    const contacts = candidates
      .filter((obstacle) => !felledIds.has(obstacle.id))
      .map((obstacle) => ({
        obstacle,
        hit: sweepCircleAgainstCircle(
          previous,
          rig,
          obstacle,
          obstacle.radius + rigRadius,
        ),
      }))
      .filter(
        (
          candidate,
        ): candidate is {
          obstacle: Obstacle;
          hit: SweptCircleHit;
        } => candidate.hit !== null,
      )
      .sort(
        (first, second) =>
          first.hit.fraction - second.hit.fraction ||
          first.obstacle.id.localeCompare(second.obstacle.id),
      );

    for (const { obstacle, hit } of contacts) {
      const minimum = obstacle.radius + rigRadius;

      const impactSpeed = Math.abs(rig.speed);

      // Heavy and fast enough fells a tree. The thresholds are deliberately
      // reachable by the tractor at working speed and out of reach for the buggy.
      if (
        obstacle.fellable &&
        mass >= 3 &&
        impactSpeed >= 4.5 &&
        obstacle.radius <= 0.75
      ) {
        rig.speed *= 0.62;
        outcome = {
          hit: true,
          impactSpeed,
          felled: obstacle,
          blockedBy: null,
          normalX: hit.normalX,
          normalZ: hit.normalZ,
          swept: !hit.startedInside && hit.fraction < 1,
        };
        continue;
      }

      if (!hit.startedInside && hit.fraction < 1) {
        const moveX = rig.x - previous.x;
        const moveZ = rig.z - previous.z;
        const movementLength = Math.hypot(moveX, moveZ);
        const skinFraction =
          movementLength > 1e-7
            ? Math.min(hit.fraction, DYNAMIC_COLLISION_SKIN / movementLength)
            : 0;
        const resolvedFraction = Math.max(0, hit.fraction - skinFraction);
        rig.x = previous.x + moveX * resolvedFraction;
        rig.z = previous.z + moveZ * resolvedFraction;
      }

      // Push out along the contact normal, preserving the tangential component so
      // the rig slides around a rock rather than sticking to it.
      const dx = rig.x - obstacle.x;
      const dz = rig.z - obstacle.z;
      const distance = Math.hypot(dx, dz);
      const nx = distance > 1e-4 ? dx / distance : 1;
      const nz = distance > 1e-4 ? dz / distance : 0;
      const overlap = Math.max(0, minimum - distance);
      rig.x += nx * (overlap + DYNAMIC_COLLISION_SKIN);
      rig.z += nz * (overlap + DYNAMIC_COLLISION_SKIN);

      const forwardX = Math.sin(rig.heading);
      const forwardZ = Math.cos(rig.heading);
      const closing = -(forwardX * nx + forwardZ * nz) * rig.speed;
      if (closing > 0) {
        rig.speed *= clamp(
          1 - 0.9 * (closing / Math.max(1, impactSpeed)),
          -0.2,
          0.9,
        );
      }

      outcome = {
        hit: true,
        impactSpeed: Math.max(outcome.impactSpeed, Math.max(0, closing)),
        felled: outcome.felled,
        blockedBy: obstacle,
        normalX: nx,
        normalZ: nz,
        swept: !hit.startedInside && hit.fraction < 1,
      };

      // A swept blocking contact is the earliest reachable solid on this path.
      // Later candidates lie beyond the corrected position and must not become
      // phantom contacts.
      if (!hit.startedInside) break;
    }

    return outcome;
  }
}

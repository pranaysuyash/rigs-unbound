import type { EffectiveRig } from "./contracts";

export type TerrainTraversalBlockReason = "terrain-face";

export interface TerrainTraversalResult {
  blocked: boolean;
  reason: TerrainTraversalBlockReason | null;
  x: number;
  z: number;
}

export interface TerrainHeightSource {
  height(x: number, z: number): number;
}

const SWEEP_STEP = 0.3;

function supportHeight(
  terrain: TerrainHeightSource,
  x: number,
  z: number,
  directionX: number,
  directionZ: number,
  halfLength: number,
  halfWidth: number,
  edge: 1 | -1,
): number {
  const centreX = x + directionX * halfLength * edge;
  const centreZ = z + directionZ * halfLength * edge;
  const lateralX = -directionZ;
  const lateralZ = directionX;
  return Math.max(
    terrain.height(centreX, centreZ),
    terrain.height(
      centreX + lateralX * halfWidth,
      centreZ + lateralZ * halfWidth,
    ),
    terrain.height(
      centreX - lateralX * halfWidth,
      centreZ - lateralZ * halfWidth,
    ),
  );
}

/**
 * Shared swept traversability boundary for every locomotion adapter.
 *
 * This does not decide whether a rig has enough power or grip to climb a normal
 * grade; the adapter still owns those mechanics. It rejects discontinuous faces
 * that would otherwise teleport support points upward and launch or tunnel the
 * body. Direction is derived from actual displacement, so downhill and reverse
 * escape remain available.
 */
export function resolveTerrainTraversal(
  terrain: TerrainHeightSource,
  profile: Pick<
    EffectiveRig,
    | "mobilityAdapter"
    | "wheelRadius"
    | "wheelbase"
    | "track"
    | "rideHeight"
    | "suspensionTravel"
  >,
  startX: number,
  startZ: number,
  proposedX: number,
  proposedZ: number,
): TerrainTraversalResult {
  const deltaX = proposedX - startX;
  const deltaZ = proposedZ - startZ;
  const distance = Math.hypot(deltaX, deltaZ);
  if (!Number.isFinite(distance) || distance <= 1e-7) {
    return { blocked: false, reason: null, x: startX, z: startZ };
  }

  const directionX = deltaX / distance;
  const directionZ = deltaZ / distance;
  const halfLength = profile.wheelbase * 0.5;
  const halfWidth = profile.track * 0.5;
  const stepRise =
    profile.mobilityAdapter === "ground"
      ? profile.wheelRadius * 0.7 + profile.suspensionTravel * 0.35
      : profile.rideHeight * 0.2 + profile.suspensionTravel * 0.5;
  const maximumFaceGrade = profile.mobilityAdapter === "ground" ? 1.1 : 0.85;

  // A face already spans the rig's footprint. This catches a start-from-rest
  // attempt before the leading contacts can be lifted onto the upper shelf.
  const leading = supportHeight(
    terrain,
    proposedX,
    proposedZ,
    directionX,
    directionZ,
    halfLength,
    halfWidth,
    1,
  );
  const trailing = supportHeight(
    terrain,
    proposedX,
    proposedZ,
    directionX,
    directionZ,
    halfLength,
    halfWidth,
    -1,
  );
  if (leading - trailing > stepRise + profile.wheelbase * maximumFaceGrade) {
    return { blocked: true, reason: "terrain-face", x: startX, z: startZ };
  }

  // Sweep the leading support edge so a fast run-up cannot cross a thin face
  // between fixed steps.
  const steps = Math.max(1, Math.ceil(distance / SWEEP_STEP));
  let previousSupport = supportHeight(
    terrain,
    startX,
    startZ,
    directionX,
    directionZ,
    halfLength,
    halfWidth,
    1,
  );
  for (let index = 1; index <= steps; index += 1) {
    const fraction = index / steps;
    const x = startX + deltaX * fraction;
    const z = startZ + deltaZ * fraction;
    const support = supportHeight(
      terrain,
      x,
      z,
      directionX,
      directionZ,
      halfLength,
      halfWidth,
      1,
    );
    const run = distance / steps;
    if (support - previousSupport > stepRise + run * maximumFaceGrade) {
      return { blocked: true, reason: "terrain-face", x: startX, z: startZ };
    }
    previousSupport = support;
  }

  return {
    blocked: false,
    reason: null,
    x: proposedX,
    z: proposedZ,
  };
}

/**
 * Renderer visibility policy.
 *
 * The renderer currently rebuilds instanced environmental props around the
 * active rig. This module names the distance bands behind that behavior so
 * later profile selection, culling, and LOD changes share deterministic
 * thresholds rather than adding renderer-local conditionals.
 */

export type VisibilityProfileId = "full" | "standard" | "mobile-safe";

export type VisibilityTier = "near" | "mid" | "far" | "culled";

export interface VisibilityProfile {
  id: VisibilityProfileId;
  nearMeters: number;
  midMeters: number;
  farMeters: number;
}

export const VISIBILITY_PROFILES: Readonly<
  Record<VisibilityProfileId, VisibilityProfile>
> = {
  full: {
    id: "full",
    nearMeters: 72,
    midMeters: 132,
    farMeters: 168,
  },
  standard: {
    id: "standard",
    nearMeters: 64,
    midMeters: 120,
    // Preserve the existing Field 02 prop radius until an evidence-backed
    // profile selector and alternate representations are introduced.
    farMeters: 168,
  },
  "mobile-safe": {
    id: "mobile-safe",
    nearMeters: 48,
    midMeters: 96,
    farMeters: 132,
  },
};

export const DEFAULT_VISIBILITY_PROFILE: VisibilityProfileId = "standard";

export interface PropVisibilityMetrics {
  profile: VisibilityProfileId;
  candidates: number;
  submitted: number;
  capacityLimited: number;
  near: number;
  mid: number;
  far: number;
  culled: number;
}

export function visibilityProfile(
  id: VisibilityProfileId = DEFAULT_VISIBILITY_PROFILE,
): VisibilityProfile {
  return VISIBILITY_PROFILES[id];
}

export function classifyVisibility(
  distanceMeters: number,
  profile: VisibilityProfile = visibilityProfile(),
): VisibilityTier {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return "culled";
  if (distanceMeters <= profile.nearMeters) return "near";
  if (distanceMeters <= profile.midMeters) return "mid";
  if (distanceMeters <= profile.farMeters) return "far";
  return "culled";
}

export function createPropVisibilityMetrics(
  profile: VisibilityProfile = visibilityProfile(),
): PropVisibilityMetrics {
  return {
    profile: profile.id,
    candidates: 0,
    submitted: 0,
    capacityLimited: 0,
    near: 0,
    mid: 0,
    far: 0,
    culled: 0,
  };
}

export function recordVisibilityCandidate(
  metrics: PropVisibilityMetrics,
  tier: VisibilityTier,
): void {
  metrics.candidates += 1;
  metrics[tier] += 1;
}

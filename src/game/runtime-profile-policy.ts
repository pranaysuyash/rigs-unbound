import type { PerformanceSnapshot } from "./performance";
import type { VisibilityProfileId } from "./visibility";

/**
 * A measured policy for reducing renderer work without changing simulation.
 *
 * `full` remains a benchmark-only profile. This selector can retain the
 * standard baseline or request mobile-safe after a meaningful sample window;
 * it must never infer hardware capability from the user agent.
 */
export interface RuntimeProfileBudget {
  minimumFrameSamples: number;
  maximumAverageFrameMs: number;
  maximumP95FrameMs: number;
  maximumFirstControllableMs: number;
}

export const STANDARD_RUNTIME_PROFILE_BUDGET: Readonly<RuntimeProfileBudget> = {
  minimumFrameSamples: 90,
  maximumAverageFrameMs: 25,
  maximumP95FrameMs: 33.4,
  maximumFirstControllableMs: 2_500,
};

export type RuntimeProfileSelectionState =
  | "awaiting-evidence"
  | "within-budget"
  | "fallback";

export type RuntimeProfileFallbackReason =
  | "insufficient-frame-samples"
  | "average-frame-budget"
  | "p95-frame-budget"
  | "first-controllable-budget";

export interface RuntimeProfileSelection {
  profile: Extract<VisibilityProfileId, "standard" | "mobile-safe">;
  state: RuntimeProfileSelectionState;
  reasons: RuntimeProfileFallbackReason[];
}

export function selectRuntimeProfile(
  snapshot: Pick<
    PerformanceSnapshot,
    | "averageFrameMs"
    | "p95FrameMs"
    | "frameSampleCount"
    | "firstControllableMs"
  >,
  budget: RuntimeProfileBudget = STANDARD_RUNTIME_PROFILE_BUDGET,
): RuntimeProfileSelection {
  if (snapshot.frameSampleCount < budget.minimumFrameSamples) {
    return {
      profile: "standard",
      state: "awaiting-evidence",
      reasons: ["insufficient-frame-samples"],
    };
  }

  const reasons: RuntimeProfileFallbackReason[] = [];
  if (snapshot.averageFrameMs > budget.maximumAverageFrameMs) {
    reasons.push("average-frame-budget");
  }
  if (snapshot.p95FrameMs > budget.maximumP95FrameMs) {
    reasons.push("p95-frame-budget");
  }
  if (
    snapshot.firstControllableMs !== null &&
    snapshot.firstControllableMs > budget.maximumFirstControllableMs
  ) {
    reasons.push("first-controllable-budget");
  }

  if (reasons.length > 0) {
    return { profile: "mobile-safe", state: "fallback", reasons };
  }

  return { profile: "standard", state: "within-budget", reasons };
}

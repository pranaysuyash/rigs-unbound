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
  /**
   * Ceiling on time-to-first-controllable-frame before the profile degrades, in ms.
   *
   * This is the most consequential performance number in a link-native game: a
   * stranger who follows a link and waits leaves, and no amount of steady-state
   * frame rate recovers them. It is evidence available on the *first* frame, long
   * before a rolling frame window has enough samples to say anything, which makes
   * it the only budget that can act early enough to matter on a slow device.
   */
  maximumFirstControllableMs: number;
}

export interface RuntimeProfileRecoveryPolicy {
  minimumHealthyFrames: number;
}

export const STANDARD_RUNTIME_PROFILE_BUDGET: Readonly<RuntimeProfileBudget> = {
  minimumFrameSamples: 90,
  maximumAverageFrameMs: 25,
  maximumP95FrameMs: 33.4,
  maximumFirstControllableMs: 2_500,
};

export const STANDARD_RUNTIME_PROFILE_RECOVERY_POLICY: Readonly<RuntimeProfileRecoveryPolicy> =
  {
    minimumHealthyFrames: 180,
  };

export type RuntimeProfileSelectionState =
  "awaiting-evidence" | "within-budget" | "fallback";

export type RuntimeProfileFallbackReason =
  | "insufficient-frame-samples"
  | "average-frame-budget"
  | "p95-frame-budget"
  | "first-controllable-budget"
  | "recovery-window";

export interface RuntimeProfileSelection {
  profile: Extract<VisibilityProfileId, "standard" | "mobile-safe">;
  state: RuntimeProfileSelectionState;
  reasons: RuntimeProfileFallbackReason[];
}

export function selectRuntimeProfile(
  snapshot: Pick<
    PerformanceSnapshot,
    "averageFrameMs" | "p95FrameMs" | "frameSampleCount" | "firstControllableMs"
  >,
  budget: RuntimeProfileBudget = STANDARD_RUNTIME_PROFILE_BUDGET,
): RuntimeProfileSelection {
  // A slow first controllable frame is decisive on its own, and is checked *before*
  // the sample-count gate. Waiting 90 frames to react would spend the entire window
  // in which the visitor decides whether to stay.
  if (
    snapshot.firstControllableMs !== null &&
    snapshot.firstControllableMs > budget.maximumFirstControllableMs
  ) {
    return {
      profile: "mobile-safe",
      state: "fallback",
      reasons: ["first-controllable-budget"],
    };
  }

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
  if (reasons.length > 0) {
    return { profile: "mobile-safe", state: "fallback", reasons };
  }

  return { profile: "standard", state: "within-budget", reasons };
}

/**
 * Keeps profile recovery stable after an evidenced fallback.
 *
 * The snapshot's bounded frame window can stop growing, so recovery uses the
 * monitor's monotonic lifetime sample count rather than the rolling count.
 */
export class RuntimeProfileController {
  private activeProfile: RuntimeProfileSelection["profile"] = "standard";
  private fallbackStartedAtSample: number | null = null;
  private fallbackReasons: RuntimeProfileFallbackReason[] = [];

  constructor(
    private readonly budget: RuntimeProfileBudget = STANDARD_RUNTIME_PROFILE_BUDGET,
    private readonly recovery: RuntimeProfileRecoveryPolicy = STANDARD_RUNTIME_PROFILE_RECOVERY_POLICY,
  ) {}

  /** Reset policy hysteresis when its underlying frame evidence is discarded. */
  reset(): void {
    this.activeProfile = "standard";
    this.fallbackStartedAtSample = null;
    this.fallbackReasons = [];
  }

  evaluate(
    snapshot: Pick<
      PerformanceSnapshot,
      | "averageFrameMs"
      | "p95FrameMs"
      | "frameSampleCount"
      | "totalFrameSampleCount"
      | "firstControllableMs"
    >,
  ): RuntimeProfileSelection {
    const selection = selectRuntimeProfile(snapshot, this.budget);
    if (this.activeProfile === "standard") {
      if (selection.profile === "mobile-safe") {
        this.activeProfile = "mobile-safe";
        this.fallbackStartedAtSample = snapshot.totalFrameSampleCount;
        this.fallbackReasons = [...selection.reasons];
      }
      return selection;
    }

    if (selection.state === "fallback") {
      // A renewed measured breach starts a new uninterrupted healthy interval.
      // Without this reset, scenery could recover based on health that happened
      // before the latest budget violation.
      this.fallbackStartedAtSample = snapshot.totalFrameSampleCount;
      this.fallbackReasons = [...selection.reasons];
      return selection;
    }

    const fallbackStartedAtSample =
      this.fallbackStartedAtSample ?? snapshot.totalFrameSampleCount;
    const healthyFrames =
      snapshot.totalFrameSampleCount - fallbackStartedAtSample;
    if (healthyFrames < this.recovery.minimumHealthyFrames) {
      return {
        profile: "mobile-safe",
        state: "fallback",
        reasons: [...this.fallbackReasons, "recovery-window"],
      };
    }

    this.activeProfile = "standard";
    this.fallbackStartedAtSample = null;
    this.fallbackReasons = [];
    return selection;
  }
}

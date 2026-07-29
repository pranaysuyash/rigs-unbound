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

/**
 * Player-facing text for each fallback reason.
 *
 * These replace the opaque code names in the bootstrap shell and status toast
 * so a non-technical player understands *why* scenery was reduced.
 */
export const FALLBACK_REASON_TEXT: Readonly<
  Record<RuntimeProfileFallbackReason, string>
> = {
  "insufficient-frame-samples": "Still measuring frame performance.",
  "average-frame-budget": "Average frame time exceeded the comfort target.",
  "p95-frame-budget": "Stutter spikes exceeded the comfort target.",
  "first-controllable-budget": "Initial load time was slower than expected.",
  "recovery-window": "Waiting for steady frames before restoring detail.",
};

/**
 * Combine one or more fallback reasons into a single readable sentence.
 *
 * When multiple reasons are active the first is most important; the rest are
 * appended so the player sees the full picture without drowning in text.
 */
export function formatFallbackReasons(
  reasons: readonly RuntimeProfileFallbackReason[],
): string {
  if (reasons.length === 0) return "";
  return reasons.map((reason) => FALLBACK_REASON_TEXT[reason]).join(" ");
}

export interface RuntimeProfileSelection {
  profile: Extract<VisibilityProfileId, "standard" | "mobile-safe">;
  state: RuntimeProfileSelectionState;
  reasons: RuntimeProfileFallbackReason[];
  /** Player-facing text summarising the fallback reason(s). */
  reasonText: string;
}

/**
 * Player-facing profile line for the shell HUD.
 *
 * Keep this separate from operator diagnostics so the visible HUD explains the
 * active quality state in plain language while the debug lane can keep the
 * exact budget codes.
 */
export function formatRuntimeProfileStatus(
  selection: RuntimeProfileSelection,
): string {
  if (selection.state === "awaiting-evidence") {
    return selection.reasonText
      ? `Quality: measuring. ${selection.reasonText}`
      : "Quality: measuring.";
  }

  if (selection.profile === "mobile-safe") {
    return selection.reasonText
      ? `Quality: reduced. Scenery simplified to keep things smooth. ${selection.reasonText}`
      : "Quality: reduced. Scenery simplified to keep things smooth.";
  }

  return selection.reasonText
    ? `Quality: standard. Full scenery detail is active. ${selection.reasonText}`
    : "Quality: standard. Full scenery detail is active.";
}

/**
 * Operator-facing summary for the developer diagnostics lane.
 *
 * Keep this terse and code-oriented so the hidden evidence surface can report
 * the active policy without duplicating the public HUD copy.
 */
export function formatRuntimeProfileOperatorSummary(
  selection: RuntimeProfileSelection,
  visibilityProfileId: VisibilityProfileId = selection.profile,
  preview = false,
): string {
  if (selection.state === "awaiting-evidence") {
    return "Renderer visibility warmup: standard (insufficient-frame-samples)";
  }

  if (visibilityProfileId === "mobile-safe") {
    const reasonText = selection.reasons.length > 0
      ? ` (${selection.reasons.join(",")})`
      : "";
    return preview
      ? `Renderer visibility fallback: mobile-safe (acceptance preview)${reasonText}`
      : `Renderer visibility fallback: mobile-safe${reasonText}`;
  }

  if (visibilityProfileId === "full") {
    return preview
      ? "Renderer visibility preview: full"
      : "Renderer visibility steady: full";
  }

  return preview
    ? "Renderer visibility steady: standard (acceptance preview)"
    : "Renderer visibility steady: standard";
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
    const reasons: RuntimeProfileFallbackReason[] = [
      "first-controllable-budget",
    ];
    return {
      profile: "mobile-safe",
      state: "fallback",
      reasons,
      reasonText: formatFallbackReasons(reasons),
    };
  }

  if (snapshot.frameSampleCount < budget.minimumFrameSamples) {
    const reasons: RuntimeProfileFallbackReason[] = [
      "insufficient-frame-samples",
    ];
    return {
      profile: "standard",
      state: "awaiting-evidence",
      reasons,
      reasonText: formatFallbackReasons(reasons),
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
    return {
      profile: "mobile-safe",
      state: "fallback",
      reasons,
      reasonText: formatFallbackReasons(reasons),
    };
  }

  return {
    profile: "standard",
    state: "within-budget",
    reasons,
    reasonText: "",
  };
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
      const reasons: RuntimeProfileFallbackReason[] = [
        ...this.fallbackReasons,
        "recovery-window",
      ];
      return {
        profile: "mobile-safe",
        state: "fallback",
        reasons,
        reasonText: formatFallbackReasons(reasons),
      };
    }

    this.activeProfile = "standard";
    this.fallbackStartedAtSample = null;
    this.fallbackReasons = [];
    return selection;
  }
}

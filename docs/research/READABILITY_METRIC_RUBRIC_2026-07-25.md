# Readability Metric Rubric for Threshold Captures (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: how to judge when a fixture is becoming unreadable from the metrics already named in the v1.x threshold policy stack.

Linked policy artifacts:

- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Threshold Fixture Baseline for v1.x Comparison Captures](./THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
- [Threshold Capture Selection Protocol for v1.x](./THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- [Physics Readability and Speed Contract](./PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md)

## Decision

The best single early predictor of unreadability is usually **transition latency**, because it exposes when camera, profile, or mode changes stop feeling responsive before the scene fully collapses.

However, no one metric should carry the full burden. The practical rubric is a small ranked set:

1. **transition latency**
2. **control-state visibility**
3. **draw-call pressure / frame pressure**
4. **semantic cue loss**
5. **fallback visibility**

## Why transition latency is the lead signal

When the player asks for a camera change, mode change, or profile change, a slow or jittery response is often the first sign that the scene is becoming hard to parse.

It is not the whole answer, but it is the earliest signal that the system has started to spend too much budget on everything except player comprehension.

## Secondary signals

### 1) Control-state visibility

Ask:

- Can the player still tell whether the rig is under control?
- Can the player see the outcome of steering, braking, recovery, or mode change?
- Does the camera or HUD hide the thing the player needs to understand?

### 2) Draw-call and frame pressure

Ask:

- Do the counters spike before readability fails?
- Does the scene drop into a lower band before the failure is visible?
- Is the degrade path named and observable?

### 3) Semantic cue loss

Ask:

- Are slope, wetness, hazard, and objective cues still present?
- Are the cues readable without relying on color alone?
- Does the fallback path keep the meaning intact?

### 4) Fallback visibility

Ask:

- Can the operator see which threshold was exceeded?
- Can the player tell that the scene simplified on purpose?
- Does the capture bundle record the degrade reason?

## Practical scoring guide

A fixture is approaching unreadability when these signals line up:

- transition latency rises first;
- control-state visibility begins to blur;
- draw or frame pressure exceeds the scene’s known comfort band;
- semantic cues start to disappear or become ambiguous;
- fallback becomes visible in the capture bundle.

## What this rubric is not

- Not a substitute for the threshold baseline ADR.
- Not a universal FPS rule.
- Not a promise that one metric always wins in every scene.
- Not a profiling system; it is a review guide for the capture bundle.

## Relationship to the broader architecture

This note answers the remaining metric question in the KPI note by naming a primary predictor and a ranked set of supporting signals.
The actual acceptance decision still belongs to the threshold baseline and the canonical fixture comparisons.

# Threshold Capture Selection Protocol for v1.x (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: how to choose the canonical comparison capture from the threshold fixture baseline when evaluating renderer, camera, physics, accessibility, and budget behavior over time.

Linked policy artifacts:

- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Threshold Fixture Baseline for v1.x Comparison Captures](./THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Rendering Potential and Economy](./RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- [Physics Readability and Speed Contract](./PHYSICS_READABILITY_AND_SPEED_CONTRACT_2026-07-25.md)

## Decision

Use the canonical fixture baseline, but choose the primary comparison capture by subsystem.

That keeps each threshold question anchored to the scene that best exposes the relevant failure mode.

## Canonical capture mapping

| Subsystem or question | Primary reference capture | Why this capture is canonical |
|---|---|---|
| Renderer readability under normal play | Near-field dense scene | Shows the common within-budget path with active terrain, one rig, and nearby props |
| Culling correctness | Occluded / hidden scene | Best exposes whether non-visible content is leaking into the render path |
| LOD policy | Distance-gradient scene | Best exposes near/mid/far tier transitions and readable degradation |
| Budget fallback order | Pressure scene | Best exposes the order in which systems shed work under pressure |
| Accessibility / reduced-motion readability | Reduced-motion comparison scene | Best exposes whether semantics survive motion clamping and low-budget fallback |
| Camera legibility under stress | Pressure scene | Best exposes whether camera help remains intelligible when the system is simplified |
| Physics readability at higher speed | Pressure scene | Best exposes whether the shared perception frame still reads grip, load, and recovery |

## Selection rule

When comparing a subsystem over time:

1. Start from the fixture listed for that subsystem in the table above.
2. Use the same profile group as the comparison set unless the question is explicitly about profile switching.
3. Prefer the same camera framing, seed, and scene state when reproducing the capture.
4. If a new question appears that the baseline scenes do not expose, add a new fixture to the baseline before changing the comparison rule.

## Operator reading

The protocol is not asking the team to compare everything against one screenshot.

It is asking the team to avoid using the wrong capture for the wrong question.

For example:

- do not judge culling with the pressure scene if the occluded scene already exposes the failure more clearly;
- do not judge accessibility with the within-budget dense scene if the reduced-motion capture is the relevant proof;
- do not judge physics readability with the distance-gradient scene if the pressure scene is what shows speed and strain.

## Promotion rule

Promote a capture to the long-term comparison set when it is the clearest explanation of one of these conditions:

- within budget,
- degraded but acceptable,
- fail-soft,
- reduced-motion safe,
- blocked.

## What this protocol is not

- Not a replacement for the fixture baseline.
- Not a new threshold policy.
- Not a request for more capture formats than are useful.

## Relationship to the broader architecture

This protocol answers the remaining capture-selection questions in the KPI and render-budget notes.
It turns the canonical fixture baseline into subsystem-specific comparison guidance so threshold tuning can stay stable over time.

## Addendum (2026-07-25): the selection protocol still matches the current runtime, but the capture bundle is not yet present

- Re-checked the capture-selection protocol against the current runtime and
  browser surface.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current app still maps cleanly onto the existing selection table:
  - near-field dense scene for renderer readability,
  - occluded / hidden scene for culling correctness,
  - distance-gradient scene for LOD transitions,
  - pressure scene for fallback order and stress,
  - reduced-motion comparison scene for accessibility and motion safety.
- No new canonical capture category is required yet.
- What is still missing is the actual comparison bundle artifact that pairs the
  correct fixture, metrics capture, screenshot/frame capture, operator note, and
  threshold state into one reusable review package.
- So the protocol remains a useful selection rule, but the repo still lacks the
  long-term capture set it is meant to select from.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh recheck, same missing bundle

- Re-checked the selection protocol against the current browser daemon snapshot.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime still maps cleanly onto the selection table, so the
  protocol does not need a new canonical capture category yet.
- What still does need to exist is the reusable comparison bundle:
  - fixture id,
  - metrics capture,
  - screenshot or frame capture,
  - operator note,
  - threshold state.
- The protocol is therefore still a selection rule, not the artifact itself.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - the selection table matches the live runtime, and the capture candidates are already on disk

- The current worktree now contains fresh review-image assets that fit the
  existing selection table without requiring a new capture category:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- That means the protocol can already be used to choose candidates for:
  - near-field dense scenes,
  - occluded / hidden scenes,
  - distance-gradient scenes,
  - pressure scenes,
  - reduced-motion comparison scenes.
- The live browser surface still matches the protocol’s intended runtime:
  - healthy `Rigs Unbound — Field 02` session,
  - zero console logs,
  - observable performance and camera hooks.
- What is still missing is the reusable comparison bundle itself:
  - fixture id,
  - metrics capture,
  - screenshot or frame capture,
  - operator note,
  - threshold state.
- The correct reading is that the protocol already knows how to choose among
  captures, but the repo still needs the promoted bundle that makes those
  choices durable over time.

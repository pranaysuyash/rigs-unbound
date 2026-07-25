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

# Culling and LOD Spike Tests for Deterministic Fixture Scenes

Date: 2026-07-25

Owner: Pranay

Scope: the deterministic fixture-scene tests that prove culling and LOD behavior stays readable and budget-aware under the current renderer policy.

Linked policy artifacts:

- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [Rendering Potential and Economy](./RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)

## Purpose

The analysis asks for culling + LOD spike tests tied to deterministic fixture scenes.

This note defines what those spike tests should prove so the future implementation has a stable target:

- non-visible content stays out of the render path;
- visible content respects the intended LOD tier;
- the renderer degrades in a controlled way under pressure;
- the result can be compared across time without depending on a hand-authored screenshot-only judgment.

## Fixture scene design

The fixtures should be deterministic and small enough to compare repeatably.

### Required fixture types

1. **Near-field scene**
   - a dense local setup with visible terrain, one rig, and a few props;
   - used to confirm that the high-detail path is not broken.

2. **Occluded / hidden scene**
   - objects are present but hidden by terrain or deliberate scene layout;
   - used to confirm they are not left in the render path when culling is active.

3. **Distance-gradient scene**
   - objects span near, mid, and far bands;
   - used to confirm LOD tiering and distance-based degradation.

4. **Pressure scene**
   - enough visible content to approach or exceed the target budget;
   - used to confirm that fail-soft degradation happens in the intended order.

## Spike-test questions

The spike tests should answer these questions:

### 1) Culling correctness

- Are non-visible entities absent from the render path?
- Are the counters consistent with the visible scene?
- Does the scene stay deterministic across repeated runs?

### 2) LOD behavior

- Does each distance band resolve to the expected tier?
- Does the tier change preserve gameplay meaning?
- Do non-geometry subsystems degrade predictably where applicable?

### 3) Budget economy

- Which threshold trips first in the pressure scene?
- What degrades before the scene becomes unreadable?
- Are the fallback paths visible in instrumentation?

### 4) Recovery and comparison

- Can the same fixture scene be run again and compared?
- Does the output clearly show whether the result is within budget, degraded, or fail-soft?
- Can a future change be judged against the same baseline?

## Suggested checks

The tests should be able to report:

- visible actor count,
- active physics count,
- draw-call pressure,
- LOD tier by band,
- transition latency when relevant,
- fallback or degrade events,
- whether the expected non-visible objects stayed out of the render path.

## Acceptance target

The spike-test set is useful when it can say:

1. culling is working on the deterministic fixture scenes;
2. LOD behavior matches the intended near/mid/far policy;
3. degradation is visible and controlled rather than silent;
4. the results are comparable across runs;
5. the tests are tied directly to the policy and KPI artifacts.

## Relationship to the broader architecture

This note sits between:

- the performance/readability baseline ADR,
- the renderer/camera policy ADR,
- the KPI note,
- the render budget and visual-language companion note.

It is intentionally narrow: it exists so the culling/LOD proof can be added without inventing a second test philosophy.

## Addendum (2026-07-25) - Live visibility budget is intentional, not yet formalized

- The live renderer still behaves like a deliberate first-pass visibility budget:
  - repeated props are instanced,
  - prop rebuilds happen inside a fixed local radius,
  - some meshes explicitly disable automatic frustum culling because the current
    scene is prioritizing stable presentation over a formal visibility graph.
- Live browser metrics remain compact enough to support the current posture:
  - roughly 78 draw calls,
  - roughly 105k triangles,
  - first-controllable and first-input-ready times are already tracked.
- That means the app has a real visibility budget, but not yet a formal culling
  or distance-LOD spike harness.
- The spike-test contract remains the right next layer: it should prove when
  non-visible content stays out of the path, not just rely on the current
  renderer posture.

# Threshold Fixture Baseline for v1.x Comparison Captures (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the canonical fixture set used to compare renderer, camera, physics, and accessibility thresholds over time.

Linked policy artifacts:

- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Rendering Potential and Economy](./RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Culling and LOD Spike Tests for Deterministic Fixture Scenes](./CULLING_LOD_SPIKE_TESTS_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)

## Decision

Use one canonical fixture bundle for threshold comparison across time.

The bundle should contain the minimum set of scenes needed to compare:

- within-budget behavior,
- degraded-but-acceptable behavior,
- fail-soft behavior,
- reduced-motion / mobile-safe behavior.

## Canonical fixture set

### 1) Near-field dense scene

Purpose:

- confirm the high-detail path remains readable;
- check camera framing, visibility, and near-field feedback.

Expected signal:

- actor count and active physics count are non-trivial;
- no non-essential fallback is required;
- core control readability remains intact.

### 2) Occluded / hidden scene

Purpose:

- confirm that non-visible content stays out of the render path;
- validate culling and visibility accounting.

Expected signal:

- hidden entities do not inflate render pressure;
- culling behavior is visible in instrumentation;
- the scene remains deterministic.

### 3) Distance-gradient scene

Purpose:

- compare near, mid, and far bands;
- validate LOD policy and far-field degradation order.

Expected signal:

- distant content collapses predictably;
- gameplay meaning survives tier changes;
- visual cues remain coherent.

### 4) Pressure scene

Purpose:

- approach or exceed the target budget;
- confirm that the renderer degrades in the intended order.

Expected signal:

- draw-call pressure increases;
- visible fallback or degrade events appear;
- the scene remains readable in fail-soft mode.

### 5) Reduced-motion comparison scene

Purpose:

- verify accessibility and motion safety under the same gameplay loop;
- compare readability between `standard` and `mobile-safe` profiles.

Expected signal:

- motion exaggeration is clamped;
- semantic state remains legible;
- fallback and status feedback survive without relying on motion alone.

## Capture format

Each fixture comparison should save a bundle with:

- fixture id,
- profile name,
- metrics capture,
- screenshot or frame capture,
- short operator note,
- threshold state (`within budget`, `degraded but acceptable`, `fail-soft`, or `blocked`).

## Promotion rule

Promote a capture to the long-term baseline when it is representative, repeatable, and covers one of the following:

- the best known within-budget state,
- the clearest degraded-but-acceptable state,
- the clearest fail-soft state,
- the clearest reduced-motion/mobile-safe state.

The baseline should not be the prettiest frame. It should be the most explanatory frame.

## What this baseline is not

- Not a content-approval list.
- Not a replacement for the render policy ADR.
- Not a request to add more scenes before the current bundle is useful.

## Relationship to the broader architecture

This fixture baseline turns the threshold policy into something that can be compared across time.
It answers the open comparison questions in the KPI and rendering-economy notes by naming the scenes that should be reused when judging regressions.

## Addendum (2026-07-25): the canonical fixture set is still the right shape for the current runtime

- Re-checked the fixture baseline against the current runtime and browser
  surface.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still fits the baseline’s intended comparison shape:
  - one compact canonical world,
  - one active playable loop,
  - visible renderer metrics and accessibility hooks,
  - reduced-motion / mobile-safe behavior already present in the runtime path.
- The baseline fixture categories remain the right explanatory set for the
  current app state:
  - near-field dense scene for normal readable play,
  - occluded / hidden scene for culling checks,
  - distance-gradient scene for LOD checks,
  - pressure scene for fallback and degradation order,
  - reduced-motion comparison scene for accessibility parity.
- What is still missing is not the fixture logic itself, but the actual packaged
  capture bundle that promotes one representative capture per fixture into a
  long-term comparison set.
- So the baseline is still correctly named as a durable comparison scaffold
  rather than a finished capture library.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh browser recheck, same comparison gap

- Re-checked the baseline against the current browser daemon snapshot.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The fixture set still matches the runtime’s current shape:
  - one bounded playable world,
  - one active simulation loop,
  - explicit accessibility and visibility hooks,
  - reduced-motion behavior already present.
- That means the baseline remains the right comparison scaffold, but not yet the
  long-term artifact itself.
- The remaining gap is unchanged:
  - no packaged capture bundle,
  - no promoted representative frame per fixture,
  - no reusable operator note set tied to the threshold states.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - the fixture set is still right, and the worktree now has real capture candidates

- The current worktree contains fresh review-image assets that can serve as
  capture candidates for the baseline bundle, including:
  - `docs/reviews/assets/field-02-front-forward.png`
  - `docs/reviews/assets/field-02-top-down.png`
  - `docs/reviews/assets/rig-lab-01-desktop.png`
  - `docs/reviews/assets/rig-lab-01-narrow.png`
- Those assets make the baseline more concrete, but they still are not a
  canonical promoted bundle by themselves.
- The fixture categories still match the live runtime shape:
  - near-field dense scene for readable play,
  - occluded / hidden scene for culling checks,
  - distance-gradient scene for LOD checks,
  - pressure scene for fallback order,
  - reduced-motion comparison scene for accessibility parity.
- What is still missing is the packaged long-term capture bundle:
  - one promoted representative capture per fixture,
  - one metrics capture tied to each promoted frame,
  - one reusable operator note / threshold-state summary per capture.
- So the baseline is now backed by real on-disk captures, but it still needs the
  promotion step before it becomes the long-term comparison library the note
  describes.

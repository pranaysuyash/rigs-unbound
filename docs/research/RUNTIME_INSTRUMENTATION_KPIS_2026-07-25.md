# Runtime Instrumentation KPIs for Production-like Profiles

Date: 2026-07-25

Owner: Pranay

Scope: the runtime metrics that should be visible in production-like profiles when evaluating renderer, camera, physics, and transition behavior for Rigs Unbound.

Linked policy artifacts:

- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Rendering Potential and Economy](./RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)
- [3D Games Technical Analysis](./3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [Threshold Fixture Baseline for v1.x Comparison Captures](./THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
- [Threshold Capture Selection Protocol for v1.x](./THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md)
- [Readability Metric Rubric for Threshold Captures](./READABILITY_METRIC_RUBRIC_2026-07-25.md)

## Purpose

This note exists so the repo has an explicit KPI vocabulary for the production-like profile checks that the analysis asks for.

The goal is not to invent a new profiling system.
The goal is to say which values matter when deciding whether the current renderer/camera/physics stack is staying inside the intended operating envelope.

## Profile groups

The KPIs should be visible under at least these profile groups:

- full / desktop-class
- standard web
- mobile-safe / reduced-complexity

The point of the profiles is to show how the same scene behaves under different budgets, not to create unrelated benchmarks.

## Core KPIs

### 1) Per-frame actor count

Why it matters:

- it shows how much of the world is actively being simulated or rendered;
- it is a simple proxy for visibility pressure and systemic churn.

What to observe:

- total active actors/entities;
- visible actors;
- actors that are paused, culled, or outside the active radius.

### 2) Active physics count

Why it matters:

- it shows how much of the physics layer is actually doing work;
- it helps separate renderer pressure from simulation pressure.

What to observe:

- active dynamic bodies;
- asleep/inactive bodies where relevant;
- the count of bodies contributing to the current tick.

### 3) Transition latency

Why it matters:

- it shows whether camera and mode changes feel immediate enough;
- it helps detect regressions that make the game feel sluggish or unstable.

What to observe:

- camera mode transition time;
- profile-switch latency where profile changes are user-visible;
- any notable delay in input-to-visible state change.

### 4) Draw-call pressure

Why it matters:

- it shows whether culling and instancing are keeping the renderer within budget;
- it is a practical signal for frame economy.

What to observe:

- total draw calls;
- draw calls per major scene area;
- pressure changes before and after degradation.

### 5) Degradation / fallback count

Why it matters:

- it shows whether the runtime is falling back intentionally rather than failing silently.

What to observe:

- how many times a fallback profile is activated;
- which resource or contract triggered the fallback;
- whether the fallback is expected or unexpected.

## Reporting format

The KPI output should be easy to read in logs, captures, and manual review.

At minimum each profile summary should identify:

- profile name,
- fixture or scene name,
- actor count,
- active physics count,
- draw-call pressure,
- transition latency,
- fallback/degrade events,
- whether the run stayed within the intended envelope.

## Suggested acceptance use

These KPIs are most useful when paired with:

- deterministic fixture scenes,
- the performance/readability baseline,
- the renderer/camera policy ADR,
- the visual-language companion note.

That combination makes the metrics useful as evidence instead of trivia.

## Threshold mapping

- `ADR-0016` defines the shared bands: within budget, degraded but acceptable, fail-soft, and blocked.
- `READABILITY_METRIC_RUBRIC_2026-07-25.md` names the primary predictor and supporting signals for unreadability review.
- The useful questions now are fixture-specific tuning questions, not policy questions.
- The default acceptance profile remains `standard` for first public smoke tests, with `mobile-safe` as the required fallback.
- The comparison bundle is a metrics capture plus a screenshot or frame capture plus a short operator note and fixture id.

## Open questions

- Which capture in the canonical baseline set should be promoted after repeated regression evidence for a given subsystem?

## Relationship to the broader architecture

This note is narrow and intentionally operational.

It does not define the render policy itself.
It exists to make the render policy measurable under realistic profile conditions.

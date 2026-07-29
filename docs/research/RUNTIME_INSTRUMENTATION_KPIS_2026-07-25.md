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

## Addendum (2026-07-25): the KPI vocabulary is real, the comparison bundle is still implicit

- Re-checked the KPI note against the current runtime and browser surface.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already exposes the KPI vocabulary this note names:
  - `PerformanceMonitor.snapshot()` returns frame timing, FPS, draw calls,
    triangles, heap use, load duration, first-controllable time, first-input
    ready time, save size, and terrain build time.
  - `window.getPerformanceSnapshot()` exposes that snapshot to browser tooling.
  - `window.render_game_to_text()` and the HUD surfaces preserve operator
    visibility while the scene is running.
- The current UI also already surfaces a subset of the metrics directly:
  - FPS
  - draw-call count
  - heap usage
  - save status
- What is still missing is the operational bundle the note asks for:
  - one repeatable profile comparison artifact,
  - one readable operator summary per profile/fixture pair,
  - one named fallback/degrade summary tied to the fixture,
  - one explicit comparison capture that binds metrics to a screenshot or frame
    capture.
- So the KPI layer is measurable today, but still not fully packaged as the
  production-like comparison evidence the contract describes.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - the metrics are surfaced, but the operator bundle is still implicit

- `src/game/performance.ts` already makes the KPI surface concrete with a
  single snapshot object that includes:
  - frame timing,
  - draw calls,
  - triangle count,
  - heap use,
  - load duration,
  - first-controllable time,
  - first-input-ready time,
  - save size,
  - terrain build time.
- `src/main.ts` already forwards that snapshot into the live browser surface
  and HUD summary, so the metrics are not hidden from operators or maintainers.
- The browser daemon remains healthy on the live field surface, which means the
  KPI lane is still grounded in the current runtime rather than in a stale note.
- What is still missing is the packaged comparison artifact the contract
  describes:
  - no repeatable profile comparison bundle,
  - no per-profile operator summary tied to a fixture id,
  - no named fallback/degrade summary as a reusable evidence object.
- The correct reading is unchanged: the KPI vocabulary is present and visible,
  but it still needs a canonical operational bundle before it can serve as the
  reviewable comparison layer for the broader performance/readability policy.

## Addendum (2026-07-25) - fresh Field 02 recheck, same KPI packaging gap

- Re-checked the current browser daemon while continuing the KPI lane.
- The live browser surface is still `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The runtime hook set is still the same live evidence surface:
  - `PerformanceMonitor.snapshot()` emits frame timing, FPS, draw calls,
    triangles, heap use, load duration, first-controllable time,
    first-input-ready time, save size, and terrain build time.
  - `window.getPerformanceSnapshot()` exposes that snapshot to browser tooling.
  - `window.render_game_to_text()` and the HUD continue to keep operator
    visibility intact during play.
- The metric vocabulary is therefore not hypothetical. It is live and readable.
- What still does not exist is the packaged operator bundle the note asks for:
  - one repeatable profile comparison artifact,
  - one readable operator summary per profile/fixture pair,
  - one named fallback/degrade summary tied to the fixture,
  - one explicit screenshot/frame capture that binds the metrics to the run.
- So the KPI lane remains useful as an observability surface, but it is still
  short of the canonical comparison artifact that would make it a durable review
  bundle.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - the snapshot now carries transition and save timing, but not the full readability rubric

- Re-checked `src/game/performance.ts` against the current KPI rubric.
- The runtime snapshot already exposes several useful readable pressure signals:
  - frame timing,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - first-input-ready time,
  - save size,
  - terrain-build time.
- `src/main.ts` continues to surface that snapshot through `window.getPerformanceSnapshot()` and the developer diagnostics line, so the data are not hidden from maintainers.
- But the KPI rubric still asks for two signals the current snapshot does not name directly:
  - per-frame actor count,
  - active physics count.
- The live runtime therefore has a partially complete readability envelope:
  - transition latency is measurable,
  - fallback/degrade visibility is present,
  - save/load pressure is observable,
  - but the actor/physics dimension remains implicit rather than a first-class field.
- Evidence depth: Tier 1 static inspection. No fresh browser or benchmark capture was run in this pass.

## Addendum (2026-07-29) - the next observability proof is first-class actor and physics counts

- Re-read the KPI note after the operator-observability and resource-budget
  passes.
- The runtime already exposes enough pressure information to justify the
  current profile/fallback policy. What remains implicit is the actor and
  physics dimension that the rubric names but the snapshot still does not
  expose directly.
- The next durable proof slice is therefore not a broader profiler. It is a
  first-class summary field or snapshot extension that names:
  - per-frame actor count,
  - active physics count,
  - and which profile/fixture pair the counts belong to.
- That gives operators a simpler way to compare scenes and budgets without
  guessing whether the visible pressure came from renderer load or simulation
  load.
- Evidence depth: Tier 1 static synthesis from the KPI note and the operator
  observability contract. No new runtime capture was run in this pass.

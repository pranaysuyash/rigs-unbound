# Rendering Potential and Economy (Rigs Unbound)

Date: 2026-07-25

Owner: Pranay

Scope: renderer budget thresholds, visual language planning, and the practical economy of where to spend the frame budget for Rigs Unbound.

Linked analysis:

- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](./3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](./3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [Threshold Fixture Baseline for v1.x Comparison Captures](./THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
- [Threshold Capture Selection Protocol for v1.x](./THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md)
- [Readability Metric Rubric for Threshold Captures](./READABILITY_METRIC_RUBRIC_2026-07-25.md)

## Purpose

This note turns the renderer follow-up into a concrete companion artifact.

The repo already has a canonical rendering path, but it needs an explicit budget economy:

- what gets first priority in the frame,
- what can be degraded,
- what should fail soft,
- what visual language must stay readable even under pressure.

The goal is not to replace the existing renderer contract. The goal is to make its thresholds legible enough that future work can stay coherent instead of ad hoc.

## Current renderer signals

The live codebase already shows several strong signs:

- Three.js is the canonical rendering path for the current slice.
- Terrain, instancing, minimap rendering, lights, sky/skybox transitions, and post-state rendering are already present.
- Metrics exist in the performance layer, and browser hooks expose runtime state.
- The project already has enough structure to reason about budget tradeoffs without a renderer rewrite.

That means the next step is policy, not architecture replacement.

## Budget economy

The render budget should be treated as a set of spending priorities.

### Spend first

- camera response
- player/vehicle readability
- nearby terrain and obstacle fidelity
- core lighting cues
- collision-related visual feedback

### Spend second

- distant props
- secondary ambience
- non-critical shadow detail
- optional surface variation
- low-priority particles or atmospheric flourishes

### Spend last

- speculative post-processing
- expensive dynamic shadows outside the critical view
- optional decorative density
- extra visual polish that does not change player judgment

The important part is not just which systems exist. It is the order in which they lose budget.

## Suggested renderer thresholds

The exact numbers should be tuned from fixture scenes and live hardware, but the contract should at least make these quantities visible:

- visible actor count
- active physics count
- draw-call count
- triangle pressure
- shadowed-light count
- transition latency
- memory / residency pressure

The renderer should be able to tell the rest of the system when the budget is:

- within target,
- degraded but acceptable,
- fail-soft,
- blocked.

## Visual language plan

The visual language must keep the world readable when the renderer is under pressure.

### Terrain

- make slope and wetness visible
- preserve terrain transitions
- keep ground-plane readability high at a glance

### Hazards

- hazards should have a readable cue even on reduced effects
- hazard feedback should not depend on expensive rendering paths

### Weather and atmosphere

- weather should reinforce state, not obscure it
- low-cost atmospheric cues should remain even when shadows or effects are reduced

### Camera and motion

- camera motion should support speed and danger perception
- camera changes should remain intelligible across readably degraded settings

## Degradation hierarchy

If the renderer must simplify, the preferred order should be:

1. keep responsiveness and control readability
2. preserve terrain and hazard legibility
3. reduce far-field and decorative detail
4. simplify optional shadows and effects
5. avoid silent failure or confusing visual states

This order makes the engine more resilient and keeps the player-oriented truth of the scene intact.

## Measurement and follow-up

This companion note should be used with deterministic fixture scenes and visible instrumentation.

The useful outputs are:

- a consistent budget table
- a capture of degraded versus within-budget states
- a clear visual language map for slope, wetness, hazard, and atmosphere cues
- a simple note describing what changed when budget pressure increased

## Threshold mapping

- `ADR-0016` defines the shared threshold states and the fallback order.
- `READABILITY_METRIC_RUBRIC_2026-07-25.md` tells us which signals to watch when a capture starts to drift into unreadability.
- The open work is no longer policy design; it is filling fixture-specific targets and comparing captures.

## Open questions

- Which cues should always survive on low-end hardware?
- Which renderer degradations should be considered unacceptable because they confuse gameplay?
- Which new visual effect or terrain family would justify adding a fixture to the canonical baseline?

## Relationship to the broader architecture

This note is intentionally narrow.

It sits alongside:

- the performance and readability baseline,
- the camera feel contract,
- the lighting and atmosphere contract,
- the spatial culling contract,
- the LOD hierarchy contract,
- the resource budget contract.

Those contracts tell us how the world should behave. This note tells us how to spend the frame budget in a way that preserves that behavior.

## Addendum (2026-07-25): the budget economy is already visible, but the comparison bundle is still implicit

- Re-checked the rendering-economy note against the current renderer and
  performance surfaces.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already exposes the budget economy the note describes:
  - the renderer canonical path is Three.js,
  - repeated world items are instanced,
  - prop drawing is radius-bounded around the rig,
  - `PerformanceMonitor` and `window.getPerformanceSnapshot()` expose draw-call
    pressure, triangle pressure, frame timing, memory use, and terrain build
    time,
  - the HUD also surfaces frame-level health through save status and fps.
- The renderer already follows the spend order the note recommends:
  - camera response and nearby readability are protected first,
  - terrain/obstacle fidelity is maintained around the active rig,
  - distant props and decorative density are bounded by the current renderer
    policy.
- What is still missing is the packaged comparison artifact:
  - one repeatable capture bundle,
  - one operator note for what changed under pressure,
  - one screenshot/frame capture tied to the metrics,
  - one baseline promotion path for explanatory rather than pretty captures.
- So the note remains a useful frame-budget companion, but the repo still needs
  the reusable comparison set that turns those ideas into reviewable evidence.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh Field 02 recheck, same comparison-bundle gap

- Re-checked the rendering-economy note against the current browser daemon and
  live renderer state.
- The live browser surface is still `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The current runtime still exposes the frame-budget economics the note names:
  - Three.js is the canonical renderer path,
  - repeated world items are instanced,
  - prop drawing is radius-bounded around the rig,
  - `PerformanceMonitor` and `window.getPerformanceSnapshot()` expose draw-call
    pressure, triangle pressure, frame timing, memory use, and terrain build
    time,
  - the HUD also keeps fps and save health visible.
- The spend order described in the note still matches the current runtime
  posture:
  - camera response and nearby readability are protected first,
  - terrain/obstacle fidelity remains the active foreground workload,
  - distant props and decorative density are bounded by the current policy.
- What is still missing is the durable comparison bundle:
  - one repeatable capture bundle,
  - one operator note for what changed under pressure,
  - one screenshot/frame capture tied to the metrics,
  - one baseline promotion path for explanatory captures.
- So the budget economy is live and readable, but still short of the reusable
  review artifact that would make the frame-budget policy durable over time.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this rendering-economy note. This document still
owns the frame-budget and camera/readability frame; the new note carries the
wider machine-keeper thesis and long-range product direction.

## Addendum (2026-07-29) - the budget economy is measurable, but the public comparison bundle still needs one named capture

- Re-read the rendering-economy note against the current KPI and browser
  loading/profile notes.
- The runtime already exposes useful budget signals, and the live browser
  surface still reports the canonical developer route at
  `http://127.0.0.1:4173/?surface=developer` with the `Rigs Unbound` title and
  a non-empty console-log buffer.
- That means the missing step is not observability in the abstract. The missing
  step is one named comparison artifact that binds:
  - load / first-controllable timing,
  - profile or fallback state,
  - draw-call / triangle pressure,
  - and an operator note about what changed under pressure.
- The artifact should be small enough to review quickly and specific enough to
  survive reload, so it can serve as the durable explanation of what the budget
  economy looks like in the public shell.
- Evidence depth: Tier 4 runtime/browser daemon status plus Tier 1 static
  synthesis from the budget and KPI notes.

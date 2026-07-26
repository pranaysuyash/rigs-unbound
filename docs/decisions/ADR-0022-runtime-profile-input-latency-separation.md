# ADR-0022: Separate runtime profile pressure from player input latency

- Date: 2026-07-26
- Status: implemented and verified for the current runtime
- Owner: Pranay
- Implementation owner: project team
- Related:
  - [ADR-0016](./ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
  - [Web Loading and Profile Bootstrap Contract](../research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
  - [First Controllable Timing Semantics](../research/FIRST_CONTROLLABLE_TIMING_SEMANTICS_2026-07-25.md)
  - [First Input Ready Timing Semantics](../research/FIRST_INPUT_READY_TIMING_SEMANTICS_2026-07-25.md)

## Context

The runtime exposes two useful interaction markers:

- `firstInputReadyMs`: the first processed user action, including entering the
  world;
- `firstControllableMs`: the first rendered frame after world entry.

The adaptive visibility policy previously treated `firstControllableMs` as a
renderer pressure budget. That couples a player decision to the graphics
fallback path: a player who reads the welcome panel for longer than the budget
can activate `mobile-safe` even when frame timing is healthy.

The live browser surface demonstrated this failure mode on 2026-07-26:

- average frame time: `8.33 ms`
- p95 frame time: `9.3 ms`
- frame rate: `120 FPS`
- first controllable: `9,292.4 ms`
- selected profile before this decision: `mobile-safe`
- reason: `first-controllable-budget`

That is not a valid graphics-pressure conclusion.

## Decision

The automatic visibility-profile selector uses only renderer-owned evidence:

1. minimum bounded frame samples;
2. average frame-time budget;
3. p95 frame-time budget.

`firstControllableMs` remains observable and remains part of browser acceptance,
because it is useful for understanding the player handoff. It is not an input
to automatic visual fallback. `firstInputReadyMs` likewise remains an
interaction-adoption metric, not a GPU/renderer budget.

The selector therefore cannot change visibility solely because a player spent
time reading, paused, or delayed entering the world.

## Consequences

Positive:

- profile changes now represent measured render pressure;
- player behavior no longer changes scenery policy;
- existing controllability and input-readiness evidence remains available;
- no simulation, input, camera, persistence, or content semantics change.

Trade-offs:

- startup handoff latency is no longer an automatic visibility trigger;
- a separate startup budget would need its own renderer-owned marker and policy
  if future evidence shows it is necessary;
- existing historical captures that cite `first-controllable-budget` must be
  treated as historical evidence, not current policy output.

## Validation plan

- Focused policy test proves a very late `firstControllableMs` does not trigger
  `mobile-safe` when frame timing is within budget.
- Existing performance tests continue to prove both timing markers are recorded
  independently and only once.
- Browser acceptance continues to prove that controllability and input
  readiness are both present. It does not numerically order them: input
  readiness is measured from boot, while the current controllable-frame latency
  window begins at world entry.
- A clean browser capture after implementation must show a healthy 120-FPS run
  remains `standard` despite a delayed welcome-panel handoff.

## Rollback / revisit trigger

Revisit only if a renderer-owned startup measurement demonstrates a repeatable
cost that frame timing does not capture. Add a distinct marker and named budget
for that cost; do not restore user-action latency as a proxy.

## Anything else?

The browser loading contract still has an open product question about whether
the welcome shell needs a visible progress meter. That is separate from runtime
profile selection and must not be solved by reusing input-latency metrics.

## Update log

- 2026-07-26: separated renderer pressure from user-controlled world-entry
  timing after live browser evidence showed a healthy renderer entering
  `mobile-safe` solely because `firstControllableMs` exceeded the policy.
- 2026-07-26: Status vocabulary corrected. This is a reversible technical
  decision supported by runtime and test evidence, not an operator-signed
  product policy. See [the decision register](README.md).

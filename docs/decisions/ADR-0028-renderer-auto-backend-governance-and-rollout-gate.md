# ADR-0028: renderer auto-backend governance and rollout gate

- Date: 2026-07-26
- Status: Proposed — operator sign-off required
- Owner: Pranay
- Related:
  - [WebGPU and Web Performance Analysis](../research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md)
  - [Engine Branch Evaluation and Alternate Backend Gating Contract](../research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md)
  - [Game Renderer](../../src/game/renderer.ts)
  - [Entry boot contract](../../src/main.ts)

## Context

`?renderer=auto` currently gives the game permission to try WebGPU when
`navigator.gpu` exists. That is the right direction for the W1 lane, but it
makes the rollout behavior a product decision disguised as an implementation
default.

Long-term reliability requires a named gate so:

- `auto` is observable and explainable per session,
- operators can make an explicit production policy,
- low-confidence devices are protected from unstable WebGPU startups,
- and the fallback decision stays inside the Three.js canonical runtime contract.

## Decision

1. `?renderer=auto` is no longer equivalent to "always try WebGPU when available."
2. Auto-mode now uses a rollout policy object with three explicit states:
   - `rendererPolicy=stable` (default): use WebGPU only after stable-gate checks.
   - `rendererPolicy=canary`: force the previous auto behavior, including WebGPU
     attempts with warnings.
   - `rendererPolicy=off`: force WebGL from auto-path.
3. Stable gate checks are currently:
   - WebGPU API must be present,
   - secure context or local file bootstrap,
   - no known low-capability indicators (`deviceMemory <= 4`, `hardwareConcurrency < 4`,
     iOS-class browser heuristics),
   - explicit `renderer=webgl|webgpu` always wins.
4. Gate outcome is recorded in `graphicsContext`-related observability via a new
   boot checkpoint: `rendererBackendPolicy`.
5. Runtime implementation status (post-decision): `main.ts` now passes the resolved
   backend policy to `GameRenderer`; `renderer.ts` applies that policy, tracks effective
   backend/fallback/reason, and surfaces them through `metrics()`.

6. The checkpoint now carries both the requested policy decision and the resolved policy
   request channel (`renderer=auto` can remain blocked to WebGL), then records the
   actual effective backend after renderer construction in case the runtime contract
   resolves differently at init time.

## Long-term moves and use-cases (motto_v4-aligned)

### Use-cases this decision must unlock

1. **U1 — Deterministic operator control in production rollouts**
   - Operators need to choose between `stable`, `canary`, and `off` without code
     changes, and can force a consistent baseline during incidents.
   - Acceptance signal: `renderer=auto` behavior is explainable per run via
     `rendererBackendPolicy` checkpoint.

2. **U2 — Comparable rendering experiments under one contract**
   - QA and perf can run the same world seed/session with explicit backend and
     policy controls, then compare snapshots with like-for-like simulation state.
   - Acceptance signal: checkpoint + snapshot fields include effective backend,
     fallback, and fallback reason; sessions differ only by policy/backend.

3. **U3 — Low-capability guardrails**
   - Unknown devices should remain on WebGL unless explicit policy allows WebGPU,
     so launch-day instability is isolated to known cohorts.
   - Acceptance signal: `rendererPolicy=off` remains the conservative default for
     unstable profiles until evidence proves expansion is safe.

4. **U4 — Post-failure operability**
   - Recovery and incident triage should name the exact chosen backend and why
     fallback occurred, so operators can reduce blast radius quickly.
   - Acceptance signal: each startup or recovery checkpoint preserves `rendererBackend*`
     telemetry without needing manual reproduction.

### Improvement ladder for this lane

- **W1-d (next):** publish a short decision sheet in `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md`
  covering the first measured rollout matrix (success/fallback rates by policy + device class),
  then move from `Proposed` to `Implemented and verified for the current runtime` only after one
  representative matrix pass.
- **W1-e (next):** decide default policy per release surface:
  - Field-test surfaces can stay on `rendererPolicy=canary` only when acceptance passes.
  - Production baseline keeps `rendererPolicy=off` until failure-rate plus recovery-rate
    deltas are objectively stable.
- **W1-f (later):** remove temporary policy constants from bootstrap once the matrix shows
  sustained stability and operator support docs are in place.

## Consequences

- Low-capability devices are protected from high-risk WebGPU startup instability.
- `renderer=webgpu` and `?renderer=auto` are now deterministic with explicit policy
  and telemetry; `?renderer=webgl` still remains an unconditional override.
- Operators gain a stable default rollout lever without removing QA control of
  explicit `webgpu`/`webgl` requests.
- The canonical architecture remains unchanged: Three.js stays the one runtime path,
  WebGPU remains a rollout-grade alternate with explicit gate.

## Validation plan

- Capture sessions with:
  - `rendererPolicy=stable` and default `renderer=auto`,
  - `rendererPolicy=stable` + `renderer=webgl` explicit,
  - `rendererPolicy=canary` + `renderer=auto`,
  - `renderer=webgpu`.
- Compare:
  - selected `renderer.metrics().rendererBackend`,
  - checkpoint `rendererBackendPolicy`,
  - context-loss and restore cadence from `graphicsContext*`.
- Use the same evidence matrix as W1, including a rollback condition when policy
  gating is over-conservative for target class and a revisit trigger for any new
  renderer-specific breakage class.

## Revisit trigger

Revisit this decision when:

- WebGPU startup failure rate under `rendererPolicy=stable` is consistently low
  enough to allow default expansion,
- the platform matrix for `deviceMemory` and `hardwareConcurrency` no longer
  predicts instability,
- production operators request a deterministic override policy beyond `canary`.

## Anything else?

This does not change user-facing controls yet. It makes rollout policy explicit
and machine-observable. If operator sign-off is not yet available, keep
`rendererPolicy=off` in conservative production surfaces and treat WebGPU as a
controlled comparison branch.

# Resource Budget and Fallback Envelope (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current observable performance metrics into a named resource-governance contract.

The runtime already exposes performance snapshots with frame timing, draw calls, triangle count, heap use, load time, first-controllable time, and save-size data. That is enough to prove the engine is observable. It is not yet enough to prove the resource budget is a first-class policy with low-budget fallback states.

## Current evidence base

- Performance snapshots:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Runtime wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for resource budgets:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

Live browser anchor:

- performance snapshot is exposed
- live snapshot currently reports measurable frame, draw, triangle, heap, load, and first-controllable values

## Current observable posture

The live snapshot currently shows a healthy but still bounded posture:

- average frame time: measured
- p95 frame time: measured
- FPS: measured
- draw calls: measured
- triangles: measured
- heap use: measured
- load duration: measured
- first controllable time: measured

That means the project can already observe pressure. What it cannot yet do is name a fallback policy that activates before overload becomes a silent player-facing problem.

## What is still missing

The repo still lacks a named policy for:

- CPU budget ownership
- GPU budget ownership
- memory or residency budget ownership
- active actor ceilings
- thermal or battery-sensitive fallback behavior
- operator-visible summary of what overloaded and which subsystem caused it

The current metrics are a strong foundation, but they need a policy envelope to become actionable.

## Contract shape

The resource envelope should separate:

1. measured budgets
2. degradation triggers
3. fallback profiles
4. operator-visible summaries
5. recovery thresholds

Suggested budget families:

- CPU
- GPU
- memory / residency
- active actors
- thermal or battery sensitivity where relevant

## Validation rules

The contract should fail visibly if it:

- allows silent overload
- degrades without naming the triggered subsystem
- misses a low-budget fallback before overload becomes user-visible
- hides the current budget class from operators
- records metrics but never uses them to select a fallback profile

## Near-term proof slice

The smallest durable proof for this contract is:

1. one cross-system budget ledger
2. one low-budget fallback profile
3. one test proving the fallback activates before overload
4. one telemetry or summary field naming the oversubscribed resource
5. one summary that identifies the subsystem that caused the fallback

## Open questions

- Which budget should be the first canonical trigger: frame time, heap use, or draw-call pressure?
- Should low-budget fallback primarily simplify visuals, simulation, or both?
- Which operator-visible summary format is best for a browser game: HUD label, diagnostic panel, or log record?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The engine can already tell us when it is getting expensive. This contract makes the next step explicit: define the fallback before the budget is exceeded, not after the player notices.

## Addendum (2026-07-25): budgets are measured, fallback policy is still implicit

- Re-checked the current runtime and browser surface after the contract review.
- The live app is still `Rigs Unbound — Field 02`, and the browser daemon is
  healthy with zero console logs in the current status snapshot.
- The runtime already exposes the relevant measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing
  - draw calls
  - triangle count
  - heap use
  - load duration
  - first-controllable time
  - save size
- `src/main.ts` wires those metrics into the browser surface, so resource
  pressure is visible today.
- What is still missing is the actual envelope policy:
  - one cross-system budget ledger,
  - one explicit low-budget fallback profile,
  - one test proving fallback happens before overload,
  - one operator-visible summary naming the oversubscribed resource,
  - one summary field naming the subsystem that triggered fallback.
- In other words: the project can already observe expense, but it still cannot
  officially choose a fallback path from a budget contract.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - budgets are measured, fallback policy is still implicit

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live app is still `Rigs Unbound — Field 02`, and the browser daemon is
  healthy with zero console logs in the current status snapshot.
- The runtime already exposes the relevant measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing,
  - draw calls,
  - triangle count,
  - heap use,
  - load duration,
  - first-controllable time,
  - save size.
- `src/main.ts` wires those metrics into the browser surface, so resource
  pressure is visible today.
- What is still missing is the actual envelope policy:
  - one cross-system budget ledger,
  - one explicit low-budget fallback profile,
  - one test proving fallback happens before overload,
  - one operator-visible summary naming the oversubscribed resource,
  - one summary field naming the subsystem that triggered fallback.
- In other words: the project can already observe expense, but it still cannot
  officially choose a fallback path from a budget contract.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - live metrics are rich, but fallback is still only a policy gap

- Re-checked the live browser daemon and the current performance wiring.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- `src/game/performance.ts` still exposes a solid measurement envelope:
  - frame timing,
  - p95 / average frame times,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - save bytes and last save duration.
- `src/main.ts` continues to surface those metrics through the developer/evidence
  readout and the public `window.getPerformanceSnapshot()` hook.
- That means the budget pressure is measurable and visible today.
- The missing layer is still the same contract boundary:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused the fallback.
- So the runtime can already tell us when it is getting expensive, but it still
  cannot name the fallback path as a first-class policy envelope.

## Addendum (2026-07-26) - current snapshot confirms the metrics are live, but the envelope is still missing

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current performance snapshot still exposes a real pressure picture:
  - `averageFrameMs`: `20.01`
  - `p95FrameMs`: `21.7`
  - `framesPerSecond`: `50`
  - `drawCalls`: `72`
  - `triangles`: `104694`
  - `terrainBuildMs`: `92.7`
  - `heapUsedMb`: `12.7`
  - `loadDurationMs`: `2.7`
  - `firstControllableMs`: `469.2`
  - `saveBytes`: `2971`
- `src/game/performance.ts` still exposes the same measurement spine, and
  `src/main.ts` still surfaces it through the browser hooks and developer
  readouts.
- That means the runtime is doing the important first half already:
  - measuring cost,
  - exposing pressure,
  - keeping the app readable while budgets stay bounded.
- What is still missing is the named envelope:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused fallback.
- The next durable step is still to name the fallback before the budget is
  exceeded, not after the player can feel the overload.

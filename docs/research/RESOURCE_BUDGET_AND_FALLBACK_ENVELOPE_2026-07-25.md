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

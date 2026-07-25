# Kernel Ordering and Mutable Subsystem Gates Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the deterministic simulation loop into a named kernel-ordering contract so future mutable subsystems cannot bypass the authoritative step order.

The runtime already has a fixed-step gameplay kernel, presentation separation, and replay-safe state snapshots. What it does not yet have is a first-class contract that says which systems may read, which may mutate, where validation happens, and how replay-relevant events are emitted.

## Current evidence base

- Fixed-step kernel and state mutation surface:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Browser wiring and command capture:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Render-only presentation surface:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Roadmap lane for kernel ordering:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right shape:

- the kernel is deterministic and fixed-step,
- the renderer consumes snapshots rather than authoring truth,
- commands and checkpoints are already captured in the browser entry point,
- replay-sensitive state already exists in the run-record surface.

That means the kernel contract can be written against a real boundary rather than an imagined one.

## What is still missing

The current surface still lacks:

- a declared tick-order table,
- explicit read/write authority for subsystems,
- validation gates before mutation,
- a replay-safe event emission point per mutable subsystem,
- a telemetry field naming the active kernel stage,
- a clear renderer-only versus kernel-only responsibility boundary.

## Contract shape

A durable kernel-ordering contract should separate:

1. **Authority order**
   - input / command intake
   - validation
   - mutation
   - event emission
   - snapshot or presentation
2. **Read/write ownership**
   - what each subsystem may read
   - what each subsystem may mutate
   - what each subsystem must never bypass
3. **Subsystem gates**
   - ordering dependency
   - failure mode
   - replay impact
   - telemetry signal
4. **Separation boundaries**
   - renderer-only
   - kernel-only
   - debug/observability-only

This keeps future AI, mission, economy, and traffic hooks from turning into hidden second loops.

## Validation rules

The contract should fail visibly if it:

- allows a mutation outside the declared kernel order,
- lets renderer-only code author world truth,
- skips validation before mutation,
- emits replay-relevant events without a stable stage,
- hides the active kernel stage from telemetry,
- permits a mutable subsystem to bypass the kernel’s order guarantees.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one ordered subsystem table showing read/write authority,
2. one validation gate that blocks a mutation outside the kernel order,
3. one replay-safe event emission point for a mutable subsystem,
4. one telemetry field that identifies the active kernel stage,
5. one test proving renderer-only code cannot mutate world state.

## Open questions

- Should the first gated mutable subsystem be missions, economy, or a debug-only system?
- Should kernel-stage telemetry live in the HUD, a debug panel, or logs?
- Should validation be centralized in one gate or named per subsystem adapter?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The kernel is already the game’s source of truth. This contract makes that rule
explicit so future mutable systems stay auditable and replay-safe.

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

## Addendum (2026-07-25) - the kernel order is real, but the gate table is still implicit

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still proves the core kernel boundary:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical mutation
    order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes user intent into the kernel,
  - replay-sensitive state remains visible through the bounded run-record lane.
- That means the game already has a real source-of-truth kernel.
- What is still missing is the named gate table the contract calls for:
  - no explicit subsystem read/write authority matrix,
  - no replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field exposed as a first-class boundary,
  - no documented renderer-only versus kernel-only enforcement surface.
- So the kernel is deterministic today, but the ordering contract is still
  mostly embodied in code shape and comments rather than an explicit gate table.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26) - kernel ordering remains authoritative, but the gate surface is still not a named policy

- Re-checked the live browser daemon and the current orchestration code.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The kernel boundary is still the real source of truth:
  - `src/game/state.ts` owns the fixed-step orchestration and canonical mutation
    order,
  - `src/game/renderer.ts` remains presentation-only,
  - `src/main.ts` captures commands and routes intent into the kernel,
  - run-record capture keeps replay-sensitive history visible.
- That makes the kernel order strong and explicit in the codebase.
- What is still missing is the policy layer named by the contract:
  - no ordered subsystem authority table,
  - no explicit replay-safe event emission point per mutable subsystem,
  - no kernel-stage telemetry field exposed as a first-class boundary,
  - no documented enforcement surface for renderer-only versus kernel-only
    responsibilities.
- So the current state remains the right one for a first-playable game, but the
  gate surface itself is still implicit rather than a named contract artifact.

## Addendum (2026-07-26) - episode grammar depends on kernel order for durable consequence

- Re-checked the gate surface against the named composition proposal.
- Episode grammar can compose above the kernel, but it cannot replace the
  kernel's ordered mutation steps or replay-safe event boundaries.
- The kernel remains the authority for input, validation, mutation, event
  emission, and snapshot/presentation order.
- That means the episode grammar should consume authoritative outcomes, not
  author the world directly.
- The next durable proof is a named read/write authority table that keeps this
  boundary explicit for future mutable subsystems.
- Evidence tier: Tier 1 static inspection.

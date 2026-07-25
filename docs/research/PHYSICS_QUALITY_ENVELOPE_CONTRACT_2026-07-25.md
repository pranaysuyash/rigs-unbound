# Physics Quality Envelope Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current lightweight traversal model into a named physics quality envelope.

The runtime already has a deterministic fixed-step traversal model, bounded collision checks, explicit terrain contact, and measured performance snapshots. That is a good first-playable physics posture. What it does not yet have is a first-class contract that names the stability envelope, fallback behavior, and observability for future growth.

## Current evidence base

- Traversal and motion model:
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- Deterministic game state and motion integration:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Performance visibility:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Roadmap lane for physics quality:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)

Live browser anchor:

- performance snapshot is exposed
- current live snapshot reports a measurable frame budget, draw calls, triangles, heap use, and first-controllable timing

## What is already there

The current physics model already has several strong properties:

- fixed-step determinism
- reduced-DOF body-on-four-contacts traversal
- emergent gearing, grade, and grip behavior
- explicit suspension, launch, and landing dynamics
- bounded obstacle checks
- observable motion outcomes such as slip, water depth, boundary impact, and stall

This is enough to call the physics layer intentional. It is not yet enough to call the quality envelope named.

## What is still missing

The repo still lacks a named policy for:

- explicit physics stability states
- terrain-contact invariants
- obstacle-contact invariants
- high-speed cornering or slope-handling thresholds
- water or fluid-adjacent fallback behavior
- operator-visible physics stability summaries

The current code already exposes the underlying outcome signals, but the policy that says when a simplified fallback is acceptable is still implicit.

## Contract shape

The physics envelope should separate:

1. deterministic locomotion
2. contact stability
3. fallback simplification
4. observable stability state
5. recovery / failure explanation

Suggested invariant families:

- terrain contact
- obstacle contact
- slope handling
- high-speed cornering
- stacking or near-overlap situations
- water or fluid-adjacent behavior

## Validation rules

The contract should fail visibly if it:

- loses fixed-step determinism
- allows collision counts to grow without bound
- hides a failed contact or unstable recovery
- changes feel without reporting the stability state
- silently simplifies water or slope handling in a way that players cannot observe

## Near-term proof slice

The smallest durable proof for this contract is:

1. one terrain-contact invariant test
2. one obstacle-stability regression test
3. one high-speed cornering or slope-handling test
4. one water or fluid-adjacent fallback rule
5. one telemetry or debug field for physics stability state

## Open questions

- Which current surface should be the canonical regression fixture for terrain contact?
- Should water fallback be represented as a visible slowdown, a clearance clamp, or a hard no-go state?
- Which physics state should be surfaced to operators first: grounded, airborne, slipping, stalled, or overloaded?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The physics layer is already stable enough to be a first-playable foundation. This contract makes the envelope explicit so the next locomotion or hazard step can extend the system without silently changing the game’s feel.

## Addendum (2026-07-25) - Live physics posture is stable and visible, but still not policyized

- Live browser evidence shows the current physics posture is compact and
  measurable:
  - about 78 draw calls,
  - about 105k triangles,
  - first-controllable and first-input-ready timing tracked separately,
  - a stable, grounded active rig with visible grip and condition readouts.
- The HUD already exposes the player-facing physics state:
  - `Grip`
  - `82%`
  - `100%`
  - `Home Silo workshop · fit modules, 0 salvage in the bin`
- The code path already surfaces the physics factors the contract cares about
  (`grounded`, `hover`, `slip`, `waterDepth`, `stalled`, condition, strain),
  but there is still no formal stability-state policy or fallback envelope.
- That means the physics layer is still best treated as an intentional
  first-playable foundation, not yet a named quality envelope with explicit
  fallback semantics.

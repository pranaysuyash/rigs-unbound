# Visibility Stage and LOD Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
2. [Browser Daemon](/Users/pranay/Projects/skills/testing/playwright-skill/SKILL.md)

## Purpose

Turn the current renderer's practical visibility choices into a named policy surface.

The live app already instantiates world props around the rig, keeps terrain in a single mesh, uses blob shadows instead of shadow maps, and exposes performance hooks for draw calls, triangles, frame timing, and first-controllable time. What it does not yet have is a formal contract for what counts as near, mid, far, or absent across rendering and simulation.

## Current evidence base

- Renderer:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Performance:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Exploration map:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

Runtime anchor:

- live browser page exposes `render_game_to_text`, `getPerformanceSnapshot`, and `selectCamera`
- live browser page currently focuses the playable world canvas after the intro is dismissed

## What is already there

The renderer already shows the beginnings of a visibility budget:

- terrain is a single mesh derived from a height field
- repeated props are instanced rather than individually drawn
- prop instances are rebuilt around the rig within a fixed radius
- furrows are instanced instead of accumulated as one mesh per mark
- stars and sky are explicitly treated as whole-scene presentation pieces
- blob shadows are used instead of real shadow maps

That is a sensible first-playable posture. It is not yet a formal visibility-stage contract.

## What is still missing

The repo still lacks a named policy for:

- frustum culling fixtures and exclusions
- distance-based visibility tiers
- subsystem-specific LOD
- portal or cluster visibility, where it becomes relevant
- counters for missed-cull pressure and residency churn

At the moment, some mesh classes explicitly disable automatic frustum culling because the current renderer is prioritizing consistent presentation over a formal visibility graph. That is a valid implementation choice for a first slice, but it needs a contract before more scale or more content arrives.

## Contract shape

The visibility policy should separate:

1. camera-space visibility
2. local draw-radius visibility
3. distant simulation tiers
4. hidden or inactive residency

The policy should define what each tier means for:

- geometry
- materials
- animation
- physics
- AI or interaction updates
- particles and feedback

## Validation rules

The contract should be considered healthy only if it can answer:

- what is visible in the camera frustum
- what is only present in the local render radius
- what can still simulate at reduced frequency
- what is fully inactive
- what is currently suppressed by fallback behavior

## Near-term proof slice

The smallest durable proof for this contract is:

1. one visible-actor culling fixture that excludes a non-visible entity from draw submission
2. one distance-tier matrix for geometry and at least one non-geometry subsystem
3. one observable counter for missed-cull pressure or residency churn
4. one regression test that proves the downgrade tier remains readable instead of disappearing into undefined behavior

## Open questions

- Should the first explicit culling fixture operate on a prop field, a clustered world site, or a dedicated synthetic scene?
- Which subsystem should be the first non-geometry LOD proof: animation, AI, physics, or particles?
- When should portal visibility graduate from "if applicable" to a real graph contract in this project?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The renderer already behaves like a deliberate first-pass visibility budget. This contract makes that budget legible so future scale decisions can be measured instead of guessed.

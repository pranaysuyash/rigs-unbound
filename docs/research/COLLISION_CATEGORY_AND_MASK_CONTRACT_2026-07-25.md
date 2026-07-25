# Collision Category and Mask Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current obstacle-resolution logic into an explicit collision-category / collision-mask policy.

The live code already resolves terrain contact and obstacle response deterministically, but the collision model is still largely implicit: obstacle kinds exist, and the physics layer asks the obstacle field to resolve overlaps, but there is no first-class matrix for ground, obstacle, hazard, trigger, projectile, sensor, and decorative roles.

## Current evidence base

- Obstacle and collision resolution:
  - [src/game/collision.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/collision.ts)
- Motion and contact outcomes:
  - [src/game/physics.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/physics.ts)
- Roadmap lane for collision categories and masks:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- Exploration map collision/camera/scale queue:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## What is already there

The current collision logic already has useful structure:

- obstacle generation is deterministic and seed-driven
- obstacle resolution is role-aware for trees versus rocks
- trees can be felled by a heavy enough, fast enough rig
- rocks block and slide the rig rather than collapsing
- terrain and obstacle placement already avoid authored route/pad areas

That is a real gameplay foundation. It is not yet a full category/mask contract.

## What is still missing

The repo still lacks a named policy for:

- category assignment for each collidable role
- a collision-mask matrix describing allowed interactions
- trigger contacts that fire behavior without mutating physics state
- sensor contacts that observe but do not block
- projectile and hazard responses separate from general obstacle resolution
- telemetry for unexpected or incompatible category/mask pairs

The current system can express "tree" and "rock" as obstacle kinds, but it cannot yet say "this is a sensor, it should not mutate motion" or "this is a trigger, it should fire an event but not block the rig."

## Contract shape

The collision policy should separate:

1. category identity
2. mask compatibility
3. contact response
4. side effects
5. observable telemetry

Suggested top-level roles:

- ground
- obstacle
- hazard
- trigger
- projectile
- sensor
- decorative

## Validation rules

The contract should fail visibly if:

- a role is missing a category
- a mask pair is undefined
- a trigger mutates physics state directly
- a sensor blocks motion
- a projectile or hazard is routed through the wrong generic obstacle path
- an incompatible pair is silently accepted

## Near-term proof slice

The smallest durable proof for this contract is:

1. one category/mask matrix for the current roles
2. one test proving a trigger contact does not mutate physics state
3. one test proving a sensor contact does not mutate physics state
4. one telemetry field for unexpected or incompatible pairings
5. one documented fallback behavior for unknown roles

## Open questions

- Should triggers and sensors be implemented as separate broad-phase tags or as mask-only semantic roles?
- Which current gameplay object should become the first trigger candidate: workshop pad, cargo ring, or map landmark?
- Which current gameplay object should become the first sensor candidate: survey mast, route probe, or replay/debug probe?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The collision model already does the important first-playable job. This contract makes the next step explicit: separate passive observation, state-changing triggers, and blocking contacts before more systems start sharing the same space.

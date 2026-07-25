# Lighting and Atmosphere Strategy Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s conservative lighting posture into a named contract so readability, mood, and fallback lighting stay intentional across quality tiers.

The current renderer already renders a readable world and the repo already tracks weather, time-of-day, and performance posture. What it does not yet have is a first-class lighting strategy that explicitly names ambient, directional, local accent, shadow, and atmosphere tiers.

## Current evidence base

- Renderer and scene lighting setup:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Performance and tier pressure visibility:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Day/night/world phase surface:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
- Weather and terrain context:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
- Roadmap lane for lighting and atmosphere:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has a sensible starting point:

- the world can be read under a conservative light model,
- time-of-day is already part of the game state,
- performance tracking exists to tell us when lighting is too expensive,
- readability already matters in the existing visual language notes.

That means lighting can be formalized as policy, not added as an afterthought.

## What is still missing

The current surface still lacks:

- a tiered lighting policy,
- explicit shadow-fallback rules,
- a named atmosphere cue for weather or time-of-day readability,
- a policy for when baked/probe lighting should replace dynamic shadows,
- a visible operator/debug field naming the active lighting strategy,
- a rule for preserving gameplay clarity when lighting budgets are reduced.

## Contract shape

A durable lighting contract should separate:

1. **Baseline lighting**
   - ambient base
   - directional key light
   - local accents
2. **Shadow strategy**
   - real-time shadows
   - baked/probe lighting
   - blob/simplified shadows
   - reduced shadow budgets
3. **Atmosphere cues**
   - weather readability
   - time-of-day readability
   - low-cost mood cues
4. **Fallback posture**
   - what degrades first
   - how the downgrade is surfaced
   - what remains readable even under pressure

This keeps lighting aligned with gameplay clarity rather than visual surprise.

## Validation rules

The contract should fail visibly if it:

- hides important terrain or obstacles in shadow,
- lets shadow quality become an implicit runtime surprise,
- removes the atmosphere cue before the world remains readable,
- has no operator-visible active-strategy note,
- makes the fallback path ambiguous,
- allows lighting to become more important than gameplay legibility.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one staged lighting policy covering ambient, directional, local accents, and shadow quality tiers,
2. one explicit fallback rule for baked/probe lighting or blob shadows,
3. one low-cost atmosphere cue for weather or time-of-day readability,
4. one operator-visible note or debug field naming the active lighting strategy.

## Open questions

- Should the first atmosphere cue target dawn/dusk, fog, or storm conditions?
- Should lighting strategy be surfaced in the HUD, debug tools, or both?
- Should the fallback path prefer simpler shadows or stronger ambient fill first?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)
- [RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)

## Anything else?

Lighting is part of the player’s ability to read the world, not just a visual
polish layer. This contract makes the fallback path intentional so reduced
budgets still preserve clarity, mood, and terrain legibility.

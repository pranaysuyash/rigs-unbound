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

## Addendum (2026-07-25) - Lighting is already staged, but the active strategy is still implicit

- `src/game/renderer.ts` already proves the lighting lane is real:
  - a directional sun and hemisphere light provide the base day model,
  - phase-specific fog and sky color changes already carry day/gloam/night
    readability,
  - blob shadows are the current low-cost fallback posture instead of shadow
    maps,
  - rig headlights are promoted at gloam/night so the world remains legible.
- `src/main.ts` already surfaces the world phase in the HUD, so the lighting
  stance is visible to the player as part of the current game state rather than
  just a renderer detail.
- The current browser session remains healthy and the active play surface is the
  same live field, which is enough to say the current lighting posture is not
  speculative.
- What is still missing is the named policy layer the contract describes:
  - no tiered lighting matrix exposed as contract data,
  - no explicit operator/debug field naming the active lighting strategy,
  - no formal fallback rule that says exactly when simpler shadows or stronger
    ambient fill should take over,
  - no low-cost atmosphere cue registry separate from the renderer code.
- So the right reading is that lighting is already intentional and readable, but
  it is still an implicit renderer policy rather than a first-class lighting
  envelope.

## Addendum (2026-07-26) - phase-driven lighting is live, but the tier matrix is still not a named policy surface

- Re-checked the current renderer and browser shell against the live Field 02
  runtime.
- `src/game/renderer.ts` already applies lighting by world phase:
  - a directional sun and hemisphere light form the baseline,
  - day/gloam/night switch sky colour, fog, and headlight intensity,
  - the world remains legible through the existing blob-shadow posture.
- `src/main.ts` already surfaces the world phase in the HUD, so the player can
  see the active lighting context rather than infer it only from the renderer.
- The runtime therefore already has the right ingredients for a lighting
  envelope:
  - readability first,
  - phase-specific mood,
  - low-cost fallback shadows,
  - explicit phase visibility.
- What is still missing is the named policy layer:
  - no contract data for the tier matrix,
  - no explicit operator/debug field naming the lighting strategy,
  - no formal fallback rule that says exactly when atmosphere should simplify
    before clarity is endangered.
- So lighting is still a real and readable system, but it is not yet a
  first-class policy envelope that operators can query by name.

## Addendum (2026-07-26) - the lighting posture is live and readable, but still not a first-class envelope

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/renderer.ts` still proves the lighting stance is real:
  - a directional sun and hemisphere light provide the base model,
  - lighting responds to world phase with fog/sky/headlight shifts,
  - blob shadows remain the low-cost fallback posture.
- `src/main.ts` still surfaces world phase in the HUD, so lighting context is
  visible to the player rather than hidden in renderer internals.
- The runtime therefore already has the right ingredients for lighting
  readability:
  - phase-specific mood,
  - low-cost fallback shadows,
  - explicit phase visibility.
- What is still missing is the named envelope:
  - no tier matrix in contract data,
  - no operator/debug field naming the active lighting strategy,
  - no formal fallback rule stating exactly when atmosphere should simplify
    before clarity is endangered.
- So lighting remains an intentional and readable system, but it still needs a
  first-class policy surface before the fallback story can be queried or
  governed as data.

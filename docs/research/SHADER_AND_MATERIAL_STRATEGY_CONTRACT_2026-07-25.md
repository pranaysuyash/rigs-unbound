# Shader and Material Strategy Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s baseline material path into a named shader/material contract so visual identity, readability, and weather cues stay composable instead of becoming one-off material forks.

The current renderer already uses standard materials, vertex-color terrain, and lightweight visual cues. That is enough for the first playable. What it does not yet have is a first-class contract for layered materials, weather modifiers, wear, hazard overlays, and fallback behavior.

## Current evidence base

- Renderer and material setup:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Terrain vertex-color and surface logic:
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
- World surface definitions and biome data:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Roadmap lane for shader/material strategy:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the beginnings of a usable visual language:

- terrain surfaces are data-driven and vary by biome,
- terrain geometry and color already communicate elevation and ground state,
- the renderer already separates material setup from simulation,
- the documentation already recognizes the need for weather/readability cues.

That means shader work can build on a clear baseline instead of starting from zero.

## What is still missing

The current surface still lacks:

- a layered material schema,
- explicit base-surface versus modifier separation,
- a versioned strategy for weather, wear, and hazard overlays,
- a low-cost fallback path when custom materials are unavailable,
- a clear operator-visible note about which strategy is active,
- an explicit rule for where material identity ends and gameplay readability begins.

## Contract shape

A durable shader/material contract should separate:

1. **Base surface**
   - terrain, vehicle, prop, or water identity
   - stable material family
2. **Modifiers**
   - weather
   - wear/damage
   - mud/dust/wetness
   - hazard/readability overlays
3. **Budget posture**
   - cheap baseline
   - enhanced path
   - degraded fallback
4. **Visibility intent**
   - what must remain readable at distance
   - what must remain legible under motion or weather

This keeps visual identity aligned with gameplay instead of fighting it.

## Validation rules

The contract should fail visibly if it:

- duplicates a material family where a modifier would suffice,
- hides terrain/wear/weather cues behind a decorative effect,
- removes readability under fallback conditions,
- leaves the active strategy opaque to operators,
- turns every machine or terrain type into a bespoke shader fork,
- makes the visual path dependent on hidden renderer behavior.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one layered material schema,
2. one custom shader or material module for a gameplay-relevant cue,
3. one fallback path that preserves clarity when the custom path is unavailable,
4. one operator-visible note or debug field identifying the active material strategy.

## Open questions

- Should the first custom module target terrain transition, hazard state, or weather feedback?
- Should the active strategy be surfaced in HUD, debug tools, or both?
- Should terrain and vehicle materials share the same modifier vocabulary or only a common subset?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)
- [RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERING_POTENTIAL_AND_ECONOMY_2026-07-25.md)

## Anything else?

The current visuals are already readable enough to support a first playable.
This contract makes the next layer explicit so richer weather, wear, and hazard
language can be added without collapsing readability or spawning ad hoc shader
special cases.

## Addendum (2026-07-25) - The renderer already has a visual language, but not a named material envelope

- `src/game/renderer.ts` already shows a real material strategy in the live
  runtime:
  - standard materials and vertex-color terrain carry the core look,
  - fog, sun color, and sky state change by phase,
  - dust, rust, wetness, and visibility cues are already represented through
    existing rendering code,
  - the terrain mesh and props are readable without a custom shader stack.
- `src/game/world.ts` and `src/game/terrain.ts` already provide the data basis
  for that look:
  - terrain surfaces vary by biome,
  - surface identity and color are data-driven,
  - ground state and terrain transitions already affect what the scene reads
    like.
- The live browser surface and current play session therefore prove the render
  lane is usable today, but the contract is still implicit rather than formal:
  - no layered material schema,
  - no versioned modifier vocabulary,
  - no explicit fallback marker for when a richer shader path is unavailable,
  - no operator-visible strategy flag naming the active material mode.
- The correct reading is that the renderer already has a strong, first-playable
  visual language; this contract exists to prevent future weather/wear/hazard
  richness from splintering that language into one-off forks.

## Addendum (2026-07-26) - The material path is still standard-material based, but the visual contract is real

- Re-checked the live browser surface on `Rigs Unbound — Field 02`; the
  browser daemon is healthy and the current console buffer is still empty.
- `src/game/renderer.ts` confirms the active material path is still a simple,
  readable baseline:
  - `material()` returns `THREE.MeshStandardMaterial`,
  - the terrain mesh uses vertex colors rather than a layered shader stack,
  - repeated world pieces are still instanced rather than individually shaded,
  - the renderer keeps its attention on readability and cost control instead of
    bespoke per-surface shader forks.
- `src/game/world.ts` and `src/game/terrain.ts` still supply the actual visual
  vocabulary:
  - surfaces are authored as data,
  - surface grip, drag, deformability, and color already differ by terrain
    family,
  - biome and site data already steer what the scene looks like.
- The live `render_game_to_text()` snapshot shows the same thing in runtime
  terms:
  - the field is readable,
  - the terrain language is encoded through data and lighting,
  - the current path has no explicit layered-material schema, no modifier
    versioning, and no operator-visible strategy flag.
- That means the correct next step is not “add more shaders everywhere.”
  The correct step is to formalize the current baseline into a named
  material/modifier contract so weather, wear, and hazard cues can grow without
  splitting the renderer into special-case branches.

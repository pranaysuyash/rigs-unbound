# Portal Visibility and Bounded Rooms Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s indoor visibility idea into a named contract so bounded rooms, doors, and other portals can scale cleanly alongside distance and chunk culling.

The current world is primarily outdoor and authored around terrain, routes, and open-space traversal. What it does not yet have is a first-class portal graph for enclosed or semi-enclosed spaces with explicit open/closed propagation, fallback handling, and visibility telemetry.

## Current evidence base

- Spatial culling and render-streaming lane:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- World and terrain substrate:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
- Renderer path:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)

## What is already there

The repo already has the right spatial backbone:

- distance and terrain-based visibility can already be reasoned about,
- world scale is deterministic,
- terrain and authored sites are data-driven,
- render budgets and spatial residency are already part of the architecture trail.

That means portal visibility can extend the current model instead of replacing it.

## What is still missing

The current surface still lacks:

- a room or bounded-space graph schema,
- portal edges with open/closed state,
- visibility propagation rules across rooms,
- fallback behavior when room/portal data is missing,
- telemetry naming the active room or portal path,
- a rule for how portal visibility complements distance and chunk culling.

## Contract shape

A durable portal-visibility contract should separate:

1. **Room graph**
   - room or bounded-space identifiers
   - portal edges
   - closed/open state
2. **Propagation**
   - how visibility moves from room to room
   - how unresolved data falls back
3. **Complementarity**
   - distance culling outside the space
   - chunk residency for world scale
   - obstruction handling for the final render set
4. **Telemetry**
   - active room
   - admitted portal path
   - fallback visibility mode

This keeps indoor visibility readable without turning it into a special-case renderer hack.

## Validation rules

The contract should fail visibly if it:

- allows a closed portal to propagate visibility,
- omits a fallback path when graph data is missing,
- lets rooms render without a declared portal path,
- conflicts with distance or chunk culling,
- hides which room or portal path admitted visibility,
- makes indoor visibility depend on implicit renderer heuristics.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one room/portal graph schema,
2. one test proving a closed portal blocks visibility propagation,
3. one test proving an open portal admits visibility to the connected room,
4. one fallback path when portal data is missing,
5. one telemetry field identifying the active room or portal path.

## Open questions

- Should the first portal graph target a workshop, a tunnel, or a small interior set?
- Should portal visibility operate on authored rooms only or on generated bounded spaces too?
- Should visibility telemetry be visible to the player, the operator, or both?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Portal visibility should not replace the existing open-world spatial model.
It should make bounded interiors and connected spaces readable using the same
deterministic architecture the rest of the world already uses.

## Addendum (2026-07-26) - The current app is still open-world first, so portal visibility remains a future boundary

- Re-checked the live browser surface on `Rigs Unbound — Field 02`; the
  browser daemon is healthy and the current console buffer is still empty.
- The current codebase still reads like an outdoor-first world:
  - `src/game/world.ts` is authored around terrain, routes, biomes, and sites,
    not bounded room graphs,
  - `src/game/terrain.ts` resolves world visibility through terrain, authored
    sites, and route authority,
  - `src/game/renderer.ts` renders an open field with terrain, props, rigs, sky,
    and atmosphere instead of room/portal propagation.
- That means portal visibility is still a real contract boundary, but it is not
  yet part of the live first-playable runtime:
  - there is no room or bounded-space schema,
  - there is no portal-edge state model,
  - there is no telemetry for an active room or portal path,
  - there is no fallback visibility mode because no portal graph exists yet.
- The useful takeaway is that the app does not need portal visibility to be
  usable today; it needs the contract so future interiors, workshops, tunnels,
  and other bounded spaces can join the same deterministic visibility model
  without inventing a second renderer path.

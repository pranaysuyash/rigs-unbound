# Streaming World Manifest and Residency Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s current single-residency world into a named streaming contract before world scale grows past its current local-memory model.

The code already has a strong canonical world substrate: one `GameWorld`, one `TerrainField`, one obstacle field, one exploration field, and one snapshot/save boundary. What it does not yet have is a chunk/region residency lifecycle with manifest validation, activation, unload, and rollback rules.

## Current evidence base

- Canonical world memory and spatial deltas:
  - [src/game/gameworld.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/gameworld.ts)
- Terrain as the single answer to world geometry:
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
- World authored data and anchor logic:
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Roadmap lane for streaming-world lifecycle:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right primitives for a future streaming layer:

- world truth is deterministic and seed-based,
- memory deltas are bounded and serializable,
- terrain, obstacles, and exploration are split from the high-level state record,
- save/load restores spatial memory through a single canonical world object.

That means streaming can be added without rewriting the world model.

## What is still missing

The current surface still lacks:

- a `WorldChunkManifest` or equivalent region manifest,
- residency states such as pending, active, evicted, invalid, or rollback-ready,
- a validation step before activation,
- a budget counter for maximum active chunks and actors,
- unload policy and rollback policy for stale or invalid chunk activation,
- observability for residency churn and activation latency.

## Contract shape

A durable streaming contract should separate:

1. **Manifest**
   - id
   - version
   - region bounds
   - dependencies
   - validation hash or compatibility data
2. **Residency state**
   - pending
   - active
   - evicted
   - invalid
   - rollback-needed
3. **Lifecycle**
   - request
   - validate
   - activate
   - monitor budget
   - unload/rollback
4. **Budget policy**
   - max active chunks
   - max actors per chunk
   - fallback behavior when pressure exceeds budget
   - observability for load/unload churn

This keeps world scale deterministic instead of letting local radius logic become the hidden streaming policy.

## Validation rules

The contract should fail visibly if it:

- activates a chunk without manifest validation,
- loses the canonical world truth when a chunk unloads,
- exceeds the active chunk budget without a recorded fallback,
- silently discards resident state on unload,
- permits stale or incompatible chunk activation,
- makes residency behavior depend on frame timing rather than manifest and budget rules.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one `WorldChunkManifest` schema,
2. one request/validate/activate/unload lifecycle test,
3. one budget counter for active chunk residency,
4. one rollback test for invalid or stale chunk activation.

## Open questions

- Should chunk identity be authored from world data, generated from route/biome cells, or both?
- Should residency fallback prefer unload, downgrade detail, or defer activation?
- Should active-chunk budgets be global, biome-based, or camera-local?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The world is already stable enough to be a seed-based canonical substrate.
This contract names the next scaling boundary so residency can stay a policy
layer instead of turning into a silent second world model.

## Addendum (2026-07-25): the repo is still single-residency

- Re-checked the world substrate against the current repo state and live app
  surface.
- The world model is still one canonical `GameWorld` composed with one
  `GameState`, not a streamed chunk graph:
  - `src/game/gameworld.ts` owns a single terrain field, obstacle field, and
    exploration field.
  - `src/game/storage.ts` restores and saves that world as one payload alongside
    state, rather than loading region manifests.
  - `src/game/world.ts` still defines one authored disc world with one bounded
    radius and one authored site set.
- The live browser surface still behaves like a single playable residency, not a
  chunk/region residency manager.
- Missing layers remain exactly the ones this contract names:
  - `WorldChunkManifest` or equivalent region manifest,
  - residency states and lifecycle,
  - activation validation,
  - active-chunk budget accounting,
  - unload/rollback policy,
  - residency churn observability.
- That means the right status for streaming remains: future boundary, not hidden
  second world model.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh Field 02 recheck, same single-residency boundary

- Re-checked the streaming-world contract against the current browser daemon
  and live Field 02 runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The current world substrate still behaves like a single canonical residency:
  - one `GameWorld`,
  - one `TerrainField`,
  - one obstacle field,
  - one exploration field,
  - one snapshot/save boundary.
- `src/game/world.ts` still defines authored world data and anchors, not a
  chunk/region manifest graph.
- `src/game/storage.ts` still restores and saves the world as one payload rather
  than streaming region manifests into and out of runtime residency.
- That means the streaming contract is still correctly staged as a future
  boundary:
  - no `WorldChunkManifest` yet,
  - no residency states,
  - no activate/unload/rollback lifecycle,
  - no residency churn observability.
- The repo therefore still has a stable single-residency world, but not yet the
  chunked residency layer the contract names.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

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

## Addendum (2026-07-26) - live field still proves the single-residency boundary

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/gameworld.ts` still owns one canonical `GameWorld` with:
  - one terrain field,
  - one obstacle field,
  - one exploration field,
  - bounded spatial sets for felling, collection, and survey history.
- `src/game/storage.ts` still writes and restores that world as one composed
  save payload alongside state, with versioned keys rather than streamed region
  manifests.
- That means the runtime remains intentionally single-residency:
  - no chunk manifest,
  - no pending/active/evicted/rollback residency states,
  - no activation validation lifecycle,
  - no active-chunk budget counters,
  - no unload/rollback observability.
- The useful conclusion is unchanged but now freshly confirmed: streaming is a
  real next boundary, not a hidden implementation already waiting underneath the
  current field.

## Addendum (2026-07-26) - the world remains intentionally single-residency

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/game/gameworld.ts` still owns one canonical `GameWorld` with:
  - one terrain field,
  - one obstacle field,
  - one exploration field,
  - bounded spatial sets for felling, collection, and survey history.
- `src/game/storage.ts` still writes and restores that world as one composed
  payload alongside state, with versioned keys rather than streamed manifests.
- The live snapshot still behaves like one playable residency, not a chunk
  manager:
  - one field substrate,
  - one save boundary,
  - one spatial-memory record,
  - no residency lifecycle state.
- What is still missing is the streaming layer the contract names:
  - no `WorldChunkManifest`,
  - no pending/active/evicted/rollback residency states,
  - no activation validation,
  - no active-chunk budget counters,
  - no unload/rollback observability.
- The useful conclusion is the same but now freshly confirmed on Sunday, July
  26, 2026: streaming is still a future boundary, and the current world should
  remain treated as a canonical single-residency substrate until a real chunk
  lifecycle is proven.

## Addendum (2026-07-26) - residency must partition memory, not world truth

### Static evidence reviewed

- `src/game/gameworld.ts` constructs one seed-bound `GameWorld` containing one
  `TerrainField`, one `ObstacleField`, and one `ExplorationField`. Its spatial
  memory is one bounded `WorldMemoryRecord`: deformation entries plus global
  sets for felled obstacles, collected nodes, and surveyed cells.
- `src/game/storage.ts` writes that record atomically beside `GameState` in one
  versioned local payload and restores it into the same world instance before
  settling the rig on terrain.
- `src/game/terrain.ts` keeps deformation as a sparse coordinate-keyed map and
  exposes the canonical terrain queries used by physics, collision, cameras,
  exploration, and rendering.
- `src/game/world.ts` currently defines one authored field bounded by
  `WORLD_RADIUS = 250`; it is authored world data, not a manifest graph.

### Decision

Do not add a renderer-local chunk cache, per-system chunk stores, or an
activate/unload facade now. Each would duplicate the current world truth while
there is no measured residency pressure and no content boundary that needs
independent loading.

When a measured scale trigger exists, chunking must partition **residency and
memory ownership**, while `GameWorld` remains the only query surface for
terrain, obstacles, exploration, collision, and persistence. A chunk may be
inactive in memory; it must never become an alternative answer to what the
world is at a coordinate.

### First safe implementation slice

The first code slice must be a bounded, testable residency planner rather than
general streaming infrastructure:

1. Define a deterministic `WorldChunkKey` from fixed world-grid coordinates and
   a versioned manifest carrying seed/content compatibility metadata.
2. Give each persisted spatial delta an explicit owning key while preserving
   cross-boundary queries through `GameWorld`.
3. Model only `requested`, `validated`, `active`, `evicted`, and `rejected`
   states, with no frame-timing-dependent transitions.
4. Enforce an active-chunk budget and record activation latency, eviction count,
   validation failures, and pressure fallbacks.

## Addendum (2026-07-26) - residency should stay separate from asset approval

- Re-checked the current runtime split while continuing the streaming lane.
- The world save path is still the single residency truth:
  - `src/game/gameworld.ts` snapshots terrain deformation plus bounded spatial
    sets for felled, collected, and surveyed world memory.
  - `src/game/storage.ts` composes that memory back into one save payload with
    `GameState`; it does not route through a chunk manifest or per-region load
    table.
- The asset side is already governed by a different contract surface:
  - `assets/asset-manifest.json` carries runtime bridge entries,
  - `src/game/runtime-assets.ts` filters them with `publicRuntimeApproved`,
  - player-facing use and content approval are therefore distinct from spatial
    residency.
- The useful boundary is now sharper:
  - streaming should own where world memory is resident,
  - asset provenance should own what content is allowed to surface,
  - neither should silently become the other.
- The next safe streaming proof should continue to be a bounded residency
  planner, not a general asset-loader rewrite or renderer-local cache.
- Evidence depth: Tier 1 static source inspection using the current world/save
  code and the live asset-manifest bridge path.
5. Prove that an activate -> mutate -> evict -> reactivate sequence preserves
   terrain, obstacle, exploration, and save/load outcomes, including mutations
   on a chunk border.

### Trigger and acceptance gate

Start that slice only after a profiler identifies one concrete pressure source:

- world/asset memory exceeding the declared device budget,
- simulation or render work scaling with unloaded-distance content,
- content that cannot be represented in the current authored field without
  independent residency, or
- a planned travel boundary whose assets need asynchronous activation.

The initial proof needs Tier 2 lifecycle and persistence tests followed by Tier
3 browser evidence. Until then, the correct status is **documented future
boundary, deliberately not implemented**. This static recheck is Tier 1; it
does not claim fresh runtime or performance evidence.

## Addendum (2026-07-26) - the current world is still a single residency, which keeps the trigger honest

- Re-checked the world substrate against the current repo state.
- `src/game/gameworld.ts` still owns one canonical `GameWorld` with one terrain
  field, one obstacle field, and one exploration field.
- `src/game/storage.ts` still writes and restores that world as one composed
  payload alongside state, rather than loading or evicting chunk manifests.
- `src/game/world.ts` still defines one authored field bounded by a single
  radius and authored site set, not a streamed residency graph.
- The useful conclusion is unchanged: streaming is still a real future
  boundary, not a hidden implementation already waiting under the current
  field.
- The next safe proof should still be a bounded residency planner with a real
  measured trigger, not a broad streaming rewrite.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-26) - streaming residency supports episode grammar, but it is not the episode grammar

- The current single-residency world already does the important support work
  for episode continuity: it keeps the field, the save boundary, and the
  authored world truth coherent while the player moves through it.
- That makes streaming residency a support layer for the episode grammar,
  because episodes only stay readable if the world remains the same world even
  when memory residency later becomes chunked.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - streaming residency will own where world memory is resident,
  - the world substrate itself remains the canonical truth for what exists.
- This note intentionally keeps streaming future-bound; it only makes the
  dependency visible so later episode work can rely on the same world truth.

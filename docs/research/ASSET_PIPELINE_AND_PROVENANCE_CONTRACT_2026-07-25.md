# Asset Pipeline and Provenance Contract (2026-07-25)

## Skills consulted

1. [3d-asset-production](/Users/pranay/Projects/external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)

## Purpose

Turn the repo’s asset provenance notes into a named runtime asset pipeline contract.

The repo already treats asset provenance as important, but it still lacks a first-class asset flow from source artifact to runtime manifest. This contract makes that flow explicit so browser-facing assets can be validated, compressed, versioned, replaced, and deprecated without becoming a second truth source.

## Current evidence base

- Asset provenance and rights notes:
  - [docs/research/ASSET_PROVENANCE_REGISTER.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PROVENANCE_REGISTER.md)
  - [docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
- Runtime data path and world rendering:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
  - [src/game/terrain.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/terrain.ts)
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- Roadmap lane for asset pipeline and provenance:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right direction:

- asset provenance is tracked as a separate concern,
- browser-facing asset ingestion and compression are already named elsewhere,
- world and terrain are data-driven rather than ad hoc,
- asset replacement and rights warnings are already part of the broader documentation trail.

That means the pipeline can be formalized without inventing a parallel asset truth source.

## What is still missing

The current surface still lacks:

- a canonical runtime asset manifest schema,
- source artifact to runtime manifest lineage,
- provenance/license metadata on every runtime-relevant asset,
- explicit compression and LOD-intent metadata,
- safe replacement/deprecation behavior for runtime entries,
- rejection rules for incomplete or incompatible asset records.

## Contract shape

A durable asset pipeline should separate:

1. **Source artifact**
   - DCC file, scan, generated asset, or other source
   - source path or source ID
   - authoring provenance
2. **Normalized export**
   - cleaned geometry
   - bake outputs
   - compression profile
   - derived runtime files
3. **Manifest entry**
   - id
   - version
   - hash
   - license / ownership status
   - modification history
   - LOD intent
   - replacement/deprecation path
4. **Runtime activation**
   - validated-manifest only
   - reject or defer invalid records
   - preserve a consistent asset registry across sessions

This keeps runtime asset use inspectable and safe.

## Validation rules

The contract should fail visibly if it:

- lacks provenance or license metadata,
- exceeds the allowed budget or compression policy,
- violates naming or schema rules,
- references incompatible runtime expectations,
- misses derived artifacts,
- lets raw source files bypass validated manifests,
- cannot replace or deprecate an asset safely.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned asset manifest schema,
2. one provenance/license validator,
3. one rejection test for a missing or incompatible asset record,
4. one safe replacement/deprecation path for a runtime asset entry.

## Open questions

- Should the first runtime manifest cover static props, terrain variants, or vehicle-related art?
- Should provenance include both authoring source and tool/provider lineage for generated inputs?
- Should replacement/deprecation events be visible to operators only, or also to the player?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already knows asset provenance matters. This contract makes the delivery
path explicit so runtime can consume validated manifests instead of raw source
art, and so replacement never becomes ambiguous.

## Addendum (2026-07-25) - Current runtime asset posture

- The live Field 02 renderer is still deliberately asset-light:
  - terrain readability comes from vertex colours and procedural geometry,
  - `src/game/renderer.ts` explicitly notes zero texture assets and zero asset
    provenance obligations for the current terrain pass,
  - no imported runtime GLB/FBX/texture manifest is part of the active browser
    path yet.
- That makes the current asset-production pressure point clearer:
  - the repo already has concept/reference art and source-library audits,
  - the next durable step is a versioned runtime asset manifest once imported
    art actually enters the playable path.
- Evidence tier: Tier 1 static code/doc inspection plus live runtime context.

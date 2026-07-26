# World Schema and Content Ingestion Gate

**Date:** 2026-07-26  
**Status:** Static authored world schema is canonical; external content ingestion is staged  
**Evidence tier:** Tier 1 static source and test-source inspection. No test, build, browser, or runtime command was run in this pass.

## Decision

`src/game/world.ts` remains the single canonical authored-world schema for the current bounded field. It is production data expressed in typed source, not incidental renderer coordinates or activity-local constants.

Do not externalize this data into arbitrary JSON merely to call it data-driven. Move to external content only when a real second world/region/content-pack producer requires it, and then preserve the same validation, dependency ordering, and one-source-of-truth guarantees.

## What the canonical world schema owns

| Data group | Current consumers | Why central ownership matters |
| --- | --- | --- |
| World radius, water, ridge limits | Terrain and traversal rules | Prevents a render-only boundary or a physics-only waterline. |
| Surface materials | Terrain, physics/readability, audio/feedback | Keeps grip, drag, deformation, visual colour, and spray semantics aligned. |
| Biomes | Terrain surface/relief selection | Makes a biome a world rule, not just a texture palette. |
| Authored sites | Terrain anchors, discovery, state, renderer, minimap, navigator, rumor graph | A landmark cannot be buried by terrain or differently named by separate systems. |
| Structures | Renderer, scene query, rig collision, camera obstruction | Visual dimensions and spatial-query proxies share one record. |
| Routes | Terrain construction and route validation | Road/accessibility intent is explicit rather than inferred from decoration. |

The module’s declared dependency order is intentionally one-way:

```text
noise -> world -> terrain -> contracts -> state -> renderer
```

`world.ts` must remain data-only: it does not import terrain or state behavior. This protects deterministic construction, testability, and later content validation.

## What is dynamic versus authored

| Layer | Current source of truth |
| --- | --- |
| Authored geography, landmarks, terrain intent, structure proxies | `world.ts` static typed tables. |
| Procedural terrain and obstacle field | Seeded `GameWorld` fields constrained by the authored tables. |
| Player-caused deltas such as deformation, felled objects, collection, survey | Bounded `GameWorld` spatial memory, persisted and replay-context captured separately. |
| Presentation geometry | Renderer projection of the canonical authored and dynamic world. |

This separation avoids two common failures: persisting an entire generated world when a seed plus deltas is enough, and letting renderer-only placement become hidden collision/navigation truth.

## Current guarantees and limits

The in-source model provides type-level shape checks and static tests that consume sites/routes/surfaces. It does not provide a raw-content ingestion boundary because no external region, mod pack, downloaded map, or generator output is currently eligible to drive runtime world state.

That is correct scope. TypeScript constants are safe current authored content; they are not proof that arbitrary JSON, AI-generated layouts, or mod files would be valid.

## External-content admission pipeline

When a second content producer is real, raw world data must pass this order before it affects a session:

```text
raw pack or generated candidate
  -> schema validation
  -> semantic world validation
  -> cross-reference resolution
  -> terrain/route/connectivity probe
  -> asset and capability compatibility checks
  -> normalization into immutable runtime definition
  -> versioned activation
```

### Required semantic checks

- stable unique IDs for surfaces, biomes, sites, structures, routes, and packs;
- all site/route/structure references resolve exactly once;
- positions, radii, elevations, strengths, and material coefficients are finite and within configured world bounds;
- home/spawn/workshop guarantees remain satisfiable;
- terrain anchors do not create unreachable or contradictory routes;
- rig and camera collision proxies agree with authored structure geometry;
- progression/activity references use known capabilities and valid world offers;
- asset references pass manifest/provenance approval;
- save, replay, and content schema versions have a migration/rejection policy;
- generated candidates have resource and simulation-budget checks before activation.

## Ownership rules after externalization

- Content packs may define data, not direct simulation callbacks.
- `GameWorld` remains the owner of live procedural fields and player-caused deltas.
- State/activity systems resolve canonical IDs; they do not duplicate landmark coordinates or surface coefficients.
- Renderer/audio/UI consume resolved world facts and must not repair malformed content by silently inventing values.
- Invalid content fails before a playable session starts, with a diagnostics report and safe fallback to an already approved pack where applicable.

## Non-goals

- No runtime JSON loader or modding SDK now.
- No second copy of static world data under `assets/` or renderer-only constants.
- No map streaming/residency implementation; external schema and streaming lifecycle are distinct decisions.
- No procedural/AI-generated map may mutate the world directly.

## Closure trigger

Revisit this gate when the project adds a second region, importable content pack, editor output, procedural world candidate, or mod-facing map format. That work must land the validation pipeline and version policy in the same change; it must not bypass the canonical schema with ad hoc runtime objects.

## Anything else?

Yes: world-content schema, asset residency, and activity content are linked but distinct. A region data format must not be used as an excuse to silently introduce streaming, mod execution, or direct world mutation.

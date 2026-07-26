# Authoring and Reproducible Content Validation Contract (2026-07-25)

## Skills consulted

1. [3d-asset-production](/Users/pranay/Projects/external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)

## Purpose

Turn the repo’s data-driven content model into a named validation contract so activities, world modules, and imported content cannot bypass runtime rules just because they came from a tool, editor, or generated manifest.

The runtime already has a strong content surface: world sites, module definitions, rig profiles, and deterministic validation paths. What it does not yet have is a first-class authoring contract that makes schema validation, provenance, compatibility, and reproducible validation results part of the content lifecycle.

## Current evidence base

- Module and world content definitions:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
  - [src/game/world.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/world.ts)
- State and load-time validation paths:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- Asset/pipeline sibling contracts:
  - [docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
  - [docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- Roadmap lane for authoring and reproducible content validation:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already does several important things right:

- content is represented as data rather than hardcoded behavior,
- load paths already validate state before accepting it,
- modules and world entities already have explicit identities,
- runtime and authoring concerns are already separated in some places.

That means validation can be formalized without tearing out the current content model.

## What is still missing

The current surface still lacks:

- versioned content-manifest schemas for activities or world modules,
- validator-first rejection tests,
- reproducible validation result artifacts,
- provenance/source metadata for content inputs,
- a runtime-ready versus validation-only status signal,
- a clear rule that imported or generated content must pass the same contracts as native content.

## Contract shape

A durable authoring contract should separate:

1. **Content manifest**
   - id
   - version
   - type (activity, world module, etc.)
   - dependencies
   - compatibility rules
   - provenance/source metadata
2. **Validation**
   - schema validation
   - compatibility validation
   - reproducible result artifact
   - rejection reasons
3. **Status**
   - validation-only
   - runtime-ready
   - rejected
   - deprecated
4. **Runtime boundary**
   - imported, edited, or generated content must obey the same contracts as native content
   - validation must not be bypassed by the authoring source

This keeps content from turning into a second mutable truth source.

## Validation rules

The contract should fail visibly if it:

- accepts a manifest with missing or incompatible schema data,
- hides dependency or compatibility failures,
- emits no reproducible validation result,
- lacks provenance/source metadata,
- allows validation-only content to be treated as runtime-ready,
- lets tool/editor/generated content bypass capability, affordance, migration, or budget rules.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned content-manifest schema for activities or world modules,
2. one validator-first rejection test,
3. one reproducible validation result artifact,
4. one provenance/source metadata field,
5. one runtime-ready versus validation-only status signal.

## Open questions

- Should the first manifest target activities, world modules, or both?
- Should validation results be stored per manifest, per run, or per authoring session?
- Should provenance include tool/provider lineage for generated content inputs?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already knows content should be data-driven.
This contract makes the authoring path reproducible so the runtime can trust
validated content without guessing where it came from.

## Addendum (2026-07-25) - live content is already validated, but the manifest envelope is still implicit

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime already proves that content is validated before
  acceptance:
  - state/load paths reject bad or incompatible records,
  - the content model remains data-driven rather than hardcoded,
  - module and world definitions already have explicit identities.
- That means the repo is not trusting arbitrary content blindly.
- What is still missing is the reproducible authoring envelope the contract
  names:
  - versioned content-manifest schemas,
  - validator-first rejection tests,
  - reproducible validation result artifacts,
  - runtime-ready versus validation-only status,
  - provenance/source metadata that survives the authoring path.
- So the runtime already enforces the spirit of the contract, but the named
  content-manifest layer is still future-facing rather than first-class.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26) - asset validation is real, but the general authoring manifest is still broader than the current pipeline

- Re-checked the current browser daemon and the local asset pipeline.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The repo already has a real asset-specific validation spine:
  - `assets/asset-manifest.json` carries stable ids, source paths, runtime
    paths, status, and rights metadata,
  - `tools/asset-preflight.mjs` validates GLB structure, path safety, and
    missing dependencies,
  - the asset manifest currently keeps all candidate runtime paths out of the
    playable path until proof exists.
- That means validator-first asset admission is already real for the asset lane.
- The gap the authoring contract names is broader than that:
  - no versioned content-manifest schema for activities or world modules,
  - no reproducible validation-result artifact for the general content path,
  - no status signal that cleanly separates validation-only, runtime-ready, and
    deprecated across the broader authored content surface,
  - no reusable authoring envelope that applies the same contracts to imported,
    edited, or generated content beyond the asset slice.
- So the current state is strong on asset admission, but the contract still
  needs the general authoring envelope to make the whole content lifecycle
  reproducible.

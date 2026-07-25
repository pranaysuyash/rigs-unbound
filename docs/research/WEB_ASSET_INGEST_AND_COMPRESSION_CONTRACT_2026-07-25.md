# Web Asset Ingest and Compression Contract (2026-07-25)

## Skills consulted

1. [3d-asset-production](/Users/pranay/Projects/external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)
2. [3d-web-experience](/Users/pranay/Projects/skills/3d-web-experience/SKILL.md)

## Purpose

Make browser-facing mesh, material, texture, audio, and animation ingestion a versioned contract instead of an informal import step.

The web audit already recognizes that 3D delivery depends on loading, accessibility, and profile bootstrap.
This contract closes the remaining gap by defining how assets move from source artifact to validated runtime manifest.

## Current evidence base

- Asset provenance register:
  - [docs/research/ASSET_PROVENANCE_REGISTER.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PROVENANCE_REGISTER.md)
- Kenney source-library audit:
  - [docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)
- Canonical asset-pipeline addendum:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- Web accessibility and deliverability audit:
  - [docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- Roadmap lane for asset pipeline and provenance:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## Contract shape

The runtime path for a web asset should be:

1. source artifact
2. normalized export
3. manifest entry
4. validation
5. runtime activation
6. deprecation or replacement

That path must be explicit and inspectable. Raw source files are not runtime truth.

## Required asset record fields

Every runtime-relevant asset entry should carry:

- source path or source ID
- source hash
- license or ownership status
- modification history
- compression profile
- LOD intent
- replacement or deprecation path
- browser/runtime readiness status
- reviewer or provenance source

If an asset is generated, the source/provenance field must name the generation tool or pipeline and the input reference used.

## Validation rules

Reject an asset before activation if it:

- lacks provenance or license metadata
- exceeds the declared browser budget
- violates naming or manifest schema rules
- has missing or incompatible derived artifacts
- references unsupported node hierarchy, axis, scale, or unit expectations
- uses a texture color space or compression profile that conflicts with the runtime loader
- has no visible fallback or replacement path when the asset is optional

Validation should fail early and visibly. Silent substitution is not acceptable.

## Compression and LOD policy

Compression is allowed only after a measured baseline exists.

The preferred order is:

1. measure the unmodified source asset
2. validate provenance and compatibility
3. choose compression profile
4. generate or assign LODs
5. create runtime-ready derived assets
6. record the deltas against the baseline

Rules:

- do not compress first and explain later
- do not replace a source mesh with a different shape unless the manifest says so
- do not let one asset silently stand in for another
- do not use runtime mesh mutation to hide an invalid source record

## Runtime activation rules

The browser should consume validated manifests, not raw source directories.

Runtime activation must record:

- chosen asset key
- source hash
- derived hash
- compression profile
- loaded LOD set
- fallback or reject state

This keeps the asset layer observable when something goes wrong in the browser.

## Replacement and deprecation rules

Every runtime asset entry needs a replacement path.

When an asset is superseded:

- mark the old manifest entry as deprecated
- keep a visible migration or alias path where needed
- keep the replacement asset keyed by semantic identity
- preserve the old entry long enough for save or replay compatibility

If an asset is rejected, the browser should surface a clear diagnostic instead of swapping in a different object without explanation.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned manifest schema for web assets
2. one provenance/license validator
3. one rejection test for a missing or incompatible asset record
4. one browser-visible diagnostic for an invalid or oversized asset
5. one safe replacement/deprecation path for a runtime asset entry

## Open questions

- Which source asset classes will be first-class in the browser runtime: GLB only, or GLB plus audio and texture references?
- What is the first measurable browser budget for mesh size, decoded texture memory, and startup latency?
- Which derived outputs are produced in-repo versus during authoring?
- Which loader fallback is acceptable for a missing optional asset: visible placeholder, reject message, or content skip?

## Linked artifacts

- [ASSET_PROVENANCE_REGISTER](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ASSET_PROVENANCE_REGISTER.md)
- [KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)
- [3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## Anything else?

This contract keeps browser delivery honest: if an asset cannot be named, hashed, validated, compressed, and replaced cleanly, it is not ready to be part of the runtime.

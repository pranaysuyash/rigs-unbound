# Asset Production Skill Review — 2026-07-25

Status: **Slice A implemented; runtime asset integration remains pending discussion**

## Purpose

Apply the imported [`3d-asset-production`](../../../external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md) skill to the current Rigs Unbound direction: a generated/reference-informed repaired tractor and modular vehicle world that must remain browser-friendly, inspectable, and safe to evolve.

The skill's useful boundary is asset finishing and delivery, not choosing a generation provider or building the whole world. Its central requirement is a delivery contract: identify the consumer, preserve an editable/source record, create a runtime derivative, and validate in the actual consumer.

## Current evidence

### Already aligned

- The exploration map names GLB/glTF as the canonical runtime format, Blender source/export validation, impostors/LOD/texture compression, asset hashes, provenance, licenses, attribution, and replacement paths.
- [`ASSET_PROVENANCE_REGISTER.md`](ASSET_PROVENANCE_REGISTER.md) records generated concept inputs, hashes, intended use, approval status, rights uncertainty, and replacement paths.
- The Kenney audit defines a proposed selective fixture manifest and explicitly keeps the private bundle outside runtime/project truth until each selected asset has pack-level license evidence, hashes, normalization checks, and a visual fit review.
- Built-in image generation is already producing persistent concept artifacts, while the image-to-Three.js source and the newly imported sprite/media skills provide candidate upstream workflows.

### Current implementation boundary

- `src/game/renderer.ts:253-260` intentionally builds terrain from procedural height data and vertex colors, with zero texture assets.
- `src/game/renderer.ts:444-455` renders repeated world objects through instancing, but currently disables Three.js frustum culling for those instance groups.
- `package.json` has no GLB/glTF loader, validator, asset manifest, texture pipeline, or asset-specific test command.
- The existing documentation proposes GLB/glTF, LODs, and asset manifests, but there is no committed runtime asset package proving the source-to-export-to-browser loop.

## Gap analysis

The important gap is not “we need more art.” It is the missing evidence bridge between concept/reference and a shippable runtime asset:

`reference or generated input → reviewed source/rights record → normalized asset → GLB runtime derivative → structural preflight → browser import → performance/visual evidence`

Without that bridge, adding generated meshes can create four forms of drift:

1. a concept becomes accidental production truth;
2. a runtime file becomes the only editable source;
3. asset identity is coupled to filenames instead of stable semantic keys;
4. visual quality improves while browser budgets, loading failure, provenance, or replacement remain unproven.

## Candidate next slices

| Slice                         | What it proves                                                                                           | Scope                                                                                   | Risk                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------------------------------------- |
| A. Manifest + preflight only  | Asset identity, hashes, rights status, GLB safety checks, and stable replacement path                    | Docs, JSON schema/manifest, bounded validator tests; no renderer change                 | Low; immediate leverage                         |
| B. One approved static prop   | Source-to-GLB-to-browser import with pivot, scale, material, and load failure behavior                   | One reviewed Kenney or authored prop, runtime loader, browser acceptance                | Medium; introduces a real asset dependency      |
| C. Tractor production handoff | Generated/reference-informed vehicle delivery contract, modular sockets, LODs, and perception validation | Requires an approved turnaround/model, Blender source, GLB, fixture import, screenshots | High; product/art decision still open           |
| D. Runtime optimization lane  | Culling, LOD, compression, draw/memory budgets against actual assets                                     | Depends on B or C and constrained-device evidence                                       | Medium/high; should follow a real asset fixture |

## Recommendation for discussion

Choose **A first, then B if the manifest contract is accepted**.

The first implementation should not replace the current procedural renderer or import a broad asset pack. It should create one canonical, versioned asset manifest and a bounded preflight/report path that can reject missing files, unstable IDs, incomplete provenance, unsafe relative paths, unsupported formats, and missing replacement status. Then one small static prop can prove the browser delivery loop without turning a single generated model into an architectural commitment.

Proposed baseline contract for Slice A:

- consumer: browser/WebGL and Three.js;
- runtime format: `.glb` first; source DCC/reference stays outside the runtime derivative;
- stable identity: semantic asset key, independent of filename;
- required metadata: source type, source URL/provider, license/terms, input/reference links, SHA-256, dimensions/scale, intended use, approval status, modifications, and replacement path;
- runtime checks: file exists, path stays inside the approved asset root, GLB/JSON structure is readable, referenced buffers/images resolve, and the asset declares no unsupported required extension;
- review status: `concept`, `proposed`, `approved`, `runtime-tested`, or `blocked`;
- explicit non-goals: no provider-specific generation integration, no bulk Kenney import, no tractor replacement, no renderer-wide GLB migration, and no performance claim until a real browser fixture exists.

## Decision questions before implementation

1. Do we accept the manifest/preflight slice as the next asset-pipeline milestone?
2. For the first browser fixture, should we use a small CC0 Kenney prop, a hand-authored primitive-derived prop, or wait for an approved tractor model?
3. Should the first runtime asset be visible in the game, or should it initially be a non-invasive validation fixture and preview route?
4. What is the first constrained target profile: narrow desktop browser, a specific mobile browser/device, or both?
5. Should generated-image inputs remain documentation/reference-only until the tractor turnaround and rights/terms review are complete?

## Slice A implementation result

The documented default was implemented without importing a runtime asset or changing the renderer:

- `assets/asset-manifest.json` is the canonical registry, currently containing one generated concept record and one proposed Kenney fixture record.
- `assets/asset-manifest.schema.json` records the versioned data contract.
- `tools/asset-preflight.mjs` performs dependency-free manifest and bounded GLB v2 structural checks, including repository-relative path safety, source existence, runtime-root containment, JSON/BIN consistency, and safe external dependencies.
- `tools/asset-preflight.test.mjs` covers the clean manifest, minimal GLB acceptance, truncation, unsafe dependency, manifest traversal, and runtime-root escape cases.
- `npm run assets:preflight` and `npm run test:assets` expose the checks to operators and CI.

This establishes the source/metadata gate. It does not claim that a GLB is visually correct, that materials survive a browser import, or that any asset is approved for distribution.

## `img2threejs` intake result — 2026-07-25

The imported `img2threejs` skill was applied to the existing tractor model sheet before any reconstruction work.

- Technical probe: **pass** — PNG, 1747 × 900, readable, no technical warnings.
- Reference admission: **reject** — `foreground coverage 0.991 > 0.97 (no background to segment against — silhouette not isolable)`.
- Recorded provenance: viewpoint `concept-sheet`, pHash `13541845368895487216`, largest connected component fraction `1.0`.

Decision: this image remains a concept/model-sheet reference and must not be used as admitted ground truth for `img2threejs` pre-spec, detail inventory, staged code generation, or visual scoring. The rejection is not a statement that the concept is bad; it means the image is composed for art direction rather than isolated reconstruction.

Required input before a tractor reconstruction slice:

- an isolated single-view render or crop with readable background separation;
- an approved intended use and rights/terms status;
- preferably a second non-duplicate view or orthographic turnaround;
- enough margin around the silhouette for admission and later multi-angle review.

Until that input exists, the safe implementation boundary is the Slice A manifest/preflight gate or a separately authored, non-tractor fixture. No generated or reconstructed tractor mesh should be added on the current evidence.

### Isolated reference follow-up

The built-in image-generation path produced `docs/exploration/assets/references/tractor_isolated_reconstruction_reference_2026-07-25.png` from the model sheet as a reference-only artifact. Its technical probe passed and its admission gate passed with foreground coverage `0.2924`. This satisfies the first image-intake boundary, but not the full reconstruction contract: the image still provides one viewpoint, so camera/depth inference, multi-angle consistency, and human review remain open.

The artifact is registered in [`ASSET_PROVENANCE_REGISTER.md`](ASSET_PROVENANCE_REGISTER.md) and [`assets/asset-manifest.json`](../../assets/asset-manifest.json). It is not a GLB and is not loaded by the renderer.

Reference-derived PBR extraction also passed at confidence `0.86` against the `0.7` target. The detailed component, ten-feature mapping, material, socket, collider, and staged-review proposal is recorded in [`RECONSTRUCTION_PLAN.md`](assets/tractor-isolated-intake-2026-07-25/RECONSTRUCTION_PLAN.md). The single-image limitation remains explicit.

The authored `ObjectSculptSpec` now passes the upstream strict-quality validator with zero errors. The upstream generator produced a blockout factory under the intake directory, but its pass gate still requires a browser render, Tier 1 diagnostics, side-by-side comparison, and self-correction review before the next pass. The generated factory is therefore preserved as evidence and is not copied into `src/`.

The intake-only browser preview was then implemented and exercised at `http://127.0.0.1:4175/preview/`. It rendered the generated factory with the plain evaluation renderer, deterministic front-three-quarter framing, and neutral look-dev lights; the screenshot and comparison sheet are stored under the intake directory. During review, generator defects were found: authored component dimensions were being applied to nested pivots, root-bounds geometry was visible, and the reference loader forced `needsUpdate` before image data existed. The generator now applies dimensions to each mesh, keeps local transform scale on the pivot, hides root-pivot geometry, and lets `TextureLoader` own its update lifecycle; 43 pipeline tests cover the dimension behavior. The upstream Tier 1 diagnostic now reports stable geometry but still fails with silhouette IoU `0.5112`, aspect-ratio delta `0.7506`, and scale delta `0.1431`, so the blockout remains stopped. Visual inspection agrees: the remaining chassis/body boxes are not yet a tractor silhouette. The browser capture now has zero console warnings/errors. This validates the skill's pass-gate discipline and prevents premature runtime integration.

## Evidence and implementation gate

This review began as Tier 1 static analysis. Slice A now has Tier 2 evidence from its focused tests and project typecheck/build/test suites. No game runtime behavior changed and no asset was imported. The minimum follow-up evidence for Slice B is Tier 3: a clean build/test path plus a browser import in the actual Rigs Unbound surface, with visible failure handling and recorded asset metrics.

## Addendum — authority clarification from reference-vs-shipped-mesh review

The useful correction is that reference image and shipped mesh are not competing
choices. A validated mesh can be the canonical shipped visual artifact for a
named runtime profile. A playable vehicle still needs a linked blueprint/spec for
behavioral and compatibility truth: dimensions, pivots, sockets, collision, LOD,
animation, capabilities, and save/replay identity. The detailed decision,
authority table, promotion gate, and alternatives are recorded in
[`ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md`](ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md).

This changes the language of the current tractor decision: the generated factory
is not being withheld because meshes are disallowed; it is withheld because the
candidate has not yet passed visual and runtime promotion gates. Once those gates
pass, the GLB may become the shipped visual truth while the vehicle blueprint
remains the behavioral source of truth.

## Sources

- Imported skill: [`3d-asset-production`](../../../external-skills/calesthio__generative-media-skills/skills/production/3d-craft/3d-asset-production/SKILL.md)
- Khronos glTF 2.0 specification: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html
- Khronos glTF Validator: https://github.com/KhronosGroup/glTF-Validator
- Existing project provenance register: [`ASSET_PROVENANCE_REGISTER.md`](ASSET_PROVENANCE_REGISTER.md)
- Existing project asset exploration: [`EXPLORATION_MAP.md`](../exploration/EXPLORATION_MAP.md)

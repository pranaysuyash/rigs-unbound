# Kenney Asset Library Audit

- Status: **source library inspected; two CC0 developer fixtures imported**
- Date: 2026-07-25
- Source owner: Project owner
- Source location: private external asset library outside the repository (`Kenney Game Assets All-in-1 3.4.0`)
- Purpose: decide how the locally owned Kenney library can support fair engine probes, the tractor first slice, and later breadth experiments without turning the project into an incoherent asset collage

## Executive finding

The local All-in-1 3.4.0 bundle is immediately useful. It contains a current low-poly tractor with separately named body and wheel nodes, a shovel-equipped tractor variant, an animated zombie, terrain and vegetation, roads and ramps, breakable-looking props, UI prompts, mobile controls, interface/impact/foley audio, and later-world kits for toy cars, cities, trains, watercraft, rockets, space stations, survival, graveyards, and tower defense.

Use it in three roles:

1. **Comparable technical fixture** — the exact same binary GLBs in every engine bakeoff.
2. **First-slice substrate** — selected farm, tractor, obstacle, enemy, input, and sound assets while gameplay is being proven.
3. **Breadth laboratory** — cheap, licensed probes for new scales, vehicles, places, and mechanics.

Do not make the entire bundle a project dependency, reference the ad-hoc directory at runtime, publish the paid bundle, or assume unmodified Kenney art is the final identity. Patchwork Atlas still needs authored vehicle history, repair seams, functional module changes, material treatment, biome palettes, lighting, effects, and sound layering.

## Library snapshot

### Main bundle

- Bundle: `Kenney Game Assets All-in-1 3.4.0`
- Approximate size: 1.2 GB
- Files observed: 84,992
- Major areas: 2D assets, 3D assets, archive packs, audio, icons, UI assets, goodies, and other resources
- Notable formats: 54,429 PNG, 5,063 FBX, 4,990 OBJ, 4,724 GLB, 4,846 SVG, 1,342 OGG, 1,264 DAE, 1,264 STL, and 254 glTF/`.bin` pairs

### Separate local pack

- private external asset pack outside the repository (`kenney_new-platformer-pack-1.1`)
- Approximate size: 6.9 MB
- Files observed: 1,334
- Relevance: later 2D/side-view mechanic exploration; not needed for the first 3D tractor probe

These counts describe the local snapshot, not a canonical online catalog. Archive packs may duplicate or predate current packs.

## Rights and distribution evidence

The bundle-level `Readme.html` states that all content in the package is CC0, may be used in personal and commercial projects, and does not require attribution. It also says not to redistribute the All-in-1 bundle directly; individual packs may be distributed under their included licenses.

Evidence inspected:

| Evidence file                         | SHA-256                                                            | Observation                                                             |
| ------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `Readme.html`                         | `210f4071609323c89ee3759bf946c0e117badd5a66a45c82b8241b3ad4f5fb41` | Bundle-level CC0 statement plus no-direct-bundle-redistribution request |
| `3D assets/Car Kit/License.txt`       | `abbfe5e59c835e2e7578994f019dca5f1b2bb9aa3aa50e7efd42717535356bee` | CC0; commercial use and modification allowed; attribution optional      |
| `3D assets/Nature Kit/License.txt`    | `cb96b75e3560ac78d7a53ce6f083f4cdb5c53faea6141b62d63458dcfe1e4b9d` | CC0                                                                     |
| `3D assets/Racing Kit/License.txt`    | `905627df4313a9eb7fa9337129e572979ef51cc3857c8d2942e57ae84736096c` | CC0                                                                     |
| `3D assets/Graveyard Kit/License.txt` | `a48e274258386c6bcb5302f17eaab40304cd805cc68be2754e2452179418c70e` | CC0                                                                     |

Additional samples inspected from Toy Car, Space, Impact Sounds, Input Prompts, and New Platformer also state CC0. Nevertheless, every pack actually imported must carry its own inspected license evidence in the provenance register. The bundle-level statement is strong source evidence, but it is not permission to skip per-import traceability.

Project policy:

- never publish or mirror the All-in-1 directory;
- copy only deliberately selected source assets into a project-owned source area when implementation begins;
- preserve the relevant `License.txt`, pack name/version, source path, source hash, imported/derived hash, modifications, reviewer, and replacement path;
- do not make a player download unused packs;
- attribution is optional under the inspected licenses, but a voluntary Kenney credit is recommended as project practice;
- re-review terms if assets are redistributed outside the compiled game or an individual pack is offered separately.

This is a local evidence review, not legal advice.

## Visual and structural fit

The Car, Nature, Toy Car, and Space preview sheets were visually inspected. They share:

- strong silhouettes at modest screen size;
- restrained, mostly flat low-poly materials;
- modular props and environment pieces;
- limited texture burden;
- color separation suitable for readable interaction states;
- enough tonal compatibility to move from farm to city to toy scale to space.

That is a strong prototype fit and a plausible base for a stylized public game. It is not yet the full Patchwork Atlas language:

- vehicles do not inherently show persistent repair history;
- modules are clean kit parts rather than visibly grafted, traded, worn, or story-bearing;
- packs used raw can make the game look like a Kenney showcase;
- characters and props from different pack generations may differ in scale, pivots, topology, naming, palette, and material setup;
- a coherent biome and lighting pass is still required.

The art test is therefore not “does Kenney look good?” It is “can selected Kenney geometry survive an authored identity pass while keeping its readability and browser efficiency?”

## Relevance map

### Tier A — immediate engine and first-slice fixtures

| Pack                              | What it supplies                                              | Why now                                                                                      |
| --------------------------------- | ------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Car Kit 3.0                       | tractor, shovel tractor, named wheels/body, box, cone, debris | One shared vehicle binary, wheel-node import test, breakable prop, damage/salvage vocabulary |
| Racing Kit                        | compact ramp and route props                                  | Collision, suspension, jump, and later time-trial probe                                      |
| Nature Kit                        | ground/path tiles, trees, rocks, grass, fences                | Small authored farm boundary and occlusion/readability test                                  |
| Graveyard Kit                     | animated zombie plus walls, graves, crops/hay, damaged props  | Chasing-enemy animation and night-state visual test                                          |
| Input Prompts / Mobile Controls   | keyboard, gamepad, and touch prompt families                  | Input-device UI probe; select only required variants                                         |
| Impact / Foley / Interface Sounds | collision, interaction, and UI source material                | Early feel without pretending final vehicle audio exists                                     |

### Tier B — first-playable support after the core probe works

- Survival Kit: tools, fences, barrels, tents, fortified variants.
- Tower Defense Kit: defenses, projectiles, bases, walls, and readable tactical props.
- City Kit - Roads: modular roads, ramps/slants, crossings, barriers, and lights.
- City Kit - Industrial/Suburban/Commercial: later connected-region and delivery experiments.
- Graveyard environment pieces: night identity beyond a generic black farm.
- 2D Isometric Miniature Farm and Isometric Tower Defense: comparison material for intentionally 2D/2.5D presentations, not parallel production runtimes.

### Tier C — breadth laboratories

- Toy Car Kit and Racing Kit for toy-scale racing and obstacle courses.
- Space Kit, Space Station Kit, and Modular Space Kit for launch/orbital/space-region probes.
- Train Kit and Watercraft Pack for locomotion and logistics experiments.
- Topdown Tanks/Shooter and Pixel Vehicle packs for distinct 2D mechanic studies.
- UI, icon, and audio packs only after a named interaction needs them; avoid bulk ingestion.

### Archive-only by default

The archived Mini Car Kit also contains tractor assets, including `carTractor.gltf` and `carTractorShovel.gltf`. The current Car Kit supersedes it for the first probe and provides current GLBs with useful named nodes. Use archive content only for compatibility research or when a current pack lacks a required behavior.

## Exact first engine-probe candidate set

These are source candidates, not project imports. All paths are relative to the bundle root.

| Stable proposed key           | Source file                                                      |   Bytes | SHA-256                                                            | Probe role                                                    |
| ----------------------------- | ---------------------------------------------------------------- | ------: | ------------------------------------------------------------------ | ------------------------------------------------------------- |
| `vehicle.tractor.base`        | `3D assets/Car Kit/Models/GLB format/tractor.glb`                | 175,960 | `08cbe533f5cb2171d6e7e0ae99ae32b65f10fed144ab102950079507f4a66a16` | Identical controllable vehicle across engines                 |
| `vehicle.tractor.shovel`      | `3D assets/Car Kit/Models/GLB format/tractor-shovel.glb`         | 222,584 | `ea456992271d9cc3002289e04788be4a306b94c0f9d1fc337b93b3e96fdaf71c` | Attachment/tool and node-hierarchy comparison                 |
| `vehicle.tractor.wheel.front` | `3D assets/Car Kit/Models/GLB format/wheel-tractor-front.glb`    |  29,140 | `e6487de0cd5b880565ef9b4eea25bf8f202589f94f86e8eb11e0d33fe51bfe96` | Wheel/pivot/collider fixture                                  |
| `vehicle.tractor.wheel.rear`  | `3D assets/Car Kit/Models/GLB format/wheel-tractor-back.glb`     |  36,628 | `05e57e871f353ef4deea3aa56c26ef3a4d58217f8d61ea0895e23797724ae5bf` | Wheel/pivot/collider fixture                                  |
| `prop.crate.breakable`        | `3D assets/Car Kit/Models/GLB format/box.glb`                    |  14,108 | `38b74901586f61fb9d4bb54c55bcdafeb498ddda547063503c60d3e8d357dc87` | Breakable obstacle placeholder                                |
| `course.ramp.basic`           | `3D assets/Racing Kit/Models/GLTF format/ramp.glb`               |   6,996 | `a6f2c0e4f01fded7f9020cba4a0eb304d3724a9086071b52d5ae7e2b63d47253` | Suspension/collision/jump test                                |
| `world.field.tile`            | `3D assets/Nature Kit/Models/GLTF format/ground_pathTile.glb`    |   6,624 | `b169d96d4143d8dd00ef074b8beb5395d8743b73bbafb88506512c1270075b42` | Ground-scale and repeated-tile fixture                        |
| `world.field.tree`            | `3D assets/Nature Kit/Models/GLTF format/tree_default.glb`       |   9,428 | `562d29638c902de3c7bee465d3a53bb77117efbc392ae04ed894faf6b5dc691d` | Occlusion, shadow, and instancing fixture                     |
| `world.field.rock`            | `3D assets/Nature Kit/Models/GLTF format/rock_smallF.glb`        |   5,700 | `51099549e8dd6a68db2afe2e5c514a8601ee59e11766d5975c540314f9b7deb8` | Static collider fixture                                       |
| `world.field.fence`           | `3D assets/Nature Kit/Models/GLTF format/fence_simple.glb`       |   5,712 | `ecaf6c29532aa9fd305a8ef71df769d60748bd797f2eb1c63bdefc4edb8062a7` | Boundary/collision/readability fixture                        |
| `enemy.night.zombie`          | `3D assets/Graveyard Kit/Models/GLB format/character-zombie.glb` | 245,500 | `1a49bedce8647de542bfaaa796a3b533ab2a0d2567122bd08b16b2741fa62693` | Chase, animation, threat silhouette, and top-down readability |

Structural inspection found:

- `tractor.glb`: five nodes/meshes—four named wheels plus `body`; one material; no animations.
- `tractor-shovel.glb`: named body, shovel, and four wheels; the shovel is a child of the body; one material; no animations.
- `character-zombie.glb`: articulated named limbs/head and 32 animation clips including idle, walk, sprint, die, melee attacks, and interactions.
- `ramp.glb`: compact static mesh, two materials, no animations.

The separate wheel GLBs are useful diagnostic fixtures, but the main tractor GLB already contains wheel nodes. The first importer should compare whether each candidate engine preserves those names/transforms reliably before choosing between one hierarchical vehicle file and composed source parts.

## Import and validation contract

When implementation starts:

1. Create one project-owned, canonical source/import area and one generated runtime area; do not edit files in `adhoc_resources`.
2. Import only the approved manifest subset and its pack licenses.
3. Address assets through semantic keys such as `vehicle.tractor.base`, never source filenames or scene-node IDs in durable gameplay state.
4. Keep the exact source GLB hashes equal across engine candidates. Candidate-specific conversions must be separately hashed and justified.
5. Validate axis, units, scale, origin, node names, wheel pivots, material color space, texture embedding, animations, clip names, normals, bounds, and browser decoding.
6. Build authored physics proxies; do not silently use render meshes as expensive or unstable collision truth.
7. Record triangles, materials, textures, draw calls, decoded memory, import time, first-frame time, and engine-specific mutations.
8. Test missing/corrupt asset behavior and surface a visible diagnostic rather than silently substituting a different asset.
9. For production candidates, add LOD/instancing/compression only after measuring the unmodified baseline.
10. Preserve a removal/replacement path so prototype assets cannot become permanent by inertia.

## Decisions and deferred questions

- **Proposed:** use the Kenney tractor, box, ramp, nature props, and zombie as the common engine-bakeoff fixture.
- **Proposed:** use Kenney as a prototype/base-mesh library, then evaluate a project-authored Patchwork Atlas transformation pass.
- **Open:** whether any raw Kenney model is acceptable as final shipped geometry.
- **Open:** whether palette/material changes can create enough identity without mesh edits.
- **Open:** how much customization requires modular source files versus sockets added during import.
- **Deferred:** bulk catalog import, asset browser/editor integration, automated normalization, texture compression policy, LOD generation, and public credits page until an engine/source pipeline is accepted.

## Evidence status

- Tier 1: local bundle, pack structure, previews, license text, and GLB metadata inspected.
- Tier 2: selected-file existence, byte size, SHA-256, and internal node/animation metadata checked with repeatable local commands.
- Tier 3–5: none. No asset has been imported into an engine, rendered in the project, profiled, animated in runtime, or observed by players.

## Anything else?

The library changes the economics of exploration: a new vehicle or biome can now be tested before bespoke art exists. It must not change the product test. A Kenney pack is evidence that a visual fixture exists, not evidence that a mechanic is fun, an art direction is owned, or a browser budget is met.

## Addendum (2026-07-26) - first bridge candidate chosen and copied into repo runtime

- Re-checked the candidate set against the current repo state and live
  browser posture.
- The first bridge proof is now narrowed to the Car Kit breakable crate:
  - source file: `3D assets/Car Kit/Models/GLB format/box.glb`,
  - semantic key: `kenney-car-kit-breakable-crate-fixture`,
  - runtime copy: `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`.
- Why this won:
  - it is a static prop, so it isolates the import bridge from vehicle
    semantics,
  - it is still representative enough to exercise the manifest/provenance and
    browser-visibility path,
  - it gives a clean baseline before the tractor mesh is attempted.
- The source copy has been imported into the repo-owned runtime area and is now
  the first bridge asset candidate in the manifest.
- Browser visibility for that new bridge is still pending live observation.
- Evidence depth: Tier 1 static code/doc inspection for the new runtime copy;
  Tier 4 runtime/manual observation for the pre-change browser surface.

## Addendum (2026-07-26) - tractor preview added after the crate bridge proved live

- Re-checked the candidate set after the crate bridge and live browser proof.
- The second runtime bridge candidate is now explicit too:
  - source file: `3D assets/Car Kit/Models/GLB format/tractor.glb`,
  - semantic key: `kenney-car-kit-tractor-preview`,
  - runtime copy: `assets/runtime/kenney-car-kit-tractor-preview.glb`.
- Why it was the right second step:
  - it exercises a larger, multi-node vehicle-shaped GLB,
  - it proves the manifest/runtime/browser bridge scales beyond a small prop,
  - it still stays inside the same audited Car Kit source library and texture
    dependency family.
- The live browser confirms this preview loaded cleanly with five nodes and no
  bridge errors.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - approval and distribution boundary

The purchased All-in-One bundle remains private. The crate and tractor copies
are selective Car Kit derivatives with recorded pack-level CC0 evidence,
matching hashes, and runtime-tested developer-surface behavior. They remain
`publicRuntimeApproved: false`: this is a production-art and production-package
gate, not an unresolved-license claim. The production packager must exclude
their bytes until an entry-specific approval record closes art fit, resource
budget, LOD/profile intent, and player-surface browser acceptance.

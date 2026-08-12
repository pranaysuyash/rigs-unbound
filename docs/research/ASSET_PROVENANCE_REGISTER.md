# Asset Provenance Register

This register begins during concept exploration so provenance does not become a retroactive cleanup task.

## Backlinks

- [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)

## `tractor_patchwork_atlas_user_preference_2026-07-25.png`

- Project path: `docs/exploration/assets/references/tractor_patchwork_atlas_user_preference_2026-07-25.png`
- SHA-256: `adf64c7028e2a55670cbed1255b6745e682f00b0bb5eef5fc2938bfa518674d4`
- Dimensions: 1774 × 887 RGB PNG
- Source in this session: project-owner-provided image attachment
- Intended use: art-direction, vehicle-character, scene-composition, camera, material, and mood reference
- Production status: **reference only; not approved as a shipped game asset**
- Preference evidence: project owner explicitly stated that they like the design and character/scene view and want this kind explored further
- Preservation action: copied from the transient attachment location into the project without modifying the source
- Rights/terms status: source/provider chain beyond the current attachment should be confirmed before public reuse outside project documentation
- Derived explorations: see [Visual Direction Preference and Variants](../exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)

## `tractor_character_model_sheet_2026-07-25.png`

- Project path: `docs/exploration/assets/design_explorations/tractor_character_model_sheet_2026-07-25.png`
- SHA-256: `db614f08fa6f2583e5c01cb7aec4f45e8ad13cad7d0dd5ceedae0782670ddfb4`
- Dimensions: 1747 × 900 RGB PNG
- Date generated: 2026-07-25
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `tractor_patchwork_atlas_user_preference_2026-07-25.png`; style/material/mood/readability reference, not edit target
- Intended use: persistent tractor identity, repair grammar, silhouette, hardpoint, and attachment exploration
- Production status: **concept only**
- Human review: inspected at original resolution; strong identity and functional silhouette, but true orthographic turnarounds and exact patch/socket maps remain required
- Prompt and critique: [Visual Direction Preference and Variants](../exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)

## `tractor_isolated_reconstruction_reference_2026-07-25.png`

- Project path: `docs/exploration/assets/references/tractor_isolated_reconstruction_reference_2026-07-25.png`
- SHA-256: `eb42e00ef63038773db5c45e4d496e3a75a4ac634e0a03980cfe4cfc8b228900`
- Dimensions: 1747 × 900 RGB PNG
- Date generated: 2026-07-25
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `tractor_character_model_sheet_2026-07-25.png`; used as identity, repair-language, proportion, and material reference, not as an edit target
- Intended use: admitted single-view input for future `img2threejs` procedural reconstruction analysis
- Production status: **concept/reference only; not an approved runtime asset or shipped mesh**
- Intake evidence: `probe_image.py` passed; `check_reference_admission.py --viewpoint isolated-three-quarter` passed with foreground coverage `0.2924`, largest connected component fraction `1.0`, and pHash `13026260861505449107`
- Human review: generated output inspected; it has one complete three-quarter tractor with full wheel/silhouette margin and no collage, but it is still one view and contains generated geometry/material uncertainty
- Rights/terms status: provider/tool terms and intended public distribution context must be reviewed before production or marketing use
- Replacement path: replace with an approved authored or multi-view reference package before shipping a reconstructed vehicle

### Generation prompt intent

One complete fictional patchwork tractor in a centered three-quarter front view, fully visible with generous silhouette margin, on a uniform light neutral background without a floor, shadow, collage, labels, logos, or extra objects. Preserve the repaired panel language, compact utility proportions, wheels, cab, exhaust, amber beacon, and rust/cream/green palette from the model-sheet reference. The image was requested as an intake reference, not as a final game asset.

## `tractor_gameplay_camera_board_2026-07-25.png`

- Project path: `docs/exploration/assets/design_explorations/tractor_gameplay_camera_board_2026-07-25.png`
- SHA-256: `40f01c6d8c989b02b1c59eaeddaf35be63fd4a0e58efc623a64e4a45001f3871`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-25
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: preserved preference image as a camera/mood/material reference
- Intended use: compare close chase, work, tactical, workshop, set-piece, and vista camera roles
- Production status: **concept only**
- Human review: inspected at original resolution; the close/medium views preserve character, while depth-of-field, wide-view scale, enemy language, occlusion, mobile composition, and transition feel remain unproven
- Prompt and critique: [Visual Direction Preference and Variants](../exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)

## `tractor_art_direction_triptych_2026-07-25.png`

- Project path: `docs/exploration/assets/design_explorations/tractor_art_direction_triptych_2026-07-25.png`
- SHA-256: `9c33b0fda7d921a5d7ea00328ad417f9f88e0ba3f09e9d5c1758d6ba63842db2`
- Dimensions: 1774 × 887 RGB PNG
- Date generated: 2026-07-25
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: preserved preference image as a visual-language reference
- Intended use: fair comparison of Patchwork Atlas, Signal Noir, and Salvage Opera using an invariant tractor, scene, and camera
- Production status: **concept only**
- Human review: inspected at original resolution; supports Patchwork Atlas as baseline, Signal Noir as state layer, and Salvage Opera as event/region crescendo
- Prompt and critique: [Visual Direction Preference and Variants](../exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)

## Private source library: Kenney Game Assets All-in-1 3.4.0

- Source location: private external asset library outside the repository (`Kenney Game Assets All-in-1 3.4.0`)
- Status: **inspected source library; not copied into the project; not a runtime dependency**
- Approximate snapshot: 1.2 GB and 84,992 files
- Rights evidence: bundle readme and sampled per-pack licenses state CC0, including personal and commercial use with optional attribution
- Distribution constraint: the bundle readme asks that the All-in-1 bundle not be redistributed directly
- Bundle readme SHA-256: `210f4071609323c89ee3759bf946c0e117badd5a66a45c82b8241b3ad4f5fb41`
- Human review: Car, Nature, Toy Car, and Space preview sheets inspected on 2026-07-25
- Intended use: selective engine fixtures, prototype substrate, and later vehicle/world breadth experiments
- Production status: no individual asset approved for production use
- Import gate: record exact pack/version, included license, source and derived hashes, modifications, intended use, reviewer, browser validation, and replacement path
- Full inventory and first candidate manifest: [Kenney asset library audit](KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)

## `kenney-car-kit-breakable-crate-fixture.glb`

- Project path: `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb`
- Source path: `/Users/pranay/Projects/adhoc_resources/game_assets/Kenney Game Assets All-in-1 3.4.0/3D assets/Car Kit/Models/GLB format/box.glb`
- SHA-256: `38b74901586f61fb9d4bb54c55bcdafeb498ddda547063503c60d3e8d357dc87`
- Source type: copied open-asset runtime derivative from the inspected Kenney bundle
- Source owner: private external asset library outside the repository (`Kenney Game Assets All-in-1 3.4.0`)
- Intended use: first runtime bridge prop, manifest admission proof, and browser visibility check
- Production status: copied into repo-owned runtime directory; browser/runtime verification still pending
- Rights/terms status: use remains governed by the inspected bundle and pack-level CC0 evidence already recorded above
- Replacement path: replace with a project-authored prop or a more identity-bearing variant only after the bridge proof is observed live
- Linked manifest entry: [`assets/asset-manifest.json`](/Users/pranay/Projects/Game_dev/rigs-unbound/assets/asset-manifest.json)
- Live browser proof: the bridge is currently loading cleanly in the acceptance
  surface with zero console logs after the texture dependency was copied into
  `assets/runtime/Textures/colormap.png`.

## `kenney-car-kit-tractor-preview.glb`

- Project path: `assets/runtime/kenney-car-kit-tractor-preview.glb`
- Source path: `/Users/pranay/Projects/adhoc_resources/game_assets/Kenney Game Assets All-in-1 3.4.0/3D assets/Car Kit/Models/GLB format/tractor.glb`
- SHA-256: `08cbe533f5cb2171d6e7e0ae99ae32b65f10fed144ab102950079507f4a66a16`
- Source type: copied open-asset runtime derivative from the inspected Kenney bundle
- Source owner: private external asset library outside the repository (`Kenney Game Assets All-in-1 3.4.0`)
- Intended use: second runtime bridge asset, vehicle-shaped preview, and proof that the bridge handles a larger multi-node GLB
- Production status: copied into repo-owned runtime directory; browser/runtime verification complete
- Rights/terms status: use remains governed by the inspected bundle and pack-level CC0 evidence already recorded above
- Replacement path: replace with a project-authored tractor preview or production vehicle mesh after the bridge proof is no longer needed
- Linked manifest entry: [`assets/asset-manifest.json`](/Users/pranay/Projects/Game_dev/rigs-unbound/assets/asset-manifest.json)
- Live browser proof: the bridge currently loads cleanly in the acceptance surface with `loadedNodeCount: 5` and zero bridge errors

## `patchwork_atlas_triptych_2026-07-25.png`

- Project path: `docs/exploration/assets/patchwork_atlas_triptych_2026-07-25.png`
- SHA-256: `bdc8165c12b3beccd6a586a4246d2b959b2fc8ad5cae05b8a446621b8079224a`
- Date generated: 2026-07-25
- Tool: OpenAI image generation available in the Codex workspace
- Mode: new generation; no input/reference image
- Intended use: internal/public-facing concept exploration in project documentation
- Production status: **concept only; not approved as a shipped game asset**
- Human review: inspected at original resolution on 2026-07-25
- Observed strengths: coherent triptych, strong farm/tractor silhouette, warm-to-night transition, readable tactical camera, larger-world aspiration
- Observed gaps: generic spider-like enemies, conventional city/rocket vista, small continuity changes across panels, no final module model sheet
- Rights/terms status: provider/tool terms and the intended public distribution context must be reviewed before any production or marketing use
- Replacement path: recreate through a reviewed project art pipeline after the vehicle model sheet, enemy ecology, asset license policy, and final visual direction are accepted

### Generation prompt

> Use case: stylized-concept. Asset type: exploratory game art-direction concept sheet for a browser-based vehicle adventure. Create one coherent wide triptych showing the same original fictional patchwork tractor vehicle as a lovable playable character across three connected moments: warm tactile diorama farm at late afternoon, tense moonlit top-down defense through crop shadows, and a surprising distant glimpse of the larger universe with toy-scale roads, a city, and an original small rocket implied on the horizon. The tractor's installed wide plow and repaired panels must remain visibly identical across all three panels so it feels like one persistent character, not three vehicles. Authored stylized 3D game concept art; low-poly but materially rich; hand-built diorama; visible repair seams and stickers; grounded painted metal, wood, soil, crops; restrained cinematic lighting. Three equal vertical scenes connected by terrain and light; panel 1 chase/isometric, panel 2 elevated tactical top-down, panel 3 expansive adventure vista; strong readable silhouettes at gameplay distance. Wonder and mechanical warmth shifting into readable night danger and then optimistic cosmic possibility. Ochre soil, sage crops, faded red and cream tractor, cyan moonlight used sparingly, deep navy shadows, warm amber work lights. Original fictional vehicle design, no logos, no brand marks, no text, no UI, no humans, no watermark; interaction and threat silhouettes must be readable; art serves gameplay; same tractor and attachments in every panel. Avoid photorealism, generic neon sci-fi, purple gradient, excessive bloom, clutter, tiny detail noise, grimdark gore, cute mobile-game gloss, and copying any named game or artist.

## `vehicle-reference-atlas` lineup sheets

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/`
- Production status: **reference only; not approved as shipped runtime art**
- Intended use: broad vehicle and rig reference bank for later isolated `img2threejs` reconstruction inputs and production model planning
- Rights/terms status: generated in the project workspace; still review before any public distribution or reuse outside project documentation

### `farm-field-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/farm-field-lineup.png`
- SHA-256: `dcc2ff46349f602c5816194072c6916a1edbc724ce93daaa62afb7f70304d7fb`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six farm and field rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains restored tractor, workhorse tractor, seed runner, harvest tug, orchard crawler, and marsh skimmer

### `utility-service-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/utility-service-lineup.png`
- SHA-256: `ce66171d2c7fa16bfef164b8db9c31fcc913b91b3884a9a7ee7c7b876901b74e`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six utility and service rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains mechanic van, tow truck, crane rig, delivery sprinter, garage carrier, and road-winch rig

### `toy-scale-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/toy-scale-lineup.png`
- SHA-256: `6b414f5d57033c24274c92a8a64cd7b0f057b67bb87df5a02ee8ff1d6b1801a9`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six toy-scale and small-world rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains desk buggy, mini crawler, courier skiff, pocket forklift, micro rescue rover, and bookshelf hauler

### `rescue-response-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/rescue-response-lineup.png`
- SHA-256: `6cd97e3d192554657d51fdca7cfeaf46756c48117a5f82bc7c801f9a001bed96`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six rescue and response rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains rescue bus, field ambulance, light-guard rig, riot-scrub rig, flood response rig, and recovery shuttle

### `extreme-aspiration-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/extreme-aspiration-lineup.png`
- SHA-256: `d2939551a1f3b27ebb83359b7e0bdcf5171636eeb19c12dbcfd01f72e64302ef`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six extreme and aspiration rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains snow crawler, dune hauler, launch tender, sky barge, orbital tug, and vertical-lift rig

### `tractor-evolution-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/tractor-evolution-lineup.png`
- SHA-256: `23b0a4c41c204ea58a67fcb5f2bf68e58044421f5012dd94e4ad0ab447f9dd23`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six progressive tractor states for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains found, stabilized, working, specialized, hybridized, and storied tractor states

### `construction-salvage-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/construction-salvage-lineup.png`
- SHA-256: `602ec78d0ba637ec714295f795d7e28041f44b12464d3658f87dab704e0c442e`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six construction and salvage rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains compact excavator, heavy salvage loader, bridge-builder truck, site hauler, drilling carrier, and demolition crane

### `aquatic-amphibious-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/aquatic-amphibious-lineup.png`
- SHA-256: `b4810b31ce35489c1275c9d6e300c3d42bcd51ada394266d04b580fabe2e4351`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six aquatic and amphibious rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains marsh skimmer, rescue hoverboat, river tug, amphibious hauler, canal maintenance rig, and deep-water salvage skiff

### `aerial-orbital-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/aerial-orbital-lineup.png`
- SHA-256: `8b17905e7eb319266405e48b5164eab51b30d9ce940b9b8ecfa8c2688d68810e`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six aerial and orbital support rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains sky barge, launch tender, orbital tug, vertical-lift rig, maintenance drone carrier, and reentry cradle transport

### `urban-civic-lineup.png`

- Project path: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/urban-civic-lineup.png`
- SHA-256: `55bc059c474afd6e036ea2c17c7dda97645e75ee99dde567dd5c188984a9e101`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Intended use: six urban and civic support rigs for later cropping, comparison, and reconstruction planning
- Production status: reference only
- Notes: lineup sheet contains city bus, street sweeper, utility tram support rig, garbage compactor truck, postal route van, and parking enforcement rig

## `tractor-mode-escalation-board-2026-07-26.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-26/tractor-mode-escalation-board-2026-07-26.png`
- SHA-256: `285372b34af03df487bb4ea0be9e03261948d06cfe48fd0698df3ec0c118d23f`
- Dimensions: 1254 × 1254 RGB PNG
- Date generated: 2026-07-26
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/tractor-evolution-lineup.png`; used as identity anchor, not edit target
- Intended use: first cross-mode board showing the same tractor across farming day, night utility, zombie-defense mid-tier, and deep-dark escalation
- Production status: reference only
- Human review: preserved same-machine identity across all four panels while escalating lighting, defenses, and threat pressure
- Rights/terms status: generated in the project workspace; still review before any public reuse outside project documentation

## `farming-vs-racing-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/farming-vs-racing-board-2026-07-27.png`
- SHA-256: `13f746618c4c72c3ed5757c3c44550a248608784c7c84916e6b0dfa7272c948e`
- Dimensions: 1774 × 887 RGB PNG
- Date generated: 2026-07-27
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/tractor-evolution-lineup.png`; used as identity anchor, not edit target
- Intended use: paired comparison board showing same-machine identity across farming and racing contracts
- Production status: reference only
- Human review: kept the cab, wheel family, and repair history stable while changing camera, dust, route, and tuning
- Rights/terms status: generated in the project workspace; still review before any public reuse outside project documentation

## `survival-vs-construction-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/survival-vs-construction-board-2026-07-27.png`
- SHA-256: `0763c9658b8b9857fa023e8520be0b0839db7b7367fd85eea011774e74430d20`
- Dimensions: 1774 × 887 RGB PNG
- Date generated: 2026-07-27
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/tractor-evolution-lineup.png`; used as identity anchor, not edit target
- Intended use: paired comparison board showing the same tractor as shelter and site tool
- Production status: reference only
- Human review: kept the machine readable while adding armor, cargo, booms, clamps, and work lights
- Rights/terms status: generated in the project workspace; still review before any public reuse outside project documentation

## `urban-vs-absurd-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/urban-vs-absurd-board-2026-07-27.png`
- SHA-256: `adc38b8d69a0335ad5c92b2bedcaaab53af592273aa52b84a03323c12acbd539`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-27
- Tool: built-in OpenAI image generation in the Codex workspace
- Input/reference: `docs/exploration/assets/vehicle-reference-atlas-2026-07-26/tractor-evolution-lineup.png`; used as identity anchor, not edit target
- Intended use: paired comparison board showing civic oddity versus mythic absurdity while preserving recognizability
- Production status: reference only
- Human review: preserved silhouette and repair grammar while letting the world contract become strange
- Rights/terms status: generated in the project workspace; still review before any public reuse outside project documentation

## `same-vehicle-comparison-boards-2026-07-27` reference set

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/`
- Status: **project-owned exploration reference set; not runtime assets**
- Date generated: 2026-07-27
- Tool: built in the project workspace as comparison-board reference art
- Intended use: paired identity-comparison evidence for same tractor across
  farming, racing, survival, construction, urban, and absurd contracts
- Production status: reference only
- Linked docs:
  - [Same Vehicle Comparison Boards](../exploration/SAME_VEHICLE_COMPARISON_BOARDS_2026-07-27.md)
  - [Same Vehicle, Many Games](../exploration/SAME_VEHICLE_MULTI_MODE_ATLAS_2026-07-26.md)
  - [Same Vehicle Mode Matrix](../exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md)
  - [Same Vehicle Prompt Sheets](../exploration/SAME_VEHICLE_PROMPT_SHEETS_2026-07-26.md)
  - [Same Vehicle Mode Atlas README](../exploration/assets/same-vehicle-mode-atlas-2026-07-27/README.md)

### `farming-vs-racing-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/farming-vs-racing-board-2026-07-27.png`
- SHA-256: `13f746618c4c72c3ed5757c3c44550a248608784c7c84916e6b0dfa7272c948e`
- Dimensions: 1774 × 887 RGB PNG
- Date generated: 2026-07-27
- Production status: reference only

### `survival-vs-construction-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/survival-vs-construction-board-2026-07-27.png`
- SHA-256: `0763c9658b8b9857fa023e8520be0b0839db7b7367fd85eea011774e74430d20`
- Dimensions: 1774 × 887 RGB PNG
- Date generated: 2026-07-27
- Production status: reference only

### `urban-vs-absurd-board-2026-07-27.png`

- Project path: `docs/exploration/assets/same-vehicle-mode-atlas-2026-07-27/urban-vs-absurd-board-2026-07-27.png`
- SHA-256: `adc38b8d69a0335ad5c92b2bedcaaab53af592273aa52b84a03323c12acbd539`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-27
- Production status: reference only

## Project-Local In-Tree Reference Asset Registration (2026-07-27)

All vehicle catalog documentation, reference image assets, and downstream procedural 3D reconstructed Three.js meshes are stored within the project tree (`docs/` and `assets/`).

### Project-Local Asset Locations:

- **Master Vehicle Catalog:** [`docs/exploration/MASTER_VEHICLE_CATALOG.md`](file:///Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/MASTER_VEHICLE_CATALOG.md) (144 Vehicles / 432 Upgrade Tiers)
- **Concept Reference Images:** [`docs/exploration/assets/vehicle_references/`](file:///Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/assets/vehicle_references/)
  - `master_rig_catalog_lineup_1785090848982.jpg` (Lineup Sheet)
  - `gyro_sphere_monowheel_1785090927007.jpg` (Gyro-Sphere Monowheel Rover)
  - `bathtub_speedster_hotrod_1785090990228.jpg` (Bathtub-Speedster Hot Rod)
  - `polygon_glitcher_wireframe_1785091001537.jpg` (Polygon-Glitcher 404 Wireframe)
  - `pizza_cutter_speedster_1785091576222.jpg` (Pizza-Cutter Speedster)
  - `golem_titan_chariot_1785091591503.jpg` (Golem-Titan Chariot)
  - `chrono_locomotive_1885_1785091650714.jpg` (Chrono-Locomotive 1885)
  - `carousel_horse_striker_1785091666649.jpg` (Carousel-Horse Striker)
  - `pipe_organ_fortress_1785091761042.jpg` (Pipe-Organ Fortress)
  - `monster_truck_crusher_1785091778582.jpg` (Monster-Truck Crusher)
- **Downstream Three.js Reconstructed Meshes:** [`assets/runtime/threejs_rigs/`](file:///Users/pranay/Projects/Game_dev/rigs-unbound/assets/runtime/threejs_rigs/)

---

## Required fields for future assets

- project path and stable ID;
- source URL/creator or generation tool/provider;
- acquisition/generation date;
- exact license/version or applicable terms snapshot;
- commercial, modification, redistribution, and attribution conditions;
- source/imported file hashes;
- modifications and derived assets;
- input/reference provenance for generated material;
- intended use and approval status;
- reviewer;
- removal/replacement path.

## Anything else?

A concept image can influence architecture and expectations even when it never ships. Recording it now preserves that influence and prevents “temporary” art from silently becoming production truth.

## Addendum (2026-07-28) - vehicle family reference tranche

The following generated images were copied into the project-owned exploration
tree. They are concept/reference-only and are not approved runtime assets:

### `vehicle-family-atlas-2026-07-28`

- Tool/provider: built-in OpenAI image generation in the Codex workspace
- Generation date: 2026-07-28
- Intended use: family breadth, silhouette comparison, hardpoint discovery,
  mode variation planning, and later candidate selection for isolated
  `img2threejs` intake
- Rights/terms status: generated in the project workspace; public reuse still
  requires review of provider terms and any generated real-world markings
- Runtime status: not imported; no asset manifest or runtime path changed
- Review status: manually inspected at original resolution; all three sheets
  contain separated full-vehicle candidates with readable silhouettes

Files and hashes:

- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/utility-tow-lineup-2026-07-28.png`
  — SHA-256 `a583007d3cb2cd371651b082602b1e677f28c5552ba3e87c4755dd0639684dcf`
- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/rescue-emergency-lineup-2026-07-28.png`
  — SHA-256 `ecc2ef99b174bde00c15ecc76952032e46b6beee474e74581b5c9469dea16c`
- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/extreme-aspiration-lineup-2026-07-28.png`
  — SHA-256 `5719c85ef26196ee8f1d21ad00bd6fd4c54e7e4511ee8eeeb95297c0c3db299d`

### `utility-tow-recovery-candidate-01-2026-07-28.png`

- Project path: `docs/exploration/assets/vehicle-family-atlas-2026-07-28/utility-tow-recovery-candidate-01-2026-07-28.png`
- SHA-256: `d52f39285b12a29acd722ac3d66633d48460ca4a155c8e8e33114f399d60cfe3`
- Dimensions: 1536 × 1024 RGB PNG
- Tool/provider: built-in OpenAI image generation in the Codex workspace
- Provisional stable ID: `utility_tow_recovery_01`
- Intended use: isolated candidate view for later multi-view reference package
  and `img2threejs` intake analysis
- Production status: **concept/reference only; below mesh/runtime admission**
- Human review: full vehicle and wheels are visible with generous neutral
  background; exact scale, rear/side/top views, sockets, underbody, and
  material IDs remain unverified
- Replacement path: replace or supersede with a complete multi-view package
  before any mesh is considered for runtime admission

Replacement path: select named candidates, generate isolated reconstruction
references, validate mesh/topology/material/collision/animation budgets, then
admit only the validated derivative through the canonical runtime manifest.

### Additional vehicle-family tranche artifacts — 2026-07-28

- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/utility-tow-reconstruction-turnaround-2026-07-28.png`
  — SHA-256 `f5d54ce75833df345c54af6f3e1d8859bb561ff7e7978c33fd565ba3eca65b03`
- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/utility-tow-mode-diff-board-2026-07-28.png`
  — SHA-256 `54b53a56da452287fcf8ed976162eee3cde42e4ac3274d8394d3de26768ee78d`
- `docs/exploration/assets/vehicle-family-atlas-2026-07-28/snow-crawler-reconstruction-candidate-2026-07-28.png`
  — SHA-256 `29f6dcc4e1e0c1861a43359a9146500498fb267479b20381f7f5c99b2c6c3ce1`

All are generated-image references, 1536 × 1024 RGB PNGs, generated in the
Codex workspace on 2026-07-28, manually inspected, and **not approved for
runtime**. The turnaround is a visual aid rather than exact orthographic
evidence; the mode board is a use-case diff; the snow crawler is a single-view
extreme candidate. Replacement path: authored/measured multi-view package,
strict reconstruction spec, validation, browser proof, then manifest admission.

The proposed sculpt record at
`docs/research/assets/utility-tow-intake-2026-07-28/object-sculpt-spec-proposed.json`
is also reference-stage data. It is explicitly not strict-quality validated,
not a runtime code generator input, and not a substitute for measured scale or
owner approval.

## Addendum (2026-07-25) - provenance is still reference-first, not runtime-imported

- Re-checked the provenance register against the current browser daemon
  snapshot and repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The project still has the right provenance posture for the current runtime:
  - concept/reference images are registered with hashes and intended-use notes,
  - the private Kenney library is inspected and documented as a source library,
  - runtime remains asset-light and procedurally authored.
- What is still missing is the runtime bridge:
  - no imported runtime asset has become the durable truth source yet,
  - no approved runtime manifest has replaced the reference-only status,
  - no public reuse decision has been elevated from the provenance notes into a
    shipped asset path.
- So the register is correctly preventing “temporary” references from becoming
  production truth, but the next obligation remains a formal runtime import
  manifest once assets cross into the playable path.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code,
  provenance, and doc inspection.

## Addendum (2026-07-25) - Runtime asset-light posture

- The live Field 02 runtime still does not consume imported runtime 3D assets.
- The current browser surface is built from authored/procedural geometry and
  vertex-colour readability, which keeps the runtime readable without texture
  assets or a browser asset manifest yet.
- That makes the concept/reference registrations above even more important:
  they remain reference-only until an imported asset pipeline is actually in
  the playable path.
- The next provenance obligation becomes a versioned runtime asset manifest
  once imported art enters the browser runtime.

## Addendum (2026-07-26) - current runtime and distribution reconciliation

The purchased All-in-One bundle remains a private source library and must not
be mirrored as a bundle. Two selectively copied Car Kit derivatives now carry
pack-level CC0 evidence, matching source/runtime hashes, and `runtime-tested`
developer-bridge status. CC0 rights permit use and redistribution;
`publicRuntimeApproved: false` means they are not approved as default
player-surface production art and are excluded from the production artifact.
Earlier “nothing copied” and “browser verification pending” statements above
are historical checkpoints superseded by this addendum.

## Addendum (2026-07-29) - runtime bridge admission is not public approval

The current asset trail now separates two different proofs that should not be
collapsed into one another:

- runtime bridge admission proves the asset can be loaded and rendered in the
  developer or acceptance path;
- public approval proves the asset may become player truth in the shipped
  surface.

That distinction matters because the remaining gap is no longer whether an
asset can enter a bridge at all. The next obligation is the promotion record
that ties identity, compact rights/provenance, runtime proof, and rollback
path together for a specific public-facing asset decision.

Until that record exists, the provenance register should continue treating the
candidate as reference or bridge material, not as shipped runtime truth.

## Addendum (2026-07-29) - first persistent infrastructure environment concept

### `marsh-depot-floodgate-environment-concept-2026-07-29.png`

- Project path: `assets/generated/marsh-depot-floodgate-environment-concept-2026-07-29.png`
- Stable ID: `marsh-depot-floodgate-environment-concept`
- SHA-256: `93da3e41ef0818de129f2894339ca0fd544fa680111cbb768d8ce306ed8a5b56`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-29
- Tool/provider: bundled `imagegen` CLI using OpenAI Image API, model `gpt-image-1.5`
- Use case: `stylized-concept`
- Asset type: Rigs Unbound game environment concept art
- Intended use: make the persistent infrastructure network legible as a place
  where route access, machine care, cargo movement, and human work visibly
  meet; specifically supports Marsh Depot, Floodgate 12, Sunken Flats, and the
  Patchwork Atlas environment grammar
- Production status: **concept/reference only; not approved as runtime art,
  mesh input, or public distribution**
- Human review: inspected at original resolution after generation. The tractor
  reads as the protagonist, the stilted depot and workers make the settlement
  consequence visible, and Floodgate 12 reads as a route-scale infrastructure
  landmark. It remains a single atmospheric view; exact layout, collision
  envelopes, structural measurements, before/after state, and runtime budgets
  are unverified.
- Rights/terms status: generated in the project workspace; provider terms and
  any public reuse or marketing use require review before distribution
- Replacement path: replace or supplement with an authored multi-view
  environment package, measured landmark/collision spec, and canonical-port
  runtime proof before any asset admission
- Linked manifest entry: [`assets/asset-manifest.json`](../../assets/asset-manifest.json)
- Exact prompt and flags: [`assets/generated/marsh-depot-floodgate-environment-concept-2026-07-29.prompt.md`](../../assets/generated/marsh-depot-floodgate-environment-concept-2026-07-29.prompt.md)

### Generation record

The generation used `--size 1536x1024`, `--quality high`,
`--output-format png`, and wrote the result directly into the repo's existing
`assets/generated/` tree after the initial CLI output was relocated from the
skill's default output location. No input/reference image was used.

Prompt intent: an original Patchwork Atlas marsh settlement after rain, with a
weathered rust-and-bone utility tractor and broad plough in the foreground, a
stilted depot with shelter, fuel drum, ferry ramp, cargo float, workers, and a
restored flood-control gate channel in the middle distance. The scene should
show working infrastructure and human consequence rather than an empty test
arena; it should use warm work lights, cool marsh shadows, readable gameplay
landmarks, no logos, no readable text, no watermark, no real-world markings,
and no militarised styling.

### Imagegen queue — next durable candidates

This is a backlog, not a claim that the assets exist. Each item stays reference
only until it has a prompt record, hash, inspection note, and an explicit
runtime/public decision:

1. Floodgate 12 before/after composition: failed red/dim gate versus cyan
   working flow, with identical camera and terrain so the world-memory delta is
   testable rather than implied by a new scene.
2. Marsh Depot close environment plate: shelter, ferry ramp, fuel drum,
   ferrymen, cargo staging, and low-poly landmark silhouettes readable at the
   canonical chase distance.
3. Long Furrow drainage station: field pump, wet-to-workable soil transition,
   cultivation traces, and a readable connection to the community rather than a
   standalone quest prop.
4. Utility tow recovery candidate: isolated three-quarter reference with front
   tow eyes, rear winch, boom, service drawers, and explicit uncertainty notes,
   continuing the existing `utility_tow_recovery_01` admission path.
5. Failure/readability fixtures: bogged track, overloaded cargo, blocked lamp,
   damaged attachment, and a confusing silhouette to exercise recovery and
   player-comprehension review rather than generating only hero art.

### Anything else?

Yes: this asset is useful because it gives the infrastructure and settlement
systems a shared visual target, but it must not be allowed to silently become
the runtime layout. The next acceptance step is a canonical-port observation
of the existing authored assemblies against this reference, with any mismatch
recorded as a design or runtime gap rather than hidden by replacing the
procedural truth with a concept image.

## Addendum (2026-07-29) - object-first catalog and utility tow reconstruction input

The asset lane now has a durable object-first catalog:
[`docs/exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md`](../exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md).
It separates isolated `img2threejs` candidates from vegetation, roads,
sprites/clouds, environment materials, and scene kits that need different
production paths.

### `utility-tow-recovery-01-object-reference-2026-07-29.png`

- Project path: `assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.png`
- Stable ID: `utility-tow-recovery-01-object-reference`
- SHA-256: `4b5e53cc655a41054850dc94a0ce539ef0b3e8dd711d28bd23664e8fedcc9014`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-29
- Tool/provider: bundled `imagegen` CLI using OpenAI Image API, model `gpt-image-1.5`
- Use case: isolated object reference for `utility_tow_recovery_01`
- Production status: **conditional reference only; reconstruction and runtime
  admission not started**
- Human review: the rig is fully visible on a neutral background with a clear
  chassis, cab, recovery boom, hinge, cable, winch, wheel, beacon, tow-eye,
  and service-drawer read. Hidden geometry, scale, orthographic consistency,
  collision decomposition, and runtime budget remain unknown.
- Rights/terms status: generated in the project workspace; provider terms and
  public reuse require review before distribution
- Replacement path: authored multi-view/orthographic package or a reviewed
  procedural candidate with explicit uncertainty records
- Linked manifest entry: [`assets/asset-manifest.json`](../../assets/asset-manifest.json)
- Exact prompt and flags: [`assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.prompt.md`](../../assets/generated/utility-tow-recovery-01-object-reference-2026-07-29.prompt.md)
- Reconstruction workbench: [`assets/workbench/utility-tow-recovery-01/README.md`](../../assets/workbench/utility-tow-recovery-01/README.md)

### Pipeline decision

The first subagent seam is the local `img2threejs` skill package at
`/Users/pranay/Projects/external-skills/img2threejs__img2threejs/`. Its staged
gates require reference admission, a strict quality contract, mapped detail
inventory, action-ready pivots/sockets/colliders, locked pass reviews, and
multi-angle browser evidence. No callable MCP `img2threejs` tool was present;
the repo-owned workbench therefore records script outputs and generated source
without treating them as runtime truth.

### Anything else?

Yes: the prior environment plate remains useful as a composition reference,
but this object plate is the correct next input for proving reusable asset
production. A road tile, tree family, and cloud/sprite atlas will be queued
through their own appropriate lanes rather than misclassified as single-object
mesh reconstructions.

## Addendum (2026-07-29) - canonical asset definition layer

The field-plough slice now has a canonical semantic definition at
[`assets/specs/field-plough-01.asset.json`](../../assets/specs/field-plough-01.asset.json).
It records identity, uncertainty, provisional dimensions, component hierarchy,
attachment sockets, pivots, action states, collision ownership, material
layers, LOD, runtime adapter, compiler stages, provenance, and gate evidence.

The definition is the source of truth. The `img2threejs` workbench is a derived
compiler/evidence surface; its current strict-quality failure remains recorded
and no factory or GLB is promoted. Manifest preflight now checks linked specs
for required structural fields. The architectural decision is recorded in
[ADR-0047](../decisions/ADR-0047-canonical-asset-definition-and-compiler-stages.md).

### Anything else?

Yes: this closes the most important production-grade gap identified in the
quality review. A future tree, road, sprite atlas, or scene kit must follow the
same source-of-truth pattern while using an appropriate compiler path.

### Compiler correction result

The canonical definition now derives the `img2threejs` spec through the
reusable `tools/derive-img2threejs-spec.mjs` compiler. Normal and strict
validation both pass with zero errors and zero warnings. The current unlocked
blockout factory is preserved at
`assets/workbench/field-plough-01/generated/createFieldPloughModel.ts`, and it
passes isolated TypeScript compilation. Visual/browser review, GLB export,
runtime integration, collision review, and public approval remain open.

## Addendum (2026-07-29) - first bounded rig-part reference

### `field-plough-01-object-reference-2026-07-29.png`

- Project path: `assets/generated/field-plough-01-object-reference-2026-07-29.png`
- Stable ID: `field-plough-01-object-reference`
- SHA-256: `eab01f9c29140ce6015004203a22bf04dd837469969b7e4be850668b8f805dde`
- Dimensions: 1536 × 1024 RGB PNG
- Date generated: 2026-07-29
- Tool/provider: bundled `imagegen` CLI using OpenAI Image API, model `gpt-image-1.5`
- Use case: isolated field-plough rig-part reference for the first bounded
  `img2threejs` reconstruction package
- Production status: **conditional reference only; reconstruction pending**
- Human review: the attachment frame, top link, lower hitch areas, repeated
  plough shares, hydraulic ram, hinge hardware, painted metal, rust, and soil
  residue are visually readable. The prompt requested three shares, while the
  image appears to show four; the spec must follow visible evidence and record
  the uncertainty rather than silently forcing the prompt.
- Rights/terms status: generated in the project workspace; provider terms and
  public reuse require review before distribution
- Replacement path: reviewed multi-view object-part package or an authored
  procedural module with explicit attachment dimensions and state limits
- Linked manifest entry: [`assets/asset-manifest.json`](../../assets/asset-manifest.json)
- Exact prompt and flags: [`assets/generated/field-plough-01-object-reference-2026-07-29.prompt.md`](../../assets/generated/field-plough-01-object-reference-2026-07-29.prompt.md)
- Reconstruction workbench: [`assets/workbench/field-plough-01/README.md`](../../assets/workbench/field-plough-01/README.md)

### Anything else?

Yes: this smaller package is intentionally the first reconstruction probe. The
repository already has a `field-plough` attachment and `ploughPivot` seam, so
it can test action-ready attachment semantics without prematurely promoting a
whole vehicle or turning a concept plate into runtime truth.

### Reconstruction gate result

The repo-owned `img2threejs` workbench run passed image probe, reference
admission, pre-spec assessment, detail inventory, and painted-steel PBR
extraction (`0.86` confidence versus `0.70` threshold). Normal spec validation
passed with warnings. Strict validation remains blocked with 12 errors because
the embedded `object-sculpt-spec.json` still has a shallow component/material
hierarchy, generic feature targets, no embedded detail inventory, no lighting
entries, no repetition system, and only three review viewpoints. No factory,
GLB, runtime approval, or public promotion was created.

The exact machine-readable evidence is retained under
`assets/workbench/field-plough-01/`; the workbench README and
`strict-quality-result.md` define the next correction. This is a quality gate,
not a failure of the asset-first strategy.

## Addendum (2026-07-29) - provenance separates development availability from distribution

The field-plough entry is now a `procedural-candidate` in the manifest and
canonical definition. Its generated reference, derived sculpt spec, procedural
factory, and browser review artifacts are available for repository-local
development and open-world exploration. This does not grant public distribution
rights, and `publicRuntimeApproved` remains false until the separate promotion
package is reviewed. Provenance is therefore a distribution boundary, not a
reason to suppress useful development assets.

## Addendum (2026-08-11) - `plow_4_furrow.glb`: an unprovenanced binary, and its removal

This entry exists so the record outlives the bytes. The file is being removed,
and a register that only lists what we kept cannot explain what we rejected or
why — which is the information a future reader needs when the next stray binary
appears.

### What it was

- Path: `plow_4_furrow.glb`, at the **repository root**, outside `assets/`.
- Size: 130,788 bytes. SHA-256:
  `dca8e21197b6c412ac1c36c2dc23ad1669a0a3373a856f43667bb4dec76e308c`.
- glTF 2.0, container v2, JSON+BIN.
- `asset.generator`: `https://github.com/mikedh/trimesh`.
- `asset.copyright`: **none declared**. No accompanying licence file.
- Structure: 1 scene, 2 nodes (`world`, `geometry_0`), 1 mesh, 1 primitive.
- Surfacing: **0 materials, 0 textures, 0 images**; the single primitive
  references no material at all.

### Why removal, not registration

The repository's own documents had already recorded the accepted dispositions
three separate times — "register with provenance and relocate to
`assets/runtime/`, or remove" (`docs/reviews/VISION_IMPLEMENTATION_REVIEW_2026-08-05.md`
§4 defect (2), and twice in `docs/WORKLOG.md`). The first branch turned out to be
unavailable, because there is no provenance to register:

1. **The generator is alien to every pipeline here.** This repository exports
   GLBs with `THREE.GLTFExporter` (`tools/export-field-plough-glb.cjs:97`), and
   its two external assets are Kenney kit parts stamped `UnityGLTF`. Nothing
   here emits trimesh output. The `img2threejs` forge is Python but explicitly
   dependency-light — `forge/requirements.txt` states it uses "struct/zlib
   directly — no Pillow/numpy/OpenCV/Playwright required" — and never imports
   trimesh.
2. **The one in-repo mention of "trimesh" is a false lead.** It appears in
   `docs/research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md:76`, where it
   is Rapier's *trimesh collider shape*, an unrelated use of the same word.
3. **Nothing referenced it.** No `src/`, `tools/`, or config file named it; the
   only references were the three documents reporting it as a defect.
4. **The bytes carry no authorship claim.** No `copyright`, no `extras`, no
   licence file, and auto-generated node names (`world`, `geometry_0`) rather
   than authored ones — compare the 78 semantically named nodes in
   `field-plough-01.glb`. There is nothing in or beside the file to establish who
   made it or under what terms.

Registering it would have meant writing `rightsStatus: "unknown"` into the
manifest, which is not provenance — it is a permanent record that the repository
knowingly retains an unlicensed binary it cannot ship or attribute. For an
artifact with zero references, removal is the honest disposition. The generator
string, digest, and structure above are preserved here, so the finding remains
auditable and the file is recoverable from git history if provenance ever
surfaces.

### Method note

The evidence above was produced by `tools/inspect-glb-provenance.mjs --all`, a
tool written during this disposition precisely because the question "where did
this binary come from" had been asked three times across two weeks and answered
by hand each time. `asset.generator` is the cheapest provenance signal a GLB
carries and no tool here was reading it. It now runs over every GLB in the tree
in one command, and it is the same tool that will vet imported rig blockouts.

### Anything else?

Yes — two things worth stating plainly.

The comparison table this produced is more useful than the single disposition:

| File | Generator | Materials | Origin |
| --- | --- | --- | --- |
| `assets/runtime/field-plough-01.glb` | `THREE.GLTFExporter r185` | 22 | repo-authored, this pipeline |
| `assets/runtime/kenney-car-kit-tractor-preview.glb` | `UnityGLTF` | 1 | Kenney kit, registered |
| `assets/runtime/kenney-car-kit-breakable-crate-fixture.glb` | `UnityGLTF` | 1 | Kenney kit, registered |
| `plow_4_furrow.glb` | `trimesh` | 0 | unestablished — removed |

Generator strings partition this set cleanly along the provenance boundary that
matters. That is worth checking on import rather than after the fact.

Second: the detection gap that let this sit for two weeks is already closed, but
by a different mechanism than the one that found it. `audit:asset-coverage`
reports undeclared binaries, and it flagged this file — while
`audit:asset-coverage:strict` exits 1 on it. The non-strict audit is what
`verify:head` runs, deliberately, so a stray binary is *reported* without
failing the build. That choice is sound, but it means the report only works if
someone reads it. This file was reported correctly, three times, and stayed.

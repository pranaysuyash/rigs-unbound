# Asset Provenance Register

This register begins during concept exploration so provenance does not become a retroactive cleanup task.

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

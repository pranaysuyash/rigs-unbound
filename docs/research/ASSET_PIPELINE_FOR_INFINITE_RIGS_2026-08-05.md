# Asset Pipeline for Infinite Rig Generation — Full Exploration

**Date:** 2026-08-05
**Type:** Design exploration + tooling landscape
**Status:** This document maps the current asset pipeline state, the GenAI landscape, and the hybrid approach needed to support infinite rig generation. It is a proposed direction; it must be reviewed against the first-playable slice.
**Evidence tier:** Tier 1 static source inspection of the codebase, plus external tool research. No runtime commands run.
**Consumer (2026-08-12):** None yet. [Game Director Audit — 2026-08-12](../reviews/GAME_DIRECTOR_AUDIT_2026-08-12.md) §4.4 names this doc as riding alongside the rig-generation scope-expansion pair with the same gap — paused per [`NEXT_EXECUTION_BOARD_2026-08-12.md`](../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) GD-09/GD-13 until the first-playable slice ships and an explicit spine/ADR entry names what this unblocks. Content preserved unedited below.

---

## 1. The problem

The vision demands infinite rig configurations across 11 vehicle families, 10+ contexts, 20+ scenes, and 15+ use cases. The current asset pipeline has:
- 2 GLB models in runtime (Kenney CC0 crate + tractor preview)
- 0 texture assets (everything is vertex colors)
- 1 authored procedural factory (field-plough, TypeScript, not GLB)
- 1 failed img2threejs reconstruction (IoU 0.47 vs 0.85 threshold)
- No LOD pipeline, no compression pipeline
- No animation pipeline
- No sound pipeline

**You cannot hand-author 11 families × infinite variants × 10 contexts.** The pipeline must generate assets at scale while staying within browser performance budgets (<50K tris, <50MB GPU, <30 draw calls, <16ms frame time).

---

## 2. Current state (what exists in code)

### Asset manifest system
- `assets/asset-manifest.json` — canonical registry, JSON Schema validated
- `tools/asset-preflight.mjs` — 811-line CLI validator (schema, SHA-256, GLB integrity, license)
- `tools/assert-player-build-assets.mjs` — player build boundary enforcement
- `src/game/runtime-assets.ts` — runtime bridge (manifest → renderer)
- `src/game/renderer.ts` — GLTFLoader, fallback boxes, evidence tracking

### Runtime format
**GLB only.** The manifest enforces `"runtimeFormat": "glb"`. The preflight tool rejects anything else. Three.js `GLTFLoader` is the consumer.

### Asset promotion workflow
- Source artifact → normalized export → manifest entry → validation → runtime activation → deprecation/replacement
- Developer surface: all manifest entries visible
- Player surface: only `publicRuntimeApproved: true` entries
- First candidate (Kenney crate) assembled but unsigned

### Renderer material system
- `MeshPhysicalMaterial` for scene objects (clearcoat, clearcoatRoughness)
- `MeshStandardMaterial` for terrain (vertex colors, no textures)
- Custom `ShaderMaterial` for water (Gerstner waves, Fresnel, foam)
- Custom `ShaderMaterial` for state shell (aura, hit ripples)
- Instanced rendering for trees, rocks, felled trunks, salvage, furrow decals
- Billboard LODs for far-tier props
- Post-processing: UnrealBloom + FXAA

### img2threejs pipeline
1. AI-generated concept art → isolated reference
2. `tools/derive-img2threejs-spec.mjs` → sculpt spec
3. `generate_threejs_factory.py` → TypeScript factory
4. Browser review → silhouette comparison
5. **Failed** at Tier 1 gate (IoU 0.47 vs 0.85)

### What's missing
- No production mesh for any rig
- No LOD pipeline
- No texture pipeline
- No animation pipeline
- No sound pipeline
- No compression pipeline
- No multi-variant generation system

---

## 3. GenAI 3D model generation — the landscape

### Tier 1: Production-ready (browser-exportable GLB)

| Tool | What it produces | Quality | Formats | Cost | Integration | Best for |
|---|---|---|---|---|---|---|
| **Tripo AI** (P1 Smart Mesh) | Game-ready 3D models, 48–20K polys | Production | GLB, OBJ, FBX | Free 300 credits/mo; Pro $19/mo | Web UI, Blender/Unity plugins, API | Game-ready props, rig variants |
| **Meshy 6** | Textured 3D models, batch mode (10 images) | Production | GLB, FBX, OBJ, STL, USDZ, BLEND | Free 100 credits/mo; Pro ~$20/mo | Browser, plugins for all engines | Batch generation, concept-to-mesh |
| **Hyper3D Rodin** (Gen-2.5) | High-detail models, 4K PBR textures | AAA-adjacent | GLB, FBX, OBJ | $0.40/gen via fal.ai API | Web UI + API | Hero assets, highest detail |
| **3D AI Studio** | Aggregates 15+ engines | Varies | GLB native | Free credits, per-engine pricing | Single interface, multiple backends | Compare engines per asset type |

### Tier 2: Useful but needs pipeline work

| Tool | What it produces | Quality | Formats | Integration | Limitation |
|---|---|---|---|---|---|
| **Hunyuan3D 3.5** (Tencent) | Maximum-detail, up to 2M polys, 8K textures | AAA | GLB | Web platform, API | Overkill for browser; needs aggressive LOD |
| **Wonder3D** | Textured meshes from images | Prototype | OBJ, PLY | Self-hosted, needs GPU | Research-grade; no PBR pipeline |
| **InstantMesh** | Fast feed-forward reconstruction | Prototype | OBJ, PLY | Self-hosted, needs GPU | Lower quality; limited textures |

### Tier 3: Research/not practical

| Tool | Why not practical |
|---|---|
| Stability SV3D | Video output, not direct meshes; non-commercial license |
| CLIP-Mesh | Low quality, no textures |

### Key insight for Rigs Unbound

**Tripo P1 and Meshy 6 are the primary tools.** They produce game-ready GLB with PBR textures, export directly to Three.js, and operate at the right quality/price point. Hyper3D Rodin is the hero-asset tool when maximum detail matters.

---

## 4. GenAI texture generation

### The current gap
The renderer uses vertex colors for everything. Zero texture assets exist. For infinite rig variants, you need:
- Surface materials (rust, bone enamel, sage metal, rubber, glass)
- Weathering/wear patterns (scratches, dents, soil residue)
- Context-specific textures (race stripes, floodlights, shields)

### Available tools

| Tool | What it produces | Quality | Formats | Cost | Best for |
|---|---|---|---|---|---|
| **Polycam AI Textures** | Seamless PBR textures (albedo, normal, roughness, displacement) | Production | Standard PBR maps | Free basic; Pro for unlimited | Quick texture generation |
| **Meshy AI Textures** | PBR textures from text/image, applies to 3D models | Production | Full PBR stack | Included in Meshy credits | Texture iteration on models |
| **Artomatix AI** | AI materials, cleanup, upscaling (2K–8K), seamless tiling | AAA | PBR maps | Paid licensing | Production-quality materials |
| **InstaMAT** | Procedural materials, node-based graphs, AI super-resolution | AAA | All PBR maps, 16K | Free tier; paid production | Complex material systems |
| **AI Texture Studio** | Seamless textures, PBR stacks, upscaling to 8K | Production | 5 PBR maps | 10 free credits; pay-per-use | Browser-based generation |
| **Hyper3D OmniCraft** | PBR textures from text/image, applies to uploaded models | Production | GLB with embedded textures | Included in Hyper3D credits | Direct GLB output |

### Key insight for Rigs Unbound

**Meshy AI Textures + Polycam** cover the gap. Generate PBR texture sets (albedo + normal + roughness) for each surface material, apply to generated models, export as textured GLB. The renderer's `MeshPhysicalMaterial` already supports PBR maps — the transition from vertex colors to textures is a renderer configuration change, not an architecture change.

---

## 5. GenAI sound generation

### The current gap
No sound pipeline exists. The game needs:
- Engine sounds (per-rig, per-surface, per-speed)
- Terrain interaction sounds (mud squelch, gravel crunch, water splash)
- Module sounds (winch motor, survey ping, plough scrape)
- Environmental sounds (wind, rain, thunder, birds)
- UI sounds (menu, notification, success/failure)

### Available tools

| Tool | What it produces | Quality | Formats | Cost | Best for |
|---|---|---|---|---|---|
| **ElevenLabs SFX** | Short game SFX from text (0.5–22s) | Production | MP3, WAV | 50 free/mo; Creator $11/mo | Punchy short SFX |
| **Stable Audio** | Music + SFX, atmospheric beds, ambient layers | Production | WAV, MP3 | Free ~20/mo; Creator $11.99/mo | Ambient/music layers |
| **Stable Audio Open 1.0** | Same as above, self-hostable | Production | WAV | Free (open-source, <$1M revenue) | Full pipeline control |
| **Summer Engine** | Game-specific SFX generation | Production | WAV, MP3 | Free tier | Game-focused SFX |

### Key insight for Rigs Unbound

**ElevenLabs SFX + Stable Audio** cover the gap. ElevenLabs for punchy interaction SFX (engine, tools, impacts). Stable Audio for ambient layers (wind, rain, environment). The API integration is straightforward for a browser game using Web Audio API.

---

## 6. GenAI animation

### The current gap
No animation pipeline exists. Rigs need:
- Driving animations (suspension bounce, wheel rotation, steering)
- Module animations (plough raise/lower, winch deploy/retract)
- Damage animations (dents, sparks, smoke)
- Environmental animations (cargo shift, water splash, mud spray)

### Available tools

| Tool | What it produces | Quality | Formats | Cost | Best for |
|---|---|---|---|---|---|
| **Mixamo** (Adobe) | Auto-rig + 2,500 mocap clips | Production | FBX (needs GLB conversion) | Free (Adobe account) | Standard humanoid animations |
| **Sorceress 3D Studio** | AI image → img23D → auto-rig → text-to-animation | Production | FBX, GLB, GLTF | Free tier | Creature support, browser-based |
| **Cinevva** | Browser auto-rig + text-to-motion | Indie/production | GLB, BVH | Free | Free GLB export |
| **Rokoko Create** | Full-body motion from text | Production | FBX | Free gen; Starter for exports | High-quality mocap |
| **DeepMotion** | AI motion capture from video | Production | FBX, BVH, GLB | Free tier; Pro $39/mo | Video-to-motion |
| **Quaternius** | 250+ CC0 animation clips | Indie/production | FBX, GLB, BVH | Free (CC0) | Ready-to-use library |

### Key insight for Rigs Unbound

**Vehicles don't need Mixamo** (humanoid-only). The animation pipeline should be:
1. **Procedural animations** — suspension bounce, wheel rotation, steering (code-generated, already partially in the renderer)
2. **Module animations** — keyframe animations baked into GLB (plough raise/lower, winch deploy)
3. **Environmental animations** — particle systems + shader effects (mud spray, water splash, dust)
4. **Quaternius library** — for any humanoid NPC animations needed later

The procedural approach (code-generated animation) is the right fit for vehicles because vehicle animations are physics-driven, not mocap-driven.

---

## 7. What Claude/Opus can do for assets

### What it does well
- **Shader code generation** — GLSL/HLSL, Three.js ShaderMaterial, post-processing (proven: 4x inference speedup on AMD hardware)
- **Procedural geometry** — Blender Python scripts, Three.js BufferGeometry, parametric models
- **Material definitions** — MeshStandardMaterial pipelines, PBR configurations, texture loading
- **Animation code** — Three.js AnimationMixer, keyframe tracks, procedural animation
- **Pipeline tooling** — Asset validation, manifest management, build scripts

### What it cannot do
- **Generate 3D meshes directly** — LLMs output code, not geometry. The geometry comes from Three.js/Blender executing the code.
- **Generate textures directly** — LLMs output material definitions, not pixel data. Textures come from diffusion models.
- **Generate sound directly** — LLMs output code/config, not audio. Audio comes from audio generation models.
- **Evaluate visual quality** — LLMs can describe images but cannot judge aesthetic quality or game-readiness.

### The hybrid approach

Claude/Opus is the **orchestrator**, not the generator. It:
1. Generates the code that builds procedural geometry
2. Writes the shaders that define materials
3. Creates the pipeline tools that validate and transform assets
4. Orchestrates the GenAI tools (Tripo, Meshy, ElevenLabs) through API calls
5. Writes the integration code that loads assets into Three.js

The GenAI tools (Tripo, Meshy, ElevenLabs) are the **generators**. They produce the actual pixels, polygons, and waveforms.

---

## 8. Blender + AI plugins

### Why Blender matters

Blender is the DCC (digital content creation) tool that bridges AI generation and the game engine. The pipeline is:

```
AI generates → Blender refines → Three.js renders
```

### Available plugins

| Plugin | What it does | Cost | Integration |
|---|---|---|---|
| **3D-Agent** | Text-to-3D inside Blender via MCP | Free tier; Starter $10/mo | Native addon |
| **Meshy Blender Plugin** | Text/image-to-3D in Blender | Meshy subscription | Standard addon |
| **Blender MCP** (13,700+ stars) | Natural language control via Claude/ChatGPT/Gemini | Free (open-source) | MCP server |
| **Dream Textures** | AI texture generation inside Blender | Free (open-source) | Needs GPU (RTX 3060+) |
| **StableGen** | AI texture + 3D creation in Blender | Free (open-source) | Needs GPU |

### Key insight for Rigs Unbound

**Blender MCP is the integration point.** It lets Claude control Blender programmatically — create meshes, apply materials, set up lighting, export GLB. This is the bridge between AI generation and the game's GLB pipeline.

The workflow:
1. Claude generates a procedural Three.js factory (existing pattern: `createFieldPloughModel.ts`)
2. Or Claude orchestrates Tripo/Meshy to generate a mesh
3. Blender MCP refines the mesh (retopology, UV mapping, material application)
4. Blender exports GLB
5. Asset preflight validates the GLB
6. Renderer loads the GLB

---

## 9. The hybrid pipeline (recommended)

### Architecture

```
Layer 1: Concept Generation
  AI image gen (OpenAI/DALL-E) → concept art, model sheets
  Claude → prompt refinement, art direction

Layer 2: 3D Model Generation
  Tripo P1 / Meshy 6 → game-ready GLB from concept
  Hyper3D Rodin → hero assets, highest detail
  Blender MCP → refinement, retopology, UV mapping

Layer 3: Texture Generation
  Meshy AI Textures / Polycam → PBR texture sets
  InstaMAT → complex material systems
  Claude → material definition code

Layer 4: Animation
  Procedural (Claude-generated code) → vehicle physics animations
  Quaternius CC0 → humanoid NPC animations (if needed)
  Blender → keyframe animations for modules

Layer 5: Sound
  ElevenLabs SFX → interaction sounds
  Stable Audio → ambient/music layers
  Claude → Web Audio API integration code

Layer 6: Validation
  Asset preflight → GLB integrity, SHA-256, schema
  Performance budgets → tri count, GPU memory, draw calls
  Silhouette comparison → IoU gate for generated models

Layer 7: Integration
  Manifest → runtime bridge → renderer → scene
```

### The rig-specific pipeline

For each rig variant:

```
1. Archetype DNA (seed)
   → derive chassis characteristics (wheelbase, mass, hardpoints)

2. Concept generation
   → AI image gen produces concept from archetype + variant description
   → Claude refines prompt for game-readiness

3. 3D model generation
   → Tripo P1 generates GLB from concept
   → Blender MCP retopologizes to game budget (<10K tris per rig)
   → UV map + material assignment

4. Texture generation
   → Meshy AI textures generate PBR set for surface materials
   → Apply weathering/wear from condition state

5. Module generation
   → Each module is a separate GLB attachment
   → Module GLBs generated from module templates
   → Attachment points defined by archetype hardpoints

6. Animation
   → Procedural suspension/wheel/steering (code)
   → Module keyframe animations (Blender export)

7. Validation
   → Asset preflight (GLB integrity, budget)
   → Silhouette gate (IoU vs archetype reference)
   → Performance gate (tri count, draw calls)

8. Manifest entry
   → Register in asset-manifest.json
   → Runtime bridge placement
   → Renderer loads GLB
```

---

## 10. Performance implications

### Browser budgets (from renderer contract)

| Metric | Budget | Current |
|---|---|---|
| Triangles | <50K | ~15–20K (terrain + props) |
| GPU memory | <50MB | ~0 (vertex colors) |
| Draw calls | <30 | ~15–20 |
| Frame time | <16ms | ~8ms |

### What generated assets add

| Asset type | Typical tri count | GPU memory | Draw calls |
|---|---|---|---|
| Rig model (game-ready) | 5–15K | 2–8MB | 1–3 |
| Module attachment | 1–3K | 0.5–2MB | 1 |
| PBR texture set | — | 2–8MB | — |
| **Total per rig + modules** | **8–25K** | **5–20MB** | **2–6** |

### Mitigations

1. **LOD pipeline** — 3 levels: full (5–15K), mid (2–5K), billboard (<500). Auto-degrade already exists.
2. **Texture compression** — Basis/ETC2/BC7 for GPU-compressed textures. Contract exists, tooling needed.
3. **Instancing** — Same mesh variant = InstancedMesh. Already used for trees/rocks.
4. **Frustum culling** — Already enabled. Skip unseen rigs.
5. **Budget counter** — Track per-frame actor count, GPU memory, draw calls. Already instrumented.

---

## 11. Provenance and quality gates

### The existing gates (from asset pipeline contract)

Every generated asset must pass:
1. **Source recorded** — generation tool, input reference, timestamp
2. **Linked to blueprint** — canonical asset spec
3. **Scale/pivots/sockets explicit** — coordinate frame
4. **GLB passes preflight** — binary integrity, schema, SHA-256
5. **Browser loads it** — GLTFLoader success
6. **Evidence recorded** — screenshots, metrics
7. **Manifest stores hashes** — integrity verification

### The rig-specific gates

For infinite variants, additional gates are needed:
1. **Variant budget** — max tri count per archetype variant
2. **Silhouette gate** — IoU vs archetype reference (relaxed from 0.85 to 0.7 for variants)
3. **Material consistency** — PBR maps match archetype material palette
4. **Attachment compatibility** — module GLBs mount at hardpoint locations
5. **Performance gate** — total scene budget when rig + modules + terrain are combined

---

## 12. First proof slice

The smallest durable proof that this pipeline works for infinite rigs:

1. **One archetype** (Torque-70) — concept art generated with AI
2. **Two variants** — different seed descriptions, two concept arts
3. **Two 3D models** — Tripo P1 generates GLB from each concept
4. **One texture set** — Meshy AI generates PBR for the surface material
5. **One module** — brush guard GLB generated, attachment point defined
6. **Browser load** — both variants + module load in renderer
7. **Performance check** — tri count, GPU memory within budget
8. **Silhouette check** — IoU vs archetype reference

### What this proves

- AI-to-GLB pipeline works end-to-end
- Variants are visually distinct but recognisably the same archetype
- Textures integrate with the renderer's material system
- Modules attach at hardpoint locations
- Performance stays within browser budgets

### What this does NOT prove

- Full 11-family catalog (that's concept generation work)
- Full module template system (that's content, not pipeline)
- Animation pipeline (that's a separate proof)
- Sound pipeline (that's a separate proof)
- LOD pipeline (that's optimization work)

---

## 13. Decision map

| Decision | Recommendation | Rationale |
|---|---|---|
| Primary 3D gen tool | **Tripo P1** (game-ready) + **Meshy 6** (batch) | GLB export, game-ready topology, right price |
| Hero asset tool | **Hyper3D Rodin** | Highest detail, decimate for browser |
| Texture tool | **Meshy AI Textures** + **Polycam** | Fast PBR generation, browser-based |
| Sound tool | **ElevenLabs SFX** + **Stable Audio** | API integration, game-focused |
| Animation approach | **Procedural code** (vehicles) + **Quaternius** (humanoid) | Vehicle animations are physics-driven |
| DCC tool | **Blender + MCP** | AI integration, retopology, GLB export |
| LLM role | **Orchestrator** (code, pipeline, validation) | LLMs generate code, not geometry |
| Runtime format | **GLB** (already enforced) | Universal, Three.js native |
| Provenance | **Existing manifest system** (extended for variants) | Already proven, just needs variant support |

---

## 14. The throughline

> The asset pipeline is not a bottleneck. It is a composition of specialized tools, each doing what it does best.

- **AI image generators** produce concepts
- **AI 3D generators** produce meshes
- **AI texture generators** produce materials
- **AI sound generators** produce audio
- **Claude/Opus** orchestrates the pipeline, generates code, validates quality
- **Blender** refines and exports
- **The manifest system** gates quality and provenance
- **The renderer** loads and displays

The pipeline generates infinite rigs from finite rules because:
1. Archetypes are authored (11 families, finite)
2. Variants are procedural (seed-based, infinite)
3. Modules are template-based (context-driven, bounded)
4. Textures are PBR sets (reusable, composable)
5. Sound is API-generated (context-specific, on-demand)

**The content axis is surfaces and contexts (multiplicative), not vehicles (linear).** The asset pipeline supports this by generating variants within archetypes, not unique models from scratch.

---

## Linked artifacts

- [Rig Generation for Infinite Possibilities](./RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- [Rig Generation, Evolution, and Persistence](./RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md)
- [Asset Pipeline and Provenance Contract](./ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
- [Asset Authority and Shipped Mesh Contract](./ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md)
- [Asset Production Skill Review](./ASSET_PRODUCTION_SKILL_REVIEW_2026-07-25.md)
- [Web Asset Ingest and Compression Contract](./WEB_ASSET_INGEST_AND_COMPRESSION_CONTRACT_2026-07-25.md)
- [Asset Catalog and Reconstruction Backlog](../exploration/ASSET_CATALOG_AND_RECONSTRUCTION_BACKLOG_2026-07-29.md)
- [Asset Provenance Register](./ASSET_PROVENANCE_REGISTER.md)
- [Kenney Asset Library Audit](./KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)
- [src/game/runtime-assets.ts](../../src/game/runtime-assets.ts)
- [src/game/renderer.ts](../../src/game/renderer.ts)
- [assets/asset-manifest.json](../../assets/asset-manifest.json)
- [tools/asset-preflight.mjs](../../tools/asset-preflight.mjs)

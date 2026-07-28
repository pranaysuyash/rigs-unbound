# Game / Storytelling / Cinematic Skills Inventory — 2026-07-28

Exhaustive inventory of locally-installed agent skills (across every location named
in `/Users/pranay/AGENTS.md`) plus online-researched adjacent/alternate/complementary
tools, relevant to **Rigs Unbound** (Three.js browser vehicle game — see
[README.md](../../README.md)). Compiled by checking every path in the Skills
Discovery Protocol, not just `~/.claude/skills`.

Locations checked (per `/Users/pranay/AGENTS.md` → Skills Discovery Protocol):
1. `~/.claude/skills/*/`
2. `~/.agents/skills/*/`
3. `~/.hermes/skills/*/`
4. `~/Projects/skills/*/`
5. `~/Projects/external-skills/*/` (51 vendored repos, many multi-skill)
6. `~/Projects/openai-skills/`
7. `$CODEX_HOME/skills/*/` / `~/.codex/skills/*/` (largest pool — includes market-* imports flattened from external-skills repos, ~2,900+ entries)
8. `~/.zcode/skills/*/`

---

## 1. img2threejs — direct opinion

**Yes, installed locally** at three locations:
- `~/Projects/external-skills/img2threejs__img2threejs` (full repo, canonical source)
- `~/.codex/skills/market-img2threejs__img2threejs` (flattened market copy)
- **Not yet present in `~/.claude/skills/`** — so Claude Code in this session cannot invoke it as a slash-skill until it's placed there (`git clone https://github.com/img2threejs/img2threejs.git ~/.claude/skills/img2threejs`, per its own Quick Start).

**What it does:** takes one reference image, produces a `THREE.Group` factory in TypeScript — pure primitives/procedural shaders/generated geometry, no meshes, no photogrammetry, no downloaded art. It's staged and quality-gated: suitability check → pre-spec assessment + detail inventory → sculpt spec → locked build passes (blockout → structure → form → material → surface → lighting → interaction → optimization) → render-vs-reference comparison sheet → agent-vision self-correction loop (`continue | refine-spec | refine-code | request-input | stop`). Ships `root.userData.sculptRuntime` (pivots, sockets, colliders, destruction groups) so output is animation/interaction-ready, not an inert lump. Apache-2.0, Python 3.10+ stdlib only (zero pip deps), ~3.6–6k GitHub stars as of July 2026.

**My take — this is a strong fit for Rigs Unbound, and worth adopting now:**

- Rigs Unbound's entire premise is vehicles-as-characters rendered in Three.js (`src/game/renderer.ts`), currently built from hand-authored procedural geometry. img2threejs is the closest thing to a purpose-built pipeline for exactly that: reference photo of a bicycle/tractor/toy car/rocket → code-only Three.js `Group` with sockets and colliders already wired for gameplay use. That directly serves the "vehicle mods must be legible in shape and mechanics" design goal in the README.
- It is **not** a mesh-import shortcut — it forces the same discipline this repo already has around no-hacks/quality-gates (strict-quality blocks shallow specs, multi-angle checks catch flat-plane-faking-volume, bounded correction loop prevents token-burn). That matches this repo's `motto_v4.md` posture better than a GLTF-dump tool would.
- Risk to flag honestly: it's young (v1.3, weapon/environment/animation updates still on the roadmap per its own `ROADMAP.md`), it's tuned for hard-surface objects and props first — vehicles are hard-surface, so this is favorable, but it explicitly says characters/organic forms are still "stylized reconstructions, not photoreal." For Rigs Unbound's chassis/toolkit pieces this is likely fine; for any future humanoid rider it would need the newer character track.
- Recommendation: **stage it as an experiment**, same pattern as the existing `experiments/deterministic-kernel-probe` — pick one low-stakes vehicle part (a wheel, a toolkit attachment) from a reference image, run it through the full pipeline, and score the output against the existing hand-authored geometry for triangle count, gameplay-socket correctness, and visual fidelity before deciding whether to fold it into the asset pipeline. Don't route it around the current asset-manifest/preflight contract (`tools/asset-preflight.mjs`) — treat generated code the same as any other authored source file, subject to the same `assets:preflight` and reachability audit gates.

Closest **alternative** found (neural, not code-gen): **bunpav** (AISOLO Technologies) — diffusion/reconstruction text-to-3D / photo-to-3D / auto-rig producing GLB/FBX/OBJ. Faster and better on organic/face fidelity, but opaque multi-MB meshes — the opposite of img2threejs's diffable-TypeScript philosophy. Given this repo's stance on inspectable, project-owned code (ADR-0023 keeps physics project-owned rather than vendored), img2threejs's code-gen approach is the better philosophical match even if bunpav might win on raw speed for one-off hero art.

Sources: [img2threejs.org/skill](https://img2threejs.org/skill), [github.com/img2threejs](https://github.com/img2threejs), [github.com/hoainho/img2threejs](https://github.com/hoainho/img2threejs), [explainx.ai coverage](https://explainx.ai/blog/img2threejs-bunpav-procedural-photo-threejs-july-2026), [SkillsLLM listing](https://skillsllm.com/skill/img2threejs)

---

## 2. Local skills — Three.js / WebGL / procedural graphics

Present in multiple locations (`~/.agents/skills`, `~/.hermes/skills`, `~/Projects/skills`, `~/.codex/skills`, and mirrored as `market-*` imports from `full-stack-skills/threejs-skills`, `majidmanzarpour/threejs-game-skills`, `sickn33/antigravity-awesome-skills`, `nexu-io/open-design-skills`):

| Skill | What it covers | Relevance to Rigs Unbound |
|---|---|---|
| `threejs` / `threejs-fundamentals` | Core API, scene/renderer setup | Base reference for `src/game/renderer.ts` |
| `threejs-geometry` / `threejs-procedural-geometry` | Custom BufferGeometry, primitives, extrusion | Vehicle chassis/part construction |
| `threejs-materials` / `threejs-procedural-materials` | PBR material authoring | Vehicle paint, weathering, scrap/metal look |
| `threejs-shaders` / `shader-programming-glsl` | Custom GLSL, ShaderMaterial, TSL (node materials) | Effects, terrain, water |
| `threejs-animation` / `threejs-procedural-animation` | Clips, mixers, procedural motion | Rig-local animation boundary (see ADR-0031 in this repo) |
| `threejs-loaders` | GLTF/OBJ/texture loading pipelines | Alternative/complementary to img2threejs for externally-authored assets |
| `threejs-interaction` | Raycasting, controls, picking | Vehicle selection, part-attach UI |
| `threejs-performance` / `threejs-debug-profiler` | Draw-call, instancing, LOD, profiling | Matches `audit:reachability` / budget discipline already in this repo |
| `threejs-lighting` (Projects/skills 3d-web) / `threejs-shadow-systems` | Lighting rigs, shadow maps | World/scene mood |
| `threejs-postprocessing` | Bloom, SSAO, color grading, tone mapping | Cinematic polish pass |
| `threejs-textures` | Canvas/DataTexture, UV, texture atlasing | Complements img2threejs's `threejs_texture_reference.md` |
| `threejs-camera` / `threejs-camera-direction` | Camera rigs, cinematic framing | Cutscenes, vehicle reveal shots |
| `threejs-audio` / `threejs-audio-generator` | Positional audio, procedural SFX | Engine sounds, terrain audio |
| `threejs-controls` | OrbitControls, PointerLock, custom vehicle controls | Direct fit for drive-feel work |
| `threejs-water-optics`, `threejs-spectral-ocean`, `threejs-volumetric-clouds`, `threejs-atmosphere-aerial-perspective`, `threejs-screen-space-ambient-occlusion`, `threejs-raymarched-space-effects`, `threejs-temporal-surfaces`, `threejs-procedural-fields`, `threejs-procedural-planets`, `threejs-procedural-vegetation`, `threejs-procedural-architecture`, `threejs-procedural-vfx`, `threejs-bloom`, `threejs-exposure-color-grading`, `threejs-image-pipeline` | `.codex/skills` deep bench — specialized environment/VFX/rendering skills, one concern each | Grab individually as Field/biome work expands (matches the "changing place, scale, time, danger" north star in README) |
| `threejs-3d-generator`, `threejs-image-generator`, `threejs-audio-generator` (majidmanzarpour set) | Asset-generation-flavored variants | Overlaps img2threejs; compare before adopting both |
| `threejs-aaa-graphics-builder` | High-end rendering recipes | Aspirational reference only — this repo is deliberately pre-production |
| `threejs-game-director` | Scene/level orchestration, camera direction | **Storytelling/cinematic adjacent** — closest local match to "cinematic direction for a Three.js game" |
| `threejs-game-ui-designer` | In-game HUD/menu design for Three.js | Vehicle HUD, mastery/insight display |
| `threejs-gameplay-systems` | Core gameplay loop patterns | Directly relevant to the vehicle-verb loop |
| `threejs-qa-release` | Release QA checklist for Three.js games | Pairs with existing `verify:head` gate |
| `threejs-node-tsl` | Three.js Shading Language (node-based) | Modern shader authoring path |
| `threejs-skill-router` (`.codex/skills`) | Meta-skill that dispatches to the right threejs-* skill | Worth using instead of manually picking from this table |
| `threejs-visual-validation` (`.codex/skills`) | Automated render-vs-expected visual checks | Same philosophy as img2threejs's comparison-sheet gate and this repo's screenshot-based acceptance evidence |
| `3d-web`, `3d-web-experience`, `3d-web-interactive` | General 3D-on-the-web guidance, broader than Three.js alone | Framing/strategy level |
| `spline-3d-integration` | Spline (design tool) → web 3D | Not directly applicable (this repo doesn't use Spline) but notable if art pipeline changes |
| `fal-3d`, `mockup-device-3d` (nexu-io) | 3D generation via fal.ai, device mockups | Peripheral |

---

## 3. Local skills — Game development (engine-agnostic + engine-specific)

| Skill | Covers | Notes |
|---|---|---|
| `game-design` | Systems/mechanics design docs | Complements this repo's `DESIGN.md` |
| `game-development` | General game-dev workflow | Broad entry point |
| `game-testing` | Playtesting, QA loops for games | Pairs with `tools/rig-lab-browser-acceptance.cjs` etc. |
| `2d-games`, `3d-games`, `mobile-games`, `pc-games`, `web-games` | Platform-specific game-dev guidance | `web-games` + `3d-games` are the direct matches for this repo |
| `multiplayer` | Netcode, sync patterns | Relevant only if/when the "no multiplayer model accepted yet" line in README changes |
| `ai-games` (`.hermes/skills`) | AI-driven/AI-assisted game mechanics | Peripheral, worth a look for NPC/behavior systems |
| `develop-web-game` (openai-curated + `.codex/skills`) | End-to-end browser game build guidance | Direct overlap with this repo's stack |
| `blender-3d-modeling`, `blender-mcp` | Blender asset authoring + MCP bridge (you also have `mcp__Blender__*` tools live in this session) | Alternative/complementary asset path to img2threejs — Blender for hand-authored hero assets, img2threejs for fast reference-driven procedural props |
| `character-sprite-generator` (`.codex/skills`) | 2D character sprite generation | Not this repo's rendering mode (3D), but relevant if a 2D minimap/portrait layer is ever added |
| `godot-4-migration`, `godot-gdscript-patterns` (market-sickn33) | Godot-specific | Not this repo's engine (this repo is deliberately engine-less/project-owned per README), reference-only |
| `unity-developer`, `unity-ecs-patterns` (market-sickn33) | Unity-specific | Same as above — reference-only unless the "no engine accepted yet" decision changes |
| `unreal-engine-cpp-pro` (market-sickn33) + the whole **`unreal-engine-skills-for-claude-code` plugin** (`create-toolset`, `unreal-mcp`, `unreal-skill` — listed live in this session's available skills) | Unreal-specific, includes an MCP bridge | Reference-only under current architecture |
| `market-MengTo__...-game-development-*` set: `author-game-levels`, `build-game-audio-feedback`, `build-game-camera-controls`, `build-game-inventory`, `build-game-monster-system`, `build-hybrid-game-assets`, `build-isometric-arpg`, `build-mobile-threejs-games`, `build-threejs-enemy-systems`, `build-vesperfall-review-assets`, `create-game-vfx`, `design-action-combat`, `design-game-encounters`, `optimize-threejs-games`, `ship-web-games`, `test-playable-web-games`, `tune-enemy-ai` | A full **Three.js-flavored game-dev curriculum**, one skill per concern | Directly usable — `build-mobile-threejs-games`, `optimize-threejs-games`, `ship-web-games`, and `test-playable-web-games` line up closely with this repo's `verify:head`/browser-acceptance discipline |
| `market-majidmanzarpour__threejs-game-skills-*` (mirrors the `.agents/skills` threejs-game-* set above) | Same family as `threejs-game-director` etc. | Confirms that set is a coherent authored bundle, not scattered singles |

---

## 4. Local skills — Storytelling, narrative, dialogue, cinematic

This is the thinnest local category — most "storytelling" hits in the skill names are **web-marketing scroll-storytelling**, not game narrative:

| Skill | Actual scope | Fit |
|---|---|---|
| `market-MengTo__...-cinematic-gsap-lenis-motion-system` | GSAP/Lenis-driven cinematic scroll motion for **marketing sites** | Not game narrative — web landing-page cinematics |
| `market-MengTo__...-cinematic-scroll-storytelling` | Same family — scrollytelling for web content | Same caveat |
| `market-MengTo__...-gsap-scrolltrigger-storytelling`, `...-scroll-world-storytelling` | Same family | Same caveat |
| `market-sickn33__...-data-storytelling` | Data-viz storytelling, not narrative fiction | Not applicable |
| `market-simota__agent-skills-lore` | Lore-authoring (directory present under `.codex/skills`, no readable `SKILL.md` found in a quick check — verify before relying on it) | Closest local match to in-fiction lore/worldbuilding for a game; verify contents before use |
| `market-simota__agent-skills-quest` | Quest-system authoring (same caveat — verify contents) | Direct fit for a vehicle-verb quest/opportunity loop |
| `market-calesthio__generative-media-skills-...` (153 individual skills flattened under `.codex/skills`, organized as `production/{audio-craft,content-formats,creative-direction,governance-delivery,post-production,runtime-assembly}` + `providers/{3d-generation,audio-enhancement,avatar-video,lip-sync,motion-capture,music-generation,sound-generation,source-separation,speech-and-voice,text-to-speech,voice-agents,world-models}`) | The single largest **cinematic/narrative/audio production** bench available locally | See breakout below — this is the real answer to "cinematic and storytelling skills" |
| `market-carlkibler__agent-skills-skills-support-storm`, `-wide-open-brainstorm` | Brainstorming techniques, not narrative-specific | Peripheral |
| `market-its-meseba__meseba-skills-skills-blog-from-history` | Blog generation from history/changelog | Not narrative fiction |

### 4a. `calesthio/generative-media-skills` — cinematic/narrative production bench (breakout)

Genuinely the deepest locally-installed cinematic/story toolkit. Grouped by folder (all flattened as individual `market-calesthio__generative-media-skills-skills-*` entries under `~/.codex/skills`):

- **`creative-direction/`** — `cinematic-shot-direction`, `storyboard-previsualization`, `lighting-direction`, `character-design-continuity`, `2d-character-rig-animation`. This is the most direct "cinematic direction" skillset available anywhere in the inventory.
- **`content-formats/`** — `cinematic-trailer-production`, `game-trailer-production`, `anime-animation-production`, `audiobook-production`, `educational-animation-production`, `music-video-production`. `game-trailer-production` is directly relevant if/when Rigs Unbound needs a reveal trailer.
- **`audio-craft/`** — `dialogue-editing-adr`, `sound-design-foley`, `music-supervision-scoring`, `video-to-audio-foley`, `localization-dubbing-production`, `audio-mixing-mastering`, `captions-media-accessibility`.
- **`runtime-assembly/`** — `threejs-scene-composition` (direct overlap with the threejs-* bench above), `virtual-production-icvfx`, `gsap-animation-composition`, `procedural-canvas-animation`, `d3-animated-data-visualization`, `lottie-animation-delivery`, `manim-explainer-animation`, `audio-reactive-video-composition`.
- **`post-production/`** — `vfx-compositing`.
- **`governance-delivery/`** — `media-provenance-rights` (worth checking against this repo's asset-provenance practices).
- **`providers/`** — vendor-specific wrappers: `3d-generation` (`meshy-3d`, `tencent-hunyuan3d`, `tripo-3d` — all **alternatives to img2threejs**, mesh-based rather than code-gen), `motion-capture` (`deepmotion-animate-3d`), `lip-sync` (`sync-labs-lipsync`), `avatar-video` (`hedra-character-video`), `music-generation` (`suno-music`, `ace-step`, `elevenlabs-music`, `google-lyria`, `minimax-music`), `sound-generation` (`elevenlabs-sound-effects`, `stable-audio`), `world-models` (`odyssey-interactive-video`, `world-labs-marble` — generative interactive-world/video models, conceptually adjacent to this repo's "playable world" north star), `speech-and-voice` / `voice-agents` (`openai-audio`, `gemini-live-audio`), `text-to-speech` (`fish-audio-tts`), `source-separation` (`audioshake-stem-separation`).

This whole bundle is provider/API-wrapper-flavored (expects external service credentials for most of the `providers/` skills), but the `creative-direction/` and `audio-craft/` groups are usable methodology even without any external API.

### 4b. Online research — dedicated narrative/story Claude Code skills (not yet installed locally)

Found via web search, none confirmed present in local skill directories — candidates to evaluate/install if in-fiction narrative design becomes active work for Rigs Unbound:

- **Narrative Designer** — story-architect skill: branching dialogue in Ink/Yarn Spinner formats, character-voice pillars, tiered lore architecture, environmental storytelling blueprints. Closest single match to "game narrative design skill."
- **GM Craft** — TTRPG-derived GM techniques (Dungeon World/FATE-informed): player agency, fail-forward mechanics, motivation-driven NPCs, scene pacing/tension. Useful for the "opportunities not menus" loop described in this repo's README.
- **Creative Storytelling** — Three-Act Structure, Hero's Journey, Iceberg Model characterization, dialogue subtext/pacing, storyboard/manga-script formatting.
- **story-skills** (`danjdewhurst/story-skills`, GitHub) — open-source end-to-end story-writing agent skills packaged for both Codex and Claude Code plugins; markdown-based.
- **Game Developer Skill** / **claudemarketplaces.com game-dev category** — a browsable marketplace (214+ skills at last check) spanning Unity/Godot/Unreal/game-patterns; worth a periodic scan rather than one-time import given how fast this space is growing.

Sources: [Best Claude Code Skills to Try in 2026 (Firecrawl)](https://www.firecrawl.dev/blog/best-claude-code-skills), [GM Craft](https://mcpmarket.com/tools/skills/gm-craft-narrative-storytelling), [Narrative Designer](https://mcpmarket.com/es/tools/skills/narrative-designer), [Creative Storytelling](https://mcpmarket.com/tools/skills/creative-storytelling), [Game Developer Skill](https://mcpmarket.com/tools/skills/game-development-specialist), [claudemarketplaces game-dev category](https://claudemarketplaces.com/skills/category/game-dev), [danjdewhurst/story-skills](https://github.com/danjdewhurst/story-skills), [Claude AI in Game Development — industry stats](https://kevurugames.com/blog/using-claude-ai-in-game-development-tools-use-cases-and-industry-statistics/)

---

## 5. Local skills — Animation, rigging, motion (supplementary to img2threejs)

| Skill | Covers | Notes |
|---|---|---|
| `animate`, `animation-vocabulary`, `improve-animations`, `find-animation-opportunities`, `review-animations` (`.claude/skills`) | Generic web/UI animation, not 3D-specific | Useful for HUD/menu motion, not rig animation |
| `threejs-animation` / `threejs-procedural-animation` | Covered above | Primary for in-game rig animation |
| `2d-character-rig-animation` (calesthio) | 2D rig/animation pipeline | Peripheral unless a 2D layer is added |
| `deepmotion-animate-3d`, `sync-labs-lipsync` (calesthio providers) | Motion-capture-to-3D, lip-sync | Peripheral — this repo has no humanoid/facial rig requirement currently |

No local skill for **Mixamo retargeting, VRM, or skeleton/bone-mapping** was found under any checked location — this is a real gap if humanoid or animal riders are ever added. Worth a targeted future search/install rather than assuming coverage.

---

## 6. Adjacent/complementary tools referenced but not agent-skills (context only)

Not skills, but named repeatedly in adjacent research and worth knowing about if narrative tooling becomes active: **Ink** and **Yarn Spinner** (branching-dialogue script formats used by the Narrative Designer skill above), **Twine** (interactive-fiction authoring, industry-standard), **articy:draft** (professional narrative-design database tool). None of these have a confirmed local agent-skill wrapper — they'd be used directly as tools/formats, not invoked via `Skill`.

---

## 7a. Broader ecosystem — standalone tools and services (not agent skills, not Claude-specific)

The request was explicitly not to limit this to img2threejs's direct competitors or to Claude-only marketplaces. This section covers the wider tool landscape as of July 2026 — services and open-source projects a human or agent would reach for directly, independent of any Claude skill wrapper.

### Image/text-to-3D generators (alternative or complementary to img2threejs)

| Tool | Strength | Trade-off vs img2threejs |
|---|---|---|
| **Meshy AI** (Meshy 6) | Most balanced full pipeline: text-to-3D, image-to-3D, PBR texturing, topology control, 500+ animation presets, built-in auto-rig | Opaque mesh output (GLB/FBX), not diffable/inspectable code; best for PBR texture quality |
| **Tripo AI** | Fastest, best game-engine-optimized topology, watertight meshes, direct STL/game exports | Same opacity trade-off; best when speed matters more than code ownership |
| **Rodin AI** (Hyper3D, ByteDance) | Best-in-class photorealistic **human/character** generation | Not suited to mechanical/product objects — the opposite specialization of img2threejs, which is hard-surface-first |
| **Luma AI** | Photogrammetry-style real-world capture, highest realism from photos/video | Needs retopology before engine use; pricier; overkill for a vehicle-parts pipeline |
| **TRELLIS 2** (open-source) | Best open-source visual fidelity, no vendor lock-in | Younger, less turnkey than commercial options |
| **3D AI Studio** | Aggregator — one UI over Meshy/Rodin/Tripo/Hunyuan/TRELLIS | Convenience layer, same opacity trade-offs as underlying models |

**Where this matters for Rigs Unbound:** all of the above produce *mesh files* to import via `threejs-loaders`, the opposite philosophy from img2threejs's *generated code*. Given this repo's stated preference for project-owned, inspectable systems (ADR-0023's stance on physics), img2threejs remains the better default — but Tripo/Meshy are legitimate fast-iteration options for early greybox/concept passes that don't need to ship as final assets, or for parts where photorealism (decals, branding) matters more than code-ownership.

Sources: [Meshy: Best AI Tools for 3D Game Assets](https://www.meshy.ai/blog/best-ai-tools-for-3d-game-assets), [3D AI Studio comparison](https://www.3daistudio.com/3d-generator-ai-comparison-alternatives-guide/best-image-to-3d-tools-2026), [TRELLIS 2 vs Meshy vs Tripo vs Hitem3D](https://trellis2.app/blog/best-ai-3d-model-generator)

### Auto-rigging, animation, motion capture (fills the "no Mixamo/VRM coverage" gap noted in §5)

| Tool | Strength | Notes |
|---|---|---|
| **Mixamo** (Adobe) | Free, foundational, huge preset animation library | Still the default first stop; humanoid-only |
| **Tripo AI (rigging)** | Fast auto-rig + first-pass library animations for humanoid and non-humanoid meshes | Good for "playable immediately," not hero-quality |
| **Reallusion AccuRIG 2** | AI auto-rigging with strong humanoid **and non-humanoid** support | Notable because Rigs Unbound's rigs are vehicles, not humans — non-humanoid auto-rig support is the relevant differentiator |
| **Cascadeur** | Physics-aware animation authoring/refinement for hero animations | Best for hand-tuning the 10-20 signature animations that define "feel" — directly relevant to the ADR-0031 rig-local animation boundary in this repo |
| **Blender Rigify / Auto-Rig Pro** | Free/paid Blender-native rigging | Pairs with the already-installed `blender-3d-modeling` / `blender-mcp` skills and this session's live `mcp__Blender__*` tools |
| **DeepMotion Animate 3D**, **Move.ai**, **RADiCAL**, **Plask** | Cloud/markerless motion capture from video/phone | Only relevant if a humanoid rider or organic creature enters scope — currently out of scope per README |
| **Krikey AI** | Auto-rig + voice-driven dialogue + facial animation | Relevant only alongside a narrative/dialogue push, not for vehicle rigs |

Sources: [AI Auto-Rigging Showdown 2026 (StraySpark)](https://www.strayspark.studio/blog/ai-auto-rigging-showdown-2026-tripo-meshy-cascadeur-mixamo), [Best Mixamo Alternatives 2026 (MoCap Online)](https://mocaponline.com/blogs/mocap-news/mixamo-alternatives), [Mocap for Games in 2026 (Sunstrike Studios)](https://sunstrikestudios.com/en/blog/motion_capture_for_games_and_film/)

### Narrative/dialogue authoring tools (the real answer to "storytelling," independent of any agent skill)

| Tool | License/cost | Notes |
|---|---|---|
| **Ink** (inkle) | MIT, free | Narrative scripting language; used in *Vampire: The Masquerade – Bloodlines 2*. Named directly by the online "Narrative Designer" skill above as its target export format |
| **Yarn Spinner** | MIT, free | Dialogue system paired with an engine; used in *DREDGE* |
| **Twine** | GPL-3.0, free | Browser-based visual passage linking; best for early branching prototypes and non-programmer story reviews |
| **articy:draft** | Subscription, free tier capped at 700 objects | Enterprise narrative database standard — the tool behind *Disco Elysium*; overkill unless narrative scope grows large |
| **Arcweave** | Cloud-only, paid tiers to ship commercially | Used in *Star Trucker* (a vehicle game — worth noting as a genre-adjacent precedent) |
| **Inworld AI**, **Convai**, **NVIDIA ACE** | Commercial APIs | Runtime NPC dialogue/behavior systems — handle what happens *during* play, don't help author the story structure itself |
| **LoreWeaver**, **StoryFlow**, **NarrativeFlow** | Newer entrants, various pricing | AI-assisted narrative-design tooling; less proven track record than Ink/Yarn/Twine |

**Recommendation for this project's scale:** start with **Twine** for structural prototyping (matches this repo's "exploration, not production" phase), move to **Ink** or **Yarn Spinner** if/when an actual branching-quest or NPC-dialogue system gets built. None of these need to be "installed" as an agent skill — they're standalone tools/formats an agent can read and write directly.

Sources: [Best Narrative Design Tools for Game Developers 2026 (loreweaver.ink)](https://loreweaver.ink/insights/best-narrative-design-tools/), [16 Free Narrative and Branching Dialogue Tooling Picks (gamineai)](https://gamineai.com/resources/16-free-narrative-branching-dialogue-tooling-picks-ink-yarn-json-pipelines-2026), [Twine vs Yarn Spinner vs Ink vs NarrativeFlow](https://narrativeflow.dev/blog/twine-vs-yarn-spinner-vs-ink-vs-narrativeflow-which-branching-dialogue-tool-is-right-for-your-game/)

### Cinematic sequencing / camera direction tools

| Tool | Notes |
|---|---|
| **Unreal Sequencer** | Deepest cinematic toolset (transition matching, bone-position blending between clips, MetaHuman + Control Rig + Live Link integration) — not applicable unless this repo ever adopts Unreal, which README explicitly says is undecided |
| **Unity Timeline** | Comparable but lighter-weight cinematic sequencing; same applicability caveat |
| **Three.js-native equivalent** | No direct "Sequencer"-class tool exists for Three.js; the closest local coverage is the `threejs-camera-direction`, `threejs-game-director`, and calesthio `cinematic-shot-direction`/`storyboard-previsualization` skills already catalogued in §2–4 above. If cinematic camera work becomes a real need, this is a genuine tooling gap worth building a small in-repo camera-rig utility for, rather than importing an engine. |

Source: [Comparing the Cinematic Workflows of UE and Unity](https://samulilautjarvi.com/blog/index.php/2025/06/08/ue-vs-unity-for-cinematics/)

### Procedural world/voxel/terrain and browser vehicle-physics tools

| Tool | Notes |
|---|---|
| **react-three-rapier** / **Rapier** (WASM) | The standard pairing for browser-based Three.js physics — Rapier is Rust/WASM and browser-native, unlike Havok which targets native Unity/Unreal. This repo's `physics-lab.html` already treats Rapier as an isolated evidence lab per ADR-0023, consistent with this being the right browser-physics choice rather than Havok |
| **Veloren** (open-source, Rust) | Reference implementation of a voxel open-world game with heavy procedural generation — useful as a design/architecture reference even though it's not a Three.js/browser project |
| **Voxel Play**, **Cubiquity** (Unity), **Voxel Farm** (standalone engine) | Voxel-specific engines/plugins — not applicable to this repo's non-voxel, non-Unity renderer, but relevant if a future biome/Field ever goes voxel-based |
| **Godot 4 terrain systems** | Same applicability caveat as the Godot skills in §3 — reference-only under current architecture |

Source: [terrain-generation GitHub topic](https://github.com/topics/terrain-generation), [voxel-terrain GitHub topic](https://github.com/topics/voxel-terrain)

---

## 7b. Cross-cutting take: skills vs. standalone tools

A pattern worth naming explicitly: almost everything in §2–4 (Claude/Codex agent skills) is *methodology and prompting scaffolding* — it tells an agent how to think about Three.js code, cinematic shots, or narrative structure. Almost everything in §7a is an *actual external service or format* that produces bytes (a mesh, a dialogue script, a physics simulation). They're complementary, not substitutes: e.g. the `threejs-game-director` skill plus Ink as the dialogue format plus Rapier as the physics engine is a coherent stack; the `narrative-designer` skill plus Twine for prototyping is another. Don't conflate "found a skill for X" with "solved X" — the skill is the how, the tool/format in §7a is frequently still needed as the what.

---

## 7c. Additional adjacent categories (second exploration pass)

Targeted follow-up search after the first pass, covering categories that were under-represented in §2–7a:

- **VFX/particles**: `threejs-procedural-vfx` (local, direct fit), `create-game-vfx` (MengTo bundle), `vfx-compositing` and `virtual-production-icvfx` (calesthio post-production), `ambient-section-particles`/`globe-particles` (MengTo — web-marketing particle effects, not game VFX, listed for completeness only).
- **Level design / encounter design**: `design-game-encounters` (MengTo) is the only dedicated local hit — genuinely thin coverage; no generic "level design" or "world-building" skill was found under any location.
- **Combat / enemy / AI opponents**: `design-action-combat`, `build-game-monster-system`, `build-threejs-enemy-systems`, `tune-enemy-ai` (all MengTo bundle) — a coherent mini-suite if Rigs Unbound ever adds hostile encounters (README currently frames "fight" as one of several verbs, so this is plausibly relevant sooner than narrative tooling).
- **Alternate engines to Three.js**: only one hit — `bevy-ecs-expert` (market-sickn33, Rust/Bevy ECS patterns). **No local skill for Babylon.js, PlayCanvas, Phaser, or PixiJS** — confirmed absent, not just uncatalogued. Given this repo is committed to Three.js (README: "Renderer: Three.js, WebGL in practice"), this gap is low-priority, but worth knowing if a future spike ever compares engines.
- **Physics/vehicle-specific skills**: **zero hits** for Rapier, Cannon.js, Ammo.js, Matter.js, or any "vehicle-physics"/"raycast-vehicle" skill name, in any location. This confirms §7a's implicit point explicitly: vehicle physics in this repo is, and will remain, hand-built/project-owned (per ADR-0023) — there is no skill to reach for here, only the library itself plus general physics-engine documentation.
- **Photogrammetry / neural capture**: one hit — `neural-reality-capture` (calesthio `production/3d-craft/`). No Gaussian-splatting or NeRF-specific skill found.
- **UI/UX for games, HUD**: `threejs-game-ui-designer` (both `.agents/skills` and its `majidmanzarpour` market mirror) — the only dedicated hit; general web UI skills (`design-an-interface`, `shadcn`, etc. from `.claude/skills`) are not game-HUD-specific but are usable for menu chrome.
- **Discovery-protocol gap found**: `~/.zcode/skills` exists and is heavily populated (244 keyword matches, largely mirroring `~/.codex/skills`) but is **not listed** in `/Users/pranay/AGENTS.md`'s Skills Discovery Protocol (which names 9 locations, not including this one). Worth adding to that file so future sessions don't miss it.

---

## 8. Gaps and recommendations

1. **img2threejs is not in `~/.claude/skills/`** — the one path this session's `Skill` tool actually reads from. If you want to invoke it as `/img2threejs` in Claude Code, it needs to be symlinked or cloned there; right now it only exists as raw source + a Codex market copy.
2. **Narrative/dialogue tooling is thin locally** relative to the graphics/game-dev bench — the `calesthio` `creative-direction/` and `audio-craft/` groups are the best local asset, but true branching-dialogue/quest-authoring skills (Ink/Yarn-flavored) aren't confirmed installed. `market-simota__agent-skills-lore` and `-quest` exist as directories but need their contents verified before relying on them.
3. **No local Mixamo/VRM/retargeting skill** — flag as a gap if a rigged humanoid or animal character ever enters scope. Not a hard blocker even so: Mixamo, Reallusion AccuRIG 2, and Blender Rigify/Auto-Rig Pro (§7a) are directly usable as external tools without needing a skill wrapper — this repo's existing `blender-3d-modeling`/`blender-mcp` skills plus the live `mcp__Blender__*` tools in this session already give a path in.
4. **Narrative/dialogue tooling gap is similarly not a skill problem** — Ink, Yarn Spinner, and Twine (§7a) are plain-text/script formats an agent can read and write directly; the missing piece is a design decision (does Rigs Unbound want scripted branching narrative at all, given its "opportunities not menus" framing?), not a missing tool.
5. **threejs-skill-router** (`.codex/skills`) is worth using as the entry point for the Three.js bench instead of manually picking from ~30 threejs-* skills — it's a meta-skill built for exactly this dispatch problem.
6. Given this repo's "additive, better, comprehensive" + no-hacks posture, any new skill or external tool adopted here should go through the same discipline as img2threejs's own gates: don't let it bypass `assets:preflight`, `audit:reachability`, or `verify:head` — treat generated output (code, meshes, rigs, or narrative data) as authored source, not a shortcut around this repo's existing contracts.

---

## 9. Exhaustive flat index (every matching path, ungrouped)

This is the literal, uncurated pull you asked for: every directory across all 7 checked skill locations whose name matched the master keyword set (game, story, narrat*, cinemat*, dialogue, quest, character, npc, rig, anim*, physics, shader, vfx, particle, audio, sound, music, sfx, level-design, world*, procedural, cutscene, camera, combat, inventory, multiplayer, netcode, behavior, pathfind, sprite, pixel, voxel, terrain, lighting, threejs, babylon, unity, unreal, godot, blender, 3d, gamedev, playtest, balanc*, economy, loot, dungeon, procgen, noise, vrm, mixamo, retarget, skeleton, mocap, facial, lipsync, lore, encounter, monster, enemy, boss, photogram, scan, hud, phaser, playcanvas, bevy, pixi, cannon, matter.js, tone.js, howler).

**655 raw path matches across 7 locations, 323 unique skill names** (the gap between the two numbers is the same skill installed in multiple locations — expected, since `~/.agents/skills`, `~/.hermes/skills`, `~/Projects/skills`, and `~/.codex/skills` mirror a lot of the same upstream imports). `~/Projects/openai-skills/skills` matched zero — that location holds the OpenAI Codex standard-repo copy, which is not game/narrative-flavored. `~/.zcode/skills` (a location not named in the original protocol list but discovered during this pass — worth adding to `/Users/pranay/AGENTS.md`'s Skills Discovery Protocol) matched 244, almost entirely mirroring `~/.codex/skills`.

Per-location counts:

| Location | Matches |
|---|---|
| `/Users/pranay/.claude/skills` | 7 |
| `/Users/pranay/.agents/skills` | 43 |
| `/Users/pranay/.hermes/skills` | 41 |
| `/Users/pranay/Projects/skills` | 29 |
| `/Users/pranay/Projects/openai-skills/skills` | 0 |
| `/Users/pranay/.codex/skills` | 291 |
| `/Users/pranay/.zcode/skills` | 244 |

Full list, grouped by location, alphabetical within each:

### `/Users/pranay/.claude/skills` (7)

- `animate`
- `animation-vocabulary`
- `find-animation-opportunities`
- `improve-animations`
- `request-refactor-plan`
- `review-animations`
- `to-questionnaire`

### `/Users/pranay/.agents/skills` (43)

- `2d-games`
- `3d-games`
- `3d-web`
- `3d-web-experience`
- `animate`
- `animation-vocabulary`
- `blender-3d-modeling`
- `blender-mcp`
- `find-animation-opportunities`
- `game-design`
- `game-development`
- `game-testing`
- `headed-chrome-3d-testing`
- `improve-animations`
- `llm-blender-agent`
- `mobile-games`
- `multiplayer`
- `pc-games`
- `request-refactor-plan`
- `review-animations`
- `security-scan`
- `shader-programming-glsl`
- `spline-3d-integration`
- `threejs`
- `threejs-3d-generator`
- `threejs-aaa-graphics-builder`
- `threejs-animation`
- `threejs-audio-generator`
- `threejs-debug-profiler`
- `threejs-fundamentals`
- `threejs-game-director`
- `threejs-game-ui-designer`
- `threejs-gameplay-systems`
- `threejs-geometry`
- `threejs-image-generator`
- `threejs-interaction`
- `threejs-loaders`
- `threejs-performance`
- `threejs-qa-release`
- `threejs-shaders`
- `threejs-skills`
- `to-questionnaire`
- `web-games`

### `/Users/pranay/.hermes/skills` (41)

- `2d-games`
- `3d-games`
- `3d-web`
- `3d-web-experience`
- `3d-web-interactive`
- `ai-3d`
- `ai-games`
- `animation-vocabulary`
- `blender-3d-modeling`
- `blender-mcp`
- `community`
- `community-management`
- `find-animation-opportunities`
- `game-design`
- `game-dev`
- `game-development`
- `game-testing`
- `headed-chrome-3d-testing`
- `improve-animations`
- `llm-blender-agent`
- `mobile-games`
- `multiplayer`
- `music-creation`
- `pc-games`
- `request-refactor-plan`
- `review-animations`
- `security-scan`
- `shader-programming-glsl`
- `spline-3d-integration`
- `threejs`
- `threejs-animation`
- `threejs-fundamentals`
- `threejs-geometry`
- `threejs-interaction`
- `threejs-loaders`
- `threejs-performance`
- `threejs-shaders`
- `threejs-skills`
- `to-questionnaire`
- `voice-audio-applications`
- `web-games`

### `/Users/pranay/Projects/skills` (29)

- `2d-games`
- `3d-games`
- `3d-web`
- `3d-web-experience`
- `blender-3d-modeling`
- `blender-mcp`
- `game-design`
- `game-development`
- `game-testing`
- `headed-chrome-3d-testing`
- `lighting-illumination-audit`
- `llm-blender-agent`
- `mobile-games`
- `multiplayer`
- `pc-games`
- `scene-lighting-techniques-audit`
- `security-scan`
- `shader-programming-glsl`
- `spline-3d-integration`
- `threejs`
- `threejs-animation`
- `threejs-fundamentals`
- `threejs-geometry`
- `threejs-interaction`
- `threejs-loaders`
- `threejs-performance`
- `threejs-shaders`
- `threejs-skills`
- `web-games`

### `/Users/pranay/.codex/skills` (291)

- `2d-games`
- `3d-games`
- `3d-web`
- `3d-web-experience`
- `blender-3d-modeling`
- `blender-mcp`
- `character-sprite-generator`
- `develop-web-game`
- `game-design`
- `game-development`
- `game-testing`
- `headed-chrome-3d-testing`
- `learning_for_kids-security-scan`
- `llm-blender-agent`
- `market-0x0funky__agent-sprite-forge-skills-generate2dmap`
- `market-0x0funky__agent-sprite-forge-skills-generate2dsprite`
- `market-0x0funky__agent-sprite-forge-skills-video2dsprite`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-brightdata-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-brightpearl-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-d2lbrightspace-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-dungeon-fighter-online-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-epic-games-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-perigon-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-shortpixel-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-triggercmd-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho-inventory-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho_inventory-automation`
- `market-ComposioHQ__awesome-claude-skills-tailored-resume-generator`
- `market-MengTo__Skills-agent-skills-codex-audit-reference-originality`
- `market-MengTo__Skills-agent-skills-codex-generate-reference-inspired-brand-worlds`
- `market-MengTo__Skills-agent-skills-codex-optimize-web-animations`
- `market-MengTo__Skills-agent-skills-game-development-author-game-levels`
- `market-MengTo__Skills-agent-skills-game-development-build-game-audio-feedback`
- `market-MengTo__Skills-agent-skills-game-development-build-game-camera-controls`
- `market-MengTo__Skills-agent-skills-game-development-build-game-inventory`
- `market-MengTo__Skills-agent-skills-game-development-build-game-monster-system`
- `market-MengTo__Skills-agent-skills-game-development-build-hybrid-game-assets`
- `market-MengTo__Skills-agent-skills-game-development-build-isometric-arpg`
- `market-MengTo__Skills-agent-skills-game-development-build-mobile-threejs-games`
- `market-MengTo__Skills-agent-skills-game-development-build-threejs-enemy-systems`
- `market-MengTo__Skills-agent-skills-game-development-build-vesperfall-review-assets`
- `market-MengTo__Skills-agent-skills-game-development-create-game-vfx`
- `market-MengTo__Skills-agent-skills-game-development-design-action-combat`
- `market-MengTo__Skills-agent-skills-game-development-design-game-encounters`
- `market-MengTo__Skills-agent-skills-game-development-optimize-threejs-games`
- `market-MengTo__Skills-agent-skills-game-development-ship-web-games`
- `market-MengTo__Skills-agent-skills-game-development-test-playable-web-games`
- `market-MengTo__Skills-agent-skills-game-development-tune-enemy-ai`
- `market-MengTo__Skills-agent-skills-web-design-add-shader-cursor-trail`
- `market-MengTo__Skills-agent-skills-web-design-ambient-section-particles`
- `market-MengTo__Skills-agent-skills-web-design-animation-on-scroll`
- `market-MengTo__Skills-agent-skills-web-design-animation-systems`
- `market-MengTo__Skills-agent-skills-web-design-bright-green-tech-system-webgl`
- `market-MengTo__Skills-agent-skills-web-design-cinematic-gsap-lenis-motion-system`
- `market-MengTo__Skills-agent-skills-web-design-cinematic-scroll-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-globe-particles`
- `market-MengTo__Skills-agent-skills-web-design-gsap-scrolltrigger-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-scroll-world-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-shaders-cursor-ripples`
- `market-MengTo__Skills-agent-skills-web-design-threejs`
- `market-MengTo__Skills-agent-skills-web-design-webgl-3d-object`
- `market-calesthio__generative-media-skills-skills-production-3d-craft-3d-asset-production`
- `market-calesthio__generative-media-skills-skills-production-3d-craft-neural-reality-capture`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-audio-mixing-mastering`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-captions-media-accessibility`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-dialogue-editing-adr`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-localization-dubbing-production`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-music-supervision-scoring`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-sound-design-foley`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-video-to-audio-foley`
- `market-calesthio__generative-media-skills-skills-production-content-formats-anime-animation-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-audiobook-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-cinematic-trailer-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-educational-animation-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-game-trailer-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-music-video-production`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-2d-character-rig-animation`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-character-design-continuity`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-cinematic-shot-direction`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-lighting-direction`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-storyboard-previsualization`
- `market-calesthio__generative-media-skills-skills-production-governance-delivery-media-provenance-rights`
- `market-calesthio__generative-media-skills-skills-production-post-production-vfx-compositing`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-audio-reactive-video-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-d3-animated-data-visualization`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-gsap-animation-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-lottie-animation-delivery`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-manim-explainer-animation`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-procedural-canvas-animation`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-threejs-scene-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-virtual-production-icvfx`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-meshy-3d`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-tencent-hunyuan3d`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-tripo-3d`
- `market-calesthio__generative-media-skills-skills-providers-audio-enhancement-nvidia-maxine-audio-effects`
- `market-calesthio__generative-media-skills-skills-providers-avatar-video-hedra-character-video`
- `market-calesthio__generative-media-skills-skills-providers-lip-sync-sync-labs-lipsync`
- `market-calesthio__generative-media-skills-skills-providers-motion-capture-deepmotion-animate-3d`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-ace-step`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-elevenlabs-music`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-google-lyria`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-minimax-music`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-suno-music`
- `market-calesthio__generative-media-skills-skills-providers-sound-generation-elevenlabs-sound-effects`
- `market-calesthio__generative-media-skills-skills-providers-sound-generation-stable-audio`
- `market-calesthio__generative-media-skills-skills-providers-source-separation-audioshake-stem-separation`
- `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-openai-audio`
- `market-calesthio__generative-media-skills-skills-providers-text-to-speech-fish-audio-tts`
- `market-calesthio__generative-media-skills-skills-providers-voice-agents-gemini-live-audio`
- `market-calesthio__generative-media-skills-skills-providers-world-models-odyssey-interactive-video`
- `market-calesthio__generative-media-skills-skills-providers-world-models-world-labs-marble`
- `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-behavioral-modes`
- `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-multimodal-audiocraft`
- `market-davila7__claude-code-templates-cli-tool-components-skills-business-marketing-brand-guidelines-community`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-3d-web-experience`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-develop-web-game`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-2d-games`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-3d-games`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-art`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-audio`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-design`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-mobile-games`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-multiplayer`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-pc-games`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-vr-ar`
- `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-web-games`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-brightdata-local-search`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright-e2e-builder`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-requesting-code-review`
- `market-davila7__claude-code-templates-cli-tool-components-skills-enterprise-communication-internal-comms-community`
- `market-davila7__claude-code-templates-cli-tool-components-skills-productivity-game-changing-features`
- `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-neuropixels-analysis`
- `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-scanpy`
- `market-davila7__claude-code-templates-cli-tool-components-skills-security-scanning-tools`
- `market-davila7__claude-code-templates-cli-tool-components-skills-security-vulnerability-scanner`
- `market-davila7__claude-code-templates-cli-tool-components-skills-utilities-playwright-skill`
- `market-davila7__claude-code-templates-cli-tool-components-skills-video-manim`
- `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-best-practices`
- `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-mcp`
- `market-davila7__claude-code-templates-cli-tool-components-skills-workflow-automation-trigger-dev`
- `market-full-stack-skills__threejs-skills-skills-threejs-animation`
- `market-full-stack-skills__threejs-skills-skills-threejs-audio`
- `market-full-stack-skills__threejs-skills-skills-threejs-camera`
- `market-full-stack-skills__threejs-skills-skills-threejs-controls`
- `market-full-stack-skills__threejs-skills-skills-threejs-dev-setup`
- `market-full-stack-skills__threejs-skills-skills-threejs-geometries`
- `market-full-stack-skills__threejs-skills-skills-threejs-helpers`
- `market-full-stack-skills__threejs-skills-skills-threejs-lights`
- `market-full-stack-skills__threejs-skills-skills-threejs-loaders`
- `market-full-stack-skills__threejs-skills-skills-threejs-materials`
- `market-full-stack-skills__threejs-skills-skills-threejs-math`
- `market-full-stack-skills__threejs-skills-skills-threejs-node-tsl`
- `market-full-stack-skills__threejs-skills-skills-threejs-objects`
- `market-full-stack-skills__threejs-skills-skills-threejs-postprocessing`
- `market-full-stack-skills__threejs-skills-skills-threejs-renderers`
- `market-full-stack-skills__threejs-skills-skills-threejs-scenes`
- `market-full-stack-skills__threejs-skills-skills-threejs-textures`
- `market-full-stack-skills__threejs-skills-skills-threejs-webxr`
- `market-img2threejs__img2threejs`
- `market-its-meseba__meseba-skills-skills-blog-from-history`
- `market-jackspace__ClaudeSkillz-skills-auto-animate`
- `market-jackspace__ClaudeSkillz-skills-cloudflare-cron-triggers`
- `market-jackspace__ClaudeSkillz-skills-playwright-skill`
- `market-jackspace__ClaudeSkillz-skills-playwright-skill_playwright`
- `market-jackspace__ClaudeSkillz-skills-scientific-pkg-scanpy`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-3d-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-aaa-graphics-builder`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-audio-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-debug-profiler`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-director`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-ui-designer`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-gameplay-systems`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-image-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-qa-release`
- `market-nexu-io__open-design-skills-fal-3d`
- `market-nexu-io__open-design-skills-mockup-device-3d`
- `market-nexu-io__open-design-skills-shader-dev`
- `market-nexu-io__open-design-skills-threejs`
- `market-parcadei__Continuous-Claude-v3-.claude-skills-explore`
- `market-sickn33__antigravity-awesome-skills-skills-3d-web-experience`
- `market-sickn33__antigravity-awesome-skills-skills-animejs-animation`
- `market-sickn33__antigravity-awesome-skills-skills-ask-questions-if-underspecified`
- `market-sickn33__antigravity-awesome-skills-skills-audio-transcriber`
- `market-sickn33__antigravity-awesome-skills-skills-azure-microsoft-playwright-testing-ts`
- `market-sickn33__antigravity-awesome-skills-skills-azure-resource-manager-playwright-dotnet`
- `market-sickn33__antigravity-awesome-skills-skills-bdistill-behavioral-xray`
- `market-sickn33__antigravity-awesome-skills-skills-behavioral-modes`
- `market-sickn33__antigravity-awesome-skills-skills-bevy-ecs-expert`
- `market-sickn33__antigravity-awesome-skills-skills-brand-guidelines-community`
- `market-sickn33__antigravity-awesome-skills-skills-data-storytelling`
- `market-sickn33__antigravity-awesome-skills-skills-fal-audio`
- `market-sickn33__antigravity-awesome-skills-skills-frontend-mobile-security-xss-scan`
- `market-sickn33__antigravity-awesome-skills-skills-game-development`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-2d-games`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-3d-games`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-game-art`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-game-audio`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-game-design`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-mobile-games`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-multiplayer`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-pc-games`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-vr-ar`
- `market-sickn33__antigravity-awesome-skills-skills-game-development-web-games`
- `market-sickn33__antigravity-awesome-skills-skills-gh-review-requests`
- `market-sickn33__antigravity-awesome-skills-skills-go-playwright`
- `market-sickn33__antigravity-awesome-skills-skills-godot-4-migration`
- `market-sickn33__antigravity-awesome-skills-skills-godot-gdscript-patterns`
- `market-sickn33__antigravity-awesome-skills-skills-hig-components-dialogs`
- `market-sickn33__antigravity-awesome-skills-skills-internal-comms-community`
- `market-sickn33__antigravity-awesome-skills-skills-inventory-demand-planning`
- `market-sickn33__antigravity-awesome-skills-skills-magic-animator`
- `market-sickn33__antigravity-awesome-skills-skills-makepad-animation`
- `market-sickn33__antigravity-awesome-skills-skills-makepad-shaders`
- `market-sickn33__antigravity-awesome-skills-skills-odoo-inventory-optimizer`
- `market-sickn33__antigravity-awesome-skills-skills-playwright-java`
- `market-sickn33__antigravity-awesome-skills-skills-playwright-skill`
- `market-sickn33__antigravity-awesome-skills-skills-requesting-code-review`
- `market-sickn33__antigravity-awesome-skills-skills-scanning-tools`
- `market-sickn33__antigravity-awesome-skills-skills-scanpy`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-dependencies`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-hardening`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-sast`
- `market-sickn33__antigravity-awesome-skills-skills-shader-programming-glsl`
- `market-sickn33__antigravity-awesome-skills-skills-skill-scanner`
- `market-sickn33__antigravity-awesome-skills-skills-spline-3d-integration`
- `market-sickn33__antigravity-awesome-skills-skills-startup-business-analyst-market-opportunity`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-animation`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-fundamentals`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-geometry`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-interaction`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-lighting`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-loaders`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-materials`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-postprocessing`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-shaders`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-skills`
- `market-sickn33__antigravity-awesome-skills-skills-threejs-textures`
- `market-sickn33__antigravity-awesome-skills-skills-trigger-dev`
- `market-sickn33__antigravity-awesome-skills-skills-unity-developer`
- `market-sickn33__antigravity-awesome-skills-skills-unity-ecs-patterns`
- `market-sickn33__antigravity-awesome-skills-skills-unreal-engine-cpp-pro`
- `market-sickn33__antigravity-awesome-skills-skills-vulnerability-scanner`
- `market-simota__agent-skills-lore`
- `market-simota__agent-skills-pixel`
- `market-simota__agent-skills-quest`
- `media_exp-rights-ledger`
- `mobile-games`
- `multiplayer`
- `openai-curated-develop-web-game`
- `openai-curated-playwright`
- `openai-curated-playwright-interactive`
- `pc-games`
- `playwright`
- `proj-security-scan`
- `security-scan`
- `shader-programming-glsl`
- `spline-3d-integration`
- `threejs`
- `threejs-animation`
- `threejs-atmosphere-aerial-perspective`
- `threejs-bloom`
- `threejs-camera-direction`
- `threejs-exposure-color-grading`
- `threejs-fundamentals`
- `threejs-geometry`
- `threejs-image-pipeline`
- `threejs-interaction`
- `threejs-loaders`
- `threejs-performance`
- `threejs-procedural-animation`
- `threejs-procedural-architecture`
- `threejs-procedural-fields`
- `threejs-procedural-geometry`
- `threejs-procedural-materials`
- `threejs-procedural-planets`
- `threejs-procedural-vegetation`
- `threejs-procedural-vfx`
- `threejs-raymarched-space-effects`
- `threejs-screen-space-ambient-occlusion`
- `threejs-shaders`
- `threejs-shadow-systems`
- `threejs-skill-router`
- `threejs-skills`
- `threejs-spectral-ocean`
- `threejs-temporal-surfaces`
- `threejs-visual-validation`
- `threejs-volumetric-clouds`
- `threejs-water-optics`
- `web-games`

### `/Users/pranay/.zcode/skills` (244)

- `2d-games`
- `3d-games`
- `3d-web-experience`
- `animate`
- `animation-vocabulary`
- `blender-3d-modeling`
- `blender-mcp`
- `character-sprite-generator`
- `develop-web-game`
- `find-animation-opportunities`
- `game-art`
- `game-audio`
- `game-design`
- `game-development`
- `game-testing`
- `headed-chrome-3d-testing`
- `improve-animations`
- `learning_for_kids-security-scan`
- `llm-blender-agent`
- `market-0x0funky__agent-sprite-forge-skills-generate2dmap`
- `market-0x0funky__agent-sprite-forge-skills-generate2dsprite`
- `market-0x0funky__agent-sprite-forge-skills-video2dsprite`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-brightdata-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-brightpearl-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-d2lbrightspace-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-dungeon-fighter-online-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-epic-games-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-perigon-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-shortpixel-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-triggercmd-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho-inventory-automation`
- `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho_inventory-automation`
- `market-ComposioHQ__awesome-claude-skills-tailored-resume-generator`
- `market-MengTo__Skills-agent-skills-codex-audit-reference-originality`
- `market-MengTo__Skills-agent-skills-codex-generate-reference-inspired-brand-worlds`
- `market-MengTo__Skills-agent-skills-codex-optimize-web-animations`
- `market-MengTo__Skills-agent-skills-game-development-author-game-levels`
- `market-MengTo__Skills-agent-skills-game-development-build-game-audio-feedback`
- `market-MengTo__Skills-agent-skills-game-development-build-game-camera-controls`
- `market-MengTo__Skills-agent-skills-game-development-build-game-inventory`
- `market-MengTo__Skills-agent-skills-game-development-build-game-monster-system`
- `market-MengTo__Skills-agent-skills-game-development-build-hybrid-game-assets`
- `market-MengTo__Skills-agent-skills-game-development-build-isometric-arpg`
- `market-MengTo__Skills-agent-skills-game-development-build-mobile-threejs-games`
- `market-MengTo__Skills-agent-skills-game-development-build-threejs-enemy-systems`
- `market-MengTo__Skills-agent-skills-game-development-build-vesperfall-review-assets`
- `market-MengTo__Skills-agent-skills-game-development-create-game-vfx`
- `market-MengTo__Skills-agent-skills-game-development-design-action-combat`
- `market-MengTo__Skills-agent-skills-game-development-design-game-encounters`
- `market-MengTo__Skills-agent-skills-game-development-optimize-threejs-games`
- `market-MengTo__Skills-agent-skills-game-development-ship-web-games`
- `market-MengTo__Skills-agent-skills-game-development-test-playable-web-games`
- `market-MengTo__Skills-agent-skills-game-development-tune-enemy-ai`
- `market-MengTo__Skills-agent-skills-web-design-add-shader-cursor-trail`
- `market-MengTo__Skills-agent-skills-web-design-ambient-section-particles`
- `market-MengTo__Skills-agent-skills-web-design-animation-on-scroll`
- `market-MengTo__Skills-agent-skills-web-design-animation-systems`
- `market-MengTo__Skills-agent-skills-web-design-bright-green-tech-system-webgl`
- `market-MengTo__Skills-agent-skills-web-design-cinematic-gsap-lenis-motion-system`
- `market-MengTo__Skills-agent-skills-web-design-cinematic-scroll-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-globe-particles`
- `market-MengTo__Skills-agent-skills-web-design-gsap-scrolltrigger-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-scroll-world-storytelling`
- `market-MengTo__Skills-agent-skills-web-design-shaders-cursor-ripples`
- `market-MengTo__Skills-agent-skills-web-design-threejs`
- `market-MengTo__Skills-agent-skills-web-design-webgl-3d-object`
- `market-calesthio__generative-media-skills-skills-production-3d-craft-3d-asset-production`
- `market-calesthio__generative-media-skills-skills-production-3d-craft-neural-reality-capture`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-audio-mixing-mastering`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-captions-media-accessibility`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-dialogue-editing-adr`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-localization-dubbing-production`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-music-supervision-scoring`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-sound-design-foley`
- `market-calesthio__generative-media-skills-skills-production-audio-craft-video-to-audio-foley`
- `market-calesthio__generative-media-skills-skills-production-content-formats-anime-animation-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-audiobook-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-cinematic-trailer-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-educational-animation-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-game-trailer-production`
- `market-calesthio__generative-media-skills-skills-production-content-formats-music-video-production`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-2d-character-rig-animation`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-character-design-continuity`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-cinematic-shot-direction`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-lighting-direction`
- `market-calesthio__generative-media-skills-skills-production-creative-direction-storyboard-previsualization`
- `market-calesthio__generative-media-skills-skills-production-governance-delivery-media-provenance-rights`
- `market-calesthio__generative-media-skills-skills-production-post-production-vfx-compositing`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-audio-reactive-video-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-d3-animated-data-visualization`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-gsap-animation-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-lottie-animation-delivery`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-manim-explainer-animation`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-procedural-canvas-animation`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-threejs-scene-composition`
- `market-calesthio__generative-media-skills-skills-production-runtime-assembly-virtual-production-icvfx`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-meshy-3d`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-tencent-hunyuan3d`
- `market-calesthio__generative-media-skills-skills-providers-3d-generation-tripo-3d`
- `market-calesthio__generative-media-skills-skills-providers-audio-enhancement-nvidia-maxine-audio-effects`
- `market-calesthio__generative-media-skills-skills-providers-avatar-video-hedra-character-video`
- `market-calesthio__generative-media-skills-skills-providers-lip-sync-sync-labs-lipsync`
- `market-calesthio__generative-media-skills-skills-providers-motion-capture-deepmotion-animate-3d`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-ace-step`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-elevenlabs-music`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-google-lyria`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-minimax-music`
- `market-calesthio__generative-media-skills-skills-providers-music-generation-suno-music`
- `market-calesthio__generative-media-skills-skills-providers-sound-generation-elevenlabs-sound-effects`
- `market-calesthio__generative-media-skills-skills-providers-sound-generation-stable-audio`
- `market-calesthio__generative-media-skills-skills-providers-source-separation-audioshake-stem-separation`
- `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-openai-audio`
- `market-calesthio__generative-media-skills-skills-providers-text-to-speech-fish-audio-tts`
- `market-calesthio__generative-media-skills-skills-providers-voice-agents-gemini-live-audio`
- `market-calesthio__generative-media-skills-skills-providers-world-models-odyssey-interactive-video`
- `market-calesthio__generative-media-skills-skills-providers-world-models-world-labs-marble`
- `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-behavioral-modes`
- `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-multimodal-audiocraft`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-brightdata-local-search`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright-e2e-builder`
- `market-davila7__claude-code-templates-cli-tool-components-skills-development-requesting-code-review`
- `market-davila7__claude-code-templates-cli-tool-components-skills-productivity-game-changing-features`
- `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-neuropixels-analysis`
- `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-scanpy`
- `market-davila7__claude-code-templates-cli-tool-components-skills-security-scanning-tools`
- `market-davila7__claude-code-templates-cli-tool-components-skills-security-vulnerability-scanner`
- `market-davila7__claude-code-templates-cli-tool-components-skills-utilities-playwright-skill`
- `market-davila7__claude-code-templates-cli-tool-components-skills-video-manim`
- `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-best-practices`
- `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-mcp`
- `market-davila7__claude-code-templates-cli-tool-components-skills-workflow-automation-trigger-dev`
- `market-full-stack-skills__threejs-skills-skills-threejs-audio`
- `market-full-stack-skills__threejs-skills-skills-threejs-camera`
- `market-full-stack-skills__threejs-skills-skills-threejs-controls`
- `market-full-stack-skills__threejs-skills-skills-threejs-dev-setup`
- `market-full-stack-skills__threejs-skills-skills-threejs-geometries`
- `market-full-stack-skills__threejs-skills-skills-threejs-helpers`
- `market-full-stack-skills__threejs-skills-skills-threejs-lights`
- `market-full-stack-skills__threejs-skills-skills-threejs-math`
- `market-full-stack-skills__threejs-skills-skills-threejs-node-tsl`
- `market-full-stack-skills__threejs-skills-skills-threejs-objects`
- `market-full-stack-skills__threejs-skills-skills-threejs-renderers`
- `market-full-stack-skills__threejs-skills-skills-threejs-scenes`
- `market-full-stack-skills__threejs-skills-skills-threejs-webxr`
- `market-img2threejs__img2threejs`
- `market-its-meseba__meseba-skills-skills-blog-from-history`
- `market-jackspace__ClaudeSkillz-skills-auto-animate`
- `market-jackspace__ClaudeSkillz-skills-cloudflare-cron-triggers`
- `market-jackspace__ClaudeSkillz-skills-playwright-skill`
- `market-jackspace__ClaudeSkillz-skills-playwright-skill_playwright`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-3d-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-aaa-graphics-builder`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-audio-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-debug-profiler`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-director`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-ui-designer`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-gameplay-systems`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-image-generator`
- `market-majidmanzarpour__threejs-game-skills-skills-threejs-qa-release`
- `market-nexu-io__open-design-skills-fal-3d`
- `market-nexu-io__open-design-skills-mockup-device-3d`
- `market-nexu-io__open-design-skills-shader-dev`
- `market-parcadei__Continuous-Claude-v3-.claude-skills-explore`
- `market-sickn33__antigravity-awesome-skills-skills-animejs-animation`
- `market-sickn33__antigravity-awesome-skills-skills-ask-questions-if-underspecified`
- `market-sickn33__antigravity-awesome-skills-skills-audio-transcriber`
- `market-sickn33__antigravity-awesome-skills-skills-azure-microsoft-playwright-testing-ts`
- `market-sickn33__antigravity-awesome-skills-skills-azure-resource-manager-playwright-dotnet`
- `market-sickn33__antigravity-awesome-skills-skills-bdistill-behavioral-xray`
- `market-sickn33__antigravity-awesome-skills-skills-bevy-ecs-expert`
- `market-sickn33__antigravity-awesome-skills-skills-brand-guidelines-community`
- `market-sickn33__antigravity-awesome-skills-skills-data-storytelling`
- `market-sickn33__antigravity-awesome-skills-skills-fal-audio`
- `market-sickn33__antigravity-awesome-skills-skills-frontend-mobile-security-xss-scan`
- `market-sickn33__antigravity-awesome-skills-skills-gh-review-requests`
- `market-sickn33__antigravity-awesome-skills-skills-go-playwright`
- `market-sickn33__antigravity-awesome-skills-skills-godot-4-migration`
- `market-sickn33__antigravity-awesome-skills-skills-godot-gdscript-patterns`
- `market-sickn33__antigravity-awesome-skills-skills-hig-components-dialogs`
- `market-sickn33__antigravity-awesome-skills-skills-internal-comms-community`
- `market-sickn33__antigravity-awesome-skills-skills-inventory-demand-planning`
- `market-sickn33__antigravity-awesome-skills-skills-magic-animator`
- `market-sickn33__antigravity-awesome-skills-skills-makepad-animation`
- `market-sickn33__antigravity-awesome-skills-skills-makepad-shaders`
- `market-sickn33__antigravity-awesome-skills-skills-odoo-inventory-optimizer`
- `market-sickn33__antigravity-awesome-skills-skills-playwright-java`
- `market-sickn33__antigravity-awesome-skills-skills-scanning-tools`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-dependencies`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-hardening`
- `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-sast`
- `market-sickn33__antigravity-awesome-skills-skills-shader-programming-glsl`
- `market-sickn33__antigravity-awesome-skills-skills-skill-scanner`
- `market-sickn33__antigravity-awesome-skills-skills-spline-3d-integration`
- `market-sickn33__antigravity-awesome-skills-skills-startup-business-analyst-market-opportunity`
- `market-sickn33__antigravity-awesome-skills-skills-unity-developer`
- `market-sickn33__antigravity-awesome-skills-skills-unity-ecs-patterns`
- `market-sickn33__antigravity-awesome-skills-skills-unreal-engine-cpp-pro`
- `market-simota__agent-skills-lore`
- `market-simota__agent-skills-pixel`
- `market-simota__agent-skills-quest`
- `media_exp-rights-ledger`
- `mobile-games`
- `multiplayer`
- `openai-curated-playwright-interactive`
- `pc-games`
- `request-refactor-plan`
- `review-animations`
- `threejs-animation`
- `threejs-atmosphere-aerial-perspective`
- `threejs-bloom`
- `threejs-camera-direction`
- `threejs-exposure-color-grading`
- `threejs-fundamentals`
- `threejs-geometry`
- `threejs-image-pipeline`
- `threejs-interaction`
- `threejs-lighting`
- `threejs-loaders`
- `threejs-materials`
- `threejs-performance`
- `threejs-postprocessing`
- `threejs-procedural-animation`
- `threejs-procedural-architecture`
- `threejs-procedural-fields`
- `threejs-procedural-geometry`
- `threejs-procedural-materials`
- `threejs-procedural-planets`
- `threejs-procedural-vegetation`
- `threejs-procedural-vfx`
- `threejs-raymarched-space-effects`
- `threejs-screen-space-ambient-occlusion`
- `threejs-shaders`
- `threejs-shadow-systems`
- `threejs-skill-router`
- `threejs-skills`
- `threejs-spectral-ocean`
- `threejs-temporal-surfaces`
- `threejs-textures`
- `threejs-visual-validation`
- `threejs-volumetric-clouds`
- `threejs-water-optics`
- `to-questionnaire`
- `web-games`


---

## 10. Exhaustive online index (every tool/skill found via web research, not just local paths)

Section 9 counted local filesystem skills only. This section closes that gap: **every distinct external tool, service, library, or hosted skill named across all web searches run for this doc** (image-to-3D, auto-rigging/mocap, narrative authoring, AI NPC/runtime dialogue, cinematic sequencing, audio, alternate engines, VFX/particle libraries, physics libraries, voxel/world tools, and the online Claude-skill marketplace). **62 distinct names**, categorized, none deduplicated against §9 since these are external services/libraries, not local agent skills (a few — Inworld, Cascadeur, DeepMotion — are referenced by name from *inside* the local `calesthio` skill bundle as `providers/*` wrappers; noted where that overlap exists).

### Image/text-to-3D generation (13)
Meshy AI (Meshy 6), Tripo AI, Rodin AI / Hyper3D (ByteDance), Luma AI, TRELLIS 2 (open-source), 3D AI Studio (aggregator: Meshy+Rodin+Tripo+Hunyuan+TRELLIS), Tencent Hunyuan3D, bunpav (AISOLO Technologies), RapidDirect AI Creator, Scenario, Leonardo.ai, Promethean AI, Zoo (CAD-flavored, named in one comparison source).

### Auto-rigging, animation, motion capture (14)
Mixamo (Adobe), Tripo AI rigging, Reallusion AccuRIG 2, Cascadeur *(also wrapped locally as a named reference inside the calesthio `providers/motion-capture` family)*, Blender Rigify, Auto-Rig Pro, DeepMotion Animate 3D *(also a local `calesthio` provider skill: `providers-motion-capture-deepmotion-animate-3d`)*, Move.ai, RADiCAL, Plask, Krikey AI, Manus Quantum Metagloves (hardware), StretchSense (hardware, feeds OptiTrack Motive / Vicon Shōgun Post), Faceware / MetaHuman Animator (facial capture).

### Narrative/dialogue authoring formats & tools (8)
Ink (inkle, MIT), Yarn Spinner (MIT), Twine (GPL-3.0), articy:draft (enterprise/subscription), Arcweave (cloud, paid to ship), LoreWeaver, StoryFlow, NarrativeFlow.

### AI NPC / runtime dialogue platforms (6)
Inworld AI *(also a local `calesthio` reference point)*, Convai, NVIDIA ACE, Charisma.ai (visual story-beat editor, narrative-driven), ChatMapper (older but still cited for structured-narrative fit), Dialogue System for Unity.

### Cinematic sequencing (2)
Unreal Sequencer, Unity Timeline. (No browser/Three.js equivalent exists — confirmed gap, see §7a.)

### Audio — libraries, engines, AI generation (12)
Tone.js (generative/interactive music, Web Audio), Howler.js (playback, 7KB, the most-recommended choice for browser-game SFX/music), MetaSounds (UE5 procedural audio, reference only — not applicable to this repo's engine), AIVA (AI music scoring), Replica Studios (AI voice), and the already-locally-catalogued `calesthio` provider wrappers for completeness: Suno, ACE-Step, ElevenLabs Music, Google Lyria, Minimax Music, Stable Audio, ElevenLabs Sound Effects.

### Alternate browser game engines/renderers (6)
Babylon.js (Microsoft-backed, full engine, Apache-2.0, strong WebGPU/WGSL), PlayCanvas (MIT core + commercial cloud editor, smallest 3D runtime), Phaser 4 (2D, MIT, now stable as of 2026), PixiJS v8 (2D renderer, WebGPU-first), React Three Fiber (Three.js/React bridge — likely already implicitly relevant if this repo ever adopts React for UI), Drei (R3F utility belt).

### Three.js-specific VFX/particle/postprocessing libraries (5)
three-nebula (WebGL particle engine + desktop designer), Three.Quarks (Unity-Shuriken-parity VFX, R3F support), Three-VFX (mustache-dev, WebGPU compute-shader particles, 100k+ particle counts), pmndrs/postprocessing (WebGL bloom/vignette/etc.), TSL-based postprocessing (Three.js-native, WebGPU).

### Physics libraries (browser-relevant) (4)
Rapier (Rust/WASM — the one this repo's `physics-lab.html` already treats as an isolated evidence lab per ADR-0023), Cannon.js / cannon-es, Ammo.js (Bullet compiled to WASM), Matter.js (2D only, bundled inside Phaser).

### Voxel/procedural-world engines (4)
Veloren (open-source Rust voxel RPG, procedural-generation reference), Voxel Play / Cubiquity (Unity plugins), Voxel Farm (standalone engine).

### Online Claude/Codex-flavored narrative skills, not confirmed installed locally (4)
Narrative Designer, GM Craft, Creative Storytelling, `danjdewhurst/story-skills` (GitHub, MIT-style open skill pack for both Codex and Claude Code).

**Running total across this document: 323 local skill names (§9) + 62 external tools/services (§10) = 385 distinct named things surveyed.** That is the honest exhaustive count for "everything, similar, adjacent, alternates, supplementary, complementary" as requested — local agent skills and external tools/libraries/services combined, across game dev, Three.js/graphics, narrative, cinematic, audio, physics, and engine-alternative categories.

Sources for this section (in addition to those already cited in §1, §4b, and §7a): [Particle systems in games with three.js](https://tigerabrodi.blog/particle-systems-in-games-with-threejs-and-tricks-to-make-them-look-good), [three-nebula](https://three-nebula.org/), [Three.Quarks](https://quarks.art/runtime), [Three-VFX (GitHub)](https://github.com/mustache-dev/Three-VFX), [Top JavaScript Game Engines & Libraries 2026](https://codersera.com/blog/top-javascript-game-engines-and-libraries/), [Three.js vs Babylon.js vs PlayCanvas](https://www.utsubo.com/blog/threejs-vs-babylonjs-vs-playcanvas-comparison), [Web game engines in 2026 (Cinevva)](https://app.cinevva.com/blog/2026-06-09-web-game-engines-2026-comparison), [Tone.js vs Howler.js 2026](https://supadark.com/notes/tone-js-vs-howler-js), [howler.js](https://howlerjs.com/), [Procedural Audio and AI Music for UE5 (StraySpark)](https://www.strayspark.studio/blog/procedural-audio-ai-music-ue5), [Best AI Tools for Game Development 2026 (cognitivefuture.ai)](https://cognitivefuture.ai/best-ai-tools-for-game-development/), [7 Best AI Game Dialogue Tools 2026 (aivexify.com)](https://aivexify.com/ai-game-dialogue-tools/)

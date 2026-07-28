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

## 8. Gaps and recommendations

1. **img2threejs is not in `~/.claude/skills/`** — the one path this session's `Skill` tool actually reads from. If you want to invoke it as `/img2threejs` in Claude Code, it needs to be symlinked or cloned there; right now it only exists as raw source + a Codex market copy.
2. **Narrative/dialogue tooling is thin locally** relative to the graphics/game-dev bench — the `calesthio` `creative-direction/` and `audio-craft/` groups are the best local asset, but true branching-dialogue/quest-authoring skills (Ink/Yarn-flavored) aren't confirmed installed. `market-simota__agent-skills-lore` and `-quest` exist as directories but need their contents verified before relying on them.
3. **No local Mixamo/VRM/retargeting skill** — flag as a gap if a rigged humanoid or animal character ever enters scope. Not a hard blocker even so: Mixamo, Reallusion AccuRIG 2, and Blender Rigify/Auto-Rig Pro (§7a) are directly usable as external tools without needing a skill wrapper — this repo's existing `blender-3d-modeling`/`blender-mcp` skills plus the live `mcp__Blender__*` tools in this session already give a path in.
4. **Narrative/dialogue tooling gap is similarly not a skill problem** — Ink, Yarn Spinner, and Twine (§7a) are plain-text/script formats an agent can read and write directly; the missing piece is a design decision (does Rigs Unbound want scripted branching narrative at all, given its "opportunities not menus" framing?), not a missing tool.
5. **threejs-skill-router** (`.codex/skills`) is worth using as the entry point for the Three.js bench instead of manually picking from ~30 threejs-* skills — it's a meta-skill built for exactly this dispatch problem.
6. Given this repo's "additive, better, comprehensive" + no-hacks posture, any new skill or external tool adopted here should go through the same discipline as img2threejs's own gates: don't let it bypass `assets:preflight`, `audit:reachability`, or `verify:head` — treat generated output (code, meshes, rigs, or narrative data) as authored source, not a shortcut around this repo's existing contracts.

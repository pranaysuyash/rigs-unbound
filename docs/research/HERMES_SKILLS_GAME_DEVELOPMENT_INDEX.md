# Hermes Skills — Game Development Index

**Project:** rigs-unbound  
**Created:** 2026-07-26  
**Purpose:** Single reference for all locally-available Hermes skills relevant to this 3D web game project. Agents should consult this index instead of re-searching the skills directory.

---

## Quick Reference by Category

| Category                                                    | Skills Count | Primary Use                                     |
| ----------------------------------------------------------- | ------------ | ----------------------------------------------- |
| Core Game Design                                            | 1            | GDD, loops, progression, psychology             |
| Game Development Orchestrator                               | 1            | Platform/dimension routing                      |
| 2D Games                                                    | 1            | Sprites, tilemaps, platformer patterns          |
| 3D Games                                                    | 1            | Rendering, shaders, physics, cameras, LOD       |
| Platform-Specific                                           | 4            | Web, Mobile, PC/Console, VR/AR                  |
| Multiplayer                                                 | 1            | Networking, sync, anti-cheat                    |
| Art Pipeline                                                | 1            | Style, assets, animation, organization          |
| Audio Systems                                               | 1            | Categories, adaptive, 3D audio, mix             |
| Testing                                                     | 1            | Playwright, visual regression, WASM, perf       |
| Three.js Fundamentals                                       | 1            | Scene, camera, renderer, math                   |
| Three.js Animation                                          | 1            | Keyframe, skeletal, morph, blending             |
| Three.js Interaction                                        | 1            | Raycasting, controls, drag, hover               |
| Three.js Performance                                        | 1            | Profiling, draw calls, instancing, auto-degrade |
| R3F + Drei                                                  | 1            | Declarative 3D, hooks, instancing, post-proc    |
| Three.js Extras (geom, mat, light, load, post, shader, tex) | 8            | Specialized subsystems                          |

**Total: 26 directly relevant skills**

---

## Skill Paths (Load via `skill_view(name="...")`)

### Core Game Development Suite

```
projects/skills/game-development/SKILLS.md                    # Orchestrator
projects/skills/game-development/game-design/SKILL.md         # Core design principles
projects/skills/game-development/2d-games/SKILL.md            # 2D mechanics
projects/skills/game-development/3d-games/SKILL.md            # 3D mechanics
projects/skills/game-development/web-games/SKILL.md           # Browser (Phaser, Three.js, Babylon)
projects/skills/game-development/mobile-games/SKILL.md        # Touch, battery, stores
projects/skills/game-development/pc-games/SKILL.md            # Engine selection (Unity/Godot/Unreal)
projects/skills/game-development/vr-ar/SKILL.md               # Comfort, 90FPS, spatial
projects/skills/game-development/multiplayer/SKILL.md         # Networking architecture
projects/skills/game-development/game-art/SKILL.md            # Visual pipeline
projects/skills/game-development/game-audio/SKILL.md          # Audio systems
projects/skills/game-testing/SKILL.md                         # Automated testing for 3D web
```

### Three.js / R3F Suite

```
projects/skills/threejs-fundamentals/SKILL.md
projects/skills/threejs-animation/SKILL.md
projects/skills/threejs-interaction/SKILL.md
projects/skills/threejs-skills/SKILL.md
projects/skills/threejs-geometry/SKILL.md
projects/skills/threejs-materials/SKILL.md
projects/skills/threejs-lighting/SKILL.md
projects/skills/threejs-loaders/SKILL.md
projects/skills/threejs-postprocessing/SKILL.md
projects/skills/threejs-shaders/SKILL.md
projects/skills/threejs-textures/SKILL.md
projects/skills/threejs-performance/SKILL.md
projects/skills/r3f-drei/SKILL.md
```

### Marketplace Mirror (External Source — davila7)

```
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/2d-games/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/3d-games/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/game-design/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/game-art/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/game-audio/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/mobile-games/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/pc-games/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/web-games/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/vr-ar/SKILL.md
codex/marketplace-davila7/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development/multiplayer/SKILL.md
```

---

## Recommended Skill Loadouts by Task

| Task                            | Skills to Load                                                                                           |
| ------------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Core gameplay design**        | `game-development/game-design`, `game-development`                                                       |
| **3D web prototype (Three.js)** | `threejs-fundamentals`, `threejs-skills`, `game-development/web-games`, `threejs-performance`            |
| **3D web prototype (R3F)**      | `r3f-drei`, `threejs-fundamentals`, `game-development/web-games`, `threejs-performance`                  |
| **Vehicle/physics mechanics**   | `threejs-fundamentals`, `threejs-animation`, `game-development/3d-games`, `game-development/game-design` |
| **Multiplayer architecture**    | `game-development/multiplayer`, `game-development/web-games`                                             |
| **Art pipeline & style**        | `game-development/game-art`, `threejs-materials`, `threejs-textures`, `threejs-loaders`                  |
| **Audio integration**           | `game-development/game-audio`, `threejs-loaders`                                                         |
| **Performance optimization**    | `threejs-performance`, `r3f-drei` (AdaptiveDpr, Instancing), `game-development/web-games`                |
| **Testing/CI**                  | `game-testing`, `threejs-performance`                                                                    |
| **Mobile deployment**           | `game-development/mobile-games`, `game-development/web-games` (PWA)                                      |
| **VR/AR consideration**         | `game-development/vr-ar`, `threejs-interaction` (PointerLockControls)                                    |
| **Shader work**                 | `threejs-shaders`, `threejs-materials`, `r3f-drei` (shaderMaterial)                                      |
| **Animation systems**           | `threejs-animation`, `r3f-drei` (useFrame), `game-development/game-design`                               |
| **Input/controls**              | `threejs-interaction`, `game-development/game-design`, `r3f-drei` (KeyboardControls)                     |

---

## Project-Specific Context (rigs-unbound)

Based on the research docs in `docs/research/`, this project involves:

- **3D web game** (Three.js / R3F) — see `3D_GAME_MASTER_SYNTHESIS`, `WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS`
- **Vehicle physics** — see `BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG`, `PHYSICS_QUALITY_ENVELOPE_CONTRACT`
- **ECS architecture** — see `ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT`, `SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT`
- **Asset pipeline** — see `ASSET_PIPELINE_AND_PROVENANCE_CONTRACT`, `ASSET_AUTHORITY_AND_MESH_CONTRACT`
- **Performance budgets** — see `RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE`, `RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT`
- **LOD/streaming** — see `VISIBILITY_STAGE_AND_LOD_CONTRACT`, `STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT`
- **Camera/controls** — see `CAMERA_FEEL_CONTRACT`, `GAME_CONTROLS_NOVEL_INPUT_METHODS`
- **Accessibility** — see `RENDER_ACCESSIBILITY_CHECKLIST`, `ACCESSIBILITY_AND_INPUT_CONTRACT`
- **Replay/ghost system** — see `REPLAY_ARTIFACT_AND_GHOST_CONTRACT`
- **Modding support** — see `MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT`

---

## Usage Instructions for Agents

```python
# Load a skill
skill_view(name="projects/skills/game-development/3d-games")

# Load multiple skills for a task
skill_view(name="projects/skills/r3f-drei")
skill_view(name="projects/skills/threejs-performance")
skill_view(name="projects/skills/game-development/web-games")
```

**Always check this index first** before searching the skills directory. The paths above are verified working as of 2026-07-26.

---

## Maintenance

- Update this file when new game-relevant skills are added to `~/.hermes/skills/`
- The marketplace mirror (codex/marketplace-davila7/) is read-only — do not edit there
- Primary canonical skills live in `projects/skills/`

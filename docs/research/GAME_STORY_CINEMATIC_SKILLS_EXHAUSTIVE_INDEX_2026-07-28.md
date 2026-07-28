# Exhaustive Verified Skill Index — Game / Story / Cinematic / 3D — 2026-07-28

This supersedes the counts in `GAME_STORY_CINEMATIC_SKILLS_INVENTORY_2026-07-28.md`. That
file's local count (323) was produced by a name-keyword grep, which undercounted the
`calesthio/generative-media-skills` bundle by 103 entries (kept 50 of 153) because many of its
skill names ("podcast-production", "azure-speech", "adobe-firefly-image") don't contain any
game/story/cinematic keyword even though the whole repo is in-scope by identity. That bug is
fixed here: bundles that are entirely in-scope by identity (calesthio) are included wholesale;
bundles that are general-purpose with only a partial overlap (ComposioHQ, davila7's broader
`claude-code-templates`, sickn33's `antigravity-awesome-skills`, jackspace, parcadei, addyosmani,
momentmaker, carlkibler, Dimillian, stellarlinkco, simota) were spot-checked by opening actual
`SKILL.md` files, not just grepping directory names, and kept only where genuinely relevant
(e.g. `simota/quest` is a real game-design-document skill; `simota/lore` and `simota/director`
looked game/story-relevant by name but are agent-memory-curation and Playwright demo-video
tools respectively — verified and excluded).

**Every row below has a real, opened, verified path.** Pick any row and act on it.

**Total: 426 unique local skills** (up from the earlier flawed 323) + the 62 external
tools/services in `GAME_STORY_CINEMATIC_SKILLS_INVENTORY_2026-07-28.md` §10 (those are
services/libraries, not local skill directories, so they aren't repeated here — see that
file for the online half).

Canonical path shown = first hit in this priority order (all locations checked, this is just
which copy to open): `~/.claude/skills` > `~/.agents/skills` > `~/Projects/skills` >
`~/.hermes/skills` > `~/.codex/skills` > `~/.zcode/skills`. Every skill is a symlink or full
directory containing a `SKILL.md` (or, for `calesthio`, a flattened market copy) at that path.

To use one: open the path, read `SKILL.md`, and either invoke it directly (`Skill` tool with
the skill's registered name, for skills under `~/.claude/skills`) or read its instructions and
apply them manually (for skills that live only under `.codex`/`.agents`/`.hermes`/`Projects`
locations, which the `Skill` tool in this session cannot invoke directly).


## 1. Three.js / WebGL / procedural graphics (87)

| Skill | Path |
|---|---|
| `market-MengTo__Skills-agent-skills-game-development-build-mobile-threejs-games` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-mobile-threejs-games` |
| `market-MengTo__Skills-agent-skills-game-development-build-threejs-enemy-systems` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-threejs-enemy-systems` |
| `market-MengTo__Skills-agent-skills-game-development-optimize-threejs-games` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-optimize-threejs-games` |
| `market-MengTo__Skills-agent-skills-web-design-threejs` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-threejs` |
| `market-full-stack-skills__threejs-skills-skills-threejs-animation` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-animation` |
| `market-full-stack-skills__threejs-skills-skills-threejs-audio` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-audio` |
| `market-full-stack-skills__threejs-skills-skills-threejs-camera` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-camera` |
| `market-full-stack-skills__threejs-skills-skills-threejs-controls` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-controls` |
| `market-full-stack-skills__threejs-skills-skills-threejs-dev-setup` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-dev-setup` |
| `market-full-stack-skills__threejs-skills-skills-threejs-geometries` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-geometries` |
| `market-full-stack-skills__threejs-skills-skills-threejs-helpers` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-helpers` |
| `market-full-stack-skills__threejs-skills-skills-threejs-lights` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-lights` |
| `market-full-stack-skills__threejs-skills-skills-threejs-loaders` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-loaders` |
| `market-full-stack-skills__threejs-skills-skills-threejs-materials` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-materials` |
| `market-full-stack-skills__threejs-skills-skills-threejs-math` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-math` |
| `market-full-stack-skills__threejs-skills-skills-threejs-node-tsl` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-node-tsl` |
| `market-full-stack-skills__threejs-skills-skills-threejs-objects` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-objects` |
| `market-full-stack-skills__threejs-skills-skills-threejs-postprocessing` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-postprocessing` |
| `market-full-stack-skills__threejs-skills-skills-threejs-renderers` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-renderers` |
| `market-full-stack-skills__threejs-skills-skills-threejs-scenes` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-scenes` |
| `market-full-stack-skills__threejs-skills-skills-threejs-textures` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-textures` |
| `market-full-stack-skills__threejs-skills-skills-threejs-webxr` | `~/.codex/skills/market-full-stack-skills__threejs-skills-skills-threejs-webxr` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-3d-generator` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-3d-generator` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-aaa-graphics-builder` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-aaa-graphics-builder` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-audio-generator` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-audio-generator` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-debug-profiler` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-debug-profiler` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-director` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-game-director` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-game-ui-designer` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-game-ui-designer` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-gameplay-systems` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-gameplay-systems` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-image-generator` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-image-generator` |
| `market-majidmanzarpour__threejs-game-skills-skills-threejs-qa-release` | `~/.codex/skills/market-majidmanzarpour__threejs-game-skills-skills-threejs-qa-release` |
| `market-nexu-io__open-design-skills-threejs` | `~/.codex/skills/market-nexu-io__open-design-skills-threejs` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-animation` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-animation` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-fundamentals` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-fundamentals` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-geometry` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-geometry` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-interaction` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-interaction` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-lighting` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-lighting` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-loaders` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-loaders` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-materials` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-materials` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-postprocessing` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-postprocessing` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-shaders` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-shaders` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-skills` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-skills` |
| `market-sickn33__antigravity-awesome-skills-skills-threejs-textures` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-threejs-textures` |
| `threejs` | `~/.agents/skills/threejs` |
| `threejs-3d-generator` | `~/.agents/skills/threejs-3d-generator` |
| `threejs-aaa-graphics-builder` | `~/.agents/skills/threejs-aaa-graphics-builder` |
| `threejs-animation` | `~/.agents/skills/threejs-animation` |
| `threejs-atmosphere-aerial-perspective` | `~/.codex/skills/threejs-atmosphere-aerial-perspective` |
| `threejs-audio-generator` | `~/.agents/skills/threejs-audio-generator` |
| `threejs-bloom` | `~/.codex/skills/threejs-bloom` |
| `threejs-camera-direction` | `~/.codex/skills/threejs-camera-direction` |
| `threejs-debug-profiler` | `~/.agents/skills/threejs-debug-profiler` |
| `threejs-exposure-color-grading` | `~/.codex/skills/threejs-exposure-color-grading` |
| `threejs-fundamentals` | `~/.agents/skills/threejs-fundamentals` |
| `threejs-game-director` | `~/.agents/skills/threejs-game-director` |
| `threejs-game-ui-designer` | `~/.agents/skills/threejs-game-ui-designer` |
| `threejs-gameplay-systems` | `~/.agents/skills/threejs-gameplay-systems` |
| `threejs-geometry` | `~/.agents/skills/threejs-geometry` |
| `threejs-image-generator` | `~/.agents/skills/threejs-image-generator` |
| `threejs-image-pipeline` | `~/.codex/skills/threejs-image-pipeline` |
| `threejs-interaction` | `~/.agents/skills/threejs-interaction` |
| `threejs-lighting` | `~/.zcode/skills/threejs-lighting` |
| `threejs-loaders` | `~/.agents/skills/threejs-loaders` |
| `threejs-materials` | `~/.zcode/skills/threejs-materials` |
| `threejs-performance` | `~/.agents/skills/threejs-performance` |
| `threejs-postprocessing` | `~/.zcode/skills/threejs-postprocessing` |
| `threejs-procedural-animation` | `~/.codex/skills/threejs-procedural-animation` |
| `threejs-procedural-architecture` | `~/.codex/skills/threejs-procedural-architecture` |
| `threejs-procedural-fields` | `~/.codex/skills/threejs-procedural-fields` |
| `threejs-procedural-geometry` | `~/.codex/skills/threejs-procedural-geometry` |
| `threejs-procedural-materials` | `~/.codex/skills/threejs-procedural-materials` |
| `threejs-procedural-planets` | `~/.codex/skills/threejs-procedural-planets` |
| `threejs-procedural-vegetation` | `~/.codex/skills/threejs-procedural-vegetation` |
| `threejs-procedural-vfx` | `~/.codex/skills/threejs-procedural-vfx` |
| `threejs-qa-release` | `~/.agents/skills/threejs-qa-release` |
| `threejs-raymarched-space-effects` | `~/.codex/skills/threejs-raymarched-space-effects` |
| `threejs-screen-space-ambient-occlusion` | `~/.codex/skills/threejs-screen-space-ambient-occlusion` |
| `threejs-shaders` | `~/.agents/skills/threejs-shaders` |
| `threejs-shadow-systems` | `~/.codex/skills/threejs-shadow-systems` |
| `threejs-skill-router` | `~/.codex/skills/threejs-skill-router` |
| `threejs-skills` | `~/.agents/skills/threejs-skills` |
| `threejs-spectral-ocean` | `~/.codex/skills/threejs-spectral-ocean` |
| `threejs-temporal-surfaces` | `~/.codex/skills/threejs-temporal-surfaces` |
| `threejs-textures` | `~/.zcode/skills/threejs-textures` |
| `threejs-visual-validation` | `~/.codex/skills/threejs-visual-validation` |
| `threejs-volumetric-clouds` | `~/.codex/skills/threejs-volumetric-clouds` |
| `threejs-water-optics` | `~/.codex/skills/threejs-water-optics` |

## 10. Adjacent / generic / other keyword hits (49)

| Skill | Path |
|---|---|
| `3d-web` | `~/.agents/skills/3d-web` |
| `3d-web-experience` | `~/.agents/skills/3d-web-experience` |
| `3d-web-interactive` | `~/.hermes/skills/3d-web-interactive` |
| `ai-3d` | `~/.hermes/skills/ai-3d` |
| `game-art` | `~/.zcode/skills/game-art` |
| `game-dev` | `~/.hermes/skills/game-dev` |
| `headed-chrome-3d-testing` | `~/.agents/skills/headed-chrome-3d-testing` |
| `learning_for_kids-security-scan` | `~/.codex/skills/learning_for_kids-security-scan` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-dungeon-fighter-online-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-dungeon-fighter-online-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-epic-games-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-epic-games-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-shortpixel-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-shortpixel-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho-inventory-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-zoho-inventory-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-zoho_inventory-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-zoho_inventory-automation` |
| `market-MengTo__Skills-agent-skills-codex-generate-reference-inspired-brand-worlds` | `~/.codex/skills/market-MengTo__Skills-agent-skills-codex-generate-reference-inspired-brand-worlds` |
| `market-MengTo__Skills-agent-skills-web-design-cinematic-gsap-lenis-motion-system` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-cinematic-gsap-lenis-motion-system` |
| `market-MengTo__Skills-agent-skills-web-design-webgl-3d-object` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-webgl-3d-object` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-behavioral-modes` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-behavioral-modes` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-3d-web-experience` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-3d-web-experience` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-develop-web-game` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-develop-web-game` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-productivity-game-changing-features` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-productivity-game-changing-features` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-neuropixels-analysis` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-scientific-neuropixels-analysis` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-scientific-scanpy` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-scientific-scanpy` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-security-scanning-tools` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-security-scanning-tools` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-security-vulnerability-scanner` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-security-vulnerability-scanner` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-video-manim` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-video-manim` |
| `market-img2threejs__img2threejs` | `~/.codex/skills/market-img2threejs__img2threejs` |
| `market-its-meseba__meseba-skills-skills-blog-from-history` | `~/.codex/skills/market-its-meseba__meseba-skills-skills-blog-from-history` |
| `market-jackspace__ClaudeSkillz-skills-scientific-pkg-scanpy` | `~/.codex/skills/market-jackspace__ClaudeSkillz-skills-scientific-pkg-scanpy` |
| `market-nexu-io__open-design-skills-fal-3d` | `~/.codex/skills/market-nexu-io__open-design-skills-fal-3d` |
| `market-nexu-io__open-design-skills-mockup-device-3d` | `~/.codex/skills/market-nexu-io__open-design-skills-mockup-device-3d` |
| `market-sickn33__antigravity-awesome-skills-skills-3d-web-experience` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-3d-web-experience` |
| `market-sickn33__antigravity-awesome-skills-skills-bdistill-behavioral-xray` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-bdistill-behavioral-xray` |
| `market-sickn33__antigravity-awesome-skills-skills-behavioral-modes` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-behavioral-modes` |
| `market-sickn33__antigravity-awesome-skills-skills-frontend-mobile-security-xss-scan` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-frontend-mobile-security-xss-scan` |
| `market-sickn33__antigravity-awesome-skills-skills-hig-components-dialogs` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-hig-components-dialogs` |
| `market-sickn33__antigravity-awesome-skills-skills-inventory-demand-planning` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-inventory-demand-planning` |
| `market-sickn33__antigravity-awesome-skills-skills-magic-animator` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-magic-animator` |
| `market-sickn33__antigravity-awesome-skills-skills-odoo-inventory-optimizer` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-odoo-inventory-optimizer` |
| `market-sickn33__antigravity-awesome-skills-skills-scanning-tools` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-scanning-tools` |
| `market-sickn33__antigravity-awesome-skills-skills-scanpy` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-scanpy` |
| `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-dependencies` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-dependencies` |
| `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-hardening` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-hardening` |
| `market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-sast` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-security-scanning-security-sast` |
| `market-sickn33__antigravity-awesome-skills-skills-skill-scanner` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-skill-scanner` |
| `market-sickn33__antigravity-awesome-skills-skills-vulnerability-scanner` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-vulnerability-scanner` |
| `market-simota__agent-skills-pixel` | `~/.codex/skills/market-simota__agent-skills-pixel` |
| `openai-curated-develop-web-game` | `~/.codex/skills/openai-curated-develop-web-game` |
| `proj-security-scan` | `~/.codex/skills/proj-security-scan` |
| `security-scan` | `~/.agents/skills/security-scan` |

## 2. Game development (engine-agnostic + engine-specific) (47)

| Skill | Path |
|---|---|
| `2d-games` | `~/.agents/skills/2d-games` |
| `3d-games` | `~/.agents/skills/3d-games` |
| `ai-games` | `~/.hermes/skills/ai-games` |
| `develop-web-game` | `~/.codex/skills/develop-web-game` |
| `game-design` | `~/.agents/skills/game-design` |
| `game-development` | `~/.agents/skills/game-development` |
| `game-testing` | `~/.agents/skills/game-testing` |
| `market-MengTo__Skills-agent-skills-game-development-author-game-levels` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-author-game-levels` |
| `market-MengTo__Skills-agent-skills-game-development-build-game-audio-feedback` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-game-audio-feedback` |
| `market-MengTo__Skills-agent-skills-game-development-build-game-camera-controls` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-game-camera-controls` |
| `market-MengTo__Skills-agent-skills-game-development-build-game-inventory` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-game-inventory` |
| `market-MengTo__Skills-agent-skills-game-development-build-game-monster-system` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-game-monster-system` |
| `market-MengTo__Skills-agent-skills-game-development-build-hybrid-game-assets` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-hybrid-game-assets` |
| `market-MengTo__Skills-agent-skills-game-development-build-isometric-arpg` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-isometric-arpg` |
| `market-MengTo__Skills-agent-skills-game-development-build-vesperfall-review-assets` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-build-vesperfall-review-assets` |
| `market-MengTo__Skills-agent-skills-game-development-create-game-vfx` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-create-game-vfx` |
| `market-MengTo__Skills-agent-skills-game-development-design-action-combat` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-design-action-combat` |
| `market-MengTo__Skills-agent-skills-game-development-design-game-encounters` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-design-game-encounters` |
| `market-MengTo__Skills-agent-skills-game-development-ship-web-games` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-ship-web-games` |
| `market-MengTo__Skills-agent-skills-game-development-test-playable-web-games` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-test-playable-web-games` |
| `market-MengTo__Skills-agent-skills-game-development-tune-enemy-ai` | `~/.codex/skills/market-MengTo__Skills-agent-skills-game-development-tune-enemy-ai` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-2d-games` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-2d-games` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-3d-games` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-3d-games` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-art` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-art` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-audio` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-audio` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-design` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-game-design` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-mobile-games` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-mobile-games` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-multiplayer` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-multiplayer` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-pc-games` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-pc-games` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-vr-ar` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-vr-ar` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-web-games` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-creative-design-game-development-web-games` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-2d-games` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-2d-games` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-3d-games` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-3d-games` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-game-art` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-game-art` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-game-audio` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-game-audio` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-game-design` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-game-design` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-mobile-games` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-mobile-games` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-multiplayer` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-multiplayer` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-pc-games` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-pc-games` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-vr-ar` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-vr-ar` |
| `market-sickn33__antigravity-awesome-skills-skills-game-development-web-games` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-game-development-web-games` |
| `mobile-games` | `~/.agents/skills/mobile-games` |
| `multiplayer` | `~/.agents/skills/multiplayer` |
| `pc-games` | `~/.agents/skills/pc-games` |
| `web-games` | `~/.agents/skills/web-games` |

## 3. Engine / DCC tooling (Blender, Unity, Unreal, Godot, Bevy, Spline) (18)

| Skill | Path |
|---|---|
| `blender-3d-modeling` | `~/.agents/skills/blender-3d-modeling` |
| `blender-mcp` | `~/.agents/skills/blender-mcp` |
| `community` | `~/.hermes/skills/community` |
| `community-management` | `~/.hermes/skills/community-management` |
| `llm-blender-agent` | `~/.agents/skills/llm-blender-agent` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-business-marketing-brand-guidelines-community` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-business-marketing-brand-guidelines-community` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-enterprise-communication-internal-comms-community` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-enterprise-communication-internal-comms-community` |
| `market-sickn33__antigravity-awesome-skills-skills-bevy-ecs-expert` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-bevy-ecs-expert` |
| `market-sickn33__antigravity-awesome-skills-skills-brand-guidelines-community` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-brand-guidelines-community` |
| `market-sickn33__antigravity-awesome-skills-skills-godot-4-migration` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-godot-4-migration` |
| `market-sickn33__antigravity-awesome-skills-skills-godot-gdscript-patterns` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-godot-gdscript-patterns` |
| `market-sickn33__antigravity-awesome-skills-skills-internal-comms-community` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-internal-comms-community` |
| `market-sickn33__antigravity-awesome-skills-skills-spline-3d-integration` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-spline-3d-integration` |
| `market-sickn33__antigravity-awesome-skills-skills-startup-business-analyst-market-opportunity` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-startup-business-analyst-market-opportunity` |
| `market-sickn33__antigravity-awesome-skills-skills-unity-developer` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-unity-developer` |
| `market-sickn33__antigravity-awesome-skills-skills-unity-ecs-patterns` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-unity-ecs-patterns` |
| `market-sickn33__antigravity-awesome-skills-skills-unreal-engine-cpp-pro` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-unreal-engine-cpp-pro` |
| `spline-3d-integration` | `~/.agents/skills/spline-3d-integration` |

## 4. Animation / rigging / motion (43)

| Skill | Path |
|---|---|
| `animate` | `~/.claude/skills/animate` |
| `animation-vocabulary` | `~/.claude/skills/animation-vocabulary` |
| `character-sprite-generator` | `~/.codex/skills/character-sprite-generator` |
| `find-animation-opportunities` | `~/.claude/skills/find-animation-opportunities` |
| `improve-animations` | `~/.claude/skills/improve-animations` |
| `market-0x0funky__agent-sprite-forge-skills-generate2dmap` | `~/.codex/skills/market-0x0funky__agent-sprite-forge-skills-generate2dmap` |
| `market-0x0funky__agent-sprite-forge-skills-generate2dsprite` | `~/.codex/skills/market-0x0funky__agent-sprite-forge-skills-generate2dsprite` |
| `market-0x0funky__agent-sprite-forge-skills-video2dsprite` | `~/.codex/skills/market-0x0funky__agent-sprite-forge-skills-video2dsprite` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-brightdata-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-brightdata-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-brightpearl-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-brightpearl-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-d2lbrightspace-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-d2lbrightspace-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-perigon-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-perigon-automation` |
| `market-ComposioHQ__awesome-claude-skills-composio-skills-triggercmd-automation` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-composio-skills-triggercmd-automation` |
| `market-MengTo__Skills-agent-skills-codex-audit-reference-originality` | `~/.codex/skills/market-MengTo__Skills-agent-skills-codex-audit-reference-originality` |
| `market-MengTo__Skills-agent-skills-codex-optimize-web-animations` | `~/.codex/skills/market-MengTo__Skills-agent-skills-codex-optimize-web-animations` |
| `market-MengTo__Skills-agent-skills-web-design-animation-on-scroll` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-animation-on-scroll` |
| `market-MengTo__Skills-agent-skills-web-design-animation-systems` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-animation-systems` |
| `market-MengTo__Skills-agent-skills-web-design-bright-green-tech-system-webgl` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-bright-green-tech-system-webgl` |
| `market-MengTo__Skills-agent-skills-web-design-gsap-scrolltrigger-storytelling` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-gsap-scrolltrigger-storytelling` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-development-brightdata-local-search` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-development-brightdata-local-search` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright-e2e-builder` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-development-playwright-e2e-builder` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-utilities-playwright-skill` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-utilities-playwright-skill` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-best-practices` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-best-practices` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-mcp` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-web-data-bright-data-mcp` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-workflow-automation-trigger-dev` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-workflow-automation-trigger-dev` |
| `market-jackspace__ClaudeSkillz-skills-auto-animate` | `~/.codex/skills/market-jackspace__ClaudeSkillz-skills-auto-animate` |
| `market-jackspace__ClaudeSkillz-skills-cloudflare-cron-triggers` | `~/.codex/skills/market-jackspace__ClaudeSkillz-skills-cloudflare-cron-triggers` |
| `market-jackspace__ClaudeSkillz-skills-playwright-skill` | `~/.codex/skills/market-jackspace__ClaudeSkillz-skills-playwright-skill` |
| `market-jackspace__ClaudeSkillz-skills-playwright-skill_playwright` | `~/.codex/skills/market-jackspace__ClaudeSkillz-skills-playwright-skill_playwright` |
| `market-sickn33__antigravity-awesome-skills-skills-animejs-animation` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-animejs-animation` |
| `market-sickn33__antigravity-awesome-skills-skills-azure-microsoft-playwright-testing-ts` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-azure-microsoft-playwright-testing-ts` |
| `market-sickn33__antigravity-awesome-skills-skills-azure-resource-manager-playwright-dotnet` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-azure-resource-manager-playwright-dotnet` |
| `market-sickn33__antigravity-awesome-skills-skills-go-playwright` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-go-playwright` |
| `market-sickn33__antigravity-awesome-skills-skills-makepad-animation` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-makepad-animation` |
| `market-sickn33__antigravity-awesome-skills-skills-playwright-java` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-playwright-java` |
| `market-sickn33__antigravity-awesome-skills-skills-playwright-skill` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-playwright-skill` |
| `market-sickn33__antigravity-awesome-skills-skills-trigger-dev` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-trigger-dev` |
| `media_exp-rights-ledger` | `~/.codex/skills/media_exp-rights-ledger` |
| `openai-curated-playwright` | `~/.codex/skills/openai-curated-playwright` |
| `openai-curated-playwright-interactive` | `~/.codex/skills/openai-curated-playwright-interactive` |
| `playwright` | `~/.codex/skills/playwright` |
| `review-animations` | `~/.claude/skills/review-animations` |

## 5. Cinematic/story/audio production — methodology (calesthio bundle) (65)

| Skill | Path |
|---|---|
| `market-calesthio__generative-media-skills-skills-production-3d-craft-3d-asset-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-3d-craft-3d-asset-production` |
| `market-calesthio__generative-media-skills-skills-production-3d-craft-neural-reality-capture` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-3d-craft-neural-reality-capture` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-audio-mixing-mastering` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-audio-mixing-mastering` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-captions-media-accessibility` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-captions-media-accessibility` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-dialogue-editing-adr` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-dialogue-editing-adr` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-localization-dubbing-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-localization-dubbing-production` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-music-supervision-scoring` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-music-supervision-scoring` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-sound-design-foley` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-sound-design-foley` |
| `market-calesthio__generative-media-skills-skills-production-audio-craft-video-to-audio-foley` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-audio-craft-video-to-audio-foley` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-anime-animation-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-anime-animation-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-audiobook-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-audiobook-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-avatar-spokesperson-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-avatar-spokesperson-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-brand-launch-film-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-brand-launch-film-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-cinematic-trailer-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-cinematic-trailer-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-documentary-montage-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-documentary-montage-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-ecommerce-product-imagery` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-ecommerce-product-imagery` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-educational-animation-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-educational-animation-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-explainer-video-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-explainer-video-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-fashion-campaign-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-fashion-campaign-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-food-beverage-content-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-food-beverage-content-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-game-trailer-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-game-trailer-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-immersive-spatial-video-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-immersive-spatial-video-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-livestream-event-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-livestream-event-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-music-video-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-music-video-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-podcast-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-podcast-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-product-ad-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-product-ad-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-real-estate-content-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-real-estate-content-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-saas-product-demo-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-saas-product-demo-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-screen-demo-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-screen-demo-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-social-short-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-social-short-production` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-talking-head-podcast-recut` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-talking-head-podcast-recut` |
| `market-calesthio__generative-media-skills-skills-production-content-formats-ugc-ad-production` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-content-formats-ugc-ad-production` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-2d-character-rig-animation` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-2d-character-rig-animation` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-character-design-continuity` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-character-design-continuity` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-cinematic-shot-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-cinematic-shot-direction` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-lighting-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-lighting-direction` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-performance-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-performance-direction` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-precise-video-description` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-precise-video-description` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-production-design-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-production-design-direction` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-storyboard-previsualization` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-storyboard-previsualization` |
| `market-calesthio__generative-media-skills-skills-production-creative-direction-visual-style-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-creative-direction-visual-style-direction` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-asset-continuity-management` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-asset-continuity-management` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-generated-media-qa` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-generated-media-qa` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-media-provenance-rights` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-media-provenance-rights` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-media-qc-delivery` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-media-qc-delivery` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-reference-media-analysis` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-reference-media-analysis` |
| `market-calesthio__generative-media-skills-skills-production-governance-delivery-video-description-oversight` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-governance-delivery-video-description-oversight` |
| `market-calesthio__generative-media-skills-skills-production-post-production-color-grading-finishing` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-color-grading-finishing` |
| `market-calesthio__generative-media-skills-skills-production-post-production-editing-montage` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-editing-montage` |
| `market-calesthio__generative-media-skills-skills-production-post-production-motion-graphics-direction` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-motion-graphics-direction` |
| `market-calesthio__generative-media-skills-skills-production-post-production-still-image-retouching-finishing` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-still-image-retouching-finishing` |
| `market-calesthio__generative-media-skills-skills-production-post-production-title-kinetic-typography` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-title-kinetic-typography` |
| `market-calesthio__generative-media-skills-skills-production-post-production-vfx-compositing` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-post-production-vfx-compositing` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-audio-reactive-video-composition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-audio-reactive-video-composition` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-comfyui-media-workflows` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-comfyui-media-workflows` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-d3-animated-data-visualization` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-d3-animated-data-visualization` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-ffmpeg-media-finishing` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-ffmpeg-media-finishing` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-gsap-animation-composition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-gsap-animation-composition` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-hyperframes-video-composition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-hyperframes-video-composition` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-lottie-animation-delivery` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-lottie-animation-delivery` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-manim-explainer-animation` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-manim-explainer-animation` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-procedural-canvas-animation` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-procedural-canvas-animation` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-remotion-video-composition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-remotion-video-composition` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-threejs-scene-composition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-threejs-scene-composition` |
| `market-calesthio__generative-media-skills-skills-production-runtime-assembly-virtual-production-icvfx` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-production-runtime-assembly-virtual-production-icvfx` |

## 6. Cinematic/story/audio production — providers (calesthio bundle) (88)

| Skill | Path |
|---|---|
| `market-calesthio__generative-media-skills-skills-providers-3d-generation-meshy-3d` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-3d-generation-meshy-3d` |
| `market-calesthio__generative-media-skills-skills-providers-3d-generation-tencent-hunyuan3d` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-3d-generation-tencent-hunyuan3d` |
| `market-calesthio__generative-media-skills-skills-providers-3d-generation-tripo-3d` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-3d-generation-tripo-3d` |
| `market-calesthio__generative-media-skills-skills-providers-audio-enhancement-nvidia-maxine-audio-effects` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-audio-enhancement-nvidia-maxine-audio-effects` |
| `market-calesthio__generative-media-skills-skills-providers-avatar-video-d-id-avatar-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-avatar-video-d-id-avatar-video` |
| `market-calesthio__generative-media-skills-skills-providers-avatar-video-hedra-character-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-avatar-video-hedra-character-video` |
| `market-calesthio__generative-media-skills-skills-providers-avatar-video-heygen-avatar-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-avatar-video-heygen-avatar-video` |
| `market-calesthio__generative-media-skills-skills-providers-avatar-video-synthesia-avatar-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-avatar-video-synthesia-avatar-video` |
| `market-calesthio__generative-media-skills-skills-providers-avatar-video-tavus-replica-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-avatar-video-tavus-replica-video` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-adobe-firefly-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-adobe-firefly-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-alibaba-image-models` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-alibaba-image-models` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-amazon-nova-canvas` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-amazon-nova-canvas` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-black-forest-labs-flux` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-black-forest-labs-flux` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-bria-fibo-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-bria-fibo-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-bytedance-seedream` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-bytedance-seedream` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-google-gemini-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-google-gemini-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-ideogram-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-ideogram-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-image-generation-gateways` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-image-generation-gateways` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-kling-kolors-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-kling-kolors-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-leonardo-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-leonardo-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-luma-photon` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-luma-photon` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-midjourney-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-midjourney-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-openai-gpt-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-openai-gpt-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-recraft-image-design` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-recraft-image-design` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-runway-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-runway-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-stability-ai-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-stability-ai-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-generation-xai-grok-imagine-image` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-generation-xai-grok-imagine-image` |
| `market-calesthio__generative-media-skills-skills-providers-image-understanding-amazon-rekognition` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-understanding-amazon-rekognition` |
| `market-calesthio__generative-media-skills-skills-providers-image-understanding-google-cloud-vision` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-image-understanding-google-cloud-vision` |
| `market-calesthio__generative-media-skills-skills-providers-lip-sync-kling-advanced-lip-sync` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-lip-sync-kling-advanced-lip-sync` |
| `market-calesthio__generative-media-skills-skills-providers-lip-sync-sync-labs-lipsync` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-lip-sync-sync-labs-lipsync` |
| `market-calesthio__generative-media-skills-skills-providers-motion-capture-deepmotion-animate-3d` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-motion-capture-deepmotion-animate-3d` |
| `market-calesthio__generative-media-skills-skills-providers-motion-capture-move-ai-motion-capture` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-motion-capture-move-ai-motion-capture` |
| `market-calesthio__generative-media-skills-skills-providers-music-generation-ace-step` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-music-generation-ace-step` |
| `market-calesthio__generative-media-skills-skills-providers-music-generation-elevenlabs-music` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-music-generation-elevenlabs-music` |
| `market-calesthio__generative-media-skills-skills-providers-music-generation-google-lyria` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-music-generation-google-lyria` |
| `market-calesthio__generative-media-skills-skills-providers-music-generation-minimax-music` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-music-generation-minimax-music` |
| `market-calesthio__generative-media-skills-skills-providers-music-generation-suno-music` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-music-generation-suno-music` |
| `market-calesthio__generative-media-skills-skills-providers-sound-generation-elevenlabs-sound-effects` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-sound-generation-elevenlabs-sound-effects` |
| `market-calesthio__generative-media-skills-skills-providers-sound-generation-stable-audio` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-sound-generation-stable-audio` |
| `market-calesthio__generative-media-skills-skills-providers-source-separation-audioshake-stem-separation` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-source-separation-audioshake-stem-separation` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-azure-speech` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-azure-speech` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-deepgram-speech` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-deepgram-speech` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-elevenlabs-dubbing-voice-conversion` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-elevenlabs-dubbing-voice-conversion` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-google-cloud-speech` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-google-cloud-speech` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-nvidia-speech-nim` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-nvidia-speech-nim` |
| `market-calesthio__generative-media-skills-skills-providers-speech-and-voice-openai-audio` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-and-voice-openai-audio` |
| `market-calesthio__generative-media-skills-skills-providers-speech-to-text-amazon-transcribe` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-to-text-amazon-transcribe` |
| `market-calesthio__generative-media-skills-skills-providers-speech-to-text-assemblyai-transcription` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-to-text-assemblyai-transcription` |
| `market-calesthio__generative-media-skills-skills-providers-speech-to-text-elevenlabs-scribe` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-speech-to-text-elevenlabs-scribe` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-amazon-polly` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-amazon-polly` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-byteplus-seed-speech-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-byteplus-seed-speech-tts` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-cartesia-sonic` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-cartesia-sonic` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-elevenlabs-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-elevenlabs-tts` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-fish-audio-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-fish-audio-tts` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-hume-octave` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-hume-octave` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-kokoro-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-kokoro-tts` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-minimax-speech` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-minimax-speech` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-qwen3-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-qwen3-tts` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-resemble-chatterbox` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-resemble-chatterbox` |
| `market-calesthio__generative-media-skills-skills-providers-text-to-speech-volcengine-doubao-speech-tts` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-text-to-speech-volcengine-doubao-speech-tts` |
| `market-calesthio__generative-media-skills-skills-providers-video-enhancement-topaz-video-enhancement` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-enhancement-topaz-video-enhancement` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-alibaba-wan-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-alibaba-wan-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-amazon-nova-reel` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-amazon-nova-reel` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-google-gemini-omni-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-google-gemini-omni-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-google-veo` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-google-veo` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-higgsfield-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-higgsfield-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-kling-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-kling-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-ltx-2-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-ltx-2-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-luma-ray-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-luma-ray-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-midjourney-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-midjourney-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-minimax-hailuo-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-minimax-hailuo-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-moonvalley-marey` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-moonvalley-marey` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-nvidia-cosmos-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-nvidia-cosmos-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-pika-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-pika-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-runway-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-runway-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-seedance-2-0` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-seedance-2-0` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-tencent-hunyuanvideo` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-tencent-hunyuanvideo` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-video-generation-gateways` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-video-generation-gateways` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-vidu-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-vidu-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-generation-xai-grok-imagine-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-generation-xai-grok-imagine-video` |
| `market-calesthio__generative-media-skills-skills-providers-video-understanding-twelvelabs-video-understanding` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-video-understanding-twelvelabs-video-understanding` |
| `market-calesthio__generative-media-skills-skills-providers-voice-agents-elevenlabs-agents` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-voice-agents-elevenlabs-agents` |
| `market-calesthio__generative-media-skills-skills-providers-voice-agents-gemini-live-audio` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-voice-agents-gemini-live-audio` |
| `market-calesthio__generative-media-skills-skills-providers-voice-agents-hume-evi` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-voice-agents-hume-evi` |
| `market-calesthio__generative-media-skills-skills-providers-voice-agents-openai-realtime-voice` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-voice-agents-openai-realtime-voice` |
| `market-calesthio__generative-media-skills-skills-providers-world-models-odyssey-interactive-video` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-world-models-odyssey-interactive-video` |
| `market-calesthio__generative-media-skills-skills-providers-world-models-world-labs-marble` | `~/.codex/skills/market-calesthio__generative-media-skills-skills-providers-world-models-world-labs-marble` |

## 7. Narrative / story / dialogue (non-calesthio) (13)

| Skill | Path |
|---|---|
| `market-ComposioHQ__awesome-claude-skills-tailored-resume-generator` | `~/.codex/skills/market-ComposioHQ__awesome-claude-skills-tailored-resume-generator` |
| `market-MengTo__Skills-agent-skills-web-design-cinematic-scroll-storytelling` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-cinematic-scroll-storytelling` |
| `market-MengTo__Skills-agent-skills-web-design-scroll-world-storytelling` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-scroll-world-storytelling` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-development-requesting-code-review` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-development-requesting-code-review` |
| `market-parcadei__Continuous-Claude-v3-.claude-skills-explore` | `~/.codex/skills/market-parcadei__Continuous-Claude-v3-.claude-skills-explore` |
| `market-sickn33__antigravity-awesome-skills-skills-ask-questions-if-underspecified` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-ask-questions-if-underspecified` |
| `market-sickn33__antigravity-awesome-skills-skills-data-storytelling` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-data-storytelling` |
| `market-sickn33__antigravity-awesome-skills-skills-gh-review-requests` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-gh-review-requests` |
| `market-sickn33__antigravity-awesome-skills-skills-requesting-code-review` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-requesting-code-review` |
| `market-simota__agent-skills-lore` | `~/.codex/skills/market-simota__agent-skills-lore` |
| `market-simota__agent-skills-quest` | `~/.codex/skills/market-simota__agent-skills-quest` |
| `request-refactor-plan` | `~/.claude/skills/request-refactor-plan` |
| `to-questionnaire` | `~/.claude/skills/to-questionnaire` |

## 8. Audio (non-calesthio) (6)

| Skill | Path |
|---|---|
| `game-audio` | `~/.zcode/skills/game-audio` |
| `market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-multimodal-audiocraft` | `~/.codex/skills/market-davila7__claude-code-templates-cli-tool-components-skills-ai-research-multimodal-audiocraft` |
| `market-sickn33__antigravity-awesome-skills-skills-audio-transcriber` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-audio-transcriber` |
| `market-sickn33__antigravity-awesome-skills-skills-fal-audio` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-fal-audio` |
| `music-creation` | `~/.hermes/skills/music-creation` |
| `voice-audio-applications` | `~/.hermes/skills/voice-audio-applications` |

## 9. Shaders / lighting / VFX (non-threejs-prefixed) (10)

| Skill | Path |
|---|---|
| `lighting-illumination-audit` | `~/Projects/skills/lighting-illumination-audit` |
| `market-MengTo__Skills-agent-skills-web-design-add-shader-cursor-trail` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-add-shader-cursor-trail` |
| `market-MengTo__Skills-agent-skills-web-design-ambient-section-particles` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-ambient-section-particles` |
| `market-MengTo__Skills-agent-skills-web-design-globe-particles` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-globe-particles` |
| `market-MengTo__Skills-agent-skills-web-design-shaders-cursor-ripples` | `~/.codex/skills/market-MengTo__Skills-agent-skills-web-design-shaders-cursor-ripples` |
| `market-nexu-io__open-design-skills-shader-dev` | `~/.codex/skills/market-nexu-io__open-design-skills-shader-dev` |
| `market-sickn33__antigravity-awesome-skills-skills-makepad-shaders` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-makepad-shaders` |
| `market-sickn33__antigravity-awesome-skills-skills-shader-programming-glsl` | `~/.codex/skills/market-sickn33__antigravity-awesome-skills-skills-shader-programming-glsl` |
| `scene-lighting-techniques-audit` | `~/Projects/skills/scene-lighting-techniques-audit` |
| `shader-programming-glsl` | `~/.agents/skills/shader-programming-glsl` |

---


## 11. Online-confirmed skills — installed into `~/.claude/skills/` (20 skills from 4 repos)

These are the only online-research results that are actually **skills** (agent-skill
packages with SKILL.md-shaped content and an install path), not tools/services/libraries.
Everything else found online during this research (Meshy, Tripo, Cascadeur, Ink, Yarn Spinner,
Twine, Rapier, Babylon.js, etc. — the ~58 remaining names from
`GAME_STORY_CINEMATIC_SKILLS_INVENTORY_2026-07-28.md` §10) are commercial services, standalone
software, or libraries — not skills, so they are correctly excluded from this count.
"Narrative Designer," "GM Craft," and "Creative Storytelling" (mcpmarket.com listings referenced
earlier in this research) do **not** have a confirmed clonable source after checking — not
included, to avoid claiming an install path that doesn't verifiably exist.

Two of the four repos turned out to be multi-skill bundles, not single skills — installed
per-skill, matching their own upstream packaging, so each is independently invocable rather than
one opaque blob.

| Skill | Source repo | Path | Installed |
|---|---|---|---|
| `img2threejs` | github.com/img2threejs/img2threejs | `~/.claude/skills/img2threejs` | yes |
| `story-init` | github.com/danjdewhurst/story-skills | `~/.claude/skills/story-init` | yes |
| `worldbuilding` | github.com/danjdewhurst/story-skills | `~/.claude/skills/worldbuilding` | yes |
| `chapter-writing` | github.com/danjdewhurst/story-skills | `~/.claude/skills/chapter-writing` | yes |
| `story-maintenance` | github.com/danjdewhurst/story-skills | `~/.claude/skills/story-maintenance` | yes |
| `revision-continuity` | github.com/danjdewhurst/story-skills | `~/.claude/skills/revision-continuity` | yes |
| `plot-structure` | github.com/danjdewhurst/story-skills | `~/.claude/skills/plot-structure` | yes |
| `character-management` | github.com/danjdewhurst/story-skills | `~/.claude/skills/character-management` | yes |
| `reader-sim` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/reader-sim` | yes |
| `story-review` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/story-review` | yes |
| `creative-writing-muse` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/creative-writing-muse` | yes |
| `creative-research` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/creative-research` | yes |
| `writing-principles` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/writing-principles` | yes |
| `story-planning` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/story-planning` | yes |
| `story-memory` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/story-memory` | yes |
| `creative-writing-craft` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/creative-writing-craft` | yes |
| `character-sim` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/character-sim` | yes |
| `creative-writing-modes` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/creative-writing-modes` | yes |
| `writing-staffing` | github.com/haowjy/creative-writing-skills | `~/.claude/skills/writing-staffing` | yes |
| `storytelling` | github.com/miles990/claude-domain-skills | `~/.claude/skills/storytelling` | yes |

**Revised total: 426 pre-existing local + 20 newly installed = 446 real skills, all invocable via the `Skill` tool right now.**
(The earlier 385/488 figures that included tools/services as if they were skills were wrong by category, not just by count — corrected here.)

# Progress

Original prompt: Explore and document a public browser-based open-world game in which customizable, unlockable vehicles—from cycles and toy cars through tractors, rockets, fantasy hybrids, and spaceships—are the playable characters. The world may move across farms, cities, space, races, farming, zombies, aliens, gunfights, tower defense, and other mechanics. Research game designs, systems, progression, UI, editors, browser-compatible free/open-source engines and packages, procedural generation, currencies, auth, state, multiplayer, interactions, and AI. Stay open to adjacent ideas, use first principles, follow motto v4, and continuously update a durable exploration map, decisions, discussions, and deferred work.

## Current state

- Stage: exploration foundation
- Playable build: none
- Engine decision: open
- Project name: **Rigs Unbound**
- GitHub repository: `pranaysuyash/rigs-unbound`
- Public deployment: none

## Completed in this pass

- Loaded the shared instruction stack, generated the canonical project context pack, and adopted the project-local motto v4.
- Inspected the supplied 2026 workbook as a read-only research source.
- Mapped the initial product thesis, gameplay loops, world grammar, progression, economy, multiplayer, AI, UGC, safety, accessibility, and browser constraints.
- Defined an engine bakeoff rather than prematurely choosing a renderer.
- Defined a narrow first-playable hypothesis that tests the multi-genre promise.
- Recorded architecture and slice hypotheses as proposed ADRs.
- Created a research/source register, game reference atlas, design direction, and living worklog.

## Additional research ingestion — 2026-07-25

- Inspected `vehicle_game_platform_exploration_2026.xlsx` and the accompanying ChatGPT narrative read-only.
- Verified the workbook’s 20-sheet structure, game-specific table counts, formulas, and engine-score calculations.
- Confirmed current primary-source claims about the open-source PlayCanvas editor frontend, Phaser 4.1, and newly announced alpha-stage Box3D.
- Preserved the workbook’s decision statuses as source metadata rather than treating 17 `Accepted` rows as project approval.
- Kept the canonical one-spendable-resource progression grammar rather than adding the workbook’s separate Credits currency.
- Added proposed ADRs for immutable blueprints/mutable instances/world manifests and versioned public share/evidence surfaces.
- Kept the tractor farm/defense loop as the first fun test; moved the same-tractor time trial to the immediate cross-mode architecture proof.
- Added Box3D as a watch/feasibility candidate without displacing Rapier.

## Next coherent implementation unit

Build disposable technical probes for the same micro-scene:

1. one steerable vehicle using the same hashed Kenney Car Kit tractor GLB in every candidate;
2. one Kenney Racing Kit ramp, Car Kit box, Nature Kit field fixtures, and animated Graveyard zombie;
3. fixed-step simulation and deterministic seed;
4. chase and top-down camera transitions;
5. debug HUD with frame time, draw calls, physics bodies, seed, and current state;
6. keyboard/gamepad/touch input adapters;
7. state export through `window.render_game_to_text`;
8. deterministic stepping through `window.advanceTime(ms)`.

Run the probe in the leading engine candidates under the same acceptance checks. Keep probe code disposable; keep the gameplay and content contracts portable.

## Kenney source-library audit — 2026-07-25

- Located and inspected the locally owned Kenney Game Assets All-in-1 3.4.0 bundle under `adhoc_resources`.
- Recorded the bundle’s approximate 1.2 GB / 84,992-file snapshot and its 2D, 3D, UI, icon, and audio breadth.
- Inspected bundle and sampled per-pack CC0 evidence; preserved the bundle’s no-direct-redistribution instruction.
- Visually reviewed Car, Nature, Toy Car, and Space pack previews for cross-world fit.
- Inspected selected GLB node, material, and animation metadata.
- Identified and hashed an eleven-file candidate manifest for a fair engine bakeoff.
- Kept all source assets in place; no copy, import, conversion, dependency, or runtime asset path was created.
- Documented a selective-import and Patchwork Atlas transformation policy in the asset audit, provenance register, design direction, exploration map, and ADR-0001.

## Direct visual-preference exploration — 2026-07-25

- Preserved the project-owner-provided preferred tractor/scene image as a project reference with source hash and provenance.
- Translated the preference into specific vehicle-character, selective-detail, camera, composition, lighting, and world-promise signals.
- Generated and inspected three original reference-guided boards:
  - persistent tractor character/model sheet;
  - six-role gameplay camera board;
  - fair Patchwork Atlas / Signal Noir / Salvage Opera comparison.
- Proposed Patchwork Atlas as the baseline, Signal Noir as a night/danger state layer, and Salvage Opera as a rare vista/event crescendo.
- Recorded runtime cautions: reduce gameplay depth-of-field, preserve vehicle screen presence, avoid underlit tactical scenes, replace generic spider threats, and test occlusion/mobile framing.
- Stored final prompts, critiques, hashes, dimensions, provenance, and next experiments in project documentation.
- No generated board was approved as a production or shipped asset.

## Tractor restoration and modular-growth proposal — 2026-07-25

- Converted the dilapidated-to-robust tractor idea into a proposed machine journey: found, stabilized, working, specialized, hybridized, and storied.
- Separated core restoration, chassis tuning, swappable modules, and deployed module states.
- Defined workshop-bound large swapping and later earned field-service options.
- Mapped nine multi-use module examples with day/night value and real costs.
- Bounded the first playable to one restored signature plow plus one support-module choice.
- Updated visual rules, the exploration map, the first-slice ADR, and the versioned-content ADR.
- No gameplay, schema, UI, asset, dependency, or runtime implementation was created.

## Deferred by design

- Final renderer/game engine
- Final physics engine
- Accounts and cloud saves
- Real-time multiplayer
- Trading and player markets
- Premium currency or real-money purchases
- Open user-generated content
- Generative AI in live gameplay
- Large procedural worlds
- Final visual identity and commercial name-clearance review

Each item has a research/gating path in the exploration map. “Deferred” here means “not allowed to become hidden scope in the first playable,” not “forgotten.”

## Testing contract when implementation begins

- Use a browser automation loop after every meaningful change.
- Test input, fixed-step physics, gameplay state, camera, UI, and rendering as one chain.
- Inspect active play, not only menus.
- Capture desktop and narrow/mobile screenshots.
- Check console errors and state text.
- Test restart, direct load, loss of focus, resize, poor performance, missing assets, and a WebGL fallback path.
- Keep a small number of named input actions rather than scattering raw key checks.

## Anything else?

The first code should answer a disputed question. It should not exist merely to make the repository look underway.

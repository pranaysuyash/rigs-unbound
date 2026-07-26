# Rigs Unbound

**Rigs Unbound** is a public browser-game exploration about **vehicles as the playable characters**. A bicycle, tractor, toy car, rocket, fantasy machine, or hybrid vehicle should not merely be a skin: its shape, movement, tools, limitations, history, and upgrades should change which stories and mechanics become possible.

The project is deliberately in **exploration**, not production. A local 3D field test is now playable, but no engine, final art direction, backend, economy, or multiplayer model has been accepted yet.

Repository: [github.com/pranaysuyash/rigs-unbound](https://github.com/pranaysuyash/rigs-unbound)

## Current north star

> Build a playful world where every vehicle is a different verb, and where changing place, scale, time, or danger can transform the genre without erasing the player's machine, progress, or consequences.

**Public playable:** [Rigs Unbound on OpenAI Sites](https://rigs-unbound.suyashpranay.chatgpt.site)

The recurring loop under investigation is:

1. choose or continue caring for a vehicle;
2. enter a place with opportunities rather than a mode-selection menu;
3. use that vehicle's capabilities to race, build, farm, fight, haul, explore, or rescue;
4. bring back parts, knowledge, relationships, damage, and stories;
5. modify the vehicle and unlock genuinely different possibilities.

## Run Field 02

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4173/](http://127.0.0.1:4173/).

The replaceable-dynamics evidence fixture is available at
[Physics Lab 01](http://127.0.0.1:4173/physics-lab.html). It uses a separate
Vite entry so its Rapier WebAssembly dependency does not define or block the
Field 02 runtime.

The bounded physical-wheel comparison is available at
[Box3D Probe 01](http://127.0.0.1:4173/box3d-lab.html). It uses an exact
`box3d-wasm` pin, project-owned TypeScript declarations and adapter, and a
separately loaded Box3D WASM route. It is evidence, not the product runtime or a
final solver decision.

Current controls:

- `WASD` or arrow keys: drive and reverse;
- `Space` or `E`: use the current capability—attach/release cargo, or operate the tractor plough when no cargo is in reach;
- `R`: cycle the persistent utility tractor (**Torque**), toy buggy (**Spark**),
  and marsh skimmer (**Drift**);
- `C`: cycle Chase, Hood, Side, Tactical, Top-down, and Survey views;
- `View` selector: jump directly to any camera policy;
- `B`: switch Torque's blade between cut and fill;
- `X`: use a fitted recovery winch;
- `N`: day/gloam/night presentation;
- `P` or `Escape`: pause.

Gamepad driving and responsive touch controls use the same named actions. All
three rigs, cargo-relay progress, condition, terrain deformation, salvage, modules,
plough marks, surveyed cells, and discoveries are stored in one validated local
browser record. Existing Field Test 001 and Rig Lab 01 saves migrate into the
v4 bounded-mobility schema; v3 Field 02 records preserve Torque and Spark and
add Drift at the Sunken Flats.

`window.render_game_to_text()`, `window.advanceTime(ms)`,
`window.applyRigInput(input, ms)`, `window.selectRig(id)`,
`window.selectCamera(mode)`, `window.getRigOrientationEvidence(id)`,
`window.getRigPerceptionEvidence(id)`, `window.performRigAction()`, and
`window.getPerformanceSnapshot()` expose the browser-test and observability
contract.

The current activity asks any tow-capable rig to move one relay crate to the
same gate. Torque is slower and stable under load; Spark accelerates and turns
faster and can launch from the relay ramp; Drift uses a real low-hover adapter
to cross water without wheel state, but loses authority and gains strain on
steep ground. This is a provisional Three.js reference runtime using
reproducible primitive geometry—not a final-engine decision.

## Start here

- [Docs root landing page](docs/README.md)
- [Research landing page](docs/research/README.md)
- [3D Game Contract Index](docs/research/3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- [Master execution tracker](docs/plans/MASTER_EXECUTION_TRACKER.md)
- [Exploration map](docs/exploration/EXPLORATION_MAP.md)
- [Compositional episode grammar and Storm Relay](docs/exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
- [Wide-open concept exploration](docs/exploration/OPEN_WORLD_VEHICLE_GAME_BRAINSTORM_2026-07-25.md)
- [Visual direction preference and variants](docs/exploration/VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md)
- [Tractor restoration and modular growth](docs/exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md)
- [Technology and engine options](docs/research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md)
- [Tagged skill coverage and next call](docs/research/TAGGED_SKILL_COVERAGE_MAP_2026-07-25.md)
- [Additional ChatGPT research ingestion](docs/research/ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md)
- [Game reference atlas](docs/research/GAME_REFERENCE_ATLAS_2026-07-25.md)
- [Risk and public-readiness register](docs/research/RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)
- [Asset provenance register](docs/research/ASSET_PROVENANCE_REGISTER.md)
- [Kenney asset library audit](docs/research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md)
- [Browser vehicle-physics technique catalog](docs/research/BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG_2026-07-25.md)
- [Physics Lab 01 plan](docs/plans/PHYSICS_LAB_01_2026-07-25.md)
- [Physics Lab 01 acceptance](docs/reviews/PHYSICS_LAB_01_ACCEPTANCE_2026-07-25.md)
- [Box3D browser comparison plan](docs/plans/BOX3D_BROWSER_COMPARISON_01_2026-07-25.md)
- [Box3D Probe 01 acceptance](docs/reviews/BOX3D_PROBE_01_ACCEPTANCE_2026-07-25.md)
- [Minimap and world-coordinate contract](docs/research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md)
- [ADR-0001: architecture experiments](docs/decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md)
- [ADR-0002: first playable hypothesis](docs/decisions/ADR-0002-first-playable-tractor-day-night-loop.md)
- [ADR-0003: versioned gameplay-content composition](docs/decisions/ADR-0003-versioned-gameplay-content-composition.md)
- [ADR-0004: versioned public evidence surfaces](docs/decisions/ADR-0004-versioned-public-evidence-surfaces.md)
- [ADR-0005: Rigs Unbound project identity](docs/decisions/ADR-0005-rigs-unbound-project-identity.md)
- [ADR-0006: rig profiles, capabilities, and contrasting evidence](docs/decisions/ADR-0006-rig-capability-portability.md)
- [ADR-0007: terrain as the simulation substrate](docs/decisions/ADR-0007-terrain-as-simulation-substrate.md)
- [ADR-0008: camera policies and direct view selection](docs/decisions/ADR-0008-camera-policies-and-direct-view-selection.md)
- [ADR-0009: bounded mobility adapters](docs/decisions/ADR-0009-bounded-mobility-adapters.md)
- [ADR-0010: rendering and accessibility contract](docs/decisions/ADR-0010-rendering-accessibility-contract.md)
- [ADR-0011: command, capability, affordance, and state separation](docs/decisions/ADR-0011-command-capability-affordance-state-separation.md)
- [ADR-0012: shared rig-perception chain](docs/decisions/ADR-0012-rig-perception-chain.md)
- [ADR-0013: Sites deployment adapter](docs/decisions/ADR-0013-sites-deployment-adapter.md)
- [ADR-0017: replaceable dynamics foundation](docs/decisions/ADR-0017-replaceable-dynamics-foundation.md)
- [ADR-0018: Rig Journey, Verb Mastery, and Insight](docs/decisions/ADR-0018-journey-mastery-insight-progression-spine.md)
- [Sites update and deployment runbook](docs/operations/SITES_UPDATE_AND_DEPLOY_RUNBOOK.md)
- [Latest motto compliance review](docs/reviews/motto_review.md)
- [Playable foundation plan and acceptance contract](docs/plans/PLAYABLE_FOUNDATION_2026-07-25.md)
- [Rig Lab 01 plan](docs/plans/RIG_LAB_01_2026-07-25.md)
- [Open-world traversal foundation](docs/plans/OPEN_WORLD_TRAVERSAL_2026-07-25.md)
- [Marsh Skimmer 01 plan](docs/plans/MARSH_SKIMMER_01_2026-07-25.md)
- [Rig Perception Chain 01 plan](docs/plans/RIG_PERCEPTION_CHAIN_01_2026-07-25.md)
- [Rig Perception Chain 01 acceptance](docs/reviews/RIG_PERCEPTION_CHAIN_01_ACCEPTANCE_2026-07-25.md)
- [Sites deployment acceptance](docs/reviews/SITES_DEPLOYMENT_ACCEPTANCE_2026-07-25.md)
- [Rig Lab 01 acceptance review](docs/reviews/RIG_LAB_01_ACCEPTANCE_2026-07-25.md)
- [Design direction](DESIGN.md)
- [Worklog and evidence](docs/WORKLOG.md)
- [Implementation progress](progress.md)

## Present boundaries

- The supplied 2026 JavaScript/Python animation, simulation, physics, 2D, and 3D catalog is research input, not a dependency list.
- “Anything goes” describes the exploration space. The shipped game still needs a coherent core loop, performance budget, safety model, and content grammar.
- Multiplayer, accounts, user-generated content, trading, and real-money purchases are separate risk-bearing systems. They will only enter a playable after their player value and authority model are proven.
- Generated worlds will be **seeded and constrained by authored rules**. Procedural does not mean unbounded, unreviewed, or content-complete.
- Public means playable from a link, understandable without the creator present, respectful of player data, and honest about its maturity.
- Public repository visibility is not a software or asset license. Reuse rights remain reserved until a project license is deliberately selected; third-party and generated assets retain their separately recorded terms.

## Evidence status

Current evidence includes planning and primary-source research (Tier 1), 108
passing root tests plus seven preserved kernel-probe tests and clean TypeScript
checks (Tier 2), a production build plus automated terrain, camera, cargo, jump,
hover, perception-chain, reduced-motion, and schema-v5 save interaction checks
(Tier 3), a separate Physics Lab build plus automated dynamic-chassis,
raycast-wheel, surface, capture/reset, and camera checks (Tier 3), and observed
desktop/narrow local browser play (Tier 4). A separate Box3D experiment now adds
physical wheel joints, same-runtime repeatability, full-assembly recovery,
semantic forward/steering input, all six views, desktop/narrow evidence, and a
production-route load check (Tier 3/4); collision semantics, minimap integration,
native recording bindings, and like-for-like Jolt comparison remain open. The
public Sites version 7 is accepted with a terminal `succeeded` status, HTTP 200
responses for Field 02 and both public evidence lab routes, and full production
browser acceptance of schema-v6 state, three-rig acquisition, camera and terrain
boundaries, persistence, input parity, and narrow layout with zero captured
console/page or recent Worker errors (Tier 4). This does not add a
representative-device benchmark, external-player comprehension, multiplayer,
production-service, or commercial-launch claim.

## Anything else?

The next irreversible-looking choice should be resisted until a tiny competing prototype can answer it. A ten-minute playable that feels alive is more valuable than a large architecture that can theoretically host every idea.

# Additional ChatGPT Research Ingestion

Date: 2026-07-25
Status: reconciled research input; not automatic project truth

## Sources

### Structured workbook

- Source: private, user-provided research workbook outside the repository (`vehicle_game_platform_exploration_2026.xlsx`)
- SHA-256: `149e87a1a82e36a9b4bfe3d45c3954f56c12f9e30115bd0998ef3696a62af993`
- Size observed: approximately 280 KB
- Handling: read-only; not copied, edited, recalculated, or resaved

### Narrative synthesis

- Source: private, user-provided narrative attachment outside the repository (`pasted-text.txt`)
- SHA-256: `9865316570decd61682f3104524333ffa1a2d0d0930d0da1a60f9093ed7cc2a2`
- Snapshot: 268 lines, approximately 1,905 words
- Handling: read-only

These are AI-produced research artifacts. Under the project’s AI-output boundary, their facts, scores, statuses, and recommendations are proposals until checked against current sources, current project decisions, and eventually runtime evidence.

## Workbook integrity snapshot

The workbook opened successfully with the bundled Python/openpyxl runtime. It contains:

- 20 sheets;
- the original 7 catalog sheets;
- 13 game-specific sheets;
- 22 structured Excel tables;
- 42 formulas;
- 3 charts;
- 409 preserved master-catalog entries.

The game-specific table counts match the narrative claims:

| Sheet/domain                |                                     Verified structured rows |
| --------------------------- | -----------------------------------------------------------: |
| Gameplay modes              |                                                           45 |
| Vehicle records             | 43: 27 archetypes, 11 component classes, 5 canonical systems |
| Engine/framework candidates |                                                           14 |
| Architecture                |                     22 layers, 20 canonical models, 15 rules |
| Tooling catalog             |                                                           96 |
| Editors and UGC surfaces    |                                                           29 |
| Progression/economy systems |                                                           35 |
| Procedural generation       |                                     32 stages and 10 recipes |
| Evidence experiments        |                                                           22 |
| Decision entries            |                                                           28 |
| Browser budgets/policies    |                                                           28 |
| Public surfaces/events      |                                    15 surfaces and 11 events |

Openpyxl emitted warnings about unsupported conditional-formatting extensions while reading. Because the workbook was not saved, those extensions were not removed from the source. Any future programmatic workbook edit must use a preservation-aware workflow and visually compare the result.

## What strongly confirms the existing project direction

The incoming research independently converges on:

- vehicle identity as the persistent player identity;
- one shared gameplay/content truth rather than separate mode-specific games;
- a renderer-independent fixed-step simulation;
- semantic vehicle capabilities rather than a subclass explosion;
- connected bounded regions rather than an initially seamless universal simulation;
- deterministic/versioned procedural generation with validators;
- guest/local-first play;
- horizontal capability progression;
- focused editors over shared schemas rather than a Roblox-scale editor;
- GLB/glTF and stable semantic asset keys;
- asynchronous sharing/replays before synchronous multiplayer;
- data-only creator content before arbitrary scripts;
- no gacha, loot boxes, paid power, or early player market;
- engine choice through the same playable evidence in multiple candidates.

This raises confidence in the _questions and boundaries_, not in any runtime implementation.

## New high-value concepts adopted as proposals

### 1. Separate immutable definitions from mutable owned state

The workbook’s strongest architecture addition is:

- immutable, versioned `VehicleBlueprint`;
- mutable owned `VehicleInstance`;
- versioned `WorldRecipe`;
- compiled and validated `WorldManifest`;
- reusable `ModePack`;
- objective/reward `MissionContract`;
- ephemeral `RunDirector`;
- reproducible `RunRecord`.

This is formalized in [ADR-0003](../decisions/ADR-0003-versioned-gameplay-content-composition.md).

### 2. Treat procedural generation as compilation

The existing exploration map already required a staged deterministic pipeline. The workbook makes the mental model sharper:

`seed + version envelope + recipe + contract + vehicle envelope → validated playable world manifest`

The most important addition is that the generator allocates traversal and performance budgets before decoration, then emits a manifest/hash and validation report. Noise, WFC, Voronoi/Delaunay, pathfinding, and navmesh libraries are stage tools; none owns the world design.

### 3. Public development should publish reproducible game objects

The workbook proposes shareable vehicle, world, challenge, and replay objects rather than generic progress posts. That is formalized in [ADR-0004](../decisions/ADR-0004-versioned-public-evidence-surfaces.md).

### 4. Loaners protect curiosity

A contract can offer a temporary compatible vehicle/build when the player lacks a capability. This prevents progression from turning discovery into a hard denial while still giving ownership and mastery long-term value.

### 5. Focused editor sequence

The 29-surface catalog is broader than the initial creator ladder, but its ordering is useful:

1. garage/vehicle and socket authoring;
2. route/track/world authoring;
3. mission/encounter graphs;
4. camera/lighting/audio tuning;
5. validation/playtest/replay;
6. versioning/dependencies/remix/publishing.

The project should first build validators and internal tuning around stable schemas. “Player-facing” is a separate decision for each surface.

### 6. A third same-vehicle contract can test composition

The narrative proposes a short tractor time trial after farm/defense. This is a good cross-mode proof but a poor addition to the first fun test because it introduces a third confounder. The resolution is:

- first prove the day/night loop;
- immediately afterward, run the same owned tractor through a small time trial using the same physics, loadout, save, camera/input contract, and history;
- treat duplication or special-case plumbing as architecture-failure evidence.

This is appended to [ADR-0002](../decisions/ADR-0002-first-playable-tractor-day-night-loop.md).

## Engine matrix analysis

The workbook uses eight 1–5 criteria with weights totaling exactly 1.0. Its cached weighted values match manual recalculation:

| Workbook weighting | Score |
| ------------------ | ----: |
| Babylon.js         |   9.3 |
| PlayCanvas         |   9.2 |
| Godot              |   8.5 |
| React Three Fiber  |   8.4 |
| Three.js           |   8.0 |

The ranking is sensitive to priorities:

| Weight profile            | Leading candidates                           |
| ------------------------- | -------------------------------------------- |
| Workbook baseline         | Babylon.js 9.3, PlayCanvas 9.2               |
| Authoring-heavy           | PlayCanvas 9.3, Babylon.js 9.1               |
| Control/performance-heavy | Babylon.js 9.5, PlayCanvas 9.4, Three.js 9.1 |
| Physics/mode-heavy        | Babylon.js 9.5, PlayCanvas 9.0, Godot 8.9    |

Therefore:

- the sheet is internally correct;
- the decimals do not constitute empirical precision;
- PlayCanvas’s first-trial status encodes a product preference for browser authoring;
- Babylon’s breadth wins most tested weight profiles;
- Three.js becomes more competitive when direct control/performance receive more weight;
- only the comparable active-play bakeoff can select the runtime.

Current primary sources confirm that the [PlayCanvas Editor Frontend was released under MIT in July 2025](https://blog.playcanvas.com/playcanvas-editor-frontend-is-now-open-source/). This strengthens the PlayCanvas authoring probe but does not make the hosted backend, editor workflow, or runtime automatically the best production choice.

## Box3D watch decision

The incoming research correctly identifies [Box3D](https://box2d.org/posts/2026/06/announcing-box3d/) as a newly announced C17 3D physics engine with continuous collision, mesh/heightfield collision, large-world support, determinism, recording, and replay. Its author also explicitly calls it alpha software and says it needs more testing and documentation.

Current disposition:

- add to the physics watchlist and a bounded WASM/browser feasibility probe;
- do not displace Rapier as the leading browser experiment;
- do not infer a mature JavaScript binding from a C API;
- revisit when an official or credible maintained browser/WASM integration, vehicle examples, build size, threading model, and debugging story exist.

The incoming [Phaser 4.1 release claim](https://phaser.io/news/2026/04/phaser-4-1-0-salusa-release) is also current, but Phaser remains a 2D laboratory rather than an automatically permanent second runtime.

## Conflicts resolved

### Workbook “Accepted” is not project accepted

The workbook contains 17 rows marked `Accepted`, 5 `Provisional`, 5 `Open`, and 1 `Deferred`. These statuses express the research author’s confidence, not project approval.

Project status remains governed by repo-local ADRs and evidence:

- ADR-0001 engine/kernel direction: **Proposed**
- ADR-0002 tractor slice: **Proposed**
- ADR-0003 content composition: **Proposed**
- ADR-0004 public evidence surfaces: **Proposed**

No incoming row silently promotes an ADR.

### Credits versus Scrap

The workbook proposes Credits plus materials/scrap. The project already standardized the early economy around:

- `Scrap`: one spendable soft resource/material abstraction;
- `Insight`: non-spendable discovery/mastery;
- `Favor`: non-spendable relationship state;
- concrete parts/blueprints.

Adding Credits now creates needless accounting and balancing surfaces. The workbook’s common-purchase/service role is mapped to Scrap until play evidence proves a separate unit of account is necessary.

### Run Director is runtime state, not authored run input

The narrative formula says:

`Vehicle Instance + World Recipe + Mode Pack + Mission Contract + Run Director`

The corrected model is:

- `RunSpec` contains stable references, seed, versions, and selected loadout;
- `RunDirector` is ephemeral orchestration created from the `RunSpec`;
- `RunRecord` captures reproducible actions/events/outcomes.

This prevents mutable runtime control state from becoming a content asset or share-link input.

### One first slice versus three modes at once

The workbook’s farm → defense → race sequence is a valuable architecture proof. The first playable remains farm → defense because the primary question is whether a genre shift can still feel coherent. The race is the next cross-mode gate, not another requirement before the first loop can be evaluated.

### Desktop-first wording

The workbook provisionally favors desktop/laptop first with touch-aware architecture. The project keeps this as an open support decision. Input abstraction and responsive UI are required immediately; an actual supported-device claim waits for the engine probe and representative device measurements.

## Items preserved but not adopted

- All 45 modes: exploration inventory, not roadmap scope.
- All 96 tools: discovery catalog, not dependencies.
- Exact engine scores: comparison prompts, not measured evidence.
- `Credits`: not added.
- Multiple mode-mastery ladders: may become records/proficiency, not separate economies by default.
- Public creator discovery, trading, synchronous multiplayer, arbitrary mods, and branded vehicles: remain gated.
- “Workbook is ready”: true as a research catalog; false as an adoption, production, legal, licensing, or runtime-readiness claim.

## New evidence experiments worth retaining

The workbook’s 22 experiments are useful, but they are dependency-related rather than a flat roadmap. The first decision chain is:

1. shared asset/input/telemetry contract;
2. comparable engine/physics probe;
3. canonical vehicle blueprint/instance round trip;
4. garage and semantic attachments;
5. day farming;
6. night transition;
7. contract engine;
8. world compiler and validator corpus;
9. same-tractor race/replay;
10. save/replay/share/recovery;
11. public stranger playtest;
12. only then evaluate online/creator expansion.

## Evidence and confidence

- Tier 1: source files, workbook structure, formulas, table rows, current primary-source checks.
- Tier 2: manual score recalculation and structural consistency checks.
- Tier 3–5: none; no system described here has been implemented or played.

Confidence is high in the workbook inventory and formula integrity, medium in the distilled architecture proposals, and low in gameplay/engine conclusions until the comparable probes run.

## Anything else?

## Addendum (2026-07-27): reread of the "3D Game Optimization Gaps" thread

The reread does not replace the existing synthesis. It sharpens the long-term
ordering and confirms that the repo already points at the right architectural
lanes.

What this conversation reinforces:

- Keep the deterministic kernel and the simulation/render split as the base
  contract.
- Treat culling, LOD, shader strategy, camera feel, collision layers, and
  authority scaling as engine-level contracts, not ad-hoc optimizations.
- Prefer capability contracts, world affordances, storage migration,
  observability, and command/event separation before broad streaming or
  multiplayer expansion.
- Model new gameplay as capability composition across machines rather than a
  deep inheritance tree of vehicle subclasses.
- Treat streaming, replay, and procedural direction as later gates that should
  open only after measurement shows pressure.

Repository pointers for the durable synthesis:

- [3D Game Master Synthesis](./3D_GAME_MASTER_SYNTHESIS_2026-07-25.md)
- [3D Game Optimization Gaps + Long-Term Expansion Synthesis](./3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md)
- [3D Game Optimization and More - Execution Roadmap](./3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

Open follow-up:

- If a future slice touches renderer density, visibility policy, or runtime
  entity counts, add measured culling/LOD acceptance data before widening the
  scope.

The workbook is unusually valuable because it is structured enough to become future test data. Its next best use is not another summary: selected rows should later become versioned schemas, fixtures, validator cases, and experiment manifests only after their owning ADR is accepted.

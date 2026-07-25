# Technology and Engine Options

Date: 2026-07-25
Status: research snapshot; no engine selected

## Executive finding

There is no credible documentation-only winner. The leading strategy is a renderer-neutral, fixed-step gameplay/content kernel plus identical browser probes in at least two serious 3D candidates. The game should be able to change presentation and activity without changing who owns vehicle identity, progression, inventory, procedural seeds, or network authority.

## Supplied workbook

Source: private, user-provided research workbook outside the repository (`js_python_animation_simulation_physics_3d_2d_catalog_2026.xlsx`)

Read-only inspection found:

- 409 master-catalog entries;
- 225 JavaScript/TypeScript entries, 183 Python entries, and 1 native entry;
- lifecycle labels including current, legacy, emerging, niche, and research;
- sheets for overview, JavaScript, Python, recommended stacks, legacy/emerging options, and taxonomy;
- a recorded verification date of 2026-07-10.

The workbook is valuable for discovery and taxonomy. It is not a dependency plan. Before adoption, every candidate still needs current official documentation, repository/package license, maintenance, browser/build behavior, security/provenance, and a local probe.

## Additional game-platform workbook

Source: private, user-provided research workbook outside the repository (`vehicle_game_platform_exploration_2026.xlsx`)

The additional workbook preserves the 409-entry catalog and adds 13 structured game-platform sheets. Its verified counts, formula checks, decision-status boundary, engine-weight sensitivity, new data models, Box3D watch, and conflicts are documented in [the ingestion review](ADDITIONAL_CHATGPT_RESEARCH_INGESTION_2026-07-25.md).

Important decision effect:

- PlayCanvas gains a stronger authoring probe because its editor frontend is now MIT open source.
- Babylon remains the baseline matrix leader.
- Engine rankings change when authoring, control/performance, or physics/mode priorities change.
- No matrix score selects the runtime.
- Box3D enters the feasibility watchlist but is alpha C17 software without an assumed browser integration.

## Engine and renderer shortlist

| Candidate | Strongest reason to test | Important boundary | Current role |
|---|---|---|---|
| Vanilla Three.js | Direct control, broad ecosystem, portable web integration, WebGPU renderer with WebGL 2 backend | It is a renderer/toolkit, not a full game architecture; WebGPURenderer remains experimental and changes shader/post stack | Leading control probe |
| React Three Fiber | React composition and DOM/product UI integration over Three.js | React cannot own high-frequency authoritative simulation; version pairing and render-loop ownership matter | Integration-style subprobe |
| Babylon.js | Integrated engine, WebGL/WebGPU paths, materials/tooling, headless `NullEngine` | More engine coupling/opinion; payload and content workflow need measurement | Leading integrated probe |
| PlayCanvas | MIT engine plus strong browser editor and instant iteration | Hosted editor/product terms differ from engine license; free public-project visibility and source-control workflow need review | Leading authoring probe |
| Godot 4 web export | Mature desktop editor and scene workflow with browser export | Compatibility renderer/WebGL2 on web, no C# web export, cross-origin/thread and web networking constraints | Wildcard authoring/export probe |
| Phaser | Complete browser-first 2D framework | It is explicitly a 2D framework, not the main 3D world | Intentional 2D activity probe |
| PixiJS | High-performance 2D rendering with WebGL/WebGPU options | Renderer, not full game framework; WebGPU path still needs production scrutiny | 2D renderer comparison |

### Three.js WebGPU boundary

Official Three.js guidance says `WebGPURenderer` targets WebGPU and can automatically fall back to WebGL 2. It also says the renderer remains experimental, and WebGL-oriented `ShaderMaterial`, `RawShaderMaterial`, `onBeforeCompile`, and `EffectComposer` paths require migration to node materials/TSL and the new post stack. Therefore:

- do not call WebGPU the only production path;
- test WebGL 2 explicitly;
- keep materials/postprocessing inside the renderer adapter;
- avoid an effects-heavy architecture before compatibility is measured.

### Godot web boundary

Godot can export WebAssembly/WebGL2 through its Compatibility renderer. Threaded exports require cross-origin isolation headers, and web constraints affect extensions, networking, rendering, and debugging. Its browser-based editor is preliminary and not the assumed production authoring environment. The relevant comparison is the native Godot editor-to-web-export workflow.

## Physics

### Leading 3D probe: Rapier

Reasons:

- maintained JavaScript/WASM bindings for 2D and 3D;
- rigid bodies, collision queries, CCD, joints, character controller, debug shapes, snapshots;
- dynamic ray-cast vehicle controller;
- deterministic claims are documented, but must be tested for the exact package and client/server environments.

The game still owns arcade vehicle feel:

`named actions → steering/throttle/brake model → suspension/wheel or locomotion queries → forces/intent → grip/drift/boost/damage rules → telemetry`

Do not expose raw engine bodies as durable vehicle state. A `PhysicsPort` translates between gameplay intent and physics results.

### Comparisons

- Engine-integrated physics in Babylon/PlayCanvas/Godot
- Cannon-es as a lightweight baseline
- Jolt as a vehicle-oriented comparison where a credible browser build/integration exists
- Box3D as an alpha-stage C17-to-WASM feasibility watch, not a lead dependency
- Custom collision/kinematics for deliberately simple arcade or 2D modes
- Phaser Arcade Physics vs Matter for a full 2D experiment

Adopt one only after testing maximum speed, tunneling, slopes, suspension, stacked bodies, sleep/wake, restart, serialization/recovery, and mobile frame cost.

## State and ECS

Start with explicit TypeScript state and systems. Do not adopt an ECS because open worlds commonly use one.

Compare only when entity/system density justifies it:

- Miniplex: ergonomic TypeScript/React alignment.
- bitECS: data-oriented/serialization strengths; current MPL-2.0 boundary must be understood.
- plain typed arrays/maps: baseline with no framework cost.

Acceptance questions:

- Does it make vehicle capabilities and mode transitions clearer?
- Can state be snapshotted/migrated/tested without renderer objects?
- Does it reduce measured hot-path cost?
- Can contributors debug it after time away?

## Procedural generation

Candidate building blocks from the workbook and current research include noise libraries such as FastNoiseLite, spatial algorithms, graph/pathfinding, workers, and engine-specific terrain tools. The architecture matters more than the noise function.

Use a versioned deterministic pipeline:

1. world graph;
2. region/biome;
3. terrain and traversal network;
4. settlements/landmarks/activity anchors;
5. encounter/resource proposals;
6. reachability, clearance, solvability, density, safety, and performance validation;
7. chunk package plus debug report.

Generated output needs an authored fallback. A seed without generator/content versions is not a stable save contract.

## Backend and multiplayer

| Candidate | Best fit | Boundary |
|---|---|---|
| Colyseus | Focused Node/TypeScript authoritative rooms, matchmaking, schema-based property patches | Pair with auth/database/economy services; not a complete product backend |
| Nakama | Integrated auth, storage, social, leaderboards, currencies, matchmaking, relayed/authoritative play | Larger operational and conceptual surface |
| Supabase/Postgres | Accounts, profiles, saves, content catalog, row-level policies, async/social data | Realtime presence/data is not assumed to replace a high-frequency authoritative simulation |
| PocketBase | Local/self-contained experiments | Official pre-1.0/backward-compatibility caution makes it unsuitable as an unexamined production-critical foundation |

First online experiment:

- 2 players plus bots in one activity;
- authoritative fixed tick;
- lowest acceptable snapshot frequency;
- interpolation before prediction;
- sequence/acknowledgement;
- reconnect/session recovery;
- 150 ms simulated RTT and 2% loss;
- no duplicate reward or inventory divergence;
- operator-visible tick, snapshot, disconnect, rejection, and recovery events.

Do not host long-lived authoritative rooms in request-oriented serverless functions.

## Persistence, auth, and economy

- Guest/local first, then lossless account linking.
- Versioned saves with migrations, export/import, corruption recovery, and explicit sync/conflict states.
- Server/database policies authorize durable changes.
- Economy config is versioned product code.
- Currency and inventory use append-only transaction IDs, idempotency, atomic mutation, before/after balances, catalog version, reconciliation, and audit/operator recovery.
- No client-authored balance, unlock, trade, or purchase result.
- Real-money, cash-out, random paid rewards, and player markets remain out of the first product decision.

## Editor and content pipeline

Compare:

- PlayCanvas browser editor for collaborative scene authoring;
- Godot desktop editor-to-web flow;
- Blender → validated GLB/glTF for canonical 3D assets;
- LDtk/Tiled for intentionally 2D authored layouts;
- schema-validated text/data for vehicles, modules, encounters, and regions.

Do not build a custom editor before stable schemas and repeated authoring pain exist. When it does, build a content inspector/validator first, not a general-purpose Roblox competitor.

## WebGPU and browser strategy

Treat WebGPU as a quality/performance enhancement with a WebGL 2 compatibility story until representative device evidence supports a narrower baseline.

Test:

- browser/API availability and initialization failure;
- WebGPU and forced WebGL paths;
- shader/material feature parity;
- context/device loss;
- low-memory and thermal behavior;
- dynamic resolution/DPR;
- browser upgrades and cached assets;
- cross-origin isolation if threaded WASM is used.

## Deployment and PWA

Separate:

- hashed static client assets on CDN/static hosting;
- versioned content and asset manifests;
- durable data/object storage;
- long-lived real-time servers;
- observability/control surfaces.

A PWA may cache the shell and selected core assets. It must never present cached multiplayer or unsynced economy state as authoritative. Offline saves need visible `local/pending/synced/conflict` states.

## Licensing and provenance

The engine/runtime shortlist is primarily permissively licensed, but this must be rechecked at adoption against exact versions and repositories. Particular cautions:

- bitECS is currently MPL-2.0 rather than MIT.
- SaaS/editor/free-plan terms are separate from engine source licenses.
- “Free” art/audio does not prove commercial redistribution, modification, attribution, model-training, or sublicensing rights.
- Real brands, logos, vehicle designs, liveries, and signature sounds may carry trademark/design/license risk.
- Generated assets need tool/provider, model, date, input/source provenance, terms snapshot, edits, and replacement path.

Create an asset registry and `THIRD_PARTY_NOTICES` before importing nontrivial assets into a public build.

## Comparable probes

### Probe scene

- one wheeled vehicle;
- ramp/collision;
- breakable crate;
- harvestable plot;
- chasing enemy;
- chase/top-down camera transition;
- shared named actions;
- state text, restart, and deterministic step;
- desktop and narrow UI;
- profiler/debug overlay.

### Record

- compressed build and first controllable load;
- p50/p95 frame time, long tasks, memory, draw calls, triangles, bodies;
- keyboard/gamepad/touch feel;
- WebGPU/WebGL behavior;
- asset import and iteration;
- gameplay-kernel integration;
- automated/headless/browser test quality;
- accessibility and DOM integration;
- source-control diff quality;
- deployment/cache/update behavior;
- implementation and “return after time away” comprehension.

### Proposed gates, not current promises

| Area | Initial experiment target |
|---|---|
| Desktop | 1080p p95 frame time at or below 16.7 ms in the defined probe |
| Mobile | 720p-equivalent controlled-DPR p95 at or below 33.3 ms |
| Initial slice | ≤8 MB compressed and input-ready ≤5 s on a defined throttled fast-4G profile |
| Network | 2 clients + 8 bots, 150 ms RTT, 2% loss, no durable-state divergence |
| Reconnect | restore within 10 s without duplicated rewards |
| Authoring | new legal vehicle variant and encounter without runtime-code edits |
| Portability | same GLB/content manifest in at least two tracks |

These targets must be revised from measured device data. They are experiment gates, not a launch SLA.

## Current recommendation

Start with:

1. vanilla Three.js + Rapier control probe;
2. Babylon.js integrated probe;
3. PlayCanvas authoring probe using the same GLB/content contract;
4. R3F integration subprobe only if React application composition is already valuable;
5. Godot web wildcard if native-editor content throughput looks materially better;
6. Phaser-only 2D probe later, compared against an orthographic mode in the winning 3D stack.

Do not select a production stack until two candidates clear the same active-play, automation, fallback, performance, and authoring checks.

## Primary sources

- [Three.js WebGPURenderer manual](https://threejs.org/manual/en/webgpurenderer)
- [Three.js repository](https://github.com/mrdoob/three.js)
- [React Three Fiber introduction](https://r3f.docs.pmnd.rs/getting-started/introduction)
- [Babylon.js WebGPU support](https://doc.babylonjs.com/setup/support/webGPU/)
- [Babylon.js server-side/NullEngine](https://doc.babylonjs.com/setup/support/serverSide/)
- [PlayCanvas Engine](https://developer.playcanvas.com/user-manual/engine/)
- [PlayCanvas Editor](https://developer.playcanvas.com/user-manual/editor/)
- [PlayCanvas plans](https://playcanvas.com/plans)
- [Godot web export](https://docs.godotengine.org/en/stable/tutorials/export/exporting_for_web.html)
- [Phaser documentation](https://docs.phaser.io/)
- [PixiJS introduction](https://pixijs.com/8.x/guides/getting-started/intro)
- [W3C WebGPU specification](https://www.w3.org/TR/webgpu/)
- [MDN WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API)
- [Rapier JavaScript guide](https://rapier.rs/docs/user_guides/javascript/)
- [Colyseus state synchronization](https://docs.colyseus.io/state)
- [Nakama authoritative multiplayer](https://heroiclabs.com/docs/nakama/concepts/multiplayer/authoritative/)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PocketBase documentation and production caution](https://pocketbase.io/docs/)
- [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots)

## Confidence

High for the cited current capabilities and boundaries; medium for the proposed architecture until the shared probes run on representative desktop and mobile hardware. No final engine claim is supported.

## Anything else?

The winning stack is the one that makes the game’s unusual composition understandable, testable, and authorable—not the one with the longest feature list or prettiest isolated demo.

# ADR-0001: Headless gameplay kernel and engine bakeoff

- Status: Proposed
- Date: 2026-07-25
- Owner: Project owner
- Next reviewer: Project owner after the technical probes

## Context

The game may combine traversal, racing, farming, combat, defense, scale changes, 2D/2.5D/3D presentation, persistent upgrades, procedural worlds, and eventually networked play. Picking a renderer because it produces the first attractive scene could bind game rules to a scene graph, fragment modes across engines, and make later authority or testing work disproportionately expensive.

The supplied catalog contains hundreds of possible libraries. More choice is not evidence that more packages belong in the runtime.

## Decision

Propose two linked constraints:

1. Keep durable game state and simulation rules outside the renderer in a typed gameplay kernel.
2. Select the initial 3D/browser engine through comparable probes, not preference.

The gameplay kernel owns:

- fixed-step clock and seeded randomness;
- vehicle identity, capabilities, modules, condition, inventory, and progression;
- interaction commands and results;
- encounter/world state transitions;
- save schema and migrations;
- events needed by UI, audio, analytics, replay, and networking.

Renderer, physics, input, audio, persistence, and network services connect through narrow adapters. “Headless” does not mean building a framework before a game; the first interface surface should be only what the first playable genuinely uses.

## Candidates

### A. Three.js family

Test vanilla Three.js and React Three Fiber as two integration styles over the same probe. Three.js offers direct control and a current WebGPU renderer with WebGL 2 fallback, but that renderer is still described by its maintainers as experimental and requires TSL/node-material migration for custom shader and post-processing paths.

### B. Babylon.js

Test its integrated scene, tooling, WebGPU/WebGL support, and physics workflow. It may reduce package assembly and editor/tooling work, but portability and bundle/runtime behavior must be measured rather than assumed.

### C. PlayCanvas

Test the open-source engine plus browser editor workflow. It is a serious candidate when rapid visual iteration and collaborative scene authoring matter. Cloud-editor convenience, offline/source control flow, runtime ownership, and export behavior need direct examination.

### D. Godot web export

Keep as a wildcard probe, especially if its editor and scene workflow accelerate content authoring. It must clear web-specific size, browser, thread/cross-origin isolation, extension, integration, and debugging constraints. The browser editor itself is not the production authoring assumption.

### Separate 2D experiments

Phaser and PixiJS can test an intentionally 2D mechanic. They are not automatically added beside a 3D runtime. A second live engine must prove that it creates more value than a top-down/orthographic presentation in the primary renderer, because duplicate asset, input, state, effects, and tooling paths are costly.

## Comparison probe

Each candidate implements the same small scene:

- one responsive wheeled vehicle;
- ramp and collision;
- breakable crate;
- harvestable plot;
- simple chasing enemy;
- chase-to-top-down camera transition;
- the same named input actions;
- the same exported state text;
- restart and deterministic stepping;
- basic desktop and narrow-screen UI;
- equivalent profiling overlay.

Record:

- first controllable load;
- frame-time distribution, draw calls, memory, and physics cost;
- compressed build size;
- WebGPU and WebGL 2 behavior where applicable;
- keyboard/gamepad/touch feel;
- asset import and iteration friction;
- test automation quality;
- save/kernel integration friction;
- accessibility integration;
- deployment and cache/update behavior;
- developer comprehension after returning to the code.

## Consequences

### Benefits

- Modes share one durable truth instead of becoming disconnected minigames.
- Rendering and engine decisions remain replaceable while uncertainty is high.
- Deterministic tests, saves, replays, and server authority have a viable seam.
- The comparison produces local evidence rather than an abstract feature table.

### Costs and risks

- Adapter boundaries add design work.
- An over-generalized kernel could become its own engine.
- R3F and imperative simulation can fight if ownership is unclear.
- Physics determinism does not make the entire game deterministic.
- A winning micro-probe may not predict content-authoring cost at larger scale.

## Guardrails

- Do not create generic subsystems without two real uses or a near-term contract.
- Do not let a React component tree own authoritative game state.
- Do not let scene-node identity become save identity.
- Do not add a second renderer to production without a measured necessity.
- Do not treat WebGPU availability as permission to drop WebGL 2 testing.
- Do not accept an engine until an active-play screenshot, trace/profile, state export, restart test, and narrow-screen test exist.

## Rejected for now

- Choosing a final engine from documentation alone.
- Building a custom engine.
- Combining Three.js, Phaser, and PixiJS in the first production bundle.
- Starting with a persistent MMO server.

## Validation plan

Acceptance requires Tier 3 comparison evidence from at least two candidates running the same interaction probe in a browser. A final decision must record the losing candidates, measured tradeoffs, migration cost, and revisit triggers.

## Rollback or migration

Probe code may be discarded. Content schemas, test scenarios, and the gameplay kernel should remain portable. If a candidate forces renderer-specific data into durable state, that is evidence against the current adapter design or candidate integration.

## Revisit triggers

- The first playable cannot meet its feel or performance target.
- An editor becomes essential to content throughput.
- Multiplayer authority requires simulation unsupported by the chosen stack.
- Mobile browser coverage changes materially.
- WebGPU renderer maturity or fallback behavior changes.

## Update Log

- 2026-07-25: Initial proposed decision recorded; no engine accepted.

## Anything else?

A feature matrix can identify what to test. It cannot choose the engine because this project’s decisive variable is the friction of composing unlike mechanics around one persistent vehicle identity.

## Addendum — 2026-07-25 first executable reference runtime

The project owner clarified in response to an external review that Rigs Unbound is being built as an open game and that the review should inform rather than anchor the whole product.

Implementation consequence:

- build one executable Three.js reference runtime now;
- keep fixed-step simulation, named actions, persistence, and exported state outside Three.js;
- use primitive project-owned geometry so the first public-reproducible runtime does not depend on the private Kenney source bundle;
- expose several spatial opportunity landmarks so the runtime communicates the wider vehicle/world promise;
- do not require two engine implementations before obtaining the first handling, camera, world-memory, and browser evidence.

Three.js is **not accepted as the final engine** by this addendum. The original candidate comparison remains available when a real disputed engine question justifies its cost. Any later candidate must consume the same state/action contract and reproduce the same acceptance behaviors.

Decision effect: **status remains Proposed**. The change is from “comparison before any runtime” to “reference runtime first, comparison when evidence identifies the question.”

See [Playable Foundation Plan](../plans/PLAYABLE_FOUNDATION_2026-07-25.md).

### Anything else?

The runtime should make the product feel open without pretending that breadth is already implemented. Distant landmarks are invitations and architectural seams, not claims that every region is complete.

## Addendum — 2026-07-25 additional workbook research

The incoming 14-engine matrix was inspected and manually recalculated. Its eight criterion weights total 1.0 and its cached values are internally correct:

- Babylon.js: 9.3
- PlayCanvas: 9.2
- Godot: 8.5
- React Three Fiber: 8.4
- Three.js: 8.0

Sensitivity checks changed the order: PlayCanvas leads under an authoring-heavy profile, while Babylon leads under the workbook baseline, control/performance-heavy, and physics/mode-heavy profiles. The score decimals therefore describe a preference model, not empirical precision.

The PlayCanvas editor-frontend MIT release strengthens its authoring probe. It does not select the runtime or hosted workflow.

Box3D is added as a physics watch/feasibility candidate. Its author describes it as alpha C17 software; an official or credible maintained browser/WASM binding, size, threading, vehicle, and debugging path must be demonstrated before it can challenge Rapier’s lead browser experiment.

Decision effect: **status remains Proposed**. The same active-play probe still selects the engine.

### Anything else?

The score sensitivity itself becomes part of the bakeoff report: final weighting must be declared before results are interpreted, and raw measurements must remain visible beside any aggregate score.

## Addendum — 2026-07-25 common Kenney fixture identified

The local Kenney All-in-1 3.4.0 library contains a current Car Kit `tractor.glb` with named body and four wheel nodes, a shovel-equipped tractor variant, a compact Racing Kit ramp, a Car Kit box, Nature Kit terrain props, and an animated Graveyard zombie. Their exact source hashes are recorded in the [Kenney asset library audit](../research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md).

These assets become the **Proposed common fixture set** for the active-play engine comparison. Every candidate must begin with the same binary source assets and stable semantic keys. Candidate-specific conversions, hierarchy changes, material rewrites, or importer-generated artifacts must be recorded and measured as candidate friction rather than hidden by hand-normalizing one engine more than another.

Decision effect: **status remains Proposed**. Identifying a fair fixture improves the experiment; it does not select an engine or approve the assets as final art.

### Anything else?

The source tractor already contains useful wheel nodes, so the bakeoff can test a real importer and vehicle hierarchy instead of giving every engine a custom primitive vehicle that conceals asset-pipeline differences.

## Addendum — 2026-07-25 Rig Lab 01 portability evidence

The project owner clarified that the tractor is one content instance, not a privileged architectural center, and asked the adjacent-capability sequence to continue. [ADR-0006](ADR-0006-rig-capability-portability.md) records the accepted consequence.

The live reference runtime now has two contrasting ground rigs, a profile/capability boundary, a shared towing activity, a v1-to-v2 save migration, and local performance instrumentation. This is evidence that the renderer-independent kernel can support more than one ground-vehicle fantasy without creating a second controller or activity pipeline.

It is not evidence that the current `ground` mobility adapter can model bicycles, tracked vehicles, boats, aircraft, rockets, or spacecraft. Those remain bounded-adapter experiments. Three.js also remains provisional; Rig Lab 01 strengthens the state/action portability seam without accepting the final engine.

Decision effect: **status remains Proposed**.

### Anything else?

The next engine comparison should be triggered by concrete friction—content authoring, physics, target-device performance, or another mobility family—not by the desire to repeat a feature matrix.

# Exploration Map

Status: living canonical map
Started: 2026-07-25
Last updated: 2026-07-26

## How to use this map

Every meaningful discovery should either update an area below or create a linked research/decision artifact. Status vocabulary:

- **Idea** — plausible but unsupported.
- **Researching** — sources/examples are being gathered.
- **Experiment** — has a concrete falsifiable probe.
- **Proposed** — a preferred path is documented but not accepted.
- **Accepted** — enough evidence exists to guide implementation.
- **Deferred** — excluded from the current decision unit with a closure trigger.
- **Rejected** — considered and declined with a reason.

Evidence follows the project tiers from assumption (Tier 0) to
production-like/real-data observation (Tier 5). Current areas range from Tier 0
proposals through Tier 4 local/public browser observation; each linked
acceptance record owns its specific tier.

## Navigation

- [Docs root landing page](../README.md)
- [3D Game Contract Index](../research/3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- [Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md)
- [Worklog](../WORKLOG.md)

## North star and product identity

| Area              | Current hypothesis                                                                                                    |      Status | Next evidence                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ----------: | --------------------------------------------------------------------------------------------------- |
| Core fantasy      | Vehicles are the playable characters; each machine is a distinct set of verbs, tradeoffs, and stories.                |    Proposed | Observe whether players refer to the machine as “my tractor/bike/etc.” and explain its personality. |
| Genre continuity  | The place, vehicle, upgrades, and consequences persist when mechanics or camera change.                               |    Proposed | Tractor day/night integration prototype.                                                            |
| Open world        | A connected graph of meaningful regions and activities can feel more coherent than one literally seamless simulation. |    Proposed | Travel-transition storyboard and streaming probe.                                                   |
| Tone              | Wonder, mechanical charm, repair, danger, and absurd escalation can coexist.                                          | Researching | Art/motion/audio comparison and player language.                                                    |
| Public promise    | A link opens into an understandable, restartable experience with honest maturity and clear controls.                  |    Proposed | Public smoke-test checklist and external playtest.                                                  |
| Name and identity | **Rigs Unbound** is the accepted project and repository identity.                                                     |    Accepted | Use consistently; complete trademark/domain clearance before commercial launch. See ADR-0005.       |

The public smoke-test gate now sits beneath episode grammar: the gate binds camera, performance, and accessibility evidence into one reviewable public promise, while episode grammar remains the story-composition layer above it.
The browser-delivery contract now sits beneath episode grammar too, so the public promise can tell future work what is essential, what can degrade, and what is optional without becoming the story layer itself.

## Core loops

### Moment-to-moment

- Read terrain, threats, routes, and affordances.
- Steer and manage momentum.
- Use installed vehicle tools.
- Trade speed, energy, traction, durability, cargo, stealth, and control.
- Leave visible effects on the world.
- Receive tactile, visual, audio, and UI feedback.

### Session

`garage/workshop → choose objective or follow curiosity → travel → encounter/activity → consequence → return/recover → modify vehicle → reveal new possibility`

The living loop contract is now captured in [Core Loop and Progression Contract](../research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md).

### Episode grammar / storm relay

The next product-level seam after the core loop is not “more modes” but a
compositional episode grammar that lets place, rig identity, pressure,
discovery, and persistent consequence combine into a single authored episode.
See [Compositional Episode Grammar and Storm Relay](COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).

### Proposed next-tranche arbitration

An internal-only wide-open brainstorm compared a cross-rig passage, a thin
pressure/relay proof, Farmfall sequencing, and a later toy-scale interior
experiment. The convergence favors one persistent cross-rig consequence as the
next portability proof, but this is a sequencing proposal rather than operator
acceptance. See
[Wide-Open Next-Tranche Arbitration](WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md).

### Farmfall emission and cultivation boundary

The current Farmfall plan predates save schema v6, blade fill, Reclamation, and
the source/listener provenance audit. Emission is now split into named source
channels and listener-owned sensitivity/falloff; the current source-only code
is an evidence fixture, not an ecology system. Persistent cultivation requires
semantic cut provenance and an explicit schema-v7 decision rather than
inferring eligibility from height delta, furrow marks, or an authored `tilled`
surface. See
[ADR-0025](../decisions/ADR-0025-emission-source-listener-separation.md) and
[ADR-0026](../decisions/ADR-0026-cultivation-provenance-and-schema-v7.md).

### Long arc

`acquire machines → learn their personalities → earn capabilities and relationships → connect regions/scales → build a strange fleet → change the world`

### Proposed composition grammar

```text
RunSpec =
VehicleInstance/loadout reference
+ WorldRecipe or validated WorldManifest reference
+ ModePack reference
+ MissionContract reference
+ seed and version envelope

RunSpec → ephemeral RunDirector → reproducible RunRecord
```

Definitions, owned state, compiled world output, runtime orchestration, and run evidence must remain separate. See [ADR-0003](../decisions/ADR-0003-versioned-gameplay-content-composition.md).

| Question                                                                    |                            Status | Probe                                                                                                |
| --------------------------------------------------------------------------- | --------------------------------: | ---------------------------------------------------------------------------------------------------- |
| Are activities found spatially or selected from a menu?                     | Proposed: spatial discovery first | The loop contract now favors spatial discovery first, with garage/workshop guidance as the fallback. |
| Does failure cost resources, time, condition, opportunity, or only restart? |                          Proposed | The loop contract now treats condition, time, opportunity, and recovery effort as the primary costs. |
| Is the garage a menu, explorable place, or both?                            |                          Proposed | The loop contract now says both: planning surface plus place with identity.                          |
| How does a player always know the next interesting possibility?             |                          Proposed | The loop contract now names an opportunity compass that reveals verbs, not quest spam.               |

## Vehicle system

### Identity model

- chassis and silhouette;
- locomotion profile: wheeled, tracked, legged, hovering, flying, orbital, aquatic, hybrid;
- mass, dimensions, traction, suspension, steering, energy/fuel, heat, durability;
- environment permissions: road, soil, rubble, water, atmosphere, vacuum, tiny spaces;
- tool sockets and cargo;
- camera/control profile;
- history, condition, provenance, sound, animation, decals, repairs;
- capabilities granted and tradeoffs imposed.

### Acquisition and relationship

| Topic        | Possibilities to explore                                                                        |             Status |
| ------------ | ----------------------------------------------------------------------------------------------- | -----------------: |
| Unlock       | discovery, rescue, restoration, reputation, blueprint, challenge, trade                         |        Researching |
| Ownership    | collect all vs limited active garage vs relationships/loans                                     |               Idea |
| Loaners      | temporary compatible vehicle/loadout lets a player try a contract without owning its capability |           Proposed |
| Upgrade      | reversible modules, tuning, repairs, cosmetic history, hybrid grafts                            |           Proposed |
| Mastery      | player skill, vehicle familiarity, certification, relationship                                  |        Researching |
| Damage       | performance consequences, visible history, field repair, recovery                               |        Researching |
| Trading      | NPC barter first; player trading only with server ledger/escrow                                 |           Deferred |
| Real designs | inspiration without unauthorized brand/logo/livery replication                                  | Proposed guardrail |

The proposed tractor journey is now `found → stabilized → working → specialized → hybridized → storied`. Restoration, chassis tuning, swappable physical modules, and deployed module states remain separate systems. The first playable should restore one signature plow and choose one support module; large swaps occur at the workshop by default, while field swapping is a later earned capability. See [Tractor Restoration and Modular Growth](TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md).

### Capability-first data model

Avoid a brittle inheritance tree such as `Vehicle → FarmVehicle → Tractor → ZombieTractor`. Define chassis and modules as data-backed capabilities with explicit incompatibilities and validation. A hybrid is a reviewed composition, not arbitrary stat addition.

Proposed content boundary:

- immutable/versioned `VehicleBlueprint`;
- mutable owned `VehicleInstance`;
- derived explainable capability envelope;
- stable semantic asset/component keys;
- no renderer, physics, React, or filename identity in durable state.

Questions:

- Which properties change feel, and which merely change numbers?
- Can one module create value and a cost in two mechanics?
- Can a vehicle become beloved without a conventional human avatar?
- How do tiny toy vehicles and rockets share progression without absurd stat normalization?
- Are some machines temporary transformations rather than collectibles?

## Activities and genre grammar

| Activity family   | Vehicle verbs                                   | Continuity hook                 | Candidate presentation |                Status |
| ----------------- | ----------------------------------------------- | ------------------------------- | ---------------------- | --------------------: |
| Racing/time trial | line choice, drift, boost, drafting, shortcuts  | route knowledge, tuning, ghosts | chase/isometric        |           Researching |
| Farming/ecology   | plow, seed, water, harvest, tow, restore        | land state, weather, community  | chase/isometric        |      First experiment |
| Defense           | push, block, illuminate, deploy, rescue, damage | saved structures/crops          | top-down shift         |      First experiment |
| Hauling/logistics | attach, balance, route, repair, deliver         | economy and settlement growth   | chase/map              |                  Idea |
| Salvage/repair    | scan, cut, tow, sort, rebuild                   | parts and world history         | close third-person     |           Researching |
| Exploration       | traverse, reveal, climb, fly, orbit             | map knowledge and discoveries   | adaptive               |       Proposed pillar |
| Combat            | ram, evade, mount tools, exploit environment    | threat/ecology consequences     | chase/top-down         |           Researching |
| Tower defense     | position vehicle/attachments, build lanes       | structures persist in region    | top-down               |                  Idea |
| Rescue            | tow, stabilize, light, transport                | relationships/reputation        | adaptive               |                  Idea |
| Construction      | grade, lift, assemble, connect                  | durable world changes           | isometric              |                  Idea |
| Spaceflight       | launch, navigate, dock, mine, re-enter          | scale ladder and fleet          | chase/cockpit/map      |   Deferred experiment |
| Toy-scale worlds  | use furniture/objects as terrain                | scale reveals hidden world      | chase/isometric        | High-interest tangent |
| Stealth/shadows   | light control, noise, cover, decoys             | information and nonlethal play  | top-down               |           Researching |

### Genre-transition contract

Every transition must define:

1. diegetic trigger;
2. player preview/consent;
3. input changes;
4. camera changes;
5. state carried in;
6. outcome carried out;
7. failure and escape;
8. accessibility alternative;
9. resume/reconnect behavior;
10. telemetry and test state.

## World and procedural generation

### Proposed connected-world model

- Persistent garage/home hub
- Streamed or loaded terrestrial regions
- Instanced authored/procedural activities
- Separate scale/origin regimes for interior, toy-scale, planetary, orbital, and deep-space play
- Persistent vehicle, inventory, relationships, discoveries, and selected world deltas

### Generation layers

`world graph → biome/region → terrain/routes/settlement → landmarks/activity anchors → encounters/resources → invariant validation → chunk packaging`

Compiler contract:

`seed + generator/content versions + WorldRecipe + MissionContract + vehicle envelope → validated WorldManifest + hash/report`

Persist:

- world seed;
- generator version;
- content-catalog version;
- authored overrides;
- player deltas;
- outcome events.

Validators to research:

- reachability and safe spawns;
- route clearance by vehicle dimensions/capabilities;
- mission solvability and exit;
- resource sufficiency;
- landmark spacing/readability;
- impossible overlap and physics stability;
- enemy/resource ecology;
- content rating and safety;
- deterministic hash under supported environments;
- recovery to an authored fallback chunk.

### Procedural questions

- What must be authored for meaning even when layout varies?
- Which changes can persist without saving the whole world?
- How do generator migrations preserve old player worlds?
- Can communities share seeds without sharing unsafe arbitrary code?
- How is repetition detected and bounded?
- When does procgen happen client-side, in a worker, at build time, or server-side?

## Progression and economy

### Proposed minimal progression grammar

- **Scrap**: the one early spendable soft resource, earned through play and salvage for repair/build/transparent NPC exchange.
- **Insight**: non-spendable discovery/mastery progress that reveals module categories, knowledge, and possibilities.
- **Favor**: non-spendable relationship/reputation state that unlocks access.
- **Parts**: concrete inventory with provenance and compatibility, not another abstract currency.

No premium currency is proposed.

### Principles

- Unlock possibility, not only higher numbers.
- Avoid a universal power score that erases vehicle identity.
- Upgrades should create tradeoffs and visible physical change.
- Loss should generate recovery stories, not coercive grind.
- Offline/local rewards need explicit reconciliation rules before cloud/multiplayer.
- Client code never authorizes balance, unlock, trade, or purchase mutation.
- A player market requires an append-only server ledger, idempotency, atomic transfer/escrow, reconciliation, fraud controls, operator recovery, and legal review.

### Economy research

| Topic                 |                       Status | Closure gate                                      |
| --------------------- | ---------------------------: | ------------------------------------------------- |
| Earning cadence       |                         Idea | Instrumented first-playable runs                  |
| Sinks/repair          |                  Researching | Fun without punitive maintenance                  |
| NPC barter            |                         Idea | Clear value and anti-exploit rules                |
| Player trading        |                     Deferred | Server authority + abuse/economic design review   |
| Real money            | Rejected for initial product | Explicit product/legal/payment decision           |
| Seasonal/live economy |                     Deferred | Stable core, operations capacity, non-FOMO policy |

## State, saves, auth, and backend

### State classes

1. **Ephemeral session**: nearby actors, physics, projectiles, temporary threats and effects.
2. **Durable player/world**: account link, garage, upgrades, inventory, relationships, discoveries, selected deltas.
3. **Versioned content**: vehicle, part, recipe, encounter, economy, generator, and safety definitions under source control.

### Proposed path

- Guest/local play first, using a versioned save and export/import recovery.
- Optional account link later without losing the guest save.
- Cloud sync exposes `local`, `pending`, `synced`, and `conflict` states.
- Authentication does not equal authorization; server and database policies validate every durable mutation.
- Compare Supabase/Postgres for account/profile/save/catalog services and Nakama for an integrated game backend.

### Save research

- schema version and migrations;
- checkpoint vs event log vs hybrid;
- multiple devices and conflict policy;
- corruption/partial write recovery;
- generator/content version compatibility;
- offline mutation and replay;
- backup/export/delete;
- privacy and retention;
- guest-to-account merge;
- operator diagnosis without reading unnecessary personal data.

## Multiplayer and social

### Maturity ladder

1. Local single-player with deterministic/replayable simulation.
2. Asynchronous ghosts, shared seeds, scores, and creations.
3. Two-player or small co-op activity with server authority.
4. Small shared region (target research range: 2–8 players).
5. Only then evaluate broader social/open-world concurrency.

### Authority contract

- Clients submit named inputs/intents, never final rewards or balances.
- Server validates gameplay and durable mutations.
- Replicate significant actors/events; keep decorative debris/particles local.
- Add interpolation, input sequencing, acknowledgements, reconnect, interest management, and prediction only when measured.
- Test latency, jitter, packet loss, duplication, reordering, disconnect, reconnect, cheating input, and stale clients.

### Candidates

- Colyseus: focused TypeScript room authority/state sync; pair with separate account/data services.
- Nakama: broader integrated auth/storage/social/matchmaking/leaderboard/currency surface.
- Supabase Realtime: investigate for presence, low-rate shared state, and async/social features—not assumed as the authoritative high-frequency simulation.

### Social and community topics

Co-op roles, crews, shared garages, ghosts, challenges, seed sharing, spectating, photo mode, replays, emotes, chat, reporting, blocking, parental controls, moderation, community events, attribution, creator discovery, and grief recovery.

## AI and agents

### Allowed exploration

- creator-side ideation and asset proposals;
- NPC dialogue or mission proposals behind schemas;
- offline evaluation of driving agents;
- deterministic utility AI, behavior trees, planners, navigation, and flocking;
- accessibility assistance;
- moderation triage with human/appeal paths.

### Hard boundary

AI output cannot be source of truth for:

- physics/collision;
- balance, currency, inventory, purchases, or unlock eligibility;
- procedural validity;
- moderation penalties without a review/appeal contract;
- legal/licensing claims;
- save migrations or network authority.

Any model-backed feature must document model, prompt/input contract, schema, validation, fallback, retry, cost, latency, observability, data/config, and escalation. Generated content remains a proposal until deterministic validation and rights/provenance review.

## Editors, mods, and UGC

### Maturity ladder

1. Versioned internal data files.
2. Project-local content inspector/validator.
3. Data-only vehicle, encounter, region, and dialogue packs.
4. Curated sharing and review.
5. Sandboxed scripting only if data-only composition proves insufficient.
6. Open publishing only with moderation, quotas, rights, reporting, versioning, and compatibility operations.

Focused editor order to explore:

1. garage/vehicle builder and socket/hardpoint authoring;
2. route/road/rail/track spline editor;
3. world/biome and parcel editor;
4. mission/objective and encounter/wave graphs;
5. camera/lighting/audio tuning;
6. validation/playtest console;
7. replay/ghost inspection;
8. versioning, dependency, remix, private-share, and publishing surfaces.

Every pack needs:

- manifest, author, source and license;
- compatible game/content versions;
- dependencies and hashes;
- allowed capabilities;
- validation results;
- size/performance budgets;
- attribution and provenance;
- moderation/rating status.

Do not run arbitrary JavaScript from public creators in multiplayer. Candidate authoring tools include PlayCanvas Editor, Godot desktop editor, Blender, LDtk, Tiled, and eventually a schema-driven project editor.

## Rendering, physics, and technical architecture

See [technology and engine options](../research/TECHNOLOGY_AND_ENGINE_OPTIONS_2026-07-25.md) and [ADR-0001](../decisions/ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md).

Areas:

- renderer bakeoff: Three.js/vanilla, React Three Fiber, Babylon.js, PlayCanvas, Godot web wildcard;
- 2D bakeoff: primary renderer in orthographic mode vs Phaser vs PixiJS;
- WebGPU enhancement with a tested WebGL 2 path;
- fixed-step simulation and seeded randomness;
- Rapier leading physics probe; simple custom/engine physics as comparison;
- Box3D alpha-stage C17/WASM feasibility watch; it is not a current dependency;
- project-owned input, physics, persistence, content, audio, and networking ports;
- plain typed state before adopting an ECS;
- workers for validated generation and non-render critical tasks;
- floating origin/scale partitions for planetary/orbital space;
- asset streaming, LOD, instancing, pooling, compression, caching, and context recovery.

### 3D optimization continuity checkpoint (current queue)

The following table updates the same queue from the `3D_GAMES_ANALYSIS` addendum and
the `PLAN_RENDER_PERFORMANCE_ACCESSIBILITY` lane:

| Topic                                      | Current status                         | Next evidence gate                                                                                                      |
| ------------------------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Frustum/distance culling                   | Named contract, implementation pending | Add visible-actor culling fixture and verify non-visible entities are excluded from draw path.                          |
| Occlusion integration                      | Named contract, implementation pending | Move from camera-only pull-in to visibility-stage contract before draw submission.                                      |
| LOD by distance/subsystem                  | Named contract, implementation pending | Add renderer/physics/AI update policy and threshold matrix.                                                             |
| Portal/cluster stream visibility           | Named contract, implementation pending | Add route/cluster streaming manifest and activation order.                                                              |
| Shader contract for terrain/weather/hazard | Named contract, implementation pending | Add minimal shared material constants + fallback policy behind contract.                                                |
| Collision category/mask                    | Named contract, implementation pending | Add semantic response matrix for obstacle/hazard/trigger/particle categories.                                           |
| Replay/input log artifact                  | Named contract, implementation pending | Add durable versioned replay storage + playback verifier (deterministic input stream first).                            |
| Chunked world scaling                      | Named contract, implementation pending | Add streaming manifest + unload policy + regression tests before more activity classes.                                 |
| ECS migration readiness                    | Named contract, implementation pending | Keep profile/adapters today; add ECS only if actor count or simulation graph complexity crosses a proven threshold.     |
| Behavior/event model                       | Named contract, implementation pending | Introduce deterministic event/behavior scheduler with payload validation and deterministic update ordering.             |
| Modding and external packs                 | Named contract, implementation pending | Add schema-vetted content packs, compatibility matrix, and moderation/review gate before external extension paths open. |
| Resource governance                        | Named contract, implementation pending | Add cross-system budget envelopes (CPU/GPU/VRAM/frame) and graceful degradations per device class.                      |

The behavior/planner contract now lives in
[BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md](../research/BEHAVIOR_SYSTEM_AND_PLANNER_CONTRACTS_2026-07-25.md),
and the simulation-layer/resource-governance contract now lives in
[SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md](../research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md).
These rows remain backlog items, but they are no longer unnamed gaps.

The remaining queue items now map to named contract notes as well:

- quick navigation: [3D Game Contract Index](../research/3D_GAME_CONTRACT_INDEX_2026-07-25.md)
- chunked world scaling → [STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md](../research/STREAMING_WORLD_MANIFEST_AND_RESIDENCY_CONTRACT_2026-07-25.md)
- ECS migration readiness → [ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md](../research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md)
- LOD by distance/subsystem → [VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md](../research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)
- portal/cluster stream visibility → [PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md](../research/PORTAL_VISIBILITY_AND_BOUNDED_ROOMS_CONTRACT_2026-07-25.md)
- shader contract for terrain/weather/hazard → [SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md](../research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md)
- collision category/mask → [COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md](../research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md)
- replay/input log artifact → [REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md](../research/REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md)
- modding and external packs → [MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md](../research/MODDING_AND_CREATOR_PACK_VALIDATION_CONTRACT_2026-07-25.md)
- resource governance → [SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md](../research/SIMULATION_LAYERS_AND_RESOURCE_GOVERNANCE_CONTRACT_2026-07-25.md)

The current visibility-stage and LOD analysis now lives in
[Visibility Stage and LOD Contract](../research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md),
which captures the live renderer's instancing, draw-radius, shadow, and performance-hook posture while keeping the remaining culling and subsystem-tier gates explicit.

### 3d-games skill synthesis checkpoint

Applied the `3d-games` skill guidance one layer at a time and mapped it to the live repo:

- Rendering: the renderer already batches/instances many world objects, but explicit frustum and distance culling rules are still not fully enforced in the draw path.
- LOD: the skill's distance-based LOD advice remains a missing contract; the current repo has telemetry and presentation separation, not a formal subsystem tier matrix.
- Physics: the skill's layer-based filtering guidance aligns with the current obstacle field, but the category/mask matrix is still only partial.
- Cameras: the skill's smooth follow, collision avoidance, and FOV advice matches the existing camera work, but the camera policy is still profile-driven rather than a fully declarative state contract.
- Lighting/shadows: the skill suggests bake-or-simplify where possible; the repo currently uses a blob-shadow strategy and explicitly disables shadow maps.

The immediate consequence is that the project should harden visibility, collision, and replay contracts before it attempts broader scale changes such as ECS migration or world streaming. Those broader systems stay valid long-term, but they are downstream of the current proof gates.

### Decision control for this checkpoint

- Priority remains: lock renderer/perf/accessibility contract first, then add streaming/collision matrix, then replay and deterministic event-behavior migration, then authority.
- The rollout order is now formalized in [ADR-0014](../decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md), which keeps capability, replay, streaming, authority, and ECS sequencing explicit instead of implicit.
- Status for public claims: no claim of multiplayer authority or streaming support is valid until these gates are completed.

### Requested "Optimization Gaps" check status (2026-07-25)

- This project map now treats the follow-on audit as **gate-ready backlog**, not as immediate implementation:
  - **Immediate gates accepted-in-principle:** renderer/simulation boundary, migration hygiene, deterministic stepping.
  - **Current phase gates:** explicit visibility and collision-matrix hardening, content/affordance validation, and run-reproducibility.
  - **Deferred gates:** multiplayer authority, broad ECS migration, open UGC publication.
- The run-reproducibility lane now has a live bounded recorder hook in
  `src/main.ts` and `src/game/run-record.ts`. It records input transitions
  instead of every fixed step, reports dropped entries when its in-memory
  window trims, and adds stable tick hashes to checkpoints. The browser surface
  now also exposes structural verification, but it still needs durable playback
  verification before it graduates from partial to accepted.
- The replay artifact contract now lives in [Replay Artifact and Ghost Contract](../research/REPLAY_ARTIFACT_AND_GHOST_CONTRACT_2026-07-25.md), which makes the current bounded record shape explicit and keeps the missing playback, divergence, and compatibility rules visible.
- The collision category and mask contract now lives in [Collision Category and Mask Contract](../research/COLLISION_CATEGORY_AND_MASK_CONTRACT_2026-07-25.md), which makes the current obstacle-resolution path explicit and keeps trigger/sensor/projectile role separation visible.
- The camera feel contract now lives in [Camera Feel Contract](../research/CAMERA_FEEL_CONTRACT_2026-07-25.md), which makes the current profile-driven camera work explicit and keeps transition, obstruction, and reduced-motion rules visible.
- The physics quality envelope contract now lives in [Physics Quality Envelope Contract](../research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md), which makes the deterministic traversal model, fallback expectations, and stability-state visibility explicit.
- The resource budget and fallback envelope now lives in [Resource Budget and Fallback Envelope](../research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md), which makes the current measured frame/draw/memory posture explicit and keeps low-budget fallback policy visible.
- The event graph and deterministic handlers contract now lives in [Event Graph and Deterministic Handlers Contract](../research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md), which makes the command/checkpoint/save flow explicit and keeps replay-safe event ownership visible.
- The command/event envelope now also carries the episode-grammar boundary, so replay and diagnostics remain inspectable without inventing a second history source.
- The ECS threshold contract now lives in [ECS Threshold and Composition Readiness Contract](../research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md), which makes the actor-count and coupling threshold explicit and keeps composition migration proof-based.
- The ECS threshold also sits beneath episode grammar, so story composition should continue to use the current machine-centric model until measured pressure proves a migration.
- The physics quality envelope now also sits beneath episode grammar, so motion remains readable through explicit stability states instead of feel changes becoming a hidden second story system.
- The modding and creator-pack lifecycle now also sits beneath episode grammar, so packs stay validated content envelopes rather than becoming a second story/runtime authority.
- Closure condition for deferred gates:
  - deterministic command replay parity,
  - validated contract migration for capability/activity definitions,
  - streaming manifest activation with bounded unload behavior,
  - documented fail-safe and operator observability for rejected/world-mutation attempts.
- Owner note: this is a sequencing rule aligned with ADR-0011 and ADR-0010, not a denial of future platform breadth.

### Machine-capability platform continuity

The expanded long-term model from the continuation audit is tracked in
[3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md](../research/3D_GAME_PLATFORM_LONG_TERM_AUDIT_2026-07-25.md).
The key control decision is:

- keep the domain model as activity+machine capability layers on a shared snapshot kernel,
- avoid inheritance-style mode expansion until capability contracts and manifest validation are proven stable.
- use [ADR-0014](../decisions/ADR-0014-sequenced-capability-streaming-replay-authority-rollout.md) as the explicit rollout-order anchor for visibility, capability contracts, replay, streaming, authority, and ECS.

If an activity or machine cannot be expressed as a data-driven contract, it does not enter the core queue without a design exception.

### Addendum — 2026-07-26 skill-to-repository execution ledger

The current 3D contract set now has a source-linked navigation and proof-order layer in
[3D Game Skill-to-Repository Execution Ledger](../research/3D_GAME_SKILL_TO_REPO_EXECUTION_LEDGER_2026-07-26.md).

It applies the `3d-games` and `3d-web-experience` skills to the live architecture without
introducing a competing engine plan. Its controlling conclusions are:

- renderer instancing and telemetry are foundations; explicit visibility/LOD policy, device
  quality selection, and recoverable browser fallback remain implementation gates;
- fixed-step simulation, rig profiles, locomotion adapters, seeded world behavior, and save
  migration are the assets to preserve while command/event and collision-category contracts mature;
- each platform abstraction must first pass a vertical proof: tractor plus trailer, a genuinely
  distinct locomotion adapter, a stationary machine, a drone, or a capability-gated activity;
- streaming, ECS, replay, and authority remain trigger-based tracks requiring measured pressure
  or a real product need, not claims implied by design documents.

The ledger is a dated execution aid. Existing ADRs and named contract notes remain the canonical
decision and implementation surfaces.

## UI, onboarding, accessibility, and controls

### Research base — 2026-07-26

A deep parallel research sprint (5 agents, ~87KB, 959 lines) explored game UI paradigms, novel controls, adaptive/generative systems, micro-interactions/juice, and reference game teardowns. Master synthesis and individual research documents:

- **[Master Synthesis](../research/GAME_UI_MASTER_SYNTHESIS_2026-07-26.md)** — cross-references all streams, proposes the 5-layer information architecture, and identifies the 8 highest-signal novel ideas for Rigs Unbound.
- [Diegetic, Spatial, Meta, and Non-HUD UI Paradigms](../research/GAME_UI_PARADIGMS_DIEGETIC_SPATIAL_META_2026-07-26.md)
- [Novel, Experimental, and Niche Control Schemes](../research/GAME_CONTROLS_NOVEL_INPUT_METHODS_2026-07-26.md)
- [Adaptive, Generative, and State-Driven UI Systems](../research/GAME_UI_ADAPTIVE_GENERATIVE_SYSTEMS_2026-07-26.md)
- [Micro-Interactions, Game Feel, Juice, and Kinesthetic UI](../research/GAME_UI_MICROINTERACTIONS_JUICE_FEEL_2026-07-26.md)
- [Reference Game UI/UX Analysis](../research/GAME_UI_REFERENCE_ANALYSIS_2026-07-26.md)
- [State Shell, Hit Feedback VFX, and Visual Quality Architecture](../research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md)

### Core insight: the rig IS the interface

The vehicle's physical state, sounds, animations, and body language should be the primary information channel. The DOM HUD is a secondary, supplementary layer — a field kit, not a dashboard replacement. This is the strongest first-principles fit for a game where vehicles are playable characters.

### Proposed five-layer information architecture (Researching)

| Layer | Name            | Channel                  | Examples                                                                                                           |
| ----- | --------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| 0     | World           | Environment              | Terrain color = traversability; lighting = time + danger; tracks/furrows = player history                          |
| 1     | Vehicle Body    | Diegetic                 | Visible damage/rust/smoke = condition; attachment silhouette = capabilities; engine pitch = speed/strain           |
| 2     | Spatial Markers | Semi-diegetic            | Proximity glow on interactables; terrain-attached opportunity markers; directional audio; State Shell glow/ripples |
| 3     | Field Kit HUD   | Non-diegetic, themed     | Condition diagnostic; capability label; compass strip; camera mode; action prompt                                  |
| 4     | System Overlays | Non-diegetic, functional | Pause, settings, workshop, save indicator, error surface                                                           |

### Highest-signal novel ideas (Researching)

1. **State Shell & Hit VFX** — semi-transparent surrounding aura/envelope that ripples at impact points, shifts color with health/strain, and communicates vehicle integrity without HUD clutter.
2. **Patchwork Dashboard** — diegetic hood-cam instruments that degrade/upgrade with vehicle condition (Metro 2033, Pacific Drive).
3. **Rumor Map** — node-based discovery/progress system replacing quest logs and achievement percentages (Outer Wilds).
4. **Multi-modal speed feedback** — engine pitch + camera FOV + particle density replaces numerical speedometer.
5. **Gyroscope steering** — DeviceOrientationEvent API for mobile tilt-to-steer.
6. **Context-sensitive action** — one button that does the right thing based on proximity and capability (already partially implemented).
7. **Progressive HUD unlock** — UI elements are progression rewards, not defaults. Start minimal; earn instruments.
8. **Visual haptics** — camera shake, FOV pulse, hitstop, and vignette effects as browser-native "force feedback."
9. **Asymmetric co-op** — phone-as-navigator via WebSocket for multi-device multiplayer.

State Shell, Rumor Map, and Hood Dashboard now exist as implemented
presentation experiments. They consume canonical state but are not accepted as
canonical product direction until browser readability, accessibility,
performance, and player-comprehension evidence supports a retain/revise/remove
decision.

### Surfaces to explore

- instant play/guest entry;
- garage and vehicle story;
- workshop/module comparison;
- world opportunity map (rumor map candidate);
- activity transition;
- active HUD (field-kit layer 3);
- damage/recovery (vehicle-body layer 1);
- inventory and provenance;
- discoveries/codex (rumor map candidate);
- co-op/lobby/presence (asymmetric candidate);
- creator tools;
- settings/accessibility;
- connection/save conflict/operator-readable errors.

### Accepted baseline requirements

- remappable named actions;
- keyboard, gamepad, pointer, and touch;
- scalable DOM text and semantic controls;
- reduced motion and camera-shake controls;
- hold/toggle alternatives;
- contrast/color-independent cues;
- subtitles/captions and independent volume categories;
- difficulty/assist options that do not shame the player (steering assist, brake assist, auto-aim);
- switch access and one-handed control schemes;
- safe area, resize, orientation, and narrow-screen behavior;
- onboarding through consequences and experimentation rather than modal walls;
- audio as UI: engine sound, spatial threat cues, satisfying tool feedback;

### Research candidates requiring decision and a falsifiable probe

- gyroscope/accelerometer steering;
- progressive HUD unlock;
- gamepad and mobile vibration;
- asymmetric phone navigator;
- Patchwork Dashboard as a mandatory presentation layer.

### Anti-patterns to guard against

- icon/marker spam (Ubisoft open-world);
- information overload in early play;
- UI that fights the Patchwork Atlas tone;
- minimap dependency (prefer compass strip + directional audio);
- forced mode switching (prefer context-sensitive action);
- dark patterns (never).

## Art, animation, audio, and asset pipeline

See [DESIGN.md](../../DESIGN.md).

## Addendum — 2026-07-26 rig signature remains a fixture until listener and accessible feedback exist

- The new deterministic rig-emission source derives bounded acoustic,
  illumination, and thermal-proxy channels from rig state without mutating the
  rig.
- It is a real evidence fixture, not a completed gameplay system, because there
  is still no listener-owned presentation surface or accessible player feedback
  mapping.
- The next proof should connect the source to one readable player-facing cue
  before any generic scheduler or broader effect system is promoted.

## Addendum — 2026-07-26 audio mute is functional, but persistence is still missing

- The audio lane already has a working in-session mute control, but the
  preference is not yet restored from durable storage after reload.
- That keeps mute as a comfort control, not yet a remembered player preference.
- The next proof should persist the mute bit without letting audio become a
  gameplay authority or a hidden mechanic channel.

## Addendum — 2026-07-26 audio burst suppression is still only a prose contract

- The audio presentation contract already names duplicate-event suppression and
  cooldown behavior for bursty impact/interaction streams, but the runtime
  still lacks a named owner for that policy.
- `src/game/audio.ts` currently uses disposable one-shot bursts and immediate
  acknowledgements, which is correct for a first slice but not yet a burst
  gating system.
- The next durable proof should name one suppression window or coalescing rule
  before another bursty source is introduced.

Research:

- three competing visual directions;
- modular vehicle rigs, wheels/tracks/rotors/tools;
- GLB/glTF canonical runtime format;
- Blender source and export validation;
- impostors/LOD/texture compression;
- sprite/VFX atlases for 2D and hybrid scenes;
- procedural animation and suspension;
- environment state transitions;
- readable particles, damage, trails, and interaction telegraphs;
- layered vehicle audio, adaptive world music, spatial threats, accessibility;
- asset registry, file hashes, provenance, licenses, attribution, and modification records;
- generated-asset review and replacement path.

The locally owned Kenney All-in-1 3.4.0 bundle is a **Proposed** selective
prototype source and remains private. Two Car Kit GLBs are now repo-owned,
CC0-evidenced, preflighted, and runtime-tested on the developer/evidence
surface. They remain excluded from the default player surface and production
distribution because `publicRuntimeApproved` is false; they are not canonical
production art, individually budgeted, or LOD-ready. See the
[Kenney asset library audit](../research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md).

Direct project-owner preference now strengthens the tactile repaired-vehicle/diorama/near-isometric direction. New model-sheet, camera, and comparative art boards propose a hierarchy rather than a blended style: Patchwork Atlas as the persistent base, Signal Noir as a danger/information-state transformation, and Salvage Opera as a rare aspiration/event crescendo. Next evidence is an orthographic tractor turnaround, grayscale/mobile silhouette tests, a non-generic enemy ecology, and an actual camera graybox. See [Visual Direction Preference and Variants](VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md).

External premium generation currently lacks local Tripo/Gemini/ElevenLabs credentials; this does not block hand-authored, open-asset, procedural, or built-in image-generation exploration.

## Addendum — 2026-07-25 Asset-production delivery checkpoint

Applied the imported `3d-asset-production` skill as a static review of the current image/reference-to-runtime direction. The review confirms that the project has the right conceptual foundations—GLB/glTF intent, provenance records, a proposed Kenney fixture manifest, and generated concept archives—but lacks a proven delivery bridge from reviewed source to browser-loaded runtime asset.

The recommended next slice is deliberately narrow: define a canonical asset manifest and bounded GLB preflight before importing a broad pack or replacing the procedural renderer. The review and decision questions are recorded in [Asset Production Skill Review](../research/ASSET_PRODUCTION_SKILL_REVIEW_2026-07-25.md).

Slice A is implemented: the canonical manifest, versioned schema,
dependency-free GLB preflight, and focused tests exist. Slice B now exists as a
developer/evidence bridge for two Car Kit fixtures. That proves import,
fallback, and runtime observation; it does not approve the fixtures as
production art or grant them canonical vehicle identity. The imported
`img2threejs` intake gate still rejects the original collage model sheet as
reconstruction ground truth because foreground coverage is 0.991 and the
silhouette is not isolable. See [Asset Authority and Shipped Mesh Contract](../research/ASSET_AUTHORITY_AND_MESH_CONTRACT_2026-07-25.md).

## Browser, deployment, and performance

### Surfaces

- immutable client assets on static/CDN hosting;
- WebSocket/game servers on a long-lived process host;
- durable database/object storage separately;
- versioned content/asset manifest;
- PWA shell and selected safe offline assets;
- explicit update, cache invalidation, compatibility, and rollback behavior.

### Measure, do not assume

- initial compressed bytes and first controllable frame;
- main-thread long tasks;
- CPU/GPU frame time and resolution scaling;
- draw calls, triangles, texture memory, particles, lights, shadows;
- active/visible/background entity and physics counts;
- chunk-generation/stream stalls;
- battery/thermal behavior;
- WebGPU vs WebGL 2;
- context loss/recovery;
- foreground/background and focus loss;
- desktop/mobile browsers and poor networks;
- server tick overrun, RTT/jitter, snapshots, bandwidth, disconnect/reconnect.

Request-oriented serverless functions must not be assumed capable of hosting authoritative real-time rooms.

### Proposed public evidence objects

See [ADR-0004](../decisions/ADR-0004-versioned-public-evidence-surfaces.md).

- versioned vehicle blueprint link;
- versioned world recipe/seed link;
- pinned challenge link;
- replay/run-record link;
- contextual feedback and reproducible bug bundle;
- build changelog, compatibility matrix, known issues, credits, and maturity statement.

Public links must use canonical validation, opaque IDs where needed, no personal data/secrets in URLs, explicit compatibility/archive behavior, and a meaningful guest/local core.

## Testing, observability, and operations

- Headless fixed-seed simulation tests
- Property/invariant tests for generation and economy
- Save migration/conflict/corruption tests
- Browser input-to-render tests
- `window.render_game_to_text()`
- `window.advanceTime(ms)`
- Active-play screenshots at desktop and narrow sizes
- Visual comparison with tolerances/masking
- Manual playtest notes and recordings
- Latency/loss/reconnect and soak tests
- WebGL context loss and asset failure
- Debug HUD and exportable run summary
- Client performance/error telemetry
- Server tick, snapshot, auth, ledger, save, and match telemetry
- Privacy-safe logging and retention
- Operator views for “what happened, when, impact, retry/fallback, next action”

## Safety, privacy, legal, and public-community readiness

Research areas:

- age audience and child-directed risk;
- account data minimization, consent, export, deletion, retention;
- chat/content moderation, reporting, blocking, appeals, enforcement;
- harassment, griefing, scams, market manipulation, cheating, bots;
- real vehicle brands, designs, logos, liveries, sounds, and trade dress;
- asset/font/music/code licenses and attribution;
- AI asset/input provenance and provider terms;
- violence, zombies, weapons, fear, flashing/light/motion risks;
- gambling-like/random-reward and real-money boundaries;
- regional consumer, privacy, tax, and platform rules;
- security review, dependency supply chain, CSP, secrets, rate limits, abuse response;
- community guidelines and operator capacity.

Public UGC, chat, trading, and purchases remain gated until these systems have owners, tooling, and recovery paths.

## Research and experiment queue

### Decision unit A — Core-feel paper design

- Tractor day/night verbs and module tradeoffs
- Input/camera transition storyboard
- State transition and failure/recovery diagram
- Accessibility variants
- Five-minute paper/graybox test

### Decision unit B — Shared technical probe

- Same scene in at least two 3D candidates
- WebGPU/WebGL fallback
- Rapier vs integrated/simple physics
- Browser automation/state hooks
- Desktop/narrow-screen active play
- Comparable performance/build/authoring notes

### Decision unit C — First complete slice

- One vehicle, one region, day/night/dawn
- Persistent choice and upgrade
- Guest save and restart
- Observability and test coverage
- External play sessions

### Decision unit C2 — Cross-mode identity proof

- Put the same owned tractor/loadout/history into a short time trial
- Reuse physics, semantic actions, camera contract, save, progression, and replay
- Reject duplicated vehicle truth or mode-specific key/state paths

### Decision unit D — Breadth probes

- Bike race
- Toy-scale interior
- Space/origin/scale experiment
- Fully 2D/top-down activity
- Async ghost/shared seed

### Decision unit E — Online authority

- Guest-to-account merge
- One 2–8 player activity
- Reconnect and anti-divergence
- Durable reward ledger
- Operator recovery

## Explicit non-goals for the first playable

- Seamless planet-to-space simulation
- Many vehicles
- MMO
- Player market
- Premium currency
- Open scripting/mods
- Open chat/UGC
- Generative live world
- Photorealism
- “Infinite content”

## Tangents worth preserving

- Toy vehicles exploring ordinary rooms as epic biomes
- Vehicle ancestry/family trees through repairs and grafts
- Salvage archaeology: every part has a former use
- Ecological consequences of machine choice
- Weather as a mechanic translator
- Cooperative multi-vehicle jobs where machines complement rather than out-DPS each other
- A mobile garage/convoy instead of a static hub
- Radio stations that are factions, mission channels, and musical identity
- Non-combat night play: rescue, stealth, lighting, evacuation, or ecosystem balancing
- Vehicles that are communities or habitats, not only machines
- Player-created challenge “contracts” constrained to safe verbs
- A world map assembled from remembered routes rather than GPS completion icons
- Ghost stories embedded in replay traces
- Scale travel from tabletop to city to planet without pretending physics is uniform

## Open questions for Pranay

These are helpful but non-blocking; experiments can continue before answers:

- Which emotional center is most exciting: collecting machines, mastering movement, transforming worlds, discovery, or social adventure?
- Is combat essential, one of many verbs, or sometimes avoidable?
- Should the world feel handcrafted with procedural variation, or primarily generated?
- What is the minimum browser/device reach worth protecting?
- Is the eventual dream primarily solo-with-sharing, small co-op, or a populated social world?
- How comfortable should failure, damage, loss, and grind feel?
- Are recognizable real vehicles important enough to pursue licensing, or is “evocative but original” better?

## Anything else?

Explore broadly, but make each implementation answer one sharply stated question. The map should grow faster than the runtime until the core is fun; after that, the runtime should grow only along proven paths.

## Addendum — 2026-07-25 Rig Lab 01 changes the evidence map

The project owner rejected tractor anchoring and accepted a broader permanent framing: Rigs Unbound is a vehicle-universe game and experimentation platform. No single vehicle, world, activity, perspective, or mechanic defines the product.

Rig Lab 01 now supplies local evidence for:

- persistent identities for two rigs in one save;
- semantic actions shared across unlike ground handling profiles;
- world queries based on `plough`, `tow`, and `jump` capabilities;
- one cargo-relay activity composed from towing rather than a named vehicle;
- versioned profile data and a bounded `ground` mobility adapter;
- v1 tractor-history migration;
- local startup, frame, renderer, heap, save, and load measurement.

This closes the earlier “second rig” and “measure local performance” evidence units at Tier 2–4. It opens sharper questions:

1. Do players describe Torque and Spark as different fantasies, or merely slow and fast?
2. Which locomotion family creates the next useful adapter boundary: bicycle balance, tracks, water, or flight?
3. Can a second activity compose existing capabilities—such as tow + repair rescue—without adding an activity-specific controller?
4. Which performance costs appear under cold-cache production loading and representative mobile hardware?
5. How do collision, suspension, sound, animation, and camera communicate capability before the HUD does?

### Anything else?

Breadth should now be measured by new assumptions exposed, not by vehicle count. A third ground mesh with another speed number is less valuable than one real locomotion adapter or one activity that composes capabilities in a new way.

## Addendum — 2026-07-25 Multi-skill analysis integration (in-progress)

Added a cross-skill technical audit pass (3D rendering, web-platform constraints,
input/camera systems, accessibility, and audio) and recorded findings in:

- [3d-games analysis note](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [Multi-skill long-term possibility audit](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/MULTI_SKILL_LONG_TERM_POSSIBILITY_AUDIT_2026-07-25.md)
- [Renderer/accessibility contract ADR](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/decisions/ADR-0010-rendering-accessibility-contract.md)
- [Render hardening plan](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/plans/PLAN_RENDER_PERFORMANCE_ACCESSIBILITY_2026-07-25.md)

Current map impact:

- Formal render/performance contract is now the highest-priority next design deliverable.
- Accessibility contracts and reduced-motion alternatives are in scope before broad public exposure.
- WebGPU remains an enhancement path only until representative WebGL baseline data is established.
- Next decision gate: whether to prioritize locomotion-capability expansion (new family)
  or renderer hardening as the first gate-breaking milestone.

### Anything else?

Do not add a second major content family before one of:

- a render/perf contract with measurable budgets, or
- a clear second locomotion adapter that changes game outcomes, not just vehicle stats.

## Addendum — 2026-07-25 Drift closes the first adapter-family proof

Marsh Skimmer 01 implements the earlier “water or hover” decision unit:

- universal rig state no longer contains wheels or ground contact;
- a typed registry composes `ground` and `hover` with the same world, input,
  camera, exploration, activity, persistence, and observability contracts;
- Drift crosses the deep Sunken Flats while steep terrain still reduces
  authority and raises strain;
- schema v4 preserves valid v3 Torque/Spark state and adds Drift without
  replacing shared world memory;
- visible browser acceptance verifies three rigs, six cameras, hover telemetry,
  reload, and narrow controls.

This is local architecture and workflow evidence, not proof that Drift is fun or
that a universal vehicle platform is solved.

### Next questions opened

1. Do players describe Drift as gliding/skimming/reading water, or merely as
   another faster rig?
2. Does the next family expose a new body-state boundary—balance, tracks,
   displacement, free flight, or orbital motion—or can capability composition
   create more value first?
3. Can one rescue/repair activity combine tow + survey + winch across the three
   current rigs without adding an activity controller?
4. What canonical prop collision/occlusion representation should both physics
   and camera consume?
5. At what measured device/browser budget does Three.js loading, draw cost, or
   terrain construction become the next gate?

### Anything else?

The next added rig should not be justified by roster size. Prefer an external
player-language test and a capability-composition activity before another
locomotion family unless that family exposes a clearly named architectural
assumption the current union cannot represent.

## Addendum — 2026-07-25 Optimization continuation: capability/authority runway

The “more” review pass identifies the next decision spine beyond current
feature growth.

- Status: **Researching** — no runtime claims yet.
- Scope now accepted:
  - capability contract formalization (`definition` + `state` + compatibility)
  - command -> validation -> kernel -> presentation boundary
  - deterministic event bus + run record
  - collision category/mask matrix
  - chunk manifest and activation lifecycle
- Scope deferred until proof gates:
  - multiplayer authority rollout (waits for replay + validation lane)
  - public-facing asset pack ingestion (waits for manifest + schema governance)

### Required proof gates

1. **Render/perf contract gate**
   - evidence: frame/memory budgets with explicit low/medium/high profiles.
2. **Replay + validation gate**
   - evidence: deterministic run record and checksum verification against current fixed-step path.
3. **Interaction gate**
   - evidence: capability requirements drive at least one cross-mode activity without new activity-specific branching.
4. **World scaling gate**
   - evidence: stream manifest supports deterministic chunk IDs and bounded unload.

### Next open decision

Whether lane order stays render-first or shifts to interaction-first should be
decided only after a direct evidence compare against the same narrow device
profile set (desktop + one constrained mobile profile).

## Addendum — 2026-07-25 Perception-chain and physics expansion

The project owner established a stronger systems rule: physics, controls,
animation, lighting, camera, sound, haptics, VFX, and UI are gameplay systems
because they determine what the player can perceive and learn.

The exploration map now has three equal top-level lenses:

1. **Game structure** — contracts, persistence, progression, worlds, secrets,
   consequences, recovery, and social/share surfaces.
2. **Simulation** — mobility, collision, terrain, fluids, fields, articulation,
   damage, AI, weather, procedural rules, and replay.
3. **Perception and feel** — semantic controls, animation, camera, lighting,
   materials, VFX, audio, haptics, UI, and accessibility.

The runtime bridge between simulation and presentation is recorded in
[ADR-0012](../decisions/ADR-0012-rig-perception-chain.md). The broader solver and
technique space is catalogued in
[Browser vehicle-physics techniques](../research/BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG_2026-07-25.md).

### Canonical vehicle/mechanic exploration schema

Every serious rig or mechanic exploration should answer:

1. player fantasy;
2. physical archetype;
3. base controls;
4. unique control signature;
5. accessible control mode;
6. expert control mode;
7. movement skill ceiling;
8. surface interactions;
9. attachment interactions;
10. damage behavior;
11. authored animation;
12. procedural animation;
13. secondary physics;
14. camera behavior;
15. lighting capabilities;
16. material state changes;
17. VFX feedback;
18. audio feedback;
19. UI requirements;
20. accessibility considerations;
21. emergent combinations;
22. performance risks;
23. discovery/easter-egg opportunities;
24. shareable moments.

These are evaluation prompts, not mandatory runtime fields. A vehicle earns
complexity where it strengthens its fantasy, capability, and readable
trade-offs.

### Vehicle-systems playground lattice

The long-term lab should be composed from reusable stations rather than one
vehicle-specific level:

- asphalt, gravel, mud, sand, ice, shallow/deep water, slopes, ramps, and narrow
  routes;
- breakable, towable, heavy, articulated, and unstable objects;
- darkness/searchlight, weather, time, gravity, damage, repair, and replay
  controls;
- measurable comparisons across balance, heavy-wheel, articulation, hover/
  buoyancy, and six-degree motion.

The current connected world already covers part of this lattice. New stations
should extend its shared substrates or exist as versioned experiments; they
should not become a parallel “sandbox mode” architecture.

### Anything else?

The first Rapier probe should be an unstable trailer plus motorized excavator
arm, not a pile of anonymous cubes. That comparison tests joint stability,
control expression, cargo consequence, browser cost, snapshotting, and whether
a general solver actually serves a vehicle fantasy.

## Addendum — 2026-07-25 Physics Lab 01 changes the physics evidence map

Physics Lab 01 executes the first bounded Rapier slice behind project-owned
intent and dynamics contracts. It now supplies local evidence for a dynamic
chassis, raycast wheels, four surface profiles, fixed stepping, plain-data
capture/restore, six camera policies, debug geometry, performance telemetry,
positive-front direction, and narrow touch layout.

This does not narrow the product to wheeled vehicles. It creates a comparison
fixture for one controller family. The exploration lattice still requires
balance, tracked, hover/buoyancy, flight, six-degree, articulated, and hybrid
evidence as concrete rig fantasies demand them.

The Adjacent Activity Expansion questions remain standing review gates:

- semantic actions before controller logic;
- capability queries before vehicle-name checks;
- bounded controller families instead of a universal flag matrix;
- renderer extraction without solver ownership;
- camera policies with rig-aware framing;
- versioned project-owned persistence;
- one activity solvable through different rig strengths;
- loading, frame, state, save/recovery, and console observability.

Current static audit found no repeated shared-runtime tractor-name branch. The
historical tractor-specific recovery path remains bounded to legacy save
migration. The existing cargo relay provides the shared towing/delivery
activity evidence; the new lab provides replaceable-solver evidence.

### Next highest-information physics slice

Add an unstable towable trailer and motorized lifting arm, then compose one
short rescue, construction, or recovery activity. Compare:

- constraint stability and failure readability;
- torque, load, attachment, and cargo consequence;
- capture/replay and recovery behavior;
- first-control, average/p95 step/frame, memory, and bundle cost;
- whether the same semantic input, capability, camera, activity, and evidence
  contracts survive without rig-name branching.

### Anything else?

The map should keep both kinds of evidence visible: adjacent capabilities expose
hidden product assumptions, while different motion families expose hidden
controller assumptions. Neither alone proves the vehicle-universe thesis.

## Addendum — 2026-07-25 3D web delivery and accessibility runway

### Current status (Web-delivery layer)

- **Current evidence**: policy exists (`ADR-0010` + profile matrix), but runtime enforcement is not yet complete.
- **Status**: **Researching** for explicit start-up/runtime binding and loading contract.
- **Why now**: 3D claims are meaningful only when launch/runtime/degraded paths are measurable and deterministic.

### What this adds

- 3d-web-experience guidance confirms the existing emphasis:
  - web-first pragmatism over shader-only spectacle,
  - mobile-first fail-safe behavior,
  - explicit loading + fallback strategy.
- The current architecture now needs one durable bridge:
  - startup/late-bind profile selection,
  - explicit reduced-motion application,
  - deterministic loading/error state for world/model content.
- Live browser evidence now confirms the shell is mostly accessible, and the remaining keyboard landing-point gap has been closed by making the canvas focusable and adding a skip link into the main region.

### Immediate proof gate for this layer

Add one full chain:

1. profile selection by startup/runtime budget,
2. non-blocking fallback to a readable baseline,
3. reduced-motion safe camera and telemetry behavior,
4. explicit reject path for oversized/invalid content candidates,
5. reliable keyboard focus landing after world entry,
6. skip link or equivalent fast path into the main interaction region.

### Why this is tied to the objective

The same principle applies to the core objective review:

- **what's possible now** = contract-first 3D web delivery exists in design;
- **what's not yet true** = enforcement and runtime binding are incomplete;
- **what's next** = enforce these as implementation gates before public surface expansion.
- Addendum (2026-07-25): the rig-capability surface now has a dedicated contract note, so capability checks, adapters, and affordance resolution are tracked as a first-class boundary rather than a loose typed convenience layer.
- Addendum (2026-07-25): the behavior/planner gap now has a dedicated contract note, so intent capture, deterministic choice, and read-only decision logic are tracked before any AI or activity layer grows into the kernel.
- Addendum (2026-07-25): the streaming-world gap now has a dedicated contract note, so chunk manifests, residency, and rollback are tracked before the world scale grows past the current canonical substrate.
- Addendum (2026-07-25): Box3D is promoted from a passive alpha watch to a
  mandatory bounded physical-wheel browser experiment after its official
  feature direction and the newly available third-party `box3d-wasm` package
  were verified. The comparison now explicitly follows physics into collision
  roles, CCD/recovery, camera obstruction, minimap/world-coordinate fidelity,
  terrain/material identity, chunk residency, attachments, perception feedback,
  and replay diagnostics. The new
  [Minimap and World-Coordinate Contract](../research/MINIMAP_AND_WORLD_COORDINATE_CONTRACT_2026-07-25.md)
  keeps solver-local coordinates from becoming map or save authority.
- Addendum (2026-07-25): the simulation-layer gap now has a dedicated contract note, so domain order, ownership, and fallback governance are tracked before weather/economy/traffic logic becomes implicit.
- Addendum (2026-07-25): the modding gap now has a dedicated contract note, so creator packs, compatibility, and rollback are tracked before public UGC becomes a second runtime.
- Addendum (2026-07-25): the world-affordance gap now has a dedicated contract note, so world verbs, capability claims, and deterministic resolution are tracked before they collapse into special-case branches.
- Addendum (2026-07-25): the asset-pipeline gap now has a dedicated contract note, so source art, provenance, compression, and runtime replacement are tracked before asset delivery becomes a hidden second truth source.
- Addendum (2026-07-25): the shader/material gap now has a dedicated contract note, so layered materials, readability, and fallback behavior are tracked before visual cues become one-off forks.
- Addendum (2026-07-25): the lighting gap now has a dedicated contract note, so ambient, shadow, and atmosphere tiers stay readable before lighting becomes an implicit surprise.
- Addendum (2026-07-25): the portal-visibility gap now has a dedicated contract note, so bounded rooms and indoor spaces stay readable alongside distance and chunk culling.
- Addendum (2026-07-25): the accessibility/input gap now has a dedicated contract note, so named actions, remaps, and comfort settings stay explicit across keyboard, gamepad, and touch.
- Addendum (2026-07-25): the kernel-ordering gap now has a dedicated contract note, so mutable subsystems stay gated behind the authoritative step order.
- Addendum (2026-07-26): the kernel-ordering gate also carries the episode-grammar boundary, so story composition consumes authoritative outcomes instead of authoring state directly.
- Addendum (2026-07-25): the save/migration gap now has a dedicated contract note, so recovery, versioning, and fallback paths stay explainable.
- Addendum (2026-07-25): the authoring/content-validation gap now has a dedicated contract note, so manifests, provenance, and runtime-ready status stay reproducible.
- Addendum (2026-07-26): the authoring/content-validation gate also sits beneath episode grammar, so story composition consumes validated content instead of replacing the manifest envelope.
- Addendum (2026-07-25): the performance/readability baseline now has a dedicated contract note, so the shared thresholds stay readable as one umbrella policy.
- Addendum (2026-07-25): the second locomotion family now has a dedicated contract note, so the hover/ground boundary stays explicit across save/reload and rollback.
- Addendum (2026-07-25): the authority-model gap now has a dedicated contract note, so shared-state and server-authoritative behavior remain future-only.
- Addendum (2026-07-26): the authority-model gate also sits beneath episode grammar, so consequence stays durable through authoritative outcomes instead of speculative intent.
- Addendum (2026-07-25): the engine-branch gap now has a dedicated contract note, so alternate backends remain bounded comparison branches instead of shadow products.
- Addendum (2026-07-26): the engine-branch lane still lacks a measurable branch-opening trigger, so Three.js stays the canonical v1 path until a benchmark bundle justifies a bounded comparison branch.
- Addendum (2026-07-26): the authority lane is still local-first, but the next proof should be one local authenticated mutation envelope (save, repair, or module install) rather than any multiplayer claim.
- Addendum (2026-07-25): the verification-harness gap now has a dedicated contract note, so confidence changes stay reproducible and auditable.
- Addendum (2026-07-25): the Physics Lab browser-experience gap now has a dedicated contract note, so the separate lab route and acceptance runner stay visible as a browser evidence fixture rather than an untracked side page.
- Addendum (2026-07-25): the world-and-architecture scalability gap now has a dedicated contract note, so chunk growth, activity packs, migration boundaries, and shared-state readiness stay bounded and testable.
- Addendum (2026-07-25): the progression/leveling gap is now decided — ADR-0018 (Accepted) ratifies the Journey + Verb Mastery + Insight spine with situation-weighted accrual and bounded in-verb power; analysis and operator decisions live in `docs/exploration/GAME_SYSTEMS_ANALYSIS_AND_DIRECTION_2026-07-25.md`.
- Addendum (2026-07-25): the first-playable slice (ADR-0002) now has an active implementation plan — `docs/plans/FARMFALL_SLICE_01_2026-07-25.md` (crops, signature ecology, night threats, dawn consequences, mastery kernel).
- Addendum (2026-07-25): the external player-language gate is being exercised via uncontaminated simulated playtests (casual/achiever/explorer, `docs/reviews/PLAYTEST_SIM_*_2026-07-25.md`); real external sessions remain open.
- Addendum (2026-07-25): the engine-bakeoff decision unit is reclassified from orphaned to scheduled — the probe runs against `docs/research/ENGINE_BRANCH_EVALUATION_AND_ALTERNATE_BACKEND_GATING_CONTRACT_2026-07-25.md`; ADR-0001 stays Proposed until probe evidence exists, ADR-0015 keeps Three.js as v1.x default.
- Addendum (2026-07-25): the renderer/perf lane now has a prioritized backlog — `docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md` (P1 context-loss + boot-progress, P2 honest input-ready metrics + hot-path allocations, P3 sourcemap/caching/PWA policy, W1 WebGPU probe gated on device-matrix data). P1–P2 items do not collide with Farmfall Phase A surfaces.
- Addendum (2026-07-25): first playtest evidence (achiever) reclassifies "external player language" from fully-open to partially-answered — fantasy-level rig differentiation confirmed by an uncontaminated player; the blocking fun gap is now "first reward reachability" (economy onboarding), routed into Farmfall Slice 01 scope along with four bugs.

## Addendum — 2026-07-26 canonical execution routing

The exploration map remains the product/research space. Execution status is now
normalized in [Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md),
where every active, ready, decision-gated, researching, and deferred item has a
closure gate. This avoids turning the exploration map into a second partially
maintained task board.

Current evidence changes:

- Field 02 passed the full browser acceptance flow on both local ports `4173`
  and `4174`;
- the Rapier raycast-wheel laboratory and Box3D physical-wheel probe passed
  their browser acceptance flows with desktop/narrow evidence and no console
  problems;
- three simulated fresh-eyes playtests agree that rigs communicate different
  fantasies, while also exposing a missing first reward rung and four P0
  comprehension/recovery/phase defects;
- the next product dependency is therefore first-rung repair → Farmfall
  day/night consequence loop → repeated external playtest;
- collision/attachment comparison, additional motion families, streaming,
  WebGPU, social systems, and production-intent asset expansion stay visible
  but must answer questions generated by the playable loop.

### Anything else?

Yes. Research breadth is no longer the limiting factor. The next exploration
updates should be driven by observed player decisions and failure modes, so the
catalog keeps opening useful possibilities without becoming a substitute for
finishing the first coherent game.

## Addendum — 2026-07-26 first-rung state contracts

- Accepted ADR-0019: absolute monotonic world time owns phase derivation;
  activity elapsed time is separate.
- Schema v5 now owns world-clock and exceptional-recovery state; Farmfall's
  crops/signatures/threats/mastery payload advances to schema v6.
- Exceptional recovery is a safety action, not a universal winch capability:
  zero-condition rigs return to Home Silo at 25%, award nothing, and increment
  a persisted audit counter.
- The authored first salvage cache proves that procedural distribution still
  needs intentional first-session anchors.
- RU-0106–RU-0109 are closed locally. The next observed-player lane is B5–B12,
  then first meaningful spend and Farmfall—not another mechanics catalog.

## Addendum — 2026-07-25 web-experience surface note

- The live `3d-web-experience` check confirms the current Field 02 surface is
  canvas-first with skip-link and operator visibility hooks.
- No explicit loading marker appeared in the DOM snapshot (`progress`,
  `aria-busy`, or similar), so visible loading progression and static fallback
  policy remain deliberate decision items before broader public/mobile
  expansion.
- This is a research cue, not a defect claim; it keeps the browser delivery
  lane honest about what is intentionally minimal versus what still needs a
  bounded public-entry affordance.

## Addendum — 2026-07-26 B5–B12 closure discoveries

The latest playtest-defect package produced four reusable product/architecture
rules rather than rig-specific patches:

1. **Physical presentation belongs to rigs; spatial truth does not.** Named
   hood sockets are rig-owned, while camera obstruction is one
   solver-independent query over typed terrain, obstacles, felled memory, and
   authored structures.
2. **Advertised starting content must be discoverable through gameplay.**
   Canonical Home berths make every current rig reachable through the real
   proximity rule. Future locked rigs still need an explicit claim/unlock
   mission rather than distant pre-placement or menu teleportation.
3. **Every locomotion family shares substrate refusal before it specializes.**
   Ground and hover retain different feel, but both obey one swept terrain-face
   invariant with semantic refusal and downhill escape.
4. **Player and evidence surfaces are different products.** Public play keeps
   persistence truth and contextual actions while hiding labs/tuning metrics;
   developer and acceptance surfaces expose those through explicit modes.

New exploration questions opened by this package:

- Should future rig acquisition use repair/claim/tow-home contracts, and how
  does ownership remain distinct from physical proximity?
- Which structure records need semantic transparency or non-occluder metadata
  when real GLBs replace proxies?
- How should `terrain-face` reasons become structured replay events and
  capability-aware route costs rather than prose only?
- Should developer/evidence mode become a signed build/profile capability
  before public sharing, so query parameters cannot expose privileged mutation
  tools in production?
- When activity context recommends a camera or action, how is the suggestion
  made explainable, overridable, and replay-safe?

## Addendum — 2026-07-26 route-clearance contract continuation

- The live runtime already owns authored grade-limited corridors and a
  nearest-track recovery return path, but not a general route-cost planner.
- That means `terrain-face` reasons are still prose-first feedback, not a
  structured route-cost event stream.
- The new [Route Clearance and Capability Pathing Contract](../research/ROUTE_CLEARANCE_AND_CAPABILITY_PATHING_CONTRACT_2026-07-26.md)
  keeps the next proof slice focused on candidate generation, capability-aware
  scoring, structured reasons, diagnostics, and replayable evidence.

## Addendum — 2026-07-26 browser-delivery contract continuation

- The `3d-web-experience` pass confirms the current runtime is still a working
  browser 3D surface, but the next durable gate is explicit delivery policy:
  truthful loading state, recoverable fallback, and low/balanced/high profile
  selection tied to measured budgets.
- This belongs in the `public promise` / browser-delivery lane rather than as
  a renderer-only concern.
- The next evidence should be a visible loading/fallback state on an
  intentionally constrained or delayed load path, plus a profile-selection
  capture that can be compared across device classes.

## Addendum — 2026-07-26 accessibility profile visibility

- The Accessibility Auditor pass reinforces that the remaining shell gap is
  not keyboard entry anymore; it is whether the user can see the current
  comfort/accessibility profile and understand loading state honestly.
- This makes the `accessibility/input` contract the policy owner for:
  remaps, reduced motion, visible profile state, and readable fallback, while
  the browser-delivery lane owns how those policies are surfaced to the player.
- Next proof should be a visible profile indicator plus one truthful loading
  or fallback state that survives the live Field 02 browser surface.
- That visible profile signal also belongs in the public promise, so comfort
  and fallback state stay player-facing instead of operator-only.

## Addendum — 2026-07-26 map overlay focus boundary

- The map overlay still needs a true dialog/focus contract even though it is
  already a working mode switch.
- That makes the map boundary part of accessibility/input and browser
  delivery, not a renderer concern.
- Next proof should add or document the focus-managed overlay boundary so the
  browser surface stays operable for keyboard and assistive-technology users.

## Addendum — 2026-07-26 observer gate keeps shared consequences narrow

- The event/presentation observer gate is the current shared propagation
  boundary for audio, VFX, accessible DOM/status surfaces, diagnostics, and
  replay capture.
- It should stay a narrow propagation layer, not become a generic pub/sub bus,
  until multiple independent consumers actually duplicate wiring.
- The episode grammar can compose above this gate when one semantic outcome
  must fan out, but the gate remains the owner of that fan-out boundary.

## Addendum — 2026-07-26 asset-production bridge versus approval

- The `3d-asset-production` pass confirms the repo now has runtime-tested
  bridge assets, but `runtime-tested` still is not the same as
  `publicRuntimeApproved`.
- That means the asset lane still needs a production profile contract:
  target consumer, budget, material/LOD intent, and a separate public-approval
  decision before a bridge asset is treated as shippable truth.
- The bridge is therefore a proof of browser ingestion and visibility, not a
  waiver for rights review or production grading.

## Addendum — 2026-07-26 asset public approval stays separate from story composition

- The asset promotion gate belongs to the asset/provenance lane, not to the
  episode-grammar or story-composition layer.
- `runtime-tested` proves the browser can ingest the asset; public approval is
  the separate decision that lets the player surface treat it as shippable
  truth.
- The promotion decision should carry rights, provenance, budget, and operator
  reason fields so the approval is auditable on its own.

## Addendum — 2026-07-26 procedural director remains a proposal layer

- The procedural director is the candidate-ranking and offer layer, not the
  authority for story composition, world mutation, or player preference
  inference.
- Episode grammar remains the layer that composes the lived run; the director
  only supplies validated options into that story system.
- The first proof remains a small authored multi-candidate choice, not a
  generative or personalized runtime.

## Addendum — 2026-07-26 command/event envelope is reusable, but the shared graph still is not

- The command and event contract lane confirms the app already has a useful
  local history and a reusable bounded envelope, but the shared fan-out graph
  is still not explicit.
- `run-record.ts` currently captures command/checkpoint/input/save entries, so
  the staging surface is real; the missing boundary is the shared graph with
  versioned emission points, domain ownership, and replayable/diagnostics-only
  classification across consumers.
- The next evidence should be a single command path that emits a reusable
  envelope into a shared graph and proves the same history can feed simulation,
  UI, replay, and diagnostics without parallel local truth sources.
  diagnostics without parallel local truth sources.

## Addendum — 2026-07-26 state-shell visual language still needs one browser-proof profile

- The quality ladder and visibility counters are now measurable, but the
  vehicle-state shell itself is still not runtime-owned as a canonical visual
  language.
- The remaining gap is not more profile names; it is one browser-proved shell
  profile that ties the state shell to the selected quality mode and a public
  approval boundary for that presentation layer.
- Until then, the shell work remains a contract lane rather than a shipped
  visual system.
- The browser-proved shell profile should be treated as a presentation-owner
  contract, not as another gameplay or accessibility state.
- The current runtime substrate is already visible in code: the renderer owns a
  dedicated state-shell mesh and shader, and feedback drives integrity/impact
  into it each frame.

## Addendum — 2026-07-26 browser-proved shell profile owner remains the missing bridge

- The state-shell lane and the accessibility/profile-visibility lane now share a
  clearer cross-cutting gap: one browser-proved shell profile owner.
- The public surface already has truthful shell state, runtime profile policy,
  and hidden operator diagnostics, but it still lacks one named player-facing
  owner for the visible shell/profile signal.
- The new [Browser-Proved Shell Profile Owner Contract](../research/BROWSER_PROVED_SHELL_PROFILE_OWNER_CONTRACT_2026-07-26.md)
  keeps that bridge explicit so the repo does not drift into two adjacent
  unresolved questions.

## Addendum — 2026-07-26 resource budget is measurable, but fallback ownership is still implicit

- The budget/fallback lane now has measurable inputs from performance, visibility,
  and profile-tier contracts, but it still lacks a named subsystem owner for
  fallback selection.
- The next proof should be a cross-system budget ledger and a visible fallback
  summary that names both the oversubscribed resource and the subsystem that
  triggered the downgrade.
- Until then, performance data remains observability, not policy.
- The current visibility fallback is already owned by `RuntimeProfileController`;
  what remains implicit is the broader CPU/GPU/memory governor beyond the
  renderer visibility lane.

## Addendum — 2026-07-26 planner work should wait for multi-candidate choice

- The behavior/planner lane confirms the runtime already makes real decisions,
  but those decisions are still single-verb resolutions in command handlers.
- The next proof should be a machine/task selector or activity scorer that has
  at least two valid candidates, deterministic ordering, and explicit loser
  reasons.
- A broad planner framework is premature until the app actually needs to rank
  competing valid actions rather than resolve one contextual action at a time.
- The strongest second activity candidate is a tow-plus-repair rescue flow,
  because it would reuse the matcher while forcing a distinct objective shape
  and recovery story.

## Addendum — 2026-07-26 creator-pack lifecycle is still broader than the asset slice

- The modding and authoring contracts confirm that the runtime already validates
  slices of content, but the pack lifecycle itself is still missing.
- The next proof should be a local-only pack manifest and rollback test before
  any public moderation or creator-discovery surface is considered.
- Pack validation should stay distinct from runtime authority so local content
  remains data-first instead of becoming a second mutable truth source.

## Addendum — 2026-07-26 physics decision provenance and solver authority

- An internal-only `wide-open-brainstorm` audit found that AI-generated physics
  recommendations supplied for evaluation had been incorrectly attributed to
  the operator and promoted into accepted Rapier/mandatory Box3D decisions.
- The current executable truth is narrower and stronger: Field 02 is the
  authored product runtime; Rapier raycast wheels and Box3D physical wheels are
  bounded evidence fixtures behind project-owned services.
- The current probes vary both solver and controller technique, so they prove
  boundary flexibility rather than an engine ranking.
- New backend work, solver-ranking claims, and public-lab promotion are paused.
  The labs, tests, and historical evidence remain preserved.
- The durable no-global-solver default, controller-family admission model,
  evidence gates, and decision-provenance taxonomy are Proposed in ADR-0023 and
  require explicit operator sign-off.
- A broader pattern audit remains open for other load-bearing ADRs whose
  “Accepted” status may have been inferred from supplied AI material rather than
  explicit operator acceptance.

## Addendum — 2026-07-26 compositional episode grammar and Storm Relay

- The previously scattered episode ideas now have one canonical proposal:
  [Compositional Episode Grammar and Storm Relay](COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- It records the seven-part episode grammar, separates pressure/modifier/
  discovery/consequence, defines the mechanic lattice and idea-mixer coherence
  checks, and connects VehiclePassport, social footprint, behavioural cargo,
  cross-rig mysteries, failure-generated recovery, story capture, and post-run
  consequence summaries.
- Storm Relay is captured as a future three-rig evidence candidate, not an
  accepted roadmap item. It tests rising-water pressure, radio-interference
  navigation, behavioural cargo, capability-specific solutions, persistent
  outcomes, and recovery contracts.
- The farm-to-city fringe is explicitly a dense test biome rather than the
  privileged center of the product. Underwater, orbital, miniature, fantasy,
  procedural, and other worlds remain equal possibilities.

## Addendum — 2026-07-26 performance/readability operator bundle is now a draft artifact

- The performance/readability lane now has a named draft operator bundle at
  [docs/reviews/PERFORMANCE_READABILITY_OPERATOR_BUNDLE_2026-07-26.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/reviews/PERFORMANCE_READABILITY_OPERATOR_BUNDLE_2026-07-26.md).
- The draft packages the recorded frame, draw, terrain, heap, input-readiness,
  and save-size signals into one reviewable surface so maintainers do not have
  to reconstruct the umbrella policy from scattered notes.
- This is still a packaging proof, not a public threshold claim. The next proof
  remains a clean representative-device capture plus a visible budget table
  that can be read alongside the specialized contracts.

# Exploration Map

Status: living canonical map
Started: 2026-07-25
Last updated: 2026-07-25

## How to use this map

Every meaningful discovery should either update an area below or create a linked research/decision artifact. Status vocabulary:

- **Idea** — plausible but unsupported.
- **Researching** — sources/examples are being gathered.
- **Experiment** — has a concrete falsifiable probe.
- **Proposed** — a preferred path is documented but not accepted.
- **Accepted** — enough evidence exists to guide implementation.
- **Deferred** — excluded from the current decision unit with a closure trigger.
- **Rejected** — considered and declined with a reason.

Evidence follows the project tiers from assumption (Tier 0) to production-like/real-data observation (Tier 5). No area below has Tier 3+ game evidence yet.

## North star and product identity

| Area | Current hypothesis | Status | Next evidence |
|---|---|---:|---|
| Core fantasy | Vehicles are the playable characters; each machine is a distinct set of verbs, tradeoffs, and stories. | Proposed | Observe whether players refer to the machine as “my tractor/bike/etc.” and explain its personality. |
| Genre continuity | The place, vehicle, upgrades, and consequences persist when mechanics or camera change. | Proposed | Tractor day/night integration prototype. |
| Open world | A connected graph of meaningful regions and activities can feel more coherent than one literally seamless simulation. | Proposed | Travel-transition storyboard and streaming probe. |
| Tone | Wonder, mechanical charm, repair, danger, and absurd escalation can coexist. | Researching | Art/motion/audio comparison and player language. |
| Public promise | A link opens into an understandable, restartable experience with honest maturity and clear controls. | Proposed | Public smoke-test checklist and external playtest. |
| Name and identity | **Rigs Unbound** is the accepted project and repository identity. | Accepted | Use consistently; complete trademark/domain clearance before commercial launch. See ADR-0005. |

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

| Question | Status | Probe |
|---|---:|---|
| Are activities found spatially or selected from a menu? | Proposed: spatial discovery first | Put two visible opportunities in the first region and observe choice. |
| Does failure cost resources, time, condition, opportunity, or only restart? | Idea | Test repairable consequence without grind. |
| Is the garage a menu, explorable place, or both? | Researching | Compare instant workshop overlay with small physical hub. |
| How does a player always know the next interesting possibility? | Researching | Opportunity compass that reveals verbs, not quest spam. |

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

| Topic | Possibilities to explore | Status |
|---|---|---:|
| Unlock | discovery, rescue, restoration, reputation, blueprint, challenge, trade | Researching |
| Ownership | collect all vs limited active garage vs relationships/loans | Idea |
| Loaners | temporary compatible vehicle/loadout lets a player try a contract without owning its capability | Proposed |
| Upgrade | reversible modules, tuning, repairs, cosmetic history, hybrid grafts | Proposed |
| Mastery | player skill, vehicle familiarity, certification, relationship | Researching |
| Damage | performance consequences, visible history, field repair, recovery | Researching |
| Trading | NPC barter first; player trading only with server ledger/escrow | Deferred |
| Real designs | inspiration without unauthorized brand/logo/livery replication | Proposed guardrail |

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

| Activity family | Vehicle verbs | Continuity hook | Candidate presentation | Status |
|---|---|---|---|---:|
| Racing/time trial | line choice, drift, boost, drafting, shortcuts | route knowledge, tuning, ghosts | chase/isometric | Researching |
| Farming/ecology | plow, seed, water, harvest, tow, restore | land state, weather, community | chase/isometric | First experiment |
| Defense | push, block, illuminate, deploy, rescue, damage | saved structures/crops | top-down shift | First experiment |
| Hauling/logistics | attach, balance, route, repair, deliver | economy and settlement growth | chase/map | Idea |
| Salvage/repair | scan, cut, tow, sort, rebuild | parts and world history | close third-person | Researching |
| Exploration | traverse, reveal, climb, fly, orbit | map knowledge and discoveries | adaptive | Proposed pillar |
| Combat | ram, evade, mount tools, exploit environment | threat/ecology consequences | chase/top-down | Researching |
| Tower defense | position vehicle/attachments, build lanes | structures persist in region | top-down | Idea |
| Rescue | tow, stabilize, light, transport | relationships/reputation | adaptive | Idea |
| Construction | grade, lift, assemble, connect | durable world changes | isometric | Idea |
| Spaceflight | launch, navigate, dock, mine, re-enter | scale ladder and fleet | chase/cockpit/map | Deferred experiment |
| Toy-scale worlds | use furniture/objects as terrain | scale reveals hidden world | chase/isometric | High-interest tangent |
| Stealth/shadows | light control, noise, cover, decoys | information and nonlethal play | top-down | Researching |

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

| Topic | Status | Closure gate |
|---|---:|---|
| Earning cadence | Idea | Instrumented first-playable runs |
| Sinks/repair | Researching | Fun without punitive maintenance |
| NPC barter | Idea | Clear value and anti-exploit rules |
| Player trading | Deferred | Server authority + abuse/economic design review |
| Real money | Rejected for initial product | Explicit product/legal/payment decision |
| Seasonal/live economy | Deferred | Stable core, operations capacity, non-FOMO policy |

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

## UI, onboarding, accessibility, and controls

Surfaces to explore:

- instant play/guest entry;
- garage and vehicle story;
- workshop/module comparison;
- world opportunity map;
- activity transition;
- active HUD;
- damage/recovery;
- inventory and provenance;
- discoveries/codex;
- co-op/lobby/presence;
- creator tools;
- settings/accessibility;
- connection/save conflict/operator-readable errors.

Requirements:

- remappable named actions;
- keyboard, gamepad, pointer, and touch;
- scalable DOM text and semantic controls;
- reduced motion and camera-shake controls;
- hold/toggle alternatives;
- contrast/color-independent cues;
- subtitles/captions and independent volume categories;
- difficulty/assist options that do not shame the player;
- safe area, resize, orientation, and narrow-screen behavior;
- onboarding through consequences and experimentation rather than modal walls.

## Art, animation, audio, and asset pipeline

See [DESIGN.md](../../DESIGN.md).

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

The locally owned Kenney All-in-1 3.4.0 bundle is now a **Proposed** selective prototype source. The first candidate manifest uses the current Car Kit tractor and box, Racing Kit ramp, Nature Kit props, and animated Graveyard zombie as identical cross-engine fixtures. No asset has been imported. The full bundle remains private and outside runtime/project truth; every selected import needs per-pack license evidence, hashes, normalization checks, and a Patchwork Atlas fit review. See the [Kenney asset library audit](../research/KENNEY_ASSET_LIBRARY_AUDIT_2026-07-25.md).

Direct project-owner preference now strengthens the tactile repaired-vehicle/diorama/near-isometric direction. New model-sheet, camera, and comparative art boards propose a hierarchy rather than a blended style: Patchwork Atlas as the persistent base, Signal Noir as a danger/information-state transformation, and Salvage Opera as a rare aspiration/event crescendo. Next evidence is an orthographic tractor turnaround, grayscale/mobile silhouette tests, a non-generic enemy ecology, and an actual camera graybox. See [Visual Direction Preference and Variants](VISUAL_DIRECTION_PREFERENCE_AND_VARIANTS_2026-07-25.md).

External premium generation currently lacks local Tripo/Gemini/ElevenLabs credentials; this does not block hand-authored, open-asset, procedural, or built-in image-generation exploration.

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

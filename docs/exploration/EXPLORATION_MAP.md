# Exploration Map

Status: living canonical map
Started: 2026-07-25
Last updated: 2026-07-29

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
- [3D Web Platform Accessibility & Deliverability Audit](../research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- [Decision Register](../decisions/README.md)
- [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
- [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md)
- [Three.js Animation Implementation Flow](../research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md)
- [Three.js Interaction Implementation Flow](../research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md)
- [Comms package](../comms/README.md)
- [Reviews index](../reviews/README.md)
- [Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md)
- [Public Asset Promotion Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md)
- [3D Game Skill App Analysis and Current Surface Gaps](../research/3D_GAME_SKILL_APP_ANALYSIS_2026-07-28.md)
- [Integration-First Design and Unification Roadmap](INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md)
- [Reachability and the Missing Middle](WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md)
- [Stranger at the Silo — Opening Narrative Exploration](STRANGER_AT_THE_SILO_OPENING_EXPLORATION_2026-07-29.md)
- [Game Design Spine](../design/GAME_DESIGN_SPINE.md) — proposed canonical whole-game design surface
- [ADR-0040 — Open vehicle-universe and design-spine hierarchy](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md)
- [First Playable — The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)
- [Worklog](../WORKLOG.md)

## Suggested order

1. Use the comms package first for launch and build-in-public work.
2. Use the reviews index next for evidence, approval, and closure work.
3. Use the public asset promotion package index when you need the asset-gate
   trail in one place.
4. Use the decision register and contract index for the current policy/analysis path.
5. Use the master execution tracker and worklog for the current operational sequence.

## North star and product identity

| Area              | Current hypothesis                                                                                                    |      Status | Next evidence                                                                                       |
| ----------------- | --------------------------------------------------------------------------------------------------------------------- | ----------: | --------------------------------------------------------------------------------------------------- |
| Core fantasy      | Vehicles are the playable characters; each machine is a distinct set of verbs, tradeoffs, and stories.                |    Proposed | Observe whether players refer to the machine as “my tractor/bike/etc.” and explain its personality. |
| Genre continuity  | The place, vehicle, upgrades, and consequences persist when mechanics or camera change.                               |    Proposed | Tractor day/night integration prototype.                                                            |
| Open world        | A connected graph of meaningful regions and activities can feel more coherent than one literally seamless simulation. |    Proposed | Travel-transition storyboard and streaming probe.                                                   |
| Tone              | Wonder, mechanical charm, repair, danger, and absurd escalation can coexist.                                          | Researching | Art/motion/audio comparison and player language.                                                    |
| Public promise    | A link opens into an understandable, restartable experience with honest maturity and clear controls.                  |    Proposed | Public smoke-test checklist and external playtest.                                                  |
| Name and identity | **Rigs Unbound** is the accepted project and repository identity.                                                     |    Accepted | Use consistently; complete trademark/domain clearance before commercial launch. See ADR-0005.       |

The public smoke-test gate now sits beneath the named composition stack: the
gate binds camera, performance, and accessibility evidence into one reviewable
public promise, while the contract-ledger/runner boundary recorded in ADR-0032
and the Episode Runner Specification remain the named composition stack above
it.
The browser-delivery contract now sits beneath that same stack too, so the
public promise can tell future work what is essential, what can degrade, and
what is optional without becoming the composition layer itself.

### Browser delivery and readable feedback

The next 3D-web pass is no longer about proving that the app can render 3D.
It is about proving that the browser surface can explain itself while it
loads, degrades, and communicates machine condition.

Current combined evidence points to a narrow gap:

- the shell and accessibility statement are already coherent in a mobile-sized
  viewport,
- the animation and interaction systems already separate camera/selection and
  rig-local presentation ownership,
- the rig signature contract already exists as a source-side fixture,
- the missing piece is one listener-owned, player-readable cue that makes the
  feedback lane visible without taking over gameplay authority.

The live browser probe tightened that further: the shell now narrates a
measured warmup state with `bootstrap-status`, `profile-status`, and
`save-status`, but still does not expose a first-class progress element or
meter. That means the next proof is not “make it visible at all”; it is “make
the loading evidence more explicit without lying about readiness.”

As of 2026-07-29, the accessibility promise itself is also now browser-
reachable through the shell's public Accessibility link. So the exploration
focus has shifted again: the discoverability seam exists, and the remaining
work is to keep the statement current while proving the manual inclusive QA
stack on the page and the shell.

The statement page was also opened directly in a live browser at
`http://127.0.0.1:4173/accessibility.html`, and the probe reached the expected
`Accessibility Statement - Rigs Unbound` title after resizing the viewport to
`390 x 844`. That is still only a partial proof, but it moves the public
promise from a repo artifact into a browser-reachable surface that has already
been exercised at a compact review size.

The same page was then loaded with JavaScript disabled, and it still rendered
the public promise content at the same compact viewport without horizontal
overflow. That makes the public accessibility pointer robust enough to use as
a real browser-delivery contract, while the remaining manual QA focus stays on
screen-reader narration.

A follow-up Chrome page-scale probe then set the statement page to `2x` and
confirmed the layout still stayed in bounds. So the remaining accessibility
gap is no longer “does the statement survive script-off or zoomed browsing?”.
It is now narrower: keep the statement current and run the screen-reader pass.

The shell reduced-motion probe now shows the global motion clamp doing its job,
so reduced-motion is no longer an open question in the public accessibility
trail.

A Chrome accessibility-tree probe of the shell also found the expected
`RootWebArea`, `Skip to playable world` link, `main` region, warmup `dialog`,
and the public accessibility link, which means the remaining screen-reader
gap is spoken narration rather than missing landmarks.

A Chrome accessibility-tree probe of the statement page also found the expected
`RootWebArea`, `main`, section headings, and evidence links, which means the
remaining screen-reader gap is spoken narration rather than missing structure.

A Chrome accessibility-tree probe of the live shell also found explicit
spoken labels on the announcement surfaces: world clock, current objective,
loading, save, quality, notification, and control lesson. That means the
remaining screen-reader gap is now about end-to-end spoken review quality,
not unlabeled live regions.

A follow-up probe also found no anonymous `status` nodes in the shell tree.
So the structural live-region cleanup is done for this pass, and the remaining
work is truly about how the shell sounds when a real screen reader reads it
end to end.

The shell’s highest-priority live phrases also improved: the current objective
reads as a full sentence, and the world clock is now passive text instead of a
live announcement. So the remaining screen-reader work is narrower still,
focused on flow, cadence, and whether the shell sounds calm rather than noisy.

The notification toast now also drops out of the accessibility tree while it is
idle. That keeps the notification surface available for real announcements
without leaving an empty live region behind between messages.

The same live probe also found latent acceptance hooks in the DOM
(`mission-board-button`, `mission-board-close`, `mission-briefing-accept`)
without a mounted, visible board. That means the mission gate is not absent,
but it is still hidden plumbing rather than a player-discoverable surface.

The follow-up surface read found a hidden `survey-contract` banner with the
text `Contract ready`, which means there is also passive status plumbing in
place. So the current state is not a single missing feature; it is a layered
but incomplete acceptance path:

- passive survey status,
- latent acceptance hooks,
- no mounted board.

The next browser probe tightened that further: on a desktop viewport the
acceptance board is already mounted and opens as a visible overlay, while the
compact/mobile shell hides the masthead trigger cluster through CSS. That
means the repo now has a viewport-specific exposure policy rather than a
binary presence/absence story.

After entering the field, the compact shell still did not reveal any
alternate contract-board entry path, so the mobile experience currently keeps
only status hints and no discoverable board affordance. That makes the next
decision explicit: is desktop-first board exposure the intended product shape,
or should compact/mobile gain a smaller board trigger?

See [3D Game Skill App Analysis and Current Surface Gaps](../research/3D_GAME_SKILL_APP_ANALYSIS_2026-07-28.md)
and [Rig Signature and Feedback Emission Contract](../research/RIG_SIGNATURE_AND_FEEDBACK_EMISSION_CONTRACT_2026-07-26.md).

### Dynamic world collision authority

The current runtime collision question is no longer “can the mesh render” but
“what physical role does each body own, and how does the simulation explain
contact?” The active exploration now treats collision authority as a semantic
layer over reduced-order bodies, with tunnel prevention, dynamic body
response, and contact telemetry as the near-term proof obligations. See
[Dynamic World Collision Exploration](../research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md)
and [ADR-0037](../decisions/ADR-0037-solver-independent-dynamic-world-collision-authority.md).

This is a stronger lens than mesh-derived collision because it preserves the
project-owned meaning of terrain, rig, cargo, obstacle, structure, trigger,
sensor, and decorative bodies even if the underlying solver changes later.

See also: [Runtime Reachability Ownership Matrix](../reviews/RUNTIME_REACHABILITY_OWNERSHIP_MATRIX_2026-07-28.md).

### Runtime reachability dispositions

The runtime reachability note records a budgeted unreachable-module set; the
exact measured count and module-by-module ownership live in the ownership
matrix review. The budget is not a player-facing promise; it is an
evidence-envelope for future slices.

The disposition note lives at
[Runtime Reachability Dispositions](RUNTIME_REACHABILITY_DISPOSITIONS_2026-07-28.md)
and records which modules are intentionally retained as design probes or
future vertical candidates. This keeps the archive/defer decision durable
without pretending the modules are already reachable gameplay.

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

### Opening narrative — Stranger at the Silo

The proposed Farmfall opening now has a dedicated exploration artifact:
[Stranger at the Silo — Opening Narrative Exploration](STRANGER_AT_THE_SILO_OPENING_EXPLORATION_2026-07-29.md).
It preserves the operator's seed, expands it into an arrival → bargain →
inspection → repair → first movement → dusk → dawn sequence, and keeps the
old man, stranger biography, exact promise, and mystery reveal unresolved.
The working recommendation is a practical road/relay motivation on the
surface, a buried signal as the first escalation, and the old man's machine
history as emotional subtext. This is Tier 0–1 exploration, not accepted
campaign canon or an implementation commitment.

### Proposed next-tranche arbitration

An internal-only wide-open brainstorm compared a cross-rig passage, a thin
pressure/relay proof, Farmfall sequencing, and a later toy-scale interior
experiment. The convergence favors one persistent cross-rig consequence as the
next portability proof, but this is a sequencing proposal rather than operator
acceptance. See
[Wide-Open Next-Tranche Arbitration](WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md).

### Integration-first priority

The runtime now has a strong persistent substrate but still presents
activities as disconnected minigames. The integration-first roadmap proposes
unifying the world graph, contract ledger, episode runner, and UI shell so that
every mode and activity reads as one game. See
[Integration-First Design and Unification Roadmap](INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md).

Completed slice: the unified UI shell coherence review now exists at
[UI Shell Coherence Slice — Implementation Review](../reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md),
and the dated addendum records the single-overlay manager, unified map layers,
radar toggle, and real pause menu as the first shipped integration-first proof.
The next slices named in the roadmap are the Contract Ledger overlay, the
Garage / fleet roster overlay, and the Labs-as-instruments drawer.

The Contract Ledger specification now exists at
[Contract Ledger Specification](../research/CONTRACT_LEDGER_SPEC_2026-07-27.md),
so the next step is implementation from `publicState`, not another design pass.
The Unified UI Shell specification now exists at
[Unified UI Shell Specification](../research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md),
so the shell work now has a durable accessibility and overlay contract to
implement against rather than a blank design target.
The Garage/Fleet roster specification now exists at
[Garage/Fleet Roster Specification](../research/GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md),
so the fleet sheet now has a durable character-sheet contract rather than an
implicit roster idea.
The asset pipeline now has a named manifest-authority boundary rather than a
single undifferentiated runtime-asset list; see
[Asset Pipeline and Provenance Contract](../research/ASSET_PIPELINE_AND_PROVENANCE_CONTRACT_2026-07-25.md)
and the current [Shell Accessibility Evidence](../research/SHELL_ACCESSIBILITY_EVIDENCE_2026-07-28.md)
for the browser-facing bridge/proof split.
The Episode Runner specification now exists at
[Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md),
so the named composition stack now has a durable episode contract instead of a
loose future-composition idea; the load-bearing decision is now captured
in [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md)
and the Episode Runner Specification.
The episode runner composition decision is now recorded in
[ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md),
which keeps the runner as a read-only composition layer above the contract
ledger rather than a second quest authority.

### Same vehicle, many games

The same canonical machine can be explored across farming, racing, survival,
zombie defense, urban service, construction, aquatic, aerial, and absurd
future modes without forking identity. See
[Same Vehicle, Many Games](SAME_VEHICLE_MULTI_MODE_ATLAS_2026-07-26.md).
The companion mode matrix, prompt sheets, and first escalation board live in
[Same Vehicle Mode Matrix](SAME_VEHICLE_MODE_MATRIX_2026-07-26.md),
[Same Vehicle Prompt Sheets](SAME_VEHICLE_PROMPT_SHEETS_2026-07-26.md), and
[tractor-mode-escalation-board-2026-07-26.png](assets/same-vehicle-mode-atlas-2026-07-26/tractor-mode-escalation-board-2026-07-26.png).
The newer paired comparison boards add farming versus racing, survival versus
construction, and urban versus absurd as concrete evidence for the same
identity under stronger genre pressure:
[Same Vehicle Comparison Boards](SAME_VEHICLE_COMPARISON_BOARDS_2026-07-27.md).
Those boards are also tracked in the
[Asset Provenance Register](../research/ASSET_PROVENANCE_REGISTER.md) as
project-owned exploration reference art.

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

The first-principles whole-game exploration now recommends a **Living Atlas
Odyssey**: an intimate persistent home grows into a wandering workshop and
small relational fleet, while dense regions, inhabitants, and rare scale
transformations supply purpose beyond the rig catalog. The recommendation,
competing whole-game forms, campaign arc, world premise, long-term loops,
progression, social/creator possibilities, design-question roadmap, and
proceed/prototype/pause/kill conditions are documented in
[Long-Term Game Design from First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md).
This is a proposed synthesis, not an accepted ADR.

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

| Topic     | Possibilities to explore                                                |      Status |
| --------- | ----------------------------------------------------------------------- | ----------: |
| Unlock    | discovery, rescue, restoration, reputation, blueprint, challenge, trade | Researching |
| Ownership | collect all vs limited active garage vs relationships/loans             |        Idea |

### Browser-delivered 3D trust layer

The `3d-web-experience` skill changes the analysis lens from "does the game
have enough 3D systems" to "does the browser surface communicate those 3D
systems clearly and accessibly." The current next probes are browser-delivery
questions, not simulation questions:

- Is runtime quality/profile state visible to the player, not just in operator
  diagnostics?
- Does save and recovery announce itself as a real state transition?
- Is reduced-capability fallback explicit when the browser cannot support full
  fidelity?
- Are loading/progress states clear enough that a player never mistakes them
  for a hang?

This lane stays paired with the open profile-visibility and save-status issue
reviews so the browser shell remains trustworthy even while the 3D core keeps
evolving. The detailed browser-delivery analysis lives in
[3D Web Platform Accessibility & Deliverability Audit](../research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md),
which keeps the loading, profile, reduced-motion, and fallback questions on a
separate durable track from the simulation contracts.
The live browser-first readout for the current repo state lives in
[3D Web Experience Live Repo Analysis](../research/3D_WEB_EXPERIENCE_LIVE_REPO_ANALYSIS_2026-07-26.md),
which records that the surface already behaves like a browser product with
runtime profile selection, narrow/mobile support, and bridge fallback handling;
the missing piece is still the public delivery policy name, not the existence
of a browser-first 3D surface.
The latest addendum in that note now sharpens the open gap further: the next
browser-delivery proof is explicit loading/progress, player-facing fallback
explanation, and a clear line between essential and degradable 3D.

The loading-story trust gap now has its own issue review too:
[Browser Loading Progress Issue Review](../reviews/BROWSER_LOADING_PROGRESS_ISSUE_REVIEW_2026-07-28.md).
That keeps the browser-shell contract split cleanly across profile visibility,
save announcement, and the still-fragmented in-progress/loading story instead
of merging all three into one vague browser-delivery note.
The accessibility analysis now agrees with that split: the `Accessibility
Auditor` pass confirms the remaining work is a manual inclusive QA stack, not
a basic keyboard-operability rewrite.
The live browser surface now backs that up more concretely: the public shell
shows the accessibility primitives at `390 x 844`, and the dedicated
`/accessibility` page is live as a durable public-promise pointer.
The statement page itself is also narrow-safe and cross-links the shell
evidence, the live analysis, and the public promise contract, so the browser
trail is now navigable rather than only textual.

The public accessibility-statement contract now has its own note too:
[Accessibility Statement and Public Promise Contract](../research/ACCESSIBILITY_STATEMENT_AND_PUBLIC_PROMISE_CONTRACT_2026-07-28.md).
That keeps the public promise auditable without forcing users to infer the
statement from runtime diagnostics or chat history.

The accessibility pass now also has source support: the public profile line is
visible in the shell, the save line is announced, and the remaining closure
work is now stronger assistive-tech proof rather than more design invention.
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
- 2026-07-29 skill synthesis: the multiplayer decision tree matches the repo’s staging order. Dedicated-server authority is the right shape for competitive real-time play, host-based authority fits lighter co-op, and both still depend on replayable local truth before they become safe to share.

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

The current repo-level agent lesson is the same one the parallel-runtime
handoff now records: autonomous work needs one obvious ownership boundary and
one durable handoff artifact. Hidden runtime edits are not an acceptable agent
contract when another lane is already live.

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
| Replay/input log artifact                  | Named contract, implementation pending | Add durable exportable replay artifact + compatibility classification + visible unsupported/divergence reason; keep playback verifier internal. |
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
- Addendum (2026-07-26): the camera lane is now a resolved policy surface, not a hidden renderer quirk. The runtime already exposes camera selection, obstruction evidence, and reduced-motion-safe behavior; what remains missing is a player-facing reason string and a durable camera-policy artifact separate from save-state mode and runtime evidence.
- The physics quality envelope contract now lives in [Physics Quality Envelope Contract](../research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md), which makes the deterministic traversal model, fallback expectations, and stability-state visibility explicit.
- The resource budget and fallback envelope now lives in [Resource Budget and Fallback Envelope](../research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md), which makes the current measured frame/draw/memory posture explicit and keeps low-budget fallback policy visible.
- The event graph and deterministic handlers contract now lives in [Event Graph and Deterministic Handlers Contract](../research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md), which makes the command/checkpoint/save flow explicit and keeps replay-safe event ownership visible.
- The command/event envelope now also carries the named composition boundary,
  so replay and diagnostics remain inspectable without inventing a second
  history source.
- The ECS threshold contract now lives in [ECS Threshold and Composition Readiness Contract](../research/ECS_THRESHOLD_AND_COMPOSITION_READINESS_CONTRACT_2026-07-25.md), which makes the actor-count and coupling threshold explicit and keeps composition migration proof-based.
- The ECS threshold also sits beneath the named composition boundary, so story
  composition should continue to use the current machine-centric model until
  measured pressure proves a migration.
- The physics quality envelope now also sits beneath the named composition
  boundary, so motion remains readable through explicit stability states
  instead of feel changes becoming a hidden second story system.
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

The `3d-asset-production` lens keeps this area honest: the repo already has
asset provenance, runtime bridge candidates, and a public-approval gate, so
the remaining question is not whether we can make more art but how one
approved source artifact crosses normalized export, validation, runtime
activation, and player-facing promotion without becoming a second truth
source. The current review trail for that promotion boundary lives in
[Public Asset Promotion Review](../reviews/PUBLIC_ASSET_PROMOTION_REVIEW_2026-07-28.md)
and the package index that summarizes the promotion lane.
The current asset-production conclusion is narrower still: the repo needs a
promotion path, not more concept art. The breakable crate remains the first
public candidate, and the tractor preview remains developer-only bridge proof
until the operator chooses to promote a different asset.

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

## Addendum — 2026-07-28 audio supports the shell, but it should not own state narration

- Re-read the audio presentation contract against the current shell and
  accessibility notes.
- The public shell already carries the visible profile, save, and status bands,
  and the accessibility statement page gives the player promise a durable home.
- Audio therefore stays in the support lane: machine feel, comfort, and
  acknowledgements. It should not become a second announcement system for
  profile, save, or loading state.
- The next audio proof remains the same narrow one: persist mute, keep burst
  suppression explicit, and connect the signature source to one readable cue.
  None of those should become the only way the player understands shell state.

## Addendum — 2026-07-28 asset delivery is the next 3D-asset-production lens

- Re-read the `3d-asset-production` skill to distinguish asset creation from
  asset delivery.
- The repo already has the key ingredients for delivery:
  - a canonical runtime asset manifest,
  - provenance and rights tracking,
  - validated runtime bridge candidates,
  - browser-visible public-approval gating.
- The current gap is not "more assets". It is the promotion path that moves one
  approved source artifact through normalized export, validation, runtime
  activation, and browser-visible approval without creating a second truth
  source.
- That keeps the art pipeline aligned with the browser-delivery lens: useful 3D
  assets are packaged, validated, and communicated clearly at the player
  boundary.

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
The new [Vehicle Reference Atlas](VEHICLE_REFERENCE_ATLAS_2026-07-26.md) now extends that exploration into a broader family of original rigs so later `img2threejs` passes have multiple silhouettes, scale regimes, and hardpoint grammars to choose from rather than only tractor derivatives.
The prompt-ready [Vehicle Game Visual Exploration Living Catalog](../vehicle_game_visual_exploration_living_catalog.md) now holds the larger visual-direction inventory and reusable prompt syntax for future boards, while remaining explicitly exploratory rather than production-approved.

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
3. Can a third activity compose existing capabilities—such as tow + repair rescue—without adding an activity-specific controller?
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
- schema v4 preserves valid legacy Torque/Spark state and adds Drift without
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
- Addendum (2026-07-26): the kernel-ordering gate also carries the named
  composition boundary, so story composition consumes authoritative outcomes
  instead of authoring state directly.
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

## Addendum — 2026-07-29 3D skill lens now splits rendering theory from browser delivery

- The `3d-games` skill clarifies the core engine-side seams: rendering
  pipeline, shaders, physics, camera feel, lighting, and LOD.
- The `3d-web-experience` skill then narrows the question back to the browser:
  3D should serve the experience, not exist for its own sake, and mobile
  fallback plus loading readability are part of the contract.
- The existing research trail already separates those concerns in the repo:
  the public shell can be 3D-capable while the browser-delivery policy still
  needs a named, player-visible explanation of full-fidelity, reduced, and
  fallback states.
- That means the next exploration work should keep the architecture lens and
  the browser-delivery lens linked, not merged into one generic "3D" bucket.
- Useful follow-up notes now live in
  [3D Game Skill App Analysis and Current Surface Gaps](../research/3D_GAME_SKILL_APP_ANALYSIS_2026-07-28.md)
  and
  [3D Web Experience Browser-Delivery Addendum](../research/3D_WEB_EXPERIENCE_BROWSER_DELIVERY_ADDENDUM_2026-07-29.md).

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

## Addendum — 2026-07-28 browser-delivery trust gaps stay split across profile visibility and save announcements

- The live browser probe still shows the active runtime profile is hidden from
  the public HUD, so the visible profile bridge remains open.
- The save/recovery line is still visible but not announced as a dedicated
  accessibility surface, so persistence trust remains a separate gap.
- Keep both issues linked from the reviews index rather than folding them into
  one generic browser-delivery note:
  [Visible Input and Accessibility Profile Issue Review](../reviews/VISIBLE_INPUT_ACCESSIBILITY_PROFILE_ISSUE_REVIEW_2026-07-26.md)

## Addendum — 2026-07-28 2D shell clarity stays readable as separate bands on mobile

- Re-checked the live browser at 390 × 844 after the profile and save changes
  landed.
- The public HUD now reads as a 2D status stack instead of one compressed line:
  profile status, save status, and hidden diagnostics are separated cleanly.
- The geometry proof shows the profile and save bands do not overlap at mobile
  width, which keeps the field-kit shell legible on the public surface.
- This is the right 2D-games-style result: clarity comes from a small number of
  distinct, readable status surfaces rather than extra decoration.
- Keep the browser-delivery proof split across
  [Visible Input and Accessibility Profile Issue Review](../reviews/VISIBLE_INPUT_ACCESSIBILITY_PROFILE_ISSUE_REVIEW_2026-07-26.md)
  and
  [Save Status Announcement Issue Review](../reviews/SAVE_STATUS_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md).
- The `public promise` lane still owns the browser-delivery policy, but these
  two issue reviews remain the player-facing proof surfaces.

## Addendum — 2026-07-28 2D shell contract is a clarity stack, not a second game

- Re-read the `2d-games` skill against the unified shell spec and the live
  browser shell notes.
- The useful shell guidance is to keep the public surface readable as a small
  number of bands:
  - status and prompt strip,
  - explicit overlay planes,
  - large touch actions,
  - clear return path to play.
- The current mobile shell already matches that direction: profile, save, and
  diagnostics are separated, the focus path remains obvious, and the public
  accessibility statement page gives the promise a durable home.
- The remaining work is refinement of those bands and their announcements, not
  a new shell authority or a denser navigation system.

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
  named composition stack described by ADR-0032 and the Episode Runner
  Specification.
- `runtime-tested` proves the browser can ingest the asset; public approval is
  the separate decision that lets the player surface treat it as shippable
  truth.
- The promotion decision should carry rights, provenance, budget, and operator
  reason fields so the approval is auditable on its own.
- The canonical navigation page for that trail is the [Public Asset Promotion
  Package Index](../reviews/PUBLIC_ASSET_PROMOTION_PACKAGE_INDEX_2026-07-28.md).

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

## Addendum — 2026-07-27 the shell/profile bridge is a presentation-owner problem, not a tier-selection problem

- The runtime profile policy is now tiered, so the bridge contract should not
  be read as a request for another quality-selection layer.
- The remaining question is exactly who owns the browser-visible shell/profile
  signal and how that owner explains fallback or reduced-profile state in the
  public surface.
- That keeps the presentation layer honest while leaving operator diagnostics
  and profile selection in their existing canonical homes.

## Addendum — 2026-07-27 the budget envelope is still missing the cross-system ledger

- The resource budget contract now reflects the live tiered renderer/profile
  trail, so the remaining gap is no longer whether the renderer can measure and
  fall back.
- The open question is still the umbrella budget artifact:
  one cross-system ledger, one operator-visible oversubscribed-resource summary,
  one subsystem-caused fallback field, and one readable within-budget /
  degraded / fail-soft table.
- This keeps the budget lane aligned with the live runtime without pretending
  the whole economy has already been formalized.

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
- The strongest next activity candidate is a tow-plus-repair rescue flow,
  because it would reuse the matcher while forcing a distinct objective shape
  and recovery story.

## Addendum — 2026-07-26 creator-pack lifecycle is still broader than the asset slice

- The modding and authoring contracts confirm that the runtime already validates
  slices of content, but the pack lifecycle itself is still missing.
- The next proof should be a local-only pack manifest and rollback test before
  any public moderation or creator-discovery surface is considered.
- Pack validation should stay distinct from runtime authority so local content
  remains data-first instead of becoming a second mutable truth source.

## Addendum — 2026-07-28 game design keeps tow-plus-repair as the next coherent activity loop

- Re-read the `game-design` skill against the activity/command readiness
  contract.
- The strongest next activity proof is still tow-plus-repair because it gives
  the player a clean 30-second loop: action, feedback, recovery, repeat.
- That is more useful than a generic registry or plugin layer because it proves
  a concrete player-facing loop while reusing the existing command/validation
  seam.
- The generic `ActivityDefinition` registry should still wait until a third
  materially different activity is real and can prove the same validation
  pattern in play.

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
- The newer [Dynamics Direction from First Principles](../research/DYNAMICS_DIRECTION_FIRST_PRINCIPLES_2026-07-27.md)
  note keeps the same boundary honest: it recommends authored-first by default,
  treats rollover and articulated recovery as design decisions, and keeps
  solver admission behind ADR-0023 rather than promoting a solver verdict by
  prose.

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

## Addendum — 2026-07-29 the performance/readability bundle now needs a named owner map

- Re-read the baseline and operator-observability notes together with the KPI
  lane.
- The next proof remains the same canonical budget table, but the table now
  needs to show which specialized contract owner is responsible for the
  exceeded threshold when the run falls out of budget.
- The explicit measurement gap should also be visible in the bundle itself so
  maintainers do not mistake implied state for first-class runtime state:
  - actor count,
  - active physics count.
- This keeps the bundle as an operator artifact rather than a second hidden
  policy layer.

## Addendum — 2026-07-26 world schema stays canonical while external content remains staged

- The world schema/content lane now has a named gate at
  [WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md](../research/WORLD_SCHEMA_AND_CONTENT_INGESTION_GATE_2026-07-26.md).
- The current authored world remains the canonical source of world truth; the
  new gate makes it explicit that arbitrary JSON, downloaded maps, or mod packs
  should not become a second runtime truth source.
- External-content admission stays separate from streaming/residency, which is
  still its own boundary. The next proof for this lane is a real second producer
  with schema validation, semantic checks, and versioned activation.

## Addendum — 2026-07-26 operator diagnostics remain a developer evidence lane

- The operator-observability contract now has a named addendum at
  [OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md](../research/OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md).
- The repo already has a coherent local evidence surface for acceptance and
  debugging, but that surface must stay separate from gameplay authority and
  from any future production telemetry claim.
- Future subsystems should extend the structured snapshot/checkpoint/evidence
  APIs rather than create a parallel debug lane or expose internal tuning to
  players.

## Addendum — 2026-07-26 event history is canonical, but dispatch ownership is still future work

- The event-graph contract now has a named addendum at
  [EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md](../research/EVENT_GRAPH_AND_DETERMINISTIC_HANDLERS_CONTRACT_2026-07-25.md).
- The runtime’s versioned run record is now the canonical event-history
  substrate, but it still only stages the graph instead of providing a shared
  dispatch/ownership model.
- The next proof for this lane is handler fan-out with per-handler ownership,
  replay-safe consumer split, and explicit deduplication policy.

## Addendum — 2026-07-26 capability composition is live, but governance is still implicit

- The capability contract now has a named addendum at
  [CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](../research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md).
- The runtime’s capability model is already real and composition-first:
  base profiles plus fitted modules drive capability admission, and the first
  structured denial envelope is now backed by that composition path.
- What is still missing is the deeper governance layer:
  versioned capability definitions, adapter registration, mutable capability
  state schemas, and per-capability migration rules.
- The next proof for this lane is a second materially different capability or
  adapter use case that justifies a registry without flattening the current
  profile/module composition model.

## Addendum — 2026-07-26 the public smoke-test gate is observable, but the bundled artifact is still missing

- The renderer/performance/accessibility contract now has a named addendum at
  [RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](../research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md).
- The runtime already exposes the needed hooks and readable gate behavior, so
  the public smoke-test gate is observable in practice.
- What is still missing is the bundled public-gate artifact that binds the
  profile matrix, checklist, KPI evidence, and fallback summary into one
  reusable package.
- The next proof for this lane is therefore packaging, not another basic
  accessibility repair: one capture bundle and one canonical pass/fail summary
  for fallback events.

## Addendum — 2026-07-26 physics stability is real, but the envelope is still implicit

- The physics contract now has a named addendum at
  [PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md](../research/PHYSICS_QUALITY_ENVELOPE_CONTRACT_2026-07-25.md).
- The runtime already exposes a deliberate first-playable motion model, and the
  new terrain-face refusal exists in code as a real traversal-block reason.
- What is still missing is the named stability envelope that says when the
  physics layer has simplified behavior rather than merely exposing raw
  signals.
- The next proof for this lane is an explicit operator-visible stability class
  or fallback summary on top of the existing terrain/obstacle/terrain-face
  checks.

## Addendum — 2026-07-26 persistence provenance is structured, but the broader observability envelope still matters

- The save/migration observability contract now has a named addendum at
  [SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md](../research/SAVE_AND_MIGRATION_OBSERVABILITY_CONTRACT_2026-07-25.md).
- The runtime now preserves source key, source schema version, world-memory
  presence, and recovery reason at the canonical persistence boundary, so the
  persistence path is no longer just a status string.
- What is still missing is the broader observability envelope that makes those
  provenance facts easy to review alongside operator-facing summaries and
  replay-safe recovery notes.
- The next proof for this lane is operator-visible summarization, not a new
  persistence system.

## Addendum — 2026-07-26 lighting is live and readable, but the policy envelope is still implicit

- The lighting contract now has a named addendum at
  [LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md](../research/LIGHTING_AND_ATMOSPHERE_STRATEGY_CONTRACT_2026-07-25.md).
- The runtime already keeps the field legible in day/gloam/night through the
  existing phase-driven lighting posture, so lighting is clearly doing useful
  gameplay work.
- What is still missing is the named lighting policy envelope:
  tier matrix, operator/debug strategy field, and a formal fallback rule for
  when atmosphere should simplify before clarity is endangered.
- The next proof for this lane is a first-class policy surface, not another
  renderer-only adjustment.

## Addendum — 2026-07-26 shader/material is live, but the state shell remains a narrow shader, not a general material system

- The shader/material contract now has a named addendum at
  [SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md](../research/SHADER_AND_MATERIAL_STRATEGY_CONTRACT_2026-07-25.md).
- The renderer still uses a readable baseline plus one scoped, state-driven VFX
  shader, so the visual language is real but intentionally narrow.
- What is still missing is a generalized layered material/shader system, and
  the next proof gate remains the same: only introduce new shader/material
  modules when a player-facing readability failure cannot be solved by the
  current baseline, fog, lighting, decals, or vertex-color path.
- The current state shell stays a deliberate narrow shader, not a signal that
  the repo should broaden into a shader fork per surface.

## Addendum — 2026-07-27 renderer optimization is now a budget lane, not a blank-slate culling question

- The renderer performance flow now records frustum culling, GPU memory
  tracking, auto-degrade quality tiers, and prop/terrain simplification as
  live repository work, so the old generic “should we cull?” question is no
  longer the right framing.
- The next useful proof for this lane is budget enforcement across systems:
  consistent quality-tier behavior, visibility-aware tiering, and the point at
  which streaming or collision semantics need to join the same envelope.
- This lane belongs with the other long-lived contract tracks instead of being
  treated as a one-off renderer patch.

## Addendum — 2026-07-27 runtime profile selection is now tiered, not binary, but the player-facing policy surface is still incomplete

- The visibility-profile design note now trails the live renderer flow rather
  than leading it: graduated quality tiers and auto-degrade already exist in
  the renderer/performance path.
- What remains open is the player-facing surface around that policy:
  visible active-profile state, plain-language fallback reasons, and the
  measured loading/progress story.
- That keeps the public promise aligned with the actual renderer behavior
  without pretending the current shell already exposes the full policy.

## Addendum — 2026-07-28 the visible profile bridge is still missing on the public shell

- A fresh browser probe confirms the current Field 02 page still hides
  `#runtime-diagnostics` from the public HUD, so the active runtime profile is
  still operator-facing rather than player-facing.
- That means the remaining browser-delivery work is still the same bridge:
  one browser-proved shell/profile owner that can explain visible profile,
  fallback, and loading state in plain language without duplicating the
  runtime policy itself.
- The existing `browser-proved shell profile owner` contract remains the right
  bridge note; this addendum simply keeps the exploration map aligned with the
  current live surface.

## Addendum — 2026-07-28 vehicle-family atlas is now the exploration substrate

- The next vehicle breadth is captured in
  [Vehicle Family Atlas and Canonical Spec](VEHICLE_FAMILY_ATLAS_AND_CANONICAL_SPEC_2026-07-28.md).
- Three new reference sheets cover utility/tow, rescue/emergency, and
  extreme/aspiration roles. They are concept-only and do not alter runtime
  truth.
- The long-term direction is now explicit: family spec → visual candidates →
  isolated multi-view package → image-to-mesh candidate → validation → runtime
  admission. The family/spec record, not a generated bitmap, is the proposed
  cross-mode source of truth.
- The next proof is candidate selection plus a reconstruction-ready isolated
  package, including dimensions, sockets, materials, uncertainty, and failure
  variants.

## Addendum — 2026-07-28 utility/tow package and extreme candidate expanded

- The utility/tow candidate now has a generated turnaround and five-mode board,
  with a dedicated intake contract at
  [UTILITY_TOW_RECONSTRUCTION_INTAKE_2026-07-28.md](../research/UTILITY_TOW_RECONSTRUCTION_INTAKE_2026-07-28.md).
- The turnaround is visual evidence only; exact orthographic consistency,
  scale, socket coordinates, and underbody geometry remain unknown.
- `extreme_snow_crawler_01` is now the grounded extreme candidate under review;
  it remains single-view reference-only.
- The next image-pipeline proof is strict spec authoring plus reference
  admission checks, not runtime registration. The runtime asset manifest stays
  unchanged until a validated mesh and browser budget proof exist.

## Addendum — 2026-07-28 contract ledger source-surface recheck

- The current runtime already exposes the board inputs through
  `publicState(state, world)` and reason-coded affordance resolution in
  `src/game/affordances.ts`.
- The contract ledger remains a read-only projection layer and should not
  become a second mission authority.
- Keep the next slice aimed at documentation plus a board overlay derived from
  current state, not a new persistence or mutation path.

## Addendum — 2026-07-28 garage/fleet roster shell reuse recheck

- The roster should reuse the unified overlay manager and focus behavior from
  the shell slice.
- The active rig remains the primary context; the sheet should explain the
  fleet, not own it.
- The next proof is presentation plus accessibility, not more state plumbing
  or a second garage model.

## Addendum — 2026-07-28 labs drawer contract drafted

- The labs now have a dedicated contract at
  `docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md`.
- The drawer should preserve runtime context and remain in the same shell.
- The continuity problem is now named, which makes future implementation and
  review much harder to misroute into separate pages.

## Addendum — 2026-07-28 radial quick-action wheel contract drafted

- The radial wheel now has a dedicated contract at
  `docs/research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md`.
- The authored quick-action surface in `src/game/radial-ui.ts` is now treated
  as a bounded control overlay, not just dead code.
- The next proof is a focus-safe wheel that maps to named actions and stays
  secondary to the rig.

- Source inspection still shows no runtime `openRadial` branch in `src/main.ts`, so the wheel remains spec-only until it is mounted into the shell manager.

## Addendum — 2026-07-28 world graph and place contract drafted

- The world graph now has a dedicated contract at
  `docs/research/WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md`.
- Authored sites, routes, and discovery anchors are now framed as one
  canonical topology of place.
- The next proof is source-traceable topology validation, not another map
  metaphor or navigation sketch.

## Addendum — 2026-07-28 streaming residency boundary recheck

- The streaming/residency contract now sits below the world-graph contract and
  stays focused on chunk activation and rollback.
- The current runtime still behaves as a single canonical residency.
- Chunked activation remains a future boundary, not a hidden implementation
  already waiting underneath the field.

## Addendum — 2026-07-28 runtime reachability classification

- `tools/audit-runtime-reachability.mjs` now gives the exploration lane a real
  measured number: 30 unreachable non-test modules out of 78.
- That number is a classification problem, not a deletion order.
- Before any pruning, preserve the parallel-agent and lab-surfaces distinction
  by sorting unreachable modules into:
  - parallel-owned work,
  - future-bound contracts,
  - lab-only/evidence surfaces,
  - genuinely dead code.
- The right next artifact is an ownership/provenance matrix for reachability,
  not a blanket cleanup pass.

## Addendum — 2026-07-28 runtime reachability is now a measured number, and it is the session's largest finding

A wide-open brainstorm run against measured repository facts produced one
finding that outranks every other exploration item currently on this map:

**30 of 78 non-test source modules (2,365 lines) cannot be reached from any
shipped entry point. 28 of them have passing tests.** (historical snapshot;
the current classification lives in the ownership matrix and disposition
artifacts.)

This is now reproducible rather than anecdotal:

```bash
node tools/audit-runtime-reachability.mjs
```

The audit walks the transitive import graph from the real entry points
(`index.html`, `physics-lab.html`, `box3d-lab.html`, and the build configs), so
it catches orphan _clusters_ — for example `expedition-economy.ts`, which has an
importer, but only from `salvage-crafting.ts`, which is itself unreachable.

### Why this belongs on the exploration map and not only in the tracker

The unreachable set is not incidental debt. Read as a list it is almost exactly
the tactical vocabulary this project's own thesis calls for — tyre pressure,
differential lock, winch, crane, thermal load, fuel burn, surface moisture,
debris, landslide, soil, weather, radio — plus `world-memory.ts`, the engine of
the accepted "the land remembers" thesis, and `fleet-recovery.ts`, the emotional
payoff of the entire fleet premise.

**The most on-thesis code in the repository is the code the player cannot
reach.**

### The Missing Middle

Four independent brainstorm roles converged on the same diagnosis. The current
loop has verbs for departure and verbs for arrival, and almost none for coping
in between. A journey with its middle removed is a checklist — which is exactly
the word three simulated personas used.

The interface has the same hole in the same place: a 10,000-foot layer (map,
atlas, rumour graph) and a ground layer (action prompt, save line, objective
chip), with no 1,000-foot layer showing what the machine is doing right now and
at what cost. `radial-ui.ts` is that missing layer, and it is unreachable.

> The UI's missing altitude and the gameplay's missing middle are the same hole.
> The interface is an accurate map of the wiring.

### Correction to a load-bearing record

ADR-0031 and the Master Execution Tracker previously recorded that `src/game/
animation.ts` was not wired into the live renderer path. The current checkout has
resolved this with an explicit renderer import and per-frame update path.
The original false-claim record is preserved for provenance, while the
runtime-ownership assertion is now corrected.

### Status of the proposals

| Item                                                     |            Status | Next evidence                                                                       |
| -------------------------------------------------------- | ----------------: | ----------------------------------------------------------------------------------- |
| The Missing Middle diagnosis                             |          Proposed | Wire three tactical verbs; observe whether session language stops using "checklist" |
| Reachability Budget as repo policy                       |          Proposed | Operator sign-off; then adopt `--max` in the verification path                      |
| The Pegboard (`radial-ui.ts` revival)                    |              Idea | Focus-safe wheel bound to named actions                                             |
| Stranded, Not Reset (`fleet-recovery` + `winch-physics`) |              Idea | One failure that produces a rescue contract instead of a rollback                   |
| The Land Is Trying To Forget (decay/regrowth)            |              Idea | Route decay that makes persistence earned                                           |
| The Compliance Officer (Atlas as bureaucracy)            |              Idea | One episode where an improvised route is filed non-compliant                        |
| Routes Are The Save File                                 |   Idea (leapfrog) | Export one route graph as a shareable artifact under ADR-0004 policy                |
| One Machine That Changes (fleet deferred to Act II)      | Open disagreement | Operator decision; changes Act I sequencing                                         |

Full room, role outputs, arbitration, and build conditions:
[Reachability and the Missing Middle](WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md).

### Anything else?

Yes, and it is uncomfortable. This map has grown to 1,900+ lines and the wider
`docs/` corpus to roughly 71,000 lines against 33,000 lines of source. The
project now produces documentation commits at roughly three times the rate of
shipping commits. That ratio is defensible as the cost of an agent-parallel
labour model, but it stops being defensible at the moment the documentation
begins making claims the runtime contradicts — which has now happened once.

The correct next exploration entry on this map is therefore **not another
contract note**. It is the result of a wiring experiment on three named modules.
If the next addendum here is another design proposal with no reachable verb
behind it, that is evidence the method needs changing, not the map.

## Addendum — 2026-07-28 wiring experiment is now the next concrete step

- The next concrete artifact is
  `docs/exploration/WIRING_EXPERIMENT_RADIAL_WEATHER_RECOVERY_2026-07-28.md`.
- The experiment ties together `src/game/radial-ui.ts`, `src/game/weather.ts`,
  and `src/game/fleet-recovery.ts`.
- This is intentionally a wiring path, not another contract note.
- It should surface one reachable verb and one visible outcome path.
- The current route anchors are the recovery feedback in `main.ts`, the
  recovery control lesson, weather-weighted recovery propositions, and
  `fleet-recovery.ts` as the consequence primitive.
- The route now crosses control guidance -> named action -> proposition ->
  command/result -> progression consequence.
- The route now also probes whether the read-only contract board can become
  the player choice surface for that proposition.

## Addendum — 2026-07-28 mission acceptance surface named

- The player-choice layer is now named in
  `docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md`.
- The map still treats the wiring experiment as the next concrete step, but
  the experiment's outcome is now clearly framed: the ledger projects rows,
  the acceptance surface makes them reachable and accessible, and the command
  path resolves the chosen proposition.
- This keeps the repository from silently collapsing the board, the choice,
  and the simulation into one undifferentiated authority.

## Addendum — 2026-07-28 row and announcement model named

- The acceptance surface now has a concrete row contract at
  `docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md`.
- That note gives the map a place to point when the next proof slice is about
  selected rows, spoken reasons, explicit accept/dismiss behavior, and focus
  restore.
- The next step is no longer “some accessible board.” It is a focus-managed,
  announced row model with clear world-state versus selection-state separation.

## Addendum — 2026-07-28 board sectioning and visibility named

- The board’s compact-versus-expanded layout now has its own contract at
  `docs/research/MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md`.
- That note keeps the next proof slice concrete: visible section headings,
  manageable default density, and readable history without collapsing the
  board into a giant flat list.
- The exploration map can now point at a fully named chain from ledger ->
  surface -> row -> sectioning, which is the last missing browser-contract
  seam for this lane.

## Addendum — 2026-07-28 board header and summary named

- The board’s title, summary count, and mode line now have a contract at
  `docs/research/MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md`.
- That means the acceptance-surface lane is now fully named from top-level
  orientation through sectioning, row announcement, and choice semantics.
- The remaining proof is now runtime/browser evidence, not missing naming.

## Addendum — 2026-07-28 history recap named

- The board’s history retention and recap behavior now has a contract at
  `docs/research/MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md`.
- That closes the remaining naming gap for the board presentation chain:
  header -> sections -> rows -> announcements -> bounded history.
- The next proof is now about the live browser surface, not another contract
  note.

## Addendum — 2026-07-28 transition and restore named

- The board’s open / reconfigure / close choreography now has a contract at
  `docs/research/MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md`.
- That closes the last named browser-contract seam in this lane.
- What remains is not naming; it is runtime proof of focus restore, selection
  preservation, and compact/expanded behavior in the live surface.

## Addendum — 2026-07-28 empty state and fallback named

- The board’s zero-row and fallback behavior now has a contract at
  `docs/research/MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md`.
- That closes the last browser-facing presentation gap for the board lane:
  the board can now explain itself when populated, compact, empty, or
  returning to play.
- The remaining proof is live runtime/browser evidence, not another board note.

## Addendum — 2026-07-28 loading and refresh named

- The board’s in-progress loading / refresh behavior now has a contract at
  `docs/research/MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md`.
- That keeps the board from looking broken while it is rebuilding rows and
  gives the browser surface a distinct “still loading” state instead of
  silently defaulting to empty.
- The remaining proof is live runtime/browser evidence, not another board note.

## Addendum — 2026-07-28 proposition, resolver, and surface are still separate source layers

- Source inspection now shows the acceptance lane should be read as three
  distinct layers:
  - `src/game/mission-propositions.ts` derives deterministic propositions.
  - `src/game/mission-resolver.ts` applies rewards and progression.
  - `src/game/state.ts` exposes the survey contract as a contextual offer.
- That matters because the repo still does not show a dedicated board
  component that turns those contracts into a named player-facing acceptance
  surface with focus, row announcement, and compact/expanded semantics.
- The next proof target is therefore not more proposition logic; it is the
  player-facing board that consumes it.

## Addendum — 2026-07-28 the runtime still lacks a dedicated contract-board overlay

- A source sweep now confirms the runtime has the mission proposition engine,
  the mission resolver, and a contextual survey offer, but it does not yet
  expose a separate focus-managed contract-board component.
- The current overlays (`rumor-map-ui.ts`, `navigator-ui.ts`) are separate
  world-navigation and tactical surfaces, not the read-only ledger board named
  in the contract spec.
- That means the remaining proof is architectural, not lexical: the board
  needs to exist as its own overlay before the accessibility and row semantics
  work can be validated live.
- The exact runtime insertion point is the `OverlayKind` / `openOverlay` /
  `closeOverlay` cluster in `src/main.ts`; today it only branches for `map`,
  `pause`, `workshop`, and `lesson`, so the contract board has no runtime
  branch to enter yet.
- The labs drawer has the same status: `src/main.ts` still exposes only a
  separate `#physics-lab-link` anchor, and `openLabs` does not exist in the
  runtime shell yet.
- The garage/fleet roster is the same kind of gap: `src/` has no dedicated
  garage overlay or `openGarage` runtime branch yet, even though the roster
  spec already has enough public state for a read-only first slice.

## Addendum — 2026-07-28 the animation boundary is fixed, and it changed what "wire the orphans" means

The first orphan is wired (30 → 29 unreachable, 2,365 → 2,040 lines), but the
way it went is the durable finding, not the count.

Implementing ADR-0031 literally would have **damaged the game**. Its module
re-derived `wheelRotation` and suspension compression that the fixed-step kernel
already owns, persists, and replay-validates, and its transform step dropped
`heading`, `pitch`, and `roll` outright. ADR-0034 supersedes it: the kernel owns
anything that survives a reload or a replay, and `vehicleAnimationSystem` owns
how that truth is shown.

### The lesson that generalises to the other 29

> **An unreachable module cannot be trusted to be correct.** Nothing forces an
> unimported module to stay consistent with the runtime it describes, so it can
> hold an arbitrarily wrong design indefinitely without a single check failing.
> Its tests pass because they test its own invented model.

This materially changes the RU-0910 experiment. "Wire three verbs" is not a
mechanical exercise: each orphan must first be **re-derived against the current
authoritative layers** before it is connected. Expect some of the 29 to be wrong
in the same way — written against an imagined state shape rather than the real
one. That is exactly the Champion-versus-Executioner test the brainstorm framed,
and the first data point says the Executioner was more right than the Champion
on this file.

### Build rather than delete

Two dormant channels were built instead of removed, per operator direction:

- the **cockpit steering control** now exists on Torque and Spark and turns at
  2.5× the road-wheel angle. Live browser evidence corrected the design: the
  tractor's hood camera socket sits _ahead_ of the windscreen, so it is a
  hood-mounted view, not an interior one. The control sits in the cab where a
  driver would hold it, and the genuine cockpit payoff is **gated on an interior
  camera that does not exist**. This makes an interior/cockpit camera a concrete
  candidate, and connects directly to the Patchwork Dashboard idea already named
  in the UI research section;
- the **clip seam** is real: imported GLB animations bind to a mixer the frame
  loop ticks, so the asset pipeline no longer silently discards
  `gltf.animations`.

### Status changes

| Item                                           |                                   Status | Evidence                                               |
| ---------------------------------------------- | ---------------------------------------: | ------------------------------------------------------ |
| Rig-local animation ownership                  |      **Accepted mechanism, implemented** | ADR-0034; 382 tests; live `visualFrontIsForward: true` |
| Cockpit instrument layer (Patchwork Dashboard) | Idea → **Partially built, camera-gated** | Control exists and animates; no interior camera        |
| Imported-asset clip playback                   |                   Idea → **Implemented** | `animationClipCount` in bridge evidence                |
| "Wire the orphans" as a mechanical task        |                     **Rejected framing** | The first orphan required supersession, not wiring     |

## Addendum — 2026-07-28 the next five are sequenced, and the Pegboard has a modality

The reachability tranche is now sequenced with per-item reasoning, acceptance
gates, and **explicit expansion paths** so each stays open to redesign as
playable evidence arrives:
[Next Five — The Reachability Tranche](../plans/NEXT_FIVE_REACHABILITY_TRANCHE_2026-07-28.md).

|   # | Item                                                 | Exploration status                          |
| --: | ---------------------------------------------------- | ------------------------------------------- |
|   1 | Reachability budget (`--max 29`, ratcheting)         | **Adopted**                                 |
|   2 | The Pegboard — the missing 1,000-ft tool-state layer | Proposed; geometry open                     |
|   3 | Tyre pressure + differential lock                    | Proposed; may shrink to fewer, deeper verbs |
|   4 | Stranded, Not Reset                                  | Proposed; recovery _form_ genuinely open    |
|   5 | `world-memory.ts`                                    | Proposed; highest supersession risk         |

### One modality decided, deliberately narrow

**ADR-0035**: the Pegboard runs **live**, with an **accessibility opt-in that
pauses**. Operator direction. Only the modality is accepted — geometry, tool
list, and visual design remain open.

The reasoning belongs on this map because it is a product principle, not a UI
detail: _a tool choice made outside of time is inventory management._ The
Missing Middle diagnosis says the absent thing is coping under pressure, so a
surface that removes pressure would fill the gap with the wrong substance. The
opt-in exists so that does not become a dexterity gate, and it is a comfort
setting rather than a difficulty setting.

This constrains the design harder than pausing would: tool states must be
readable at a glance, under motion, without reading numbers — and narrow-screen
touch is now the hardest case rather than an afterthought.

### Ideas this tranche keeps deliberately unresolved

Three named brainstorm ideas are _routed_ by the tranche but not decided by it,
and each should get its own exploration pass before its host item fixes shape:

- **The Logbook** (diegetic provenance in the machine's voice) and **The Land Is
  Trying To Forget** (decay makes persistence earned) both live inside item 5 and
  could reshape it substantially.
- **Routes Are The Save File** — the leapfrog — becomes reachable if item 5
  settles on routes as the durable memory object.
- **One Machine That Changes** (RU-0912, Act I sequencing) is not resolved here,
  but item 4 supplies real evidence for it: if a rescue makes the second rig feel
  necessary rather than administrative, that is an argument for the fleet
  arriving earlier rather than later.

### The open gap carried forward

The cockpit steering control built under ADR-0034 is real and animated, but the
tractor's hood camera socket sits ahead of the windscreen — it is a hood-mounted
view, not an interior one. **An interior/cockpit camera would unlock both that
control and the Patchwork Dashboard idea already named in the UI research
section.** It is deliberately not in this five and is the first candidate for the
next one.

## Addendum — 2026-07-28 the permanent controls strip was a second guidance authority

Operator review of a live screenshot asked why the keyboard controls were
permanently on screen. The answer turned out to be structural rather than
cosmetic, and it sharpens an accepted principle.

`ADR-0020` already decided that a control is introduced when its context first
becomes relevant and **retired once the player performs it**. The always-visible
strip along the bottom of the play surface was a _second_ control-guidance
surface that was never contextual and never retired — two truth sources for one
job. It also ran directly against two anti-patterns already recorded in this
map's UI section: _information overload in early play_, and _UI that fights the
Patchwork Atlas tone_.

### The rule this establishes

> **Scaffolding that never comes down is not scaffolding — it is permanent
> furniture in front of the thing the player came for.**

Teaching and reference are different jobs. Teaching is contextual, one at a
time, and retires itself (ADR-0020). Reference is on demand, complete, and
remembers whether you want it. Conflating them produces a legend that is both a
bad teacher and permanent clutter.

### What changed

The legend is hidden by default and revealed by `?` or a small `? Keys` button,
with the choice persisted as a browser-local UI preference. The camera selector
and Reset field stay visible, because they are _controls_ rather than a legend
and the accessibility baseline requires a pointer path.

### The longer-term reading

The legend existed because the game has no diegetic surface showing what the
machine can do. That is the same Missing Middle hole from a different angle: a
list of keys is what an interface produces when it cannot show tool state in the
world. As the Pegboard lands (ADR-0035) and the cockpit instrument layer becomes
viewable, the legend should become **progressively less necessary rather than
more elaborate**. If a future change makes the key list longer, that is a signal
the diegetic layer is missing something, not that the legend needs more room.

This also strengthens the case for the interior camera already carried forward as
the next tranche's first candidate: the more the rig can say about itself, the
less the frame needs to.

## Addendum — 2026-07-28 the Missing Middle now has one worked example

The fleet-recovery vertical is the first complete cause-and-effect chain in the
runtime, and it answers the brainstorm's central diagnosis with an artifact
rather than an argument.

```text
world situation -> pure assessment -> projection -> validated command
-> authoritative transition -> event -> persistence
```

### What it settles

- **The parts-bin question has a second data point, and this one favours the
  Champion.** `weather.ts` and the tow-force probe were re-derived and connected
  without redesign; only the mission *naming* had to be superseded. So the
  unreachable set is neither pure mirage nor pure parts bin — it is mixed, and
  the deciding factor is whether a module invented state the kernel already owns.
  `animation.ts` did; `weather.ts` did not.
- **Weather is now a mechanic, not copy.** Saturated soil lowers grip in the
  motion model, and the assessment reads grip through the same helper. A
  contract can no longer say "storm conditions make this harder" while the rig
  experiences unchanged traction.
- **Failure can now produce a story.** A stranded rig stays in the world, is
  assessed, is reached, and is recovered to 25% — mobile but visibly damaged.
  This is the "Stranded, Not Reset" idea, and it is item 4 of the tranche
  landing early because the review's slice required it.

### The rule this adds

> **A surface may only claim what the simulation can already deliver.** If a
> board says the ground is worse, the ground must be worse first. One
> assessment, read by every surface, is how that stays true.

### Status changes

| Item | Status | Evidence |
| --- | ---: | --- |
| Weather as a mechanic | Dangling -> **Implemented** | `weather-traction.test.ts`; grip falls with moisture on soft ground only |
| Fleet recovery | Idea -> **Implemented vertical** | 410 tests; live browser chain with reload persistence |
| "Stranded, Not Reset" | Proposed -> **First slice landed** | Recovery restores 25%, never 100% |
| Contract board as a player-choice surface | **Data model ready, UI pending** | `publicState().fleetRecovery` projection exists and is browser-verified |
| Radial wheel as pure projection | **Still open** | `radial-ui.ts` retains local `active` booleans |

### What the tranche looks like now

Items 1 (budget), 4 (Stranded, Not Reset), and most of the review's sequence are
done. The remaining shape is the **Pegboard** (item 2) — which is now the only
thing standing between the projection and a player being able to press it — then
tyre pressure and diff lock (item 3), then `world-memory.ts` (item 5).

## Addendum — 2026-07-28 the Missing Middle has its first two verbs

The tranche's item 3 landed, and with it the diagnosis that started this
session is no longer only a diagnosis.

A player can now, mid-drive, open the Pegboard without the world stopping, air
down for float, lock the axle for a climb, and pay for both — and the choices
persist. That is a tactical vocabulary between departure and arrival, which is
exactly what four independent roles said was absent.

### The design rule that emerged

> **A tool state must be worse somewhere.** Airing down only helps where grip is
> scarce; on hardpan it is pure cost. If a commitment were better everywhere the
> player would leave it switched on, and it would stop being a decision — it
> would be a permanent upgrade wearing a button.

This is stronger than "give it a cost." The cost has to be *situational*, so the
same control reads differently depending on where the rig is standing. That is
what makes terrain a decision space rather than a backdrop.

### The discriminator held

ADR-0034 produced the question: *does this dormant module invent state the
kernel already owns?* Applied to `tire-pressure.ts` and `differential-lock.ts`,
both answered no — pure functions taking parameters — and both wired cleanly.
The tranche's parts-bin experiment now reads:

| Module | Verdict | Outcome |
| --- | --- | --- |
| `animation.ts` | Invented kernel-owned state | Supersession (ADR-0034) |
| `weather.ts` | Pure derivation | Clean wire |
| `tire-pressure.ts` | Pure derivation | Clean wire |
| `differential-lock.ts` | Pure derivation | Clean wire |
| `xp-progression.ts` | Contradicts an accepted ADR | **Quarantined** (ADR-0036) |

**Three outcomes, not two.** The set is not parts-bin-versus-mirage; it is
parts bin, mirage, *and contraband*. Quarantine is the answer to the third,
and it generalises: the audit now enforces "this may never be admitted" as a
distinct rule from "this is not admitted yet."

### Status changes

| Item | Status | Evidence |
| --- | ---: | --- |
| The Pegboard (tranche item 2) | Proposed -> **Implemented** | ADR-0035 validation section; keyboard, live, projections |
| Tyre pressure + diff lock (item 3) | Proposed -> **Implemented** | 15 tests; both tradeoffs proven end-to-end |
| Universal XP | Ungoverned orphan -> **Quarantined** | ADR-0036; enforced by the audit |
| Radial as pure projection | Open -> **Closed** | `deriveRigToolProjections()` |

### What remains

`world-memory.ts` (item 5) is the last named tranche item, and it carries the
highest supersession risk: the save schema already holds terrain deltas,
discoveries, and route state, so the question is whether that module duplicates
a persistence authority. **The Logbook** and **The Land Is Trying To Forget**
both live inside it and should get an exploration pass before its shape is fixed.

## Addendum — 2026-07-28 dynamic world collision becomes a live substrate

The collision question moved from exploration-only to a verified current-runtime
substrate under [ADR-0037](../decisions/ADR-0037-solver-independent-dynamic-world-collision-authority.md).
The implementation preserves the project's key boundary: simulation records own
physical identity; visual meshes can be replaced without changing gameplay.

### What is now real

| Boundary | Current state | Evidence |
| --- | --- | --- |
| Terrain | Ground settling plus swept extreme-face refusal | `terrain-traversal.test.ts` |
| Procedural obstacles | Earliest swept circle contact; trees may fell | `collision.test.ts` |
| Authored structures | Earliest swept circle/AABB proxy contact | `scene-query.test.ts` |
| Parked fleet | Movable, mass-weighted, identified blockers | `world-collision.test.ts`; browser JSON |
| Relay cargo | Free and attached cargo collide with the world/fleet | `world-collision.test.ts` |
| Policy | Semantic roles; unknowns fail closed and become telemetry | `collision.test.ts` |
| Operator visibility | Strongest recent identified pairs retained for 12 steps | `publicState().collision` |

The rig proxy is a conservative circle derived from wheelbase, wheel arc, and
track. That is intentionally more honest than the old width-only circle: a long
nose cannot occupy a visible obstacle before the centre notices. It is also
explicitly transitional. A capsule or compound proxy becomes the next step when
measured side clearance, a long chassis, or articulation falsifies the circle.

### Product consequence discovered during integration

Once parked rigs became solid, the original west-side Home berths blocked the
guaranteed westbound first-cache lane. Spark and Drift now berth east of Torque.
This is a useful design principle, not test trivia:

> Making world bodies real changes level design. Spawn, service, recovery, and
> mission routes must be validated against physical envelopes, not mesh centres.

The same sweep corrected another stale proof: the skimmer does not gain tyre
benefit from tilled soil. Its cushion authority deliberately replaces ground
grip; only changed height/grade may cause a small difference.

### Highest-information next questions

1. At what measured clearance does the conservative circle feel like an
   invisible bubble, and which current rig falsifies it first?
2. Should the next proxy be a project-owned capsule/compound record before any
   solver selection, or should ADR-0023 admit the representation and mechanism
   together through the trailer/lifting-arm activity?
3. Which asset-admission check proves every non-decorative imported object has a
   semantic role and primitive proxy without turning renderer nodes into
   gameplay authority?
4. When do collision incidents become durable replay events rather than bounded
   operator telemetry?
5. How should audio, camera impulse, deformation, and persistent damage scale
   from the same strongest-contact record without making feedback a second
   physics authority?

### Evidence

- [Dynamic World Collision Exploration](../research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md)
- [Dynamic World Collision Acceptance](../reviews/DYNAMIC_WORLD_COLLISION_ACCEPTANCE_2026-07-28.md)
- `npm run test:collision-browser`
- `npm run typecheck && npx vitest run` — 74 files / 444 tests

The current narrow-viewport probe also keeps the compact contract-board reading
stable: the contracts controls still exist in the DOM but remain zero-sized and
absent from the accessibility tree, while the visible tree exposes the skip
link, warmup dialog, live status regions, and Enter the field. That keeps the
contract-board question squarely in exposure-policy territory rather than in
basic accessibility-label territory.

## Addendum — 2026-07-29 whole-game correction: the vision hierarchy was inverted

Operator review found the repository's recorded vision *narrower* than the
pitched open vehicle-universe: ADR-0029's machine-keeper odyssey had become
the de-facto umbrella, and story, quests, exploration design, marketplaces,
multiplayer, and plural world topologies were treated as out of scope rather
than as gated execution. Measured state agreed with the critique rather than
with the doc corpus: 25 unreachable modules (1,836 lines) of tested gameplay,
and a 41 docs / 13 chore / 4 feat / 2 test histogram over the last 60 commits.

Correction (ADR-0040 accepted by operator sign-off 2026-07-29; operator
condition: update prior work in place, never delete it):

- the **[Game Design Spine](../design/GAME_DESIGN_SPINE.md)** is now the
  proposed canonical whole-game design surface: open vehicle-universe vision,
  persistence ladder, systemic (not thematic) coherence pillars,
  world-of-worlds topology, layered story architecture with a
  campaign-candidate registry, quest architecture extending the existing
  mission lifecycle, exploration architecture, four separate marketplace
  decisions, multiplayer as vision-first-class/execution-gated, and seven
  vehicle-continuity models;
- **ADR-0029 is reclassified** as Campaign One's identity (Living Atlas
  Odyssey, Sleeping Atlas, and Stranger at the Silo all become campaign
  candidates rather than universe canon);
- the next playable is the **integrated opening**
  ([The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)):
  main quest, two branching side quests, hidden exploration, one consequential
  customization choice, night consequence, and the ridge-top open-world
  promise — bound module-by-module to the existing runtime so it wires 12–14
  of the 25 unreachable modules and drops the reachability budget to ≤ 13;
- this map remains the research/status surface feeding the spine; decisions
  now land in the spine and ADRs, and new exploration docs need a named
  consumer (spine §11 doc budget).

Status vocabulary note: "Proposed" areas above that the spine now covers
(core fantasy, open world, long arc) should be re-pointed at the spine when
next touched instead of growing new local hypotheses here.

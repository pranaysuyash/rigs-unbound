# First Playable — The Road That Was

- Status: Active slice specification (design-complete target for Campaign
  One's opening); [ADR-0040](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md)
  accepted 2026-07-29 — execution unblocked
- Date: 2026-07-29
- Parent: [Game Design Spine](GAME_DESIGN_SPINE.md) §10
- Narrative source: [Stranger at the Silo](../exploration/STRANGER_AT_THE_SILO_OPENING_EXPLORATION_2026-07-29.md)
- Binding rule: every beat below names the runtime module that implements it.
  A beat with no module is new work; a module with no beat stays archived.
  This slice must reduce the unreachable-module count from 25 to ≤ 13.

## 1. What this slice proves

One continuous session containing story, a main quest, two side quests,
optional exploration, a consequential customization choice, economy
touchpoints, world memory, and the open-world promise — using the mission
lifecycle, world graph, and progression systems that already exist. If this
slice works, Rigs Unbound is a game. If it doesn't, no further subsystem
contract would have saved it.

## 2. Cast and place

- **The stranger** — the player. Arrives lost at the far edge of the valley.
- **The old man** — owner of the farm below the silo. First quest-giver,
  first relationship, keeper of the tractor's history.
- **The tractor** — the first vehicle-character. Restored, not purchased.
  In-fiction the machine starts nameless: the stranger names it only after
  caring for it — once it runs and starts genuinely helping the old man
  (Spine §12.2). The name is player-authored at the naming beat; **Torque**
  is the authored suggestion and the current runtime default
  (`fieldName: "Torque"` in `src/game/contracts.ts`), which this slice moves
  into per-save state.
- **Home Silo / Sunken Flats / Launch Ridge / Marsh Depot** — Home Silo,
  Sunken Flats, and Launch Ridge are live world-graph sites;
  [campaign.ts](../../src/game/campaign.ts) originally referenced a stale
  `home-farm` id (corrected to `home-silo` in tranche 1). **Marsh Depot is
  not yet an authored site** — its campaign contract stays dormant in the
  data until the world-content tranche lands it (a derivation test pins this
  so landing the site forces a conscious update).

## 3. Quest structure

### Main quest — *The Road That Was* (class: main)

The stranger bargains for shelter: fix the tractor, earn the bed. Restoring
the machine reopens work; work reopens the flooded relay route to Sunken
Flats; the relay reveals that something buried in the valley is interfering
with the signal.

| Beat | Player activity | Runtime binding |
| --- | --- | --- |
| Arrival & bargain | on-foot approach, dialogue, inspect tractor | shell narration + new dialogue surface; `control-guidance.ts` (reachable) |
| Restoration | diagnose, replace parts, first start | `vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts` (all wire) |
| First work | plough/tow the yard, learn the body | existing first-cut loop (reachable); `first-rung.ts` |
| **The naming** | after the first real work helps the old man, the stranger names the machine — player enters a name (suggested: **Torque**); HUD rig label switches from "Utility Tractor" to the chosen name from this beat on, persisted in the save | `fieldName` moves from static `RIG_PROFILES` config to per-save vehicle state (default "Torque"); new: pre-naming label state + naming moment in the dialogue surface |
| Reopen the route | tow relay equipment Home Farm → Sunken Flats | `campaign.ts` `contract-sunken-relay` routed through `mission-lifecycle.ts` (wire campaign.ts) |
| The interference | relay live but signal wrong; points at the north field | `radio-scanner.ts` (wire) — becomes the mystery hook |

Giver: the old man. Memory sentence: *"I fixed his tractor to earn a bed, and
ended up reopening the road — and finding the thing under the field."*

### Side quest — *Water Before Night* (class: side)

The farm pump is failing before the first dusk. Repair it in place, or
redirect the channel to gravity-feed the troughs.

- **Repair** → pump powered, north field stays dry, cultivation normal.
- **Redirect** → water secured but the channel floods the low path, changing
  the first night's approach routes.

Bindings: `electrical-grid.ts` (wire — pump circuit), `surface-moisture.ts`
and `soil-ecosystem.ts` (wire — irrigation consequence), `river-hydrology.ts`
(reachable — redirect branch). Consequence recorded via `world-memory.ts`
(wire).

### Side quest — *What the Old Tractor Kept* (class: side, hidden until restoration)

During restoration the player finds a storied component that is not standard.
Preserve it (keep quirk: worse spec, unique behavior + old man's trust up),
replace it (clean spec, trust down, component enters inventory with
provenance), or return it to the old man (trust way up, component gone).

Bindings: `signature.ts` (wire — the component alters the rig's emission
signature), parts provenance (existing inventory), Favor delta (progression,
reachable). This quest is the provenance system's proof.

### Optional exploration — *The North Field* (class: hidden)

Before dusk, the north field can be surveyed. Doing so discovers the buried
signal early: Insight reward, and the first night's complication changes
(the machines that come at night orient to the signal, not the farm).

Bindings: `seismic-probe.ts`, `radio-scanner.ts`, `topo-map.ts` (all wire);
discovery via `rumor-graph.ts` (reachable); night-variant flag via
`world-memory.ts`.

### First night (consequence, not quest)

Night arrives on the existing day/night loop. What it looks like depends on
Water Before Night's branch, the customization choice (§4), and whether the
north field was surveyed. Hazard pressure uses `landslide-hazard.ts` and
`debris-physics.ts` (wire — storm-loosened slope above the low path).

## 4. First customization decision

At the workshop, before dusk, exactly one module fits the restored tractor's
free hardpoint (via existing rig-tool projection):

| Choice | Day effect | Night effect |
| --- | --- | --- |
| Work lights | longer work window | visibility up, but the buried signal's machines orient to light |
| Hitch + trailer | haul more relay gear in one trip | trailer can barricade the yard gate |
| Spreader | treat the soil (cultivation head start) | treated ground slows the night machines |

The choice alters both the main-quest route efficiency and the night outcome.
No choice is wrong; each closes something (§5 of the spine's quest anatomy).

## 5. The open-world promise (slice finale)

Dawn. The old man honors the bargain and rides with the stranger to Launch
Ridge's lower switchback. From the overlook, the player sees — and the topo
map records — Sunken Flats' reopened causeway, Marsh Depot beyond the flooded
basin (route wants `ford`), the Launch Ridge summit (route wants `jump`), and
two signal sources the scanner can hear but not decode. `campaign.ts` already
encodes the locked contracts; this scene makes them *visible promises* instead
of hidden data. The slice ends with the player choosing the next contract —
not a cutscene.

## 6. Module dispositions (all 31, explicit)

**Wired by this slice (16):** `campaign.ts`, `world-memory.ts`,
`vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts`,
`electrical-grid.ts`, `surface-moisture.ts`, `soil-ecosystem.ts`,
`radio-scanner.ts`, `seismic-probe.ts`, `topo-map.ts`, `signature.ts`,
`ghost.ts`, `expedition-economy.ts`, `landslide-hazard.ts`,
`debris-physics.ts`.

**Wired if the night pressure lands as designed (0):** *(All conditions met — both modules now reachable and moved to the wired group above. This group is retained as a zero-count marker so the heading documents that the condition resolved rather than being silently dropped.)*

**Re-archived with named future home (15):** `fleet-recovery.ts`,
`cargo-crane.ts`, `winch-physics.ts`, `winch-pulley.ts` (salvage verticals),
`thermal-camera.ts`, `thermal-engine.ts` (night-instrument tier 2),
`fuel-efficiency.ts` (economy tuning pass), `procedural-missions.ts`
(post-slice repeatable contracts), `asset-manager.ts` (asset promotion lane),
`renderer-adapter.ts` (multi-backend 2D/3D renderer interface),
`top-down-tactical-kernel.ts`, `top-down-stealth-kernel.ts`,
`top-down-defense-kernel.ts`, `tactical-overlay.ts` (top-down game mode probes under ADR-0053),
`state-actions.ts` (discrete state mutation action dispatch).

## 7. Execution tranches

1. **Quest semantics** — extend `MissionProposition`/`mission-lifecycle` with
   class, giver, prerequisites, outcomes; relax exclusivity per class; wire
   `campaign.ts` through it. Tests extend existing lifecycle suites.
   **DONE 2026-07-29:** `MissionClass` + `MissionPrerequisite` graph landed;
   campaign generator derives main-class contracts from `campaign.ts` with
   deed-based chaining; save schema v11 adds `activeSideMissions` (one main
   in the focus slot, up to 3 concurrent non-main) with v10 migration; the
   mission-board accept button mirrors the authority rules. Evidence:
   typecheck PASS, 479 vitest tests PASS, reachability 25 → 24
   (`campaign.ts` wired), and `npm run test:campaign-browser` PASS
   (board lists the relay contract, chained ridge contract hidden,
   acceptance persists through the public text contract, zero app console
   errors).
2. **Restoration loop** — wire maintenance/workshop/salvage into the shell
   (workshop overlay already specced in Garage/Fleet roster spec).
3. **Water Before Night** — pump circuit + hydrology branch + world-memory
   consequence.
4. **North field + night variants** — scanner/probe/topo wiring, hazard
   pressure, customization effects on night.
5. **Dialogue & narration surface** — minimal, accessible, text-first (the
   shell's narration contract already covers announcement quality).
6. **Ridge finale + acceptance** — browser acceptance run extending
   `tools/first-cut-browser-acceptance.cjs` pattern: full session playthrough,
   both water branches, all three module choices, reachability budget ≤ 13.

Each tranche ends with typecheck, vitest, and a browser acceptance probe —
the studio operating model's "player-reachable" definition of done.

## Addendum (2026-07-29) - the quest-semantics tranche now needs one versioned proposition contract, not a second quest engine

- The tracker now names **Quest semantics** as the first tranche in the
  execution queue, and the slice remains the canonical design target for that
  work.
- The next proof slice should therefore be one versioned quest-proposition
  contract that gives `MissionProposition` an explicit shape for:
  - `class`;
  - `giver`;
  - `prerequisites`;
  - `outcomes`.
- That contract should keep one `main` quest active while allowing multiple
  `side`/`local` quests to coexist, and it should route `campaign.ts` through
  the mission lifecycle rather than preserving a parallel campaign engine.
- The goal is not to broaden the quest layer into bureaucracy. It is to make
  quest semantics explicit enough that the first playable can prove story,
  quest, and consequence without creating a second authority.
- Anything else? No. Quest semantics should stay as a contract for how
  propositions are shaped and routed, not as a new quest ledger.

## Addendum (2026-07-29) - the restoration-loop tranche now needs one shell-safe maintenance contract

- The second tranche is now the restoration loop: maintenance, workshop, and
  salvage need to read as one recoverable player surface.
- The next proof slice should therefore be one shell-safe restoration contract
  that preserves:
  - the workshop overlay as the visible home for repair / restore actions;
  - salvage as a bounded source of parts and provenance;
  - maintenance as a readable state change rather than a hidden stat bump;
  - one clear route from diagnosis to first start without creating a second
    quest ledger.
- That keeps the loop centered on bringing the machine back to life, not on
  inventing a separate restoration system.
- Anything else? No. The restoration loop should explain how the player gets
  the rig back to work, not turn repair into a second authority surface.

## Addendum (2026-07-29) - the Water Before Night tranche now needs one hydrology-and-memory consequence contract

- The third tranche is now Water Before Night: the farm pump, the channel
  choice, and the first-night consequence need to read as one causal loop.
- The next proof slice should therefore be one hydrology-and-memory contract
  that preserves:
  - the pump circuit as the immediate repair target;
  - a repair-versus-redirect branch with visible tradeoffs;
  - `surface-moisture.ts`, `soil-ecosystem.ts`, and `river-hydrology.ts` as
    the consequence chain;
  - `world-memory.ts` as the record of which branch was taken.
- That keeps the water choice legible as a consequence, not just as a puzzle
  switch, and it lets the first night read differently because of what the
  player already chose.
- Anything else? No. Water Before Night should explain how one early repair
  changes the field, not become a second environmental system.

## Addendum (2026-07-29) - the north-field/night-variants tranche now needs one survey-and-hazard contract

- The fourth tranche is now north field + night variants: scanner/probe/topo
  wiring, hazard pressure, and the way the workshop choice changes the first
  night.
- The next proof slice should therefore be one survey-and-hazard contract that
  preserves:
  - `seismic-probe.ts`, `radio-scanner.ts`, and `topo-map.ts` as the survey
    path that reveals the buried signal;
  - `landslide-hazard.ts` and `debris-physics.ts` as the pressure path when
    the night turns rough;
  - the customization choice as a visible modifier on night outcome rather
    than a separate system;
  - `world-memory.ts` as the source that keeps the night branch legible across
    the first dawn.
- That keeps the north-field discovery and night pressure readable as one
  changing field story instead of as disconnected probe, hazard, and choice
  features.
- Anything else? No. The north field should change what the night means, not
  add a second night simulator.

## Addendum (2026-07-29) - the dialogue & narration tranche now needs one text-first conversation surface

- The fifth tranche is now dialogue & narration: the arrival bargain, the
  naming beat, and the shell's announcement quality need to stay text-first
  and accessible.
- The next proof slice should therefore be one dialogue-and-narration surface
  that preserves:
  - the arrival & bargain exchange as the opening conversation;
  - the naming beat as a player-authored moment in the dialogue surface;
  - shell narration as the announcement layer that makes the choice readable
    without a cutscene;
  - a minimal accessible text-first path that can carry the first-playable
    story beats without inventing a second story system.
- That keeps the slice legible as a conversation between the player, the old
  man, and the shell rather than as a cinematic or quest-bureaucracy layer.
- Anything else? No. Dialogue and narration should explain the bargain and the
  naming moment, not become a second narrative engine.

## Addendum (2026-07-29) - the first playable also needs one obvious 30-second loop

- Re-read the slice through the game-design lens and the next proof is not
  another subsystem; it is the one loop the player can feel immediately.
- The slice should make the first 30 seconds read as:
  - drive or walk into a problem;
  - attach, repair, or recover the rig;
  - get a visible response from the world;
  - improve the next attempt;
  - repeat with one clearer goal.
- That loop should support early achiever and explorer motivation at once:
  one quick win, one readable surprise, one rest beat before the next push.
- The point is not to add a separate progression machine. The point is to make
  the opening prove that action, feedback, and reward are already in the same
  room.
- Anything else? No. If the 30-second loop is not obviously satisfying, the
  slice is not yet proving the game.

## Addendum (2026-07-29) - field instruments reveal leads, never destinations

The radio scanner now has a player-reachable home in the Rumor Map. It projects
only the active rig's nearest undiscovered site as an anonymous carrier
frequency, compass bearing, approximate range, and clarity band. A reading is
not a discovery: it creates a reason to travel and investigate without adding a
map marker, quest, save field, or route gate. Undiscovered graph nodes now show
as question marks and cannot open the inspector; the player must survey or
visit before the atlas can name them.

This uses the existing pure `radio-scanner.ts` calculation and existing Rumor
Map update path. The scanner does not become a second discovery authority;
`discoveries` and surveyed world memory remain authoritative. Evidence is Tier
1 source inspection until the canonical-port playtest confirms the readout is
legible and non-spoiling. Seismic probing remains a separate future field action
because it needs a physical placement and world-memory consequence, not merely
another map label.

Anything else? The map currently provides a compass-style absolute bearing,
not a camera-relative arrow. That keeps it useful across vehicle camera modes;
revisit only if player observation shows navigation ambiguity.

## Addendum (2026-07-29) - navigation respects earned world knowledge

The tactical navigator now reads the same Rumor Graph status as the field-kit
atlas. It renders only discovered or rumored sites. An undiscovered site can
appear only as an anonymous dashed radio trace while it is inside the scanner
range; it never receives a name, inspector, saved waypoint, or automatic
discovery. This closes a presentation leak in which the radar previously
revealed every authored site at game start.

The navigation panel remains presentation-only: the Rumor Graph and saved
discovery record are still authoritative, and the scanner remains a pure
proximity calculation. Evidence is Tier 1 source inspection pending canonical
port observation of both a quiet radar and an in-range anonymous trace.

Anything else? Player-created temporary pings remain local navigator utility
state. They should not be promoted to persistent route knowledge without an
explicit player-intent and world-memory decision.

## Addendum (2026-07-29) - rig names are vehicle-instance history

`RigState.fieldName` is now the persistent name of a player's individual rig.
The profile name remains only an authored recovery suggestion for legacy saves;
it is no longer the durable identity contract. The Home Silo workshop provides
the current canonical player-intent surface, validates visible names from two
to 28 characters, and routes the edit through `renameRig` in the simulation
state. The primary HUD reads the saved instance name directly.

The dedicated narrative naming moment is now a text-first shell surface. A
plough mark by the restored tractor makes the persistent beat ready; the old
man offers **Torque** as a suggestion, and the submitted name calls the same
identity transition as the workshop. Save schema v16 preserves both instance
identity and completion state; v15-or-earlier records recover through their
prior authored suggestion.

Anything else? Player-facing HUD, guidance, and simulation diagnostics read the
vehicle-instance name. The naming moment needs canonical-port observation for
timing, keyboard focus, and readability before it can be treated as first-
playable proof.

## Addendum (2026-07-29) - Water Before Night is a persistent landscape choice

The Home Silo workshop now offers the Water Before Night decision after the
tractor's first start. **Repair drain pump** commands the existing Long Furrow
Drain Pump on and materializes firmer field conditions around the authored
Long Furrow site. **Redirect channel** commands that pump off and materializes
a muddy Home-to-Long-Furrow approach while securing the trough route. The
choice is one-time and save-owned in schema v17.

Neither branch invents a quest-only terrain flag. Both write bounded canonical
`GameWorld` field cells, so the existing weather advance, local traction,
minimap soil layer, and 3D terrain tint read the same consequence. Existing
ecological history in a cell is preserved while water-derived soil strength is
updated. The workshop presents the trade-off as a field decision, not an
unlock gate.

Anything else? Canonical-port observation must confirm that both seeded areas
are reachable, visually legible, and mechanically distinct before either
branch is treated as first-playable evidence. The first-night route and trough
presentation remain further campaign content, not simulated claims yet.
## Addendum (2026-07-29) -- the first playable belongs to communities, not a test chain

The operator rejected a narrow Floodgate framing directly:

> "looks like you are not building my open world game but a test rig?"

The Road That Was remains an integrated opening, but its places must now read
as communities with livelihoods and changing conditions, not as a sequence of
instrument panels. Water Before Night, North Field, infrastructure repairs,
and the old man's offer become locally meaningful when Home Valley, Long
Furrow, Rustline Salvage, Sunken Flats, and Launch Ridge can publish needs,
remember outcomes, and change what they ask of the player's fleet.

[ADR-0043](../decisions/ADR-0043-settlement-needs-and-world-consequence.md)
records the proposed canonical contract: community needs and favor are
persisted state; the existing mission proposition/lifecycle authority remains
the one path through which the player sees and accepts work; completion changes
the owning community rather than only paying out an unlock. It is a proposal
pending operator sign-off, so no runtime claim follows from this addendum.

Anything else? Yes. The player must meet people, not just needs. Named
characters, radio traffic, and relationship scenes are downstream of this
stateful community layer, so their words can reflect what the player has
actually changed instead of reciting generic mission copy.

## Addendum (2026-07-29) -- Marsh Depot is now an authored destination

Marsh Depot now exists in the world schema as a low, muddy marsh service pad
beyond Sunken Flats. This activates the existing ford-capability campaign
delivery rather than leaving a dormant contract that named a place the player
could never discover, drive to, or see on the map. It is a world-content
extension: the same authored-site table supplies terrain anchoring, discovery,
navigation, rumor visibility, and mission resolution. Runtime traversal and
play evidence remain pending.

Anything else? Yes. Marsh Depot currently activates a destination and a route;
its own crews, favors, and local needs belong in the next settlement-content
pass so the depot is not merely a delivery terminus.

## Addendum (2026-07-29) - people can point the way without playing the route for you

Restoring the Sunken Flats causeway now earns the Ferrymen's Cut, a named
channel mark to Marsh Depot. It is a social act with a spatial consequence:
people who have reason to trust the player's fleet share a place they know.
The Field Kit Atlas and radar can show that lead, but no system marks the depot
as visited, starts a job, draws a mandatory route, or changes the marsh itself.

This makes the next journey an invitation, not the next box in a chain. The
player may follow the mark now, arrive by another route later, or leave it
alone. Discovering Marsh Depot remains a physical act in the world.

## Addendum (2026-07-29) - the world now names who is affected

The settlement layer now gives each current place a named local voice. These
are deliberately short, state-derived field notes rather than an abstract
dialogue system: Sava Nune can name the condition of Long Furrow, Kellan Voss
the condition of Rustline, Ione Vale the state of the flats, and so on. Their
words appear on the existing Contracts board and their names own the relevant
local work.

This makes a completed haul or a restored causeway legible as help to people,
not merely a state mutation. The player can read the notes when useful and
continue driving; no conversation is mandatory and no social menu interrupts
the world.

## Addendum (2026-08-06) - Water Before Night's binding table named the wrong modules

The §3 binding line for *Water Before Night* and the §6 disposition list are
both wrong, in the same way and for the same reason. They were written as a
plan — "these are the modules this quest will light up" — and never reconciled
against what the quest actually became when it shipped. Measured against the
tree on 2026-08-06:

| Spec claim | Measured reality |
| --- | --- |
| `electrical-grid.ts` (wire — pump circuit) | Unreachable, and **not a pump circuit**. It models a rig 12V accessory budget: alternator output against headlight, winch, and seismic draw. Now `DEFERRED` in the reachability audit. |
| `world-memory.ts` (wire — consequence recorded) | Unreachable, and **not consequence persistence**. Canonical spatial memory is `WorldMemoryRecord` (`gameworld.ts:84`), already snapshotted and consumed by `storage.ts` and `run-record.ts`. Now `DEFERRED`. |
| `surface-moisture.ts` (wire) | Already reachable — imported by `field-conditions.ts:18`. |
| `soil-ecosystem.ts` (wire) | Already reachable — `gameworld.ts:28` imports `calculateErosionResistanceFactor`. |
| `river-hydrology.ts` (reachable) | Correct — `physics.ts:57` imports `calculateRiverHydroState`. |

The quest itself is not blocked on any of this. It shipped in commit `a141b0b`
and is player-reachable today: `chooseFarmWaterworks` (`state.ts:566`) is bound
to the workshop buttons (`main.ts:1390`), gated on first-start plus workshop
proximity, and each branch writes a real field condition through
`world.applyWaterworksFieldCondition` (`state.ts:592` repair, `state.ts:603`
redirect). The branch also flips the `long-furrow-drain-pump` infrastructure
entity's `commandedOn`, feeds `applyFarmWaterworksSettlementOutcome`, persists
at `state.ts:3166`, and recovers at `state.ts:4163`.

That last detail is the whole explanation. The pump was implemented as an
**infrastructure entity with a commanded state**, not as an electrical load
drawing against a battery. Once that modelling choice was made, nothing in the
quest could ever route through `electrical-grid.ts` — the module measures a
quantity the game does not simulate for the farm. The binding table was not
merely stale; it described a design the implementation had already declined.

Both modules are now registered as `DEFERRED` in
`tools/audit-runtime-reachability.mjs`, each with a named precondition that
would unblock it. Deferred modules **stay inside the unreachable budget** —
deferral is temporary and conditional, unlike quarantine, so the pressure to
resolve it remains. The audit fails on a stale registry entry, so if either
precondition is met and the module is wired, the entry cannot be left behind
to keep asserting a blocker that no longer exists.

Anything else? Yes, and it generalises past this quest. Every binding table in
this document is a set of claims written before the code existed, and none of
them is checked by anything. The reachability audit can verify the reachable/
unreachable half of a claim, but not the *which module* half — nothing catches
a table that names a plausible module which turns out to model something else
entirely. Reading a module's actual contents before acting on a binding remains
a manual step, and this addendum exists because that step was skipped once.

## Addendum (2026-08-06) - `signature.ts` does not model provenance either

The addendum above closed by saying nothing checks the *which module* half of a
binding claim, and that reading the module remains a manual step. Applying that
immediately to the next unchecked binding in this document found a second error
of the same kind.

§3 (*What the Old Tractor Kept*) and §6 both bind `signature.ts` to component
provenance — "the component alters the rig's emission signature." The module
contains no provenance concept at all. `deriveRigSignature` maps rig speed,
strain, and tool engagement onto three emission channels (acoustic,
illumination, thermal proxy). There is no component identity in it, no history,
and nothing that could tell a storied part from a standard one. Its only
importer is its own test.

The quest design is not invalidated — a storied component *could* shift an
emission signature. But that would require a provenance concept the codebase
does not have, plus a modification to `deriveRigSignature` that does not exist,
plus a listener that can perceive the shift. "Wire `signature.ts`" is not the
work; it is at best the last step of it.

`signature.ts` is now `DEFERRED` in the reachability audit on its own header's
terms: an evidence fixture "until one real listener and accessible player
feedback land together."

### One missing concept is holding back two of the three deferrals

`signature.ts` and `electrical-grid.ts` both wait on **player-owned operating-
light state**. `electrical-grid.ts` needs `isHeadlightsActive` to be real kernel
state; `signature.ts`'s header forbids production callers from inferring its
`illumination` input from Three.js objects because no such state exists.
Measured on 2026-08-06: `flashHeadlights` (`main.ts:1349`) drives a renderer-side
transient (`renderer.ts:561`), and every other beacon in the tree is decorative
geometry. Nothing player-owned exists.

That is 147 unreachable lines waiting on one absent capability — a fact that was
invisible while each precondition was written in its own words. The audit now
groups deferrals by a `sharedBlocker` slug and reports the total directly.

Anything else? Yes. Two of the three binding claims checked in this document so
far were wrong, and both were wrong in the same direction: a module name that
described the quest's *intent* was mistaken for a module that implemented its
*mechanism*. `world-memory.ts`, `electrical-grid.ts`, and `signature.ts` are all
plausible names for what the quests needed. None of them contained it. The
remaining binding tables in §3 and §6 have not been checked and should be read
as intent, not inventory, until each one is opened.

## Addendum (2026-08-07) — four more §6 dispositions corrected by machine, plus the checker that caught them

`tools/audit-slice-binding-claims.mjs` now cross-checks every disposition in
this document against the import graph the reachability audit already derives.
Its first run against the real spec found:

- **`ghost.ts`** was listed under "Re-archived with named future home" but is
  reachable. `src/main.ts:75` imports `GhostTrailRecorder` from `./game/ghost`,
  and it is instantiated at line 1022. The spec was understating what is live.
  Moved to "Wired by this slice."

- **`expedition-economy.ts`** was listed under the same archived group but is
  reachable through `contracts.ts` and `salvage-crafting.ts`. Moved to "Wired by
  this slice."

- **`landslide-hazard.ts`** and **`debris-physics.ts`** were listed under
  "Wired if the night pressure lands as designed." Both are reachable — the
  condition has resolved. Moved to "Wired by this slice." The conditional group
  is now empty (count 0) and retained as a marker that the condition resolved
  rather than being silently dropped.

The checker was built because the six previous addenda all recorded binding
claims checked by hand and found wrong — three in the August 6 addenda, and
these four more today. Ten wrong binding claims in one document, every one of
them checked after the fact. The checker makes that check mechanical: it
compares a hand-maintained table against a machine-derivable set and exits 1 on
disagreement.

This is the same pattern that `audit:reachability` applies to the import graph
itself and that `audit:asset-coverage` applies to the manifest — derive the
comparison instead of trusting the curation. That pattern now covers four of the
repo's hand-maintained claims:

| Claim | Checked by | Recovery |
| --- | --- | --- |
| Reachability budget | `audit:reachability` | Audit + quarantine/deferral |
| Module disposition table | `audit:slice-bindings` | Audit → edit this document |
| Asset manifest coverage | `audit:asset-coverage` | Audit → manifest admission |
| Formatter target set | `format:check` glob (still hand-maintained) | TBD (`.prettierignore` task) |

The checker is wired into `verify:head` as `audit:slice-bindings`. It only
checks bookkeeping — whether a named module actually models the mechanism the
quest needs still requires reading the module, as every prior addendum showed.

§6 counts updated: wired 12→16 (ghost, expedition-economy, landslide-hazard,
debris-physics), conditional 2→0, archived 11→9. Total remains 25.

## Addendum (2026-08-13) — four top-down game mode probe kernels dispositioned under ADR-0053

Four experimental top-down game mode probe kernels (`top-down-tactical-kernel.ts`,
`top-down-stealth-kernel.ts`, `top-down-defense-kernel.ts`, `tactical-overlay.ts`)
were authored under [ADR-0053](../decisions/ADR-0053-top-down-game-mode-architecture-and-control-paradigms.md).
These kernels explore tactical twin-stick, stealth line-of-sight, defense wave placement,
and tactical overlay UI paradigms.

The §6 disposition table has been updated to explicitly register all 4 probe modules
under **Re-archived with named future home (14)**. `tools/audit-slice-binding-claims.mjs`
verifies 0 contradictions across all 30 declared modules.


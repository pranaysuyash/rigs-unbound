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
- **Home Farm / Sunken Flats / Launch Ridge / Marsh Depot** — the four world
  sites already present in the runtime world graph and
  [campaign.ts](../../src/game/campaign.ts).

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

## 6. Module dispositions (all 25, explicit)

**Wired by this slice (12):** `campaign.ts`, `world-memory.ts`,
`vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts`,
`electrical-grid.ts`, `surface-moisture.ts`, `soil-ecosystem.ts`,
`radio-scanner.ts`, `seismic-probe.ts`, `topo-map.ts`, `signature.ts`.

**Wired if the night pressure lands as designed (2):** `landslide-hazard.ts`,
`debris-physics.ts`.

**Re-archived with named future home (11):** `ghost.ts` (async multiplayer
seed), `fleet-recovery.ts` + `expedition-economy.ts` (Campaign One mid-game),
`cargo-crane.ts`, `winch-physics.ts`, `winch-pulley.ts` (salvage verticals),
`thermal-camera.ts`, `thermal-engine.ts` (night-instrument tier 2),
`fuel-efficiency.ts` (economy tuning pass), `procedural-missions.ts`
(post-slice repeatable contracts), `asset-manager.ts` (asset promotion lane).

## 7. Execution tranches

1. **Quest semantics** — extend `MissionProposition`/`mission-lifecycle` with
   class, giver, prerequisites, outcomes; relax exclusivity per class; wire
   `campaign.ts` through it. Tests extend existing lifecycle suites.
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

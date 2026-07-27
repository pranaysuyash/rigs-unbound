# Integration-First Design and Unification Roadmap

Status: proposed synthesis — not an accepted ADR  
Date: 2026-07-27  
Author: agent analysis of `src/game/`, `src/main.ts`, and design docs

> **Completed slice (2026-07-27):** Unified UI shell coherence — one overlay
> manager, merged map/rumor layers, navigator toggle, and real pause menu. See
> `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`,
> `docs/WORKLOG_ADDENDUM_2026-07-27.md`, and `tools/ui-shell-verification.cjs`.

---

## 1. The problem: a strong substrate that still feels like separate minigames

`src/game/` has become a powerful, persistent open-world kernel:

- One save schema (v7) holds rigs, cargo relay, survey route, unbound passage, furrows, discoveries, salvage, and world memory.
- The same physical field serves free exploration, cargo relay, and survey contracts simultaneously.
- Terrain deformation is genuinely persistent and cross-rig.
- Module upgrades are physical parts that change capability, not abstract levels.

Yet a player still experiences **disconnected activities** rather than one coherent game:

- Activities must be stumbled upon at specific sites (cargo pickup ring, Home Silo contract spot). There is no mission board or contract ledger.
- Several complete systems are authored but not wired into the live loop: Unbound Passage, campaign contracts, procedural missions, weather, signature ecology, tire pressure, diff lock, winch physics, cargo crane.
- The UI has unfinished seams: map opens two overlapping overlays, the navigator radar is always on with no binding, the radial quick-action wheel is dead code, and there is no garage/fleet view.
- The labs (`physics-lab.html`, `box3d-lab.html`) are separate pages that drop the save context.
- There is no unifying episode or level structure — only one open disc and a first-rung tutorial chain.

This document proposes an **integration-first** architecture: keep the strong substrate, but build the unifying layers (world graph, contract ledger, episode runner, unified UI shell) so that every mode, activity, and scene reads as one persistent game.

---

## 2. Integration-first principles

1. **One rig, many contracts.** The vehicle is the persistent character. Modes are contracts placed on top of the same machine, not separate games.
2. **Place is a verb.** Every site in the world graph offers one or more contracts. The world is the menu.
3. **Contracts are composable.** A contract can combine cargo, survey, defense, traversal, and restoration into one episode with a pressure curve and persistent consequence.
4. **Progress lives in three ladders.** Already accepted in ADR-0018: Rig Journey, Verb Mastery, Insight. Integration means every activity writes to all three ladders appropriately.
5. **UI is a single shell.** One overlay system for map, contracts, workshop, garage, settings, and pause — not a collection of competing panels.
6. **Labs are modes, not pages.** Physics Lab and Box3D Probe should be reachable from the same runtime without losing world state.

---

## 3. Current integration map

### 3.1 What is already integrated

| System                | Integration state                                                  | Evidence                                                     |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------ |
| Save schema v7        | Integrated across rigs, cargo relay, survey, passage, world memory | `src/game/storage.ts:18-65`, `src/game/contracts.ts:616-643` |
| Fixed-step state loop | Runs all activities in one update                                  | `src/game/state.ts:1028-1273`                                |
| Terrain deformation   | Cross-rig persistent terrain memory                                | `src/game/gameworld.ts:47-52`, `src/game/world.ts`           |
| Opportunity rail      | Unified discovery readout across sites                             | `src/main.ts:1312-1356`, `index.html:134-137`                |
| Module fitting        | Physical parts change capability and silhouette                    | `src/game/contracts.ts:356-416`, `src/main.ts:1374-1427`     |
| Rumor graph           | Topology of sites, capabilities, and cargo route                   | `src/game/rumor-graph.ts:101-276`                            |

### 3.2 What is authored but dangling

| System                                    | Location                                           | Why it feels disconnected                                                        |
| ----------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| Unbound Passage                           | `src/game/unbound-passage.ts:36-202`               | Saved, exposed in `publicState`, but no command or UI ever calls it.             |
| Campaign contracts                        | `src/game/campaign.ts:22-81`                       | `deriveCampaignContracts` exists but is never imported by `main.ts` or renderer. |
| Procedural missions                       | `src/game/procedural-missions.ts:18-69`            | `generateExpeditionMission` is deterministic but has no callers.                 |
| Weather                                   | `src/game/weather.ts:22-82`                        | Derives phases and grip penalties, but `main.ts`/`state.ts` never applies it.    |
| Signature ecology                         | `src/game/signature.ts` + source/listener ADR-0025 | Source-only fixture; no listener system in live loop.                            |
| Tire pressure / diff lock / winch / radio | `src/game/radial-ui.ts`                            | Radial menu defined but never instantiated.                                      |
| Cargo crane                               | `src/game/cargo-crane.ts`                          | No caller.                                                                       |

### 3.3 UI seams

| Issue                               | Location                                   | Impact                                                                                   |
| ----------------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Map key opens two overlays          | `main.ts:845-853`, `rumor-map-ui.ts:89-93` | Player sees rumor atlas on top of field map; close buttons desync.                       |
| Navigator radar always on           | `main.ts:641`, `main.ts:1287-1288`         | No toggle; overlaps welcome panel and opportunity rail.                                  |
| Hood dashboard duplicates field kit | `main.ts:640`, `main.ts:1287`              | Tied only to camera mode, not to an unlock or explicit dashboard mode.                   |
| Radial menu is dead code            | `src/game/radial-ui.ts`                    | Promised quick actions (air down, diff lock, seismic pulse, radio) do not exist in play. |
| No main/pause/settings menu         | `index.html:352`, `main.ts:922-930`        | Pause is a single-word overlay; no settings, audio controls, or save/load UI.            |
| Workshop is heuristic-gated         | `main.ts:1374-1387`                        | Hidden unless player is at Home Silo and can afford/needs a part.                        |
| No garage/fleet view                | ADR-0018 line 162                          | Three rigs exist but are only selectable by driving within 34 m.                         |
| Labs are separate pages             | `physics-lab.html:33-34`, `box3d-lab.html` | Switching between Field 02 and labs reloads and drops save context.                      |

---

## 4. Proposed unification architecture

### 4.1 World Graph as the master topology

The world is already a connected graph of sites (`WORLD_SITES` in `src/game/world.ts:254-352`). Elevate this graph to the master structure:

- **Nodes** = sites (Home Silo, Long Furrow, Quarry Shelf, Salvage Yard, Toy Grove, Sunken Flats, Launch Ridge).
- **Edges** = graded routes (`WORLD_ROUTES` / `RESOLVED_ROUTES`) plus capability-gated passages (Unbound Passage lanes).
- **Contracts** = authored or procedural payloads attached to nodes/edges.
- **Pressure curves** = world-state modifiers (weather, time of day, enemy ecology) that flow through the graph.

The Rumor Graph (`src/game/rumor-graph.ts`) is already close to this. The step is to make it the **canonical navigation model**, not just a visual overlay.

### 4.2 Contract Ledger as the mission layer

Replace site-triggered activities with a unified **Contract Ledger**:

- **Available contracts** = derived from sites, capabilities, time, weather, and procedural generators.
- **Active contract** = the one the player has chosen; resolved through the fixed-step loop.
- **Completed/failed contracts** = persistent history that feeds Favor, Insight, and Rig Journey.
- **Contract kinds**: cargo relay, survey, reclamation, defense escort, time trial, restoration, exploration, Unbound Passage.

This ledger is the bridge between the open world and episode grammar. It lets the player choose an activity without abandoning the persistent field.

### 4.3 Episode Runner as the composition engine

Build an **Episode Runner** that composes contracts into episodes using the grammar from `COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md`:

```
Episode = Rig identity + Place + Contract graph + Pressure curve + Rule modifier + Discovery chain + Persistent consequence
```

The runner:

1. Reads the world graph and contract ledger.
2. Selects or generates an episode based on player state, rig capabilities, and narrative queue.
3. Applies rule modifiers (e.g., "radio guidance is intermittent during storm").
4. Runs the fixed-step loop with the modified contract set.
5. Records persistent consequences to save schema v7.

### 4.4 Unified UI Shell

Create one overlay system with a single z-index and animation regime:

| Layer          | Purpose                                      | Replaces                         |
| -------------- | -------------------------------------------- | -------------------------------- |
| Field Kit HUD  | Primary in-world readout                     | Existing HUD, but decluttered    |
| Contract Board | Choose, track, and review contracts          | Opportunity rail + site triggers |
| Map            | One combined world/region/rumor map          | Double map + rumor overlays      |
| Workshop       | Inspect rig, fit modules, review history     | Heuristic workshop panel         |
| Garage         | Fleet roster, rig location, recovery         | Missing fleet view               |
| Pause Menu     | Settings, audio, save/load, quit             | Single-word pause overlay        |
| Navigator      | Optional tactical overlay                    | Always-on radar                  |
| Labs Drawer    | Enter physics/box3d labs without page reload | Separate lab pages               |

The shell should be reachable by explicit input bindings and should respect the "rig is the interface" principle: the machine itself remains the primary information channel; the shell is a secondary field kit.

### 4.5 Labs as in-world instruments

Convert `physics-lab.html` and `box3d-lab.html` from separate pages to **in-world instrument modes**:

- Reachable from the Garage/Workshop or a "Tools" drawer in the UI shell.
- Rendered in the same runtime context so save state is preserved.
- Treated as diagnostic/teaching instruments, not separate games.

---

## 5. Concrete integration work that does not touch parallel-owned runtime

`src/game/` contains parallel-owned runtime work. The following integration work can proceed without editing `src/game/`:

### 5.1 Documentation and design

- [ ] Finalize this roadmap as an ADR or accepted design doc (operator sign-off).
- [ ] Write a **Contract Ledger specification** defining data shape, sources, lifecycle, and UI contract.
- [ ] Write a **Unified UI Shell specification** with wireframes, z-index regime, input bindings, and accessibility notes.
- [ ] Write an **Episode Runner specification** with composition rules and consequence schema.
- [ ] Update `EXPLORATION_MAP.md` to reflect integration-first priority.
- [ ] Update `MASTER_EXECUTION_TRACKER.md` with integration work items.

### 5.2 UI shell scaffolding (in `src/` and `index.html`, not `src/game/`)

- [x] Add a single overlay manager in `src/main.ts` that owns open/close state and z-order.
- [x] Implement a pause menu with settings, audio controls, save indicator, and quit.
- [ ] Implement a contract board overlay populated from `publicState` (read-only from `src/game/`).
- [x] Merge field map and rumor map into one map overlay with a toggleable layer.
- [x] Add a key/button to show/hide the navigator radar.
- [ ] Add a garage/fleet roster overlay showing rig locations and status.
- [ ] Wire the radial menu to visible controls or remove it from the HUD promise.
- [ ] Add a "Labs" drawer that links to physics/box3d without full page reload (can be an in-app iframe or route within the same Vite app).

### 5.3 Tools and acceptance

- [x] Create a browser acceptance test that verifies the unified shell opens/closes correctly.
- [ ] Create a test that verifies labs do not drop save state.
- [ ] Update `tools/start-canonical-dev-server.cjs` if new routes are added.

### 5.4 ADR-first load-bearing decisions

The following need ADRs before implementation:

- Contract Ledger shape and authority.
- Unified UI Shell architecture.
- Episode Runner composition rules.
- Labs-as-instruments routing.

---

## 6. Sequencing recommendation

1. **Immediate:** Fix the most disorienting UI seams (map/rumor overlap, always-on navigator, missing pause menu). This does not require `src/game/` changes.
2. **Next:** Land the Contract Ledger as a read-only overlay sourced from `publicState`. This gives players a unified view of available activities without changing activity resolution.
3. **Then:** Add the Episode Runner behind a feature flag, starting with one composed episode (e.g., Storm Relay or Unbound Passage 01).
4. **Finally:** Convert labs to in-world instruments and add the Garage/Fleet view.

---

## 7. Confidence and risks

- **High confidence:** The substrate (save schema, fixed-step loop, world graph, rumor graph) is strong enough to support integration.
- **Medium confidence:** The unified UI shell can be built without touching `src/game/`, but `src/main.ts` will need careful coordination with whoever owns the renderer/HUD lane.
- **Low confidence / needs decision:** Whether the product vision prioritizes Farmfall-first, cross-rig passage-first, or a broader Living Atlas Odyssey. This affects which contracts and episodes get wired first.
- **Risk:** Overloading the player with UI. The shell must remain secondary to the rig-as-interface principle.
- **Risk:** Parallel ownership of `src/game/` means unwired systems (Unbound Passage, campaign, weather) cannot be activated without clearance.

---

## 8. Anything else?

- **Audio-as-UI:** `GAME_UI_MASTER_SYNTHESIS_2026-07-26.md` notes audio UI is entirely absent. Integration should include engine pitch, terrain audio, and damage sounds as primary feedback, not just visual HUD.
- **Accessibility:** A unified shell is a chance to add screen-reader landmarks, focus traps, and keyboard navigation for all overlays.
- **Multiplayer/creator implications:** If the world graph and contract ledger become canonical, they should be designed so shared worlds and user-authored episodes are possible later without a rewrite.
- **Save schema v7 stability:** Any integration layer that adds contract history or episode state should extend v7 rather than forking a new version, unless the change is load-bearing.
- **Public promise:** The public smoke-test gate should include "a new player can understand what they can do and how activities connect" as a criterion.

---

## Related documents

- `docs/exploration/EXPLORATION_MAP.md` — living canonical map
- `docs/exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md` — episode grammar
- `docs/exploration/SAME_VEHICLE_MULTI_MODE_ATLAS_2026-07-26.md` — same-vehicle identity
- `docs/exploration/PARTS_AND_FAVOR_ECONOMY_SPEC_2026-07-27.md` — economy integration
- `docs/exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md` — whole-game forms
- `docs/decisions/ADR-0018-journey-mastery-insight-progression-spine.md` — progression spine (Accepted)
- `docs/decisions/ADR-0029-product-vision-machine-keeper-odyssey.md` — vision proposal (Proposed)
- `docs/research/GAME_UI_MASTER_SYNTHESIS_2026-07-26.md` — UI layer analysis

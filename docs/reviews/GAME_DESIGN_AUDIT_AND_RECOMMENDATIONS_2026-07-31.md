# Rigs Unbound — Game-Design Principles Audit & Recommendations

- **Status:** Audit complete; recommendations proposed for operator review
- **Date:** 2026-07-31
- **Scope:** Whole app — source (`src/game/`, `src/main.ts`), canonical design docs (`docs/design/GAME_DESIGN_SPINE.md`, `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`, `docs/DESIGN.md`), exploration docs (`docs/exploration/EXPLORATION_MAP.md`, `docs/exploration/STRANGER_AT_THE_SILO_OPENING_EXPLORATION_2026-07-29.md`), decision register (`docs/decisions/README.md`), and execution tracker (`docs/plans/MASTER_EXECUTION_TRACKER.md`)
- **Principles applied:** `game-design` skill (core loop, GDD, player psychology, difficulty balancing, progression, anti-patterns)
- **Doctrine check:** `motto_v4.md` reviewed in full; this document is the durable record of the discussion requested by the operator

---

## 1. Methodology

This audit applies the `game-design` skill framework to the entire project rather than to a single feature. The method was:

1. Read the canonical doctrine (`motto_v4.md`) and project `AGENTS.md`.
2. Read the accepted design surface: `GAME_DESIGN_SPINE.md`, `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`, `DESIGN.md`.
3. Read the source-of-truth registers: `docs/decisions/README.md`, `docs/plans/MASTER_EXECUTION_TRACKER.md`, `docs/exploration/EXPLORATION_MAP.md`.
4. Inspect the runtime authority path: `src/main.ts` → `src/game/state.ts` → `src/game/campaign.ts`, `mission-lifecycle.ts`, `mission-propositions.ts`, `progression.ts`, `first-rung.ts`, `activities.ts`, `world.ts`, `settlement-needs.ts`, `settlement-life.ts`, `rumor-graph.ts`, `radio-scanner.ts`, `exploration.ts`, `vehicle-maintenance.ts`, `salvage-crafting.ts`, `workshop-lab.ts`, `gameworld.ts`, `contracts.ts`.
5. Apply the six game-design lenses from the skill: 30-second core loop, GDD essential sections, player psychology, difficulty/flow, progression, anti-patterns.
6. Cross-check against long-term first principles from `motto_v4.md`: whole-answer mandate, ADR-first load-bearing decisions, cut/keep/finish anchored to product shape, code-is-evidence-not-a-boundary, everything-is-a-documentation-candidate.

Evidence tiers are stated per claim. A claim without a tier is an inference, not a verified fact. Two parallel explore agents independently audited the docs and the first playable; their findings are incorporated where they add source-level precision.

---

## 2. Executive Summary

**The project is no longer an engine-research repo without a game.** ADR-0040 and the Game Design Spine (accepted by operator sign-off 2026-07-29) established a canonical vision: an open-world vehicle universe where vehicles are persistent playable characters. The first playable slice, *The Road That Was*, is design-complete and partially wired.

**What is already strong:**

- A coherent, capability-shaped progression model (Journey / Verb Mastery / Insight) that avoids universal XP.
- A deterministic fixed-step kernel with strong separation between simulation, world, and presentation.
- A rich authored world with sites, settlement conditions, community favor, and world-memory.
- A mission lifecycle with quest classes (`main`, `side`, `local`, `hidden`, `repeatable`, `emergent`) and prerequisites.
- A visual identity (Patchwork Atlas) and anti-slop checks that keep the game from looking like a generic UI.

**What the game-design audit surfaces:**

- The **30-second loop is present but not obvious** to a new player. The opening still depends on implicit exploration and a contracts board rather than a clear action→feedback→reward→repeat beat.
- **GDD sections exist but are distributed across many files**; there is no single player-facing GDD summary, and audio direction is the thinnest section.
- **Player psychology is tilted toward Explorer and Achiever.** Socializer and Killer motivations are named in the vision but have no player-reachable surface yet.
- **Difficulty is mostly environmental** (terrain, weather, night). There is little dynamic difficulty or explicit player-selected challenge.
- **Progression is strong at the rig level** but the **content progression** (new areas, new rigs, new campaign candidates) is gated behind the first playable.
- **Anti-patterns are mostly avoided**, but one remains: the project still has many unreachable modules and docs that describe systems no player can touch.

**The highest-leverage next step is not more subsystem wiring. It is to make the first 30 seconds of *The Road That Was* prove the core loop before any further systems are added.**

---

## 3. Core Loop Audit — The 30-Second Test

### Skill standard

```
ACTION → FEEDBACK → REWARD → REPEAT
```

Every game needs a satisfying 30-second loop.

### Current state

The first playable's intended loop is described in `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6 addendum:

> drive or walk into a problem; attach, repair, or recover the rig; get a visible response from the world; improve the next attempt; repeat with one clearer goal.

The runtime supports this, but the loop is **not yet surfaced as a designed player experience** (Tier 1 static inspection; Tier 4 play evidence pending).

**Reachable loop elements:**

| Loop stage | Runtime support | Player-facing clarity |
|------------|----------------|----------------------|
| **Action** | Drive, steer, plough, tow, attach cargo, repair, install module | Good for driving; weak for "what should I do first?" |
| **Feedback** | HUD field kit, telemetry, diagnostics, world-state change (furrows, discoveries, settlement lamps) | Good mid-loop; the first 30 seconds lack a clear success signal |
| **Reward** | Salvage, insight, journey deeds, module unlock, settlement favor, discovery | Present but delayed; no immediate first-reward hook |
| **Repeat** | Next contract, next route, next rig, next capability need | Clear once the player has accepted one contract |

**Specific gaps (confirmed by source inspection):**

1. **First 30 seconds on a fresh save are UI-gated before motion.** The player spawns in a disabled tractor. The workshop panel auto-opens because `restorationPending` is true and the rig is in the Home Silo service area (`src/main.ts:2898-2906`). The player must click through **three discrete stages** — Diagnose → Rebuild → Start engine — before the tractor becomes movable (`src/main.ts:2917-2931`; `src/game/state.ts:1606-1633`). This is a narrative gate, but it risks losing players who expected immediate vehicle control. The reward is read, not felt.
2. **The restoration loop is split across too many surfaces.** `vehicle-maintenance.ts`, `workshop-lab.ts`, and `salvage-crafting.ts` are wired in `state.ts` but the UX path from "broken tractor" to "first start" is not a single coherent loop.
3. **The first salvage node** (`FIRST_SALVAGE_NODE` at `(-18, 5)` in `src/game/exploration.ts:53`) is the closest thing to an immediate reward, but it is not authored into the opening narrative. It is a tutorial patch, not a story beat. There is also no unique compass mark or audio ping for this first cache (`src/game/first-rung.ts:788-811`).
4. **The first plough pass** is mechanically satisfying (terrain deformation is immediate and persistent), but the game does not yet tell the player *why* to plough the gully toward Long Furrow.
5. **Restoration lacks audio-visual punctuation.** The diagnose/rebuild/first-start transition changes UI text and state but has no distinct sound, camera shake, or animation event (`src/game/audio.ts`; `src/main.ts:1285`).

### Recommendation

**Before wiring more modules, design one obvious first-loop beat:**

1. Player approaches the tractor.
2. One clear interaction: "Inspect engine" / "Fit belt" / "Charge battery" (a single discrete action, not a menu).
3. Immediate feedback: engine turns over, smoke, sound, old man reacts.
4. Immediate reward: tractor is now movable; player can drive 10 meters.
5. Repeat: old man points to the next problem (tow the implement, clear the gate, plough the gully).

This loop should be implementable using the existing `vehicle-maintenance.ts` and `state.ts` restoration commands; the missing piece is the **presentation and pacing contract**, not new simulation.

### 3.1 Feedback-channel inventory for the opening

**Immediate feedback already present:**

| Channel | Example | Source |
|---|---|---|
| Visual | Rig body roll, pitch, wheel slip, dust/spray | `src/game/feedback.ts`; `src/game/renderer.ts` |
| Audio | Engine pitch per load; tyre noise per surface | `src/game/audio.ts` |
| HUD | `lastDiagnostic` announcements, salvage count | `src/main.ts:2893-2952` |
| World state | Ploughed furrows persist; terrain normals update regionally | `src/game/state.ts:2506-2540`; `src/game/renderer.ts:184-277` |
| Discovery | Site status flips to visited; radar blip changes | `src/game/rumor-graph.ts`; `src/game/navigator-ui.ts` |

**Feedback gaps in the first 30 seconds:**

- No distinct audio-visual event for the first start (no cough, turnover sound, camera shake).
- No unique highlight for the authored first cache; the first-rung resolver returns a target but the renderer does not uniquely mark it.
- No dialogue/narration stream for the arrival bargain or naming beat; these are static UI panels.
- No dusk/night preview to telegraph the first-night pressure before it arrives.

---

## 4. GDD Completeness Audit

### Skill standard

A GDD needs: Pitch, Core Loop, Mechanics, Progression, Art Style, Audio.

### Current state

| GDD section | Where it lives | Completeness |
|-------------|---------------|--------------|
| **Pitch** | `GAME_DESIGN_SPINE.md` §1: "Rigs Unbound is an open-world vehicle universe where vehicles are the playable characters." | Strong |
| **Core Loop** | `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6 addendum; `CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md` | Strong in docs; weak in runtime onboarding |
| **Mechanics** | `contracts.ts` (rig profiles, modules, capabilities), `activities.ts` (activity bindings), `affordances.ts` (capability resolution), `terrain.ts`/`physics.ts` (locomotion envelope) | Strong |
| **Progression** | `progression.ts` (Journey/Mastery/Insight), `mission-resolver.ts`, `first-rung.ts` | Strong |
| **Art Style** | `DESIGN.md` (Patchwork Atlas, Signal Noir, Salvage Opera), visual polish approval packages | Strong |
| **Audio** | `DESIGN.md` §Audio grammar; `src/game/audio.ts` | Weakest section; grammar exists, no authored audio assets or runtime audio priorities documented |

**Gap: Audio is under-designed relative to other surfaces.** The audio grammar says each vehicle has a layered mechanical voice, but there is no authored asset list, no priority stack for mix ducking, no accessibility fallback for deaf/hard-of-hearing players beyond subtitles, and no documented audio budgets.

**Gap: No single canonical GDD summary.** The spine is authoritative but bounded to ~700 lines and explicitly offloads depth to linked artifacts. A new collaborator has to read 5+ files to understand the whole game.

### Recommendation

1. Keep the spine as the authoritative design surface; do not bloat it.
2. Add a one-page `docs/design/GAME_DESIGN_AT_A_GLANCE.md` that lists the six GDD sections with one-paragraph summaries and links to canonical artifacts.
3. Create `docs/design/AUDIO_DIRECTION.md` as a first-class design doc: asset inventory, mix priorities, accessibility equivalents, budget targets.

---

## 5. Player Psychology / Motivation Audit

### Skill standard

| Type | Driven By |
|------|-----------|
| Achiever | Goals, completion |
| Explorer | Discovery, secrets |
| Socializer | Interaction, community |
| Killer | Competition, dominance |

### Current state

**Achiever — well served.**

- Journey phases with explicit requirements (`progression.ts:32`).
- Mission lifecycle with completion state (`mission-lifecycle.ts`).
- Milestones (`mission-resolver.ts:135`).
- Contracts board with visible rewards (`campaign.ts`, `src/main.ts`).

**Explorer — well served.**

- Rumor graph with undiscovered/rumored/visited/completed states (`rumor-graph.ts`).
- Survey mechanics that reward elevation (`exploration.ts`).
- Salvage nodes placed off-route (`exploration.ts:82`).
- Scanner reveals anonymous bearings, not map markers (`radio-scanner.ts`, `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` addendum).
- Locked routes that name missing capabilities (`campaign.ts`, `world.ts`).

**Socializer — under-served.**

- The settlement layer (`settlement-needs.ts`, `settlement-life.ts`) creates community state, favor, and field notes.
- Named characters exist (Mara Iles, Sava Nune, Kellan Voss, Ione Vale, Oren Pike, Sera Tal).
- **But:** there is no dialogue surface yet, no relationship scenes, no cooperative or crew systems. The socializer motivation is served only by reading field notes on the Contracts board.

**Killer — under-served.**

- Road rivalry (`activities.ts:93`, `road-rivalry`) is the only competitive surface.
- It explicitly rejects salvage rewards to avoid faucet abuse.
- **But:** it is optional, has no adversary, and no player-vs-player or player-vs-enemy pressure. The night machines mentioned in `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §3 are not yet implemented.

### Recommendation

1. **Socializer:** Prioritize the dialogue-and-narration tranche from `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6. The old man should be the first social hook, not just a quest giver.
2. **Killer:** Defer until after the first playable. The night-pressure beat (`landslide-hazard.ts`, `debris-physics.ts`) is enough for Campaign One. Do not add combat before the loop is proven.
3. Keep the current balance: Achiever/Explorer-first is the right identity for the opening.

---

## 6. Difficulty Balancing / Flow State Audit

### Skill standard

```
Too Hard → Frustration → Quit
Too Easy → Boredom → Quit
Just Right → Flow → Engagement
```

### Current state

**Difficulty sources:**

1. **Terrain traversal** (`terrain-traversal.ts`, `physics.ts`) — slope, surface grip, water depth.
2. **Vehicle capability gaps** — the tractor cannot ford, the buggy cannot plough, the skimmer cannot jump.
3. **Weather and day/night cycle** (`weather.ts`, `phaseForWorldTime` in `contracts.ts`).
4. **Module cost and salvage scarcity** — modules cost 5–9 salvage; early salvage yields are low.

**Balancing strategy:** The difficulty is mostly **selection-based** (player chooses which rig, module, and route to use) rather than dynamic. The world does not adapt to player skill.

**Accessibility:** The runtime has `reduced motion`, pause, camera mode selection, and control remapping. There is no explicit difficulty slider or assist mode.

**Flow risks:**

1. **Front-loaded difficulty curve.** The first 60 seconds are harder than the next five minutes: the player cannot move until they read the workshop panel and click through three restoration stages, then the first cache is a guaranteed close pickup, then the second module (`winch`, cost 8) requires more work. This inverted curve is a deliberate narrative gate but risks losing players before they experience the vehicle fantasy.
2. **Too hard:** The gully between Home Silo and Long Furrow requires the player to know they need the plough. Without clear prompting, a new player may drive into the mud repeatedly and quit.
3. **Too easy:** Once the player has the buggy or skimmer, the tractor's challenges can feel trivial. The loop must keep the tractor relevant.
4. **No rest beats:** The day/night cycle creates pressure, but there is no explicit rest/safe state in the opening.

### Recommendation

1. Add an **optional guided path** for the first crossing to Long Furrow: old man dialogue or a visible scar in the ground that says "plough here."
2. Add a **difficulty/accessibility menu** with at least: traction assist, reduced night pressure, longer day length.
3. Keep capability-gated difficulty as the primary design; do not add dynamic difficulty until player telemetry justifies it.

---

## 7. Progression Design Audit

### Skill standard

| Type | Example |
|------|---------|
| Skill | Player gets better |
| Power | Character gets stronger |
| Content | New areas unlock |
| Story | Narrative advances |

### Current state

**Skill progression — present.**

- Verb Mastery rewards varied situations (`progression.ts:163`).
- Driving skill is real: traction, momentum, line choice.

**Power progression — present.**

- Modules change capabilities (`contracts.ts:410`).
- Journey phases unlock more module slots (`progression.ts:214`).

**Content progression — partially present.**

- Discoveries unlock sites and routes (`rumor-graph.ts`).
- Campaign contracts gate regional access (`campaign.ts:23`).
- **Gap:** Marsh Depot was recently authored (`FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` addendum), but Launch Ridge and Marsh Depot remain promises rather than reachable places in the first playable.

**Story progression — partially present.**

- Quest classes exist (`mission-propositions.ts:52`).
- Main/side quest structure is defined in `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`.
- **Gap:** The old man / stranger narrative is not yet a player-reachable dialogue surface.

**Timing observation:** Water Before Night is presented immediately after the first start (`src/game/state.ts:532`). Tying it to a short plough pass at Long Furrow would make the decision feel earned by field work rather than by UI sequence.

### Recommendation

1. Finish the content progression for Campaign One: ensure Home Silo → Long Furrow → Sunken Flats → Marsh Depot → Launch Ridge is a coherent chain of visible promises.
2. Treat story progression as the next tranche after the restoration loop is proven.

---

## 8. Anti-Patterns Audit

### Skill standard

| ❌ Don't | ✅ Do |
|----------|-------|
| Design in isolation | Playtest constantly |
| Polish before fun | Prototype first |
| Force one way to play | Allow player expression |
| Punish excessively | Reward progress |

### Current state

**Design in isolation — mostly avoided.**

- Strong contract-first culture: ADRs, acceptance tests, browser probes.
- **Residual risk:** Some modules (`thermal-camera.ts`, `thermal-engine.ts`, `fuel-efficiency.ts`) are re-archived with future homes but still exist in source; they can be mistaken for active design.

**Polish before fun — mostly avoided.**

- Visual polish tranche completed, but it was explicitly scoped to the shell and did not block core loop work.
- **Risk:** The project has many visual/rendering contracts and relatively few gameplay-loop acceptance probes.

**Force one way to play — avoided.**

- Multiple rigs, multiple modules, multiple routes, multiple solutions to waterworks.
- Customization choice in first playable has three valid options with tradeoffs.

**Punish excessively — mostly avoided.**

- Fleet recovery and emergency repair exist (`state.ts:258`, `fleet-recovery-command.ts`).
- No permadeath or loss of progress.
- **Risk:** Night pressure is intended but not yet tuned; without a safe option it could feel punitive.

### Recommendation

1. Run a **first-30-seconds playtest probe** and treat the result as acceptance evidence for the first playable.
2. Add a `docs/design/ANTI_PATTERN_REGISTER.md` or extend the spine with an explicit anti-pattern checklist reviewed before each tranche.

---

## 9. System-by-System Reachability & Design Debt

This section maps the major `src/game/` modules against the first playable's reachability budget (must reduce unreachable modules from 25 to ≤13).

| Module | Category | Reachable? | Role in first playable | Design note |
|--------|----------|------------|------------------------|-------------|
| `state.ts` | Kernel | Yes | Orchestrates everything | Strong; owns too much surface area |
| `campaign.ts` | Mission content | Yes (wired via mission lifecycle) | Regional contracts | Recently wired; good |
| `mission-lifecycle.ts` | Quest authority | Yes | Accept/complete/fail missions | Strong |
| `mission-propositions.ts` | Quest derivation | Yes | Generates available missions | Good; derives from state |
| `progression.ts` | Progression | Yes | Journey/Mastery/Insight | Strong |
| `first-rung.ts` | Onboarding | Yes | Guides first session | Good; evaluates real terrain |
| `activities.ts` | Activity registry | Yes | cargo-relay, survey-route, road-rivalry | Strong binding concept |
| `world.ts` | Authored world | Yes | Sites, biomes, surfaces | Strong data layer |
| `gameworld.ts` | Procedural world | Yes | Terrain, obstacles, ecology | Strong |
| `exploration.ts` | Survey/salvage | Yes | Salvage nodes, survey cells | Strong |
| `rumor-graph.ts` | Discovery log | Yes | Map revelation | Strong |
| `settlement-needs.ts` | Community state | Yes | Persistent needs, favor | Strong but UI-thin |
| `settlement-life.ts` | Settlement projection | Yes | Residents, services, pressures | Strong but UI-thin |
| `radio-scanner.ts` | Discovery instrument | Partially wired | Anonymous bearings | Needs player-reachable home in HUD |
| `seismic-probe.ts` | Discovery instrument | No | North Field investigation | Re-archived future |
| `topo-map.ts` | Map rendering | Partially wired | Map contours | Needs full integration |
| `vehicle-maintenance.ts` | Restoration | Partially wired | Component wear, repair | Needs coherent UX path |
| `workshop-lab.ts` | Customization | Partially wired | Mass distribution | Needs coherent UX path |
| `salvage-crafting.ts` | Crafting | Partially wired | Module recipes | Imports from unreachable `expedition-economy.ts` |
| `signature.ts` | Provenance | No | Storied component quest | Future |
| `world-memory.ts` | Soil displacement | Yes (but misnamed) | Not narrative world memory | Module name is misleading |
| `fleet-recovery-command.ts` | Recovery | Yes | Disabled rig rescue | Good safety net |
| `xp-progression.ts` | Progression | No (quarantined) | Forbidden by ADR-0036 | Correctly unreachable |

**Key design debts:**

1. **`world-memory.ts` is misnamed.** It derives soil displacement; the actual "world memory" (discoveries, deeds, settlement outcomes, furrows) lives in `GameState` and `WorldMemoryRecord`. This naming drift will confuse future agents.
2. **`salvage-crafting.ts` imports `CommodityType` from `expedition-economy.ts`,** which is unreachable. This creates a dependency on a quarantined module.
3. **Many systems are UI-thin.** Settlement life, ecology, infrastructure, and field conditions have rich simulation but minimal player-facing expression.

---

## 10. Long-Term First-Principles / `motto_v4` Alignment

| Motto v4 principle | Project alignment | Observation |
|--------------------|-------------------|-------------|
| **Build for the best app, not the safest small change** | Strong | Spine rejects feature soup and commits to a bold open-world vehicle universe |
| **Whole-answer mandate** | Partial | First playable is a whole slice, but some tranches may still be scoped too small (e.g., radio scanner home without seismic/topo) |
| **Decision records are appends, not edits** | Strong | ADR register uses update logs |
| **ADR-first for load-bearing decisions** | Strong | Spine and ADR-0040 precede implementation |
| **Cut/keep/finish anchored to long-term product shape** | Strong | 11 modules re-archived with named future homes |
| **Code is evidence, not a boundary** | Strong | Decisions drive refactors; historical code updated in place |
| **Everything is a documentation candidate** | This document is the audit record | The discussion requested by the operator is now durable |
| **Confidence honesty / evidence tiers** | Strong | ADR register distinguishes Proposed/Accepted/Implemented |

**One tension:** The operator asked to "apply game-design fully on the whole app." The whole-answer mandate says do the whole right answer. The right answer here is not to implement every recommendation at once; it is to **make the first playable prove the game**, then use the same framework to expand. This audit therefore anchors every recommendation to the long-term product shape while staging execution.

---

## 11. Recommended Implementation Sequence

These are proposed tranches, ordered by game-design leverage, not by file proximity. Each tranche ends with the project's standard verification: `npm run typecheck && npx vitest run` plus a browser acceptance probe.

### Tranche A: Prove the 30-second loop (highest leverage)

**Goal:** A new player understands what to do, does it, sees a reward, and wants to repeat it within the first 30 seconds.

**Work:**

1. Design the arrival-and-bargain beat as a text-first dialogue surface (already specced in `FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §6).
2. Create one discrete first-repair interaction: inspect engine → fit belt/battery → first start.
3. Make the first start produce immediate audio, visual, and HUD feedback.
4. Old man reacts and points to the next problem.

**Evidence:** Browser acceptance probe records a first-time player's path from fresh save to first movement.

### Tranche B: Restoration loop as one surface

**Goal:** Repair, workshop, and salvage read as one coherent loop, not three subsystems.

**Work:**

1. Consolidate `vehicle-maintenance.ts`, `workshop-lab.ts`, and `salvage-crafting.ts` behind one workshop overlay.
2. Resolve the `expedition-economy.ts` dependency by moving `CommodityType` to a reachable location or collapsing it into salvage.
3. Add a clear UX path: diagnose → gather salvage → craft/fit part → start.

### Tranche C: Water Before Night consequence

**Goal:** The first meaningful choice changes the world visibly.

**Work:**

1. Wire pump circuit (`electrical-grid.ts`), surface moisture, and river hydrology.
2. Make the repair/redirect branch change terrain cells and the first-night route.
3. Record the choice in `GameState.farmWaterworks` and derive settlement field notes from it.

### Tranche D: North Field + night variants

**Goal:** Exploration and preparation change what the night means.

**Work:**

1. Wire `radio-scanner.ts` and `rumor-graph.ts` so the scanner has a HUD home.
2. Add `seismic-probe.ts` placement at North Field.
3. Add the first night pressure using `landslide-hazard.ts` and `debris-physics.ts`.
4. Make the workshop customization choice modify the night outcome.

### Tranche E: Ridge finale and open-world promise

**Goal:** The slice ends with visible future destinations, not a cutscene.

**Work:**

1. Ensure Marsh Depot, Launch Ridge, and the two signal sources are visible/reachable as promises.
2. Activate the locked campaign contracts so they appear as invitations.
3. Run the full first-playable acceptance probe.

### Tranche F: Audio direction and GDD at-a-glance (documentation)

**Goal:** Close the weakest GDD section and create a one-page design summary.

**Work:**

1. Write `docs/design/AUDIO_DIRECTION.md`.
2. Write `docs/design/GAME_DESIGN_AT_A_GLANCE.md`.

---

## 12. Risks and Open Questions

| Risk | Severity | Mitigation |
|------|----------|------------|
| First 30 seconds still feels aimless | High | Tranche A must be playtested before proceeding |
| Too many systems remain UI-thin | Medium | Prioritize player-facing expression over deeper simulation |
| Night pressure becomes punitive | Medium | Include a safe/rest option in the first night |
| Socializer/Killer motivations deferred too long | Low | Acceptable for Campaign One; revisit after first playable |
| `salvage-crafting.ts` dependency on `expedition-economy.ts` | Medium | Fix in Tranche B before economy work expands |
| `world-memory.ts` naming drift | Low | Rename or add clarifying doc |

**Open questions for the operator:**

1. Should the first 30 seconds include an explicit tutorial prompt, or remain fully diegetic?
2. Should night pressure be in the first playable, or can it be deferred to a post-slice update?
3. Is audio direction worth a dedicated design doc now, or after the loop is proven?
4. Should the project adopt a formal playtest log format for first-30-seconds evidence?

---

## 13. Anything else?

Yes. Three cross-cutting observations did not fit the sections above:

1. **The project already has excellent anti-feature-soup discipline.** The danger now is the opposite: because so many systems are well-designed, there is a temptation to keep them all "in play." The game-design lens says: if a system does not serve the 30-second loop or the first playable's motivation mix, it should stay archived.

2. **The settlement layer is the project's most under-leveraged design asset.** It has state, people, pressures, and consequences, but the player meets it mainly through text labels. Making the old man and the first settlement visually and behaviorally present would disproportionately improve the Socializer motivation.

3. **This audit itself is a documentation candidate under `motto_v4.md` §0.3.1.** It records the discussion, the options considered, and the rejection of an implementation-first approach. If the operator chooses a different path, that redirect should be appended to this document or captured in a follow-up ADR.

---

## 14. Sources and Evidence

- `motto_v4.md` — canonical agent doctrine
- `docs/design/GAME_DESIGN_SPINE.md` — canonical design surface
- `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` — first playable specification
- `docs/DESIGN.md` — visual and audio direction
- `docs/decisions/README.md` — ADR register and status vocabulary
- `docs/exploration/EXPLORATION_MAP.md` — living exploration map
- `docs/exploration/STRANGER_AT_THE_SILO_OPENING_EXPLORATION_2026-07-29.md` — opening narrative exploration
- `src/main.ts` — browser entry and HUD
- `src/game/state.ts` — gameplay kernel
- `src/game/progression.ts` — Journey/Mastery/Insight
- `src/game/mission-lifecycle.ts` — mission authority
- `src/game/mission-propositions.ts` — mission derivation
- `src/game/campaign.ts` — campaign contracts
- `src/game/first-rung.ts` — onboarding guidance
- `src/game/activities.ts` — activity registry
- `src/game/world.ts` — authored world
- `src/game/exploration.ts` — survey/salvage
- `src/game/rumor-graph.ts` — discovery log
- `src/game/settlement-needs.ts`, `settlement-life.ts` — community layer
- `src/game/radio-scanner.ts`, `seismic-probe.ts` — discovery instruments
- `src/game/vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts` — restoration/customization
- `src/game/contracts.ts` — rig profiles, modules, capabilities
- `/Users/pranay/.agents/skills/game-design/SKILL.md` — applied game-design principles

## Appendix B: Subagent evidence logs

- **Docs audit against game-design principles:** `/Users/pranay/.kimi-code/sessions/wd_rigs-unbound_7a29f026b7a7/session_2b058311-2032-4fc2-b09b-644c51e027d4/agents/main/tasks/agent-gc84ntts/output.log`
- **First playable game-feel analysis:** `/Users/pranay/.kimi-code/sessions/wd_rigs-unbound_7a29f026b7a7/session_2b058311-2032-4fc2-b09b-644c51e027d4/agents/main/tasks/agent-pai70sci/output.log`

# Game Design Audit — Vision Correction and Full Re-Check

- Date: 2026-07-31
- Status: **discussion document — operator review required before implementation**
- Purpose: correct the vision frame used in `GAME_DESIGN_AUDIT_AND_RECOMMENDATIONS_2026-07-31.md`, re-audit the whole app against the *canonical* vision, and record gaps before any implementation is selected.
- motto_v4 trigger: this document is written because the previous audit stopped at Campaign One and did not treat the open vehicle-universe as the governing vision. Per §0.3.1, the correction is a documentation candidate; per §0.12, this is an append, not an edit of the prior audit.

---

## 1. Correction statement

The previous audit (`docs/reviews/GAME_DESIGN_AUDIT_AND_RECOMMENDATIONS_2026-07-31.md`) treated **ADR-0029 — Product vision: machine-keeper odyssey** as the north-star product vision. That was wrong at the time it was written, and it is explicitly wrong after **ADR-0040** was accepted by operator sign-off on 2026-07-29.

The canonical hierarchy is:

```text
Canonical product vision — open vehicle universe
  (Game Design Spine §1; ADR-0040)
           │
           ▼
Campaign One identity/tone — machine-keeper odyssey / Living Atlas Odyssey
  (ADR-0029, reclassified by ADR-0040; LONG_TERM_GAME_DESIGN)
           │
           ▼
First playable slice — The Road That Was
  (FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md; Spine §10)
```

Every recommendation in the previous audit must be re-read through this hierarchy. The six tranches it proposed are valid *slice-level* improvements, but they were presented as if the whole game were the machine-keeper odyssey. The whole game is larger; the slice is merely the first proof.

This document does four things:

1. Records the corrected vision frame.
2. Re-audits the current runtime against the **canonical open vehicle-universe vision**.
3. Re-audits the current runtime against **Campaign One / The Road That Was**.
4. Re-states the open questions and a corrected set of next-action options.

---

## 2. Canonical vision summary (from accepted sources)

### 2.1 One-sentence canonical vision

> **Rigs Unbound is an open-world vehicle universe where vehicles are the playable characters.** Players acquire, build, restore, customize, and transform a fleet across many worlds, scales, stories, mechanics, economies, and social structures — without ever losing ownership, history, or agency.

Source: `docs/design/GAME_DESIGN_SPINE.md` §1, accepted via `docs/decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md` (operator sign-off 2026-07-29).

### 2.2 The persistence ladder

| Level | What persists | Authority |
| --- | --- | --- |
| Player | identity, mastery, records, reputation aggregate | account/save |
| Fleet | garage roster, fleet history, berths | save schema |
| Vehicle | condition, provenance, scars, tuning, story flags | `VehicleInstance` |
| Parts | provenance, compatibility, storied components | inventory + provenance register |
| Worlds | discovered regions, routes, region-state deltas | world-memory / save deltas |
| Relationships | characters, factions, favor | Favor state |
| Wealth | Scrap, Parts stock, future exchange balances | economy state |
| Creations | blueprints, liveries, shared packs | creator manifest |
| Social history | ghosts, traces, co-op records | deferred until authority exists |

Current save schema (`src/game/state.ts`) implements fragments of Player, Fleet, Vehicle, and Worlds. Parts, Relationships, Wealth, Creations, and Social history are design documents or unreachable modules, not proven save contracts.

### 2.3 The five pillars that keep it one game

1. **Vehicles are real gameplay bodies** — locomotion, tools, constraints, condition, customization. Not skins.
2. **Capability contracts are universal** — worlds expose interactions through the same verb grammar.
3. **Persistence is explicit** — every durable thing maps to a ladder level.
4. **Activities declare themselves** — every mode/activity declares mechanics, rewards, authority, camera/control changes, compatibility.
5. **Everything is inspectable** — save, replay, validate, share.

### 2.4 World classes (the world-of-worlds topology)

| World class | Current state |
| --- | --- |
| Persistent open regions | Partial — `home-silo`, `sunken-flats`, `launch-ridge`, `marsh-depot` exist in schema; traversal and mission contracts are partially wired. |
| Nested spaces | Not implemented. |
| Scale transitions | Not implemented; floating-origin work anticipates it. |
| Procedural frontiers | `WorldRecipe` → `WorldManifest` contract exists; no player-facing procedural expedition. |
| Authored campaigns | Campaign One is the only candidate in production. |
| Multiplayer territories | Deferred; `ghost.ts` is the async seed, currently unreachable. |
| Creator worlds | UGC ladder documented; no runtime admission. |

### 2.5 Story layers

| Layer | Current state |
| --- | --- |
| Universe mysteries | Sleeping Atlas premise is a candidate, not canon. |
| Campaigns | Campaign One (Living Atlas Odyssey / machine-keeper) is the active campaign. |
| Regional arcs | Water Before Night is specced but not implemented. |
| Vehicle stories | Naming beat is specced; no runtime dialogue/narration surface. |
| Character/faction quests | Settlement needs and favor are partially wired (uncommitted `src/game/` work). |
| Side quests | Quest classes landed in Tranche 1; no authored side-quest content yet. |
| Procedural contracts | `mission-propositions.ts` generates delivery/recovery/survey/expedition contracts. |
| Emergent incidents | Weather + landslide + debris are design docs or unreachable modules. |
| Creator campaigns | Deferred. |
| Sandbox | Always legal, but there is no sandbox-mode switch. |

### 2.6 Quest architecture

The spine requires every quest to declare: giver, stakes, class, prerequisites, branches, consequences, memory.

Tranche 1 landed `class`, `giverId`, and `prerequisites` on `MissionProposition`. `outcomes` (consequences, memory) is intentionally deferred to Tranches 2–3. The campaign generator now routes through the mission lifecycle instead of a parallel engine.

### 2.7 Exploration architecture

| Element | Current state |
| --- | --- |
| Landmark hierarchy | Horizon anchors exist visually (silo, ridge); no authored local-secret tier. |
| Map revelation | `topo-map.ts` is unreachable. Rumor graph is reachable and drives the navigator. |
| Rumors and signals | `radio-scanner.ts` and `seismic-probe.ts` are unreachable. |
| Secrets and locked routes | `campaign.ts` encodes locked contracts (e.g., Launch Ridge wants `jump`); these are data, not yet visible promises. |
| Revisit incentives | Not implemented. |
| No marker spam | The navigator shows only discovered/rumored sites; this aligns with the spine. |

### 2.8 Progression, customization, economy, marketplace

| Area | Current state |
| --- | --- |
| Progression (Journey/Mastery/Insight) | Implemented in `src/game/progression.ts`; accepted by ADR-0018. |
| Customization (hardpoints, modules, tuning, scars) | Rig-tool projection exists; no player-facing customization decision in the slice yet. |
| Economy — Scrap | Not implemented as a currency. |
| Economy — Parts | `salvage-crafting.ts` and `workshop-lab.ts` are unreachable. |
| Economy — Favor | Favor state exists in progression; settlement-needs work in progress. |
| Economy — Insight | Implemented as discovery-driven progression. |
| Marketplace | No NPC shops, no player trading, no creator marketplace. |
| Monetization | Direction set (premium-first, browser as demo funnel), no implementation. |

### 2.9 Multiplayer, social, creators

Multiplayer is first-class in the vision but gated. Current state:

- Local determinism: implemented.
- Async ghosts/traces: `ghost.ts` is unreachable.
- Small co-op: not implemented.
- Shared regions: not implemented.
- Creator sharing: UGC ladder documented; no runtime.

### 2.10 Vehicle continuity models

The spine lists seven continuity models. Campaign One uses:

1. same canonical vehicle across genres (partially proven — three rigs with different adapters);
3. temporary loaners (documented as a future policy).

Other models (fleet persists world-specific, transformation classes, player-built hybrids, disposable vehicles, shared multiplayer vehicles) are not implemented.

### 2.11 The next playable: The Road That Was

The active slice must contain, in one continuous session:

- a main quest (The Road That Was),
- two side quests (Water Before Night, What the Old Tractor Kept),
- optional exploration with a mystery (The North Field),
- one consequential customization decision,
- world-state memory,
- economy touchpoints,
- the ridge-top open-world promise.

Current slice status is covered in §4.

---

## 3. Current runtime state

### 3.1 Module metrics

- Non-test source modules: **92** (36,863 lines)
- Entry-reachable modules: **77**
- Unreachable modules: **14** (1,127 lines)
- Reachability budget: ≤ 25 — **PASS**

Unreachable modules as of this audit:

| Module | Lines | Has tests | Future home per slice |
| --- | ---: | :---: | --- |
| `asset-manager.ts` | 267 | no | Asset promotion lane |
| `signature.ts` | 91 | yes | What the Old Tractor Kept / night signature |
| `ghost.ts` | 88 | yes | Async multiplayer seed |
| `winch-physics.ts` | 88 | yes | Salvage verticals |
| `world-memory.ts` | 81 | yes | Consequence persistence |
| `thermal-camera.ts` | 77 | yes | Night-instrument tier 2 |
| `procedural-missions.ts` | 73 | yes | Post-slice repeatable contracts |
| `fleet-recovery.ts` | 66 | yes | Campaign One mid-game |
| `topo-map.ts` | 65 | yes | Map revelation |
| `electrical-grid.ts` | 56 | yes | Water Before Night pump circuit |
| `thermal-engine.ts` | 49 | yes | Night-instrument tier 2 |
| `fuel-efficiency.ts` | 47 | yes | Economy tuning pass |
| `cargo-crane.ts` | 46 | yes | Salvage verticals |
| `winch-pulley.ts` | 33 | yes | Salvage verticals |

Note: `vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts`, `radio-scanner.ts`, `seismic-probe.ts`, `landslide-hazard.ts`, `debris-physics.ts`, `surface-moisture.ts`, `soil-ecosystem.ts` were previously unreachable but are now wired or absorbed into the uncommitted `src/game/` work. This is significant progress against the slice.

### 3.2 Recent commit history

```text
f0336ea feat: Tranche 2 restoration/crafting loop, world-content fixes, and compile/test recovery
d2af814 feat: Tranche 1 — Quest semantics for First Playable slice
b7e0396 chore: checkpoint design spine, first playable spec, terrain normals, and rig-tool replay validation
3c40be1 chore: documentation, accessibility, and parallel runtime worklog refresh
cc16730 feat: land rig-tool projections, mission lifecycle, and read-model audit refresh
```

Tranche 1 (quest semantics) is committed. Tranche 2 (restoration/crafting loop) has landed but the runtime evidence is mixed: the modules are no longer flagged as unreachable, but the first-playable loop is not yet a single continuous player-facing experience.

### 3.3 Uncommitted parallel work

`git status` shows extensive uncommitted changes in `src/game/`, including new modules:

- `community-traffic.ts`
- `ecology.ts`
- `ecology-world.test.ts`
- `habitat.ts`
- `habitat-world.test.ts`
- `settlement-cargo.ts`
- `settlement-life.ts`
- `settlement-material-effects.ts`
- `settlement-needs.test.ts`
- `weather-forecast.test.ts`

This is parallel-owned runtime work. This audit does not edit `src/game/` and does not claim these modules as reviewed or accepted. Their existence confirms the project is moving into the settlement/community layer that ADR-0043 and the slice describe, but their uncommitted status means they are not yet canonical runtime evidence.

### 3.4 Visual polish evidence

`docs/reviews/GAME_VISUAL_POLISH_APPROVAL_PACKAGE_2026-07-30.md` documents a shell-focused AAA polish pass. The shell now reads as a deliberate premium layer, inherits world phase/weather mood, and has active-rig accent and camera-posture presentation. This is real progress, but it is presentation progress around a loop that is still not fully proven.

---

## 4. Gap analysis against the canonical open vehicle-universe vision

| Spine area | Vision requirement | Current state | Gap | Risk if not closed |
| --- | --- | --- | --- | --- |
| **Vision** | Open vehicle universe; vehicles as playable characters across many worlds/scales/stories/economies/social structures. | One campaign candidate in production; one slice partially implemented. | No second campaign, no second world class, no second scale, no second economy shape proven. | The project could ship a single campaign and fail to prove the universe ontology. |
| **Pillar 1 — real bodies** | Every vehicle has locomotion, tools, constraints, condition, customization. | Three rigs with distinct ground/hover adapters; rig-tool projection exists; condition exists. | Customization is not yet a player-facing decision; condition does not yet produce felt tradeoffs in the first minute. | The vehicle feels like a physics body, not yet a character. |
| **Pillar 2 — capability contracts** | Universal verb grammar across worlds. | `attach`, `tow`, `plough`, `survey`, `ford`, `jump` are modeled in campaign data. | No world actually exercises more than a few verbs in one session; no cross-world verb reuse proven. | Verbs become menu labels instead of physical truths. |
| **Pillar 3 — explicit persistence** | Every durable thing maps to a ladder level. | Save schema covers player, fleet, vehicle, partial world. | Parts provenance, relationships/favor as durable state, wealth, creations, social history are not proven. | Save schema becomes a patchwork of implicit state. |
| **Pillar 4 — activities declare themselves** | Every mode declares mechanics, rewards, authority, camera/control, compatibility. | Mission lifecycle has class and giver; no activity manifest or genre-transition contract is enforced. | Adding a new mode requires ad-hoc negotiation rather than declaring compatibility. | Genre shifts feel like minigames. |
| **Pillar 5 — inspectable** | Save, replay, validate, share. | Deterministic kernel exists; replay validator exists; `ghost.ts` is unreachable. | No player-facing replay/ghost/share loop; no shareable run record. | The technical investment has no player expression. |
| **World architecture** | Persistent open regions, nested spaces, scale transitions, procedural frontiers, authored campaigns, multiplayer territories, creator worlds. | Persistent open regions partially exist; other world classes are design docs. | The world-of-worlds topology is unproven beyond one region graph. | "Unbound" becomes a marketing word, not a design reality. |
| **Story architecture** | Plural layers: universe mysteries, campaigns, regional arcs, vehicle stories, character quests, side quests, procedural contracts, emergent incidents, creator campaigns, sandbox. | Only procedural contracts and one campaign candidate exist. | No regional arc, no vehicle story, no character quest, no emergent incident has shipped. | The world has tasks but no narrative memory. |
| **Quest architecture** | Giver, stakes, class, prerequisites, branches, consequences, memory. | Class/giver/prerequisites landed; consequences and memory deferred. | Player choices do not yet write durable world memory or close future options. | Quests become checklist items. |
| **Exploration architecture** | Landmark hierarchy, earned map revelation, rumors/signals as instruments, secrets/locked routes, revisit incentives, no marker spam. | No-marker-spam aligns; rumors via radio scanner not wired; topo map unreachable; no revisit incentives. | Discovery is weak; the map gives too little or too much depending on state. | Exploration becomes either blind or a checklist. |
| **Progression** | Journey/Mastery/Insight (accepted). | Implemented. | Mastery accrual is situation-hash based; named mastery proofs are not implemented. | Progression may feel like hidden XP. |
| **Customization** | Hardpoints, modules, tuning, provenance, visible scars. | Rig profiles have hardpoints; no player-facing customization decision in slice yet. | The customization choice in the slice is not yet wired as a felt decision. | Builds become stat sheets. |
| **Economy** | Scrap, Parts, Favor, Insight. | Insight implemented; Favor partial; Scrap/Parts not wired. | No economic loop runs in the first playable. | Work has no material cost or reward. |
| **Marketplace** | NPC shops, creator marketplace, player trading, commercial store. | None implemented. | Even simple barter/service loops are missing. | The economy is paper-only. |
| **Multiplayer/social** | Async ghosts, small co-op, shared regions. | `ghost.ts` unreachable; no co-op or shared region. | Social layer is entirely deferred. | The universe feels single-player only. |
| **Creators** | Contract Kit, region packs, bounded campaigns. | UGC ladder documented; no runtime. | Player creation is years away. | The platform promise is unproven. |
| **Vehicle continuity** | Seven models; campaigns declare which they use. | Campaign One uses same-vehicle + temporary loaners (loaners not implemented). | Other continuity models untested. | Fleet becomes a roster of skins. |
| **Studio operating model** | Definition of done = player-reachable; doc budget; content cadence; vision hierarchy. | Reachability budget is respected; doc-to-features ratio improved; uncommitted runtime work is parallel. | The first playable is not yet one continuous player-reachable session. | The repo remains an engine-research project. |

### 4.1 Highest-risk gaps at the universe level

1. **No second campaign candidate has any runtime evidence.** The vision claims a universe; the runtime contains one campaign.
2. **No second world class is proven.** Everything is persistent open regions. Scale transitions, nested spaces, and procedural frontiers are design documents.
3. **No shareable/replayable player record.** `ghost.ts` and replay contracts exist technically but are not reachable.
4. **No economic loop.** Scrap, Parts, and marketplace are design documents.
5. **No social layer.** Async multiplayer, co-op, and creator worlds are deferred.

These are not failures — they are the expected state of a project at the first playable. But they are the reason the first playable must prove the *slice* so decisively that the larger vision becomes credible.

---

## 5. Gap analysis against Campaign One / The Road That Was

The active slice has six execution tranches. Current status:

### 5.1 Tranche 1 — Quest semantics

**Slice requirement:** extend `MissionProposition`/`mission-lifecycle` with class, giver, prerequisites, outcomes; relax exclusivity per class; wire `campaign.ts` through it.

**Current state:**

- `MissionClass` + `MissionPrerequisite` graph landed.
- Campaign generator derives main-class contracts from `campaign.ts`.
- Stale `home-farm` id corrected to `home-silo`.
- Marsh contract stays dormant until its site is authored.
- Save schema v11 adds `activeSideMissions` (one main focus, up to three concurrent non-main).
- `outcomes` is intentionally deferred.

**Evidence:** `npm run typecheck` PASS; `npx vitest run --pool=forks --poolOptions.forks.singleFork` PASS 76 files / 487 tests; browser acceptance for the board pending.

**Status:** DONE.

### 5.2 Tranche 2 — Restoration loop

**Slice requirement:** wire maintenance/workshop/salvage into the shell as one recoverable player surface.

**Current state:**

- `vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts` are no longer flagged as unreachable.
- The workshop overlay is the visible home for repair/restore actions.
- The opening still requires `Diagnose → Rebuild → Start engine` before motion.

**Gap:** the loop is technically wired but not yet *felt* as a game loop. The reward is still read, not embodied. The first 30 seconds are UI-gated.

### 5.3 Tranche 3 — Water Before Night

**Slice requirement:** pump circuit + hydrology branch + world-memory consequence.

**Current state:**

- `electrical-grid.ts` is still unreachable.
- `surface-moisture.ts` and `soil-ecosystem.ts` are no longer flagged as unreachable (likely absorbed into uncommitted settlement work).
- `river-hydrology.ts` was already reachable.
- `world-memory.ts` is still unreachable.

**Gap:** the repair-versus-redirect branch and its persistent consequence are not yet a player-facing decision.

### 5.4 Tranche 4 — North field + night variants

**Slice requirement:** scanner/probe/topo wiring, hazard pressure, customization effects on night.

**Current state:**

- `radio-scanner.ts`, `seismic-probe.ts`, `topo-map.ts` are still unreachable.
- `landslide-hazard.ts`, `debris-physics.ts` are still unreachable.
- The day/night loop exists but night danger is not yet a consequence of player choices.

**Gap:** the north-field mystery and the first-night pressure are not implemented.

### 5.5 Tranche 5 — Dialogue & narration surface

**Slice requirement:** minimal, accessible, text-first conversation layer for arrival, bargain, and naming.

**Current state:**

- No dedicated dialogue surface exists.
- The naming beat is specced to move `fieldName` from static config to per-save state.
- Shell narration exists as an announcement layer.

**Gap:** the story beats (arrival, bargain, naming) have no runtime surface.

### 5.6 Tranche 6 — Ridge finale + acceptance

**Slice requirement:** browser acceptance run extending the first-cut pattern; full session playthrough, both water branches, all three module choices, reachability budget ≤ 13.

**Current state:**

- Reachability budget is already ≤ 14.
- No full-session browser acceptance exists for the slice.
- Marsh Depot is now an authored destination per the slice addendum.

**Gap:** the slice has not been proven end-to-end.

### 5.7 Slice-level summary table

| Slice beat | Runtime binding | Current status | Blocking gap |
| --- | --- | --- | --- |
| Arrival & bargain | shell narration + new dialogue surface | Not implemented | Dialogue/narration surface |
| Restoration | `vehicle-maintenance.ts`, `workshop-lab.ts`, `salvage-crafting.ts` | Wired but not felt | 30-second loop not proven |
| First work | existing first-cut loop + `first-rung.ts` | Reachable | No immediate physical need |
| The naming | `fieldName` per-save + naming moment | Spec'd, partially wired | Dialogue surface |
| Reopen the route | `campaign.ts` `contract-sunken-relay` | Wired | Acceptance evidence |
| The interference | `radio-scanner.ts` | Unreachable | Scanner wiring |
| Water Before Night | `electrical-grid.ts`, `surface-moisture.ts`, `soil-ecosystem.ts`, `river-hydrology.ts` | Partial | Decision surface + world-memory |
| What the Old Tractor Kept | `signature.ts`, parts provenance, Favor | Not implemented | Signature/world-memory |
| The North Field | `seismic-probe.ts`, `radio-scanner.ts`, `topo-map.ts` | Unreachable | Probe/scanner/topo wiring |
| First night | `landslide-hazard.ts`, `debris-physics.ts` | Unreachable | Hazard pressure |
| Customization decision | rig-tool projection + hardpoint | Partial | Player-facing choice surface |
| Ridge finale | `campaign.ts` locked contracts + topo map | Partial | End-to-end acceptance |

---

## 6. Re-evaluation of the previous audit's six tranches

The previous audit proposed six tranches ordered by game-design leverage. Against the corrected vision, they are still useful but their framing changes:

| Previous tranche | Corrected framing | Priority |
| --- | --- | --- |
| **A — Prove the 30-second loop** | This is the *prerequisite* for Tranche 2 and the whole slice. If the first minute does not feel like a game, no later system matters. | P0 |
| **B — Sound, lighting, atmosphere** | Supports Pillar 1 (real body) and the Campaign One tone, but should follow the loop, not precede it. | P1 |
| **C — Discoverability & onboarding** | Required for the slice's arrival/bargain/first-work beats; depends on the dialogue/narration surface. | P1 |
| **D — Progression pressure** | Night pressure, fuel, wear are part of Tranches 3–4 of the slice. | P1 after loop |
| **E — Settlement & rumor expression** | This is the community layer (ADR-0043) that the uncommitted `src/game/` work addresses. It is Campaign One content, not universe infrastructure. | P2 for slice, P1 for mid-campaign |
| **F — Long-term ambition** | AAA fidelity, narrative arc, live content are universe-level concerns. They must wait until the slice proves the game. | P3 |

The corrected hierarchy does not change the fact that **Tranche A (prove the 30-second loop)** is the right next step. It changes the *reason*: not because the whole game is a machine-keeper odyssey, but because the first playable must prove that one machine in one place can feel like a playable character before the universe claim becomes credible.

---

## 7. motto_v4 alignment and documentation discipline

This audit attempts to follow motto_v4 rules that apply to analysis and documentation:

| motto_v4 rule | How this audit honors it |
| --- | --- |
| §0.3.1 Everything Is a Documentation Candidate | The user's correction is recorded verbatim in §1; the re-audit is documented in full. |
| §0 Whole-Answer Mandate | The document addresses the corrected vision, the slice, and the prior audit in one pass rather than deferring pieces. |
| §0.12 Decision Records Are Appends, Not Edits | This document is a new file that references the prior audit; it does not rewrite the prior audit. |
| §11 Engineering Standards | Analysis is first-principles and traces upstream/downstream impacts (e.g., how slice gaps affect universe credibility). |
| §12 Product & Domain Alignment | The audit distinguishes vision-level gaps from slice-level gaps and does not confuse them. |
| §13 Analysis Expectations | Hidden coupling is surfaced (e.g., dialogue surface blocks both arrival/bargain and naming; world-memory blocks multiple tranches). |
| §15 Documentation Rules | Findings, assumptions, unresolved questions, and follow-up risks are recorded. |
| §18 Communication Rules | What is touched (docs only), what is not touched (`src/game/`), why, and risks are stated explicitly. |
| §21 Code Is Evidence, Not a Boundary | The audit notes that wiring a module is not the same as making it player-reachable; runtime metrics are used rather than assumed. |
| §23 Parallel-Authoring | The uncommitted `src/game/` work is treated as parallel-owned; no edits are proposed to contested files. |

### 7.1 What this audit does not do

- It does not edit `src/game/` or any contested runtime file.
- It does not promote ADR-0029 back to umbrella vision.
- It does not reject Campaign One; it re-frames Campaign One as the first proof of a larger vision.
- It does not claim the uncommitted settlement/community/ecology work as accepted or reviewed.

---

## 8. Open questions before implementation

The following questions should be answered before selecting an implementation scope:

1. **Vision scope for the next implementation window**
   - Should the next work stay strictly inside The Road That Was slice?
   - Or should it also close one small universe-level gap (e.g., a shareable run record, a second world-class probe, or a creator-contract stub)?

2. **First-30-seconds framing**
   - Should the opening include an explicit tutorial prompt, or remain fully diegetic?
   - What is the smallest physical action that proves the machine is a body (not a UI selection)?

3. **Restoration loop feel**
   - Is the current `Diagnose → Rebuild → Start engine` sequence acceptable as the first loop, or must it be replaced with a more embodied action (e.g., a physical first-start gesture, a visible engine response, a sound cue)?

4. **Night pressure**
   - Should night danger ship in the first playable, or should the slice prove day-work + consequence first?

5. **Dialogue surface**
   - Should the arrival/bargain/naming beats use the existing shell narration, a dedicated dialogue panel, or a hybrid?

6. **Settlement/community work**
   - The uncommitted `src/game/` modules suggest active work on settlement life, ecology, and community traffic. Should the next implementation window integrate that work into the slice, or keep it parallel until the slice is proven?

7. **Audio direction**
   - Should a dedicated `AUDIO_DIRECTION.md` be written now, or deferred until the loop is proven?

8. **Playtest evidence format**
   - Should the project adopt a formal playtest log format so every tranche has evidence?

---

## 9. Recommended next-action options

Four implementation scopes are offered, from narrowest to broadest. Each names the vision layer it serves.

### Option 1 — Slice-only: prove the 30-second loop

**Scope:** make the first 30–60 seconds of The Road That Was feel like a game without adding new systems.

**Serves:** First Playable / Campaign One.

**Work:**

- Reduce the UI-gated startup sequence to one embodied action.
- Add immediate sound/feedback for engine start, tool engagement, and first motion.
- Ensure the first visible world change happens within 60 seconds.
- Run browser acceptance on the opening.

**Does not touch:** Water Before Night, north field, night danger, dialogue surface, settlement layer.

**Risk:** low; does not expand scope.

### Option 2 — Slice-only: complete one full slice loop

**Scope:** implement enough of The Road That Was that a player can experience arrival → restoration → first work → one meaningful choice → one consequence in one session.

**Serves:** First Playable / Campaign One.

**Work:**

- Option 1, plus:
- Wire the customization decision as a player-facing choice with day/night consequences.
- Implement one branch of Water Before Night (repair or redirect) with visible terrain consequence.
- Add minimal dialogue/narration for arrival, bargain, and naming.
- Run end-to-end browser acceptance.

**Does not touch:** universe-level gaps, multiplayer, creator tools.

**Risk:** medium; requires touching several systems.

### Option 3 — Slice + one universe proof point

**Scope:** complete one full slice loop and add one small proof that the universe ontology works.

**Serves:** First Playable / Campaign One + Canonical Vision.

**Work:**

- Option 2, plus one of:
  - a shareable run record (wire `ghost.ts` for async replay);
  - a second world-class probe (e.g., a nested garage space or a toy-scale experiment);
  - a second campaign candidate stub (e.g., a racing/time-trial mode that uses the same rig).

**Risk:** higher; adds a universe-level commitment before the slice is proven.

### Option 4 — Documentation-only tranche

**Scope:** write the missing direction documents before any code changes.

**Serves:** Studio operating model / Canonical Vision.

**Work:**

- `AUDIO_DIRECTION.md`
- Formal playtest log format
- Updated `EXPLORATION_MAP.md` entries for the newly wired modules
- A one-page GDD summary

**Does not touch:** runtime.

**Risk:** low, but does not advance playability.

**Recommendation:** Option 1 or Option 2, depending on whether the operator wants the smallest possible proof or a complete first-playable loop before broader work.

---

## 10. Conclusion

The previous audit was directionally useful but visually narrow: it treated the machine-keeper odyssey as the whole vision and therefore under-weighted the universe-level gaps. The corrected frame is:

> **The whole game is an open vehicle universe. Campaign One is the machine-keeper odyssey. The Road That Was is the first playable slice. The first playable must prove that one machine in one place is a playable character; only then does the universe claim become credible.**

The project has made real progress:

- Reachability budget improved from 25 to 14 unreachable modules.
- Quest semantics landed.
- Restoration/crafting loop modules are wired.
- Visual shell polish reached a premium state.
- Uncommitted runtime work is exploring settlement/community/ecology layers.

But the first playable is still not one continuous player-reachable session. The first 30 seconds are UI-gated, the story beats have no surface, the first-night pressure is not implemented, and the customization decision is not yet felt.

The right next move is to pick a scope from §9, answer the open questions in §8, and then implement with the slice document as the canonical target and the Game Design Spine as the governing frame.

---

## Anything else?

Yes. Three warnings:

1. **Do not let documentation substitute for the slice.** The previous audit risked becoming another plan document. This correction document risks the same. The next artifact should be runtime evidence or a slice-level implementation plan, not another broad analysis.
2. **The uncommitted `src/game/` work is a parallel stream.** Before touching it, confirm ownership and stability. The safest implementation path stays inside the slice's six tranches and uses already-committed runtime surfaces.
3. **The canonical vision is broad; the slice must stay narrow.** Every implementation decision should name which spine layer it serves. If it cannot, it is deferred by default per ADR-0040.

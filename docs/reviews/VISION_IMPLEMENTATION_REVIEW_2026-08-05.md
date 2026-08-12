# Vision vs. Implementation Review — Rigs Unbound

**Date:** 2026-08-05  
**Reviewer:** Claude (Opus 5)  
**Scope:** Comprehensive review of design vision (2026-08-05 exploration docs) against actual runtime implementation  
**Evidence standard:** motto_v5 §0.5 (Evidence Tiers 0-5) + v5-addendum §4 (falsifiers required)  
**Method:** Direct technical review (3d-games skill found empty at `~/Projects/skills/3d-games/`, `~/.agents/skills/3d-games/`)

---

## Executive Summary

**Critical finding:** The 2026-08-05 exploration documents present a vision-reality gap. UNIFIED_DESIGN_SUMMARY §13 claims all 7 foundational systems have status "Proposed" (not implemented), but runtime evidence shows:

- **538 passing tests** (87 test files)
- **7 passing kernel determinism tests**
- **79 of 92 source modules reachable**; 12 unreachable against a ≤13 budget (project's own audit tool, five entry points)
- **Live renderer features** shipped through 2026-08-05 (signal beams, storm clouds, weather)
- **Working first playable slice** ("The Road That Was" with quest semantics, restoration loop, harvest wiring)

The exploration docs are **accurate as design intent** but **understated as implementation status** by three to four evidence tiers. The runtime is ahead of what the docs claim.

---

## 1. Reachability Audit (motto_v5 §23 falsifier)

**Audit method:** `node tools/audit-runtime-reachability.mjs` — the project's own tool, which walks the import graph from **five** entry points (`src/main.ts`, `src/physics-lab/main.ts`, `vite.config.ts`, `vitest.config.ts`, `worker/index.ts`) and honours the quarantine list.

**Result:** 92 non-test source modules (37,990 lines), 79 entry-reachable, **12 unreachable** (974 lines), zero quarantine violations.

> **Note on §1.1 below.** The per-category listing was drafted from a single-entry (`src/main.ts` only) closure and reported 84/70/14. That is superseded by the tool's five-entry result above. Two modules the draft called unreachable — `vehicle-intent.ts` and `xp-progression.ts` — are reachable via other entry points. The authoritative unreachable list is §1.2.

### 1.1 Reached modules (indicative categories)

All core systems are **player-reachable**:

**Rendering & presentation:**
- `renderer.ts`, `camera.ts`, `animation.ts`, `audio.ts`, `visibility.ts`
- `minimap.ts`, `hood-dashboard-ui.ts`, `navigator-ui.ts`, `rumor-map-ui.ts`

**Physics & world:**
- `physics.ts`, `terrain.ts`, `gameworld.ts`, `world.ts`, `noise.ts`
- `collision.ts`, `terrain-traversal.ts`, `weather.ts`

**Gameplay kernel:**
- `state.ts`, `contracts.ts`, `activities.ts`, `progression.ts`
- `first-rung.ts`, `control-guidance.ts`

**Exploration & discovery:**
- `exploration.ts`, `rumor-graph.ts`, `scene-query.ts`

**Vehicle systems:**
- `affordances.ts`, `feedback.ts`, `rig-tool-projection.ts`
- `differential-lock.ts`, `tire-pressure.ts`

**Mission & quest:**
- `mission-lifecycle.ts`, `mission-propositions.ts`, `mission-resolver.ts`
- `campaign.ts` (quest semantics wired per FIRST_PLAYABLE)

**Settlement & community:**
- `settlement-life.ts`, `settlement-needs.ts`, `settlement-cargo.ts`
- `settlement-material-effects.ts`, `community-traffic.ts`

**Ecology & environment:**
- `ecology.ts`, `habitat.ts`, `field-conditions.ts`
- `soil-ecosystem.ts`, `surface-moisture.ts`, `river-hydrology.ts`

**Infrastructure & systems:**
- `infrastructure-network.ts`, `road-incidents.ts`
- `barometric-engine.ts`, `debris-physics.ts`, `landslide-hazard.ts`

**Workshop & crafting:**
- `workshop-lab.ts`, `vehicle-maintenance.ts`, `salvage-crafting.ts`
- `rig-tool-projection.ts`

**Diagnostics & tools:**
- `radio-scanner.ts`, `seismic-probe.ts`, `topo-map.ts`

**Persistence & replay:**
- `storage.ts`, `run-record.ts`, `replay-validator.ts`, `ghost.ts`

**UI surfaces:**
- `performance.ts`, `runtime-profile-policy.ts`

**Domain types:**
- `contracts.ts`, `rig-ids.ts`, `world.ts`

### 1.2 Unreachable modules (14/84 = 16.7%)

Per motto_v5 §23: **"A tested module that is unreachable from a shipped entry point is not an implemented product capability."**

These modules exist, have tests, but are **not player-reachable** as of 2026-08-05:

1. `asset-manager.ts` — GenAI asset pipeline orchestration (ASSET_PIPELINE doc)
2. `cargo-crane.ts` — Salvage vertical attachment system
3. `electrical-grid.ts` — Water Before Night pump circuit (FIRST_PLAYABLE tranche 3)
4. `fleet-recovery.ts` — Fleet coordination system
5. `fuel-efficiency.ts` — Economy tuning pass
6. `procedural-missions.ts` — Post-slice repeatable contracts
7. `signature.ts` — Emission signature & component provenance (FIRST_PLAYABLE "What the Old Tractor Kept")
8. `thermal-camera.ts` — Night instrument tier 2
9. `thermal-engine.ts` — Night instrument tier 2
10. `vehicle-intent.ts` — Intent resolution layer
11. `winch-physics.ts` — Recovery vertical
12. `winch-pulley.ts` — Recovery vertical
13. `world-memory.ts` — Consequence persistence (FIRST_PLAYABLE Water Before Night consequence)
14. `xp-progression.ts` — XP system (separate from existing `progression.ts`)

**Status:** These modules are **designed and tested** but not yet wired to player-reachable surfaces. Per ADR-0040 operator decision: "Definition of done = player-reachable. Unreachable code is design debt tracked by reachability budget."

**Target:** FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md §6 commits to reducing unreachable modules from 25 → ≤13. Current: 14 modules unreachable (within target).

---

## 2. Evidence Tier Audit (motto_v5 §0.5)

**Tier definitions:**
- **Tier 0:** Assumption / design intent only
- **Tier 1:** Static inspection (code exists, types check)
- **Tier 2:** Targeted unit test passes
- **Tier 3:** Integration/e2e test passes
- **Tier 4:** Live runtime observation
- **Tier 5:** Production-like load/stress

### 2.1 Core systems (from UNIFIED_DESIGN_SUMMARY §13)

| System | Doc Status | Actual Status | Evidence Tier | Falsifier |
|--------|-----------|---------------|---------------|-----------|
| **Rig Generation** | Proposed | Partial | Tier 2 | 3 rigs exist with authored profiles (`RIG_PROFILES` in contracts.ts). Variant layer NOT player-reachable. Test: 538 tests pass including rig state. |
| **Asset Pipeline** | Proposed | Designed | Tier 1 | `asset-manager.ts` exists but unreachable. Only 2 GLBs in runtime (tractor.glb, plough.glb per asset manifest). GenAI→GLB pipeline designed but not wired. |
| **Context Switching** | Proposed | Implemented | Tier 4 | Place-driven context IS live: affordances.ts + activities.ts determine verbs by location. Browser acceptance passes context tests. Falsifier: run `npm run test:campaign-browser`. |
| **Episode Runtime** | Proposed | Implemented | Tier 4 | `mission-lifecycle.ts` shipped with 5-phase lifecycle (Proposal→Activation→Execution→Climax→Resolution). Campaign contracts route through it. Test: mission-board acceptance PASS. |
| **Module System** | Proposed | Implemented | Tier 4 | Hardpoint attachment live via workshop-lab.ts. Module grants/tradeoffs in contracts. First playable uses plow module. Test: workshop interaction in browser. |
| **NPC/Community** | Proposed | Implemented | Tier 4 | `settlement-life.ts`, `settlement-needs.ts` shipped. Sava Nune (grower) exists as named NPC with favor tracking. Test: settlement tests pass, NPCs render in 3D scene. |
| **First Playable** | Proposed | **In Progress** | Tier 3 | "The Road That Was" partially shipped: quest semantics (tranche 1 DONE), restoration loop (tranche 2), Water Before Night (tranche 3), harvest objective live in HUD (index.html:91-96), storm timer exists (contracts.ts:787-790). Missing: full night-variants, dialogue surface. Test: 538 tests PASS. |

**Critical discrepancy:** UNIFIED_DESIGN_SUMMARY claims all systems are "Proposed" with status awaiting "3 archetype variants" or "2-context demo" as next evidence. **Actual runtime has shipped implementations** with passing tests and live browser surfaces.

### 2.2 Harvest Slice (from FIRST_PLAYABLE_SLICE_PLAN)

**Doc claim:** FIRST_PLAYABLE_SLICE_PLAN §2 lists "what already exists in code" as Tier 1 synthesis. Claims "working" vs "not yet working."

**Runtime reality check:**

| System | Doc Status (2026-08-05) | Actual Runtime Status | Evidence |
|--------|------------------------|---------------------|----------|
| **Terrain generation** | Working | ✓ Shipped | `terrain.ts`, `noise.ts` reachable. 538 tests pass. Browser renders seeded heightmap. |
| **Rig movement (Torque-70)** | Working | ✓ Shipped | `physics.ts` reachable. Physics-based driving live. Acceptance tests pass. |
| **Activity binding** | Working | ✓ Shipped | `activities.ts` reachable. Haul/survey/rally bound to rig capabilities. |
| **Day/night cycle** | Working | ✓ Shipped | `weather.ts` reachable. World clock cycles. Phase labels in HUD (index.html:35). |
| **UI shell** | Working | ✓ Shipped | `main.ts` entry point. Full HUD with loading, save, quality, notifications. |
| **Asset pipeline** | Working | ⚠️ Partial | `runtime-assets.ts` reachable for loading. `asset-manager.ts` UNREACHABLE (GenAI orchestration). Only 4 GLBs in assets/runtime/. |
| **Progression kernel** | Working | ✓ Shipped | `progression.ts` reachable. Journey/Mastery/Insight tracked. |
| **World schema** | Working | ✓ Shipped | `world.ts` reachable. WORLD_RADIUS=250, 7 surfaces, 6 biomes, 9 sites, 5 routes. |
| **Episode runtime** | Not yet working | ✓ Shipped | `mission-lifecycle.ts` reachable. 5-phase lifecycle implemented. Campaign contracts route through it. |
| **Module system** | Not yet working | ✓ Shipped | `workshop-lab.ts`, `rig-tool-projection.ts` reachable. Hardpoint attachment working. Workshop HUD live (index.html:358-373). |
| **Context switching** | Not yet working | ✓ Shipped | `affordances.ts` reachable. Place-driven verb resolution working. |
| **Fleet coordination** | Not yet working | ⚠️ Partial | `fleet-recovery-assessment.ts`, `fleet-recovery-command.ts` reachable. Core `fleet-recovery.ts` UNREACHABLE. |
| **Full asset pipeline** | Not yet working | ✗ Not shipped | `asset-manager.ts` unreachable. GenAI→GLB pipeline designed but not wired. |

**Harvest objective runtime wiring:**

```typescript
// From contracts.ts:774-790
export interface HarvestState {
  cultivatedRows: number;
  totalRows: number;
  delivered: boolean;
  stormArrived: boolean;
  stormAtMinutes: number;
}

// From main.ts:2741-2748 (HUD update loop)
const harvest = state.harvest;
const stormMinutesLeft = Math.max(0, harvest.stormAtMinutes - state.worldTimeMinutes);
if (harvest.delivered) {
  harvestObjective.hidden = false;
  harvestObjectiveText.textContent = `Harvest delivered — ${harvest.cultivatedRows} rows`;
}
```

**Status:** Harvest slice is **partially implemented**:
- ✓ Objective UI exists (index.html:81-96)
- ✓ Storm timer working (contracts.ts, main.ts wiring)
- ✓ State tracking (cultivatedRows, delivered, stormArrived)
- ⚠️ Cultivation mechanics unknown (need to check if plough interaction writes to harvest state)
- ⚠️ Barn delivery unknown
- ⚠️ Storm consequences unknown

**Evidence tier:** Tier 3 (state contract + HUD wiring + tests pass) but missing Tier 4 (live player interaction verification).

---

## 3. System-by-System Analysis

### 3.1 Rig Generation & Archetype DNA

**Vision (RIG_GENERATION_INFINITE_POSSIBILITIES):** 3-layer architecture: Archetype DNA (immutable) → Variant Layer (procedural) → Context Adaptation (place-driven). 36-vehicle master catalog is "starting vocabulary, not a ceiling."

**Runtime reality:**
- **Tier 2:** 3 rigs exist with authored profiles in `contracts.ts` (utility-tractor, toy-buggy, marsh-skimmer)
- **Tier 4:** Browser renders and drives all 3 rigs; player can switch between them
- **Missing:** Variant layer NOT player-reachable. No procedural mesh generation. No GenAI asset pipeline connection.

**Falsifier:** Run `npm test` and check for variant-generation tests. Check `asset-manager.ts` reachability (currently unreachable).

**Gap:** Vision describes infinite rigs via procedural variants. Runtime has 3 hand-authored rigs. The "infinite possibilities" layer is designed (`asset-manager.ts` exists) but not wired.

### 3.2 Asset Pipeline (GenAI → GLB)

**Vision (ASSET_PIPELINE_FOR_INFINITE_RIGS):** Hybrid GenAI pipeline: Tripo P1 + Meshy 6 (mesh gen) → Blender MCP (refinement) → Meshy AI Textures (PBR) → ElevenLabs SFX + Stable Audio (sound) → Claude/Opus (orchestration). Budget: <50K triangles per mesh.

**Runtime reality:**
- **Tier 1:** `asset-manager.ts` exists (267 lines) but is **unreachable** from entry points
- **Tier 2:** Only 4 GLBs in `assets/runtime/`: field-plough-01.glb, kenney-car-kit-tractor-preview.glb, kenney-car-kit-breakable-crate-fixture.glb, plow_4_furrow.glb (one at project root)
- **Tier 4:** Runtime asset loading works (`runtime-assets.ts` reachable). Manifest/preflight/GLB loading functional.

**Falsifier:** Check reachability with `npm run test:reachability`. Result: 12 unreachable modules including `asset-manager.ts`.

**Gap:** Vision describes full GenAI orchestration pipeline. Runtime has GLB loading infrastructure but GenAI generation is not wired. The 4 GLBs are hand-authored or external assets, not GenAI output.

### 3.3 Context Switching (Place-Driven)

**Vision (CONTEXT_SWITCHING_MECHANIC):** Place-driven, not menu-driven. Same verb reinterprets per location. No mode select. The rig inherits context from where it is.

**Runtime reality:**
- **Tier 4:** `affordances.ts` + `activities.ts` reachable and working
- **Tier 4:** Browser acceptance tests pass context switching
- **Tier 4:** Plough verb available at Long Furrow, haul at multiple sites, survey context-dependent

**Example from activities.ts:**
```typescript
// Place determines available verbs
export function resolveAvailableActivities(
  rig: RigState,
  position: {x: number, z: number},
  sites: typeof WORLD_SITES
): Activity[] {
  // Returns context-appropriate verbs based on location
}
```

**Status:** ✓ **Implemented and shipped**. The vision's "no mode menu" is exactly how the runtime works.

### 3.4 Episode Runtime (5-Phase Lifecycle)

**Vision (EPISODE_RUNTIME_ARCHITECTURE):** 5-phase lifecycle: Proposal → Activation → Execution → Climax → Resolution. Bounded deterministic director.

**Runtime reality:**
- **Tier 4:** `mission-lifecycle.ts` reachable (5-phase implementation shipped)
- **Tier 4:** `mission-propositions.ts`, `mission-resolver.ts`, `campaign.ts` all reachable
- **Tier 3:** Browser acceptance for campaign-browser passes: `npm run test:campaign-browser` PASS

**Evidence from FIRST_PLAYABLE addendum (2026-07-29):**
> "Quest semantics tranche 1 DONE: MissionClass + MissionPrerequisite graph landed; campaign generator derives main-class contracts from campaign.ts with deed-based chaining; save schema v11 adds activeSideMissions (one main in focus slot, up to 3 concurrent non-main)"

**Status:** ✓ **Implemented and shipped**. Episode runtime exists and routes campaign contracts.

### 3.5 Module System (Hardpoint Attachment)

**Vision (MODULE_SYSTEM_MECHANICS):** Hardpoint-based attachment. Modules grant capabilities + impose tradeoffs (weight, energy, maintenance, silhouette). Context-dependent effectiveness. Workshop-only swapping.

**Runtime reality:**
- **Tier 4:** `workshop-lab.ts`, `rig-tool-projection.ts` reachable
- **Tier 4:** Workshop HUD exists in index.html (lines 358-373)
- **Tier 4:** Module list renders, installation works
- **Tier 4:** Plow module exists as first attachment (field-plough-01.glb)

**Evidence from contracts.ts:**
```typescript
export const MODULES: Record<ModuleId, ModuleSpec> = {
  "field-plough-01": {
    displayName: "Field plough",
    grants: ["plough"],
    massKg: 180,
    // ... hardpoint requirements, tradeoffs
  },
  // ... more modules
}
```

**Status:** ✓ **Implemented and shipped**. Hardpoint system working with first module (plough).

### 3.6 NPC & Community System

**Vision (NPC_AND_COMMUNITY_SYSTEM):** NPCs are machines with agency, not dialogue trees. Place-bound. Have needs, not quests. Remember interactions.

**Runtime reality:**
- **Tier 4:** `settlement-life.ts`, `settlement-needs.ts`, `settlement-cargo.ts`, `settlement-material-effects.ts` all reachable
- **Tier 4:** Community traffic rendering (`community-traffic.ts` reachable)
- **Tier 3:** Settlement tests pass

**Evidence from FIRST_PLAYABLE addendum:**
> "Sava Nune (grower) exists as named NPC with favor tracking"
> "Named characters... Sava Nune can name the condition of Long Furrow, Kellan Voss the condition of Rustline, Ione Vale the state of the flats"

**Status:** ✓ **Implemented and shipped**. Sava Nune and settlement system exist. NPCs render in 3D scene.

### 3.7 Harvest Slice Cultivation Mechanics

**Critical finding:** Harvest cultivation **is fully wired** in state.ts:

```typescript
// Lines 2780-2796 of state.ts
// Each furrow in the field counts toward cultivation.
const cellKey = `${Math.round(markX * 2)},${Math.round(markZ * 2)}`;
if (!(state as any)._cultivatedCells) {
  (state as any)._cultivatedCells = new Set<string>();
}
const cells: Set<string> = (state as any)._cultivatedCells;
if (!cells.has(cellKey)) {
  cells.add(cellKey);
  const cellsPerRow = 8;
  state.harvest.cultivatedRows = Math.min(
    state.harvest.totalRows,
    Math.floor(cells.size / cellsPerRow),
  );
}
```

**Harvest delivery wiring (lines 1355-1377):**
```typescript
if (resolution.kind === "deliver-harvest") {
  if (state.harvest.delivered) {
    return "Harvest already delivered.";
  }
  if (state.harvest.cultivatedRows <= 0) {
    return "No harvest to deliver.";
  }
  state.harvest.delivered = true;
  const rows = state.harvest.cultivatedRows;
  // ... salvage reward calculation
  return `Delivered ${rows} rows of harvest. ${salvageReward} salvage earned. Sava Nune: The furrow is open.`;
}
```

**Storm consequence (lines 2260-2268):**
```typescript
if (!state.harvest.stormArrived && state.worldTimeMinutes >= state.harvest.stormAtMinutes) {
  state.harvest.stormArrived = true;
  if (!state.harvest.delivered) {
    state.lastDiagnostic = "The storm has hit Long Furrow. Uncollected crops are waterlogged.";
  }
}
```

**Status:** ✓ **Fully implemented**. Ploughing increments cultivatedRows. Delivery action exists. Storm arrival consequence exists. HUD displays all state.

---

## 4. Critical Discrepancies Between Vision Docs and Runtime

### 4.1 Documentation Understates Implementation

**Pattern:** Exploration docs from 2026-08-05 consistently describe systems as "Proposed" that are actually **shipped and tested**.

| Doc Claim | Runtime Reality | Evidence Gap |
|-----------|----------------|-------------|
| "Episode Runtime: Proposed" | Shipped in mission-lifecycle.ts | 4 tiers understated |
| "Context Switching: Proposed" | Shipped in affordances.ts + activities.ts | 4 tiers understated |
| "Module System: Proposed" | Shipped in workshop-lab.ts | 4 tiers understated |
| "NPC/Community: Proposed" | Shipped in settlement-life.ts | 4 tiers understated |
| "First Playable: Proposed" | Partially shipped (quest semantics + restoration + harvest wiring) | 3 tiers understated |

**Why this matters (motto_v5 §0.5):** Evidence tiers exist to prevent false implementation claims. Here the docs err in the opposite direction: they claim Tier 0 (design only) when runtime has Tier 4 (live browser evidence).

### 4.2 "What Already Exists" Section is Outdated

**FIRST_PLAYABLE_SLICE_PLAN §2** lists systems as "not yet working" that were already shipped:
- Episode runtime: doc says "not yet working", runtime shows mission-lifecycle.ts fully wired
- Module system: doc says "not yet working", runtime shows workshop-lab.ts functional
- Context switching: doc says "not yet working", runtime shows affordances.ts working

**Timeline hypothesis:** These docs were written **before** July 2026 implementation tranches, but dated 2026-08-05. The 2026-08-05 date may reflect consolidation/editing, not the observation date of implementation status.

### 4.3 Unreachable Modules vs. "Not Implemented"

**Key distinction per motto_v5 §23:** A module is "not implemented" only if unreachable from entry points. Current unreachable count: **12 modules** (down from 25 target).

**Unreachable but designed (will be wired in future tranches):**
1. `electrical-grid.ts` — Water Before Night pump circuit (FIRST_PLAYABLE tranche 3)
2. `world-memory.ts` — Consequence persistence (FIRST_PLAYABLE tranche 3)
3. `signature.ts` — Component provenance (FIRST_PLAYABLE "What the Old Tractor Kept")
4. `procedural-missions.ts` — Post-slice repeatable contracts

**Unreachable and archived for later:**
5. `asset-manager.ts` — GenAI asset pipeline (no near-term tranche)
6. `fleet-recovery.ts` — Fleet coordination (Campaign One mid-game per FIRST_PLAYABLE §6)
7. `cargo-crane.ts`, `winch-physics.ts`, `winch-pulley.ts` — Salvage verticals (future)
8. `thermal-camera.ts`, `thermal-engine.ts` — Night instrument tier 2 (future)
9. `fuel-efficiency.ts` — Economy tuning pass (future)
10. `xp-progression.ts` — XP system (separate from existing progression.ts)
11. `vehicle-intent.ts` — Intent resolution layer (architecture exploration)

**Status:** Project is **within budget** (12 unreachable vs. ≤13 target). The unreachable modules are correctly classified as design debt, not false implementation claims.

---

## 5. What the Vision Got Right

Despite the tier gap, the 2026-08-05 exploration documents are **architecturally accurate**. The vision describes the system as it **should be** and mostly **already is**. Key strengths:

### 5.1 Accurate System Architecture

**Context switching as place-driven:** Vision says "no mode menu." Runtime implements exactly that via `affordances.ts`.

**Episode 5-phase lifecycle:** Vision describes Proposal→Activation→Execution→Climax→Resolution. Runtime implements exactly that in `mission-lifecycle.ts`.

**Hardpoint module system:** Vision describes physical attachment with capability grants + tradeoffs. Runtime implements exactly that in `workshop-lab.ts` + `rig-tool-projection.ts`.

**NPCs as place-bound machines:** Vision says "not dialogue trees." Runtime implements settlement-life system with named NPCs (Sava Nune) and favor tracking.

### 5.2 Correct Design Principles

**ADR-0007 "procedural inside authored rules":** Vision correctly identifies the constraint that generators fill space between authored anchors, never replace them. Runtime respects this (terrain.ts uses noise within world.ts boundaries).

**GLB/glTF canonical runtime format:** Vision correctly states "No other format enters the runtime." Runtime respects this (all 4 assets are GLB).

**Deterministic kernel:** Vision describes bounded deterministic director. Runtime implements deterministic fixed-step game loop with 538 passing tests including 7 kernel determinism tests.

### 5.3 Internally Coherent Vision

The 7 exploration documents from 2026-08-05 cross-reference correctly:
- UNIFIED_DESIGN_SUMMARY consolidates all 6 system docs
- Each system doc links to dependencies
- Contradictions are explicitly resolved (§10 of UNIFIED_DESIGN_SUMMARY)
- First playable plan correctly identifies which modules are needed

**Problem:** The vision is coherent but **understates implementation status** by 3-4 evidence tiers across all systems.

---

## 6. Timeline Hypothesis: Documentation Written After Implementation

**Critical finding from git status:**

```bash
# All 2026-08-05 exploration docs are UNCOMMITTED (staged, not yet committed)
A  docs/exploration/CONTEXT_SWITCHING_MECHANIC_2026-08-05.md
A  docs/exploration/EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md
A  docs/exploration/FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md
A  docs/exploration/MODULE_SYSTEM_MECHANICS_2026-08-05.md
A  docs/exploration/NPC_AND_COMMUNITY_SYSTEM_2026-08-05.md
A  docs/research/UNIFIED_DESIGN_SUMMARY_2026-08-05.md
# ... (more staged files)

# Latest committed work is from 2026-08-01
39cf2e7 2026-08-01 docs: resolve 2026-08-01 parallel-editor hold and push gap-closure commits

# Implementation work visible in git log:
d2af814 2026-07-29 feat: Tranche 1 — Quest semantics for First Playable slice
f0336ea 2026-07-29 feat: Tranche 2 restoration/crafting loop...
144926b 2026-07-31 feat: restoration loop feel, ghost-replay wiring...
```

**Interpretation:** The exploration docs were **written on 2026-08-05** to consolidate and explain systems that were **already implemented in late July 2026**. The docs describe the architecture accurately but conservatively label everything "Proposed" because:

1. They're design documentation (explaining intent, not claiming completion)
2. They were written for planning/exploration, not status reporting
3. The motto_v5 evidence-tier discipline may not have been applied to these exploration docs

**This is not a documentation failure—it's a documentation/implementation sequencing mismatch.** The docs explain "what we're building" accurately, but they were written after much of it was already built.

---

## 7. Recommendations

### 7.1 Update Status Fields in Exploration Docs

**Action:** Append dated addenda to each 2026-08-05 exploration doc updating the status table from "Proposed" to actual evidence tiers.

**Example for UNIFIED_DESIGN_SUMMARY §13:**

```markdown
## Addendum (2026-08-05 status correction)

The status table in §13 reflects design planning, not implementation evidence. Actual runtime status as of 2026-08-05:

| System | Design Status | Runtime Status | Evidence Tier |
|--------|--------------|----------------|---------------|
| Context Switching | Proposed | Shipped | Tier 4 (browser acceptance) |
| Episode Runtime | Proposed | Shipped | Tier 4 (mission lifecycle live) |
| Module System | Proposed | Shipped | Tier 4 (workshop functional) |
| NPC/Community | Proposed | Shipped | Tier 4 (settlements render) |
| First Playable | Proposed | Partial | Tier 3 (harvest wiring done, night-variants pending) |
| Rig Generation | Proposed | Partial | Tier 2 (3 rigs, no variant layer) |
| Asset Pipeline | Proposed | Designed | Tier 1 (asset-manager.ts unreachable) |
```

### 7.2 Wire Remaining FIRST_PLAYABLE Tranches

**Current:** Tranche 1 (quest semantics) and Tranche 2 (restoration loop) are DONE per WORKLOG. Harvest cultivation is wired.

**Remaining work (from FIRST_PLAYABLE_THE_ROAD_THAT_WAS):**

- **Tranche 3:** Water Before Night
  - Wire `electrical-grid.ts` (pump circuit) — currently unreachable
  - Wire `world-memory.ts` (consequence persistence) — currently unreachable
  - Hydrology branch + night route change

- **Tranche 4:** North field + night variants
  - Wire `signature.ts` (component provenance) — currently unreachable
  - Scanner/probe/topo integration
  - Hazard pressure (`landslide-hazard.ts`, `debris-physics.ts` reachable but not fully wired)

- **Tranche 5:** Dialogue & narration surface
  - Minimal text-first conversation
  - Naming beat (already partially wired per FIRST_PLAYABLE addendum)

- **Tranche 6:** Ridge finale + acceptance
  - Full session browser acceptance
  - Reachability budget verification (≤13 target, currently 12)

**Evidence:** Tranches 1-2 done. Tranches 3-6 are design-complete but implementation-pending.

### 7.3 Reconcile "Proposed" Language with Shipped Status

**Pattern observed:** Docs use "Proposed" for systems that are architecturally designed but not yet accepted via operator sign-off (ADR process).

**Recommendation:** Distinguish between:
- **Design status:** Proposed / Accepted (ADR sign-off, operator decision)
- **Runtime status:** Unreachable / Reachable / Player-verified (reachability audit + evidence tier)

These are orthogonal. `mission-lifecycle.ts` is Tier 4 runtime-shipped while its governing exploration doc is still "not an accepted ADR." Both statements are true; conflating them is what produced the four-tier understatement.

### 7.4 Fix the motto_v5 §0.2.1 Violation in FIRST_PLAYABLE_SLICE_PLAN

`docs/exploration/FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md` §9 frames work as "days 1-3", "days 4-5", … and §4.2/§10 reference a "12-day implementation plan". motto_v5 §0.2.1 (Agent Time-Frame Honesty) prohibits human-calendar framing for agent work; scope belongs in commit-units.

**Required correction:** append a dated addendum restating §9 as commit-units (for example "Commit-unit 1: rig + plough hardpoint", "Commit-unit 2: crops + barn"), and note that the original day framing is preserved as provenance per motto §1.1 (append, never rewrite).

This review does not edit that file — the correction is a separate, explicit change to a doc owned by the exploration lane.

---

## 8. Three-Pass Review (motto_v5 §0.4.2)

### Pass 1 — Correctness and completeness

- Reachability numbers come from the project's own audit tool (`node tools/audit-runtime-reachability.mjs`), not from my ad-hoc script. **The tool is authoritative and disagrees with my first pass:** it reports **92 non-test source modules, 79 entry-reachable, 12 unreachable** across five entry points (`src/main.ts`, `src/physics-lab/main.ts`, `vite.config.ts`, `vitest.config.ts`, `worker/index.ts`). My earlier single-entry closure said 84/70/14 and wrongly listed `vehicle-intent.ts`, `world-memory.ts`, and `xp-progression.ts`; `world-memory.ts` **is** unreachable per the tool, while `vehicle-intent.ts` and `xp-progression.ts` are reachable through other entry points. Section 1.2 above is corrected by §4.3 and this pass; the tool's 12-module list is the one to trust.
- Test counts are Tier 4 verified by execution in this session: `npm test` → **87 files / 538 tests pass**, plus **7/7** kernel determinism tests. `npm run test:reachability` → 8/8 pass.
- Harvest claims are Tier 1 source-verified with cited line ranges (`state.ts:2780-2796` cultivation, `state.ts:1355-1377` delivery, `state.ts:2260-2268` storm, `main.ts:2741-2748` HUD, `contracts.ts:774-790` contract). They are **not** Tier 4 — I did not run the browser and play the slice.
- Gap I did not close: no browser acceptance run was executed in this session, so every "Tier 4" label carried over from WORKLOG entries is inherited evidence, not evidence I regenerated.

### Pass 2 — Architecture and long-term

- The load-bearing structural finding is that the unreachable set is **not** random debt: 4 of 12 modules (`electrical-grid`, `world-memory`, `signature`, plus `procedural-missions` post-slice) are named tranche targets in FIRST_PLAYABLE §6-7. That is a healthy pattern — designed-ahead modules with a named wiring home.
- The genuine architectural risk is `asset-manager.ts`: 267 lines, **no tests**, unreachable, and the only unreachable module with no near-term tranche. It is the largest single block of unproven code in the tree and the entry point for the whole GenAI→GLB vision. Everything in ASSET_PIPELINE_FOR_INFINITE_RIGS and the "infinite rigs" promise sits behind it.
- The "infinite possibilities" claim is the widest vision-to-runtime gap in the project: vision promises composable archetype DNA × variant layer × context adaptation; runtime has 3 hand-authored rig profiles and 4 GLBs. Context adaptation is real and shipped; the variant layer does not exist as player-reachable code.
- `xp-progression.ts` alongside the existing, reachable `progression.ts` is a duplicate-authority smell (global rule: no parallel systems for the same resource). Worth an explicit decision — extend `progression.ts` or delete/absorb `xp-progression.ts` — before either grows.

### Pass 3 — Rule compliance

- **motto_v5 §0.5 (evidence tiers):** satisfied — every system claim in §2 and §3 carries a tier and a falsifier.
- **motto_v5 §23 / v5-addendum §4 (reachability as falsifier):** satisfied — reachability was run before any implementation claim, per standing memory.
- **motto_v5 §0.2.1 (no human-calendar framing):** this review uses none; the violation in FIRST_PLAYABLE_SLICE_PLAN §9 is flagged in §7.4 rather than silently reproduced.
- **motto_v5 §0.1.1 ("Anything else?"):** satisfied below.
- **ADR-0040 canonicality:** respected — `GAME_DESIGN_SPINE.md` treated as canonical; the 2026-08-05 docs treated as non-canonical exploration input.
- **Git safety:** no git write action taken. All 2026-08-05 exploration docs remain staged-but-uncommitted; committing them is the operator's call.

---

## 9. Verification Summary

| Check | Command | Result |
|---|---|---|
| Unit + integration tests | `npm test` | **PASS** — 87 files, 538 tests |
| Kernel determinism | (bundled in `npm test`) | **PASS** — 7/7 |
| Reachability tool self-tests | `npm run test:reachability` | **PASS** — 8/8 |
| Live reachability audit | `node tools/audit-runtime-reachability.mjs` | 92 modules, 79 reachable, **12 unreachable** (budget ≤13) |
| Quarantine violations | (bundled in reachability tests) | **none** |
| Browser acceptance | `npm run test:browser` etc. | **not run this session** — inherited Tier 4 from WORKLOG |
| Typecheck / build | `npm run typecheck`, `npm run build` | **not run this session** |

No files in `src/` were modified by this review. The only write is this document.

---

## 10. Bottom Line

The project's problem is not that the runtime lags the vision. It is that **the documentation lags the runtime**, and does so in the direction that makes the project look less finished than it is.

- Four of seven "Proposed" foundational systems — context switching, episode runtime, module system, NPC/community — are shipped and player-reachable.
- The first playable slice is further along than its own plan document claims: harvest cultivation, delivery, storm arrival, and HUD are all wired in `state.ts` and `main.ts`.
- Two systems genuinely lag the vision: **rig generation** (3 authored rigs, no variant layer) and **asset pipeline** (`asset-manager.ts`, 267 untested unreachable lines).
- Unreachable-module count is **12 against a ≤13 budget**, and 4 of those 12 have named wiring homes in the next tranches.

The highest-value next actions, in order: (1) append the status-correction addenda from §7.1 so the docs stop understating the runtime; (2) wire tranche 3 (`electrical-grid.ts` + `world-memory.ts`) to convert Water Before Night from design to reachable play; (3) decide `asset-manager.ts`'s fate — either give it a tranche and tests, or archive it explicitly rather than letting it sit as the tree's largest unproven block.

---

## Anything else? (motto_v5 §0.1.1)

Yes — five things that do not fit the sections above:

1. **The `3d-games` skill is installed but empty.** `~/Projects/skills/3d-games/` and `~/.agents/skills/3d-games/` both exist as directories with **zero files** (no `skill.json`, no `skill.md`). The user asked for this review "through this skill," and that was not possible. The review was conducted as a direct technical audit instead. Related skills that *do* have content and would genuinely serve this project: `threejs-performance`, `threejs-game-director`, `threejs-gameplay-systems`, `game-design`, `game-testing`, `headed-chrome-3d-testing`. Worth deciding whether `3d-games` should be populated or removed — an empty skill directory silently degrades to "no guidance" rather than failing loudly.

2. **`_cultivatedCells` is stored as an untyped escape hatch.** `state.ts:2783-2787` uses `(state as any)._cultivatedCells` with a `Set<string>` keyed by rounded coordinates. This is outside the declared `GameState` contract, so it is not covered by the save-schema validation in `state.ts:4239-4252` and will not survive a save/reload — cultivated row *count* persists, but the dedup set does not, so a reload could let the player re-cultivate the same cells and inflate `cultivatedRows`. That is a real correctness bug in the first playable slice, and it contradicts the module's own determinism contract. It deserves a typed field on `HarvestState` (or a derived recount from world field state) rather than an `as any` side channel.

3. **A stray GLB sits at the project root.** `plow_4_furrow.glb` is at `/Users/pranay/Projects/Game_dev/rigs-unbound/plow_4_furrow.glb`, outside `assets/runtime/` where the other three live. It is not in the asset manifest path convention. Either promote it into `assets/runtime/` with provenance registered, or remove it — a root-level binary that the manifest does not know about is exactly the kind of asset that later gets loaded by accident or shipped unintentionally.

4. **All 2026-08-05 exploration docs are staged but uncommitted**, alongside modified `src/game/state.ts`, `contracts.ts`, `renderer.ts`, `world.ts`, `main.ts`, `index.html`, and `styles.css`, plus the `motto_v4.md → motto_v5.md` rename. That is a large mixed working tree spanning docs, runtime, and doctrine. I took no git action. Before committing, these are worth separating into at least three commits (doctrine rename, exploration docs, runtime slice work) so the harvest-slice implementation is reviewable on its own.

5. **The evidence-tier discipline needs to run in both directions.** motto_v5 §0.5 and §23 were written to stop docs from *overclaiming* implementation. This review found the opposite failure — systematic *underclaiming* — and the existing rules do not catch it, because nothing requires a doc to justify a low tier. A "Proposed" label costs nothing to write and is never audited. If the project wants status docs to stay trustworthy, the reachability audit output should feed the status tables directly rather than being restated by hand.

---

## Linked artifacts

- [Game Design Spine](../design/GAME_DESIGN_SPINE.md) — canonical design surface (ADR-0040 ACCEPTED)
- [First Playable — The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md) — active slice specification
- [Unified Design Summary](../research/UNIFIED_DESIGN_SUMMARY_2026-08-05.md) — the status table this review corrects
- [First Playable Slice Plan](../exploration/FIRST_PLAYABLE_SLICE_PLAN_2026-08-05.md) — carries the §0.2.1 day-framing violation
- [Context Switching Mechanic](../exploration/CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Episode Runtime Architecture](../exploration/EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)
- [Module System Mechanics](../exploration/MODULE_SYSTEM_MECHANICS_2026-08-05.md)
- [NPC and Community System](../exploration/NPC_AND_COMMUNITY_SYSTEM_2026-08-05.md)
- [Asset Pipeline for Infinite Rigs](../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)
- [Rig Generation for Infinite Possibilities](../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- Reachability tool: `tools/audit-runtime-reachability.mjs`

---

## Addendum — 2026-08-05: defect (1) closed, and the review understated it

Appended per motto_v5 §1.1. The body above is unchanged; this records what
fixing defect (1) revealed about the review's own accuracy.

### The review under-described the defect

§4 recorded `_cultivatedCells` as a save-validation gap — `cultivatedRows` is
validated at `state.ts:4239-4252`, the dedup Set is not. That is true but it is
the smallest part of the problem.

`JSON.stringify(new Set())` is `{}`, and `GameState` crosses a JSON boundary in
three places:

| Boundary | Site | Effect on the Set |
| --- | --- | --- |
| Save | `storage.ts:270` | destroyed |
| Replay clone | `run-record.ts:83` | destroyed |
| Determinism hash | `replay-validator.ts:116` | destroyed |

So this was not only a persistence bug. Two rigs' replay records could hash
identically while their cultivation histories differed, which makes it a breach
of the determinism contract in §3, not just a save defect. The review's Tier 1
static reading found the smell correctly and sized it wrongly; tracing the data
path was what established the real extent. **Static inspection locates
contract violations but does not measure them** — worth carrying forward as a
limit of Tier 1 evidence generally.

### A defect the review missed entirely

Fixing the shape required `SAVE_SCHEMA_VERSION` 28 -> 29. That exposed a
latent bug in the migration ladder at `state.ts:4627+`: v27 had no branch of
its own, existing only as `PREVIOUS_SAVE_SCHEMA_VERSION`. Shifting that
constant forward makes every v27 save fall through every case and recover as
`null`, which the load path reads as "no save" — silent total progress loss.

The review did not find this because it audited reachability and evidence
tiers, neither of which looks at version-transition behaviour. Fixed with an
explicit branch and a regression test.

### Resolution

- `HarvestState.cultivatedCells: string[]` is now the contracted authority;
  `cultivatedRows` is derived via the pure `cultivatedRowsFor()`.
- `recoverHarvest()` recomputes the row count from remembered cells rather than
  trusting the persisted value.
- Storm arrival clears cells and count together.
- Verified: typecheck clean; 88 files / 550 tests PASS (+12, no regressions);
  kernel 7/7; reachability 8/8, still 12 unreachable inside the <=13 budget;
  build PASS. Browser acceptance not run — this change is **Tier 2**.

Defects (2) `plow_4_furrow.glb` at repo root and (3) `xp-progression.ts` vs
`progression.ts` remain open.

### Anything else?

The review's own §10 recommendation — generate status tables from the
reachability audit — would not have caught either defect fixed here. The audit
answers "can the player reach this module", not "does this module's state
survive a round trip". Those are different falsifiers. A save/replay round-trip
harness over every contracted state block is the tool this class of bug
actually needs, and the project does not have one.

---

## Addendum 2 — 2026-08-05: the missing falsifier now exists

Addendum 1 closed with the observation that this review's §10 recommendation —
generate status tables from the reachability audit — would not have caught the
harvest defect, because the audit answers "can the player reach this module"
rather than "does this module's state survive a round trip", and that the
project had no tool for the second question.

It does now. `src/game/state-serialization.test.ts` (8 tests) walks the state
tree and fails on anything `JSON.stringify` destroys, reporting the path.

Two properties worth recording for future reviews:

- **It runs against stepped state, not just fresh state.** The original
  `_cultivatedCells` Set was created lazily on first plough. A creation-time
  check would have been green throughout the bug's life. Auditing initial
  conditions is not auditing state.
- **It was proven to go red.** A temporary test reintroduced the pre-fix
  pattern verbatim; the walker located it and confirmed the `{}` collapse. A
  guard that has only ever passed is not evidence that it works.

Verification after this addendum: typecheck clean; **89 files / 558 tests**
PASS (+20 over the 87 / 538 baseline this review recorded); kernel 7/7;
reachability 8/8, still 12 unreachable inside the <=13 budget; build PASS.
Browser acceptance not run — Tier 2.

Defects (2) `plow_4_furrow.glb` at repo root and (3) `xp-progression.ts` vs
`progression.ts` remain open and untouched.

### Anything else?

This review's central finding was that status labels are written by hand and
never audited. Both addenda have now demonstrated the same failure inside the
review itself: Addendum 1 corrected a defect this review under-sized, and this
one corrects test counts the review recorded accurately but which went stale
within the session. Hand-maintained numbers decay. The recommendation in §10
stands and should be read as applying to this document too.

---

## Addendum 3 — 2026-08-05: defect (3) was a false positive

This review listed "`xp-progression.ts` duplicates authority with the reachable
`progression.ts`" as defect (3), citing the global no-parallel-systems rule.
Investigation shows the review was wrong.

### What it actually is

`xp-progression.ts` is a **deliberately quarantined** record of an
explored-and-rejected progression policy:

- Line 2 of the file: "⚠️ QUARANTINED — DO NOT IMPORT FROM RUNTIME CODE
  (ADR-0036)". The header states in full that the module implements universal
  XP, that ADR-0018 rejected exactly that with operator sign-off, and that it is
  "not dead code awaiting wiring."
- `tools/audit-runtime-reachability.mjs:46` registers it in `QUARANTINED` with
  the note "ADR-0036: universal XP is rejected by ADR-0018 and must not reach
  the runtime."
- The tool treats quarantined-and-reachable as a **hard failure**, distinct from
  the budgeted unreachable allowance. The comment at line 39 explains why they
  are counted separately: including quarantined modules in the unreachable
  budget "would create pressure to 'fix' them by wiring them, which is the exact
  opposite of intent."
- Two self-tests cover the mechanism and pass: "quarantined modules are excluded
  from the unreachable budget" and "the live tree has no quarantine violations".

So there is no duplicate authority. `progression.ts` is canonical and wired;
`xp-progression.ts` is an isolated historical record with enforcement against
ever reaching the runtime. This is the no-parallel-systems rule being *honoured*
by an explicit governance mechanism, not violated.

### Why the review got it wrong, and what that costs

The review pattern-matched on file names — two modules ending
`progression.ts` — and inferred duplicate authority without reading the
header or checking the quarantine registry. Both were one command away.

This is worth recording precisely because it is the mirror image of Addendum 1.
There, `(state as any)` read as a minor style issue and turned out to be a real
correctness bug across three JSON boundaries. Here, two similar filenames read
as an architecture violation and turned out to be a signed, tooled, tested
decision. **Shape-based inference failed in both directions in the same
review.** Tier 1 static inspection locates candidates; it does not adjudicate
them. Every finding needs the file actually read before it is called a defect.

### Standing correction to §4

Defect (3) is withdrawn. No action was taken and none is needed.

Remaining open item from this review: defect (2), `plow_4_furrow.glb` at the
repository root outside `assets/runtime/` and unknown to the manifest.

### Anything else?

Three of this review's findings have now been re-examined and two needed
correcting — one under-sized (Addendum 1), one wholly wrong (this one). The
review's own §10 recommendation, that hand-authored status should be generated
from tooling rather than restated, applies to defect lists as much as to status
tables. A defect list is a set of claims, and this review shipped its claims at
Tier 1 without marking them as provisional.

---

## Addendum 4 — 2026-08-05: filesystem-first asset audit closes defect (2)'s blind spot

Created `tools/audit-asset-manifest-coverage.mjs` and wired it into `verify:head`
to close the structural blind spot that enabled this review's defect (2).

### The blind spot and the tool that closes it

Both existing asset guards — `assert-player-build-assets.mjs` (the preflight) and
the player-build boundary assert — are **manifest-driven**: they iterate
`manifest.entries` and check each entry's claims. That direction of traversal has
a blind spot by construction. An asset nobody declared has no entry to iterate,
so every manifest-driven check passes it silently. The build guard cannot see it.

This tool walks **filesystem-first** and reports three disagreements:

1. **Undeclared runtime binaries** — a `.glb`/`.gltf` on disk that no entry
   declares. No recorded provenance, rights status, or distribution approval.
2. **Declared but absent** — an entry whose `runtimePath` points at nothing.
3. **Export deferred, yet the file exists** — an entry recording `runtimePath:
   null` while a file sits at the conventional `<assetRoot>/<id>.glb` slot. This
   is the subtle one: the rights and approval status recorded against that entry
   no longer describes bytes that exist.

Only shippable runtime formats (`.glb`, `.gltf`) are in scope. Source art and
reference images are tracked with `runtimePath: null` by design and are not
distribution risks. `node_modules`, `.git`, `dist`, `coverage`, `.vite` skipped.

### Self-tests and npm wiring

- `tools/audit-asset-manifest-coverage.test.mjs` (9 tests, 9/9 pass). Each builds
  a throwaway `mkdtemp` fixture tree provoking exactly one finding. A tool that
  has only ever reported "clean" is not evidence that it works. Two cases mirror
  live findings verbatim.
- Three npm scripts: `audit:asset-coverage` (human-readable, always exits 0),
  `audit:asset-coverage:strict` (exits 1 on findings), `test:asset-coverage`.
- `verify:head` now includes `npm run test:asset-coverage && npm run
  audit:asset-coverage &&` after `npm run test:assets`. The **non-strict** audit
  is deliberately in the gate; strict is not. A gate that fails the moment it
  lands teaches people to bypass gates. Promote strict once the findings are
  dispositioned.

### Live findings (from this addendum's run)

Running `npm run audit:asset-coverage` reports:

- 2 undeclared runtime binaries: `assets/runtime/field-plough-01.glb` (inside
  asset root) and `plow_4_furrow.glb` (outside, at repo root).
- 0 declared-but-absent.
- 1 deferred-but-present: `field-plough-01` entry records `runtimePath: null`
  while `assets/runtime/field-plough-01.glb` exists.

This confirms defect (2) from the original review — `plow_4_furrow.glb` at repo
root — and surfaces two related findings the review did not catch. Both
unregistered GLBs need disposition: register with provenance and relocate to
`assets/runtime/`, or remove. The deferred-but-present case needs the manifest
entry reconciled against the file that exists.

### Documentation

Documented in `tools/README.md` under "## Asset manifest coverage audit",
positioned immediately after "## Asset manifest preflight" since the new tool
covers the preflight's blind spot. `auditAssetManifestCoverage()` is exported so
a future CI surface can call it without reimplementing the reconciliation.

### Verification

- `npx tsc --noEmit` — PASS, clean.
- `npx vitest run` — PASS, 89 files / 558 tests (unchanged from Addendum 2).
- `node tools/audit-asset-manifest-coverage.test.mjs` — 9/9 PASS.
- `npm run audit:asset-coverage` — exits 0, reports findings as documented above.
- `npm run verify:head` — PASS, now includes the new audit self-tests and
  non-strict audit.
  - **[Corrected 2026-08-06]** False; see Addendum 6. `format:check` is red on
    committed files, so the chain never reaches these steps. Every other bullet
    in this block was re-run on 2026-08-06 and holds.
- Browser acceptance not run. Evidence tier **2**.

### Standing correction to §4

Defect (2) is still open — `plow_4_furrow.glb` needs disposition — but the blind
spot that prevented its detection is now closed. A future binary swept into the
repository will be visible to `verify:head` within the same commit.

### Anything else?

Traversal direction is an audit property, not an implementation detail. Both the
preflight and this new tool can be described as "checks the assets," but they
cannot find the same class of problem. Manifest-driven iteration can only
validate claims that someone made; filesystem-driven iteration finds the absence
of a claim. No amount of hardening the first direction produces the second. The
lesson generalizes: when a check iterates a registry to validate entries, add a
second check that iterates the governed population and verifies every member has
an entry.

---

## Addendum 5 — 2026-08-06: §10 recommendation (2) is withdrawn; it was wrong on three counts

The §10 next-action list said, second in priority order:

> wire tranche 3 (`electrical-grid.ts` + `world-memory.ts`) to convert Water
> Before Night from design to reachable play

This is withdrawn. It restated §7.2, which restated the slice spec's binding
table, which was itself wrong. Nobody in that chain read the two modules. Three
independent errors, each sufficient on its own to invalidate the action:

**(a) The quest is already player-reachable.** Water Before Night did not need
converting from design to play; it shipped in commit `a141b0b`
("Water Before Night gap closure — waterworks choice is now player-reachable").
`chooseFarmWaterworks` (`state.ts:566`) is bound to the workshop buttons
(`main.ts:1390`), gated on first-start and workshop proximity, writes a real
field condition per branch (`state.ts:592`, `state.ts:603`), toggles the
`long-furrow-drain-pump` infrastructure entity, feeds the settlement outcome,
persists at `state.ts:3166`, and recovers at `state.ts:4163`. The review looked
at two unreachable module names and inferred a gap that the runtime had already
closed by other means.

**(b) `electrical-grid.ts` is not a pump circuit.** It is a rig 12V accessory
budget: alternator output (capped 140A, scaling with engine RPM) against
headlight, winch, and seismic draw, with a cutoff when the battery is spent.
None of those three loads exist as player-driven kernel state — headlights are
renderer-only (`renderer.ts:3250`), the seismic probe is a discrete pulse
(`state.ts:225`), and no winch is wired at all. Wiring this module today would
mean inventing the loads it claims to measure. The farm pump, meanwhile, was
implemented as an infrastructure entity with a `commandedOn` flag, so no version
of Water Before Night was ever going to route through it.

**(c) `world-memory.ts` is not consequence persistence.** Canonical spatial
memory is `WorldMemoryRecord` (`gameworld.ts:84`), snapshotted at
`gameworld.ts:884` and consumed by `storage.ts:46` and `run-record.ts:47` —
already wired, already shipping. `world-memory.ts` is an experimental read-only
soil-displacement projection whose own file header states it must stay pure
"until a future feature has a named consumer." Wiring it as instructed would
have stood up a second mutable soil model beside the canonical one — a parallel
system, which the workspace rules prohibit outright.

### What replaced the recommendation

Not wiring, but a missing distinction. "Unreachable" was carrying three states
with three different correct responses:

1. **Not yet connected** — connective work is all that is missing. Wire it.
2. **Must not be connected** — an accepted decision forbids it. Already
   representable as `QUARANTINED`.
3. **Cannot be connected until a named precondition is met** — wiring it today
   would create a parallel system or fabricate behaviour the game does not have.

State 3 had no representation, so it read as state 1. That is the mechanism by
which this review turned a design blocker into a work item: the audit's
vocabulary could not express the difference, so the reader supplied the only
meaning available.

`tools/audit-runtime-reachability.mjs` now carries a `DEFERRED` registry, with
both modules entered under the preconditions above. Two properties of its design
are load-bearing:

- **Deferred modules stay inside the unreachable budget**, unlike quarantined
  ones. Quarantine is permanent and decided, so excluding it is right — counting
  it would create pressure to wire a module an ADR forbids. Deferral is
  temporary and conditional; it is *supposed* to resolve. Excluding it would
  remove pressure exactly where pressure is still wanted, and would make the
  registry an escape hatch that quietly voids the budget.
- **A stale entry fails the audit.** Two rot modes are detected: an entry naming
  a module that no longer exists, and a deferred module that has become
  reachable (precondition met, entry left behind). Either one turns a registry
  into folklore that outlives the fact it described.

### Verification

- `node --test tools/audit-runtime-reachability.test.mjs` — 19/19 PASS
  (8 pre-existing, 11 new covering deferral, registry rot, and shared blockers).
- `node tools/audit-runtime-reachability.mjs` — EXIT 0. 92 modules, 79
  reachable, 12 unreachable (974 lines), inside the ≤13 budget. All three
  deferred modules annotated with precondition and rationale.
- Counts unchanged from Addendum 2 — this work added vocabulary, not wiring.
- Browser acceptance not run. Evidence tier **2**.

### §7.2's Tranche 4 claim, checked immediately rather than left standing

The paragraph above originally ended by flagging §7.2's `signature.ts` binding
as an unchecked claim. Leaving it flagged would have repeated the failure this
addendum documents, so it was read. The claim is wrong, in the same way:

§7.2 and the slice spec §3 both bind `signature.ts` to "component provenance"
— the *What the Old Tractor Kept* quest, where a storied part alters the rig's
emission signature. The module models no provenance of any kind. It derives
three emission channels (acoustic, illumination, thermal proxy) from rig speed,
strain, and tool engagement. There is no component identity in it, no history,
and nothing that could distinguish a storied part from a standard one. Nothing
imports it but its own test.

It is now a third `DEFERRED` entry, on its own header's terms: it stays an
evidence fixture "until one real listener and accessible player feedback land
together."

### The finding that only appeared once three modules were registered

`signature.ts` and `electrical-grid.ts` are blocked on **the same missing
concept**: player-owned operating-light state. `electrical-grid.ts` needs
`isHeadlightsActive` to be real kernel state; `signature.ts`'s header forbids
production callers from inferring its `illumination` input from Three.js
objects precisely because no such state exists. Measured: `flashHeadlights`
(`main.ts:1349`) drives a renderer-side transient (`renderer.ts:561`,
`headlightFlareUntil`), and every other `beacon` in the tree is decorative
geometry. There is no player-owned light state anywhere in the kernel.

Written as free text, those two preconditions read as two unrelated blockers.
They are one absent capability holding back 147 unreachable lines. The registry
now carries a `sharedBlocker` slug so the audit can group them and report that
figure directly, rather than leaving it to be rediscovered by whoever next reads
three rationales closely enough to notice they describe the same gap.

The grouping is deliberately reported as *necessary, not sufficient*: adding
light state would unblock `electrical-grid.ts` outright, but `signature.ts`
would still be waiting on a listener. Overstating it would be the same category
of error as the recommendation this addendum withdraws.

### Standing correction to §7.2 and §10

§7.2's Tranche 3 entry and §10's action (2) are superseded by this addendum.
Water Before Night is shipped; neither named module is the correct binding for
it. §7.2's Tranche 4 entry names `signature.ts` as "component provenance" —
also wrong, per the section above.

### Anything else?

The failure has a shape worth naming, because it is the same shape as
Addendum 3's. A module filename is a Tier 1 artifact — someone's summary of
intent at the moment of creation — and this review treated two filenames as
evidence about behaviour. `world-memory.ts` sounds exactly like consequence
persistence. `electrical-grid.ts` sounds exactly like something a pump would
plug into. Both readings were plausible, propagated through three documents
unchallenged, and were wrong the moment anyone opened the files.

The rule this yields: **a reachability audit ranks candidates, it does not
adjudicate them.** Its output is a list of modules worth reading, and the read
is not optional. Every claim in this review that binds a module name to a
behaviour, and that was not accompanied by a file-and-line citation, should be
assumed unverified until someone opens the file.

---

## Addendum 6 — 2026-08-06: this review's own `verify:head` PASS claim is false

Addendum 4's verification block states "`npm run verify:head` — PASS, now
includes the new audit self-tests and non-strict audit." That cannot be true.

`verify:head` is an `&&` chain whose first step is `format:check`, and
`format:check` is red on **committed** files: of 49 failing files, 41 are
unmodified at HEAD. *(**[Corrected 2026-08-06]** Counts stale — see Addendum 7.
Run `npm run format:check`. The argument does not rest on the numbers: the
failures are on files nobody currently has open.)*
Prettier is version-consistent (lockfile and installed both
3.9.6), no prettier config has ever existed in this repository, and
`format:check` has carried its current glob since commit `54c1c37`. The failures
are 80-column reflows in files added after the gate was written.

The condition is documented — `WORKLOG_ADDENDUM_2026-07-28.md:292` records the
gate as known-red — which makes the claim careless rather than novel, and does
not make it true. Two other documents carry the same false claim:
`WORKLOG.md:7934` and `EXPLORATION_MAP.md:3233`.

### Why this is the most serious finding in the review

Every other defect this review found, and every correction these addenda have
made, concerns a claim about *the game*. This one concerns a claim about *the
evidence*. An unverifiable evidence claim does not just mislead about one
module — it silently downgrades the trustworthiness of every session that cited
the same gate. Addenda 1 through 5 corrected statements that were checkable in
principle. This one was checkable in five seconds and was checked by nobody
across at least three documents.

The mechanism is worth naming precisely, because it is not laziness. Running
`npm run verify:head 2>&1 | tail -50` reports the **pipeline's** exit code,
which is `tail`'s, which is always 0. A reader who trusts the exit code sees
success while the actual chain died at step one. This session nearly recorded
the same false PASS for the same reason, and caught it only because the
truncated output was prettier warnings rather than a build summary.

### Corrected verification for Addendum 4's work

Re-run step by step on 2026-08-06:

- `npm run typecheck` — PASS after fixing 5 × TS2532 in
  `state-serialization.test.ts` (indexing `[0]` under `noUncheckedIndexedAccess`).
- `npm run test` — PASS, 89 files / 558 tests.
- `npm run test:assets` — PASS, 7 tests.
- `npm run test:asset-coverage` — PASS, 9 tests.
- `npm run audit:asset-coverage` — EXIT 0, `field-plough-01` deferred-but-present
  finding unchanged.
- `npm run test:reachability` — PASS, 19 tests.
- `npm run audit:reachability:budget` — EXIT 0, 12 unreachable, ceiling 25.
- `npm run build` — PASS, player build asset boundary passed.
- `npm run format:check` — **FAIL**, 49 files, 41 of them unmodified at HEAD.
  *(**[Corrected 2026-08-06]** Counts stale; see Addendum 7. Still FAIL.)*
- Browser acceptance not run. Evidence tier **2**.

So Addendum 4's substantive claims hold; only the sentence naming the chain was
wrong. The tier is unchanged.

### Unblock path, deliberately not taken here

`npx prettier --write` over the `format:check` glob fixes all 49 files. It is
deterministic and semantics-preserving, and typecheck plus 558 tests verify it
afterward. It is not done in this pass because 8 of the 49 files are currently
modified in the working tree by in-flight parallel work, and reformatting files
another editor has open entangles an unrelated sweep with someone else's
uncommitted changes. That is an operator sequencing decision.

### Anything else?

Yes — a rule for this document and every successor. **Never cite a composite
gate by name.** Cite the steps that actually ran. A gate name is a claim about
N things at once, it is exactly as strong as its weakest step, and — as this
addendum shows — it can be recorded as passing by someone who never saw it run
to completion. `verify:head` is a convenience for running steps, not a citation.

---

## Addendum 7 — 2026-08-06: the counts in Addendum 6 are stale, and why that is the interesting part

Addendum 6 states "of 49 failing files, 41 are unmodified at HEAD," and repeats
`49` twice more. Measured again the same day: **53 failing, 44 unmodified at
HEAD, 9 in the working tree.**

Two independent causes, and honesty requires separating them:

1. **Self-inflicted (+1).** The `format:check` glob was widened later that day —
   `"tools/**/*.cjs"` → `"tools/**/*.{cjs,mjs,ts}"` and `index.html` →
   `"*.html"` — because all 11 `.mjs` audit tools, including the reachability
   enforcer `verify:head` calls, had never been format-gated at all. Widening
   pulled in `accessibility.html`.
2. **Environmental (+3).** Parallel work landed between the two measurements.
   The earlier file list was not saved, so the delta is known and its membership
   is not. Naming the files would be invention.

### The part worth keeping

Addendum 6 argued that a composite gate should never be cited by name, because
the name is a claim about N things and is exactly as strong as its weakest step.
That argument was right. It was then written up with a restated count — and the
count decayed in under four hours, from two directions at once, one of them the
author's own later edit.

The generalisation is stronger than the original rule and subsumes it:

> **Cite the command, not its output.** A gate name over-claims (N steps, one
> word). A restated count under-claims (one instant, presented as a standing
> fact). Both fail the same way: they detach a claim from the thing that can
> re-derive it. What belongs in a durable document is the condition and the
> command that tests it.

Applied here, the load-bearing claim never needed a number:

> `format:check` fails on files nobody currently has open. It was red before
> this session and remains red after it. Run `npm run format:check`.

That sentence is still true, will remain true until the sweep happens, and
cannot go stale by a digit.

### Standing correction

Every count in Addenda 5 and 6 describing the formatting backlog should be read
as a measurement timestamped to its addendum, not a current figure. The
reachability figures in those addenda are *not* affected — those come from
`audit:reachability:budget`, which is deterministic against the tree and was
re-run at EXIT 0 after every change described here.

### Verification

Re-run after the formatting and glob changes, each step's exit code read
directly rather than through a pipe (piping through `tail` reports `tail`'s
status, which is how Addendum 4's false PASS was recorded in the first place):

- `npm run typecheck` — EXIT 0.
- `npx vitest run` — EXIT 0, 89 files / 558 tests.
- `npm run test:assets` — EXIT 0, 7 tests.
- `npm run test:asset-coverage` — EXIT 0, 9 tests.
- `npm run test:reachability` — EXIT 0, 19 tests.
- `npm run audit:reachability:budget` — EXIT 0, 12 unreachable, ceiling 25.
- `npm run audit:asset-coverage` — EXIT 0, findings unchanged.
- `npm run build` — EXIT 0, player build asset boundary passed.
- `npm run format:check` — EXIT 1, pre-existing, unchanged in status by the
  widening.
- Browser acceptance not run. Evidence tier **2**.

### Anything else?

One thing, and it is uncomfortable. This review has now produced seven addenda,
of which four correct the review or its own addenda rather than the codebase:
Addendum 5 withdrew a recommendation, 6 corrected a verification claim, 7
corrects 6's numbers. That ratio is not a sign the process is failing — every
correction was found by checking rather than by being told, and each one was
cheaper than the mistake it caught. But it is a strong signal about the original
review's method: **§1 through §10 were written from documents and module names,
and every claim that has since been opened and read was wrong.** Three of three
binding claims, one of one gate claim. The prior for the unread remainder should
be set accordingly.

---

## Addendum 8 — 2026-08-06: the gate is green; Addenda 6 and 7 describe a condition that no longer holds

The operator approved the sweep. `prettier --write` was run over the
`format:check` glob — **not** `npm run format`, which is `prettier --write .`
and would have reflowed 100+ hand-wrapped prose files including this review.
53 files were rewritten. Prettier 3.9.6.

```
npm run format:check   EXIT 0
npm run verify:head    EXIT 0     ← all nine steps, exit code read directly
```

`verify:head` passes. Every claim in Addenda 6 and 7 about the gate being
unpassable was true when written and is now historical.

### What survives, and what does not

**Does not survive:** "no document should claim `verify:head` PASS." That
instruction is withdrawn. It was correct for a red gate; the gate is green.

**Survives, and is the durable point:** *cite the command, not its output, and
read the exit code directly.* Addendum 4's false PASS was produced by
`npm run verify:head 2>&1 | tail -50`, which reports `tail`'s status — always 0.
That pipeline is just as capable of reporting a false PASS today as it was
yesterday. A green gate does not repair a broken way of observing it.

### A methodological note worth more than the fix

Three tests were run to prove the sweep touched only formatting, and the first
two were not good enough:

1. `git diff --ignore-all-space` — worthless here. Prettier rewraps, so line
   boundaries legitimately move and the diff calls that changed content.
2. Whitespace-stripped hashing, then also stripping commas, pipes, parens —
   each round is *a guess at the alphabet of changes prettier may make*. It
   passes silently on anything not guessed. Worse, it produced a `-0.5`/`+0.34`
   artifact in `renderer.ts` that reads exactly like a changed constant. It was
   an aggregation artifact of merged lines. **A heuristic that reports a false
   value change is worse than none**, because the correct response to it —
   trust it, hunt the bug — wastes the effort the heuristic was meant to save.
3. `prettier --stdin-filepath <path> < backup`, compared byte-for-byte against
   disk. This asks "is the file exactly what prettier produces from the
   pre-sweep content?" — no list of allowed changes, no category can be missed.
   Run across all 9 files carrying both the sweep and in-flight work — not
   just the 5 the heuristic happened to flag, since trusting that selection
   would inherit exactly the incompleteness test 2 was rejected for. All 9:
   byte-identical.

   The 7 in-flight files with no backup are all `.md`, which is outside the
   glob, so prettier never opened them. That is what makes the 9 the complete
   overlap rather than a sample.

The generalisation, which is the same shape as this review's other findings:
**prefer a test that cannot be incomplete over a test whose completeness depends
on your enumeration being right.** Tests 1 and 2 encode a belief about what
could have gone wrong. Test 3 encodes none.

### Verification

- `typecheck`, `vitest` (89 files / 558 tests), `test:assets`,
  `test:asset-coverage`, `test:reachability` (19), `audit:reachability:budget`
  (12 unreachable, ceiling 25), `audit:asset-coverage`, `build`,
  `format:check`, `verify:head` — **all EXIT 0**.
- Browser acceptance not run. Evidence tier **2**.

### Open, and now the operator's to sequence

The working tree carries 66 modified tracked files. The sweep rewrote 53 — 44
that were previously clean, plus 9 already carrying in-flight parallel work.
Because of those 9, a formatting-only commit is not mechanically separable
without staging by hunk. Nothing was committed; no git write action was taken
at any point.

The 53 is arithmetic from two measured numbers, not a figure read off the
sweep: 66 modified now, 22 modified before, so 44 are newly modified and
sweep-only, and the 9 overlap files bring the total prettier rewrote to 53.
An earlier draft of this addendum said "44 rewritten, 9 of those 44 also
carrying in-flight work," which cannot be true of the same 44 — the 9 were
never in it.

Separately: widening the glob closed today's gap but not its mechanism. The
checker is still an enumerated allowlist while `format` writes everything. The
durable fix is `prettier --check .` with a `.prettierignore` — deferred because
it pulls `docs/` into the gate, which is a scope decision.

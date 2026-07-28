# Progression System Design

**Project:** rigs-unbound  
**Version:** 0.1.0 (Exploratory)  
**Last Updated:** 2026-07-27  
**Status:** Capability-shaped runtime canonical; XP model preserved as an optional policy reference

---

## Overview

The project retains two progression models because they solve different problems:

1. **Capability-shaped progression is the current canonical runtime model.** Rig Journey, per-verb Mastery, and profile-level Insight describe what the player has restored, demonstrated, and learned.
2. **Universal XP progression is an optional policy for future games.** Account XP, levels, rungs, and XP-based restoration can be enabled by a particular game, or composed with capability progression when both are useful.

This document preserves the XP model as a reusable design reference. It does not make XP a required field of the current capability-shaped save state. The coexistence and composition boundary is documented in `docs/exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md`.

---

## Core Concepts

### Current canonical runtime spine

The live implementation in `src/game/progression.ts` owns:

- per-rig **Journey** and restoration investment;
- per-rig, per-verb **Mastery** with situation-weighted diminishing returns;
- profile-level **Insight** and milestone completion.

The current mission and activity reward paths route into these tracks. They do not award universal XP.

### Optional policy layer

The XP sections below describe a valid future policy, not a second authority inside the current `ProgressionState`. A future game may use the XP model alone, while a hybrid game may award both XP and capability progress through an explicit reward policy. The tracks must remain namespaced and independently derivable.

### Three Parallel Tracks

| Track               | Purpose                               | Visual Representation              |
| ------------------- | ------------------------------------- | ---------------------------------- |
| **Experience (XP)** | Universal currency for advancement    | XP bar, level number               |
| **Rungs (Tiers)**   | Content gates & unlock thresholds     | Rung 1-10+, badges                 |
| **Restoration Arc** | Per-rig visual/mechanical progression | Rig appearance, slots, performance |

---

## Experience (XP) System

### XP Sources

| Activity                | Base XP | Scaling                      |
| ----------------------- | ------- | ---------------------------- |
| Mission Complete        | 100-800 | × Difficulty × Quality       |
| Objective Complete      | 10-50   | × Difficulty                 |
| Discovery (POI, site)   | 25-100  | × Distance from base         |
| Salvage Turn-in         | 10-200  | × Material rarity × quantity |
| Blueprint Fragment      | 50-200  | × Blueprint rarity           |
| First Discovery Bonus   | +50%    | First time only              |
| Daily/Weekly Challenges | 100-500 | Fixed                        |

### XP Curve

```typescript
// XP required for level L: base × L^1.5
// Level 1: 0 XP
// Level 10: ~316 XP
// Level 20: ~894 XP
// Level 30: ~1,643 XP
// Level 50: ~3,536 XP

function xpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.floor(100 * Math.pow(level, 1.5));
}

function levelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor(Math.pow(xp / 100, 2 / 3)) + 1;
}
```

### Level Cap

- **Soft Cap:** Level 50 (end of main progression)
- **Prestige:** After 50, reset for cosmetic rewards + permanent minor bonus

---

## Rungs (Progression Tiers)

### Rung Structure

| Rung               | XP Required | Unlocks                                | Theme    |
| ------------------ | ----------- | -------------------------------------- | -------- |
| **0: Scavenger**   | 0           | Basic rig, 1 module slot               | Survive  |
| **1: Apprentice**  | 100         | 2nd module slot, basic blueprints      | Learn    |
| **2: Journeyman**  | 500         | 3rd slot, uncommon blueprints          | Build    |
| **3: Craftsman**   | 1,200       | Rare blueprints, 4th slot (heavy rigs) | Master   |
| **4: Master**      | 2,500       | Epic blueprints, 5th slot (heavy)      | Optimize |
| **5: Grandmaster** | 5,000       | Legendary blueprints, cosmetics        | Legacy   |
| **6+: Legend**     | 10k+        | Prestige cosmetics, permanent bonuses  | Legacy+  |

### Rung Unlocks

| Rung | Module Slots    | Blueprints                     | Cosmetics              | Other            |
| ---- | --------------- | ------------------------------ | ---------------------- | ---------------- |
| 0    | 1               | Basic chassis, engine          | Rust paint             | —                |
| 1    | 2               | Basic suspension, winch        | Primer colors          | Salvage scanner  |
| 2    | 3               | Suspension, utility, sensor    | Weathering decals      | Market access    |
| 3    | 4 (heavy)       | Rare engine, advanced sensor   | Custom paint slots     | Rare market      |
| 4    | 5 (heavy)       | Epic powertrain, exotic sensor | Animated decals        | Legendary market |
| 5+   | Max + cosmetics | Legendary, unique modules      | Animated paint, trails | Prestige perks   |

### Rung Advancement

```
XP Earned → Level Up Check → Rung Threshold Crossed?
                                          ↓
                    ┌─────────────────────┴─────────────────────┐
                    ▼                                           ▼
               NO (continue)                              YES (Rung Up)
                                                            ↓
                    ┌──────────────────────────────────────────────┐
                    │  Unlock:                                     │
                    │  • New module slot (if applicable)           │
                    │  • Blueprint tier unlock                     │
                    │  • Cosmetic unlock                           │
                    │  • Market tier access                        │
                    │  • Rig class unlock (at thresholds)          │
                    └──────────────────────────────────────────────┘
                                                            ↓
                                                   UI Notification + VFX
```

---

## Restoration Arc (Per-Rig Progression)

### Concept

Each rig has its own visual/mechanical restoration journey from **Scavenged → Masterwork**. This is the primary _visual_ progression that players see on their rig.

### Stages

| Stage | Name           | Visual                                  | Mechanical                         | Requirements                      |
| ----- | -------------- | --------------------------------------- | ---------------------------------- | --------------------------------- |
| **0** | **Scavenged**  | Rust, dents, missing panels, smoke      | 1 slot, leaks, smoke, rough idle   | Starting state                    |
| **1** | **Patched**    | Primer patches, duct tape, duct tape    | 2 slots, leaks sealed, stable idle | 100 XP + Scrap×50                 |
| **2** | **Functional** | Primer + patch panels, clean            | 2 slots, no leaks, smooth idle     | 500 XP + Scrap×200                |
| **3** | **Reliable**   | Clean paint, panel gaps closed          | 3 slots, no leaks, smooth          | 1,200 XP + Plates×20              |
| **4** | **Custom**     | Custom paint, decals, clean             | 4 slots, tuned, no leaks           | 2,500 XP + Rare Parts             |
| **5** | **Masterwork** | Signature paint, animated details, glow | Max slots, tuned, unique module    | 5,000 XP + Rare Parts + Blueprint |

### Visual Milestones per Stage

| Element         | Stage 0               | Stage 1               | Stage 2               | Stage 3            | Stage 4               | Stage 5                  |
| --------------- | --------------------- | --------------------- | --------------------- | ------------------ | --------------------- | ------------------------ |
| **Paint**       | Bare metal/rust       | Primer + rust patches | Primer + patch panels | Base coat          | Custom paint + decals | Signature animated paint |
| **Body**        | Dents, holes, missing | Dents + patch panels  | Panels aligned        | Seamless           | Custom panels         | Sculpted, signature      |
| **Wheels**      | Rusted, mismatched    | Cleaned + mismatched  | Matching set          | Custom rims        | Custom + spinners     | Signature + effects      |
| **Exhaust**     | Smoke, rattling       | Reduced smoke         | Clean                 | Tuned note         | Custom headers        | Glowing/animated         |
| **Cab**         | Cracked glass, torn   | Taped glass, worn     | Clean glass, patched  | Clean, custom dash | Custom interior       | Signature interior       |
| **Attachments** | Loose, missing        | Strapped down         | Bolted clean          | Flush mounted      | Integrated            | Seamless                 |
| **Lighting**    | Flickering, dim       | Steady, dim           | Bright, clean         | LED strips         | Custom RGB            | Dynamic/reactive         |
| **Particles**   | Smoke, oil drips      | Occasional drip       | Clean                 | Clean              | Subtle glow           | Signature trail          |

### Mechanical Changes per Stage

| Stat             | Stage 0 | Stage 1 | Stage 2  | Stage 3 | Stage 4 | Stage 5   |
| ---------------- | ------- | ------- | -------- | ------- | ------- | --------- |
| Module Slots     | 1       | 2       | 2        | 3       | 4       | Max       |
| Max HP           | 60%     | 75%     | 85%      | 100%    | 110%    | 125%      |
| Fuel Efficiency  | 70%     | 80%     | 90%      | 100%    | 110%    | 120%      |
| Repair Speed     | 50%     | 75%     | 90%      | 100%    | 110%    | 125%      |
| Module Unlock    | 1 slot  | +1 slot | —        | +1 slot | +1 slot | Max       |
| Blueprint Access | Basic   | Basic   | Uncommon | Rare    | Epic    | Legendary |

---

## XP Distribution Design

### Mission XP Distribution

| Mission Type | Base XP | Time (min) | XP/min    |
| ------------ | ------- | ---------- | --------- |
| Delivery     | 100     | 5-10       | 10-20     |
| Salvage      | 150     | 10-20      | 7.5-15    |
| Survey       | 200     | 15-25      | 8-13      |
| Recovery     | 300     | 20-30      | 10-15     |
| Escort       | 250     | 15-20      | 12.5-16.7 |
| Survey       | 200     | 15-20      | 10-13.3   |
| Clearance    | 300     | 20-30      | 10-15     |
| Expedition   | 500     | 40-60      | 8.3-12.5  |

### Daily/Weekly XP Targets

| Period     | Target XP   | Equivalent Activity   |
| ---------- | ----------- | --------------------- |
| **Daily**  | 500-800     | 2-3 Normal missions   |
| **Weekly** | 3,500-5,000 | 15-20 Normal missions |

**Rationale:** Casual player (30-45 min/day) hits daily; dedicated (2-3 hr/week) hits weekly.

---

## Restoration Arc Implementation

### Data Model

```typescript
interface RigRestoration {
  rigId: string;
  stage: 0 | 1 | 2 | 3 | 4 | 5;
  xpInvested: number; // XP spent on this rig
  partsInvested: Record<MaterialId, number>;
  blueprintsApplied: BlueprintId[];
  visualState: RestorationVisualState;
  mechanicalState: RestorationMechanicalState;
  unlockedAt: Record<RestorationStage, number>; // timestamps
}

interface RestorationVisualState {
  paint: PaintState;
  body: BodyCondition;
  wheels: WheelCondition;
  exhaust: ExhaustCondition;
  cab: CabCondition;
  attachments: AttachmentCondition;
  lighting: LightingState;
  particles: ParticleState;
}

interface RestorationMechanicalState {
  moduleSlots: number;
  maxHP: number;
  fuelEfficiency: number;
  repairSpeed: number;
  moduleSlotsUnlocked: number;
  blueprintTierAccess: BlueprintTier;
}
```

### Restoration Actions

```typescript
type RestorationAction =
  | { type: "REPAIR_BODY"; materials: { Scrap: number; Plate?: number } }
  | { type: "PAINT"; paintId: PaintId; materials: { Paint: number } }
  | { type: "INSTALL_PANEL"; panelId: string; materials: { Plate: number } }
  | { type: "OVERHAUL_ENGINE"; materials: { Circuit: number; Plate: number } }
  | { type: "UPGRADE_SUSPENSION"; materials: { Spring: number; Shock: number } }
  | { type: "APPLY_PAINT"; paintId: PaintId; materials: { Paint: number } }
  | { type: "APPLY_DECAL"; decalId: string }
  | {
      type: "APPLY_SIGNATURE_PAINT";
      paintId: PaintId;
      materials: { SignaturePaint: number };
    }
  | {
      type: "APPLY_SIGNATURE_TRAIL";
      trailId: string;
      materials: { SignatureTrail: number };
    };
```

### Visual Implementation Notes

- **Stage 0-2:** Procedural rust/wear shaders + patch meshes
- **Stage 3-4:** Texture swap (base coat) + decal system
- **Stage 5:** Custom shader (animated paint, trail particles) + signature mesh
- **Transitions:** Crossfade materials over 2-3 seconds on stage up

---

## XP & Progression Balance

The following balance model is retained for future XP-enabled games. Its values are starting defaults, not current product commitments.

### Time-to-Rung Estimates

| Rung           | Cumulative XP | Est. Playtime (casual) | Est. Playtime (dedicated) |
| -------------- | ------------- | ---------------------- | ------------------------- |
| 0→1            | 100           | 30 min                 | 15 min                    |
| 1→2            | 500           | 2.5 hr                 | 1 hr                      |
| 2→3            | 1,200         | 6 hr                   | 3 hr                      |
| 3→4            | 2,500         | 12.5 hr                | 5 hr                      |
| 4→5            | 5,000         | 25 hr                  | 10 hr                     |
| **Total to 5** | **9,300**     | **~46 hr**             | **~19 hr**                |

### XP/hr Targets

| Playstyle                         | XP/hr   | Notes         |
| --------------------------------- | ------- | ------------- |
| Casual (explore, casual missions) | 150-200 | Relaxed       |
| Standard (mission-focused)        | 300-400 | Standard loop |
| Optimized (speedrun, efficient)   | 500-800 | Speedrun      |

**Target:** Casual reaches Rung 5 in ~50 hrs; dedicated in ~20 hrs.

---

## Visual Restoration Implementation

### Shader Approach

| Stage | Technique                                                        |
| ----- | ---------------------------------------------------------------- |
| 0-2   | Vertex paint + rust/wear mask + patch geometry                   |
| 3-4   | Base color texture + decal system + normal detail                |
| 5     | Custom shader (animated paint, emissive trails) + signature mesh |

### Material Transitions

```
Stage N/Actor Crossfade (on stage up):
  1. Snapshot current material state
  2. Create target material
  3. Crossfade uniforms over 2-3 seconds
  3. Swap geometry where needed (patches → seamless)
  4. Trigger VFX (sparkles, paint spray, sparkle burst)
  5. Play restoration sound
```

### Signature Stage (5) Extras

- **Animated Paint:** Subtle color shift / pearlescent shift
- **Trail Particles:** Subtle sparkle/dust trail when moving
- **Signature Mesh:** Unique silhouette element (exhaust, antenna, ornament)
- **Dynamic Paint:** Subtle color shift based on speed/load
- **Sound:** Signature engine note, subtle chime on stage up

---

## Open Items

| Item                                | Priority | Status  |
| ----------------------------------- | -------- | ------- |
| XP curve playtest validation        | High     | Pending |
| Restoration stage visual asset list | High     | Pending |
| Rig-specific restoration paths      | High     | Design  |
| Module slot unlock per rig class    | High     | Design  |
| Blueprint fragment system           | High     | Design  |
| Prestige system (post-50)           | Medium   | Design  |
| Daily/weekly challenge XP tuning    | Medium   | Design  |
| Restoration VFX asset list          | High     | Pending |

---

## Related Documents

- `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` — Overall architecture

## Addendum — 2026-07-28 canonical ownership correction

This document preserves the historical XP/level/rung/restoration exploration;
it is no longer the canonical campaign contract. ADR-0018 and ADR-0033 establish
capability-shaped progression (Journey, Mastery, Insight) as authoritative.

The XP model remains available for explicitly scoped arcade, time-trial,
seasonal, future-game, or legacy-import use. See [Progression Mode
Interoperability and Legacy XP Exploration](../research/PROGRESSION_MODE_INTEROP_AND_LEGACY_XP_EXPLORATION_2026-07-28.md)
for conversion, reset, idempotency, and cross-mode boundaries.

- `MISSION_SYSTEM_DESIGN.md` — XP sources from missions
- `ECONOMY_SYSTEM.md` — Salvage → XP conversion
- `VEHICLE_PROGRESSION.md` — Rig restoration arc details
- `MISSION_SYSTEM_DESIGN.md` — Mission XP rewards

---

## Current Implementation Evidence

- `src/game/progression.ts` is the pure capability-shaped progression kernel. Journey, Mastery, and Insight are the current runtime authority.
- `GameState.progression` is the durable capability namespace introduced in save schema v10.
- `src/game/activities.ts` owns the current cargo and survey reward values; `src/game/mission-resolver.ts` routes those rewards into the capability tracks.
- `publicState()` publishes derived Journey, Mastery, and Insight data.
- Older saves remain recoverable through the explicit v8 migration path, with missing progression defaulted rather than invented.

The XP model above remains available as a future policy reference. It is not part of the current runtime save contract unless a concrete game opts into it. See ADR-0018, ADR-0033, and the coexistence exploration for the precedence and composition rules.

## Addendum (2026-07-28) - Optional policy kernel

`src/game/xp-progression.ts` is the first executable implementation of the
optional XP policy. It is mode-scoped, ruleset-versioned, derives level and rung
from account XP, supports per-rig restoration XP, and rejects duplicate or
cross-mode reward events. It is not wired into the campaign save or mission
resolver; wiring requires a named XP-consuming mode and its own persistence and
UI contract.

### Anything else?

The canonical capability state remains the only current campaign authority.

---

_Generated: 2026-07-28 | Project: rigs-unbound | Status: Design + runtime foundation_

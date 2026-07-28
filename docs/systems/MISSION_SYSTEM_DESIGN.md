# Mission System Design

**Project:** rigs-unbound  
**Version:** 0.1.0 (Exploratory)  
**Last Updated:** 2026-07-27  
**Status:** Design Phase

---

## Overview

The Mission System drives the core gameplay loop by generating, presenting, tracking, and rewarding player-directed activities. Missions are the primary vehicle for progression, economy interaction, and world exploration.

---

## Mission Architecture

### Mission Object Structure

```typescript
interface Mission {
  id: string; // Unique identifier
  type: MissionType; // Classification
  seed: number; // Deterministic generation seed
  title: string; // Display name
  description: string; // Full briefing
  briefing: string; // Short summary for UI

  // Requirements
  prerequisites: Prerequisite[]; // Locks (progression, rig, region)
  recommendedRig: RigSpec; // Suggested rig class/modules
  difficulty: DifficultyTier; // Scaling factor

  // Structure
  objectives: Objective[]; // Ordered or parallel
  timeLimit?: number; // Seconds (optional)
  region: RegionId; // World region
  spawnData: SpawnData; // Dynamic spawns (cargo, enemies, sites)

  // Rewards
  rewards: Reward[]; // Guaranteed
  bonusRewards: BonusReward[]; // Conditional (time, stealth, no damage)

  // State
  state: MissionState;
  progress: ObjectiveProgress[];
  acceptedAt?: number; // Timestamp
  completedAt?: number;
  failedAt?: number;
}
```

### Mission Types

| Type           | Code         | Core Verb   | Typical Objectives                 | Reward Profile              |
| -------------- | ------------ | ----------- | ---------------------------------- | --------------------------- |
| **Delivery**   | `DELIVERY`   | Transport   | Pickup → Transport → Dropoff       | Credits, Reputation         |
| **Salvage**    | `SALVAGE`    | Recover     | Locate → Extract → Return          | Salvage + Blueprints        |
| **Survey**     | `SURVEY`     | Scan/Map    | Scan sites, photograph, sample     | Data, Credits, Maps         |
| **Recovery**   | `RECOVERY`   | Retrieve    | Locate → Secure → Extract          | High-value item + Blueprint |
| **Escort**     | `ESCORT`     | Protect     | Follow NPC, defend from threats    | Credits + Reputation        |
| **Survey**     | `SURVEY`     | Investigate | Scan anomalies, photograph, sample | Data, Credits, Blueprints   |
| **Clearance**  | `CLEARANCE`  | Clear       | Eliminate threats, clear obstacles | Salvage + Territory         |
| **Expedition** | `EXPEDITION` | Explore     | Multi-objective, multi-region      | High rewards, unlocks       |

### Objective Types

```typescript
type ObjectiveType =
  | "NAVIGATE_TO" // Reach waypoint/region
  | "PICKUP" // Collect item/cargo/entity
  | "DELIVER" // Drop off at location
  | "SCAN" // Use sensor on target
  | "PHOTOGRAPH" // Capture image (angle, distance)
  | "EXTRACT" // Use tool to extract resource
  | "REPAIR" // Restore entity to functional
  | "DEFEND" // Protect target for duration
  | "ELIMINATE" // Destroy/neutralize targets
  | "SAMPLE" // Collect physical sample
  | "DEPLOY" // Place device/beacon
  | "SURVEY_AREA" // Map region coverage %
  | "WAIT" // Wait for condition/time
  | "COMMUNICATE"; // Hail/transmit to target
```

### Objective Structure

```typescript
interface Objective {
  id: string;
  type: ObjectiveType;
  description: string; // UI text
  target: TargetSpec; // What/where
  quantity?: number; // For count-based
  region?: RegionId; // Geographic scope
  timeLimit?: number; // Optional per-objective timer
  optional: boolean; // Bonus vs required
  hidden: boolean; // Revealed on discovery
  prerequisites: string[]; // Objective IDs that must complete first
  rewards: Reward[]; // Per-objective micro-rewards
}
```

### Mission Generation Pipeline

```
World Seed + Player Progress + Region State
         ↓
   Mission Generator (deterministic PRNG)
         ↓
   Mission Template Selection (weighted by player progress)
         ↓
   Parameter Injection (spawn points, rewards, difficulty)
         ↓
   Validation (reachability, reward balance, no conflicts)
         ↓
   Mission Object → Mission Registry → UI Presentation
```

**Generation Parameters:**

| Parameter        | Source                            | Influence                |
| ---------------- | --------------------------------- | ------------------------ |
| Mission Type     | Player progress + region needs    | Mission pool             |
| Difficulty       | Player rig tier + region threat   | Enemy count, time limits |
| Rewards          | Mission type + difficulty tier    | Scaled base + variance   |
| Spawn Points     | Region POI graph + navmesh        | Reachability guaranteed  |
| Time Limit       | Distance + difficulty + rig speed | Urgency pressure         |
| Bonus Conditions | Mission type + rig capabilities   | Mastery incentives       |

---

## Mission State Machine

```
AVAILABLE → ACCEPTED → ACTIVE → COMPLETED → REWARDED
                ↓          ↓
              ABANDONED  FAILED
                ↓          ↓
             EXPIRED    EXPIRED
```

**State Transitions:**

| From             | To        | Trigger                                              |
| ---------------- | --------- | ---------------------------------------------------- |
| AVAILABLE        | ACCEPTED  | Player accepts                                       |
| AVAILABLE        | EXPIRED   | Time limit / world state change                      |
| ACCEPTED         | ACTIVE    | Player enters mission region                         |
| ACTIVE           | COMPLETED | All required objectives done                         |
| ACTIVE           | FAILED    | Critical objective failed / time out / rig destroyed |
| ACTIVE           | ABANDONED | Player manually abandons                             |
| COMPLETED        | REWARDED  | Player claims rewards                                |
| FAILED/ABANDONED | EXPIRED   | Cleanup timeout                                      |

---

## Reward System

### Reward Types

```typescript
type Reward =
  | { type: "CREDITS"; amount: number }
  | { type: "XP"; amount: number }
  | { type: "REPUTATION"; faction: FactionId; amount: number }
  | { type: "SALVAGE"; material: MaterialId; amount: number; quality: Quality }
  | { type: "BLUEPRINT_FRAGMENT"; blueprintId: string; count: number }
  | { type: "MODULE"; moduleId: string; quality: Quality }
  | { type: "RIG_SLOT_UNLOCK"; rigClass: RigClass }
  | { type: "BLUEPRINT_FRAGMENT"; blueprintId: string; count: number }
  | { type: "REPUTATION"; faction: FactionId; amount: number }
  | { type: "COSMETIC"; cosmeticId: string }
  | { type: "RIG_SLOT_UNLOCK"; rigClass: RigClass; slotType: SlotType };
```

### Reward Scaling

```
Base Reward = BaseValue × DifficultyMultiplier × QualityMultiplier
Bonus Reward = BaseReward × BonusMultiplier × MasteryFactor
```

**Difficulty Multipliers:**

| Tier       | Multiplier | XP  | Credits | Salvage     |
| ---------- | ---------- | --- | ------- | ----------- |
| Trivial    | 0.5x       | 25  | 50      | Common×1    |
| Easy       | 0.75x      | 50  | 100     | Common×2    |
| Normal     | 1.0x       | 100 | 250     | Uncommon×1  |
| Hard       | 1.5x       | 200 | 500     | Rare×1      |
| Extreme    | 2.5x       | 400 | 1200    | Epic×1      |
| Impossible | 4.0x       | 800 | 3000    | Legendary×1 |

**Quality Multipliers:** Common 1.0x, Uncommon 1.25x, Rare 1.5x, Epic 2.0x, Legendary 2.5x

**Bonus Multipliers:**

| Condition               | Multiplier |
| ----------------------- | ---------- |
| Time bonus (< 50% time) | 1.25x      |
| No damage taken         | 1.25x      |
| Stealth (undetected)    | 1.5x       |
| All optional objectives | 1.5x       |
| First completion        | 1.25x      |

---

## Mission Generation Algorithm

```typescript
function generateMission(context: GenerationContext): Mission {
  // 1. Select mission type based on weights
  const type = selectMissionType(context);

  // 2. Select template from pool
  const template = selectTemplate(type, context.playerProgress);

  // 3. Determine difficulty
  const difficulty = calculateDifficulty(context);

  // 3. Generate objectives from template
  const objectives = generateObjectives(template, difficulty, context);

  // 4. Select spawn points (POI graph + navmesh validation)
  const spawnData = generateSpawnData(objectives, context.region);

  // 4. Calculate rewards
  const rewards = calculateRewards(template, difficulty, context);

  // 5. Validate (reachability, no conflicts, reward balance)
  if (!validateMission(mission)) return regenerate();

  return mission;
}
```

**Deterministic Generation:** All generation uses seeded PRNG from `worldSeed + missionId + playerProgressHash` for reproducibility.

---

## UI/UX Integration

### Mission Board UI

- **Available Missions:** Filtered by region, rig compatibility, player level
- **Active Mission:** Progress tracker, objective list, waypoint markers
- **Mission Log:** History, replayable missions, statistics

### Map Integration

- Mission markers on world map (region, waypoints, POIs)
- Active mission: highlighted route, dynamic waypoint updates
- Completed: faded, archived

### HUD Integration

- Active objective: current target, distance, direction
- Optional objectives: greyed out, bonus indicator
- Timer: visible when time-limited

---

## Open Items / TODOs

| Item                                     | Priority | Status  |
| ---------------------------------------- | -------- | ------- |
| Finalize mission type roster & weights   | High     | Draft   |
| Objective type implementations           | High     | Partial |
| Reward tables & scaling curves           | High     | Draft   |
| Procedural generation determinism        | High     | Design  |
| Mission validation pipeline              | High     | Design  |
| Dynamic difficulty adjustment            | Medium   | Design  |
| Mission chaining / campaigns             | Medium   | Design  |
| Failure state handling (partial rewards) | Medium   | Draft   |
| Dynamic world state reactions            | Medium   | Design  |
| Replayable mission scaling               | Low      | Backlog |

---

## Related Documents

- `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` — Overall architecture
- `PROGRESSION_SYSTEM.md` — XP, rungs, restoration arc
- `ECONOMY_SYSTEM.md` — Rewards, salvage, markets
- `VEHICLE_PROGRESSION.md` — Mission rewards → rig upgrades
- `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` — Overall architecture

---

## Current Implementation Evidence

The current checkout contains an open runtime foundation, not a final product decision:

- `src/game/progression.ts` provides pure account-XP, rung, and per-rig restoration functions.
- `src/game/mission-propositions.ts` derives delivery, recovery, survey, and expedition propositions through a generator registry.
- `src/game/mission-resolver.ts` applies mission rewards and bridges canonical activity rewards into progression.
- `src/game/activities.ts` is the reward authority for the existing cargo-relay and survey-route activities.
- `GameState.progression` is persisted under save schema v9; v8 and earlier records default missing progression and remain readable.
- `publicState()` exposes derived XP, level, rung, and restoration stage data for operator/UI surfaces.

The remaining product gate is reconciliation with ADR-0018 and runtime admission of a mission board/acceptance surface. Do not describe universal XP as accepted product direction until that decision is explicitly resolved.

---

_Generated: 2026-07-28 | Project: rigs-unbound | Status: Design + runtime foundation_

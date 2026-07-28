# Vehicle Progression System

**Project:** rigs-unbound
**Version:** 0.1.0 (Exploratory)
**Last Updated:** 2026-07-28
**Status:** Design Phase

---

## Overview

The Vehicle Progression System defines how rigs evolve over the player's journey. It spans four mechanical layers (modules, workshop physics, component wear, salvage crafting) and a fleet recovery safety net, all built on the actual code structures in `src/game/`.

The restoration arc (visual/mechanical stage progression per rig) is covered in `PROGRESSION_SYSTEM.md`; this document focuses on the **technical systems** that realise progression through play.

---

## 1. Module System (`src/game/contracts.ts`)

### Module Architecture

Modules are the primary upgrade layer. Each module is a physical part that expands the terrain envelope rather than delivering stat-bump numbers (ADR-0007).

```typescript
export interface ModuleDefinition {
  id: ModuleId;
  name: string;
  promise: string; // What the player can newly do
  cost: number; // Salvage cost in workshop
  fits: readonly RigId[]; // Compatibility matrix
  grantsCapability?: RigCapability;
  effects: Partial<{
    enginePower: number; // Multiplicative
    lowSpeedTorque: number;
    topSpeed: number;
    tireGrip: number;
    lugBonus: number;
    towSpeedMultiplier: number;
    landingTolerance: number;
    fordDepth: number;
    suspensionStiffness: number;
  }>;
  offsets?: Partial<{
    lugBonus: number; // Additive
    fordDepth: number;
    surveyRange: number;
  }>;
}
```

### Existing Modules

| Module             | Cost | Effect                                                      | Grants Capability | Fits           |
| ------------------ | ---- | ----------------------------------------------------------- | ----------------- | -------------- |
| Low-range gearing  | 6    | `enginePower ×1.5`, `lowSpeedTorque ×3.8`, `topSpeed ×0.86` | —                 | Tractor, Buggy |
| Lug tyres          | 5    | `tireGrip ×1.06`, `lugBonus +0.34`                          | —                 | Tractor, Buggy |
| Recovery winch     | 8    | `towSpeedMultiplier ×1.14`                                  | `winch`           | Tractor, Buggy |
| Survey mast        | 7    | `surveyRange +62m`                                          | `survey`          | Tractor, Buggy |
| Skid plate         | 5    | `landingTolerance ×1.7`, `suspensionStiffness ×1.08`        | —                 | Tractor, Buggy |
| Flotation pontoons | 9    | `fordDepth +1.9m`                                           | `ford`            | Tractor, Buggy |

### Compatibility Matrix

Only `utility-tractor` and `toy-buggy` have module slots currently. `marsh-skimmer` is a hovercraft and does not share the same socket system.

### Module Composition (`effectiveProfile`)

```typescript
function effectiveProfile(rigId: RigId, modules: ModuleId[]): EffectiveRig;
```

This pure function composes module effects onto the base `RIG_PROFILES` blueprint:

1. Copies the base profile
2. Iterates installed modules, filtering by `definition.fits.includes(rigId)`
3. Applies multiplicative `effects`
4. Applies additive `offsets`
5. Collects granted capabilities into a Set

**Key property:** The composition is deterministic and stateless. Save records store only a module ID list; `effectiveProfile` reproduces identical handling every time.

### Future Modules

| Module                    | Effect                                               | Unlock Rung |
| ------------------------- | ---------------------------------------------------- | ----------- |
| Auxiliary fuel tank       | `fordDepth +0.5` (extended range)                    | 1           |
| Reinforced chassis        | `landingTolerance ×2.0`, `suspensionStiffness ×1.15` | 2           |
| High-clearance suspension | `rideHeight +0.3`, `suspensionTravel ×1.25`          | 2           |
| Heavy-duty winch          | `towSpeedMultiplier ×1.3`                            | 3           |
| Terrain scanner           | `surveyRange +100m` (rung 3 unlock)                  | 3           |
| Skimmer upgrade kit       | `hover clearance +0.5m`, `mobilityAdapter: hover`    | 3           |

---

## 2. Workshop Physics (`src/game/workshop-lab.ts`)

### Chassis Mass Distribution

The workshop system computes how module installations affect the rig's centre of mass, rotational inertia, and rollover risk:

```typescript
interface ChassisMassDistribution {
  totalMassKg: number;
  centerOfMassOffset: { x: number; y: number; z: number };
  yawInertiaKgM2: number;
  rolloverRisk: number; // 0..1
}
```

### Computation

```typescript
function computeChassisMassDistribution(
  baseProfile: RigProfile,
  fittedModuleIds: readonly ModuleId[],
): ChassisMassDistribution;
```

- Base mass from `RigProfile.mass` (in tonnes), converted to kg
- Each module adds 85kg
- Socket location biases per module:
  - **Survey mast:** Top rear (+y, -z) — raises CG, shifts weight rearward
  - **Winch:** Front low (-z, low y) — lowers CG, shifts weight forward
- **CG height** capped to [0.2, 1.5] metres
- **Yaw inertia** computed from total mass and longitudinal offset
- **Rollover risk** derived from CG height ÷ track width (1.8m nominal)

### Gameplay Consequences

| Stat                   | Effect                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| `centerOfMassOffset.y` | Higher = more pitch/roll, more rollover risk, softer suspension feel                       |
| `centerOfMassOffset.z` | Positive = rear-heavy (traction under accel), negative = front-heavy (understeer tendency) |
| `yawInertiaKgM2`       | Higher = slower to rotate, more stable in turns                                            |
| `rolloverRisk`         | Higher = more likely to tip on camber; affects map routing decisions                       |

### Workshop Actions

| Action               | Effect                                      | Materials              |
| -------------------- | ------------------------------------------- | ---------------------- |
| Install module       | Adds module to fittedModuleIds              | Module cost in salvage |
| Remove module        | Removes from fitted list                    | None (free)            |
| Compute distribution | Triggers `computeChassisMassDistribution()` | On install/remove      |

---

## 3. Component Wear & Maintenance (`src/game/vehicle-maintenance.ts`)

### Component Health Model

Four tracked components degrade from field use. The model is diegetic — each component fails for a physically legible reason:

```typescript
interface ComponentHealthState {
  tireTreadHealthPercent: number; // 0..100
  radiatorCleanlinessPercent: number; // 0..100 (100 = clean)
  winchCableIntegrityPercent: number; // 0..100
  alternatorBeltHealthPercent: number; // 0..100
}
```

### Wear Functions

**`updateComponentWear`** — called each tick while the rig is moving:

| Component            | Wear Rate                 | Special Conditions                                               |
| -------------------- | ------------------------- | ---------------------------------------------------------------- |
| Tyre tread           | 0.8% per km travelled     | —                                                                |
| Radiator cleanliness | 0.05 per km (0.05 in mud) | +1.5 per km while fording mud (mud clogging)                     |
| Winch cable          | 0 baseline                | +2.5 per unit tension above 20kN, scaling to tension/35000 × 2.5 |
| Alternator belt      | 0.2% per km travelled     | —                                                                |

**`performFieldRepair`** — restore a single component by 35% (adjustable):

```typescript
function performFieldRepair(
  current: ComponentHealthState,
  componentKey: keyof ComponentHealthState,
  repairAmountPercent = 35,
): ComponentHealthState;
```

### Consequences of Wear

| Component       | Below 25%                       | Below 10% (Critical)                   |
| --------------- | ------------------------------- | -------------------------------------- |
| Tyre tread      | Reduced grip on loose terrain   | Flat tyre — mobility severely reduced  |
| Radiator        | Overheating on sustained climbs | Engine damage risk                     |
| Winch cable     | Reduced max tension             | Snaps under load                       |
| Alternator belt | Diminished electrical           | Total electrical failure, engine stall |

### Repair Actions

| Action            | Where       | Cost                    | Effect                          |
| ----------------- | ----------- | ----------------------- | ------------------------------- |
| Field repair      | Anywhere    | 10 Scrap per component  | Restores 35% of one component   |
| Workshop overhaul | Drift Berth | 50 Scrap + 2 Microchips | Restores all components to 100% |
| Parts replacement | Workshop    | Module-dependent        | Full restoration of component   |

---

## 4. Salvage Crafting (`src/game/salvage-crafting.ts`)

### Blueprint Assembly

Modules are not found complete — they are crafted from collected salvage commodities:

```typescript
interface CraftingRecipe {
  outputModuleId: string;
  name: string;
  requiredMaterials: Record<CommodityType, number>;
}
```

### Existing Recipes

| Output Module         | Name                | Steel Scrap | Microchips | Fuel Cell Core |
| --------------------- | ------------------- | ----------- | ---------- | -------------- |
| `winch`               | Winch Assembly      | 4           | 2          | 0              |
| `survey-mast`         | Survey Mast Antenna | 3           | 4          | 0              |
| `auxiliary-fuel-tank` | Auxiliary Fuel Tank | 2           | 0          | 1              |

### Crafting Flow

```
Player collects salvage → Inventory updated → Workshop screen
                                                  ↓
                                          Select recipe
                                                  ↓
                              canCraftRecipe(recipe, inventory)?
                                      ┌──────┴──────┐
                                     YES            NO
                                      ↓              ↓
                               craftRecipe()    Insufficient
                                      ↓         materials prompt
                              Module created
                              Inventory deducted
                              Module available to install
```

### Commodity Types (`src/game/expedition-economy.ts`)

| Commodity        | Source                     | Rarity   | Primary Use       |
| ---------------- | -------------------------- | -------- | ----------------- |
| `steel-scrap`    | Salvage, wrecks            | Common   | Basic crafting    |
| `microchips`     | Electronics salvage, ruins | Uncommon | Advanced modules  |
| `fuel-cell-core` | Rare salvage, rewards      | Rare     | Auxiliary systems |

---

## 5. Fleet Recovery (`src/game/fleet-recovery.ts`)

### Tandem Tow System

When a rig is stuck (bottomed out, rolled, flooded), a second rig can perform a tandem tow recovery:

```typescript
interface TandemTowConnection {
  leadRigId: string;
  supportRigId: string;
  strapRestLengthM: number;
  currentDistanceM: number;
  strapTensionN: number;
  combinedTractiveForceN: number;
  isStrapConnected: boolean;
}
```

### Recovery Physics

1. **`createTandemTowConnection(lead, support, restLength?):`** Initialises a tow strap (default 8m rest length)
2. **`updateTandemTowPhysics(connection, distance, leadForce, supportForce, stiffness?):`** Updates each physics tick:
   - `stretchM = max(0, currentDistance - restLength)`
   - `strapTension = stretchM × stiffness` (default 4500 N/m)
   - `combinedTractiveForce = leadForce + min(supportForce, strapTension)`

### Progression Link

| Upgrade                       | Effect on Recovery                         |
| ----------------------------- | ------------------------------------------ |
| Winch module                  | Enables `winch` capability                 |
| Heavy-duty winch              | Higher stiffness or combined force cap     |
| Tandem tow                    | Both rigs' tractive force summed           |
| Tracked/ground rig as support | Higher support rig tractive force vs hover |

### Recovery States

| State              | Condition                                         | Player Action            |
| ------------------ | ------------------------------------------------- | ------------------------ |
| Stuck              | speed ≈ 0, rig tilted > 30°, or water > fordDepth | Deploy recovery          |
| Self-recovery      | Winch equipped, anchor nearby                     | Use winch                |
| Tandem tow         | Two rigs in range (≤ 8m + stretch)                | Connect strap            |
| Emergency recovery | Manual override in pause menu                     | Costs salvage × behavior |

---

## 6. Progression Integration

### Module Unlock Flow

```
Player earns XP → Rung threshold crossed
                        ↓
              New blueprint tier unlocked
                        ↓
         Blueprint fragments appear in salvage
                        ↓
         Player collects required commodities
                        ↓
         Craft module at workshop (salvage-crafting)
                        ↓
         Install module on rig (workshop-lab)
                        ↓
         effectiveProfile() recomputes handling
```

### Restoration Stage ↔ Module Slot Gating

| Restoration Stage | Module Slots | Accessible Rigs         |
| ----------------- | ------------ | ----------------------- |
| 0: Scavenged      | 1            | Starting rig only       |
| 1: Patched        | 2            | Tractor + Buggy         |
| 2: Functional     | 2            | All three rigs          |
| 3: Reliable       | 3            | All three rigs          |
| 4: Custom         | 4            | All three rigs          |
| 5: Masterwork     | Max          | All three rigs + unique |

### Wear → Restoration Feedback

Component wear cannot be eliminated until Restoration Stage 3 (Reliable):

- **Stage 0-2:** Field repairs only; components degrade faster
- **Stage 3+:** Workshop overhauls available; component degradation rate halved
- **Stage 5:** Masterwork components never degrade below 75%

---

## 7. Data Flow Diagram

```
                         ┌──────────────────────┐
                         │  Player Earns XP      │
                         │  (missions, salvage,  │
                         │   discoveries)        │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Rung Threshold       │
                         │  Check                │
                         │  (every level up)     │
                         └──────────┬───────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    ▼                               ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │  Blueprint Tier       │        │  Module Slot          │
        │  Unlocked             │        │  Unlocked             │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │                               │
                   ▼                               ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │  Salvage Collection   │        │  Module Installation  │
        │  (commodities)        │        │  (workshop-lab)       │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │                               │
                   ▼                               ▼
        ┌──────────────────────┐        ┌──────────────────────┐
        │  Craft Module         │        │  Mass Distribution    │
        │  (salvage-crafting)   │        │  (workshop-lab)       │
        └──────────┬───────────┘        └──────────┬───────────┘
                   │                               │
                   └───────────────┬───────────────┘
                                   ▼
                        ┌──────────────────────┐
                        │  effectiveProfile()   │
                        │  (contracts.ts)       │
                        │  → Updated handling   │
                        └──────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Field Use → Wear     │
                        │  (vehicle-maintenance)│
                        └──────────┬───────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │  Repair / Overhaul    │
                        │  Field or Workshop    │
                        └──────────────────────┘
```

---

## 8. Open Items

| Item                                  | Priority | Status  |
| ------------------------------------- | -------- | ------- |
| Module slot unlock per rig class      | High     | Design  |
| Blueprint fragment drop rates         | High     | Pending |
| Workshop UI (module install/remove)   | High     | Pending |
| Component degradation visual feedback | High     | Pending |
| Field repair animation/sound          | Medium   | Pending |
| Marsh-skimmer module compatibility    | Medium   | Design  |
| Tandem tow visual (strap rendering)   | Medium   | Pending |
| Emergency recovery cost balance       | Low      | Design  |
| Module socket locations per rig class | Low      | Design  |

---

## 9. Related Documents

- `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` — Overall architecture
- `PROGRESSION_SYSTEM.md` — Restoration arc, XP, rungs
- `ECONOMY_SYSTEM.md` — Resources, salvage commodities
- `MISSION_SYSTEM_DESIGN.md` — Rewards that supply salvage/commodities

---

_Generated: 2026-07-28 | Project: rigs-unbound | Status: Design Phase_

# Gameplay Systems Architecture

**Project:** rigs-unbound  
**Version:** 0.1.0 (Exploratory)  
**Last Updated:** 2026-07-27  
**Status:** Design Phase — Core Systems In Development

---

## Overview

rigs-unbound is a vehicle-centric exploration and restoration game where players operate customizable rigs across a procedurally generated world. The core loop revolves around **driving, discovering, salvaging, restoring, and upgrading** vehicles to tackle increasingly challenging expeditions.

The architecture follows a **systems-based ECS-lite pattern** with clear separation between:
- **Simulation** (physics, vehicle dynamics, world state)
- **Presentation** (rendering, camera, UI)
- **Gameplay Systems** (missions, progression, economy, vehicles)

---

## Core Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME WORLD                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   TERRAIN    │  │   ENTITIES   │  │   WORLD STATE        │  │
│  │  (heightmap, │  │  (rigs,      │  │  (time, weather,     │  │
│  │   biomes,    │  │   cargo,     │  │   events, sites,     │  │
│  │   resources) │  │   salvage)   │  │   weather, time)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          ▼                 ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SIMULATION LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   PHYSICS    │  │   VEHICLE    │  │   WORLD SIMULATION     │  │
│  │  (Rapier)    │  │  (dynamics,  │  │  (time, weather,      │  │
│  │  (rigid body,│  │   suspension,│  │   events, day/night,  │  │
│  │   collision) │  │   traction)  │  │   weather, seasons)   │  │
│  └──────────────┘  └──────┬───────┘  └──────────┬────────────┘  │
└───────────────────────────┼──────────────────────┼──────────────┘
                            │                      │
                            ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GAMEPLAY SYSTEMS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐  │
│  │   MISSIONS   │  │  PROGRESSION │  │ ECONOMY  │  │ VEHICLE│  │
│  │  (procedural,│  │  (XP, unlocks,│  │ (cargo,  │  │ (rigs, │  │
│  │   campaigns) │  │   restoration)│  │ salvage, │  │ modules,│  │
│  │              │  │               │  │ markets) │  │ upgrades)│  │
│  └──────────────┘  └──────────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────┐  ┌────────┐  │
│  │   RENDERER   │  │   CAMERA     │  │    UI    │  │ AUDIO  │  │
│  │ (Three.js,   │  │  (6 policies)│  │ (field   │  │ (engine│  │
│  │  post-proc)  │  │              │  │  kit,     │  │  voice,│  │
│  │              │  │              │  │  HUD)    │  │  amb.) │  │
│  └──────────────┘  └──────────────┘  └──────────┘  └────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## System Definitions

### 1. Mission System (`procedural-missions.ts`, `campaign.ts`)

**Responsibility:** Generate, track, and complete objectives.

**Key Concepts:**
- **Mission Types:** Delivery, Salvage, Survey, Recovery, Escort, Survey
- **Mission States:** Available → Active → Completed/Failed → Rewarded
- **Procedural Generation:** Seeded from world seed + player progress
- **Rewards:** Currency, XP, Blueprint Fragments, Reputation, Unique Modules

**Data Flow:**
```
World Seed + Player Progress → Mission Generator → Mission Object
                                    ↓
                            UI Presents Options
                                    ↓
                            Player Accepts → Active Mission
                                    ↓
                            World Tracks Progress
                                    ↓
                            Completion → Rewards + Progression
```

### 2. Progression System (`first-rung.ts`, `campaign.ts`)

**Responsibility:** Track player advancement, unlock content, manage restoration arc.

**Key Concepts:**
- **Experience (XP):** Earned from missions, discoveries, restoration milestones
- **Rungs/Tiers:** Progressive unlock gates (First Rung → ... → Master)
- **Restoration Arc:** Visual + mechanical progression from dilapidated → pristine
- **Module Unlocks:** New attachment types, tools, cosmetics

**Restoration Arc Stages:**
```
Stage 0: Dilapidated (rust, missing parts, limited function)
    ↓ XP + Parts
Stage 1: Functional (runs, basic capability, visible repairs)
    ↓ XP + Parts + Blueprint
Stage 2: Reliable (reliable, upgraded systems, cosmetic improvement)
    ↓ XP + Rare Parts + Blueprint
Stage 3: Masterwork (optimized, unique modules, visual flair)
```

### 3. Economy System (`expedition-economy.ts`, `salvage-crafting.ts`)

**Responsibility:** Resource flows, markets, crafting, cargo logistics.

**Resources:**
| Category | Examples | Source | Sink |
|----------|----------|--------|------|
| **Currency** | Credits, Scrip | Missions, sales | Purchases, repairs |
| **Raw Materials** | Scrap, Ore, Crystals | Salvage, mining | Crafting, upgrades |
| **Processed** | Plates, Circuits, Fuel | Crafting, refining | Upgrades, fuel |
| **Special** | Blueprints, Artifacts, Data | Missions, ruins | Unlocks, research |

**Markets:**
- **Local Markets:** Per-settlement buy/sell prices, supply/demand
- **Traveling Merchants:** Rare goods, blueprints, exotic modules
- **Player-to-Player:** Direct trade, fleet contracts

### 4. Vehicle Progression (`first-rung.ts`, `workshop-lab.ts`, `vehicle-maintenance.ts`)

**Responsibility:** Vehicle customization, restoration, module management.

**Rig Architecture:**
```
Rig (Entity)
├── Chassis (base stats: mass, hardpoints, wheel config)
├── Powertrain (engine, transmission, fuel type)
├── Suspension (springs, dampers, travel, ground clearance)
├── Wheels/Treads (type, size, traction profile)
├── Modules (slots: utility, weapon, tool, cargo, sensor)
├── Cosmetic (paint, decals, wear, decals, lighting)
└── Condition (wear, damage, repair history)
```

**Module System:**
| Slot Type | Examples | Effects |
|-----------|----------|---------|
| **Powertrain** | Engine, Transmission, Turbo | Speed, torque, fuel efficiency |
| **Suspension** | Springs, Shocks, Active | Load capacity, comfort, travel |
| **Utility** | Winch, Crane, Drill, Scanner | New verbs, capabilities |
| **Weapon** | Mount, Turret, Launcher | Combat, defense |
| **Sensor** | Radar, Lidar, Thermal, Sonar | Detection range, modes |
| **Cargo** | Container, Tank, Hopper | Capacity, specialized storage |
| **Utility** | Winch, Plow, Crane, Scanner | New verbs, world interaction |

**Restoration Arc (per rig):**
```
Stage 0: Scavenged (rust, missing panels, barely runs)
    ↓ 100 XP + Scrap ×50
Stage 1: Patched (runs, leaks oil, smoke, 1 module slot)
    ↓ 500 XP + Scrap×200 + Plate×20
Stage 2: Reliable (clean, 2 slots, no leaks)
    ↓ 1000 XP + Plate×50 + Circuit×10
Stage 3: Custom (3 slots, paint, decals, tuning)
    ↓ 2500 XP + Rare Parts + Blueprint
Stage 4: Masterwork (unique module, signature paint, max slots)
```

### 5. Campaign System (`campaign.ts`)

**Responsibility:** Structured narrative progression, world state evolution.

**Structure:**
```
Campaign → Acts → Missions → Objectives
    │
    └─ World State Changes (unlocks regions, events, NPCs)
```

**Campaign State:**
- **Act Progress:** 0-100% per act
- **World Flags:** Key events triggered, NPCs met, regions unlocked
- **Legacy Choices:** Persistent consequences of major decisions

---

## System Interactions

### Mission → Economy
```
Complete Mission → Credits + Salvage + Blueprint Fragment
                              ↓
                    Sell Salvage → Credits + Materials
                              ↓
                    Buy Modules/Fuel/Repairs → Better Rig
                              ↓
                    Tougher Missions → Better Rewards
```

### Progression → Vehicle
```
Earn XP → Level Up → Unlock Module Slot / Blueprint
                              ↓
                    Install Module → New Capability
                              ↓
                    Access New Mission Types / Regions
```

### Economy → Progression
```
Salvage High-Value → Sell → Credits
                              ↓
                    Buy Blueprint / Rare Parts
                              ↓
                    Restore Rig Stage → Unlock Module Slot
                              ↓
                    Access Better Missions
```

---

## Data Ownership

| System | Owns | Exposes (Read) | Mutates (Write) |
|--------|------|----------------|-----------------|
| **Physics** | Rigid bodies, collision shapes | Positions, velocities | Forces, impulses |
| **Vehicle** | Rig state, modules, condition | Rig specs, module effects | Module install/remove, repair |
| **Missions** | Mission definitions, progress | Available missions, progress | Accept/complete/fail |
| **Progression** | XP, rungs, unlocks, restoration | XP, unlocked content | Award XP, grant unlocks |
| **Economy** | Currency, inventory, market prices | Prices, inventory, orders | Transactions, crafting |
| **Campaign** | World flags, act progress | Flags, progress | Set flags, advance acts |
| **Vehicle** | Rig entities, modules, condition | Rig specs, module list | Module install, repair, wear |

---

## Communication Patterns

| Pattern | Used For | Example |
|---------|----------|---------|
| **Direct Calls** | Same-frame, deterministic | Physics → Vehicle dynamics |
| **Events** | Cross-system, async | Mission complete → Economy reward |
| **Queries** | Read-only, frequent | UI → Vehicle specs |
| **Commands** | Intent, validation | UI → Vehicle: "Install Module" |

---

## Persistence

| Data | Scope | Serialization |
|------|-------|---------------|
| **Player Profile** | Global | JSON (localStorage / cloud) |
| **Vehicle Fleet** | Per-profile | JSON (compressed) |
| **Mission Progress** | Per-campaign | JSON (incremental) |
| **World State** | Per-save | Binary (compressed) |
| **Progression** | Per-profile | JSON (incremental) |

---

## Open Items / TODOs

| Item | Priority | Status |
|------|----------|--------|
| Mission type definitions & reward tables | High | Draft |
| Progression XP curve & rung thresholds | High | Draft |
| Economy resource definitions & recipes | High | Draft |
| Vehicle module slot layout per chassis | High | Draft |
| Restoration arc visual milestones | Medium | Concept |
| Campaign act structure & world flags | Medium | Outline |
| Save/load serialization format | High | Design |
| Multiplayer/fleet sync architecture | Low | Deferred |

---

## Related Documents

- `MISSION_SYSTEM_DESIGN.md` — Mission types, generation, rewards
- `PROGRESSION_SYSTEM.md` — XP, rungs, restoration arc
- `ECONOMY_SYSTEM.md` — Resources, markets, crafting
- `VEHICLE_PROGRESSION.md` — Rig architecture, modules, restoration
- `MISSION_SYSTEM_DESIGN.md` — Mission types, generation, rewards
- `PROGRESSION_SYSTEM.md` — XP, rungs, restoration arc
- `ECONOMY_SYSTEM.md` — Resources, markets, crafting
- `VEHICLE_PROGRESSION.md` — Rig architecture, modules, restoration

---

## Current Implementation Evidence

The gameplay-system foundation now has a concrete runtime boundary:

- Account and per-rig progression are namespaced under `GameState.progression`.
- Save schema v9 persists progression; v8 and earlier saves migrate with safe defaults.
- Existing activity definitions remain the canonical reward source.
- Mission propositions are derived through a generator registry rather than persisted as a quest table.
- The reward resolver bridges both new mission propositions and existing activity completions.
- Public runtime state exposes derived progression views without duplicating authoritative state.

The architecture is intentionally still open. ADR-0033 is Proposed and must be reconciled with ADR-0018 before universal XP/rungs are treated as accepted product direction.

---

*Generated: 2026-07-28 | Project: rigs-unbound | Status: Design + runtime foundation*
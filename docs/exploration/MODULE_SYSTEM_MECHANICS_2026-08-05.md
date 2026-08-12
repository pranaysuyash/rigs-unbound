# Module System Mechanics — How Modules Attach, Modify, and Interact

**Date:** 2026-08-05
**Status:** design exploration; not an accepted ADR
**Evidence tier:** Tier 1 synthesis of master catalog, rig generation docs, capability model, and renderer capabilities
**Depends on:** Master Vehicle Catalog, Rig Generation for Infinite Possibilities, Capability Contract

---

## 1. The problem this solves

Modules are the physical attachments that modify a rig's capabilities. The master catalog defines hardpoints per vehicle. The rig generation docs define modules as "context-driven attachments." But neither specifies **how modules actually work mechanically** — how they attach, how they modify behavior, how they interact with contexts, and how they're managed at runtime.

Without this mechanics layer, modules are either:
- Stat modifiers (breaks the "physical machine" promise)
- Menu-equipped items (breaks the "immersive world" promise)
- Undefined (blocks implementation)

---

## 2. What already exists

### Master catalog hardpoints
From `docs/exploration/MASTER_VEHICLE_CATALOG.md`:
- Each vehicle has 2-4 hardpoints (rear hitch, front tow eye, roof beacon, side tool plate, etc.)
- Hardpoints are physical locations on the rig
- Different vehicles have different hardpoint configurations

### Loadout families
From `docs/exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md`:
- 23 loadout types: work lights, roof beacon, floodlights, brush guard, plow, seeder, trailer, winch, crane arm, drill mast, salvage claw, storage racks, battery pack, generator, siren bar, flare launcher, search mast, radar mast, thermal mast, shield plates, side rails, turret, tool racks, rescue stretchers

### Capability model
From `docs/exploration/EXPLORATION_MAP.md`:
- Capability-first data model (not inheritance tree)
- VehicleBlueprint (immutable) → VehicleInstance (mutable) → capability envelope (derived)
- No renderer, physics, or filename identity in durable state

### Rig generation
From `docs/research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md`:
- 3-layer architecture: archetype DNA + variant generation + context adaptation
- Modules are "context-driven attachments" that modify capabilities

---

## 3. Module anatomy

Every module has:

### 3.1 Physical properties

```text
Module {
  id: string                    // unique identifier
  name: string                  // human-readable name
  category: ModuleCategory      // what type of module
  slot: HardpointSlot           // where it attaches
  mesh: AssetRef                // GLB model reference
  mass: number                  // kg, affects rig weight distribution
  volume: number                // m³, affects cargo space
  power: number                 // watts, affects energy consumption
  damage: number                // HP, can be damaged/destroyed
  maintenance: MaintenanceCost  // what it needs to stay functional
}
```

### 3.2 Capability modifications

```text
ModuleCapabilities {
  grants: Capability[]          // what the rig can now do
  imposes: Tradeoff[]           // what the rig loses or pays
  modifies: VerbModifier[]      // how existing verbs change
  requires: Requirement[]       // what the rig needs to use this module
  incompatible: ModuleId[]      // what modules can't coexist
}
```

### 3.3 Visual properties

```text
ModuleVisual {
  attachPoint: Vector3          // where on the rig
  attachRotation: Euler         // how it's oriented
  scale: Vector3                // size multiplier
  color: Color                  // tint (optional)
  animation: AnimationClip      // how it moves (optional)
  effects: ParticleEffect[]     // visual effects (optional)
}
```

---

## 4. The hardpoint system

### 4.1 Hardpoint definition

Every rig has hardpoints — physical locations where modules can attach:

```text
Hardpoint {
  id: string                    // unique identifier
  slot: HardpointSlot           // what type of module fits here
  position: Vector3             // where on the rig
  rotation: Euler               // how it's oriented
  capacity: number              // max mass/volume this point supports
  powered: boolean              // does this point provide power?
  visible: boolean              // is this point visible when empty?
}
```

### 4.2 Hardpoint slots

Hardpoint slots are types, not specific locations:

```text
HardpointSlot =
  | "front-utility"     // tow eyes, push bumpers, plows, brush guards
  | "rear-utility"      // hitches, winches, trailers, cranes
  | "roof-utility"      // beacons, floodlights, search masts, radar
  | "side-utility"      // tool plates, shield plates, storage racks
  | "internal"          // generators, batteries, fuel tanks
  | "cargo"             // cargo beds, containers, specialized holds
  | "weapon"            // turrets, flare launchers, sonic deterrents
  | "sensor"            // thermal masts, radar, sonar, cameras
```

### 4.3 Hardpoint capacity

Each hardpoint has a capacity limit:

```text
Torque-70 hardpoints:
  front-utility: 200kg, 0.5m³
  rear-utility: 500kg, 1.0m³
  roof-utility: 50kg, 0.2m³
  side-utility: 100kg, 0.3m³

If a module exceeds capacity:
  - Cannot attach
  - Must find a rig with larger hardpoints
  - Or upgrade the hardpoint (if upgrade system exists)
```

---

## 5. Module attachment

### 5.1 Attachment process

Modules attach through physical interaction, not menus:

```text
Workshop attachment:
1. Rig enters workshop
2. Player selects hardpoint
3. Available modules shown (from inventory)
4. Player selects module
5. Module is physically placed on hardpoint
6. Visual confirmation (module appears on rig)
7. Capability envelope recalculated
8. Rig is ready to leave workshop

Field attachment (earned capability):
1. Module is nearby (dropped, salvaged, delivered)
2. Rig approaches module
3. Affordance appears (attach prompt)
4. Player initiates attachment
5. Physical animation (module lifts, aligns, clicks)
6. Capability envelope recalculated
```

### 5.2 Attachment constraints

Not every module fits every hardpoint:

```text
Constraint checks:
1. Slot compatibility: does the module's slot match the hardpoint's slot?
2. Capacity check: does the module's mass/volume fit the hardpoint's capacity?
3. Power check: does the hardpoint provide enough power for the module?
4. Incompatibility check: does the module conflict with existing modules?
5. Weight distribution: does the module unbalance the rig?
6. Context check: is this module appropriate for the current context?
```

### 5.3 Detachment process

Modules detach through physical interaction:

```text
Workshop detachment:
1. Rig enters workshop
2. Player selects hardpoint with module
3. Player selects detach
4. Module is physically removed
5. Module goes to inventory
6. Capability envelope recalculated

Field detachment (emergency):
1. Module is damaged beyond repair
2. Module detaches automatically (falls off)
3. Module is lost or becomes salvage
4. Capability envelope recalculated
```

---

## 6. Module effects on gameplay

### 6.1 Capability grants

Modules grant new capabilities:

```text
Winch module:
  grants: ["tow-heavy", "self-recover", "anchor"]
  - tow-heavy: can pull objects heavier than base rig capacity
  - self-recover: can pull itself out of mud/water
  - anchor: can stabilize other rigs or structures

Plow module:
  grants: ["cultivate", "clear-debris", "grade-terrain"]
  - cultivate: can prepare soil for planting
  - clear-debris: can push obstacles off routes
  - grade-terrain: can smooth rough ground

Floodlight module:
  grants: ["illuminate", "signal", "deter"]
  - illuminate: can light dark areas
  - signal: can communicate with other rigs
  - deter: can scare away threats
```

### 6.2 Tradeoffs imposed

Every module imposes costs:

```text
Winch module:
  imposes: ["weight+50kg", "power-100W", "front-clearance-0.2m"]
  - weight: rig is heavier, slower acceleration
  - power: rig has less power for other systems
  - front-clearance: rig can't fit through narrow gaps

Plow module:
  imposes: ["weight+200kg", "width+1.5m", "turning-radius+2m"]
  - weight: rig is much heavier
  - width: rig can't fit through narrow spaces
  - turning-radius: rig turns wider

Floodlight module:
  imposes: ["power-200W", "night-vision-glare"]
  - power: rig has significantly less power
  - glare: blinds the player at night if pointed at camera
```

### 6.3 Verb modifications

Modules change how existing verbs work:

```text
Base verb: "haul"
  Without module: can pull up to base capacity
  With winch: can pull up to 3x base capacity
  With trailer: can carry 2x cargo, but slower
  With crane: can lift and place cargo, not just pull

Base verb: "drive"
  Without module: standard handling
  With snow chains: better traction on ice
  With pontoon: can float on water
  With thruster: can jump/boost
```

---

## 7. Module interaction with contexts

### 7.1 Context-dependent effectiveness

The same module has different effectiveness in different contexts:

```text
Winch module:
  Farming context: 100% effective (tow crops, pull stumps)
  Racing context: 30% effective (adds weight, rarely needed)
  Defense context: 80% effective (pull barricades, recover rigs)
  Aquatic context: 60% effective (can anchor, but water reduces effectiveness)

Plow module:
  Farming context: 100% effective (cultivate fields)
  Racing context: 20% effective (clear debris only)
  Defense context: 70% effective (shape defensive lanes)
  Construction: 80% effective (grade terrain)
```

### 7.2 Context-specific module unlocks

Some modules only become available in certain contexts:

```text
Farming context unlocks:
  -Seeder attachment
  - Harvester head
  - Irrigation pump

Defense context unlocks:
  - Shield plates
  - Turret mount
  - Flare launcher

Aquatic context unlocks:
  - Pontoon kit
  - Dredge head
  - Sonar mast
```

### 7.3 Module recontextualization

The same module means different things in different contexts:

```text
Floodlight module:
  Farming context: work late into the evening
  Defense context: illuminate threats, signal allies
  Exploration context: reveal hidden areas
  Racing context: night racing visibility

Crane module:
  Farming context: load hay bales, move equipment
  Construction: lift materials, assemble structures
  Defense: deploy barricades, recover damaged rigs
  Salvage: extract parts from wrecks
```

---

## 8. Module management at runtime

### 8.1 Module state

Each module has runtime state:

```text
ModuleState {
  id: ModuleId
  condition: number              // 0-100%, degrades with use
  integrity: number              // 0-100%, degrades with damage
  active: boolean                // is it turned on?
  deployed: boolean              // is it in use state?
  fuel: number                   // if it consumes fuel
  charge: number                 // if it uses battery
  temperature: number            // if it overheats
  lastMaintenance: Timestamp     // when it was last serviced
}
```

### 8.2 Module degradation

Modules degrade with use and damage:

```text
Degradation sources:
  - Use: condition decreases with each use cycle
  - Damage: integrity decreases when hit
  - Neglect: condition decreases over time if not maintained
  - Environment: extreme conditions accelerate degradation

Degradation effects:
  - Condition < 50%: reduced effectiveness
  - Condition < 25%: frequent failures
  - Condition = 0%: module non-functional
  - Integrity < 50%: visible damage
  - Integrity = 0%: module destroyed, detaches
```

### 8.3 Module repair

Modules can be repaired:

```text
Field repair:
  - Limited effectiveness (50% max)
  - Requires parts (from inventory or salvage)
  - Takes time (player waits)
  - Visual confirmation (temporary fix visible)

Workshop repair:
  - Full effectiveness (100%)
  - Requires parts + scrap
  - Takes time (rig in workshop)
  - Visual confirmation (proper repair visible)

Replacement:
  - Install new module
  - Old module goes to inventory (if repairable) or discarded
  - Capability envelope recalculated
```

---

## 9. Module inventory

### 9.1 Inventory storage

Modules are stored in the workshop/garage:

```text
Inventory {
  modules: Module[]              // available modules
  capacity: number               // max modules stored
  slots: ModuleSlot[]            // where modules are stored
}
```

### 9.2 Module transport

Modules can be transported between locations:

```text
Transport methods:
  - Rig cargo: modules in rig's cargo hold
  - Trailer: modules on trailer
  - Delivery: NPC delivers module to workshop
  - Salvage: module recovered from wreck
  - Trade: module obtained from NPC
```

### 9.3 Module economy

Modules are obtained through:

```text
Acquisition methods:
  - Found: discovered in world (wreck, hidden cache, community gift)
  - Crafted: built from parts + scrap (workshop recipe)
  - Traded: obtained from NPC (favor + scrap)
  - Rewards: earned from episode completion
  - Salvage: recovered from damaged/destroyed rigs
  - Quest: given by community for completing work
```

---

## 10. Module conflicts

### 10.1 Physical conflicts

Some modules physically can't coexist:

```text
Physical conflicts:
  - Plow + Brush Guard: both occupy front-utility
  - Crane + Turret: both need roof-utility and clearance
  - Pontoon + Snow Chains: incompatible locomotion modifications
  - Generator + Fuel Tank: both need internal slot, compete for space
```

### 10.2 Power conflicts

Some modules compete for limited power:

```text
Power conflicts:
  - Floodlight + Winch: both need high power, rig can't sustain both
  - Turret + Crane: both need hydraulic power, switching between them
  - Heater + Air Conditioning: opposite energy draws
```

### 10.3 Weight conflicts

Too many modules make the rig too heavy:

```text
Weight limits:
  - Base rig: 1000kg
  - Max modules: 500kg (50% of base weight)
  - Beyond 50%: reduced performance
  - Beyond 75%: severe performance penalty
  - Beyond 100%: rig immobile
```

---

## 11. Module visual system

### 11.1 Visual attachment

Modules appear physically on the rig:

```text
Visual rules:
  - Module mesh attaches at hardpoint position
  - Module scale matches rig proportions
  - Module color tint matches rig palette (optional)
  - Module state affects visual (deployed stowed, active glowing, damaged dented)
```

### 11.2 Module animations

Modules have animations:

```text
Animation types:
  - Deploy/retract: plow lowers/raises, winch extends/retracts
  - Activate: floodlight turns on, turret rotates
  - Damage: sparks, smoke, dents, breaks
  - Idle: subtle movement (crane sway, antenna bounce)
```

### 11.3 Module effects

Modules have visual effects:

```text
Effect types:
  - Light: floodlight beam, beacon pulse, laser sight
  - Particle: smoke, sparks, dust, water spray
  - Sound: motor hum, hydraulic whine, impact clang
  - Haptic: vibration feedback on attachment/damage
```

---

## 12. First proof slice

The smallest durable proof that the module system works:

1. **One rig** (Torque-70) with **two hardpoints** (front-utility, rear-utility)
2. **Two modules** (plow, winch)
3. **One attachment** — plow attaches to front-utility in workshop
4. **One capability grant** — plow grants "cultivate" verb
5. **One tradeoff** — plow adds weight, reduces turning radius
6. **One context interaction** — plow 100% effective in farming, 20% in racing
7. **One visual confirmation** — plow appears on rig, animates when used
8. **One detachment** — plow detaches in workshop, capability removed

### What this proves
- Modules attach physically to hardpoints
- Modules grant capabilities and impose tradeoffs
- Modules have visual presence and animation
- Modules interact with contexts
- Modules can be attached/detached

### What this does NOT prove
- Full 23-module catalog (that's content, not mechanism)
- Module degradation/repair (that's a separate proof)
- Module inventory/transport (that's a separate proof)
- Module conflicts (that's a separate proof)
- Module economy (that's a separate proof)

---

## 13. Decision questions

1. Should modules be physically transported or teleported to inventory?
2. How many modules can a rig carry simultaneously?
3. Can modules be shared between rigs in a fleet?
4. Should module attachment be instant or require time/animation?
5. How do modules interact with rig variants (different hardpoint configs)?
6. Should modules have their own progression (levels, upgrades)?

---

## Linked artifacts

- [Master Vehicle Catalog](../exploration/MASTER_VEHICLE_CATALOG.md)
- [Rig Generation for Infinite Possibilities](../research/RIG_GENERATION_INFINITE_POSSIBILITIES_2026-08-05.md)
- [Same Vehicle Mode Matrix](../exploration/SAME_VEHICLE_MODE_MATRIX_2026-07-26.md)
- [Asset Pipeline for Infinite Rigs](../research/ASSET_PIPELINE_FOR_INFINITE_RIGS_2026-08-05.md)
- [Context Switching Mechanic](./CONTEXT_SWITCHING_MECHANIC_2026-08-05.md)
- [Episode Runtime Architecture](./EPISODE_RUNTIME_ARCHITECTURE_2026-08-05.md)
- [Capability Contract and Adapter Guardrails](../research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- [Rig Generation, Evolution, and Persistence](../research/RIG_GENERATION_EVOLUTION_AND_PERSISTENCE_2026-08-05.md)
- [src/game/contracts.ts](../../src/game/contracts.ts)

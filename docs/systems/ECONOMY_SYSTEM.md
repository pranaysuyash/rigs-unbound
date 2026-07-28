# Economy System Design

**Project:** rigs-unbound  
**Version:** 0.1.0 (Exploratory)  
**Last Updated:** 2026-07-27  
**Status:** Design Phase

---

## Overview

The Economy System manages all resource flows: currency, raw materials, processed goods, crafting, markets, and player-driven trade. It creates meaningful decisions around resource allocation, risk/reward, and long-term planning.

---

## Resource Categories

### Resource Hierarchy

```
Raw Materials → Processed Goods → Finished Products
     ↓                ↓                    ↓
  (Salvage/         (Refining,          (Modules,
  Mining,           Crafting)           Blueprints,
  Harvesting)                          Consumables)
```

### Resource Categories

| Tier  | Category                | Examples                                                               | Primary Source                | Primary Use               |
| ----- | ----------------------- | ---------------------------------------------------------------------- | ----------------------------- | ------------------------- |
| **0** | **Currency**            | Credits, Scrip, Faction Tokens                                         | Missions, sales, rewards      | Universal medium          |
| **1** | **Raw Materials**       | Scrap, Iron Ore, Copper Ore, Silicon, Crystals, Organic Matter         | Salvage, mining, harvesting   | Refining, direct crafting |
| **2** | **Processed Materials** | Steel Plates, Copper Wire, Circuits, Fuel Cells, Chemicals, Composites | Refining raw materials        | Crafting, repairs         |
| **3** | **Components**          | Engine Parts, Suspension Arms, Sensor Arrays, Power Cells, Hydraulics  | Crafting from processed       | Module assembly           |
| **4** | **Modules/Equipment**   | Engine, Suspension, Weapon, Sensor, Cargo, Utility                     | Assembly from components      | Rig installation          |
| **5** | **Special/Unique**      | Blueprints, Artifacts, Signatures, Coordinates, Data                   | Missions, exploration, events | Unlocks, progression      |

---

## Resource Definitions

### Tier 0: Currency

| Currency           | Code   | Source                          | Primary Use            | Notes                   |
| ------------------ | ------ | ------------------------------- | ---------------------- | ----------------------- |
| **Credits**        | `CRED` | Missions, sales, contracts      | Universal currency     | Stable, inflates slowly |
| **Scrip**          | `SCRP` | Faction contracts, black market | Faction-specific goods | Faction-locked          |
| **Faction Tokens** | `FK_*` | Faction missions, reputation    | Faction-exclusive gear | Non-tradeable           |

### Tier 1: Raw Materials

| Material              | Code           | Source                      | Rarity   | Primary Use           |
| --------------------- | -------------- | --------------------------- | -------- | --------------------- |
| **Scrap Metal**       | `SCRAP`        | Salvage, wrecks             | Common   | Everything            |
| **Iron Ore**          | `FE_ORE`       | Mining, surface deposits    | Common   | Steel Plates          |
| **Copper Ore**        | `CU_ORE`       | Mining, electronics salvage | Common   | Copper Wire, Circuits |
| **Aluminum Ore**      | `AL_ORE`       | Mining, aircraft salvage    | Uncommon | Light Alloys          |
| **Titanium Ore**      | `TI_ORE`       | Deep mining, meteor sites   | Rare     | High-strength Alloys  |
| **Rare Earths**       | `REE`          | Specialized mining, ruins   | Rare     | Electronics, Sensors  |
| **Silicon Crystals**  | `SI_CRYSTAL`   | Mining, sand processing     | Common   | Circuits, Glass       |
| **Carbon Fiber**      | `CARBON_FIBER` | Salvage, synthesis          | Uncommon | Lightweight parts     |
| **Synthetic Polymer** | `SYN_POLY`     | Chemical synthesis, salvage | Common   | Seals, Insulation     |
| **Rubber**            | `RUBBER`       | Plantation, synthesis       | Common   | Tires, Seals          |
| **Organic Matter**    | `ORGANIC`      | Farming, creature drops     | Common   | Biofuel, Medicine     |
| **Crystalline Water** | `H2O_CRYSTAL`  | Ice mining, atmospheric     | Common   | Coolant, Fuel Cells   |
| **Volatile Gas**      | `VOLATILE_GAS` | Gas giants, vents           | Uncommon | Fuel, Explosives      |
| **Radioactive Ore**   | `RAD_ORE`      | Hazard zones, deep space    | Rare     | Nuclear, Weapons      |

### Tier 2: Processed Materials

| Material                | Code              | Recipe                                       | Primary Use          |
| ----------------------- | ----------------- | -------------------------------------------- | -------------------- |
| **Steel Plate**         | `STEEL_PLATE`     | Scrap×4 + Iron Ore×2 → Plate×2               | Chassis, Armor       |
| **Light Alloy**         | `LIGHT_ALLOY`     | Aluminum×3 + Titanium×1 → Alloy×2            | Lightweight frames   |
| **High-Strength Alloy** | `HI_STR_ALLOY`    | Steel×2 + Titanium×2 + Carbon×1 → Alloy×2    | Heavy frames         |
| **Copper Wire**         | `CU_WIRE`         | Copper Ore×3 → Wire×5                        | Wiring, Motors       |
| **Circuit Board**       | `CIRCUIT`         | Copper×2 + Silicon×1 + Gold×1 → Board×1      | Electronics          |
| **Advanced Circuit**    | `ADV_CIRCUIT`     | Circuit×2 + RareEarth×1 + Gold×2 → Adv×1     | Advanced Electronics |
| **Fuel Cell**           | `FUEL_CELL`       | Hydrogen×5 + Platinum×1 → Cell×2             | Power systems        |
| **Hydraulic Fluid**     | `HYD_FLUID`       | Synthetic×3 + Oil×2 → Fluid×4                | Suspension, Steering |
| **Coolant**             | `COOLANT`         | Water×4 + Ethylene×1 + Additives → Coolant×4 | Engine, Electronics  |
| **Lubricant**           | `LUBRICANT`       | Oil×3 + Additives×1 → Lub×3                  | Moving parts         |
| **Explosive Compound**  | `EXPLOSIVE`       | Nitrate×3 + Stabilizer×1 → Expl×3            | Mining, Weapons      |
| **Composite Panel**     | `COMP_PANEL`      | CarbonFiber×2 + Resin×1 → Panel×2            | Lightweight armor    |
| **Ballistic Glass**     | `BALLISTIC_GLASS` | Glass×3 + Polymer×2 + Ceramic×1 → Glass×2    | Cab protection       |
| **Insulation**          | `INSULATION`      | Polymer×2 + Ceramic×1 → Insul×3              | Thermal/Electrical   |
| **Lubricant**           | `LUBRICANT`       | Oil×3 + Additives×1 → Lub×3                  | Bearings, Joints     |

### Tier 3: Components

| Component           | Code           | Recipe                            | Used In          |
| ------------------- | -------------- | --------------------------------- | ---------------- |
| **Engine Block**    | `ENG_BLOCK`    | Steel×4 + Alloy×2 + Circuit×1     | Engine Module    |
| **Turbocharger**    | `TURBO`        | Alloy×3 + Bearing×2 + Circuit×1   | Engine Upgrade   |
| **Transmission**    | `TRANSMISSION` | Steel×3 + Gear×4 + Hydraulic×2    | Drivetrain       |
| **Suspension Arm**  | `SUSP_ARM`     | Steel×2 + Bushing×4 + Shock×1     | Suspension       |
| **Shock Absorber**  | `SHOCK`        | Spring×1 + Piston×1 + Hydraulic×2 | Suspension       |
| **Sensor Array**    | `SENSOR_ARRAY` | Circuit×2 + Sensor×3 + Lens×1     | Sensor Module    |
| **Radar Dish**      | `RADAR`        | Alloy×2 + Circuit×2 + Motor×1     | Sensor Module    |
| **Weapon Mount**    | `WEAPON_MOUNT` | Steel×3 + Servo×2 + Circuit×1     | Weapon Hardpoint |
| **Cargo Container** | `CARGO_CONT`   | Steel×3 + Seal×2 + Lock×1         | Cargo Module     |
| **Fuel Tank**       | `FUEL_TANK`    | Steel×2 + Liner×1 + Pump×1        | Fuel Storage     |
| **Winch Drum**      | `WINCH_DRUM`   | Steel×2 + Cable×50m + Motor×1     | Winch Module     |
| **Crane Arm**       | `CRANE_ARM`    | Steel×4 + Hydraulic×3 + Servo×2   | Crane Module     |

### Tier 4: Modules/Equipment

See `VEHICLE_PROGRESSION.md` for full module catalog.

### Tier 5: Special/Unique

| Item                   | Code          | Source                 | Use                       |
| ---------------------- | ------------- | ---------------------- | ------------------------- |
| **Blueprint Fragment** | `BP_FRAG_*`   | Missions, ruins        | Assemble → Blueprint      |
| **Complete Blueprint** | `BLUEPRINT_*` | Assemble fragments     | Unlock crafting           |
| **Artifact**           | `ARTIFACT_*`  | Ruins, anomalies       | Research, unique modules  |
| **Coordinates**        | `COORDS_*`    | Exploration, signals   | Navigation, expeditions   |
| **Encrypted Data**     | `ENC_DATA_*`  | Data caches, ruins     | Decrypt → Intel/Blueprint |
| **Signature Paint**    | `PAINT_SIG_*` | Masterwork restoration | Cosmetic, prestige        |
| **Signature Trail**    | `TRAIL_SIG_*` | Masterwork restoration | Visual effect             |

---

## Market System

### Market Types

| Market Type            | Location                   | Refresh       | Specialization                     |
| ---------------------- | -------------------------- | ------------- | ---------------------------------- |
| **Settlement Market**  | Towns, outposts            | Daily         | General goods, fuel, basic modules |
| **Specialist Dealer**  | Workshops, ports           | 2-3 days      | Modules, blueprints, rare parts    |
| **Traveling Merchant** | Roads, crossroads          | Weekly        | Rare blueprints, exotic goods      |
| **Black Market**       | Hidden, faction-controlled | Weekly        | Illegal, stolen, faction gear      |
| **Fleet Market**       | Fleet hub, player-owned    | Player-driven | Player-to-player                   |
| **Expedition Cache**   | Expedition rewards         | One-time      | Expedition-specific loot           |

### Price Formation

```
Base Price × Supply/Demand Factor × Faction Standing × Distance Modifier × Rarity
```

**Supply/Demand Factors:**

- **High Supply / Low Demand:** 0.5x - 0.8x
- **Balanced:** 1.0x
- **Low Supply / High Demand:** 1.2x - 3.0x
- **Monopoly/Event:** 3.0x - 10.0x

**Distance Modifier:** 1.0x (local) → 1.5x (regional) → 2.5x (cross-region)

**Faction Standing Discount:**

| Standing   | Discount |
| ---------- | -------- |
| Hostile    | +50%     |
| Unfriendly | +25%     |
| Neutral    | 0%       |
| Friendly   | -10%     |
| Allied     | -20%     |
| Exalted    | -30%     |

---

## Crafting System

### Crafting Stations

| Station                   | Tier | Unlocks                    | Power        |
| ------------------------- | ---- | -------------------------- | ------------ |
| **Portable Fabricator**   | 0    | Basic parts, ammo          | Battery      |
| **Workshop Bench**        | 1    | Components, basic modules  | Generator    |
| **Industrial Fabricator** | 2    | Modules, heavy parts       | Grid/Reactor |
| **Advanced Lab**          | 3    | Advanced circuits, sensors | Reactor      |
| **Prototype Bay**         | 4    | Experimental, unique       | Fusion Core  |

### Recipe Structure

```typescript
interface Recipe {
  id: string;
  name: string;
  stationTier: number;
  inputs: { material: MaterialId; quantity: number }[];
  output: { item: ItemId; quantity: number; quality?: Quality };
  time: number; // Seconds
  powerCost: number; // kW
  byproducts?: { material: MaterialId; quantity: number }[];
  unlocksAt?: { rung: number; blueprint?: string };
}
```

### Example Recipes

```typescript
// Steel Plate
{
  id: "RECIPE_STEEL_PLATE",
  name: "Steel Plate",
  stationTier: 1,
  inputs: [
    { material: "SCRAP", quantity: 4 },
    { material: "FE_ORE", quantity: 2 }
  ],
  output: { item: "STEEL_PLATE", quantity: 2 },
  time: 30,
  powerCost: 50
}

// Advanced Circuit
{
  id: "RECIPE_ADV_CIRCUIT",
  name: "Advanced Circuit Board",
  stationTier: 3,
  inputs: [
    { material: "CIRCUIT", quantity: 2 },
    { material: "REE", quantity: 1 },
    { material: "GOLD", quantity: 2 }
  ],
  output: { item: "ADV_CIRCUIT", quantity: 1 },
  time: 120,
  powerCost: 200,
  unlocksAt: { rung: 3 }
}
```

---

## Salvage System

### Salvage Sources

| Source               | Method          | Yield                           | Risk          |
| -------------------- | --------------- | ------------------------------- | ------------- |
| **Wreckage**         | Cut/Extract     | High (modules, hull)            | Low           |
| **Abandoned Base**   | Dismantle       | Very High (modules, stockpiles) | Medium        |
| **Debris Field**     | Collect/Scan    | Medium (scatter)                | Low           |
| **Creature Harvest** | Process Carcass | Organic, Chitin, Catalysts      | Medium        |
| **Mining**           | Drill/Extract   | Ores, Crystals                  | Environmental |
| **Atmospheric**      | Scoop/Filter    | Gases, Ice                      | Environmental |
| **Data Recovery**    | Hack/Decrypt    | Data, Blueprints, Coords        | High (cyber)  |

### Salvage Yield Table

| Source Tier               | Common | Uncommon | Rare | Epic | Legendary |
| ------------------------- | ------ | -------- | ---- | ---- | --------- |
| **Tier 0 (Scav)**         | 90%    | 10%      | 1%   | 0.1% | 0%        |
| **Tier 1 (Field)**        | 70%    | 25%      | 5%   | 0.5% | 0%        |
| **Tier 2 (Structured)**   | 50%    | 30%      | 15%  | 3%   | 0.1%      |
| **Tier 3 (Installation)** | 30%    | 35%      | 25%  | 8%   | 1%        |
| **Tier 4 (Capital)**      | 10%    | 20%      | 30%  | 25%  | 10%       |

### Salvage Mechanics

```
1. Scan Target → Reveals Composition (% materials, modules, hazards)
2. Choose Method → Cut (fast, damage), Dismantle (slow, max yield), Hack (data)
3. Execute → Mini-game / Time → Yield Calculation
4. Transport → Cargo Capacity → Transport Risk
5. Process → Refine/Craft/Sell
```

---

## Player-Driven Trade

### Direct Trade

- **Initiate:** Proximity + Hail → Trade Request
- **Interface:** Drag-drop, quantity sliders, value preview
- **Verification:** Both confirm → Atomic swap (atomic or escrow)
- **History:** Logged for reputation, dispute resolution

### Fleet Market

- **Listings:** Player posts buy/sell orders
- **Fees:** 2% listing, 5% transaction (sinks currency)
- **Delivery:** Local (instant) or Courier (time, cost, risk)
- **Contracts:** Futures, bulk discounts, subscription

### Contracts

```typescript
interface TradeContract {
  id: string;
  issuer: PlayerId;
  type: "BUY" | "SELL" | "TRANSPORT" | "CONTRACT";
  item: ItemId;
  quantity: number;
  pricePerUnit: number;
  totalValue: number;
  collateral?: number;
  deadline: number;
  status:
    | "OPEN"
    | "ACCEPTED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "BREACHED"
    | "CANCELLED";
  assignee?: PlayerId;
  location?: RegionId;
}
```

---

## Economic Balance

### Currency Sinks (Deflationary)

| Sink                   | Rate                        | Purpose             |
| ---------------------- | --------------------------- | ------------------- |
| **Repair Costs**       | 5-15% of max HP per repair  | Ongoing drain       |
| **Fuel Costs**         | Per km, scales with mass    | Ongoing drain       |
| **Module Wear**        | 0.1-1% per mission          | Gradual degradation |
| **Market Fees**        | 2% listing + 5% transaction | Velocity dampener   |
| **Fast Travel**        | Credits per km              | Convenience tax     |
| **Rig Storage**        | Daily per slot              | Fleet management    |
| **Blueprint Research** | One-time per blueprint      | Progression gate    |
| **Rig Slot Unlock**    | One-time per slot           | Progression gate    |

### Currency Faucets (Inflationary)

| Source             | Rate     | Control            |
| ------------------ | -------- | ------------------ |
| Mission Rewards    | Primary  | Difficulty scaling |
| Salvage Sales      | Variable | Market demand      |
| Daily Login        | Small    | Retention          |
| Weekly Challenges  | Medium   | Engagement         |
| Faction Contracts  | Medium   | Reputation gate    |
| Expedition Bonuses | High     | Endgame            |

### Inflation Targets

| Metric                          | Target        | Control Mechanism                      |
| ------------------------------- | ------------- | -------------------------------------- |
| **Annual Inflation**            | 2-5%          | Adjust mission rewards                 |
| **Credit Velocity**             | 5-10x/year    | Market fees, sinks                     |
| **Wealth Gini**                 | <0.4          | Progressive sinks, progressive rewards |
| **New Player Purchasing Power** | 100% baseline | Starter packages, early missions       |

---

## Salvage → Economy Flow

```
Wreck/Node
    ↓ Scan (reveals composition)
    ↓ Choose Method (Cut/Dismantle/Hack)
    ↓ Execute (time, mini-game, risk)
    ↓ Yield Calculation (RNG + Skill + Tools)
    ↓ Cargo Management (weight, volume, hazmat)
    ↓ Transport (risk: pirates, environment, failure)
    ↓ Unload at Station → Market / Storage
    ↓ Sell / Refine / Craft / Store
    ↓ Credits / Materials / Modules → Reinvest
```

### Salvage Value Chain Example

```
Capital Ship Wreck (Tier 4)
    ↓ Scan: 40% Hull, 20% Modules, 10% Cargo, 30% Scrap
    ↓ Dismantle (2hrs, 2 crew, cutter req)
    ↓ Yield: 500 Steel, 50 Plate, 5 Engine, 20 Circuit, 1000 Scrap, 2 Module
    ↓ Transport (freighter, 2 jumps, 5% pirate risk)
    ↓ Sell at Industrial Hub:
        Steel @ 8cr → 4,000cr
        Plate @ 50cr → 2,500cr
        Engine @ 500cr → 2,500cr
        Circuit @ 200cr → 2,000cr
        Scrap @ 2cr → 2,000cr
        Modules @ 1,500cr → 3,000cr
    ↓ Total: ~16,000cr gross
    ↓ Costs: Fuel 800, Crew 1,200, Docking 200, Risk Insurance 500
    ↓ Net: ~11,300cr profit (2.5hr work)
```

---

## Open Items

| Item                                    | Priority | Status  |
| --------------------------------------- | -------- | ------- |
| Complete material spreadsheet (all 50+) | High     | Partial |
| Recipe tree with tier unlocks           | High     | Draft   |
| Market simulation & balance model       | High     | Design  |
| Salvage yield tables per tier/source    | High     | Partial |
| Crafting station tier unlocks           | High     | Draft   |
| Player market UI/UX flow                | High     | Design  |
| Contract system (escrow, disputes)      | Medium   | Design  |
| Faction economy differentiation         | Medium   | Design  |
| Dynamic event impact on prices          | Medium   | Design  |
| Player-to-player trade security         | High     | Design  |
| Economic telemetry / analytics          | Medium   | Design  |

---

## Related Documents

- `GAMEPLAY_SYSTEMS_ARCHITECTURE.md` — Overall architecture
- `MISSION_SYSTEM_DESIGN.md` — Mission rewards → economy
- `PROGRESSION_SYSTEM.md` — XP → Economy conversion
- `VEHICLE_PROGRESSION.md` — Modules, crafting, upgrades
- `MISSION_SYSTEM_DESIGN.md` — Mission rewards → economy
- `PROGRESSION_SYSTEM.md` — XP → Economy conversion

---

_Generated: 2026-07-27 | Project: rigs-unbound | Status: Design Phase_

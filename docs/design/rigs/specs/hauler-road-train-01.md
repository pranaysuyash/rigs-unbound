# Hauler Multi-Axle Highway Cargo Rig (`hauler-road-train-01`) Design Specification

- **Family:** Hauler / Highway Cargo Rig
- **Locomotion Class:** Heavy 6x4 Long-Haul Tractor Unit with Fifth-Wheel Coupling
- **Primary Verbs:** Long-Haul Transport, Heavy Cargo Towing, Resource Supply Lines, Highway Cruising
- **Aesthetic Profile:** Patchwork Atlas — Weathered cobalt-blue cab-over chassis, twin vertical chrome exhaust stacks, heavy bullbar, flatbed trailer fifth-wheel plate, long dual rear drive axles.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 2.90 | m | Standard highway haulage track |
| `wheelbase` | 4.80 | m | Extended 3-axle tractor unit wheelbase |
| `wheelRadius` | 0.60 | m | Heavy highway dual tires (10 tires on tractor) |
| `rideHeight` | 0.80 | m | Highway frame elevation |
| `mass` | 8900 | kg | High mass tractor for pulling heavy road trailers |
| `topSpeed` | 30.0 | m/s | High highway cruising speed |
| `steeringTurnRate` | 1.6 | rad/s | Long-wheelbase turn radius |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy chrome steel bullbar with integrated fog lights (`bullbar-heavy-chrome`)
- `socket.roof`: Cab-over sleeper cab roof fairing with dual air horns (`horn-set-chrome`)
- `socket.outboard_left`: Dual 500L aluminum fuel tanks with step plates
- `socket.outboard_right`: Auxiliary battery box and compressed air storage tanks
- `socket.underbody`: Heavy driveline guard
- `socket.rear_hitch`: Heavy heavy-duty fifth-wheel trailer coupling plate (`fifth-wheel-hitch-01`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Cab-Over Tractor Body:** Square-nosed cab-over-engine design, large windshield, side grab ladders, sleeper compartment extension.
2. **Drive Chassis:** Triple axle frame (1 front steer, 2 rear dual drive axles) with chrome step plates and mudflaps.
3. **Fifth-Wheel Deck:** Heavy pivot coupling plate mounted over the rear tandem axles for articulated trailer hookups.
4. **Exhaust & Intakes:** Twin tall chrome exhaust stacks mounted behind the cab with heat shields and dual side air filters.
5. **Detailing & Story Marks:** Sun-faded blue paint, mileage stencil ("LOGISTICS-REGIONAL"), mudflaps with hazard logos.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy multi-axle highway cargo tractor truck. Patchwork Atlas aesthetic. Sun-faded cobalt-blue cab-over body, twin tall chrome exhaust stacks, heavy chrome front bullbar. 3-axle chassis with dual rear drive wheels and fifth-wheel trailer hitch deck. Heavy long-haul logistics character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

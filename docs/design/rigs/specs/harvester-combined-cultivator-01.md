# Harvester & Combined Cultivator (`harvester-combined-cultivator-01`) Design Specification

- **Family:** Harvester / Combined Cultivator
- **Locomotion Class:** Asymmetric High-Wheel Ground Rig (Giant front flotation tires, smaller rear steering tires)
- **Primary Verbs:** Mass Harvesting, Crop Threshing, Soil De-compacting, Grain Conveying
- **Aesthetic Profile:** Patchwork Atlas — Sun-faded harvest yellow hull, rust-patched steel hopper, bone-white rotary header drum with silver threshing teeth, high offset cab for crop field visibility.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.20 | m | Extra wide stance to span multi-row crop beds |
| `wheelbase` | 3.60 | m | Heavy forward weight bias over harvest header |
| `wheelRadius` | 0.95 | m | Giant front flotation tires (rear wheelRadius: 0.50m) |
| `rideHeight` | 1.10 | m | High crop-clearing chassis height |
| `mass` | 8200 | kg | Massive agricultural harvester body |
| `topSpeed` | 12.0 | m/s | Slow, steady field working speed |
| `steeringTurnRate` | 2.5 | rad/s | Rear-wheel steering for tight headland pivots |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Wide detachable rotary threshing drum header (`rotary-header-3m`)
- `socket.roof`: High-offset panoramic glass operator cab with climate filter pack and work lights
- `socket.outboard_left`: Folding grain unloader auger pipe (`unloader-auger-arm`)
- `socket.outboard_right`: Chaff separator filter housing and side inspection ladder
- `socket.underbody`: Heavy crop-stalk cutter bar and soil aerator tines
- `socket.rear_hitch`: Auxiliary grain cart tow hitch (`grain-trailer-hitch`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Header Assembly:** Front wide cylindrical drum header with rotating spiral reel blades, pick-up fingers, and quick-release mounting arm.
2. **Elevated Operator Cab:** Glass-enclosed cabin mounted high on the front left corner for panoramic field viewing, featuring roof floodlights and twin warning beacons.
3. **Threshing Body & Hopper:** Massive central hull containing internal sieve mechanism, large open-top grain hopper, and rear chaff spreader vents.
4. **Unloading Auger Pipe:** Long jointed steel pipe on the left side that pivots outward to load adjacent transport rigs.
5. **Detailing & Story Marks:** Heavy crop dust buildup along lower skirt, rusted patch on the hopper side, hand-painted farm crest emblem on cab door.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of an agricultural combined harvester rig. Patchwork Atlas aesthetic. Sun-faded harvest-yellow body, elevated panoramic glass cab on top-left. Massive front rotary drum header with silver threshing teeth. Giant treaded front tires, smaller rear steering wheels. Folding left-side grain auger pipe. Rust-patched hopper and heavy farm-worked character. Clean game-ready low-poly silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

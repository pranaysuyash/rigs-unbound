# Heavy 8x8 Salvage Crane Rig (`heavy-salvage-crane-02`) Design Specification

- **Family:** Heavy Utility Tow
- **Locomotion Class:** Heavy 8x8 All-Terrain Multi-Axle Ground Rig
- **Primary Verbs:** Wreck Salvage, Heavy Lattice Hoisting, Debris Removal, Structural Placement
- **Aesthetic Profile:** Patchwork Atlas — Dark industrial yellow body, matte black 4-axle chassis, bone-white lattice boom crane tower, twin counterweight packs, quad heavy outriggers.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.20 | m | 4-axle wide footprint for lattice crane stability |
| `wheelbase` | 5.20 | m | Extended 8x8 heavy chassis |
| `wheelRadius` | 0.70 | m | Heavy 8x8 all-terrain tires (8 wheels total) |
| `rideHeight` | 0.90 | m | Heavy ground clearance |
| `mass` | 11800 | kg | Maximum mass anchor for heavy hoisting operations |
| `topSpeed` | 14.0 | m/s | Low transport speed |
| `steeringTurnRate` | 1.4 | rad/s | Twin front-axle steering linkage |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy steel push-block and dual front winches
- `socket.roof`: Crane operator cab with protective roof mesh and amber beacon
- `socket.outboard_left`: Detachable steel counterweight slab pack (`counterweight-pack-01`)
- `socket.outboard_right`: Heavy hydraulic outrigger extenders (`heavy-outrigger-quad`)
- `socket.underbody`: Reinforced belly armor plate
- `socket.rear_hitch`: 360-degree rotating lattice boom crane tower with 30-ton hook (`lattice-crane-30t`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **8x8 Chassis Frame:** Heavy dual-channel steel frame with 4 steering/drive axles and 8 large all-terrain wheels.
2. **Rotating Crane Turret:** Center-mounted 360-degree slew ring bearing holding an operator cab, winch drum, and lattice boom hinge.
3. **Lattice Boom Arm:** Triangular steel lattice truss boom with extension jibs, pulley sheaves, and heavy snatch block hook.
4. **Outrigger Quad:** 4 heavy hydraulic outrigger arms that swing out from the chassis sides to lift wheels off ground during hoisting.
5. **Detailing & Story Marks:** Stenciled crane load chart on cab side, yellow warning stripes on outrigger pads, grease marks on winch drums.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy 8x8 mobile salvage crane truck. Patchwork Atlas aesthetic. Industrial yellow body, 4-axle chassis with 8 heavy all-terrain tires. Rotating 360-degree lattice truss boom crane with heavy winch hook block and counterweights. Quad deployable hydraulic outrigger pads. Massive heavy lift character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

# Torque Heavy Field Cultivator (`torque-field-cutter-02`) Design Specification

- **Family:** Torque
- **Locomotion Class:** Heavy Dual-Flotation Wheel Ground Rig (Dual rear wheels per side)
- **Primary Verbs:** Deep Soil Tilling, Heavy Pulling, Subsurface De-compacting, Stump Grinding
- **Aesthetic Profile:** Patchwork Atlas — Weathered crimson-red steel body, bone-enamel engine hood, dual rear mud wheels, heavy rear multi-shank ripper toolbar, front push-blade.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.00 | m | Dual rear wheel stance for extreme traction |
| `wheelbase` | 3.40 | m | Heavy tractor wheelbase |
| `wheelRadius` | 0.85 | m | Heavy rear tractor tires (front: 0.55m) |
| `rideHeight` | 0.95 | m | Clearance over high crop stubble and rocks |
| `mass` | 7600 | kg | High drawbar pulling mass |
| `topSpeed` | 15.0 | m/s | Working field transport speed |
| `steeringTurnRate` | 2.0 | rad/s | Standard agricultural power steering |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy steel ballast weight block and front push blade (`push-blade-front-01`)
- `socket.roof`: Protected roll-cage operator cab with dual LED lightbar
- `socket.outboard_left`: Auxiliary hydraulic fluid reservoir tank
- `socket.outboard_right`: Heavy diesel filter stack and tool box
- `socket.underbody`: Heavy-duty transmission guard skid plate
- `socket.rear_hitch`: Hydraulic 3-point hitch with 5-shank soil ripper toolbar (`soil-ripper-toolbar-01`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Chassis & Engine Housing:** Cast iron chassis frame, exposed diesel engine block with chrome exhaust stack, bone-white hood.
2. **Dual-Wheel Drive:** Twin rear tires per side with deep agricultural V-lugs, single front steering tires with mud scrapers.
3. **Operator Cab:** Reinforced tubular steel roll cage enclosure, high seat position, rear-view work lighting.
4. **Ripper Attachment:** Heavy rear toolbar with 5 curved steel ripper shanks and depth gauge wheels.
5. **Detailing & Story Marks:** Crimson paint flaking off engine side panels, mud splatter along rear fenders, serial stencil "TORQUE-HEAVY-02".

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy dual-wheel agricultural tractor rig. Patchwork Atlas aesthetic. Weathered crimson-red body, bone-white engine hood, dual rear tractor tires per side with deep tread. Rear hydraulic 3-point hitch holding a 5-shank soil ripper toolbar. Front steel ballast weight block. Roll-cage operator cab. High-detail mechanical character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

# Marsh Heavy Dredger (`marsh-dredger-heavy-02`) Design Specification

- **Family:** Marsh Skimmer
- **Locomotion Class:** Quad Air-Pontoon Hovercraft with Dual Rear Air-Fans
- **Primary Verbs:** Swamp Dredging, Silt Pumping, Shallow Water Traversal, Channel Clearing
- **Aesthetic Profile:** Patchwork Atlas — Weathered industrial teal pontoons, orange rubber skirt, central high-capacity silt pump unit, twin ducted rear propulsion fans, glass control cab on raised pylons.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.50 | m | Wide pontoon beam for water stability |
| `wheelbase` | 4.40 | m | Long pontoon hull envelope |
| `wheelRadius` | 0.40 | m | Effective pontoon skid/skirt clearance |
| `rideHeight` | 0.80 | m | Cushion air-gap elevation above water/mud |
| `mass` | 5200 | kg | Heavy dredging platform with air-cushion lift |
| `topSpeed` | 20.0 | m/s | Amphibious water & mud traversal speed |
| `steeringTurnRate` | 2.8 | rad/s | Air-rudder directional control |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy hydraulic cutter-suction dredge head (`dredge-head-cutter-01`)
- `socket.roof`: Enclosed elevated glass cockpit pod with twin searchlights and GPS antenna
- `socket.outboard_left`: Heavy flexible silt discharge hose and reel assembly (`silt-discharge-hose`)
- `socket.outboard_right`: Auxiliary diesel engine powering the high-pressure dredge pump
- `socket.underbody`: Heavy rubberized perimeter hover skirt (`hover-skirt-heavy-01`)
- `socket.rear_hitch`: Dual ducted propulsion fan pylons with aerodynamic rudders (`twin-propulsion-fan-set`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Pontoon & Skirt Assembly:** 4 inflatable fiberglass pontoons encased in heavy rubberized skirts with scuff-guard plates.
2. **Propulsion Unit:** Dual rear-mounted 3-blade propulsion fans inside steel safety shrouds with vertical control rudders.
3. **Dredging Machinery:** Center-deck diesel pump motor, heavy flexible intake pipe suspended from a front A-frame hoist, cutter head.
4. **Elevated Control Cabin:** Compact single-operator cabin mounted high above the pump deck for 360-degree water visibility.
5. **Detailing & Story Marks:** Algae stenciling along lower pontoon hulls, mud splatter across engine shrouds, rusted winch cable joints.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy amphibious swamp dredger hovercraft. Patchwork Atlas aesthetic. Weathered teal pontoons with heavy orange rubber hover skirts. Raised glass control cab on pylons. Dual ducted rear propulsion fans with vertical rudders. Front A-frame hoist holding a heavy cutter-suction dredge pipe. Industrial marsh worker character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

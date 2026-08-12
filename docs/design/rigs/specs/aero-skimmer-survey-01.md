# Aero-Skimmer High-Altitude Survey (`aero-skimmer-survey-01`) Design Specification

- **Family:** Aero-Skimmer
- **Locomotion Class:** Twin Directional Fan Hover / Aerial Skimmer (Dual tilting duct fans)
- **Primary Verbs:** Canyon Bridging, Aerial Survey, Thermal Scanning, Rapid Recon, Parachute Drop
- **Aesthetic Profile:** Patchwork Atlas — Lightweight aviation-white aluminum hull, cyan directional fan shrouds, yellow emergency float bags, high-resolution sensor gimbal sphere, lightweight carbon-fiber skid landing gear.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 2.60 | m | Distance between left and right ducted fan centers |
| `wheelbase` | 2.80 | m | Length of lightweight pontoon/skid landing frame |
| `wheelRadius` | 0.35 | m | Equivalent landing gear skid contact clearance |
| `rideHeight` | 1.20 | m | Normal airborne hover elevation above terrain |
| `mass` | 1400 | kg | Ultra-light composite airframe |
| `topSpeed` | 26.0 | m/s | Fast aerial traversal speed |
| `steeringTurnRate` | 3.5 | rad/s | Nimble vector-thrust yaw control |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: 3-axis gyro-stabilized sensor gimbal sphere (`sensor-gimbal-01`) with lidar scanner
- `socket.roof`: Emergency pop-out ballute / parachute deployment pod (`ballute-pod-01`)
- `socket.outboard_left`: Left tilting ducted fan housing (`tilt-fan-left`) with high-rpm rotor
- `socket.outboard_right`: Right tilting ducted fan housing (`tilt-fan-right`) with high-rpm rotor
- `socket.underbody`: Lightweight titanium tubular landing skids (`landing-skid-set`)
- `socket.rear_hitch`: Lightweight winch-towed sensor probe wire (`sensor-wire-hitch`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Composite Fuselage:** Aerodynamic pod cockpit with wide bubble canopy glass, lightweight carbon-fiber ribbing, and aft twin tail fins.
2. **Ducted Fan Thrusters:** Twin large ring-shrouded fans mounted on pivoting side pylons capable of tilting 90 degrees for vertical takeoff and forward flight.
3. **Sensor Nose Assembly:** Spherical glass optical sensor head mounted under the nose cone with blue laser scanning optics.
4. **Landing Gear Skids:** Dual shock-absorbing skid rails under the body with integrated yellow flotation bags for water emergency landings.
5. **Detailing & Story Marks:** Aviation safety stencils ("DANGER: ROTOR VENT"), red warning stripes along fan duct edges, riveted aluminum repair patch on right tail fin.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of an aero-skimmer survey aircraft rig. Patchwork Atlas aesthetic. Aviation-white lightweight hull, cyan ducted tilt-fan shrouds mounted on side pylons. Clear glass bubble canopy, nose-mounted spherical lidar sensor gimbal. Carbon-fiber tubular landing skids with yellow emergency flotation packs. Sleek yet hand-built repaired scout craft. Clean low-poly silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

# Aero Heavy Tilt-Rotor Cargo Skimmer (`aero-cargo-freighter-02`) Design Specification

- **Family:** Aero-Skimmer
- **Locomotion Class:** Heavy Quad Tilt-Rotor Heavy Lift Skimmer (4 wing-tip ducted tilt-rotors)
- **Primary Verbs:** Heavy Sky Hoisting, Canyon Freight Transport, Airborne Vehicle Delivery, High-Altitude Supply
- **Aesthetic Profile:** Patchwork Atlas — Weathered industrial orange and white cargo airframe, 4 large wing-tip ducted tilt-rotors, open ventral cargo sling bay with heavy winch cable, dual glass flight deck.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 4.80 | m | Wide rotor-to-rotor wingspan clearance |
| `wheelbase` | 5.00 | m | Fuselage length envelope |
| `wheelRadius` | 0.45 | m | Equivalent landing gear wheel radius |
| `rideHeight` | 1.40 | m | Airborne hover clearance height |
| `mass` | 6200 | kg | Heavy lift cargo airframe |
| `topSpeed` | 28.0 | m/s | High-speed aerial cargo transport |
| `steeringTurnRate` | 2.6 | rad/s | Vectored tilt-rotor yaw steering |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Dual flight deck cockpit with high-intensity landing searchlight
- `socket.roof`: Heavy top cargo winch housing and satellite communications dish
- `socket.outboard_left`: Dual wing-tip ducted tilt-rotor propulsion pods (`tilt-rotor-pod-pair-left`)
- `socket.outboard_right`: Dual wing-tip ducted tilt-rotor propulsion pods (`tilt-rotor-pod-pair-right`)
- `socket.underbody`: Heavy-duty ventral cargo sling hook and magnet array (`sky-crane-sling-01`)
- `socket.rear_hitch`: Twin vertical tail fins with aerodynamic trim tabs

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Cargo Fuselage:** Heavy square-section aluminum cargo hull with side loading doors and ventral sling winch hatch.
2. **Quad Tilt-Rotor Wings:** High-mounted stub wings carrying 4 large 5-blade ducted tilt-rotors on pivoting motor nacelles.
3. **Flight Deck:** Glazed forward cockpit bay with dual seats, overhead lightbar, and sensor radome.
4. **Ventral Cargo Sling:** Underbody winching mechanism with 4 steel cables holding a heavy vehicle-carrying cargo frame.
5. **Detailing & Story Marks:** Heavy exhaust soot behind engine nacelles, cargo weight rating stencil ("SKY-CRANE 10T"), orange warning stripes on rotor tips.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy quad tilt-rotor sky crane cargo craft. Patchwork Atlas aesthetic. Industrial orange and white airframe, 4 large ducted tilt-rotors mounted on stub wings. Underbody ventral cargo winching hook holding a heavy transport frame. Glass flight deck cockpit. Heavy aerial freighter character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

# Construction Earthmover Excavator (`construction-excavator-01`) Design Specification

- **Family:** Construction Earthmover
- **Locomotion Class:** Heavy Dual Caterpillar Tracks with 360-Degree Upper Slew House
- **Primary Verbs:** Trenching, Rock Breaking, Earthmoving, Embankment Building, Debris Clearance
- **Aesthetic Profile:** Patchwork Atlas — Weathered safety yellow upper body, black steel track undercarriage, 2-stage articulated hydraulic boom with heavy excavator bucket, glass cab with protective grille.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.20 | m | Wide track gauge for excavating stability |
| `wheelbase` | 4.10 | m | Length of heavy ground contact track belt |
| `wheelRadius` | 0.50 | m | Sprocket rolling clearance radius |
| `rideHeight` | 0.85 | m | Undercarriage belly clearance |
| `mass` | 9200 | kg | Heavy earthmover anchor mass |
| `topSpeed` | 8.0 | m/s | Crawler transport speed |
| `steeringTurnRate` | 2.0 | rad/s | Differential track steering |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Hydraulic front dozer/stabilizer blade (`dozer-blade-front`)
- `socket.roof`: Protected glass operator cab with overhead mesh screen and LED work lights
- `socket.outboard_left`: Hydraulic fluid cooler radiator housing
- `socket.outboard_right`: Heavy diesel fuel tank and counterweight bay
- `socket.underbody`: Heavy track frame crossmember
- `socket.rear_hitch`: 2-stage hydraulic boom arm with quick-coupler heavy digging bucket (`excavator-bucket-1m3`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Track Undercarriage:** Dual heavy steel track frames with 6 bottom rollers per side and front dozer blade.
2. **Rotating Upper Structure (House):** 360-degree rotating main body containing cab, diesel engine, hydraulic pumps, and rear counterweight.
3. **Hydraulic Boom & Arm:** Heavy 2-section articulated boom with 3 hydraulic rams, stick arm, and reinforced steel bucket with hardened teeth.
4. **Operator Station:** Single seat enclosed cab with joystick controls, window guards, and access ladder.
5. **Detailing & Story Marks:** Heavy scratches on bucket teeth, grease streaks along boom hydraulic joints, yellow paint flaking off counterweight.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy hydraulic construction excavator rig. Patchwork Atlas aesthetic. Weathered safety-yellow upper house body, black steel caterpillar tracks. 2-stage articulated hydraulic boom arm with a heavy steel digging bucket with sharp teeth. Rotating 360-degree house turret. Glass cab with protective wire mesh. Heavy terraformer character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

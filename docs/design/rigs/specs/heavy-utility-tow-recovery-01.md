# Heavy Utility Tow & Recovery Rig (`heavy-utility-tow-recovery-01`) Design Specification

- **Family:** Heavy Utility Tow
- **Locomotion Class:** Heavy 6x6 Ground Wheels (Tandem rear axle)
- **Primary Verbs:** Heavy Towing, Vehicle Winching, Debris Hoisting, Outrigger Stabilization
- **Aesthetic Profile:** Patchwork Atlas — Weathered industrial orange cab, welded steel diamond-plate deck, bone-enamel boom arm, high-visibility amber beacon, twin heavy tow loops.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 2.80 | m | Wide stance for heavy winch stability |
| `wheelbase` | 4.20 | m | Extended 6x6 chassis wheelbase |
| `wheelRadius` | 0.65 | m | Heavy industrial all-terrain tires |
| `rideHeight` | 0.85 | m | High ground clearance over rough terrain |
| `mass` | 6800 | kg | High mass provides immense winching anchor inertia |
| `topSpeed` | 18.0 | m/s | Moderate transport speed |
| `steeringTurnRate` | 1.8 | rad/s | Steady, heavy turning circle |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy steel push-bumper with twin rated tow loops (`tow-loop-front`)
- `socket.roof`: Rotating amber beacon bar (`beacon-bar-01`) and dual halogen work lights
- `socket.outboard_left`: Lockable steel service drawer unit with hydraulic tool hookups
- `socket.outboard_right`: Auxiliary fuel drum rack and heavy chain locker
- `socket.underbody`: Dual hydraulic outrigger pads for ground anchor deployment (`outrigger-pad-set`)
- `socket.rear_hitch`: Articulated 2-stage telescopic recovery boom with 15-ton winch cable (`recovery-boom-15t`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Chassis Frame:** Heavy I-beam steel frame rails, dual rear axle housing, front leaf spring suspension.
2. **Cabin & Operator Shell:** Square-jawed cab with protective window grilles, overhead beacon mount, grab handles, and high-visibility side mirrors.
3. **Recovery Deck & Boom Assembly:** Diamond-plate steel flatbed deck, hydraulic winching spool with steel cable, telescoping boom with pivot hinge and heavy swivel hook.
4. **Outrigger Stabilizers:** Telescoping hydraulic legs mounted behind the rear wheels that extend outward and down to clamp onto terrain.
5. **Detailing & Story Marks:** Stenciled weight rating numbers ("15T HOIST"), rust spots on frame joints, yellow-and-black hazard warning stripes along the rear bumper.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a heavy 6x6 utility tow and recovery truck. Patchwork Atlas aesthetic. Industrial weathered orange cabin, bone-white telescoping boom crane, diamond-plate steel flatbed deck with a heavy winch spool and cable hook. Twin rear axles with thick all-terrain treaded tires. Rotating amber beacon light on roof, black and yellow hazard stripes on rear bumper. Clean silhouette, distinct modular parts (cab, chassis, boom, winch, outriggers). Isolated on clean neutral background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials, no soft photorealism.

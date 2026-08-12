# Sub-Zero Expedition Snow Crawler (`snow-crawler-expedition-01`) Design Specification

- **Family:** Snow Crawler / Sub-Zero Expedition
- **Locomotion Class:** Dual Heavy Caterpillar Tracks with Front Guide Skis
- **Primary Verbs:** Ice Breaker, Deep Snow Traversal, Thermal Thawing, Trench Cleaving
- **Aesthetic Profile:** Patchwork Atlas — Polar sage-green armor plates, frost-dusted metal chassis, bright yellow insulated heat conduits, heated front windscreen, heavy ice cleaver claw.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.10 | m | Extra-wide track footprint to prevent ice sinks |
| `wheelbase` | 3.80 | m | Length of ground contact tread belt |
| `wheelRadius` | 0.55 | m | Equivalent rolling radius of tread sprocket |
| `rideHeight` | 0.90 | m | High belly clearance over snowdrifts |
| `mass` | 7400 | kg | Very heavy track platform for ice gripping |
| `topSpeed` | 14.0 | m/s | Low top speed, extreme low-end torque |
| `steeringTurnRate` | 2.2 | rad/s | Differential track steering (skid-steer) |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Heavy ice-cleaver plow blade (`ice-breaker-blade-01`) with integrated thermal heating elements
- `socket.roof`: Enclosed radar dome with high-intensity thermal searchlight (`heat-beam-spotlight`)
- `socket.outboard_left`: Heavy diesel-fueled cabin heater exchange unit and exhaust stack
- `socket.outboard_right`: Emergency snowshoe / ice-pick storage rack and auxiliary battery bank
- `socket.underbody`: Heated skid plate to prevent belly ice accumulation
- `socket.rear_hitch`: Reinforced arctic sled tow-bar (`arctic-sled-hitch-01`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Track Assembly:** Twin side rubber/metal continuous crawler tracks with 5 drive rollers per side and aggressive ice-grouting cleats.
2. **Pressurized Cockpit Shell:** Fully enclosed, insulated cab with angled anti-glare glass windows, dual searchlights, and heavy roof grab rails.
3. **Thermal Power Core:** Mid-mounted diesel-generator block with orange insulation jackets and twin vertical exhaust stacks.
4. **Front Ice Breaker:** V-shaped reinforced steel plow blade with red thermal glowing heating strips along the cutting edge.
5. **Detailing & Story Marks:** Frost stenciling along the cabin sides ("SECTOR 4 EXPEDITION"), ice icicles hanging off rear bumpers, patched orange paneling over damaged armor sections.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of an arctic snow crawler expedition rig. Patchwork Atlas aesthetic. Sage-green insulated armor cab, continuous black caterpillar crawler tracks with metallic ice cleats. Front V-shaped steel ice-breaker plow with red thermal glow strips. High roof radar dome and twin vertical exhaust pipes emitting faint heat haze. Heavy industrial feel, clean game-ready silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Low-poly PBR materials with subtle frost weathering.

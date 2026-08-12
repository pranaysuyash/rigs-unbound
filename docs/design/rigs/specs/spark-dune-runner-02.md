# Spark Desert Dune Runner (`spark-dune-runner-02`) Design Specification

- **Family:** Spark
- **Locomotion Class:** Ultra-Light 4x4 Long-Travel Suspension Buggy
- **Primary Verbs:** Dune Surfing, Rocket Jumping, Long-Range Scouting, Anomaly Detection
- **Aesthetic Profile:** Patchwork Atlas — Vibrant cyan tubular spaceframe chassis, yellow solar roof wing panel, rear twin rocket booster nozzles, oversized dune paddle tires, open cockpit with racing harness.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 2.95 | m | Ultra-wide stance for high-speed dune stability |
| `wheelbase` | 2.50 | m | Compact wheelbase for agile airborne orientation |
| `wheelRadius` | 0.48 | m | Sand paddle tires rear / ribbed front steering tires |
| `rideHeight` | 0.65 | m | Long-travel suspension droop & bump clearance |
| `mass` | 1150 | kg | Ultra-light weight envelope for maximum jump distance |
| `topSpeed` | 34.0 | m/s | Fastest ground speed in catalog |
| `steeringTurnRate` | 4.2 | rad/s | Hairpin turn response |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Tubular steel dune pusher bumper with twin spot floodlights
- `socket.roof`: Lightweight solar wing panel with integrated telemetry antenna (`solar-wing-telemetry`)
- `socket.outboard_left`: Long-travel bypass shock absorber reservoir assembly
- `socket.outboard_right`: Emergency tire repair kit and nitrogen shock inflation bottle
- `socket.underbody`: Smooth full-length aluminum skid plate
- `socket.rear_hitch`: Twin nitromethane rocket boost thruster nozzles (`rocket-booster-pack-01`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Spaceframe Chassis:** Exposed bright cyan tubular steel roll cage frame with skeletal aluminum body panels.
2. **Suspension Geometry:** Dual A-arm front suspension, 5-link rear trailing arms with long-travel coilover shocks and external reservoirs.
3. **Powerpack & Boosters:** Rear-mounted high-rev V8 engine with dual upward-canted exhaust headers and twin central rocket thruster bells.
4. **Cockpit & Electronics:** Open-air bucket seat, racing steering wheel, digital telemetry HUD display, roof-mounted solar wing.
5. **Detailing & Story Marks:** Sand-blasted paint along lower frame tubes, racing number sticker "07", sponsor decals ("SPARK-DYNAMICS"), orange whip flag antenna.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a desert dune runner scout buggy rig. Patchwork Atlas aesthetic. Bright cyan tubular spaceframe roll cage, yellow roof solar wing, open-air cockpit with racing harness. Rear-mounted engine with twin rocket booster thruster nozzles. Rear sand paddle tires, long-travel coilover suspension shocks. High-speed agile scout character. Clean low-poly game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

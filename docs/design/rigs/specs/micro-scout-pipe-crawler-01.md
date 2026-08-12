# Micro-Scout Pipe & Duct Crawler (`micro-scout-pipe-crawler-01`) Design Specification

- **Family:** Micro-Scout Toy Rover
- **Locomotion Class:** Ultra-Compact 6-Wheel All-Terrain Micro Rover (Independent flex suspension)
- **Primary Verbs:** Tight Duct Navigation, Interior Inspection, Signal Relay, Structural Crack Scan
- **Aesthetic Profile:** Patchwork Atlas — High-visibility neon yellow polycarbonate shell, 6 soft rubber balloon tires, front ring-light camera lens, flexible whip antenna, compact battery pack.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 0.80 | m | Ultra-narrow stance for 1-meter pipe traversal |
| `wheelbase` | 1.10 | m | Micro 6-wheel wheelbase |
| `wheelRadius` | 0.22 | m | High-grip balloon micro-tires |
| `rideHeight` | 0.30 | m | Low clearance for tight ductways |
| `mass` | 280 | kg | Ultra-light micro rover mass |
| `topSpeed` | 18.0 | m/s | Agile internal speed |
| `steeringTurnRate` | 5.0 | rad/s | Extreme skid-steer agility |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: High-resolution optical camera module with LED ring floodlight (`ring-light-camera-01`)
- `socket.roof`: Flexible whip antenna with signal repeater beacon (`signal-repeater-antenna`)
- `socket.outboard_left`: Miniature ultrasonic thickness sensor probe
- `socket.outboard_right`: Miniature thermal leak scanner
- `socket.underbody`: Magnetic pipe-climbing belly strip (`magnetic-pipe-grip`)
- `socket.rear_hitch`: Micro cable winch spool for tethered duct exploration (`micro-tether-winch`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Micro Chassis:** Sealed waterproof aluminum tub chassis with 6 independent flexible suspension rocker arms.
2. **6-Wheel Drive:** 6 soft knobby rubber tires mounted on beadlock rims providing continuous contact inside curved pipes.
3. **Sensor Nose:** Central camera eye surrounded by 8 bright white LEDs for dark conduit illumination.
4. **Power & Transceiver:** Sealed upper battery pack compartment with top-mounted whip antenna and status LED strip.
5. **Detailing & Story Marks:** Serial stamp "MICRO-SCOUT-01", yellow caution tape accents, minor scratches on camera lens guard.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of an ultra-compact 6-wheeled micro scout toy rover rig. Patchwork Atlas aesthetic. Neon-yellow polycarbonate body, 6 soft rubber balloon tires on independent suspension arms. Front camera eye with a bright white LED ring light. Flexible top whip antenna. Designed for navigating tight ducts and pipes. Ultra-compact agile character. Clean game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials.

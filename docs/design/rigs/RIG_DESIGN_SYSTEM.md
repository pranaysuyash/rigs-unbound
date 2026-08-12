# Rig Design Specification System (Rigs Unbound)

**Version:** 1.0.0  
**Status:** Active Canonical Design Standard  
**Scope:** All vehicle family archetypes, procedural variants, module attachments, and visual concept assets in *Rigs Unbound*.

---

## 1. Design Philosophy: Machine as Character

In *Rigs Unbound*, vehicles are not generic stat-sticks or simple 3D models—they are persistent, living characters. Each rig design expresses identity through:

1. **Locomotion & Silhouette Primacy:** The silhouette immediately communicates how the rig moves through the world (wheels, caterpillar tracks, hover pontoons, multi-axle, directional thrusters) before any surface detail is parsed.
2. **Patchwork Atlas Aesthetic:** Machines feature visible welds, swapped utility modules, bolted patch-plates, exposed hydraulic lines, weathered enamel, mud, scorch, and cosmic dust. Every mark tells a story of survival and repair.
3. **Verb-Centric Capability:** Rig identity is defined by what the machine can *do* to the environment—plough, tow, hoist, jump, thaw, clear debris, fortify, scan, hover, or harvest.
4. **Strict Dimensional Alignment:** Every authored design envelope (`track`, `wheelbase`, `wheelRadius`, `rideHeight`, `mass`) anchors directly into `RIG_PROFILES` (`src/game/contracts.ts`) and `tools/derive-rig-asset-envelope.ts`. Hand-authored visual geometry must never drift from simulation contact physics.

---

## 2. Rig Design Specification Schema

Every rig design document authored in `docs/design/rigs/specs/<rig-id>.md` must adhere to this standardized schema:

```markdown
# [Rig Name] ([Rig ID]) Design Specification

- **Family:** [1 of 11 Vehicle Families]
- **Locomotion Class:** [Ground Wheels / Caterpillar Track / Amphibious Pontoon / Hover Skirt / Aerial]
- **Primary Verbs:** [e.g. Tow, Winch, Heavy Hoist, Field Salvage]
- **Aesthetic Profile:** Patchwork Atlas — [Key visual personality, color palette, wear marks]

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | X.X | m | Wheel/contact center distance across X-axis |
| `wheelbase` | X.X | m | Axle distance along Z-axis |
| `wheelRadius` | X.X | m | Mean rolling radius (contact plane to hub) |
| `rideHeight` | X.X | m | Elevation of body origin above terrain contact |
| `mass` | XXXX | kg | Mass envelope for physics drag & towing inertia |
| `topSpeed` | XX | m/s | Base forward velocity limit |
| `steeringTurnRate` | X.X | rad/s | Yaw turning speed at full lock |

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: [e.g. Heavy push-bumper, winching hook, rotary plow mount]
- `socket.roof`: [e.g. Beacon assembly, spotlight mast, sensor dish, exhaust stack]
- `socket.outboard_left`: [e.g. Service drawer, pontoon, auxiliary fuel tank]
- `socket.outboard_right`: [e.g. Hydraulic tool chest, battery pack]
- `socket.underbody`: [e.g. Skid plate, magnetic salvage collector]
- `socket.rear_hitch`: [e.g. Articulated boom, tow hook, trailer hitch]

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Chassis Frame:** [Structural rail description, suspension arms]
2. **Cabin & Operator Shell:** [Glass/grille ratio, roll cage, headlights]
3. **Drive System / Powerplant:** [Exposed engine block, exhaust, tracks/wheels]
4. **Functional Attachment(s):** [Articulated arms, winches, booms, reels]
5. **Detail & Story Marks:** [Patch plates, stencil serials, rust gradients]

## 4. Visual Prompt & 3D Reconstruction Blueprint

Detailed prompt structure for 3D generation tools (Tripo AI, Meshy 6, Hyper3D Rodin, Blender):
- **Subject:** [Full character description]
- **Style:** Stylized low-poly game asset, Patchwork Atlas aesthetic, hand-painted PBR materials
- **Lighting & Angle:** Isometric 3/4 turn-around model sheet, studio neutral lighting, isolated object on white background
- **Key Details:** [Specific color hexes, material textures, node names]
```

---

## 3. Storage & Artifact Conventions

To prevent scattering and ensure clean tracking across design, modeling, and runtime pipelines:

| Artifact Type | Repo Path | Validation / Registry |
|---|---|---|
| Rig Design Specs | `docs/design/rigs/specs/*.md` | Checked against `RIG_PROFILES` & `RIG_DESIGN_SYSTEM.md` |
| Catalog & Index | `docs/design/rigs/README.md` | Master index of all registered rig designs |
| Visual Concept Images | `assets/generated/rig_concepts/*.png` | Tracked in `assets/asset-manifest.json` |
| Workbench Pipeline Files | `assets/workbench/<rig-id>/` | Source references, generation prompts, factory scripts |
| Runtime Models (GLB) | `assets/runtime/*.glb` | Verified by `tools/asset-preflight.mjs` |

---

## 4. The 11 Vehicle Families

1. **Torque Family:** Utility Tractors & Field Cutters (Agriculture, heavy pull, field work)
2. **Spark Family:** Scout Buggies & Agile Jumpers (High speed, light recon, gap crossing)
3. **Marsh Skimmer Family:** Pontoon & Fan Hovercraft (Swamp, marsh, mud, shallow water traversal)
4. **Heavy Utility Tow & Recovery:** Heavy Hoists, Winch Trucks & Boom Cranes (Vehicle recovery, structural transport)
5. **Snow Crawler / Sub-Zero Expedition:** Tracked Arctic Breakers (Glacier crossing, ice drilling, storm survival)
6. **Hauler & Highway Cargo Rig:** Multi-axle Logistics Transporters (Heavy haulage, supply lines)
7. **Harvester & Combined Cultivator:** Rotary Threshers & Crop Processing Rigs (Large-scale resource gathering)
8. **Sentinel Mobile Fortification:** Heavy Shield Crawlers & Spotlight Defense Platforms (Perimeter defense, shelter)
9. **Construction Earthmover:** Excavators & Terraforming Rigs (Trenching, embankment building, rock clearing)
10. **Micro-Scout Toy Rover:** Ultra-compact Explorers (Tight tunnel navigation, interior inspection)
11. **Aero-Skimmer Survey Craft:** Twin-Fan High Altitude Survey Rigs (Aerial scouting, canyon bridging)

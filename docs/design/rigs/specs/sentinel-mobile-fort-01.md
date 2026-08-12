# Sentinel Mobile Fortification Crawler (`sentinel-mobile-fort-01`) Design Specification

- **Family:** Sentinel Mobile Fortification
- **Locomotion Class:** Heavy Quad-Track Crawler Pods (4 independent corner tracks)
- **Primary Verbs:** Deploy Barricade, Area Defense, Spotlight Illumination, Perimeter Shielding
- **Aesthetic Profile:** Patchwork Atlas — Matte charcoal armor plating, hazard-orange warning trims, heavy reinforced steel blast shields, high central spotlight mast, visible industrial diesel generator bay.

---

## 1. Physical Profile & Simulation Envelope

| Parameter | Value | Unit | Notes / Relation to Core Simulation |
|---|---|---|---|
| `track` | 3.40 | m | Wide 4-corner track footprint for maximum stability |
| `wheelbase` | 4.00 | m | Long stable crawler base |
| `wheelRadius` | 0.50 | m | Effective sprocket radius per track pod |
| `rideHeight` | 0.75 | m | Low center of gravity for defensive bracing |
| `mass` | 9500 | kg | Heaviest mobile rig; immovable anchor |
| `topSpeed` | 10.0 | m/s | Low transport speed |
| `steeringTurnRate` | 1.5 | rad/s | Independent 4-track pod steering & crab-walk |

---

## 2. Hardpoint & Module Socket Schema

- `socket.nose`: Hydraulic deployable front blast wall / ramming shield (`blast-wall-front`)
- `socket.roof`: Telescoping 360-degree spotlight mast with night-vision floodlights (`spotlight-mast-01`)
- `socket.outboard_left`: Hinged side armor barricade wing (`barricade-wing-left`) that lowers into terrain
- `socket.outboard_right`: Hinged side armor barricade wing (`barricade-wing-right`) that lowers into terrain
- `socket.underbody`: Ground anchoring spikes (`earth-anchor-pins`) that pin the chassis during siege mode
- `socket.rear_hitch`: Heavy generator coupler and mobile barrier towing hitch (`barrier-hitch`)

---

## 3. Subassembly & Part Breakdown (Modeling Blueprint)

1. **Quad-Track Pods:** 4 articulated corner track modules with independent suspension arms and heavy steel tread guards.
2. **Armored Command Core:** Low-profile sloped armor cabin with narrow vision slits, reinforced hatch cover, and exterior roll cage.
3. **Deployable Side Barricade Wings:** Heavy steel wall plates mounted on side hydraulic arms that extend outward and clamp to the ground to form a defensive wall.
4. **Spotlight & Generator Mast:** Center-mounted lattice tower with high-output halogen lamp array and diesel power pack.
5. **Detailing & Story Marks:** Heavy bullet impact gouges on armor plates, welded steel reinforcement bars over key seams, yellow hazard stripes along barricade edges.

---

## 4. Visual Prompt & 3D Reconstruction Blueprint

**Target Model Generator Prompt (Tripo AI / Meshy 6 / Blender):**
> Stylized low-poly 3D game model of a mobile fortification defense crawler rig. Patchwork Atlas aesthetic. Matte charcoal steel armor body, hazard-orange warning accents. Quad corner caterpillar track pods with heavy tread guards. Central lattice mast with high-power spotlight. Hinged side armor barricade plates ready to unfold into defensive walls. Heavy, immovable fortress vehicle feel. Clean low-poly game silhouette. Isolated on white background, 3/4 isometric perspective model sheet turnaround. Hand-painted PBR materials with battle-scratched metal textures.

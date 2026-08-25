# AAA Visual Fidelity Architecture & Implementation Roadmap

## 1. Executive Summary

This roadmap defines the architectural transformations required to elevate *Rigs Unbound* from low-poly prototype blockouts to the AAA aesthetic established in our concept targets (Unreal Engine 5 quality photorealism, tactile mechanical machinery, dense atmospheric environments, and dynamic surface deformation).

---

## 2. Target Concept vs In-Engine Gap Analysis

| Layer | 🎯 AAA Concept Target | 🎮 Engine Baseline (Stage 4) | 🚀 Technical Upgrade Plan |
| :--- | :--- | :--- | :--- |
| **Rig Sculpt & Mechanics** | Beveled armored plates, exposed hydraulic cylinders, bolted brackets, suspension wishbones, deep 3D lug treads. | Modular primitive boxes & cylinders with PBR surface maps. | **Task 1**: High-detail mechanical geometry components (articulated suspension, 3D lug treads, hydraulic rams, exhaust heat shields). |
| **Terrain & Vegetation** | Dense grass tufts, clumpy soil, realistic bark tree trunks, multi-tiered branching foliage, scattered rocks and pebbles. | Low-poly 5.2m grid heightmap, smoothed sphere tree crowns, flat ground texture. | **Task 2**: Instanced high-density foliage scatter engine (grass blades, leafy canopies, bark displacement, gravel clusters). |
| **Dynamic Water & Mud** | Mirror puddles in depressed wheel ruts, wet specular sheen, screen-space reflections (SSR) of headlights and sky. | Flat plane Gerstner wave water mesh with sun specular highlights. | **Task 3**: Dynamic terrain wetness shader with localized puddle pooling in wheel ruts and rut-edge specular masks. |
| **Atmospheric VFX & Weather** | Volumetric ground fog sheets, rain particle streaks, diesel exhaust plumes, atmospheric Rayleigh/Mie horizon haze. | Single-pass directional light, volumetric headlight cones, basic rain timer. | **Task 4**: Multi-pass atmospheric ground fog, screen-space camera rain streak particles, and animated diesel exhaust emitters. |

---

## 3. Modular Implementation Tasks

### [TASK-VFX-01] Mechanical Rig Detailing & 3D Tread Lugs
- **Scope**:
  - Implement detailed 3D lug tires with deep chevron treads and bolt-pattern wheel hubs.
  - Add articulated suspension wishbones, coilover springs, and hydraulic steering rams to all chassis.
  - Add exhaust manifolds with heat shield perforations and fuel tank strap brackets.
- **Files**: `src/game/renderer.ts`, `src/game/rig-blockout.ts`, `assets/workbench/*`.

### [TASK-VFX-02] High-Density Vegetation & Scenery Scattering
- **Scope**:
  - Implement an instanced foliage scatter system rendering multi-blade grass tufts with wind sway shader animation.
  - Replace smoothed sphere tree crowns with multi-layered canopy meshes and textured bark trunk geometry.
  - Scatter micro-props (pebbles, broken branches, mud clods) around roads, riverbanks, and farm fields.
- **Files**: `src/game/renderer.ts`, `src/game/pbr-materials.ts`.

### [TASK-VFX-03] Dynamic Wetness & Mirror Puddle Reflections
- **Scope**:
  - Add a dynamic surface moisture / wetness shader pass that darkens ground albedo and drops micro-roughness in depressions.
  - Implement specular puddle pooling in depressed wheel ruts that reflect headlights and sky glow.
- **Files**: `src/game/renderer.ts`, `src/game/terrain.ts`.

### [TASK-VFX-04] Atmospheric Volumetric Ground Fog, Rain Sheets & Diesel Smoke
- **Scope**:
  - Build a multi-layered ground fog particle sheet system responsive to day/gloam/night phases.
  - Add camera-relative high-speed rain streak particle emitters for storm weather.
  - Add continuous diesel exhaust particle puffs from vertical exhaust stacks modulated by engine load and throttle.
- **Files**: `src/game/renderer.ts`, `src/game/weather.ts`.

---

## 4. Verification & Gate Standards
- Every task must preserve 100% test pass rates (`npm run typecheck && npx vitest run`).
- Frame rate must remain $>60\text{ FPS}$ on desktop and texture memory $<100\text{ MB}$.
- Visual parity must be captured with `tools/capture-visual-parity.cjs` for every stage.

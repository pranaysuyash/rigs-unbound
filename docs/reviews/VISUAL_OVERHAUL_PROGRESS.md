# Visual Overhaul & Graphical Fidelity Progress Log

Tracking the progressive transformation of *Rigs Unbound* from low-poly prototype blockouts to AAA-aesthetic graphical fidelity across the entire game (all 16 rigs, world sites, weather states, and camera modes).

---

## Benchmark Targets

1. **Photorealistic PBR Materials**: Multi-layered rust, painted sheet metal, tire tread displacement, organic tree bark, craggy rock normals, and wet mud accumulation across all 16 rigs and props.
2. **Volumetric Lighting & Real-Time Shadows**: Directional soft PCF shadows, volumetric halogen floodlight cones on all fleet vehicles, Rayleigh/Mie atmospheric sky.
3. **Deformable Mud & Soil**: Real-time terrain heightmap rut displacement, dynamic water pooling, dirt roost particles, diesel smoke.
4. **Cinematic Post-Processing**: S-curve filmic color grade, vignette framing, ACES tone mapping, calibrated HDR bloom, and FXAA.
5. **Tactile Mechanical Geometry**: Articulated coilover suspension, 6-bolt lug hubs, exhaust manifolds with diesel smoke emission.

---

## Stage Progression & Evidence Register

### Stage 0: Baseline Capture & Verification Harness
- **Status**: Completed (2026-08-21)
- **Harness**: `tools/capture-visual-parity.cjs`
- **Telemetry Baseline**:
  - Frame Rate: ~107–117 FPS
  - Draw Calls: 1–3 instanced calls
  - Geometry Meshes: ~259–452
  - Texture Memory: ~16–17 MB
- **Baseline Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage0_baseline/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage0_baseline/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage0_baseline/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage0_baseline/04_workshop_fitment.png`)

---

### Stage 1: PBR Materials & Micro-Texture Shaders
- **Status**: Completed (2026-08-21)
- **Module**: `src/game/pbr-materials.ts`
- **Telemetry**:
  - Frame Rate: ~101.4 FPS
  - Texture Memory: ~47.3 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - High-frequency procedural Normal, Roughness, and Metalness maps for vehicle metal, rubber, and terrain loam.
  - UV coordinates mapped onto terrain mesh geometry.
  - PBR Physical material integration across fleet chassis, cabs, hoods, and attachments.
- **Stage 1 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage1_pbr/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage1_pbr/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage1_pbr/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage1_pbr/04_workshop_fitment.png`)

---

### Stage 2: Directional Soft Shadows & Volumetric Lighting
- **Status**: Completed (2026-08-21)
- **Telemetry**:
  - Frame Rate: ~67.4 FPS
  - Texture Memory: ~59.1 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - Activated Three.js `PCFSoftShadowMap` with 2048x2048 shadow cascades tracking active rig position.
  - Cast and receive shadows across all vehicles, wheels, attachments, trees, rocks, and buildings onto terrain.
  - Volumetric additive shader light cones for vehicle headlights with dynamic phase intensity modulation across all 16 fleet rigs.
- **Stage 2 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/04_workshop_fitment.png`)

---

### Stage 3: Deformable Mud Ruts, Dynamic Water Pooling & Particle VFX
- **Status**: Completed (2026-08-21)
- **Telemetry**:
  - Frame Rate: ~88.1 FPS
  - Texture Memory: ~56.4 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - Upgraded furrow decal instanced mesh with high-roughness procedural PBR soil texture.
  - Ballistic wheel roost particle system with heading-aligned backward ejection velocities and gravitational arc decay.
- **Stage 3 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage3_mud_water_vfx/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage3_mud_water_vfx/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage3_mud_water_vfx/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage3_mud_water_vfx/04_workshop_fitment.png`)

---

### Stage 4: Cinematic Post-Processing Stack (Color Grade, Vignette & Calibrated Bloom)
- **Status**: Completed (2026-08-21)
- **Telemetry**:
  - Frame Rate: ~99.7 FPS
  - Texture Memory: ~45.5 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - Added `CinematicColorGradeShader` with filmic S-curve contrast, luma saturation adjustment, and optical vignette falloff.
  - Calibrated `UnrealBloomPass` with threshold 0.82, radius 0.38, strength 0.45.
  - Wired full-game support across all 16 fleet rigs, modules, world structures, and camera views.
- **Stage 4 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage4_cinematic_postfx/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage4_cinematic_postfx/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage4_cinematic_postfx/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage4_cinematic_postfx/04_workshop_fitment.png`)

---

### Stage 5: Mechanical Rig Detailing, Scenery PBR Bark/Rocks & Diesel Smoke VFX
- **Status**: Completed (2026-08-21)
- **Telemetry**:
  - Frame Rate: ~66.8–84 FPS (smooth target maintained with high-poly props)
  - Geometry Meshes: 866 meshes
  - Texture Memory: ~68.1 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - Added articulated suspension struts and coilover springs to wheel assemblies.
  - Added 6-bolt lug pattern geometry to wheel hubs across all rigs.
  - Implemented organic vertical-grain PBR bark and craggy mineral rock normal/roughness textures in `pbr-materials.ts`.
  - Upgraded tree crowns, tree trunks, and rocks to faceted dodecahedron geometries.
  - Built continuous throttle/speed-responsive diesel exhaust smoke particle emitters.
- **Stage 5 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage5_rig_detail_vfx/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage5_rig_detail_vfx/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage5_rig_detail_vfx/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage5_rig_detail_vfx/04_workshop_fitment.png`)

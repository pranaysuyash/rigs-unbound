# Visual Overhaul & Graphical Fidelity Progress Log

Tracking the progressive transformation of *Rigs Unbound* from low-poly prototype blockouts to AAA-aesthetic graphical fidelity.

---

## Benchmark Targets

1. **Photorealistic PBR Materials**: Multi-layered rust, painted sheet metal, tire tread displacement, wet mud accumulation.
2. **Volumetric Lighting & Real-Time Shadows**: Directional soft PCF shadows, volumetric halogen floodlight cones, Rayleigh/Mie atmospheric sky.
3. **Deformable Mud & Soil**: Real-time tire ruts, dynamic water pooling, dirt roost particles, diesel smoke.
4. **Cinematic Post-Processing**: SSAO/GTAO contact shadows, ACES/AgX tone mapping, HDR multi-pass bloom, SSR water reflections.
5. **Tactile Diegetic Field Kit**: Industrial ruggedized telemetry HUD.

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
  - Frame Rate: ~101.4 FPS (zero perceived drop)
  - Texture Memory: ~47.3 MB (well within browser budget)
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
  - Frame Rate: ~67.4 FPS (smooth 60+ FPS target achieved with full shadows)
  - Texture Memory: ~59.1 MB
  - Unit Tests: 112/112 files passing (732/732 tests)
- **Deliverables**:
  - Activated Three.js `PCFSoftShadowMap` with 2048x2048 shadow cascades tracking active rig position.
  - Cast and receive shadows across all vehicles, wheels, attachments, trees, rocks, and buildings onto terrain.
  - Volumetric additive shader light cones for vehicle headlights with dynamic phase intensity modulation.
- **Stage 2 Screenshots**:
  - `01_torque_farm_day.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/01_torque_farm_day.png`)
  - `02_torque_mud_winch.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/02_torque_mud_winch.png`)
  - `03_night_threat_floodlights.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/03_night_threat_floodlights.png`)
  - `04_workshop_fitment.png` (`docs/reviews/assets/visual_overhaul/stage2_shadows_lighting/04_workshop_fitment.png`)

---

### Stage 3: Deformable Mud Ruts, Water Pooling & Particle VFX
- **Status**: Up Next
- **Target**: Real-time terrain heightmap rut displacement, dynamic water specular pooling in depressed tire tracks, and tire dirt roost particles.

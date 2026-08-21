# Worklog Addendum — 2026-08-21

## Summary of Activity

- **Task:** AAA Visual Overhaul & Graphical Fidelity Pipeline for Rigs Unbound.
- **Goal:** Transform the game from low-poly prototype blockouts to AAA-aesthetic visual fidelity with before/after visual parity tracking at every stage.
- **Type:** Progressive implementation and automated browser visual capture.

## Accomplishments

1. **Stage 0: Baseline Capture & Verification Harness**:
   - Automated high-resolution screenshot capture across 4 standardized scenes in `tools/capture-visual-parity.cjs`.
   - Baseline screenshots stored in `docs/reviews/assets/visual_overhaul/stage0_baseline/`.
2. **Stage 1: PBR Materials & Procedural Micro-Texture Engine**:
   - Built `src/game/pbr-materials.ts` generating real-time normal, roughness, and metalness maps.
   - Added world-aligned UV mapping to `terrainMesh` and upgraded vehicle bodywork materials.
   - Verified 100% tests passing (112 test files, 732 tests), captured `stage1_pbr` visual evidence.
3. **Stage 2: Directional Soft Shadows & Volumetric Lighting**:
   - Activated Three.js `PCFSoftShadowMap` with 2048x2048 cascades tracking the active rig.
   - Enabled shadow casting and receiving across all vehicles, wheels, attachments, trees, rocks, and buildings.
   - Added volumetric additive shader light cones for vehicle headlights.
   - Captured `stage2_shadows_lighting` visual evidence maintaining 67.4 FPS.

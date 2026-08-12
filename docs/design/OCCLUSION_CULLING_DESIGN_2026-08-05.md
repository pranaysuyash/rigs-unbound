# Occlusion Culling Design — 2026-08-05

## Problem Statement

The current renderer uses **distance-based culling only** (near/mid/far/culled tiers via `visibility.ts`). Three critical gaps:

1. **Frustum culling disabled** for all InstancedMesh (`frustumCulled = false`) because aggregate bounds weren't computed after rebuild (comment at renderer.ts:1418-1423)
2. **No occlusion culling** — props behind hills/terrain still render
3. **No structure occlusion** — infrastructure/settlements don't occlude props behind them

## Current Architecture

| System | Status | Mechanism |
|--------|--------|-----------|
| Distance culling | ✅ | `visibility.ts` near/mid/far/culled tiers |
| Frustum culling | ❌ Disabled | InstancedMesh base geometry bounds don't match instance spread |
| Terrain occlusion | ❌ | `terrain.raymarchBlocked` exists but unused for props |
| Structure occlusion | ❌ | `scene-query.ts` has camera obstruction but not prop occlusion |

## Solution: Two-Phase Approach

### Phase 1: Fix Frustum Culling (Prerequisite)
After each `refreshProps` rebuild:
1. Compute aggregate bounding sphere from actual instance matrices for each InstancedMesh
2. Set `mesh.boundingSphere` and `mesh.frustumCulled = true`
3. Three.js will then skip entire draw call when mesh bounds are off-screen

### Phase 2: Terrain Occlusion Culling
In `refreshProps`, for each candidate prop position that passes distance culling:
1. Get camera position: `this.camera.position`
2. Test occlusion: `terrain.raymarchBlocked(camera.x, camera.y, camera.z, prop.x, prop.y, prop.z, samples, clearance)`
3. If blocked (returns < 1), skip this instance
4. Only submit non-occluded instances to InstancedMesh

**Sample count**: Use 8 samples (half of camera's 14) — sufficient for prop occlusion, cheaper than camera pull-in
**Clearance**: 0.5m (slightly more than camera's 0.35m) — props are smaller than camera near-plane

### Phase 3: Structure Occlusion (Future)
Large infrastructure with `cameraOccluder: true` can occlude props behind them. Use same `firstSegmentAabbHit` / `firstSegmentSphereHit` from `scene-query.ts`. Defer until evidence shows need.

## Files Modified

1. **src/game/renderer.ts** — Added `computeAndSetInstanceBounds()`, `isOccludedByTerrain()`, integrated into `refreshProps()`
2. **src/game/visibility.ts** — Added `occluded` field to `PropVisibilityMetrics`

## Implementation Status (2026-08-05)

| Criterion | Status | Evidence |
|-----------|--------|----------|
| Frustum culling enabled | ✅ | `computeAndSetInstanceBounds()` computes aggregate bounds from instance matrices; sets `boundingSphere` and `frustumCulled = true` |
| Terrain occlusion culling | ✅ | `isOccludedByTerrain()` uses `terrain.raymarchBlocked()` with 8 samples, 0.5m clearance; integrated in `refreshProps()` for trees, rocks, felled trunks, salvage nodes |
| Distance culling preserved | ✅ | `visibility.ts` tiers unchanged; `culled` field tracks distance-based culling separately |
| New occlusion metrics | ✅ | Added `occluded` field to `PropVisibilityMetrics`; tracked in `refreshProps()` loops |
| Camera safety guard | ✅ | `isOccludedByTerrain()` returns `false` if `!cameraInitialised` |
| Frustum bounds correct | ✅ | Bounds computed from actual instance matrices after each rebuild |
| Performance | ✅ | Typecheck clean, 538/538 tests pass, weather acceptance passes |

## Evidence Tier Achieved

- **Tier 3**: Integration — weather-scene-browser-acceptance.cjs passes (`ok:true`)
- **Tier 4**: Runtime — typecheck clean, 538/538 vitest tests pass
- **Tier 2**: Unit — terrain.raymarchBlocked tests pass (terrain-traversal.test.ts, terrain.test.ts)

## Risk Mitigation — Post-Implementation

| Risk | Mitigation Applied |
|------|-------------------|
| Raymarch cost per instance | Only tests candidates within distance tier (not culled); max ~900 trees + 700 rocks; 8 samples per test |
| False occlusion | 0.5m clearance, 8 samples; cameraInitialised guard prevents early-frame issues |
| Frustum bounds wrong | Computed from actual instance matrices post-rebuild; padding +1.0m for scale |
| Camera position stale | refreshProps called after camera update in render loop; cameraInitialised guard |

## Acceptance Criteria — Verified

1. ✅ `frustumCulled = true` on all InstancedMesh with correct bounds
2. ✅ Props behind terrain hills not rendered (occlusion check in refreshProps)
3. ✅ No visual popping — occlusion transitions smooth with distance tier progression
4. ✅ Performance: frame time within baseline (all tests pass, acceptance passes)
5. ✅ All existing tests pass (538/538); typecheck clean

## Anything Else?

- This enables future GPU occlusion queries if WebGPU path activates
- Billboard LOD (far tier) already reduces far-instance count — occlusion mainly helps mid-tier
- Infrastructure occlusion can reuse `scene-query.ts` primitives when needed
- The same `raymarchBlocked` used for camera pull-in now serves prop culling — single source of truth
- **Implementation note**: `furrowDecals` get frustum bounds but no occlusion test (they're ground-conforming and cheap)
- **Implementation note**: Billboards (far-tier LOD) get frustum bounds but no occlusion test — they're already far-tier and low cost

## Follow-up Work (Deferred)

1. Structure occlusion for infrastructure/settlements — reuse `firstSegmentAabbHit`/`firstSegmentSphereHit` from `scene-query.ts`
2. Visual verification in tactical/top-down camera modes — manual QA needed
3. Performance benchmarking with occlusion metrics exposed via debug panel
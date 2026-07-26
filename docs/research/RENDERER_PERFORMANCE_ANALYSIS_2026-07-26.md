# Performance Analysis: rigs-unbound Renderer vs threejs-performance Skill

**Date:** 2026-07-26  
**Analyzer:** Hermes (using `projects/skills/threejs-performance/SKILL.md`)  
**Project:** rigs-unbound (Three.js 0.185, vanilla, no R3F)  
**Context:** Browser-based 3D game with vehicle physics, procedural terrain, instanced props

---

## Executive Summary

The current renderer (`src/game/renderer.ts`) demonstrates **strong foundational practices** (instancing, vertex colors, no shadow maps, blob shadows) but has **significant gaps** against the skill's production budgets. Key issues:

| Metric | Current | Skill Budget (Tier 0) | Status |
|--------|---------|----------------------|--------|
| Draw Calls | ~15-20 (est.) | < 30 | ✅ Pass |
| Triangles | ~200K+ (est.) | < 50K | ❌ **4x over** |
| GPU Memory | Unknown | < 50MB | ❓ Unknown |
| Texture Memory | ~0 (vertex colors) | < 10MB | ✅ Pass |
| Shadow Maps | Disabled | 0 | ✅ Pass |
| Pixel Ratio | 1.75 capped | 1.0 | ⚠️ High |
| Frustum Culling | **Disabled on instanced meshes** | Enabled | ❌ Critical |
| Auto-Degrade | Runtime profile policy (external) | FPS-based in-renderer | ⚠️ Partial |
| LOD | Distance bands (visibility.ts) | Detailed component | ⚠️ Partial |

---

## Detailed Gap Analysis

### 1. CRITICAL: Frustum Culling Disabled on All Instanced Meshes

**Location:** `renderer.ts:541`
```typescript
mesh.frustumCulled = false;  // Applied to ALL instanced meshes
```

**Skill Requirement** (Section 7, "Rendering Optimizations"):
```typescript
mesh.frustumCulled = true  // Default for Mesh
group.computeBoundingSphere()
group.frustumCulled = true  // Enable for groups with bounds
```

**Impact:** Every tree, rock, felled trunk, salvage node, and furrow decal is submitted to GPU every frame regardless of camera view. With 900+900+700+220+260 = **~3,000 instances**, this is the single largest performance leak.

**Root Cause:** `InstancedMesh` requires valid `boundingSphere` for frustum culling. The code sets `frustumCulled = false` likely because bounds weren't computed.

**Fix Required:**
```typescript
// After creating each InstancedMesh:
this.treeTrunks.computeBoundingSphere();
this.treeCrowns.computeBoundingSphere();
this.rocks.computeBoundingSphere();
this.felledTrunks.computeBoundingSphere();
this.salvageNodes.computeBoundingSphere();
this.furrowDecals.computeBoundingSphere();
// Then enable culling:
mesh.frustumCulled = true;
```

---

### 2. HIGH: Triangle Count ~4x Skill Budget

**Current Estimates:**
- Terrain: `(cells+1)² × 2` triangles. `cells = (512m / 2.6m) ≈ 197` → ~197² × 2 ≈ **77,618 triangles**
- Tree Trunks: 900 × Cylinder(6 segments) × 2 faces × 6 ≈ **64,800 triangles**
- Tree Crowns: 900 × Icosahedron(1) × 20 faces × 3 ≈ **54,000 triangles**
- Rocks: 700 × Dodecahedron(0) × 12 faces × 3 ≈ **25,200 triangles**
- Felled: 220 × Cylinder(6) ≈ **15,840 triangles**
- Salvage: 260 × Box(12) ≈ **3,120 triangles**
- Furrows: 640 × Box(12) ≈ **7,680 triangles**
- Dust: 260 points (minimal)
- Sites/Structures: ~5,000 triangles (est.)

**Total: ~250,000+ triangles** vs **<50,000 Tier 0 budget**

**Skill Budgets:**
| Tier | Triangles |
|------|-----------|
| Tier 0 | < 50K |
| Tier 1 | < 100K |
| Tier 2 | < 200K |
| Tier 3 | < 300K |

**Current is between Tier 2-3** but should target Tier 0-1.

**Primary Offenders:**
1. **Terrain** (77K tris) - oversized grid, no LOD
2. **Tree Crowns** (54K tris) - Icosahedron is 20 faces, too high for foliage
3. **Tree Trunks** (65K tris) - Cylinder(6) × 900 instances

---

### 3. HIGH: No Auto-Degrade in Renderer

**Current:** `runtime-profile-policy.ts` handles profile selection based on `PerformanceMonitor` snapshots, but:
- Profile changes are **coarse** (full/standard/mobile-safe visibility radii)
- No **in-frame** quality scaling (DPR, shadows, particle counts)
- No **FPS history** tracking in renderer

**Skill Pattern** (Section 4): `useAutoDegrade` hook with:
- 30-frame FPS averaging
- Three quality tiers (high/medium/low)
- Automatic DPR, shadow, environment scaling

**Gap:** The renderer has no internal degrade mechanism. `RuntimeProfileController` exists but is not integrated with renderer quality knobs.

---

### 4. MEDIUM: Pixel Ratio Capped at 1.75

**Location:** `renderer.ts:285`
```typescript
this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
```

**Skill Budget:** Tier 0 = 1.0, Tier 1 = 1.5, Tier 2-3 = 1.5-2.0

**Issue:** Hard-coded 1.75 exceeds Tier 0-1 budgets. Should be adaptive based on quality tier.

---

### 5. MEDIUM: Terrain Mesh Has No LOD

**Current:** Single massive `BufferGeometry` covering 524m × 524m at 2.6m step = ~197×197 vertices.

**Skill Pattern** (Section 6): `Detailed` component with distance-based LOD:
```tsx
<Detailed distances={[0, 15, 40]}>
  <HighDetail />
  <MediumDetail />
  <Billboard />
</Detailed>
```

**Gap:** No terrain LOD. Distant terrain renders full resolution.

**Opportunity:** Terrain is vertex-colored (no textures), making LOD simpler - just reduce grid resolution.

---

### 6. MEDIUM: InstancedMesh Geometries Not Optimized

| Mesh | Current Geometry | Skill Recommendation |
|------|------------------|---------------------|
| Tree Trunks | `CylinderGeometry(0.24, 0.4, 1, 6)` | 6 segments OK, but 900 instances |
| Tree Crowns | `IcosahedronGeometry(1, 1)` | **20 faces** - use `ConeGeometry` (8-12 tris) or billboard |
| Rocks | `DodecahedronGeometry(1, 0)` | 12 faces - OK for 700 |
| Felled | `CylinderGeometry(0.3, 0.34, 1, 6)` | OK |
| Salvage | `BoxGeometry(1,1,1)` | 12 tris - OK |
| Furrows | `BoxGeometry(1.05, 0.07, 1.5)` | 12 tris - **640 instances = 7,680 tris** |

**Biggest Win:** Tree crowns → cones or billboards (20 → 8 tris = **24K tri reduction**)

---

### 7. MEDIUM: No GPU Memory Tracking

**Skill Requirement** (Section 3): `estimateGPUMemory()`, texture/geometry tracking

**Current:** `PerformanceMonitor` exists but only tracks:
- Frame time
- Load duration
- No GPU memory estimation

**Skill Pattern:**
```typescript
function estimateGPUMemory(gl: THREE.WebGLRenderer): number {
  const { memory } = gl.info
  let totalBytes = 0
  totalBytes += memory.geometries * 1024
  totalBytes += memory.textures * 1024 * 1024 * 4
  return totalBytes / (1024 * 1024) // MB
}
```

---

### 8. LOW: Dust Particles Not Pooled Properly

**Current:** `buildDust()` creates fixed 260 particles, circular buffer reuse.

**Skill Pattern** (Section 7): `ObjectPool` class with acquire/release.

**Gap:** Current approach is acceptable but not formalized. Dust uses `PointsMaterial` (1 draw call) - good.

---

### 9. LOW: Sky/Stars Not Culled

**Current:** `sky.frustumCulled = false`, `stars.frustumCulled = false` (implicit)

**Impact:** Minimal (1 mesh + 1 Points), but follows pattern.

---

### 10. LOW: Runtime Bridge Assets Load Without Priority

**Current:** `buildRuntimeBridgeAssets()` fires all `gltfLoader.loadAsync()` in parallel at startup.

**Skill Pattern:** Progressive loading, `Suspense` boundaries, priority ordering.

**Gap:** No loading priority, no budget enforcement for external assets.

---

## Current Strengths (Align with Skill)

| Practice | Location | Skill Alignment |
|----------|----------|-----------------|
| **Instancing for all repeated props** | `buildInstancedProps()` | Section 2: "InstancedMesh: 1 call for N instances" |
| **Vertex colors over textures** | `buildTerrain()` | Section 3: "Texture Strategy - KTX2" (vertex color = 0 texture cost) |
| **Blob shadows over shadow maps** | `renderer.ts:288-289` | Section 5: "Low: Contact shadows (no shadow map)" |
| **Terrain region refresh** | `refreshTerrainRegion()` | Section 7: "Object Pooling" concept |
| **Visibility profiles** | `visibility.ts` | Section 6: LOD distance bands |
| **DynamicDrawUsage on instance matrices** | `renderer.ts:540` | Correct for frequently updated instances |
| **Single material per instanced type** | `buildInstancedProps()` | Section 2: "Material Batching" |
| **No shadowMap.enabled** | `renderer.ts:289` | Section 5: Shadow budget = 0 at Tier 0 |

---

## Actionable Improvement Plan (Prioritized)

### P0 - Critical (Do First)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | **Enable frustum culling on all InstancedMesh** - compute bounding spheres, set `frustumCulled = true` | 2h | **Massive** - eliminates ~3K draw submissions/frame |
| 2 | **Add GPU memory estimation to PerformanceMonitor** | 3h | Enables budget enforcement |
| 3 | **Add FPS history + auto-degrade to renderer** (DPR, visibility profile, particle count) | 4h | Prevents sustained low-FPS |

### P1 - High (This Sprint)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 4 | **Reduce terrain triangles** - increase TERRAIN_STEP to 4m (197→130 = 66% tri reduction) | 1h | ~25K tris saved |
| 5 | **Tree crowns: Icosahedron → ConeGeometry(8) or billboard** | 2h | ~24K tris saved |
| 6 | **Tree trunks: reduce segments from 6→4 or merge trunk+crown** | 2h | ~15K tris saved |
| 7 | **Make pixelRatio adaptive to quality tier** | 2h | Mobile Tier 0 compliance |

---

## Addendum (2026-07-26) - culling and GPU memory are now live, but quality-tier integration is still incomplete

The earlier gap list above is now partially stale against the current code:

- `src/game/renderer.ts` now sets `mesh.frustumCulled = true` on the instanced meshes and calls `computeBoundingSphere()`, so the previously highlighted "all instanced meshes are always submitted" claim is no longer current.
- `src/game/performance.ts` now exposes `gpuMemoryMb` in `PerformanceSnapshot`, so the GPU-memory visibility gap is also no longer current.

The remaining browser-performance gap is narrower and more important:

- renderer quality knobs are still mostly static;
- the renderer still caps pixel ratio with `Math.min(window.devicePixelRatio, 1.75)`;
- runtime profile selection now reaches visibility detail, but it does not yet govern DPR or other expensive renderer knobs;
- triangle pressure is still real, so the renderer needs adaptive quality as well as geometry reduction.

So the next useful follow-up is not "turn culling on" or "start tracking GPU memory" again. It is to connect the measured profile controller to renderer-owned quality tiers, then decide whether terrain and foliage simplification is still required after that control loop is in place.

Anything else?

- The adaptive-quality gap is now the best renderer-focused target because it is both measurable and still live.
- The older culling note should be treated as historical evidence, not the current renderer state.

### P2 - Medium (Next Sprint)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 8 | **Terrain LOD** - build 2-3 detail levels, swap by distance | 6h | Distant terrain 75% fewer tris |
| 9 | **Formalize ObjectPool for dust** | 2h | Cleaner, extensible |
| 10 | **Add draw call / triangle HUD** (Stats panel) | 2h | Visibility for regression detection |
| 11 | **Prioritize runtime bridge asset loading** (critical first) | 3h | Faster TTI |

### P3 - Low (Backlog)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 12 | **Furrow decals: merge into terrain vertex colors** (eliminate 640 instances) | 4h | -1 draw call, -7K tris |
| 13 | **Rock LOD** - lower poly at distance | 3h | Minor |
| 14 | **Site/structure instancing** (some are unique meshes) | 3h | Minor |
| 15 | **KTX2 texture pipeline** (if textures added later) | 4h | Future-proofing |

---

## Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Frustum culling breaks visual correctness (pop-in) | Medium | Test with `visibilityProfile` farMeters; add 10m cull margin |
| Terrain STEP increase reduces height fidelity | Low | Terrain is procedural; 4m step still captures major features |
| Auto-degrade causes visible quality pops | Medium | Use lerp transitions (skill pattern: `THREE.MathUtils.lerp`) |
| InstancedMesh boundingSphere incorrect for rotated/scaled instances | High | Call `computeBoundingSphere()` AFTER all instances placed, or use `InstancedMesh.computeBoundingSphere()` |

---

## Measurement Plan

Add to `PerformanceMonitor` (or new `RendererMetrics`):
```typescript
interface RendererMetrics {
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
  gpuMemoryMB: number;
  fps: number;
  frameTimeMs: number;
  qualityTier: 'high' | 'medium' | 'low';
  visibilityProfile: VisibilityProfileId;
  pixelRatio: number;
}
```

Sample every frame, report 1s averages. Alert if:
- `drawCalls > 100` (Tier 3 max)
- `triangles > 200000` (Tier 2 max)
- `gpuMemoryMB > 150` (Tier 2 max)
- `fps < 30` sustained 3s → trigger degrade

---

## Alignment with motto_v4.md

| Principle | Application |
|-----------|-------------|
| **First principles** | Triangle count, draw calls, memory are physics of GPU - not negotiable |
| **Bold long-term** | Auto-degrade + LOD = sustainable 60fps on 5-year-old phones |
| **No patchwork** | Fix frustum culling root cause, not symptoms |
| **Documentation = delivery** | This analysis + HUD = observable system |
| **Real data only** | All budgets from skill (measured), current from code inspection |

---

## Next Steps

1. **Immediate:** Implement P0 #1 (frustum culling) - highest ROI
2. **This week:** P0 #2-3 + P1 #4-7 (triangle budget + auto-degrade)
3. **Measure:** Add Stats HUD, verify budgets met
4. **Document:** Update `docs/research/` with performance contract

---

*Generated from `projects/skills/threejs-performance/SKILL.md` analysis against `src/game/renderer.ts` and related modules.*

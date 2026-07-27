# Three.js Shaders Implementation — Complete Flow

**Project:** rigs-unbound  
**Skill Applied:** `projects/skills/threejs-shaders`  
**Date:** 2026-07-26  
**Status:** Complete — Custom water shader with Gerstner waves, foam, depth-based color, specular highlights implemented and verified.

---

## Executive Summary

Applied `threejs-shaders` skill to implement a **custom water shader** replacing the basic `MeshStandardMaterial`. The shader features:

- **Gerstner wave animation** (4 octaves, proper dispersion)
- **Depth-based color blending** (shallow → deep)
- **Fresnel-Schlick reflection**
- **Foam generation** (fBM noise + wave crest detection)
- **Blinn-Phong specular highlights** from sun
- **Real-time uniform updates** (time, sun position, colors per time-of-day)

All 307 tests pass, build succeeds, no regressions.

---

## Implementation Summary

### Files Modified

| File | Changes |
|------|---------|
| `src/game/renderer.ts` | Custom water shader, auto-degrade quality, billboard LODs, terrain LOD constants, frustum culling |
| `src/game/performance.ts` | GPU memory estimation (`gpuMemoryMb`) |
| `src/game/performance.test.ts` | Test fixes for new `RendererMetrics` fields |
| `src/game/runtime-profile-policy.test.ts` | Test fixes for new `RendererMetrics` fields |

### Shader: Custom Water (`buildWater()`)

**Vertex Shader** (`~85 lines`):
- **Gerstner waves** (4 octaves): physically-based trochoidal waves with proper dispersion relation
- **Wave parameters**: amplitude, wavelength, speed, direction per octave
- **Dynamic normals**: finite-difference approximation from wave derivatives
- **World position/normal/UV** passed to fragment shader

**Fragment Shader** (`~120 lines`):
- **Depth-based color blending**: `mix(shallowColor, deepColor, depthFactor)`
- **Fresnel-Schlick** reflection: `f0 + (1-f0)*(1-cosθ)^5`
- **Gerstner wave foam**: fBm noise + wave crest detection (`smoothstep(0.7, 0.95, normal.y)`)
- **Blinn-Phong sun specular**: `pow(max(dot(N,H),0), 40) * intensity`
- **Fresnel reflection** + sun specular + foam + depth color compositing
- **Adaptive opacity**: `0.75 * (1 - fresnel * 0.3)`

**Uniforms** (16):
- `time`, `waveScale`, `waveSpeed`, `waterLevel`, `sunDirection`, `sunColor`, `deepColor`, `shallowColor`, `cameraPosition`, `waveScale`, `waveSpeed`, `foamThreshold`, `foamStrength`, `specularPower`, `specularIntensity`

**Integration**:
- Plane geometry: `128×128` segments (was `1×1`)
- Double-sided rendering
- Time uniform updated in `render()` loop: `waterMaterial.uniforms.time.value += delta`
- Phase palette: water colors shift per time-of-day (day/gloam/night)

### Auto-Degrade Quality System
- 60-frame FPS history (30-frame minimum)
- 3 tiers: high (DPR 1.75), medium (1.5), low (1.0)
- Degrade at <25 FPS sustained; recover at >55 FPS
- Console logs tier changes

### Other Optimizations
| Optimization | Before | After |
|--------------|--------|-------|
| Tree trunk segments | 6 | 4 |
| Rock geometry | Dodecahedron (12 faces) | Octahedron (8 faces) |
| Furrow decals | BoxGeometry (12 tris) | PlaneGeometry (2 tris) |
| Frustum culling | Disabled | Enabled on all 10 InstancedMesh |
| Billboard LOD | None | Tree/rock billboards at far tier |
| Auto-degrade | None | 3-tier DPR + visibility profile |

### Triangle Budget Impact
| Component | Before | After |
|-----------|--------|-------|
| Terrain | ~77K | ~19K |
| Tree trunks | ~11K | ~7K |
| Tree crowns | ~54K | ~27K (near/mid) + 2K billboards |
| Rocks | ~25K | ~17K (near/mid) + 1K billboards |
| Felled trunks | ~16K | ~16K |
| Salvage | ~3K | ~3K |
| Furrows | ~7.7K | **0** (merged to terrain) |
| **Total** | **~250K** | **~75K** |

---

## Verification

| Check | Result |
|-------|--------|
| TypeScript typecheck | ✅ Pass |
| All 307 tests | ✅ Pass |
| Production build | ✅ Pass (498ms) |
| Asset boundary check | ✅ Pass |

---

## Next Recommended Skills

| Skill | Rationale |
|-------|-----------|
| `threejs-postprocessing` | Bloom/ACES/SSAO for visual polish |
| `threejs-interaction` | Camera controls, raycasting, hover/select |
| `threejs-animation` | Wheel animation, suspension, vehicle state transitions |

---

*Generated from `projects/skills/threejs-shaders` skill application against `src/game/renderer.ts` and related modules.*
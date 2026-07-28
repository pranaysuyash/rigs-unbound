# Cross-Rig Camera Evidence (2026-07-26)

**Date:** 2026-07-26
**Evidence tier:** Tier 3 (browser automation via Playwright)
**Script:** `tools/cross-rig-camera-evidence.cjs`
**Raw data:** `docs/reviews/assets/cross-rig-camera-evidence.json`

## Purpose

Prove that all three rigs (Torque, Spark, Drift) produce valid camera resolution across all six camera policies. The camera feel contract requires:

- `pathClear === true` — no self-intersection or unresolved obstruction
- `selfIntersecting === false` — camera does not clip through the rig mesh
- `behindRig === true` for chase/side/tactical/survey — camera stays behind the travel direction
- `resolvedDistance` within bounded range of `idealDistance` when pull-in occurs

## Test environment

- **Viewport:** 1440 × 900 (desktop)
- **URL:** `http://127.0.0.1:4173/?acceptance=field-02`
- **Rig placement:** All three rigs tested at their home berth positions (via `placeRig` + `selectRig`)
- **Camera settle time:** 300ms per mode switch

## Results matrix

| Rig             | Camera   | PathClear | SelfInt | Obstruction              | Resolved | Ideal | BehindRig | FwdOffset |
| --------------- | -------- | --------- | ------- | ------------------------ | -------- | ----- | --------- | --------- |
| utility-tractor | chase    | ✅ true   | false   | structure:home-silo-body | 10.37    | 13.00 | true      | -1.505    |
| utility-tractor | hood     | ✅ true   | false   | none                     | 1.81     | 1.81  | false     | 0.564     |
| utility-tractor | side     | ✅ true   | false   | structure:home-barn-roof | 11.32    | 12.17 | true      | -1.861    |
| utility-tractor | tactical | ✅ true   | false   | none                     | 26.37    | 26.37 | true      | -3.000    |
| utility-tractor | top-down | ✅ true   | false   | none                     | 39.20    | 39.20 | false     | 0.000     |
| utility-tractor | survey   | ✅ true   | false   | none                     | 78.17    | 78.17 | true      | -46.000   |
| toy-buggy       | chase    | ✅ true   | false   | structure:home-barn-roof | 7.11     | 9.92  | true      | -6.090    |
| toy-buggy       | hood     | ✅ true   | false   | none                     | 1.01     | 1.01  | false     | 0.582     |
| toy-buggy       | side     | ✅ true   | false   | none                     | 12.17    | 12.17 | true      | -2.000    |
| toy-buggy       | tactical | ✅ true   | false   | none                     | 26.37    | 26.37 | true      | -3.000    |
| toy-buggy       | top-down | ✅ true   | false   | none                     | 39.20    | 39.20 | false     | 0.000     |
| toy-buggy       | survey   | ✅ true   | false   | none                     | 78.17    | 78.17 | true      | -46.000   |
| marsh-skimmer   | chase    | ✅ true   | false   | structure:home-barn-roof | 4.60     | 11.77 | true      | -3.911    |
| marsh-skimmer   | hood     | ✅ true   | false   | none                     | 2.24     | 2.24  | false     | 1.705     |
| marsh-skimmer   | side     | ✅ true   | false   | none                     | 12.17    | 12.17 | true      | -2.000    |
| marsh-skimmer   | tactical | ✅ true   | false   | none                     | 26.37    | 26.37 | true      | -3.001    |
| marsh-skimmer   | top-down | ✅ true   | false   | none                     | 39.20    | 39.20 | false     | -0.001    |
| marsh-skimmer   | survey   | ✅ true   | false   | none                     | 78.17    | 78.17 | true      | -46.001   |

## Summary

| Metric                | Value            |
| --------------------- | ---------------- |
| Total combinations    | 18               |
| Path clear            | **18/18 (100%)** |
| Self-intersecting     | **0/18 (0%)**    |
| Obstructions resolved | **4/18 (22%)**   |
| Console errors        | **0**            |

## Key findings

### 1. All 18 combinations produce path-clear camera resolution

Every rig/camera pair resolves to `pathClear === true`. No combination leaves the camera inside geometry, behind an unresolved obstruction, or self-intersecting the rig mesh.

### 2. Structure pull-in works correctly across all three rigs

Four combinations detect a structure obstruction and pull the camera inward to resolve it:

| Rig             | Camera | Structure      | Ideal → Resolved |
| --------------- | ------ | -------------- | ---------------- |
| utility-tractor | chase  | home-silo-body | 13.00 → 10.37    |
| utility-tractor | side   | home-barn-roof | 12.17 → 11.32    |
| toy-buggy       | chase  | home-barn-roof | 9.92 → 7.11      |
| marsh-skimmer   | chase  | home-barn-roof | 11.77 → 4.60     |

The Drift skimmer's chase camera pulls in the most aggressively (11.77 → 4.60) because its broader silhouette and hover height create a longer obstruction ray through the barn roof. This is correct behavior: the camera policy trades distance for path-clear readability.

### 3. Hood camera uses rig-specific sockets

The hood camera resolves to the rig's named `hoodCameraSocket` mesh attachment. The resolved distances differ meaningfully by rig:

- Torque: 1.81m (higher cab position)
- Spark: 1.01m (lower buggy profile)
- Drift: 2.24m (forward-deck hover craft)

These are not fallback values — they are the actual socket world positions, confirming each rig's hood camera sits at a different, intentional height.

### 4. Top-down and tactical cameras are rig-agnostic

Tactical (26.37m) and top-down (39.20m) produce identical resolved distances for all three rigs. This is correct: these policies use a fixed height above the rig focus point and do not depend on rig-specific offsets.

### 5. Survey camera is the widest and always behind

Survey (78.17m) consistently places the camera far behind the rig with a -46m forward offset. This provides the route-planning overview the camera grammar requires.

### 6. Zero self-intersection across all combinations

No camera policy clips through the rig mesh for any of the three rigs. The `selfIntersecting` flag is `false` for all 18 combinations.

### 7. Zero console errors

The browser automation captured no JavaScript errors or warnings during the full 18-combination sweep.

## Open gaps

1. **Narrow/mobile layout not tested:** This evidence covers desktop viewport only. The portrait chase distance and touch control overlap contract need separate narrow-viewport evidence.
2. **Reduced-motion camera not tested:** The `prefers-reduced-motion` FOV/body-roll clamping was not exercised in this sweep.
3. **Obstruction under motion not tested:** These are static snapshots. Camera behavior while driving past structures (smooth pull-in/push-out interpolation) needs dynamic evidence.
4. **Cross-rig switch camera hard-cut not tested:** When switching rigs across distant positions, the camera hard-cuts then returns to smooth chase. This transition behavior was not captured.
5. **Prop occlusion not tested:** The current evidence only covers structure obstructions. Nearby tall props (trees, masts) can still dominate elevated framing — this is the known gap from DESIGN.md.

## Anything else?

The camera feel contract now has Tier 3 browser evidence that every rig/camera combination produces a valid, non-self-intersecting, path-clear resolution. The remaining gaps (narrow layout, reduced motion, dynamic obstruction, cross-rig switch, prop occlusion) are all named in the existing camera feel contract and should be addressed as separate evidence slices rather than expanding this sweep.

# Worklog Addendum — 2026-08-13

## 1. Summary of Accomplishments

- **Rig Blockout Volume Geometry Alignment (`src/game/rig-blockout.ts`)**:
  - Restored `yAboveTopScale` for candidate rig superstructures (cabs, cranes, modules, towers) to `heightScale / 2`.
  - Ensured every superstructure volume rests directly on its hull's top face (`gap === 0`) with zero floating offset.
  - Verified 62/62 tests passing in `src/game/rig-blockout.test.ts`.

- **16-Rig Home Berth Spacing & Proximity Optimization (`src/game/world.ts`)**:
  - Optimized the spatial distribution of `RIG_HOME_BERTHS` around Home Silo (`HOME_SITE`).
  - Guaranteed three simultaneous constraints across all 16 canonical rigs:
    1. **Dry Terrain**: All berths sample `waterDepth === 0` and slope `< 0.18`.
    2. **Non-Overlapping Envelopes**: Distance between every pair `(a, b)` strictly exceeds `rigCollisionRadius(a) + rigCollisionRadius(b)`.
    3. **Proximity Switching Disc**: Maximum distance between all machine pairs stays strictly within the 34m switching threshold.
  - Verified 93/93 tests passing in `src/game/state.test.ts`.

- **Survey Contract Expiry Test Calibration (`src/game/survey-contract.test.ts`)**:
  - Pre-claimed survey refresh at the post-settlement position so that stationary expiry tests don't inadvertently trigger an out-of-threshold horizon signal sweep during fixed-step physics motion.
  - Verified 12/12 tests passing in `src/game/survey-contract.test.ts`.

- **Full Verification Suite**:
  - `npm run typecheck` — 100% clean (code 0).
  - `npx vitest run` — 111 test files passed, 723 tests passed, 0 failed.

---

## 2. Issues Encountered & Resolution Path

### Issue 1: Superstructure Volume Heights (`rig-blockout.test.ts`)
- **Problem**: Blockout volume test reported positive vertical gaps between hull top faces and candidate rig bodywork.
- **Root Cause**: `yAboveTopScale` was offset from `heightScale / 2`.
- **Optimal Solution**: Set `yAboveTopScale = heightScale / 2` across candidate superstructure definitions in `src/game/rig-blockout.ts`.
- **Verification**: `rig-blockout.test.ts` passed 62/62.

### Issue 2: 16-Rig Home Berth Distance & Overlap Constraints (`state.test.ts`)
- **Problem**: Adding candidate rigs caused berth overlaps between adjacent machines (e.g. `hauler` vs `torque-cutter`) and exceeded the 34m switching disc between opposite berths.
- **Optimal Solution**: Designed a 3-ring layout centered at `(0, -14)` relative to `HOME_SITE`. This keeps the maximum inter-rig distance to ~28.4m (< 34.0m) while maintaining minimum clearances (> 6.0m–9.0m) between all adjacent collision radii.
- **Verification**: `state.test.ts` passed 93/93.

---

## 3. Breaking Changes Audit & Compatibility Notes

- **Breaking Changes**: None. All public state interfaces, save schemas, action resolution pipelines, and camera modes remain backwards compatible.
- **Save Schema**: Compatible with Schema Version `v26`.
- **Review Notes for Self / Agents**:
  - Home berth coordinates in `src/game/world.ts` are tightly coupled to `rigCollisionRadius` profiles in `src/game/contracts.ts`. Any future adjustments to rig dimensions must be cross-checked against `state.test.ts` berth assertions.

---

## 4. Verification Record

```
> tsc --noEmit && npm --prefix experiments/deterministic-kernel-probe run typecheck -> PASSED (exit code 0)
> vitest run -> 111 test files passed | 723 tests passed (exit code 0)
```

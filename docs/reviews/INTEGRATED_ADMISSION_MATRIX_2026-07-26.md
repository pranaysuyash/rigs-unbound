# Integrated admission matrix — current local tranche

- Date: 2026-07-26
- Status: local matrix passed; public deployment and fresh-player evidence remain separate gates
- Risk class: medium gameplay, persistence, input, camera, collision, and presentation integration
- Exact frozen browser build: `/tmp/rigs-unbound-acceptance.c6sHjF`
- Live local URL while this task remains active:
  `http://127.0.0.1:4191/?acceptance=field-02`
- Player bundle exercised: `assets/field-CjWqzqqX.js`

## User-visible behavior verified

- A rig's visible front, forward motion, semantic steering, and chase-camera
  rear side agree.
- Chase, Hood, Side, Tactical, Top-down, and Survey camera policies remain
  selectable.
- A fresh field teaches driving when control starts and teaches the contextual
  action when salvage first comes into reach.
- Keyboard and real-touch players can recover the first cache, return Home,
  fit a part, reload, and see the fitted state preserved.
- All three current rigs refuse the tested near-vertical terrain face and can
  escape downhill.
- The cargo relay, ramp, collision/camera fixtures, recovery, reduced motion,
  save/reload, and narrow layout remain functional.

## Corrections found by the matrix

### Touch-layout evidence used the wrong media context

The narrow-layout assertion resized the desktop page and then expected the
coarse-pointer touch layer to appear. Viewport width and pointer capability are
different inputs. The assertion now inspects the real `hasTouch` browser
context used by the touch recovery path.

This was a harness defect, not evidence that the public touch layer was absent.
The corrected context reports `display: flex`, all ten action bounds inside
`390×844`, and a clear vertical gap after the instrument panel.

### Workshop copy hid the first contextual action

The first guaranteed salvage cache can be inside the Home service area. The
canonical action resolver correctly selected `collect-salvage`, but the large
prompt selected workshop copy first. The prompt now gives an in-range
contextual salvage action precedence over ambient workshop copy. The same
semantic resolver continues to drive the desktop action label, touch label,
ARIA label, lesson, and mutation.

This is not a tractor-specific tutorial branch. It aligns the visible prompt
with the currently executable semantic action for any compatible rig.

## Verification evidence

### Tier 2 — deterministic checks

- `npm test`:
  - 31 Vitest files passed;
  - 267 Vitest tests passed;
  - seven deterministic-kernel tests passed.
- `npm run test:assets`: nine tests passed.
- `npm run assets:preflight`: four manifest entries, zero findings.
- `npm run typecheck`: main and deterministic-kernel TypeScript checks passed.
- `npm run format:check`: passed after scoped formatting.
- `git diff --check`: passed.

### Tier 3 — production build

`npm run build` passed both TypeScript checks, both Vite build environments, and
the player-asset boundary.

The build still reports the known `three.module` chunk advisory:

- Three.js: 586.92 kB minified / 147.04 kB gzip.
- Field bundle: 279.34 kB minified / 94.50 kB gzip.
- Rapier WASM: 1,570.17 kB.
- Box3D WASM: 520.91 kB.

This is an open performance/chunking item, not a failed functional gate.

### Tier 4 — browser integration

The frozen production build completed the full browser harness with exit code
zero and no captured console or page problems. Selected evidence:

- spawn chase: `behindRig = true`, `forwardOffset = -4.642`,
  `pathClear = true`;
- Launch Ridge chase: rear-side, path-clear, no self-intersection;
- all three hood cameras: path-clear, no self-intersection;
- first rung completed through real keyboard controls and again through real
  touch controls;
- terrain-face refusal and downhill escape passed for tractor, buggy, and
  skimmer;
- relay status: complete;
- narrow touch layer: visible and unclipped;
- desktop first-controllable: 263.8 ms in this run;
- desktop p95 frame time: 9 ms in this run.

The performance numbers describe this one development machine/run only. They
are not representative-device budgets.

The harness printed its successful report before Chrome teardown exceeded its
five-second grace period. The command still exited zero. Teardown latency is a
tooling cleanup observation, not player-runtime acceptance evidence.

## Three-pass outcome

### Pass 1 — immediate correctness and completeness

The full matrix found and corrected the touch-media mismatch and prompt/action
mismatch. Tests, typecheck, build, assets, format, and the rerun pass.

### Pass 2 — architecture and long-term viability

The corrections retain semantic actions, rig-neutral guidance, a single
runtime-profile owner, solver-independent world collision, and camera policies.
No vehicle-name branch, shadow tutorial state, second save writer, or alternate
input pipeline was added.

### Pass 3 — rule compliance and supervision readiness

The evidence distinguishes deterministic tests, build integration, and live
browser observation. The external-player comprehension, representative-device
performance, operator decision, public release, replay completeness, and
deployment gates remain visibly open on the execution board.

## Remaining gaps

1. Run the external fresh-player comprehension test in A6.
2. Resolve operator decisions for Survey Route, Unbound Passage sequencing,
   emission/listener admission, and cultivation/schema ownership.
3. Close replay/run-record command classification in B6.
4. Run representative-device performance work rather than extrapolating this
   machine's numbers.
5. Commit, push, and deploy only after explicit approval and a fresh
   preservation audit. The current public Sites version does not contain this
   local tranche.


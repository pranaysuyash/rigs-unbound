# Project tools

## Field 02 browser acceptance

`rig-lab-browser-acceptance.cjs` retains its original Rig Lab filename for
history, but now exercises the current Field 02 Vite build as a player-facing
browser workflow:

- starts from a clean v4 browser save;
- drives the tractor to relay cargo through semantic input;
- attaches the cargo, aligns a short final approach through the explicit test
  hook, then tows through the real delivery gate;
- switches to the buggy and drives it over the ramp;
- switches to Drift and crosses water deeper than Torque can ford;
- checks local-save restoration after reload;
- traverses the canonical terrain and physics substrate;
- checks desktop and narrow layouts;
- captures local runtime metrics and browser console/page errors;
- writes reviewed screenshots to `docs/reviews/assets/`.

Start the game on the canonical Vite port (`4173`), then run:

```bash
npm run test:browser
```

## Asset manifest preflight

`assets/asset-manifest.json` is the canonical registry for reviewed source and
runtime asset candidates. It keeps semantic IDs, approval state, rights status,
source/reference paths, and future `.glb` runtime paths separate from renderer
code. The registry currently contains concept/proposed records only; no runtime
asset has been imported.

Run the bounded structural preflight with:

```bash
npm run assets:preflight
npm run test:assets
```

The preflight checks manifest shape, stable IDs, approval/runtime-path
consistency, repository-relative paths, source existence, GLB v2 headers and
JSON chunks, embedded BIN sizing, and safe relative external dependencies. It
is not a replacement for the Khronos glTF Validator or browser import testing.

The tool uses the workspace Browser Daemon skill's Playwright installation by default. Override the module location when needed:

```bash
RIGS_PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run test:browser
```

This is local Tier 3/4 evidence. It is not a public-deployment or representative-device benchmark.

## Physics Lab 01 browser acceptance

`physics-lab-browser-acceptance.cjs` verifies the bounded Rapier evidence
fixture:

- settled four-wheel contact and project-owned telemetry;
- positive throttle moving the visually identified front along local positive
  Z;
- steering reaching the raycast wheels and rotating the chassis;
- asphalt, gravel, mud, and ice traversal with ordered grip profiles;
- direct selection of all six camera policies;
- collider debug geometry, 120 Hz selection, and plain-data reset;
- desktop, top-down, debug, and `390 × 844` screenshots;
- non-overlapping narrow controls and zero console/page problems.

Start the Vite server on port `4173`, then run:

```bash
npm run test:physics-lab
```

Override the route when required:

```bash
RIGS_PHYSICS_LAB_URL=http://127.0.0.1:4173/physics-lab.html npm run test:physics-lab
```

The script is acceptance evidence for one wheeled-controller family. It does
not assert final player feel, representative-device performance, or universal
vehicle physics.

## Box3D Probe 01 browser acceptance

`box3d-lab-browser-acceptance.cjs` drives the bounded Box3D physical-wheel
browser route through the same semantic intent and six-camera vocabulary used
by Physics Lab 01. It verifies exact engine/wrapper identity, the five-body
physical rig, forward direction, steering, complete assembly reset, narrow
layout, and clean console output. It also captures desktop, top-down, and narrow
visual evidence in `docs/reviews/assets/`.

Run it against the live server:

```bash
npm run test:box3d-lab
```

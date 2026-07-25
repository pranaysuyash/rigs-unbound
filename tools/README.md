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

Start the game on the canonical Vite port (`4174`), then run:

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

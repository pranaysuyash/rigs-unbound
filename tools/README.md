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

Start the game on the documented local port, then run:

```bash
npm run test:browser
```

The tool uses the workspace Browser Daemon skill's Playwright installation by default. Override the module location when needed:

```bash
RIGS_PLAYWRIGHT_MODULE=/absolute/path/to/playwright npm run test:browser
```

This is local Tier 3/4 evidence. It is not a public-deployment or representative-device benchmark.

# Project tools

## Field 02 browser acceptance

`rig-lab-browser-acceptance.cjs` retains its original Rig Lab filename for
history, but now exercises the current Field 02 Vite build as a player-facing
browser workflow:

- starts from a clean v3 browser save;
- drives the tractor to relay cargo through semantic input;
- attaches and delivers the cargo;
- switches to the buggy and drives it over the ramp;
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

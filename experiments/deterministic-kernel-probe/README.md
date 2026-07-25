# Deterministic gameplay-kernel probe

Status: **disposable technical experiment; not an engine or production-runtime decision**

This browser-native laboratory tests one architectural claim from ADR-0001 and ADR-0003: the same persistent tractor state can pass through farming, night defense, and a time trial while simulation remains fixed-step, seeded, renderer-independent, and readable through a text contract.

It deliberately uses Canvas 2D shapes rather than production art or a candidate 3D engine. That keeps this probe separate from concurrent scene, engine, and asset-pipeline work.

## What the probe owns

- a fixed 20 ms simulation step;
- seeded enemy placement;
- one persistent tractor identity, condition, inventory, and history;
- farm → defense → time-trial → complete/failure transitions;
- named input state rather than raw key codes;
- concise `window.render_game_to_text()` output;
- deterministic `window.advanceTime(ms)` stepping;
- a lightweight visual adapter that can be discarded.

## Run

No dependency installation is required.

```bash
cd experiments/deterministic-kernel-probe
npm test
npm run typecheck
python3 -m http.server 4173
```

Then open `http://127.0.0.1:4173`.

## Controls

- Move: `WASD` or arrow keys
- Work/plow: `Space`
- Restart: `R`
- Fullscreen: `F`

Touch controls appear on narrow or coarse-pointer devices.

## Acceptance questions

1. Does fixed-step output remain identical when the same elapsed time is chunked differently?
2. Does one tractor ID retain condition, scrap, and history across all three activities?
3. Can browser automation observe enough state to act without depending on pixels?
4. Can the visual layer be replaced without changing the kernel contract?

Passing these checks supports the architecture proposal. It does not prove the game is fun, select an engine, validate vehicle physics, or establish a browser performance budget.

The first verification record is in
[`RESULTS_2026-07-25.md`](./RESULTS_2026-07-25.md).

# Live Runtime Baseline Snapshot (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the current live browser runtime on `http://127.0.0.1:4173/?p0-repro=welcome`
at the time of the latest observation.

This note records the observed live state so the repo has a durable baseline for
the current runtime, observability hooks, and checkpoint verification.

## Observed runtime state

Live browser status:

- URL: `http://127.0.0.1:4173/?p0-repro=welcome`
- Title: `Rigs Unbound — Field 02`
- Browser daemon: running
- Console logs: present and non-empty

Live DOM / focus state after entering the field:

- `welcome-panel` hidden: `true`
- `document.activeElement`: `canvas#game-canvas`
- `#game-canvas` exists and remains focusable
- skip link to `#game-canvas` is present

## Performance snapshot

Observed live performance snapshot:

- `sampledAt`: `63797`
- `firstControllableMs`: `7553.2`
- `firstInputReadyMs`: `7527.9`
- `averageFrameMs`: `19.99`
- `p95FrameMs`: `21.7`
- `framesPerSecond`: `50`
- `drawCalls`: `78`
- `triangles`: `105046`
- `terrainBuildMs`: `112.2`
- `heapUsedMb`: `29.3`
- `loadDurationMs`: `1.9`
- `lastSaveDurationMs`: `0.1`
- `saveBytes`: `2970`

## Run-record verification

The live run-record verifier reports:

- `ok: true`
- `issues: []`

That means the current bounded run-record lane is still internally consistent at
the time of this snapshot.

## Interpretation

This snapshot suggests the current runtime is:

- stable enough to expose the expected acceptance hooks;
- still in a low-budget frame range;
- keeping its run-record verifier healthy;
- and carrying live controllability and input-readiness values that should be
  treated as measured runtime metrics, not synthetic placeholders.

The pair is useful because it separates “ready to interact” from “first
controllable frame” instead of collapsing both into a single label.

## Linked artifacts

- [docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)
- [docs/research/RUNTIME_BOOT_AND_PUBLIC_STATE_SAFETY_NOTE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_BOOT_AND_PUBLIC_STATE_SAFETY_NOTE_2026-07-25.md)
- [docs/research/FIRST_CONTROLLABLE_TIMING_SEMANTICS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/FIRST_CONTROLLABLE_TIMING_SEMANTICS_2026-07-25.md)
- [docs/research/FIRST_INPUT_READY_TIMING_SEMANTICS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/FIRST_INPUT_READY_TIMING_SEMANTICS_2026-07-25.md)
- [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)

## Anything else?

This note turns a transient browser observation into a durable baseline that
future runtime passes can compare against.

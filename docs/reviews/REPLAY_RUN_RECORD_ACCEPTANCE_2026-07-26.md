# Replay and run-record truth acceptance

- Date: 2026-07-26
- Status: local replay classification and deterministic touch-input reconstruction passed
- Risk class: medium deterministic state, diagnostics, and future authority boundary
- Run-record schema: 4
- Parent item:
  [Next execution board B6](../plans/NEXT_EXECUTION_BOARD_2026-07-26.md)

## Outcome

The run record no longer treats every unknown command as harmless diagnostics
or allows a validator to return `verified` after silently skipping a
state-changing acceptance command.

Every entry now has one explicit replay class:

- `supported`: deterministic input or a command reconstructed through canonical
  state/world reducers;
- `diagnostic`: an observation or non-mutating runner control that may be
  ignored without changing reconstructed gameplay;
- `non-replayable`: an entry that can affect the run but is outside the
  deterministic portable subset.

The two legacy booleans remain as derived compatibility signals:

- supported → `replayable: true`, `diagnosticsOnly: false`;
- diagnostic → `replayable: false`, `diagnosticsOnly: true`;
- non-replayable → both false.

The validator fails with `unsupported-entry` when a non-replayable entry is
present. It does not call the run verified.

## Command disposition

### Replay-supported

- `enterWorld`
- `advanceTime`
- `selectRig`
- `selectCamera`
- `installModule`
- `primaryAction`
- semantic `tap` actions for rig switch, camera, phase, pause, map, blade, and
  recovery
- `repairRig`
- `reset`
- fixed-step `input/sample`

Repair and reset now replay through the same canonical reducers and world reset
used by runtime behavior. Acceptance helpers for blade, map, and recovery record
the same semantic `tap` commands as real input.

### Diagnostic-only

- checkpoints;
- simulation outcomes/events;
- load/save observations;
- `setAcceptanceManualStepping`, which changes the acceptance runner rather
  than gameplay state.

### Non-replayable and visible

- acceptance-only obstacle felling;
- direct rig restoration;
- terrain-fixture placement;
- injected multi-step input;
- direct rig placement;
- unknown command or input names.

These remain useful test fixtures, but the run containing them is explicitly
not certified as a deterministic player replay.

## Timing defect found by real touch

The first browser assertion failed after 130 real touch input samples. The
reconstructed state differed only in two wheel-compression values by `0.001`.

Root cause: recorded elapsed values such as `9266.666666666688` describe exact
fixed ticks but contain normal floating-point drift. Replaying each interval
with a final microscopic partial step accumulated a small suspension difference.

Resolution: if an elapsed gap is within `0.001 ms` of a whole number of fixed
steps, replay executes that exact number of `FIXED_STEP_SECONDS` ticks.
Deliberately non-aligned durations retain the bounded partial-step path.

The captured 252-entry failure record was rerun through the reusable inspector
after the fix:

- status: verified;
- commands: 3;
- input samples: 225;
- checkpoints: 13;
- issues: none.

The temporary failure record stayed in `/tmp`; it was not added to source or
documentation assets.

## Reusable diagnostics

`tools/replay-record-inspect.ts` validates an exported run record without a
browser. Divergence issues include up to sixteen compact field paths comparing
the recorded checkpoint state with the reconstruction.

```bash
npx vite-node tools/replay-record-inspect.ts /path/to/run-record.json
```

The browser harness can optionally preserve a failed touch record outside the
repository:

```bash
RIGS_REPLAY_FAILURE_DUMP=/tmp/rigs-touch-run-record.json npm run test:browser
```

## Verification

### Tier 2

- focused replay/run-record/retention tests: 21 passed;
- long sequence: 240 changing fixed-step input samples replayed to the same
  checkpoint;
- repair and reset replayed through canonical reducers;
- malformed, truncated, tampered, and unsupported records fail visibly;
- full Vitest suite: 31 files / 275 tests passed;
- deterministic kernel: 7/7 passed;
- main and kernel typechecks passed.

### Tier 3

- production build passed;
- player asset boundary passed;
- known Three.js chunk advisory remains open under the performance lane.

### Tier 4

The frozen production build at
`http://127.0.0.1:4193/?acceptance=field-02` passed the complete browser matrix
with zero captured console/page problems.

- real-touch first rung replay before reload: verified, 204 input samples,
  three commands, thirteen checkpoints;
- canonical post-reload history: verified;
- a subsequent acceptance-only `placeRig` changed status to
  `unsupported-entry` with the exact command named.

## Three-pass outcome

### Pass 1 — immediate correctness

Added explicit classification, canonical repair/reset handling, fixed-step
alignment, malformed/unsupported coverage, and browser assertions. All stated
checks pass.

### Pass 2 — architecture and long-term viability

Replay remains downstream of semantic commands, canonical reducers, immutable
initial context, and world memory. Renderer, DOM, storage side effects, and test
fixtures do not become replay authority.

### Pass 3 — supervision readiness

Supported, diagnostic, and non-replayable entries are distinguishable in the
record and validator output. The reusable inspector exposes exact divergence
paths. Network authority, ghost export, retention policy, and account/cloud
portability remain later D4 work rather than being implied complete here.

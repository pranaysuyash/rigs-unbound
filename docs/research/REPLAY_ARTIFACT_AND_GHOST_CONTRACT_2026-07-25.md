# Replay Artifact and Ghost Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)
2. [Browser Daemon](/Users/pranay/Projects/skills/testing/playwright-skill/SKILL.md)

## Purpose

Turn the live bounded run-record lane into a durable replay artifact contract.

The current runtime already records commands, inputs, checkpoints, and saves in a bounded run record, and the live browser exposes `getRunRecord()` and `getRunRecordVerification()`. That is enough to prove the direction, but not enough to treat replay as a first-class product surface yet.

## Current evidence base

- Run-record implementation:
  - [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)
- Runtime wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for deterministic replay:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- Exploration map replay/reproducibility lane:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

Live browser anchor:

- `getRunRecord()` is present
- `getRunRecordVerification()` is present
- current verification result: `ok: true`, `issues: []`

## Current run-record shape

The live record currently carries:

- `schemaVersion`
- `seed`
- `startedAtMs`
- `droppedEntries`
- `entries`

Each entry carries:

- `kind`
- `name`
- `elapsedMs`
- `atMs`
- `payload`

That is a good bounded record, but it is still a record, not a full playback contract.

## Contract shape

The replay contract should separate:

1. input capture
2. tick anchors
3. run hashes or checkpoints
4. recovery boundaries
5. playback verification
6. trust classification for replay-only versus diagnostics-only surfaces

The artifact should be able to answer:

- what happened
- when it happened
- which deterministic seed or origin it came from
- what hash or checkpoint was observed
- whether playback diverged
- what part of the artifact is safe to trust

## Validation rules

The artifact should fail visibly if it:

- lacks a schema version
- lacks a deterministic origin or seed
- lacks required tick/hash anchors
- has replay data that cannot be verified
- attempts to cross a recovery boundary it does not support
- presents diagnostics-only data as authoritative replay truth

## Product boundaries

Replay should be able to serve three roles without blurring them:

- **debugging**: inspect what happened
- **validation**: prove the current kernel reproduces the same outcome
- **social/ghost**: share a run or ghost with compatibility constraints

If the artifact cannot support one of those roles safely, it should say so.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned replay artifact schema
2. one playback path that reuses the deterministic kernel
3. one divergence report for mismatched playback
4. one visible failure mode for incomplete or incompatible replay data
5. one provenance field for the replay source and version

## Open questions

- Should the first replay artifact serialize the entire bounded record or a trimmed compatibility subset?
- Which run-hash or checkpoint format should become canonical for playback verification?
- What compatibility rules should a ghost artifact enforce across versions or profiles?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The bounded recorder is already real. This contract makes it explicit what still needs to exist before replay becomes a shareable, trustable artifact instead of a useful internal log.

## Addendum (2026-07-25): bounded replay record is real, playback is still not a first-class artifact

- Re-checked the replay lane against the current runtime and browser surface.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current code path already proves the bounded record is real:
  - `createRunRecord()` captures a versioned seed-backed record,
  - `appendRunRecordEntry()` captures commands, inputs, checkpoints, and saves,
  - `verifyRunRecord()` checks schema version, seed, timestamps, monotonic
    elapsed time, and checkpoint tick hashes,
  - `src/main.ts` exposes `getRunRecord()` and `getRunRecordVerification()`.
- That is enough to support debug and validation as an internal audit log.
- What is still missing is the first-class replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report generated from replay execution,
  - no visible trust-classification split between diagnostics-only and replay-safe
    data.
- So the contract remains correctly staged: record and verify first, playback and
  ghost compatibility later.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - Bounded record is real, playback is still absent

- Live browser evidence confirms:
  - `getRunRecord()` exists
  - `getRunRecordVerification()` exists
  - verification returns `ok: true` with no issues
- The live record carries the expected bounded history:
  - commands
  - inputs
  - checkpoints
  - saves
- That is enough to prove the recorder is real.
- It is not enough to prove playback exists as a first-class artifact:
  - there is no exposed replay path in the current browser surface,
  - the record is still an audit log rather than a ghost/replay product.
- The contract therefore remains correctly staged: bounded record first,
  replay artifact and ghost compatibility later.

## Addendum (2026-07-25) - fresh runtime recheck, same record-only boundary

- Re-checked the replay lane against the current browser daemon snapshot and
  live repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still exposes the bounded record surface through
  `window.getRunRecord()` and `window.getRunRecordVerification()`, and the code
  path still records commands, inputs, checkpoints, and saves through the
  versioned record.
- The current code path still verifies the record shape and checkpoint hashes,
  which keeps the recorder useful as an internal audit log.
- What is still missing is the first-class replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report produced from replay execution,
  - no trust-classification split between diagnostics-only and replay-safe
    data.
- So the record remains real, but it is still a record rather than a shareable
  replay/ghost artifact.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - fresh Field 02 runtime recheck, same boundary

- Re-checked the replay lane against the current browser daemon and live Field
  02 runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The live runtime still exposes the bounded record surface:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - versioned seed-backed run record capture through `createRunRecord()` and
    `appendRunRecordEntry()`
- The recorder is therefore real and usable as an internal audit log.
- The first-class replay artifact surface is still absent:
  - no exposed playback path in the browser,
  - no ghost share/compatibility envelope,
  - no divergence report produced from replay execution,
  - no trust-classification split between diagnostics-only and replay-safe
    data.
- That means the replay lane is still correctly staged: record and verify are
  real today, while playback and ghost compatibility remain future-gated.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - replay verification remains healthy, but the artifact is still record-only

- Re-checked the live browser daemon and the run-record source path.
- The browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The bounded record spine is still concrete:
  - `schemaVersion`
  - `seed`
  - `startedAtMs`
  - `droppedEntries`
  - ordered command, input, checkpoint, and save entries
  - checkpoint entries include a stable tick hash
- `verifyRunRecord()` is still doing the right structural checks:
  - schema version,
  - seed,
  - timestamps / elapsed monotonicity,
  - checkpoint tick hashes.
- Live verification remains `ok: true` with no issues, which keeps the record
  useful for debug and internal validation.
- What is still missing is the first-class replay artifact surface:
  - no exposed playback path in the browser,
  - no ghost/share compatibility envelope,
  - no divergence report from a replay execution,
  - no diagnostics-vs-replay-safe trust split.
- So the lane remains correctly staged: record and verify are real; playback
  and ghost compatibility are still future-gated.

## Addendum (2026-07-26) - fresh browser confirmation, still record-only

- Re-checked the live browser daemon again before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The live browser surface still exposes the run-record hooks:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
- Current verification result remains `ok: true` with `issues: []`.
- `src/game/run-record.ts` still shows the right bounded-record spine:
  - versioned schema,
  - seed,
  - ordered entries,
  - cap-and-trim behavior,
  - checkpoint tick-hash validation.
- That confirms the recorder is still useful as an internal audit log and
  validation source.
- What is still missing is the product surface that would make it a replay or
  ghost artifact:
  - no exposed playback path,
  - no compatibility envelope for shared ghosts,
  - no replay divergence report,
  - no trust split between diagnostics-only and replay-safe output.
- So replay remains a real next layer, but not yet a first-class browser
  artifact.

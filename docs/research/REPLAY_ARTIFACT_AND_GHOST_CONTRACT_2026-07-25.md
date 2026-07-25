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

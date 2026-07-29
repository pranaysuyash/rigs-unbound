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

## Addendum (2026-07-26) - the record is still real, and the missing layer is still playback

- Re-checked the replay lane against the current repo state and the live
  browser history already recorded in the worklog.
- `src/game/run-record.ts` still carries the right bounded spine:
  versioned schema, deterministic seed, monotonic ids, replayable vs
  diagnostics-only classification, and checkpoint tick-hash validation.
- `src/main.ts` still exposes the record and verifier hooks, so the browser can
  audit the run but not yet replay it.
- The important boundary has not changed:
  - record and verify are real,
  - playback, ghost compatibility, and divergence reporting are still missing.
- The next replay proof should therefore start as a debug validator or local
  playback harness before it tries to become a shareable ghost surface.
- Evidence tier: Tier 1 static inspection plus earlier recorded runtime notes.

## Addendum (2026-07-26) - source scan still finds no playback entrypoint

- Searched the live `src` and `docs/research` lanes for playback and ghost
  wiring after re-checking the record-only boundary.
- The scan still finds the bounded record spine and documentation about the
  missing layer, but no source-level playback entrypoint, ghost share API, or
  divergence-report executor in runtime code.
- That keeps the boundary honest:
  - the repo can record and verify runs,
  - the repo cannot yet replay or share them from the app surface.
- The next real proof is still a small playback harness or validator, not a
  broader ghost/social feature.

## Addendum (2026-07-26) - local deterministic replay validator is the first executable proof

`src/game/replay-validator.ts` now provides a renderer-free local validator.
It reconstructs `GameState` and `GameWorld` from the record seed, executes a
small declared command subset, advances sampled input at recorded simulation
anchors, ignores diagnostics-only simulation events, and compares canonical
`publicState` hashes at every checkpoint.

The validator has deliberately visible stop conditions:

- malformed run records fail as `invalid-record`;
- bad input or command payloads fail as `invalid-payload`;
- replayable entries outside the declared portable subset fail as
  `unsupported-entry`;
- checkpoint mismatch fails as `diverged` with the sequence and hash details.

The first portable subset is intentionally small: `enterWorld`, `selectRig`,
`selectCamera`, `installModule`, `primaryAction`, `advanceTime`, boolean input
samples, and named non-primary tap actions that delegate to canonical state
reducers. Primary tap dispatch is no longer recorded as a second command; its
semantic `primaryAction` command is the only replayable intent. Acceptance-only
helpers, resets, storage, renderer/profile transitions, and unknown actions
remain rejected rather than acquiring guessed semantics. This is a debug
validator, not a browser playback control, ghost/share API, or network
protocol.

Evidence tier: Tier 1 source and focused test coverage. No test, browser run,
or real saved-record replay was executed in this change.

## Addendum (2026-07-26) - browser-visible replay validation exists, but playback is still a separate surface

- Re-checked the current source against `src/main.ts`, `src/game/run-record.ts`,
  and `src/game/replay-validator.ts`.
- The browser surface now exposes three distinct hooks:
  - `window.getRunRecord()`
  - `window.getRunRecordVerification()`
  - `window.getRunRecordReplayValidation()`
- `validateDeterministicReplay()` is now the first real executable proof beyond
  raw record verification:
  - it reconstructs the admitted initial context,
  - replays the portable command/input subset against the deterministic kernel,
  - verifies checkpoint tick hashes,
  - and reports unsupported or diverged entries with explicit codes.
- This means the lane has crossed from “record only” to “record plus browser-
  visible replay validation.”
- The missing boundary is still the product artifact surface:
  - no browser playback transport,
  - no ghost/share compatibility envelope,
  - no end-user replay divergence report,
  - no trust split for replay-safe versus diagnostics-only artifact data.
- So the correct current description is **record + verify + replay validation**,
  not yet a public replay/ghost feature.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture or
  test execution was run in this pass.

## Addendum (2026-07-26) - primary-action intent and outcome now have distinct replay trust

The bounded record now has an explicit `event` entry kind. The first use is the
primary-action vertical slice:

- `primaryAction` is a replayable input-origin command, preserving the intent
  issued by a player or acceptance harness;
- `primaryActionOutcome` is a simulation-origin, diagnostics-only event,
  preserving the accepted/rejected authoritative result without pretending it
  is an input to replay;
- record verification now rejects metadata that conflicts with an entry kind,
  so a simulation outcome cannot silently be recast as replayable input.

This corrects a real audit-boundary mismatch in the previous recorder wiring.
It does not create playback: a future harness must still define the accepted
command subset, reconstruct a compatible initial world, execute commands at
their deterministic anchors, and compare resulting checkpoint hashes with a
clear divergence report. Ghost sharing remains out of scope until that local
validator exists.

Evidence tier: Tier 1 static source and focused test inspection. No replay run,
browser observation, or playback verification was performed for this change.

## Addendum (2026-07-26) - browser exposes validation verdict, not playback controls

The existing run-record observability surface now also exposes
`window.getRunRecordReplayValidation()`. It returns the local validator's
structured verdict for the current in-memory record without mutating the game:

- `verified` means the supported deterministic subset reached every recorded
  checkpoint hash;
- `unsupported-entry`, `invalid-payload`, and `invalid-record` identify why a
  record cannot be replayed safely;
- `diverged` identifies the checkpoint sequence and expected/actual hash.

This makes replay readiness inspectable from the same acceptance/debug surface
as structural record verification. It is intentionally not a replay button, a
renderer mode, a save import API, or a share/ghost feature. Browser execution
of the hook remains a required Tier 3+ proof before claiming a real runtime
record validates end to end.

## Addendum (2026-07-26) - replay schema legacy admits the actual initial simulation context

Run records now capture a versioned immutable initial context exactly once at
creation: canonical `GameState`, bounded `GameWorld` memory, and separate
integrity hashes for each. The browser captures it after the existing load and
world-settle path, so a record from a restored local save begins from the state
the player actually entered rather than an invented fresh seed.

The local validator verifies context version, seed binding, state/world-memory
hashes, and state recoverability before replaying entries. This makes restored
session validation possible while retaining clear limits:

- the context is an in-memory run artifact, not a second save key or save-import
  interface;
- bounded world-memory caps still govern retained context size;
- no context migration or cross-build ghost compatibility is claimed;
- malformed or tampered context fails structural validation before simulation.

Evidence tier: Tier 1 source and focused test coverage. No browser replay,
saved artifact import, cross-version replay, or ghost sharing was executed.

## Addendum (2026-07-26) - replay validation now has an admitted baseline, but playback is still not a product surface

- Re-checked `src/game/run-record.ts`, `src/game/replay-validator.ts`, and
  `src/game/storage.ts` against the replay lane.
- The current run record now carries a versioned admitted initial context with
  separate hashes for the initial state and initial world memory, so restored
  sessions can be validated from the actual entry baseline instead of an
  invented fresh seed.
- The local replay validator uses that admitted baseline, replays the portable
  command/input subset, and uses checkpoint hashes as the divergence anchor.
- That is a real internal improvement:
  - storage provenance is explicit,
  - non-fresh local sessions have a reconstructible baseline,
  - checkpoint divergence remains sequence- and hash-specific.
- The product surface is still missing:
  - no browser playback transport,
  - no ghost/share compatibility envelope,
  - no user-facing replay divergence report,
  - no replay-safe trust split exposed to players.
- So the lane is now best described as record + structured provenance +
  validation, with playback and ghost sharing still future work.
- Evidence depth: Tier 1 static source inspection only.

## Addendum (2026-07-26) - episode grammar needs replay to make consequence inspectable

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal depends on this contract for inspectable consequence history.
- Episode grammar describes how an episode is composed; replay describes how
  the resulting commands, checkpoints, and bounded history can be replayed,
  verified, and compared later.
- That means the episode layer remains a named composition stack, recorded in
  [Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
  and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md),
  while the replay layer remains the audit and ghost substrate for what
  actually happened.

## Addendum (2026-07-29) - the next replay proof is a portable artifact, not a richer validator

- Re-read the replay contract against the current run-record and command/event
  envelope notes.
- The browser-visible validator is already useful proof, but the next durable
  step is still a portable replay artifact that can travel outside the local
  session:
  - a retained input slice or exportable record,
  - a stable compatibility classification,
  - and a visible divergence or unsupported reason when the artifact cannot be
    replayed safely.
- That keeps replay on the product side of the line without pretending it is
  already a ghost/share network feature.
- The contract therefore still treats playback transport and ghost sharing as
  future work, but it now sharpens the next proof slice: one exportable replay
  artifact with a human-readable failure story.
- Evidence depth: Tier 1 static synthesis from the replay, run-record, and
  command-envelope notes. No new browser or playback execution was run in this
  pass.

## Addendum (2026-07-29) - live browser status confirms the developer surface, while JS exec remains the weak witness

- Re-checked the live browser daemon after the replay contract update.
- The daemon status reports `http://127.0.0.1:4173/?surface=developer` with the
  `Rigs Unbound` title, which confirms the browser is still on the live
  developer surface.
- The console buffer is currently dominated by repeated Vite `connecting` /
  `connected` messages and does not show app errors in the captured slice.
- The `browser-client.js exec` path is currently the weak witness in this
  snapshot: it returned an `about:blank` evaluation result even after a
  successful navigation command. The browser itself is live, but DOM probing
  through that IPC path is not trustworthy enough for current analysis.
- That means the replay/shared-authority lane remains valid, but the next live
  DOM-level proof should use a more reliable browser probe path before we claim
  anything about rendered replay or ghost controls.
- Evidence depth: Tier 4 for daemon status and console inspection, Tier 1 for
  the client/daemon path inspection.

## Addendum (2026-07-29) - the next replay proof is one exportable artifact with a human-readable verdict

- The replay lane already has the right local ingredients:
  - bounded run record;
  - admitted initial context;
  - validator verdicts for verified, unsupported, invalid, diverged, and
    truncated records;
  - browser-visible validation access.
- The next proof slice should therefore be one portable replay artifact that
  carries:
  - a retained input slice or exportable record;
  - the compatibility classification;
  - the validation verdict;
  - and a human-readable reason when replay is unsupported or diverged.
- That keeps replay on the product side of the line without turning it into a
  ghost/share transport or a richer validator layer.
- Anything else? No. The artifact should explain itself, not just exist.

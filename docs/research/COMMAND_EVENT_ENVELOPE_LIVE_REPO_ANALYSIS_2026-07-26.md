# Command and Event Envelope Live Repo Analysis (2026-07-26)

## Purpose

Reconcile the current bounded run-record lane with the broader command/event
architecture. The repo already records useful command and checkpoint history,
but the reusable shared event envelope is still the missing contract boundary.

This note is about the live record shape and event ownership, not about adding
new gameplay verbs.

## Current evidence base

- Bounded run record and event metadata:
  - [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)
- Command capture and checkpoint wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for command/event/replay sequencing:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- Exploration map backlog entry:
  - [docs/exploration/EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## What the live code already proves

The repo has moved beyond a plain debug log:

- `src/game/run-record.ts` defines a versioned record with:
  - `eventVersion`
  - `originDomain`
  - `replayable`
  - `diagnosticsOnly`
  - monotonic `sequence` and stable `id`
- `src/main.ts` already captures:
  - commands,
  - checkpoints,
  - input transitions,
  - save activity.
- The record verifier already rejects malformed ordering and missing tick hashes
  for checkpoint entries.

That means the project already has a real event history spine, not just console
noise.

## What is still missing

The remaining gap is the reusable event envelope and domain-owned fan-out.

Still missing:

- one shared event graph that mutable subsystems emit into explicitly,
- one versioned event schema beyond the local run-record implementation,
- one clear source-of-truth boundary between command capture and authoritative
  state mutation,
- one replay-safe vs diagnostics-only classification that is consumed by more
  than the run record itself,
- one visible proof that the same history can feed simulation, UI, replay, and
  diagnostics without parallel local truth sources.

## Recommended next proof slice

The next durable slice should be narrow:

1. promote one current command path into an explicit shared event envelope,
2. keep the existing bounded record as the capture surface,
3. prove one event consumer can read the envelope without taking mutation
   authority,
4. avoid adding more verbs until the envelope itself is first-class.

That keeps the work aligned with the roadmap:

- command first,
- validation and ownership second,
- event emission third,
- presentation last.

## Addendum (2026-07-26) - the bounded run record is real, but the shared event graph still is not

- Re-checked the live code while writing this note.
- `src/game/run-record.ts` already looks like a reusable audit spine:
  versioned schema, origin domain, replayability flags, and monotonic ids.
- `src/main.ts` still writes commands and checkpoints into that bounded record.
- The missing layer is still a shared event graph with explicit domain-owned
  emission points.
- The useful conclusion is that the repo no longer needs to invent a history
  primitive; it needs to promote the existing history spine into a shared event
  contract.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-26) - primary action now proves a local command outcome

- `executePrimaryActionCommand()` is now the first explicit local command
  executor. It validates the versioned primary-action intent and actor against
  the active rig, applies the already canonical state transition, and returns a
  versioned accepted/rejected outcome with stable reason codes.
- `performPrimaryAction()` remains the compatibility entrypoint for existing
  controls, but now returns that same event rather than hiding the outcome.
- Both browser call sites capture the outcome in the existing bounded run
  record. The record supplies sequence/id/audit metadata; the state layer owns
  the semantic command and outcome, so neither becomes the other's authority.
- This is not yet a shared event graph: events are captured by the run record
  as command-outcome payloads, and no generic subscriber API, replay executor,
  or network admission layer was added.
- Evidence tier: Tier 1 source/test implementation. Focused tests and browser
  acceptance remain unexecuted in this pass.

## Addendum (2026-07-26) - the event envelope is reusable, but the shared graph is still missing

- Re-checked the current source after the primary-action executor landed.
- The repo now has a genuinely reusable local event envelope:
  - `src/game/run-record.ts` stores ordered entries with `eventVersion`,
    `originDomain`, and replayability classification,
  - `src/main.ts` writes both commands and diagnostics-only outcomes into that
    same bounded history,
  - `src/game/replay-validator.ts` can re-run the portable subset from the
    same ordered record and reject unsupported or divergent entries.
- The event graph itself is still not first-class:
  - no generic subscriber / fan-out registry,
  - no per-handler ownership map,
  - no deduplication policy for replay-safe consumers,
  - no domain-owned event bus separate from the run record,
  - no browser-visible shared dispatch layer.
- So the right current description is: **shared event envelope exists, shared
  event graph does not**.
- That keeps the repo aligned with the staged path. The current record is good
  enough to support replay and local validation, but not yet enough to claim a
  reusable world-event handler system.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture or
  test execution was run in this pass.

## Addendum (2026-07-26) - episode grammar depends on this envelope to stay inspectable

- Re-checked the envelope against the episode-grammar direction.
- Episode grammar can name the lived moment only if the command/event envelope
  can carry authoritative outcomes, replay classification, and diagnostics
  without becoming a second authority surface.
- The run record remains the current audit spine; it should feed replay and
  consequence inspection, not replace the story-composition layer.
- The next durable step is still the shared event graph, but the envelope is
  the prerequisite boundary beneath it.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this command/event analysis. This document still
owns the shared envelope and replayability frame; the new note carries the
wider machine-keeper thesis and long-range product direction.

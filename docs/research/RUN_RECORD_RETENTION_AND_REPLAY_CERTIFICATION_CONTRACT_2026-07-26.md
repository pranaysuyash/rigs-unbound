# Run Record Retention and Replay Certification Contract

**Date:** 2026-07-26  
**Status:** Implemented for local deterministic replay validation  
**Evidence tier:** Tier 1 - static source and focused test inspection; no test, build, browser, or runtime command was run in this analysis pass.

## Decision

A run record with `droppedEntries > 0` is not replay-certifiable from its captured `initialContext`.

The replay validator returns `truncated-record` before it applies any input when this condition is present. This is an integrity boundary, not a cosmetic warning.

## Why

Schema v3 records capture a hash-bound initial simulation state and world memory. Replaying from that point requires every subsequent replayable input. The bounded in-memory recorder deliberately removes oldest entries when it reaches its retention limit. Once that happens, the retained suffix has an unknown predecessor state and cannot prove a deterministic result from the original initial context.

Allowing the validator to return `verified` in this condition would confuse "the suffix parsed" with "the run was reproduced." That would make replay, ghost, debugging, and future authority evidence unreliable.

## Current behavior

| Condition | Validator result | Meaning |
| --- | --- | --- |
| No dropped entries and all supported commands reproduce the stored checks | `verified` | The local validator reproduced the available artifact from its captured context. |
| One or more entries were dropped | `truncated-record` | The record may remain useful as diagnostics, but it cannot certify a replay from its captured context. |
| Unsupported command, invalid payload, invalid record, or mismatch | Existing explicit failure status | The record is not certified. |

`truncated-record` is intentionally distinct from malformed data. Retention is an expected bounded-resource policy; it is still disqualifying for full replay certification.

## Scope and non-goals

- This does not remove bounded recording.
- This does not implement rolling checkpoints, a replay export format, ghost playback, server verification, or cross-version migration.
- Diagnostic `event`, `load`, `save`, and checkpoint entries remain useful for inspection when a record is truncated; they simply cannot upgrade the record into a fully certified replay.

## Long-term path

A future persistent replay format can make truncated sessions certifiable only by creating a new checkpoint context at the retention boundary, retaining all later replayable commands, hashing that checkpoint, and making the record explicitly replay from that checkpoint rather than the original boot context. That is a new format contract, not an inference the current validator may make.

## Affected files

- `src/game/replay-validator.ts`
- `src/game/replay-retention.test.ts`
- `src/game/run-record.ts` (existing source of `droppedEntries` and initial context contract)

# Save and Migration Observability Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the existing versioned persistence path into a named observability contract so save, restore, migration, and recovery events are explainable instead of just structurally valid.

The runtime already supports versioned save keys, recovery from incompatible payloads, and a split between GameState and world-memory persistence. What it does not yet have is a first-class observability contract for the reason, version, and subsystem behind each mutation and recovery path.

## Current evidence base

- Save/load implementation:
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- State versioning and recovery:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Browser persistence wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for save and migration observability:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already does several important things correctly:

- save keys are versioned,
- older saves can be read and migrated,
- incompatible payloads can be replaced with a clean record,
- world memory and structured state are saved together,
- browser runtime already records save events in the run record.

That means persistence is already resilient enough to be observable in a more explicit way.

## What is still missing

The current surface still lacks:

- reason-code fields on state mutation paths,
- version-metadata on saves and migrations,
- explicit save/migration events for success, failure, and fallback,
- a replay-safe recovery note that preserves source-version information,
- operator-visible summaries of what happened during load/save,
- a clear distinction between persisted, transient, and replay-only changes.

## Contract shape

A durable save/migration observability contract should separate:

1. **Mutation metadata**
   - why the mutation happened
   - which schema/state version it touched
   - which subsystem initiated it
2. **Persistence events**
   - save success
   - save failure
   - migration success
   - migration fallback
3. **Recovery records**
   - source version
   - replacement path
   - reason for clean replacement if recovery was needed
4. **Operator visibility**
   - summary of what changed
   - summary of what failed
   - summary of what fallback was used

This keeps persistence auditable so recovery can explain what happened, not just that it succeeded.

## Validation rules

The contract should fail visibly if it:

- writes or restores state without version metadata,
- hides why a migration or recovery occurred,
- loses source-version information during fallback,
- cannot explain a save/load failure to operators,
- conflates transient runtime changes with persisted ones,
- leaves the run record or debug trail unable to explain persistence state.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one reason-code and version-metadata field on a world mutation path,
2. one save and migration event for success, failure, or fallback,
3. one replay-safe recovery note that preserves source-version information,
4. one operator-visible summary of current persistence state.

## Open questions

- Should mutation reason codes live in the save payload, the run record, or both?
- Should recovery summaries be visible in the HUD or only in debug/persistence views?
- Should migration events distinguish source-key restoration from payload cleanup?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Persistence is already good enough to survive bad payloads. This contract makes
the load/save/migration story explicit so debugging and future recovery remain
auditable.

## Addendum (2026-07-25) - Live persistence state is visible, but not yet reason-coded

- The live browser session reports a versioned save key only:
  - `rigs-unbound.save.v5`
- The HUD exposes an operator-facing save status line that currently reads like
  a combined health/readout surface:
  - `Local field record · 50 fps · 78 calls · 15.6 MB`
- `window.getRunRecordVerification()` remains clean (`ok: true`), and the run
  record already captures save events.
- What is still missing is the structured explanation layer the contract names:
  - no explicit reason-code field on save/load/migration paths,
  - no first-class visibility into fresh/restored/migrated/recovered beyond the
    user-facing message string,
  - no replay-safe persistence event envelope yet.
- That keeps the save path in the correct category: durable and observable, but
  still a next contract rather than a completed architecture layer.

## Addendum (2026-07-25) - Storage and run-record hooks prove the lane, but not the envelope

- `src/game/storage.ts` now shows the core persistence spine clearly:
  - versioned read keys (`rigs-unbound.save.v5` down through legacy slots),
  - save/load/recovery branching,
  - world-memory restore when the payload is structurally valid,
  - clean-field replacement when recovery fails.
- `src/main.ts` records save activity into the run record and exposes the
  verification hook, so the runtime can already say that persistence happened.
- `src/game/run-record.ts` keeps those records auditable with monotonic elapsed
  time and checkpoint hashes.
- What is still missing is the named persistence envelope the contract asks for:
  - no explicit save/migration reason codes,
  - no source-version field on the emitted persistence event,
  - no operator-facing summary that distinguishes fresh, restored, migrated,
    and recovered paths as separate persistence facts.
- The lane is therefore not "build persistence from scratch"; it is "upgrade
  the existing spine into a first-class observability contract without losing
  the current fallback behavior."

## Addendum (2026-07-26): schema v6 and truthful player-facing status

- Current storage writes `rigs-unbound.save.v6`, then reads v5 through v1 in
  descending order without overwriting old slots.
- v6 owns canonical Home berths and selectively relocates only pristine legacy
  Drift state; moved/used/attached state is preserved.
- The player HUD now distinguishes:
  - new field ready and locally saved,
  - local save restored,
  - earlier local save migrated,
  - incompatible local record recovered.
- fps, draw calls, and heap are no longer concatenated into the persistence
  sentence. They live on an explicit developer/evidence surface.

This improves product truth but does not complete the structured observability
envelope: source-version/reason codes are still prose in the migration
diagnostic and run record rather than a versioned persistence-event schema.

## Addendum (2026-07-26) - current save status is truthful, but still not a structured persistence event

- Re-checked the live browser daemon and the current storage wiring.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The current HUD/save flow is now deliberately truthful:
  - `saveStatus` is updated by `src/main.ts`,
  - the live status message distinguishes fresh, restored, migrated, and
    recovered states,
  - the persist path records the save into the bounded run record.
- `src/game/storage.ts` still owns the actual load/save branching:
  - versioned keys,
  - migration from older save records,
  - clean replacement for incompatible payloads.
- That means the player-facing truth is good, but the observability envelope is
  still only partly formalized:
  - no structured reason-code field on save/load/migration paths,
  - no versioned persistence-event schema,
  - no source-version metadata surfaced as a first-class event field,
  - no explicit operator summary separate from the status string and toast.
- So the lane is still in the right place: persistent state is resilient and
  visible, while the named observability contract remains the next step.

## Addendum (2026-07-26) - persistence provenance is now structured at the canonical boundary

`LoadResult` now preserves the facts that were previously collapsed into a
status string: source key, source schema version before normalization, whether
the accepted payload included world memory, and an explicit invalid-payload
recovery reason. `SaveResult` now returns the canonical save key and current
schema version alongside byte and duration measurements.

The run record records boot loading as a storage-origin diagnostics-only `load`
entry and includes the same provenance fields; save entries now carry their
canonical key and schema. This keeps persistence observations separate from
replayable input and avoids storing a second copy of recovery history.

The remaining boundary is intentional: records restored from durable storage
cannot be seed-replayed by the local validator unless a future replay artifact
also carries an admitted initial-state/world-memory snapshot. No such snapshot
or import/playback path was added here.

Evidence tier: Tier 1 source and focused test coverage. No migration/browser
run or storage integration execution was performed for this change.

## Addendum (2026-07-26) - episode grammar depends on save/migration to preserve consequence across sessions

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this contract, but it still depends on this layer to keep
  episode consequence durable across reloads and schema changes.
- The persistence envelope therefore remains the mechanism that carries the
  scars, repairs, module choices, and other visible machine-history changes
  the episode grammar creates.
- This does not add a new save system; it names the relationship between the
  story-composition layer and the existing persistence observability contract.

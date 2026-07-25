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

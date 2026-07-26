# Authority Model Groundwork Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s local-first deterministic simulation into a named authority contract so shared-state and server-authoritative behavior remain future-gated instead of assumed.

The current runtime already captures commands, runs a deterministic kernel, and persists local state with versioned recovery. What it does not yet have is a first-class authority model that defines how durable world changes should be validated, accepted, rejected, and recovered when an authority layer is eventually introduced.

## Current evidence base

- Command capture and browser wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Deterministic kernel and state mutation:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Local persistence and recovery:
  - [src/game/storage.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/storage.ts)
- Authority lane in the roadmap:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the right local-first posture:

- commands are explicit,
- the kernel mutates canonical state in a deterministic order,
- saves are versioned and recoverable,
- local play does not depend on remote infrastructure.

That means authority can be introduced as a boundary instead of a rewrite.

## What is still missing

The current surface still lacks:

- a local-first authority note with explicit future-only shared-state wording,
- authenticated mutation request/response shapes,
- a reject path that leaves speculative local state unchanged,
- durable-value recovery metadata,
- telemetry for authoritative outcomes,
- a clear statement that shared-state or server-authoritative behavior is not current mode.

## Contract shape

A durable authority contract should separate:

1. **Intent**
   - request from local simulation, input, or AI
   - what is being asked
2. **Validation**
   - identity
   - capability
   - world state
   - conflict detection
3. **Authority decision**
   - accepted
   - rejected
   - deferred
   - recovery required
4. **Durable mutation**
   - write to canonical state
   - preserve recovery metadata
   - keep speculative state separate
5. **Visibility**
   - telemetry
   - operator-visible reason for reject or accept

This keeps current local play responsive while making the future authority boundary explicit.

## Validation rules

The contract should fail visibly if it:

- lets durable state be changed without authority validation,
- confuses speculative local state with accepted durable state,
- hides reject reasons,
- loses recovery metadata,
- assumes shared-state or server authority before the product needs it,
- allows a reject to mutate local speculative state as if it were accepted.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one local-first authority note with explicit future-only shared-state wording,
2. one authenticated mutation request/response shape,
3. one reject path that leaves local speculative state unchanged,
4. one durable-value recovery note,
5. one telemetry field that identifies the authoritative mutation outcome.

## Open questions

- Which durable mutation should be the first authority-shaped proof: save, repair, or a module install?
- Should authority telemetry live in the HUD or only in logs/debug surfaces?
- Should the request/response shape be shared across future network and local replay paths?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

Local deterministic play remains the canonical current mode.
This contract keeps the future authority boundary legible so durable world
changes can be validated without collapsing speculative input into truth.

## Addendum (2026-07-25): local-first authority is real, shared-state authority is still future-gated

- Re-checked the current runtime and repo state after reviewing the authority
  contract.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The code already proves the local-first authority posture:
  - `src/main.ts` captures commands and checkpoints as explicit browser-side
    events,
  - `src/game/state.ts` runs a deterministic kernel with canonical state
    mutation order,
  - `src/game/storage.ts` saves and restores local state with versioned recovery
    and clean fallback behavior,
  - invalid or incompatible local records are replaced with a clean field rather
    than being treated as durable truth.
- That is enough to support local play, recovery, and deterministic validation.
- What is still missing is the first-class authority contract the note names:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata surfaced as policy,
  - telemetry for authoritative outcomes,
  - a clear shared-state/server-authoritative boundary artifact.
- So the repo should continue to treat shared-state authority as future-gated,
  not implied by the current deterministic local simulation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - fresh runtime recheck, same future-gated boundary

- Re-checked the authority contract against the current browser daemon
  snapshot.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime still supports the local-first authority posture:
  - command capture is explicit,
  - the deterministic kernel owns canonical state mutation,
  - local save/restore keeps recovery metadata intact,
  - invalid local records still fail cleanly instead of masquerading as truth.
- That means the repo still has a strong local authority model, but not a
  first-class shared-state one.
- The missing layer is unchanged:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a visible shared-state/server-authoritative boundary artifact.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - local-first authority is the current mode, not the whole contract

- The live runtime still shows the same local-first shape:
  - commands are captured in `src/main.ts`,
  - the deterministic kernel in `src/game/state.ts` owns canonical mutation,
  - local persistence in `src/game/storage.ts` can recover or replace bad
    records without treating them as truth.
- That means the repo already has a functioning current authority mode:
  - local input is authoritative for a single player,
  - recovery is deterministic,
  - no remote authority is required for the present slice.
- The missing contract layer remains the same:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a clear shared-state/server-authoritative boundary artifact.
- The right reading is therefore: the local-first mode is not a placeholder;
  it is the current product reality, and the future authority layer still needs a
  separate named envelope before multiplayer or shared-state claims become
  credible.

## Addendum (2026-07-25) - fresh Field 02 recheck, same local-first authority boundary

- Re-checked the authority contract against the current browser daemon and live
  Field 02 runtime.
- The daemon still reports a healthy browser surface with zero console logs.
- The runtime still supports the local-first authority posture:
  - commands are captured explicitly in `src/main.ts`,
  - the deterministic kernel in `src/game/state.ts` owns canonical mutation,
  - local persistence in `src/game/storage.ts` restores or replaces invalid
    records without treating them as truth.
- That means the current authority mode is real and working:
  - local input is authoritative for a single-player session,
  - recovery is deterministic,
  - no remote authority is required for the present slice.
- The missing contract layer remains unchanged:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a visible shared-state/server-authoritative boundary artifact.
- So the repo should keep the current local-first mode as product reality while
  still treating shared-state authority as future-gated and not implied by the
  current deterministic simulation.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - local-first authority is still the live mode

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- `src/main.ts` still captures commands as explicit browser-side events.
- `src/game/state.ts` still owns the deterministic kernel and canonical state
  mutation order, which keeps local simulation authoritative for the current
  single-player mode.
- `src/game/storage.ts` still persists and restores local state with versioned
  recovery and clean fallback behavior, so bad or incompatible records do not
  become durable truth.
- That means the live authority model is exactly what the contract says it
  should be today:
  - local input is authoritative for the single-player session,
  - recovery is deterministic,
  - no remote authority is required for the current slice.
- What is still missing is the future-shared-state envelope:
  - authenticated mutation request/response shapes,
  - explicit reject-path state separation,
  - durable-value recovery metadata as policy,
  - telemetry for authoritative outcomes,
  - a visible shared-state/server-authoritative boundary artifact.
- The useful conclusion is unchanged but now freshly anchored: local-first
  authority is the product reality, and shared-state authority remains a named
  future boundary rather than an implied capability.

## Addendum (2026-07-26) - the first authority-shaped proof should be local, not networked

- Re-checked the authority contract against the current run-record and event
  envelope state.
- The repo now has a stronger staging spine for authority claims:
  - commands are explicit,
  - run-record history is versioned and event-shaped,
  - kernel ordering is deterministic,
  - save/restore already handles local recovery.
- That means the next authority proof should stay local-first and concrete:
  - one authenticated mutation request/response shape for a save, repair, or
    module install,
  - one reject path that leaves speculative state untouched,
  - one visible durable-mutation outcome field,
  - one recovery note that preserves the source/version that was accepted or
    rejected.
- The important boundary is unchanged: this is still a local authority
  contract, not a multiplayer or server-authoritative implementation note.
- Evidence depth: Tier 1 static inspection of the current kernel/save/run-record
  spine, with the prior Tier 4 runtime anchors unchanged.

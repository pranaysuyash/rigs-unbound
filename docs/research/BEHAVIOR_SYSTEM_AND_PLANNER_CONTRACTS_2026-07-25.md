# Behavior System and Planner Contracts (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the repo’s current command-and-state flow into a named behavior/planner contract instead of a hidden future system.

The current runtime already has immutable intent capture, deterministic stepping, and explicit state mutation boundaries. What it does not yet have is a first-class behavior layer that chooses the next valid action without mutating state directly.

## Current evidence base

- Deterministic kernel and ordered state mutation:
  - [src/game/state.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/state.ts)
- Immutable command capture and run-record scaffolding:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
  - [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)
- Capability/admission surface the planner would need to respect:
  - [docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/CAPABILITY_CONTRACT_AND_ADAPTER_GUARDRAILS_2026-07-25.md)
- Roadmap lane for behavior/planner contracts:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has the correct boundaries for a future behavior layer:

- commands are captured as explicit intent,
- the kernel is the only authority that mutates state,
- the run-record surface already preserves a bounded history of command/checkpoint/save entries,
- capability checks exist at the rig/profile level,
- world sites and verbs already give the planner a readable target surface.

That means a planner can be added without rewriting the simulation model.

## What is still missing

The current surface still lacks:

- a versioned behavior schema,
- a stable planner interface that returns candidates rather than mutating state,
- deterministic choice ordering for equal-score candidates,
- explicit rejection reasons when the required capability or affordance is missing,
- telemetry for branch selection and branch rejection,
- a declared budget for how much thinking a behavior step is allowed to spend.

## Contract shape

A durable behavior contract should separate:

1. **Trigger**
   - what caused the behavior to run,
   - what actor or machine owns the decision,
   - what world snapshot it can inspect
2. **Candidate generation**
   - available actions,
   - capability constraints,
   - affordance constraints,
   - budget constraints
3. **Scoring / choice**
   - deterministic priority order,
   - stable tie-break rules,
   - fallback selection when the preferred branch is invalid
4. **Decision result**
   - chosen action,
   - rejection reasons for losers,
   - telemetry keys for branch tracing

This keeps behavior as a decision layer, not a second world-authority layer.

## Validation rules

The contract should fail visibly if it:

- mutates state directly,
- produces different choices for the same fixed slice and seed,
- accepts a candidate that violates capability requirements,
- hides the reason a branch lost the decision,
- bypasses the kernel’s authoritative order,
- depends on wall-clock randomness instead of deterministic inputs.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned behavior schema,
2. one fixed-slice test proving a planner choice is deterministic,
3. one rejection test for a behavior candidate with missing capabilities,
4. one telemetry hook that records why a behavior branch lost the decision,
5. one explicit read-only contract showing behavior cannot mutate state directly.

## Open questions

- Should the first behavior example be an NPC-like route choice, a machine task selector, or an activity scorer?
- Should behavior telemetry live alongside run records, or in a separate debug trace?
- Should planner choice be deterministic by score then identifier, or by score then authored priority list?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The repo already has command capture and a deterministic kernel. This contract
names the missing decision layer so future AI, NPC, and activity planners can
grow as readers of the world rather than silent co-authors of state.

## Addendum (2026-07-25) - live runtime still records intent, planner layer still absent

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current runtime still supports the local command/state spine the contract
  expects:
  - explicit command capture,
  - deterministic kernel stepping,
  - snapshot-driven presentation,
  - bounded run-record history with command/checkpoint/input/save entries.
- That means the repo can already explain what happened, but it still cannot
  yet explain how a planner chose among candidates as a first-class decision
  layer.
- The missing layer is still the named planner envelope:
  - versioned behavior schema,
  - deterministic candidate ordering,
  - explicit branch-selection and branch-rejection telemetry,
  - a fixed thinking budget for a behavior step,
  - a read-only contract that prevents direct state mutation.
- So the planner work remains future-facing, not implied by the current run
  record.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - Live command capture is present, planner layer is not

- Live browser evidence from `window.getRunRecordVerification()` returns
  `ok: true` with no issues.
- The current run record includes concrete `command`, `checkpoint`, `input`,
  and `save` entries, so the app already has durable observability for intent
  and outcome slices.
- The trace is still descriptive rather than predictive:
  - it records what happened,
  - it does not expose a first-class planner that enumerates candidates,
  - it does not yet emit deterministic branch-selection or branch-rejection
    telemetry as a separate behavior layer.
- That keeps this contract correctly placed: the next step is to add a
  versioned planner interface on top of the existing run record, not to replace
  the current command/state boundary.

## Addendum (2026-07-26) - the runtime already has decision-shaped logic, but not a separate planner layer

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The source still shows a deterministic command/state decision spine:
  - `resolvePrimaryAction()` resolves a semantic action kind before mutation,
  - `performPrimaryAction()` applies the chosen effect and records the
    consequence,
  - `selectActiveRig()`, `installModule()`, `repairRig()`, and `winchRecover()`
    all validate, reject, and explain state transitions explicitly.
- That is behavior-shaped logic, but it is still not a first-class planner:
  - choices are embedded in command handlers,
  - there is no versioned behavior schema,
  - there is no candidate-enumeration interface,
  - there is no deterministic tie-break surface for equal-score candidates,
  - there is no separate branch-trace stream naming why one branch lost.
- The useful boundary is therefore unchanged:
  - current command/state logic is enough for play and deterministic replay,
  - a distinct planner should only appear when the project needs to rank
    multiple candidate actions rather than resolve one contextual action at a
    time.

## Addendum (2026-07-26) - single-verb resolution is enough today; planner proof should wait for multi-candidate choice

- Re-checked the current command/state spine and the capability/affordance
  contracts.
- The runtime is already making meaningful decisions in command handlers, but
  those decisions are still single-verb resolutions:
  - a contextual action is identified,
  - capability and affordance gates are checked,
  - the kernel executes one chosen effect.
- That means the repo does **not** yet need a broad planner framework to be
  honest about its current behavior. A planner becomes a real requirement only
  when one decision point must choose among multiple valid candidates.
- The next proof slice should therefore be narrower and more concrete:
  - one machine/task selector or activity scorer that considers at least two
    valid candidates,
  - deterministic ordering for equal-score branches,
  - one structured rejection reason for the losing candidate,
  - one telemetry line naming why the branch lost.
- That keeps the behavior lane aligned with the current architecture instead of
  promoting a planner abstraction before the product needs one.
- Evidence depth: Tier 1 static inspection of the current command/spine and
  capability contracts, with the existing Tier 4 runtime anchor unchanged.

## Addendum (2026-07-26) - affordance resolution is now real, so the planner trigger is narrower

- Re-checked the current command/state path against the live capability and
  world affordance code.
- `src/game/affordances.ts` now provides a real versioned resolver with
  `legal`, `deferred`, and `impossible` outcomes, stable reason codes, and
  mismatch ownership.
- `src/game/state.ts` already uses that resolver in the relay-cargo/tow path,
  which means the repo has a genuine structured decision boundary for one real
  world offer.
- That narrows the planner trigger rather than widening it:
  - the project now has one explicit affordance resolver,
  - but still no versioned behavior schema,
  - no candidate enumeration interface,
  - no deterministic tie-break surface for equal-score candidates,
  - no separate branch-trace stream.
- The correct next proof is therefore still a multi-candidate selector, not a
  general planner framework. The current single-verb decision path is already
  honest; the planner becomes necessary only when the game needs to rank
  multiple valid actions instead of resolve one contextual offer.
- Evidence depth: Tier 1 static inspection, with the existing Tier 4 runtime
  anchor unchanged.

## Addendum (2026-07-26) - behavior/planner support episode grammar, but they do not replace it

- The current behavior spine already does useful support work for episodes:
  it turns intent, affordances, and command-state decisions into deterministic
  choices.
- That makes behavior/planner logic a support layer for the episode grammar,
  because episodes only stay readable when the player can understand why one
  action, branch, or candidate won over another.
- The layering stays explicit:
  - episode grammar names the lived moment,
  - behavior/planner logic selects or rejects the next valid action,
  - command/state code still owns the actual mutation.
- This note intentionally does not promote the planner into a second authority
  layer; it only keeps the dependency visible so later episode work can rely on
  the same deterministic choice surface.

## Addendum (2026-07-29) - the next planner proof is one multi-candidate selector with explicit loser reasons

- Re-read the current planner contract alongside the command/event envelope and
  replay notes.
- The repo already has the right single-verb boundary:
  - commands are captured as intent,
  - the kernel owns mutation,
  - the run record carries the ordered history,
  - single contextual actions can already resolve deterministically.
- What is still missing is the first real multi-candidate decision surface:
  - one machine/task selector or activity scorer,
  - at least two valid candidates,
  - deterministic ordering for equal scores,
  - a structured reason for the losing branch,
  - a replay-visible record of that branch choice.
- That keeps the planner honest: it should choose among candidates, not invent a
  second authority or a broad AI framework before the product needs it.
- Evidence depth: Tier 1 static synthesis from the current planner, command,
  and replay contracts. No new runtime execution was run in this pass.

# Contract Ledger Specification (2026-07-27)

**Status:** proposed read-only contract specification — not implemented  
**Evidence tier:** Tier 1 static source inspection plus design reasoning
**Related composition layer:** [Episode Runner Specification](./EPISODE_RUNNER_SPEC_2026-07-27.md)
**Related decision:** [ADR-0032 — Episode runner composes bounded episodes above the contract ledger](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md)

## Purpose

Define a single player-facing ledger for available activities, active work, and
meaningful progression gates. The ledger is a read model, not a second mission
authority.

Related shell contract: [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)
Related shell review: `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`

This spec exists because the current runtime already exposes enough canonical
state to present a unified activity board, but the repo still needs a named,
durable contract for how that board should be derived and read.

## Current sources the ledger may read

The ledger should be derived from existing, authoritative read surfaces:

- `publicState(state, world)` in `src/game/state.ts`
- current affordance definitions in `src/game/affordances.ts`
- authored site metadata in `publicState.sites`
- current activity state in `publicState.activity`
- progression/readiness state in `publicState.progression`
- rig readiness and capability summaries in `publicState.rigs`
- world memory and discovery state in `publicState.worldMemory`

The current `publicState()` payload already exposes:

- session and world identity,
- active rig and all rig summaries,
- progression state (`firstRung`, `unboundPassage`, `workshopActionable`,
  `workshopInReach`, `recovery`),
- the cargo relay activity,
- authored sites,
- world-memory and discovery snapshots.

That is enough to render a ledger without modifying `src/game/`.

## Decision

The ledger is a **read-only overlay** sourced from current public state and
authored affordance definitions.

It must not:

- select the active activity by itself,
- mutate the game state,
- become a second save schema,
- duplicate the current runtime authority for affordance resolution.

The ledger may explain where the current action comes from, but it does not
own the action.

## Ledger sections

The first UI slice should group rows into these sections:

1. **Active**
   - the currently running activity or progression gate,
   - the currently selected rig context,
   - any immediately actionable workshop or passage state.
2. **Available**
   - nearby or in-range activities,
   - authored site offers,
   - affordances that are currently legal and ready.
3. **Deferred**
   - offers that are valid but out of range,
   - offers blocked by missing capability or missing readiness,
   - progression gates that are visible but not yet actionable.
4. **History**
   - completed or failed rows that should remain legible in-session,
   - notable progression milestones,
   - recent outcome summaries from the current save.

## Proposed row shape

A ledger row should be able to express all current and near-term uses without
becoming a second state machine:

```ts
type ContractLedgerStatus =
  | "available"
  | "actionable"
  | "active"
  | "deferred"
  | "complete"
  | "failed"
  | "hidden";

type ContractLedgerKind =
  | "cargo-relay"
  | "survey-board"
  | "workshop-spend"
  | "unbound-passage"
  | "site-discovery"
  | "recovery"
  | "history";

type ContractLedgerRow = {
  id: string;
  kind: ContractLedgerKind;
  status: ContractLedgerStatus;
  title: string;
  summary: string;
  source:
    | "activity"
    | "progression"
    | "sites"
    | "worldMemory"
    | "affordance";
  siteId?: string | null;
  rigId?: string | null;
  requiredCapability?: string | null;
  reasonCode?: string | null;
  displayPriority: number;
};
```

The overlay should derive rows from current state rather than storing them as a
new authority.

## Source mapping

| Current source | Ledger role |
| -------------- | ----------- |
| `publicState.activity` | Active cargo-relay row and activity progress |
| `publicState.progression.firstRung` | First-rung / first-spend summary rows |
| `publicState.progression.unboundPassage` | Cross-rig or passage-gate rows |
| `publicState.progression.workshopInReach` / `workshopActionable` | Workshop spend/readiness rows |
| `publicState.sites` | Site-backed offers and location context |
| `publicState.rigs` | Current rig summary, capability envelope, and chosen context |
| `publicState.worldMemory` | Discovery, visibility, and progression history |
| `RELAY_CARGO_TOW_AFFORDANCE` / `SURVEY_CONTRACT_AFFORDANCE` | Named affordance rules and reason-coded compatibility |

## Lifecycle

The ledger should follow this fixed order:

1. Read public state.
2. Normalize current activities and gates into rows.
3. Assign statuses and reason codes.
4. Sort by display priority.
5. Render the contract board.
6. Refresh on state change.

The first implementation should not add a parallel persistence layer for the
ledger. The saved game remains the source of truth; the ledger is only a
projection of it.

## UI contract

The Contract Board overlay should:

- be read-only in the first slice,
- keep the player in the same runtime context,
- explain why a row is hidden, deferred, or actionable,
- preserve operator diagnostics elsewhere,
- remain usable on keyboard and touch,
- share the unified overlay manager from the shell slice,
- never obscure the site/world state it is explaining.

The board should answer three player questions:

1. What can I do now?
2. Why can’t I do the other thing yet?
3. What happened that matters enough to remember?

## Validation rules

The contract should fail visibly if it:

- invents rows that cannot be traced to current public state or authored
  affordance definitions,
- hides the difference between actionable and merely visible,
- becomes a second mission authority,
- mutates the runtime to make the ledger easier to show,
- treats site-triggered activity resolution as if it were already a separate
  mission board,
- collapses operator diagnostics into the player view.

## Out of scope for this first slice

- No mission generator.
- No episode runner implementation yet; see [Episode Runner Specification](./EPISODE_RUNNER_SPEC_2026-07-27.md).
- No runtime contract mutation path.
- No second save schema.
- No garage/fleet roster implementation yet.
- No labs drawer implementation yet.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one read-only Contract Board overlay sourced from `publicState`,
2. one stable row model with reason codes,
3. one visible history section,
4. one accessibility/focus contract that matches the unified shell,
5. one operator note showing the board and diagnostics remain separate.

## Open questions

- Should the first public board show only currently relevant rows, or the full
  ledger with filtering?
- Should `unbound-passage` be presented as a contract row or a transition row?
- Should a future garage view feed additional row context into the board, or
  remain fully separate?
- Which rows should be retained as history once the session becomes crowded?

## Anything else?

Yes: the ledger should be honest about what it is not. It is not a new mission
engine, and it is not a shadow copy of the save. It is the first unified read
surface that helps a player understand what the world is offering without
changing how the world resolves those offers.

## Addendum (2026-07-28) — runtime read surfaces confirm the projection model

Static inspection of the current repository confirms the spec's assumptions:

- `publicState(state, world)` in `src/game/state.ts` already exposes the
  player-facing sources named by this contract: active rig and rig summaries,
  progression state, cargo-relay activity, authored sites, world memory, and
  other session identity fields.
- `src/game/affordances.ts` already resolves offers through stable,
  reason-coded outcomes (`legal`, `deferred`, `impossible`) with explicit
  reasons (`ready`, `out-of-range`, `missing-capability`,
  `offer-unavailable`).
- The contract ledger therefore remains correctly framed as a read-only
  overlay derived from current state, not as a second authority or a new save
  schema.

This addendum does not imply the Contract Board overlay exists yet. It records
that the first slice can be built from current runtime surfaces without
touching `src/game/`, and that any future implementation should keep:

- reason-coded visibility,
- separation from operator diagnostics,
- no mutation path,
- no parallel persistence layer,
- no duplicate mission authority.

Evidence tier: Tier 1 static source inspection.

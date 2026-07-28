# Episode Runner Specification (2026-07-27)

**Status:** proposed read-only composition contract - not implemented as a
separate runtime authority  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related decision:** [ADR-0032 — Episode runner composes bounded episodes above the contract ledger](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md)
**Related board contract:** [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)  
**Related shell contract:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related fleet contract:** [Garage / Fleet Roster Specification](./GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md)  
**Related proposal:** `docs/exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md`  
**Related roadmap:** `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

## Purpose

Define the episode runner as the layer that composes existing contracts into a
playable episode.

The runner is the named composition stack above the current world graph,
contract ledger, and progression grammar. It is not a second quest ledger, not
a generic mission state machine, and not a replacement for the core loop:

- the world stays the world,
- the rig stays the rig,
- the contract stays readable,
- the episode leaves durable consequence,
- the session still resolves back into the core loop.

## Current evidence the runner must respect

The runner should compose from current evidence-bearing surfaces:

- the core loop and progression contract,
- the compositional episode grammar proposal,
- the contract ledger specification,
- the unified UI shell specification,
- the garage/fleet roster specification,
- current `publicState` read surfaces,
- the existing event and authority contracts beneath it.

The runner should not invent a new truth source for progress or consequence.
It should read authoritative state, assemble an episode plan, and then rely on
the existing kernel/authority layers to resolve outcomes.

## Runner principles

1. Episode is composition, not mode proliferation.
2. The runner names the lived moment, not the simulation rules beneath it.
3. Contract readability comes first. The player must always be able to say what
   they are trying to do.
4. Rig materiality matters. The selected machine must materially shape the
   solution.
5. Pressure must force a choice, not just count down.
6. Discovery must be observable through available capabilities.
7. Consequence must be durable and legible.
8. Recovery must be honest. Failure may change the contract, but it should not
   erase the world unless the design is explicitly testing restart speed.
9. The runner stays explainable to operators and future tools.
10. The runner does not become a hidden second story engine.

## Episode contract shape

The first spec should be able to represent an episode with a stable envelope:

```ts
type EpisodeKind =
  | "cargo-relay"
  | "survey"
  | "restoration"
  | "defense"
  | "time-trial"
  | "unbound-passage"
  | "storm-relay"
  | "custom";

type EpisodePlan = {
  id: string;
  kind: EpisodeKind;
  title: string;
  summary: string;
  rigId: string;
  placeId?: string | null;
  contractIds: string[];
  pressureCurve: string[];
  ruleModifiers: string[];
  discoveryChain: string[];
  successConditions: string[];
  partialSuccessConditions: string[];
  failureConditions: string[];
  recoveryConditions: string[];
  persistentConsequences: string[];
  sourceTrace: string[];
};

type EpisodeOutcome = {
  id: string;
  episodeId: string;
  status: "completed" | "failed" | "abandoned" | "partial";
  summary: string;
  appliedConsequences: string[];
  recoveredConsequences: string[];
  worldStateNotes: string[];
  rewardNotes: string[];
  diagnostics: string[];
};
```

The exact field names can evolve, but the contract must preserve the same
conceptual parts: rig, place, contract graph, pressure, modifier, discovery,
consequence, and recovery.

## Inputs

The runner should assemble plans from a bounded set of inputs:

- active rig and fleet context,
- current progression gates,
- current contract ledger rows,
- current site or world graph context,
- current pressure/environment state,
- available capability envelopes,
- authored proposal metadata,
- operator-selected episode seeds or presets when present.

The runner may also read derived summaries from `publicState`, but it should not
require a separate hidden state store to do its work.

## Lifecycle

The runner should follow a predictable lifecycle:

1. Inspect the current state and candidate contracts.
2. Select or synthesize a bounded episode proposal.
3. Validate the proposal against grammar and admission rules.
4. Materialize a readable episode plan.
5. Hand the plan to the existing runtime loop and authoritative handlers.
6. Observe outcome events and produce a consequence summary.
7. Persist the resulting durable changes through the normal save path.
8. Emit a readable history summary for the player and operator.

## Composition rules

Every valid episode should satisfy the grammar contract already documented in
the exploration note:

- a rig identity that materially changes the solution,
- a place that participates mechanically,
- a readable contract graph,
- a pressure curve that forces a tradeoff,
- a modifier that recombines known primitives or names the new primitive,
- a discovery chain reachable through the available tools,
- a persistent consequence that leaves the world changed.

Additional runner rules:

- use capability-based eligibility, not rig-name exceptions,
- prefer explicit source traces for every plan,
- avoid hidden branching that the operator cannot inspect,
- separate proposal, validation, execution, and outcome recording,
- keep the runner deterministic for identical state and input seeds,
- never let the composition layer mutate durable state directly.

## Output contract

The runner should be able to produce three visible things:

1. a player-facing episode banner or summary,
2. a machine-readable episode plan/outcome record,
3. an operator-facing explanation of why the episode was admitted or rejected.

If an episode is rejected, the runner should explain:

- which grammar rule failed,
- which source surface failed the check,
- what would need to change for admission,
- whether the issue belongs to content, capability, progression, or authority.

## UI contract

The runner does not own the unified shell, but it should surface enough state
for the shell to remain honest:

- current episode title,
- current objective or pressure state,
- current rig and place context,
- readable success/failure/recovery status,
- accessible history after resolution.

The shell should remain the presentation layer; the runner should remain the
composition layer.

## Validation rules

The runner contract should fail visibly if it:

- becomes a generic quest dispatcher,
- mutates the world without passing through authoritative handlers,
- hides its selection reasoning,
- ignores the rig/place/pressure/consequence grammar,
- uses rig names where capability envelopes are required,
- bypasses the contract ledger or core loop,
- invents a parallel save or history authority,
- makes recovery invisible or impossible to explain.

## Out of scope for this spec

- No new mission-authoring UI.
- No new save schema.
- No shell implementation.
- No garage implementation.
- No AI director implementation.
- No multiplayer authority migration.
- No procedural generator admission policy beyond the named composition stack.

## Near-term proof slice

The smallest durable proof for this runner is:

1. one bounded episode plan for a single composed episode,
2. one deterministic validation path,
3. one readable outcome summary,
4. one explicit source trace back to the ledger and grammar inputs,
5. one failure path that is honest and inspectable,
6. one handoff back into the core loop and save system.

The roadmap already suggests likely first proof candidates such as Storm Relay
or Unbound Passage 01. This spec does not force the first content choice; it
forces the composition contract that choice must satisfy.

## Open questions

- Should the first runner prove one authored episode or one generated-but-bounded
  episode?
- Should episode selection happen from the contract ledger only, or also from a
  dedicated episode browser later?
- Should recovery be a separate episode kind or just a failure branch inside the
  same plan?
- Should the runner record replay metadata from the start, or only once the
  replay lane is connected?
- Should the first proof emphasize Storm Relay, Unbound Passage, or another
  composed episode candidate?

## Anything else?

Yes. The runner is only useful if it remains legible to players, operators, and
future tooling. If the system cannot explain why an episode happened, the
episode grammar has become opaque instead of expressive.

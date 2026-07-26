# Event Graph and Deterministic Handlers Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current command/checkpoint/toast flow into a named world-event contract.

The runtime already emits checkpoints, save records, and user-facing announcements, but those are still feature-local signals. The repo does not yet have a general world-event scheduler/handler graph that sits between simulation and presentation. This contract makes that missing layer explicit.

## Current evidence base

- Command, checkpoint, toast, and save wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Run-record format:
  - [src/game/run-record.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/run-record.ts)
- Analysis addendum for events:
  - [docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- Roadmap lane for event graph and deterministic handlers:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The runtime already has event-like pieces:

- commands are recorded with names and payloads
- checkpoints capture stable state hashes
- save actions are recorded with schema/version metadata
- toast and status surfaces show player-visible outcomes
- input transitions are captured in the bounded run record

That is enough to prove the game is observable. It is not yet enough to prove the event graph is first-class.

## What is still missing

The repo still lacks a named policy for:

- event identity and versioning
- monotonic ordering guarantees
- deduplication rules
- explicit fan-out ownership
- replay-safe payload shape
- whether an event is replayable or diagnostics-only
- which domain owns each handler

Right now the system can say that something happened. It cannot yet say that the same thing will be handled the same way across domains with explicit ownership.

## Contract shape

The event system should answer:

1. what happened
2. when it happened
3. which subsystem emitted it
4. which state transition it corresponds to
5. whether it is replayable or diagnostics-only

Suggested event envelope fields:

- id
- version
- kind
- originDomain
- emittedAtMs
- elapsedMs
- payload
- replayable
- diagnosticsOnly

## Validation rules

The contract should fail visibly if it:

- emits events out of order
- deduplicates incorrectly
- lets a presentation handler mutate state
- hides the origin domain
- treats diagnostics-only payloads as authoritative state
- allows a handler to cross domain ownership silently

## Near-term proof slice

The smallest durable proof for this contract is:

1. one versioned event envelope
2. one ordered event-graph test across a fixed input slice
3. one deduplication test for repeated events
4. one telemetry hook that records the event origin domain
5. one documented boundary between simulation and presentation handlers

## Open questions

- Which current user-visible change should become the first canonical event: camera switch, module install, save, or recovery?
- Should checkpoints and run-record entries be unified into the event envelope or remain separate but cross-referenced?
- Which diagnostics-only events should never enter replay surfaces?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The game already has meaningful outcomes and records. This contract makes those outcomes portable between simulation, presentation, and debugging without turning the current record flow into a hidden second world model.

## Addendum (2026-07-25) - Existing record flow is observable, not yet canonical

- The live run record verifies cleanly (`ok: true`) and already contains the
  current command/checkpoint/input/save history.
- That is enough to prove the current app is observable.
- It is not yet enough to prove there is a first-class event envelope with
  explicit origin-domain ownership and replayable vs diagnostics-only
  semantics.
- The current command/checkpoint/save flow should therefore be treated as the
  staging surface for a future event graph, not as proof that the event graph
  contract already exists.

## Addendum (2026-07-25) - existing outcomes are real, but the event graph is still implicit

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime already emits meaningful outcomes through existing command and UI
  paths:
  - commands are recorded with names and payloads,
  - checkpoints capture stable state hashes,
  - saves carry schema/version metadata,
  - user-facing toasts/status surfaces report outcomes,
  - input transitions are preserved in the bounded run record.
- That proves the app is observable and replay-adjacent.
- What is still missing is the named event graph itself:
  - no explicit versioned event envelope,
  - no origin-domain ownership field in a shared event contract,
  - no explicit replayable vs diagnostics-only split for events,
  - no deduplication/ordering policy exposed as a first-class boundary.
- So the contract remains correctly staged: observed outcomes first, explicit
  event graph later.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-25) - command/checkpoint/save history is real, but the envelope is still not first-class

- `src/main.ts` still records commands and checkpoints into the bounded run
  record.
- `src/game/run-record.ts` still keeps the record verifiable with monotonic
  timing and checkpoint hashes.
- The live browser surface still exposes the run-record verifier and
  performance snapshot, which means the app already has a measurable event-like
  history.
- What remains missing is the explicit shared event envelope the contract calls
  for:
  - version,
  - kind,
  - origin-domain ownership,
  - replayable vs diagnostics-only classification,
  - ordering/deduplication policy as a named contract.
- So the existing record flow should continue to be treated as the proof base
  for a future event graph, not as a substitute for one.

## Addendum (2026-07-26) - the observed flow is still command-local, not a shared event graph

- Re-checked the live browser daemon and the current source wiring.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- `src/main.ts` still routes outcomes through local command and toast/status
  paths, while `src/game/run-record.ts` keeps the bounded history verifiable.
- That makes the current flow strong enough for observability and internal
  validation, but still not a first-class shared event graph.
- What is still missing is unchanged:
  - no versioned shared event envelope,
  - no origin-domain ownership field,
  - no replayable/diagnostics-only split on the event surface,
  - no explicit deduplication / ordering policy exposed as a contract.
- So the correct reading remains: the app already has meaningful outcomes and
  records, but the event graph is still implicit in local command flow rather
  than formalized as a reusable handler boundary.

## Addendum (2026-07-26) - run-record evidence is the staging surface, not the envelope

- Re-checked the current run-record shape against the live repo state.
- `src/game/run-record.ts` still defines a bounded local history with four
  kinds only:
  - `command`
  - `checkpoint`
  - `input`
  - `save`
- That is useful because it proves the app can already capture meaningful
  history, but it also shows the current limit very clearly:
  - there is still no shared event envelope,
  - no origin-domain field,
  - no replayable/diagnostics-only classification,
  - no explicit deduplication or ordering policy in the reusable contract.
- The next proof slice should therefore be one versioned event envelope that is
  emitted from the command path and can be consumed by simulation, UI, replay,
  and diagnostics without becoming four separate local truth sources.
- Evidence depth: Tier 1 static inspection of the contract and run-record
  source, with the existing Tier 4 runtime observations remaining the staging
  proof base.

## Addendum (2026-07-26) - versioned envelope lands in the canonical record

- `src/game/run-record.ts` is now the one shared event-envelope substrate. The
  record schema is v2 and every new entry carries a deterministic sequence and
  id, `eventVersion`, `originDomain`, and complementary `replayable` /
  `diagnosticsOnly` classification.
- Existing kinds map deliberately: command and input are input-origin replay
  candidates; checkpoint is a simulation diagnostic anchor; save is a storage
  diagnostic anchor. This is a classification contract, not a claim that all
  current command payloads are already cross-runtime replay-safe.
- Repeated inputs are preserved rather than deduplicated. Input history is an
  ordered fact stream, so premature deduplication would silently change replay
  meaning. A future handler bus must declare a separate idempotency key only
  for event kinds whose semantics are safely coalescible.
- `verifyRunRecord` now rejects invalid sequence, id, event version, origin, or
  classification before existing checkpoint-hash checks run. The bounded trim
  maintains monotonic IDs because sequence includes prior dropped entries.
- Still open: handler registration/fan-out, event-specific payload schemas,
  durable record migration, and authority transport. Presentation remains a
  consumer of state and does not receive mutation authority.
- Evidence depth: Tier 1 source and focused-unit-test implementation. The tests
  are present but have not been executed in this pass.

## Anything else? (envelope)

No second event store was added. The existing run record remains bounded and
diagnostic-first, while its envelope fields make later replay, UI, and authority
consumers reference the same ordered truth.

## Addendum (2026-07-26) - staging surface is canonical, dispatch graph is still missing

- Re-checked the live command and run-record wiring after the envelope landed.
- The repo now has a canonical event-history substrate in
  `src/game/run-record.ts`, so command, input, checkpoint, and save outcomes are
  real, ordered, and versioned.
- That still does not amount to a shared dispatch graph:
  - no registered handler fan-out,
  - no per-handler ownership map,
  - no deduplication policy for replay-safe consumers,
  - no explicit playback-vs-diagnostics consumer split.
- So the right reading is unchanged but now sharper: the command-history path is
  the staging surface for a future event graph, not evidence that the event
  graph itself is already canonical.

## Addendum (2026-07-26) - episode grammar depends on this layer for durable consequence

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal composes pressure, discovery, and persistent consequence above this
  contract, but it still relies on this contract to record the actual durable
  consequence.
- In other words: the episode grammar names the authored story shape, while
  the event graph owns the reusable ordered truth that lets that consequence
  flow across simulation, presentation, replay, and diagnostics.
- That keeps the boundary honest: episode grammar can enrich what happens, but
  it does not replace the event graph or its handler ownership rules.

## Addendum (2026-07-26) - the canonical record is real, but the shared dispatch graph is still missing

- Re-checked the current record and authority wiring against the live source.
- The repo now has a stronger canonical event-history substrate in
  `src/game/run-record.ts`, so command, input, checkpoint, save, and outcome
  entries are ordered, versioned, and classification-aware.
- That still does not amount to a reusable shared dispatch graph:
  - no registered handler fan-out,
  - no per-handler ownership map,
  - no replay-safe consumer split beyond the record classification,
  - no explicit deduplication policy for shared consumers.
- So the current record path is the staging surface for a future event graph,
  not proof that the graph itself is already canonical.
- Evidence depth: Tier 1 static inspection. No execution or runtime proof was
  added in this pass.

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

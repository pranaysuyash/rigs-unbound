# Event Propagation and Presentation Observer Gate

**Date:** 2026-07-26  
**Status:** Event-shaped command outcomes and replay diagnostics are active; generic event bus is not justified yet  
**Evidence tier:** Tier 1 static architecture inspection. No test, build, browser, or runtime command was run in this pass.

## Decision

Keep authoritative state transitions and their explicit outcomes close to the owning simulation/state system. Do not introduce a generic runtime event bus until multiple independent presentation or operational consumers require the same semantic event and direct wiring becomes a demonstrated duplication problem.

The current run record is an audit/replay artifact, not a live pub/sub mechanism.

## Current event-shaped behavior

| Mechanism | Role | Authority |
| --- | --- | --- |
| Versioned primary-action and rig-selection outcomes | Immutable result of validation and state transition | State/simulation owns creation. |
| Run-record `event` entries | Diagnostics-only record of authoritative outcomes | Records what happened; never replays as input. |
| Run-record checkpoints | Hash-bound evidence of reconstructed state | Diagnostics/audit only. |
| Renderer/audio/UI updates | Presentation reactions to state and known outcomes | No direct mutation authority. |
| Runtime profile fallback checkpoints | Explainable renderer-quality transition record | Profile/renderer owns decision; simulation remains unchanged. |

This is sufficient while outcomes have a small number of direct consumers and the state snapshot remains the primary presentation source.

## What would justify a shared propagation contract

Introduce a versioned event envelope only when one semantic occurrence must safely serve at least two independent consumers beyond its state owner, such as:

- renderer VFX plus audio plus accessible DOM status;
- activity scoring plus analytics/replay plus a future authority replication adapter;
- an asset lifecycle event consumed by a loading UI and diagnostics;
- a validated world event observed by multiple activity systems.

The trigger is shared semantic consumption, not a preference for event-driven architecture.

## Required future envelope

```ts
type SimulationEvent<TPayload> = {
  id: string;
  eventVersion: number;
  type: string;
  tick: number;
  actorId: string | null;
  correlationId: string | null;
  originDomain: "simulation" | "storage" | "renderer";
  payload: TPayload;
};
```

The final type must be narrower and domain-owned. The point is to require stable type/version/tick/origin semantics before events cross boundaries.

## Event rules

- Commands express intent; events describe accepted/rejected outcomes.
- Events are immutable observations, not instructions to mutate another subsystem.
- Rendering, audio, UI, analytics, and future networking consume events or snapshots; they do not synthesize authority events from visual state.
- Event emission occurs after validation and state mutation order is known.
- Replay uses explicit replayable inputs and verifies outcomes/checkpoints; diagnostics-only events cannot be treated as input.
- Storage/load events declare provenance and recovery state; they do not disguise missing data as a normal gameplay event.
- Each durable event payload must be versioned before persistence, export, or network transport.

## Failure and observability requirements

A future propagation layer must define:

- duplicate-delivery/idempotency behavior;
- subscriber failure isolation;
- ordering and tie-break rules;
- bounded queue/backpressure behavior;
- unsubscribe/lifecycle ownership;
- developer-visible emitted/handled/dropped/error counts;
- replay/authority compatibility; and
- an accessibility fallback when an event would otherwise be audio- or motion-only.

## Non-goals

- No global event emitter now.
- No event-sourcing rewrite of state/saves.
- No renderer-originated gameplay event.
- No use of diagnostic run-record entries as a live event transport.
- No event type with arbitrary unvalidated payloads.

## Closure trigger

Replace this gate with an implementation only when a named semantic outcome has at least two genuinely independent consumers and the direct alternatives would duplicate validation or diverge in behavior. The first implementation must include versioning, delivery/failure tests, diagnostics, and replay treatment in the same change.

## Anything else?

Yes: a shared event envelope becomes a durable data contract. It must be designed alongside save/replay/network migration policy, not introduced as an in-memory convenience that later becomes impossible to evolve.

## Addendum (2026-07-26) - the current command outcomes are still best kept close to their owners

- Re-checked the live source around `src/main.ts`, `src/game/state.ts`, and
  `src/game/run-record.ts`.
- The current architecture still has only a few direct consumers for the
  semantic outcomes:
  - browser HUD / status surfaces,
  - replay and verification hooks,
  - diagnostics / run-record capture,
  - the owning simulation/state reducers.
- That means the repo still has not crossed the justification threshold for a
  generic runtime event bus or fan-out registry.
- The bounded run record remains the audit/replay spine, not a pub/sub system.
- So the right boundary stays: direct ownership for state transitions and
  explicit outcomes, with shared propagation deferred until there are multiple
  independent consumers that genuinely duplicate wiring.
- Evidence depth: Tier 1 static source inspection of the current command,
  state, and run-record paths.

## Addendum (2026-07-26) - episode grammar should compose above this gate, not replace it

- Re-checked the current event-sharing threshold against the broader episode
  grammar direction.
- The gate is the right place for shared semantic outcomes when one event must
  reach multiple consumers:
  - renderer VFX,
  - audio cues,
  - accessible DOM/status surfaces,
  - diagnostics and replay capture.
- That makes the gate the propagation boundary, while the named composition
  stack stays above it.
- A generic bus is still unnecessary because the current consumers remain few
  and directly owned.
- The next durable expansion, if required later, is a narrow versioned envelope
  at this gate, not a global pub/sub layer.
- Evidence depth: Tier 1 static source inspection.

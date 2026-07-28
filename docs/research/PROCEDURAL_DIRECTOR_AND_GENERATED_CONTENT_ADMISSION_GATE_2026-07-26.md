# Procedural Director and Generated Content Admission Gate

**Date:** 2026-07-26  
**Status:** No director or generated-content runtime is active; admission contract staged  
**Evidence tier:** Tier 1 static architecture review. No test, build, browser, model, or production-data command was run in this pass.

## Decision

Rigs Unbound may eventually use a procedural director to propose experiences, but it must not directly mutate the world, select player preferences from opaque inference, or bypass activity/capability/content validation.

The director is a proposal system. The deterministic simulation kernel remains the authority.

## Current reality

There is no active mission generator, player-model learner, director, content model, generated dialogue runtime, or autonomous planner in the playable world. Existing authored sites, progression, activities, capability checks, and primary-action outcomes remain deterministic local rules.

That absence is intentional current scope. It avoids a premature system that can generate unreachable objectives, invalid rewards, contradictory world states, unrecorded behavior, or user-visible manipulation.

## Required architecture

```text
observed authoritative state and explicit player choices
  -> bounded candidate proposal
  -> schema validation
  -> semantic/world/capability/reward validation
  -> deterministic simulation probe
  -> player-facing offer or explicit activation command
  -> authoritative state transition and event
  -> replayable/auditable outcome
```

The director may rank or propose. It must not write to `GameState`, `GameWorld`, saves, reward totals, or renderer state directly.

## Candidate content requirements

Every candidate activity/event must have a versioned data definition containing at least:

```ts
type DirectorCandidate = {
  id: string;
  schemaVersion: number;
  source: "authored" | "procedural" | "model-assisted";
  objective: string;
  requiredCapabilities: readonly string[];
  worldReferences: readonly string[];
  rewardDefinition: unknown;
  estimatedDuration: number;
  failurePolicy: "retry" | "expire" | "recover";
  activation: "offer" | "opt-in" | "scheduled-world-event";
};
```

The actual schema may be narrower than this sketch, but it must be explicit, validated, versioned, and replay-aware before activation.

## Validation gates

| Gate | Rejects |
| --- | --- |
| Schema | Missing/invalid types, unsupported versions, unbounded fields. |
| Reference resolution | Unknown sites, rigs, capabilities, assets, rewards, or activity IDs. |
| Capability compatibility | Impossible machine/tool combinations. |
| World probe | Unreachable objectives, invalid spawn/exit, blocked critical routes, impossible terrain constraints. |
| Reward/economy | Negative/overflowing rewards, circular prerequisites, duplicate redemption. |
| Resource budget | Candidate content exceeding entity, renderer, audio, or persistence limits. |
| Authority/replay | Direct mutation, unrecorded activation, or non-versioned payloads. |
| Player agency | Forced preference profiling, hidden escalation, or no visible opt-out where the event is optional. |

## Player-model and privacy boundary

No current player preference model exists. If one is ever proposed:

- use explicit in-game choices and local session state before inferring sensitive traits;
- explain what is being adapted in player language;
- provide a non-personalized/default path;
- keep preference data local unless a separate collection, retention, consent, and deletion decision is recorded;
- do not infer health, age, vulnerability, financial status, or other sensitive characteristics from play behavior;
- do not use personalization to obscure difficulty, rewards, or paid outcomes.

## Relationship to existing contracts

- Activities must declare requirements against canonical rig capabilities and world affordances.
- The director submits commands or offers; validation/state systems decide legality.
- Activation and material outcomes become versioned events/checkpoints where replay requires them.
- Generated assets use the asset/provenance/preflight path; generated map data uses the world-content ingestion gate.
- Renderer, audio, UI, and analytics observe the outcome; they cannot approve it by themselves.

## First vertical proof

The first director use case should be intentionally small:

1. Choose between two already-authored, validated activity candidates.
2. Explain the selection with stable, non-sensitive reasons.
3. Offer it to the player; do not force activation.
4. Record the offer/accept/reject/expire outcome in local diagnostics.
5. Prove the unselected candidate did not mutate the world.

Only after this proof should the project generate candidate parameters or compose new world/event content.

## Non-goals

- No LLM or generative-model runtime now.
- No automatic difficulty manipulation based on hidden profiles.
- No generated world/objective/reward object directly entering state.
- No autonomous NPC/AI world-writing privilege.
- No remote player analytics or personalization claim.

## Closure trigger

Replace this gate with an implemented, versioned director contract only when a real multi-candidate experience decision exists. That implementation must ship candidate validation, player-facing explanation, diagnostics, replay/authority treatment, and failure recovery together.

## Anything else?

Yes: procedural selection and AI-driven generation are separate risks. A deterministic authored candidate selector is the first proof; model-assisted content adds a distinct untrusted-input, privacy, cost, and safety layer that requires its own decision record.

## Addendum (2026-07-26) - the director remains a proposal layer above episode grammar

- Re-checked the admission gate against the broader compositional direction.
- The procedural director may rank or propose candidates, but it should not own
  story composition, world mutation, or player preference inference.
- Episode grammar remains the layer that composes the lived run; the director
  only feeds validated options into that story system.
- The first durable proof is still a small authored multi-candidate choice, not
  a generative or personalized runtime.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-28) — the director now sits above named topology and episode contracts

- Re-checked the director gate after naming the world graph and keeping the
  episode runner as the bounded composition layer.
- The director should now be read as the next layer up from:
  - `WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md` for topology of place,
  - `EPISODE_RUNNER_SPEC_2026-07-27.md` for bounded episode composition.
- Candidate proposal can inspect topology and episode envelopes, but it still
  must not define place, mutate world truth, or replace the runner’s admission
  rules.
- The first proof remains a small authored multi-candidate choice with visible
  accept/reject reasoning and no hidden world mutation.
- Evidence tier: Tier 1 static source inspection and contract synthesis.

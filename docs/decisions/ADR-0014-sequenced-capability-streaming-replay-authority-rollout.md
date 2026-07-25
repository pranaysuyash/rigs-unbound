# ADR-0014: Sequenced capability, streaming, replay and authority rollout

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [ADR-0010](./ADR-0010-rendering-accessibility-contract.md)
  - [ADR-0011](./ADR-0011-command-capability-affordance-state-separation.md)
  - [ADR-0012](./ADR-0012-rig-perception-chain.md)
  - [ADR-0007](./ADR-0007-terrain-as-simulation-substrate.md)
  - [ADR-0008](./ADR-0008-camera-policies-and-direct-view-selection.md)
  - [3D Game Optimization Gaps + Long-Term Expansion Synthesis](../research/3D_GAME_OPTIMIZATION_GAPS_AND_MORE_LONG_TERM_SYNTHESIS_2026-07-25.md)
  - [3D Game Optimization Gaps — “And More” Execution Roadmap](../research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## Context

The repo already has the core ingredients needed for a durable platform:

- deterministic fixed-step gameplay in `src/game/state.ts`;
- snapshot-driven rendering in `src/game/renderer.ts`;
- save/version migration in `src/game/storage.ts`;
- capability-gated interactions in `src/game/contracts.ts` and `src/game/state.ts`;
- obstacle and terrain simulation in `src/game/collision.ts`, `src/game/terrain.ts`, and `src/game/gameworld.ts`;
- runtime observability in `src/game/performance.ts` and `src/main.ts`.

The remaining architecture gap is not "more features" in the abstract. It is sequencing:

1. visibility and render-budget hardening;
2. capability and affordance contracts;
3. deterministic command/event/replay lane;
4. bounded chunk and asset streaming;
5. authority and multiplayer-only state ownership;
6. ECS or broader actor-system migration only after the above are proven.

Without this order, the project risks creating parallel truth sources, premature abstractions, and a second engine path that is harder to maintain than the first.

## Decision

### 1) Lock the expansion order

The project will treat the following as the canonical rollout order:

1. renderer visibility and quality contracts;
2. capability and affordance schema contracts;
3. command -> validate -> state -> event -> presentation flow;
4. replay and run-record artifacts;
5. chunk / manifest / unload streaming;
6. authority and server-owned truth, if and only if shared-state features require it;
7. ECS migration only if actor count or simulation complexity crosses a measured threshold.

### 2) Keep each layer independently reviewable

Each layer must remain separable:

- renderer does not own simulation truth;
- UI does not mutate world state directly;
- content data does not redefine invariants;
- replay does not become the authority source;
- streaming does not silently change gameplay contracts;
- ECS does not replace contract clarity.

### 3) Require a proof gate before widening the next layer

The next layer may start only after the current one has at least one proven vertical slice.

Examples:

- before streaming expands, one bounded chunk residency scenario must be measured;
- before authority expands, one command/event lane must be replayable and diagnosable;
- before ECS expands, one capability-based activity must work without inheritance-style branching;
- before broader content packs expand, validation and rejection paths must be visible and testable.

### 4) Treat multiplayer and ECS as downstream, not default

Shared-state authority and ECS migration are explicitly valid future directions, but they are not the next default step.

That keeps the current platform aligned with the observed repo shape:

- one authoritative local simulation kernel;
- machine/capability contracts instead of open-ended class inheritance;
- bounded world memory with deterministic save behavior;
- renderer and HUD as consumers of state, not owners of truth.

## Consequences

### Positive

- reduces risk of parallel truth sources;
- keeps the repo focused on first-principles proof instead of speculative architecture;
- makes later multiplayer/streaming/ECS work easier to stage and review;
- preserves current playable progress while scaling the architecture in controlled increments.

### Trade-offs

- this slows broad expansion until proof gates are met;
- some possible future systems remain deferred even though they are valid long-term ideas;
- implementation freedom is narrower because each layer needs an explicit contract and evidence gate.

## Rejected alternatives

- **Do everything at once**: renderer hardening, streaming, ECS, authority, replay.
  - Rejected because it creates architecture theatre and makes it impossible to tell which layer failed.
- **Jump straight to ECS**.
  - Rejected because current contract clarity is not yet complete enough to justify replacing the shape of the actor model.
- **Treat replay or streaming as a side effect of the current systems**.
  - Rejected because both need their own validation and observability paths.
- **Allow authority to be introduced implicitly by networking or collaboration features**.
  - Rejected because authority must be explicit to remain safe and testable.

## Validation plan

- Tier 1:
  - confirm this ADR is linked from the exploration map and roadmap;
  - keep the evidence matrix in the synthesis doc aligned to the rollout order.
- Tier 2:
  - one capability/affordance contract test path;
  - one command -> validate -> event path;
  - one replay/run-record artifact path;
  - one chunk residency / unload policy probe.
- Tier 3:
  - browser acceptance that demonstrates the visibility contract, command flow, and replay/run-record stability across the current local build.

## Acceptance criteria

This ADR should be treated as accepted when the repo can point to:

1. one documented and tested visibility/quality contract;
2. one documented and tested capability/affordance contract;
3. one documented and tested command/event/replay path;
4. one documented and tested chunk/streaming probe;
5. explicit deferment language for authority and ECS until their proof gates are met;
6. exploration and roadmap docs that reference this rollout order.

## Update log

- 2026-07-25: proposed to make the capability/streaming/replay/authority sequencing explicit in a durable ADR after the optimization-gap synthesis and roadmap pass.
- 2026-07-25: the runtime now has a lightweight bounded recorder hook in
  `src/main.ts` and `src/game/run-record.ts`; it captures input transitions,
  checkpoint hashes, structural verification, and exposes truncation plus a
  browser-visible verification hook, while durable playback verification
  remains intentionally deferred until the next proof slice.

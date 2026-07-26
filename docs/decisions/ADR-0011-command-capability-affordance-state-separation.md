# ADR-0011: Command, capability, affordance and contract-first extension path

- Date: 2026-07-25
- Status: proposed
- Owner: Pranay
- Decision owner: project owner
- Implementation owner: project team
- Related:
  - [ADR-0001](ADR-0001-headless-gameplay-kernel-and-engine-bakeoff.md)
  - [ADR-0003](ADR-0003-versioned-gameplay-content-composition.md)
  - [ADR-0006](ADR-0006-rig-capability-portability.md)
  - [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md)
  - [ADR-0008](ADR-0008-camera-policies-and-direct-view-selection.md)
  - [ADR-0010](ADR-0010-rendering-accessibility-contract.md)

## Context

The project now has a fixed-step kernel, snapshot-driven rendering, terrain-centric simulation, and initial capability-based rig intent checks. The latest capability-style audit adds four additional structural requirements before scaling to broad ecosystems:

1. command/authority/state/event ordering as explicit contracts;
2. capability definitions as versioned, testable behavior contracts;
3. world affordances as interaction compatibility data;
4. generated-content safety gates before world mutation.

These requirements are not complete in the current implementation despite good directional alignment.

Evidence in current code today:

- Kernel and deterministic state transitions: `src/game/state.ts`
- Render presentation separation: `src/game/renderer.ts`, `src/game/gameworld.ts`
- Seed/value migration flow: `src/game/storage.ts`, `src/game/state.ts`
- Capability list and action gating: `src/game/contracts.ts`, `src/game/input.ts`, `src/game/state.ts`

## Decision

### 1. Adopt a fixed four-plane change model

Every evolving element must be classified into one of:

1. **Invariants** (rarely changed): kernel tick order, migration ownership, renderer boundaries, input intent model.
2. **Capabilities** (infrequent): locomotion, handling, interaction verbs, and their simulation adapters.
3. **Content** (frequent): world definitions, mission packs, rig profiles, visual presets.
4. **Tuning** (frequent): physics coefficients, reward multipliers, HUD/camera softness.

This prevents content/tuning from mutating core contract behavior.

### 2. Promote capability data to schema contracts before growth

Capabilities move from informal flags to versioned schemas with machine-readable requirements:

- `id`, `version`, `requirements`, `actions`, `telemetry`, `validationRules`, `migrationSemantics`
- runtime state kept in `MachineCapabilityState` with capability instance fields (cooldown, load limits, attachment constraints, failure conditions).

### 3. Enforce immutable command flow and distinct output stages

All high-impact inputs should follow:

- Command (intent, actor, target, timestamp/tick)
- Validation (requirements, affordances, cooldown/state checks)
- State transition (kernel mutation only)
- Event emission (result + reason codes)
- Presentation (render/audio/ui reaction from snapshot/event)

Renderer and UI must not mutate world state.

### 4. Add world affordance matching

World actors expose explicit affordances and capabilities request affordances, not concrete object names.

Example affordance keys: `towable`, `harvestable`, `dockable`, `repairable`, `build-surface`, `triggerable`.

### 5. Treat generated or imported content as untrusted input

Any content path that enters from generators, mod packs, or external edits follows:

`raw -> schema validate -> semantic validate -> reference resolve -> compatibility checks -> budget checks -> normalized runtime -> activation`

Only normalized assets are active in world systems.

### 6. Keep the command stack local-first now, authoritative-only later

The authoritative network lane should reuse the same command/event contracts once local replay/testing stabilizes.

## Consequences

1. Hardening work now is concentrated in contracts and validation, not in rendering hacks.
2. Additional locomotion/activity systems become safer and less coupled.
3. Replay, authority, and bug reconstruction become feasible without architectural rewrites.
4. Migration risk is reduced because changes are explicit per contract tier.

## Alternatives considered

- Continue with ad-hoc direct mutation and hardcoded rig branching.
  - Rejected: leaks interactions and blocks scaling.
- Replace with full ECS before any contract work.
  - Rejected: introduces framework migration risk before proof of compatibility.
- Ignore generated-content safety gates and trust input quality.
  - Rejected: high integrity and recovery risk.

## Validation plan

- Tier 1 evidence now:
  - decision artifacts in this ADR and aligned source references.
- Tier 2 planned:
  - command/event schema tests,
  - capability-definition validation tests,
  - affordance mismatch rejection tests,
  - migration test for changed contract shape.
- Tier 3 planned:
  - deterministic replay playback with event-log replay checksum,
  - browser acceptance on staged profiles.

## Acceptance for this ADR

This ADR reaches accepted implementation state when all are true:

1. At least one capability definition is defined as schema data + migration.
2. One full interaction path uses command -> validate -> transition -> event -> presentation.
3. One affordance mismatch path is rejected with a diagnosable telemetry event.
4. One external/procedural asset candidate is rejected by validation before activation.
5. Renderer path remains snapshot-driven throughout the added flow.

## Anything else?

This does not preclude later ECS or broader authority layers; it defines the contract surface required before those expansions are safe.

## Addendum (2026-07-25) - live runtime still uses the right local spine, but the envelope is not yet structured

- Re-checked the decision against the current browser daemon snapshot and the
  live repo state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current implementation still matches the decision’s intended ordering:
  - commands are captured explicitly,
  - the deterministic kernel owns canonical state mutation,
  - presentation reacts from snapshot/render state rather than mutating the
    world directly,
  - capability admission is real, and affordance mismatch still rejects rather
    than silently mutating state.
- What is still missing is the explicit reusable envelope the ADR calls for:
  - structured request/response objects for mutation,
  - versioned admission reason codes,
  - a distinct telemetry event for accept/reject/defer,
  - a clean speculative-state vs durable-state boundary artifact.
- So the repo is aligned on the direction, but the command/state contract is
  still mostly embodied in code paths and prose, not yet in a named runtime
  envelope that planners or future authority layers can consume directly.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code and
  doc inspection.

## Addendum (2026-07-26): first semantic action resolver implemented

The primary-action path now has an explicit command-resolution boundary:
`resolvePrimaryAction(state, world)` returns a semantic kind plus player and
accessibility labels without mutating state. `performPrimaryAction` consumes
that same kind for cargo release/attach, salvage collection, plough raise/lower,
or a visible no-action result.

The desktop control strip, touch button, aria label, browser automation, and
mutation path therefore cannot independently guess the current verb. Blade and
recovery controls also expose capability/state (`cut`/`fill`, available winch,
emergency recovery, or unavailable) rather than generic labels.

This is the first accepted slice of the ADR's command→validation→transition
direction, not completion of the full event/authority envelope. It still lacks
versioned command IDs, structured rejection reason codes, and emitted domain
events. Those remain required before network authority or creator-authored
interaction packs.

## Update log

- 2026-07-26: The cargo relay primary action is now the first full local
  command proof. `executePrimaryActionCommand()` validates a versioned actor
  intent, applies the existing authoritative state transition, and returns an
  immutable accepted/rejected event with stable reason codes. The compatibility
  wrapper used by input surfaces returns the same event, and both browser call
  sites capture it in the bounded run record. This is still a local vertical
  slice, not a shared event graph, replay playback engine, or network authority
  implementation.
- 2026-07-26: The canonical bounded run record advanced from schema v1 to v2.
  Its entries now carry deterministic sequence/id, event-envelope version,
  origin-domain ownership, and replayable-versus-diagnostics classification.
  This satisfies the ADR's first reusable event-envelope proof without adding
  an independent bus or granting presentation mutation authority. Ordered input
  entries intentionally do not deduplicate; future idempotent handler events
  must carry their own declared key and policy.
- 2026-07-26: The primary-action recorder wiring now enforces the distinction
  the envelope requires: `primaryAction` remains replayable input intent, while
  `primaryActionOutcome` is a simulation-origin diagnostics-only `event`.
  Verification rejects kind/metadata disagreement. This is a local
  command/outcome proof, not replay playback, a general event graph, or network
  authority.
- 2026-07-26: A local deterministic replay validator now reconstitutes the
  seed-backed state/world pair and verifies canonical checkpoint hashes for a
  declared command subset. It explicitly rejects unported replayable commands
  and treats diagnostic events as non-input. This proves command/event trust
  separation can be executed without granting renderer/UI authority; it does
  not promote the bounded record into a general event bus or multiplayer layer.
- 2026-07-26: Rig selection is the second local command/outcome proof. The
  versioned `select-rig` executor centralizes existing active-actor, stability,
  spatial-range, and idempotency semantics; browser inputs record its separate
  simulation outcome. This validates a non-affordance command shape without
  introducing a general bus, remote authority, or speculative state layer.
- 2026-07-26: The bounded run record advanced to schema v3 with an immutable,
  hash-bound initial state/world-memory context. Local replay validation now
  restores that exact admitted context instead of assuming a fresh seed, while
  refusing any tampered or unrecoverable baseline. This adds no save-import API,
  context migration, ghost sharing, or shared authority claim.

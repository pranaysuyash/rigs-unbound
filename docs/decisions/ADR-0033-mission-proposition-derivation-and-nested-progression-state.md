# ADR-0033: Mission proposition derivation and nested progression state

Status: Proposed - operator sign-off required
Date: 2026-07-28
Owner: rigs-unbound gameplay systems

## Context

The current gameplay kernel already has contract-like systems for cargo relay, survey routes, procedural expeditions, and rig capability gating. The next gameplay layer needs to add progression without turning missions into a rigid authored table or forcing every future mission type into save-state.

ADR-0018 records an accepted product principle of per-rig Journey, per-verb Mastery, and profile-level Insight without universal player XP. This ADR makes the capability-shaped model canonical while preserving the XP-based design as a documented option for future games or hybrid use.

## Decision

**Canonical model: Capability-shaped progression (per-rig Journey + per-verb Mastery + profile Insight)**

Implemented in `src/game/progression.ts` and nested under `GameState.progression`:

```typescript
interface ProgressionState {
  journeys: Record<string, RigJourneyState>; // per-rig history
  mastery: Record<string, Partial<Record<RigCapability, MasteryState>>>; // per-rig, per-verb skill
  insight: number; // profile-level knowledge
  completedMilestones: readonly string[];
}
```

**Preserved for future use: XP-based progression (universal account XP + levels + rungs + restoration arc)**

Documented in `docs/systems/PROGRESSION_SYSTEM.md`. Not implemented in runtime code. Available as a design reference for:

- Future games in the same engine that want universal XP
- Hybrid modes where account XP coexists with capability mastery
- Prestige/legacy systems that convert capability progress into account XP

**Mission layer: Derived propositions, not persisted tables**

- Mission proposals are recomputed from current `GameState`, world state, weather, and discovered sites
- New mission families are added by registering new generators in `mission-propositions.ts`
- Accepted missions are represented by existing game bindings (cargo relay, survey route) and reward resolution, not by a fixed save-format ledger

## Why this shape

- Keeps the system open for additive growth
- Avoids a rigid authored mission database in save files
- Allows future divergence: more mission bindings, more progression tracks, more reward types, more rig-specific restoration paths
- Preserves determinism: the same world state yields the same mission propositions
- Keeps player accomplishment durable where it belongs: capability progress is persisted, missions are not

## Consequences

### Positive

- New mission generators can be added without save migrations
- Progression can grow from capability tracks into multiple tracks if needed
- Journey logic, mastery ranks, and milestone rewards stay pure and testable
- Mission derivation can evolve with weather, region, rig capability, and world discovery

### Negative

- Save schema version increases
- Recovery code must tolerate older saves missing progression
- More of the gameplay model becomes explicit data, which requires tests and documentation

## Implementation status

- `src/game/progression.ts` — capability-shaped kernel (implemented, tested)
- `src/game/mission-propositions.ts` — generator registry + derivation (implemented, tested)
- `src/game/mission-resolver.ts` — reward routing into capability tracks (implemented, tested)
- `src/game/activities.ts` — reward definitions for cargo/survey (implemented)
- `GameState.progression` nested field with save schema v10 migration (implemented, tested)
- `docs/systems/PROGRESSION_SYSTEM.md` — XP-based design preserved as reference (documented)

## Open questions

- Should mission acceptance itself eventually become a durable event log instead of being inferred from current bindings?
- Should additional progression tracks be namespaced under `progression` now, or added only when they become real gameplay?
- Should milestone rewards remain salvage-based, or should the reward palette expand to modules, reputation, or unlock tokens?

## Update log

- 2026-07-28: Initial draft. Proposed the nested progression state and derived mission proposition model to keep the system open while allowing a schema bump.
- 2026-07-28: Added explicit reconciliation gate against ADR-0018. The current implementation is runtime evidence, not product-level acceptance of universal XP.
- 2026-07-28: Operator correction: do not default to conservative paths. Continue toward the strongest long-term, first-principles architecture aligned with `motto_v4`.
- 2026-07-28: **Canonical decision** — capability-shaped progression is the runtime model. XP-based progression is preserved in design docs for future/hybrid use.

## Anything else?

Yes. The architecture stays open only if future additions are additive and generator-based, not hardcoded into a single mission ledger or a flat save blob.

## Addendum — 2026-07-28 XP interoperability exploration

Operator direction confirms that capability-shaped progression remains canonical,
while the older XP design should be explored rather than discarded. The bounded
uses and migration rules are recorded in
[Progression Mode Interoperability and Legacy XP Exploration](../research/PROGRESSION_MODE_INTEROP_AND_LEGACY_XP_EXPLORATION_2026-07-28.md).

XP may be a derived campaign summary, a mode-local score, a future mode's
primary progression, or preserved legacy evidence. It must not become a second
mutable campaign authority or silently convert into Mastery, Insight, or rig
power.

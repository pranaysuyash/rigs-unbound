# Progression Model Coexistence and Composition

Date: 2026-07-28
Status: Exploration resolved into an implementation boundary
Related:

- [ADR-0018: Progression spine](../decisions/ADR-0018-journey-mastery-insight-progression-spine.md)
- [ADR-0033: Mission propositions and nested progression state](../decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md)
- [Progression System](../systems/PROGRESSION_SYSTEM.md)
- [Progression Contract Integration Review](../reviews/PROGRESSION_CONTRACT_INTEGRATION_ISSUE_REVIEW_2026-07-28.md)

## Question

Can the project retain both progression models while applying the newer capability-shaped model to the current games and allowing future games to use universal XP, or combine both when that is useful?

## Answer

Yes. That is the strongest architecture for this project.

The models should coexist, but they must not be treated as two interchangeable definitions of the same value:

1. **Capability-shaped progression is canonical at the engine/product foundation.**
   - Per-rig Journey records the history and restoration of a specific machine.
   - Per-verb Mastery records demonstrated competence with a capability in varied situations.
   - Profile-level Insight records knowledge, discovery, and access to broader propositions.

2. **Universal XP progression is an optional game policy.**
   - A game may add account XP, levels, rungs, restoration XP, prestige, or similar abstractions.
   - Those values belong to that game's progression policy, not to the canonical capability state by default.
   - A future game can use XP alone for selected systems, use it alongside capability progression, or omit it entirely.

3. **Hybrid progression is explicit composition.**
   - One activity may award Journey, Mastery, Insight, XP, or any declared subset.
   - Each reward is routed to a named track by policy.
   - No implicit XP-to-mastery or mastery-to-XP conversion is performed.

This preserves the current machine-centered design while keeping the engine open for games whose fantasy benefits from a visible universal ladder.

## Why capability progression is the canonical base

The current project is about machines, place, work, adaptation, and remembered consequences. A universal level is too coarse to be the foundation because it cannot answer the important gameplay questions:

- Which rig has actually been restored?
- What can this rig do because the player demonstrated it?
- Which verb has the player learned in different terrain, loads, weather, and outcomes?
- What knowledge has the player earned that should change future propositions?

Journey, Mastery, and Insight answer those questions directly. They also avoid making every activity feed one global number merely to keep a level bar moving.

XP remains useful, but it answers a different question: how much aggregate advancement should a particular game expose as a simple ladder?

## Ownership boundary

### Canonical engine state

`GameState.progression` currently stores the capability-shaped state from `src/game/progression.ts`:

```typescript
interface ProgressionState {
  journeys: Record<string, RigJourneyState>;
  mastery: Record<string, Partial<Record<RigCapability, MasteryState>>>;
  insight: number;
  completedMilestones: readonly string[];
}
```

This state is durable, serializable, migrated, and consumed by current mission and public-state code.

### Optional game policy state

A game that selects XP should add a namespaced policy state rather than adding ambiguous fields to the canonical capability object:

```typescript
interface XpProgressionState {
  accountXp: number;
  level: number;
  rung: number;
  perRigRestorationXp: Record<string, number>;
  prestige?: number;
}

interface GameProgressionPolicyState {
  capability: ProgressionState;
  xp?: XpProgressionState;
}
```

The exact shape is a future implementation contract, not a reason to add dormant XP fields to the current save state.

The important rule is ownership: `capability` and `xp` are separate tracks with separate derivation functions and migration behavior.

## Three valid game configurations

### Configuration A: Capability-only

Use for the current machine-keeper games.

- Activity completion writes Journey, Mastery, and Insight according to the activity definition.
- Content gates inspect capabilities, Journey phase, Mastery rank, and Insight.
- No account level or universal XP is shown or required.

This is the current runtime direction.

### Configuration B: XP-only for a future game

Use when the game fantasy is better served by a conventional progression ladder.

- The game enables the XP policy.
- Activity rewards write XP and derive level/rung/restoration values.
- Capability progression may be disabled or retained only as an internal telemetry/achievement layer.
- Content gates use the declared XP policy, not hidden capability assumptions.

This lets the engine support a different game without forcing the current product to adopt universal leveling.

### Configuration C: Hybrid

Use when both aggregate advancement and demonstrated machine competence matter.

Example:

- Completing a difficult storm delivery awards:
  - Journey investment to the active rig;
  - Mastery for the capabilities actually used;
  - Insight for the discovered route;
  - account XP for the game-level ladder;
  - per-rig restoration XP if the game's restoration policy opts in.
- A new rung may unlock a broad content tier.
- Mastery still determines whether a specific rig/verb combination can execute or perform efficiently.
- Journey still determines the machine's visible restoration state and local slot allowance.

The same activity can feed both systems, but the reward packet must state each destination explicitly.

## Reward routing contract

Future policy composition should follow this shape conceptually:

```typescript
interface ProgressionRewardContext {
  activityId: string;
  rigId: string;
  capabilitiesUsed: readonly RigCapability[];
  situationHash: string;
  difficulty: string;
  outcome: "success" | "failure" | "partial";
}

interface ProgressionRewardPolicy {
  applyCapabilityReward(
    state: ProgressionState,
    context: ProgressionRewardContext,
  ): ProgressionState;
  applyXpReward?(
    state: XpProgressionState,
    context: ProgressionRewardContext,
  ): XpProgressionState;
}
```

The actual interface can evolve when an XP-consuming game exists. The boundary matters now:

- reward computation is pure;
- track updates are explicit;
- activity definitions remain the reward authority;
- mission propositions read the policy-selected gates;
- save recovery validates each namespace independently.

## What must not happen

Do not:

- add `xp` to `ProgressionState` merely to satisfy an older test or document;
- rename Insight to XP or treat Mastery points as universal XP;
- derive one track from the other by default;
- let UI labels hide which track produced an unlock;
- make every future game pay the complexity cost of XP;
- let a hybrid game mutate both tracks through an unlabelled generic `addProgression()` function;
- persist mission tables just because a game has an XP ledger.

These patterns create two editable truths and make saves, migrations, missions, UI, and reward tuning ambiguous.

## Migration and compatibility

The current save schema should remain capability-first. XP is added only when a game policy is selected and its save contract is real.

When XP is introduced:

1. Add an explicit policy/version marker.
2. Add an `xp` namespace or a game-specific progression payload.
3. Default missing XP to the policy's initial state during recovery.
4. Never infer historical XP from Journey, Mastery, or Insight without a declared migration formula.
5. If a conversion is desirable, make it a one-time migration with a versioned, testable rule and player-facing explanation.
6. Preserve capability state unchanged during the migration.

This avoids contaminating current saves with speculative fields while making later adoption safe.

## Recommended sequencing

1. Keep the current capability-shaped runtime as the canonical implementation.
2. Keep the XP design document as a reusable optional policy reference, not as current product behavior.
3. Finish current-game mission acceptance and first meaningful spend using capability gates.
4. When a future game genuinely needs XP, implement it as a separate policy module and namespace.
5. Add hybrid composition only when a concrete game has a reason for both tracks.
6. Add cross-track conversion only if a game design requires it and the conversion has an explicit economy and migration contract.

## Decision boundary

This exploration resolves the architecture question, not every future balance question.

- The current games use capability-shaped progression.
- XP remains available for later games.
- Hybrid use is allowed and expected where it improves a specific game's design.
- No universal XP runtime fields should be added to the current capability state until an actual consumer and policy exist.

That is coexistence with precedence, not a forced choice and not an accidental dual authority.

# Progression Contract Integration Issue Review

Date: 2026-07-28  
Status: Blocked pending parallel runtime-owner reconciliation  
Severity: P1 integration blocker  
Scope: `src/game/progression.ts`, `src/game/state.ts`, progression/mission tests

## Finding

The required integration gate currently fails during TypeScript compilation.

Command:

```text
npm run typecheck && npx vitest run
```

Observed outcome: `npm run typecheck` exits with code 1 before Vitest runs.

The active `state.ts` and new progression/mission tests expect a universal-XP contract including:

- `advanceProgression`
- `levelFromXp`
- `restorationStageForXp`
- `rungForLevel`
- `totalAccountXp`
- `ProgressionState.xp`
- `ProgressionState.perRigRestorationXp`
- XP-bearing mission rewards and `minRungIndex`

The live `progression.ts` instead exposes a capability-shaped model based on rig journeys, verb mastery, insight, and milestones. It explicitly states that no universal XP or player level exists.

## First-principles interpretation

This is not a missing-export lint repair. It is a source-of-truth conflict between two progression models:

1. capability-shaped progression: rig journey + mastery + insight;
2. universal account XP progression: level/rung/restoration XP.

Adding aliases or `any` fields would preserve two editable truths and make future save, mission, UI, and reward behavior ambiguous. The owner must choose whether universal XP is a deliberate product decision or whether the newer capability-shaped model supersedes the incoming tests and state consumers.

## Required reconciliation

The runtime owner must choose one canonical path and update the full dependency chain in one coherent slice:

- `ProgressionState` and initial state construction;
- mission proposition and reward contracts;
- state mutation and persistence/migration behavior;
- progression tests and mission tests;
- player-facing progression labels and operator evidence;
- relevant ADR/tracker status.

If universal XP is retained, define its relationship to rig journey, mastery, and insight rather than silently replacing those concepts. If capability-shaped progression is retained, migrate `state.ts`, tests, and mission contracts to that model and preserve only explicit compatibility data needed for save migration.

## Closure gate

Do not advance `RU-0901–RU-0909`, `RU-0601 + RU-0406`, or claim implementation readiness until all of the following are true:

- one canonical progression contract is recorded in an ADR or explicit contract document;
- `src/game/` runtime owner reconciles the callers and tests;
- `npm run typecheck` passes;
- `npx vitest run` completes and its result is recorded;
- save/reload and migration behavior is covered for the selected contract;
- player and operator surfaces explain the resulting progression state.

## Ownership and constraint

`src/game/` contains uncommitted parallel-owned runtime work. This review does not edit it. Runtime changes require explicit collision clearance from the project owner or the owning agent. Documentation and tracker updates are safe and have been made to preserve the blocker and its closure path.

## Evidence tier

Tier 1 static/integration-gate evidence: the command was executed against the current workspace and TypeScript reported the contract mismatch. No browser or runtime evidence was collected because compilation did not reach the test or browser stages.

# Progression Contract Integration Issue Review

Status: Reconciled architecture; runtime implementation gate closed for the progression-model question
Severity: P1 design/integration issue, resolved at the contract level
Scope: `src/game/progression.ts`, `src/game/state.ts`, progression/mission tests

## Finding

The repository contains two progression models:

1. capability-shaped progression: rig Journey + per-verb Mastery + profile Insight;
2. universal account XP progression: level/rung/restoration XP.

They do not need to be collapsed into one model. The current runtime already uses the capability-shaped model consistently: `ProgressionState` contains journeys, mastery, insight, and milestones; mission rewards route into those tracks; save recovery validates that shape; and the active progression tests assert it.

## Resolution

The capability-shaped model is canonical for the current games and engine foundation because it describes machine history, demonstrated capability, and player knowledge directly.

The XP model is retained as an optional game-specific policy. A future game may:

- use XP alone;
- use capability progression and XP together;
- use XP for account-level gates while capability tracks govern rig/verb eligibility;
- add per-rig XP restoration where that game's restoration fantasy needs it.

A hybrid must namespace the tracks and route rewards explicitly. It must not add ambiguous XP fields to the current `ProgressionState`, rename Insight or Mastery points to XP, or silently derive one track from the other.

The detailed boundary is documented in [Progression Model Coexistence and Composition](../exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md).

## Consequences

- Current games continue using capability-shaped progression without a universal level ladder.
- Future games can opt into XP without forcing XP complexity into every save or mission contract.
- Hybrid games can award both tracks from one activity through an explicit progression policy.
- Cross-track conversion, if ever needed, requires a versioned migration/economy rule and must preserve capability state.

## Remaining implementation boundary

This resolves the source-of-truth question. It does not claim that an XP policy or hybrid policy has already been implemented. When a concrete XP-consuming game exists, its policy state, reward routing, gates, migration, and UI must be implemented and tested as a separate slice.

The current mission-board/acceptance surface remains a product implementation gate, but it is no longer blocked on choosing between these two models.

## Evidence

- `src/game/progression.ts`: capability-shaped canonical kernel.
- `src/game/state.ts`: durable `GameState.progression` integration.
- `src/game/progression.test.ts`, `state-progression.test.ts`, and `mission-resolver.test.ts`: capability-shaped runtime coverage.
- `npm run typecheck`: passed.
- `npx vitest run`: 65 files, 382 tests passed.
- `node tools/first-cut-browser-acceptance.cjs`: all 6 steps passed on
  canonical port 4173 with zero console errors. The flow covered salvage
  collection, `lug-tires` first meaningful spend, first-cut progression, blade
  interaction, and furrow creation.

The browser harness was aligned with the live `--tractor-rust` token after its
first run reported `rgb(210, 150, 75)` as an active objective border absent from
the historical allowlist. This was a test-contract correction, not a runtime
behavior relaxation.

## Addendum — first-rung onboarding contract drift

The comprehensive `node tools/rig-lab-browser-acceptance.cjs` harness currently
times out after fitting `lug-tires` while waiting for
`progression.firstRung.complete === true`.

This is a genuine contract drift, not a harness-only issue. The accepted
product evidence in `FIRST_RUNG_AND_UNBOUND_PASSAGE_ADMISSION_2026-07-26.md`
and `PARALLEL_WORK_PRESERVATION_AUDIT_2026-07-26.md` says:

- the first meaningful module fit completes the mandatory first rung;
- first-cut is optional immediate proof of benefit;
- onboarding cannot require a plough-capable rig.

The runtime reconciliation now restores the accepted semantics: after one
meaningful module is fitted, the resolver reports `complete: true` while
retaining `stage: "first-cut"` as optional contextual guidance. Focused tests
were updated accordingly, and the first-cut browser smoke remains green.

The comprehensive browser harness still has an open player-comprehension
failure: it times out waiting for the `Fit a part at Home Silo` control lesson
after reaching `choose-part`. The workshop lesson must be made observable in
that real keyboard flow, or the harness must be corrected only if its setup is
proven stale. Save/reload evidence remains open until this lesson gate passes.

## Addendum (2026-07-28) - Current acceptance disposition

The first-rung contract reconciliation is now integrated and accepted by automated evidence: first fit completes the mandatory rung, while first-cut remains optional contextual guidance. Root/deterministic typechecks pass, the full suite passes at 65 files / 383 tests, and the canonical 4173 browser acceptance passes across desktop and touch recovery/reload paths with zero console problems. The remaining progression work is not a campaign XP migration: it is a future mode-scoped XP prototype with explicit reward routing and idempotency, as described in the progression coexistence exploration.

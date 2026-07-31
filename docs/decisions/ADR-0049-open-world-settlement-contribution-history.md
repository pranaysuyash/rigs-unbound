# ADR-0049: Open-World Settlement Contribution History

**Status:** Proposed, implementation evidence in progress. Operator sign-off required for the long-term migration of legacy settlement outcomes.

**Date:** 2026-07-29

## Context

Rigs Unbound must not reduce inhabited places to fixed mission chains or
completion flags. Existing settlement records retain legacy mission outcome
identifiers, while the first settlement-life projection made pressure and
resident behavior visible but could not persist a voluntary response.

## Decision

Settlement records now retain bounded, idempotent contribution history. A
contribution records an authored response identity, the machine capability used,
and diegetic time. Response definitions declare the pressure facet and service
relief they provide. Multiple contributions may coexist; no contribution marks a
place complete, unlocks a route, or creates a mission.

The deterministic kernel owns recording and recovery. The renderer and dialogue
project resulting service availability and resident behavior only.

## Consequences

- A plough cut at Long Furrow can improve field capacity while leaving stores
  and wider drainage pressure unresolved.
- A tow-capable rig can move soaked stores without becoming the only valid
  response to the place.
- Contributions increase local favor as remembered help, not a spendable
  currency or an access gate.
- Existing `settlementOutcomeId` records remain recoverable. They are legacy
  compatibility, not the target model.

## Migration and validation plan

1. Migrate campaign contracts from settlement outcome ownership to material
   world facts and contribution-aware consequences.
2. Add direct resident knowledge and visible work props for each response.
3. Prove physical, partial, delayed, and ignored outcomes in browser playtests.
4. Keep historical saves recoverable through schema v23 recovery.

## Affected surfaces

- `src/game/settlement-needs.ts`
- `src/game/settlement-life.ts`
- `src/game/state.ts`
- `src/game/renderer.ts`
- `src/game/mission-lifecycle.ts` (legacy compatibility only)

## Revisit when

Revisit when legacy campaign-linked settlement outcomes are removed, or when a
new machine capability needs a response family not expressible through the
current service-relief contract.

## Addendum (2026-07-29): Spatial affordance correction

The initial command proof selected a compatible response across a full
settlement service radius. Contribution authority now requires a real material
affordance inside that place. The kernel evaluates `machine capability +
material affordance + live pressure`, then records the same durable partial
consequence. It does not accept a mission, require an action order, or reserve
an answer for a named rig.

This corrects the implementation shape without accepting the broader ADR.
`Proposed` status remains until operator sign-off and legacy
settlement-outcome ownership is migrated.

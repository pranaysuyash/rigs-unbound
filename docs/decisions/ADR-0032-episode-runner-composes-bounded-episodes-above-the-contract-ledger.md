# ADR-0032 — Episode runner composes bounded episodes above the contract ledger

- Date: 2026-07-27
- Status: Proposed — operator sign-off required
- Owner: Rigs Unbound integration-first composition layer
- Affected runtime: future composition layer above `src/game/state.ts`,
  `src/main.ts`, and the contract-ledger / shell / fleet surfaces
- Related evidence: `docs/research/EPISODE_RUNNER_SPEC_2026-07-27.md`,
  `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md`,
  `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`,
  `docs/research/GARAGE_FLEET_ROSTER_SPEC_2026-07-27.md`,
  `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`,
  `docs/exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md`

## Context

The current runtime already has a strong persistent substrate: a fixed-step
kernel, save/version continuity, capability-aware action gating, and a
readable public state surface. The missing piece is a named composition layer
that can assemble those existing contracts into a bounded, player-legible
episode without becoming a second quest ledger or hidden story machine.

The episode runner specification now captures the shape of that layer. This ADR
records the load-bearing decision that the runner should exist as a read-only
composition layer above the contract ledger and core loop rather than as a new
runtime authority.

## Decision

1. Keep the contract ledger as the read surface for available activities,
   progression gates, and readable history.
2. Keep the episode runner as the composition layer that reads the ledger,
   current public state, and authored proposal metadata to assemble bounded
   episodes.
3. Require capability-based eligibility, explicit source traces, deterministic
   validation, and visible rejection reasons for episode admission.
4. Do not let the episode runner mutate durable state directly; outcomes must
   still flow through the existing authoritative handlers and save path.
5. Treat the unified UI shell and garage/fleet roster as presentation surfaces
   for the same composition stack, not as separate truth sources.

## Options considered

- Keep no named episode runner: rejected because the repo already needs a
  durable way to describe episode composition, and leaving that unnamed would
  keep the architecture ambiguous.
- Create a second quest ledger / mission state machine: rejected because that
  duplicates authority, confuses the product model, and encourages a parallel
  truth source.
- Make the runner authoritative over durable mutation: rejected because the
  existing kernel and save path already own durable truth.
- Record the runner as a read-only composition layer above the ledger and
  kernel: chosen because it preserves one owner per truth while still giving
  future implementation a durable contract.

## Consequences

- Future implementation has a clear boundary: the runner composes episodes, it
  does not replace the loop.
- The contract ledger stays readable instead of becoming a hidden state machine.
- The UI shell can surface episodes, pressure, and recovery without taking
  ownership of gameplay truth.
- The garage/fleet view can participate in episode choice without becoming a
  second mission authority.

## Validation

- Static source evidence now exists in the episode runner, contract ledger,
  shell, and garage specs.
- The repository still lacks runtime implementation of the runner itself.
- Browser/runtime proof will be required once the composition layer is wired
  into the live surface.

## Rollback and revisit triggers

Revisit this decision if:

- the contract ledger becomes rich enough that a separate runner is no longer
  useful;
- the runner starts duplicating the save or event authority already in the
  kernel;
- the first implementation attempt produces unreadable episode admission
  rules;
- a later product decision replaces the episode grammar with a different
  canonical composition model.

## Update log

- 2026-07-27: Recorded the decision after the episode runner specification was
  written and cross-linked to the contract ledger, shell, and garage/fleet
  contracts.

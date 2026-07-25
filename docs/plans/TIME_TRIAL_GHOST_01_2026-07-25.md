# Plan: Time Trial 01 — circuits, checkpoints, and ghost replay

Date: 2026-07-25
Status: **planned; queued behind Farmfall Slice 01** (operator direction 2026-07-25: "do all" — this is the third workstream)
Decisions: ADR-0002 addendum (same-fleet time trial as cross-mode proof),
ADR-0014 step 4 (replay/run-records), ADR-0003 (`RunSpec`/`RunRecord` model),
ADR-0006 (capability portability — circuits must not require a specific rig).

## Intent

Prove that the same machines, in the same world, with their damage, cargo
history, and mastery intact, can shift genre into a race — without a mode
menu. A circuit is a *place*: gates painted onto existing routes (Long Furrow
loop, Quarry climb, Sunken Flats water line). Enter the start gate and the
trial is on; leave the corridor and it pauses, not fails.

This unit also forces the ADR-0014 step-4 replay lane honestly: a ghost is
just a recorded `RunSpec` (seed + input journal) replayed through the
deterministic kernel — the same artifact multiplayer authority and shareable
replays will later depend on. If we cannot replay a time trial bit-exactly,
we cannot do authority; better to learn that here.

## Scope

1. **Circuit contracts** (`circuits.ts`, kernel): versioned circuit
   definitions as data — ordered gates (position + radius), corridor width,
   vehicle-class-free (any rig may attempt; the leaderboard is per-rig-class
   by mobility adapter, not per rig name). Two authored circuits first:
   a mixed-terrain loop and a water-crossing line that only hover handles
   cleanly (capability-as-strategy, not capability-as-gate).
2. **Trial state machine**: idle → armed (entered start gate) → running →
   finished | abandoned. Checkpoints validate order; missing a gate beyond
   the corridor pauses the clock with a clear affordance to rejoin. All
   kernel-side, deterministic, covered by the existing run-record journal.
3. **Ghost capture**: during a trial, journal `InputFrame`s per tick into the
   run record (already journaled globally — trial capture tags a range).
   A finished trial's best record stores seed + circuit id + input journal +
   final time as a `RunRecord` (bounded, cap ~10 per circuit).
4. **Ghost playback**: replay inputs through `stepGame` on a shadow state;
   the rendered ghost is a translucent rig driven by replayed positions.
   Bit-exact verification: replayed final state hash must equal the recorded
   tick hash (the run-record verifier already defines the hash discipline).
5. **Presentation**: gate props + next-gate beacon, trial clock in the field
   kit, delta-to-ghost indicator, finish card (time, mastery earned — trial
   situations feed Verb Mastery like any other), per-circuit best list.
6. **Persistence**: best records + ghosts ride the save schema (version bump
   at implementation time), with the usual bounded, validated, migratable
   posture.

## Tests / acceptance

- Kernel: gate ordering, corridor pause/rejoin, abandon, determinism of a
  recorded trial (same seed + journal → identical final hash), bounded
  records, migration.
- Replay honesty: tamper one input in the journal → hash mismatch detected.
- Browser acceptance: run a circuit with Torque and with Drift, beat a time,
  see the ghost on the next run, reload and find the record intact.

## Explicitly out of scope

- Online leaderboards, share URLs (ADR-0004's public evidence surfaces —
  needs the deployment authority revisit), multiplayer racing, collision
  between ghost and player (ghosts are non-physical by design).

## Dependency note

Queued behind Farmfall Slice 01 because both touch `stepGame`, the primary
action chain, the field kit, and the save schema; landing them simultaneously
would create a merge hazard and muddy each unit's evidence. Farmfall's Phase A
establishes the mastery/event plumbing this unit's trial situations reuse.

## Anything else?

Yes. The ghost is the cheapest possible rehearsal for the hardest deferred
system (authority/netcode). Treat its bit-exactness gate as non-negotiable:
a ghost that "mostly" replays is evidence the determinism contract is broken,
and everything downstream (replays, spectating, authority) inherits the rot.

# Ralph goal — the fleet-recovery vertical slice

Paste the block below into `/ralph-loop` in a **fresh session**. It is under the
4,000-character goal limit that rejected the original review text.

Sequence and rationale come from the 2026-07-28 external review; item 1 of that
review is already done (see the P0 entry in `WORKLOG_ADDENDUM_2026-07-28.md`).

---

```text
Build ONE complete vertical chain in rigs-unbound:
world situation -> pure assessment -> proposition -> accepted intent ->
validated command -> authoritative transition -> event -> persistence -> replay.

Concrete slice: recover a disabled rig under weather pressure.

RULES
- Read AGENTS.md, motto_v4.md, and docs/plans/NEXT_FIVE_REACHABILITY_TRANCHE_2026-07-28.md first.
- src/game/ may hold parallel-owned work. Re-check git status before editing; do not
  clobber another agent's in-flight files.
- An unreachable module cannot be trusted to be correct. Before wiring ANY dormant
  module, re-derive it against the live kernel. Expect supersession, not wiring.
  Precedent: ADR-0034.
- Simulation owns anything that survives reload or replay. Selectors must be pure;
  src/game/selector-purity.test.ts enforces this. Never weaken it.
- Every ADR claiming implementation must name the check that would falsify it.

ORDER (one gate each, verify before advancing)
1. Rename the mission binding "recovery" -> "salvage-retrieval". Reserve
   "fleet-recovery" for recovering an actual rig. Update tests and UI copy.
2. Add pure deriveFleetRecoveryAssessment(state, world, weather). Narrow first
   slice: one rig at condition 0, one operational rig with `tow`, within
   connection range, terrain and weather permit traction. It must explain which
   rig needs recovery, which support rigs qualify, what capability is missing,
   whether proximity suffices, what weather/terrain worsens it, and what command
   is issuable.
3. Wire weather into stepGame() and the traversal/grip calculation, so wet ground
   actually lowers grip BEFORE any mission text claims it does.
4. Make the contract board and radial wheel projections of that one assessment.
   Board = plan/commit an operation. Radial = execute immediate machine actions.
   Radial UI owns only open/focus/pointer/animation state; no gameplay booleans.
   Per ADR-0035 the radial runs live, with an accessibility opt-in that pauses.
5. Add one authoritative fleet-recovery command + event, following the
   command -> validation -> cloned next state -> accepted/rejected -> event
   shape already in unbound-passage.ts.
6. Add the full vertical browser acceptance case on port 4173.
7. Add npm run verify:head covering format, typecheck, unit, migration, replay,
   reachability budget, asset gates, production build, core browser acceptance,
   accessibility. Do not weaken the reachability budget to pass.
8. Reconcile README and docs/architecture/GAMEPLAY_SYSTEMS_ARCHITECTURE.md with
   the real runtime: current save schema, Rapier as an isolated evidence lab
   only, and no universal XP (ADR-0018 rejects it).

ACCEPTANCE
- No disabled rig -> no fleet-recovery proposition.
- Disabled rig, no tow-capable support -> blocked WITH a reason.
- Support too far -> conditional, with destination guidance.
- Nearby but insufficient wet-ground traction -> blocked, recommends lug tyres.
- Valid recovery -> event emitted once, state persists, replay reproduces it.
- Any read model called repeatedly -> zero canonical-state changes.

DONE means: npm run typecheck clean, full vitest green, reachability budget
passes, and a fresh browser run on 4173 completes the whole chain with zero
console errors. Report honestly what is not done.
```

## Completion promise

```text
The fleet-recovery vertical chain is implemented, all acceptance cases pass, and a fresh browser run on 4173 completes it with zero console errors.
```

# Water Before Night Implementation Plan

- Date: 2026-07-31
- Status: implementation in progress
- Parent: `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §3 (side quest)
- Related: `docs/design/DIALOGUE_SURFACE_IMPLEMENTATION_PLAN_2026-07-31.md`

## What this document is

A concrete plan to close the Water Before Night tranche. The runtime wiring
(`chooseFarmWaterworks`, field-condition application, settlement outcome) already
exists; this window completes the evidence surface: unit tests, browser
acceptance, and documentation.

## Scope boundary

**In scope:**

1. Unit tests for `chooseFarmWaterworks` covering both branches and guard clauses.
2. Browser acceptance probe that proves both branches are reachable and
   mechanically distinct.
3. Evidence report and worklog entry.

**Out of scope:**

- New art assets, night-variant visuals, or first-night hazard sequences.
- Settlement/community/ecology modules beyond the existing settlement outcome.
- North field, customization choice, ridge finale.

## Current state

- `chooseFarmWaterworks(state, world, choice)` in `src/game/state.ts` exists and
  validates: firstStart, workshop reach, unresolved choice, Long Furrow presence.
- On `repair-pump`: applies firmer field conditions around Long Furrow and sets
  the drain pump `commandedOn`.
- On `redirect-channel`: applies muddy field conditions on the Home→Long Furrow
  approach and sets the drain pump `commandedOn = false`.
- Settlement conditions are updated via `applyFarmWaterworksSettlementOutcome`.
- The workshop panel already shows the Water Before Night decision after first
  start and hides it once a choice is made.

## Gaps to close

1. No direct unit tests for the `chooseFarmWaterworks` state transition.
2. No browser acceptance proving both branches can be taken and produce distinct
   terrain grip at the affected sites.
3. No dedicated evidence document marking this tranche player-reachable.

## Test plan

### Unit tests

Add to `src/game/state.test.ts`:

- Reject before first start.
- Reject outside workshop reach.
- Reject second choice.
- `repair-pump`: `farmWaterworks.choice === "repair-pump"`, drain pump
  `commandedOn === true`, Long Furrow settlement condition is `"dry"`.
- `redirect-channel`: `farmWaterworks.choice === "redirect-channel"`, drain pump
  `commandedOn === false`, Long Furrow settlement condition is `"muddy"`.

### Browser acceptance

Create `tools/water-before-night-browser-acceptance.cjs`:

- Bootstrap, accept arrival bargain, restore tractor.
- Wait for Water Before Night section in workshop.
- Branch A — Repair pump:
  - Click repair.
  - Place rig at Long Furrow, record grip/surface.
  - Assert grip is high / surface is firm relative to untouched baseline.
- Branch B — Redirect channel:
  - Reset field, repeat bootstrap + restoration.
  - Click redirect.
  - Place rig on soft ground inside the redirect's 24 m radius (probed at
    `(21, -11)`; the literal midpoint `(9, -17)` is hardpan track and resists
    the moisture penalty), record grip/surface.
  - Assert grip is low / surface is muddy relative to repair branch.
- No application console errors.

## Commit route

```bash
git add -A
git commit -m "feat: Water Before Night tests and acceptance evidence"
# hook-gate runs automatically (motto_v4, typecheck, tests)
git push
```

## Anything else?

Yes. Both branches write bounded field memory, not quest flags. The acceptance
probe must read the same terrain layer the player sees (grip/surface) rather
than inspecting internal `fieldConditions` directly.

# Open-World Material Knowledge Flow Evidence

**Date:** 2026-07-29

## Question

Can physical help at an inhabited place change what the world knows without
silently discovering a destination, unlocking a route, or assigning a quest?

## Implemented flow

The `sunken-flats:sounded-crossing` material effect now owns an optional world
lead. When a player records that survey result at Sunken Flats, the settlement
can share `The Sounder's Line` toward Marsh Depot. The rumor graph admits that
lead only once the player has encountered Sunken Flats itself.

```text
survey-capable machine + sounding-bank affordance + route pressure
  -> sounded-crossing material effect
  -> Sunken Flats local knowledge
  -> optional Marsh Depot rumor
  -> player still chooses whether and how to travel
```

The effect does not add a discovery record, alter route permissions, create a
mission, or change active-side-mission state.

## Automated evidence

- `npm run typecheck` passed, including the deterministic-kernel probe.
- Focused rumor, state, settlement, persistence, and renderer tests passed:
  `5` files and `94` tests.
- Full suite passed: `84` files and `512` tests.
- The rumor test proves the destination remains `undiscovered` before the
  player has encountered Sunken Flats. After that source discovery, the same
  material effect makes Marsh Depot `rumored`, adds an active community-lead
  edge, and still does not add Marsh Depot to discoveries.

## Canonical runtime evidence, Tier 4

Surface: `http://127.0.0.1:4173`.

1. A first attempt to select the marsh skimmer from too far away correctly
   retained the currently active buggy. This confirmed rig switching remains a
   physical proximity rule, not a debug teleport authority.
2. The buggy was moved within switching range, then the marsh skimmer was
   selected normally and taken to Sunken Flats' sounding-bank affordance.
3. The normal primary action recorded `sound-crossing` with material effect
   `sunken-flats:sounded-crossing`.
4. Sunken Flats favor became `1`; crossing pressure reduced from the local
   survey result, while the hover response remained available.
5. The public world snapshot exposed one community lead:
   `material-effect:sunken-flats:sounded-crossing`, from Sunken Flats to Marsh
   Depot, labelled `Sounded channel notes`.
6. Sunken Flats was discovered because the player physically arrived there.
   Marsh Depot was not added to discoveries.
7. `mission` remained `null`; `activeSideMissions` remained empty; console
   output contained only Vite reconnect diagnostics.

## Remaining direction

This is the first non-settlement consumer of the material-effect registry:
the rumor graph now reads material facts directly. The next real use should be
route traffic or logistics reading the same facts, not another parallel
settlement-only map. A route marker, drainage cut, or staged load should become
visible information for people and vehicles where there is a concrete gameplay
reason to consume it.

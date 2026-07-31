# ADR-0046: Persistent Road Incidents Share World Authority

- Status: Proposed - operator sign-off required; source integration in progress
- Date: 2026-07-29
- Scope: Quarry Runout, the first emergent road incident

## Context

The repository contained landslide stability and boulder-displacement math, but
neither affected the playable world. Keeping them as isolated functions would
produce a test rig, not an open-world consequence.

## Decision

Quarry Runout is an optional storm-saturation incident on the Quarry Shelf to
Toy Grove line. When shared weather moisture reaches the geotechnical threshold,
a persistent landslide boulder enters `GameWorld` memory.

- `GameWorld` owns incident state, snapshot, restore, revision, and obstacle
  projection.
- World-owned weather, field conditions, and incidents advance even while the
  selected rig is disabled; a broken machine cannot freeze the valley.
- Collision receives the boulder as an extra canonical obstacle candidate; the
  renderer reads the same obstacle through the existing rock presentation.
- A real rig impact calls the existing debris calculation. The boulder moves or
  clears only through that physical result, never through a mission action.
- The runout is a local obstruction, not a route unlock or a mandatory story
  gate. The surrounding terrain remains traversable.

## Consequences

This is the first world incident whose lifecycle crosses environment, physical
interaction, persistence, and presentation without adding a separate quest or
scene. It establishes a concrete path for later floods, fallen trees, and
stranded-hauler situations without prematurely building a general incident
framework.

## Verification evidence (2026-07-29)

- `npm run typecheck && npx vitest run` passed: TypeScript plus 79 test files
  and 496 tests.
- An isolated desktop browser profile reached the storm through both the normal
  fixed-step loop and the existing `advanceTime` command while the active tractor
  remained disabled. At 0.95 moisture, Quarry Runout activated at world minute
  1200.0069 and produced its boulder.
- The same profile reloaded with the active boulder and its timestamp intact.
- Placing the healthy Marsh Skimmer into the active boulder produced a normal
  `incident:quarry-runout` blocking contact in the canonical collision ledger;
  the renderer remained healthy and produced no browser error.
- A restored utility tractor then hit the active boulder at 7.093 m/s through
  the existing physical collision path. The persistent boulder moved from
  z=87.680 to z=87.743, proving that displacement is not a menu-side mutation.

## Remaining verification boundary

Eventual clearance, visual prop refresh, and the non-mandatory terrain bypass
still need focused real-play evidence. They remain open evidence requirements,
not claimed completed behavior.

## Hardening addendum (2026-07-29)

The solver-independent camera-obstruction query now reads the same optional
incident-obstacle projection as rig and renderer paths. This removes the known
camera-through-boulder mismatch at the contract boundary; runtime verification
is still pending.

## Social-memory addendum (2026-07-29)

Named settlement contacts now receive the Runout's status as read-only world
knowledge. Their comments acknowledge active and cleared road history without
writing incident state, accepting a mission, or claiming that the route is the
only valid way through the valley.

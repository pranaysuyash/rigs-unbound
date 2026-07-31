# Open-World Sunken Causeway Material Evidence

**Date:** 2026-07-29

**Status:** Material authority, amphibious fixed-step delivery, save migration,
and terrain derivation verified at Tier 2. Existing-save migration observed in
the canonical browser at Tier 3. Dedicated browser causeway delivery
playthrough remains open.

## Player-facing behavior

Home Silo now has separate physical stock bays rather than one hidden shipment
choice. A player who has personally discovered Sunken Flats can load the
`Sunken causeway kit` at its own bay and tow the existing crate to Sunken
Flats. Arrival records `sunken-flats:raised-causeway`.

The kit is not a tractor-only objective. Its loading feedback says that any tow
rig can move it and that a low-hover machine can cross the flooded flats. The
Marsh Skimmer has both real `tow` and `hover` capabilities; its existing hover
adapter applies towing drag, speed limits, and strain while it stays viable
over standing water. This is practical local knowledge, not a selected-rig
gate or required order of play.

That material fact derives the existing terrain-owned raised causeway to Marsh
Depot. It improves a durable, readable, lower-risk crossing. It does not
discover Marsh Depot, require the player to use the route, reserve it, block
surrounding terrain, create a mission, or grant access that did not otherwise
exist.

## Authority flow

```text
physical stock bay -> one existing crate -> tow and collision authority
        -> Sunken Flats arrival -> raised-causeway material fact
        -> terrain passage, resident/service projection, readable deck
```

The renderer only shows stock bays and the existing terrain-derived deck. It
does not create the passage. `GameWorld` reconciles terrain from active
material facts after delivery and on save settlement.

## Save contract

The voluntary shipment assignment uses `missionId: null` plus a content
manifest ID, requiring schema v26. The recovery path accepts and migrates v25
history. Legacy `sunken-flats-causeway` outcomes recover into the same
`raised-causeway` material contribution, so old campaign history preserves the
physical route without retaining a second route authority.

## Verification

**Tier 2:** `npm run typecheck` passed, including the deterministic-kernel
probe.

**Tier 2:** `npx vitest run` passed: 86 test files and 523 tests.

Focused coverage proves:

- loading is spatial, not a Home Silo center-screen menu;
- a known Sunken Flats exposes the distinct causeway-kit bay;
- delivery creates the causeway material fact without an active mission;
- the material fact alone derives `sunken-flats-causeway`;
- old causeway outcomes recover to the same fact;
- the prior Rustline shipment stays idempotent and compatible.

**Tier 2 addendum:** `npm run typecheck && npx vitest run` passed after the
amphibious correction. Focused fixed-step coverage now attaches the causeway
kit to `marsh-skimmer`, reaches the flooded Sunken destination through the
existing hover+tow adapter, records the material fact, and observes the terrain
route revision.

### Review passes

1. **Immediate correctness:** the earlier tractor proof failed because the
   ground rig correctly disabled in standing water before `updateCargo` could
   deliver the kit. The corrected test uses the viable skimmer route and
   passes.
2. **Architecture:** no cargo, collision, hover, or settlement authority was
   duplicated. The manifest carries only player-facing local knowledge;
   existing capability and physics contracts remain authoritative.
3. **Open-world compliance:** no vehicle identity check, mission acceptance,
   route lock, discovery grant, or forced sequence was added. The effect still
   derives a safer shared crossing rather than access permission.

**Tier 3:** The existing canonical browser state reloaded to schema `26` with
its pre-existing Sunken sounding traffic and lead intact. It reported no
mission, no side mission, and no cargo manifest. The freshly cleared console
contained only normal Vite connection diagnostics.

## Remaining evidence

Do not treat the schema recovery observation as a player-delivery playthrough.
The next proof must use an intentionally prepared disposable save to show the
stock-bay action, towing, arrival, terrain revision, deck visibility, reload,
and continued absence of an active mission.

## Anything else?

The browser proof should visibly demonstrate the skimmer's water traversal and
the crate's attachment behavior, not merely teleport the rig to the arrival
radius. It must preserve the current player save and use an isolated disposable
state.

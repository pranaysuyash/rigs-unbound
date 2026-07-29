# Machine Awakening: Floodgate 12 vertical slice (2026-07-29)

## Addendum (2026-07-29) - superseded implementation direction

This document records the original proposed singleton chain and is preserved as
history. It is no longer an active implementation direction: the operator
rejected the reduction of Rigs Unbound into a scripted, anchored test scenario.

The effective technical direction is the persistent open-world infrastructure
network recorded in
[ADR-0042](../decisions/ADR-0042-open-world-infrastructure-network.md).
Floodgate 12 is retained only as one authored infrastructure entity. It does
not own a bespoke save field, command vocabulary, route flag, or staged player
sequence. Its hydrology effect is resolved through the same network as the Long
Furrow drain pump and Quarry dewatering rig, then sampled by normal physics.

## Purpose

Floodgate 12 is the first proposed proof that Rigs Unbound can turn a machine
into persistent world change rather than treating it as scenery, a loot node,
or another contract card.

It serves the proposed machine-keeper product vision in
[ADR-0029](../decisions/ADR-0029-product-vision-machine-keeper-odyssey.md):
the player learns what a broken machine needs, works through its physical
constraints, and leaves the world more connected.

## Player loop

```text
find the flooded spillway
  -> discover the seized machine
  -> survey the actual fault
  -> use a tow-capable rig to stabilize the load
  -> spend salvage on the replacement coupling
  -> reopen the spillway route permanently
```

The stages deliberately require different player understanding:

- `discover`: spatial curiosity; any rig can identify the object.
- `diagnose`: observation; a survey-capable rig reads the pressure/intake fault.
- `stabilize`: machine handling; a tow-capable rig takes the load off the gate.
- `restore`: commitment; a bounded salvage spend makes the repair durable.

## Bounded runtime contract

`src/game/machine-awakening.ts` owns the machine-local command resolution. It
does not create a mission framework, mutate global terrain, or grant a renderer
authority over simulation state.

Its one success event is `floodgate-restored`, carrying the canonical route id
`sunken-flats-spillway`. The first runtime integration now consumes it through
the canonical state and primary-action path:

1. `GameState.floodgate12` persists the state under save schema v13;
2. the existing `Act` command discovers, diagnoses, stabilizes, and restores it
   at the Sunken Flats coordinates;
3. `publicState()` publishes the readable state and `routeOpen` consequence;
4. the shell prompt names the local gate operation when it is actionable.

Still required before the slice can claim full player-facing completion:

1. make the spillway traversal and presentation state respond to restoration;
2. give the player a visible local machine and water/route before-after state.

The command system is immutable at its boundary: it returns a next state,
salvage delta, semantic event, and readable rejection reason. That leaves the
kernel as the only future caller allowed to mutate authoritative game state.

## Current evidence

- Tier 2 target: focused unit proof covers complete progression, stage/order
  rejection, capability gates, spend protection, range protection, persistence,
  and public-state publication.
- Tier 0 remaining: renderer behaviour, collision/affordance integration, and
  player comprehension.

## Deliberate exclusions

- No generic machine registry yet. A second substantially different machine
  must prove the shared shape before that abstraction is admitted.
- No new mission class. Missions may reference restored machines later but do
  not own their truth.
- No fake water simulation. The first visual consequence should be an authored
  spillway/flood-state transition with clear collision and route semantics.

## Next integration decision

The next pass is presentation and route admission. The required acceptance proof
is a real player sequence on the canonical `4173` surface: drive to Floodgate
12, resolve all four actions with the correct rig state, save/reload, and
observe the reopened route remain visibly changed.

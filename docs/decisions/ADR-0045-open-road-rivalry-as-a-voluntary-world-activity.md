# ADR-0045: Open-Road Rivalry as a Voluntary World Activity

- Status: Proposed - operator sign-off required; source integration in progress
- Date: 2026-07-29
- Scope: The Grove Run activity only

## Context

Rigs Unbound needs play that emerges from its existing open terrain and machines,
not another restoration chain, test fixture, route lock, or contract-board clone.
The first road-rivalry activity must prove a third materially different activity
shape while leaving the player's travel and wider world untouched.

## Decision

The Grove Run is a voluntary, repeatable road run from Toy Grove through Quarry
Shelf to Home Silo. It shares the existing world sites, route network, terrain,
fixed-step simulation, rig profiles, and save state.

- The player enters it at the physical Toy Grove start line and may withdraw by
  returning there.
- Gate crossing is evaluated from authoritative post-physics rig position.
- Each rig receives its own best record, making machine choice meaningful without
  choosing a privileged vehicle class.
- It grants no salvage, progression, mission completion, discovery, or route
  unlock. The durable reward is a local performance history.
- It owns no terrain, collider, camera, renderer authority, or second world.

## Consequences

This adds a social/sporting activity to the open world without turning it into a
linear “complete this to proceed” sequence. The next presentation pass may make
the start and gates legible, but any marker must remain visual-only: simulation
position remains the sole crossing authority.

## Verification boundary

Source integration is not runtime proof. No test, typecheck, build, browser, or
playtest command was run in this pass. Before describing the feature as verified,
exercise starts, withdrawals, every rig's record, save/reload during an active
run, and route completion on the canonical local surface.

## Implementation addendum (2026-07-29)

The existing in-world prompt now names the next authored place while a run is
active. This is interface context, not a GPS line, marker system, or visual
collision source. Course-marker rendering remains intentionally separate so the
same simulation-owned site crossings continue to be the only result authority.

## Presentation addendum (2026-07-29)

Toy Grove, Quarry Shelf, and Home Silo now receive permanent Grove Run gate
posts. They are simple renderer-owned landmark meshes with no collider,
trigger, route mutation, or race result authority. Their locations derive from
the same authored activity course used by the simulation.

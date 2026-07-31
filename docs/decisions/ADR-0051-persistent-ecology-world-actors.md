# ADR-0051: Persistent Ecology as World Actors

- **Status:** Proposed - operator sign-off required; implementation evidence pending
- **Date:** 2026-07-29
- **Decision class:** World simulation, persistence, and open-world interaction

## Context

The first habitat implementation reduced life to a deterministic visual
projection around the active rig. That preserved a renderer budget, but it did
not create an independent world actor and it imposed artificial constraints:
read-only ecology, no durable populations, and no ability for living systems to
change material conditions.

Rigs Unbound needs a world that continues beyond the player. Ecology must be
able to occupy places, respond to weather and land use, affect the land in
return, and remain open to future interaction through machines, construction,
restoration, extraction, transport, hazards, and human communities. None of
those interactions may become a required mission sequence.

## Proposed decision

Use `GameWorld` spatial memory as the sole authority for durable regional
ecology. The first runtime stage introduces persistent actor groups, currently
a Long Furrow herd, Sunken Flats flock, and Quarry Run scavengers.

Each actor group owns:

- stable identity, location, territory, population, and vitality;
- migration driven by local water, vegetation, roots, soil health, disruption,
  and weather;
- persistence through the same `worldMemory` snapshot, storage, replay, and
  recovery path as terrain and field conditions;
- a material effect where appropriate. The initial grazer effect changes
  vegetation, root density, and soil health through canonical field-condition
  cells, so it participates in existing ground resilience rather than a new
  ecology-only map.

Renderer meshes mirror these groups. They do not own actor truth. The habitat
projection remains a local environmental assessment, not a replacement for
actors or a ceiling on future species and interaction design.

## Open-world invariants

- Ecology advances without player presence or acceptance of a task.
- Machine work changes local suitability through the shared field and
  infrastructure systems, not special ecology actions.
- Ecology can change physical land conditions without issuing a demand that the
  player repair, protect, remove, or follow it.
- A regional group is a scalable authority unit, not a prohibition on
  persistent individual creatures. An individual may become authoritative when
  gameplay requires identity, physical interaction, relationship, or history.
- Ecology actor behavior, future collision, harvesting, care, threat, and
  construction interactions remain open product decisions, not forbidden
  capabilities.

## Consequences and scope

This stage extends the spatial-memory save without changing `GameState` schema
or creating a second world clock. Legacy saves recover with seeded regional
actors when no ecology payload exists. The stage is intentionally small in
content, but it is not a test-rig flow: populations move and alter land while
the player is elsewhere.

Current implementation does not yet prove close physical encounters,
individual creature identity, ecology-driven settlements, or a player-facing
map and observation language. Those are next expansion fronts, not omitted
because the architecture prohibits them.

## Validation plan

1. Prove actor advancement, land impact, and world-memory recovery with focused
   simulation coverage.
2. Run the full TypeScript and Vitest gates after the shared runtime changes.
3. Observe a desktop playthrough across Long Furrow, Sunken Flats, and Quarry
   Run to confirm groups remain place-owned, evolve without player action, and
   do not create mission or route-gate state.
4. Revisit this ADR before admitting individual ecology collision, combat,
   care, harvesting, or settlement dependency systems.

## Operator decision needed

Whether the long-term ecology should prioritize grounded rural life,
speculative/alien biomes, or an intentional mixture remains a product decision.
This ADR does not claim that choice has been accepted.

## Addendum (2026-07-29): direct machine presence

The first stage now includes a bounded decaying disturbance field in the same
world-memory authority. Ordinary rig speed and slip can displace nearby groups
without a special ecology command, task, reward, or route rule. The field
persists across reload, decays through shared world time, and is considered by
regional suitability. Focused source and browser evidence demonstrate the
Long Furrow herd relocating after a real Marsh Skimmer pass. This is technical
implementation evidence only; it does not accept final animal interaction or
encounter design.

## Addendum: Situated human knowledge

Residents at Long Furrow, Sunken Flats, and Rustline now describe the state of
local ecology through the existing field-note surface. These remarks are
derived from persistent actor state, do not create missions, and do not
prescribe a response. They make the world socially legible while preserving the
player's freedom to disregard, investigate, or respond through any future
machine capability.

## Addendum: Decaying disturbance memory

A direct machine encounter now records a bounded `recentDisturbance` value on
the affected persistent group. It is saved, decays through the shared ecology
cadence, and is available to local witnesses. This is an observed world fact,
not player blame, a morality score, or a required repair loop.

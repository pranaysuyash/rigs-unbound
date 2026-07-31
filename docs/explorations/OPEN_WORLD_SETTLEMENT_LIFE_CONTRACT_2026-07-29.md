# Open-World Settlement Life Contract

**Status:** Proposed direction. This is not an assertion that the runtime already fulfils it.

**Date:** 2026-07-29

## Purpose

Rigs Unbound is not a sequence of machine repairs that unlock the next map node. It is an open world of places and people whose circumstances continue whether or not the player responds.

A settlement is not a quest giver, a condition flag, a reward terminal, or a map marker. It is a community with people, services, material conditions, local knowledge, and a changing relationship with the surrounding world.

## Non-negotiable rules

1. No settlement problem imposes a required discovery, diagnosis, repair, unlock order.
2. Multiple pressures can coexist within one settlement and across the world.
3. The player can ignore pressure, respond late, combine responses, or use an unexpected compatible machine.
4. Residents communicate situated knowledge, not omniscient task instructions.
5. A response is determined by capabilities and local affordances, not an authored rig identity.
6. Consequences change people, services, relationships, routes, and physical conditions, never only a completion badge.
7. The simulation remains authoritative and replayable, but authoring defines possibilities and constraints, not a fixed gameplay flow.
8. Rendering makes people and work visible, but cannot decide whether a community is healthy, grateful, available, or in need.

## What the world remembers

| Layer | Examples | Owner |
| --- | --- | --- |
| Material facts | Flooded ground, moved boulder, drained field, fuel, damaged route | World, terrain, infrastructure, inventory |
| Community capacity | Water service, field labor, haul capacity, shelter, repair capability | Settlement-life domain |
| Relationships and memory | Who helped, who was inconvenienced, local confidence, witnessed history | Settlement-life domain |
| Present behavior | Working, waiting, carrying, sheltering, sharing knowledge, travelling | Derived resident simulation and presentation |

Material facts can create or resolve pressure. Community capacity determines how well a place absorbs it. Relationships affect what residents offer, reveal, or trust the player to do. Present behavior makes the other layers legible in the world.

## Pressure is not a quest

A pressure is a changing local condition with a source, an affected community function, a severity, a time response, and multiple compatible affordances. It never owns a required player sequence.

```text
weather / terrain / traffic / history
                |
                v
       settlement pressures
                |
     +----------+----------+
     |                     |
resident behavior      available responses
     |                     |
     +----------+----------+
                |
                v
       changed world and relationships
```

| Place | Coexisting pressure | Possible response families | If ignored |
| --- | --- | --- | --- |
| Long Furrow | Saturated ground, low labor capacity, delayed goods | Drain, plough, haul, scout, wait for drier weather | Reduced field work, residents shelter or shift to repair work |
| Quarry Shelf | Runout, disrupted salvage movement, exposed material | Tow, haul, route around, survey, wait for another crew | Slower movement, worker relocation, information spreads |
| Sunken Flats | Rising water, unreliable crossing, constrained supplies | Float, tow, carry, rebuild, take a longer route | Services narrow, residents consolidate, nearby routes gain traffic |

These are not missions. A player can solve part of a pressure, ease it temporarily, worsen it, help another place first, or leave it to the world.

## People are not interaction terminals

Every resident needs an authored role and a current purpose. Initial roles are people through whom the world works:

- Grower: reads field condition, crop readiness, drainage, and weather.
- Hauler: knows loads, routes, blocked crossings, and demand between places.
- Mechanic: observes machine condition, salvage use, power, and practical fixes.
- Keeper: manages shelter, supplies, visitors, and local trust.
- Scout: notices terrain change, animals, routes, and approaching weather.

A resident has a home or work anchor, a small activity set, local knowledge, and a relationship posture. Activity visibly changes under pressure. A hauler waits at a blocked road, a grower moves from field edge to shelter during saturation, and a keeper opens or closes a service point based on capacity.

Dialogue is a view of this state. It is incomplete, local, and optional. The player can overhear a problem, see its result, investigate it, or learn about it elsewhere. There is no universal `accept` verb.

## Machines create possibilities

```text
machine capabilities + local affordance + present conditions = possible action
```

- `tow` can shift a blockage, drag a stranded load, or support a temporary line.
- `float` can carry people or supplies through a flooded area and inspect routes unavailable to ground rigs.
- `plough` can improve a field edge, prepare a work surface, or worsen it when mistimed in saturated ground.
- `carry` and `haul` can rebalance supplies between communities.
- `scan` and `survey` can change what people know without immediately changing the land.

Identical capabilities can have different effects at different places and times.

## Consequences that matter

Helping can change resident visibility and work locations, active workshops or shelters, route risk without forbidding travel, information residents share, local services, inter-settlement confidence, and field, water, route, salvage, or supply conditions.

Ignoring pressure is also a world action. It can change schedules, services, confidence, traffic, and later opportunities. It must not silently fail the player, delete content, or create an arbitrary hard lock.

## Determinism used correctly

Determinism applies to causal authority only:

- The same save history and inputs produce the same world state.
- Every event has a traceable source.
- A renderer cannot secretly mutate a relationship or service.
- Replay and debugging can explain why a settlement changed.

It must not define a player path. Variation comes from overlapping conditions, timing, spatial routes, capabilities, player choice, and durable history. Procedural selection may be seeded and state-dependent, but it must remain explainable by the world.

## Implementation boundary

The future settlement-life domain consumes public facts from world, infrastructure, route, terrain, weather, and inventory domains. It may own community capacity and relationship memory. It must not duplicate terrain or weather simulation, directly move rigs or alter physics, turn renderer events into authoritative progress, create a separate contract board, hard-code a named rig as the only response, or serialize visual meshes or animation state.

Outputs serve resident presentation, dialogue and overheard information, service availability, machine-affordance resolution, and maps or rumours after the player has gained enough local knowledge.

## First coherent implementation stage

The first stage is not one settlement story. It is a shared data-backed model with at least three authored places and overlapping pressure types. One place may receive richer visuals first, but the model must prove all of the following:

1. Conditions coexist.
2. Residents derive different behavior from those conditions.
3. More than one machine capability can create a legitimate response.
4. Partial and delayed help have distinct consequences.
5. Services and physical state change without an unlock gate.
6. The player can leave, return, and find a coherent changed place.

## Rejection criteria

Reject any implementation that produces a discover -> diagnose -> repair -> unlock chain, a one-off settlement object, a pressure fixable by only one rig, an invisible score with no behavioral impact, dialogue used only to assign a task, a renderer-only crowd, or a generic framework that has not proven itself through inhabited places.

## Current evidence and next work

Current code already has world-owned weather, field conditions, road incidents, infrastructure effects, settlement contact and anchor presentation, and capability contracts. This document does not claim that they already form settlement life.

The next implementation maps these concrete surfaces into one canonical settlement-life domain, then projects it to residents, services, affordances, and visible consequences. It begins with existing authored places, not a new test settlement.

## Addendum: initial refactor stage

`src/game/settlement-life.ts` is the first canonical read model. It derives concurrent pressures, services, resident activities, and compatible machine responses across every authored settlement from saved community history, weather, infrastructure-derived conditions, and the live Quarry Runout. The renderer now keeps all authored residents present and changes their location, orientation, and working color from this model.

The settlement-specific mission generator has been removed. Existing mission records and campaign-linked legacy outcomes remain recoverable while they are migrated away from settlement authority; this is intentionally not presented as the final open-world model.

## Addendum: contribution history, not completion states

The next runtime stage stores small, bounded community contributions beside the
legacy outcome history. A contribution has a response identity, machine
capability, and world timestamp. It does not set a settlement to complete,
unlock a route, or accept a mission.

The authored response layer now demonstrates distinct partial effects: a real
Long Furrow plough cut can improve field capacity while a tow-capable rig can
move soaked stores, leaving the drainage pressure and other opportunities
present. Equivalent capability-specific responses exist for Rustline, Sunken
Flats, Marsh Depot, and Launch Ridge. The simulation records the causal fact;
the player remains free to act, combine efforts, arrive late, or leave.

This is an implementation stage, not a claim that all legacy
`settlementOutcomeId` campaign contracts are migrated. That remaining work is
tracked in ADR-0049 as an explicit supersession task.

## Addendum: residents communicate situated consequences

Resident behavior and contact speech now read the same service-specific relief
as the settlement projection. A field contribution returns growers to field
work without falsely restoring the stores service; a haul contribution can keep
haulers moving while growers still shelter. Contacts describe what has changed
and what remains under pressure. They do not issue a task, consume dialogue, or
turn a response into an acceptance funnel.

## Addendum: physical consequence projection

Contributed response definitions now carry a renderer-only consequence shape.
The grounded settlement group reveals it only when the simulation-owned
contribution record exists: stores on high ground, a shifted Rustline load,
route markers, a ferry cache, a secured ford line, or ridge signal equipment.
The Long Furrow drainage response remains actual terrain work rather than a
replacement prop. Presentation cannot add, remove, or resolve a contribution.

## Addendum: settlement rhythm is not a player deadline

Ordinary settlement work now follows the existing world night boundary. At
night, otherwise healthy services are off shift and residents rest or keep a
watch. Material pressure still overrides the ordinary rhythm, and no response,
travel route, contact, or machine action becomes unavailable because a crew is
off shift. This gives return visits a different social read without turning the
world clock into an authored timer or a failure system.

## Addendum: spatial affordances replace site-wide response menus

The first contribution proof could resolve a compatible authored response
anywhere inside a settlement service radius. That was mechanically convenient,
but it weakened the open-world premise by turning a whole place into an
invisible context menu.

Contribution evaluation now requires a machine to reach the material
affordance it can affect: a saturated drainage edge, raised stores ground,
blocked yard, bypass line, landing bank, ford anchor, signal mast, or repeater
sled. Capability, physical location, and live pressure jointly determine
whether an action is meaningful. Authoring defines local material facts and
plausible effects, not a mandatory answer or player sequence.

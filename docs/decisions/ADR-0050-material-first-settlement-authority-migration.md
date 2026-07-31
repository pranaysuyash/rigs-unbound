# ADR-0050: Material-First Settlement Authority Migration

**Status:** Proposed, operator sign-off required.

**Date:** 2026-07-29

## Context

The current runtime has two incompatible ways for settlements to change.

The newer settlement-life domain records material effects and derives pressure,
service availability, resident activity, local knowledge, and visible work
from them. The older `settlementOutcomeId` path lets a completed mission write
settlement condition and favor directly, then enables community passages and
repair capacity through mission lifecycle completion.

That older path makes a mission the authority for whether a place works. It
contradicts the open-world contract: places must react to material history,
local capacity, weather, infrastructure, and voluntary machine work, rather
than a player accepting and completing a prescribed objective.

## Proposed decision

Make durable material facts the only authority for settlement capacity and
world consequences. Missions may remain optional authored stories, races, or
temporary work offers, but they must not directly set settlement condition,
favor, route state, repair availability, discovery, or physical world access.

The first migration is Rustline Salvage:

1. A player can physically deliver compatible stock to the real service yard,
   without accepting `need-rustline-parts-run`.
2. Delivery records an idempotent `rustline-salvage:service-stocked` material
   fact, with provenance for the moved cargo and world time.
3. Rustline repair capacity and yard activity derive from that fact plus live
   local pressure, rather than from `rustline-parts-run` completion.
4. The existing delivery mission becomes optional story framing only during a
   compatibility period. It cannot be the sole source of the material fact.
5. Existing saves that contain `rustline-parts-run` recover into the equivalent
   material fact before normal projection, preserving player history.

## Why Rustline first

Rustline already has all required foundations: an authored yard, a repair
service, cargo and towing physics, resident and service projections, material
effects, and an existing legacy delivery outcome. Migrating it proves that a
machine action changes a working place without introducing a new abstraction
or another quest framework.

## Explicit boundaries

- A stocked yard does not make Rustline a mandatory destination.
- Repair availability is a useful local service, not a route permission.
- Cargo delivery remains possible independently of mission acceptance.
- The world cannot silently consume arbitrary player cargo.
- Rendering only reflects the authoritative service state.
- The migration must not delete or invalidate historical mission saves.

## Staged implementation

1. Add the material effect, provenance, recovery mapping, and effect-derived
   service projection for Rustline.
2. Add a spatial, voluntary cargo handoff at the yard, using the existing
   command and collision authority rather than a new interaction pipeline.
3. Route optional story completion through the same material-fact recorder
   during compatibility, never a direct condition mutation.
4. Migrate Sunken Flats passage and knowledge from legacy outcomes to explicit
   material/infrastructure facts. A passage improves safety and readability;
   it must not be required for physical traversal.
5. Deprecate `settlementOutcomeId` from new propositions and eventually remove
   it after save migration and caller inventory prove no remaining authority.

## Affected surfaces

- `src/game/settlement-needs.ts`
- `src/game/settlement-material-effects.ts`
- `src/game/settlement-life.ts`
- `src/game/state.ts`
- `src/game/mission-lifecycle.ts`
- `src/game/mission-propositions.ts`
- `src/game/contracts.ts`
- `src/game/world.ts`

## Validation requirements

- A physical Rustline handoff succeeds without an active mission.
- The same handoff remains idempotent and cannot duplicate service capacity.
- Rustline repair service derives correctly after reload.
- A legacy `rustline-parts-run` save preserves equivalent capacity.
- Completing the optional legacy mission and performing the handoff converge on
  the same material fact, not two independent authorities.
- Browser evidence proves no new active mission, route lock, forced discovery,
  or player-input restriction.

## Revisit when

Revisit after Rustline is migrated with save recovery evidence, or if the cargo
model needs a general inventory/provenance contract before a safe local handoff
can be represented.

## Addendum (2026-07-29): Rustline first stage implemented

The Rustline stage is now implemented and verified at Tier 2. The existing
physical crate can be voluntarily prepared at Home Silo as `rustline-service-
stock` once Rustline is personally known. Its arrival records the same
idempotent material contribution used by legacy `rustline-parts-run` recovery.
Rustline condition and repair availability now derive from that contribution,
not from a direct mission-completion condition mutation.

`npm run typecheck`, the deterministic-kernel probe, and the full Vitest suite
passed with 86 test files and 520 tests. Dedicated coverage proves the primary
command path, no active mission requirement, idempotence, and legacy recovery.
This is implementation evidence for the first reversible migration stage. It
does not constitute operator acceptance of the broader ADR or migration of the
remaining settlement outcomes.

## Addendum (2026-07-29): Sunken Flats second stage implemented

Sunken Flats now provides the second real shipment use case. A distinct,
visible Home Silo stock bay can load a causeway kit only when Sunken Flats is
personally known. Delivery records `sunken-flats:raised-causeway`; the terrain
passage, settlement connected condition, and readable deck all derive from
that fact. The causeway remains a lower-risk physical route, not permission to
traverse the surrounding marsh.

The cargo-assignment contract is now schema v26 because voluntary shipments
persist a nullable mission owner and optional manifest ID. Current v25 browser
history migrated cleanly, retaining prior material traffic and local knowledge
with no mission or cargo assignment created. The complete physical shipment
playthrough remains a separate evidence requirement.

## Addendum (2026-07-29): Sunken carrier reality correction

The original fixed-step causeway proof placed the Utility Tractor directly in
the flooded Sunken Flats destination. The ground adapter correctly disabled it
before cargo delivery. That exposed a real legacy-content contradiction: a
generic instruction to tow the kit into flooded terrain implied a route that
the named ground machine could not complete.

The correction is not a tractor exception, a scripted hand-off, or a new
carrier gate. `marsh-skimmer` already has the `hover` and `tow` capabilities,
and its hover adapter already applies towing strain and handling cost while
remaining viable above standing water. The physical delivery proof therefore
uses that real machine. The causeway kit remains voluntary cargo, and its load
feedback now states the practical local knowledge: any tow rig can move it,
while a low hover machine can cross the flooded flats.

This preserves machine-driven possibility rather than defining a single flow:
a player can ignore the kit, stage it, move it on dry ground with another tow
rig, or complete the flooded leg with the skimmer. No acceptance, route
permission, discovery change, or completion gate was introduced.

### Operator direction retained verbatim

> “why everything is being restrictive by making them deterministic , defined flows when the vision is open world?”

Consequence: deterministic simulation is limited to causal authority,
persistence, replay, and debuggability. It must not prescribe player order,
mandatory machinery, or settlement engagement.

**Evidence:** Tier 2 focused and full-suite proof passed on 2026-07-29:
`npm run typecheck && npx vitest run` reported 86 test files and 523 tests.
Dedicated browser delivery proof remains open and must use a disposable save;
the existing player browser state remains preserved.

## Anything else?

Yes. The present crate attachment is physically reusable but represents one
generic load shape. Future material cargo should declare mass, buoyancy,
handling, and attachment constraints as content data only after a second
contrasting physical load requires those distinctions. It must not reintroduce
vehicle identity checks or mission-owned settlement authority.

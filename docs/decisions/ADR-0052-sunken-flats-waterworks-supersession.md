# ADR-0052: Sunken Flats waterworks supersede the Floodgate singleton

- Status: Proposed, operator sign-off required
- Date: 2026-07-29
- Supersedes: the singleton identity and presentation portion of ADR-0042
- Related runtime: `src/game/infrastructure-network.ts`, `src/game/renderer.ts`, `src/game/state.ts`

## Context

The former `floodgate-12` entity was a narrow named installation left from an
older vertical-slice framing. It reduced Sunken Flats to one repairable object,
even though the runtime already supports autonomous spatial infrastructure,
settlements, weather, field conditions, ecology, and multiple machine types.
That identity conflicts with the open-world direction: places should have
ongoing conditions and multiple possible ways for players to relate to them,
not a single authored problem that defines the place.

## Decision

The canonical entity is `sunken-flats-waterworks`, named **Sunken Flats
Waterworks**. It remains a persistent regional machine system with local water
and soil effects, independent ageing, optional inspection/service affordances,
and presentation downstream of authoritative state.

The renderer depicts a distributed installation: deck, channel, catwalk, three
control stations, intake, and activity axle. It no longer presents one gate as
the total identity of Sunken Flats.

`floodgate-12` and legacy `GameState.floodgate12` are recovery inputs only.
Old saves map their condition, components, known state, commands, timestamps,
and servicing rig into `sunken-flats-waterworks`. New saves expose and retain
only the canonical regional entity.

## Consequences

- Sunken Flats can visibly live with water management without becoming a gated
  objective chain.
- Current optional tow-based service is one interaction path, not a claim that
  it is the sole future response. New capability paths require a concrete
  simulation adapter and an explicit decision.
- Existing saves remain recoverable without retaining two editable infrastructure
  truths.
- Historical Floodgate exploration and evidence stay preserved as historical
  records, with this ADR defining the current interpretation.

## Verification plan

- Targeted infrastructure tests prove service, spatial hydrology, and legacy
  entity migration.
- Typecheck proves every canonical entity reference moved.
- Browser evidence must show the Waterworks installation on canonical port 4173
  and prove that ordinary traversal remains possible without inspection or
  service.

## Revisit triggers

Revisit when the waterworks gains multiple independently operating stations,
power/fuel logistics, construction states, or a second supported service
capability. Do not restore a singleton quest identity as a shortcut.

## Implementation evidence (2026-07-29)

- `npm run typecheck` passed, including the deterministic-kernel probe.
- `npx vitest run src/game/infrastructure-network.test.ts src/game/infrastructure-network-state.test.ts` passed: 6 tests.
- The targeted migration test recovers a prior `entities["floodgate-12"]`
  record as `entities["sunken-flats-waterworks"]`, preserving known,
  commanded, component, timestamp, and servicing-rig facts.
- `npm run test:causeway-browser` passed on canonical port 4173. It traversed
  flooded terrain for 185.35m, completed an optional material delivery, exposed
  the dormant Waterworks as the nearby infrastructure entity, and retained the
  canonical identity through reload with no mission, no side mission, and no
  browser errors.
- The generated survey capture shows the regional waterworks assembly and the
  optional `Inspect Sunken Flats Waterworks` affordance. It is visual evidence
  of current placement, not final art approval.

The browser harness logs `Chrome teardown exceeded 5 seconds` after PASS. This
is a teardown advisory rather than a failed acceptance assertion.

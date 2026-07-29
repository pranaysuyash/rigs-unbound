# ADR-0042: Persistent open-world infrastructure network

- Status: **Proposed - operator sign-off required; implementation in progress**
- Date: 2026-07-29
- Owner: project owner (Pranay)
- Related:
  - [ADR-0007](ADR-0007-terrain-as-simulation-substrate.md)
  - [ADR-0029](ADR-0029-product-vision-machine-keeper-odyssey.md)
  - [ADR-0040](ADR-0040-open-vehicle-universe-and-game-design-spine.md)

## Context

The initial Floodgate 12 implementation represented a machine as a bespoke
four-stage command chain, one save field, and one route flag. That shape could
only grow by adding another special case. It contradicted the open vehicle
universe and machine-keeper direction by turning a world machine into a
scripted test encounter.

The product requires the inverse ownership model: machines exist in the world,
continue to operate or degrade without a player nearby, and alter the physical
conditions that every rig experiences. Player activity is maintenance within
that world, not permission for the world to exist.

## Proposed decision

Introduce one persistent infrastructure network owned by `GameState` and
advanced by the fixed-step kernel. Each authored machine has stable identity,
site location, components, condition, operating command, service contract, and
spatial effects. Definitions stay typed code because they encode durable world
rules; individual instance state is save data.

The first authored network contains three real world machines:

1. **Floodgate 12**, Sunken Flats: water control around the spillway.
2. **Long Furrow Drain Pump**, Long Furrow: field drainage and soil moisture.
3. **Quarry Dewatering Rig**, Quarry Shelf: local water control around the
   extraction site.

The same component-and-effect contracts permit later machines with different
mechanics without inheritance trees or rig-specific checks. This is not a
universal ECS and not configuration for its own sake. It is a concrete world
authority with three current instances, specialised effects, validated recovery,
and a direct physics consumer.

## Ownership and data flow

```text
world clock + weather
        |
        v
fixed-step infrastructure network
        |
        +--> persistent machine condition and operation
        |
        +--> local waterline / soil moisture / drainage / terrain-workability effects
                         |
                         v
                 normal rig physics and terrain transformation
                         |
                         v
             bounded persistent field-condition memory

rig input --> generic inspect/service intent --> validated network transition
```

The renderer and UI read public state. They do not determine machine condition,
waterline, or route truth. Activities may derive opportunities from an entity,
but may not own or overwrite its state.

Machine service is a `world` affordance resolved through the shared
capability-resolution contract. The infrastructure domain owns its service
state, cost, and consequence; the affordance resolver owns deterministic
capability admission and mismatch evidence. This prevents every future machine
from adding its own capability-check branch.

## Migration

Save schema v14 replaces `GameState.floodgate12` with
`GameState.infrastructure`. Recovery maps a valid v13 Floodgate record into the
Floodgate entity once, then retains only the network as authoritative state.
Older schemas recover into the network's authored defaults.

## Consequences

Positive:

- Water and soil effects are spatial simulation inputs, not a UI route flag.
- Machines persist and age while unattended, creating a living world.
- Quarry dewatering changes the real salvage and commodity yield at a collection
  location, so material recovery is affected by the world condition rather than
  a separate reward table.
- Long Furrow drainage changes the amount of canonical persistent terrain
  deformation produced by the same plough pass. A failed pump slows useful land
  work; it never hides the field or converts terrain access into a route unlock.
- Disturbed ground retains bounded moisture, shear-strength, vegetation, root,
  and soil-health state in `GameWorld` spatial memory. Weather advances that
  state under the fixed-step clock; a drain machine changes its local drainage
  rate. This is a real field consequence, not a mission variable or renderer
  cache.
- The field atlas reads those same remembered cells as muddy, damaged, or
  recovering ground. It is a spatial record of player impact and machine care,
  not a second terrain or soil implementation.
- The 3D terrain mesh uses the same field-memory revision to tint only the
  nearby visible terrain patch. Rendering cannot mutate field condition and it
  does not run a second moisture or ecology calculation.
- Root density from the same remembered condition reduces later cut deformation.
  Wheelspin and deliberate work strip roots; recovery restores resistance over
  world time. This closes the loop from machine upkeep and weather to traction,
  soil memory, and future earthwork.
- The field atlas renders discovered machine influence and condition from the
  same persistent state, so exploration records which places are changing.
- Existing authored landmark lamps transition from discovery amber to live
  machine state (cyan flow, red failure) without adding synthetic world markers.
- Floodgate 12, Long Furrow Drain Pump, and Quarry Dewatering Rig each have a
  grounded low-poly renderer assembly with one semantic moving part and one
  status beacon. The assemblies read canonical entity state and remain
  presentation-only until explicit infrastructure collision roles are authored.
- New infrastructure requires content definitions and specialised effects, not
  a new mission state machine.
- A nearby but incompatible rig receives the same deterministic
  `missing-capability` affordance evidence as other world offers.
- Existing capability-based rigs service machines through generic validation.

Open work:

- The water renderer now consumes network-owned local water effects as shader
  masks/tint (Tier 1 source evidence). Canonical 4173 visual proof is still
  required before any player-facing before/after claim.
- Infrastructure-generated opportunities need a design pass before entering the
  mission proposition system; machine operation must remain useful without a
  mission proposition.
- Canonical-port player observation remains open. Both the field atlas and the
  terrain mesh project canonical state; any future material work must keep that
  one-way presentation boundary.
- Machine-assembly visual proof at canonical port 4173 remains required before
  claiming asset readability or animation quality.
- Power, production, ecology, and settlement consequences remain future
  specialised effect families, added only with a real second use case.

## Revisit triggers

Revisit this proposal when a machine needs networked power, inventory flow,
structural joints, or remote automation. The response should add an explicit
effect adapter or subsystem owner, never a second per-machine quest pipeline.

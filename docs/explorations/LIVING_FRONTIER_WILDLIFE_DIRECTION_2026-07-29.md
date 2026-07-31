# Living Frontier Wildlife Direction

**Status:** Proposed exploration, not accepted and not implemented.

**Date:** 2026-07-29

## The opportunity

Rigs Unbound should feel like a place that continues to exist when the player
is not completing an objective. The strongest next addition is not another
repair sequence, contract, rig class, or isolated simulation. It is a living
frontier layer: wildlife that occupies habitat, reacts to environmental change,
and makes the consequence of weather, terrain, and machine work legible while
the player travels.

This is deliberately not a collectible system, a hunting loop, or a checklist
of animals. The player should encounter life because the land is changing, not
because an activity directed them there.

## Evidence from the current world

Static inspection confirms that the world already has useful environmental
authority to read rather than duplicate:

- Soil vegetation, roots, and health already influence erosion resistance.
- Weather and moisture advance continuously through the world clock.
- The infrastructure network is persistent, weather-worn, and spatial. Its
  machines already alter local water level, moisture, drainage, workability,
  and salvage conditions.
- Road incidents persist and can physically alter a route.

The wildlife layer must consume those public environmental outcomes. It must
not own infrastructure state, mutate soil directly, or manufacture a second
weather model.

## Player experience

The player should be able to infer the state of the land before opening a
panel:

- A wet meadow attracts wading birds and has fewer ground grazers.
- A storm pushes animals toward higher ground and sheltered tree lines.
- A healthy, quiet field carries grazing life; repeated wheelspin and loud
  machinery make it temporarily empty.
- A quarry runout draws scavengers after the disturbance, while a working
  dewatering rig makes the shelf visibly more usable again.

The result is orientation and atmosphere with real systemic meaning. A player
does not receive a task called "watch a heron." They notice that the floodplain
is wet, decide whether that route is viable, and see the world agree with the
simulation.

## Design contract

### Habitat, not hand-authored animal state

The durable unit is a habitat patch, not an inventory of individually saved
animals. A patch derives a habitat score from:

- surface and elevation class
- local water depth and soil moisture
- vegetation coverage and root density
- weather phase and time of day
- recent vehicle disturbance
- nearby road incident state

Species occupancy is a deterministic projection of that score and world time.
The renderer may spawn individual birds or animals from the projection, but
those visual instances are never authoritative world entities. This keeps save
size, streaming, replay, and cleanup costs bounded.

### Three first habitats

| Habitat | Visible life | What it tells the player |
| --- | --- | --- |
| Floodplain and drainage ditches | Wading birds, insects | Water level, rain, and pump effectiveness |
| Long Furrow margins | Small grazers and field birds | Vegetation recovery, soil condition, vehicle disturbance |
| Quarry shelf and runout edges | Corvids and scavengers | Recent disruption, exposed material, route recovery |

The vertical slice should use these locations because they exercise genuinely
different environmental states already present in the world. It should not add
a fourth "wildlife site" that exists only for the feature.

### Disturbance is reversible

Rigs change a habitat through noise, proximity, speed, and wheelspin. The
effect is temporary and spatial. Wildlife flees or avoids the patch, then
returns as the land settles. This gives heavy machines presence without
punishing ordinary travel or turning the game into a stealth system.

The first implementation must not make wildlife collision bodies, vehicle
damage, fail states, or combat targets. Those choices would force animal
behavior to own physics and progression before there is a good player reason
to do so.

## Architecture boundaries

| Domain | Responsibility | Must not do |
| --- | --- | --- |
| World and environment | Publish terrain, weather, water, vegetation, and incident outcomes | Know species-specific behavior |
| Habitat simulation | Derive occupancy and disturbance from public environmental data | Mutate terrain, machine, or weather state |
| Renderer and audio | Present deterministic local wildlife and flight/flee behavior | Authoritative habitat mutation |
| Player input | Create normal vehicle disturbance through movement | Spawn/despawn wildlife directly |
| Save system | Persist only durable habitat pressure if later needed | Serialize visual flocks or ambient instances |

The first slice should be derived-only wherever possible. A durable disturbance
field is justified only if a real playtest demonstrates that recovery must
continue accurately across a reload. Do not add persistence pre-emptively.

## First vertical slice

1. Define a pure habitat projection API from existing world observations.
2. Project three local occupancy states: active, wary, and absent.
3. Feed normal rig movement into a bounded local disturbance signal.
4. Render low-cost, non-colliding ambient silhouettes at the three existing
   habitats.
5. Give each habitat a concise world-facing signal through animation and sound,
   not a mission prompt or reward.
6. Verify that the same world time and environmental input produce the same
   occupancy result.

Success is a player driving from a dry Long Furrow to a storm-soaked floodplain
and understanding the changing landscape before any HUD explanation. Failure
is a decorative animal spawner that ignores the world, a mission disguised as
ecology, or a costly AI system with no travel consequence.

## Deliberate non-goals

- No hunting, animal inventory, animal combat, or pet system.
- No wildlife-specific currencies, achievements, or contract board entries.
- No independent ecology clock.
- No new hard gate on a road, field, activity, or rig.
- No coupling to mobile-only behavior.
- No ownership change to the existing infrastructure network.

## Questions requiring operator direction

1. Should wildlife remain strictly observational in the first release, or may
   it later support non-extractive activities such as photography, surveying,
   and ecological recovery?
2. Is the desired tone grounded rural-industrial realism, or should the world
   also admit strange, speculative species that match the game's wider machine
   frontier?
3. Is the initial presentation target distant silhouette and soundscape, or
   close-up animals that can be approached on foot?

## Recommended next move

The habitat contract is now implemented in `src/game/habitat.ts` and projected
from `GameWorld` into the renderer as low-cost, non-colliding silhouettes.
The projection consumes existing terrain water depth, remembered field health,
weather, world time, and the active Quarry Runout's own spatial state. It is
surfaced in the public state for inspection, but does not create a second
ecology clock or persist individual animals.

The automated world-level contract covers the Quarry Runout case directly: the
same authoritative incident that creates its physical boulder produces local
corvid habitat. No ecology-specific incident record is written.

The next runtime slice is a real desktop playtest across dry, wet, and damaged
ground. It should not begin with a generic ECS, procedural director, mission
framework, or a large asset acquisition pass.

## Addendum (2026-07-29): world-owned places, not player-centered fauna

The initial renderer implementation was corrected after review. It derived a
valid local environmental result, but placed its visible occupants in a ring
around the active rig. That is technically deterministic but visually implies
that wildlife exists for the player. It does not meet the open-world intent.

The renderer now streams fixed 32 metre terrain patches from `GameWorld`.
Player position determines only which nearby patches are visible. Each patch
has a stable world coordinate and derives its own projection from the terrain,
field memory, weather, time, and road-incident state at that coordinate.
Ambient placement is seeded from the patch identity. Moving through a patch
does not move the patch or re-home its life around the rig.

This keeps determinism in the correct layer: environmental cause and
presentation reproducibility. It does not impose a player route, task,
response, schedule, reward, or access gate.

The earlier text about general vehicle noise, speed, proximity, and wheelspin
is aspirational, not current runtime behavior. Current disturbance is derived
only from existing field-condition memory. A future temporary movement/noise
field needs an explicit simulation owner and desktop playtest evidence before
it is claimed or persisted.

## Addendum (2026-07-29): persistent ecology replaces ambient-only framing

The fixed-patch presentation correction above was a necessary removal of the
player-centered spawn ring, but it was still not sufficient. The runtime now
has persistent regional ecology actors in `GameWorld`: a herd, flock, and
scavenger group each carry position, territory, population, and vitality
through world-memory recovery. They migrate from the same weather, land, and
incident conditions that machines change, and grazers alter canonical field
vegetation and root resilience in return.

This supersedes any interpretation that wildlife is read-only ambience or that
regional groups are a permanent ceiling on individual persistent creatures.
The renderer is currently a mirror of these actors. Future individual, social,
physical, and ecological interactions remain open design work. See
`docs/decisions/ADR-0051-persistent-ecology-world-actors.md`.

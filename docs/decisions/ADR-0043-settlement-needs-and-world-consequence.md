# ADR-0043: Settlement needs and world consequence over isolated activity chains

- Status: **Accepted by direct operator continuation (2026-07-29); first runtime stage implemented, verification pending**
- Date: 2026-07-29
- Owner: project owner (Pranay)
- Source: operator redirects during open-world review (2026-07-29); [ADR-0040](ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md); [Game Design Spine](../design/GAME_DESIGN_SPINE.md)
- Related: ADR-0006 (capability contracts), ADR-0018 (capability progression), ADR-0033 (mission lifecycle), ADR-0040 (open vehicle-universe hierarchy), ADR-0042 (persistent infrastructure)

## Context

The runtime has a strong transaction seam:

```text
world state -> derived mission proposition -> lifecycle acceptance -> idempotent reward
```

But the currently authored content gives that seam the wrong semantic center.
Campaign contracts, survey prompts, and a recent Floodgate/North Field pass can
read as isolated instrumented chains: discover something, run a prescribed
operation, obtain a discrete unlock. That is useful engine evidence, but it is
not sufficient open-world play.

The operator rejected this direction explicitly:

> "looks like you are not building my open world game but a test rig?"

> "move to real game work not side quests"

> "this is not something you did...this is you piggybacking on someone else's work, i wanted you to give me something new"

> "why the fuck are you making it a rig, or smaller, anchored ?"

These are not requests to remove valid infrastructure. They reject making a
single, deterministic chain the organizing unit of the game. ADR-0040 already
states that the product is an open vehicle-universe whose worlds include
social structures, economies, stories, and player agency. This ADR defines the
first missing bridge: communities whose changing conditions give machines a
reason to exist in the world.

## Decision

1. The first region is a **network of communities**, not a route of test
   fixtures. Existing places become community anchors where appropriate:
   Home Valley, Long Furrow, Rustline Salvage, Sunken Flats, and Launch Ridge
   have different livelihoods, risks, knowledge, and relationships to the
   player's fleet.
2. Each community has canonical, persisted **condition** and **favor** state.
   Condition describes what is materially true for that community (for
   example: dry, waterlogged, supplied, cut off, dangerous, or recovering).
   Favor records access and trust; it is not a purchasable currency.
3. Communities publish **needs**, not a fixed quest list. A need declares its
   giver, stake, compatible capability combinations, target world state,
   expiry/refresh policy, reward, and consequence. The existing derived
   mission-proposition pipeline remains the single player-facing offer path.
4. Completing community work must apply a durable consequence to the owning
   community. It may improve access, reveal information, alter local field or
   infrastructure conditions, change later needs, or close a conflicting
   opportunity. A reward without a world-memory delta is insufficient for this
   system.
5. Existing authored chains remain valid *content* when they serve a place or
   person. Floodgate 12, North Field, Water Before Night, and campaign routes
   are reclassified as possible causes, clues, or outcomes inside the regional
   social fabric; none is the game's constitutional loop.
6. Runtime implementation must extend, not duplicate:
   - `src/game/mission-propositions.ts` for derived offers;
   - `src/game/mission-lifecycle.ts` for authoritative outcome application;
   - `src/game/contracts.ts` and `src/game/state.ts` for versioned persistence
     and recovery;
   - current mission board, Rumor Map, navigator, and world-site projections
     for player visibility.
   No second jobs board, quest ledger, economy store, or direct UI mutation is
   permitted.

## First authored regional fabric

| Community anchor | Material concern | Machine work that can matter | Persistent consequence |
| --- | --- | --- | --- |
| Home Valley | water, food, repair capacity | till, haul, repair, redirect water | local ground conditions and workshop access change |
| Long Furrow | crop timing and drainage | cultivate, tow, survey, carry | harvest/readiness and local information change |
| Rustline Salvage | recovery, parts, route safety | tow, haul, repair, salvage | parts opportunities and safe routes change |
| Sunken Flats | access through water and isolation | wade, tow, scout, build | crossings and emergency access change |
| Launch Ridge | communications and horizon knowledge | ascend, carry, survey, repair | regional information and distant opportunity visibility change |

This table is an authored starting fabric, not a genre ceiling. Other worlds
can use cities, crews, factions, races, fleets, factories, alien settlements,
or non-human societies under the same ownership rule.

## Options considered

1. **Add another scripted Floodgate chain** -- rejected. It makes the current
   problem more polished rather than solving it.
2. **Build a standalone economy/jobs UI** -- rejected. It would create a
   parallel truth source beside mission propositions and split player intent.
3. **Make every place generic configurable JSON** -- rejected. Stable
   contracts should be reusable, but authored communities need distinctive
   livelihoods, character, and consequences.
4. **Adopt community needs through the canonical mission pipeline** --
   accepted. It adds social and economic meaning while preserving the runtime's
   existing authority boundaries.

## Consequences

- A new versioned settlement-state contract is required before runtime work.
- Mission propositions need a named consequence reference rather than relying
  on title text or a hard-coded mission-id switch.
- Completion requires a community-state transition in the lifecycle boundary,
  then existing renderer/map/UI surfaces project that state. Presentation does
  not own the condition or favor truth.
- The first player-facing proof is not a new test console. It is a visible
  community need on the existing board, a clearly named giver/stake, and a
  subsequent change to that place and its opportunities after completion.
- This increases save/migration and content-validation scope deliberately;
  persistence and inspectability are product pillars, not optional polish.

## Non-goals

- This does not introduce multiplayer trading, dynamic pricing, creator
  marketplaces, universal NPC simulation, or server authority.
- This does not turn favor into money, add purchased currency, or create a
  grind loop.
- This does not remove or rewrite already-valid world, infrastructure,
  capability, or survey systems merely because their first presentation was
  too narrow.

## Validation plan

1. Schema recovery accepts prior save records and creates bounded fresh
   community state without loss of existing progress.
2. Need derivation is deterministic from canonical state and cannot emit a
   community offer whose required site/capability is invalid.
3. Acceptance uses `mission-lifecycle.ts`; no UI or renderer writes community
   state directly.
4. Completion is idempotent and produces exactly one favor/condition outcome.
5. Browser proof shows the offer, its giver and stake, completion, and the
   resulting world/board change on canonical port 4173.

## Rollback

Before operator sign-off, this is a design record only. If rejected, no runtime
schema or player save changes occur. After admission, a migration retains the
state as an inert historical record rather than deleting player consequences.

## Revisit triggers

- Operator chooses a different first-region social model.
- A second world demonstrates that communities cannot share the contract
  without erasing authored identity.
- Multiplayer authority work changes how favor or regional conditions must be
  resolved.

## Update log

### 2026-07-29 -- proposed after operator redirect

The decision was created because the prior execution framing treated a small
deterministic chain as the unit of game progress. The operator rejected that
framing verbatim in the Context section. No runtime code has been admitted by
this ADR; explicit sign-off is required.

### 2026-07-29 -- runtime admission by direct continuation

After reviewing the proposed direction, the operator replied `continue`. This
admits the first coherent runtime stage, not a separate jobs UI or an unbounded
economy rewrite. The stage adds versioned community condition/favor state,
routes existing waterworks and campaign delivery outcomes through it, and adds
Long Furrow's first place-specific cultivation need. It is source-level
implementation evidence; targeted tests and canonical-port play evidence remain
pending.

### 2026-07-29 -- target-aware physical cargo admitted

The settlement pass exposed that `cargo-relay` had one fixed Long Furrow
endpoint while missions could name other destinations. The crate now carries an
optional persisted assignment (mission, origin, destination); mission
acceptance creates it, simulation delivers only to its destination, and route
presentation reads the same target. The original unassigned Relay haul remains
the fallback activity. This is a substrate extension, not a second cargo or
delivery system.

### 2026-07-29 -- a dormant route receives an authored destination

Marsh Depot was added to the canonical world-site table, activating the
previously dormant ford-capability delivery contract. This is not a marker-only
mission fix: the site supplies terrain anchoring, discovery, navigation, and
the actual cargo destination through existing world authorities. The depot's
own settlement state is deliberately deferred until it has distinct crews and
needs rather than placeholder status data.

### 2026-07-29 -- Marsh Depot becomes a community, not a terminus

Marsh Depot now has canonical cut-off/supplied condition and ferrymen as the
named affected people. Completing the ford-capability delivery records favor
and the material relief outcome through the same mission lifecycle as Long
Furrow, Rustline, Sunken Flats, and Launch Ridge. The route now changes a place
instead of simply clearing a campaign node.

### 2026-07-29 -- field notes, not a second dashboard

The current Contracts overlay now projects material community conditions as
short field notes and uses named crews as givers. No new jobs screen, status
card grid, or mobile-specific surface was added. The text remains a projection
of canonical settlement state; it neither creates nor mutates work.

### 2026-07-29 -- independent community offer correction

The first Rustline content pass initially inherited Long Furrow's offer gate,
which would have made one community's irrigation decision suppress another
community's discovered need. The operator's direct `continue` approved the
immediate correction. Need derivation now evaluates each community independently
while retaining one shared canonical settlement state and mission authority.

### 2026-07-29 -- Rustline gets its first physical community delivery

Rustline Salvage is the first community beyond Long Furrow to consume the
shared contract. Once discovered, its isolated crews publish a parts-and-fuel
need through the existing board. Accepting it moves the one physical crate to
Home Valley; towing it across the badlands to Rustline makes the yard supplied
and records favor. The work is not an abstract payout: it uses the same cargo,
terrain, capability, route, completion, and persistent consequence authorities
as every other delivery.

## Anything else?

Yes. Characters need names, voices, and memories eventually, but a dialogue
system without durable stakes would be cosmetic. This decision establishes the
material and relationship state that future character writing, radio traffic,
and faction behavior can truthfully speak about.

## Addendum (2026-07-29) - favor carries local knowledge, not purchase power

The first tangible result of favor is a voluntary, truthful lead. Once the
Sunken Flats causeway has been restored, the households there share the
Ferrymen's Cut: a named channel mark to the already-authored Marsh Depot. The
lead is derived from the persisted completion record, so it survives recovery
without adding a second mutable relationship or route-unlock ledger.

The Rumor Graph projects the target as `rumored`, with a visible community-lead
edge from Sunken Flats. The tactical navigator renders that status as a hollow
amber mark instead of the solid cyan mark used for places personally visited.
Neither projection writes `discoveries`, places a GPS route, changes terrain,
or makes the trip compulsory. Information is the social consequence; movement
and firsthand discovery remain the player's work.

This is deliberately not a favor shop, a relationship dashboard, or a mission
chain. Future communities may offer different forms of access only when a real
world service, person, route, or opportunity exists to support it.

## Addendum (2026-07-29) - communities have named local voices

Settlement data now names a local contact at each authored place: Mara Iles at
Home Valley, Sava Nune at Long Furrow, Kellan Voss at Rustline, Ione Vale at
Sunken Flats, Oren Pike at Marsh Depot, and Sera Tal at Launch Ridge. These are
not free-floating NPCs or a dialogue tree. Each contact owns concise,
condition-derived field notes and the first relevant mission giver identity.

The existing Contracts board remains the presentation surface. It now exposes
what each contact currently says about their place, based on authoritative
settlement condition. Mission completion uses the same names in its existing
announcement path. That gives characters memory and stakes without inventing a
second narrative, reputation, or quest authority.

## Addendum (2026-07-29) - conditions alter authored places, not map pins

Settlement condition now projects onto the existing horizon lamp at a site the
player already knows: cyan for working, supplied, connected, cultivated, or
stable places; amber for a workable opening; red or dim for stressed, cut-off,
isolated, or silent places. The projection is renderer-only and reads the
canonical settlement record. It cannot write collision, terrain, discovery,
missions, or persistence.

Marsh Depot now has authored physical furniture in the world table: a stilted
platform, shelter, fuel drum, and signal lamp. This closes the mismatch where a
place could accept cargo but lacked a visible working identity. The lamp is a
property of that place, not a floating objective marker.

## Addendum (2026-07-29) - Rustline becomes a maintenance yard after it is supplied

Supplying Rustline now unlocks one concrete local service: mechanical repair in
the salvage-yard service area. The player uses the existing repair command,
wear model, price calculation, and repair result. Rustline is intentionally not
a second full workshop: crafting, module installation, restoration, and rig
naming remain Home Silo authorities.

This is a place-based consequence rather than a shop screen or reward token.
The existing repair action simply recognizes one additional, earned site when
the durable Rustline condition is `supplied`.

## Addendum (2026-07-29) - people occupy authored places without becoming a new simulation

Each settlement now owns small authored local anchors for its contact and crew.
The renderer constructs non-colliding, low-poly work silhouettes at those
anchors only after the player knows the site. A struggling place retains one
contact; a stable, workable, cultivated, supplied, or connected place visibly
supports its crew. A tiny idle/work motion keeps the figures from reading as
signposts.

These residents are presentation of settlement state, not an NPC system. They
do not navigate, collide, trade, fight, issue hidden objectives, or mutate the
world. Their later interaction behavior must enter through an explicit command
and affordance contract rather than growing from renderer objects.

## Addendum (2026-07-29) - local knowledge is available in the world, not only on a board

The named contact at each known settlement can now be approached and heard
through the existing primary-action command. The action reads that settlement's
current durable condition and writes only a diagnostic with the contact's
current local truth. It does not open a dialogue tree, create a conversation
history, accept a mission, grant a reward, alter favor, reveal a destination,
or place a route marker.

Physical actions retain precedence: cargo, infrastructure, salvage, and fitted
tools resolve before a nearby local. The people therefore make a place legible
without turning the open world into a sequence of mandatory conversations.

## Addendum (2026-07-29) - a connected settlement changes the terrain itself

Completing the Sunken Flats causeway outcome now derives a raised, grade-limited
community passage from Sunken Flats to Marsh Depot. It enters the canonical
terrain route profile, so terrain height, water depth, `track` material,
collision obstacle eligibility, and rendered ground all read the same change.
The passage restores from settlement history during world settlement; it is not
a separately saved route flag.

This is not a travel lock. The surrounding marsh remains explorable before and
after the causeway, and the Ferrymen's Cut remains only a social lead. The
consequence is a tangible, lower-risk route that makes prior community work
visible and useful to every compatible machine.

The causeway now also receives a restrained deck-and-rail presentation built
from the same resolved passage geometry. Its boards sample canonical terrain
height after the passage activates; it has no collider, route rule, or hidden
state. The terrain corridor remains the physical truth, while the deck makes
the community's repaired crossing recognizable at driving distance.

# ADR-0029: Product vision — machine-keeper odyssey through a living, fractured world

- Status: **Proposed — operator sign-off required**
- Date: 2026-07-27
- Owner: project owner (Pranay)
- Source synthesis:
  [Long-Term Game Design from First Principles](../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
- Related:
  - [ADR-0002](ADR-0002-first-playable-tractor-day-night-loop.md) (first-playable day/night loop)
  - [ADR-0005](ADR-0005-product-identity-rigs-unbound.md) (product identity)
  - [ADR-0006](ADR-0006-rig-capability-portability.md) (rig/capability thesis)
  - [ADR-0018](ADR-0018-journey-mastery-insight-progression-spine.md) (progression spine)

## Context

The project has accumulated strong technical and design contracts: a
headless-capable gameplay kernel, a capability-first rig grammar, a day/night
first-playable thesis, and a three-ladder progression spine. What has not been
canonically recorded is the **product-level vision** those contracts serve.

Without a named vision, every later decision (multiplayer, economy scale,
platform target, content cadence) risks being argued feature-by-feature instead
of being weighed against a shared durable fantasy.

## Decision

Adopt the following durable fantasy as the north-star product vision:

> **Rigs Unbound is a machine-keeper odyssey through a living, fractured world.**
> The player restores a small family of strange machines, learns each one as a
> different physical body, uses them to reconnect places and communities, and
> eventually carries a mobile workshop from an intimate home landscape toward
> impossible scales and horizons. The world remembers how the player helped,
> what they neglected, which routes they made, and what every machine survived.

The desired player story is:

> _I gave abandoned machines a second life, learned what each one could become,
> and used my strange fleet to leave a wounded world more connected—but not
> necessarily more controlled._

### Core identity commitments

1. **Machine embodiment first.** The player is the active rig during operation;
   there is no default humanoid operator separating player from machine.
   Switching rigs feels like inhabiting a different body and perspective, not
   selecting a unit from a roster.
2. **Place as memory.** The world is not a level select. Routes, fields, water,
   structures, damage, and repairs persist and remain readable across sessions.
3. **Capability-first verbs.** Gameplay identity is defined by what a rig can
   do (plough, tow, survey, winch, haul, defend, rescue, etc.) and how it does
   it, not by a universal power score.
4. **Consequence over punishment.** Failure costs condition, time, opportunity,
   and route efficiency; it does not default to hard reset unless a slice
   explicitly tests restart speed.
5. **Intimate-to-epic scale.** The game begins in a small, remembered home
   landscape and can open into rare scale changes (toy-scale travel, watercraft,
   flight, etc.) that reveal the same world as a larger atlas.

### Audience hypothesis (primary)

The primary audience is players who want:

- attachment to a physical, imperfect machine,
- mastery of a distinct body in a readable place,
- agency through multiple physical solutions,
- belonging to a world that shows their work,
- curiosity about what is over the horizon,
- and a legacy of visible world change.

Builders, co-op specialists, collectors, and creators are important secondary
audiences after the solo foundation works. The game is not optimized for pure
combat power fantasy, collection completion, survival grind, idle management, or
leaderboard-first competition.

### Explicit exclusions

This vision deliberately does not commit to:

- mandatory multiplayer or live-service operations,
- a fixed number of rigs, regions, or scale layers,
- photorealistic production targets,
- a universal XP ladder or player level,
- premium currency, paid progression, or lootbox mechanics,
- open user-generated content at launch.

## Why this vision

It gives every existing contract a shared reason to exist:

- The headless kernel and capability portability (ADR-0001/0006) exist so new
  machine bodies can be added without rewriting the world.
- The day/night first-playable (ADR-0002) tests whether one place can feel
  continuous across cozy work and dangerous consequence.
- The progression spine (ADR-0018) makes rigs visibly better at what they do
  without collapsing them into a single power score.
- The terrain-as-substrate decision (ADR-0007) ensures the world remembers
  player labor.

It also creates a clear filter for future proposals: a feature is attractive
when it strengthens machine embodiment, place memory, or consequence; it is
suspicious when it abstracts the player away from the rig, flattens places into
menus, or optimizes for retention loops that do not serve the fantasy.

## Options considered

1. **Adopt the machine-keeper odyssey as the canonical vision** — **proposed.**
2. **Leave vision implicit in exploration docs** — rejected: makes later
   decisions ungovernable and lets strong proposals be rejected for unstated
   reasons.
3. **Adopt a narrower vision tied only to the tractor/farmfall slice** —
   rejected: the technical contracts are explicitly designed to outlive the
   first playable; the vision should match that ambition.

## Risks

- The vision is broad enough that scope could expand indefinitely without
  disciplined slice boundaries. Mitigation: every release must still map to a
  named slice with explicit exclusions (following ADR-0002's pattern).
- The audience hypothesis is unvalidated. Mitigation: fresh-player testing
  (starting with the SIM playtest program) must include whether players describe
  rigs as bodies and places as remembered.
- Scale-change ambition may collide with engine/runtime contracts. Mitigation:
  ADR-0001 engine-bakeoff and bounded-adapter experiments remain open until a
  second scale layer is actually proven.

## Validation plan

- Player-language gate: external or simulated players should describe the game
  in machine/place/consequence terms, not genre shorthand.
- First-playable gate: ADR-0002 must demonstrate that day work and night danger
  feel like the same place under pressure.
- Progression gate: ADR-0018 must show that rigs feel meaningfully different
  after restoration/mastery, not just numerically stronger.
- Scope gate: every future slice proposal names which vision commitment it
  serves and which exclusion it respects.

## Rollback / migration path

This ADR is a product-intent statement, not a schema or API. Rejecting or
reframing it would require rewriting downstream slice plans and possibly
retiring or reclassifying existing ADRs, but it would not create a data-migration
crisis. If the vision is rejected, the technical contracts remain useful as
engineering evidence but lose their shared product rationale.

## Revisit triggers

- Fresh-player language contradicts the machine-keeper fantasy.
- A major feature proposal cannot be evaluated against the vision.
- The operator redirects toward a different durable fantasy.

## Anything else?

Yes. Two things this vision deliberately does not settle:

1. **Favor and Parts economy loops** remain under-specified. They are expected
   to attach to NPC/contracts work and the place-memory fantasy, but their
   accrual and spend loops are not defined here.
2. **Fleet-level identity** (a garage/fleet view that shows the machine family
   as a whole) is anticipated but not specified. It should be designed once two
   or more rigs have journey history.

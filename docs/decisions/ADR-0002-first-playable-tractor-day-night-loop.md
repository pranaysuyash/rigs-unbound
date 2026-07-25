# ADR-0002: First playable tractor day/night loop

- Status: Proposed
- Date: 2026-07-25
- Owner: Project owner
- Next reviewer: Project owner after paper design and one instrumented prototype

## Context

The concept can expand into many vehicles, worlds, genres, economies, and social systems. A first playable based only on driving would be achievable but would not test the project’s differentiator. A first playable containing several vehicles and disconnected modes would create breadth without proving continuity.

## Decision

Propose a ten-minute, replayable “tractor by day, defender by night” slice in one small location.

### Trigger

The player arrives at or inherits a damaged tractor and a neglected field around a workshop/silo.

### Day state

- Drive, plow, seed, water, haul, and repair through physical vehicle interactions.
- Choose which limited plots or structures to restore.
- Discover salvage and one unusual signal beneath the field.
- Use fuel/energy as a pacing constraint, not a waiting timer.

### Transition

Sunset, weather, and the unearthed signal change the same map. The workshop closes defensively, lights become meaningful, and planted/constructed objects retain their positions and condition.

### Night state

- The camera moves toward tactical top-down framing.
- Creatures emerge from crop shadows and follow readable rules.
- Tractor tools become defensive verbs: plow pushes, seed spreader lays hazards, trailer forms a barrier, lights reveal or repel.
- The player protects selected structures/crops rather than a generic health crystal.

### Terminal state

At dawn, the world shows what survived. The player receives salvage and knowledge, sees persistent damage/growth, chooses one module direction, and can immediately replay or return to the workshop.

## Why this slice

It tests the difficult promises together:

- a vehicle as character;
- one upgrade serving multiple genres;
- one place remembering consequences;
- a legible camera/control transition;
- cozy and dangerous tones coexisting;
- procedural encounter variation inside an authored location;
- a complete trigger-to-outcome loop.

## Explicit exclusions

- More than one playable vehicle
- Open-world streaming
- Accounts or cloud saves
- Real-time multiplayer
- Player trading
- Premium currency
- Open UGC
- Live generative dialogue or world generation
- Photorealistic assets

The code should keep seams for later systems without implementing them.

## Success signals

- A new player understands the day goal and night threat without creator narration.
- The tractor feels meaningfully different when tools change.
- At least one daytime choice creates a visible nighttime consequence.
- At least one module creates a real tradeoff across farming and defense.
- Camera and control transitions do not disorient the player.
- Restart is fast enough to invite another run.
- A player can recount one cause-and-effect story from the session.

## Failure and kill conditions

Reframe or kill this slice if:

- the farming and defense halves feel like unrelated games;
- the tractor is functionally a generic character;
- the world reset erases the emotional value of day choices;
- maintaining both cameras doubles complexity without improving play;
- the ten-minute loop requires tutorials, currencies, or meta systems to be interesting;
- browser performance requires removing the objects that make the field readable.

## Risks

- Tone clash between farming and threat.
- Night combat may crowd out non-combat identity.
- Tractor handling may feel slow when tactical pressure rises.
- A day/night cycle can become a disguised timer that removes agency.
- Procedural waves can make authored consequences illegible.

## Mitigations to test

- Let the player trigger dusk after a minimum set of actions rather than using a rigid clock.
- Make avoidance, lighting, pushing, rescue, and fortification viable alongside direct damage.
- Use enemy ecology and crop shadows, not arbitrary spawning.
- Preserve spatial landmarks and vehicle heading through the camera transition.
- Limit procedural choice to validated spawn lanes, objectives, weather, and resource placements.

## Evidence required

- Tier 2: deterministic state and transition tests.
- Tier 3: full day-to-night-to-dawn integration run.
- Tier 4: observed browser play on desktop and narrow/mobile layouts.
- Tier 4: at least three external play sessions with recorded confusion, delight, and replay intent.

## Revisit triggers

- A different vehicle/mechanic combination proves the core thesis more cheaply.
- Early players consistently want exploration over defense.
- Accessibility or control tests show the transition is exclusionary.
- Engine probes show this slice is a biased or poor comparison scene.

## Update Log

- 2026-07-25: Initial proposed slice recorded.

## Anything else?

The point is not to establish farming or zombies as the whole game. The point is to find out whether a persistent machine and place can make a genre change feel like one continuous adventure.

## Addendum — 2026-07-25 additional workbook research

The incoming research proposes a third same-tractor time-trial contract after dawn. This is retained as the immediate **cross-mode architecture proof**, not added to the first fun test.

Reason:

- farm → defense answers whether a persistent machine/place can survive one meaningful genre transition;
- adding race before that answer would confound handling, pacing, progression, and camera diagnosis;
- after the day/night loop works, a short time trial can expose whether physics, input, loadout, save/history, replay, reward, and camera contracts are actually shared or have become mode-specific.

Cross-mode failure signal: the race requires a second tractor representation, duplicated progression/save fields, separate physical-key logic, or a renderer-specific vehicle truth.

Decision effect: **status remains Proposed**; scope of the first loop remains one tractor, one place, day/night/dawn.

### Anything else?

The follow-on race must use the tractor because changing both vehicle and mode would fail to isolate whether identity and architecture actually carried across the boundary.

## Addendum — 2026-07-25 restoration and first module choice

The project owner proposed beginning with a dilapidated/basic tractor and earning the robust preferred visual state through upgrades and switchable additions.

The first-slice interpretation is deliberately bounded:

1. the tractor is immediately drivable but visibly incomplete;
2. the player stabilizes it and repairs the front mount;
3. the broad plow becomes the restored signature tool shared by farming and defense;
4. the first identity choice is one support module—work lights, seeder/spreader, or trailer/hitch;
5. the same tractor carries condition, scars and the consequences of that choice into night and dawn.

Large module swapping is workshop-bound. Changing the deployed state of an installed module can happen during play. Field hot-swapping remains a later earned capability rather than an infinite inventory action.

Decision effect: **status remains Proposed**. This sharpens the existing damaged-tractor trigger and one-module dawn outcome; it does not add the full garage, economy or module catalog to the ten-minute slice.

See [Tractor Restoration and Modular Growth](../exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md).

### Anything else?

The opening damage must create attachment and a clear restoration payoff without making the first minutes handle badly or randomly remove control.

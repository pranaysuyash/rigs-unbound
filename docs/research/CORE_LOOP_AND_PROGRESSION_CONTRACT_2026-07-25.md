# Core Loop and Progression Contract for Rigs Unbound (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the player-facing 30-second loop, session loop, and long-arc progression grammar for the current first-playable and future machine-centric growth.

Linked decision and exploration artifacts:

- [ADR-0002: First playable tractor day/night loop](../decisions/ADR-0002-first-playable-tractor-day-night-loop.md)
- [ADR-0009: Bounded mobility adapters own locomotion-specific state](../decisions/ADR-0009-bounded-mobility-adapters.md)
- [ADR-0012: Rig perception is a shared gameplay contract](../decisions/ADR-0012-rig-perception-chain.md)
- [Rigs Unbound Exploration Map](../exploration/EXPLORATION_MAP.md)
- [Tractor Restoration and Modular Growth](../exploration/TRACTOR_RESTORATION_AND_MODULAR_GROWTH_2026-07-25.md)
- [Risk and Public-Readiness Register](./RISK_AND_PUBLIC_READINESS_REGISTER_2026-07-25.md)

## Decision

Use a spatial-discovery-first loop where the player always acts through a machine in a readable place.

The loop is not “menu → race → menu.”
The loop is:

`see a place → choose a verb → perform it in motion → receive consequence → recover or return → modify the machine → reveal the next possibility`

That makes the machine, place, and consequence feel continuous.

## The 30-second loop

### 1) Action

The player reads terrain, affordances, and threats, then does something concrete:

- drive,
- plow,
- tow,
- repair,
- seed,
- haul,
- scout,
- rescue,
- defend,
- or route around a problem.

### 2) Feedback

The world responds immediately through:

- camera movement,
- body/load change,
- terrain deformation or path change,
- audio and HUD feedback,
- visible success or strain.

### 3) Reward

Reward is not only currency.
It includes:

- visible world change,
- saved time,
- reduced risk,
- new route knowledge,
- restored condition,
- new capability or module access,
- a stronger understanding of the machine.

### 4) Repeat

The next choice should be obvious enough that the player can continue without a tutorial wall.

## Session loop

`workshop / garage → choose objective or follow curiosity → travel → encounter / activity → consequence → return / recover → modify vehicle → reveal new possibility`

This is the practical loop for the current first playable and its near-term growth.

## Long arc

`acquire machines → repair / restore them → specialize them → hybridize carefully → learn their personalities → build a strange fleet → change the world`

The long arc is machine-centric, not avatar-centric.

The player advances by accumulating verbs, relationships, and consequences, not by erasing machine identity behind a universal power score.

## Progression grammar

### 1) Skill progression

The player gets better at reading terrain, timing, attachment, recovery, and camera literacy.

### 2) Capability progression

The machine gains new verbs or broader allowed contexts:

- tow,
- farm,
- defend,
- rescue,
- scan,
- carry,
- dock,
- or move through a new medium.

### 3) Content progression

The world opens new regions, activities, anchors, or machine families.

### 4) Story progression

The world remembers what the player changed and lets those changes persist.

## Progression resources

The current progression grammar should stay anchored to:

- **Scrap**: early spendable soft resource for repair/build/exchange.
- **Insight**: discovery and mastery progress that reveals possibilities.
- **Favor**: relationship/reputation state that unlocks access.
- **Parts**: concrete inventory with provenance and compatibility.

## Motivation targets

The core design should satisfy two primary motivations first:

- **Achiever**: wants clear goals, restoration, completion, visible mastery.
- **Explorer**: wants new routes, hidden verbs, strange machines, and world change.

Secondary social/competitive systems can come later, but they should not be required for the first rewarding loop.

## Reward schedule

Use:

- **fixed rewards** for restoration milestones and clear objective completions,
- **variable rewards** for discovery, salvage, and unexpected world consequences,
- **ratio rewards** only when they are tied to effortful mastery, not coercive grind.

Avoid reward systems that rely on addictive uncertainty as the primary retention tool.

## Failure cost

Failure should usually cost:

- condition,
- time,
- opportunity,
- route efficiency,
- or recovery effort.

It should not default to a hard reset unless the first-playable slice is explicitly testing restart speed.

This aligns with the day/night loop decision: consequence matters more than punishment.

## Garage and workshop role

The garage/workshop should be both:

- a menu-like planning surface,
- and a place with identity, memory, and repair meaning.

That way the player can plan quickly without losing the feeling that the world is continuous.

## Next-possibility guidance

The player should always know the next interesting possibility through a lightweight guidance layer, not quest spam.

The named hypothesis is an **opportunity compass**:

- it reveals verbs and affordances,
- not just map markers,
- and not a generic checklist.

## What this contract is not

- Not a live-service retention design.
- Not a universal XP ladder.
- Not a lootbox or variable-randomness retention scheme.
- Not a replacement for the day/night slice decision.

## Acceptance evidence

This contract is satisfied when a player can:

- explain the loop in one sentence after a short session,
- feel that their machine and place matter together,
- see a consequence from one choice influence the next choice,
- describe a useful reason to return to the workshop or garage,
- understand what the next possibility is without a long tutorial.

## Relationship to the broader architecture

This note gives the game-design layer a durable loop grammar that matches the existing technical contracts.
It keeps the rest of the system honest: renderer, camera, progression, and world state must serve this loop, not compete with it.

## Addendum (2026-07-26): the loop now has a named composition proposal above it

- The core loop remains the canonical 30-second and session-loop contract.
- The next product-level layer above it is now named in
  [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md).
- That proposal does not replace this loop contract. It composes place, rig
  identity, pressure, discovery, and consequence into a single authored
  episode that still resolves back into this loop.
- In other words: the loop stays the loop, and the episode grammar is the
  next durable way to combine it with richer contracts.

## Addendum (2026-07-26) - episode grammar depends on this progression grammar to leave lasting rewards

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this progression contract.
- The episode grammar does not define Scrap, Insight, Favor, Parts, or the
  reward schedule; it depends on this contract so episodes can leave behind
  durable progression, mastery, and story consequences instead of just a
  momentary scene.
- This keeps the split clean: progression owns the long-arc resource and reward
  grammar, while the episode grammar owns how those rewards are assembled into
  a playable episode.

## Addendum (2026-07-28) - the live runtime now proves the derived-mission split, but the acceptance surface is still the product gate

- Re-read the current `src/game/mission-propositions.ts`,
  `src/game/mission-resolver.ts`, and `src/game/progression.ts` alongside the
  design docs in `docs/systems/`.
- The implementation already proves a clean technical split:
  - mission propositions are derived from current world/progression state and
    are not persisted,
  - progression is a pure kernel with account XP plus a separate per-rig
    restoration track,
  - mission resolution bridges current activity rewards into that progression
    kernel.
- The current live code therefore already matches the loop contract’s
  machine-centric shape better than a generic universal XP ladder:
  - the player acts through a machine,
  - missions are derived opportunities,
  - progression is the consequence ledger.
- What remains unresolved is product admission:
  - the repo still lacks a mission board / acceptance surface that is clearly
    admitted as the player-facing authority,
  - `ADR-0033` remains proposed rather than accepted,
  - universal mission-board direction should not be described as settled until
    the operator resolves that gate.
- In practice, the right interpretation is:
  - derived propositions are runtime evidence,
  - nested progression is runtime evidence,
  - the acceptance surface is still a decision, not a finished product claim.

## Anything else? (mission/progression gate)

Yes. The current split is healthy because it keeps machine-centric play,
derived opportunities, and long-arc progression from collapsing into one
all-purpose quest ledger. The next durable move is to name the player-facing
mission acceptance surface explicitly, not to broaden the core loop into a
second progression authority.

## Addendum (2026-07-28) - the wiring experiment is the first probe of the acceptance surface gate

- Re-read the current loop/progression contract after naming the world graph,
  the episode runner, and the wiring experiment route.
- The runtime already proves the loop’s technical split:
  - mission propositions are derived from current world/progression state,
  - progression is the consequence ledger,
  - recovery-shaped opportunities already exist in the proposition set.
- What is still open is the player-facing acceptance surface:
  - the repo still lacks a clearly admitted surface where a player chooses from
    those derived opportunities,
  - the existing recovery route should be treated as the first concrete probe
    of that gate, not as a finished product claim.
- The wiring experiment therefore serves two purposes at once:
  - it tests whether one reachable verb can become one legible outcome,
  - it shows whether the acceptance surface is UI, pressure, consequence, or
    a combination of the three.
- Evidence depth: Tier 1 static source inspection and contract synthesis.

## Addendum (2026-07-28) - the acceptance surface is now explicitly named

- The player-facing choice layer is now named in
  [Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md).
- That note keeps the existing loop intact while separating:
  - the read-only contract ledger,
  - the player choice moment,
  - the authoritative command/result path.
- The core loop still owns the sequence `see a place -> choose a verb ->
perform it in motion -> receive consequence -> recover or return -> modify
the machine -> reveal the next possibility`.
- This addendum does not settle ADR-0033 or any universal mission-board
  authority question. It only names the interaction contract that the current
  runtime and wiring experiment are already pointing at.


## Addendum (2026-07-29) - the next game-design proof is one tow-plus-repair rescue loop

- Re-read the `game-design` skill against the current loop and progression contract.
- The next durable proof slice is still not a generic activity registry or a broad progression system. It is one concrete loop that the player can feel in less than a minute:
  - action: drive to a stranded machine, tow it, or attach the repair gear;
  - feedback: camera, load, terrain, and audio make the strain obvious;
  - reward: the machine becomes usable again and the route/problem is visibly improved;
  - repeat: the player sees the next possibility through the workshop/garage or opportunity compass.
- That loop is the best next proof because it exercises the current machine-centric grammar without requiring a new progression authority or a broad mode rewrite.
- The mission acceptance surface remains the separate choice layer above this loop; the loop itself should stay readable even if acceptance moves between UI forms later.
- Evidence depth: Tier 1 static synthesis from the design skill and the current core-loop contract. No runtime change was made in this pass.

Anything else? Yes: the next proof should be one satisfying loop, not a larger system pretending to be a loop.

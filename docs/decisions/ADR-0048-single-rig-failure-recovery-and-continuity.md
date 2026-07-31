# ADR-0048 — Single-rig failure recovery and continuity

- **Status:** Proposed — operator sign-off required
- **Date:** 2026-07-29
- **Decision owner:** Project owner
- **Evidence ceiling:** Tier 1 static repository inspection plus external precedent research
- **Related exploration:** [Single-Rig Disablement and Recovery Exploration](../exploration/SINGLE_RIG_DISABLEMENT_AND_RECOVERY_EXPLORATION_2026-07-29.md), [Recovery Web and Player Continuity Design Space](../exploration/RECOVERY_WEB_AND_PLAYER_CONTINUITY_DESIGN_SPACE_2026-07-29.md)
- **Related decisions:** [ADR-0006 — Rig capability portability](ADR-0006-rig-capability-portability.md), [ADR-0019 — Monotonic world clock and exceptional recovery](ADR-0019-monotonic-world-clock-and-exceptional-recovery.md), [ADR-0037 — Dynamic world collision authority](ADR-0037-solver-independent-dynamic-world-collision-authority.md), [ADR-0040 — Open vehicle-universe and design-spine hierarchy](ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md)

## Context

The game may begin with one playable rig before a larger fleet exists. If that
rig becomes disabled, a fleet-only rescue contract cannot be the only recovery
path. A disabled machine must remain consequential and physical without making
the campaign unwinnable.

The current repository already contains a condition-zero emergency recovery
branch in `src/game/state.ts`: it returns the rig to Home Silo, grants a 25%
limp-home patch, detaches cargo safely, records recovery telemetry, and awards
no salvage. That is useful implementation evidence, but it is not yet an
operator-accepted product policy or a complete one-rig recovery design.

## Proposed decision

Admit the following policy for review:

1. **No ordinary disablement may soft-lock a one-rig campaign.** A guaranteed,
   visibly named emergency recovery action must remain available without
   requiring a second rig or an unobtainable resource.
2. **Emergency recovery is safe, not optimal.** It may cost time, condition,
   contract momentum, cargo position, favor, or another declared consequence,
   but it must not award salvage or erase the rig's identity/history.
3. **The disabled rig remains authoritative world state.** Its location, cause,
   cargo/attachments, damage record, and recovery result flow through the same
   simulation/save/world-memory authority as normal play.
4. **Field repair, on-foot recovery, settlement tow, loaners, and fleet towing
   are candidate choices that deepen the ladder.** They do not create a second
   recovery state machine or become hidden prerequisites for the emergency
   escape.
5. **True total loss is separate from ordinary disablement.** If the game ever
   includes it, it needs an explicit mode/campaign contract, identity and
   provenance preservation, and a recovery/rebuild explanation.

This ADR remains **Proposed**. The operator has not yet selected the cost,
severity, on-foot scope, loaner policy, or total-loss posture.

## Options considered

| Option | Disposition | Reason |
| --- | --- | --- |
| Fleet-only rescue | Rejected as the first-rig invariant | Impossible before the fleet exists; makes Act I sequencing a hidden dependency. |
| Free teleport/reset | Rejected as the default | Removes physical consequence and weakens the persistent-world promise. |
| Guaranteed emergency recovery with declared cost | Proposed | Preserves access to play while leaving preparation and physical rescue better. |
| Field repair only | Rejected as the sole path | Resource starvation can create a circular soft-lock. |
| On-foot recovery only | Deferred as a scope choice | Potentially rich, but may pull the opening away from its vehicle/community center. |
| Settlement tow / temporary loaner | Proposed extension | Makes communities and fleet progression meaningful; requires persistence and exploit rules. |
| Save rewind only | Rejected as the only path | Teaches players to bypass persistent consequences and is poor accessibility communication. |
| Ordinary permanent destruction | Deferred / hard-mode candidate | Too severe for the opening unless identity, rebuild, and player comprehension are designed together. |

## Authority and invariants

- `RigState`, `GameWorld`, cargo/attachment state, recovery records, and save
  migration remain the sources of truth.
- Recovery commands are idempotent: repeating an already-resolved recovery
  cannot duplicate salvage, cargo, favor, loaners, or world effects.
- Recovery results are reason-coded and player-readable.
- Emergency recovery cannot create a reward loop by granting salvage.
- World time and active incidents follow the declared recovery policy; they do
  not silently freeze because the selected rig is disabled.
- The disabled rig's identity, name, modules, provenance, and history survive
  ordinary emergency recovery.
- A player with zero salvage still has one reachable recovery path.

## Validation plan before acceptance

The eventual implementation proof must include:

- single-rig condition-zero recovery with zero resources;
- save/reload while disabled and after every recovery branch;
- detached and attached cargo behavior;
- repeated/duplicate recovery commands;
- active world incident behavior while the rig is disabled;
- stale or invalid recovery target behavior;
- field repair resource exhaustion;
- settlement tow and temporary-loaner ownership/return rules;
- later fleet towing versus emergency recovery comparison;
- keyboard, pointer, touch, and accessible announcement parity;
- canonical-port runtime observation at `4173`.

Because this is a persistence and recovery path, passing unit tests alone will
not be sufficient. Acceptance requires integration/runtime evidence and
operator sign-off on the product severity.

## Revisit triggers

Reopen this ADR if:

- Act I is explicitly changed from one rig to a fleet;
- the game adds a true total-loss or hard-mode contract;
- the world gains a reliable on-foot recovery loop;
- settlement favor or loaners become the canonical service economy;
- emergency recovery causes a repeatable exploit or erases meaningful world
  consequences;
- player observation shows that the recovery choice is undiscoverable or
  routinely misunderstood.

## Anything else?

Yes. This decision is also a test of the game's promise: the machine can be
hurt, the world can remember, and the player can still continue. If any future
recovery design satisfies only the last clause by erasing the first two, it is
not aligned with Rigs Unbound's persistent vehicle-character direction.

## Update log

### 2026-07-29 — Initial proposal

Created from the operator's one-rig disablement question and the accompanying
external precedent review. No implementation or operator acceptance is implied.

### 2026-07-29 — Operator redirect expands the decision frame

The operator explicitly rejected anchoring the design to the current runtime
branch:

> “you still are stuck to what exists not expanding/researching/exploring, look at the vision, dont anchor to existing...i am thinking of teleport, otehr one as you mentioned- reserve 25% home limp, if other vehicles at home or later multiplayer-call for help or change/switch to character and that char gets to come and help, or if has ingame currency-buy mana kind of thing or call repair/mechnic or maybe if more advanced upgrades and skills unlocked then self repair”

Consequence: the 25% Home Limp path remains a candidate invariant, but it is no
longer the proposed product center. ADR-0048 now evaluates a recovery
constellation spanning home recall/teleport, character and vehicle switching,
NPC/async/live help, earned rescue capacity, repair/mechanic calls, advanced
self-repair, and physical stranded-rig recovery. The full option space and
precedent analysis live in the linked exploration addendum. This ADR remains
Proposed pending operator selection of the continuity model.

## Addendum — vision-led decision surface

The canonical vision says vehicles are playable characters and the player's
continuity crosses fleet, vehicle, world, relationship, wealth, and social
history. It also explicitly permits temporary loaners and shared multiplayer
vehicles. Therefore the decision is not “teleport or no teleport.” It is:

**What forms of continuity should become available when the current playable
body fails, and how should each path trade speed, agency, cost, social meaning,
and physical world consequence?**

Candidate families for operator review:

- **Home authority:** operator recall, rig recall with reserved 25% limp,
  activated-anchor travel, or remote workshop projection;
- **Character agency:** switch to a mechanic, caretaker, scout, drone, stored
  rig, or temporary loaner while the original rig remains persistent;
- **Social help:** named NPC mechanic, settlement crew, asynchronous helper, or
  live multiplayer SOS;
- **Earned rescue capacity:** Relay Charge, service credit, physical relay fuel,
  or home emergency reserve; not purchased progression currency;
- **Machine mastery:** field diagnosis, redundant systems, remote hands,
  self-repair, or late Atlas technology;
- **Physical consequence:** leave a named wreck/obligation in the world and
  return later through the fleet or a community.

The proposed invariant is now:

> A disabled rig opens multiple continuity paths. At least one path is always
> available; later progression and social systems add more expressive paths.

This keeps the no-soft-lock requirement while allowing the vision to decide
what kind of game the recovery moment becomes.

## Addendum — second operator redirect: widen the ontology again

The operator repeated that the exploration was still too anchored to what
exists. The companion design-space artifact now makes the larger premise
explicit: the disabled rig is one body in the player's continuity, while
teleport, Home Limp, character switching, reserve rigs, named mechanics,
earned rescue capacity, self-repair, async help, live multiplayer, and leaving
the rig behind are distinct ways of carrying agency forward.

The new design-level rule is:

> When a vehicle-character is disabled, the player can continue through a
> recovery web of bodies, helpers, infrastructure, resources, skills, and
> social relationships. The web always has one safe floor, while progression
> determines how much agency, speed, preservation, and expression the player
> has.

This is still a proposed product direction, not an accepted runtime contract.
The companion document records the expanded teleport taxonomy, body-succession
model, SOS and service economy, self-repair progression, multiplayer/async
continuity, precedent research, scenarios, and open operator decisions.

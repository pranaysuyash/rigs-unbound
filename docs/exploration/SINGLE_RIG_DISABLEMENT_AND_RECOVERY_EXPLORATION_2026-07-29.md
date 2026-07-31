# Single-Rig Disablement and Recovery Exploration

**Date:** 2026-07-29  
**Status:** Proposed exploration; operator decision required  
**Evidence:** Tier 1 static inspection of the current repository plus dated external precedent research  
**Related decision:** [ADR-0048 — Single-rig failure recovery and continuity](../decisions/ADR-0048-single-rig-failure-recovery-and-continuity.md)  
**Related open decision:** [RU-0912 — Act I sequencing: fleet versus one machine that changes](../plans/MASTER_EXECUTION_TRACKER.md#new-items)

## The operator's question

> “suppose the game starts with only one rig, what happens if its disabled? we are stuck...what are the options the player has...i have a few ideas but want to hear yours before we document the whole discussion use [@decision-log](plugin://decision-log@carl-tools) if needed to capture but everything should be in the project no temps or external”

This document is the durable record of the first response and the research
behind it. It is intentionally not an accepted product decision. The proposed
ADR stays open until the operator chooses the desired severity and recovery
fantasy.

## The real design problem

“The only rig is disabled” is not one state. It can mean at least four
different player experiences:

| State | What the player can still do | Design meaning |
| --- | --- | --- |
| **Impaired** | Limp, change route, drop or secure cargo, reach a service point | The player notices the warning and still has agency. |
| **Disabled** | Cannot drive normally; can inspect, patch, call, walk, or prepare recovery | A consequence that starts a recovery story rather than ending play. |
| **Wrecked but recoverable** | The rig stays in the world and can be repaired, towed, or reclaimed | Failure leaves a physical memory and a reason to return. |
| **Lost / total failure** | The original body cannot continue, but its identity, history, and useful parts survive | A severe mode or late-game consequence; it must not silently erase the campaign. |

The unacceptable state is not “the player must recover.” The unacceptable
state is **disabled + no reachable recovery action + no meaningful explanation**.
That is a soft-lock, not difficulty.

## Current repository baseline

The current code and docs already contain several pieces of a one-rig answer:

- `createInitialState()` starts the opening utility tractor at condition `0`,
  because the first-playable fantasy is restoration rather than immediate
  driving. The opening restoration is described in
  [The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md).
- `winchRecover()` has a condition-zero branch that returns a disabled rig to
  its authored Home Silo berth, grants a 25% limp-home patch, records an
  emergency count/time, detaches cargo safely, and awards no salvage. This is
  visible in `src/game/state.ts` around `EMERGENCY_RECOVERY_CONDITION` and the
  condition-zero recovery branch. This is static source evidence, not current
  browser acceptance for every one-rig scenario.
- The same function has a weaker no-winch nudge and a stronger winch-to-track
  recovery path. The current route contract explicitly describes recovery as a
  snap to the nearest authored track rather than general pathfinding; see
  [Route Clearance and Capability Pathing Contract](../research/ROUTE_CLEARANCE_AND_CAPABILITY_PATHING_CONTRACT_2026-07-26.md).
- `fleet-recovery` and the fleet-recovery mission proposition assume an active
  assisting rig with the `tow` capability. That is a valid later-game answer,
  but it cannot be the only first-rig answer.
- The current first-playable plan places restoration before the first real
  work, and the tracker separately records the unresolved question of whether
  Act I should be “one machine that changes” before a larger fleet appears.

The key architectural implication is that the one-rig policy should extend the
existing authoritative rig/world/recovery path. It should not create a second
“unstuck” state machine or a direct save-edit shortcut.

## External precedent research

These examples are pattern evidence, not claims that Rigs Unbound should copy
their mechanics.

### Pacific Drive: one vehicle as companion, workshop, and field problem

Ironwood describes Pacific Drive as a driving survival game where the car is
the player's “only companion” and the garage is the home base for restoring and
upgrading it. Its published gameplay loop explicitly includes assessing damage,
repairing individual parts, crafting replacement panels, refueling, charging,
planning the next route, and returning to the garage before going deeper. The
[developer's PlayStation Blog gameplay-loop article](https://blog.playstation.com/2023/11/30/unravel-the-gameplay-loop-of-pacific-drive-launching-on-ps5-feb-22/)
and [first gameplay article](https://blog.playstation.com/2023/02/09/ironwood-studios-returns-with-a-first-look-at-the-gameplay/)
are the strongest sources for this pattern.

**Transferable lesson:** if one machine is the protagonist, repair cannot be a
menu afterthought. The player needs readable part failure, field preparation,
resource choices, and a safe place that makes recovery feel like part of the
loop.

**Important difference:** Pacific Drive's route/garage structure can return the
player to a safe base as part of its expedition rhythm. Rigs Unbound has a
persistent connected world and physical consequences, so a recovery action
must state what happens to cargo, position, elapsed world time, incidents, and
the rig's history.

### Jalopy: maintenance as identity, with a hard-lock warning

The publisher's [Steam description](https://store.steampowered.com/app/446020/Jalopy/)
frames the game around building, repairing, refueling, and driving one
dilapidated car. Tires, engine, carburetor, fuel, cargo weight, and upgrades
change whether the trip is viable.

**Transferable lesson:** a single rig can generate rich decisions because
condition changes route, load, preparation, and risk—not just a health bar.

**Warning for Rigs Unbound:** a breakdown that requires a resource the player
cannot obtain is a failure of the recovery economy. The game can make the
player pay in time, salvage, favor, cargo, or condition, but it must always
leave at least one reachable escape route.

### SnowRunner: the fleet makes rescue a physical verb

SnowRunner is the useful counter-example for the later fleet. Its official
[Focus Entertainment page](https://www.focus-entmt.com/en/games/snowrunner)
positions the game around off-road vehicles, while a [publicly hosted copy of
the game manual](https://usermanual.wiki/m/c9e3875f2701933a44453762f2da6be129a621ec3a1c3e680486612bd92d205.pdf)
describes garage, vehicle changes, and add-ons used to repair, refuel, or winch
stuck trucks. The pattern is also reflected in the game's published player
guidance: another truck can physically tow or service a disabled one, while a
garage recovery is a more abstract fallback.

**Transferable lesson:** once the player owns more than one machine, disablement
can become a logistics puzzle: choose the helper, prepare the attachment, pay
the route cost, and decide whether to tow or recover.

**Boundary:** this is not a first-rig solution. A first-rig policy must not
assume the player has already earned the fleet that later makes rescue fun.

### Synthesis

The strongest combined principle is:

> **One rig should be the player's character, but never the player's only
> possible next action.**

The game can preserve stakes by making rescue costly and consequential. It
should not preserve stakes by making progress depend on a second vehicle that
does not yet exist.

## Options for the player

The following are candidate options, not simultaneous implementation
requirements.

| Option | Player experience | Cost / consequence | Strength | Risk |
| --- | --- | --- | --- | --- |
| **1. Emergency return to Home Silo** | Select a clearly named rescue action when the rig is disabled. | No salvage reward; time advances; rig returns with a limp-home condition; cargo is safely detached or marked for retrieval. | Guaranteed anti-soft-lock; already has a repository seed. | Feels like teleportation if the fiction, animation, cause record, and world consequences are invisible. |
| **2. Field patch** | Spend a repair kit, parts, or carried salvage to restore minimum mobility. | Consumes scarce material; may leave component damage and reduce future reliability. | Preserves agency and turns preparation into meaningful play. | Requires a readable field-repair contract and cannot demand an item the opening never supplied. |
| **3. On-foot recovery** | Leave the rig, walk to a cache, workshop, settlement, or safe route, and bring back a part/tool. | Time, exposure, weather, cargo abandonment, and possible route danger. | Makes the world remain playable when the vehicle is not. | Can accidentally turn the game into a walking game or become tedious across large distances. |
| **4. Call a local tow** | Ask the Home Silo, a named settlement, or a discovered service crew for help. | Favor, salvage, time, or an owed future service; the world remembers who helped. | Fits the open-world/community direction and makes people matter. | Needs an always-available fallback contact and must not become an invisible quest gate. |
| **5. Borrow a mule / loaner** | A settlement lends a temporary low-capability rig to reach or service the disabled one. | Debt, return obligation, restricted tools, or a reduced contract choice. | Bridges the one-rig opening into a fleet without spawning a permanent second protagonist. | Loaner rules, ownership, save persistence, and exploit prevention become real contracts. |
| **6. Salvage and rebuild** | Strip the disabled chassis or rebuild it at the workshop; the machine's passport survives. | Parts, time, lost cargo, visible scars, and possibly a temporary replacement body. | Supports the “vehicle as character” idea even if the physical body changes. | Too severe for an early ordinary breakdown; needs a clear distinction from normal disablement. |
| **7. Recover to last safe service state** | An accessibility/sandbox rule returns the rig to its last service point or checkpoint. | Optional reduced consequence or explicit mode boundary. | Protects players who do not want logistical punishment. | Can erase world consequences if it becomes the default authority. |
| **8. Reload / rewind** | Return to an earlier save or run checkpoint. | Loses recent progress; non-diegetic. | Useful as an accessibility and development escape hatch. | Weakens persistence and teaches players to bypass the recovery ecology. |
| **9. Abandon the current job, not the rig** | Release cargo or cancel the route, then recover the machine. | Lost contract momentum, reputation/favor, or a changed settlement need. | Keeps the failure meaningful without making the whole campaign inaccessible. | Must avoid punitive mission spam and explain exactly what was lost. |

## Recommended policy: the recovery ladder

The recommendation is **not** “make rescue free.” It is “make at least one
rescue possible, then let the player choose how much consequence to accept.”

### Before disablement: warnings and preparation

Condition should be legible before it reaches zero. The player should have time
to:

- reduce load or abandon optional cargo;
- change route toward a service point or authored track;
- use a field repair item if one is carried;
- accept slower movement rather than pushing into a total failure;
- call a known settlement when the world has taught that service.

The UI should distinguish “you are making a risky choice” from “the game has
removed your controls.”

### At disablement: preserve the physical consequence

When condition reaches zero, the simulation should record a structured
disablement event containing at least:

- rig instance id and saved name;
- cause category and location;
- cargo/attachment state;
- last safe service point or recovery anchor;
- world time and active weather/incident context;
- whether the player has a second rig, a field kit, a known helper, or no aid.

The rig remains in the world as a disabled body until the chosen recovery
action resolves it. This preserves the project's simulation-owned collision and
world-memory direction.

### With only one rig: expose three guaranteed categories

The first-rig menu should always expose enough information to choose among:

1. **Patch here** — if the player has a valid field resource or an immediately
   reachable local repair interaction.
2. **Call for emergency recovery** — always available, non-rewarding, and
   costly in a declared way; returns to Home Silo or the nearest authored safe
   service state with a limp-home patch.
3. **Walk / mark / recover later** — only when the world supports a meaningful
   on-foot route; the disabled rig remains a named physical problem rather than
   disappearing.

The emergency option is the invariant. The other two add agency and texture;
they must not replace the invariant until a real vertical slice proves they
are reachable and understandable.

### After the first rig: let the fleet deepen the problem

Once the player owns or borrows another rig, the same disabled state gains new
options without changing its authority:

- switch to an assisting rig and winch/tow the disabled one;
- bring a service or parts attachment;
- ask a settlement crew for help;
- leave the disabled rig staged and continue another activity;
- recover it abstractly when the physical rescue is not worth the route.

This is where `fleet-recovery` becomes a rich logistics activity. It should not
be the hidden prerequisite for surviving the first machine failure.

## What should the game never do?

- Never leave the player with a disabled rig and no visible reachable action.
- Never require salvage to obtain the only tool that can reach the salvage
  required to recover.
- Never delete the rig's identity, name, modules, provenance, or history as a
  side effect of ordinary emergency recovery.
- Never silently teleport cargo, incidents, or world state without a declared
  result.
- Never make a one-rig campaign secretly depend on a fleet-only mission path.
- Never use save rewind as the only recovery, because it teaches the player
  that persistence is unsafe.
- Never make the emergency option a rewarding shortcut; it should be safe but
  less attractive than competent preparation or a physical rescue.

## Proposed state and player-facing contract

The future contract should be expressible as one state transition, not a new
parallel system:

```text
operational
  -> warning
  -> impaired
  -> disabled
  -> { field-patched
     | locally-repaired
     | settlement-towed
     | fleet-towed
     | emergency-recovered
     | staged-as-wreck }
  -> workshop-repaired / rebuilt / retired
```

Every branch should produce a player-readable result:

- **What happened?** “The alternator failed at Quarry Shelf.”
- **What is true now?** “Torque is disabled at the north bend; the relay crate
  is detached and still recoverable.”
- **What can I do?** “Use a field kit, call Home Silo, walk to the marked cache,
  or switch to a helper rig.”
- **What will it cost?** “Emergency recovery advances the clock, gives no
  salvage, and returns the rig at limp-home condition.”
- **What remains?** “The machine's name, modules, damage record, and world
  incident remain.”

This explanation belongs in the same shell/announcement/accessibility path as
other recovery messages. A disabled state that is only visible through a small
HUD number is not a finished player contract.

## Evaluation criteria for the eventual prototype

Before accepting any specific ladder, test the following questions with a
single-rig scenario and a later fleet scenario:

1. Can a new player name the first available recovery action without project
   knowledge?
2. Can the player reach at least one recovery outcome with zero salvage?
3. Does emergency recovery preserve rig identity, cargo truth, world time, and
   save/reload continuity?
4. Does a prepared field kit feel better than emergency recovery without being
   mandatory busywork?
5. Does a settlement tow feel like help from a living world rather than a
   hidden teleport button?
6. Does a second rig create new rescue decisions instead of merely removing
   the failure state?
7. Can the player understand the difference between ordinary disablement,
   staged wreck, and true total loss?
8. Does a player who chooses an accessibility recovery mode still understand
   the consequence they skipped?

The future runtime proof should cover duplicate recovery commands, save/reload
after disablement, detached cargo, active world incidents, no-resource
recovery, helper-rig recovery, and invalid/stale recovery targets. This is a
high-consequence persistence and recovery path; unit tests alone will not be
enough for acceptance.

## Recommendation in one sentence

Make the first rig a character, make disablement a story-bearing physical
problem, and guarantee one declared emergency escape while adding field repair,
settlement help, loaners, and fleet towing as increasingly expressive choices.

## Open questions for the operator

1. Should the first campaign intentionally begin with one rig, with the fleet
   introduced only after the player bonds with that machine?
2. Should emergency recovery be free but time-consuming, or cost a bounded
   resource such as salvage/favor? The proposal here is **no salvage reward plus
   time/condition consequence**, with no hard resource prerequisite.
3. Should on-foot play be a real recovery verb, or should the first playable
   keep the player in a compact vehicle/community loop?
4. Is a temporary settlement loaner part of Campaign One, or a later fleet
   bridge?
5. Should “true total loss” exist in the default campaign at all, or only in a
   declared hard mode?
6. Should accessibility recovery return to Home Silo, the last safe service
   point, or a player-selected safe anchor?

## Anything else?

Yes. The one-rig question is also a sequencing question. If Act I truly is one
machine that changes, recovery is not a support feature around the story; it is
one of the story's first tests of trust. The player should learn that the world
can hurt the machine, the machine can remain theirs, and communities can help
without taking agency away. The later fleet then expands the recovery grammar
instead of retroactively making the opening survivable.

## Source notes

External pages were checked on 2026-07-29. They are cited for publicly stated
game loops and feature patterns, not as evidence of player preference or proof
that a mechanic will work in Rigs Unbound.

## Addendum — vision-led expansion after operator redirect (2026-07-29)

The first version of this exploration was too anchored to the current
condition-zero branch. The operator corrected the design frame:

> “you still are stuck to what exists not expanding/researching/exploring, look at the vision, dont anchor to existing...i am thinking of teleport, otehr one as you mentioned- reserve 25% home limp, if other vehicles at home or later multiplayer-call for help or change/switch to character and that char gets to come and help, or if has ingame currency-buy mana kind of thing or call repair/mechnic or maybe if more advanced upgrades and skills unlocked then self repair”

This redirect is not a rejection of the earlier no-soft-lock invariant. It is a
rejection of treating the current emergency-return implementation as the
creative center. The design center is the vision: a vehicle universe in which
continuity can move through rigs, people, worlds, relationships, wealth, and
social history.

### The larger model: a recovery constellation

Disablement should open a **recovery constellation**, not a single menu button.
The player chooses which kind of continuity to activate:

| Continuity layer | Player choice | What it expresses |
| --- | --- | --- |
| **Home authority** | Teleport/recall to Home Silo, reserve a 25% limp-home state, or return to a safe anchor | Home is a living operational base, not only a garage menu. |
| **Character agency** | Switch to a mechanic, scout, caretaker, or another rig/character who can reach the problem | The player owns a cast and can act through more than the currently disabled body. |
| **Social help** | Call an NPC, settlement crew, asynchronous helper, or multiplayer player | The world and its relationships respond to vulnerability. |
| **Economic agency** | Spend earned rescue charge, scrap, parts, or a service credit | Preparation creates options, but money does not erase consequence. |
| **Machine mastery** | Use a field-repair upgrade, diagnostic skill, autonomous repair system, or emergency mode | Progression changes what failure means rather than only raising stats. |
| **Physical consequence** | Leave the rig stranded, mark it, switch bodies, and undertake a real recovery | Failure produces a story and makes the fleet/world matter. |

These are composable. A player might teleport the human operator home, switch
to a mechanic character, spend one rescue charge to dispatch a drone, then drive
a reserve rig to tow the named machine. Another player might arrive directly in
multiplayer. A late-game owner might self-repair and never invoke the network.

### Option family A — teleport and recall

Teleportation should not be treated as one binary “cheat” button. There are
several distinct fantasies:

1. **Operator recall:** the human/player-character returns home, while the
   disabled rig remains in the world. This preserves the stranded-rig story
   and enables character switching.
2. **Rig recall:** the machine is pulled to Home Silo with a reserved 25% limp
   state. This is the reliable early-game safety line; it should leave a scar,
   cargo consequence, time cost, or rescue record.
3. **Anchor jump:** a discovered or upgraded Atlas/relay structure teleports
   the player or a selected vehicle between activated anchors. This makes
   infrastructure, exploration, and world repair prerequisites meaningful.
4. **Remote garage projection:** the home workshop temporarily projects a
   repair envelope, tether, drone, or service field to the disabled rig. The
   rig does not vanish; the player sees the home reach into the world.
5. **Emergency one-way extraction:** a rare consumable or high-level ability
   extracts the player, cargo, or rig separately. Each target has a different
   cost and consequence.

The strongest early form is probably **operator recall plus reserve 25% rig
recall**. It gives the player two radically different choices: preserve the
physical rescue story, or protect the session and accept a less rewarding
return. The strong late form is infrastructure-based anchor travel, because it
is earned by changing the world rather than granted as a generic fast-travel
button.

No Man's Sky provides a useful precedent for this distinction: Hello Games'
[Path Finder update](https://www.nomanssky.com/pathfinder-update/) introduced
Exocraft that could be summoned from constructed locations, and a later
[development update](https://www.nomanssky.com/2018/10/development-update-5/)
expanded that into planet-wide summoning stations and multiple owned vehicles.
The transferable idea is not “teleport everything”; it is **build the network
that makes recall possible**.

### Option family B — switch to another character or vehicle

The player's continuity should not end when the current body ends. Possible
forms include:

- switch from the disabled rig to a mechanic character at Home Silo;
- switch to an owned home rig and physically travel to the disabled rig;
- switch to a named settlement helper whose capability is repair, towing,
  scouting, or parts delivery;
- temporarily inhabit a workshop drone, remote scout, or “small body” rig to
  perform a limited rescue action;
- let a helper character arrive as an AI-controlled partner, then either keep
  controlling the helper or return control to the original rig after repair;
- switch to a stored rig at home while the disabled rig remains a persistent
  world object and future obligation.

State of Decay 2 is a useful precedent for the character layer: its [official
player guide](https://shared.steamstatic.com/store_item_assets/steam/apps/495420/manuals/PlayerGuide.pdf)
describes controlling a community, switching survivors, and using characters
with different skills. Its transferable lesson is that “the player” can be a
community-level identity while each body retains its own capabilities and
risks.

This is particularly aligned with Rigs Unbound's vision. The player does not
need a second identical truck. They need another **way to matter**: a mechanic,
a light scout, a drone, a friend, a settlement, or a machine with a different
body.

### Option family C — call help

Help can be graduated by relationship and technology:

| Helper | Availability | Possible result |
| --- | --- | --- |
| **Home caretaker** | Always available once the home is established | Gives advice, sends a weak tow, or authorizes reserve recovery. |
| **Named mechanic** | Relationship/settlement dependent | Repairs one component, prepares a service rig, or asks for a favor. |
| **Local crew** | Region infrastructure dependent | Arrives physically, changes the route, and remembers the rescue. |
| **Autonomous repair drone** | Upgrade/skill dependent | Limited remote repair with charges, cooldown, and failure risk. |
| **Async ghost/helper** | Social-history layer | Replays another player's rescue route or leaves a temporary aid cache. |
| **Live multiplayer player** | Co-op maturity gate | Joins, tows, repairs, escorts, or brings a complementary rig. |

Deep Rock Galactic offers a strong solo/co-op pattern: its solo helper Bosco
can be directed, assist with objectives, and revive the player; the helper is
replaced when another player joins, and revive capacity is limited and
upgradeable. See the [official Deep Rock Galactic wiki entry for
Bosco](https://deeprockgalactic.wiki.gg/wiki/APD-B317).

The transferable lesson is that “solo” does not have to mean “alone,” and the
helper can be a progression surface with limited charges and personality. For
Rigs Unbound, the helper could be a small repair rig, a named character, or a
remote workshop presence rather than a combat drone.

### Option family D — earned in-game rescue currency

The operator's “buy mana” idea is viable if it means **earned in-game rescue
capacity**, not a purchasable monetization currency. The vision currently
rejects purchased progression currency and treats Favor as relationship access
rather than a generic token. So the open design space is:

- **Rescue charge:** a bounded consumable earned through preparedness, service,
  or infrastructure work; spends on remote extraction or a mechanic call.
- **Relay fuel:** a physical resource that powers teleport/communication
  anchors; scarcity is geographic and visible.
- **Service credit:** a debt/credit relationship with a named workshop;
  calling help now creates an obligation or changes a future offer.
- **Emergency reserve:** a home-owned safety stock that refills slowly through
  care, not grinding; it can guarantee one return without becoming infinite.
- **Favor access:** not spent as a coin, but a relationship threshold unlocks
  a mechanic, loaner, or rescue route.

GTA Online demonstrates several separable service patterns in one product:
calling a mechanic for vehicle delivery, paying to release an impounded car,
and making an insurance claim for a destroyed insured vehicle. Rockstar's
[support documentation](https://support.rockstargames.com/articles/37542079096340/finding-your-lost-or-misplaced-vehicles-in-grand-theft-auto-online)
is useful because it shows that location, service, money, and replacement need
not collapse into one recovery action.

The Rigs Unbound version should make the choice legible: “Spend one Relay
Charge to bring the mechanic's field kit,” not “pay 200 coins to remove the
problem.” The former reinforces the world; the latter risks turning failure
into an administrative tax.

### Option family E — self-repair through advanced progression

Self-repair should be a new capability grammar, not passive regeneration.
Possible unlocks:

- **Field diagnosis:** identifies the failed component and exposes the cheapest
  viable repair path.
- **Limp-home protocol:** automatically preserves a minimum drive state once
  per expedition.
- **Patch bay:** converts carried scrap/parts into one temporary component.
- **Remote hands:** deploys a small repair drone while the player protects or
  powers it.
- **Adaptive machine learning:** the rig remembers recurring failures and
  reduces the cost/time of that repair, without eliminating the risk.
- **Self-healing material:** late Atlas technology repairs the body but creates
  a strange world signature, debt, or new machine behavior.
- **Redundant systems:** a player chooses which function survives disablement:
  movement, communication, cargo preservation, or extraction.

This lets advanced players solve failure through mastery while preserving early
players' need to build relationships and infrastructure. The best progression
does not make the recovery screen disappear; it changes which choices are
available and what they cost.

### Option family F — multiplayer and asynchronous rescue

Multiplayer should extend, not repair, the solo foundation. A disabled rig
could emit an SOS with:

- exact location and world conditions;
- needed capability: tow, parts, power, survey, or escort;
- whether the owner authorizes cargo movement or only repair;
- a reward/thanks contract that is not required for the helper to participate;
- a temporary shared-control or convoy permission;
- a durable rescue record in both players' machine histories.

Before live co-op, the same design can exist as asynchronous ghosts: another
player's recorded helper rig arrives as a route trace, leaves a cache, or
performs a bounded “echo tow” whose provenance is visible. Later live players
can occupy the exact same role with stronger agency.

### A worked failure sequence

The first rig, Torque, is disabled at Quarry Shelf during a storm:

1. The player sees the failure cause, current location, cargo state, and five
   available help paths.
2. They can spend a Relay Charge to extract only themselves to Home Silo.
3. At Home Silo, they switch to the mechanic character and choose either a
   remote repair attempt or a reserve rig.
4. If they have the reserve rig, they drive it to Torque and tow it back; if
   they have a live friend, the friend can join and provide a complementary
   rescue vehicle.
5. If they have the advanced Field Repair skill, they can instead return to
   Torque and repair the failed component in the field.
6. If they choose the reserve 25% Home Limp, Torque returns safely, but the
   cargo is left as a recoverable world obligation and the failure remains in
   the machine's passport.

There is no single “correct” option. The player chooses between speed,
resources, social obligation, physical risk, and preserving the original scene.

### Effective proposal for review

The design should preserve the following invariant while leaving the mechanism
open:

> **A disabled rig opens multiple continuity paths. At least one path is always
> available; later progression and social systems add more expressive paths.
> Teleportation, switching, help calls, rescue currency, self-repair, and
> physical recovery are all legitimate members of the same recovery grammar.**

The first playable does not need every path. It does need to establish that the
player has a home, a named machine, a possible helper, and a meaningful choice
when the machine cannot act.

## Addendum conclusion

The earlier proposed emergency-return path is now classified as **one member of
the recovery constellation**, not the product decision. The new unresolved
decision is the shape of the continuity network: how early the player can switch
bodies, whether the home reserve is a guaranteed 25% return, what resource
powers calls, how repair skills evolve, and when asynchronous/live help enters.

# Recovery Web and Player Continuity Design Space

- Date: 2026-07-29
- Status: Vision-led exploration, not an accepted implementation contract
- Scope: What can happen when the player's only active rig is disabled
- Related: [Game Design Spine](../design/GAME_DESIGN_SPINE.md), [Single-Rig Disablement and Recovery Exploration](SINGLE_RIG_DISABLEMENT_AND_RECOVERY_EXPLORATION_2026-07-29.md), [ADR-0048](../decisions/ADR-0048-single-rig-failure-recovery-and-continuity.md)
- Evidence ceiling: Tier 0 to Tier 2. Vision interpretation and proposals are not runtime proof.

## 1. The correction to the question

The useful question is not:

> What emergency button gets the player unstuck when the current rig stops?

It is:

> When one playable body fails, what other bodies, people, places, resources,
> relationships, and forms of agency can carry the player's continuity forward?

The distinction matters because the canonical vision does not define the player
as one truck. It defines an open vehicle universe in which vehicles are the
playable characters, while the player's identity persists across a fleet,
parts, worlds, relationships, wealth, creations, and social history. A disabled
rig is therefore a failure of one body, not necessarily a failure of the
player's ability to act.

The earlier recovery framing made the reserved 25% Home Limp look like the
center of the design. This document deliberately moves that idea back into a
larger design space. Home Limp, teleport, switching, help calls, rescue
capacity, mechanic service, and self-repair are not competing patches. They are
different expressions of one larger system: **the recovery web**.

## 2. The recovery web in one sentence

**A disabled rig should create a choice about which form of continuity the
player wants to invoke, not a binary choice between reload and reset.**

The player may continue as:

1. the same operator, moved somewhere safe;
2. the same rig, brought part-way or all the way home;
3. another rig with a different capability profile;
4. a character who can walk, repair, negotiate, scout, or call service;
5. a helper, drone, crew, ghost, or multiplayer partner;
6. a more advanced version of the disabled machine that has learned how to
   survive this class of failure;
7. a player who intentionally leaves the rig behind and turns the failure into
   a future expedition, debt, contract, scar, or world incident.

These are not merely convenience levels. They produce different stories,
risks, economies, and relationships.

## 3. Design principles from the vision

### 3.1 The rig is a body, not the entire self

The disabled rig should retain its identity, location, condition, cargo,
attachments, provenance, and history. The player should retain agency through
some other channel. This allows both halves of the promise to hold:

- the machine can be hurt and remain meaningful;
- the player can continue without being trapped by one failed body.

The most important sentence for future design reviews is:

> **The disabled rig is not the player. It is one body in the player's
> continuity.**

This does not require a conventional human avatar. In one campaign the next
body may be a mechanic. In another it may be a second truck, a tiny repair
drone, a submarine tender, a remote construction machine, or a friend who
answers an SOS.

### 3.2 Recovery should widen the game

The best recovery choice should reveal another layer of the universe:

- Home reveals the care network and reserve systems.
- A character switch reveals community and skill asymmetry.
- Another rig reveals fleet composition and complementary capabilities.
- A mechanic call reveals relationship, service, and obligation.
- Teleport reveals infrastructure, energy, and world topology.
- Self-repair reveals mastery and the machine's evolving identity.
- Leaving the rig reveals world memory and the value of returning.
- Multiplayer reveals social history and reciprocal rescue.

If every solution collapses into “press return to garage,” the universe is not
expressing itself at the moment where its persistence promise matters most.

### 3.3 No single economy should explain every rescue

The game design spine already separates wealth, parts, and relationship favor.
The recovery web should preserve that separation:

- **Scrap or parts** can repair or improvise.
- **Favor** can unlock access to a mechanic, loaner, tow, or route. It should
  not become a generic spendable mana bar.
- **Relay fuel** can power a physical teleport or communication anchor.
- **Rescue charges** can represent prepared emergency capacity.
- **Service debt** can make immediate help possible while changing a later
  relationship or contract.
- **Skill** can reduce dependence on external help without making failure
  disappear.

The player should understand what they are spending. “Buy mana” is a useful
intuition for a bounded emergency resource, but the diegetic form should tell
the player what the resource is and where it came from.

### 3.4 At least one path must always exist

The recovery web can be broad without making early progression depend on owning
multiple rigs. A one-rig player needs one guaranteed continuity path, but that
path does not need to be the best path. The safe invariant is:

> **Ordinary disablement cannot end a one-rig campaign, but every recovery
> method may still carry a visible cost, delay, obligation, risk, or loss of
> optionality.**

This is the floor, not the ceiling. The design should then add more expressive
paths as the player develops the home, relationships, fleet, skills, and social
reach.

## 4. A taxonomy of teleport and recall

“Teleport” is not one mechanic. The fiction and tradeoffs change depending on
what is transported.

| Variant | What moves | What remains at the failure site | Best use | Main risk |
| --- | --- | --- | --- | --- |
| Operator recall | The player's current consciousness or character | Rig, cargo, incident | Keep a session moving while preserving a rescue scene | Can feel like a menu escape if the site has no future consequence |
| Home Limp | The disabled rig travels under a strict reserve condition | Cargo, damage, or some incident state | Reliable early continuity and a meaningful safety setting | Can turn into a universal reset if its cost is invisible |
| Rig recall | The whole rig is extracted to an owned home or relay | Temporary world effects, lost time, optional cargo | Strong mid-game infrastructure reward | Erases geography if available everywhere |
| Anchor jump | Operator and rig use a built, powered world anchor | Anything outside the anchor's rules | Makes home and settlements strategically valuable | Requires clear limits and a believable network |
| Remote workshop projection | A drone, tool kit, or repair presence is projected | The rig and player location | Repair without moving the body | May solve too much if projection is unlimited |
| Vehicle summon | An owned or loaned rig is called to the operator | Original disabled rig | Fleet expression and complementary roles | Needs ownership, location, and exploit rules |
| Atlas transit | A late-world system moves bodies between worlds | World incidents according to campaign rules | Long-term universe-scale traversal | Too powerful for early geography and consequence |

The design can support several variants at once if each has a different
fictional source and cost. The player should not experience them as six names
for the same button.

### 4.1 The 25% Home Limp idea

The 25% reserve is compelling because it is not a free teleport. It says the
rig has a small protected margin reserved for the journey that keeps ownership
and agency intact. It can become:

- a literal battery or fuel reserve;
- a safety mode that disables tools and cargo handling;
- a home protocol that prioritizes survival over mission success;
- an emergency route whose cost is paid in time, wear, or reputation;
- a player-configurable care policy: reserve more for safety, less for
  performance.

The important design choice is what the 25% protects. Several legitimate
answers exist:

1. **Protect the rig:** it limps home, but leaves cargo or attachments behind.
2. **Protect the operator:** the operator returns, while the rig becomes a
   recoverable world object.
3. **Protect the mission:** the rig arrives, but the contract clock continues
   and the region changes.
4. **Protect the relationship:** a caretaker is called, creating service debt.
5. **Protect the future:** the reserve is consumed and cannot be used again
   until the player restores the home network.

The reserve becomes interesting when the player chooses what it protects. A
single universal outcome is less expressive than a safety policy attached to
the rig's build and the player's care philosophy.

## 5. Body succession: who can the player become next?

The player may begin with one rig and still have several possible bodies. Body
succession is not the same as “unlock a second truck.” It is the ability to
change the locus of agency.

### 5.1 Switch to a home character

The home may contain a mechanic, caretaker, farmer, dispatcher, cartographer,
or builder. Switching to that character can allow the player to:

- inspect the disabled rig remotely;
- prepare a field kit;
- negotiate with a settlement;
- authorize a loaner;
- walk to a nearby service point;
- operate a small tool or utility body;
- continue home, relationship, or crafting activities while the rig remains
  stranded.

This should not turn Rigs Unbound into a generic character RPG. The character
exists because the vehicle universe needs an embodied caretaker layer. Their
capabilities should point back to machines, places, and relationships.

### 5.2 Switch to another owned rig

When another vehicle is at home, the player can inhabit it and travel to the
disabled rig. The rescue rig should not be a duplicate. Its value comes from
complementarity:

- a light scout can reach the site but cannot tow;
- a heavy hauler can tow but cannot cross the narrow route;
- a utility rig can generate power or carry parts;
- a water, air, or tunnel body can reach a failure site the first rig could
  not;
- a cheap loaner can preserve agency while the named rig remains the story.

The rescue itself becomes a reason to own a diverse fleet. Fleet growth is no
longer only about collecting stronger vehicles. It is about expanding the
number of ways the player can respond to a crisis.

### 5.3 Switch to a small body or remote tool

The smallest rescue body may be a drone, crawler, tether, beacon, or workshop
projection. It can perform a narrow task:

- restart a system;
- deliver a fuse or patch;
- deploy a winch;
- mark the route for a later rescue;
- preserve cargo;
- connect the rig to a nearby relay;
- transmit a diagnosis to a mechanic.

This is a strong middle option because it gives the player something to do
without pretending that a disabled heavy rig is fully mobile.

### 5.4 Temporary loaners and borrowed bodies

An NPC, settlement, faction, or multiplayer partner may lend a rig. A loaner
should have its own identity and rules:

- it may be weaker or specialized;
- damage may be the player's responsibility;
- the owner may demand a favor or deadline;
- it may be unavailable if another crisis is active;
- returning it may be part of a future quest;
- it may create a relationship that survives the recovery.

The loaner should feel like trust made playable, not a free replacement body.

## 6. Help calls as a living service system

Calling help can be a menu interaction at first, but the long-term design
should make help a relationship and infrastructure system.

| Help source | What it represents | Immediate action | Durable consequence |
| --- | --- | --- | --- |
| Home caretaker | Baseline care and continuity | Gives a diagnosis or activates emergency policy | Home reserve is depleted or care relationship grows |
| Named mechanic | Skilled person with memory | Travels, repairs, tows, or sends a kit | Favor, debt, trust, or a new service route |
| Settlement crew | Place-level capacity | Dispatches a recovery vehicle | Settlement needs and road access change |
| Faction service | Institutional reach | Opens a route or supplies a specialized part | Reputation and obligations change |
| Autonomous helper | Earned technology | Performs a bounded repair or escort | Charges, wear, and upgrade choices change |
| Async ghost | Other player's recorded agency | Leaves a cache, route, or echo tow | Social history records a real rescue |
| Live player | Reciprocal human agency | Tows, escorts, supplies, or repairs | Shared rescue history and future trust |

The first option should be legible and reliable. The later options should be
more powerful or more expressive, not merely more expensive.

### 6.1 SOS design

An SOS should communicate more than “help me.” It can expose:

- location and terrain;
- failure type and required capability;
- weather and incident pressure;
- cargo sensitivity;
- what the owner authorizes;
- whether the helper can move the rig, cargo, or only parts;
- expected reward, thanks, or reciprocal obligation;
- a time window before the situation changes.

This creates a clear contract for NPC, async, and live assistance. The same
SOS object can mature from a local mechanic call into a cross-world
multiplayer rescue without needing a separate conceptual system.

### 6.2 Solo does not mean alone

The solo game can have helpers with personality, limits, and progression.
Deep Rock Galactic's Bosco is a useful precedent: a solo helper can perform
tasks and revive the player, has limited revive capacity, and is replaced by
human players when co-op begins. The transferable idea is not a combat drone.
It is a helper that preserves solo agency while leaving room for stronger
human collaboration later.

## 7. Rescue capacity and the “buy mana” intuition

The player's idea of buying mana is valuable because emergency power should be
something the player can choose to prepare, conserve, and replenish. It needs
careful framing so the resource reinforces the world instead of becoming a
generic failure tax.

### 7.1 Candidate resource forms

#### Relay Charge

A bounded charge stored by the home or carried by the operator. It powers a
short recall, a remote diagnostic, or an emergency call. It is earned through
maintenance, infrastructure, or exploration rather than purchased with a
premium currency.

#### Relay Fuel

A physical resource consumed by anchors and long-distance calls. It makes
teleportation geography-dependent. A remote settlement may have no fuel, while
a repaired relay corridor reduces the cost.

#### Service Credit

A workshop's willingness to help immediately. Calling in credit creates a
future obligation, unlocks a relationship branch, or delays another service.
This turns the rescue into social history.

#### Emergency Reserve

A home policy that guarantees one safe continuity action. It replenishes by
time, maintenance, settlement supply, or completing care work. It is a safety
net, not a grind target.

#### Favor Access

Not a coin. A relationship threshold that makes a mechanic, crew, or loaner
available. The player does not spend Favor in a generic shop. They have earned
the right to ask this person for something difficult.

### 7.2 What must not happen

- The only way to continue cannot be a resource that can be permanently
  exhausted.
- A player should not need to grind generic currency after every ordinary
  failure.
- A purchased or monetized currency should not be necessary to preserve a
  named rig's continuity.
- The resource should not silently erase cargo, history, or world state.
- The player should know whether they are spending fuel, trust, time, or
  future optionality.

### 7.3 A useful failure choice

The recovery prompt could present consequences in plain language:

> “Spend one Relay Charge: operator returns to Home Silo. Torque remains at
> Quarry Shelf with its cargo and storm damage.”

or:

> “Call Mara's crew: no charge, but you owe a service and the crew cannot
> answer the next settlement emergency.”

or:

> “Use Home Limp: Torque returns with 25% reserve consumed. Cargo is detached
> and becomes a marked recovery objective.”

The player is choosing which continuity layer to preserve.

## 8. Self-repair as machine identity and mastery

Self-repair should not be a hidden health regeneration system. It should be a
progression of ways the rig understands and reshapes its own failure.

| Capability | Player fantasy | Limit that keeps failure meaningful |
| --- | --- | --- |
| Field diagnosis | “The rig tells me what happened.” | Diagnosis does not supply parts or safety. |
| Limp-home protocol | “It can protect a tiny movement reserve.” | Tools, speed, cargo, or route options are restricted. |
| Patch bay | “I can improvise a temporary fix.” | Patch has wear, instability, or a later repair obligation. |
| Remote hands | “The rig can deploy a repair tool.” | Requires power, time, position, or protection. |
| Redundant systems | “My build planned for this failure.” | The player chooses which capability survives. |
| Adaptive memory | “This machine has learned my history.” | It reduces recurrence or cost, but does not guarantee success. |
| Self-healing material | “The machine is becoming something new.” | Late technology creates energy demand, side effects, or world attention. |

The progression is more interesting if it changes the decision surface rather
than simply raising a repair percentage. A novice asks for help. A caretaker
prepares. A master chooses which system to sacrifice. A late Atlas machine may
rewrite the rules, but that power should produce new obligations and mysteries.

## 9. Failure as a branch in the world, not a pause screen

Leaving a rig behind should be a valid choice. It can create:

- a stranded vehicle visible to the world;
- a future rescue contract;
- a cargo recovery route;
- a settlement asking why the player abandoned it;
- a storm, flood, or faction that changes the site before return;
- a machine scar that becomes part of its passport;
- a new shortcut discovered while rescuing it;
- a favor owed to the helper who eventually finds it;
- a choice to dismantle, transform, inherit, or rebuild the rig.

The player may still choose a fast safe return. The point is that the safe
return should be a world action with a result, not a deletion of the scene.

This aligns with the first-principles design direction that failure should
create a rescue operation, altered route, cargo or social consequences, scars,
favor owed, ecological change, alternate objective, or a hard choice. A reload
should not be the most attractive way to remove the story.

## 10. Multiplayer and asynchronous continuity

The recovery web should be designed for solo first and multiplayer later, but
not designed as two unrelated products.

### 10.1 Asynchronous rescue

Before live co-op is available, another player's prior action can appear as:

- a ghost route showing how to reach the site;
- a cached part or tool left at a relay;
- a recorded tow attempt with visible provenance;
- a named rescue note;
- a temporary helper rig that performs a constrained action;
- a route warning based on another player's incident.

The player still makes the decision and owns the consequence. The other player
adds a trace of human presence.

### 10.2 Live rescue

Later, a friend can answer the SOS with a complementary role:

- scout the route;
- bring power or parts;
- tow the named rig;
- protect a repair operation;
- carry cargo;
- negotiate with a settlement;
- operate a different vehicle body in the same incident.

The goal is not to require multiplayer for survival. It is to make the same
failure more social when another person is present.

### 10.3 Social memory

A successful rescue can persist as:

- a record in both machine passports;
- a named favor or future request;
- a settlement rumor;
- a visual marker at the site;
- a shared route improvement;
- a creator or community trace.

This is where a disabled rig becomes a source of social history rather than a
private error state.

## 11. Precedent research and transferable lessons

The following precedents are not templates to copy. They show that the design
space already has several proven shapes.

### No Man's Sky: summons are infrastructure and ownership

Hello Games' [Path Finder update](https://www.nomanssky.com/pathfinder-update/)
introduced Exocraft that could be summoned from constructed locations. A later
[development update](https://www.nomanssky.com/2018/10/development-update-5/)
described planet-wide summoning stations and multiple owned Exocraft. The
[Endurance update](https://www.nomanssky.com/endurance-update/?cli_action=1658378315.813)
later added freighter-based Exocraft summoning while the freighter is in the
system.

Transferable lesson: vehicle recall feels more meaningful when it is an earned
network built by the player, with ownership and geographic rules. The lesson
is not “make every vehicle summonable everywhere.”

### GTA Online: service, impound, and replacement are different actions

Rockstar's [vehicle recovery support guidance](https://support.rockstargames.com/articles/37542079096340/finding-your-lost-or-misplaced-vehicles-in-grand-theft-auto-online)
separates mechanic delivery, impound release, and insurance recovery. Its
[mechanic-service guidance](https://support.rockstargames.com/articles/6TVXdrdzZPNztlOSGWu1Y1/issues-accessing-the-mechanic-in-gta-online)
also shows that a recurring service fee can temporarily suspend access when
funds are unavailable.

Transferable lesson: “call help,” “retrieve a body,” “pay a debt,” and
“replace a destroyed body” should not be one undifferentiated button. Service
can be temporarily unavailable as a consequence, but the game still needs a
non-service continuity floor for a one-rig campaign.

### State of Decay 2: community identity survives body loss

The [official player guide](https://shared.steamstatic.com/store_item_assets/steam/apps/495420/manuals/PlayerGuide.pdf)
describes a community of survivors, switching between survivors, and distinct
skills and traits.

Transferable lesson: player identity can live at the community level while each
body retains its own capabilities, risk, and history. Rigs Unbound can use a
home, caretaker, or fleet as the continuity layer without reducing vehicles to
interchangeable tools.

### Deep Rock Galactic: solo helper becomes co-op space

The [Bosco entry on the official community wiki](https://deeprockgalactic.wiki.gg/wiki/APD-B317)
describes a solo helper that can perform tasks and revive the player, has
limited revive capacity and upgrades, and is replaced when another player
joins.

Transferable lesson: a solo helper can be useful, bounded, upgradeable, and
socially replaceable. This maps naturally to an autonomous repair rig or home
helper that yields space to a human partner without invalidating solo play.

### Fortnite: recovery can be a world object and a team action

Epic's [Reboot Van documentation](https://dev.epicgames.com/documentation/fortnite/reboot-van?lang=en-US)
describes a physical world object that brings eliminated teammates back into
play.

Transferable lesson: a recovery rule becomes more memorable when the player
must reach and use a place, rather than invoke an abstract menu. Rigs Unbound
can make relays, garages, depots, and workshops part of the recovery web.

### Pacific Drive: the car is a relationship, not a disposable mount

Ironwood's [official gameplay discussion](https://blog.playstation.com/2023/02/09/ironwood-studios-returns-with-a-first-look-at-the-gameplay/)
and [launch gameplay-loop discussion](https://blog.playstation.com/2023/11/30/unravel-the-gameplay-loop-of-pacific-drive-launching-on-ps5-feb-22/)
frame the car, garage, repairs, and preparation as the core relationship.

Transferable lesson: recovery can reinforce attachment when preparation and
repair are part of the journey. For Rigs Unbound, the broader vehicle universe
means the relationship can eventually branch into helpers, bodies, and social
history rather than staying only between one driver and one car.

## 12. Worked scenarios beyond the current runtime

These are design scenarios, not claims that the current game implements them.

### Scenario A: the first rig and a dead battery

The player's only rig loses power at Quarry Shelf. Home Silo is beyond the
safe route.

1. The rig enters a visible disabled state and explains the failure.
2. The player can recall the operator, preserving the rig and cargo at the
   site.
3. At Home Silo, the player can become the caretaker, prepare a battery pack,
   or ask a named mechanic for a field call.
4. If the player has a small utility body, they can send it to the relay.
5. If the player has Home Limp configured, they can spend its reserved 25%
   and choose what is left behind.
6. The world remembers the incident even if the player chooses the fast route.

The opening is still playable with one rig. It is not limited to one kind of
agency.

### Scenario B: the second rig is a specialist, not a replacement

The player owns a light scout at home. The named hauler is disabled in a
marsh. The scout can reach the hauler, but cannot tow it. The player chooses
between:

- scouting a safe tow route;
- finding a settlement crew;
- carrying a part that enables field repair;
- leaving the hauler until a heavy recovery rig is available;
- calling a friend with a complementary body.

The second rig makes the world more legible and creates a new decision. It does
not erase the first rig's history.

### Scenario C: service debt becomes a relationship

The player's emergency reserve is empty. A mechanic still answers because the
player previously helped restore the mechanic's workshop. The mechanic tows
the rig, but asks for priority on the next relay repair. That obligation can
change which route opens first in the next region.

This is stronger than a generic currency sink because the rescue reveals what
the player has built socially.

### Scenario D: mastery changes the failure shape

The rig has Redundant Systems II. The player can preserve movement, cargo, or
communication, but not all three. They sacrifice cargo refrigeration to keep
the engine alive. A later quest is shaped by the spoiled cargo, while the rig
returns under its own power.

The upgrade does not remove failure. It lets the player author the scar.

### Scenario E: asynchronous rescue arrives from the future

Another player's ghost has already repaired the old relay and left a cache at
the edge of the storm. The current player can follow the trace, but the cache
contains only one part. They must still choose whether to repair, call home, or
leave the rig. The social layer adds possibility without guaranteeing a
perfect outcome.

## 13. Candidate recovery grammar

For future design and implementation reviews, model every recovery choice with
the same fields:

| Field | Question |
| --- | --- |
| Continuity target | What is being preserved: operator, rig, cargo, mission, relationship, or world access? |
| Acting body | Who acts next: original rig, character, reserve rig, helper, ghost, or player partner? |
| Transport | What moves, if anything? |
| Authority | Who is allowed to move, repair, borrow, or alter the rig? |
| Cost | What is spent: time, fuel, parts, charge, favor, debt, risk, or future access? |
| Consequence | What remains changed in the world, machine passport, cargo, or relationship? |
| Availability | Is it baseline, home-gated, skill-gated, relationship-gated, fleet-gated, or social? |
| Failure of recovery | What happens if the helper, route, resource, or repair also fails? |
| Visibility | How does the player understand the result and find the next action? |

This grammar is intentionally broader than the current recovery command. It is
a design tool for preventing future systems from treating every rescue as the
same teleport.

## 14. Proposed constellation, not final decision

The most promising long-term shape is a layered recovery constellation:

### Baseline, before a fleet exists

- a guaranteed operator continuity path;
- a home caretaker or equivalent voice of agency;
- a visible disabled-rig record in the world;
- one bounded emergency policy, potentially the 25% Home Limp;
- a clear choice about what is preserved and what is left behind.

### Early growth

- named mechanic or settlement service;
- a small repair or relay body;
- field diagnosis and one limited self-repair capability;
- earned emergency reserve or relay charge;
- recovery incidents that become contracts or relationships.

### Fleet growth

- complementary rescue rigs;
- loaners and borrowed bodies;
- home and regional anchor networks;
- specialized towing, power, air, water, or scout roles;
- vehicle passports that record who rescued whom.

### Social growth

- async traces and ghost help;
- live SOS with capability contracts;
- shared convoy rescue;
- co-op authority rules for cargo and named rigs;
- reciprocal social history.

### Mastery and late universe

- advanced redundant systems;
- adaptive machine memory;
- self-repair with side effects;
- cross-world relay infrastructure;
- Atlas-level transportation that introduces new world-scale decisions.

The key is not to promise every layer in the first campaign. The key is to
ensure the first campaign establishes the correct ontology: the player is part
of a living continuity network, and a disabled rig is a meaningful node in that
network.

## 15. Open questions for discussion

These are the decisions still requiring operator choice, not hidden assumptions:

1. Does the baseline guaranteed path move the operator, the rig, or both?
2. Does Home Limp protect the rig, the operator, cargo, or a chosen policy?
3. Is 25% a literal fixed reserve, a configurable safety policy, or an early
   teaching number that later becomes data-driven?
4. Is the first non-rig body a named character, a drone, a temporary loaner,
   or a remote home interface?
5. Should a mechanic call create debt, consume a charge, require Favor access,
   or combine those conditions?
6. What is the smallest meaningful self-repair capability that feels like
   mastery rather than passive regeneration?
7. Can the player leave cargo behind as a recoverable objective, and what
   kinds of cargo can safely become world incidents?
8. Does a multiplayer SOS authorize towing, cargo movement, or only assistance
   until the owner explicitly grants more authority?
9. Which recovery choices preserve the failure site exactly, and which create a
   new world state?
10. What does true total loss mean in a universe where vehicle identity and
    history are central?

## 16. Current recommendation for the design discussion

Do not select “teleport” or “25% Home Limp” as the whole solution. Select the
following product-level rule first:

> **When a vehicle-character is disabled, the player can continue through a
> recovery web of bodies, helpers, infrastructure, resources, skills, and
> social relationships. The web always has one safe floor, while progression
> determines how much agency, speed, preservation, and expression the player
> has. The disabled rig remains part of the world unless the campaign
> explicitly defines another outcome.**

Then prototype or document individual members of the web against that rule:

- Home Limp tests the safe floor and consequence communication.
- Teleport tests infrastructure and world topology.
- Character switching tests body succession.
- Reserve rigs test fleet complementarity.
- Mechanic calls test relationship and service economy.
- Rescue capacity tests preparedness and resource legibility.
- Self-repair tests machine mastery.
- Async and live help test social history.
- Leaving the rig tests persistent world consequence.

This is the vision-led expansion. The current runtime can later select a first
slice, but it should not define the universe's answer before this design space
is accepted or deliberately narrowed.


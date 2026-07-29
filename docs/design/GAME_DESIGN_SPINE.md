# Rigs Unbound — Game Design Spine

- Status: **Canonical — accepted via operator sign-off on [ADR-0040](../decisions/ADR-0040-open-vehicle-universe-and-design-spine-hierarchy.md) (2026-07-29)**; operator condition: existing work is updated in place, never deleted
- Date: 2026-07-29
- Owner: project owner (Pranay); lead-design synthesis by agent session
- Role: this is the single authoritative whole-game design surface. Exploration
  docs feed it; execution packages serve it; it does not grow past ~700 lines.
  When a section needs more depth, the depth goes into a linked artifact and
  this file keeps only the decision.

## 0. Why this document exists

Two independent reviews (2026-07-29) reached the same conclusion the
reachability audit supports numerically: the repository behaves like an
engine-research project, not a game studio. It has mission *plumbing* without
quests, world *substrate* without a world, and a vision ADR (ADR-0029) that is
narrower than the vision the operator pitched. Measured state at time of
writing:

- 25 unreachable modules (1,836 lines) of tested gameplay no player can touch;
- last 60 commits: 41 docs, 13 chore, 4 feat, 2 test;
- no authoritative story, quest, exploration, or marketplace architecture.

This spine corrects both failures: it restores the **broad ontology** the
operator pitched, and it binds design directly to the runtime that already
exists so the next work is wiring and content, not more contracts.

## 1. Canonical vision

> **Rigs Unbound is an open-world vehicle universe where vehicles are the
> playable characters.** Players acquire, build, restore, customize, and
> transform a fleet across many worlds, scales, stories, mechanics, economies,
> and social structures — without ever losing ownership, history, or agency.

The persistent identity of the game is **not one machine, one region, or one
theme**. It is the player's continuity across everything they touch.

### The persistence ladder

Persistence lives at explicit levels, each with its own rules:

| Level | What persists | Authority |
| --- | --- | --- |
| Player | identity, mastery, records, reputation aggregate | account/save |
| Fleet | garage roster, fleet history, berths | save schema |
| Vehicle | condition, provenance, scars, tuning, story flags | `VehicleInstance` |
| Parts | provenance, compatibility, storied components | inventory + provenance register |
| Worlds | discovered regions, routes, region-state deltas | world-memory / save deltas |
| Relationships | characters, factions, favor | Favor state |
| Wealth | Scrap, Parts stock, future exchange balances | economy state (server-authoritative when shared) |
| Creations | blueprints, liveries, shared packs | creator manifest |
| Social history | ghosts, traces, co-op records | deferred until authority exists |

A vehicle may stay with the player for years, be rented for one race, be built
from scrap, traded, transformed, destroyed, inherited, or left behind in
another region. The systems must allow all of these; individual campaigns may
restrict them for their own fiction.

Rigs are persistent characters — names, histories, scars, and builds belong
to the player's instances, not to the catalog — but the game is **not one
genre**, not even "RPG". The RPG comparison covers only the persistence and
identity model. The same tractor that ploughs the valley today can later
race, defend the fields from zombies at night, appear in a top-down mode, or
anchor a gameplay style that doesn't exist yet — and because different
players upgrade, mod, and customize the same rig differently, their builds
can unlock different quests, discoveries, and modes. Over its life the game
admits the full vocabulary of the medium — open-world traversal, questing
and relationships, shooter and combat modes, racing, tower defense,
construction, simulation — as activities, modes, and campaigns, provided
each enters through the pillars in §2 and declares itself per the activity
grammar. Rigs are also not limited to real-world machines: anything at all
can be a rig if it passes the "real gameplay body" pillar.

## 2. Pillars — coherence from systems, not one theme

Earlier docs prevented feature soup by imposing one emotional center
(machine-keeper stewardship). That is now **one campaign's tone**, not the
game's constitution. What actually keeps Rigs Unbound one game:

1. **Vehicles are real gameplay bodies.** Every vehicle has locomotion, tools,
   constraints, condition, and customization. Never a cosmetic skin.
2. **Capability contracts are universal.** Worlds expose interactions through
   the same capability/verb grammar (ADR-0006); a hybrid is a validated
   composition, not stat soup.
3. **Persistence is explicit.** Everything durable maps to a level of the
   persistence ladder with named rules. No hidden state.
4. **Activities declare themselves.** Every mode/activity declares mechanics,
   rewards, authority, camera/control changes, and compatibility (the
   genre-transition contract in the Exploration Map stands).
5. **Everything is inspectable.** Any world or mode can be validated, saved,
   replayed, and eventually shared. (This is what the replay/ledger work was
   always *for*.)

A farming system and a top-down alien firefight can coexist under these
pillars without pretending to express the same moral argument.

## 3. World architecture — a world of worlds

"Open world" does not mean one specific world. The connected-region graph
remains the **first implementation**, not the topology ceiling.

Supported world classes (design-level; each gets an implementation gate):

- **Persistent open regions** — the current home-county graph (`home-farm`,
  `sunken-flats`, `launch-ridge`, `marsh-depot` already exist in the runtime);
  later: cities, deserts, oceans, industrial zones, alien terrain.
- **Nested spaces** — barns, garages, tunnels, factories, interiors.
- **Scale transitions** — toy-scale rooms, normal scale, machine-interior
  scale. Rare, earned, and validated (floating-origin work already anticipates
  this).
- **Procedural frontiers** — seeded expedition regions compiled through the
  existing WorldRecipe → WorldManifest contract.
- **Authored campaigns** — bounded story worlds (see §4).
- **Multiplayer territories** — shared spaces, gated behind the authority
  ladder (§8).
- **Creator worlds** — validated data-only packs first (existing UGC ladder).

Connection grammar: roads, portals, transport networks, contracts, dreams,
simulations, or plain menus **where the fiction doesn't need continuity**.
Requiring every transition to be diegetic is itself a scope trap; the
genre-transition contract governs *quality* of transitions, not their fiction.

## 4. Story architecture — plural, layered, never one canon too early

Story is a layered system. No single premise owns the universe.

| Layer | Scope | Example |
| --- | --- | --- |
| Universe mysteries | optional connective tissue across worlds | the buried Atlas signal |
| Campaigns | authored arcs for one world/era | Living Atlas Odyssey; zombie city; toy-scale metropolis |
| Regional arcs | places and factions changing over time | reopening the valley relay routes |
| Vehicle stories | individual machines' histories | the old man's tractor |
| Character/faction quests | people who ask, remember, and change | the old man's trust |
| Side quests | local, optional, consequential | Water Before Night |
| Procedural contracts | generated from world state | current mission propositions |
| Emergent incidents | systems colliding | storm + landslide + stranded hauler |
| Creator campaigns | validated packs | deferred per UGC ladder |
| Sandbox | no mandatory story | always legal |

### Campaign candidate registry

All previously "umbrella" narratives are demoted to **campaign candidates**:

| Candidate | Source | Status |
| --- | --- | --- |
| Living Atlas Odyssey / machine-keeper | ADR-0029, LONG_TERM_GAME_DESIGN | Candidate — tone anchor for Campaign One |
| Sleeping Atlas premise | first-principles docs | Candidate — universe-mystery layer, optional |
| Stranger at the Silo | STRANGER_AT_THE_SILO exploration | Candidate opening — adopted by the first playable (§10) |
| Zombie outbreak / city racing / corporate logistics / fantasy machine realm / interplanetary fleet / toy-scale metropolis | operator pitch, wide-open brainstorms | Backlog candidates — no design debt until picked |

A player might begin lost at the old man's farm — or, in later products, as a
toy car in a bedroom, in an illegal street race, or restoring a scrapyard
spaceship. The universe does not pick one forever; **the first playable picks
one now** (§10).

## 5. Quest architecture

The runtime already has the transaction layer (mission-propositions →
mission-lifecycle → idempotent rewards). What it lacks is meaning. Quests are
a **semantic layer over the existing lifecycle** — one authority, extended,
never a parallel system (per the no-duplicate-routes rule).

Every quest declares:

- **Giver** — a character, faction, place, or the world itself;
- **Stakes** — why it matters; which layer of §4 it advances;
- **Class** — `main | side | local | hidden | repeatable | emergent`;
- **Prerequisites** — quest graph edges (discoveries, capabilities, favor,
  world state), replacing today's implicit "capability validation only";
- **Branches** — decision points with distinct outcomes;
- **Consequences** — world-memory deltas, relationship deltas, unlocks, and
  *closures* (what an outcome makes impossible);
- **Memory** — the one sentence the player should remember afterwards.

Implementation posture: extend `MissionProposition`/`mission-lifecycle` with
`class`, `giverId`, `prerequisites`, `outcomes[]`, and route consequences
through `world-memory.ts` (currently unreachable — this is what wires it).
Single active *main* quest, multiple concurrent side/local quests: this needs
the exclusivity rule in `mission-lifecycle.ts` relaxed per class, not a second
lifecycle.

## 6. Exploration architecture

Exploration is a designed experience, not a byproduct of terrain:

- **Landmark hierarchy** — horizon anchors (silo, ridge, pylons) → regional
  landmarks → local secrets. Every region ships with all three tiers.
- **Map revelation** — `topo-map.ts` + `minimap` unify: the map is earned by
  travel and surveying, not pre-revealed. Rumor graph nodes
  (`rumor-graph.ts`, already reachable) are the discovery log — no quest-log
  spam, no completion percentages.
- **Rumors and signals** — `radio-scanner.ts` and `seismic-probe.ts` (both
  currently unreachable) become the in-fiction discovery instruments.
- **Secrets and locked routes** — visible-but-unreachable places that name
  their missing capability (`campaign.ts` already models this: Launch Ridge
  wants `jump`, Marsh Depot wants `ford`). This is the open-world promise
  mechanic: the world opens as a network of reasons to travel.
- **Revisit incentives** — region-state change (seasons, water, repairs
  holding or failing), returning characters, and world-memory echoes of the
  player's own past actions.
- **No marker spam** — curiosity-driven navigation via the compass strip,
  directional audio, and landmark reads (accepted anti-pattern guard stands).

## 7. Progression, customization, economy, marketplace

Progression (Journey / Verb Mastery / Insight, capability-shaped, ADR-0018,
ADR-0036) is the strongest existing area and **stands unchanged**.
Customization (hardpoints, modules, tuning, provenance, visible scars) stands
and is consumed by the first playable's customization decision.

Economy completes the missing loops:

- **Scrap** — earn from salvage/contracts; spend on repair, parts, services.
- **Parts** — concrete inventory with provenance; `salvage-crafting.ts` and
  `workshop-lab.ts` (unreachable) are the crafting/service backends.
- **Favor** — accrues from quest outcomes and relationship choices; spends as
  *access* (routes, services, loaners, information), never as currency.
- **Insight** — unchanged; discovery-driven revelation.

### Marketplace — four separate decisions, staged

| Decision | Stance | Gate |
| --- | --- | --- |
| NPC shops, workshops, barter | **Build early** — it's a service loop, not an economy risk | first playable+1 |
| Creator marketplace (contracts, region packs) | Design after authored grammar works | UGC ladder step 4 |
| Player-to-player trading | Deferred until server authority, escrow, fraud, duplication, recovery are solved | authority ladder |
| Commercial store (cosmetics/expansions) | No progression or statistically superior rigs, ever; otherwise a product/legal decision | operator decision |

"Do not implement unsafe economies prematurely" replaces any implication that
the game *should not contain markets*.

### Monetization (business model) — operator direction 2026-07-29

Sequencing law: **it has to become a fun, playable game first.** The wow is
surprise unlocks, new gameplay designs, new characters — never a storefront.
Monetization is a design lane that must not shape moment-to-moment play, and
anything in legal grey territory (gambling-shaped mechanics, paid randomness,
lootboxes) is out entirely.

| Model | Stance | Reasoning / gate |
| --- | --- | --- |
| Premium sale (Steam, itch.io) | **Primary — recommended** | Pay once, own the game. The free browser build becomes the demo/discovery funnel for the paid desktop build. Gate: first playable proven fun. |
| Campaign expansions / region packs | **Recommended long-term** | New worlds, campaigns, rig classes as paid content — sells *more game*, never *better numbers*. |
| Cosmetics / liveries / supporter pack | Allowed, optional | Safe everywhere; only if it doesn't dilute earned visual history (scars and provenance stay earned-only). |
| Purchased soft currency | **Rejected in current form** | If bought currency buys the same things earned currency buys, it is selling progression with one extra step — and it pressures earn-rate tuning toward frustration. Revisit only as a cosmetic-only currency. |
| Engineered scarcity ("hard to earn so buying is tempting") | **Rejected — named trap** | The studio would profit from player frustration; violates the existing dark-patterns-never guard. Scarcity may serve *design* (meaningful choices), never *sales*. |
| Diegetic in-world ads (billboards, signage) | Deferred candidate | Real model (racing games do it) but needs audience scale, ad-network and legal review, and per-campaign fiction fit; never in quest-critical sightlines. Not worth design cost pre-audience. |

The "never sell power/progression/statistically superior rigs" line stays,
reaffirmed by the operator with this fuller model around it: the game makes
money by selling the game, more of the game, and optional appearance — not by
selling relief from friction.

### Platform posture — web tech ≠ "browser game"

The runtime is TypeScript/Three.js. That is a *technology*, and the browser
is one *distribution channel* for it. The strategy:

- **Browser** — the free opening slice: instant, link-shareable, the demo
  funnel. It is allowed to be scoped like a demo.
- **Steam desktop** — the same codebase in a desktop shell (Tauri or
  Electron), with the signals that separate "real game" from "browser game"
  in players' eyes: native fullscreen, gamepad, Steam achievements + cloud
  saves via Steamworks, offline play, fast load, no jank. Precedent:
  Vampire Survivors and CrossCode shipped web-tech on Steam to enormous
  success; players never knew or cared.
- **The ceiling hedge already exists** — ADR-0001's headless gameplay kernel
  keeps simulation renderer-independent. If the game ever outgrows web tech
  (console ports, extreme simulation scale), the port swaps the shell, not
  the game. Consoles are the one channel web tech does not reach directly;
  that is a far-future port decision, not a current constraint.

## 8. Multiplayer, social, creators

Multiplayer is **first-class in the vision, gated in execution** — the
existing maturity ladder (local determinism → async ghosts/traces → small
co-op → shared regions) and authority contract stand as the implementation
sequence, not as a philosophy of exclusion. `ghost.ts` (unreachable) is
retained explicitly as the async-multiplayer seed. Design exploration for
co-op convoys, crews, shared garages, and creator sharing proceeds on paper in
parallel with solo execution; nothing multiplayer enters the runtime before
replayable local truth (already the ladder's rule).

## 9. Vehicle continuity models

"Same vehicle, many games" is **one continuity option**, not a law:

1. same canonical vehicle across genres (the current experiment);
2. fleet persists, vehicles are world-specific;
3. temporary loaners (already Proposed in the Exploration Map);
4. transformation classes;
5. player-built hybrids;
6. disposable/consumable vehicles;
7. shared multiplayer vehicles.

Each campaign declares which models it uses. Campaign One uses (1) + (3).

## 10. The next playable proves the game, not another subsystem

Adopted slice: **The Road That Was** — the integrated opening built from
Stranger at the Silo. Full specification with module-by-module runtime binding:
[First Playable — The Road That Was](FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md).

It must contain, in one continuous play session: a main quest, two side
quests, optional exploration with a mystery, one consequential customization
decision, world-state memory, economy touchpoints, and the ridge-top
open-world promise. It consumes at least 12 of the 25 unreachable modules or
explicitly re-archives them with a named future home.

## 11. Studio operating model (how this repo works from now on)

1. **Definition of done = player-reachable.** A system that isn't reachable
   from an entry point is design debt, tracked by the reachability budget. The
   budget only goes down.
2. **Doc budget.** Design work lands in this spine (bounded), the slice spec,
   or an ADR. New standalone exploration docs require a named consumer.
   Target commit mix: feat+test ≥ docs, measured on the same 60-commit window
   that currently reads 41:6.
3. **Content cadence.** Every tranche ships something a player can *do*, not
   only something an auditor can verify.
4. **Vision hierarchy.** Canonical vision (§1) → campaign candidates (§4) →
   slices (§10). Technical contracts serve slices; they do not redefine the
   ontology by accretion.

## 12. Operator decisions

Resolved 2026-07-29:

1. **ADR-0040 accepted** by explicit operator sign-off, with the condition
   that prior work is updated in place, never deleted.
2. **Rig naming is player-authored — rigs are the persistent characters.**
   "Torque" is *one player's* name for their tractor (today it sits as
   a static default in `RIG_PROFILES["utility-tractor"].fieldName`; design
   direction is to move the display name to the vehicle level of the
   persistence ladder, per save). In-fiction rule for Campaign One's opening:
   the machine starts nameless, and *the stranger* names it only after caring
   for it — once it runs and starts genuinely helping the old man. The naming
   beat is a designed moment where the player enters a name, with Torque as
   the authored suggestion. Every subsequently acquired rig is nameable the
   same way; later campaigns may vary the ritual, never the ownership of the
   name.
3. **Viewport priority: desktop and tablet sizes first.** Compact/mobile
   exposure (including the contract-board trigger) is explicitly deferred;
   mobile support resumes as its own package after the first playable proves
   the game at desktop/tablet sizes. The existing compact status hints remain
   but carry no parity promise yet.

4. **Monetization direction set (2026-07-29).** Premium-first (Steam/itch)
   with the browser build as the free demo funnel; expansions later;
   cosmetics optional; purchased currency and engineered scarcity rejected;
   diegetic ads a deferred candidate. Full model and reasoning in §7
   "Monetization". Remaining open specifics: launch pricing, which storefront
   ships first, and whether cosmetics exist at 1.0 — none block engineering.

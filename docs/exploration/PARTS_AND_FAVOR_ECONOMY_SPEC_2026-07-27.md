# Parts and Favor Economy Spec — 2026-07-27

Status: **exploration / proposed spec; operator review required**  
Related: [ADR-0018](../decisions/ADR-0018-journey-mastery-insight-progression-spine.md) (progression spine), [ADR-0029](../decisions/ADR-0029-product-vision-machine-keeper-odyssey.md) (product vision), [Core Loop and Progression Contract](../research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)

## Purpose

This document proposes concrete accrual and spend loops for **Parts** and
**Favor**, the two progression axes that ADR-0018 deliberately left
under-specified. It does not mandate implementation; it gives the Farmfall slice
and later economy work a shared vocabulary and a first set of bounded hypotheses
 to test.

## Resource grammar (recap)

| Resource | Kind | Spendable? | Accrues from | Spent on |
| --- | --- | --- | --- | --- |
| **Scrap** | soft liquidity | yes | salvage, broken parts, small jobs | ordinary repair, fabrication, fuel |
| **Parts** | concrete inventory | yes (as objects) | salvage sites, rescue, trade, dismantling | module fitting, replacement components, upgrades |
| **Favor** | relationship state | **no** | helping inhabitants, completing contracts, keeping promises | access, trust, loaners, blueprints, services |
| **Insight** | knowledge | no | discovery, surveying, experimentation | reveals possibilities; gates content |

## Parts loop

### What a Part is

A Part is a concrete inventory object with:

- **function** — what verb or stat it affects (e.g., "hauling hitch",
  "plough blade", "cooling exchanger"),
- **compatibility** — which rig(s) or socket(s) it fits,
- **condition** — wear state that affects performance and repair cost,
- **provenance** — where it came from (salvage ID, NPC, trade, fabricated),
- **traits** — optional modifiers (lightweight, rugged, salvaged, standard,
  strange).

Parts are not a numeric currency. A player has "two broad plough blades
(salvaged, 67%)" and "one standard hitch (new, 100%)", not "45 Parts."

### First-playable Parts loop (Farmfall)

1. **Salvage** — drive to off-track salvage nodes, recover with the winch or
   cargo bed, and haul back to Home Silo.
2. **Bank / identify** — deposit at the silo. Basic scrap is immediately
   liquid; unknown Parts require a survey/inspection step (could be a workshop
   action or a simple "identify" interaction).
3. **Fit or store** — take a Part to the workshop and fit it to a compatible
   rig. Fitting consumes the Part and may require Scrap for mounting labor.
4. **Use and wear** — Parts degrade with use. Worn Parts can be repaired for
   Scrap or replaced.
5. **Dismantle** — unwanted or broken Parts can be broken down for Scrap plus a
   small chance of a reusable component.

### Design constraints

- No generic "Parts" number in the HUD. The player sees named items in a small
  workshop inventory.
- Important modules should come from specific stories, not a shop catalog
  (per `TRACTOR_RESTORATION_AND_MODULAR_GROWTH`).
- The first loop should expose only 3–5 distinct Parts so the player learns the
  grammar without inventory sprawl.

### Hypotheses to test

- Players understand that Parts are objects, not currency.
- Identifying an unknown Part feels rewarding rather than tedious.
- Wear creates meaningful repair decisions rather than nagging.

## Favor loop

### What Favor is

Favor is **relationship state**, never a spendable token. It is tracked per
inhabitant, faction, or place. It unlocks access and options; it is not
"consumed" when used.

### First-playable Favor loop (Farmfall)

1. **Contract** — an inhabitant or place signals a need (e.g., "Clear the
   drainage channel before the storm").
2. **Perform** — the player uses rig verbs to address the need.
3. **Acknowledge** — the inhabitant recognizes the deed. Favor increases.
4. **Unlock** — at thresholds, new contracts, loaner rigs, blueprints, or
   services become available.
5. **Break / neglect** — failing a contract or ignoring a promise can lower
   Favor and close previously unlocked options.

### Favor presentation

- No global "Favor: 120" number. The player sees relationship states:
  "Home Valley wary," "Meadow Workshop grateful," "Overland Freight neutral."
- Unlock thresholds are visible as named tiers (e.g., "distrustful → neutral →
  trusted → bonded").
- Favor changes are communicated through world feedback, not toast spam:
  a repaired pump now runs, a workshop owner waves, a previously closed gate
  opens.

### Design constraints

- Favor cannot be farmed by repeating the same trivial action; it accrues from
  completed contracts and consequential help.
- Favor is not a currency gate for Parts. A grateful NPC might give a Part or
  blueprint, but the player cannot "spend" Favor to buy one.
- Broken promises should be recoverable through later deeds, not permanently
  locking content.

### Hypotheses to test

- Players understand Favor as reputation, not currency.
- Named relationship tiers feel more meaningful than a number.
- Favor unlocks create anticipation rather than checklist pressure.

## Parts × Favor interaction

| Scenario | Parts change | Favor change |
| --- | --- | --- |
| Recover salvage for self | +Parts | none |
| Recover salvage for inhabitant | +small Parts or Scrap | +Favor |
| Repair community pump using own Parts | -Parts | +Favor |
| Sell salvaged Part to trader | -Part, +Scrap | depends on trader relationship |
| Borrow a rare Part from trusted NPC | temporary Part | consumes/trust threshold |
| Dismantle a storied Part | +Scrap | possible -Favor if the Part had provenance |

## What this spec does not decide

- Exact inventory UI layout and capacity limits.
- Whether Parts have physical presence in the world or are abstracted once
  banked.
- The full set of Parts for the Farmfall slice (that belongs in the slice plan).
- Cloud/ multiplayer implications (Favor is local-first until auth/economy ADRs
  close).

## Validation plan

- Simulated-player tests: can a fresh player explain the difference between
  Scrap, Parts, and Favor after one session?
- Anti-grind tests: repeating the same salvage run does not generate unbounded
  Favor or rare Parts.
- Save/load tests: Parts inventory and Favor state round-trip correctly under
  schema v7.
- Acceptance test: a player can complete one "help an inhabitant" loop and see
  a Favor unlock lead to a real new option.

## Anything else?

Yes. This spec intentionally keeps the economy **small and legible** at the
start. The long-term horizon allows more complex flows (inter-region trade,
fleet logistics, communal projects), but the first loop must prove that the
basic grammar is comprehensible before any layered economy is added.

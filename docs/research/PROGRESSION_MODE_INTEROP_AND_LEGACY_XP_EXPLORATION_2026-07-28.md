# Progression Mode Interoperability and Legacy XP Exploration

Date: 2026-07-28  
Status: Supporting implementation-boundary note; canonical exploration is [Progression Model Coexistence and Composition](../exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md)  
Related: [ADR-0018](../decisions/ADR-0018-journey-mastery-insight-progression-spine.md), [ADR-0033](../decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md), [canonical coexistence exploration](../exploration/PROGRESSION_MODEL_COEXISTENCE_AND_COMPOSITION_2026-07-28.md), [legacy XP design](../systems/PROGRESSION_SYSTEM.md)

## Executive decision

Rigs Unbound's campaign keeps the capability-shaped progression spine as its only authoritative progression model:

- per-rig Journey;
- per-rig, per-verb Mastery;
- profile-level Insight.

The older XP/level/rung/restoration design remains valuable, but it is not a second campaign authority. It may be used as a derived presentation, a mode-local score, a bounded legacy import surface, or a future game's primary progression model when that mode explicitly opts in.

This preserves the player's durable relationship with machines while allowing other game modes to use the clarity and pacing benefits of XP without importing universal power into the campaign.

## Why not combine them into one score?

The two models answer different questions:

| Model   | Question answered                                                | Authority                                |
| ------- | ---------------------------------------------------------------- | ---------------------------------------- |
| Journey | What happened to this machine?                                   | Campaign save state                      |
| Mastery | What can this machine do better through demonstrated situations? | Campaign capability composition          |
| Insight | What does the player understand about this world?                | Campaign discovery/content visibility    |
| XP      | How much standardized activity credit did a mode award?          | Optional projection or mode-local ledger |

Adding XP directly to the canonical state would create ambiguous causality. A player could gain a universal level without repairing a rig, master a verb without using it, or unlock a capability through an account score that bypasses the game's capability grammar. That would weaken identity, balance, save migration, and operator explanation.

## Allowed XP uses

### 1. Derived campaign projection

The campaign can display a familiar XP-like summary calculated from already-authoritative events for onboarding or accessibility. This value is informational only.

Rules:

- derive it from Journey, Mastery, Insight, and recorded event facts;
- do not persist it as a second mutable progression field;
- do not use it to unlock capabilities, modules, or power;
- label it as activity/progress summary, not player level;
- keep the canonical explanation attached to the underlying rig and verb.

This is the safest use if the product needs an XP bar for comprehension without changing the game model.

### 2. Mode-local XP ledger

Arcade, time-trial, challenge, or expedition modes may award XP as a score inside that mode.

Rules:

- scope the ledger by `modeId`, run/season identity, and ruleset version;
- never write mode XP into campaign Journey, Mastery, or Insight automatically;
- allow mode XP to unlock mode-specific cosmetics, leaderboards, modifiers, or replay tiers;
- make the mode's reset/expiry behavior explicit;
- use event IDs so retries cannot double-award XP.

This makes XP useful where repetition, ranking, and short-session pacing are the actual design goals.

### 3. Future XP-first game mode

A separate game mode or future game can use universal XP, levels, and rungs as its primary progression. That mode must declare its own progression contract and avoid pretending that its level is the campaign's rig identity.

The shared engine may provide reusable curve and threshold utilities, but ownership remains mode-scoped. A shared helper is not permission to share mutable progression state.

### 4. Legacy archive and one-way import

Old XP saves can be read and preserved under a legacy namespace for continuity, diagnostics, and player-facing acknowledgement.

Default migration does not silently convert XP into campaign power. The importer should:

- preserve original XP, level, rung, and restoration-stage facts as legacy evidence;
- map only facts with a defensible semantic equivalent;
- infer Journey only from explicit restoration evidence, not from a raw XP number;
- avoid granting Mastery because XP does not prove a specific capability or situation;
- avoid equating XP with Insight because activity credit and world understanding differ;
- record the migration source and conversion version.

If a future operator-approved conversion grants a bounded reward, it must be one-way, idempotent, visible to the player, and incapable of granting more capability power than the source evidence supports.

## Conversion policy

The canonical conversion direction is:

```text
authoritative campaign/mode events
        -> derived XP projection or mode score
```

The reverse direction is restricted:

```text
legacy XP save -> explicit migration evidence -> bounded, reviewed import
```

There is no general:

```text
XP -> Mastery
XP -> Insight
XP -> universal rig power
```

unless a future mode defines and validates that mapping as its own contract.

## Candidate mode matrix

| Mode                          | XP role                                     | Campaign state interaction                   | Recommended                         |
| ----------------------------- | ------------------------------------------- | -------------------------------------------- | ----------------------------------- |
| Campaign / Home Valley        | optional derived summary only               | none by default                              | Yes                                 |
| Time Trial                    | run score and leaderboard tier              | export replay/ghost artifact only            | Yes                                 |
| Arcade challenge              | session XP for cosmetics or challenge ranks | no capability unlocks                        | Yes                                 |
| Seasonal expedition           | season-scoped XP and milestone track        | explicit cosmetic/replay rewards             | Yes, after persistence/audit exists |
| Co-op contract board          | team contribution score                     | reward contract outputs, not universal level | Conditional                         |
| Legacy save import            | preserved source evidence                   | one-time bounded migration                   | Conditional                         |
| Campaign universal-level mode | primary XP authority                        | separate mode state and UI                   | Future experiment only              |

## Anti-double-reward contract

One completed action may produce multiple projections, but only one canonical campaign mutation.

For each reward event, record or derive:

- stable event ID;
- source activity/mission;
- mode and ruleset;
- active rig and capability context;
- canonical mutations: salvage, Journey, Mastery, Insight;
- optional projections: XP, score, rank progress;
- conversion version, if migration is involved.

Retries must replay the same result, not award it again. A mode XP score must never be mistaken for a second campaign reward.

## Product and operator value

- Player value: the machine remains the meaningful character, while familiar XP can explain short-form modes without confusing the core journey.
- Team value: future modes can experiment with pacing and rankings without rewriting campaign progression or save contracts.
- Operational value: every reward can be explained as canonical mutation versus derived projection, making migrations, support, and balance review auditable.

## Next implementation slice

The immediate runtime task is not to add XP fields. It is to reconcile the current callers/tests with the already-canonical capability-shaped contract:

1. update the parallel-owned `state.ts` and progression/mission tests to consume Journey/Mastery/Insight;
2. preserve the older XP design as this documented reference and, later, a mode-scoped adapter;
3. add event-id/idempotency coverage before any mode-local XP ledger is implemented;
4. rerun typecheck, Vitest, and browser acceptance on canonical port `4173`;
5. only then prototype a time-trial XP projection as a separate, non-campaign experiment.

## Revisit triggers

Reconsider XP as more than a projection only when a named mode has:

- a distinct player promise that XP serves better than capability progression;
- an explicit mode save/season boundary;
- a reward and reset contract;
- idempotent event accounting;
- player/operator explanation;
- evidence that the mode does not weaken campaign identity or create cross-mode power inflation.

## Addendum (2026-07-28) - First executable policy seam

The exploration now has a pure runtime companion in `src/game/xp-progression.ts`.
It implements the historical curve and rung thresholds as an optional policy,
derives level/rung from one account-XP value, stores per-rig restoration XP in
the same mode namespace, carries `modeId` and `rulesetVersion`, and rejects
cross-mode events. Reward events require a stable `eventId` and are idempotent,
so a retry cannot double-award an XP-only or hybrid mode.

This module is intentionally not imported into `GameState`, `ProgressionState`,
or the current mission resolver. The campaign remains capability-only. A future
mode can compose this ledger beside the canonical resolver by routing the same
activity through two explicitly named policies; it must not call an unlabelled
generic progression mutator.

### Anything else?

Yes: the first seam does not yet persist an XP ledger or expose XP UI, by design.
Before either is added, a concrete mode must define save ownership, reset/season
rules, reward source inventory, and player-facing unlock semantics. Those are
mode contracts, not engine defaults.

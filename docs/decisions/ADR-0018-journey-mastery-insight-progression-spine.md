# ADR-0018: Progression spine — Rig Journey, Verb Mastery, Insight

- Date: 2026-07-25
- Status: **Accepted** (operator decision 2026-07-25, direction session)
- Depends on: ADR-0003 (blueprint/instance), ADR-0006 (rig profiles/capabilities), ADR-0011 (command/capability separation)
- Related: `docs/exploration/GAME_SYSTEMS_ANALYSIS_AND_DIRECTION_2026-07-25.md` §3 (analysis this ADR ratifies), ADR-0002 (first playable slice — the spine's first consumer)

## Update log

- 2026-07-25 — **Accepted.** Operator reviewed the three-ladder proposal and
  selected: adopt the full spine **and** strengthen it with vertical power
  ("levels should make rigs visibly stronger, not just unlock options"),
  remaining open to further exploration. The vertical-power amendment is
  folded into §Verb Mastery below. Original proposal text preserved in the
  analysis document.
- 2026-07-26 — Schema sequencing updated after ADR-0019 assigned v5 to the
  monotonic world clock and recovery audit. The progression decision is
  unchanged; its first persisted payload now migrates v5→v6.

## Decision

Adopt three interlocking progression ladders as the canonical progression
spine. There is **no universal XP and no player level**.

### 1. Rig Journey — the character level (instance state)

The restoration arc (`found → stabilized → working → specialized →
hybridized → storied`) is formalized as each rig's journey phase.

- Each phase has a name, a silhouette/body change, and an unlock set.
- Advancement is gated by **deeds + investment**, never by points: a phase
  requires both scrap/parts investment (repair, restoration work) and
  demonstrated use (a signature job completed with that rig).
- The phase is visible on the machine's body (repair seams, patches,
  silhouette) and in the field kit. The rig's body is its level badge.
- Journey is per-rig instance state: it is _this_ machine's history. A second
  instance of the same blueprint starts at `found`.

### 2. Verb Mastery — the skill level (instance state, per capability)

Every capability (`plough`, `tow`, `jump`, `survey`, `winch`, and future
verbs) carries a per-rig mastery track with named ranks
(`novice → practiced → seasoned → master`).

- **Accrual is situation-weighted, not repetition-weighted.** Mastery events
  are keyed by a situation hash (verb × terrain class × load class × phase ×
  outcome). Repeated identical situations hit diminishing returns fast; new
  situations accrue fully. Grinding in circles does not level you; playing
  the game does.
- **Rewards are both options and power (operator amendment).** Each rank
  grants (a) new optionality — coupling types, tuning depth, contract access —
  and (b) measurable strength _inside that verb's domain_: a master of tow
  hauls heavier loads faster with a more stable hitch; a master of plough
  cuts deeper furrows at less strain. Power never generalizes across verbs
  and never aggregates into a universal score. A rig becomes visibly stronger
  **at what it does**, which is the capability-first grammar preserved under
  the operator's vertical-power requirement.
- Rank benefits compose through the same `effectiveProfile()` derivation path
  as modules (data-driven offsets/multipliers), so presentation, saves, and
  tests share one composition mechanism.

### 3. Insight — the knowledge ladder (profile-level, non-spendable)

Insight remains the non-spendable discovery/mastery currency. It additionally
gates: opportunity-compass range and resolution, module-category reveals, and
site lore. Insight is the pacing valve for content unlocks and the explorer's
progression track.

### Boundaries (unchanged from the design grammar)

- No universal XP, no player level, no aggregate power score.
- Scrap remains the only early spendable soft resource; Favor remains
  reputation-gated access. No premium currency, no paid progression, no
  lootbox mechanics.
- Mastery and journey are kernel-owned, deterministic, serializable state —
  never presentation-derived.

## Context

The operator asked for leveling. The pre-existing contract rejected "a
universal XP ladder." Exploration (`GAME_REFERENCE_ATLAS`) shows the failure
modes of both extremes: MMO grind grammar (checklist labor, power inflation)
and pure cosmetics (no progression satisfaction). The design grammar already
contained the spine's raw material (restoration arc, mastery-through-use,
Insight); this ADR makes it explicit, leveled, and — per the operator's
amendment — genuinely strengthening.

## Options considered

1. **Three ladders as proposed (options only, no vertical power)** — rejected
   by the operator as insufficiently rewarding; kept as the structural base.
2. **Three ladders + in-verb vertical power** — **chosen.**
3. **Rig Journey only, defer mastery** — rejected by the operator ("do all");
   noted as the natural fallback if mastery accrual proves untunable.
4. **Conventional XP/levels** — rejected: violates the capability-first
   grammar, creates a universal power score, and imports grind psychology the
   reference atlas warns against.

## Tradeoffs

- Situation-hash accrual is more complex to design and tune than XP, and its
  anti-grind property must be proven by test (identical repetitions → zero
  gain), not asserted.
- In-verb power risks re-introducing vertical imbalance if offsets are not
  bounded; all rank effects are clamped data with per-verb caps, reviewed like
  any balance config (motto §0.8 — data layer is product).
- Three ladders increase UI legibility burden; the field kit must show
  journey/mastery without dashboard sprawl (DESIGN.md low-chrome rule).

## Assumptions

- Capabilities remain the unit of gameplay identity (ADR-0006/0011).
- `effectiveProfile()` remains the single composition point for profile
  modifiers.
- Mastery situations are computable from kernel state only (terrain class,
  load, phase, outcome) — no presentation input.

## Risks

- Players may not perceive situation-weighted accrual as fair ("why didn't
  that count?") — mitigation: mastery feedback explains what counted and why
  (diegetic: the machine "learns" new situations).
- Power-per-verb could trivialize early content for high-rank rigs —
  mitigation: caps + content that scales by situation, not by rig stats.
- Scope: this spine ships incrementally; the first consumer is the ADR-0002
  slice's deeds, not a full content catalog.

## Validation plan

- Kernel tests: situation-hash diminishing returns; rank effects compose via
  `effectiveProfile()`; journey gates require both investment and deeds;
  save/load round-trip of mastery/journey state; migration from schema v4.
- Browser acceptance: field kit shows journey phase and mastery ranks;
  in-verb power is observable (e.g. tow speed under identical load differs by
  rank); no rig-name branches (existing capability test extended).
- Player-language gate (standing): external or simulated players should
  describe rigs as "getting better at things," not "number went up."

## Rollback / migration path

Mastery/journey state is additive instance data behind a new save-schema
version with the established migration path; removing the spine is a profile
composition change, not a data crisis. Older saves migrate with zero mastery
and phase inferred from condition/modules.

## Revisit triggers

- Mastery accrual proves untunable or gameable in playtesting.
- In-verb power measurably collapses rig-roster diversity (one rig best at
  everything after leveling).
- Operator redirects toward a different progression fantasy.

## Anything else?

Yes. Two things this ADR deliberately does not settle:

1. **Favor and Parts remain under-specified as progression axes.** They are
   named in the economy grammar but have no accrual/spend loops yet. They are
   expected to attach to NPC/contracts work, not to this spine.
2. **Fleet-level identity** (the "character sheet" across rigs) needs a
   legibility design pass once two or more rigs have journey history; a
   garage/fleet view is anticipated but not specified here.

## Addendum — 2026-07-26 save-version sequencing

ADR-0019 assigns schema v5 to the monotonic world clock and exceptional-recovery
audit. The progression spine remains unchanged, but its first persisted
mastery/journey payload now migrates v5→v6 rather than v4→v5. Farmfall must
preserve the v5 absolute clock, derived phase contract, recovery counters, and
the complete v1–v5 read chain.

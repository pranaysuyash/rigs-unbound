# ADR-0036 — Universal XP is quarantined, not admitted

- Date: 2026-07-28
- Status: **Rejected for runtime admission** under ADR-0018; the module is
  preserved and quarantined rather than deleted
- Owner: Rigs Unbound progression spine
- Affected: `src/game/xp-progression.ts` (175 lines, tested, unreachable)
- Related: ADR-0018 (progression spine, Accepted by explicit operator sign-off),
  ADR-0034 (unreachable code cannot be trusted to be correct),
  motto_v4 §7 (one truth source), §23 (implementation claims must name a falsifier)

## Context

`src/game/xp-progression.ts` appeared in the tree during the 2026-07-28 session.
It defines account XP, `xpForLevel()`, `levelFromXp()`, and a named rung ladder
(`Scavenger`, …). It has tests. Nothing imports it.

ADR-0018 is **Accepted by explicit operator sign-off** and states:

> Adopt three interlocking progression ladders as the canonical progression
> spine. There is **no universal XP and no player level**.

The module's own header hedges that "Journey, Mastery, and Insight state remains
the authority" and offers itself as usable by "an XP-first mode or an explicit
hybrid mode." That hedge is the problem, not the mitigation: it describes an
unaccepted mode as though the choice were still open, inside a file that any
future agent can wire in one import.

This is the ADR-0031 failure mode with the polarity reversed. There, an
unreachable module encoded a *wrong mechanism* for an accepted boundary and a
document claimed it was live. Here, an unreachable module encodes a *rejected
design*, and nothing prevents it from becoming live. In both cases the danger is
the same: **an unreachable module is not governed by anything.**

## Decision

1. **Universal XP is not admitted to the runtime.** ADR-0018 stands unchanged.
   No player level, no account XP, no aggregate power score reaches game state,
   the save schema, `publicState()`, or any player surface.
2. **The module is preserved, not deleted.** Deleting non-trivial tested logic
   without inventory would violate the code-preservation rule, and the module is
   a legitimate artifact of exploring an alternative progression policy.
3. **It is quarantined.** `xp-progression.ts` is recorded in an explicit
   quarantine list checked by `tools/audit-runtime-reachability.mjs`. Importing
   it from an entry-reachable module **fails the audit**, and therefore fails
   `verify:head`.
4. **The file carries its own status header**, so an agent reading only the
   source learns its standing without finding this ADR first.
5. **Admission requires a new ADR that supersedes ADR-0018**, with explicit
   operator sign-off. Quarantine is not a soft no; it is a no with a named door.

## Why quarantine rather than deletion

Deletion would lose a real exploration and would teach nothing. Quarantine is
strictly stronger than deletion for the actual risk:

- deletion prevents *this* file being wired; quarantine prevents *any* rejected
  design being wired silently, because the mechanism generalises;
- deletion leaves no record at the point of temptation; the status header does;
- deletion cannot be tested; quarantine has a failing check.

The reachability budget already answers "is pre-positioned work declared?" The
quarantine list answers the sharper question: **"is this pre-positioned work
allowed to be admitted at all?"** Those are different questions and both deserve
an enforced answer.

## Consequences

- The reachability audit gains a second class of finding. Unreachable is a
  budgeted allowance; quarantined-and-reachable is a hard failure.
- Quarantined modules are excluded from the unreachable budget count, because
  their unreachability is intentional and permanent. Counting them would create
  pressure to "fix" them by wiring them — exactly the wrong incentive.
- Any future alternative-progression exploration should land quarantined from
  the start rather than arriving as an ungoverned orphan.

## Validation

Per §23, this ADR names the check that falsifies it:

```bash
npm run audit:reachability   # reports quarantine violations
npm run verify:head          # fails if a quarantined module becomes reachable
```

- `tools/audit-runtime-reachability.test.mjs` covers the quarantine rule with a
  fixture where a quarantined module is imported from an entry point, and
  asserts the audit reports a violation.
- The live audit currently reports **0 quarantine violations**.

## Rollback and revisit triggers

Revisit if:

- the operator decides an XP-first or hybrid mode is a product direction, which
  requires a new ADR superseding ADR-0018 rather than an edit to this one;
- a second alternative-progression module appears, suggesting the quarantine
  list should become a directory convention instead.

## Update log

- 2026-07-28: Recorded after the reachability audit surfaced a tested,
  unreachable module implementing the exact design ADR-0018 rejects.

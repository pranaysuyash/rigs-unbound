# Contract Board Command Boundary Issue Review

**Date:** 2026-07-28  
**Status:** Open shell / acceptance-surface contract gap  
**Severity:** P2 player-facing choice boundary gap  
**Evidence tier:** Tier 1 static source inspection and design reasoning

## Finding

The repo has a well-named contract stack for the board and acceptance surface:

- `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md`
- `docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md`
- `docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md`
- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`

Those notes already define the board as a read-only projection plus a
player-choice layer. What is still missing is the runtime command boundary that
turns the named surface into an actual overlay branch with focus-managed
selection and an explicit accept/dismiss path.

The current doc stack is consistent about the next step:

- the ledger projects rows;
- the acceptance surface chooses from them;
- the shell owns the modal boundary;
- `openContractBoard` remains the canonical action name;
- but no runtime board branch is currently wired in the live shell contract
  notes.

## Why this matters

The acceptance surface is not merely a copy block or a survey banner. It is the
first-choice surface for derived propositions. Without a command boundary, the
board cannot yet prove:

1. that focus lands inside the board when opened,
2. that the selected proposition is announced clearly,
3. that accept/dismiss are explicit actions rather than implied gestures,
4. that closing restores the opener focus,
5. that the board remains read-only relative to simulation authority.

That gap is not a model bug and not a second authority bug yet. It is a
missing runtime insertion point, which means the board remains a spec-level
projection rather than a player-reachable surface.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` | Shell owns overlays and focus | Canonical shell contract |
| `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md` | Read-only row projection | Canonical read-model contract |
| `docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md` | Player-choice contract | Canonical choice contract |
| `docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md` | Row selection / announcement | Canonical row contract |
| `docs/reviews/READ_MODEL_AND_COMMAND_BOUNDARY_AUDIT_2026-07-28.md` | Confirms the read/write split matters | Confirms the boundary discipline |

## Recommendation

The next durable slice should keep the surface split explicit:

1. preserve the read-only ledger as the source of propositions,
2. wire a dedicated `openContractBoard` overlay branch when runtime work is
   available,
3. route accept/dismiss through the existing command/result path,
4. keep focus and announcement behavior in the shell contract, not in the
   ledger.

## Closure trigger

This issue closes only when the board exists as a real overlay branch or a
documented, equivalent runtime surface with:

- focus entry,
- row selection,
- announcement behavior,
- accept/dismiss actions,
- focus restore on close,
- and no new mission authority.

## Anything else?

Yes. This review intentionally stops short of claiming the board is broken in
runtime, because the current repo evidence is still largely spec-level. The gap
is that the board is not yet a live, focus-managed command boundary.

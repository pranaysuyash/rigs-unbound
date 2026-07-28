# Shell Accessibility Next Seam

**Date:** 2026-07-28  
**Status:** static analysis note  
**Evidence tier:** Tier 1 static source inspection and design reasoning

## Why this note exists

The current repo already treats the unified shell as a real contract surface,
not a decorative UI layer. The next durable analysis seam is therefore not
"more UI" in the abstract. It is the accessibility and focus contract for the
major overlays that already define the shell.

This note records the next safe slice so the shell work can keep moving without
drifting into the contested `src/game/` runtime files.

## Sources reviewed

- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`
- `docs/research/OPERATOR_OBSERVABILITY_AND_DIAGNOSTICS_CONTRACT_2026-07-26.md`
- `docs/reviews/MAP_OVERLAY_DIALOG_AND_FOCUS_ISSUE_REVIEW_2026-07-26.md`
- `docs/reviews/PAUSE_STATE_ANNOUNCEMENT_ISSUE_REVIEW_2026-07-26.md`
- `docs/reviews/TOUCH_RADIAL_ACTION_BOOT_BLOCKER_ISSUE_REVIEW_2026-07-28.md`
- `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`

## What the current docs already prove

1. The shell is intended to be one layer over the simulation, not a second
   game.
2. Major overlays are already a named inventory: map, contract board,
   workshop, garage/fleet roster, pause menu, labs drawer, and control lesson.
3. Accessibility is already a structural requirement in the shell spec.
4. The operator-observability contract already treats local diagnostics as an
   acceptance surface, not a gameplay authority.
5. Existing reviews still frame the map, pause, and radial surfaces as live
   focus/announcement contracts rather than solved details.

## What is still missing

- The contract-board overlay is planned but not yet live in the shell spec's
  current evidence lane.
- The shell-spec contract is still describing the accessibility shape rather
  than proving it in the runtime surface.
- The next durable proof should cover modal overlay semantics, focus restore,
  escape/close behavior, live announcements, and keyboard/touch parity as one
  coherent accessibility contract.

## Next safe slice

The next analysis/documentation slice should focus on the contract-board /
major-overlay accessibility contract:

- `role="dialog"` and `aria-modal="true"` for major overlays,
- visible heading and description linkage,
- focus trapping and restoration,
- explicit close/back affordances,
- announcement surface for state changes,
- keyboard parity for every major action,
- no hidden second authority for the board or shell.

That slice is a good fit for the current repo state because it advances shell
trust and user comprehension without requiring contested runtime edits.

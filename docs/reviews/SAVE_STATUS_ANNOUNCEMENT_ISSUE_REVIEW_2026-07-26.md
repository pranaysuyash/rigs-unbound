# Save Status Announcement Issue Review

**Date:** 2026-07-26  
**Status:** Open accessibility / recovery-status issue; no runtime change landed in this pass  
**Severity:** P2 player-facing state announcement gap  
**Evidence tier:** Tier 1 static source inspection. No browser, screen-reader, or device command was run in this pass.

## Finding

The save and recovery state is truthful, but it is still not a dedicated announcement surface.

Current behavior:

- `src/main.ts` writes persistence messages into `#save-status`;
- those messages cover fresh, restored, migrated, recovered, fallback, and reset states;
- the element is visible in the public shell;
- but it is not marked as a live region or otherwise named as a dedicated announcement contract.

That means the player can read the state, but the state change is still mostly visual. Bootstrap announcements are already handled separately, so this is not a generic live-region shortage. It is a specific gap in the persistence/recovery contract.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `index.html` `#save-status` | Visible persistence/recovery line | Visual readout, not a dedicated announcement element |
| `src/main.ts` `statusMessage` updates | Emits fresh/restored/migrated/recovered/fallback/reset text | Correct content, incomplete accessibility contract |
| `#bootstrap-status` | Separate announced entry state | Good bootstrap contract, not a substitute for save announcements |

## Why this matters

Persistence and recovery are part of the player’s trust model. When the game restores or migrates local state, the player should not need to infer that from a text line alone. A dedicated announcement path reduces ambiguity when the session is loaded, migrated, recovered, or reset.

## Recommended next proof slice

The next durable slice should make save/recovery state an explicit announcement target:

1. decide whether the save line should become a live region or a named status region with a stronger announcement path;
2. keep the visible text as the human-readable summary;
3. preserve the existing runtime message semantics;
4. prove the status change in-browser for keyboard and assistive-tech flow.

## Closure trigger

This issue closes only when save/recovery state has an explicit announcement contract and that contract is proven in-browser. Documentation alone does not close the issue.

## Addendum (2026-07-28) - save/recovery remains visual-only even while the profile bridge is still open

- Re-checked the live public shell after the recent browser-delivery/profile
  visibility notes.
- `#save-status` still receives the correct fresh/restored/migrated/recovered
  messages, but it is still not a named live region or dedicated announcement
  target.
- The player can therefore read the persistence line, but the persistence
  change still is not explicitly announced in the browser surface.
- This remains a separate trust gap from the active profile signal, which is
  still hidden from the public HUD in `#runtime-diagnostics`.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static trail
  inspection.

## Anything else?

Yes: this is not the same as the bootstrap message. Bootstrap tells the player the field is ready; save/recovery tells the player what happened to their persistent world. Those are separate promises and should stay separate.

## Addendum (2026-07-28) - the save line is now announced, but the browser proof is still missing

- The shell source now marks `#save-status` as a live status region with
  `role="status"` and `aria-live="polite"`, so the persistence/recovery line is
  no longer just a visual readout in the source contract.
- `src/main.ts` now updates the status line and the new public profile line in
  tandem, which keeps the announcement contract separate from the profile
  indicator.
- This is a source-level accessibility change only. The closure trigger still
  requires a live browser check that the announced status behaves correctly in
  session.
- Evidence depth: Tier 1 static source inspection of `index.html`,
  `src/main.ts`, and `src/styles.css`.

## Addendum (2026-07-28) - live browser proof confirms the announced save region stays exposed

- Re-checked the live browser at `http://localhost:4173/?proof=1` on a
  390 × 844 viewport.
- `#save-status` is present with `role="status"`, `aria-live="polite"`, and
  `aria-atomic="true"`.
- The save message reads `New field ready · progress saves locally`, and the
  element remains visible in the browser after the mobile CSS update.
- The public profile line remains separate from this save announcement, so the
  browser now carries both contracts without collapsing them into one line.
- Evidence depth: Tier 4 live browser observation plus Tier 1 static source
  inspection.

## Addendum (2026-07-28) - stronger assistive-tech proof still needs a manual screen-reader pass

- The browser environment here does not expose `window.getComputedAccessibleNode`,
  so the programmatic accessibility-tree check is unavailable in this session.
- The live browser proof above confirms the save region is visible and
  announced in source, but not full narration behavior in a screen reader.
- The remaining closure step is therefore a manual VoiceOver/NVDA/JAWS-style
  pass, not more source editing.
- Evidence depth: Tier 1 environment capability check plus Tier 4 browser
  proof already captured above.

## Addendum (2026-07-28) - Chrome accessibility tree now exposes the save announcement line

- Ran a Chrome accessibility-tree snapshot against `http://localhost:4173/?proof=1`
  at 390 × 844.
- The tree contains the save line as exposed text:
  `New field ready · progress saves locally`.
- The tree keeps the save region separate from the public profile line, so the
  announcement contract remains distinct and readable.
- This is stronger than DOM-only proof because it confirms the message is
  present in Chrome’s accessibility tree, but it still is not a spoken
  VoiceOver/NVDA/JAWS narration test.
- Evidence depth: Tier 3/4 browser accessibility-tree observation plus Tier 1
  source inspection.

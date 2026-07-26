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

## Anything else?

Yes: this is not the same as the bootstrap message. Bootstrap tells the player the field is ready; save/recovery tells the player what happened to their persistent world. Those are separate promises and should stay separate.

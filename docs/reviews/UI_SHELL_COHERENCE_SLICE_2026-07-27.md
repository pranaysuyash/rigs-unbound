# UI Shell Coherence Slice — Implementation Review

**Date:** 2026-07-27  
**Status:** implemented, verified for the UI shell slice; later runtime blockers were revised in follow-up notes  
**Plan:** `/Users/pranay/.kimi-code/sessions/wd_rigs-unbound_7a29f026b7a7/session_c86f1584-8eba-45f7-a8d0-564cc7da6e01/agents/main/plans/polaris-barry-allen-forge.md`  
**Roadmap:** `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

---

## Goal

Make Rigs Unbound feel like one coherent game by fixing the most disorienting UI seams: the map/rumor double overlay, the always-on navigator radar, and the missing pause menu.

## What was implemented

### 1. Unified overlay manager (`src/main.ts`)

- Introduced `OverlayKind` and a single `openOverlay` / `closeOverlay` pair.
- Map, pause, workshop, and control lesson now mutually exclude each other.
- Opening any overlay closes the others and manages focus/aria attributes.

### 2. Unified map overlay (`index.html`, `src/main.ts`, `src/styles.css`)

- Field map and rumor graph now live inside one modal.
- Added a layer toggle: **Field** / **Rumor**.
- Moved the rumor map DOM into `#rumor-map-host` without editing parallel-owned `src/game/rumor-map-ui.ts`.
- `M` opens/closes the unified map; `Escape` closes it.

### 3. Navigator radar toggle (`src/main.ts`, `index.html`, `src/styles.css`)

- Radar is **hidden by default**.
- `V` or touch **Radar** button toggles it.
- Preference persists in `localStorage`.

### 4. Real pause menu (`index.html`, `src/main.ts`, `src/styles.css`)

- Replaced the single-word "Paused" overlay with a full menu.
- Actions: Resume, Sound on/off, Fullscreen, Radar on/off, Return to welcome, Reset field.
- Shows save status line.
- `P` opens, `Escape` closes/resumes.

### 5. Visual polish

- Unified overlay chrome with consistent backdrop, plate, transitions, and z-index stack.
- Patchwork Atlas palette preserved.
- Mobile responsive rules added.
- Controls strip and touch controls updated (`V` for radar).

### 6. Verification tool

- `tools/ui-shell-verification.cjs` — headless Playwright script that checks pause, map layers, navigator toggle, and zero console errors.

## Files changed

- `index.html`
- `src/main.ts`
- `src/styles.css`
- `tools/ui-shell-verification.cjs` (new)
- `docs/WORKLOG_ADDENDUM_2026-07-27.md`
- `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

`src/game/` was **not modified**.

## Verification results

| Gate                              | Result               | Notes                                                                                        |
| --------------------------------- | -------------------- | -------------------------------------------------------------------------------------------- |
| `npx vite build`                  | ✅ Pass              | Production client/server build succeeds.                                                     |
| `tools/ui-shell-verification.cjs` | ✅ Pass              | Pause, map layers, navigator toggle, no console errors.                                      |
| Prettier on touched files         | ✅ Pass              | `index.html`, `src/main.ts`, `src/styles.css`, `tools/ui-shell-verification.cjs` formatted.  |
| `npm run typecheck`               | ⚠️ Earlier note superseded | The original blocker note referenced `src/game/animation.ts`; later follow-up work reconciled that boundary, but typecheck was not rerun in this review. |
| `npx vitest run`                  | ⚠️ One flaky failure | `src/game/storage.test.ts` fails in full suite, passes in isolation. Parallel-owned runtime. |

## Parallel-owned blockers

The following issues were recorded in the original slice note and then revisited in later follow-up work:

1. **`src/game/animation.ts` syntax errors** — this was the initial blocker note; later reconciliation work in the current session superseded that claim, so treat it as historical unless a fresh typecheck reproduces it.
2. **`src/game/storage.test.ts` isolation issue** — "migrates the v6 slot into a fresh survey contract" failed when the full suite ran at the time of the review, but this doc does not reassert that result as current-session evidence.

Because `src/game/` is parallel-owned, these were left for the runtime owner.

## Next steps

1. Re-run fresh `npm run typecheck && npx vitest run` against the current checkout if you want updated verification.
2. Re-check `src/game/storage.test.ts` only if the full-suite failure still reproduces in the current tree.
3. Keep the animation-blocker note as historical unless a fresh typecheck reproduces it again.
3. Continue integration roadmap next slices:
   - Contract Ledger overlay (read-only from `publicState`).
   - Garage / fleet roster overlay.
   - Labs-as-instruments drawer.

## Anything else?

- Audio-as-UI remains out of scope; the pause menu only toggles existing audio on/off.
- The radial menu (`src/game/radial-ui.ts`) is still unwired; that is a separate roadmap item.
- The Contract Ledger and Garage overlays can now reuse the unified overlay manager.
- The live animation and interaction boundary that sits beside this shell slice
  is documented in
  [Three.js Animation Implementation Flow](../research/THREEJS_ANIMATION_IMPLEMENTATION_FLOW_2026-07-27.md)
  and
  [Three.js Interaction Implementation Flow](../research/THREEJS_INTERACTION_IMPLEMENTATION_FLOW_2026-07-27.md).

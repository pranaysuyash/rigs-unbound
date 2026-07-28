# Unified UI Shell Specification (2026-07-27)

**Status:** proposed read-only shell contract - not implemented as a separate
architecture layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related review:** `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`  
**Related roadmap:** `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

## Purpose

Define the shell that surrounds the rig without becoming a second game.

The unified shell exists to make the runtime read as one persistent world:

- the rig remains the primary information source,
- overlays are explicit and mutually coordinated,
- the player always knows what layer they are in,
- accessibility remains a first-class contract,
- the shell stays secondary to the simulation instead of displacing it.

This specification formalizes the overlay manager and the major shell surfaces
that already exist in the current integration-first direction, while leaving the
parallel-owned runtime authority alone.

Related board contract: [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)

## Current evidence the shell must respect

The shell should be derived from the current integration-first evidence surface:

- one overlay manager with explicit open/close state,
- one unified map overlay that can show Field and Rumor layers,
- a toggleable navigator/radar surface,
- a real pause menu with save/status actions,
- a workshop surface,
- a control lesson / first-use guidance surface,
- a read-only contract board is the next planned surface,
- garage/fleet and labs are future shell surfaces, not separate pages.

The shell must not invent a new source of truth for the runtime. It is a
presentation and interaction contract over the current public state.

## Shell principles

1. One shell, many panes. The player should feel one game with several overlays,
   not several games stitched together.
2. Rig first, shell second. The vehicle remains the clearest source of meaning;
   the shell explains, never replaces, the machine.
3. Mutual exclusion by default. Major overlays do not stack unless they are
   deliberately nested and focus-managed.
4. Read-only first. The first shell slices present the world; they do not mutate
   it.
5. Explicit modes. Each overlay should announce what it is and how to exit.
6. Keyboard, mouse, touch, gamepad parity. The shell must remain usable on
   every supported input family.
7. Reduced motion is a contract. Shell transitions must have a no-friction path
   when motion is reduced.
8. Accessibility is structural, not decorative. Semantics and focus are built
   in, not patched on later.

## Surface inventory

### Persistent in-world surfaces

- Field kit HUD
- Navigator / radar toggle
- Contextual action prompt
- Camera mode indicator
- Save/status indicator

### Full overlay surfaces

- Map
- Contract Board
- Workshop
- Garage / fleet roster
- Pause menu
- Labs drawer

### Transitional surfaces

- Control lesson / onboarding hint
- First-rung guidance
- Confirmations and destructive-action prompts

## Proposed shell layout

The shell should be thought of as layered planes rather than arbitrary panels:

```text
Layer 0  World / rig / world-space affordances
Layer 1  Persistent field kit HUD
Layer 2  Navigator / radar / small overlays
Layer 3  Major overlays (Map, Contract Board, Workshop, Garage, Pause)
Layer 4  System prompts (confirmations, save notices, onboarding hints)
```

The shell should never rely on a hidden second world. All major surfaces should
reflect the same current runtime state.

## Proposed overlay stack

The current stack should remain explicit and bounded:

```text
Pause Menu
Workshop
Garage / Fleet Roster
Contract Board
Map
Labs Drawer
Control Lesson
System Prompt
```

Rules:

- only one major overlay is active at a time,
- the current overlay receives focus when opened,
- `Escape` closes the current modal or returns to play,
- opening a new overlay closes the previous major overlay,
- nested confirmation prompts are allowed only when the parent overlay remains
  focus-trapped and recoverable.

## Wireframe contract

### Desktop shell

```text
┌────────────────────────────────────────────────────────────┐
│ Field kit / status strip                                   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                        3D world                             │
│                                                            │
│                [overlay content appears here]              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Context prompt     Camera mode     Save/status     Radar   │
└────────────────────────────────────────────────────────────┘
```

### Major overlay modal

```text
┌────────────────────────────────────────────────────────────┐
│ Title                        Layer toggle / actions        │
├────────────────────────────────────────────────────────────┤
│                                                            │
│     Scrollable, keyboard-focusable content region          │
│                                                            │
│     - summary                                              │
│     - actionable rows                                      │
│     - reason codes                                         │
│                                                            │
├────────────────────────────────────────────────────────────┤
│ Close / back / contextual actions                          │
└────────────────────────────────────────────────────────────┘
```

### Mobile shell

```text
┌──────────────────────────────┐
│ Status / prompt strip        │
├──────────────────────────────┤
│                              │
│            World             │
│                              │
├──────────────────────────────┤
│ Action   Radar   Menu   Back  │
└──────────────────────────────┘
```

Touch targets should remain large enough for reliable use, and the primary
action should stay the most discoverable control.

## Accessibility contract

The shell should meet at least the following conditions:

- use semantic landmarks for persistent regions,
- use `role="dialog"` and `aria-modal="true"` for major overlays,
- label every major overlay with a visible heading,
- preserve and restore focus on modal open/close,
- prevent keyboard traps,
- keep tab order aligned with the visible reading order,
- provide text equivalents for icon-only controls,
- do not encode meaning only in color,
- keep status messages exposed through an announcement surface when needed,
- preserve reduced-motion users by removing non-essential movement,
- make close/return actions obvious and reachable from every overlay.

Recommended accessibility details:

- persistent shell chrome should be wrapped in the expected landmark structure,
- save and status updates should be readable as text, not only as transient
  animation,
- action prompts should describe the verb and the consequence,
- keyboard shortcuts should be discoverable in the shell itself,
- touch controls should not be the only path to any core shell action.

## Input contract

The shell should support a small canonical set of shell actions:

- `openMap`
- `openContractBoard`
- `openWorkshop`
- `openGarage`
- `openPause`
- `openLabs`
- `toggleRadar`
- `closeOverlay`
- `confirm`
- `cancel`

Binding rules:

- the same action should work across keyboard, touch, and gamepad where
  practical,
- the shell should prefer named actions over raw key handling,
- overlay-specific bindings must not break the global close/back path,
- input labels should explain what changed after the action is performed.

## Data contract

The shell should read, not own, the following sources:

- `publicState.activity`
- `publicState.progression`
- `publicState.rigs`
- `publicState.sites`
- `publicState.worldMemory`
- the current overlay manager state in `src/main.ts`

The first shell slice should remain projection-only. If a shell control needs to
change runtime state, it should do so through the same canonical action path the
rest of the runtime uses, not through a parallel shell-specific authority.

## Visual contract

The visual system should continue the Patchwork Atlas language:

- low-chrome field kit, not a generic dashboard,
- high-contrast readable text and state cues,
- consistent overlay plate and backdrop treatment,
- visible active layer / inactive layer contrast,
- motion used for state change, not decoration,
- avoid the generic card-grid / glassmorphism browser-app look.

The shell is a field kit attached to a machine, not a software desktop.

## Z-order and motion

Motion rules:

- open motion should be short and legible,
- close motion should be shorter than open motion,
- overlay transitions should not obscure focus changes,
- reduced-motion mode should collapse transitions to simple visibility swaps,
- there should be no background parallax or floating UI that harms legibility.

Z-order rules:

- system prompts always sit above the overlay they interrupt,
- major overlays sit above the persistent HUD,
- the persistent HUD should never block essential overlay actions,
- the world remains visible behind translucent overlays where readability
  allows.

## Validation rules

The shell contract should fail visibly if it:

- creates a second authority for the runtime,
- loses the distinction between the world and the overlay,
- allows two major overlays to compete for focus,
- drops keyboard or touch reachability,
- hides the close path,
- breaks reduced-motion or focus restoration,
- relies on icon-only meaning with no text label,
- assumes the player can memorize shell state without feedback.

## Out of scope for this spec

- No new mission engine.
- No new save schema.
- No labs runtime implementation.
- No garage data model implementation.
- No contract-ledger authority changes.
- No episode-runner architecture.

## Near-term proof slice

The smallest proof that satisfies this spec is:

1. the existing overlay manager,
2. the unified map / radar / pause shell,
3. the read-only Contract Board overlay,
4. focus trapping and restoration for each modal,
5. explicit reduced-motion behavior,
6. visible keyboard and touch affordances for each major shell action.

## Open questions

- Should garage and workshop remain separate overlays or share a shared vehicle
  inspection shell with tabs?
- Should the labs drawer be modal, split-pane, or a same-runtime route?
- Should the Contract Board default to a compact summary or full ledger?
- Which shell actions should be exposed in the persistent field kit versus the
  pause menu only?
- Should the radar/navigator be a toggle or a hold-to-reveal control on touch?

## Anything else?

Yes. The shell is only successful if it disappears into habit. Players should
feel that the overlays are tools attached to the world, not menus that interrupt
it.

## Addendum (2026-07-28) — the Contract Board now needs an explicit choice contract

The shell still owns overlay order, focus restoration, and accessibility.
However, the board itself now has a separate interaction contract in
[Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md).

That note keeps the board readable and reachable without letting it become a
second mission authority. In practice the shell should continue to guarantee:

- visible heading and landmark structure,
- keyboard and touch parity,
- clear selected-row focus,
- text-based status and reason output,
- obvious close / back behavior.

## Addendum (2026-07-28) — the board must also behave like an announced dialog boundary

The board's accessible choice contract is now named in
[Mission Acceptance Surface Contract](./MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md),
and the live accessibility analysis notes the remaining browser contract more
precisely:

- the board should behave like a focus-managed dialog when opened,
- the selected proposition should be announced with status and reason,
- accept/dismiss should be explicit actions, not implied gestures,
- focus should restore to the opener when the board closes.

This is still shell territory, not runtime authority. It is the browser-facing
announced boundary that makes the read-only board usable.

## Addendum (2026-07-28) — `openContractBoard` is still a spec action, not a runtime action

Source inspection of `src/` still finds no `openContractBoard` implementation
or dedicated contract-board overlay. The runtime currently mounts the map,
rumor map, hood dashboard, navigator, workshop, pause, and lesson surfaces,
but not a separate board surface for the ledger contract.

That means the input contract remains forward-looking:

- `openContractBoard` is the canonical action name,
- the overlay manager is the canonical shell host,
- the actual board overlay still needs to be built and wired in before live
  focus, row announcement, and compact-versus-expanded behavior can be
  verified.

The exact insertion point is the `OverlayKind` / `openOverlay` / `closeOverlay`
cluster in `src/main.ts`: today it only knows about `map`, `pause`,
`workshop`, and `lesson`, so the contract board has no runtime branch to
enter yet.

## Addendum (2026-07-28) — the row model now has its own contract

The shell now has a dedicated row/announcement contract in
[Mission Acceptance Row and Announcement Contract](./MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md).

That keeps the shell responsibilities clear:

- the shell manages the dialog boundary and focus restore,
- the row contract manages selected vs actionable vs deferred semantics,
- the acceptance surface contract keeps the board read-only and choice-shaped.

## Addendum (2026-07-28) — the sectioned board layout now has its own contract

The sectioning and compact-versus-expanded behavior now lives in
[Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md).

That keeps the shell contract clean:

- the shell owns overlays and focus,
- the row contract owns announcement and selection,
- the section contract owns compact/expanded presentation.

## Addendum (2026-07-28) — the board header and summary now has its own contract

The board title, summary line, and mode indicator now live in
[Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md).

That keeps the shell contract clear:

- the shell owns dialog boundaries and focus restore,
- the header contract owns orientation and summary,
- the section contract owns compact/full layout,
- the row contract owns selection and announcement.

## Addendum (2026-07-28) — the history recap now has its own contract

The board history section's retention and recap behavior now lives in
[Mission Acceptance History and Recap Contract](./MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md).

That keeps the shell contract clean:

- the shell still owns the overlay boundary,
- the history contract owns bounded recall,
- the section contract owns where history sits in the board.

## Addendum (2026-07-28) — the board transition and restore now have a contract

The board's open, reconfigure, and close choreography now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That keeps the shell contract clear:

- the shell owns the global overlay boundary,
- the transition contract owns board reopen/restore behavior,
- the row/section/header/history contracts own the board’s internal shape.

## Addendum (2026-07-28) — the board empty state now has a contract

The board's zero-row and fallback behavior now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That keeps the shell contract clear:

- the shell still owns the overlay boundary,
- the empty-state contract owns the no-rows explanation,
- the board still keeps a readable way back to play.

## Addendum (2026-07-28) — the board loading state now has a contract

The board's loading and refresh behavior now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That keeps the shell contract clear:

- the shell still owns the overlay boundary,
- the loading contract owns the in-progress explanation,
- the board still keeps a readable way back to play.

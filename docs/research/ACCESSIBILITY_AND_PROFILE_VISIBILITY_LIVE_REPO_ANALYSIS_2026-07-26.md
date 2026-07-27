# Accessibility and Profile Visibility Live Repo Analysis (2026-07-26)

## Skills consulted

1. [Accessibility Auditor](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/accessibility-auditor/SKILL.md)

## Purpose

Use the live browser surface to answer a narrower accessibility question than
"is the app accessible": what does the current 3D web experience already make
perceivable and operable, and what still needs an explicit player-facing
contract?

This note is about live browser accessibility state, not a general WCAG audit.
The app already has keyboard access, focus management, reduced-motion
awareness, and fallback logic. The open question is whether the player can see
the active profile and loading/fallback state in a clearly named way on the
public surface.

## Current evidence base

- Browser entrypoint and focus / input wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Renderer perception and reduced-motion evidence:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Browser-loading and profile bootstrap contract:
  - [docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
- Threshold and fallback comparison notes:
  - [docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/THRESHOLD_FIXTURE_BASELINE_2026-07-25.md)
  - [docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/THRESHOLD_CAPTURE_SELECTION_PROTOCOL_2026-07-25.md)

## What the live code already proves

The current browser surface already handles several accessibility-relevant
behaviors correctly:

- the intro and game canvas can receive focus and keep keyboard flow alive;
- keyboard, gamepad, and touch are all wired through named input actions;
- reduced-motion preference is consulted in the renderer's perception layer;
- loading and fallback states are visible through the bootstrap and runtime
  profile logic;
- developer diagnostics already expose the active runtime profile and related
  fallback reasons.

That means the app is not accessibility-blank. It already has real operability
and a meaningful fallback posture.

## What is still missing

The remaining gap is naming and surfacing the accessibility contract on the
public browser surface.

Still missing:

- one player-facing indicator that clearly shows the active comfort/profile
  state without requiring developer diagnostics,
- one explicit contract for when fallback or reduced profiles should be visible
  to the player versus only to operators,
- one browser-proof observation that the narrow/mobile surface still presents a
  readable and operable first step without hidden controls,
- one durable statement that the loading/fallback story is part of the public
  promise, not just the internal runtime policy.

## Recommended next proof slice

The next durable slice should be a small visibility proof:

1. add or document one player-facing profile/status indicator,
2. confirm the current focus path survives the live browser surface,
3. keep the reduced-motion and fallback logic tied to a named surface contract,
4. avoid expanding into a broader a11y refactor until the profile/status
   indicator itself is explicit.

That keeps the work aligned with the accessibility skill guidance:

- semantic focus and operability matter,
- visible status beats hidden state,
- and reduced-motion / fallback behavior must be understandable, not merely
  implemented.

## Addendum (2026-07-26) - keyboard and reduced-motion are already real, but the profile signal is still mostly indirect

- Re-checked the live source while writing this note.
- `src/main.ts` already has real focus and keyboard wiring, including canvas
  focus on entry and stateful input actions.
- `src/styles.css` already supports visible keyboard affordance through
  `:focus-visible` rules for buttons, selects, the game canvas, and the skip
  link, so the public surface is not relying on pointer-only cues.
- The HTML assembly in `src/main.ts` also uses semantic controls for the
  welcome flow, module actions, recovery, mute/fullscreen, and map/pause-style
  toggles rather than custom clickable divs.
- `src/game/renderer.ts` already tracks reduced-motion and perception evidence.
- The browser can already expose profile/fallback information through runtime
  diagnostics, but that is still not the same as a player-facing status element.
- The next useful accessibility proof is therefore not another keyboard
  shortcut; it is a visibly named profile/fallback surface that survives the
  public browser experience.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-26) - the public shell is truthful, but the active profile is still operator-facing

- Re-checked the current browser entrypoint and runtime visibility wiring.
- The player-facing shell now does its job truthfully:
  - `bootstrapStatus` names the entry state,
  - `saveStatus` names the persistence state,
  - the welcome flow remains operable with keyboard focus and semantic buttons.
- But the active profile itself is still not a public status element:
  - `runtimeDiagnostics` is hidden on the player surface,
  - active runtime profile and fallback reasons live in the developer/evidence
    surface,
  - the player still does not get a durable visible input/accessibility
    profile indicator in the public HUD.
- So the repo has made the public shell trustworthy, but the profile signal is
  still mostly operator-facing rather than player-facing.
- Evidence depth: Tier 1 static source inspection.

## Addendum (2026-07-26) - the bootstrap shell is announced, but the persistence/status line is still visual only

- Re-checked `index.html` and `src/main.ts` to separate announced shell state
  from plain visible state.
- The bootstrap entry path is already screen-reader aware:
  - `#bootstrap-status` is a polite live region with `role="status"` and
    `aria-atomic="true"`,
  - the shell also uses `aria-busy` to mark the transition from loading to
    ready.
- The persistence/status line is not yet part of that announcement path:
  - `#save-status` is a visible text field only,
  - it is updated when load/recovery/profile messages change,
  - but it does not currently have its own live-region contract.
- That means the repo already has a truthful announced bootstrap shell, but the
  player still may not hear persistence or recovery state changes unless they
  are separately surfaced through another announcement path.
- Evidence depth: Tier 1 static source inspection. No runtime assistive-tech
  walkthrough was run in this pass.

## Addendum (2026-07-26) - the public shell is trustworthy, but the profile signal is still operator-facing

- Re-checked `src/main.ts`, `src/game/runtime-profile-policy.ts`, and the
  current public shell against the profile-visibility contract.
- The repo already knows the active profile and fallback reasons:
  - runtime profile selection is computed in code,
  - `runtimeDiagnostics` includes a profile summary,
  - the developer/evidence surface can describe why the runtime fell back.
- The remaining gap is the player-facing signal:
  - `runtimeDiagnostics` is hidden from the public HUD,
  - there is no durable visible input/accessibility profile indicator for the
    player,
  - fallback state is therefore still mostly operator-facing.
- So the shell is trustworthy, but the profile contract is still incomplete
  until the player can read the current comfort/profile state in-session.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this pass.

## Addendum (2026-07-26) - save/recovery messages are truthful, but they still are not a dedicated announcement surface

- Re-checked `src/main.ts` against the visible status wiring.
- The save/recovery status text is already truthful:
  - fresh, restored, migrated, recovered, and fallback messages are written to
    `#save-status`,
  - the text is updated from the live `loadResult` and later runtime fallback
    or recovery decisions.
- But `#save-status` is still a visual readout rather than a named live region:
  - it is not marked with `role="status"` or `aria-live`,
  - bootstrap announcements are handled separately by `#bootstrap-status`,
  - persistence changes therefore do not yet have a dedicated announcement
    contract of their own.
- The accessibility reading is therefore:
  - player truth is present,
  - announced bootstrap state is present,
  - announced persistence/recovery state is still missing.
- Evidence depth: Tier 1 static source inspection. No runtime assistive-tech
  walkthrough was run in this pass.

## Addendum (2026-07-26) - the map overlay is modal-like, but it still lacks a true dialog/focus contract

- Re-checked `index.html`, `src/main.ts`, and `src/styles.css` against the
  map overlay interaction.
- The map overlay is already a real mode switch:
  - `state.mapOpen` changes input suppression for control lessons and some HUD
    affordances,
  - `mapOverlay.hidden` toggles the full-screen overlay,
  - `Escape` closes the map before pause, so the surface is recoverable.
- The missing part is the explicit dialog contract:
  - `#map-overlay` is only a labeled section in markup,
  - it does not declare `role="dialog"` or `aria-modal="true"`,
  - the focus path does not move into the overlay when it opens,
  - the close path does not restore focus to the opener.
- So the player can already use the map, but keyboard and assistive-technology
  users still lack a named, focus-managed dialog boundary for that mode switch.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this pass.

## Addendum (2026-07-26) - pause is visible, but the announcement path is still not dedicated

- Re-checked the paused-state path in `src/main.ts` and `index.html`.
- The game already makes pause visible:
  - `current-prompt` is updated to `"Paused."`,
  - the full-screen `#pause-overlay` is shown,
  - simulation input is suppressed while paused.
- The remaining gap is announcement, not state:
  - the prompt is a normal heading, not a dedicated live region,
  - the overlay is visual only,
  - there is no explicit pause-status announcement contract like the one used
    for bootstrap and control tips.
- So the player can see that the game is paused, but the repo still lacks a
  durable non-visual pause announcement path.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this pass.

## Addendum (2026-07-26) - the workshop is a real progression gate, but it still lacks a focus/discovery contract

- Re-checked the workshop surface in `index.html` and `src/main.ts`.
- The workshop already behaves like a meaningful progression gate:
  - it appears only when in reach,
  - it hides while the map is open,
  - it exposes module choices that change vehicle capability.
- The remaining gap is discoverability and focus:
  - `#workshop-panel` is only a labeled section,
  - it does not have a dedicated focus entry or restore path,
  - its appearance is not explicitly announced as a new capability moment.
- So the player can reach and use the workshop, but the repo still lacks a
  durable non-visual contract for the moment the workshop becomes relevant.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this pass.

## Addendum (2026-07-26) - save and recovery are truthful, but the announcement path is still only implicit

- Re-checked `index.html` and `src/main.ts` against the save-status path.
- The persistence state is already honest:
  - `#save-status` receives fresh, restored, migrated, recovered, fallback,
    and reset messages,
  - the message is kept visible in the public shell,
  - bootstrap state remains separate and already announced.
- The remaining gap is announcement:
  - `#save-status` is still only a visible text field,
  - it is not marked as a live region or otherwise named as a dedicated
    recovery announcement contract,
  - the player can read the state, but the state change is not explicitly
    announced.
- So the repo already has truthful persistence messaging, but it still lacks a
  durable non-visual save/recovery announcement path.
- Evidence depth: Tier 1 static source inspection. No browser or screen-reader
  walkthrough was run in this pass.

## Addendum (2026-07-26) - the active comfort/profile state still needs a player-facing signal

- Re-checked `src/main.ts`, `src/game/renderer.ts`, and the browser-delivery
  trail in the current worktree.
- The public shell already supports real focus, keyboard/touch operability,
  reduced-motion awareness, and visible bootstrap/save/fallback messaging.
- The remaining gap is not another input fix; it is a player-facing comfort or
  profile indicator that says what profile is active without requiring
  developer diagnostics.
- That makes the browser-delivery contract the policy owner for when the
  profile must be visible, while accessibility owns the visible shape and
  announcement path.
- Evidence depth: Tier 1 static source inspection. No runtime or browser
  walkthrough was run in this pass.

## Addendum (2026-07-26) - the map overlay is the next missing focus-managed browser boundary

- Re-checked `index.html`, `src/main.ts`, and `src/styles.css` against the map
  overlay interaction in the current worktree.
- The map overlay is already a meaningful mode switch:
  - `state.mapOpen` suppresses some input affordances,
  - `mapOverlay.hidden` toggles the full-screen overlay,
  - `Escape` closes the map before pause.
- The remaining gap is the explicit dialog/focus contract:
  - `#map-overlay` is still only a labeled section in markup,
  - it does not declare `role="dialog"` or `aria-modal="true"`,
  - focus does not move into the overlay when it opens,
  - focus does not restore to the opener when it closes.
- This means the browser surface is operable, but the map mode is still not a
  first-class accessible dialog boundary.
- Evidence depth: Tier 1 static source inspection. No runtime assistive-tech
  walkthrough was run in this pass.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this accessibility/profile analysis. This document
still owns the accessible-profile and focus-boundary frame; the new note
carries the wider machine-keeper thesis and long-range product direction.

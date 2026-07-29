# Mission Acceptance Surface Contract (2026-07-28)

**Status:** proposed player-choice contract - not implemented as a separate
authority layer  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related loop contract:** [Core Loop and Progression Contract](./CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md)  
**Related read surface:** [Contract Ledger Specification](./CONTRACT_LEDGER_SPEC_2026-07-27.md)  
**Related shell contract:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related wiring probe:** [Wiring Experiment: Radial Quick-Action, Weather, and Fleet Recovery](../exploration/WIRING_EXPERIMENT_RADIAL_WEATHER_RECOVERY_2026-07-28.md)

## Purpose

Define the player-facing acceptance surface that sits above the read-only
contract ledger.

The contract ledger can continue to project rows from `publicState` and
authored affordances. The acceptance surface is the interaction contract that
lets the player inspect, compare, and accept one of those rows without turning
the board into a second mission authority.

This note exists because the current runtime already proves the split between
derived propositions and consequence, but the repo still lacks a named
contract for the act of choosing from those propositions in a way that is
legible, reachable, and accessible.

## Current sources this surface may read

The acceptance surface should be derived from existing surfaces rather than
inventing its own world model:

- `publicState(state, world)` in `src/game/state.ts`
- derived proposition logic in `src/game/mission-propositions.ts`
- command/result handling in `src/game/mission-resolver.ts`
- progression consequence handling in `src/game/progression.ts`
- reason-coded affordance resolution in `src/game/affordances.ts`
- the read-only board projection defined in `docs/research/CONTRACT_LEDGER_SPEC_2026-07-27.md`
- the overlay and focus rules defined in `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`

The surface is therefore a projection plus an interaction contract. It is not
a second save schema, and it is not a second quest engine.

## Decision

The acceptance surface must make one thing true:

> the player can tell what is available, why it is available or deferred, and
> how to choose it without reading internal module names.

That means the surface must support:

- a readable list or row set of propositions,
- a clear selected state,
- a clear primary action for the selected proposition,
- a visible and spoken reason when the proposition is deferred or unavailable,
- a clear path back to play after acceptance or dismissal.

The board may render these rows however the shell team chooses, but the
contract must preserve the distinction between:

- projection of options,
- player choice,
- authoritative simulation result.

## Interaction contract

Each acceptance-surface row should be able to answer four questions:

1. What is this?
2. Why is it here now?
3. What happens if I accept it?
4. Why can’t I accept it yet, if it is deferred?

Recommended row semantics:

- one row per proposition or gate,
- one focusable target per row,
- one explicit primary action such as `Accept`,
- one explicit secondary action such as `Inspect` or `Back`,
- one visible reason string for deferred or hidden state.

The surface should not rely on color alone to communicate status. Available,
active, and deferred states must each have text that can be read aloud.

## Accessibility contract

This is the lens that makes the acceptance surface usable rather than merely
present:

- major overlays should preserve semantic landmarks,
- the selected row should be reachable by keyboard without pointer use,
- focus must be restored when the surface closes,
- the current selection and status should be announced through text,
- touch targets must remain large enough for mobile use,
- icon-only controls must have names,
- `Escape` or an equivalent cancel action must return to play,
- the surface must never create a keyboard trap,
- screen-reader output should distinguish status, reason, and action.

Recommended implementation details:

- use semantic list or table markup for the row set,
- use a roving-tabindex or equivalent focus model only if the row count makes
  it necessary,
- expose the active row with `aria-selected` or a clearly labelled equivalent,
- announce changes with a live region when the accepted proposition changes
  the player-visible state.

## Lifecycle

The surface should follow a fixed route:

1. Read propositions from the current runtime state.
2. Project them into a readable board or ledger view.
3. Let the player inspect a row.
4. Let the player accept or dismiss that row.
5. Pass acceptance to the existing command/result path.
6. Refresh the board from the updated runtime state.

The surface does not own the simulation result. It only owns the choice
moment.

## Validation rules

The contract should fail visibly if it:

- hides the reason a proposition is available or deferred,
- accepts a proposition without a clear command/result boundary,
- creates a second mission authority,
- leaves the player without a reachable keyboard path,
- leaves screen-reader users without a status or action name,
- turns the board into a mutation path,
- loses the distinction between a read-only proposition and an accepted action.

## Out of scope for this first slice

- No new mission generator.
- No new save schema.
- No second quest ledger.
- No direct runtime mutation from the board.
- No separate progression authority.
- No replacement for the current loop contract.

## Near-term proof slice

The smallest proof that satisfies this contract is:

1. one readable board or list of propositions,
2. one selected row with a visible and spoken status,
3. one explicit accept action for the selected row,
4. one explicit dismiss or back action,
5. one accessible keyboard path that works without pointer input,
6. one mobile/touch path that preserves the same choice semantics,
7. one visible return to play after acceptance or dismissal.

## Open questions

- Should the board keep the current ledger vocabulary, or should the visible
  choice surface use a more direct player-language label?
- Should acceptance open a subpanel or should the selected row itself become
  the choice surface?
- Should deferred propositions stay visible in the same list, or move to a
  separate unavailable section?
- How much explanation should live on the row versus in the detail pane?

## Accessibility follow-through

This contract deliberately depends on the accessibility analysis in
`ACCESSIBILITY_AND_PROFILE_VISIBILITY_LIVE_REPO_ANALYSIS_2026-07-26.md`.
The next proof slice for the board is not just that it can render rows; it is
that the board can:

- receive focus predictably,
- announce the selected row and its reason,
- expose an explicit accept / dismiss action,
- and restore the player to the world without losing context.

That keeps the acceptance surface aligned with the shell contract rather than
inventing a new accessibility model.

## Row model follow-through

The concrete row and announcement contract now lives in
[Mission Acceptance Row and Announcement Contract](./MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md).

That note turns the abstract choice surface into a browser-facing row model:

- world state describes the proposition,
- selection describes the browser focus state,
- announcement describes what the player hears or reads,
- accept/dismiss stays explicit and reversible.

## Sectioning and visibility follow-through

The compact, sectioned presentation contract now lives in
[Mission Acceptance Section and Visibility Contract](./MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md).

That note answers the remaining board-shape question:

- which rows are shown first,
- how compact versus expanded view behaves,
- and how the board keeps history legible without overwhelming the choice
  surface.

## Header follow-through

The board header and summary contract now lives in
[Mission Acceptance Board Header and Summary Contract](./MISSION_ACCEPTANCE_BOARD_HEADER_AND_SUMMARY_CONTRACT_2026-07-28.md).

That note gives the board a single concise header so the player can orient
themselves before selecting a row.

## History follow-through

The history retention and recap contract now lives in
[Mission Acceptance History and Recap Contract](./MISSION_ACCEPTANCE_HISTORY_RECAP_CONTRACT_2026-07-28.md).

That note keeps older outcomes visible in a bounded way so the board does not
lose the current choice under a pile of prior results.

## Transition follow-through

The open, mode-change, and restore choreography now lives in
[Mission Acceptance Transition and Restore Contract](./MISSION_ACCEPTANCE_TRANSITION_AND_RESTORE_CONTRACT_2026-07-28.md).

That note keeps the board feeling like one recoverable interaction surface
rather than a sequence of unrelated pages.

## Empty-state follow-through

The empty-state and fallback behavior now lives in
[Mission Acceptance Empty State and Fallback Contract](./MISSION_ACCEPTANCE_EMPTY_STATE_AND_FALLBACK_CONTRACT_2026-07-28.md).

That note keeps the board from looking broken when there are no meaningful
rows to show.

## Loading follow-through

The loading and refresh behavior now lives in
[Mission Acceptance Loading and Refresh Contract](./MISSION_ACCEPTANCE_LOADING_AND_REFRESH_CONTRACT_2026-07-28.md).

That note keeps the board from looking empty while rows are still being
rebuilt or refreshed.

## Anything else?

Yes. This note keeps the acceptance surface honest about what it is not. It is
not the simulation authority, and it is not a second progression ledger. It is
the reachable, accessible choice layer that lets the player select a derived
proposition without having to understand the repository's internal module
names.

## Addendum (2026-07-28): the current runtime still only exposes a survey banner, not a full board

- Re-checked the live browser surface after the shell and input inspection.
- The public DOM currently exposes a `survey-contract` banner in the field-kit
  HUD, which is the only contract-shaped runtime text visible in the shell.
- There is still no dedicated `openContractBoard` runtime action or overlay
  branch in `src/main.ts`, so the named acceptance surface remains a spec-level
  projection rather than a mounted player surface.
- That means the next proof is not more contract vocabulary; it is a focus-safe,
  reachable board that can sit on top of the existing survey banner without
  becoming a second authority.
- Evidence depth: Tier 4 live browser inspection plus Tier 1 source inspection.

## Addendum (2026-07-28): the runtime also has hidden acceptance hooks, but not a mounted board

- Re-checked the public shell with a browser probe in the canonical
  `field-02` acceptance path.
- The live DOM contains latent mission acceptance controls:
  - `#mission-board-button` with the visible label `Contracts`
  - `#mission-board-close`
  - `#mission-briefing-accept` with the visible label `Accept contract`
- Those hooks are present in the DOM but not visible or directly clickable in
  the ready shell, which is why the click probe timed out on visibility rather
  than missing-node lookup.
- This tightens the boundary rather than changing it:
  - the repo has acceptance-surface plumbing,
  - but the player still does not have a mounted, discoverable, focus-safe
    board in the public ready state.
- So the next proof remains the same product gate, but with a more precise
  implementation target: surface the latent hooks in a reachable board without
  promoting them into a second authority.

## Addendum (2026-07-28): the runtime also exposes a passive survey status, so the surface is split across layers

- A follow-up probe on the public shell at `http://localhost:4173/` found a
  hidden `#survey-contract` banner in the field-kit HUD with live text
  fragment `Contract ready`.
- That banner is useful status feedback, but it is still not the selectable
  row model this contract describes.
- The current runtime therefore splits the acceptance story across three
  layers:
  - passive survey status,
  - hidden acceptance hooks,
  - and no mounted player-facing board.
- That split is important because it prevents the repo from collapsing all
  contract-shaped UI into a single missing feature. The question now is how to
  mount the board cleanly on top of the already-existing status plumbing.

## Addendum (2026-07-28): the board is mounted on desktop, but the mobile shell hides its trigger cluster

- A desktop-sized browser probe at `1440 x 900` showed `#mission-board-button`
  rendered as a visible control in the masthead.
- Triggering that control mounted `#mission-board` as a visible overlay with
  the header `Field contracts` and the subtitle `Choose what pulls you next`.
- The open board exposed a row set and briefing content, which means the
  runtime does already have a mounted acceptance surface in the desktop-ready
  path.
- The mobile-sized shell at `390 x 844` still hides `.masthead__buttons` via
  CSS, so the same board is not discoverable from the compact ready view.
- The current product boundary is therefore viewport-specific, not binary:
  desktop exposes the acceptance surface; the narrow/mobile shell suppresses
  the trigger cluster and keeps only the textual status hints.
- The next proof question is whether that exposure policy is intentional and
  acceptable, or whether the compact shell should surface the same board entry
  path in a narrower form.

## Addendum (2026-07-28): the compact shell still has no alternate contract-board entry path after entering the world

- A compact-viewport probe after entering the field still showed no visible
  contract-board trigger path beyond the hidden masthead cluster.
- The survey banner remains passive status text, and the mission board remains
  inaccessible from the ready compact view.
- That means the compact/mobile shell currently has:
  - status hints,
  - hidden acceptance plumbing,
  - and no alternate entry affordance once the field is active.
- This is the current product boundary to keep in mind when deciding whether
  the desktop-first contract board exposure is intentional or whether the
  compact shell should gain a smaller entry path.

## Addendum (2026-07-28): pause, touch, and keyboard paths still do not expose contracts on compact/mobile

- A source scan of the shell actions found no alternate compact entry path
  through pause, touch, or keyboard affordances.
- The named shell actions cover map, radar, pause, workshop, recovery,
  camera, and related in-world verbs, but not a compact board trigger.
- That means the absence on compact/mobile is broader than the masthead button
  cluster: the compact shell currently does not expose any alternate contract
  affordance at all.
- The product question is now explicit:
  - either the compact shell stays board-free and desktop-first,
  - or a smaller contract entry path gets added as a new shell affordance.

## Addendum (2026-07-28): the compact DOM still carries hidden board controls, but not a usable affordance

- A compact-viewport probe at `390 x 844` found the following contract-related
  controls in the DOM:
  - `#mission-board-button` (`Contracts`)
  - `#reset-button` (`Reset field`)
  - `#mission-board-close` (`Close`)
  - `#mission-briefing-accept` (`Accept contract`)
  - `#enter-world` (`Enter the field`)
- All of those controls were hidden in the compact shell at the time of the
  probe, so they are latent implementation hooks rather than reachable user
  affordances.
- The same probe also showed a visible `#map-layer-field` control and the
  passive `#survey-contract` status, which means the compact shell still
  separates map/status plumbing from player choice.
- This sharpens the contract boundary: compact/mobile does not lack the
  underlying controls, but it still lacks a discoverable, focus-safe way to
  reach the contract board from the ready shell.

## Addendum (2026-07-28): the canonical browser shell now mounts a live, stateful mission board dialog

- Opening `Contracts` in the live shell moved focus to `#mission-board-close`.
- The board opened as `role="dialog"` with `aria-modal="true"`.
- The first proposition row was marked selected with `aria-pressed="true"`.
- `Accept contract` became enabled once the selected row was present.
- The board remained a distinct overlay surface rather than replacing the
  whole shell.
- The current runtime therefore proves the acceptance surface is real in the
  browser, not just in the design note.

## Addendum (2026-07-29) - ADR-0039 keeps this player-choice surface on the public-shell side

This acceptance-surface contract now sits alongside the browser-policy split
named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- `#runtime-diagnostics` remains on the acceptance/developer side of the
  split, where deeper runtime reasoning can stay readable without becoming
  public HUD clutter.

That keeps the choice surface focused on player decision-making, while the
diagnostics lane remains separate for operators and reviewers.


## Addendum (2026-07-29) - the board is live on desktop, so the next question is compact exposure policy

- Re-read the mission acceptance surface contract against the current shell and accessibility notes.
- The runtime already proves the desktop choice surface exists and is mounted as a live board overlay, while the compact/mobile shell still hides the trigger cluster and keeps only passive status hints.
- That means the next product question is no longer whether the board exists. It is whether the compact shell should stay board-free and desktop-first, or gain a smaller entry path that keeps the same choice semantics.
- The important constraint is unchanged: whatever exposure policy is chosen, the board must remain a choice layer, not a second mission authority or a second progression ledger.
- Evidence depth: Tier 1 static synthesis from the current contract trail. No new runtime probe was run in this addendum.

Anything else? Yes: the board is a real surface already; the next durable decision is how much of it compact/mobile should expose.

## Addendum (2026-07-29) - the next surface proof is a compact-shell-visible entry path, not another desktop overlay

- The desktop board already proves the choice layer is real.
- The next proof slice should therefore be a compact-shell-visible entry path
  that preserves the same choice semantics:
  - discoverable from the ready shell;
  - focus-safe;
  - readable in the same terms as the desktop board;
  - and still not a second mission authority or progression ledger.
- That keeps the surface contract focused on exposure policy rather than on
  inventing a second board.
- Anything else? No. The compact shell should either surface the board in a
  smaller form or clearly remain board-free by policy, but it should no longer
  be left in a vague hidden state.

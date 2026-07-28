# ADR-0035 — The Pegboard runs live, with an accessibility opt-in that pauses

- Date: 2026-07-28
- Status: **Accepted by direct operator direction; modality implemented and
  verified** for desktop keyboard and pointer. Geometry, contents, and visual
  design remain Proposed; narrow-viewport and touch evidence is still open.
- Owner: Rigs Unbound interface shell
- Scope: **narrow.** This ADR decides _when time passes_ while the player
  changes a rig tool state. It does not accept the radial geometry, the tool
  list, or any individual verb's design.
- Related: [Next Five — The Reachability Tranche](../plans/NEXT_FIVE_REACHABILITY_TRANCHE_2026-07-28.md),
  [Unified UI Shell Specification](../research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md),
  ADR-0010 (rendering/accessibility contract), ADR-0020 (contextual first-use guidance)

## Context

The Pegboard is the proposed 1,000-foot interface layer: a quick surface showing
what the rig is doing right now and at what cost, hosting tool states such as
tyre pressure and differential lock. `radial-ui.ts` exists, is tested, and is
unreachable.

One question had to be answered before any of it could be built, because it
determines what the verbs _mean_:

> When the player changes a tool state, does the world keep running?

The two honest positions:

- **Pausing** is more readable, far easier to make accessible, and matches the
  existing overlay and focus-trap contract from the UI shell slice. But a tool
  choice made outside of time is inventory management. The Skeptic's warning
  about the contract ledger applies identically here: the failure mode of this
  project's interface work is producing lists to browse.
- **Live** keeps the pressure that makes airing down _mid-climb_ a decision
  rather than a preference. The Missing Middle diagnosis says the absent thing
  is precisely **coping under pressure**. A tool surface that removes pressure
  would fill the gap with the wrong substance.

## Decision

1. **The Pegboard runs live by default.** Opening it does not pause, slow, or
   otherwise suspend the fixed-step simulation. A tool change is an action taken
   _during_ the situation that motivated it.
2. **An accessibility opt-in pauses it.** A setting makes the Pegboard suspend
   the world while open. It sits with the existing comfort settings, alongside
   reduced motion, and is discoverable rather than hidden.
3. **The opt-in is a comfort setting, not a difficulty setting, and it is not
   framed as one.** Per the accepted accessibility baseline, assist options must
   not shame the player. It carries no penalty, no marker, and no reward
   difference.
4. **Neither mode may become a second simulation authority.** Pausing suspends
   the existing fixed-step loop through the canonical pause path; it does not
   introduce a separate time source, a slow-motion factor, or a parallel update
   ordering.

## Options considered

- **Always pause.** Rejected: it converts tactical commitments into inventory
  management and undercuts the reason the verbs are being wired at all.
- **Always live, no opt-in.** Rejected: it makes a comprehension and tool-state
  surface into a dexterity requirement, which fails the accepted accessibility
  baseline for hold/toggle alternatives and assist options.
- **Slow-motion while open.** Rejected: it is a third time regime, it complicates
  deterministic replay, and it makes the cost of opening the surface unclear to
  the player.
- **Live by default with a pause opt-in.** Chosen by direct operator direction.
  It preserves the pressure that gives the verbs meaning while keeping the
  surface operable for players who cannot act under time pressure.

## Consequences

- Tool states must be **readable at a glance under motion**. This constrains the
  design harder than a paused surface would: large targets, states legible
  without reading numbers, and no information that only makes sense when still.
- The opt-in must route through the canonical pause path, so pausing behaviour
  stays identical whether the player pauses deliberately or via this setting.
- Replay must record the tool-state command, not the surface interaction. What
  the player did is durable; how long their menu was open is not.
- Touch parity is now load-bearing: a live surface on a narrow screen with a
  moving rig is the hardest case, and it should be designed for first rather
  than adapted to afterwards.

## Validation — implemented 2026-07-28

- **Live by default.** With the Pegboard open, `render_game_to_text()` reports
  `paused: false`. The overlay path never calls `togglePause` unless the opt-in
  is set.
- **Opt-in pauses and restores.** `setPegboardPausesWorld(true)` then opening
  reports `paused: true`; closing reports `paused: false`. It routes through the
  canonical `togglePause`, and it only un-pauses a pause it created — so a
  player who paused deliberately before opening stays paused.
- **Keyboard parity added.** The wheel was reachable only from a touch button,
  which failed this ADR's own parity gate. `Q` now opens and closes it, and the
  keyboard legend lists it.
- **Projections, not stored state.** Entries come from
  `deriveRigToolProjections()`. `RadialMenuItem.active` is no longer gameplay
  authority. Live capture:

  ```text
  Air down · 16 PSI      [pressed=false]  "More float in mud. Slower on hardpan."
  Air up · 32 PSI        [pressed=true ]  "Faster on hardpan. Digs in on soft ground."
  Differential · open    [pressed=false]  "Open: turns freely, spins a wheel in mud."
  Winch                  [disabled]       "No winch fitted."
  ```

- **Commitments persist.** Aired down to 16 PSI and cycled the differential,
  reloaded, and both survived; the wheel re-derived `pressed` correctly.
- **Every entry states its cost**, enforced by a test rather than by review.
- Zero console errors across the whole flow.

### Still open

Narrow-viewport (390×840) and real-touch capture, and reduced-motion/focus-order
evidence against the unified shell spec, are not yet recorded. The desktop
keyboard and pointer paths are proven; this ADR does not claim the mobile half.

## Rollback and revisit triggers

Revisit if:

- live operation proves unreadable in play, in which case the honest response is
  fewer tools on the surface rather than pausing by default;
- external playtest shows the opt-in is undiscoverable, which is a settings-IA
  problem rather than a modality problem;
- a later tool genuinely cannot be operated safely under motion, which would
  argue for that tool living somewhere else rather than for changing the mode.

## Update log

- 2026-07-28: Recorded after direct operator selection of "live, with a mix of
  the accessibility opt-in" when the two positions were put side by side.

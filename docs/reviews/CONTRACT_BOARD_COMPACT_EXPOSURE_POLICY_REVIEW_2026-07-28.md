# Contract Board Compact Exposure Policy Review

**Date:** 2026-07-28  
**Status:** Open shell policy decision  
**Severity:** P2 player-facing discoverability gap on compact/mobile  
**Evidence tier:** Tier 4 runtime/browser inspection plus Tier 1 static source inspection

## Finding

The contract board is real and mounted in the desktop-ready runtime path, but
the compact/mobile shell does not expose any alternate entry path to it.

Live evidence shows:

- the desktop viewport (`1440 x 900`) can open the `Contracts` masthead button
  and mount the `Field contracts` board overlay;
- the compact viewport (`390 x 844`) hides `.masthead__buttons` through CSS;
- after entering the field on the compact shell, there is still no visible
  contract-board trigger path;
- the compact shell also has no alternate contracts route through pause,
  touch, or keyboard affordances;
- the runtime profile still reports `standard` awaiting evidence, so the
  missing compact entry path is not a `mobile-safe` quality fallback issue.

That makes the remaining question a shell exposure policy decision, not a
runtime board-existence problem.

## Why this matters

The current state is coherent but asymmetric:

- desktop users can discover and open the contract board;
- compact/mobile users only see the passive survey/status hints;
- the compact shell does not currently offer a smaller trigger for the same
  board.

That may be acceptable if the product intentionally wants a desktop-first
contracts surface. It may be unacceptable if the compact shell is supposed to
keep the same choice layer discoverable on small screens.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` | Shell owns overlay boundaries and input parity | Canonical shell contract |
| `docs/research/MISSION_ACCEPTANCE_SURFACE_CONTRACT_2026-07-28.md` | Player-choice surface above the ledger | Canonical choice contract |
| `docs/research/MISSION_ACCEPTANCE_ROW_AND_ANNOUNCEMENT_CONTRACT_2026-07-28.md` | Row selection and announcement behavior | Canonical row contract |
| `docs/research/MISSION_ACCEPTANCE_SECTION_AND_VISIBILITY_CONTRACT_2026-07-28.md` | Board sectioning and compact/expanded shape | Canonical section contract |
| `docs/research/VISIBILITY_PROFILE_SELECTION_DESIGN_2026-07-26.md` | Renderer-quality tier policy | Canonical visibility-profile policy |
| `docs/research/3D_GAME_SKILL_APP_ANALYSIS_2026-07-28.md` | Live browser gap analysis | Runtime/browser evidence summary |
| `docs/reviews/CONTRACT_BOARD_COMMAND_BOUNDARY_ISSUE_REVIEW_2026-07-28.md` | Prior boundary review | Current runtime/open-gap framing |

## Options considered

### 1. Keep desktop-first contract-board exposure

This keeps the current behavior as-is:

- the desktop shell exposes the contracts overlay;
- the compact/mobile shell keeps status hints and avoids extra chrome;
- the board remains discoverable where the masthead cluster is visible.

Pros:

- preserves compact-shell clarity;
- keeps the status rail lightweight;
- avoids crowding the mobile header with another persistent control.

Cons:

- compact/mobile users do not get a direct route into the contract board;
- the same choice surface is not equally discoverable across viewports.

### 2. Add a smaller compact contract trigger

This keeps the board desktop-capable but adds a smaller board entry path for
compact/mobile, likely in the status/prompt strip or pause overlay.

Pros:

- makes the contracts surface discoverable on small screens;
- keeps the player-choice layer consistent across device classes;
- avoids requiring a desktop viewport to reach the board.

Cons:

- adds another visible control to the compact shell;
- risks crowding the already busy status/prompt strip;
- needs a deliberate focus/fallback design so it does not become a second
  hidden route.

### 3. Auto-open the board on mobile entry

This would surface the board automatically when the player enters the field on
compact/mobile.

Pros:

- guarantees discoverability.

Cons:

- feels intrusive;
- risks turning the choice surface into a forced interruption;
- weakens the shell's clarity-stack posture.

## Recommendation

Keep the current desktop-first exposure policy unless the compact/mobile
product requirement explicitly changes.

If the project later wants compact/mobile contracts discoverability, the
smaller trigger should be added as a deliberate shell affordance in a compact
location, not as a quality-profile fallback and not as an auto-open interrupt.

That keeps the policies separate:

- visibility profile policy governs scene quality and performance fallback;
- shell exposure policy governs whether the contract board is discoverable.

## Closure trigger

This review closes only when one of the following is true:

1. the project explicitly accepts desktop-first contracts as the intended
   public policy; or
2. a compact/mobile board entry affordance is added and documented as a shell
   exposure change.

## Addendum (2026-07-28): the compact shell has hidden controls, but they are not yet an affordance

A follow-up compact probe at `390 x 844` found these contract-related
elements in the DOM:

- `#mission-board-button` (`Contracts`)
- `#reset-button` (`Reset field`)
- `#mission-board-close` (`Close`)
- `#mission-briefing-accept` (`Accept contract`)
- `#enter-world` (`Enter the field`)

They were all hidden at the time of the probe, which means the compact shell
has latent contract plumbing but still does not expose a reachable or
focus-safe board entry path. The policy question is unchanged, but the runtime
evidence is sharper now: this is not a missing implementation block so much as
an explicit exposure decision.

## Anything else?

Yes. This review is intentionally narrower than a product decision about the
board itself. It only answers the exposure question: should compact/mobile keep
the board hidden, or should the shell give it a smaller entry point?

## Addendum (2026-07-29) - the compact shell still keeps the contracts cluster hidden from the accessibility tree

A fresh compact/browser probe at `390 x 844` on the canonical shell confirms the
policy has not shifted:

- `#mission-board-button` exists in the DOM but has zero layout size and no
  accessible presence;
- `#reset-button`, `#mission-board-close`, and `#mission-briefing-accept` show
  the same hidden treatment;
- the accessibility tree exposes `Skip to playable world`, the warmup dialog,
  `Drive to the nearby first cache and recover 5 salvage.`, `Field prompt`,
  `Save status`, `Quality profile`, and `Enter the field`, but not the contracts
  cluster itself.

That means the compact shell still does not offer a discoverable contract-board
entry path. The current policy remains desktop-first exposure with latent hidden
plumbing on compact/mobile, which is an intentional shell boundary rather than a
missing implementation.

## Addendum (2026-07-29) - ADR-0039 is the browser-policy name for this exposure split

This exposure review now sits under the same browser-policy decision trail
named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible to the player;
- acceptance/developer surfaces can carry the deeper runtime summary while the
  compact shell keeps the contracts cluster hidden by policy.

That keeps the review focused on exposure policy rather than on whether the
contracts board exists at all.

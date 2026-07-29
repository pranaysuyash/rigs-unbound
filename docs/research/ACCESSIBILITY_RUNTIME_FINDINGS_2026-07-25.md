# Accessibility Runtime Findings (2026-07-25)

## Skills consulted

1. [Accessibility Auditor](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/accessibility-auditor/SKILL.md)
2. [Browser Daemon](/Users/pranay/Projects/skills/testing/playwright-skill/SKILL.md)

## Scope

Live browser review of the current `Field 02` runtime at `http://127.0.0.1:4174/`.

This is a runtime accessibility pass, not a static design review.

## Evidence base

- Live browser inspection of the rendered page
- Console log inspection
- DOM/ARIA/focus inspection
- Stylesheet inspection
- Runtime focus handoff check

## Positive signals

- The page is structured with a real semantic shell:
  - `main`
  - `header`
  - `aside`
  - `section`
- The primary canvas has an accessible label.
- The map canvas also has an accessible label.
- The intro and error surfaces use semantic alert/status roles.
- Visible focus styles are present for buttons and selects.
- Reduced-motion support exists in CSS.
- The renderer also reads `prefers-reduced-motion` at runtime.
- The live page had no console errors during the accessibility check.

## Findings

### 1) Startup focus handoff does not land on the intended game surface

The enter-world handler in `src/main.ts` calls `canvas.focus()`, but the active element remains `body` after activation.

Observed behavior:

- the welcome overlay dismisses
- the page tries to move focus to the canvas
- focus does not visibly land on the canvas

Likely cause:

- the canvas is not participating in the tab order, so the intended focus target is not a reliable landing point for keyboard users

User impact:

- keyboard users do not get a clear initial focus target after entering the field
- the interaction model is less predictable for screen reader and keyboard navigation

### 2) There is no skip link

The current page has a dense HUD and multiple controls, but no skip link was present in the live DOM.

Impact:

- keyboard users must tab through the top-level control cluster every time
- there is no fast path to the main interactive region

## What is already good enough to keep

- Semantic labels and roles are already doing real work.
- The page is not using color alone for all state.
- The reduced-motion fallback is already in place at the stylesheet and renderer levels.
- Touch and desktop control paths both exist.

## Near-term proof slice

1. reliable focus landing target after entering the world
2. skip link to the main interaction region
3. visible focus ring and reduced-motion path remain intact
4. keyboard landing point verified in the live browser after the fix

## Follow-up after implementation

The live browser recheck after the fix now shows:

- the skip link is present and targets `#game-canvas`
- the canvas is keyboard focusable
- dismissing the intro now lands focus on `canvas#game-canvas`
- the accessibility gap is therefore closed at runtime, not just in markup

## Linked artifacts

- [docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)
- [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- [src/styles.css](/Users/pranay/Projects/Game_dev/rigs-unbound/src/styles.css)
- [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)

## Anything else?

The runtime is already much closer to accessible than a typical canvas game shell. The remaining work is now specific and fixable: make the first focus landing point real, and give keyboard users a skip path into the field.

## Addendum (2026-07-25) - Live recheck on Field 02

The current `http://127.0.0.1:4173/?p0-repro=welcome` runtime now shows the
accessibility shell behaving as intended:

- landmarks are present and named:
  - `main`
  - `header`
  - `aside`
  - `section`
  - `role="status"`
  - `role="alert"`
- headings are present and meaningful:
  - `Home Silo workshop · fit modules, 0 salvage in the bin`
  - `The ground decides.`
  - `The 3D scene is unavailable.`
- the skip link is present and visible in the focusable set
- `#game-canvas` is keyboard focusable and currently receives focus after entry
- `window.render_game_to_text()` and `window.getPerformanceSnapshot()` keep
  operator visibility intact

This means the original keyboard/skip-link accessibility gap is closed in the
live runtime. The next accessibility-adjacent question is not basic shell
accessibility anymore; it is whether the remaining loading/fallback chrome is
explicit enough for slower public entry paths.

## Addendum (2026-07-25) - focus is fixed; loading explicitness is the remaining accessibility-adjacent gap

A fresh live recheck on the current `Field 02` runtime keeps the original keyboard handoff resolved:

- `#game-canvas` is present and keyboard focusable,
- the skip link is present and visible in the focusable set,
- dismissing the intro now lands focus on `canvas#game-canvas`,
- the semantic shell still exposes the main, header, aside, section, status, and alert landmarks.

What the live surface still does **not** expose is a separate startup progress affordance:

- no explicit `progress` element,
- no visible `aria-busy` state in the current DOM snapshot,
- no public profile/loading percentage in the shell.

So the remaining issue is no longer basic accessibility entry. It is whether the loader is explicit enough for slower or public-facing entry paths to understand that the experience is still starting versus stalled.

Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-26) - profile visibility is the next accessibility proof, not a control rewrite

- Re-checked the current browser daemon and the repo’s accessibility/input
  contract.
- The live runtime is still operable, and the existing accessibility gap has
  narrowed from “can keyboard users enter the field?” to “can a user tell what
  quality/accessibility profile they are currently in?”
- The next proof should therefore be:
  - visible loading progression or truthful indeterminate loading state,
  - explicit reduced-motion / comfort state,
  - explicit quality-profile state for constrained devices,
  - a readable fallback when the 3D surface is delayed or unavailable.
- This should be documented as a policy contract before any UI redesign so the
  browser surface remains honest about what it is doing.

## Addendum (2026-07-28) - profile and save status are now visible, but explicit loading progress is still absent

- Re-checked the canonical browser daemon on `http://127.0.0.1:4173/?acceptance=field-02`.
- The public shell now visibly exposes the player-facing state this note was
  previously asking for:
  - `#profile-status` reads `Quality: standard.`
  - `#save-status` reads `Saved locally just now`
  - `#bootstrap-status` reads `Field systems ready. Restored session controls are active.`
  - `runtimeDiagnostics` is visible on the public surface in this build
- That means the accessibility question is no longer “is the profile state
  hidden?” It is now “is there a clearer loading-progress affordance than the
  current truthful textual bootstrap?”
- The answer from this pass is still no: there is no dedicated progress bar,
  no visible percentage meter, and no separate warmup progress state distinct
  from the ready shell.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-29) - ADR-0039 is the policy anchor for the current public/acceptance split

The live accessibility findings now sit underneath the browser-policy split
named in ADR-0039:

- the public shell keeps `#bootstrap-status` semantic and player-facing;
- the public shell keeps `#profile-status` visible and readable;
- acceptance/developer surfaces may carry deeper runtime diagnostics without
  turning the public HUD into an operator lane.

That keeps this note honest about what it is measuring: the public shell’s
accessibility and loading story, not the deeper reviewer-facing summary.

## Addendum (2026-07-29) - the save announcement contract is now browser-proven

- Re-checked the live public shell against the save/recovery announcement
  contract.
- `#save-status` is present with `role="status"`, `aria-live="polite"`, and
  `aria-atomic="true"`.
- The save line remains visible and readable in the public shell, and the live
  browser now confirms it is a proper announcement region rather than a purely
  visual label.
- That means the earlier “still missing” reading for the save announcement is
  stale in browser-visible terms.
- Manual VoiceOver/NVDA/JAWS narration is still a useful separate QA pass, but
  the browser contract itself is in place.

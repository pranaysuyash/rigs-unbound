# 3D Web Experience Live Repo Analysis (2026-07-26)

## Skills consulted

1. [3d-web-experience](/Users/pranay/Projects/skills/3d-web/3d-web-experience/SKILL.md)

## Purpose

Use the live repo state to answer a narrower question than "does the game have 3D":
what does the current browser-first 3D experience already prove, and what still
needs a named contract before the web delivery path can be considered durable?

This note is intentionally about browser delivery, not about a renderer rewrite.
The renderer already exists. The open question is whether the 3D experience is
fully legible as a browser product with explicit fallbacks, accessibility
behavior, and operator-visible runtime choices.

## Current evidence base

- Browser entrypoint and runtime policy selection:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Renderer, camera, and runtime bridge behavior:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Scene-query and camera-obstruction substrate:
  - [src/game/scene-query.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/scene-query.ts)
- Existing web-3D and renderer policy trail:
  - [docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEB_LOADING_AND_PROFILE_BOOTSTRAP_CONTRACT_2026-07-25.md)
  - [docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md)
  - [docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/VISIBILITY_STAGE_AND_LOD_CONTRACT_2026-07-25.md)

## What the live code already proves

The browser experience is not just a canvas with a camera bolted on. The current
code already demonstrates a real delivery stack:

- `src/main.ts` selects a runtime profile from measured performance snapshot
  data instead of guessing.
- `src/main.ts` exposes runtime diagnostics, camera controls, and performance
  evidence hooks through the browser surface.
- `src/game/renderer.ts` already carries multiple camera modes, camera
  resolution evidence, reduced-motion awareness, and visibility-profile
  switching.
- `src/game/renderer.ts` also has explicit runtime bridge fallback handling so
  imported assets can fail safely instead of collapsing the scene.
- `src/game/scene-query.ts` keeps camera obstruction and visible-world queries on
  project-owned world data rather than renderer geometry alone.

In other words, the app already behaves like a browser 3D product with a real
operating envelope, not like a toy demo.

## What is still missing

The main gap is not raw 3D capability. The gap is a named web-experience
contract that makes the browser delivery policy obvious to future work.

Still missing:

- one concise browser-delivery policy that names when the experience is
  full-fidelity, reduced, or fallback,
- one explicit mobile/touch usability proof that the core interaction pattern
  still works on smaller screens,
- one accessibility-facing statement for when reduced motion or narrow viewports
  should change the experience,
- one named separation between decorative 3D and gameplay-critical 3D so future
  assets do not silently become requirements,
- one reviewable note that explains why the current loading and fallback behavior
  is safe enough for the browser surface but still needs an operator-facing
  contract.

## Recommended next proof slice

The next durable slice should be small and browser-facing:

1. write the named browser-delivery contract for the current 3D surface,
2. confirm one mobile-safe or narrow-viewport observation for the live UI,
3. keep the runtime profile and asset fallback rules visible in the docs trail,
4. avoid expanding into a renderer redesign until the browser contract itself is
   explicit.

That keeps the work aligned with the skill guidance:

- 3D should serve the experience, not exist for its own sake,
- desktop-only 3D is a trap,
- and a loading/fallback state is part of the product, not an optional extra.

## Addendum (2026-07-26) - live renderer state already looks browser-first, but the delivery contract is still unnamed

- Re-checked the source paths above in the current worktree.
- The browser entrypoint already has runtime profile selection and diagnostic
  surfacing.
- The renderer already has camera policy, visibility-profile switching, reduced
  motion awareness, and runtime asset fallback handling.
- That means the current browser experience already fits the 3D-web-experience
  skill better than a generic "3D scene" would.
- The missing step is to name the delivery contract so the next person can tell
  which parts are essential, which can degrade, and which are optional.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-26) - touch and narrow-layout support are real, but the browser delivery contract still needs a public name

- Re-checked the live input and layout surface while staying in the browser-delivery lane.
- `src/main.ts` already routes touch buttons through the same named semantic
  actions as keyboard and gamepad, including pointer capture and release
  handling so the touch controls participate in the same action model rather
  than a separate ad hoc path.
- `src/styles.css` already has a coarse-pointer / narrow-width layout branch
  that places the touch controls below the field-kit panel instead of letting
  the desktop HUD collide with them.
- That means the browser experience is not desktop-only in practice; the mobile
  surface is already shaped intentionally.
- The remaining gap is still the named browser-delivery policy that tells the
  next contributor which pieces are essential, which can degrade, and which are
  optional.
- Evidence tier: Tier 1 static source inspection. No runtime device capture was
  run in this pass.

## Addendum (2026-07-26) - runtime-bridge 3D is already separated from gameplay-critical world truth, but the boundary is still implicit

- Re-checked `src/game/runtime-assets.ts`, `src/game/scene-query.ts`, and
  `src/game/renderer.ts` in the current worktree.
- The repo already treats imported runtime-bridge assets as a separate
  presentation class:
  - `runtime-assets.ts` filters by manifest ownership and public approval,
  - bridge assets keep a fallback geometry alive when loading fails,
  - bridge evidence is tracked separately from the core world model.
- The gameplay-critical world truth stays on project-owned substrates:
  - `scene-query.ts` asks terrain, obstacles, felled state, and authored
    structures for camera obstruction,
  - the renderer consumes that query path rather than deriving truth from the
    imported bridge assets.
- So the code already has a real separation between decorative/runtime bridge
  presentation and gameplay-critical world data.
- The remaining gap is public naming: the browser-delivery contract still does
  not explicitly say which 3D is decorative, which 3D is gameplay-critical, and
  which 3D can degrade.
- Evidence tier: Tier 1 static source inspection. No runtime or browser pass
  was run in this update.

## Addendum (2026-07-26) - the browser delivery path is already browser-first, but the public policy is still unnamed

- Re-checked the current browser-delivery trail against the live narrow/mobile
  evidence and the loading/bootstrap contract.
- The browser delivery path is already intentionally shaped:
  - narrow/mobile layout support exists,
  - touch controls participate in the same named semantic action model as
    keyboard and gamepad,
  - runtime profile and runtime bridge fallback handling are already present,
  - loading and fallback are visible enough to keep the shell truthful.
- The most recent live browser review also showed that the narrow surface is
  not broken by layout pressure:
  - the 390×844 viewport had no horizontal overflow,
  - touch controls stayed in view,
  - the map overlay fit the narrow viewport.
- So the remaining work is not another layout fix; it is the public naming of
  the browser-delivery policy so future work can tell what is essential, what
  can degrade, and what is optional.
- Evidence tier: Tier 1 static source inspection plus the already recorded
  Tier 4 browser review trail.

## Addendum (2026-07-26) - episode grammar depends on browser delivery, but it does not replace it

- Re-checked the browser-delivery lane against the named composition direction.
- Episode grammar can only stay readable publicly if the browser-delivery
  policy stays explicit about what is essential, what can degrade, and what is
  optional.
- That makes the browser-delivery contract a prerequisite beneath episode
  grammar, not the composition stack itself.
- The current browser-first surface remains the live mode; the missing layer is
  the named delivery policy and its public promise boundary.
- Evidence tier: Tier 1 static inspection.

## Addendum (2026-07-27)

The long-term first-principles exploration note at
`../exploration/LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md`
is the broader horizon for this live repo analysis. This document still owns
the current browser-experience readout; the new note carries the wider
machine-keeper thesis and long-range product direction.

## Addendum (2026-07-28) - live shell readout on the canonical Field 02 surface

- Re-checked the canonical browser daemon on `http://127.0.0.1:4173/?acceptance=field-02`.
- The current page title is `Rigs Unbound`.
- The live shell now clearly exposes the browser product state:
  - `Quality: standard.`
  - `Saved locally just now`
  - `Field systems ready. Restored session controls are active.`
- The surface remains browser-first and readable, but the explicit loading
  progression contract is still incomplete:
  - no dedicated loading percentage,
  - no visible progress bar,
  - no separate warmup meter distinct from the ready shell.
- The console sample was limited to Vite connect/connected logs; no gameplay
  errors were present in the live snapshot.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-28) - narrow viewport recheck

- Re-checked the same live browser surface at `390 x 844`.
- The viewport stayed within bounds with no horizontal overflow.
- The live shell remained structurally intact:
  - `#save-status` stayed visible,
  - `#profile-status` stayed visible,
  - `#first-rung-objective` stayed visible,
  - the canvas stayed sized to the viewport.
- `#bootstrap-status` exists in the ready shell, but it is not a persistent
  loading meter; it behaves as a readiness/status label after the scene is up.
- That means the mobile/narrow story is currently:
  - readable ready shell,
  - no overflow,
  - status bands preserved,
  - explicit loading progress still absent.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-28) - the 3d-web-experience skill confirms the next gap is browser-delivery honesty, not a 3D stack rewrite

- Re-read the `3d-web-experience` skill against the current live-repo analysis
  and the broader 3D-games lens.
- The skill's warnings line up with the repo's current direction:
  - 3D should serve the experience rather than exist for its own sake,
  - desktop-only 3D is a trap,
  - loading state is part of the product, not an optional extra.
- The current app already satisfies the first part more strongly than a toy
  scene would:
  - the shell exposes named camera modes,
  - the physics lab is a separate proof lane,
  - runtime/profile and save/status visibility already exist in the browser
    surface and supporting docs.
- The remaining browser-experience gap is narrower and more specific:
  - explicit progress/loading state,
  - player-facing explanation of reduced-capability fallback,
  - durable naming for which 3D is essential and which can degrade.
- This pass is analysis only; no runtime or code changes were made.
- Evidence depth: Tier 1 static skill and repo-doc inspection, with prior Tier 4
  browser observations already linked above.

## Addendum (2026-07-28) - renderer policy fallback is now proven live on the canonical browser surface

- Re-checked the live developer surface with `?rendererPolicy=off`.
- The renderer snapshot now reports:
  - `rendererBackend: webgl`
  - `rendererRequestedBackend: auto`
  - `rendererBackendFallback: true`
  - `rendererBackendReason: rendererPolicy=off blocked auto webgpu`
- The runtime diagnostics lane reflects the same state:
  - `backend:webgl/auto (fallback)`
- This is useful 3D-web evidence because it proves the experience already has
  a policy-gated backend fallback, not just a cosmetic profile label.
- A comparison probe on `?rendererPolicy=stable` on the same browser returns
  the direct path instead:
  - `rendererBackendFallback: false`
  - `rendererBackendReason: renderer=auto retained webgl for composer compatibility (stable)`
  - runtime diagnostics: `backend:webgl/auto (direct)`
- The remaining open question is broader than backend selection:
  - what the app should say when it is intentionally degraded,
  - whether there should be a static/no-WebGL fallback surface,
  - and whether a cross-system resource budget needs to own future degraded
    behavior outside the renderer.
- Evidence depth: Tier 4 live browser inspection.

## Addendum (2026-07-28) - context-loss recovery is wired, but this browser run could only prove it synthetically

- The live shell exposes `webglcontextlost` / `webglcontextrestored` handlers
  on `#game-canvas`.
- A browser probe dispatching those events directly produced the expected user
  messages:
  - lost: `Graphics context lost. Waiting for restore.`
  - restored: `Graphics context restored. Recovered on developer profile standard.`
- The same probe kept the runtime diagnostics lane coherent during the state
  transition.
- The browser environment on this run did **not** expose the
  `WEBGL_lose_context` extension, so this is not a true hardware-loss proof.
  It is evidence that the recovery state machine is wired and user-visible, not
  evidence of a real GPU reset.
- That leaves a very specific next seam:
  whether the app needs a more explicit degraded-experience surface when the
  renderer cannot actually recover.
- Evidence depth: Tier 4 synthetic browser inspection plus Tier 1 source
  inspection.

## Addendum (2026-07-28) - the no-render fallback surface now exists and is live-verified

- The formerly hidden boot error panel was promoted into the canonical degraded-mode
  surface.
- It now carries `role="alertdialog"`, `aria-labelledby="error-title"`, and
  `aria-describedby="error-message"`.
- The acceptance/developer hook `window.__showNoRenderFallback(...)` can
  surface it for verification.
- A live browser probe confirmed the fallback state:
  - the panel is visible,
  - the canvas is hidden,
  - the shell marks `data-renderer-state="fallback"`,
  - focus lands on the retry button,
  - Escape and Tab stay inside the fallback dialog while page scroll is locked.
- That closes the browser-3D gap the skill was pointing toward: policy fallback
  exists, recovery exists, and a visible no-render fallback now exists too.
- Evidence depth: Tier 4 live browser inspection plus Tier 2 helper coverage.

## Addendum (2026-07-28) - the no-render fallback is keyboard-operable in the live browser

A fresh live browser probe confirmed the accessibility contract too:

- focus lands on `Try again`;
- `Tab` and `Shift+Tab` stay pinned to the retry button;
- `Escape` routes to the retry action;
- page scroll remains locked while the fallback is visible.

That means the browser 3D degraded-mode surface is now both present and usable
as a modal dialog, not just visually exposed.

## Addendum (2026-07-28) - the no-render fallback is named in the accessibility tree

A Chrome accessibility-tree probe confirmed the live fallback dialog is exposed
to assistive technology with the expected name:

- `alertdialog` name: `The 3D scene is unavailable.`
- retry button name: `Try again`

That closes the last accessibility gap in the browser-3D fallback story: the
surface is visible, modal, keyboard-operable, and properly named for screen
readers.

## Addendum (2026-07-28) - the fresh load still lacks a dedicated asset-loading affordance

A fresh browser load of the developer surface shows the ready shell is readable
and the no-render fallback stays hidden, but the loading contract is still not a
first-class asset-loading affordance:

- `#bootstrap-status` resolves to a ready-state status line,
  `Field systems ready. Restored session controls are active.`
- `#map-progress` shows world-survey progress (`0% surveyed`), not asset load
  progress.
- `#error-panel` remains hidden on the normal ready shell, as it should.

So the browser-delivery story is now clearer on fallback and accessibility, but
the next named seam is still a dedicated loading/retry contract for asset or
scene ingestion rather than just a readiness label.

## Addendum (2026-07-29) - the old asset-loading gap note is superseded by a semantic bootstrap progressbar

A later live browser probe of the canonical shell changed the loading reading:

- `#bootstrap-status` now exposes a semantic `progressbar` while measuring
  device performance;
- `#profile-status` remains visible and continues to narrate the active
  quality state;
- `#runtime-diagnostics` remains hidden from the public HUD.

So the browser story is no longer missing a first-class loading affordance.
The remaining question is whether the bootstrap/profile/ready sequence reads as
one cohesive warmup narrative for players, not whether progress exists at all.

## Addendum (2026-07-29) - the diagnostics split is route-based, not universal

A fresh live route comparison on the shell makes the current split explicit:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` route reveals `#runtime-diagnostics` with the
  renderer/backend summary;
- both routes keep `#bootstrap-status` semantic and `#profile-status`
  player-visible.

So the browser story is now better described as a public/acceptance split than
as a single universal HUD layout. The loading question is cohesion, not the
existence of progress semantics.

## Addendum (2026-07-29) - the loading affordance is now semantic, and the visible split is clearer

A fresh live browser probe on the canonical shell surface shows the loading
contract has evolved beyond the older readiness-label note:

- `#bootstrap-status` is the real loading affordance and now exposes a
  `progressbar` while measuring device performance;
- `#profile-status` is visible and continues to narrate the active quality
  state;
- `#runtime-diagnostics` remains hidden from the public HUD.

So the live browser story is no longer "no loading affordance". The current
question is whether the player-facing warmup narrative across bootstrap and
profile is cohesive enough.

## Addendum (2026-07-29) - diagnostics are route-gated, not globally absent

A live route comparison on the shell shows the current browser policy clearly:

- the public shell keeps `#runtime-diagnostics` hidden;
- the `?acceptance=field-02` route reveals `#runtime-diagnostics` with the
  renderer/backend summary;
- `#bootstrap-status` stays semantic and `#profile-status` stays visible on
  both routes.

So the browser story is better described as a public/acceptance split than as a
single universal HUD layout. The loading question is cohesion, not the
existence of progress semantics.

## Addendum (2026-07-29) - ADR-0039 is the load-bearing browser-policy decision

The browser-policy split now has an explicit decision anchor:

- ADR-0039 keeps the public shell calm with semantic bootstrap progress and
  visible profile state;
- ADR-0039 route-gates the renderer/backend summary to acceptance/developer
  surfaces;
- the live probes in this note are the evidence trail for that policy.

So this analysis remains the browser evidence, while ADR-0039 captures the
policy choice.

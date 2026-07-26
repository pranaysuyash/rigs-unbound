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

- Re-checked the browser-delivery lane against the episode-grammar direction.
- Episode grammar can only stay readable publicly if the browser-delivery
  policy stays explicit about what is essential, what can degrade, and what is
  optional.
- That makes the browser-delivery contract a prerequisite beneath episode
  grammar, not the story-composition layer itself.
- The current browser-first surface remains the live mode; the missing layer is
  the named delivery policy and its public promise boundary.
- Evidence tier: Tier 1 static inspection.

# Web Loading and Profile Bootstrap Contract (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the browser-facing loading, startup, and profile-selection contract for the current Three.js 3D app.

Linked policy artifacts:

- [ADR-0010: Rendering, accessibility, and motion-safety contract](../decisions/ADR-0010-rendering-accessibility-contract.md)
- [ADR-0015: Renderer and camera policy for v1.x](../decisions/ADR-0015-renderer-camera-policy-v1x.md)
- [ADR-0016: Performance and readability threshold baseline for v1.x](../decisions/ADR-0016-performance-and-readability-threshold-baseline-v1x.md)
- [Render Contract Profile Matrix](./RENDER_CONTRACT_PROFILE_MATRIX_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](./RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [Renderer, Performance, and Accessibility Contract for First Public Smoke Test](./RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- [3D Web Platform Accessibility & Deliverability Audit](./3D_WEB_PLATFORM_ACCESSIBILITY_AND_DELIVERABILITY_AUDIT_2026-07-25.md)

## Decision

The browser must never present the app as a dead black box while the 3D scene loads.

The player should always get one of the following states quickly:

- an interactive shell with visible loading progression,
- a readable fallback preview,
- or a degraded but usable baseline profile.

## Bootstrap states

### 1) Shell state

The shell state appears first.
It should show:

- app identity,
- loading progression or initialization message,
- a clear indication that the experience is still alive,
- a path to the first useful interaction once the scene is ready.

### 2) Warmup state

The engine can continue initializing assets, scene data, and runtime hooks while the shell remains visible.
During this state:

- the user should still understand that progress is happening;
- non-essential scene work may still be deferred;
- profile selection can be evaluated against measured thresholds.

### 3) Ready state

When the scene is ready, the app transitions into the playable profile without changing the meaning of the controls or the visible state.

### 4) Fallback state

If the chosen profile cannot meet the measured threshold:

- the app must degrade visibly,
- preserve gameplay semantics,
- and keep a readable baseline available rather than failing silently.

## Profile selection rules

- `standard` remains the default acceptance profile for first public smoke tests.
- `mobile-safe` is the required fallback when the measured startup/runtime envelope is weak or the device budget is constrained.
- `full` is benchmark-only unless a representative device proves it is safe enough to use.

Profile selection should be based on measured thresholds and captured runtime signals, not on guesswork alone.

## Loading and trust rules

A good loading experience must:

- show that the app is alive,
- indicate progress instead of spinning forever,
- preserve the player’s trust during warmup,
- and keep the first useful interaction close.

The contract is specifically meant to prevent:

- blank-screen ambiguity,
- silent stall,
- confusing profile changes,
- or a loading path that feels like a crash.

## Interaction rules during loading

The app may expose limited interaction during loading if that interaction is stable and does not create false expectations.

Allowed examples:

- a static preview,
- a start/continue affordance,
- a clear progress label,
- a reduced-motion or low-budget preview scene.

Not allowed:

- a fake progress bar,
- a silent black canvas,
- a control surface that looks ready but cannot respond,
- a fallback that hides important loading failure information.

## Measurement and evidence

The loading contract should be evaluated with:

- startup timing,
- first interactive frame timing,
- profile selection outcome,
- fallback visibility,
- and preserved control/state behavior after the scene becomes ready.

## What this contract is not

- Not a full streaming-system spec.
- Not a replacement for the render profile matrix.
- Not a content-loading pipeline design.
- Not a promise that every device can use the same profile.

## Relationship to the broader architecture

This note answers the web-audit gap about stable loading UX and profile bootstrap.
It gives the browser layer a durable rule: progress and fallback must be visible before the app asks the player to trust the scene.

## Addendum (2026-07-25): the shell is visible, but the bootstrap policy is still mostly implicit

- Re-checked the current startup path, browser surface, and live runtime state.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current implementation already proves the first half of the contract:
  - `welcome-panel` is a real startup shell in `src/main.ts` and
    `src/styles.css`,
  - the shell prevents the app from looking like a dead black box,
  - `saveStatus` is populated immediately from the load result, so the browser
    always has a live textual state during boot,
  - entering the world dismisses the shell and focuses the canvas.
- What is still missing is the explicit bootstrap policy surface the contract
  asks for:
  - no real profile-selection UI or runtime profile chooser,
  - no visible loading progress meter or startup percentage,
  - no separate fallback-preview state distinct from the shell and ready states,
  - no measured profile-selection outcome visible to the user.
- So the browser is now past the “dead black box” risk, but the bootstrap path
  is still mostly a shell-plus-default-profile implementation rather than a
  fully named loading/profile policy.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - measured fallback policy is now explicit, renderer activation remains next

- `src/game/runtime-profile-policy.ts` now owns a conservative selection rule
  backed by the existing `PerformanceSnapshot`: retain `standard` until at
  least 90 bounded frame samples exist, then request `mobile-safe` only when
  average frame, p95 frame, or first-controllable budgets exceed the declared
  policy.
- The selector never auto-promotes to `full`. That profile remains a
  representative-device benchmark decision, not a user-agent or warmup guess.
- `PerformanceSnapshot.frameSampleCount` now makes the timing evidence itself
  inspectable, avoiding a fallback decision based on an empty or one-frame
  window. The returned reasons are intended for player-safe status text and
  developer diagnostics rather than hidden tuning.
- This is not yet a runtime fallback. The renderer still binds the active
  visibility profile at construction; the next implementation stage must allow
  a safe profile swap, rebuild its bounded props, expose the active selection,
  and prove semantic input/camera continuity.
- Evidence depth: Tier 1 source and focused-test implementation. Tests have not
  been executed in this pass; budget values remain provisional until a
  representative capture bundle accepts or revises them.

## Anything else? (profile-policy seed)

Heap is intentionally not a selection trigger yet because browser memory
telemetry is not universally available. It remains observable evidence until a
cross-browser, representative-device policy can state what it means safely.

## Addendum (2026-07-26) - measured fallback now changes the real visibility budget

- `GameRenderer.setVisibilityProfile(...)` is the canonical mutable boundary for
  the existing instanced-prop budget. It rebuilds the same deterministic prop
  set immediately with the selected profile's radius and preserves world,
  input, camera, save, and simulation state.
- The browser entry evaluates the measured policy during HUD updates. On the
  first supported fallback decision it switches from `standard` to
  `mobile-safe`, records a `runtimeProfileFallback` checkpoint with reasons,
  exposes selection in `render_game_to_text()` and developer diagnostics, and
  tells the player that scenery detail was reduced.
- The fallback is intentionally one-way for the current session. Automatic
  recovery needs a separately measured hysteresis/cooldown policy; repeatedly
  swapping scenery around a threshold would be worse than a stable conservative
  result.
- `full` remains benchmark-only. The profile policy cannot promote into it.
- Evidence depth: Tier 1 source/test implementation. Browser and
  representative-device continuity evidence still need to prove that the swap
  is readable and that the fallback has the intended cost reduction.

## Anything else? (real fallback)

The visible player message names only the perceptible change. Detailed reasons
remain in diagnostics and the checkpoint payload, so public copy does not leak
internal tuning language while operators retain an audit trail.

## Addendum (2026-07-26) - recovery is now hysteretic rather than permanently degraded

- `PerformanceSnapshot.totalFrameSampleCount` now supplies a monotonic evidence
  clock alongside the bounded timing window. The latter is correct for current
  frame quality; the former is required for a recovery hold that remains valid
  after the rolling buffer reaches capacity.
- `RuntimeProfileController` keeps `mobile-safe` active for 180 healthy frames
  after measured pressure clears, then restores `standard` once. A renewed
  breach immediately refreshes the fallback reasons and restarts the hold.
- Both transitions rebuild the canonical deterministic scenery set, announce a
  plain-language player status, expose the state in snapshots/diagnostics, and
  record distinct fallback or recovery checkpoints.
- Evidence depth: Tier 1 source/test implementation. The 180-frame value is a
  provisional policy constant until representative browser capture proves the
  transition is imperceptible enough and preserves the intended cost reduction.

## Anything else? (hysteresis)

## Addendum (2026-07-29) - the shell is truthful, but the player still lacks a clearly named progress affordance

- Re-checked the loading/profile bootstrap contract against the current live-shell analysis trail.
- The shell already does the important truth-preserving work:
  - it is not a dead black box,
  - it exposes bootstrap text,
  - it exposes save state,
  - it exposes the active quality/profile line in the public shell.
- The remaining browser-delivery gap is narrower than a general loading problem:
  - the player still does not get a clearly named progress affordance that is distinct from ordinary status text,
  - the profile signal is still more readable in the operator/evidence trail than in a dedicated public comfort indicator.
- The next proof slice should therefore be one of two things, not both:
  - a visibly named progress affordance that is honest about warmup state, or
  - a clearly named public comfort/profile indicator that survives the player surface.
- Evidence depth: Tier 1 static synthesis from the current loading contract and accessibility/profile visibility notes. No new runtime/browser pass was run in this update.

## Addendum (2026-07-28) - live shell still prefers textual bootstrap over a visible loading meter

- Re-checked the canonical browser daemon on `http://127.0.0.1:4173/?acceptance=field-02`.
- The live page now exposes a concrete textual bootstrap surface:
  - `#bootstrap-status` reads `Field systems ready. Restored session controls are active.`
  - `#save-status` remains a live `status` region with `Saved locally just now`
  - `#profile-status` remains a live `status` region with `Quality: standard.`
- The shell `aria-busy` flag is false after load, which is correct for the
  playable ready state.
- What is still missing is the separately named loading-progress affordance
  this contract calls for:
  - no dedicated progress bar,
  - no percentage meter,
  - no visible warmup progress state distinct from the ready shell.
- So the contract is now in a sharper state:
  - bootstrap is real and readable,
  - profile and save state are visible,
  - explicit loading progress remains implicit rather than first-class.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-28) - live browser probe shows a measured bootstrap state, not a blank loader

- Re-checked the live public shell with the browser-focused probe at
  `http://localhost:4173/?acceptance=field-02` in a 390 x 844 viewport.
- The page now exposes a more specific bootstrap narrative than the older
  addendum recorded:
  - `#bootstrap-status` reads `Measuring device performance… Choose Enter the field to begin.`
  - `#profile-status` reads `Quality: measuring. Still measuring frame performance.`
  - `#save-status` reads `New field ready · progress saves locally`
- The page is not advertising a dedicated progress bar or progress element
  yet:
  - `progress` / `role="progressbar"` elements were absent in the probe,
  - `aria-busy` was `null`,
  - the visible state is textual rather than percentage-based.
- That means the browser is now clearly alive and narrating its warmup, but
  the loading contract is still textual rather than a first-class progress
  affordance.
- Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-28) - the visible profile line is present, so the contract gap is strictly loading-progress explicitness

- Re-checked the live field against the current shell after the accessibility
  pass.
- The player can already read the quality/profile line in-session:
  - `Quality: standard.`
  - `Saved locally just now`
  - `Field systems ready. Restored session controls are active.`
- The loading contract is therefore not missing a profile/status signal anymore.
  The remaining gap is a named loading-progress affordance that is separate
  from the ready-state shell.
- This is a narrower and better-defined policy question than the earlier note:
  preserve the current truthful bootstrap text, but decide whether the public
  surface also needs a real progress meter or a separate warmup state before
  broader public delivery.
- Evidence depth: Tier 4 runtime/manual observation.

The controller is intentionally scoped to existing visibility work. It does not
invent adaptive physics, AI, audio, or save-rate changes from render pressure.

## Addendum (2026-07-26) - the bootstrap state is textual and operator-visible, but not a named loading meter

- Re-checked the live browser bootstrap path against `src/main.ts` and
  `src/styles.css`.
- The browser already has a real textual shell:
  - `bootstrapStatus` is created at startup,
  - it is flipped to `ready` when the world handoff completes,
  - the shell prevents the app from looking like a dead box while the scene is
    still warming up.
- The browser already has operator-visible runtime state:
  - `runtimeDiagnostics` carries the selected profile and fallback reasons,
  - `mapProgress` reports surveyed world coverage and sight range.
- What is still missing is a separately named public loading/progress surface:
  - `mapProgress` is world-survey progress, not a startup progress meter,
  - there is no dedicated loading percentage or progress bar for the player,
  - there is no visible profile chooser on the public surface.
- So the correct reading is not that the browser is dead or silent; the current
  gap is that the loading story is still implicit rather than a first-class,
  named browser affordance.
- Evidence depth: Tier 1 static source inspection. No fresh browser capture was
  run in this pass because the browser daemon poll timed out.

## Addendum (2026-07-25) - current Field 02 snapshot and remaining bootstrap gap

- Re-checked the live browser daemon after the earlier shell audit.
- The current runtime surface is `Rigs Unbound — Field 02`, and the daemon still
  reports zero console logs.
- The implementation status is unchanged in the important ways:
  - `welcome-panel` is still the real startup shell,
  - `saveStatus` still gives the player a live textual boot state,
  - the canvas handoff still happens when entering the world,
  - there is still no separate progress meter, startup percentage, or runtime
    profile selector visible to the player.
- So the app is not at risk of looking dead, but the bootstrap contract is still
  only partially explicit. The remaining work is to decide whether a visible
  loading/progress affordance should be promoted from “implicit enough” into a
  first-class browser state.

## Addendum (2026-07-26) - the shell is explicit, but progress and chooser remain implicit

- Re-checked the current browser entry against `src/main.ts` and
  `src/styles.css`.
- The startup shell is now unmistakably real:
  - `bootstrapStatus` exists in the welcome panel,
  - it flips to `ready` when world entry completes,
  - if a fallback profile is active before entry, the shell can say
    `Field systems ready with reduced scenery detail.`
- The browser also has explicit developer visibility:
  - `runtimeDiagnostics` shows renderer memory, bridge evidence, visibility,
    and profile state,
  - `mapProgress` reports survey progress and sight range.
- The remaining browser-facing gap is still the same first-class affordance
  problem:
- `mapProgress` is not startup loading progress,
- the public surface still has no dedicated loading percentage or bar,
- there is still no visible profile chooser for the player.
- So the 3D web-experience lane now has a sharper conclusion:
  the app is trustworthy during boot, but the browser story remains shell-led
  rather than progress-led.
- Evidence depth: Tier 1 static source inspection on the current browser entry
  and stylesheet.

## Addendum (2026-07-29) - the browser story is now progress-led on bootstrap, but the loading narrative is still split

A live browser probe of the current shell changed the earlier loading
description in an important way:

- `#bootstrap-status` now exposes a semantic `progressbar` while the shell is
  measuring device performance;
- `#profile-status` is visibly present and continues to narrate the active
  quality state;
- `#runtime-diagnostics` is hidden from the public HUD.

So the shell no longer lacks a first-class loading affordance. The remaining
question is whether the bootstrap, profile, and ready states read as one
cohesive narrative for players, rather than three separate surfaces.

## Addendum (2026-07-26) - episode grammar depends on truthful bootstrap, not a fake start state

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this bootstrap contract.
- The episode grammar does not define loading, progress meters, or profile
  selection; it depends on this layer so the player enters a truthful shell and
  then experiences the chosen episode from a real ready state.
- This keeps the split clean: bootstrap owns entry truth and fallback clarity,
  while the episode grammar owns the authored experience that begins after the
  shell becomes ready.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-29) - the old shell-led loading note is superseded by a semantic progressbar

A current live probe of the browser shell shows the loading contract has moved
past the older shell-led framing:

- `#bootstrap-status` exposes a semantic `progressbar` while measuring;
- `#profile-status` remains visible with the quality state;
- `#runtime-diagnostics` is hidden from the public HUD.

The remaining question is now cohesion and phrasing across bootstrap/profile,
not whether the browser has a first-class loading affordance at all.

## Addendum (2026-07-29) - the loading contract is now split by route, not by capability

A current route comparison on the live shell clarifies the real policy:

- the public shell hides `#runtime-diagnostics`;
- the `?acceptance=field-02` route exposes `#runtime-diagnostics` with the
  renderer/backend summary;
- both routes keep `#bootstrap-status` as the semantic status line and
  `#profile-status` as the visible quality line.

That means the loading/policy question is not whether diagnostics exist. They
do. The question is whether the bootstrap/profile narrative is coherent enough
on the public shell while the deeper summary remains acceptance-only.

## Addendum (2026-07-29) - ADR-0039 is the policy anchor for the current route split

The live bootstrap/profile/diagnostics split now has an explicit decision home:

- ADR-0039 keeps `#bootstrap-status` public and semantic;
- ADR-0039 keeps `#profile-status` public and visible;
- ADR-0039 route-gates `#runtime-diagnostics` to acceptance/developer surfaces.

That makes this bootstrap contract the evidence trail, while ADR-0039 is the
policy trail.

## Addendum (2026-07-29) - the live shell is readable, but it is still status-only rather than a true progressbar

A fresh browser check on `http://127.0.0.1:4173/?surface=developer` showed:

- `#bootstrap-status`: `Field systems ready with standard scenery detail.`
- `#profile-status`: `Quality: measuring. Still measuring frame performance.`
- `#save-status`: `New field ready · progress saves locally`
- `#bootstrap-status` has `role="status"` and `aria-live="polite"`
- no `progress` element exists in the live DOM
- no `[role=progressbar]` element exists in the live DOM

That means the current shell is truthful and readable, but the progress story
is still text/status-based rather than a dedicated progress affordance.
Evidence depth: Tier 4 runtime/manual observation.

## Addendum (2026-07-29) - the next loading proof is one cohesive bootstrap narrative

- The browser now has enough pieces to tell the player that the shell is
  measuring, the profile is active, and the field is ready.
- The next proof slice should therefore not be another progress control. It
  should be one cohesive bootstrap narrative that binds:
  - the measuring state,
  - the selected profile state,
  - the ready state,
  - and one plain-language transition reason that explains why the shell is
    still waiting or has already settled.
- That keeps the public surface readable without creating a second loading
  model.
- Anything else? No. The current gap is narrative cohesion, not raw loading
  presence.

## Addendum (2026-07-29) - browser-game constraints make hidden tabs and first interaction part of the loading story

- Re-read the browser-game lens against the current bootstrap/profile narrative.
- The shell can be progress-led and truthful, but it still has to respect the
  browser's own constraints:
  - hidden tabs should pause or visibly suspend simulation work instead of
    pretending to keep running;
  - audio should not assume autoplay, because the first user interaction still
    owns the audio context;
  - mobile and low-bandwidth modes should continue to prefer progressive
    loading over a single giant upfront fetch.
- That means the loading contract is not only about what the player sees when
  the field becomes ready. It is also about what the browser is allowed to do
  while the page is hidden, muted, or still waiting for the first click.
- Anything else? No. The browser loading story stays trustworthy only if it
  honors visibility and interaction rules, not just bootstrap text.

## Addendum (2026-07-29) - the bootstrap narrative still needs an explicit profile choice moment

- Re-read the bootstrap/profile story after the browser-game and accessibility
  passes.
- The shell can already say it is measuring, and it can already say it is
  ready. What is still not named clearly enough is the first-choice moment for
  the player profile itself.
- The next proof slice should therefore make the bootstrap story answer three
  questions in order:
  1. what mode am I in now?
  2. which profile is active or being measured?
  3. do I need to choose or can I proceed?
- That keeps the loading narrative from becoming a passive status rail. The
  player should understand whether the shell is still deciding, has chosen for
  them, or is waiting for their explicit profile choice.
- Anything else? No. A truthful bootstrap story still needs one visible choice
  moment, not just a readout.

## Addendum (2026-07-29) - the first visit should surface a chooser or a reasoned default, not an implied profile

- Re-read the bootstrap narrative with the first-choice moment in mind.
- A truthful loading story still needs one more decision boundary: if the
  shell is not already on a known profile, the player should see a visible
  chooser or a plain-language reason for the default that was applied.
- That makes the profile state actionable instead of merely descriptive.
- It also keeps the first visit honest on small screens: the shell can still
  be compact, but the player should not have to guess whether profile choice is
  already settled, still being measured, or waiting on explicit input.
- Anything else? No. A bootstrap story that hides the first profile decision
  is still only half a story.

## Addendum (2026-07-29) - live DOM shows profile status but not a dedicated first-visit profile chooser

- A live DOM probe on the canonical developer surface now shows:
  - `#bootstrap-status` as a readable ready line;
  - `#profile-status` as a visible quality line;
  - `#camera-select` as the only obvious choice control in the sampled shell;
  - no dedicated profile-chooser control surfaced in the current DOM slice.
- That means the current browser story can narrate profile state, but it still
  does not present a clear first-visit profile selection moment as its own
  affordance.
- The next proof slice should therefore distinguish between:
  - a status line that says which profile is active or being measured;
  - a chooser that lets the player make that first profile decision;
  - and a default explanation when the shell has already made the choice for
    them.
- Anything else? No. A status line alone does not count as a profile chooser.

## Addendum (2026-07-29) - clearing local browser state still does not surface a dedicated profile chooser

- A first-visit simulation cleared localStorage and sessionStorage before reloading the canonical developer surface.
- After reload, the shell still reported the same ready/profile status pair and the only obvious choice control in the sampled DOM remained `#camera-select`.
- That means the current browser surface can explain profile state, but it still does not expose a dedicated first-visit profile chooser even when remembered browser state is removed.
- The next proof slice should keep the distinction explicit: status line, visible chooser, and reasoned default are not the same thing.
- Anything else? No. Clearing local state did not reveal a separate profile-choice affordance.

## Addendum (2026-07-29) - the camera selector is a choice control, but it is not the profile chooser

- The live DOM now makes one thing easy to confuse: `#camera-select` is a real
  choice control, but it is not the same decision as a first-visit profile
  chooser.
- The contract should keep those surfaces separate so future work does not
  accidentally treat camera perspective as a proxy for profile setup.
- That means the bootstrap narrative still needs a profile-specific default or
  chooser explanation even if the shell already offers a visible camera mode
  control.
- Anything else? No. A camera choice is useful, but it does not satisfy the
  profile-choice requirement by itself.

## Addendum (2026-07-29) - runtime quality profile is not the same as player profile setup

- The live shell uses `#profile-status` to narrate the runtime quality mode
  (for example, standard or measuring), which is useful but not the same thing
  as a player-setup or identity profile chooser.
- The contract should keep those meanings separate so future work does not
  accidentally treat renderer/profile quality as a proxy for first-visit
  profile setup.
- That separation also explains why the chooser gap can remain real even while
  the browser already shows a visible profile status line.
- Anything else? No. A runtime quality profile is a status; a player profile
  chooser is a first-choice affordance.

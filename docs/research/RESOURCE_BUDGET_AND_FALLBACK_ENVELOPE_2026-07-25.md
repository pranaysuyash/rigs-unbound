# Resource Budget and Fallback Envelope (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current observable performance metrics into a named resource-governance contract.

The runtime already exposes performance snapshots with frame timing, draw calls, triangle count, heap use, load time, first-controllable time, and save-size data. That is enough to prove the engine is observable. It is not yet enough to prove the resource budget is a first-class policy with low-budget fallback states.

## Current evidence base

- Performance snapshots:
  - [src/game/performance.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/performance.ts)
- Runtime wiring:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for resource budgets:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

Live browser anchor:

- performance snapshot is exposed
- live snapshot currently reports measurable frame, draw, triangle, heap, load, and first-controllable values

## Current observable posture

The live snapshot currently shows a healthy but still bounded posture:

- average frame time: measured
- p95 frame time: measured
- FPS: measured
- draw calls: measured
- triangles: measured
- heap use: measured
- load duration: measured
- first controllable time: measured

That means the project can already observe pressure. What it cannot yet do is name a fallback policy that activates before overload becomes a silent player-facing problem.

## What is still missing

The repo still lacks a named policy for:

- CPU budget ownership
- GPU budget ownership
- memory or residency budget ownership
- active actor ceilings
- thermal or battery-sensitive fallback behavior
- operator-visible summary of what overloaded and which subsystem caused it

The current metrics are a strong foundation, but they need a policy envelope to become actionable.

## Contract shape

The resource envelope should separate:

1. measured budgets
2. degradation triggers
3. fallback profiles
4. operator-visible summaries
5. recovery thresholds

Suggested budget families:

- CPU
- GPU
- memory / residency
- active actors
- thermal or battery sensitivity where relevant

## Validation rules

The contract should fail visibly if it:

- allows silent overload
- degrades without naming the triggered subsystem
- misses a low-budget fallback before overload becomes user-visible
- hides the current budget class from operators
- records metrics but never uses them to select a fallback profile

## Near-term proof slice

The smallest durable proof for this contract is:

1. one cross-system budget ledger
2. one low-budget fallback profile
3. one test proving the fallback activates before overload
4. one telemetry or summary field naming the oversubscribed resource
5. one summary that identifies the subsystem that caused the fallback

## Open questions

- Which budget should be the first canonical trigger: frame time, heap use, or draw-call pressure?
- Should low-budget fallback primarily simplify visuals, simulation, or both?
- Which operator-visible summary format is best for a browser game: HUD label, diagnostic panel, or log record?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The engine can already tell us when it is getting expensive. This contract makes the next step explicit: define the fallback before the budget is exceeded, not after the player notices.

## Addendum (2026-07-25): budgets are measured, fallback policy is still implicit

- Re-checked the current runtime and browser surface after the contract review.
- The live app is still `Rigs Unbound — Field 02`, and the browser daemon is
  healthy with zero console logs in the current status snapshot.
- The runtime already exposes the relevant measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing
  - draw calls
  - triangle count
  - heap use
  - load duration
  - first-controllable time
  - save size
- `src/main.ts` wires those metrics into the browser surface, so resource
  pressure is visible today.
- What is still missing is the actual envelope policy:
  - one cross-system budget ledger,
  - one explicit low-budget fallback profile,
  - one test proving fallback happens before overload,
  - one operator-visible summary naming the oversubscribed resource,
  - one summary field naming the subsystem that triggered fallback.
- In other words: the project can already observe expense, but it still cannot
  officially choose a fallback path from a budget contract.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-25) - budgets are measured, fallback policy is still implicit

- Re-checked the contract against the current browser daemon snapshot and live
  repo state.
- The live app is still `Rigs Unbound — Field 02`, and the browser daemon is
  healthy with zero console logs in the current status snapshot.
- The runtime already exposes the relevant measurement fields through
  `PerformanceMonitor.snapshot()` and `window.getPerformanceSnapshot()`:
  - frame timing,
  - draw calls,
  - triangle count,
  - heap use,
  - load duration,
  - first-controllable time,
  - save size.
- `src/main.ts` wires those metrics into the browser surface, so resource
  pressure is visible today.
- What is still missing is the actual envelope policy:
  - one cross-system budget ledger,
  - one explicit low-budget fallback profile,
  - one test proving fallback happens before overload,
  - one operator-visible summary naming the oversubscribed resource,
  - one summary field naming the subsystem that triggered fallback.
- In other words: the project can already observe expense, but it still cannot
  officially choose a fallback path from a budget contract.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26) - live metrics are rich, but fallback is still only a policy gap

- Re-checked the live browser daemon and the current performance wiring.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- `src/game/performance.ts` still exposes a solid measurement envelope:
  - frame timing,
  - p95 / average frame times,
  - FPS,
  - draw calls,
  - triangles,
  - heap use,
  - load duration,
  - first-controllable time,
  - save bytes and last save duration.
- `src/main.ts` continues to surface those metrics through the developer/evidence
  readout and the public `window.getPerformanceSnapshot()` hook.
- That means the budget pressure is measurable and visible today.
- The missing layer is still the same contract boundary:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused the fallback.
- So the runtime can already tell us when it is getting expensive, but it still
  cannot name the fallback path as a first-class policy envelope.

## Addendum (2026-07-26) - current snapshot confirms the metrics are live, but the envelope is still missing

- Re-checked the live browser daemon before writing this note.
- The daemon is healthy, the current page is still `Rigs Unbound — Field 02`,
  and the console log buffer is still empty.
- The current performance snapshot still exposes a real pressure picture:
  - `averageFrameMs`: `20.01`
  - `p95FrameMs`: `21.7`
  - `framesPerSecond`: `50`
  - `drawCalls`: `72`
  - `triangles`: `104694`
  - `terrainBuildMs`: `92.7`
  - `heapUsedMb`: `12.7`
  - `loadDurationMs`: `2.7`
  - `firstControllableMs`: `469.2`
  - `saveBytes`: `2971`
- `src/game/performance.ts` still exposes the same measurement spine, and
  `src/main.ts` still surfaces it through the browser hooks and developer
  readouts.
- That means the runtime is doing the important first half already:
  - measuring cost,
  - exposing pressure,
  - keeping the app readable while budgets stay bounded.
- What is still missing is the named envelope:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no test proving fallback activates before overload,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that caused fallback.
- The next durable step is still to name the fallback before the budget is
  exceeded, not after the player can feel the overload.

## Addendum (2026-07-28) - the operator summary is now explicit in the developer lane

- The developer surface now exposes a terse operator summary for the selected
  runtime profile. The live browser probe confirms the warmup and steady forms,
  and the fallback form is covered by the policy helper test:
  - `Renderer visibility warmup: standard (insufficient-frame-samples)`
  - `Renderer visibility fallback: mobile-safe (...)`
  - `Renderer visibility steady: standard`
- The public HUD stays separate and keeps the player-facing quality line in
  plain language.
- That means the fallback envelope now has both halves the contract asked for:
  player-facing clarity and operator-facing summary text.

## Addendum (2026-07-26) - measurable budgets now outpace policy ownership

- Re-checked the envelope against the current visibility and profile ladder.
- The runtime now exposes enough measurement surface to support policy:
  - frame timing,
  - draw calls,
  - triangles,
  - heap,
  - load and first-controllable timing,
  - visibility counters,
  - profile tiers (`full`, `standard`, `mobile-safe`).
- What is still missing is the policy edge that turns measurement into a named
  fallback:
  - no cross-system budget ledger,
  - no explicit low-budget fallback profile,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that triggered fallback,
  - no proof that fallback activates before overload becomes user-visible.
- That means the budget story is measurable today, but still not owned as a
  first-class fallback contract.

## Addendum (2026-07-28) - the public shell now shows profile and save state, but the fallback envelope is still the missing policy

- Re-checked the live browser surface against the budget envelope and the
  player-facing visibility trail.
- The public shell now exposes the active profile state in plain language and
  keeps the save/recovery line separate, so the player can see both the shell
  quality tier and the persistence state without opening diagnostics.
- That strengthens the user-facing side of the budget story, but it does not
  yet supply the policy layer this contract needs:
  - no canonical cross-system budget ledger,
  - no explicit low-budget fallback profile selected by the envelope,
  - no operator-visible summary naming the oversubscribed resource,
  - no summary field naming the subsystem that triggered fallback.
- In other words: the browser can now show that the app is healthy and what
  profile it chose, but the repo still lacks the named fallback policy that
  should activate before overload becomes a player-facing problem.
- The next proof slice is still policy, not metrics: define which subsystem
  wins when the envelope needs to shed load, and make that decision visible in
  the same public language the shell already uses for profile and save state.
- Evidence depth: Tier 4 browser observation of the public shell plus Tier 1
  contract/source inspection.

## Addendum (2026-07-26) - fallback policy seed chooses only from measured pressure

- The measurement envelope now includes `frameSampleCount`, so timing summaries
  disclose how much evidence supports their average and p95 values.
- `src/game/runtime-profile-policy.ts` provides the first explicit fallback
  policy. It holds `standard` while evidence is insufficient and requests
  `mobile-safe` after 90 samples only for declared average-frame, p95-frame, or
  first-controllable budget breaches. The result includes every trigger reason.
- This is intentionally scoped to renderer visibility work. It does not lower
  simulation frequency, change input, mutate saves, or auto-select `full`.
- Remaining closure: renderer profile mutation, visible operator/player status,
  hysteresis/recovery rules, and representative capture evidence before these
  provisional budgets become public performance claims.

## Anything else? (fallback-policy seed)

A profile decision without a sample count would be a disguised hardware guess.
The policy therefore makes insufficient evidence a visible state, not a reason
to silently degrade or promote the player.

## Addendum (2026-07-27) - the renderer/profile lane is now tiered, but the cross-system budget ledger is still the missing policy surface

- Re-checked this contract against the live renderer/performance and profile
  trail after the tiered visibility and shell-profile updates.
- The renderer-side policy is no longer just a seed:
  - graduated quality tiers are documented in the renderer-performance flow,
  - the runtime profile path now has explicit fallback and recovery language,
  - the public trail now distinguishes the player-facing shell/profile signal
    from operator diagnostics.
- What still remains missing is the contract this note was originally asking
  for at the umbrella level:
  - one cross-system budget ledger,
  - one operator-visible summary naming the oversubscribed resource,
  - one summary field naming the subsystem that caused the fallback,
  - one shared visible table for within-budget / degraded / fail-soft states.
- So the repo can now explain the renderer/profile lane, but it still cannot
  explain the whole budget economy as a single operational artifact.
- Evidence depth: Tier 1 static inspection of the live documentation trail.
  to silently degrade or promote the player.

## Addendum (2026-07-26) - first low-budget fallback is active and auditable

- The renderer now accepts a runtime visibility-profile change through one
  project-owned method. The first qualified profile decision immediately
  rebuilds deterministic instanced scenery against the `mobile-safe` distance
  budget while leaving simulation semantics untouched.
- Fallback activation records its exact reason codes in the canonical run-record
  checkpoint, appears in developer diagnostics and text snapshots, and produces
  a player-facing reduced-scenery notice.
- Recovery is deliberately held for this session. A later recovery policy must
  establish hysteresis and a cooldown from captured evidence; it must not cause
  visibility-profile oscillation around a transient frame spike.
- Remaining envelope work: cross-system budgets beyond visibility, independent
  renderer-swap tests, player/browser fallback continuity capture, and a
  representative-device threshold decision.

## Anything else? (active fallback)

This is a visual-budget fallback, not a simulation LOD system. AI, physics,
audio, and persistence still retain their current cadence and authority.

## Addendum (2026-07-26) - the renderer fallback is active, but cross-system resource ownership is still future work

- Re-checked the live source for the current fallback path and diagnostics
  wiring.
- `src/main.ts` now distinguishes the fallback clearly in user-facing text and
  developer diagnostics:
  - `runtimeProfileFallback` and `runtimeProfileRecovery` checkpoints record the
    selected profile plus the triggering reasons;
  - the player-facing message says `Performance safeguard active: reduced
scenery detail.` when fallback engages;
  - the developer diagnostics show the active profile, visibility counts, draw
    calls, geometry/texture counts, heap where available, and the current
    runtime bridge summary.
- `src/game/runtime-profile-policy.ts` still scopes automatic fallback to the
  measured visibility budget only. It does not lower simulation cadence, change
  input semantics, or guess at thermal/battery conditions.
- That means the contract has crossed the important first boundary: fallback is
  no longer just a theoretical policy. The remaining gap is the broader
  resource-governance envelope:
  - no cross-system CPU/GPU/memory ledger,
  - no named subsystem owner for those budgets,
  - no thermal or battery-sensitive policy,
  - no evidence-backed representative-device threshold for the wider app.
- The current state is therefore a real and auditable visual fallback, but not
  yet a full resource governor for the whole game.
- Evidence depth: Tier 1 static source inspection. No browser capture or test
  execution was run in this pass.

## Addendum (2026-07-26) - fallback recovery now has a monotonic evidence window

- The first active fallback now has a paired recovery contract. A monotonic
  lifetime frame count prevents the 240-frame rolling timing buffer from
  disabling recovery once it stops increasing.
- `mobile-safe` stays active for 180 healthy frames after pressure clears. It
  then restores `standard`, records `runtimeProfileRecovery`, and explains the
  perceptible restored-scenery change without changing simulation semantics.
- New pressure before that window completes refreshes fallback reason codes and
  holds the conservative profile. This avoids repeated prop rebuilds at a
  threshold boundary.
- Remaining closure: representative-device capture to tune constants, prove
  before/after resource deltas, and confirm recovery readability in browser.

## Anything else? (recovery window)

No profile can claim an upgraded device class from recovery. `full` remains an
explicit benchmark decision outside the adaptive fallback controller.

## Addendum (2026-07-26) - the visible fallback is real, but the wider budget ledger is still missing

- Re-checked the current browser wiring in `src/main.ts` against the live
  performance policy.
- The runtime now makes the fallback and recovery path visible to both players
  and operators:
  - `runtimeProfileFallback` and `runtimeProfileRecovery` checkpoints record the
    active profile plus triggering reasons;
  - the player sees `Performance safeguard active: reduced scenery detail.`
    while fallback is engaged;
  - developer diagnostics expose fps, draw calls, geometry/texture counts,
    heap, bridge status, visibility counts, and the active profile summary.
- `src/game/runtime-profile-policy.ts` keeps the automatic profile policy
  tightly scoped to measured visibility pressure and the recovery window. It
  does not infer thermal, battery, CPU, or memory behavior from user-agent
  hints.
- That means the visibility fallback itself now has a real owner and policy
  shape: `RuntimeProfileController` governs the `standard` ↔ `mobile-safe`
  switch and recovery window for the current renderer budget.
- So the contract’s first proof is now stronger than “metrics exist”:
  the app has a real, explainable visual fallback with recovery.
- The remaining gap is still the broader resource-governance envelope:
  - no cross-system CPU/GPU/memory ledger,
  - no named subsystem owner for those budgets,
  - no thermal or battery-sensitive policy,
  - no representative-device threshold for the wider app.
- Evidence depth: Tier 1 static source inspection. No browser capture or test
  execution was run in this pass.

## Addendum (2026-07-26) - renderer resource counts are observable without inventing a VRAM claim

- `RendererMetrics` and `PerformanceSnapshot` now include raw
  `WebGLRenderer.info.memory` geometry and texture allocation counts.
- The developer diagnostics, browser performance snapshot, and run-record
  checkpoints therefore expose frame pressure alongside draw calls, triangles,
  geometry count, texture count, heap where available, and prop visibility.
- These counts are observability only. They are not converted into guessed GPU
  megabytes and do not yet trigger fallback, because byte cost depends on actual
  geometry attributes, texture dimensions/formats, driver behavior, and device.
- The existing measured visibility policy remains the sole automatic fallback.
  A future asset/residency policy must establish a real measured threshold before
  geometry or texture counts can change runtime behavior.
- Evidence depth: Tier 1 source/test implementation. No renderer capture or
  focused test execution was run in this pass.

## Addendum (2026-07-28) - live browser proof now shows the renderer policy gate in action

- A developer-surface browser probe with `?rendererPolicy=off` now reports:
  - `rendererBackend: webgl`
  - `rendererRequestedBackend: auto`
  - `rendererBackendFallback: true`
  - `rendererBackendReason: rendererPolicy=off blocked auto webgpu`
- The runtime diagnostics lane mirrors that state as `backend:webgl/auto (fallback)`.
- This matters for the budget envelope because it proves the app already has a
  policy-controlled backend fallback, even before we talk about broader
  non-render resource governance.
- A companion probe with `?rendererPolicy=stable` keeps the renderer on the
  direct path instead of a forced fallback:
  - `rendererBackendFallback: false`
  - `rendererBackendReason: renderer=auto retained webgl for composer compatibility (stable)`
  - runtime diagnostics: `backend:webgl/auto (direct)`
- The still-open question is the one the browser 3D skill kept pointing toward:
  how the app should communicate intentional degradation when WebGL/WebGPU
  quality is reduced, and whether there should be a separate static fallback
  when the renderer cannot carry the experience at all.
- Evidence depth: Tier 4 live browser inspection.

## Addendum (2026-07-28) - context-loss recovery is user-visible, but only synthetic proof landed in this browser run

- The shell wires `webglcontextlost` and `webglcontextrestored` handling on the
  canvas.
- A synthetic browser probe that dispatched those events directly produced:
  - `Graphics context lost. Waiting for restore.`
  - `Graphics context restored. Recovered on developer profile standard.`
- That shows the recovery envelope is user-visible and stateful, but it does
  **not** prove a real GPU loss/recovery event because this browser run did not
  expose the `WEBGL_lose_context` extension.
- For budget work, the important implication is that the current fallback
  envelope is still renderer-scoped; there is still no separate non-render
  outage surface.
- Evidence depth: Tier 4 synthetic browser inspection plus Tier 1 source
  inspection.

## Addendum (2026-07-28) - the no-render outage surface is now visible and user-actionable

- The formerly hidden boot error panel is now the canonical no-render fallback surface.
- It is surfaced as an `alertdialog` with a title, description, and retry
  action.
- The acceptance/developer hook can reveal it, and the live browser proof shows
  the shell enters `data-renderer-state="fallback"` while hiding the canvas.
- This matters for the budget envelope because it turns the renderer-scoped
  outage into a user-facing degraded mode rather than a dead-end error note.
- Evidence depth: Tier 4 live browser inspection plus Tier 2 helper coverage.

## Addendum (2026-07-26) - episode grammar depends on this envelope to stay readable under pressure

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this resource envelope.
- The episode grammar does not define budget policy or fallback selection; it
  depends on this contract so pressure, discovery, and consequence stay
  readable when the app enters a reduced or degraded state.
- That keeps the split clean: the resource envelope owns fallback and pressure
  policy, while the episode grammar owns how that policy shapes a playable
  episode.

## Addendum (2026-07-27): the new runtime tranche is a resource signal, but not a policy owner yet

- The new parallel-owned runtime tranche includes power, economy, debris, and
  atmospheric systems.
- Those systems are strong evidence that the resource envelope will eventually
  need non-render budget owners, but they do not yet justify inventing a cross-
  system ledger in the live product path.
- The correct current boundary remains: renderer fallback is implemented,
  resource observability exists, and broader budget governance stays future
  work until a measured trigger proves one of these non-render domains needs its
  own degradation policy.

## Addendum (2026-07-29) - renderer policy now reads as a route-gated summary, not a public-shell control

A fresh route comparison on the live shell clarifies where the renderer policy
is allowed to speak:

- the public shell keeps `#runtime-diagnostics` hidden;
- the `?acceptance=field-02` route exposes the renderer/backend summary;
- `rendererPolicy=off` and `rendererPolicy=stable` change the acceptance
  diagnostics text but leave the public bootstrap/profile contract intact.

That means the fallback envelope now has a cleaner separation of concerns:
public players get the loading/progress and quality state, while acceptance and
developer routes carry the lower-level budget / backend reasoning.

## Addendum (2026-07-29) - ADR-0039 explains the public HUD boundary this contract relies on

The resource-budget contract now fits the same browser-policy split named in
ADR-0039:

- the public shell keeps `#bootstrap-status` and `#profile-status` readable to
  the player;
- acceptance/developer surfaces carry the deeper diagnostic summary;
- the operator-facing budget/fallback reasoning does not need to become a
  public HUD panel to remain observable.

That keeps this envelope aligned with the rest of the browser contract trail:
player trust stays in the public shell, while fallback diagnostics remain
available in the reviewer/operator lane.

## Addendum (2026-07-29) - the envelope is measurable, but the named low-budget capture is still the missing review artifact

- Re-read the resource-budget contract after the KPI, loading/profile, and
  browser-delivery passes.
- The runtime already measures pressure, and the live browser surface is still
  reachable on the canonical developer route with the current title and a
  non-empty console-log buffer.
- The operator summary is explicit enough to describe warmup, steady, and
  fallback states. So the missing piece is not “can we see a fallback?” The
  missing piece is a named capture bundle that binds:
  - the measured budget state,
  - the selected fallback or steady profile,
  - the observed render/load pressure,
  - and a short operator note about what changed under pressure.
- That makes the envelope actionable as a review artifact instead of just a
  runtime metric stream.
- Evidence depth: Tier 4 runtime/browser status plus Tier 1 static synthesis
  from the budget, KPI, loading/profile, and browser-delivery notes.

## Addendum (2026-07-29) - the next budget proof is one capture bundle that binds pressure to the visible shell story

- The browser now has enough public state to explain itself at three levels:
  - the bootstrap narrative,
  - the active profile state,
  - and the fallback/degrade reasoning.
- The next proof slice should therefore be one named low-budget capture bundle
  that combines:
  - the measured budget state,
  - the selected profile or fallback state,
  - the operator-visible bootstrap narrative,
  - and the pressure source summary that explains why the shell is in that
    state.
- That keeps the resource envelope reviewable as a single evidence object
  instead of as separate runtime facts that have to be mentally stitched
  together later.
- Anything else? No. The budget lane should explain the shell, not just record
  it.

## Addendum (2026-07-29) - the browser funnel still needs an installable shell and a bounded offline cache story

- Re-read the `web-games` lens against the current browser-budget notes.
- The browser build is still the free demo funnel, so the resource envelope now
  needs one explicit PWA/offline boundary:
  - the shell may cache itself and a small safe asset set for installable use;
  - offline or cached state must never masquerade as authoritative simulation
    truth for progress, contracts, or sync-sensitive data;
  - the visible shell should be able to explain whether it is online,
    installable, cached, or degraded.
- That keeps the browser channel useful on slower networks and installable on
  user devices without turning cached state into a second source of truth.
- Anything else? No. The browser funnel can be durable and installable only if
  the offline envelope stays bounded and explicit.

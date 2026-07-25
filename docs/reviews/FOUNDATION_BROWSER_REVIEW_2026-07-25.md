# Playable foundation browser review

Date: 2026-07-25
Scope: read-only review of the concurrent root Three.js foundation
Evidence tier: Tier 4 for the browser observations; Tier 1 for code-path analysis

## Observed behavior

The root playable foundation rendered and remained legible at:

- desktop: 1200×900;
- mobile: 390×844.

The Browser pass observed:

- the field, tractor, landmarks, welcome panel, instrument cluster, opportunity
  rail, day phase, and local trail status;
- welcome-panel dismissal;
- keyboard driving changing vehicle position, heading, speed, and travelled
  distance;
- mobile driving and tool controls present in the accessibility tree;
- both `window.render_game_to_text()` and `window.advanceTime(ms)` available;
- no navigation/start-up console errors.

The desktop composition has a clear hierarchy and the mobile layout preserves
the playable scene, vehicle instruments, opportunities, and touch controls.

## Finding RU-FND-001 — deterministic control injection

Severity: medium for automation and future replay/network work; no observed
manual-play breakage.

`window.advanceTime(ms)` calls `advanceGame(state, milliseconds)`.
`advanceGame` advances every fixed step with `IDLE_INPUT`, while live controls
are sampled only by the request-animation-frame loop. As a result, an
automation flow that holds `W` or a named touch action and then calls
`advanceTime(ms)` receives deterministic elapsed time but no deterministic
vehicle input.

Reproduction:

1. dismiss the welcome panel;
2. dispatch a `KeyW` keydown;
3. call `window.advanceTime(1500)`;
4. dispatch keyup;
5. inspect `window.render_game_to_text()`.

The vehicle does not move during the simulated interval. Letting the real-time
frame loop run while the same key is held does move it.

Recommended closure:

- allow `advanceGame` to accept an explicit `InputFrame`, retaining idle input
  as the default for existing tests and callers;
- have the browser hook pass `input.sample()` for each deterministic step, or
  expose a named-control test adapter that feeds the same canonical input
  contract;
- add a browser-level regression proving held accelerate plus deterministic
  time changes position identically across equivalent time chunking;
- keep the hook, replay, and eventual multiplayer simulation on the same
  `InputFrame` boundary rather than inventing an automation-only movement path.

Owner: root gameplay-foundation implementation.
Closure evidence: targeted test plus scripted Browser run using held named
input and `advanceTime`.

## Finding RU-FND-002 — initial bundle budget

Severity: low at the current prototype stage; potentially material for public
mobile load performance.

The production build passed but emitted a Vite warning for a 550.92 kB
minified JavaScript chunk (141.05 kB gzip). This is not a failure and is not yet
evidence of poor runtime performance.

Recommended closure:

- record an explicit prototype download/parse/frame-time budget;
- measure on named low/mid mobile devices before adding asset loaders,
  post-processing, physics, networking, or editor tooling;
- split optional systems only when the measured budget or loading experience
  calls for it.

Owner: runtime/graphics architecture.
Closure evidence: production-build size report plus device measurements.

## Non-finding: synthetic pointer-capture error

A manually constructed `PointerEvent` produced
`setPointerCapture: No active pointer` because it did not represent an active
browser-owned pointer. This was a limitation of that synthetic inspection
method, not reproduced by the normal Browser click path, and is not classified
as an application defect.

## Preservation boundary

No root implementation file was changed during this review. The concurrent
agent's foundation remains intact; this note provides evidence and a focused
handoff without creating a second production implementation.

## Addendum — deterministic input closure

The foundation subsequently added `window.applyRigInput(input, milliseconds)`.
It advances the canonical `InputFrame` and fixed-step simulation boundary
directly, clamps a single call to ten seconds, and returns the same public state
contract used by the other browser hooks. The reusable browser acceptance tool
uses this adapter to drive cargo relay, rig switching, ramp traversal, and save
restoration.

This closes RU-FND-001 for the current local acceptance scope with Tier 3/4
evidence. `window.advanceTime(milliseconds)` intentionally remains an idle-time
clock adapter; deterministic movement automation uses `applyRigInput` rather
than synthetic key timing.

## Anything else?

Yes. Keep `applyRigInput` on the same canonical `InputFrame` boundary if replay
or multiplayer transport is introduced, and add equivalent chunking tests when
that boundary becomes network-sensitive. RU-FND-002 remains an explicit
prototype performance-budget follow-up; it is not a current build failure.

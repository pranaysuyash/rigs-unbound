# First Controllable Timing Semantics (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the meaning of `PerformanceMonitor.firstControllableMs` and how it
should be interpreted in the repo’s live runtime evidence.

## Decision

`firstControllableMs` means:

> the elapsed time from boot to the first rendered frame after the runtime has
> become controllable.

In the current codebase, that marker is set after `worldEntered` becomes true
and the main loop renders the first controllable frame.

That makes the metric useful, but it is not the same thing as:

- first user input received,
- first keyboard event processed,
- or a CWV-style input readiness metric.

## Why the distinction matters

The runtime already has a live `firstControllableMs` measurement, and it is a
good operational signal for the current boot-to-play path.
However, if the project later wants a strict input-readiness measure, it should
be added as a separate metric instead of silently reusing the existing one.

That keeps the evidence honest:

- `firstControllableMs` = first frame after the game becomes controllable;
- `firstInputReadyMs` = future, explicit “first user input processed” metric.

## Current live baseline

The live runtime snapshot recorded on 2026-07-25 reports:

- `firstControllableMs`: `144040.7`

That is a real measured value from the current browser session, not a synthetic
placeholder.

Because the current browser session had already been open for a long time, the
absolute value is less important than the fact that the metric is present,
live, and reproducible.

## Relationship to other docs

- [Live Runtime Baseline Snapshot](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/LIVE_RUNTIME_BASELINE_SNAPSHOT_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)
- [WebGPU Readiness and Web Performance Analysis](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md)

## Anything else?

The repo does not need to rename the metric today to keep moving. It does need
to state the meaning clearly so future runtime comparisons do not conflate
controllability with input readiness.

## Addendum — 2026-07-26

`firstInputReadyMs` is now implemented as a separate, one-shot marker on the
first processed actionable input. `firstControllableMs` remains unchanged and
marks the first rendered frame after world entry. Unit and Field 02 browser
acceptance protect the distinction; the original “future metric” wording above
is retained as the pre-implementation snapshot.

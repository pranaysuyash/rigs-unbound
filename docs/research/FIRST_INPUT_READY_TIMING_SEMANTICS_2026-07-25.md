# First Input Ready Timing Semantics (2026-07-25)

Date: 2026-07-25

Owner: Pranay

Scope: the meaning of `PerformanceMonitor.firstInputReadyMs` and how it should
be interpreted in the repo’s live runtime evidence.

## Decision

`firstInputReadyMs` means:

> the elapsed time from boot to the first user input processed by the runtime.

In the current codebase, that marker is set when the first actionable user
input reaches the runtime, including the enter-world path.

That makes the metric a better proxy for input readiness than
`firstControllableMs`, which is about the first controllable rendered frame.

## Why the distinction matters

The project now has two related but different live signals:

- `firstControllableMs` = first controllable rendered frame;
- `firstInputReadyMs` = first processed user input.

Keeping both explicit helps future comparisons answer different questions:

- “How quickly can the game be acted on?”
- “How quickly does the game become controllable?”

## Current live baseline

The live runtime snapshot from the current browser session reports:

- `firstInputReadyMs`: `7527.9`

That is a real measured value from the current browser session, not a synthetic
placeholder.

Because the session was freshly reset before the probe, this value is the one
to use for the current runtime baseline on this turn.

## Relationship to other docs

- [Live Runtime Baseline Snapshot](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/LIVE_RUNTIME_BASELINE_SNAPSHOT_2026-07-25.md)
- [First Controllable Timing Semantics](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/FIRST_CONTROLLABLE_TIMING_SEMANTICS_2026-07-25.md)
- [Runtime Instrumentation KPIs for Production-like Profiles](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RUNTIME_INSTRUMENTATION_KPIS_2026-07-25.md)

## Anything else?

This metric exists so input readiness does not have to be inferred from a
controllability proxy. The repo now carries both signals explicitly.

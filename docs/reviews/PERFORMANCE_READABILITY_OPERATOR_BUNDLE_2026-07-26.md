# Performance and Readability Operator Bundle

Date: 2026-07-26

Status: Draft operator artifact; diagnostic only, not a public performance claim

Evidence tier: Tier 1 static synthesis from already-recorded live snapshots and contract notes. No new browser, device, or build command was run in this pass.

## Purpose

Package the umbrella performance/readability policy into one operator-facing artifact so maintainers can read the current state without jumping across a dozen fine-grained contracts.

This bundle does not replace the specialized contracts. It maps them.

## Current diagnostic snapshot

The most recent recorded live snapshot in the worklog shows:

| Signal | Recorded value | Reading |
| --- | --- | --- |
| Average frame | 20.25 ms | Readable, but not a public threshold claim |
| p95 frame | 21.7 ms | Readable, but contaminated by concurrent GPU activity |
| FPS | 49.4 | Stable enough for the current field snapshot |
| Draw calls | 73 | Measured, not yet tied to a public budget table |
| Triangles | 104,694 | Measured, not yet tied to a public budget table |
| Terrain build | 92.7 ms | First-run cost visible, not yet packaged as an operator artifact |
| Heap used | 29.4 MB | Observed, but not a cross-browser budget policy |
| First controllable | 469.2 ms | Observed input readiness, not a final acceptance claim |
| Save bytes | 2,969 | Compact, but not the only replay/recovery concern |

Source trail:

- `docs/WORKLOG.md`
- `docs/research/PERFORMANCE_AND_READABILITY_BASELINE_CONTRACT_2026-07-25.md`
- `docs/research/RESOURCE_BUDGET_AND_FALLBACK_ENVELOPE_2026-07-25.md`
- `docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md`

## Operator reading

The bundle should answer three questions:

1. Are we within budget?
2. If not, what degraded band are we in?
3. Which threshold or subsystem caused the fallback?

At the moment, the repo can answer those questions in pieces, but not yet as one canonical operator artifact.

## Policy mapping

| Umbrella state | Meaning | Existing contract owners |
| --- | --- | --- |
| Within budget | Readable field, no fail-soft required | Performance/readability baseline, visibility policy, camera feel, accessibility profile |
| Degraded but acceptable | Lower-cost rendering or presentation posture while preserving gameplay semantics | Resource budget/fallback envelope, visibility profile policy, lighting/fallback contracts |
| Fail-soft | Explicitly reduced quality with preserved controls and readable state | Resource fallback, browser-loading/profile bootstrap, public smoke-test gate |

## What this bundle is not

- Not a new engine layer.
- Not a replacement for `PerformanceMonitor.snapshot()`.
- Not a substitute for representative-device measurement.
- Not a claim that the current snapshot is clean enough for public thresholds.

## What is still missing

To promote this draft into the canonical operator artifact, the repo still needs:

- a clean representative-device capture,
- a visible budget table bound to the final acceptance bundle,
- a one-line fail-soft summary naming the exceeded threshold,
- a clear mapping from the live measurements to the specialized contract owners,
- a reusable capture package that can be reviewed without re-reading the entire trail.

## Why this is still valuable now

Even as a draft, this bundle makes the policy shape explicit:

- the runtime is observable,
- the baseline is measurable,
- the fallback story is already named,
- the missing piece is packaging, not invention.

That is the right long-term boundary for the current stage of the app.

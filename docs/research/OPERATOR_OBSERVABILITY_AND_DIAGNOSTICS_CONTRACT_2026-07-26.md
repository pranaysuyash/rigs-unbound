# Operator Observability and Diagnostics Contract

**Date:** 2026-07-26  
**Status:** Local developer/acceptance observability is active; production telemetry/export is staged  
**Evidence tier:** Tier 1 static source inspection. No browser, build, test, or deployed-environment command was run in this pass.

## Decision

The browser runtime must expose a coherent local diagnostic picture without granting diagnostics mutation authority or exposing internal tuning controls on the normal player surface.

Existing diagnostics are the canonical local evidence surface. New subsystems must extend a named snapshot, checkpoint, or developer-only evidence API rather than add ad hoc console logs as their only failure trail.

## Active evidence surfaces

| Surface | Current evidence | Intended consumer |
| --- | --- | --- |
| Public state snapshot | Canonical public state plus welcome state, runtime profile selection, bridge state, performance snapshot, map build duration, and audio-running state | Browser acceptance and developer investigation. |
| Run record | Versioned input/command/event/load/save/checkpoint entries, initial context, hashes, and retention count | Replay/debugging/authority groundwork. |
| Run-record verification | Structural schema/hash/order validation | Artifact integrity investigation. |
| Deterministic replay validation | Explicit `verified`, invalid, unsupported, divergence, and truncated-record outcomes | Local replay certification boundary. |
| Performance snapshot | Frame timing, startup/input readiness, renderer counters, bounded heap signal where available, save/load timing/size, visibility data | Renderer/profile investigation. |
| Runtime profile selection | Profile, state, and concrete fallback/recovery reasons | Explainable safe degradation. |
| Runtime asset bridge evidence | Per-asset loading/loaded/error/fallback state and node count | Asset activation/fallback investigation. |
| Camera/rig evidence APIs | Orientation, perception, camera resolution, and acceptance fixtures | 3D readability/collision review. |
| Developer diagnostics DOM panel | Compact metrics/profile/asset/visibility summary, hidden on the player surface | Local operator visibility without public tuning controls. |

## Ownership boundary

```text
simulation / storage / renderer / profile policy
  -> structured facts, checkpoints, and evidence objects
  -> local snapshot and developer diagnostics
  -> browser acceptance or developer review
```

Diagnostics observe and explain. They must not call state reducers, choose gameplay outcomes, override collision, or silently alter quality policy.

## Required behavior for a new subsystem

Every meaningful new runtime subsystem must define:

1. Its success signal.
2. Its failure and fallback signal.
3. Its bounded metrics or state summary.
4. The owner of that summary.
5. Whether the information belongs in a run record, current snapshot, developer diagnostics, or all three.
6. Whether a player-facing semantic fallback is required.
7. How the subsystem behaves if diagnostics are unavailable.

Examples:

- A future world-audio scheduler records active/cull/failure counts and selected reason; it does not make audio state authoritative.
- A future shadow tier records requested/active/fallback profile and bounded shadow resource configuration; it does not infer GPU memory totals.
- A future streaming region records requested/loading/resident/evicted/failed lifecycle and recovery reason; it does not hide a failed region behind a blank world.
- A future AI planner records candidate/selected/rejected proposals; it submits commands rather than directly updating the world.

## Evidence classifications

| Claim type | Required evidence |
| --- | --- |
| Static architecture/contract claim | Source inspection and targeted source/test review. |
| Deterministic local behavior claim | Focused test or deterministic acceptance hook. |
| Browser behavior claim | Browser/manual capture with console and visible result. |
| Target-device performance claim | Device/browser profile, measured trace/snapshot, and comparison baseline. |
| Production usage/reliability claim | Deployed telemetry or real-session evidence with privacy review. |

No current local snapshot proves production observability, cross-device performance, remote crash reporting, or player analytics. Those remain unimplemented until a product/privacy/operations decision supplies a real requirement.

## Privacy and public-surface constraints

- Developer diagnostics remain hidden outside developer/acceptance surfaces.
- Public UI should expose understandable status such as a performance safeguard, not internal thresholds or raw tuning knobs.
- Any future exported diagnostic artifact must define redaction, retention, player identity treatment, consent, and transmission ownership before it leaves the browser.
- Logs and run records must not become a backdoor for raw user input, secrets, or personally identifying telemetry.

## Non-goals

- No external telemetry vendor or analytics pipeline now.
- No production crash-reporting claim.
- No player-visible developer console.
- No inferred VRAM/CPU breakdown beyond what current browser APIs actually report.
- No replacement event bus introduced solely for diagnostics.

## Closure trigger

This contract is extended whenever a new live subsystem gains a meaningful failure mode. It is revisited as a production-operations design when the game intentionally collects or exports diagnostic data beyond the local browser surface.

## Anything else?

Yes: replay, asset, profile, and future streamed-content diagnostics should share correlation identifiers only after privacy/retention requirements are decided. The current local diagnostics do not justify a production telemetry claim.

## Addendum (2026-07-26) - episode grammar depends on diagnostics to inspect consequence

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this diagnostics contract.
- The episode grammar does not define operator tooling or debug storage; it
  depends on this layer so consequence, history, and fallback can be inspected
  without mutating gameplay or exposing hidden tuning to players.
- That preserves the split: diagnostics own explainability and investigation,
  while the episode grammar owns the story shape that diagnostics must later
  help explain.

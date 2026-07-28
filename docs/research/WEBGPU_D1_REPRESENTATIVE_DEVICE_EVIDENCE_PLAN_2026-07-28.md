# WebGPU D1 Representative-Device Evidence Plan

Date: 2026-07-28  
Status: Planned after W1  
Owner: Rigs Unbound runtime lane  
Related: [W1 checklist](WEBGPU_W1_EXECUTION_CHECKLIST_2026-07-28.md), [ADR-0028](../decisions/ADR-0028-renderer-auto-backend-governance-and-rollout-gate.md), [next execution board](../plans/NEXT_EXECUTION_BOARD_2026-07-26.md)

## First-principles question

D1 is not a browser compatibility survey. It is a bounded deployment experiment asking whether the renderer's backend policy improves the player's experience while preserving the game's authoritative behavior.

The renderer is presentation. The simulation, action resolution, save state, and recovery contracts remain authoritative and must be backend-independent.

## Device cohorts

| Cohort                         | Why it exists                                     | Minimum sample | Evidence required                                                       |
| ------------------------------ | ------------------------------------------------- | -------------: | ----------------------------------------------------------------------- |
| Reference desktop              | establishes a repeatable high-capability baseline |              1 | W1 matrix, frame-time and draw-call samples, first-frame proof          |
| Mid-tier laptop                | tests the likely general audience envelope        |              2 | sustained frame-time sample, quality behavior, recovery path            |
| Integrated/low-power device    | tests graceful degradation and thermal pressure   |              2 | fallback/quality decision, input responsiveness, no crash               |
| Mobile-capable browser surface | tests constrained viewport and memory behavior    |              2 | startup, resize/orientation, touch/input, recovery                      |
| Unknown/unsupported surface    | proves refusal and explanation behavior           |              1 | explicit policy outcome, user/operator explanation, no partial renderer |

The sample counts are a minimum evidence set, not a market-performance claim.

## Protocol

1. Freeze the world seed, route, session length, camera mode, and input script.
2. Capture a WebGL reference run before comparing another backend.
3. Execute `auto` under `stable`, `canary`, and `off` only where the policy permits.
4. Record startup and recovery checkpoints with `renderer.metrics()` from the same run.
5. Exercise movement, obstacle visibility, salvage/plough action resolution, and save/recovery.
6. Capture steady-state and stress-window metrics rather than a single best frame.
7. Repeat a failed initialization once to distinguish deterministic refusal from transient failure.
8. Assign `pass`, `review`, or `fail` with an owner and closure condition.

## Acceptance envelope

| Dimension     | D1 acceptance rule                                                                                              |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| Correctness   | no backend changes simulation outcomes, action availability, obstacle interaction, or save semantics            |
| Stability     | no uncaught initialization/rendering error; failed WebGPU setup reaches a known fallback or refusal state       |
| Observability | every backend decision has request, policy, selected backend, reason, and recovery fields                       |
| Performance   | compare sustained frame time and responsiveness against the WebGL reference; do not optimize for peak FPS alone |
| UX            | no unexplained blank scene, control loss, or policy-specific dead end                                           |
| Rollback      | disabling canary returns the same stable behavior without code changes or data migration                        |

Numerical thresholds should be set after the first reference and mid-tier samples. Pre-committing to a universal FPS target would confuse hardware variance with product quality.

## Failure taxonomy

- `unsupported`: the surface cannot provide the requested backend.
- `initialization`: backend creation failed before a usable renderer existed.
- `runtime`: a usable backend failed during rendering or resource use.
- `policy`: the request was refused or downgraded by explicit rollout policy.
- `telemetry`: the run was usable but lacked enough evidence to explain the decision.

Each failure must retain the category, user-facing recovery state, and operator action. Raw browser errors may be attached as evidence but are not the product-facing explanation.

## Exit gates

### D1 ready for decision

- All W1 rows have dispositions.
- Every device cohort has at least its minimum sample or an explicit access blocker.
- Stable WebGL reference exists for each comparison surface.
- No unresolved correctness or stability failure exists in the touched renderer path.
- Recovery and policy telemetry are present in every captured run.

### D1 outcomes

- `advance`: canary may expand to the next explicitly approved surface.
- `hold`: evidence is usable but a threshold, cohort, or recovery gap needs closure.
- `rollback`: canary remains off and the failure becomes an ADR/research follow-up.

## Long-term follow-through

After D1, the next durable move is a backend-neutral rendering contract: simulation emits world facts, a presentation adapter owns backend resources, and telemetry describes the boundary. This keeps WebGPU adoption reversible and prevents backend capability checks from leaking into gameplay rules.

## Open ownership

- Runtime owner: execute W1 and attach checkpoints/metrics.
- Product owner: approve the D1 acceptance envelope after reference data exists.
- Release owner: decide `advance`, `hold`, or `rollback` in ADR-0028.

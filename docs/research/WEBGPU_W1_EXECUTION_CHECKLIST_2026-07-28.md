# WebGPU W1 Execution Checklist

Date: 2026-07-28  
Status: Ready for execution  
Owner: Rigs Unbound runtime lane  
Related: [ADR-0028](../decisions/ADR-0028-renderer-auto-backend-governance-and-rollout-gate.md), [WebGPU research](WEBGPU_AND_WEB_PERFORMANCE_ANALYSIS_2026-07-25.md)

## Purpose

W1 answers one operational question before any broad WebGPU rollout:

> Can the renderer choose, explain, recover from, and measure its backend decision across supported deployment surfaces without changing simulation authority or user-facing game rules?

The unit of evidence is one complete startup-to-recovery session, not a browser capability claim or a successful constructor call.

## Matrix

| Row | Surface | Request | Policy | Expected outcome | Required evidence | Status |
|---|---|---|---|---|---|---|
| W1-A | Developer desktop reference | `webgl` | `stable` | WebGL selected | startup checkpoint, metrics, first frame | Pending |
| W1-B | Developer desktop reference | `auto` | `stable` | policy-approved backend selected | request, policy, selected backend, reason | Pending |
| W1-C | Developer desktop reference | `auto` | `canary` | canary decision is explicit and recoverable | policy checkpoint, backend checkpoint, recovery result | Pending |
| W1-D | Developer desktop reference | `webgpu` | `stable` | WebGPU selected, or explicit refusal with reason | backend attempt, error class, fallback policy | Pending |
| W1-E | Production-like constrained surface | `auto` | `off` | stable fallback behavior, no silent canary | policy checkpoint, selected backend, user-visible outcome | Pending |

## Capture template

Copy one block per row into the evidence log or attached run artifact.

```text
Run ID:
Date/time:
Surface/device class:
Browser + version:
OS:
World seed/session shape:
Renderer request:
Renderer policy:
Selected backend:
Selection reason:
WebGPU attempt made: yes/no
Fallback occurred: yes/no
Fallback reason:
Startup checkpoint present: yes/no
Recovery checkpoint present: yes/no/not applicable
First frame observed: yes/no
Representative metrics:
  fps:
  frame time:
  draw calls:
  triangles:
  memory/quality signal:
Gameplay invariants observed:
  movement:
  obstacle interaction:
  salvage/plough action resolution:
  save/recovery:
Operator-visible explanation:
Evidence links/artifacts:
Disposition: pass / review / fail
Follow-up owner:
```

## Pass/fail rules

- Pass only when the selected backend, request, policy, and reason are all observable together.
- Pass only when a WebGPU failure has an explicit recovery path and does not strand the renderer in a partially initialized state.
- Pass only when gameplay invariants remain unchanged across backend choices.
- Mark `review` when the run is usable but lacks a required metric, checkpoint, or device classification.
- Mark `fail` for a crash, silent fallback, missing recovery reason, inconsistent policy, or backend-specific gameplay divergence.
- A constructor success is not rollout evidence; first-frame rendering and recovery behavior are required.

## Execution order

1. Run W1-A to establish the WebGL reference.
2. Run W1-B with the same world seed and session shape.
3. Run W1-C only after the stable path has a complete checkpoint record.
4. Run W1-D on a surface with known WebGPU support and on one where support is uncertain.
5. Run W1-E with canary disabled to prove the production-like safety boundary.
6. Compare gameplay invariants and metrics before making any policy change.

## Decision gate

W1 is admissible for D1 only when every matrix row has a disposition and every non-pass item has an owner and closure condition. W1 does not authorize default WebGPU selection; it produces evidence for the ADR-0028 operator decision.

## Known gaps

- This checklist defines evidence collection but does not claim that any row has been executed in this document.
- Device/browser runs, representative metrics, and browser-console recovery traces remain to be captured.
- Automated regression coverage for backend selection and far-tier rendering should be added alongside the first executable W1 run.

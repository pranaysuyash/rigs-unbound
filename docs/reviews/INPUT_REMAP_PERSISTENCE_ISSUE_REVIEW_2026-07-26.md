# Input Remap Persistence Issue Review

**Date:** 2026-07-26  
**Status:** Open architecture issue; no runtime migration performed in this pass  
**Severity:** P2 accessibility and control-parity gap before richer device support  
**Evidence tier:** Tier 1 static source inspection. No test, build, browser, or device command was run in this pass.

## Finding

The runtime already treats control meaning as named gameplay actions, but the actual keyboard binding table is still a fixed `KEY_ACTIONS` map in `src/game/input.ts`. The repo also persists learned control lessons, yet that is a guidance feature, not a persisted binding layout.

That means the current player can learn what a control does and can use the game today, but cannot yet save a preferred remap and recover it on reload. The input surface is still browser-key canonical rather than player-preference canonical.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `src/game/input.ts` | Fixed keyboard-to-action map plus gamepad/gyro sampling | Active input source, but keyboard bindings are hard-coded. |
| `src/main.ts` | Wires input, action prompts, and control lessons | No persisted remap registry or restore path is visible here. |
| `src/game/control-guidance.ts` | Persists learned help/lesson IDs | Helpful, but not the same as a binding profile. |
| `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md` | Names remap persistence as a missing contract layer | Confirms the gap is intentional and still open. |

## Why this matters

The project’s input story should eventually be:

```text
player preference / device profile
  -> canonical binding registry
  -> action sampling
  -> fixed-step simulation input
  -> authoritative state and replay
```

Without a persisted binding registry, keyboard remaps cannot survive reloads, cross-device preference sync is impossible to reason about, and future controller or accessibility work risks creating another parallel truth source instead of extending one canonical control contract.

## Decision for the current stage

Keep the current hard-coded bindings as the live control path for now, but treat them as provisional. A real remap layer must become the canonical source of input preference before the repo adds more device-specific control complexity.

Do not introduce a second editable binding store.

## Required next proof slice

1. Define one canonical binding registry structure.
2. Persist at least one remappable binding or profile.
3. Restore that binding before input sampling begins.
4. Prove the preference survives a reload.
5. Keep learned-help persistence separate from binding persistence.

## What must not happen

- Store remaps only in transient UI state.
- Let learned lesson IDs masquerade as binding persistence.
- Create a second control profile path for gamepad or touch without a canonical registry.
- Rewrite the input stack without a reload survival proof.

## Closure trigger

This issue closes only when a binding profile can be changed, saved, and restored through one canonical control registry and the runtime uses that registry before action sampling begins.

# State Shell Visual Profile Issue Review

**Date:** 2026-07-26  
**Status:** Open presentation-architecture issue; no runtime change landed in this pass  
**Severity:** P2 visual-quality and player-readability gap before the shell becomes a canonical presentation system  
**Evidence tier:** Tier 1 static source inspection. No browser, device, or representative-capture command was run in this pass.

## Finding

The repo now has a real State Shell story in pieces, but not yet as one browser-proved canonical visual profile.

Current source evidence shows:

- `src/game/renderer.ts` already carries a `stateShell` mesh and `stateShellMaterial` slot on rig parts,
- `src/game/feedback.ts` exports a shared rig-perception frame with `integrityRatio`, `motionScale`, and `lastImpact`,
- `src/game/audio.ts` already modulates a shell oscillator from integrity,
- the visual-quality research note has a clear low/medium/high shell roadmap.

That means the shell is not just a sketch. But the repo still does not have a single explicit runtime layer that says:

```text
this is the canonical vehicle-state shell language,
this is the quality band it belongs to,
and this is the browser proof that the look is readable on representative devices.
```

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `src/game/renderer.ts` | Rig silhouette and state-shell mesh hook | Runtime anchor exists, but shell profile is not canonicalized. |
| `src/game/feedback.ts` | Shared perception frame for motion/impact/integrity | Read-only presentation signals exist. |
| `src/game/audio.ts` | Shell harmonic and strain modulation | Audio shell support exists, but not a visual profile boundary. |
| `docs/research/GAME_VFX_STATE_SHELL_VISUAL_QUALITY_2026-07-26.md` | Shell concepts, tiers, and open questions | Strong design lane, still an architectural lane. |

## Why this matters

The shell is supposed to be the player-readable bridge between vehicle state and visual language. Without one canonical browser-proved profile:

- the shell can drift between concept art, renderer code, and audio mood,
- representative-device readability remains unproved,
- future art/FX changes can quietly become a second source of truth,
- the game risks having a state shell idea without a runtime owner.

## Decision for the current stage

Keep the shell implementation narrow and compatible for now. Treat the current shell hooks as the raw runtime substrate, not as proof that the shell language has been promoted.

Do not claim a shipped visual-shell system until the browser has an explicit quality-band proof for it.

## Required next proof slice

1. Choose one canonical shell visual language for the current runtime.
2. Tie that shell to one explicit quality band or profile.
3. Prove the shell remains readable on a representative browser/device surface.
4. Keep the fallback shell behavior explicit when the richer effect is unavailable.

## What must not happen

- Let the shell live only as scattered renderer/audio comments.
- Promote the design sketches without a browser proof.
- Create a visual-shell fallback path that has no named quality band.
- Treat the presence of a `stateShell` mesh slot as a shipped shell profile.

## Closure trigger

This issue closes only when the repo can point to one browser-proved visual shell profile, tied to a named quality band, with a readable fallback story on constrained devices.

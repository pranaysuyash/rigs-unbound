# Camera Feel Contract (2026-07-25)

## Skills consulted

1. [3d-games](/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md)

## Purpose

Turn the current profile-driven camera work into a named contract for feel, comfort, and mode transitions.

The runtime already has multiple camera modes, profile-scaled offsets, obstruction pull-in, speed-based FOV changes, and reduced-motion clamping. That is a meaningful camera system. What it does not yet have is a first-class camera-policy schema that names transitions, fallback behavior, and observability in one place.

## Current evidence base

- Camera profiles and named modes:
  - [src/game/contracts.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/contracts.ts)
- Camera composition and obstruction handling:
  - [src/game/renderer.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/renderer.ts)
- Runtime camera control:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Roadmap lane for camera feel:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

Live browser anchor:

- camera selector exposes the current modes
- selecting a mode keeps focus on the playable canvas
- the runtime still uses `game-canvas` as the keyboard landing target

## What is already there

The current camera system already has strong pieces:

- named modes: chase, hood, side, tactical, top-down, survey
- profile-driven per-rig offsets instead of per-rig camera branches
- terrain pull-in when the camera would end up behind the terrain
- speed-based FOV expansion
- reduced-motion clamping in the feedback path
- narrow-viewport adjustments for portrait/mobile layouts

That is enough to prove the feel layer is real. It is not yet a formal camera policy.

## What is still missing

The repo still lacks a named policy for:

- how mode transitions are authorized
- what each mode promises about framing and comfort
- how obstruction pull-in is reported
- how reduced-motion modifies the chosen mode
- which telemetry/debug fields expose active camera policy and transition reason

At the moment, camera behavior is implemented as profile logic in the renderer. That is sensible for a first slice, but it needs a contract before more vehicles, more views, or more accessibility modes arrive.

## Contract shape

The camera policy should separate:

1. named mode
2. transition input
3. comfort profile
4. obstruction fallback
5. reduced-motion variant
6. debug/telemetry fields

Suggested camera modes:

- chase
- hood
- side
- tactical
- top-down
- survey

## Validation rules

The policy should fail visibly if it:

- falls into an undefined mode
- ignores obstruction fallback
- changes mode without reporting why
- applies speed FOV expansion when reduced motion should suppress it
- hides the active mode from operators or debug surfaces

## Near-term proof slice

The smallest durable proof for this contract is:

1. one camera-policy schema with named modes and transitions
2. one test for smooth mode transition behavior
3. one test for obstruction pull-in or camera collision avoidance
4. one reduced-motion clamp test for camera expansion or shake
5. one telemetry/debug field that reports active camera policy and reason

## Open questions

- Should mode transitions be driven by user choice only, or can the game recommend a mode for a situation?
- Which of the current modes should be the default for public browser play?
- Should camera policy be stored with save data, replay data, or both?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [EXPLORATION_MAP](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)

## Anything else?

The camera is already doing important gameplay work. This contract keeps that work explicit so the system can keep its feel while becoming easier to audit, replay, and extend.

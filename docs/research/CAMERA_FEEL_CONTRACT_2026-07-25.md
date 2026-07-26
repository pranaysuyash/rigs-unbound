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

## Addendum (2026-07-25): camera feel is already real, policy is still implicit

- Re-checked the runtime camera path after the contract review.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The current camera system already has the pieces this contract describes:
  - named modes in `src/game/contracts.ts`,
  - mode switching through `src/game/state.ts` and `src/main.ts`,
  - profile-driven offsets per rig,
  - terrain obstruction pull-in in `src/game/renderer.ts`,
  - speed-based FOV expansion in `src/game/renderer.ts`,
  - reduced-motion clamping in `src/game/feedback.ts`,
  - telemetry hooks (`getRigPerceptionEvidence`) that expose camera-feel state.
- The policy is still implicit rather than formal:
  - no dedicated camera-policy schema,
  - no explicit transition reason table,
  - no operator-visible camera-policy summary field,
  - no separate persistent camera-policy artifact beyond save-state camera mode.
- The missing piece is therefore not “camera behavior”; it is the explicit
  camera policy contract that names transitions, comfort, and observability.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26): the obstruction and mount contract is explicit

The camera policy now separates reusable meaning from physical and spatial
facts:

1. `CAMERA_MODES` and shared renderer policy own what each view means.
2. `RIG_HOOD_CAMERA_MOUNTS` owns only each rig's physical forward-view socket.
3. `queryCameraObstruction` owns the nearest-hit contract across terrain,
   procedural obstacles, felled world memory, and authored structures.
4. `CameraResolutionEvidence` reports ideal/resolved distance, source/object ID,
   post-resolution clearance, and rig self-intersection.

Transition rules now cut on mode changes and large focus teleports, resolve
inward immediately, recover outward gradually, and revalidate the smoothed
candidate. High overview policies keep the cheaper terrain-only query.
Reduced-motion continues to suppress optional camera expression without
changing spatial safety.

Acceptance evidence now includes:

- nearest authored Home-structure obstruction at fresh spawn, resolved to a
  clear shorter boom (`home-barn-roof` at the canonical v6 berth);
- a deterministic real standing tree that shortens the chase boom and the same
  tree's felled state that restores it;
- all three named rig sockets with clear, non-self-intersecting hood poses;
- a bounded browser harness that closes with exit code 0 and no captured
  console/page errors.

Remaining camera-policy work is product-facing recommendation/transition
reasoning, not obstruction or mount correctness. Any future automatic camera
recommendation must remain advisory, explainable, and overridable by the
player.

## Addendum (2026-07-26) - camera policy is live, but still not surfaced as a named contract artifact

- Re-checked the live browser daemon and the current camera wiring.
- The runtime is still healthy and named `Rigs Unbound — Field 02`, with zero
  console logs in the current daemon snapshot.
- The camera system is still intentionally rich:
  - named modes remain exposed in `src/game/contracts.ts`,
  - `src/main.ts` routes mode selection through commands and checkpoints,
  - `src/game/renderer.ts` resolves obstruction pull-in and speed FOV,
  - reduced-motion clamping remains active in the feedback path,
  - `getCameraResolutionEvidence()` exposes active camera-resolution evidence.
- The live UI already keeps the world readable when the camera changes, and the
  playable canvas remains the keyboard landing target.
- What is still missing is the named policy surface the contract asks for:
  - no camera-policy schema,
  - no explicit transition reason table,
  - no operator-visible camera-policy summary field,
  - no separate persistent camera-policy artifact beyond the save-state camera
    mode.
- So the camera layer is real, legible, and already doing gameplay work, but
  its policy is still implicit in code rather than first-class contract data.

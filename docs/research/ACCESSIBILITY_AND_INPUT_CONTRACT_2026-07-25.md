# Accessibility and Input Contract (2026-07-25)

## Skills consulted

1. [3d-web-experience](/Users/pranay/Projects/skills/3d-web/3d-web-experience/SKILL.md)

## Purpose

Turn the repo’s existing input paths and accessibility fallback pieces into a named contract for device-neutral actions, remapping persistence, reduced-motion safety, and readable feedback.

The runtime already supports keyboard and gamepad input, reduced-motion behavior, and a separate render/accessibility smoke-test gate. What it does not yet have is a first-class contract that says how actions, bindings, comfort settings, and device parity are owned.

## Current evidence base

- Browser entry point and action hooks:
  - [src/main.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/main.ts)
- Action sampling and device mapping:
  - [src/game/input.ts](/Users/pranay/Projects/Game_dev/rigs-unbound/src/game/input.ts)
- Current accessibility smoke-test gate:
  - [docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)
- Runtime accessibility findings:
  - [docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/ACCESSIBILITY_RUNTIME_FINDINGS_2026-07-25.md)
- Roadmap lane for accessibility and input:
  - [docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)

## What is already there

The repo already has a strong base:

- actions are already present as game semantics rather than raw keys alone,
- keyboard, gamepad, and touch all exist in the runtime surface,
- reduced-motion behavior is already partially respected,
- the accessibility smoke-test gate already names the public-readiness requirement.

That means the input layer can be formalized without changing the game’s control model.

## What is still missing

The current surface still lacks:

- a named-action schema that persists remaps,
- explicit device-neutral intent definitions,
- a contract for hold/tap/repeat semantics,
- visible accessibility or input profile state,
- clear rules for reduced-motion clamping,
- explicit contrast/readability guard behavior for core cues,
- a parity statement for keyboard, gamepad, and touch.

## Contract shape

A durable accessibility/input contract should separate:

1. **Action model**
   - named actions
   - device-neutral intent
   - hold/tap/repeat semantics
2. **Binding model**
   - keyboard
   - gamepad
   - touch
   - remap persistence
3. **Comfort model**
   - reduced motion
   - camera shake limits
   - FOV spike limits
   - visual contrast / readability
4. **Parity model**
   - same gameplay meaning across devices
   - explicit differences when intentionally unsupported
5. **Visibility**
   - current input profile
   - current accessibility profile
   - readable fallback state

This keeps accessibility part of gameplay quality instead of a separate settings-only concern.

## Validation rules

The contract should fail visibly if it:

- treats controls as device-specific instead of action-specific,
- loses remap persistence,
- allows motion or visual effects to exceed comfort limits in reduced-motion mode,
- hides the active input/accessibility profile,
- makes one input device mean a different gameplay action without an explicit reason,
- lets critical state feedback depend only on motion or color.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one named-action schema with device-neutral intents,
2. one remapping or binding persistence test,
3. one reduced-motion clamp for camera or visual feedback,
4. one contrast/readability check for a core UI or world cue,
5. one telemetry or debug field identifying the active input or accessibility profile.

## Open questions

- Should the first remap surface cover camera, movement, or both?
- Should accessibility settings be saved per profile, per save slot, or both?
- Should device-parity differences be explained in the HUD or only in settings/debug views?

## Linked artifacts

- [3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAME_OPTIMIZATION_AND_MORE_EXECUTION_ROADMAP_2026-07-25.md)
- [3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/3D_GAMES_ANALYSIS_AND_LONG_TERM_POTENTIAL_2026-07-25.md)
- [EXPLORATION_MAP.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/exploration/EXPLORATION_MAP.md)
- [RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md](/Users/pranay/Projects/Game_dev/rigs-unbound/docs/research/RENDERER_PERFORMANCE_AND_ACCESSIBILITY_CONTRACT_2026-07-25.md)

## Anything else?

The runtime already behaves much closer to accessible than a typical canvas shell.
This contract names the remaining gap so input parity, remaps, and comfort rules
stay durable as more actions and more devices are added.

## Addendum (2026-07-25): operable shell is real, remap/policy layer is still implicit

- Re-checked the current runtime, input abstraction, and accessibility findings.
- The live browser surface is still healthy and named `Rigs Unbound — Field 02`,
  with zero console logs in the current daemon snapshot.
- The runtime now clearly supports the contract’s base claims:
  - device-neutral named actions exist in `src/game/input.ts`,
  - keyboard and gamepad both feed the same action model,
  - touch/button controls route into the same tap/hold semantics in
    `src/main.ts`,
  - reduced-motion behavior is already present in the renderer and feedback
    path,
  - the accessibility runtime recheck shows the original skip-link/focus gap is
    closed in the live page.
- What is still missing is the explicit policy layer:
  - persisted remaps,
  - visible input/accessibility profile state,
  - comfort policy surface for motion and contrast,
  - a durable parity statement for intentionally unsupported differences.
- So the repo is now past the “is the shell operable?” question and still short
  of the fully named accessibility/input policy the contract describes.
- Evidence depth: Tier 4 runtime/manual observation plus Tier 1 static code
  inspection.

## Addendum (2026-07-26): loading explicitness and profile visibility are the next accessibility gate

- Re-checked the live browser daemon while following the 3d-web-experience and
  Accessibility Auditor lanes.
- The runtime remains operable, but the first public-entry experience still
  needs a clearer accessibility contract for:
  - truthful loading state,
  - recoverable fallback behavior,
  - explicit low/balanced/high quality-profile selection,
  - visible input/accessibility profile state for the active session.
- This is not a request to change the current control model. The current
  keyboard, gamepad, touch, and reduced-motion paths are already good enough
  to keep; the missing piece is a named policy surface for entry and comfort.
- Evidence depth: Tier 4 runtime/status observation plus Tier 1 doc and skill
  inspection.

## Addendum (2026-07-26): explicit bootstrap status is now part of the accessible shell

- The existing `#welcome-panel` is now the one canonical entry surface for both
  visual and assistive-technology startup feedback. It is a labeled dialog with
  an explicit description and a polite, atomic `#bootstrap-status` live region.
- The initial HTML truth is `aria-busy="true"` with `Preparing field systems.`;
  once the synchronous world and storage bootstrap has completed, `src/main.ts`
  changes the shell to `aria-busy="false"` and marks that same status as ready.
  The text distinguishes a restored session from a new entry without claiming a
  percentage or asset-loading state that the runtime does not measure.
- Keyboard focus starts on `Enter the field` while the dialog is open and moves
  to the playable canvas only after that action. This preserves the existing
  semantic control boundary: the welcome dialog owns entry, while the canvas
  owns play.
- This is intentionally not a quality-profile selector or a recoverable
  bootstrap-error experience. Those need a measured profile policy and an
  explicit renderer/bootstrap failure boundary before they can be truthful.
- Evidence depth: Tier 1 static implementation review. The remaining proof is
  a browser/VoiceOver walkthrough that confirms announcement timing, focus
  order, and error behavior under a deliberately failed bootstrap.

## Anything else?

No additional accessibility ownership moved into the renderer: DOM remains the
source of truth for entry state and the canvas remains the focused play surface.

## Addendum (2026-07-26): first-use explanations follow semantic relevance

- The runtime now has one canonical contextual lesson resolver for drive,
  contextual act, workshop fit, blade, camera, surveyed map, nearby rig switch,
  and recovery controls.
- Each lesson explains purpose plus keyboard and touch input. It is non-modal,
  retires on actual use or explicit dismissal, and is suppressed when welcome,
  map, or pause owns attention.
- Learned lesson IDs are resilient browser-local UI preferences. They do not
  enter the world save, progression, activity, or Rig contracts.
- This closes the “first encounter explanation” gap for the current action set.
  Remappable bindings, gamepad glyphs, cross-device preference sync, and human
  comprehension evidence remain open.
- Evidence depth: Tier 2 resolver coverage, Tier 3 production browser
  acceptance, and Tier 4 desktop plus 390×844 visual inspection.

## Anything else?

The new layer complements rather than replaces the permanent control strip and
contextual action prompt. Future binding work should make all three read from
one canonical semantic-action registry.

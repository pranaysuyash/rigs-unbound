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

## Addendum (2026-07-26) - first-use guidance is canonical, but remapping is still future work

- Re-checked `src/main.ts`, `src/game/control-guidance.ts`, and
  `src/game/input.ts` against the current input lane.
- The runtime now has a real canonical first-use guidance surface:
  - `resolveControlLesson()` picks a single context-aware lesson from semantic
    gameplay relevance,
  - the lessons are non-modal and suppress themselves when welcome, map, or
    pause owns attention,
  - learned lesson IDs persist in browser-local storage so the same explanation
    does not keep reappearing after the player has used it.
- That is a meaningful accessibility improvement because the browser can now
  explain the current action set without turning the HUD into a full help
  screen.
- The input policy is still missing the next layer the contract names:
  - no persisted remap schema,
  - no visible input/accessibility profile state,
  - no cross-device preference sync,
  - no formal parity statement for intentionally unsupported differences.
- So the runtime now closes the “how do I learn what this does?” gap, while the
  “how do I remap or persist my preferred controls?” gap remains open.
- Evidence depth: Tier 1 static source inspection of the current browser
  control-guidance path.

## Addendum (2026-07-26): the binding table is still browser-key canonical, not preference canonical

- Re-checked `src/game/input.ts`, `src/main.ts`, and the current accessibility
  contract against the live control path.
- The runtime still uses a fixed `KEY_ACTIONS` table for keyboard bindings, so
  the browser key map is authoritative at input time.
- Learned control lessons are persisted separately, but they only remember help
  state. They do not save or restore the actual binding layout.
- That leaves the next accessibility/input contract layer open:
  - a canonical binding registry,
  - remap persistence,
  - restore-before-sampling behavior,
  - and a reload proof that the preferred layout survives session reset.
- Evidence depth: Tier 1 static source inspection. No browser or reload proof
  was run in this pass.

## Addendum (2026-07-26) - episode grammar depends on this layer to make player agency expressible

- The new [Compositional Episode Grammar and Storm Relay](../exploration/COMPOSITIONAL_EPISODE_GRAMMAR_AND_STORM_RELAY_2026-07-26.md)
  proposal sits above this input contract.
- The episode grammar does not define controls, remaps, or comfort policy; it
  depends on this layer so the player can actually express the chosen episode
  through named actions, readable feedback, and device parity.
- That keeps the boundary clean: input/accessibility owns player agency and
  comfort, while the episode grammar owns how those actions are composed into a
  richer story shape.

## Addendum (2026-07-28): the 2D shell now reads as separate status bands on mobile

- Re-checked the live browser on a 390 × 844 viewport after the visible
  profile and announced save updates landed.
- The field-kit shell now presents the profile and save messages as two
  separate, readable status bands in the public HUD rather than one merged
  message:
  - `#profile-status` remains visible and reads the active quality state in
    plain language,
  - `#save-status` remains visible and continues to announce persistence
    changes,
  - `#runtime-diagnostics` stays hidden from the public HUD.
- The geometry check confirms the bands do not overlap at mobile width, which
  keeps the 2D shell legible instead of collapsing into a tight block.
- This is the right kind of 2D-game clarity work: every status line has one
  job, and the shell communicates state without competing layers.
- Evidence depth: Tier 4 live browser layout observation plus Tier 1 source
  inspection.

## Addendum (2026-07-28): Chrome accessibility-tree proof confirms the status bands are exposed to AT

- Ran a Chrome accessibility-tree snapshot against `http://localhost:4173/?proof=1`
  at 390 × 844.
- The profile line and save line both appear in the tree as exposed text, so
  the visible status bands are not just painted pixels; they are part of the
  browser’s accessible representation of the shell.
- The profile band remains separate from the save band, and the operator
  diagnostics remain hidden, which keeps the public HUD distinct from the
  developer surface.
- This is stronger than DOM-only proof and narrows the remaining gap to a
  spoken screen-reader narration check rather than a shell-structure rewrite.
- Evidence depth: Tier 3/4 browser accessibility-tree observation plus Tier 1
  source inspection.

## Addendum (2026-07-28): the visible shell status bands now match the accessible shell contract

- Re-checked the live browser at `390 × 844` after the profile/save updates
  landed in the field-kit shell.
- The public HUD now presents the accessibility-relevant shell state as two
  separate status bands instead of one merged status line:
  - `#profile-status` displays the active quality profile in plain language,
  - `#save-status` announces persistence changes,
  - `#runtime-diagnostics` remains hidden from the public HUD.
- The accessibility-tree proof is now aligned with the visible shell:
  - both status bands are exposed as readable text in the browser tree,
  - the bands do not overlap at mobile width,
  - the remaining gap is spoken screen-reader narration, not shell structure.
- That makes the current shell contract stronger in two ways:
  - the player can read the state directly,
  - assistive technology can reach the same state without needing the developer
    diagnostics surface.
- Evidence depth: Tier 4 live browser layout observation plus Tier 3/4
  accessibility-tree inspection and Tier 1 source inspection.

## Addendum (2026-07-28): the remaining input gap is the canonical binding registry, not the guidance surface

- Re-checked the live input contract against the current docs trail and the
  named-action model.
- The first-use guidance and opportunity compass are now treated as canonical
  surfaces for explaining what to do next.
- The still-open contract layer is the binding registry itself:
  - one persisted action-layout source of truth,
  - remap restore before sampling,
  - reload survival for preferred keyboard layouts,
  - and a clean place for device-parity bindings to land without creating a
    second truth source.
- That means future accessibility work should extend the named-action contract,
  not fork a separate help-only map or a second input authority.
- Evidence depth: Tier 1 static source inspection and docs synthesis.

## Addendum (2026-07-28): the radial quick-action wheel should inherit the canonical action model

- The newly drafted radial wheel contract treats `src/game/radial-ui.ts` as a
  bounded quick-action overlay, not as a separate control authority.
- The wheel should map to the same named-action registry as the rest of the
  input model, which keeps remaps, accessibility, and device parity coherent.
- That means the wheel is an input surface consumer, not a place to invent new
  control semantics.
- Evidence depth: Tier 1 static source inspection plus contract synthesis.

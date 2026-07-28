# Radial Quick-Action Wheel Contract (2026-07-28)

**Status:** proposed interaction contract - not implemented in play  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related input contract:** [Accessibility and Input Contract](./ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md)  
**Related shell spec:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related roadmap:** [Integration-First Design and Unification Roadmap](../exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md)

## Purpose

Define the contract for the radial quick-action wheel so it becomes a bounded
player-facing control surface instead of dead code.

The current runtime already contains an authored radial menu definition in
`src/game/radial-ui.ts` for quick vehicle-system actions such as winch,
tire pressure, diff lock, seismic pulse, and radio. What is missing is the
explicit contract for how that wheel is surfaced, when it is available, and
how it avoids becoming a second authority.

## Current evidence the wheel contract must respect

- `src/game/radial-ui.ts` already defines menu items, categories, availability,
  and selection rules.
- `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`
  explicitly flags the radial wheel as dead code and a remaining integration
  seam.
- `docs/research/ACCESSIBILITY_AND_INPUT_CONTRACT_2026-07-25.md` already
  names the action-model and remap registry boundary that any quick-action
  control must honor.
- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` already requires that
  major shell surfaces remain explicit, focus-safe, and secondary to the rig.

## Decision

The radial wheel should be treated as a **bounded quick-action overlay** for
rig-local capabilities.

It should:

- surface named actions from the canonical input model,
- remain secondary to the rig and shell,
- preserve the current runtime context,
- stay reachable through explicit shell/input bindings,
- respect accessibility and reduced-motion expectations,
- and avoid inventing a separate action authority.

The wheel must not:

- become a hidden duplicate of the main action model,
- own save state,
- override the canonical named-action registry,
- or introduce a new control vocabulary only visible inside the wheel.

## Action model

The wheel should present only actions that can be explained as current rig
capabilities or contextual vehicle controls.

Examples from the current authored wheel definition:

- winch spool in/out,
- tire pressure changes for terrain,
- diff lock,
- seismic sensing,
- radio scan/tuning.

These actions should be mapped to stable named actions rather than raw button
presses or one-off callbacks.

## Availability model

Each wheel item should have a visible availability state:

- available,
- unavailable,
- active,
- contextual/conditional.

That availability should be derived from the current rig, modules, and active
state. The wheel should never fake availability just to fill the ring.

## Accessibility contract

The wheel should satisfy the same accessibility expectations as the shell:

- keyboard and gamepad navigation,
- touch access where practical,
- visible focus / selection state,
- readable labels and badges,
- no reliance on color alone,
- reduced-motion safe open/close behavior,
- clear exit path back to play.

If the wheel cannot be made keyboard reachable, it should not be promoted into
the player surface.

## Lifecycle

1. Open the wheel from a named shell action or rig-context input.
2. Populate it from current rig state.
3. Show availability and active state.
4. Select an action through the canonical action model.
5. Close cleanly and return to play.

The wheel should not persist its own state beyond the current session context
unless a future preference contract explicitly requires it.

## Validation rules

The contract should fail visibly if it:

- exposes actions that do not exist in the current runtime model,
- requires pointer-only interaction,
- drops focus or context when opened,
- becomes a second place where controls are redefined,
- or disconnects from the named-action registry.

## Out of scope for this first slice

- No new physics simulation.
- No new save schema.
- No player-facing ability unlock tree.
- No dynamic radial customization UI.
- No separate quick-action authority outside the shell/input contract.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one explicit wheel open/close action,
2. one accessible selection path,
3. one visible availability state per item,
4. one canonical mapping from wheel selection to named action,
5. one focus/escape path back to play.

## Open questions

- Should the wheel be opened only in rig mode or also while paused in the shell?
- Should unavailable actions be hidden or shown as disabled?
- Should the wheel be strictly rig-local, or may it eventually include world
  quick actions like map markers or deployable tools?
- Should the wheel be tied to gamepad/touch first, or remain equally primary on
  keyboard?

## Anything else?

Yes: the wheel is valuable only if it clarifies the rig’s current capability
set. If it becomes a second menu vocabulary, it will be a regression rather
than an improvement.

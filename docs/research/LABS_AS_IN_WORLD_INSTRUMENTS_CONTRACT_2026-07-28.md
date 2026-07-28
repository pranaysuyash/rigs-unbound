# Labs as In-World Instruments Contract (2026-07-28)

**Status:** proposed read-only shell contract - not implemented  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related shell spec:** [Unified UI Shell Specification](./UNIFIED_UI_SHELL_SPEC_2026-07-27.md)  
**Related roadmap:** [Integration-First Design and Unification Roadmap](../exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md)

## Purpose

Define the missing contract for the lab surfaces so they become in-world
instruments rather than separate pages that break the runtime context.

The labs are not a new game layer. They are diagnostic and teaching tools that
should remain legible, accessible, and recoverable inside the same shell
context as the rest of the game.

This contract exists because the roadmap already identifies two separate lab
pages, `physics-lab.html` and `box3d-lab.html`, as a continuity problem. The
current shell contract says the labs should become a drawer or route within the
same runtime rather than separate pages.

## Current evidence the labs contract must respect

- `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`
  already names "Labs Drawer" as a shell surface and describes the labs as
  separate pages that should be converted into in-world instrument modes.
- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` already lists the Labs
  Drawer as a future major overlay.
- `docs/research/RECLAMATION_STRATEGIC_SYNTHESIS_2026-07-26.md` treats the
  developer labs as evidence fixtures, not player-facing surfaces.
- The shell and roster contracts already prefer read-only overlays that reuse
  the shared shell manager instead of inventing new authorities.

## Decision

The labs should be treated as **in-world instrument modes** surfaced from the
shared shell, not as separate games or separate browser pages.

The first useful slice should:

- preserve the current save/runtime context,
- keep the player in the same app shell,
- make labs reachable from an explicit shell action,
- avoid duplicating runtime authority,
- remain read-only with respect to the main game state,
- keep developer diagnostics separate from player-facing instruments.

The labs contract must not:

- become a second simulation authority,
- own save state,
- branch into a separate page load path for the first slice,
- silently drop the current runtime context,
- or blur the difference between evidence fixtures and player-facing content.

## Labs surfaces

### Physics lab

The physics lab should focus on solver behavior, collision cases, and small
repeatable experiments.

### Box3D lab

The Box3D lab should focus on solver comparison, contact cases, and geometry
cases relevant to the current runtime evidence program.

### Future instrument types

The shell may later include additional instruments, but only if they preserve
the same read-only, context-preserving contract.

## Proposed layout

The labs drawer should behave like a bounded instrument tray:

```text
World / play state
  -> Shell overlay manager
    -> Labs drawer
      -> Physics lab
      -> Box3D lab
      -> future instruments
```

The drawer should be explicit about what it is and how to exit.

## Data contract

The labs drawer should read the current shell/runtime state, including:

- active overlay state,
- current save/session identity,
- the current mode or route context,
- any lab-specific selection state that is already part of the shell layer.

It should not create a parallel save format, a second fixture store, or a new
game authority.

## Accessibility contract

The labs drawer should satisfy the same accessibility expectations as the rest
of the shell:

- semantic landmarks,
- visible heading and exit path,
- focus trap and focus restore,
- keyboard and touch parity,
- reduced-motion respect,
- clear text labels for lab actions,
- no keyboard traps,
- no hidden-only state.

The labs are evidence tools, but they still need to be usable on the same
devices as the game.

## Lifecycle

1. Open the labs drawer from the shell.
2. Select an instrument.
3. Keep the current runtime context alive while the instrument runs.
4. Return to the shell without dropping the current save state.
5. Preserve the same overlay focus and close behavior as other major shell
   surfaces.

## Validation rules

The contract should fail visibly if it:

- drops save/session context on open,
- creates a second authority for the same solver evidence,
- hides the exit path,
- becomes pointer-only,
- or forks the lab into a separate page for the first slice.

## Out of scope for this first slice

- No runtime migration of the solver labs themselves.
- No new physics engine.
- No new save schema.
- No lab-specific multiplayer.
- No player-facing promotion of lab fixtures into canonical gameplay.

## Near-term proof slice

The smallest durable proof for this contract is:

1. one explicit Labs drawer entry in the shell,
2. one context-preserving open/close path,
3. one instrument-selection surface,
4. one focus/keyboard contract,
5. one documented route back to play.

## Open questions

- Should the labs drawer be modal, split-pane, or a same-runtime route?
- Should physics and Box3D share a common drawer wrapper or diverge by lab?
- Should the labs stay visible only through explicit developer affordances?
- Should there be a dedicated lab selector in the shell or a generic "Tools"
  entry?

## Anything else?

Yes: the key product rule is continuity. The labs are useful only if they let
the user inspect a problem or evidence path without breaking the world they are
trying to understand.

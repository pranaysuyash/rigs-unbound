# Labs Drawer Continuity Issue Review

**Date:** 2026-07-28  
**Status:** Open shell continuity gap  
**Severity:** P2 player/context continuity gap  
**Evidence tier:** Tier 1 static source inspection and design reasoning

## Finding

The repo’s shell docs already agree that labs should become in-world instruments
rather than separate pages:

- `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md`
- `docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md`
- `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

They also agree on the intended direction:

- labs should preserve the current runtime/session context,
- labs should be reachable from the shared shell,
- labs should not create a second authority,
- and labs should be read-only instruments, not separate games.

What is still missing is the runtime shell-mounted drawer boundary itself. The
roadmap explicitly calls out the continuity problem: `physics-lab.html` and
`box3d-lab.html` are still separate page entries, which means switching into a
lab drops the live shell context instead of staying inside one recoverable
overlay system.

## Why this matters

The labs are not just a developer convenience. In this project they are part of
the player’s trust boundary:

1. they teach the current machine model,
2. they provide evidence for physics and interaction behavior,
3. they should do that without breaking the current save/session/world context.

A separate page boundary makes the lab feel like a detached tool rather than a
bounded instrument tray. That weakens continuity, focus restore, and the
"one game, one shell" model the rest of the repo is building.

## Current evidence

| Artifact | Role now | Canonical status |
| --- | --- | --- |
| `docs/research/UNIFIED_UI_SHELL_SPEC_2026-07-27.md` | Labs drawer is a future major overlay | Canonical shell contract |
| `docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md` | Labs should be context-preserving instruments | Canonical lab contract |
| `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md` | Separate lab pages are still the named continuity problem | Canonical roadmap note |

## Recommendation

The next durable slice should keep the direction explicit:

1. preserve the labs-as-instruments contract,
2. keep the shell as the shared entry point,
3. replace the separate page hop with a shell-mounted drawer or equivalent,
4. preserve focus and the current runtime/session context on open and close.

## Closure trigger

This issue closes only when the labs are reachable through the shared shell as a
context-preserving drawer or equivalent runtime surface, with:

- no separate-page context drop,
- a clear exit path back to play,
- and focus behavior that matches the rest of the shell.

## Anything else?

Yes. This review intentionally stays at the shell boundary. It does not invent
a new lab runtime or a new physics engine. It simply records that the current
separate-page boundary is still the thing preventing the labs contract from
being fully realized.

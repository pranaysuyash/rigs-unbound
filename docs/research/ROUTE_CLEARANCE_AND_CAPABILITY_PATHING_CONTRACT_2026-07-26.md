# Route Clearance and Capability Pathing Contract

**Date:** 2026-07-26  
**Status:** Authored route clearance is real; capability-aware path selection is still future-bound  
**Evidence tier:** Tier 1 static source inspection. No test, build, browser, or long-distance runtime command was run in this pass.

## Decision

Keep route clearance as an authored corridor guarantee, not a generalized path-planning system.

The current game already has a deterministic and readable route model:

- `terrain.ts` benches authored routes into grade-limited corridors;
- `state.ts` can recover a disabled rig by winching it back to the nearest authored track;
- `contracts.ts` already defines clearance and capability vocabulary for rigs and mobility.

That is enough for the current scale. What is not yet present is a separate route-cost resolver that ranks alternative paths by capability, clearance, or hazard.

## Current route model

| Concern | Current posture |
| --- | --- |
| Route construction | Authored routes are turned into grade-limited elevation profiles. |
| Route legality | The corridor is deterministic and validated by construction. |
| Recovery behavior | A disabled rig can be winched back to the nearest authored track. |
| Clearance vocabulary | Clearance exists as a real rig state and contract field. |
| Capability vocabulary | Capabilities already gate affordances and recovery options. |
| Diagnostic language | Failure reasons are still mostly prose, not structured route-cost events. |

## What is already real

- The terrain layer is not guessing; it builds a bounded, sample-based corridor and grade-limits it.
- The recovery path is not generic pathfinding; it snaps back to the nearest track segment within range.
- Capability mismatch is already a first-class refusal path in the affordance layer.

That means the project already has the pieces of a route-clearance story, but they are still separate local rules rather than a unified pathing contract.

## Why this is not yet a planner

A planner would need to choose among multiple viable paths and explain why one route beats another. The current runtime does not do that.

There is no:

- graph search over alternative corridors;
- ranking by vehicle dimensions or mobility class;
- structured cost model for grade, clearance, or hazard;
- replayable reason record for why one path was selected over another;
- diagnostic overlay that shows route cost instead of a prose failure string.

## Admission trigger

Treat this as a real pathing contract only when the game needs one of these:

- more than one viable route to the same destination;
- a user-facing explanation of why a machine cannot traverse a segment;
- a route choice that depends on mobility class, attachment state, or clearance;
- replayable route-cost evidence for debugging or tuning.

## Required future contract

If we later need capability-aware route costs, define the contract around:

```text
requested destination
  -> candidate paths
  -> capability / clearance / grade evaluation
  -> structured reason record
  -> authoritative selection
  -> replay / diagnostic output
```

The contract should state:

- which mobility traits are hard blockers versus soft penalties;
- how clearance is measured and compared;
- whether hazards are avoided or merely scored;
- how route reasoning is serialized for replay and debugging;
- how the UI renders a failure or a choice without inventing new truth.

## Safety invariants

- An authored route must remain traversable for the machines it was built to support.
- A recovery action must not change authoritative world state beyond the declared recovery effect.
- Route explanations must not contradict the actual terrain or mobility contracts.
- A future planner must not silently replace the authored corridor guarantee with ad hoc geometry checks.

## Non-goals

- No general navigation mesh now.
- No multi-route ranking system now.
- No route-cost UI layer now.
- No rewrite of authored route geometry into a hidden planner artifact.

## Closure trigger

Close this gate only when a real vertical slice needs route choice across multiple viable paths and ships the full story together:

- candidate generation,
- capability-aware scoring,
- structured reasons,
- runtime diagnostics,
- and replayable evidence.

## Anything else?

Yes: the current route story is already good enough to keep the game legible. The missing work is not more geometry. It is a shared explanation layer for why a route is possible, blocked, or preferred.

# 3D Game Skill Application: Unbound Passage 01

- Date: 2026-07-26
- Status: readiness analysis; implementation gated
- Evidence tier: Tier 1 repository synthesis
- Skill applied: `/Users/pranay/Projects/external-skills/davila7__claude-code-templates/cli-tool/components/skills/creative-design/game-development/3d-games/SKILL.md`
- Primary product record: `docs/exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md`
- Owner / next reviewer: project owner

## Purpose

Apply the 3D-game skill to the proposed **Unbound Passage 01: Three Ways
Through** proof without prematurely changing the active runtime. This record
separates what the current repository synthesis supports from what the next
vertical slice must prove.

The proposed slice is intentionally small:

```text
one blocked passage
-> two capability-authored solution lanes
-> one bounded persistent world consequence
-> a second rig inherits the benefit
-> save/reload and failure/recovery remain readable
```

This is not approval to implement. The arbitration record requires first-rung
closure and operator sign-off before the active Farmfall order changes.

## Skill-to-slice analysis

### 1. Rendering pipeline

The passage must communicate the blocked destination, lane differences, route
state, and inherited benefit without requiring a new render architecture.

The first proof should use existing geometry, materials, visibility policy, and
state-derived UI. Frustum culling, batching, and LOD remain infrastructure
constraints, not reasons to add decorative passage complexity. Any new route
marker must be cheap, bounded, and removable without changing simulation truth.

Admission check:

- the player can identify the blocked destination from the normal view;
- each lane reads as physically different before the action begins;
- the repaired or authored route remains visible after switching rigs;
- no presentation object becomes the authority for passage state.

### 2. Shaders and materials

The skill supports custom shaders for identity and effects, but this slice does
not need a new shader family. The consequence should be legible through a
small material or state change that reuses the existing material strategy.

Do not encode passage truth only in a shader uniform. The authoritative change
belongs in world state and memory; the renderer may observe it and present it.

Admission check:

- material change is a presentation of a persisted state, not the state itself;
- the visual cue survives save/reload;
- reduced-motion and low-capability profiles retain an equivalent non-animated
  cue;
- no shader work is accepted unless it improves comprehension or measured
  identity.

### 3. Physics and collision

The passage is a physics proof, not a solver-selection exercise. Use the
existing locomotion and terrain contracts to make the lanes genuinely
different. Prefer simple collision shapes and bounded raycasts for route
clearance, support, or line-of-sight checks. Avoid mesh-collider expansion for
decorative geometry.

The two lanes must differ by capability and consequence, not only by rig name
or speed. A valid proof could use a heavy ground lane and a narrow water,
hover, or elevated lane, provided the capability resolver explains why each
option is offered.

Admission check:

- lane eligibility comes from capabilities and affordances;
- no central activity branch checks a rig identifier;
- collision and traversal outcomes are deterministic and recoverable;
- the second rig receives a real traversal benefit rather than a cosmetic
  success flag.

### 4. Camera systems

The camera must preserve the player's ability to understand the passage while
driving, acting, switching rigs, and recovering from failure. Existing camera
contracts should be reused. A new camera mode is not justified by the first
proof unless the passage introduces a genuinely different spatial scale.

The camera acceptance surface should cover:

- approach readability for both lanes;
- action feedback without hiding the route consequence;
- continuity after spatial rig switching;
- no abrupt framing that makes the inherited benefit ambiguous;
- collision avoidance near the passage geometry.

Camera motion remains presentation-only. It must not determine whether the
passage was completed.

### 5. Lighting

Lighting should make the blocked route, active lane, and repaired route
readable at the existing quality profiles. The first proof should prefer
existing directional or ambient lighting plus low-cost markers over new realtime
shadow cascades or extra local lights.

If the passage is tested at night or under pressure, the test is about
readability and recovery, not about adding a lighting system. Any new light
must have a clear budget and a fallback for constrained devices.

### 6. Level of detail and budgets

The slice is local and should remain local. Do not add distant passage
simulation, high-detail debris, or persistent particle fields before the proof
shows player value. Near geometry can use the existing detailed presentation;
far route state should collapse to cheap markers or state-derived map/UI cues.

Budget questions:

- How many new renderables are introduced at the passage?
- Does switching rigs duplicate route presentation?
- Does save/reload recreate or leak visual resources?
- Can the route marker disappear when the consequence is resolved?
- Does failure leave one bounded recoverable object rather than a growing
  effect list?

The correct first implementation is the smallest visual proof that makes the
causal chain apparent.

## Anti-pattern gates

Reject or redesign the slice if it introduces any of the following:

- mesh colliders for decorative passage geometry;
- a new shader family before a comprehension failure is demonstrated;
- realtime shadow complexity as a substitute for route affordance design;
- a universal episode runner before the second concrete vertical proves the
  named composition stack;
- a rig-name branch instead of capability and affordance resolution;
- camera or animation code that mutates authoritative passage state;
- persistent effects that have no disposal or downgrade path;
- a second-rig benefit that exists only in the HUD and not in traversal.

## Required proof contract

Before implementation is admitted, the owner must approve sequencing and the
runtime work must define or extend the canonical contract for:

1. blocked passage identity and bounded state;
2. two capability-authored lanes and their affordances;
3. one world-memory consequence and author identity;
4. second-rig inheritance behavior;
5. save/reload migration and failure/recovery state;
6. state-derived guidance and command/event/run-record evidence.

Acceptance must demonstrate:

- a human can explain what changed and why;
- both lanes are materially different;
- the second rig benefits from the first rig's work;
- the consequence survives save/reload;
- failure leaves a visible recoverable state;
- the renderer, camera, and effects remain presentation observers;
- no new broad framework is required for the proof.

## Decision

**Do not implement Unbound Passage 01 in this tranche yet.** The correct next
step is to close the first-rung local-touch/comprehension evidence and obtain
operator sign-off on the arbitration sequence. Once admitted, build the
smallest passage proof using existing capability, affordance, world-memory,
state-derived guidance, persistence, and run-record seams.

This preserves the long-term platform direction while avoiding architecture
theatre. The 3D skill is being used as a constraint on the proof's rendering,
physics, camera, lighting, and budget decisions, not as a reason to add visual
systems before the causal gameplay loop is proven.

## Open evidence

- Tier 1: skill and repository synthesis recorded here.
- Tier 1: sequencing proposal and kill tests recorded in the arbitration doc.
- Tier 4 target: browser acceptance of two lanes, inherited benefit,
  save/reload, and failure/recovery.
- Operator decision required: approve or reject Unbound Passage as the next
  post-first-rung vertical slice.

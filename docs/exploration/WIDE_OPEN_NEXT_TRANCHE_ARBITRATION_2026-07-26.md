# Wide-Open Next-Tranche Arbitration

- Date: 2026-07-26
- Status: **proposed sequencing; operator sign-off required**
- Evidence tier: Tier 1 repository synthesis plus current Field 02 runtime
  evidence
- Method: `wide-open-brainstorm`, internal subagents only; no external models
- Owner / next reviewer: project owner
- Related tracker item: RU-0909

## Source and authority

The operator asked that apparent contradictions be reopened from first
principles with the `wide-open-brainstorm` method and internal subagents rather
than attributed back to the operator. Three existing subagents covered the
Champion, Strategist, Future Self, Methodologist, Cartographer, Archivist, Data
Steward, Skeptic, Trickster, Executioner, and Outsider roles.

This document records their reasoning and disagreement. It is not operator
acceptance of a roadmap change.

## 1. North star

Rigs Unbound should make the player's fleet feel like a persistent causal
system:

```text
one rig changes a place
→ another rig inherits a new possibility
→ the world remembers both
```

“Open” therefore means meaningful future choices, not merely a large content
count or a collection of separate activities.

## 2. What current approaches can miss

- Several rigs completing unrelated activities proves breadth, but not a
  connected vehicle universe.
- Several rigs completing the same objective proves shared contracts, but can
  still hide interchangeable handling and shallow persistence.
- A broad episode engine designed before a second real vertical risks encoding
  an elegant abstraction without evidence.
- A physics-engine choice cannot substitute for a player-visible capability,
  consequence, and recovery loop.
- Farmfall proves ecology and pressure well, but if it comes before a
  cross-rig consequence it can still reinforce tractor-centered assumptions.

## 3. Big ideas generated

### Unbound Passage 01 — Three Ways Through

One visible broken passage blocks a destination. Torque can reshape or
stabilise a heavy lane; Spark can exploit a light, narrow, or airborne lane;
Drift can cross or service a flooded lane. Completing one lane creates a
bounded route or world-memory consequence that another physically selected rig
can use after save/reload.

### Signal Break 01

A thin relay failure adds rising pressure, intermittent guidance, fragile
cargo, and one recovery branch. It reuses the same rig, terrain, action,
world-memory, and run-record seams while testing whether pressure remains
readable.

### Pocket Mechanic

A toy-scale rig enters a damaged full-size machine, repairs or reroutes one
subsystem, and changes what the full-size rig can do outside. This is the
highest-leapfrog scale proof, but it needs interior-scale, transition, and
camera evidence that the current runtime does not yet have.

### Persistent recovery ecology

Failure leaves a stranded rig, damaged route, shifted cargo, or unfinished
repair. The next activity begins from that consequence instead of resetting it
away.

## 4. Alternative views and metaphors

- **Fleet as party:** rigs are characters whose capabilities combine across
  time, not skins selected for separate modes.
- **World as circuit board:** each rig closes a different connection; opened
  paths route later possibilities.
- **Road work as authorship:** traversal is not only consuming a route; some
  rigs author routes for others.
- **Failure as compost:** failure feeds later recovery and story rather than
  becoming disposable loss.

## 5. Detection and status

The next tranche should expose these state-derived facts through the existing
operator surface:

- active rig and capabilities;
- passage or route state;
- action offered and why;
- which rig authored the current world change;
- which rigs can benefit from it;
- save version and persistence result;
- failure/recovery state;
- command/event/run-record evidence.

No second quest ledger is needed for the first proof; the later composition
layer is named explicitly in
[Episode Runner Specification](../research/EPISODE_RUNNER_SPEC_2026-07-27.md)
and [ADR-0032](../decisions/ADR-0032-episode-runner-composes-bounded-episodes-above-the-contract-ledger.md),
so the early vertical can stay bounded without pretending the runner is a
generic state machine.

## 6. Actions and workflows

The smallest coherent workflow is:

1. Notice one blocked destination and two readable solution lanes.
2. Choose and physically drive a capable rig to a lane.
3. Perform a canonical contextual action.
4. Persist one bounded passage/world-memory change.
5. Physically return to or reach another parked rig.
6. Switch through the existing proximity contract.
7. Use the inherited route benefit with that second rig.
8. Save, reload, and confirm the consequence remains.
9. On failure, leave a visible, recoverable consequence.

The shared seam is the existing affordance resolver → action event →
`GameWorld` state/delta → state-derived guidance/run record. A new generic
episode engine is explicitly outside this first proof.

## 7. Automation and AI boundary

Runtime authority remains deterministic. AI may help generate candidate
episodes or authoring variations offline, but a candidate must pass the
coherence and admission checks in the compositional episode grammar before it
can become content. No model may directly grant rewards, mutate durable world
state, or decide success.

## 8. Whimsy and identity

- The tractor's repaired crossing retains tyre grooves and improvised braces.
- The buggy later uses those grooves as a launch line.
- The skimmer leaves a waterline or floating marker that becomes navigation
  evidence after the flood recedes.
- A rig's passport remembers “opened the passage” or “first crossed the repair”
  as an incident, not a generic achievement.

## 9. Named top ideas

1. **Unbound Passage 01: Three Ways Through**
2. **Signal Break 01: The Relay Goes Quiet**
3. **Pocket Mechanic: Machine Inside Machine**
4. **Failure Becomes the Next Contract**

## 10. Time horizons

### Now

- Close first-rung touch and comprehension evidence.
- Preserve Farmfall, physics, progression, and release work in the tracker.
- Prototype one cross-rig persistent passage with current deterministic
  systems.

### Next

- Run Signal Break as a pressure/readability falsification test.
- Let Farmfall exercise ecology, mastery, day/night, and dawn consequence.
- Compare what genuinely repeats before promoting an episode abstraction.

### Later

- Pocket Mechanic and other scale transitions.
- Cross-world mysteries, vehicle passports, recovery ecology, and shareable
  story artifacts.

## 11. Leapfrog idea

Pocket Mechanic could demonstrate the platform thesis more dramatically than
another same-scale vehicle. It is deferred until the current game proves
cross-rig world consequence, because otherwise interiors and scale transitions
would change too many variables at once.

## 12. Build-first versus dream

### Build-first

Unbound Passage 01 should introduce only:

- one visible blocked passage;
- two capability-authored solution lanes;
- one bounded persisted route/world-memory consequence;
- one second-rig inheritance check;
- one failure/recovery outcome.

### Dream

A fleet gradually authors a connected universe: tractors reshape land, toy rigs
repair interiors, skimmers reveal flooded routes, aircraft relay discoveries,
and orbital machines inherit consequences created on the ground.

## 13. Convergence

All panels agreed on the invariant:

```text
distinct rig capability
→ different solution
→ persistent world consequence
→ another rig inherits or changes the result
```

They also agreed:

- do not select or replace a product physics solver here;
- do not replace or delete Farmfall;
- do not create a universal episode runner before the first bounded vertical
  has proved the named composition stack;
- use capability and world-state queries, never rig-name branches;
- require save/reload, failure/recovery, and human comprehension evidence.

The remaining sequencing proposal is:

1. close the first-rung gates;
2. build Unbound Passage 01;
3. use Signal Break as the second pressure/falsification test;
4. continue Farmfall and compare the three concrete seams before
   generalisation.

## 14. Champion case

Unbound Passage is the strongest next architectural evidence because it proves
that a rig can create durable value for a different rig. It is more demanding
than “two rigs can complete one mission,” yet it can reuse current terrain
grading, jumping/hovering, world memory, spatial rig switching, action
resolution, persistence, and guidance.

## 15. Executioner kill test

Stop or redesign the experiment if any of these occur:

- the lanes differ only by speed or vehicle name;
- completion requires the named composition stack to prove a first bounded
  vertical before any universal episode runner is justified;
- the second rig never materially benefits;
- the consequence disappears on reload;
- failure is only a restart;
- central activity/world code branches on `rigId`;
- the player cannot state what changed and why;
- the proposed passage requires more new systems than the thin Signal Break
  alternative.

## 16. Build conditions

Implementation begins only after:

- first-rung local touch evidence is closed;
- the exact passage state and migration consequence have an ADR or an accepted
  extension to an existing one;
- the operator signs off on sequencing if it changes the active Farmfall order;
- acceptance covers two lanes, one inherited benefit, save/reload,
  failure/recovery, and external comprehension.

## 17. Six-hat review

| Hat                  | Result                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| White — facts        | Field 02 already has three rigs, terrain policies, jumping/hover, world memory, contextual actions, spatial switching, save migration, and browser evidence. |
| Red — feeling        | The fleet becomes emotionally coherent when one machine's work matters to another.                                                                           |
| Black — risk         | A passage could become a bespoke scripted mission or prematurely create a universal episode layer.                                                           |
| Yellow — value       | It proves portability, persistence, capability ownership, and vehicle identity in one compact player-visible loop.                                           |
| Green — alternatives | Signal Break, Pocket Mechanic, recovery ecology, or a Farmfall cross-rig harvest route can test adjacent seams.                                              |
| Blue — process       | Close current gates, record the decision, implement one bounded state change, verify locally, then compare with a second concrete vertical.                  |

## 18. Reusable prompt

> Design one compact Rigs Unbound episode in which at least two contrasting
> rigs solve a shared place differently, one rig's action creates a persistent
> consequence another rig can use, failure produces a recoverable next state,
> and every interaction consumes canonical capabilities and world facts rather
> than rig names. Identify the smallest new state, migration, acceptance
> evidence, and kill criteria. Do not propose a universal engine until two
> concrete episodes expose the same seam.

## Anything else?

Yes. Cross-rig inheritance is a stronger portability test than merely allowing
several rigs to complete the same activity. That distinction should be carried
into Farmfall, rescue, construction, and future world design even if the
operator chooses a different immediate sequence.

## Addendum (2026-07-27): the first-principles exploration note is the broader horizon for this arbitration

- The new [Long-Term Game Design from First Principles](LONG_TERM_GAME_DESIGN_FROM_FIRST_PRINCIPLES_2026-07-27.md)
  note gives this arbitration its broader strategic horizon.
- This arbitration still owns the near-term portability test: cross-rig
  inheritance, next-tranche sequencing, and the smallest proof that one rig's
  consequence can matter to another rig.
- Future sequence decisions should treat the new first-principles note as the
  higher-level synthesis, while this document remains the next-tranche gate.

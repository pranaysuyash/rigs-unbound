# ADR-0040: Open vehicle-universe vision and design-spine hierarchy

- Status: **Accepted by explicit operator sign-off (2026-07-29)** — with the
  operator's condition: no existing work is deleted; prior artifacts are
  updated/reclassified in place as needed.
- Date: 2026-07-29
- Owner: project owner (Pranay)
- Source: operator review feedback (2026-07-29) that the recorded vision is
  narrower than the pitched vision; measured repo state (reachability audit,
  commit-type histogram); [Game Design Spine](../design/GAME_DESIGN_SPINE.md)
- Related: [ADR-0029](ADR-0029-product-vision-machine-keeper-odyssey.md)
  (reclassified by this ADR), ADR-0005 (identity), ADR-0006 (capability
  portability), ADR-0018 (progression spine), ADR-0036 (XP quarantine)

## Context

The operator pitched an open-world vehicle universe: vehicles of every kind as
playable characters, many worlds and scales, plural stories, racing to farming
to combat to space, multiplayer, customization, markets, and creator content
as part of the possibility space. The repository progressively converted that
into a single machine-keeper stewardship narrative (ADR-0029, Living Atlas
Odyssey) and treated everything broader as out of scope. Meanwhile execution
produced contracts and plumbing faster than playable content: at review time,
25 unreachable modules and a 41:4 docs-to-features commit ratio over the last
60 commits.

Two failures, one root cause: no authoritative hierarchy separating *the
universe's ontology* (broad, stable) from *one campaign's identity* (narrow,
chosen) from *one slice's scope* (narrower still, shipped).

## Decision

1. **Canonical vision** is the open vehicle-universe stated in
   [Game Design Spine §1](../design/GAME_DESIGN_SPINE.md): vehicles as
   playable characters, persistent player/fleet ownership via the persistence
   ladder, many worlds/scales/stories/economies/social structures.
2. **ADR-0029 is reclassified**, not rejected: the machine-keeper odyssey
   becomes the **tone and identity of Campaign One** (a campaign candidate),
   no longer the umbrella product vision. Its core commitments (machine
   embodiment, place as memory, capability-first verbs, consequence over
   punishment) are retained as Campaign One design law and as *defaults* —
   not constraints — for other campaigns.
3. **The Game Design Spine is the authoritative design surface.** The
   Exploration Map remains the research/status map that feeds it. Exploration
   docs are inputs; the spine records decisions.
4. **Execution serves the spine.** Every Master Execution Tracker package must
   name the spine layer it serves (vision / campaign / slice / platform).
   Technical work that cannot name its layer is deferred by default.
5. **Story, quests, exploration, economy/marketplace, multiplayer, and
   creator systems are first-class design areas** with the architectures
   recorded in the spine (§4–§9). Deferral remains an *execution* stance,
   never a statement that these systems are peripheral to the vision.
6. **The next playable is the integrated opening**
   ([The Road That Was](../design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md)),
   which must consume the orphaned runtime per its module-disposition table.

## Options considered

1. **Adopt this hierarchy** — proposed.
2. **Keep ADR-0029 as umbrella and widen it by amendment** — rejected: the
   narrowing is structural (one theme as constitution), not a wording issue.
3. **Reject ADR-0029 outright** — rejected: its commitments are excellent
   campaign design and the first playable depends on them.
4. **Write per-area vision docs (story, world, multiplayer…)** — rejected:
   reproduces the doc-sprawl pathology this ADR exists to stop.

## Consequences

- Living Atlas Odyssey, Sleeping Atlas, and Stranger at the Silo become
  entries in the spine's campaign-candidate registry.
- The reachability budget becomes design debt with a downward-only rule; the
  first playable's gate is ≤ 13.
- The studio operating model (spine §11) governs commit mix and the
  requirement that new exploration docs name a consumer.
- No existing technical contract is invalidated; each must simply name what
  it serves.

## Rollback

Product-intent ADR; no schema migration. Rejection restores ADR-0029 as
umbrella and demotes the spine to an exploration artifact.

## Revisit triggers

- First-playable evidence contradicting the integrated-opening bet.
- A second campaign entering production (tests whether the ontology actually
  supports plurality).

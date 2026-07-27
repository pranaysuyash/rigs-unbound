# ADR-0025: Separate rig emission sources from listener policy

- Date: 2026-07-26
- Status: **Accepted** (operator sign-off 2026-07-27; originally proposed 2026-07-26 with implemented source-only evidence fixture)
- Decision owner / next reviewer: project owner
- Implementation evidence: `src/game/signature.ts`,
  `src/game/signature.test.ts`
- Related: ADR-0011, ADR-0012, ADR-0023, RU-0202, RU-0204

## Context

Farmfall proposes rigs that emit acoustic, illumination, and heat-style
signatures while threats respond differently to those channels. A first
implementation attempt combined the channels into one attraction score, owned
distance falloff in the emitter, read cached telemetry as gameplay authority,
coupled generic emission to Cargo Relay, exposed it through the public snapshot,
and had no real listener.

That would make the first threat design the permanent meaning of every future
sensor, animal, faction, detector, and stealth activity.

## Proposed decision

Keep three distinct layers:

1. **Authoritative operating inputs** — motion, condition, strain, engaged
   tools, carried load, and explicit light/beacon operating state.
2. **Rig emission source** — named normalized channels and source position.
3. **Listener policy** — channel sensitivity, weighting, falloff, occlusion,
   thresholds, target choice, and response.

The emitter must not:

- import an activity such as Cargo Relay;
- read presentation-only or cached diagnostic telemetry as authority;
- combine channels into a universal threat score;
- own distance falloff or terrain occlusion;
- infer player-owned lamps from Three.js objects;
- emit inactive rigs until ignition/operating state is explicit.

## Current bounded evidence

`src/game/signature.ts` is intentionally source-only:

- separate acoustic, illumination, and thermal-proxy channels;
- no combined score;
- no falloff or listener;
- explicit generic load and illumination context;
- no save/public-state/replay change;
- no rig-name or wheel-count branch;
- four focused tests for determinism, bounds, causes, mobility families, and
  disabled behavior.

This is an evidence fixture, not RU-0202 completion. It has no gameplay
consumer or accessible player feedback.

## Admission gate

Product acceptance requires one real listener in the same vertical:

- listener-specific sensitivities and falloff;
- fixed-step deterministic response;
- explicit active/inactive rig operating semantics;
- semantic and accessible player feedback;
- run-record/replay regression evidence;
- bounded performance;
- no persistent signature cache.

## Alternatives considered

### Universal scalar on each rig

Rejected. It erases sensory differences and freezes the first ecology's weights.

### Store signature values in `GameState`

Rejected for the current proof. They are derived observations; storing them
creates migration and stale-state risks without evidence.

### Read `RigFeedbackFrame` or Three.js lights

Rejected. Presentation cannot become gameplay authority.

### Source-only fixture followed by a real listener

Proposed. It preserves named channels while postponing consumer policy until a
concrete threat or sensor poses the question.

## Revisit triggers

- a first threat/sensor listener is selected;
- player-owned lights, beacons, ignition, or parked-rig operation are defined;
- a non-acoustic/non-light/non-thermal sensor needs a new channel;
- terrain occlusion is proven necessary for a named listener.

## Anything else?

Yes. “Signature system complete” is not an honest claim until the player can
understand and intentionally manipulate what a real listener perceives.

## Update log

- 2026-07-27 — **Proposed → Accepted.** Operator signed off in the realignment
  session: "Accept as proposed." The three-layer boundary (authoritative
  operating inputs / rig emission source / listener policy) is now the
  canonical contract; the first real listener (RU-0204 night-threat ecology)
  may be built against it. The `src/game/signature.ts` fixture remains
  source-only evidence until a listener consumes it.
- 2026-07-27 — Cross-linked the current next-vertical recommendation in
  `docs/reviews/NEXT_VERTICAL_RECOMMENDATION_UNBOUND_PASSAGE_2026-07-27.md`
  so the decision trail and sequencing trail point at the same long-term
  first-principles note.

# ADR-0012: Rig perception is a shared gameplay contract

- Date: 2026-07-25
- Status: operator-requested exploration; implemented and verified local frame
- Owner / next reviewer: project owner
- Affected runtime: `src/game/feedback.ts`, `src/game/renderer.ts`,
  `src/game/audio.ts`, `src/main.ts`
- Related: ADR-0006, ADR-0008, ADR-0009, ADR-0010

## Context

The current runtime already computes terrain grip, wheel slip, suspension
compression, hover-cushion authority, body attitude, strain, engine load,
surface state, damage, and speed. Rendering, audio, camera, particles, and the
HUD consume parts of that state, but each layer can interpret the same event
differently or omit it.

Operator-supplied AI feedback proposed the following product rule. The operator
asked that the attached ideas be explored and implemented, but did not author
this exact sentence:

> Physics, controls, animation, lighting, camera, sound and feedback are
> gameplay systems.

The complete interaction chain is therefore:

`input → intent → simulation → animation → camera → lighting/VFX → sound/haptics → UI → perception`

The architectural problem is not lack of effects. It is the risk that every
presentation layer invents its own meaning for speed, load, slip, turning, or
damage.

## Decision

Add a derived, read-only `RigFeedbackFrame` between authoritative simulation
state and presentation systems.

The frame normalizes:

- speed;
- traction or cushion-authority loss;
- combined drive load;
- signed lateral load;
- visual steering;
- presentation-only body pitch and roll;
- camera anticipation;
- speed-sensitive field-of-view allowance;
- reduced-motion scaling.

Physics remains authoritative. Feedback never writes position, velocity,
condition, capability, cargo, terrain, progression, or save state.

Rig-specific expression lives in bounded presentation profiles. These profiles
change how strongly a tractor, buggy, or skimmer communicates the same semantic
signal; they do not create new controller branches or vehicle-name rules in the
world.

Essential information remains multi-channel:

- traction loss: telemetry text/bar + particles + audio;
- damage: condition + impact sound + optional camera impulse;
- suspension/contact: physical body/wheel motion;
- speed and turning: wheel steering + chassis response + camera anticipation;
- reduced motion: physical truth remains, optional exaggeration and speed-FOV
  changes are clamped.

The browser observability contract exposes read-only perception evidence so
acceptance can prove that authoritative state reaches presentation.

## Options considered

### Keep independent renderer and audio formulas

Fast locally, but meanings drift as more rigs, surfaces, and sensory modes
arrive. Rejected as a second source of gameplay interpretation.

### Put presentation values into persistent rig state

This would contaminate save/replay truth with frame-dependent view state and
force migrations for visual tuning. Rejected.

### Make a general physics engine own vehicle feel

A physics package can provide bodies, contacts, joints, sensors, queries, and
CCD. It cannot define the fantasy, assistance policy, control signature, or
readability of every rig. Rejected as the primary controller boundary.

### Derive a shared frame from authoritative telemetry

Chosen. It creates one semantic bridge while keeping simulation and
presentation ownership explicit.

## Trade-offs and risks

- Normalization can flatten rigs if expression profiles become cosmetic copies.
  Acceptance must compare player-readable behavior, not only numeric coverage.
- Derived signals can lag one fixed step, which is acceptable for presentation
  but never for gameplay decisions.
- `prefers-reduced-motion` is an operating-system/browser preference, not yet a
  persisted in-game setting. An explicit comfort control remains a later
  product decision.
- Haptics remain unimplemented. Gamepad actuator support and failure behavior
  need a bounded adapter and a non-haptic equivalent before integration.
- The current primitive models communicate wheel steering and chassis load, but
  authored assets will need named steering/suspension/tool nodes.

## Validation plan

- Unit tests verify bounded feedback, contrasting ground/hover expression, and
  reduced-motion behavior.
- Typecheck and production build verify the new shared contract.
- Browser acceptance verifies visible steering, lateral body response,
  speed-FOV response, camera focus ownership, reduced-motion clamping, and
  absence of console/page errors.
- Screenshot review checks that the machine remains readable in desktop and
  narrow views.
- External player-language testing remains the gate for claiming that rigs feel
  emotionally distinct.

## Rollback and revisit triggers

The frame is derived and unsaved, so individual expression fields can be
removed without save migration. Revisit the schema when:

- a balance, tracked, articulated, aerodynamic, or six-degree adapter exposes a
  perceptual signal the current contract cannot name;
- sensory modes such as sonar or thermal require a separate perception policy;
- haptics become a supported input/output surface;
- replay needs to record presentation events independently of simulation.

## Anything else?

Yes. Camera comfort, audio access, and visual readability must stay attached to
the same semantic event. A spectacular effect that obscures the rig or becomes
the only warning is a gameplay regression.

## Update log

- 2026-07-25 historical wording, withdrawn as provenance: “Accepted from the
  project owner's interaction-chain direction.” The exact chain was
  operator-supplied AI feedback; the shared derived frame was an agent-selected
  implementation with browser evidence.
- 2026-07-25: Renumbered from the initially drafted ADR-0011 after parallel
  architecture work established the command/capability separation decision at
  that number. Browser screenshot review also strengthened the shared portrait
  chase pullback after Drift remained clipped at `390 × 844`.
- 2026-07-26: Provenance scope corrected. The operator supplied the
  interaction-chain proposal for evaluation and asked that the ideas be acted
  on; that transport does not make the exact wording operator-authored.
  `RigFeedbackFrame` is the implemented, evidence-backed local seam chosen to
  realize it; implementation evidence does not imply operator sign-off on every
  field. Effective status is indexed in [the decision register](README.md).

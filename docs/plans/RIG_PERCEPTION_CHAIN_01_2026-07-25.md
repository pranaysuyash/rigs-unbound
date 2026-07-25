# Rig Perception Chain 01

- Date: 2026-07-25
- Status: implemented and locally accepted
- Decision: [ADR-0012](../decisions/ADR-0012-rig-perception-chain.md)
- Risk class: low-to-medium local gameplay/presentation change

## Objective

Make one authoritative simulation event legible across animation, camera,
audio, VFX, UI, and accessibility without introducing activity-specific or
vehicle-controller branches.

## Delivered slice

1. Add one derived `RigFeedbackFrame` owned by no save or gameplay rule.
2. Feed the same normalized speed, load, traction, and turn signals to renderer
   and audio.
3. Add front-wheel steering pivots to both ground rigs.
4. Layer bounded chassis load expression over physical terrain attitude.
5. Add chase-camera steering/speed anticipation.
6. Honor reduced motion by clamping optional chassis/camera exaggeration and
   removing speed-driven FOV expansion.
7. Expose perception evidence to browser acceptance.
8. Preserve impact, slip, terrain, headlights, particles, HUD, and existing
   camera policies.

## Explicit boundaries

- No new rig, contract, world, dependency, physics engine, asset, save field, or
  activity controller.
- Haptics, component damage, player-facing comfort settings, and articulated
  tools remain named research/implementation lanes.
- External player testing is required before making a fun/feel claim.

## Verification gates

- `npm test`
- `npm run typecheck`
- `npm run format:check`
- `npm run build`
- production preview on port 4173
- `npm run test:browser`
- desktop and `390 × 844` screenshot inspection
- zero browser warnings/page errors

## Pass outcomes

### Pass 1 — immediate correctness

- Added three focused feedback-contract tests.
- `npm test` passed 83 root tests and seven preserved kernel-probe tests.
- Typecheck, formatting, and production build passed.
- Renderer/audio behavior remains derived from simulation telemetry; no save or
  gameplay authority moved into presentation.

### Pass 2 — architecture and long-term viability

- One shared frame replaced duplicated speed/load/slip interpretation between
  audio and renderer.
- Steering and chassis expression extend the existing rig model without
  activity or world branches.
- Reduced motion clamps optional expression and preserves essential physical
  state.
- Per-rig condition history prevents rig switching from producing a false
  impact event.
- Portrait chase was corrected at policy level after screenshot review exposed
  broad-rig clipping.

### Pass 3 — rule compliance and supervision readiness

- Browser acceptance passed the cargo relay, buggy ramp, three rig types, all
  six cameras, perception evidence, reduced motion, hover traversal, save
  reload, and narrow layout with zero console/page problems.
- Desktop and `390 × 844` screenshots were inspected.
- ADR, plan, physics research, exploration map, design note, worklog, progress,
  and acceptance review were updated.
- No dependency, asset import, schema change, deployment, or git write action
  was introduced.

## Anything else?

The next rig should expose a new body-state assumption. More presentation tuning
on similar wheeled rigs would provide less architectural evidence than balance,
articulation, displacement, flight, or six-degree motion.

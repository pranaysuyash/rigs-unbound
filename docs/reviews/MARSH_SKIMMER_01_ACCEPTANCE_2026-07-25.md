# Marsh Skimmer 01 acceptance

- Date: 2026-07-25
- Decision: [ADR-0009](../decisions/ADR-0009-bounded-mobility-adapters.md)
- Evidence boundary: local browser/runtime only
- Confidence: high for the bounded architecture and local workflow; unproven
  for external-player fun, representative devices, production hosting, or final
  art

## Outcome

Drift is a third persistent playable rig and the first non-ground locomotion
family. It uses the same semantic input, world, camera, exploration, tow
activity, save, reload, audio, HUD, and text-observability paths as Torque and
Spark. It does not have wheel/contact state.

The implementation advances the local save to schema v4. Valid v3 Field 02
records preserve both ground rigs and their histories, retain shared world
memory, and add Drift at the authored Sunken Flats berth.

## Exact player-facing change

- `R` now cycles Torque, Spark, and Drift.
- Drift visibly uses a skirt, pontoons, and twin fans.
- The HUD renames Grip to Cushion while Drift is active.
- Drift crosses water deeper than Torque can ford without drowning damage.
- Steep ground reduces lift authority and raises strain, so hover is not a
  universal best answer.
- Drift's identity, motion history, condition, and hover state survive reload.
- Distant rig switches hard-cut the camera instead of smoothing through terrain.
- Portrait chase reduces its side offset so Drift remains readable beside the
  HUD and touch controls.
- A discovered site's tall navigation mast recedes on arrival.

## Architecture and persistence evidence

- `RigState` retains shared character/world state only.
- `GroundMobilityState` owns suspension contacts, ground stability, wheel
  rotation, and jump cooldown.
- `HoverMobilityState` owns lift velocity, clearance, cushion pressure, and
  skirt contact.
- One typed registry owns step, settle, and stability policy for only the
  implemented `ground` and `hover` adapters.
- Profile/state kind mismatches fail closed during save recovery and throw at
  the runtime adapter boundary.
- Public hover state has no `wheels` member.
- v1, v2, and v3 migrations remain covered.

## Three-pass review

### Pass 1 — immediate correctness and completeness

- Preserved the existing Torque/Spark movement model while moving its
  locomotion-only fields behind the ground adapter.
- Added deterministic deep-water, hover-repeatability, steep-ground strain,
  profile/state mismatch, and v3-to-v4 migration coverage.
- Confirmed the shared cargo path remains capability-driven.
- Corrected HUD/audio/renderer consumers that previously assumed wheels.

### Pass 2 — architecture and long-term viability

- Replaced the initial conditional dispatcher with the typed registry promised
  by ADR-0009.
- Kept free flight, orbital motion, balance physics, tracks, and water
  displacement out of the union until a real implementation can define them.
- Preserved the planar shared body contract as an explicit revisit point rather
  than pretending it already serves spacecraft.
- Kept paid Kenney source assets outside the repository; Drift uses
  reproducible primitive proof geometry.

### Pass 3 — rule compliance and supervision readiness

- Documentation, decision, plan, exploration map, design direction, worklog,
  tests, runtime hooks, and browser acceptance were updated in the same pass.
- No dependency, private asset import, public deployment, branch, staging,
  commit, push, cleanup, or history operation was performed.
- Parallel rendering/accessibility research and camera/minimap work were
  preserved.

## Verification

| Check                                      | Result                                                                                                    | Evidence tier |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------- |
| `npm run typecheck`                        | pass, game + deterministic probe                                                                          | Tier 2        |
| `npm test`                                 | 83 root tests + 7 probe tests pass                                                                        | Tier 2        |
| `npm run format:check`                     | pass                                                                                                      | Tier 2        |
| `npm run build`                            | pass; 633.48 kB raw / 167.17 kB gzip JS                                                                   | Tier 3        |
| `git diff --check`                         | pass                                                                                                      | Tier 2        |
| `npm run test:browser` on `127.0.0.1:4173` | cargo, ramp, three rigs, six cameras, motion/reduced-motion, hover water, v4 reload, 390 × 844; no errors | Tier 4 local  |
| Desktop + narrow screenshot inspection     | cross-map transition, mast occlusion, and portrait rig framing found and fixed                            | Tier 4 local  |

The Vite 500 kB chunk advisory remains. It is a performance hardening input, not
a failed build.

The browser runner uses the explicit test-only placement hook to align an
already attached relay 12 m from its gate, then drives that final towing leg
through real fixed-step motion. This avoids treating a flaky autonomous
navigation bot as product evidence while retaining attach, tow, delivery, save,
and reload coverage.

## Verified versus inferred

Verified:

- deterministic hover movement and migration behavior;
- water traversal deeper than Torque's base fording limit;
- no drowning condition loss in that run;
- reduced authority/greater strain on steep ground;
- local schema-v4 save/reload;
- visible primitive model, Cushion HUD, responsive touch layout, and clean
  current-page console.

Inferred, not verified:

- that players will find Drift fun or emotionally distinct;
- that rear fans will never be mistaken for wheels;
- that the current performance holds on representative low-power/mobile
  hardware;
- that public hosting, cache behavior, and long-session memory are acceptable;
- that prop-aware camera occlusion is solved.

## Value delivered

- User value: a genuinely new route-reading fantasy rather than another speed
  profile.
- Team/product value: evidence that the vehicle universe can expand by bounded
  locomotion families without fragmenting into minigames.
- Internal/operational value: truthful persisted state, deterministic adapter
  tests, visible browser hooks, and a migration path another agent can inspect.

## Remaining hardening path

1. Run external comprehension/play sessions and ask players to describe each rig
   without showing profile text.
2. Test a production build on representative desktop, integrated-GPU, and touch
   devices against the render/performance contract.
3. Add canonical prop collision/occlusion volumes, then make the camera react to
   those volumes rather than rig names.
4. Replace proof geometry with an authored or provenance-safe asset whose
   ducts, skirt, wake, and repair history remain readable at gameplay scale.
5. Split or lazily load the Three.js runtime only after measurements identify a
   first-load budget and public-host target.

## Anything else?

The important result is not that the repository contains three rigs. It is that
universal state no longer lies about every playable character having wheels.
Deleting Drift would still leave a more accurate architecture.

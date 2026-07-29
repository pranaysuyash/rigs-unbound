# Dynamic World Collision Acceptance

- Date: 2026-07-28
- Scope: shipped Field 02 solver-independent collision authority
- Decision: [ADR-0037](../decisions/ADR-0037-solver-independent-dynamic-world-collision-authority.md)
- Exploration:
  [Dynamic World Collision Exploration](../research/DYNAMIC_WORLD_COLLISION_EXPLORATION_2026-07-28.md)
- Risk class: medium gameplay/runtime behavior
- Evidence ceiling: Tier 4 local browser observation; no production,
  multiplayer, articulation, rollover, or representative-device claim

## Outcome

The fixed-step world now treats terrain, procedural obstacles, authored
structures, parked rigs, unattached relay cargo, and attached relay cargo as
simulation-owned physical bodies or boundaries. Fast movement uses swept tests,
so crossing a body between two non-overlapping endpoints cannot silently
tunnel. Movable rig/cargo contacts separate by inverse mass, exchange a bounded
normal impulse, and identify the pair through project-owned semantic roles.

The renderer remains presentation. GLB or Three.js mesh presence does not create
gameplay physics; admitted objects require an intentional role and a primitive
proxy.

## Player and operator behavior

- A driven rig stops on the near side of a parked rig instead of crossing its
  mesh.
- The parked rig moves by a bounded mass-weighted contact yield, so impact reads
  as body response rather than a teleport or invisible wall.
- Rig proxies enclose the authored wheel footprint using wheelbase, wheel arc,
  and track, avoiding the earlier width-only case where long noses could enter
  visible meshes before the centre collided.
- Unattached cargo can be pushed; attached cargo sweeps terrain, obstacles,
  structures, and other rigs after hitch placement.
- Reverse-moving attached cargo retains signed velocity, so rearward impacts
  load and displace bodies in the correct direction.
- Obstacle and authored-structure queries use earliest time of impact; dynamic
  multi-body candidates are ordered by contact time rather than fleet ID.
- `publicState().collision` exposes cumulative contacts, policy violations, the
  strongest recent identified pairs, impact speed, normal, response, CCD flag,
  and contact age. Recent identity is retained for 12 fixed steps and bounded to
  16 pairs.
- Unknown physical roles fail closed and increment operator-visible policy
  telemetry. Decorative bodies ignore and trigger/sensor/hazard/projectile
  roles overlap without blocking.

## Focused browser evidence

Command:

```bash
npm run test:collision-browser
```

Observed on `http://127.0.0.1:4173/?acceptance=field-02`:

| Measure | Before | After |
| --- | ---: | ---: |
| Torque speed | 9.000 m/s | 2.012 m/s |
| Torque X | 2.000 m | 2.364 m |
| Spark X | 7.000 m | 7.303 m |
| Centre separation | — | 4.939 m |
| Strongest contact | — | 8.972 m/s, swept |
| Policy violations | 0 | 0 |
| Browser console/page errors | 0 | 0 |

Artifacts:

- [Machine-readable browser evidence](assets/dynamic-world-collision-acceptance-2026-07-28.json)
- [Browser screenshot](assets/dynamic-world-collision-acceptance-2026-07-28.png)

The JSON read model is the quantitative authority. The screenshot is supporting
visual context, not a substitute for contact telemetry.

The focused command exited zero and left no Playwright Chrome process behind.
The shared acceptance helper still emitted its bounded
`Chrome teardown exceeded 5 seconds` advisory after the artifacts were written;
that is harness shutdown latency, not a browser-console or gameplay failure.

## Automated verification

Passed:

```text
npm run typecheck
  root TypeScript: PASS
  deterministic-kernel-probe TypeScript: PASS

npx vitest run src/game/collision.test.ts src/game/world-collision.test.ts \
  src/game/scene-query.test.ts src/game/terrain-traversal.test.ts \
  src/game/state.test.ts
  5 files / 97 tests: PASS

npm run typecheck && npx vitest run
  74 files / 444 tests: PASS

npm run build
  server/client build: PASS
  player asset boundary: PASS

npm run test:collision-browser
  focused canonical browser collision acceptance: PASS
```

The build retains its existing advisory chunk-size warning for the Three.js
bundle. No new build error or player-asset admission failure appeared.

## Broader browser regression status

The comprehensive `npm run test:browser` reached its existing steering
perception assertion and failed because the dirty parallel-owned acceptance
script still expects left steering to decrease heading. Current
`physics.ts` and the passing `steering-direction.test.ts` intentionally define
left steering as increasing heading for the chase-view coordinate contract.
The collision-specific route blocker found earlier in the run was fixed by
moving Spark and Drift to east-side Home berths, leaving the westbound
first-cache departure lane clear.

This broader assertion was not edited here because
`tools/rig-lab-browser-acceptance.cjs` was already parallel-owned and modified
before this collision work. Exact failure:

```text
Left input did not turn and move to the rig's left
leftHeadingDelta: 0.9763
leftwardDisplacement: -3.6539
```

Closure path: the owner of the in-flight steering/acceptance change should align
that assertion and lateral-axis projection with the already-tested chase-view
convention, then rerun `npm run test:browser`. This does not invalidate the
focused collision browser proof, but it prevents claiming the entire Field 02
acceptance matrix is green in this checkout.

## Three-pass review

### Pass 1 — immediate correctness and completeness

- Checked terrain, obstacle, structure, rig, free cargo, and attached cargo
  paths.
- Added endpoint-overlap CCD coverage after finding a far-side ejection defect.
- Added nearest-contact ordering so fleet iteration order cannot select a farther
  blocker.
- Added signed reverse cargo velocity and recent-contact observability.
- Result: focused type/tests/browser pass.

### Pass 2 — architecture and long-term viability

- Kept one canonical `collision.ts` authority and reused terrain/structure
  sources instead of adding a second route or solver.
- Kept physics identity separate from visual meshes.
- Derived conservative rig proxies from existing blueprint dimensions.
- Preserved ADR-0023: no Rapier/Box3D/Jolt product-wide selection was implied.
- Corrected the route-opening proof so hover cushion authority is not mislabeled
  as tyre-grip benefit.

### Pass 3 — rule compliance and supervision readiness

- Rechecked motto v4 evidence tiers, operator visibility, docs, decision index,
  exploration map, tracker, reusable tool, and artifact classification.
- Preserved pre-existing parallel runtime and acceptance work; no commit, push,
  branch, cleanup, or destructive Git action was performed.
- Recorded the broader browser failure and exact closure path rather than
  converting focused evidence into a whole-product claim.

## Remaining limits and hardening paths

| Limit | Current risk | Closure path |
| --- | --- | --- |
| Rig proxies are conservative circles | Side/corner clearance can feel broader than an oriented chassis | Admit capsule/compound proxies from the same blueprint when a measured playtest or articulated rig falsifies the circle |
| Hitch is authored, not a joint | Cargo cannot swing, roll, or jackknife | Use ADR-0023 activity comparison to admit a joint-capable solver adapter |
| Scalar longitudinal speed | Lateral impulse is reduced to separation and longitudinal projection | Introduce project-owned planar velocity before solver migration, with replay and save contracts |
| Contact telemetry is runtime-only | Replay cannot explain historical collisions | Add collision events to the deterministic run record when multiplayer/ghost/debug use requires them |
| Broad Field 02 browser assertion is stale | Whole-suite browser closure cannot be claimed | Parallel owner aligns steering assertion, then reruns `npm run test:browser` |

## Acceptance contract

- Exact user behavior changed: visible world bodies block, identify, and respond
  to contact; high-speed paths do not pass through current proxies.
- Business/team value: physics claims now have reproducible evidence and a
  solver-neutral migration seam instead of depending on presentation meshes.
- Internal/operational value: semantic pair policy, fail-closed unknown roles,
  bounded recent contact telemetry, focused browser tooling, and durable
  evidence make failures diagnosable.
- Save migration: none.
- Uncommitted work: yes; all changes remain local.
- Unrelated work: preserved.
- Artifacts created: focused JSON and screenshot under `docs/reviews/assets/`.
- Follow-up decision: oriented compound/solver admission remains an ADR-0023
  gate; no decision is required to use the verified current correction.

## Confidence

Confidence is **0.93** for the current reduced-order Field 02 collision
correction. Tier 2 tests, Tier 3 focused browser integration, and Tier 4 local
visual inspection are complete. Confidence is below 1.00 because the
comprehensive browser harness has the separately recorded steering assertion
failure and representative-device/articulated-body evidence remains open.

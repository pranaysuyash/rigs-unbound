# Open-world traversal foundation

- Date: 2026-07-25
- Status: Implemented foundation; player-feel validation remains open
- Decision: [ADR-0007](../decisions/ADR-0007-terrain-as-simulation-substrate.md)
- Scope: deterministic terrain, traversal physics, collision, exploration,
  minimap, procedural audio, persistence, renderer integration, and evidence

## Objective

Turn Rig Lab 01 from a flat driving surface into a coherent traversal
substrate where terrain shape and material affect what each rig can do. The
same deterministic world model must serve gameplay, rendering, persistence,
testing, exploration, and future progression.

## Gated implementation order

1. Establish one renderer-independent terrain field with seeded height,
   normal, surface, anchors, and bounded deformation.
2. Extend versioned state and storage so terrain and world memory survive
   reloads while older saves recover safely.
3. Add reduced-DOF vehicle traversal driven by contact samples, suspension,
   grade, grip, rolling resistance, and canonical fixed-step input.
4. Make collision and exploration read the same world and terrain contracts.
5. Render terrain, landmarks, minimap, and effects from canonical world data
   instead of renderer-owned placement.
6. Drive procedural audio from the same engine, surface, and slip signals.
7. Prove deterministic invariants and gameplay transitions in automated tests.
8. Verify the integrated build in the browser and record any performance or
   player-feel gap without promoting it to a launch claim.

## Acceptance contract

The foundation is acceptable when:

- identical seed and inputs produce identical terrain and rig state;
- spawn and authored anchors remain reachable and terrain bounds are tested;
- tractor and buggy respond differently to grade, grip, and suspension data;
- collision, discovery, minimap, renderer, and audio share canonical world
  truth rather than introducing sibling placement systems;
- v1 and v2 saves recover into the current schema without silent state loss;
- deterministic browser input, text state, reset, and local persistence remain
  available;
- typecheck, automated tests, production build, and browser acceptance pass;
- boot cost, bundle size, and observed runtime warnings are recorded;
- external player language is not claimed until actual playtest evidence exists.

## Verification

- Tier 2: terrain and state unit tests cover deterministic fields, continuity,
  anchors, materials, deformation, traversal, collisions, exploration, and save
  recovery.
- Tier 3: production build and the deterministic kernel probe validate the
  integrated contracts.
- Tier 4: browser acceptance must cover both rigs, cargo relay, terrain
  traversal, reload persistence, responsive layout, and console errors.
- Tier 5: deferred until representative devices and external players validate
  performance and whether the rigs feel meaningfully different.

## Known hardening paths

- Measure boot, frame-time, and memory on named low- and mid-range devices
  before expanding terrain resolution or adding asset-heavy biomes.
- Introduce code splitting only in response to the recorded public-load budget;
  the current Vite chunk advisory is visible but not a build failure.
- Revisit the reduced traversal model when articulated bodies, stacking,
  destruction, or rollover becomes a real gameplay requirement.
- Add an external player-language gate: success means players describe
  traction, slope, route choice, or suspension—not only speed differences.

## Anything else?

Yes. Terrain is now progression infrastructure, not scenery. Future missions,
upgrades, biomes, procedural generation, and multiplayer replication must
consume this substrate instead of embedding their own height, surface, obstacle,
or landmark truth. Any exception requires an ADR and a migration path back to
one canonical world model.

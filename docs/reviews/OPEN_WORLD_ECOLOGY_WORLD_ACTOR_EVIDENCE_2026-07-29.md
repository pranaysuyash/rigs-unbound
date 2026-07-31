# Open-World Ecology World-Actor Evidence

**Date:** 2026-07-29

## Scope

This evidence covers the first persistent ecology stage: regional groups that
exist in `GameWorld` independently of player position, advance from the shared
world clock, persist through world memory, and can affect canonical field
conditions. It does not claim that ecology is finished, that all creatures are
individual physical entities, or that the screenshot is final art approval.

## Browser acceptance

Run:

```bash
npm run test:ecology-browser
```

The acceptance opens an isolated fresh browser context at the canonical port,
confirms the Long Furrow herd, Sunken Flats flock, and Quarry Run scavengers in
public world state, and places a Marsh Skimmer near the herd through the
acceptance surface. It asserts that this observation creates no mission or side
mission, captures a survey view, and checks browser errors.

Artifacts:

- `docs/reviews/assets/open-world-ecology-browser-acceptance-2026-07-29.png`
- `docs/reviews/assets/open-world-ecology-browser-acceptance-2026-07-29.json`

## Evidence boundary

- **Tier 2:** focused ecology simulation tests cover actor advancement, field
  impact, and world-memory recovery.
- **Tier 3:** browser acceptance covers player-surface actor exposure, approach,
  no-mission behavior, and browser-error absence in an isolated context.
- **Tier 4:** the screenshot is a local visual observation only. It still needs
  ongoing playtest and art-direction review, especially around onboarding
  overlay behavior and long-distance group readability.

## Open work

- Verify ecology behavior over longer active world histories and across reload
  after observed environmental change.
- Decide which groups become individually persistent and physically
  interactive, and which remain regional populations.
- Add player-facing observation language that informs without becoming a task
  list or mandatory response system.

## Observed evidence (2026-07-29)

- `npm run typecheck` passed, including the deterministic kernel probe typecheck.
- Focused ecology and habitat coverage passed: `3` files, `6` tests.
- `npm run test:ecology-browser` passed in a newly-created Chrome context.
  It exposed the three groups, positioned the Marsh Skimmer near the Long
  Furrow herd, preserved `mission: null` and zero side missions, and collected
  zero browser errors.
- The captured survey view was visually inspected. The herd reads as a
  place-bound group beside the Skimmer rather than a camera-centered effect.
- Chrome reported `Chrome teardown exceeded 5 seconds` after successful tool
  completion. This is a harness shutdown advisory, not a gameplay failure.
- The full Vitest suite currently has one unrelated failure in
  `src/game/runtime-assets.test.ts`: its developer-asset expectation still
  lists two assets while the current parallel runtime exposes `field-plough-01`
  as a third. It is preserved untouched and is not evidence against the
  ecology behavior.

## Direct machine-presence evidence (2026-07-29)

The ecology acceptance now drives the Marsh Skimmer through the Long Furrow
herd with ordinary fixed-step input. The observed result was:

- Skimmer movement: `34.62m`.
- Herd relocation: `27.93m`.
- Skimmer condition after encounter: `100%`.
- Mission and side-mission count: `null` and `0`.
- Browser errors: `0`.

The survey capture shows the post-disturbance field state. It is evidence of a
voluntary physical consequence, not final encounter composition. The current
onboarding/camera lesson can still overlap a capture and should be handled by
separate player-surface work rather than concealed in evidence.

## Social legibility addendum

The existing settlement field-note surface now includes named local witnesses
whose remarks are derived from the same persistent actor state. This adds no
contract, acceptance control, objective, visibility gate, or required response.
Targeted simulation coverage verifies that the Long Furrow remark changes after
the herd is disturbed.

## 2026-07-29 verification addendum

Evidence tier 2:

- `npm run typecheck` passed, including the deterministic-kernel probe.
- `npx vitest run src/game/ecology-world.test.ts` passed: 4 tests.
- The targeted note test proves that Long Furrow's local observation changes
  after the persistent herd receives a direct disturbance.

Evidence tier 3:

- `npm run test:ecology-browser` passed against canonical port 4173.
- Ordinary Skimmer movement travelled 35.11m and displaced the herd 27.93m.
- The captured runtime reported no active mission, zero side missions, and no
  browser errors.

The harness emitted `Chrome teardown exceeded 5 seconds` after reporting PASS.
This is a teardown advisory, not a failed acceptance assertion. The broad test
suite was not rerun in this pass; its previously observed unrelated
`runtime-assets.test.ts` fixture-list failure remains preserved and disclosed.

# First-Rung and Unbound Passage Admission Review

- Date: 2026-07-26
- Status: implementation proof added; browser admission remains open
- Evidence tier: Tier 2 for the pure passage reducer once targeted tests pass;
  Tier 4 is still required for player comprehension
- Scope: first-rung closure plus Unbound Passage 01 sequencing
- Related: `docs/exploration/WIDE_OPEN_NEXT_TRANCHE_ARBITRATION_2026-07-26.md`
- Skill: `docs/research/3D_GAME_SKILL_APPLICATION_UNBOUND_PASSAGE_2026-07-26.md`

## Parallel-work boundary

The following surfaces were already modified by parallel agents when this work
started and were intentionally not edited here:

- `src/game/state.ts`
- `src/game/renderer.ts`
- `src/game/first-rung.ts`
- `src/game/gameworld.ts`
- `src/game/world.ts`
- `src/main.ts`
- `tools/rig-lab-browser-acceptance.cjs`
- the new `src/game/signature.ts` proof
- active evidence images and shared worklog/exploration docs

The new pure proof therefore lives in `src/game/unbound-passage.ts` and does
not create a competing renderer, storage writer, or event bus.

## What is now implemented

The passage reducer provides:

- two materially different capability-authored lanes: `plough` and `jump`;
- deterministic resolved-attempt transitions;
- author and lane provenance;
- an inherited-benefit query for another rig;
- recoverable failure with a visible reason;
- `winch`-gated recovery;
- schema-versioned serialization and fail-closed restoration;
- event-shaped outcomes suitable for the existing run-record observer.

The module deliberately does not decide whether a vehicle physically succeeded.
The locomotion/terrain adapter must provide the resolved outcome. The reducer
owns only the authoritative passage transition after that outcome is admitted.

## First-rung status

First-rung work remains an integration gate rather than a claim of closure in
this isolated slice. Existing parallel changes include first-rung tests,
browser acceptance tooling, refreshed evidence, and runtime changes, but those
changes were not re-run or merged into this proof because they are active
parallel work.

The exact closure check is:

1. run the current first-rung browser acceptance on the canonical served port;
2. verify local touch, module fit, save/reload, return-home, and comprehension;
3. preserve screenshots and JSON evidence;
4. update the canonical first-rung review after the active agent surface is
   stable;
5. only then admit Unbound Passage browser wiring.

## Unbound Passage admission contract

The runtime integration must connect the reducer to the existing canonical
seams in this order:

```text
capability/affordance resolver
-> locomotion result
-> unbound-passage reducer
-> GameState/GameWorld owner
-> save payload
-> run-record event observer
-> state-derived guidance and renderer
```

It must not:

- branch on `rigId` to decide lane eligibility;
- write local storage directly from the passage module;
- use a shader, camera, or HUD flag as authoritative state;
- introduce a second generic quest or episode ledger;
- erase failure instead of persisting recovery state;
- call the passage complete without save/reload and another-rig evidence.

## Acceptance checklist

- [x] Pure two-lane capability contract exists.
- [x] Author and inherited-benefit provenance exists.
- [x] Recoverable failure and explicit recovery capability exist.
- [x] Persistence round-trip and malformed-record recovery are specified.
- [x] Parallel active files were preserved.
- [x] Targeted reducer tests pass in the current checkout.
- [ ] First-rung browser acceptance is rerun after active parallel edits settle.
- [ ] Passage is wired to canonical runtime state and save ownership.
- [ ] Second rig physically uses the inherited route.
- [ ] Browser evidence proves save/reload, failure/recovery, and comprehension.
- [ ] Operator accepts the post-first-rung sequencing.

## Decision

Proceed with the pure proof now, but do not claim the player-facing vertical
slice complete until the active first-rung surface is stable and the browser
integration gates above pass. This is the smallest path that moves the project
forward without discarding parallel work or creating a second authority model.

## Validation addendum

- Targeted reducer validation: `npx vitest run src/game/unbound-passage.test.ts`
  passed, 1 file and 6 tests.
- Repository typecheck: blocked by the active parallel edit in
  `src/game/state.ts:1703`, where `createInitialState` is missing the required
  `surveyCadence` field. This failure is outside the new passage module and the
  file is parallel-owned, so it was not changed here.
- Closure owner: the agent currently editing `src/game/state.ts` must restore
  the constructor invariant, then rerun `npm run typecheck` before this slice
  can claim Tier 2+ integration readiness.

## Validation refresh

- Full project typecheck now passes, including
  `experiments/deterministic-kernel-probe`.
- The reducer now has seven passing tests. It preserves the failed lane needed
  for recovery instead of defaulting silently to the heavy lane, imports the
  canonical rig-id list, and rejects invalid event ticks.
- The stale `surveyCadence` blocker above is resolved: cadence is runtime-owned
  by `GameWorld`, clears with derived visibility, and intentionally forces one
  post-load observation refresh.
- The browser acceptance gate remains intentionally open because
  `tools/rig-lab-browser-acceptance.cjs` and its evidence assets are active
  parallel surfaces. Do not treat the green unit/integration suite as browser
  comprehension or mobile proof.

## Addendum (2026-07-26) — version 10 closes the first-rung browser gate

The historical “browser acceptance remains open” statements above are now
superseded for the first rung.

Sites version 10, sourced from
`6b4536f900cc98404767096cd3eb4f45bac53fda`, passed the full production browser
harness on desktop and a `390×844` real-touch context with zero captured console
problems. Both paths recovered the authored five-salvage cache, returned Home,
fitted lug tyres, observed the visible module, reloaded, and restored canonical
`free-explore` completion.

The admitted contract is:

- fitting any meaningful first module completes the mandatory first rung;
- “use the fitted part” is free-exploration guidance, not a shadow quest state;
- a first-cut is optional immediate proof for a plough-capable rig or a beat
  inside Unbound Passage;
- first-cut is not universal onboarding, because the first fitted rig or module
  may not expose the plough capability.

Unbound Passage runtime wiring, inherited-route browser proof, and external
fresh-player comprehension remain open. See
`SITES_VERSION_10_RELEASE_2026-07-26.md` for exact provenance, evidence tiers,
visual findings, and the production acceptance record.

## Addendum (2026-07-27) — passage state is now canonical in save/load and progression

The prior “pure proof only” boundary is now partially superseded by the live
state/store wiring in this checkout:

- `src/game/contracts.ts` now carries `unboundPassage` on `GameState`.
- `src/game/state.ts` seeds `unboundPassage`, restores it through
  `restoreUnboundPassage`, and publishes the read model in `progression`.
- `src/game/storage.test.ts` and `src/game/state.test.ts` now prove the
  save/load round-trip and the public snapshot.

What remains open is the browser/runtime admission:

- connect the actual player interaction to the passage reducer;
- show the inherited-route benefit in the live UI/runtime;
- re-run browser evidence once the active `main.ts`/renderer surface is stable.

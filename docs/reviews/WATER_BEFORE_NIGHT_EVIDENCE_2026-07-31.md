# Water Before Night Evidence Report

- Date: 2026-07-31
- Status: implementation complete, evidence recorded
- Parent: `docs/design/WATER_BEFORE_NIGHT_IMPLEMENTATION_PLAN_2026-07-31.md`
- Related: `docs/reviews/DIALOGUE_SURFACE_EVIDENCE_2026-07-31.md`, `docs/reviews/RESTORATION_LOOP_AND_GHOST_REPLAY_EVIDENCE_2026-07-31.md`

## What was built

Closed the Water Before Night evidence gap for *The Road That Was* first-playable slice. The runtime state transition (`chooseFarmWaterworks`) already existed; this tranche made the decision player-reachable and proved both branches produce distinct, durable world memory.

- **Workshop actionability fix:** the workshop panel now stays open after the restoration beat when `state.restoration.firstStart === true` and `state.farmWaterworks.choice === "unresolved"`, so the player can actually take the decision.
- **Public state exposure:** `publicState` now exposes `progression.farmWaterworks` and the existing settlement/infrastructure arrays, letting the acceptance harness verify choice, pump state, and settlement condition.
- **Unit tests:** `src/game/state.test.ts` now directly tests `chooseFarmWaterworks` guard clauses and both branches.
- **Browser acceptance:** `tools/water-before-night-browser-acceptance.cjs` boots a fresh context per branch, accepts the arrival bargain, restores the tractor, makes the workshop choice, and reads the same terrain telemetry the player sees.
- **Adjacent acceptance updated:** `tools/restoration-loop-ghost-acceptance.cjs` no longer expects the workshop panel to close after first start (it stays open for the pending waterworks decision).

## Files changed

- `src/game/state.ts` — `publicState` now includes `progression.farmWaterworks`.
- `src/game/state.test.ts` — new `describe("farm waterworks choice")` block with guard and branch tests; fixed a nesting accident that had placed migration tests inside the waterworks block.
- `src/main.ts` — workshop panel actionability now includes the unresolved Water Before Night decision.
- `tools/water-before-night-browser-acceptance.cjs` — new browser acceptance probe.
- `tools/restoration-loop-ghost-acceptance.cjs` — updated to expect the workshop panel to remain open after first start.
- `docs/design/WATER_BEFORE_NIGHT_IMPLEMENTATION_PLAN_2026-07-31.md` — corrected Branch B probe coordinate (the literal midpoint is hardpan track; the muddying lands on soft soil inside the same radius).
- `docs/reviews/WATER_BEFORE_NIGHT_EVIDENCE_2026-07-31.md` — this report.

## Verification

### Automated unit tests

```bash
npm run typecheck && npx vitest run
```

- Typecheck: PASS
- Vitest: 538 tests passed across 87 files

### Browser acceptance

```bash
node tools/restoration-loop-ghost-acceptance.cjs
node tools/dialogue-surface-browser-acceptance.cjs
node tools/water-before-night-browser-acceptance.cjs
```

- `restoration-loop-ghost-acceptance`: PASS
- `dialogue-surface-browser-acceptance`: PASS
- `water-before-night-browser-acceptance`: PASS
  - Branch A (repair-pump): Long Furrow `(18, -46)` → surface `tilled`, grip `0.739`; settlement condition `workable`; drain pump `commandedOn=true`.
  - Branch B (redirect-channel): soft ground inside the 24 m radius at `(21, -11)` → surface `mud`, grip `0.486`; settlement condition `waterlogged`; drain pump `commandedOn=false`.

## Notes

- The literal Home→Long Furrow midpoint `(9, -17)` is hardpan track, which the weather/moisture model intentionally leaves unaffected. The redirect's moisture penalty lands on adjacent soft soil, so the acceptance probes `(21, -11)` to prove the branch has a player-visible consequence.
- Each branch runs in a fresh browser context to guarantee isolation; the game's localStorage persistence otherwise leaks state across pages in the same context.
- No parallel-owned `src/game/` modules were modified beyond exposing existing state in `publicState` and the minimal `src/main.ts` overlay actionability change.

## Anything else?

Yes. Two follow-up items are deferred by design:

1. **Night pressure consequences:** the "before night" time pressure is a narrative frame in this tranche; first-night hazard sequences (landslide, debris, thermal camera) remain in their existing unreachable modules.
2. **Audio layer:** the acceptance does not verify audio because the audio direction is deferred; the tranche focuses on state, surface, and player reachability.

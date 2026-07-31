# Dialogue Surface Evidence Report

- Date: 2026-07-31
- Status: implementation complete, evidence recorded
- Parent: `docs/design/DIALOGUE_SURFACE_IMPLEMENTATION_PLAN_2026-07-31.md`

## What was built

A hybrid dialogue/narration surface for *The Road That Was* first-playable slice:

- **New durable state:** `GameState.arrivalBargain` tracks whether the old man's shelter-for-repair offer is `unseen`, `accepted`, or `refused`. Save schema bumped to v27 with v26 migration.
- **Shared dialogue panel:** a non-modal, bottom-mounted panel in `index.html`/`src/styles.css` with speaker label, body text, choice buttons, and an optional text input.
- **Arrival & bargain beat:** triggered when the player is in the world and the offer is `unseen`. Choices are "Take the deal" / "Not now". Refused offers reappear when the workshop opens.
- **Naming beat migrated:** the old centered modal was removed; the naming moment now uses the shared panel after the restored tractor creates its first furrow.
- **Shell narration preserved:** action/world beats continue to use the existing toast/announcement layer.

## Files changed

- `src/game/contracts.ts` — v27 schema, `ArrivalBargainState`, `arrivalBargain` on `GameState`.
- `src/game/state.ts` — initial state, migration, `acceptArrivalBargain`/`refuseArrivalBargain`, `publicState` now exposes `restoration`, `arrivalBargain`, `openingNaming`, and rig `fieldName`.
- `index.html` — `#dialogue-panel` markup.
- `src/styles.css` — dialogue panel styles.
- `src/main.ts` — panel wiring, arrival/bargain and naming flows, removal of old centered naming modal.
- `src/game/state.test.ts` — unit tests for arrival bargain transitions and migration.
- `tools/dialogue-surface-browser-acceptance.cjs` — new browser acceptance probe.
- `docs/design/DIALOGUE_SURFACE_IMPLEMENTATION_PLAN_2026-07-31.md` — implementation plan.
- `docs/reviews/DIALOGUE_SURFACE_EVIDENCE_2026-07-31.md` — this report.

## Verification

### Automated unit tests

```bash
npm run typecheck && npx vitest run --pool=forks --poolOptions.forks.singleFork
```

- Typecheck: PASS
- Vitest: 533 tests passed across 87 files

### Browser acceptance

```bash
node tools/restoration-loop-ghost-acceptance.cjs
node tools/dialogue-surface-browser-acceptance.cjs
```

- `restoration-loop-ghost-acceptance`: PASS
- `dialogue-surface-browser-acceptance`: PASS
  - Arrival/bargain panel appears with old man text.
  - Accepting sets `arrivalBargain.status` to `accepted`.
  - Restoration loop completes through diagnose → rebuild → first start.
  - Naming panel appears after first furrow.
  - Submitting "Rustbucket" updates `fieldName`, HUD label, and persists across reload.

## Notes

- The acceptance harness starts from a localStorage save that predates this feature; the migration correctly defaults `arrivalBargain` and the panel is triggered through `updateInterface` when `worldEntered` is already true.
- The old centered naming modal (`openingNamingMoment`) was removed entirely; no duplicate naming surface remains.
- No parallel-owned `src/game/` modules were modified.

## Anything else?

Yes. Future conversational beats (radio traffic, faction introductions) should reuse this panel rather than add a second dialogue system. If a beat needs more than three choices or persistent branching, that is the signal to promote the panel into a real dialogue graph.

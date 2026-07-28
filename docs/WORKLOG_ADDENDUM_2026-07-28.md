# Worklog Addendum — 2026-07-28

## Mission proposition and progression runtime foundation

### Scope

Implemented the first gameplay-system foundation under the open-system constraint from `motto_v4`:

- account XP, level, and rung derivation;
- per-rig restoration XP as a separate parallel track;
- derived mission propositions instead of persisted mission tables;
- pluggable mission generator registry;
- mission reward resolution;
- canonical activity reward routing for cargo relay and survey route;
- nested `GameState.progression` save state;
- explicit v8 → v9 migration behavior;
- public runtime observability for progression.

### Decisions

- Created ADR-0033: `docs/decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md`.
- ADR-0033 remains Proposed because ADR-0018 currently records a different accepted progression spine. This implementation is runtime evidence, not silent product-level supersession.
- Progression is nested under `GameState.progression` so future tracks can expand without adding unrelated top-level fields.
- Missions are derived from state/world inputs and generator registration. They are not persisted as a rigid quest ledger.
- Existing activity definitions remain the reward authority. XP and restoration values were added there so cargo and survey do not create a parallel reward table.

### Files changed

- `src/game/progression.ts`
- `src/game/mission-propositions.ts`
- `src/game/mission-resolver.ts`
- `src/game/activities.ts`
- `src/game/contracts.ts`
- `src/game/state.ts`
- `src/game/storage.ts`
- `src/main.ts` (fixed stale runtime-profile enum comparison exposed by typecheck)
- tests for progression, missions, rewards, activities, and public state
- `docs/architecture/GAMEPLAY_SYSTEMS_ARCHITECTURE.md`
- `docs/systems/MISSION_SYSTEM_DESIGN.md`
- `docs/systems/PROGRESSION_SYSTEM.md`
- `docs/decisions/ADR-0033-mission-proposition-derivation-and-nested-progression-state.md`
- `docs/decisions/README.md`
- `docs/plans/MASTER_EXECUTION_TRACKER.md`

### Verification

- `npm run typecheck` passed.
- `npm run test` passed: 64 Vitest files, 368 tests, plus 7 deterministic-kernel probe tests.
- `npm run build` passed, including asset boundary verification.
- Targeted Prettier check passed for all touched TypeScript files.
- Repository-wide `npm run format:check` remains red across pre-existing unrelated files; no broad reformat was applied.

### Remaining gate

Priority 1 is not product-complete yet. The runtime foundation is implemented and verified, but the mission-board/acceptance surface and the ADR-0018 versus ADR-0033 progression decision remain open. The next implementation unit should close that gate before moving to workshop/equipment progression.

### Operator correction

The operator rejected a conservative/default-safe path. The implementation must continue toward the strongest long-term, first-principles architecture aligned with `motto_v4`, rather than remaining a bounded evidence fixture when the correct product path can be completed.

### Anything else?

Yes. The implementation must not be marketed or treated as a settled universal-XP product direction until the operator explicitly reconciles ADR-0018 and ADR-0033.

## Mission acceptance surface recheck

- Re-read the live `mission-propositions.ts`, `mission-resolver.ts`, and
  `progression.ts` files after the runtime-foundation note landed.
- Confirmed the important distinction now visible in the code:
  - mission propositions are derived every evaluation from world/progression
    state,
  - account XP and per-rig restoration are still separate tracks,
  - the live product still lacks an operator-accepted mission-board /
    acceptance surface.
- That means the current implementation can prove the opportunity split, but
  not the product decision for a universal mission-board authority.
- The next useful work is to keep the acceptance surface named explicitly, so
  future mission work doesn’t silently become a second quest ledger.

## Verification

- Static inspection of `src/game/mission-propositions.ts`,
  `src/game/mission-resolver.ts`, and `src/game/progression.ts`.
- Cross-check against `docs/research/CORE_LOOP_AND_PROGRESSION_CONTRACT_2026-07-25.md`
  and `docs/decisions/README.md` to keep the ADR-0033 boundary explicit.

## Accessibility shell status bands

- Re-checked the live browser shell on the current canonical 390 × 844 mobile
  viewport after the profile/save updates landed.
- Confirmed the public HUD now presents the shell state as two separate status
  bands:
  - profile quality state,
  - save/persistence announcements.
- Confirmed Chrome’s accessibility tree exposes both bands as readable text.
- The current gap is spoken screen-reader narration, not shell structure or AT
  visibility.

## Garage/fleet roster projection layer

- Re-read the `Garage / Fleet Roster Specification` after checking the current
  runtime state and the tracker lane for RU-0606.
- Confirmed the roster is still a projection layer, not a second garage
  authority:
  - no separate garage save model,
  - no roster-owned mutation path,
  - no hidden fleet inventory model.
- Confirmed the live runtime already exposes enough public state for a
  read-only first slice:
  - active rig identity,
  - per-rig summaries,
  - workshop reach / actionable readiness,
  - recovery state,
  - site context,
  - world memory.
- That means the next useful roster proof is the overlay and focus behavior,
  not more state plumbing.

## Contract ledger source-surface recheck

I rechecked the contract-ledger seam against the live runtime surfaces and
confirmed the spec's read-only framing is still correct:

- `publicState(state, world)` already exposes the authoritative player-facing
  fields the board needs.
- `src/game/affordances.ts` already resolves offers with reason-coded
  outcomes.
- The ledger remains a projection layer, not a new mission or progression
  authority.

Next step: keep the contract ledger as a read-only board built from
`publicState`, and keep operator diagnostics separate from player-facing rows.

## Garage/fleet roster shell reuse recheck

I rechecked the garage/fleet roster against the unified shell contract and
kept the next proof narrow and durable:

- the roster is still a read-only overlay, not a separate garage authority,
- it should reuse the unified overlay manager and focus behavior,
- the active rig remains the primary context,
- the missing proof is the overlay behavior itself, not additional storage.

This keeps the roster aligned with the shell rather than drifting into a
second inventory model.

## Input remap registry gap recheck

I rechecked the accessibility/input contract and kept the next gap precise:

- the first-use guidance surface is canonical,
- the opportunity compass now tells the player what matters next,
- the remaining missing contract is the persisted binding registry,
- remap restore-before-sampling is still future work.

That keeps the guidance layer from being mistaken for the actual control-layout
source of truth.

## Labs drawer contract drafted

I drafted a dedicated labs contract so the separate `physics-lab.html` and
`box3d-lab.html` pages have a durable in-world-instrument boundary:

- the labs remain evidence fixtures, not player-facing game modes,
- the drawer should preserve the current runtime context,
- the first slice should be a same-shell, focus-safe instrument surface,
- the labs should not own save state or become a second authority.

The contract now lives in
`docs/research/LABS_AS_IN_WORLD_INSTRUMENTS_CONTRACT_2026-07-28.md`.

## Radial quick-action wheel contract drafted

I drafted a radial wheel contract so the authored `src/game/radial-ui.ts`
surface has a durable long-term shape:

- the wheel is now treated as a bounded rig-local quick-action overlay,
- it must map to the canonical named-action model,
- it must preserve focus and context,
- it should not become a second control authority.

The contract now lives in
`docs/research/RADIAL_QUICK_ACTION_WHEEL_CONTRACT_2026-07-28.md`.

## World graph and place contract drafted

I drafted the missing world-graph contract so the canonical topology of place
has its own durable note:

- authored sites, routes, and discovery anchors now have one named topology
  contract,
- the contract ledger and episode runner can cite that topology explicitly,
- the graph is treated as the source of place, not a second simulation
  authority.

The contract now lives in
`docs/research/WORLD_GRAPH_AND_PLACE_CONTRACT_2026-07-28.md`.

## Streaming residency boundary recheck

I rechecked the streaming/residency contract now that the world graph has a
named topology contract:

- the world graph owns place and route topology,
- the streaming contract owns chunk residency and rollback,
- the runtime is still single-residency until scale pressure requires the
  chunk lifecycle.

That keeps topology and residency separate without making either one vague.

## Motto alignment correction — save migration and persisted capability data

The completion review surfaced a policy failure: compiler-unused imports were
initially treated as deletable before checking supersession, schema history,
canonical ownership, and the long-term data contract. That approach was
reversed and corrected in the same work sequence.

- `RIG_CAPABILITIES` is retained and now validates persisted mastery keys during
  progression recovery; unknown capability data is rejected at the data
  boundary rather than silently becoming runtime state.
- `V8_SAVE_SCHEMA_VERSION` is retained and now participates in the migration
  chain. Both schema v8 and the previous schema v9 migrate through the shared
  predecessor path into the current schema v10 shape.
- The migration diagnostic now reports the actual source schema version.
- A focused regression test covers both predecessor versions and verifies that
  an unknown persisted capability is not admitted.

Verification after the correction:

- `git diff --check` — passed.
- `npm run typecheck` — passed, including the deterministic-kernel-probe
  package typecheck.
- `npx vitest run` — passed: 64 test files, 372 tests.

This correction preserves the parallel runtime design and strengthens its
canonical migration/data-validation boundaries. No runtime method or behavior
was deleted.

Anything else? Yes. The review rule is now explicit for future cleanup:
compiler diagnostics are signals to investigate, not authorization to delete;
every removal must first pass supersession, source-of-truth, migration, and
long-term product checks.

## 2026-07-28 — wide-open brainstorm produced a measured reachability finding

- Ran the external `wide-open-brainstorm` skill in single-agent mode (no
  `ask-*` LLM wrappers installed; repo precedent RU-0909 already established
  internal-only role play), with `game-design`, `game-development`,
  `threejs-game-director`, and `3d-web-experience` as supporting lenses.
- Refused to brainstorm against remembered facts and measured the repository
  first. That measurement produced the session's largest finding.
- Added `tools/audit-runtime-reachability.mjs` and six tests in
  `tools/audit-runtime-reachability.test.mjs`. The audit walks the transitive
  import graph from real entry points, so it catches orphan clusters that a
  naive "has an importer" grep reports as healthy — `expedition-economy.ts` is
  imported, but only by `salvage-crafting.ts`, which is itself unreachable.
- Result on this checkout: 78 non-test source modules, 48 entry-reachable,
  **30 unreachable (2,365 lines), 28 of them with passing tests**.
- Found and corrected a false claim in load-bearing records: ADR-0031 and the
  Master Execution Tracker both state `src/game/animation.ts` is wired into the
  live renderer path. It is imported by nothing. Recorded as a provenance
  repair in the same class as RU-0903, appended rather than rewritten.
- Fixed two real defects in the audit tool while building it: root-absolute
  Vite specifiers (`/src/main.ts`) were resolving against `process.cwd()`
  instead of the audited root, and archived HTML previews under `docs/` were
  conferring reachability on modules nothing ships.
- Brainstorm artifact:
  `docs/exploration/WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md`.
  Its central finding is **the Missing Middle**: the loop has verbs for
  departure and arrival and almost none for coping in between, and the UI has
  the matching hole at the matching altitude.
- Updated the exploration map and the execution tracker in the same pass;
  opened RU-0910 (wire three tactical verbs), RU-0911 (reachability budget
  policy), and RU-0912 (Act I fleet-versus-single-machine sequencing).
- No `src/game/` file was edited. RU-0910 explicitly requires operator
  clearance for the parallel-ownership collision before it can start.

Anything else? Yes. The uncomfortable part of this entry is that the brainstorm
artifact is itself another document in a repository that already has 276 of
them. Its defence is that it shipped a reusable measuring instrument alongside
the prose and that its recommended next action is a wiring commit. If the next
session produces another design note with no reachable verb behind it, this
entry should be read as evidence for the Executioner's case rather than against.

## Wiring experiment is now the next concrete step

The next concrete artifact is the wiring experiment for
`src/game/radial-ui.ts`, `src/game/weather.ts`, and
`src/game/fleet-recovery.ts`:

- see `docs/exploration/WIRING_EXPERIMENT_RADIAL_WEATHER_RECOVERY_2026-07-28.md`;
- it is a falsifiable wiring path, not another contract note;
- it should surface one reachable verb and one visible outcome path.
- current route anchors are `main.ts` recovery feedback, the recovery control
  lesson, weather-weighted recovery propositions, and `fleet-recovery.ts` as
  the consequence primitive.
- the experiment now crosses control guidance -> named action -> proposition
  -> command/result -> progression consequence.
- it now also probes whether the read-only contract board can be the player
  choice surface for that proposition.

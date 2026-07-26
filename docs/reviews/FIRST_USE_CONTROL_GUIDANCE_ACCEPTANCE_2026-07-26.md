# First-use control guidance acceptance

- Date: 2026-07-26
- Runtime: `http://127.0.0.1:4173/?acceptance=field-02`
- Production preview evidence: `http://127.0.0.1:4175/?acceptance=field-02`
- Risk class: low-to-medium interaction and accessibility change
- Status: accepted locally; uncommitted

## User-visible behavior

A fresh player sees one compact `New control` card after entering the field.
The first card explains how to drive relative to the rig's visible front and
shows both keyboard and touch inputs. Later cards appear only when their action
becomes useful: collecting or attaching, fitting a workshop part, shaping soft
ground, changing camera, reading the surveyed map, switching to a nearby rig,
or recovering a disabled rig.

Using the control or selecting `Got it` retires that lesson for the current
browser profile. The card never pauses play and is hidden while the welcome
panel, map, or pause layer owns attention.

## Contract and implementation

- `src/game/control-guidance.ts` owns deterministic lesson priority and content.
- `src/main.ts` supplies semantic world context and records performed/dismissed
  lessons.
- `index.html` and `src/styles.css` own the accessible, responsive DOM
  presentation.
- Learned lesson IDs are UI-only local storage. They do not alter the versioned
  world save or persistent Rig history.
- The current surveyed map remains fog-of-war world knowledge. The lesson
  introduces `M`/`Map` after discovery makes that knowledge useful; it does not
  turn the system into an always-on omniscient minimap.

## Evidence

### Tier 2 — deterministic tests

`src/game/control-guidance.test.ts` proves:

- drive is the fresh-field lesson;
- contextual action outranks optional camera education;
- workshop education appears only at a relevant workshop choice;
- learned lessons do not repeat;
- disabled-rig recovery outranks optional lessons;
- malformed or unknown local preference data fails safely.

The current full result is 21 Vitest files and 167 passing tests plus 7/7
deterministic-kernel tests.

### Tier 3 — browser integration

The production browser acceptance suite verifies that a cleared browser
preference produces `data-lesson-id="drive"`, exposes keyboard and touch
instructions, and retires the lesson only after real forward input. The same
run also passed signed steering, all six camera views, authored collision,
relay delivery, ramp, save/restore, desktop, and narrow-layout checks with no
console problems. The full suite was then repeated against the current
user-facing development server on port `4173` and exited `0`.

### Tier 4 — visual inspection

- `docs/reviews/assets/control-guidance-first-use-desktop.png`
- `docs/reviews/assets/control-guidance-first-use-narrow.png`

The rebuilt production preview keeps the lesson above transient notifications.
On the narrow layout it remains above the direction controls; the discovery
toast may occupy the separate strip between the lesson and touch controls
without covering the lesson content.

## Three-pass review

### Pass 1 — immediate correctness and completeness

Checked fresh entry, relevance priority, performed/dismissed retirement,
malformed storage, desktop layout, and 390×844 touch layout. Corrected the
production-preview evidence after detecting that the first screenshot run was
serving a stale pre-rebuild CSS bundle. Bounded Chrome teardown after a
successful report so the one-shot acceptance command exits truthfully instead
of becoming an accidental monitor.

### Pass 2 — architecture and long-term viability

Kept lesson resolution pure, semantic, and rig-neutral. Persistence is a
versioned UI preference rather than a gameplay migration. No tutorial-specific
activity, vehicle-name conditional, input pipeline, or map implementation was
introduced.

### Pass 3 — rule compliance and supervision readiness

Ran focused and full tests, typecheck/build, physics labs, full browser
acceptance, asset validation, formatter checks, and desktop/narrow visual
inspection. Updated the ADR, input/accessibility contract, asset pipeline
contract, worklog, and acceptance records. No commit, push, branch, cleanup, or
deletion was performed.

## Remaining gaps and hardening path

- Literal keyboard/touch labels do not yet resolve remapped controls or live
  gamepad glyphs. Close this by feeding lessons from the future canonical input
  binding registry.
- Lesson completion is local to one browser profile. Add opt-in profile sync
  only when player accounts exist; do not couple it to world saves.
- Automated evidence proves timing and visibility, not teaching quality. Human
  playtesting should measure comprehension, interruption, and whether later
  lessons arrive at the right moment.
- Field 02 provides a surveyed full-map overlay, not a constant corner
  minimap. Evaluate a minimap only against navigation load, fog-of-war truth,
  camera mode, and accessibility—not as a default genre convention.

## Value delivered

- User value: unfamiliar controls explain themselves when first useful, across
  keyboard and touch, without stopping play.
- Product/team value: new rigs and capabilities can teach semantic actions
  without anchoring the experience to the tractor.
- Internal/operational value: deterministic priority, browser-visible lesson
  IDs, checkpoints, and local preference decoding make the behavior testable
  and recoverable.

## Anything else?

Yes. A first-use lesson should answer “why now?” as well as “which button?”.
That relevance threshold is the part human playtests should tune; adding more
cards without evidence would recreate the front-loaded tutorial this system is
intended to avoid.

## Addendum — 2026-07-26 integrated rerun

The current schema-v7 production build was frozen and served at
`http://127.0.0.1:4191/?acceptance=field-02` to prevent concurrent `dist`
rebuilds from invalidating asset hashes during the long browser matrix.

The rerun found that the first salvage cache's executable `collect-salvage`
action could be hidden by Home workshop headline copy. The large prompt now
matches the canonical contextual action before ambient workshop copy. The
fresh keyboard and real-touch first-rung flows both introduced the contextual
lesson, collected the cache, fitted a part, and restored it after reload.

The narrow-layout assertion was also corrected to inspect the real
coarse-pointer touch context rather than a resized desktop context. The full
result is recorded in
[Integrated admission matrix](INTEGRATED_ADMISSION_MATRIX_2026-07-26.md).

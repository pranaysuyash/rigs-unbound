# Rig Perception Chain 01 acceptance

- Date: 2026-07-25
- Status: locally accepted
- Risk class: low-to-medium gameplay presentation
- Evidence ceiling: Tier 4 local browser observation
- Decision: [ADR-0012](../decisions/ADR-0012-rig-perception-chain.md)

## Exact user-facing behavior changed

- Torque and Spark front wheels now visibly follow steering.
- All three rigs layer bounded propulsion and lateral-load motion over their
  physical terrain attitude.
- Chase framing anticipates speed and steering direction.
- System reduced-motion preference clamps optional body/camera motion and
  removes speed-driven FOV expansion.
- Portrait chase pulls farther back so Drift fits the narrow horizontal field
  instead of being clipped.
- Switching to an already damaged rig no longer produces a false fresh-impact
  shake/sound.

## Value delivered

- **Player value:** vehicle response is communicated through geometry, camera,
  sound, particles, and telemetry rather than only speed numbers.
- **Team/product value:** future rigs receive one perception vocabulary with
  bounded expression profiles instead of separate feel logic.
- **Internal/operational value:** browser acceptance can inspect perception
  evidence and motion-preference handling directly.

## Architecture outcome

`RigFeedbackFrame` is derived from authoritative simulation state and owns no
save, physics, capability, activity, or world truth. Renderer and audio consume
the same normalized speed, load, traction, and turn signals. Rig-specific
strength lives in presentation profiles, while mobility remains owned by the
ground/hover adapters.

Parallel instruction/architecture work added ADR-0011 during this task, so the
perception decision was preserved as ADR-0012 and all new references were
rechecked against current files.

## Files changed

### Runtime and tests

- `src/game/feedback.ts`
- `src/game/feedback.test.ts`
- `src/game/renderer.ts`
- `src/game/audio.ts`
- `src/main.ts`
- `tools/rig-lab-browser-acceptance.cjs`

### Decisions, research, plans, and project truth

- `docs/decisions/ADR-0010-rendering-accessibility-contract.md`
- `docs/decisions/ADR-0012-rig-perception-chain.md`
- `docs/research/BROWSER_VEHICLE_PHYSICS_TECHNIQUE_CATALOG_2026-07-25.md`
- `docs/plans/RIG_PERCEPTION_CHAIN_01_2026-07-25.md`
- `docs/exploration/EXPLORATION_MAP.md`
- `DESIGN.md`
- `README.md`
- `docs/WORKLOG.md`
- `progress.md`
- this acceptance record

### Generated context surfaces refreshed

- `docs/context/agent-start/AGENT_KICKOFF_PROMPT.txt`
- `docs/context/agent-start/SESSION_CONTEXT.md`
- `docs/context/agent-start/STEP1_ENV.sh`
- `.agent/AGENT_KICKOFF_PROMPT.txt`
- `.agent/SESSION_CONTEXT.md`
- `.agent/STEP1_ENV.sh`
- `motto_v4.md` was re-synchronized by `agent-start`; no doctrine edit was made
  in this task.

### Visual QA artifacts refreshed

- `docs/reviews/assets/field-02-front-forward.png`
- `docs/reviews/assets/field-02-top-down.png`
- `docs/reviews/assets/rig-lab-01-desktop.png`
- `docs/reviews/assets/rig-lab-01-narrow.png`

These are intentional visual-QA evidence, not production art.

## Commands and outcomes

- `/Users/pranay/Projects/agent-start`
  - refreshed the canonical context pack.
- `/Users/pranay/Projects/agent-start --skip-index`
  - refreshed canonical and compatibility context surfaces after documentation
    changes; the busy retrieval store was explicitly reported and indexing was
    skipped.
- `npm run typecheck`
  - passed for the root game and deterministic kernel probe.
- `npx vitest run src/game/feedback.test.ts`
  - three focused tests passed.
- `npm test`
  - 83 root tests and seven kernel-probe tests passed.
- `npm run format:check`
  - passed.
- `npm run build`
  - passed; JavaScript 633.47 kB raw / 167.17 kB gzip.
  - retained the existing Vite advisory for a chunk over 500 kB.
- `npm run test:browser`
  - passed cargo, ramp, three rigs, six cameras, perception expression,
    reduced-motion clamping, hover water, save/reload, and narrow layout.
  - zero console warnings/errors and zero page errors.
- browser daemon against `http://127.0.0.1:4173/`
  - observed the live Field 02 surface and queried perception/performance
    evidence.

## Runtime evidence

Automated browser evidence for Torque while turning:

- steering angle: `0.2775` radians;
- expressive body roll: `-0.0345` radians;
- speed FOV boost: `4.224` degrees;
- camera focus offset: `1.7 m`, matching its rig profile.

With reduced motion:

- optional roll reduced to `-0.011`;
- speed FOV boost became `0`;
- camera focus contract remained correct.

Latest measured browser run:

- first controllable: `409.8 ms`;
- average frame time: `9.10 ms`;
- p95 frame time: `10.00 ms`;
- draw calls: `29`;
- triangles: `95,174`;
- heap: `29.3 MB`;
- narrow field-kit/touch-control gap: approximately `54.42 px`.

These measurements describe one local automated Chrome run, not a public-device
budget.

## Multi-pass review

### Pass 1 — immediate correctness and completeness

- Focused tests, full tests, typecheck, formatting, and build passed.
- Existing ground, hover, persistence, terrain, cargo, and camera behavior
  remained green.
- Per-rig condition history fixed false impact feedback after rig switching.

### Pass 2 — architecture and long-term viability

- Shared frame avoids audio/renderer interpretation drift.
- No save field, dependency, activity branch, or new mobility abstraction was
  introduced.
- Screenshot review found and fixed broad-rig portrait clipping through the
  shared camera policy.
- Physics package research recommends a bounded Rapier experiment rather than
  transferring vehicle identity to a general solver.

### Pass 3 — compliance and supervision readiness

- ADR, plan, research, exploration map, design, README, worklog, progress, and
  acceptance evidence agree.
- Visual artifacts were inspected and classified.
- No dependency, asset import, deployment, deletion, cleanup, branch, stage,
  commit, push, or history operation was performed.

## Verified versus inferred

Verified:

- deterministic and focused test behavior;
- compilation and production build;
- browser interactions and save/reload;
- presentation evidence and reduced-motion response;
- current desktop and narrow screenshots;
- live server response on port 4173.

Inferred:

- the feedback should improve player comprehension;
- the chosen motion profiles express the intended emotional character;
- Rapier is the leading future dynamics service.

Those inferences require external player-language testing and a measured Rapier
experiment.

## Known remaining gaps and hardening paths

1. **Player feel remains unproven.**
   - Closure: blinded external comparison asking players to describe Torque,
     Spark, and Drift without seeing names or stats.
2. **Drift’s rear fans resemble wheels in static rear views.**
   - Closure: authored duct/blade/skirt/wake animation and silhouette pass.
3. **Prop-aware camera occlusion is missing.**
   - Closure: canonical prop collision/visibility volumes shared by world and
     camera.
4. **Player-facing comfort controls are missing.**
   - Closure: ADR-0010 quality/comfort profile implementation with persisted
     shake, FOV, flashing, and motion controls.
5. **Haptics are missing.**
   - Closure: optional gamepad-output adapter with capability detection,
     failure-safe behavior, and visual/audio equivalents.
6. **Bundle budget remains open.**
   - Closure: explicit quality profiles, cold-cache measurements, and
     dependency/code-splitting evidence.
7. **General dynamics engine remains research.**
   - Closure: versioned Rapier trailer + motorized excavator-arm experiment with
     snapshot and browser-performance comparison.

## Preservation and local state

- Unrelated and parallel work was preserved.
- The ADR number was adapted after a parallel ADR-0011 appeared.
- No git command was run because the user did not request repository mutation.
- No commit or push was requested or performed; task changes remain local for
  review.
- No file was deleted or moved.

## Follow-up decision needed

No decision is required to use the current live build. The next load-bearing
choice is whether to run external feel testing, build the rescue/repair
capability composition, or approve the bounded Rapier experiment.

## Anything else?

Yes. The live evidence now proves a perception pipeline, not final feel. The
same standard must be applied to lighting, component damage, articulated tools,
and sensory modes before any of them are described as finished gameplay.

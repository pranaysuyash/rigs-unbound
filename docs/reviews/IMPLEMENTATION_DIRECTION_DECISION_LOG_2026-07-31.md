# Implementation Direction Decision Log

- Date: 2026-07-31
- Status: **operator direction recorded; implementation pending explicit go-ahead on scope boundaries**
- Context: follow-up to `docs/reviews/GAME_DESIGN_AUDIT_VISION_CORRECTION_AND_FULL_RECHECK_2026-07-31.md`

## Operator preferences expressed

The operator confirmed the following preferences for the next implementation window:

1. **Close one universe-level gap**, test it, and document it.
2. **Ship the restoration loop** because it was previously discussed with another agent and needs durable documentation.
3. **Explain diegetic vs. non-diegetic** tutorial/onboarding language.
4. **Explain dialogue surface options** — differences and trade-offs.
5. **Integrate** the chosen work; when committing, always follow the documented route of `git add -A` → `git commit` → full hook-gate → `git push`.
6. **Defer audio direction** for now, but explain and explore the deferral rationale.
7. **Document everything**, including this discussion/decision log.

## Chosen universe-level gap

**Shareable run record / ghost replay.**

Rationale:

- `src/game/ghost.ts` and `src/game/replay-validator.ts` already exist; the deterministic kernel and run-record contract already exist.
- It is the smallest universe-level proof that does not require new art assets, new world classes, or new campaign design.
- It directly serves Game Design Spine Pillar 5 (**everything is inspectable**) and the persistence ladder's Social history layer.
- It is testable end-to-end with existing browser-acceptance patterns.
- It supports the long-term async-multiplayer posture without requiring server authority.

## Chosen slice-level focus

**The restoration loop** (Tranche 2 of `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md`).

Rationale:

- The modules are already wired; the remaining work is to make the loop *felt* rather than merely functional.
- It was discussed with another agent and needs a durable design note so future work does not rediscover the same conversation.
- It is the prerequisite for every later slice beat (first work, naming, route reopening, night consequence).
- A readable restoration loop makes the machine feel like a body rather than a UI selection.

## Deferred scope

- **Audio direction doc** — deferred until the core loop is proven; rationale recorded below.
- **Settlement/community/ecology integration** — the uncommitted `src/game/` parallel work is not integrated in this window; it remains parallel until the slice loop is proven and ownership is stable.
- **Water Before Night, north field, night variants, ridge finale** — these remain future tranches; only the restoration loop and ghost-replay proof are in scope for this window.

---

## Glossary: diegetic

**Diegetic** means *inside the fiction* — the player learns through things that exist in the game world.

| Diegetic | Non-diegetic |
| --- | --- |
| The tractor sputters and refuses to move; the player infers it needs repair. | A tooltip says "Engine damaged. Click Diagnose." |
| The old man gestures at the field; the player understands the first job. | A quest marker and exclamation point appear over the old man. |
| Headlights flicker as the battery drains; the player learns about power. | A HUD bar labeled "Battery: 23%" turns red. |
| Furrows in the soil show where the plough has been. | A minimap line traces the exact path to take. |

A fully diegetic first 30 seconds means the player discovers the problem and the verb through world cues, not through on-screen instructions. A non-diegetic opening uses explicit UI text, prompts, or tutorials. A hybrid uses diegetic cues for the core verb and minimal non-diegetic hints for accessibility.

For the restoration loop, the diegetic ideal is:

- The tractor is visibly damaged (smoke, flat tire, missing panel, dead lights).
- The player interacts directly with the broken part (not a generic "Diagnose" button).
- The engine responds with sound, vibration, and exhaust when it starts.
- The first motion is the reward.

The current implementation is largely non-diegetic: the workshop panel exposes `Diagnose`, `Rebuild`, and `Start engine` as text buttons. The goal of this window is to move the loop toward the diegetic ideal without rebuilding the entire UI.

---

## Dialogue surface options

The slice needs a surface for three conversational beats:

1. Arrival & bargain (the old man explains the deal).
2. The naming moment (the player names the machine after first work).
3. Optional: world reactions, radio traffic, faction introductions.

Five surface options exist, with trade-offs:

### Option A — Shell narration only (existing)

**What it is:** Text banners at the top or bottom of the shell, driven by the existing narration/announcement layer.

**Pros:**
- Already exists.
- Accessible (screen-reader friendly).
- Non-blocking; player can keep driving.
- Minimal implementation cost.

**Cons:**
- Poor for branching choices.
- Speaker identity is weak.
- Can feel like system messages, not conversation.

**Best for:** Action framing, status updates, world reactions, one-way exposition.

### Option B — Dedicated dialogue panel

**What it is:** A modal or side panel showing speaker name/portrait, dialogue text, and discrete choices.

**Pros:**
- Strong speaker identity.
- Natural for branching choices (naming, bargain terms).
- Fits the arrival/bargain/naming beats well.

**Cons:**
- New UI surface to build and style.
- Can feel like a visual-novel interlude in a driving game.
- Requires focus management and accessibility care.

**Best for:** Conversational beats with meaningful player input.

### Option C — Hybrid: shell narration + dialogue panel

**What it is:** Shell narration carries action/world beats; the dialogue panel appears only for conversational beats that require a choice or named speaker.

**Pros:**
- Uses existing infrastructure for most beats.
- Dialogue panel reserved for high-value moments.
- Scales from minimal to rich without a second engine.

**Cons:**
- Two surfaces to maintain.
- Need a clear rule for which beat uses which surface.

**Best for:** The Road That Was slice: arrival/bargain and naming get the panel; everything else stays in shell narration.

### Option D — Diegetic world text

**What it is:** Speech bubbles, holographic signs, radio subtitles, or environmental text placed in the 3D world.

**Pros:**
- Highly diegetic.
- Can be beautiful and memorable.

**Cons:**
- Hard to make accessible.
- Camera distance and angle can hide text.
- Requires significant art/presentation work.

**Best for:** Later, once the core loop and visual direction are proven.

### Option E — Conversation wheel

**What it is:** A radial or panel of branching choices with emotional/intent labels (e.g., agree, question, refuse).

**Pros:**
- Expressive player agency.
- Fits morally ambiguous choices.

**Cons:**
- Overkill for the first playable.
- Requires a content pipeline for branches.

**Best for:** Mid-campaign faction/relationship conversations, not the opening.

### Recommendation for this window

Use **Option C — Hybrid** for the slice:

- **Arrival & bargain:** dedicated dialogue panel (speaker = old man; choice = accept/refuse the deal).
- **Naming moment:** dedicated dialogue panel (player enters a name; suggestion = Torque).
- **All other beats:** shell narration (e.g., "The engine turns over," "The relay route is open").

This keeps the implementation bounded while giving the two story beats the weight they need.

---

## Restoration loop design direction

See `docs/design/RESTORATION_LOOP_DESIGN_NOTE_2026-07-31.md` for the full design note. The short version:

- The loop is: **Inspect → Act → Respond → Drive**.
- Move from three text buttons (`Diagnose`, `Rebuild`, `Start engine`) toward direct interaction with the machine.
- Preserve the existing state transitions; change only the presentation and feedback.
- Add immediate sound, vibration, and visual response to each step.
- Ensure the player is in motion within 60 seconds of launch.
- Keep the workshop overlay as the fallback/non-diegetic path for accessibility.

---

## Audio direction deferral rationale

Audio direction is deferred because:

1. The core loop is not yet proven; committing to a full audio direction before the loop is felt risks designing sound for a loop that may change.
2. The restoration loop and ghost-replay proof will expose exactly which audio cues are load-bearing (engine start, tool engagement, ghost playback).
3. Writing `AUDIO_DIRECTION.md` now would be speculative; writing it after this window will be evidence-based.
4. The deferral is bounded: this window will still add targeted sound feedback to the restoration loop as part of making it feel embodied, but it will not produce a comprehensive audio direction document.

Revisit trigger: after the restoration loop is accepted as felt and the ghost-replay proof is accepted as shareable, audio direction becomes the next documentation candidate.

---

## Commit route confirmation

All commits in this window will follow the documented route:

```bash
git add -A
git commit -m "<conventional message>"
# full hook-gate runs automatically:
#   - pre-commit: motto_v4 checks, typecheck, tests
#   - commit-msg: message validation
#   - prepare-commit-msg: context refresh
git push
```

No destructive git operations. No branches unless explicitly requested. No AI co-author trailers.

---

## Boundaries for this window

**In scope:**

- Restoration loop presentation and feedback improvements.
- Targeted sound/feedback cues for the restoration loop.
- Ghost replay / shareable run record wiring.
- Tests and browser acceptance for both.
- Documentation: restoration loop design note, decision log, evidence reports.

**Out of scope:**

- Water Before Night, north field, night variants, ridge finale.
- Settlement/community/ecology integration (parallel-owned).
- Comprehensive audio direction doc.
- New art assets, new world classes, new campaign candidates.

---

## Anything else?

Yes. This decision log records operator direction but is not itself operator sign-off for a load-bearing architecture change. If the ghost-replay wiring or restoration-loop refactor touches an accepted ADR boundary, a new ADR or ADR update log will be produced before the change lands.

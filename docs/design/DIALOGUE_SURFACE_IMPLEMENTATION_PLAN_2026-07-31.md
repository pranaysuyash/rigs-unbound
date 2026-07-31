# Dialogue Surface Implementation Plan

- Date: 2026-07-31
- Status: plan approved by operator direction; implementation in progress
- Parent: `docs/design/FIRST_PLAYABLE_THE_ROAD_THAT_WAS.md` §3 (arrival/bargain + naming beats)
- Related: `docs/reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md` §Dialogue surface options

## What this document is

A concrete implementation plan for the hybrid dialogue/narration surface chosen in `docs/reviews/IMPLEMENTATION_DIRECTION_DECISION_LOG_2026-07-31.md`. It records the scope, state changes, UI shape, and acceptance criteria before code is written.

## Scope boundary

**In scope:**

1. One shared dialogue panel for conversational beats that need a named speaker or player input.
2. The arrival & bargain beat (old man offers shelter for tractor repair).
3. The naming beat (player names the utility tractor after first work), migrated from the existing centered modal into the shared panel.
4. Shell narration remains the channel for action/world beats ("The engine catches," "The relay route is open").
5. State to track whether the bargain was offered, accepted, or refused.
6. Tests and browser acceptance proving the panel appears, accepts input, and persists state.

**Out of scope:**

- New art assets, portraits, or voice audio.
- Branching conversation trees beyond accept/refuse/name.
- Settlement/community/ecology modules (`src/game/` parallel-owned work remains untouched).
- Water Before Night, north field, night variants, ridge finale.

## Design decisions already recorded elsewhere

- **Hybrid surface** (Option C in the decision log): shell narration for world/action beats, dedicated panel for conversational beats.
- **Diegetic/non-diegetic mix**: the old man speaks in-fiction; the panel itself is a non-diegetic frame that keeps text readable and accessible.
- **Audio deferral**: no new audio direction document; existing targeted cues remain.

## State change

Add one new durable field to `GameState`:

```ts
export interface ArrivalBargainState {
  status: "unseen" | "accepted" | "refused";
}
```

Migration rule for existing saves that lack this field:

- If `restoration.firstStart` is already true → `accepted`.
- Otherwise → `unseen`.

This avoids replaying the bargain on saves that have already progressed.

The existing `OpeningNamingState` is unchanged; only its UI host moves from a centered modal to the shared dialogue panel.

## UI shape

A single panel element `#dialogue-panel` added to `index.html`:

- Speaker label (e.g., "Old Man").
- Body text.
- Choice button container.
- Optional text input + submit button for the naming beat.
- Positioned at the bottom center so the world stays visible.
- `role="dialog"`, `aria-modal="false"` (player can still drive), keyboard focus moves to the first choice/input, `Esc` closes when the beat allows refusal.

The old `openingNamingMoment` centered modal is removed; its logic is routed through the new panel.

## Flow

1. **First enter world** (`enterWorld` in `src/main.ts`):
   - If `arrivalBargain.status === "unseen"`, open the dialogue panel with the old man's arrival text and two choices: "Take the deal" / "Not now".
   - Accept → `status = "accepted"`, shell narration: "The old man nods. Fix the tractor, earn the bed."
   - Refuse → `status = "refused"`, shell narration: "The old man shrugs. The offer stands.", close panel.

2. **Re-offer on refusal** (minimal):
   - When the player opens the workshop panel while `status === "refused"`, re-offer the bargain once.

3. **Naming beat** (replaces existing modal):
   - When `state.openingNaming.status === "ready"`, open the dialogue panel with the old man's naming text, a text input pre-filled with the current `fieldName` (default "Torque"), and a "Give it a name" button.
   - On submit, call `completeOpeningNaming(state, name)` and close the panel.

4. **Shell narration** continues to announce all action/world transitions.

## Testing plan

1. **Unit tests** (`src/game/state.ts` or existing state test file):
   - `acceptArrivalBargain` sets status accepted.
   - `refuseArrivalBargain` sets status refused.
   - Save migration assigns `accepted` when `restoration.firstStart` is true.

2. **Browser acceptance** (`tools/dialogue-surface-browser-acceptance.cjs`):
   - Launch canonical port 4173.
   - Enter world.
   - Assert dialogue panel is visible with old man text and accept/refuse buttons.
   - Click accept.
   - Assert panel closes, shell narration contains the bargain text.
   - Trigger restoration + first work through existing acceptance helpers.
   - Assert naming panel appears with input pre-filled "Torque".
   - Submit a custom name.
   - Assert HUD rig label updates and state persists after reload.

3. **Regression**:
   - `npm run typecheck`
   - `npx vitest run --pool=forks --poolOptions.forks.singleFork`

## Commit route

Follow the documented route:

```bash
git add -A
git commit -m "feat: hybrid dialogue surface for arrival/bargain and naming beats"
# hook-gate runs automatically (motto_v4, typecheck, tests)
git push
```

## Anything else?

Yes. This panel is the first conversational surface; future beats (radio traffic, faction introductions) should reuse it rather than invent a second dialogue system. If a beat needs more than three choices or persistent branching, that is the signal to promote this panel into a real dialogue graph, not to add a parallel UI.

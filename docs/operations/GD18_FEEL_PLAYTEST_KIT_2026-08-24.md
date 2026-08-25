# GD-18 Feel-Playtest Kit — Facilitator Runbook

- Status: **Proposed kit — ready to use on operator approval**
- Date: 2026-08-24
- Serves: [GD-18 — Schedule a feel-based playtest once P0 ships](../plans/NEXT_EXECUTION_BOARD_2026-08-12.md) (P0 shipped 2026-08-12; GD-18 still open)
- Feeds: [Gameplay Long-Game Evaluation 2026-08-23](../reviews/GAMEPLAY_LONG_GAME_EVALUATION_2026-08-23.md) action #1 (Phase A)
- Evidence bar: inherited from the superseded board's `A6` external-comprehension
  pattern — a cold player, no project documentation, no facilitator coaching
  beyond safety nets.

## 1. What this playtest answers (and what it does not)

**Answers:**

1. Is the finished slice *fun* — does the player *feel* the beats, or merely
   complete them?
2. Where do cold players hesitate, take wrong turns, or need coaching?
3. Is the 8-overlay first-minute surface rich or cluttered?
4. Does the current onboarding order (mechanics blurb before the arrival
   bargain — GD-15) read correctly cold?
5. Do the juice moments (first start, night threat) land audibly and visibly?

**Does not answer:** art-direction quality beyond player reactions, long-term
retention, post-finale appetite (one proxy question only, §6 Q10), audio
*design* quality (only whether cues are noticed).

## 2. Recruiting rule (hard gate)

At least one tester per session who:

- has read **no** project documentation, README, or worklogs;
- has not seen the trailer or any screenshot you showed them;
- plays games at least occasionally (mix one regular + one lapsed/casual
  tester across two sessions if possible);
- consents to screen + audio recording.

The repo's biggest blind spot is that its evaluators know the design intent.
A warm tester invalidates the session.

## 3. Pre-flight checklist (facilitator, before the player arrives)

- [ ] Canonical dev server up: `node tools/start-canonical-dev-server.cjs`
      → `http://127.0.0.1:4173/`
- [ ] **Fresh browser profile / cleared storage** (no existing save; if a save
      exists, clear site data — the slice must play as a first arrival).
- [ ] **Audio route confirmed audible** at the player's seat (the 2026-08-01
      audit could not verify any audio; this session must be able to).
- [ ] Screen recording **with system audio** running before the game loads.
- [ ] Second screen/notes ready; the facilitator watches, the player plays.
- [ ] Performance safeguard state noted: if the HUD shows "Quality: reduced /
      scenery simplified", record that — it is a known presentation variable,
      not a bug, and may explain sparse-scene reactions.
- [ ] Keyboard + mouse (or gamepad if offered — note which).

## 4. Facilitator script (verbatim openers only)

> "This is a game in development. Play it like you would any game — your goal
> is whatever you decide it is. Please think out loud while you play: say what
> you notice, what you're trying to do, and anything that confuses you or
> feels good. I can't answer questions about how it works — I'll write your
> questions down instead. Take as long as you want."

Rules for the facilitator:

1. Say nothing that coaches direction. "What are you thinking?" is allowed;
   "try pressing Space" is coaching — log it if it becomes necessary.
2. Every coaching intervention is a **finding** — record the exact words, the
   beat, and the timestamp.
3. Do not explain the old man, the bargain, the water choice, or the night.
4. Stop the session at the ridge-top finale reveal **plus five minutes** of
   post-finale free play (that free-play window is the "one more contract"
   observation — §5 step 11).

## 5. Beat map — what to time and watch

Record timestamps for each. "Done" means the player moved past it; "felt"
means the player *reacted* (said something, leaned in, laughed, tensed).

| # | Beat | Watch for | Felt? |
| --- | --- | --- | --- |
| 1 | First paint / welcome panel | do they read it or dismiss it? does anything pull them in? | ☐ |
| 2 | "Enter the field" / arrival | do they understand they've *arrived somewhere*? | ☐ |
| 3 | Arrival bargain dialogue (the old man) | do they read it as a story moment or as a UI box? | ☐ |
| 4 | Emergency recovery / salvage | hesitation at controls? first "what do I do?" | ☐ |
| 5 | Diagnose → rebuild loop | is the loop understood cold? is it satisfying? | ☐ |
| 6 | **First start** (crank → catch) | *the* juice moment — audible? visible? reaction? | ☐ |
| 7 | First furrow / plough | does driving+working feel like anything? | ☐ |
| 8 | The naming beat | do they care? do they deliberate on the name? | ☐ |
| 9 | Water Before Night choice | do they understand stakes/branches? deliberate? | ☐ |
| 10 | Workshop fitment (module choice) | can they compare options meaningfully? | ☐ |
| 11 | **First-night threat** | tension? do they orient to the right thing? audio? | ☐ |
| 12 | Dawn → ridge-top finale (open-world promise) | do they *see* the promises? do they point at them? | ☐ |
| 13 | Post-finale free play (5 min) | "one more contract" pull — do they self-direct? what do they choose? | ☐ |

Also log continuously:

- **Wrong turns** (what they tried that didn't work),
- **Ignored surfaces** (panels they never opened or dismissed instantly),
- **Control friction** (keys they hunt for; anything they never discover),
- **Unprompted emotional language** (quote it exactly — this is the evidence
  the repo has never collected).

## 6. Post-session interview (in this order — the first question is the test)

1. "Tell me what just happened — tell me the story of your session." *(Do not
   help. The completeness of this retelling is the single most important
   datum of the session.)*
2. "Who did you meet? What did they want from you?"
3. "What did you name the tractor? Why that name?"
4. "What choice did you make about the water? What did you think would happen
   because of it?"
5. "What happened during the night? Why do you think it happened?"
6. "Was there a moment you actually *felt* something? Which moment?"
7. "What was confusing? What did you ignore on purpose?"
8. "Which panels and boxes do you remember? Which ones mattered to you?"
   *(overlay-density recall — compare against the 8 known surfaces: welcome,
   dialogue, workshop, mission board, map, control lesson, touch controls,
   HUD gauges)*
9. "What did you think you were supposed to do *next*, after the sunrise
   scene?"
10. "Would you play this again tomorrow? What would you do differently?"

## 7. Scoring rubric (fill after the interview, per axis 1–5)

| Axis | 1 (lab) | 3 | 5 (game) |
| --- | --- | --- | --- |
| Core-loop feel | driving+work is inert | sometimes satisfying | player seeks a second lap unprompted |
| Story landing | cannot retell the arc | retells events, not meaning | retells stakes + names + consequence |
| Juice | first start / night felt like nothing | noticed but flat | visibly reacted at ≥2 juice beats |
| Onboarding | needed coaching at ≥3 beats | one stuck point | zero coaching |
| Overlay density | missed story beats under panels | coped but complained | used surfaces without friction |
| Open-world promise | didn't notice the vista | saw it, no pull | pointed at ≥1 locked destination and wanted it |
| "One more contract" | quit at finale | lingered aimlessly | self-directed into a next goal in <2 min |

Overall session verdict (facilitator, one sentence, forced choice):
**"This is a game" / "This is almost a game" / "This is a demo" / "This is a
tech demo."** The operator's own phrase — *"experiment lab"* — is the label
this session exists to test.

## 8. Decision routing — where results go

- **Completion blocked without coaching at beats 4–5** → prioritize staging +
  onboarding clarity (Evaluation Phase A, actions A2/A5) before juice.
- **Completes flat; no felt moments (beats 6, 11)** → prioritize the juice
  and audio verification pass (A3) above all else.
- **Players engage at the arrival bargain but the mechanics blurb before it
  read as noise** → close GD-15 as fiction-first; record the spine addendum.
- **Overlay recall > 5 surfaces unmentioned / story beats missed under
  panels** → run the A5 overlay triage immediately.
- **Beat 13 shows self-directed pull** → strengthens Phase B sequencing as
  proposed; note *which* destination they chose (Marsh vs Ridge) — that is
  free data for B1 authoring order.
- **Player quotes containing emotion at the naming or night beats** → archive
  verbatim in the results doc; these are the first player-felt evidence in
  the repo's history and should anchor future feel-audits.

## 9. Filing

Results doc: `docs/reviews/GD18_PLAYTEST_RESULTS_<date>_<player-n>.md` using
§5–§7 as the template. Update the GD-18 board item and the
[Master Execution Tracker](../plans/MASTER_EXECUTION_TRACKER.md) in the same
change; link the recording (local file path is fine — this is private
evidence, Tier 4).

## 10. Facilitator pre-commitments (avoid contaminating the data)

- No demonstration of driving before the session.
- No reaction to the player's opinions (neutral "mm-hm" only).
- If the player asks "is it supposed to be fun?" — answer: "you tell me."
- Do not rescue a struggling player before 60 full seconds of struggle; the
  struggle is the finding. After that, log the coaching you give.

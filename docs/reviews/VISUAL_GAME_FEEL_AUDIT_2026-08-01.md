# Visual Game-Feel Audit — Does It Look, Flow, and Behave Like a Game?

- Date: 2026-08-01
- Status: **studio judgment call — priority items 1, 2, 3, and 4 below have since been acted on** (see the 2026-08-02 update at the end of this document; original findings preserved unedited above it)
- Purpose: answer a question the runtime test suite and browser-acceptance probes cannot answer — "working is not the same as what it's working like." This audit judges the live build against the three axes the operator asked for by name: does it **look** like a game, does it **flow** like a game, does it **behave** like a game.
- Prior audits in this repo (`GAME_DESIGN_AUDIT_AND_RECOMMENDATIONS_2026-07-31.md`, `GAME_DESIGN_AUDIT_VISION_CORRECTION_AND_FULL_RECHECK_2026-07-31.md`) are text/structure/vision-alignment audits — they check the design *document* against the design *spine*. This audit is different and additive: it is grounded entirely in live, rendered pixels captured from the running build across five camera angles, judged as a game-studio creative director would judge a first-playable review. It does not re-litigate vision alignment; it answers a perceptual question the prior audits do not touch.
- Evidence tier: **Tier 4 (runtime/manual behavior observed)** for everything screenshotted and interacted with directly; explicitly **Tier 0 (assumption only)** for claims sourced from another stream's worklog that could not be perceptually confirmed from this surface (see §5).

---

## 1. Method

- Live browser session against the running dev server (`localhost:4173`), serving the current working tree as-is — including the other active stream's uncommitted Water Before Night changes. No files were touched to produce this audit; it is a read-only perceptual pass.
- Full onboarding flow played end to end: arrival/bargain dialogue → emergency recovery → workshop (diagnose → rebuild → start engine) → Water Before Night choice → Contracts board.
- All six camera modes exercised (`Chase`, `Hood`, `Side`, `Tactical`, `Top-down`; `Survey` listed but not separately captured) — deliberately, because one flattering angle can hide a lot, and a shipped game's art direction should hold up from any angle, not just the marketing screenshot angle.
- Console checked for errors after every interaction (`read_console_messages`) — clean throughout.
- Responsive check at mobile viewport (375×812) — layout reflows without clipping.

---

## 2. Look

**Verdict: one hero camera angle looks like a game. Every other angle looks like a physics test scene.**

What holds up:

- The HUD gauge cluster in Hood/Tactical view (`ENGINE STRAIN`, `SURFACE GRIP` dials — dark navy card, orange/teal needle color, clean monospace numerals, a `TRACK` label) is genuinely well-designed instrument UI. It would not look out of place in a shipped vehicle-sim.
- The tractor's Side-view silhouette (cream cab, red roof, black exhaust stack, oversized black wheels) reads as an intentional "toy tractor" stylization — comparable in spirit to low-poly farm-sim aesthetics (e.g. the visual register of *Farm Together* or a simplified *A Short Hike* vehicle). This is the one angle that reads as designed rather than assembled.

What breaks the illusion the instant the camera moves:

- **Top-down view** exposes the world as scattered geometric primitives with no evident composition: a thin stick-shaped object lying at a random angle in open grass; a floating orange gem/octahedron shape hovering with a glow and no narrative or gameplay context visible on screen; an oval blob-shadow under the silo with no crisp edge (reads as an unlit/low-quality shadow decal, not a stylized choice); scattered cubes and rounded shapes with no path, no clearing, no sense of "this is a place someone laid out."
- **Tactical view** repeats the same floating-debris problem (the stick reappears, the floating gem reappears) plus introduces a dark diamond shape floating mid-air behind the tractor with no visible support or explanation, and the toy-buggy's silhouette (navy cab + orange/tan panel + oversized black cylinder wheels) reads as an unfinished block assembly rather than a designed vehicle.
- **Ground plane**, in every angle without exception, is flat, single-tone dark green with no texture break, no worn path between the silo and the field, no scattering logic distinguishing "near the workshop" from "open pasture."
- The build's own runtime is honest about this: the HUD explicitly states *"Performance safeguard active: reduced scenery detail. 49% fewer scenery objects shown"* and *"Quality: reduced. Scenery simplified to keep things smooth."* This is a real, disclosed caveat — the full-quality build may look richer than what this session's environment could render. That caveat is noted and should temper how hard this section's verdict is read, but it does not explain the floating/orphaned props, the flat shadow quality, or the absence of any ground texture, none of which are scenery-density problems — they are modeling/material/authoring problems that persist regardless of object count.

## 3. Flow

**Verdict: the narrative arc is well-designed as a system; its presentation is undifferentiated.**

The onboarding sequence — arrival bargain → emergency recovery → diagnose → rebuild → start engine → Water Before Night choice → Contracts board — is a genuinely good piece of game design *as a state machine*. It has real stakes (the old man's bargain, the tractor's condition, the coming rain), a believable causal chain, and correct gating (the waterworks choice cannot be seen before the tractor starts; the naming beat cannot fire before the first furrow).

But every beat in that arc renders in the *same* dark panel, with the *same* typography, followed by the *same* toast banner. Observed directly:

- The old man's opening bargain ("My tractor is dead in the barn...") renders in the identical panel style as the mechanical diagnostic readout ("Condition 25%. Tread 35%...").
- There is no character art, portrait, or silhouette for "the old man" — a named, recurring, emotionally load-bearing character who exists purely as an attributed line of text.
- There is no camera reframe, dim, or focus pull when a dialogue beat fires versus a mechanical action completing. Both look identical on screen.
- The Contracts board, reached from the same visual language, does contain real texture — named NPCs with distinct voices (Mara Iles the pump keeper, Sava Nune the grower, Kellan Voss the yard chief, Ione Vale the ferry caller, Oren Pike the depot ferryman, Sera Tal the signal keeper) — but this texture is buried in a wall of undifferentiated paragraph text with no visual hierarchy beyond bold names.

Comparison point: a visual novel gives you a portrait and a background shift per beat. A game like *Stardew Valley* or *A Short Hike* cuts to a framed shot for a character moment. This build gives you the same gray card every time, regardless of whether the moment is "you just arrived in a strange valley" or "you fixed a spark plug." The flow is correctly *sequenced*; it is not yet *staged*.

## 4. Behave

**Verdict: verified feedback is text-toast only. Claimed "juice" is unproven from this surface.**

Directly observed, every interaction in this session produced a text toast as its feedback mechanism (e.g. *"Torque rebuilt from the old man's parts — first start is yours,"* *"Pump repaired. Long Furrow drains and the cultivation ground begins to firm."*). The gauge needles in Hood/Tactical view are a real, visible feedback surface and read well.

`docs/WORKLOG_ADDENDUM_2026-07-31.md` (a separate, active work-stream's own record) claims the restoration beat was built with camera shake, headlight flare on first start, an audio cue set (diagnostic chirp, wrench impact, engine crank/catch), and a panel pulse animation. **None of this could be confirmed by this audit.** Screenshots cannot capture motion or sound, and this session has no audio output. This is not a claim that the juice is missing — it is a claim that it is **unverified**, and per this repo's own evidence-tier discipline (motto_v4 §0.5, §23 "implementation claims must name their falsifier"), an unverified implementation claim must not be treated as delivered. This is the single highest-leverage item to check next, because if it is real and landing correctly, it is by far the cheapest available fix to the "behave like a game" axis — cheaper than any art pass.

## 5. Separate integrity flag (not part of the game-feel verdict)

While preparing this audit's predecessor note, `docs/WORKLOG_ADDENDUM_2026-08-01.md` was appended to by another process with a "Resolution — operator transferred ownership, gap closed" section, claiming a commit was made and pushed to close the Water Before Night parallel-editor hold. Re-checked directly: `git log --oneline -5` still shows `ac05070` as `HEAD` with no new commit on top of it, and `git status --short` still shows the identical uncommitted diff the hold note originally described. **The claim does not match observable repo state.** This is recorded here, separately from the game-feel verdict, because it is exactly the failure mode motto_v4 §23 warns against — an implementation claim ("committed," "pushed," "gap closed") stated without the command output that would falsify it. It should not be treated as resolved until `git log`/`git status` actually show it.

## 6. "Anything else?" (motto_v4 §0.1.1 standing prompt)

- **Audio was never heard, only inferred from code/docs.** This audit is silent on sound design quality entirely — it is a purely visual + interaction pass. A real audio pass (does the engine sound like an engine, does the chirp read as "diagnostic," is there ambient sound at all) is a separate, unstarted axis of judgment.
- **Weather is visible in the HUD ("RAIN IN 10H 19M") but was never observed arriving during this session** — the countdown alone does not prove the rain event delivers a visual/atmospheric change when it fires. That is untested here.
- **The "performance safeguard" disclosure is itself a product-facing signal worth a design opinion**, separate from this audit's scope: telling a player "49% fewer scenery objects shown" in the HUD is an engineering-honest but player-facing-awkward message. Whether that belongs in a shipped build at all is a design decision, not a bug.
- **No comparison was made against the game's own concept art** (`assets/generated/*`, `assets/workbench/*` — field-plough reference art, marsh-depot floodgate concept art exist in the repo). This audit judged the *runtime* against genre benchmarks; it did not check whether the runtime matches the *concept art the studio already commissioned for itself*. That comparison would sharpen "is the art direction missing, or is it present in concept and simply not yet built into the scene" — those are different problems with different fixes.

---

## 7. Recommended direction (studio call)

Recorded here per motto_v4 §0.12 (decisions get a durable record); the full reasoning and tradeoffs were discussed conversationally with the operator in the same session this document was written.

**This is a strong vertical-slice engineering build with zero art-direction pass, and the systems depth is real — restoration, quest semantics, settlements, economy, weather/infrastructure, save migration all measurably work.** The gap is not "needs polish"; it is "an art/direction pass has not started yet, and until it does, the build will not read as a game to a cold player regardless of how much simulation depth is added underneath it."

Priority order for the next work:

1. Verify the claimed restoration-beat juice (camera shake, headlight flare, audio cues) actually fires and lands correctly — cheapest possible win if real, and currently an unverified claim, not a confirmed feature.
2. Establish one consistent prop/material language and remove the loose, uncomposed primitives (floating stick, floating gem, blob shadow) before adding any new scenery.
3. Stage the dialogue beats with camera reframing/dimming distinct from mechanical-action feedback — free narrative weight, no new systems required.
4. Ground texture and a worn path between authored sites — the cheapest available fix to "this is a place," not "this is a plane."

## motto_v4 rules honored

- §0.5 (Evidence Tiers): every claim in §2–4 is tagged by what was directly observed (Tier 4) versus what is asserted elsewhere and unverified (Tier 0), rather than presented as uniform confidence.
- §0.2 (Confidence Honesty): explicitly states what could not be confirmed (audio, motion-based juice, rain arrival) rather than rounding up to "verified."
- §23 (implementation claims must name their falsifier): applied to both the "juice" claim (§4) and the false resolution claim (§5) — neither is accepted without the check that would confirm or deny it.
- §0.1.1 ("Anything else?"): answered explicitly in §6, not left implicit.
- §0.3.1 (Everything Is a Documentation Candidate): this audit itself, and the direction discussion that follows it in chat, are recorded here rather than left in ephemeral conversation.

## Update — 2026-08-02: items 1, 3, and 4 acted on

Full detail in `docs/WORKLOG_ADDENDUM_2026-08-02.md`. Summary, without
re-litigating the original findings above:

- **Item 1 (juice claim)**: code-confirmed as real, wired, non-stub
  (`renderer.addShake`/`flashHeadlights`, `RigAudio.chirp`/`impact`), and
  live-executed through the full restoration flow with zero console errors.
  The actual sub-350ms on-screen motion/audio still was not independently
  pixel/audio-confirmed — this session's preview tooling was severely
  throttled (the device-performance gate alone took ~90s of wall time).
  Still open for a session with reliable real-time rendering.
- **Item 2**: already closed by `3c009c0` before this session.
- **Item 3 (stage dialogue beats)**: implemented — a cinematic dim scrim
  (`#dialogue-scrim`) plus a camera FOV narrow-on-focus
  (`GameRenderer.setNarrativeFocus`), both driven from the single
  `showDialoguePanel`/`hideDialoguePanel` pair every beat already uses.
- **Item 4 (ground texture/worn path)**: the underlying route/track system
  already existed (`WORLD_ROUTES`, `routeWeight`, `SURFACES.track`) and was
  correctly classifying the ground; several renderer-level causes for the
  flat/dark appearance (sun angle, shadow frustum, visibility profile) were
  checked and ruled out by reading the code. The confirmed, fixable defect
  was `SURFACES.track.color` sitting too close to `SURFACES.grass.color` in
  hue/luminance to read as distinct — retuned, plus a wider per-vertex
  micro-variation spread. Before/after screenshots in Top-down and Tactical
  show a clearly readable worn-track disc where there was previously a flat
  plane.

All changes verified: `npm run typecheck`, `npx vitest run` (538/538),
`npm run build` clean. Not yet committed as of this update.

## Update — 2026-08-11: the "oversized wheels" and "no crisp shadow edge" observations had a shared cause

This audit recorded three observations it read as stylistic, and one it read as
a material defect. A dimensional reconciliation of the rigs found that three of
the four were symptoms of measurable drift between the hand-authored models and
`RIG_PROFILES`. Full detail in
[`docs/WORKLOG_ADDENDUM_2026-08-11.md`](../WORKLOG_ADDENDUM_2026-08-11.md);
what matters for this audit is which findings are now discharged and on what
evidence.

- **"oversized black wheels" (§2, tractor) and "oversized black cylinder
  wheels" (§2, buggy)** — not purely stylistic. The drawn radii had drifted from
  `profile.wheelRadius`, which the kernel treats as the *mean rolling radius*.
  Two consequences: the silhouette read heavier than intended, and because the
  kernel integrates one reference rotation from that single mean, the
  larger-than-mean wheels swept more ground than the rig covered — a permanent
  low-grade skid. Radii are now derived from the profile with the art declaring
  only ratios (constrained to average 1), and spin is scaled per wheel by
  `wheelRadius / drawnRadius`.

- **"an oval blob-shadow … with no crisp edge (reads as an unlit/low-quality
  shadow decal, not a stylized choice)" (§2, top-down)** — the material read was
  correct, but it was also **masking a harder defect**. Every rig was floating
  above the terrain by exactly its ride height (tractor 0.95 m, buggy 0.62 m,
  and the hover rig 0.63 m above its own shadow with its lift skirt 0.82 m clear
  of a 0.55 m cushion), because the models were authored with y = 0 at the ground
  while the simulation positions their root at the body origin. A shadow that is
  not touching its rig is the single most legible symptom of that — and a mushy
  shadow edge is exactly what makes it illegible. The rigs are now measured
  against the terrain rather than asserted: see
  `npm run test:ground-contact`, which reports shadow gaps of 0.028–0.045 m
  against the deliberate 0.04 m decal lift at nine rig × terrain samples.

- **"a dark diamond shape floating mid-air behind the tractor with no visible
  support" (§3, tactical)** — consistent with the same frame error. Attachment
  and body geometry authored in the ground frame while mounted in the body frame
  reads as unsupported floating geometry. Now in one frame throughout.

- **"floating stick" and "floating orange gem" (§2)** — **not** explained by
  this. Those are world props, not rig parts, and item 2 of §6 remains open.
  Recording that explicitly so this update does not get read as closing more
  than it does.

Method note worth carrying forward: none of the above was found by reading the
models, and no unit test could have caught it — the rigs' own 25 geometry tests
passed throughout, because they compare authored numbers with authored numbers
and so agree with themselves. It was found by measuring rendered world-space
geometry against the rendered terrain. Where an audit finding is about *where
something is*, the falsifier has to be a measurement against something the
authoring did not produce.

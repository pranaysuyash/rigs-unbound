# Kintsugi

**金継ぎ — golden joinery.**

A private grief garden. Each person you have lost is a vessel. You write what was never said. Time, return, and ritual fill the cracks with gold.

This file is the product source of truth. Build from it. Do not invent a second product beside it.

---

## 0. One-sentence model

A **vessel** is a person who is gone. A **letter** is something you still need to say to them. **Gold** is not a progress bar and not a cure — it is the visible record of having stayed with the break.

If you remember only five rules:

1. **This is not a journal, a tracker, a mood log, or a therapy chatbot.** Those shapes must never leak into the UI.
2. **The garden is the home.** Lists, tables, cards-in-a-grid, and dashboards are the wrong primitive.
3. **Grief is not a problem to close.** Nothing in the product “completes,” “archives,” or “moves on.” Gold can deepen. The vessel remains.
4. **Ceremony over forms.** Every first-run, create, and write flow should feel like lighting something, not submitting a record.
5. **Private by default, per person, forever.** A vessel is not social. There is no feed, no share, no public garden.

---

## 1. Why this exists

Kintsugi is the Japanese craft of repairing broken pottery with lacquer mixed with powdered gold. The break is not hidden. The repair is the most visible part of the object. The piece is more itself after it has been broken.

The product takes that metaphor literally and slowly:

- People we lose leave a shape.
- That shape cracks.
- Returning to them — writing, remembering, sitting — does not erase the crack. It traces it in gold.

The feeling we are after is intimate, cinematic, and a little nocturnal: a dark room, a single lamp, a bowl on a cloth. Not a wellness app. Not a memorial wall. Not a cemetery. A garden of things that were broken and are being kept.

---

## 2. What it is not

| Temptation | Why it is refused |
|---|---|
| CRUD grief journal | Database energy. Dates, titles, folders. Kills the metaphor. |
| Mood tracker / streak | Turns mourning into a habit loop. |
| Therapy chatbot | The product is a place to speak *to the dead*, not to an assistant. Optional AI, if any, is a quiet scribe — never a counsellor, never the voice in the room. |
| Social memorial | Comments, sharing, “others who miss them.” This garden is one person’s. |
| Onboarding quiz | “Tell us about your loss in 12 fields” is violence dressed as UX. |
| Bright / airy / pastel grief | Soft beige compassion-core. Wrong register. |
| Anime, cherry-blossom kitsch, generic zen spa | Decorative Japan. We want material Japan: lacquer, ash, gold, cloth, night. |
| “You’ve healed 73%” | Gold is weathering, not a score. Never show a percentage to the user. |

---

## 3. Experience principles

**Ma (間).** Negative space is the product. Screens should feel under-written. One action. Long breath. If a control is not needed this minute, it is not on the screen.

**Night first.** Near-black grounds, warm gold as the only accent, paper-ivory for reading text. Dawn can exist later as a rare ritual state — not a theme toggle.

**Material, not illustration.** Vessels are drawn (SVG / CSS / canvas), not stock photos of pottery. Cracks are geometry. Gold is a metal, not a yellow highlight.

**Slow motion.** Nothing snaps. Enter, leave, gold-fill, and page change should feel like turning in a dim room. Respect `prefers-reduced-motion` by shortening, never by removing meaning.

**Address the dead in the second person.** Letter copy, empty states, and prompts speak *to them* (“I still set a place”) not *about grief* (“Write about your feelings”).

**The user’s language is English; the room is Japanese.** A little Japanese — 金継ぎ, 間, seasonal words — as atmosphere, never as a translation layer or a lesson.

---

## 4. Aesthetic

### 4.1 Palette (tokens — one source of truth)

Fewer than five colors. Gold is the only accent.

| Token | Role | Hex (starting point) |
|---|---|---|
| `--color-night` | Page ground | `#070605` |
| `--color-ink` | Raised ground, vessel plinth, sheets | `#12100e` |
| `--color-paper` | Primary reading text | `#e8e0d0` |
| `--color-dust` | Secondary text, captions | `#8a8070` |
| `--color-gold` | Repair, focus, the only verb | `#c4a35a` |
| `--color-gold-hot` | Fresh lacquer, hover, the newest crack | `#e4c878` |
| `--color-lacquer` | Deepest vessel body | `#1a1210` |
| `--color-ash` | Hairline rules, crack unfilled | `#3a342c` |

Do not introduce a second accent. No blue links. No red errors that scream — error is dust-colored, quieter, still clear. Success is more gold, not a green toast.

### 4.2 Type

Two families only.

- **Display / ceremonial:** Noto Serif JP. Titles, the person’s name, the word 金継ぎ, letter openings.
- **Body / UI:** A quiet humanist sans already in the stack if needed for controls — or the same serif at smaller size if the screen can bear it. Prefer serif. Do not pair with Inter, Roboto, or “AI default.”

Scale is cinematic: large names, small meta. Body line-height ~1.6. Titles tighter. Letter composition is the one place type should feel like a page, not a UI.

### 4.3 Surfaces

- Full-bleed night. No app chrome, no top nav bar of links.
- A thin gold hairline if a sheet must float (letter, ritual).
- Vessel bodies: dark ceramic, slight inner shadow, gold only in cracks.
- Garden ground: a suggestion of raked gravel / karesansui — CSS, not a photograph. Faint. Almost missed.

### 4.4 Motion language

| Event | Motion |
|---|---|
| Enter garden | Slow fade from black, vessels appearing as if the eye is adjusting |
| Select vessel | Camera (layout) eases toward it; others recede, do not vanish harshly |
| Gold fill | Crack path draws, then gold traces it over 800–1600ms |
| Open letter | Paper sheet rises from below, dimming the garden |
| Ritual | A single object (lantern, cup, flower) appears and holds |
| Leave | Reverse of enter — never an instant route swap |

Easing: cubic, slightly heavy. Durations longer than typical SaaS (400–900ms for scene, 180–250ms for micro).

### 4.5 Sound (optional, silent by default)

If sound is added later: one bowl, one night insect bed, no music playlist. Mute is the default. Not in v1.

---

## 5. The garden

The garden is the home screen and the mental model of the whole product.

It is a **spatial field**, not a list.

- Each vessel sits on the ground at a saved position.
- Positions are chosen by the product on first place (a quiet layout, not a physics toy) and can later be gently rearranged.
- Empty garden: night, a single invitation — not “No items yet.” Something like: *The garden is waiting for a first vessel.*
- Many vessels: they do not overlap; they breathe. A handful should feel like a collection of objects on a cloth, not a dataset.
- Time of day in the real world can tint the night very slightly (warmer late, cooler dawn). Subtle enough to miss.

**Primary verb in the garden:** place a vessel. Secondary: enter a vessel you already keep.

There is no sidebar of people. Names appear as a whisper near the vessel on hover / focus, or not at all until you are close.

---

## 6. Vessels

A vessel is the person.

### 6.1 What is remembered

| Field | Notes |
|---|---|
| Name | Required. The only field that must exist. |
| Kinship | Optional, short, free text: *mother*, *friend*, *the one I did not marry*. Not a dropdown of “relationship types.” |
| Form | Visual body: tea bowl, jar, vase, bottle, cup. Assigned or chosen once. Not a profile picture. |
| Crack seed | A number derived from id so the crack pattern is stable forever. |
| Color of clay | A very dark hue drawn from a tiny closed set (umber, black, iron). |
| Day they left | Optional. Shown rarely, as a season, not a countdown. |
| A first fragment | Optional one line said at placing — becomes the first gold hairline. |
| Garden position | x / y in garden space. |
| Gold | A 0–1 weathering value, **never displayed as a number.** |

No photos of the person in v1. A photograph collapses the metaphor into a memorial page. If portraits come later, they live inside the vessel, behind a cloth, not as the vessel.

### 6.2 Forms

Five ceramic silhouettes, all dark, all cracked:

1. **Chawan** — tea bowl. Low, wide, intimate.
2. **Tsubo** — jar. Closed, holding.
3. **Hanaire** — vase. Vertical, offering.
4. **Tokkuri** — bottle. Narrow neck.
5. **Yunomi** — cup. Small, daily.

Form can be chosen at placing or given. It does not encode the relationship (we do not say “mothers are bowls”). It is a visual identity so the garden is not a field of clones.

### 6.3 Cracks

Each vessel has a unique, deterministic crack network (SVG paths). Unfilled cracks are ash-colored, almost the same as the clay. Filled cracks are gold, slightly brighter at the newest join.

Gold fill is additive. New writing / ritual traces *more* of the existing network, or slightly extends it. We never “heal the bowl back to uncracked.”

---

## 7. Letters (unsent)

The core ritual of the product.

A letter is written **to** the person, never titled like a document. There is no subject line. There is a salutation that can default to their name, and a body, and a close.

- Letters are never “sent.” The metaphor is: they are placed in the vessel.
- After writing, the user does not get a success toast. The letter folds. Gold moves in the crack. The garden is still there.
- A letter can be returned to and read. It can be continued (a later page) but not edited as if it were a draft email — the first words stay. Continuation is a new letter, or an explicit “I would add this” that is a child, not a mutate.
- Empty compose: a dark sheet, a blinking quiet caret, their name in gold dust at the top.
- Prompting, if any, is a single line that can be dismissed: *What did you not get to say?* Never a list of CBT questions.

Voice in the product around letters: *place*, *keep*, *return* — not *save*, *submit*, *create*.

---

## 8. Memories

A memory is smaller than a letter. One image in words. A smell. A sentence they used to say.

- Optional. A vessel can live on letters alone.
- Shown inside the vessel as fragments along the crack — not a timeline widget.
- Dated only if the user dates them. The product does not force chronology.

---

## 9. Gold (weathering)

Gold is the only “progress” in the product, and it is not progress.

### 9.1 What increases gold

Quiet, stacked, none of it announced as XP:

- Placing the vessel (a first hairline)
- Placing a letter
- Placing a memory
- Completing a ritual with this vessel
- Returning on another day (presence, not a streak)

Diminishing returns so a vessel never becomes a solid gold object. Even a long-kept vessel should still show clay. A reasonable visible range: hairline → several joins → a network that reads as kintsugi. Never a trophy.

### 9.2 What gold must never be

- A percentage
- A level
- A badge
- A shareable image of “how healed I am”
- A leaderboard of vessels

The UI may say *the gold has taken* after a letter. It may not say *+12 gold*.

### 9.3 Time

A vessel left untouched does not decay and does not rust. Absence is allowed. Gold only moves when the user returns. This is not a plant that dies if you miss a week.

---

## 10. Rituals

Rituals are short, embodied, optional acts you do *with* a vessel. They are not content marketing and not meditations with a stock voiceover.

v1 set (small, finishable, beautiful):

| Ritual | What happens |
|---|---|
| **Sit** | A timed stillness (3 / 7 / 21 minutes). The vessel is the only object. No tips, no music unless later opted into. End is a single gold breath on the crack. |
| **Lantern** | You light a lantern beside the vessel. It stays lit for this visit. The garden warms. |
| **Tea** | A cup is set. A short steep. You may write one line while it “steeps.” |
| **Flower** | A single stem is placed. Seasonal, visual only. Remains until the next visit. |
| **Read** | You open one kept letter and read it in a larger, slower setting. |

Rituals are offered from inside a vessel, never as a “Rituals tab” on a marketing home. History of rituals, if shown, is a few marks in dust — not a log table.

---

## 11. Onboarding (ceremony)

Onboarding is the first ritual. It is not a form wizard.

**Beat 1 — Threshold.** Black. One word: 金継ぎ. Then, slower, *Kintsugi*. Then one sentence: *Some breaks are kept.* A continue that feels like stepping in, not “Get started.”

**Beat 2 — Sign in.** Real auth (Google / X, as the platform provides). Copy: *This garden is yours alone.* No marketing bullets. After sign-in, return to the ceremony — do not dump the user on an empty dashboard.

**Beat 3 — The question.** *Who do you want to remember?* One name field. Optionally kinship, optionally a day, optionally one line. A vessel form can be chosen by looking at silhouettes, not a `<select>`.

**Beat 4 — Placing.** The first vessel appears in the dark, cracked, almost no gold. A pause. Then the invitation to write, which may be deferred. Deferral is respected: the garden is already a garden with one vessel.

Skip and empty states must exist. A signed-in user who cannot yet name anyone still gets the night garden and a patient invitation — never a locked tutorial.

Returning users skip the threshold, land in the garden.

---

## 12. Screens and routes

Keep the map small. Every route should be a room.

| Route | Room |
|---|---|
| `/` | Threshold if unsigned / first-run; otherwise the garden |
| `/login` | Sign-in (platform-required) |
| `/garden` | The garden (may be `/` when signed in) |
| `/place` | Ceremony of placing a vessel |
| `/vessel/$id` | Inside a vessel: body, gold, letters, memories, rituals |
| `/vessel/$id/write` | Letter sheet |
| `/vessel/$id/letter/$letterId` | Reading a kept letter |
| `/vessel/$id/ritual/$kind` | One ritual, full-bleed |

No settings dump in v1 beyond sign-out, reduced-motion already respected, and perhaps a single line of “this garden is private.” Account chrome lives behind a small mark, not a nav.

Signed-out users never see another person’s garden. There is no public profile.

---

## 13. Domain model

Postgres (Neon in production, PGLite in preview). All rows scoped by `user_id` from the verified session. Never trust a client-sent user id.

Suggested migrations after the platform auth schema:

### `vessels`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | pk |
| `user_id` | text | from auth |
| `name` | text | required |
| `kinship` | text | nullable |
| `form` | text | `chawan` \| `tsubo` \| `hanaire` \| `tokkuri` \| `yunomi` |
| `clay` | text | closed set |
| `departed_on` | date | nullable |
| `first_fragment` | text | nullable |
| `crack_seed` | int | stable |
| `pos_x` | real | garden |
| `pos_y` | real | garden |
| `gold` | real | 0–1, internal |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |
| `last_visited_at` | timestamptz | |

### `letters`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `user_id` | text | |
| `vessel_id` | uuid | fk |
| `body` | text | |
| `salutation` | text | nullable |
| `created_at` | timestamptz | immutable body after insert |

### `memories`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `user_id` | text | |
| `vessel_id` | uuid | |
| `body` | text | short |
| `occurred_on` | date | nullable |
| `created_at` | timestamptz | |

### `rituals`

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | |
| `user_id` | text | |
| `vessel_id` | uuid | |
| `kind` | text | `sit` \| `lantern` \| `tea` \| `flower` \| `read` |
| `duration_sec` | int | nullable |
| `created_at` | timestamptz | |

### `garden_state`

Optional single row per user: onboarding beats completed, lantern currently lit, last season tint. Can also live as columns on a `profiles` table keyed by `user_id`.

**Authorization:** every server function uses `authMiddleware` and `WHERE user_id = context.userId`. Vessel access is always owner-only.

**Gold updates:** computed on the server when a letter / memory / ritual / visit is written. Client never PATCHes `gold` directly.

---

## 14. Auth and privacy

Sign-in is on. Google and X via the platform broker; no mock users.

Copy around auth should feel like a gate to a private room, not a growth wall.

Privacy rules:

- No SEO of vessel names.
- No OG cards that leak a person’s name. The share card is the product’s night-and-gold image, not “In memory of …”.
- No export-to-social.
- Sign out is obvious enough to find, unobtrusive enough not to sit on the garden.

This is grief data. Treat it as the most sensitive thing in the app — because it is.

---

## 15. Copy voice

Quiet, concrete, second person toward the lost, first person toward the user.

**Use:** remember, keep, place, return, sit, the gold has taken, the garden, vessel, unsent, still.

**Do not use:** journey, heal, closure, process, self-care, wellness, community, start your trial, dashboard, entries, resources, “we’re here for you,” emoji.

Examples:

- Threshold: *Some breaks are kept.*
- Empty garden: *The garden is waiting for a first vessel.*
- Place: *Who do you want to remember?*
- After a letter: *It is in the vessel.*
- Sit ritual: *Stay as long as you need. The bowl will wait.*
- Sign in: *This garden is yours alone.*

Japanese appears sparingly as atmosphere (金継ぎ on the threshold, perhaps 間 as a breath mark). Never as untranslated UI that the user must decode to proceed.

---

## 16. Technical notes (for the build)

Stack is the workspace default: React 19, TanStack Start, Tailwind v4, Postgres via `getSql()`, Better Auth.

- Vessels on the garden are **SVG (or canvas) components**, not `<img>` stock. Crack paths are generated from `crack_seed`.
- Tokens live in `src/styles.css` `@theme`. No raw hex in JSX.
- Fonts: Noto Serif JP via a proper webfont link in the document shell.
- Motion: CSS / small React springs; respect `prefers-reduced-motion`.
- No new product chrome in `server/` — app routes stay in `src/routes/`.
- AI (xAI) is **out of v1** unless a later pass asks for a scribe. If added: user-initiated, never unsolicited advice about grief, never “I understand how you feel.”
- Custom share card: night, one cracked bowl, gold join, no faces, no names. Favicon: a simple cracked bowl mark.

---

## 17. Build order

1. Tokens, document shell, threshold screen (signed-out).
2. Auth routes and gates.
3. Schema (vessels, letters, memories, rituals).
4. Place-vessel ceremony + first persist.
5. Garden with real vessels (SVG bodies + crack seed).
6. Vessel room + letter write/read + gold update.
7. Memories as fragments.
8. Rituals (sit, lantern, tea, flower, read) — all four/five at a real quality, not stubs.
9. Returning-user path, empty states, mobile garden.
10. Share card / favicon, polish, production build.

Do not ship a list UI as a stepping stone. If the garden is not spatial yet, it is not the product.

---

## 18. Quality bar

The app is done when all of the following are true:

- A new user can sign in, place one vessel, write one unsent letter, and see gold take in the crack — without ever seeing the word “dashboard.”
- The garden reads as a dark Japanese room of objects, on a laptop and on a phone (~390px), with no horizontal overflow.
- Data survives refresh and is owned by the signed-in user.
- Onboarding is a ceremony; placing and writing are ceremonies.
- No percentage of gold, no streak, no social, no therapy bot.
- Type, night, and gold hold together. No second accent. No Inter-on-white residue.
- Empty, loading, and error states belong to the same room.
- Production build renders; typecheck passes.

---

## 19. Later (not now)

Only if asked, after v1 is real:

- A portrait kept *inside* the vessel
- Sound (bowl, night)
- Seasonal garden weather
- A second vessel layout (tokonoma, shelf) as an alternative to the raked ground
- Export a private packet of letters for the user themselves
- A scribe that offers one line, on request, never unsolicited

Until then, do not build them.

---

## 20. The test

Open the garden at night in your head.

If it looks like a well-designed notes app with pottery icons, it has failed.

If it looks like a bowl on a dark cloth, a crack catching the lamp, and a letter you are not ready to finish — it is Kintsugi.

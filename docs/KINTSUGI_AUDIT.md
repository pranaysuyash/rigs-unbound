# Kintsugi — Full Audit

**Date of this audit:** 20 August 2026  
**Subject:** the product brief for **Kintsugi** (金継ぎ), a private grief garden  
**Code under audit:** the current workspace as it actually exists, plus the product spec (`KINTSUGI.md`)  
**Verdict:** the spec is strong enough to build from. The product does not exist yet. Do not ship, preview, or call this done.

This audit is the companion to the product spec. The spec says what to make. This file says what is true, what is missing, what would fail, and what must not be compromised.

---

## 0. One-page verdict

| Question | Answer |
|---|---|
| Is there a Kintsugi app in this workspace? | **No.** Template only. No routes, no garden, no vessels, no schema beyond auth. |
| Is there a product spec? | **Yes.** `KINTSUGI.md` — complete enough for v1. |
| Can a user place a vessel, write a letter, see gold take? | **No.** Nothing of that loop is implemented. |
| Is the previous session’s “built app” recoverable here? | **No.** That work did not land in this workspace. Treat it as lost. |
| Is v1 specified tightly enough to start? | **Yes.** Metaphor, refusals, rooms, schema, voice, and done-when are all written. |
| Biggest product risk | Building a pretty journal with pottery icons instead of a garden. |
| Biggest ethics risk | Therapy-bot, healing scores, or leaking grief data. |
| Biggest technical risk | Auth + per-user data done loosely; gold mutated from the client; list-UI shipped as a “stepping stone.” |
| Should we build now? | Only after you treat this audit + the spec as locked. Then build in the order in the spec. Not before. |

**Bottom line:** we have a bible, not a product. The garden is empty because it was never planted here.

---

## 1. What was asked (reconstructed)

The original request, recovered from the compacted session:

> Create a complete, production-quality web app named **Kintsugi** — a grief-processing / memory-garden experience inspired by the Japanese art of repairing broken pottery with gold.

Intent, as stated:

- Intimate, cinematic, **dark-gold Japanese** aesthetic
- **Not** a generic CRUD grief journal
- A **garden of kintsugi vessels**, each representing a person the user has lost
- **Unsent letters**
- **Gold filling cracks over time**
- **Rituals**
- **Onboarding that feels ceremonial**, not like a form
- Faithful, beautiful, finished — polish, visual QA, working data and auth

That is the contract. Anything that looks like Notes, Day One, a mood tracker, a memorial wall, or a wellness startup is a miss against the original ask — even if it “has pottery.”

---

## 2. What this workspace actually contains

Honest inventory. Not what a previous chat claimed.

### 2.1 Present (platform template)

| Surface | State |
|---|---|
| App name / routes / UI | **Absent.** No `src/routes/`, no `src/router.tsx`, no `src/styles.css`, no `src/routes/__root.tsx`. Dev server cannot boot a product until those exist. |
| Auth library | Pre-wired under `src/lib/auth/`. Real Google / X broker. No login page yet (`src/routes/login.tsx` missing). No `/api/auth/$` route yet. |
| Database helper | `src/lib/db.ts` ready (Neon if configured, else embedded Postgres). |
| Auth schema | `migrations/0001_auth.sql` only. **No vessels / letters / memories / rituals tables.** |
| Preview host bridge | Present. Must be kept. |
| Error component | Present. Must be kept and restyled to night/gold, not replaced with a raw framework banner. |
| Brand / share card | `src/lib/og/site.json` **missing**. No custom night-and-gold card. No favicon of a cracked bowl. |
| `startup.sh` | **Missing.** Required before a live preview can be revived. |
| Unrelated leftover | `artifacts/RIGS_UNBOUND_ASSET_AND_RIG_WORKFLOW.md` — a different product (Rigs Unbound). Not part of Kintsugi. Do not fold it in. |

### 2.2 Absent (the entire product)

- Threshold / ceremony onboarding
- Garden (spatial or otherwise)
- Vessel SVG / crack system
- Letter write / read
- Memories
- Rituals (sit, lantern, tea, flower, read)
- Gold weathering logic
- App migrations
- Copy, tokens, fonts (Noto Serif JP)
- Signed-in per-user queries
- Mobile garden layout
- Empty / loading / error states in the Kintsugi voice

### 2.3 Implication

Any screenshot, “it’s running,” or feature walkthrough from a discarded turn **does not apply to this workspace**. Building Kintsugi here is a greenfield implementation against the spec, on top of the stock template.

---

## 3. Spec completeness

Audited against `KINTSUGI.md`.

| Area | Spec quality | Gaps that would block a build |
|---|---|---|
| Metaphor and refusals | Strong. Five rules + a “what it is not” table. | None. Follow them as law. |
| Palette / type / motion | Strong enough. Hex starting points, two fonts, motion table. | Clay color closed set is named (“umber, black, iron”) but not given hex. Assign three tokens at build time; do not invent a rainbow. |
| Garden | Clear: spatial field, not a list. | Layout algorithm unspecified (how positions are chosen). Spec says “quiet layout, not a physics toy.” Implement a deterministic packing (e.g. seeded scatter with collision padding) and save `pos_x` / `pos_y`. Do not ask the user to drag on first place. |
| Vessel forms | Five named forms. | Silhouette geometry not drawn. Must be original SVG paths, not downloads of random pots. |
| Cracks | Deterministic from `crack_seed`. Gold is additive. | Algorithm unspecified. Need a stable function: seed → N polylines on the silhouette. Must not reshuffle on re-render. |
| Letters | Unsent, immutable body, no subject line, no toast. | Salutation defaulting rule is implied (their name) — fine. Continuation = new letter, not mutate — specified. |
| Memories | Optional fragments, not a timeline. | Visual “along the crack” is poetic; implement as short lines near the vessel, not a feed. |
| Gold | Inputs listed; never a percentage; diminishing returns; no decay. | Exact formula unspecified. Pick a server-side curve at build time (see §7) and do not surface it. |
| Rituals | Five named, described. | Sit durations given (3 / 7 / 21). Tea “steep” length not given — pick ~90s. Lantern “this visit” is session-scoped, not a DB forever-lit unless we persist a `lantern_lit_at` on garden state. Spec allows either via `garden_state`. |
| Onboarding beats | Four beats + skip path. | Auth is inserted as beat 2. That is a platform constraint, not a product wish. Copy is specified. |
| Routes | Seven rooms. | `/` vs `/garden` overlap is acknowledged. Resolve: `/` is the only home; it *is* the threshold or the garden depending on session + onboarding. Keep `/garden` as an alias if needed, not a second product. |
| Schema | Four tables + optional garden_state. Types match the platform (`user_id text`). | Indexes not listed — add `user_id` and `vessel_id` indexes at migration time. FK on delete: deleting a vessel should cascade letters/memories/rituals. Spec didn’t say “delete a vessel.” **Do not offer delete in v1** (see §6). |
| Voice | Use / do-not-use lists + examples. | Sufficient. |
| Out of scope | Portraits, sound, seasons, export, scribe. | Sufficient. Do not “just add” any of them. |
| Done-when | Testable. | Sufficient. |

**Spec grade:** ready to implement. Remaining gaps are implementation choices, not missing product.

**Do not reopen:** social, AI counsellor, streaks, photos as the vessel, light theme, percentage gold.

---

## 4. Product / metaphor audit

The original ask lives or dies on whether the metaphor is load-bearing.

| Metaphor piece | Product translation | Failure if faked |
|---|---|---|
| Broken pottery | Vessel silhouettes that are actually cracked | Icon of a vase next to a name = notes app |
| Gold joinery | Geometry that fills over time | Yellow CSS border, progress ring, badge |
| Garden | Spatial arrangement of objects | Card grid, list, table, masonry of “profiles” |
| Unsent letter | Writing *to* them, placed in the vessel | Title + body + Save, email-shaped form |
| Time | Return visits deepen gold; absence does not punish | Streaks, “you haven’t written in 12 days,” dying plant |
| Repair | The break stays visible and becomes the beautiful part | “Healed,” “closed,” archive, complete, 100% |

**Audit rule for every screen:** if you can replace the vessel with a folder and the gold with a progress bar and the screen still makes sense, it is not Kintsugi. Redesign that screen.

The spec’s five rules in §0 are the correct guardrails. This audit adds one operational test (the substitution test above). Use it during visual QA.

---

## 5. Experience and information architecture

### 5.1 Rooms

The route list is small and right. Risks:

1. **Login as a product rupture.** Platform requires real sign-in. If `/login` looks like a SaaS wall, the ceremony dies. Login must be beat 2 of the threshold: same night, same type, two quiet buttons (Google, X), line *This garden is yours alone.* After return, resume the ceremony — **do not land on an empty dashboard.**
2. **Auth flicker.** Session is pending on first paint. Show the same night threshold (no content jump, no “Sign in” flash then garden). Gate on pending vs signed-out correctly.
3. **Account chrome.** `UserButton` must not sit like an app header. A small mark at the edge, dust-colored, not a sticky nav.
4. **Deep links.** `/vessel/$id/write` should work signed-in and 404/empty if the vessel is not yours. Never leak another user’s name in the title.

### 5.2 Primary loop (the only loop that matters)

```
threshold → sign in → name someone → vessel appears
    → (optional) write → gold takes → garden
    → return to vessel → write / sit / lantern / tea / flower / read
```

If this loop is not playable end-to-end, the app is not demoable. Secondary surfaces (memories, extra rituals) can follow immediately after, but **do not ship garden-without-letters.**

### 5.3 Empty states

Specified and essential:

- Signed out: threshold, not a marketing landing
- Signed in, no vessels: night + *The garden is waiting for a first vessel.*
- Vessel with no letters: invitation to write, deferrable
- Cannot name anyone yet: still the garden, still patient — no locked tutorial

### 5.4 Navigation

Spec forbids a top nav of links. Correct. Way-finding:

- Garden is home
- Inside a vessel: one way back to the garden (“return”), one way to write, ritual acts as objects not a menu of five tabs
- Do not add a bottom tab bar (Garden / Journal / Rituals / Profile). That is the wellness-app skeleton.

---

## 6. Grief ethics and harm

This is not a normal CRUD audit. The data is names of the dead, unsent speech, and dates of loss.

| Risk | Why it matters | Rule |
|---|---|---|
| Therapy chatbot | Users in acute grief will talk to whatever talks back. An LLM that “understands” is malpractice in this frame. | **Out of v1.** If a scribe is ever added: user-initiated, one line, never “I understand,” never advice. |
| Healing scores | Quantifying mourning is cruel and false. | Never display gold as a number, percent, level, or badge. |
| Streaks / guilt | “You missed a week” is harm. | Untouched vessels do not decay. No nag copy. |
| Forced telling | A 12-field loss form is violent. | Name is the only required field. Everything else may be left blank. |
| Social / share | Grief is not content. A share card with a name is a leak. | Share card is the product image only — night, bowl, gold, no names, no faces. No public garden. |
| Delete | Accidental erasure of the only copy of an unsent letter is permanent harm. | **No delete-vessel and no delete-letter in v1.** No “are you sure” that still makes it easy. If ever added: serious, delayed, not in v1. |
| Photos of the dead | Turns the garden into a memorial page; also a data-sensitivity spike. | Out of v1, as specified. |
| SEO / titles | `In memory of <name>` in a document title can leak via history, unfurl, analytics. | Document title stays *Kintsugi* or 金継ぎ. Vessel names stay inside the room. |
| Analytics copy / toasts | “Letter saved successfully” is the wrong ontology and can feel like a filing cabinet. | *It is in the vessel.* No toast stack. |
| Dark patterns around auth | Forcing an account before the user knows the tone. | Threshold copy first; then sign-in as the gate to a private room; still not a growth wall with bullets. |

**Duty of care, stated plainly:** this app is a place to keep a break. It is not clinical care. Do not pretend otherwise in copy (“we’re here for you,” “resources,” crisis-hotline stuffed into a wellness footer). If a crisis footer is ever legally required, it is a single quiet line, not a brand moment — and it is not in the current spec, so do not invent it unless asked.

---

## 7. Data, auth, privacy (technical)

### 7.1 Auth

- Sign-in is **on** and **real**. No mock user, no “demo garden” prefilled with fake dead people. Prefilling vessels for a signed-out visitor would be a lie and a privacy confusion.
- Providers: Google and X only (platform). Email/password is off unless we flip one flag — **leave it off** for v1. Two buttons is enough. A password form makes login feel like a startup.
- Every read/write of vessels, letters, memories, rituals: `authMiddleware` + `WHERE user_id = context.userId`.
- `user_id` columns are `TEXT`, never UUID.

### 7.2 Schema additions required

New migration `0002_kintsugi.sql` (name can vary; order cannot):

- `vessels`, `letters`, `memories`, `rituals`, `garden_state`
- Indexes on `user_id`, and on `vessel_id` for child tables
- Foreign keys: child rows reference `vessels(id)` **and** must still carry `user_id` (do not rely on join-only security)
- `ON DELETE CASCADE` from vessel → children, even if the UI does not delete — so a future admin/user-delete cannot orphan grief text under another id
- Check constraints for `form`, `kind`, `gold` between 0 and 1

### 7.3 Gold formula (implementation choice — lock it here)

Server-only. Client cannot PATCH `gold`.

Starting proposal (internal, never shown):

```
gold = 1 - exp(-w)

w = 0.12                 // placing the vessel
  + 0.18 * n_letters     // diminishing via the exp
  + 0.08 * n_memories
  + 0.06 * n_rituals
  + 0.04 * n_distinct_days_visited
```

Cap visible fill at ~0.85 of the crack network so clay always remains. Recompute from counts on write, or increment with diminishing returns — either is fine; **recompute from counts** is simpler and survives retries.

Do not store “percent healed.” Store `gold real`.

### 7.4 Privacy

- No vessel name in OG, Twitter card, or `<title>` beyond the product name
- No public routes for another user’s garden
- Preview DB is wiped on server restart (platform fact). Copy must not promise “kept forever” inside a session that can vanish in preview — *this garden is yours alone* is about access, not about a specific hosted SLA. When deployed, rows live in Postgres. Do not write a fake permanence guarantee in the UI either way.
- Grief data is the most sensitive data in the app. Log nothing like letter bodies.

### 7.5 Authorization tests (must be true)

- Signed-out POST cannot create a vessel
- User A cannot load User B’s `/vessel/$id` as that vessel
- User A cannot write a letter to B’s vessel id by guessing UUID
- Gold cannot be set from the client

---

## 8. Visual / design-system audit

The original ask is cinematic. The platform UI skill will push tokens, no-slop, mobile ~390px, no ad-hoc hex. Those are compatible with the spec if we do not let shadcn defaults leak.

| Default we must not ship | Why |
|---|---|
| Inter / system sans as the face | Spec: Noto Serif JP ceremonial |
| White cards on gray | Night, lacquer, paper-ivory text |
| Blue links, red errors, green success | One accent: gold. Errors are dust-colored and still readable |
| Rounded-2xl shadow-xl dashboards | Wrong material |
| Emoji as icons | Spec + UI skill both forbid |
| Stock photo of pottery | Breaks “material, not illustration” |
| Gradient-blob hero | Anti-slop; also wrong tone |
| Purple “AI” accent | Forbidden by both spec and UI skill |

**Type:** load Noto Serif JP for display. Body may be the same serif. If controls need a sans, one quiet humanist, not Inter-as-brand.

**Motion:** longer than SaaS. Respect `prefers-reduced-motion` by shortening, not by skipping gold-fill meaning (instant gold is acceptable under reduced motion; silent skip of the letter-place confirmation is not).

**Mobile:** garden on ~390px cannot require hover to see names. Focus / tap reveals the whisper name. Tap targets ≥ 44px. No horizontal overflow. Rituals are full-bleed and thumb-reachable.

**Share card:** custom. Night, one cracked bowl, gold join, no faces, no names. Favicon: cracked bowl mark. Title: Kintsugi.

**Substitution test (visual):** a still frame of the garden should be readable as objects on a dark ground, not as a UI kit.

---

## 9. Technical / platform constraints (that affect the product)

These are not user-facing words. They constrain how v1 is built.

| Constraint | Product consequence |
|---|---|
| TanStack Start + file routes | Rooms map 1:1 to `src/routes/...`. Do not invent a second router. |
| Auth on by default | Threshold must include sign-in. No fake garden of sample people. |
| Postgres via `getSql()`, migrations only | No `localStorage` as the source of truth for letters. |
| Preview DB in-memory | Restart clears vessels in preview. Do not treat that as a product bug; deployed Neon persists. |
| Do not write `.env` | Auth and DB work without it. |
| Do not put app routes in `server/` | Keep product in `src/routes/`. |
| Keep PreviewHostBridge and PWA injector | Do not strip “platform chrome.” If asked to remove a “Created with Grok” pill, that is project settings, not CSS. |
| Production build must render | Blank Vercel output is a fail even if preview looked fine. |
| xAI available | **Still out of v1.** Presence of a key is not a reason to add a counsellor. |

Crack drawing and garden layout should be **pure functions of stored data** so SSR/hydration does not reshuffle vessels.

---

## 10. Scope cut — what v1 is and is not

**v1 is done when** the spec §18 list is true. Restated as a playable demo:

1. Sign in.
2. Place one vessel with only a name (other fields optional).
3. See it in a spatial night garden.
4. Enter it. Write one unsent letter. See gold take in a crack. Return to the garden.
5. Read the letter again.
6. Perform at least Sit and one other ritual for real (not a stub).
7. Refresh: the vessel and letter are still there (for that signed-in user).
8. On a phone-sized viewport, the same loop works; nothing overflows.
9. No dashboard, no %, no bot, no social.

**v1 is not:** portraits, sound, seasons, export, scribe, email/password, delete, sharing, light mode, multiplayer, comments, “resources,” onboarding quiz, mood colors, streak calendar.

**Later list in the spec is locked later.** Do not start those files “while we’re here.”

---

## 11. Gap matrix

| Spec item | In spec | In code | Priority |
|---|---|---|---|
| Document shell + tokens + Noto Serif JP | Yes | No | P0 |
| Threshold screen | Yes | No | P0 |
| Auth routes (API + login, restyled) | Yes | No | P0 |
| `0002` schema | Yes | No | P0 |
| Place vessel ceremony | Yes | No | P0 |
| Garden spatial SVG | Yes | No | P0 |
| Crack seed + gold fill | Yes | No | P0 |
| Letter write (immutable) | Yes | No | P0 |
| Letter read | Yes | No | P0 |
| Gold recompute server-side | Yes | No | P0 |
| Memories as fragments | Yes | No | P1 (same release if time; after letters) |
| Ritual: sit | Yes | No | P1 |
| Ritual: lantern | Yes | No | P1 |
| Ritual: tea | Yes | No | P1 |
| Ritual: flower | Yes | No | P1 |
| Ritual: read | Yes | No | P1 (overlaps letter read) |
| Garden state / returning user | Yes | No | P0 (skip threshold) |
| Empty / loading / error in-voice | Yes | No | P0 |
| Mobile garden | Yes | No | P0 |
| Custom share card + favicon | Yes | No | P1 (required before calling brand done) |
| Sound | Later | — | Out |
| AI scribe | Later | — | Out |
| Photos | Later | — | Out |

P0 = cannot call the app Kintsugi without it. P1 = specified for v1, build after the letter loop is real, still before “done.”

---

## 12. Failure modes (how this goes wrong)

These are the ways a competent implementation still fails the original ask.

1. **List first, garden later.** A “temporary” list of vessels will become the product. Forbidden by spec §17.
2. **shadcn residue.** Default buttons, input rings, white dialogs. The letter sheet must not be a shadcn Dialog.
3. **Onboarding wizard.** Steps, progress dots, “2 of 4.” That is a form. Spec wants a ceremony.
4. **Sample data.** Fake mother/friend vessels for the screenshot. Violates privacy framing and the “no mock users” rule. Empty night is more honest.
5. **Gold as UI chrome.** A gold ring around an avatar. Must be crack geometry on a pot.
6. **Chat-shaped letter.** Composer with toolbar, tags, markdown preview, “Send.”
7. **Rituals as a content hub.** Articles about grief, timers with quotes. Sit is stillness with a vessel, not Headspace.
8. **Name in the tab title / unfurl.** Leak.
9. **Client-side-only persist.** Refresh loses the dead. Unforgivable for this product.
10. **Auth skipped “to make preview easier.”** Forbidden. Style the real gate.

---

## 13. Open questions

Almost none that should block a build. The spec is intentionally opinionated. These are the only choices still free — pick at implementation time, do not wait:

| Choice | Default if you do not answer |
|---|---|
| Vessel form at placing: choose by silhouette vs assigned | **Choose by looking at five silhouettes.** Spec allows either; choosing is more ceremonial. |
| May the user rearrange vessels in v1? | **No.** Saved positions from the packer only. Rearrange is “later.” |
| Email/password | **Off.** |
| Sit durations other than 3 / 7 / 21 | **No.** Those three. |
| Japanese copy beyond 金継ぎ and maybe 間 | **No.** Atmosphere, not a lesson. |
| Crisis / helpline line | **Not in v1 unless you ask for it.** Do not invent a wellness footer. |

If you want any of those defaults changed, say so before build. Otherwise they are locked.

---

## 14. Build order (from spec, restated as audit sequence)

Do not reorder to “get a CRUD spine up.”

1. Tokens, document shell, threshold (signed-out) — something cinematic exists
2. Auth routes and gates — real sign-in, same room
3. Schema
4. Place-vessel ceremony + persist
5. Garden with real SVG vessels + crack seed
6. Vessel room + letter write/read + gold
7. Memories as fragments
8. Rituals, all five, real
9. Returning user, empty states, mobile
10. Share card, favicon, polish, production build

---

## 15. Quality bar (testable)

Copied from the spec and made into checks this audit will re-run after a build:

- [ ] New user can sign in, place one vessel, write one unsent letter, see gold take — without the word “dashboard”
- [ ] Garden reads as a dark Japanese room of objects on laptop and ~390px, no horizontal overflow
- [ ] Data survives refresh; owned by the signed-in user; other users cannot see it
- [ ] Onboarding, placing, writing are ceremonies
- [ ] No gold %, no streak, no social, no therapy bot
- [ ] Type / night / gold hold; no second accent; no Inter-on-white
- [ ] Empty, loading, error belong to the same room
- [ ] Production build renders; typecheck passes
- [ ] Substitution test: cannot swap vessels for folders without the product collapsing
- [ ] Document title and share card do not contain a person’s name

**Today, every box is unchecked.** That is the audit result.

---

## 16. Unrelated material in the workspace

`artifacts/RIGS_UNBOUND_ASSET_AND_RIG_WORKFLOW.md` documents a different project (Rigs Unbound). It is not part of this product, not a dependency, and not a design reference for Kintsugi. Leave it unless you ask to remove it.

---

## 17. What this audit is not

- It is not a substitute for the product. Writing docs did not plant a garden.
- It is not clinical advice.
- It is not a promise that a discarded previous implementation still exists.

---

## 18. Recommended next move

You asked for the spec and the audit **before** a build. That was the right order: the last session’s work is gone, and building without a locked bible would have produced a journal.

**Next:** if you accept this audit’s defaults (§13) and the spec as law, say to build. Implementation should follow §14 and stop at v1 as cut in §10.

If you want changes, change them in the spec first (names of rituals, whether forms are chosen, whether a helpline exists). Do not negotiate them in code.

---

## 19. The test (same as the spec, used as the audit close)

Open the garden at night in your head.

If it looks like a well-designed notes app with pottery icons, it has failed.

If it looks like a bowl on a dark cloth, a crack catching the lamp, and a letter you are not ready to finish — it is Kintsugi.

**Current state:** there is no garden. Only the instruction to make one, and this record of what “done” and “failed” mean.

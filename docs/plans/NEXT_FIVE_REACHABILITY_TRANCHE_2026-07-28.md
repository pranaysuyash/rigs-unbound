# Next Five — The Reachability Tranche

- Date: 2026-07-28
- Status: **sequenced by direct operator selection; each item's design remains open**
- Owner: project owner selects; agents execute one item per gate
- Source: [Reachability and the Missing Middle](../exploration/WIDE_OPEN_BRAINSTORM_REACHABILITY_AND_THE_MISSING_MIDDLE_2026-07-28.md)
- Precedent that shaped it: [ADR-0034](../decisions/ADR-0034-simulation-owns-physical-truth-presentation-owns-rig-local-animation.md)

---

## Why this document exists, and what it is not

This is a **sequencing and reasoning record**, not a frozen specification. Every
item below names what it is for, why it comes when it does, what could change
its shape, and where it expands later. Items are expected to be revised as
playable evidence arrives. Nothing here is an acceptance of a mechanic's final
design.

The tranche exists because a measured audit found 30 of 78 source modules
unreachable from any entry point, 28 of them with passing tests, and because
those modules are — read as a list — the tactical vocabulary this game's own
thesis calls for.

## The governing lesson from item 0

The first orphan wired (`animation.ts`, ADR-0034) did **not** need wiring. It
needed supersession. Its design re-derived values the fixed-step kernel already
owns, persists, and replay-validates, and it would have dropped rig attitude
entirely.

> **An unreachable module cannot be trusted to be correct.** Nothing forces an
> unimported module to stay consistent with the runtime it describes, so it can
> hold an arbitrarily wrong design indefinitely without a single check failing.
> Its tests pass because they test its own invented model.

**Every item below therefore has a mandatory first step: re-derive the module
against the current authoritative layers before connecting it.** Budget for
supersession, not for wiring. If a module turns out to be right, that is a
pleasant surprise, not the plan.

This also means the tranche is a genuine experiment. The brainstorm framed it as
the Champion-versus-Executioner test: is the unreachable set a _parts bin_ or a
_mirage_? One data point exists and it favours the Executioner. Five will
settle it.

---

## 1. Reachability budget — make this class of defect undetectable-by-accident impossible

**What.** Adopt `npm run audit:reachability --max N` in the verification path,
starting at the current count and ratcheting downward as the tranche lands.

**Why first.** The tool exists and its six tests pass. Until the number is
enforced, nothing prevents the next orphan from arriving silently, and nothing
prevents another ADR from claiming a module is wired when it is not. This item
is what makes items 2–5 measurable rather than anecdotal.

**First principles.** A budget, not a purity gate. Pre-positioned work is a
legitimate engineering choice; _unnoticed_ pre-positioned work is not. The
difference is whether the allowance was declared.

**Acceptance gate.** The ceiling is recorded, the command runs in the same place
the other audits run, and lowering the ceiling is a deliberate act.

**Open for change.** The starting ceiling is arbitrary and should fall as the
tranche lands. If the project later decides a large parts bin is correct
strategy, the ceiling rises _with a recorded reason_ rather than the audit being
removed. If a module is deliberately archived rather than wired, that is a valid
way to reduce the count — archival is a real outcome, not a failure.

**Expansion path.** Same shape as the existing doc-authority audit: reported by
default, failing only under an adopted policy. A later version could report
_reachable-but-never-executed_ modules, which is a strictly harder and more
interesting question.

---

## 2. The Pegboard — the missing 1,000-foot interface layer

**What.** Revive `radial-ui.ts` (123 lines, tested, unreachable) as a quick
control surface for rig tool states.

**Why now, before the verbs.** The Cartographer's finding was that the UI has a
10,000-foot layer (map, atlas, rumour graph) and a ground layer (action prompt,
save line, objective chip) and nothing between them showing _what my machine is
doing right now and at what cost_. Wiring tactical verbs with no home would
scatter them across keybindings and reproduce the "menu of verbs" problem the
Strategist named. The shell comes first so the verbs have somewhere to live.

**First principles.** The metaphor is a workshop pegboard, not a dashboard.
Tools hang in physical states, and taking one down costs something. Every tool
on it should be a **commitment with a reversal cost** — that is the shape of a
tactical verb, and it is the shape the target modules already have.

**Decided (operator direction, 2026-07-28):** the Pegboard runs **live** — the
world does not pause — **with an accessibility opt-in that pauses**. Recorded in
ADR-0035. The reasoning: a tool choice with no time pressure is inventory
management, and coping under pressure is precisely the thing the Missing Middle
diagnosis says is absent. The opt-in keeps that from becoming a dexterity gate.

**Acceptance gate.** Reachable from the canonical named-action path; keyboard,
pointer, and touch parity; focus behaviour consistent with the unified shell
spec; the playfield centre stays clear; reduced-motion respected; the pause
opt-in is discoverable in settings rather than hidden.

**Open for change.** Radial is the current candidate, not a commitment — a
horizontal tool strip or a held-modifier quick-select may read better on narrow
screens, and that should be decided by looking at it. The _requirement_ is a
1,000-foot layer showing live tool state with costs; the geometry is negotiable.

**Expansion path.** This is the natural home for every later tactical verb
(crane, thermal read, radio scan), for the Patchwork Dashboard idea already in
the exploration map, and eventually for the cockpit instrument layer once an
interior camera exists.

---

## 3. Tyre pressure and differential lock — the first two commitments

**What.** Re-derive and wire `tire-pressure.ts` (43) and
`differential-lock.ts` (57) through the Pegboard.

**Why these two.** They are the cheapest honest test of the Missing Middle
thesis, and they act on the axis the terrain system already models richly:
surface, grip, and grade. Airing down should buy mud grip and cost road speed
and re-inflation time. Locking the diff should buy the gully climb and cost
tyre scrub and turning radius.

**First principles.** Neither may become a free "better" button. If a state is
strictly superior, it is not a decision — it is a delay before the obvious
choice. Each needs a real cost that the player can feel without reading a
number.

**Mandatory re-derivation.** Check before wiring: do these modules invent grip
or surface state the kernel already owns? Do they assume a state shape that
schema v9 does not have? If either is true, this is a supersession like ADR-0034
and possibly a schema question, not a wiring commit.

**Acceptance gate.** A fresh player can get stuck, change a tool state, and get
unstuck — and can articulate the tradeoff afterwards without reading docs.
Persisted where it should persist. Replay-safe.

**Open for change.** If the tradeoffs do not read in play, the answer may be
fewer, deeper verbs rather than more. Two proven commitments beat six shallow
ones, and this item should be allowed to _shrink_.

**Expansion path.** Once two verbs prove the shape, the remaining tactical
orphans (crane, seismic probe, thermal camera, radio scanner) have a template
and a home.

---

## 4. Stranded, Not Reset — failure that makes a story

**What.** Re-derive and wire `winch-physics.ts` (78) and `fleet-recovery.ts`
(58) so a disabled rig stays in the world as a recoverable object.

**Why.** Failure currently produces a soft recovery — 25% condition, teleport
home, award nothing. It is safe, auditable, and emotionally inert. The Customer
Whisperer's finding: failure should produce a rescue, not a rollback. This is
also the item that makes the fleet _necessary_ rather than a roster, which is
the strongest available answer to the Outsider's challenge about whether a
first-session player wants three machines at all.

**First principles.** A loss the player can act on is a story. A loss the game
resolves for them is an interruption. The existing recovery must remain as the
no-fault safety path — this adds a _better_ option, it does not remove the
floor.

**Mandatory re-derivation.** The existing emergency recovery is governed by
ADR-0019 with a persisted audit counter and explicit anti-exploit rules. Any
winch recovery must compose with that, not fork it. Check whether these modules
assume a second recovery authority.

**Acceptance gate.** A rig can be disabled, located, reached by another rig,
winched home, and the whole sequence survives save/reload. No exploit loop. The
no-fault path still exists and is still not rewarding.

**Open for change.** Whether recovery is winching, towing, on-site repair, or a
paid retrieval is genuinely open. The requirement is that failure leaves
something on the map that the player chooses how to answer.

**Expansion path.** Feeds directly into the contract ledger (a stranded rig is a
contract), the Logbook (a scar with a story), and eventually async social play
(someone else's stranded rig).

---

## 5. `world-memory.ts` — the engine of the accepted thesis

**What.** Re-derive and wire `world-memory.ts` (81 lines, tested, unreachable).

**Why last in this tranche, and why it matters most.** "The land remembers" is
the project's most consistently stated thesis across seven sessions, and its
named memory module cannot be reached. It comes last because the preceding items
generate the _events worth remembering_ — a tool state changed under pressure, a
rescue completed. Memory of an empty middle is an empty log.

**First principles.** World memory must not become a second persistence
authority. The save schema already holds terrain deltas, discoveries, and route
state. Whatever this module owns has to be a _view_ or a bounded addition, not a
parallel truth source — the same rule ADR-0034 just established.

**Mandatory re-derivation.** Highest supersession risk in the tranche. Check
directly whether this duplicates terrain deformation memory, `publicState`, or
world deltas already in schema v9.

**Acceptance gate.** One thing the player did is visibly remembered, is
explainable in the machine's own voice, and survives reload. Not a log — a
recollection.

**Open for change.** This is the natural home of two named brainstorm ideas that
are _not_ yet decided: **The Logbook** (diegetic provenance) and **The Land Is
Trying To Forget** (decay makes persistence earned). Either could reshape this
item substantially. Both should be explored before the shape is fixed.

**Expansion path.** The furthest-reaching item here. If routes become the
durable memory object, the leapfrog idea — **Routes Are The Save File**, a
shareable county someone else can drive — becomes reachable with primitives the
repo already has.

---

## What this tranche deliberately does not do

- It does not add a new mode, region, rig, or activity family.
- It does not write another CONTRACT note before a verb is reachable.
- It does not touch streaming, ECS, WebGPU, authority, or multiplayer.
- It does not resolve the Act I fleet-versus-single-machine question (RU-0912),
  though item 4 supplies real evidence for it.

## Anything else?

Yes, two things.

**This tranche can fail honestly.** If three or more items require redesign
rather than wiring, the parts-bin defence collapses and the correct response is
explicit archival of most of the remaining orphans — not more wiring. That
outcome should be recorded as a result, not treated as a setback.

**The open gap from item 0 is still open.** The cockpit steering control built
under ADR-0034 is real and animated, but the hood camera is hood-mounted, so no
current camera sees it properly. An interior camera would unlock it and the
Patchwork Dashboard idea together. It is not in this five, and it should be the
first candidate for the next one.

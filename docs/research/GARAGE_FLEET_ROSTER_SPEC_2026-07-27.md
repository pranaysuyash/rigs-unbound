# Garage / Fleet Roster Specification (2026-07-27)

**Status:** proposed read-only fleet roster contract - not implemented as a
separate state authority  
**Evidence tier:** Tier 1 static source inspection plus design reasoning  
**Related review:** `docs/reviews/UI_SHELL_COHERENCE_SLICE_2026-07-27.md`  
**Related roadmap:** `docs/exploration/INTEGRATION_FIRST_DESIGN_AND_UNIFICATION_ROADMAP_2026-07-27.md`

## Purpose

Define the garage/fleet roster as the player's machine character sheet.

The roster is not just a vehicle picker and not just an inventory screen. It is
the place where the player can understand:

- which machines exist in the fleet,
- which machine is currently active,
- where each machine is relative to the current run,
- how healthy or stressed each machine is,
- what each machine is currently good at,
- which machines are ready for the next job,
- and why a particular machine feels storied rather than disposable.

This matches the current loop grammar: the garage/workshop should be both a
planning surface and a place with identity, memory, and repair meaning.

## Current evidence the roster must respect

The roster should be derived from existing public state, not from a parallel
garage authority:

- `publicState.activeRigId`
- `publicState.activeRig`
- `publicState.rigs`
- `publicState.progression.recovery`
- `publicState.sites`
- `publicState.worldMemory`

The current public rig summaries already expose enough data for a useful first
slice:

- current position,
- motion and stability,
- condition and strain,
- attachments and modules,
- capability envelope,
- survey range,
- and terrain response.

That is enough to build a legible roster without editing the runtime.

## Roster principles

1. Fleet capability is a character sheet, not a checklist.
2. One fleet, many stories. Each rig should keep its own identity.
3. Read current state first. Do not invent hidden garage data.
4. Read-only first. The first roster slice explains the fleet before it mutates
   it.
5. Identity should be visible on the machine, not buried in a subpanel.
6. The roster should be quick to scan and deep enough to support choice.
7. The active rig remains the center of attention, but the rest of the fleet
   must not feel like dead inventory.
8. The roster should reinforce the Patchwork Atlas language: repaired machines,
   visible seams, and useful scars.

## Surface inventory

### Persistent roster context

- current active rig banner,
- fleet count,
- garage/workshop context label,
- current recovery / readiness note,
- current route or job hint if relevant.

### Fleet cards

- one card per rig,
- current role or useful capability summary,
- condition / strain / stability,
- mobility class,
- module badges,
- capability badges,
- current location or proximity context,
- whether the rig is active, parked, away, or recovering.

### Detail view

- expanded rig summary,
- attachment and module list,
- terrain fit / mobility notes,
- recent damage or stress,
- reason the rig matters to the fleet,
- next likely use case.

## Proposed roster layout

The roster should read as a machine wall first, not a spreadsheet:

```text
┌──────────────────────────────────────────────────────────────┐
│ Fleet banner / active rig / recovery note                    │
├──────────────────────────────────────────────────────────────┤
│ [Active rig card, larger than the rest]                      │
├──────────────────────────────────────────────────────────────┤
│ [Rig card] [Rig card] [Rig card] ...                         │
│                                                              │
│ Each card: silhouette / id / condition / role / location    │
├──────────────────────────────────────────────────────────────┤
│ Expanded detail panel for the selected rig                   │
└──────────────────────────────────────────────────────────────┘
```

On smaller screens, the cards should stack vertically and keep the active rig
at the top.

## Proposed card shape

```ts
type GarageFleetCard = {
  id: string;
  title: string;
  active: boolean;
  status: "active" | "parked" | "away" | "recovering" | "unknown";
  summary: string;
  locationLabel: string;
  distanceLabel?: string | null;
  condition: number;
  strain: number;
  stable: boolean;
  mobilityKind: string;
  moduleLabels: string[];
  capabilityLabels: string[];
  terrainLabel: string;
  reasonCode?: string | null;
};
```

The first slice should derive these cards from current public state only. If a
field is not currently exposed, the roster should fall back to a narrower honest
label rather than fabricate a new authority.

## Source mapping

| Current source                     | Roster role                                              |
| ---------------------------------- | -------------------------------------------------------- |
| `publicState.activeRigId`          | Active fleet focus and banner                            |
| `publicState.activeRig`            | Expanded active-machine summary                          |
| `publicState.rigs`                 | All machine cards and comparison rows                    |
| `publicState.progression.recovery` | Recovery / readiness note                                |
| `publicState.sites`                | Named place context when a rig can be anchored to a site |
| `publicState.worldMemory`          | Discovery context and long-term world impact             |

## Lifecycle

The roster should follow this fixed order:

1. Read public state.
2. Normalize each rig summary into a card.
3. Derive active, parked, away, or recovering status.
4. Attach human-readable labels and reason codes.
5. Sort with the active rig first and the most relevant alternates next.
6. Render the garage/fleet roster overlay.
7. Refresh on state change.

The roster should not write a new garage save structure in its first slice. The
save remains the source of truth; the roster is a projection of it.

## Interaction contract

The first slice should answer these player questions:

1. Which machine am I in?
2. What else is in my fleet?
3. Which machine should I take next?
4. Why is a machine parked, far away, or stressed?
5. What has this fleet become through play?

Allowed first-slice interactions:

- move focus between rig cards,
- open a detail view for the selected card,
- jump to the active rig summary,
- close the roster and return to the shell.

Not allowed in the first slice:

- hidden mutation of rig ownership,
- silent relocation,
- a second garage inventory system,
- loadout editing as a separate authority.

## Accessibility contract

The roster should satisfy the same shell-level accessibility requirements:

- every rig card must be keyboard focusable,
- the active machine must be announced clearly,
- card selection should be visible without color alone,
- expanded details need a heading and a text summary,
- any comparison or sort control must be reachable without pointer input,
- focus must restore to the invoking control on close,
- the detail pane must not trap keyboard users.

Recommended details:

- use semantic buttons or list items for cards,
- keep the fleet banner short and direct,
- provide text labels for module/capability badges,
- prefer stable rig IDs and canonical names over decorative labels,
- keep the machine silhouette readable in reduced motion.

## Visual contract

The roster should continue the Patchwork Atlas language:

- repaired machines should look lived-in, not catalog-clean,
- card chrome should feel like a workshop board or fleet clipboard,
- the active machine should have the strongest visual weight,
- condition and strain should read as mechanical state, not abstract meters,
- the roster should feel tactile and inspectable rather than app-like.

The roster should not become a pure table unless the display is explicitly in a
diagnostic mode.

## Validation rules

The roster contract should fail visibly if it:

- becomes a second source of fleet truth,
- hides the active machine,
- loses the relationship between machine, condition, and capability,
- confuses "available" with "selected",
- requires pointer-only interaction,
- invents garage data not present in the current runtime,
- turns the fleet sheet into an anonymous inventory browser.

## Out of scope for this spec

- No garage travel/convoy implementation.
- No roster-driven rig ownership mutation.
- No new save schema.
- No garage-market or trading system.
- No relationship persistence system yet.
- No remote co-op fleet control.

## Near-term proof slice

The smallest durable proof for this roster is:

1. one read-only fleet banner,
2. one active-rig card,
3. one fleet card per current rig,
4. one detail pane for the selected rig,
5. one consistent accessibility/focus contract,
6. one obvious path back to the shell.

## Open questions

- Should the roster be a workshop wall, a tablet, a clipboard, or a blend?
- Should parked rigs be grouped by location, capability, or story role?
- Should the roster eventually feed the Contract Board with fleet-aware context?
- Should the garage become mobile later, or remain a stable home-space?
- Should a future relationship layer be surfaced on the same roster or in a
  different social sheet?

## Anything else?

Yes. The fleet sheet is where "I found a machine" becomes "I have a history
with this machine." The roster should make that continuity legible.

## Addendum (2026-07-28) - the roster remains a projection, but the runtime already exposes the public state it needs

- Re-checked the live runtime shape against the current shell / workshop / fleet
  documentation trail.
- The roster still does **not** exist as a separate authority:
  - no garage save structure,
  - no roster-owned mutation path,
  - no hidden inventory model.
- The current runtime already exposes enough public state for a read-only first
  slice:
  - `publicState.activeRigId`,
  - `publicState.activeRig`,
  - `publicState.rigs`,
  - `publicState.progression.workshopInReach`,
  - `publicState.progression.workshopActionable`,
  - `publicState.progression.recovery`,
  - `publicState.sites`,
  - `publicState.worldMemory`.
- That means the correct next roster step is presentation, not authority:
  - the roster should read the current state and explain the fleet,
  - it should not invent a second garage model,
  - it should not require new save data before the first useful slice.
- The missing product proof is still a read-only garage/fleet overlay with a
  clear focus path and visible active-rig context, not more backend storage.

## Addendum (2026-07-28) - shell reuse and focus remain the next proof

The shell spec already frames the roster as a major overlay rather than a
separate page. Rechecking the live runtime and current shell documentation
keeps the next proof boundary clear:

- the roster should reuse the unified overlay manager from the shell slice,
- it should inherit the same focus-trap and escape/close behavior as the other
  major overlays,
- it should keep the active rig visually and semantically primary,
- it should remain read-only in the first slice and derive from public state,
- it should not introduce a parallel garage authority or a second fleet model.

That means the next roster slice is still presentation plus focus behavior,
not more state plumbing. The current public state is sufficient for that
proof; the missing work is a usable overlay that explains the fleet without
owning it.

Evidence tier: Tier 1 static source inspection plus runtime-shape recheck.

## Addendum (2026-07-28) - the garage/fleet roster is still spec-only in runtime

- Source inspection of `src/` still finds no dedicated garage/fleet overlay or
  `openGarage` runtime action.
- The runtime does expose fleet memory and recovery state, but those are not
  the same as a read-only roster surface:
  - `publicState.activeRigId`,
  - `publicState.activeRig`,
  - `publicState.rigs`,
  - `publicState.progression.recovery`,
  - `publicState.worldMemory`.
- That means the roster still exists as a projection contract, not as a live
  overlay. The next proof is presentation plus focus behavior, not more state
  plumbing.

## Addendum (2026-07-28) - live browser proof confirms the roster is still absent from the shell

- Re-checked the canonical browser surface at `http://localhost:4173/`.
- The public DOM sweep found no garage overlay, fleet roster, or `openGarage`
  entry in the visible shell.
- The only current fleet-adjacent public state remains the read-only data
  exposed through the simulation and progression model, which is enough for a
  projection but not for a mounted roster.
- That means the next proof slice is still a shell-mounted roster with focus
  behavior, not more fleet data shape.
- Evidence depth: Tier 4 live browser inspection plus Tier 1 source inspection.

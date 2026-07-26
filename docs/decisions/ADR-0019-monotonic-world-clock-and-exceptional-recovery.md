# ADR-0019 — Monotonic world clock and exceptional recovery

- Date: 2026-07-26
- Status: Accepted and implemented
- Owner: Rigs Unbound runtime
- Related work: RU-0106 through RU-0109

## Update log

- 2026-07-26 — Accepted and implemented as the state-contract repair for the
  four P0 fresh-eyes defects. The decision preserves the canonical Rig and
  capability model while assigning schema v5 to clock/recovery state.

## Context

The first fresh-eyes playtests exposed two state-contract failures. Presentation
combined an activity timer with phase-specific clock offsets, so displayed time
could jump backward or remain in Gloam. A zero-condition rig could also become a
permanent soft-lock when the player had no salvage or winch module.

The same repair pass also needed to preserve first-session integrity: the
welcome plate must gate simulation/input, and the first salvage action must be
reachable and use the canonical affordance chain.

## Decision

1. Store one absolute, monotonically increasing `worldTimeMinutes` value.
   `phase` is derived from that clock at defined day/gloam/night boundaries.
   Activity elapsed time remains a separate measurement and never drives the
   world clock.
2. Advance saves to schema v5. Valid v4 records infer their prior visible world
   time, then recover through the existing versioned chain. Recovery metadata
   is persisted with the same record.
3. Treat condition-zero recovery as an exceptional safety action, not a normal
   winch/module capability. It returns the disabled rig to Home Silo at 25%
   condition, awards no salvage, records an emergency count and timestamp, and
   cannot be repeated while the rig is operational.
4. Keep normal winch behavior capability-gated. The emergency branch does not
   grant or imply the winch capability.
5. Gate fixed-step simulation and held input behind an explicit world-entry
   state. The first authored salvage cache uses the same
   `performPrimaryAction` affordance chain as every other salvage node.

## Options considered

- Continue deriving visible time from activity elapsed time: rejected because
  unrelated clocks cannot produce a stable world contract.
- Reset the entire field on disable: rejected because it destroys world memory
  and makes recovery disproportionately punitive.
- Give every rig a free winch: rejected because it weakens capability identity.
- Award salvage during recovery: rejected because it creates an exploitable
  progression faucet.

## Consequences

- World-time presentation, phase transitions, saves, and future ecology share
  one source of truth.
- Farmfall’s crop/threat/mastery payload moves to schema v6; v5 is now owned by
  the clock/recovery contract.
- Disabled rigs do not move under solver drift.
- Keyboard, touch, and mouse recovery all route through the same semantic
  action and state transition.
- Operators can inspect how often emergency recovery occurred, but the current
  UI does not yet provide a full recovery history.

## Validation

- Tier 2: state and storage regressions cover authored salvage, canonical
  collection, immobility, non-exploitable emergency recovery, clock
  monotonicity, phase cycling, automatic transition, v4 migration, and
  save/reload.
- Tier 3/4: the visible browser acceptance run covers welcome focus/background
  gating, first salvage, full day→gloam→night→dawn cycling, reload persistence,
  keyboard/mouse/touch recovery, repeat protection, narrow layout, and zero
  console/page errors on both development and production-preview surfaces.

## Rollback and migration

Rollback remains possible because older save keys are retained. A v4 build reads
its v4 key; a v5 build prefers v5 and falls back through v4→v1. Removing v5
would require an explicit migration or loss-acceptance decision, not an in-place
rewrite.

## Revisit triggers

- Recovery needs location-aware towing, cost, cooldown, or multiplayer
  authority.
- Ecology requires time scaling, pausing, seasons, or server reconciliation.
- Recovery telemetry becomes insufficient for balancing or support.

## Next reviewer

The Farmfall implementation owner must treat schema v6 as the next additive
version and preserve the absolute-clock/recovery fields and v4→v5 migration.

## Anything else?

Yes. Browser automation proves reachability and contract behavior, not whether
the 25% limp-home recovery feels fair or whether the first-cache instruction is
memorable. Those remain explicit questions for the next fresh-eyes and human
playtests.

## Addendum (2026-07-26): schema v6 owns canonical Home berths

Schema v6 is now assigned to the first-session rig-acquisition correction.
Dependency-free canonical rig IDs are shared by gameplay contracts and authored
world data. `RIG_HOME_BERTHS` places Torque, Spark, and Drift in distinct dry,
stable, non-overlapping Home Silo service berths inside the proximity-switch
range. Fresh state and exceptional recovery read the same records.

The v5→v6 migration relocates only Drift state that is demonstrably pristine:
inactive, still at the exact legacy Sunken Flats berth, unmoved, undamaged,
unstrained, unmodified, unattached, and with no engaged tool. Any sign of player
use preserves the recorded position. Older migration paths introduce Drift at
the new canonical berth while preserving real legacy rig history.

Rollback remains versioned: v6 writes `rigs-unbound.save.v6`, reads v5 before
v4→v1, and never overwrites an older slot in place. Focused migration tests
cover selective relocation, used-rig preservation, read precedence, world
memory, and round-trip recovery.

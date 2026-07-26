# Runtime Profile Hysteresis Issue Review

Date: 2026-07-26

Status: correction implemented; Tier 2 and Tier 3 evidence still required

## Original finding (corrected in source)

Before the correction, `RuntimeProfileController.evaluate()` recorded the
original fallback sample when it first selected `mobile-safe`. A later pressure
breach updated the reason list but did not reset that sample. The recovery
window could therefore expire after only a short healthy interval following
renewed pressure.

## User and system impact

- Player impact: scenery can restore sooner than the documented stable recovery
  window after recurring renderer pressure.
- Operator impact: checkpoint reason codes remain useful, but their timing does
  not prove the stated hysteresis guarantee.
- Architecture impact: no simulation, save, input, or authority contract is
  affected. The defect is confined to adaptive visibility-profile recovery.

## Evidence

- Affected source: `src/game/runtime-profile-policy.ts`
- Affected behavior: the `activeProfile === "mobile-safe"` branch when the
  newly evaluated policy still returns `fallback`.
- Current test coverage proves one initial fallback followed by healthy recovery,
  but does not include renewed pressure after a partially elapsed recovery
  window.

## Required correction

1. Reset the controller's fallback-start sample whenever a new measured
   fallback breach occurs while `mobile-safe` is active.
2. Add a focused regression test: initial fallback -> partial healthy interval
   -> renewed breach -> shorter healthy interval must remain `mobile-safe` ->
   recovery only after the full new healthy window.
3. Correct the bootstrap/resource documents to state the verified behavior and
   remove this issue review only after focused test and browser evidence agree.

## Implementation update (2026-07-26)

- `RuntimeProfileController` now resets `fallbackStartedAtSample` whenever the
  active `mobile-safe` profile receives a new measured fallback selection.
- The controller therefore requires one uninterrupted healthy interval after
  the most recent renderer-pressure breach before restoring `standard`.
- `runtime-profile-policy.test.ts` now contains the required sequence:
  initial fallback -> partial healthy interval -> renewed breach -> insufficient
  healthy interval -> recovery only after the full renewed window.
- This update changes no simulation, save, input, or authority state; it only
  corrects renderer visibility-profile recovery timing.

## Verification status

- Tier 1: source and regression-test changes are present.
- Tier 2: not run in this session.
- Tier 3: browser pressure/recovery fixture remains unexecuted.
- Keep this review record until both evidence gates are captured; do not claim
  the runtime behavior is verified from static inspection alone.

## Acceptance evidence

- Tier 2: focused runtime-profile policy tests pass, including the renewed
  breach regression.
- Tier 3: browser fixture deliberately crosses fallback, recovers briefly,
  crosses pressure again, and shows no early scenery restoration.

## Anything else?

The right fix is local to the controller. Do not weaken the policy to a
permanent fallback or move visibility decisions into simulation to work around
this renderer-only defect.

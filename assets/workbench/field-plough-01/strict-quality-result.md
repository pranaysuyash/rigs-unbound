# Field Plough 01 — Strict Quality Result

Status: `strict spec passed; img2threejs blockout locked at refine-code`

The canonical asset definition was translated into the derived
`ObjectSculptSpec`. The strict gate passed without weakening the validator.

## Gate results

- Probe: passed; `1536x1024` PNG, technical suitability `pass`.
- Reference admission: passed; `admitted: true`.
- Pre-spec assessment: completed; complex articulated hard-surface rig part.
- Detail inventory: 12 mapped observed details.
- Painted-steel PBR extraction: passed at confidence `0.86` against threshold
  `0.70`.
- Normal sculpt-spec validation: passed with zero errors and zero warnings.
- Strict sculpt-spec validation: passed with zero errors and zero warnings.
- Generic blockout factory: generated at
  `generated/createFieldPloughModel.ts`; retained as compiler evidence but
  superseded for visual use after failing controlled reference comparison.
- Canonical authored blockout factory:
  `authored/createFieldPloughModel.ts`.
- Isolated TypeScript compilation: passed.
- GLB export: optional delivery derivative, not configured.
- Browser render/comparison review: observed from raw WebGL canvas captures;
  named viewpoints, comparison sheet, and the machine-readable fidelity review
  are checked in under `review/`.
- Tier 1 blockout diagnostics: failed on silhouette IoU `0.470 < 0.85` and
  aspect-ratio delta `0.1001 > 0.05`; scale delta passes at `0.0611 <= 0.08`.
- Divine Eye: `probe`, diagnostic fidelity `0.714`, objectness `0.6173`,
  reconstruction mode suspected.
- Multi-angle degeneration check: passed, `degenerate: false`.
- Locked-pass state: `blockout`, no completed passes. Review history records
  `refine-spec` followed by `refine-code`; no `continue` entry exists.
- Runtime adapter: open; the procedural candidate is available through the
  explicit review/factory path without changing simulation collision authority.
- Public approval: review-required, separate from development availability.

## Derived compiler command

```bash
npm run assets:build-field-plough
```

## Next refinement pass

The authored factory corrects the original preview's object-level failure and is
available for development placeholder use. It is not an accepted img2threejs
blockout. It remains below the reference in
bevels, moldboard twist, cutting-share profiles, material layering, welds,
hydraulic fittings, and rear-side detail. The visual parity decision is recorded
in `review/visual-parity-review.json`. This visual factory does not claim
photoreal hero parity, collision authority, GLB delivery, or public approval.

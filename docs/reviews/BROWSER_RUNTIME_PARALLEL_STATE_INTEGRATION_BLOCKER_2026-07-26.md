# Browser Runtime Parallel-State Integration Blocker

Date: 2026-07-26
Repository: `/Users/pranay/Projects/Game_dev/rigs-unbound`
Evidence tier: Tier 4, manual browser-daemon inspection
Status: Open blocker; do not call browser acceptance green

## Purpose

This review records the live browser evidence found while applying the 3D-web
experience and browser-validation skills. It is intentionally additive and
does not modify files currently being worked by parallel agents.

## Probe surface

- Browser daemon: `/Users/pranay/Projects/skills/testing/playwright-skill/browser-client.js`
- Browser daemon process observed: PID `42412`
- Preview route attempted: `http://127.0.0.1:4174/?acceptance=field-02`
- Dev route observed in console output: `http://127.0.0.1:4180/`
- Document state: page reached `readyState=complete`, title `Rigs Unbound`
- Viewport observed: `1280x720`

The page shell rendered, but shell rendering is not sufficient runtime proof.
The browser console contained startup, module, and asset-loading failures.

## Observed failures

### 1. Dev runtime startup failure

```text
Rigs Unbound failed to start. ReferenceError: visibleSignals is not defined
at http://127.0.0.1:4180/src/main.ts:684:20
```

### 2. Repeated undefined collection mutation

```text
PAGEERROR Cannot read properties of undefined (reading 'push')
```

The exact owning callsite must be confirmed after the active parallel edits
settle. Do not patch by guessing at the first `.push` occurrence.

### 3. Signature contract mismatch

```text
PAGEERROR The requested module '/src/game/signature.ts' does not provide an
export named 'deriveActiveRigSignature'
```

This indicates that the live import contract and the current exported API are
temporarily out of sync. The canonical export/import decision belongs to the
agent currently editing the signature and integration surfaces.

### 4. Preview asset/MIME failures

```text
ERROR Failed to load module script: Expected a JavaScript-or-Wasm module
script but the server responded with a MIME type of "text/html"
```

Observed for:

- `http://127.0.0.1:4174/assets/field-D4-Tvfn69PO.js`
- `http://127.0.0.1:4174/assets/three.module-4Pom69PO.js`

This is consistent with a stale or mismatched preview build, missing emitted
assets, or a preview server serving the wrong build directory. It is not proof
that the source is invalid, but it blocks release/runtime claims for port
`4174`.

## Interpretation

Unit tests and TypeScript checks passing do not close the browser contract. The
current evidence separates the state as follows:

| Surface | Current evidence | Status |
|---|---|---|
| Pure passage contract | Targeted Vitest tests passed | Green at Tier 2 |
| TypeScript project | `npm run typecheck` passed in the prior refresh | Green at Tier 2 |
| Full unit suite | `npm test` passed in the prior refresh | Green at Tier 2 |
| Dev browser startup | Console startup/module errors present | Blocked at Tier 4 |
| Field Test preview | MIME/asset errors present | Blocked at Tier 4 |
| Release/browser acceptance | Not claimable until clean rerun | Open |

The most likely explanation is a live parallel integration window combined
with multiple Vite servers and a stale preview artifact. This is an
interpretation, not a confirmed root cause. The errors must be rechecked after
the active files stabilize.

## Parallel ownership boundary

The following surfaces were active or modified in the live worktree and were
not edited by this probe:

- `src/main.ts`
- `src/game/renderer.ts`
- `src/game/state.ts`
- `src/game/signature.ts`
- `src/game/storage.ts`
- `tools/rig-lab-browser-acceptance.cjs`
- shared docs, plans, and evidence assets already modified by other agents

The new passage contract and its tests remain isolated from these runtime
surfaces until integration ownership is clear.

## Closure contract

The blocker is closed only when all of the following are true:

1. Active agents reconcile the `visibleSignals` startup contract.
2. The signature import/export contract is canonical and typechecked.
3. The undefined `.push` failure is traced to its owning collection and fixed
   at the root rather than suppressed.
4. A fresh isolated Vite server is started on an unused port, for example
   `4186`, from the current checkout.
5. The server returns HTTP success for the HTML entry and every emitted module
   asset requested by that entry.
6. The browser daemon navigates to the fresh server and reports no page errors
   or console errors during startup and the Field Test path.
7. The shared browser acceptance tool is rerun only after its active parallel
   edits are stable, and its evidence output is reviewed rather than assumed.
8. The result is appended to the relevant release/readiness documentation with
   command output, route, port, viewport, and remaining limitations.

## Safe next work while ownership is active

The following work can proceed without touching the active runtime files:

- keep the pure Unbound Passage contract and tests isolated;
- refine the admission/recovery acceptance matrix in a new review artifact;
- prepare an independent asset and trailer inventory;
- prepare a non-mutating browser probe script in a new tool path if needed;
- review skill guidance and map it to explicit acceptance checks;
- inspect git state and classify parallel files without staging or rewriting;
- rerun isolated pure tests only when the user or owning agent requests a
  validation refresh.

## Pass outcomes

### Pass 1: Immediate correctness

The browser shell rendered, but runtime errors prove that the end-to-end path
is not currently correct. The finding is recorded as an open blocker.

### Pass 2: Architecture and long-term viability

No runtime ownership was duplicated. The probe preserves the separation between
simulation contracts, presentation integration, and browser evidence.

### Pass 3: Rule compliance and supervision readiness

The result is explicitly tiered, distinguishes verified from inferred causes,
names the active ownership boundary, and provides a concrete closure contract.

## Decision

Do not integrate the passage into the shared runtime or announce browser
readiness from this state. Continue with isolated documentation and
non-conflicting preparation, then re-enter runtime integration after the
parallel agent reports its surfaces are stable.

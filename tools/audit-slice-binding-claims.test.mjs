import assert from "node:assert/strict";
import test from "node:test";

import {
  crossCheckDispositions,
  parseDispositionSection,
} from "./audit-slice-binding-claims.mjs";

/**
 * Build a §6-shaped markdown section.
 *
 * The parser reads the repository's real spec, so tests must not depend on that
 * file's current contents — a legitimate spec edit would otherwise break tests
 * that are supposed to be about parser behaviour. These fixtures are the same
 * shape, independently authored.
 */
function section(groups, { total = null, trailing = "" } = {}) {
  const declared =
    total ?? groups.reduce((sum, g) => sum + g.modules.length, 0);
  const body = groups
    .map(
      (g) =>
        `**${g.label} (${g.count ?? g.modules.length}):** ` +
        g.modules.map((m) => `\`${m}\``).join(", ") +
        ".",
    )
    .join("\n\n");
  return `## 6. Module dispositions (all ${declared}, explicit)\n\n${body}\n${trailing}`;
}

const states = (entries) => new Map(Object.entries(entries));

// --- parsing ---------------------------------------------------------------

test("parses each disposition group with its declared count", () => {
  const markdown = section([
    { label: "Wired by this slice", modules: ["campaign.ts", "topo-map.ts"] },
    { label: "Re-archived with named future home", modules: ["ghost.ts"] },
  ]);

  const { declaredTotal, groups } = parseDispositionSection(markdown);

  assert.equal(declaredTotal, 3);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].kind, "wired");
  assert.deepEqual(groups[0].modules, ["campaign.ts", "topo-map.ts"]);
  assert.equal(groups[1].kind, "archived");
});

test("classifies a conditional group separately from an unconditional one", () => {
  const markdown = section([
    { label: "Wired by this slice", modules: ["campaign.ts"] },
    {
      label: "Wired if the night pressure lands as designed",
      modules: ["debris-physics.ts"],
    },
  ]);

  const { groups } = parseDispositionSection(markdown);

  assert.equal(groups[0].kind, "wired");
  assert.equal(groups[1].kind, "conditional");
});

test("stops at the next heading instead of swallowing the rest of the document", () => {
  // Regression guard: an unbounded parse would pull `winch-physics.ts` in from
  // the following section and report a phantom disposition.
  const markdown = section(
    [{ label: "Wired by this slice", modules: ["campaign.ts"] }],
    {
      trailing:
        "\n## 7. Execution tranches\n\nLater prose mentioning `winch-physics.ts`.\n",
    },
  );

  const { groups } = parseDispositionSection(markdown);

  assert.deepEqual(groups[0].modules, ["campaign.ts"]);
});

test("ignores parenthetical prose between module names", () => {
  const markdown =
    "## 6. Module dispositions (all 2, explicit)\n\n" +
    "**Re-archived with named future home (2):** `ghost.ts` (async multiplayer\n" +
    "seed), `fleet-recovery.ts` + `cargo-crane.ts` (salvage verticals).\n";

  const { groups } = parseDispositionSection(markdown);

  // Three backticked modules are present despite the declared count of 2; the
  // parser reports what is listed and lets the count check flag the mismatch.
  assert.deepEqual(groups[0].modules, [
    "ghost.ts",
    "fleet-recovery.ts",
    "cargo-crane.ts",
  ]);
});

test("throws when the dispositions section is absent rather than passing vacuously", () => {
  assert.throws(
    () =>
      parseDispositionSection("# Some other document\n\nNo section here.\n"),
    /Could not find the module dispositions section/,
  );
});

// --- cross-checking --------------------------------------------------------

test("a fully consistent table produces no findings", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 2,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
      {
        label: "Re-archived with named future home",
        kind: "archived",
        declaredCount: 1,
        modules: ["cargo-crane.ts"],
      },
    ],
    moduleStates: states({
      "campaign.ts": { state: "reachable" },
      "cargo-crane.ts": { state: "unreachable", deferred: null },
    }),
    unreachablePaths: ["src/game/cargo-crane.ts"],
  });

  assert.deepEqual(findings, []);
});

test("flags a module claimed archived that the graph actually reaches", () => {
  // This is the ghost.ts case: the spec parks a module that main.ts imports.
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Re-archived with named future home",
        kind: "archived",
        declaredCount: 1,
        modules: ["ghost.ts"],
      },
    ],
    moduleStates: states({ "ghost.ts": { state: "reachable" } }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "archived-but-reachable");
  assert.equal(findings[0].module, "ghost.ts");
});

test("flags a module claimed wired that is unreachable with no recorded deferral", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["topo-map.ts"],
      },
    ],
    moduleStates: states({
      "topo-map.ts": { state: "unreachable", deferred: null },
    }),
    unreachablePaths: ["src/game/topo-map.ts"],
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "wired-but-unreachable");
});

test("a deferred wired module is a note, not a failure", () => {
  // Deferral is a recorded precondition, so the claim is pending rather than
  // wrong. Failing here would punish tracked, explained debt.
  const { findings, notes } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["signature.ts"],
      },
    ],
    moduleStates: states({
      "signature.ts": {
        state: "unreachable",
        deferred: "One real listener plus accessible player feedback.",
      },
    }),
    unreachablePaths: ["src/game/signature.ts"],
  });

  assert.deepEqual(findings, []);
  assert.equal(notes.length, 1);
  assert.equal(notes[0].kind, "wired-pending-deferral");
});

test("a wired module that is quarantined is a contradiction, not a deferral", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
    ],
    moduleStates: states({ "campaign.ts": { state: "quarantined" } }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "wired-but-quarantined");
});

test("a resolved condition is a note, not a failure", () => {
  const { findings, notes } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired if the night pressure lands as designed",
        kind: "conditional",
        declaredCount: 1,
        modules: ["debris-physics.ts"],
      },
    ],
    moduleStates: states({ "debris-physics.ts": { state: "reachable" } }),
  });

  assert.deepEqual(findings, []);
  assert.equal(notes[0].kind, "condition-resolved");
});

test("flags a disposition naming a module that does not exist", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["deleted-module.ts"],
      },
    ],
    moduleStates: states({}),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "missing-module");
});

test("flags an ambiguous basename rather than guessing which file was meant", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["state.ts"],
      },
    ],
    moduleStates: states({
      "state.ts": {
        state: "ambiguous",
        paths: ["src/game/state.ts", "src/physics-lab/state.ts"],
      },
    }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "ambiguous-module");
});

test("flags a declared count that disagrees with the modules listed", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 2,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 5,
        modules: ["campaign.ts", "topo-map.ts"],
      },
    ],
    moduleStates: states({
      "campaign.ts": { state: "reachable" },
      "topo-map.ts": { state: "reachable" },
    }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "count-mismatch");
});

test("flags a heading total that disagrees with the sum of the groups", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 25,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
    ],
    moduleStates: states({ "campaign.ts": { state: "reachable" } }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "total-mismatch");
});

test("flags the same module dispositioned under two conflicting groups", () => {
  const { findings } = crossCheckDispositions({
    declaredTotal: 2,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
      {
        label: "Re-archived with named future home",
        kind: "archived",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
    ],
    moduleStates: states({ "campaign.ts": { state: "reachable" } }),
  });

  const kinds = findings.map((f) => f.kind);
  assert.ok(kinds.includes("duplicate-disposition"));
  assert.ok(kinds.includes("archived-but-reachable"));
});

test("flags an unreachable module the table never dispositions", () => {
  // The section heading claims the list is explicit, so undispositioned
  // unreachable code is a gap in the claim, not merely missing prose.
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Wired by this slice",
        kind: "wired",
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
    ],
    moduleStates: states({ "campaign.ts": { state: "reachable" } }),
    unreachablePaths: ["src/game/orphan.ts"],
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "undispositioned-unreachable");
  assert.equal(findings[0].module, "orphan.ts");
});

test("an unrecognised group label fails loudly instead of skipping its modules", () => {
  // Silently ignoring a renamed heading would drop every module under it from
  // the audit while still reporting success.
  const { findings } = crossCheckDispositions({
    declaredTotal: 1,
    groups: [
      {
        label: "Some new bucket nobody taught the tool about",
        kind: null,
        declaredCount: 1,
        modules: ["campaign.ts"],
      },
    ],
    moduleStates: states({ "campaign.ts": { state: "reachable" } }),
  });

  assert.equal(findings.length, 1);
  assert.equal(findings[0].kind, "unknown-group");
});

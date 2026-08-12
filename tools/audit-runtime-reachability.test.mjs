import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  auditReachability,
  findStaleRegistryEntries,
  summarizeSharedBlockers,
} from "./audit-runtime-reachability.mjs";

async function fixture(files) {
  const root = await mkdtemp(join(tmpdir(), "reachability-"));
  for (const [relativePath, contents] of Object.entries(files)) {
    const absolute = join(root, relativePath);
    await mkdir(join(absolute, ".."), { recursive: true });
    await writeFile(absolute, contents, "utf8");
  }
  return root;
}

test("follows the import graph from a root HTML entry point", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts": 'import { step } from "./game/state";\nstep();\n',
    "src/game/state.ts": "export function step() {\n  return 1;\n}\n",
  });

  const report = await auditReachability({ rootDir: root });

  assert.equal(report.unreachableCount, 0);
  assert.equal(report.reachableCount, 2);
  await rm(root, { recursive: true, force: true });
});

test("reports an orphan cluster, not just directly unimported files", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts": 'import "./game/state";\n',
    "src/game/state.ts": "export const live = true;\n",
    // `weather` is imported only by `forecast`, which nothing imports.
    // A naive "has an importer" check would call `weather` reachable.
    "src/game/forecast.ts": 'import "./weather";\nexport const forecast = 1;\n',
    "src/game/weather.ts": "export const weather = 1;\n",
  });

  const report = await auditReachability({ rootDir: root });

  const orphans = report.unreachable.map((entry) => entry.path).sort();
  assert.deepEqual(orphans, ["src/game/forecast.ts", "src/game/weather.ts"]);
  await rm(root, { recursive: true, force: true });
});

test("flags a tested-but-unreachable module as tested behaviour the player cannot reach", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts": "export const boot = true;\n",
    "src/game/winch.ts": "export const winch = 1;\n",
    "src/game/winch.test.ts": 'import "./winch";\n',
  });

  const report = await auditReachability({ rootDir: root });

  assert.equal(report.unreachableCount, 1);
  assert.equal(report.unreachable[0].path, "src/game/winch.ts");
  assert.equal(
    report.unreachable[0].hasTest,
    true,
    "a test importer must not confer runtime reachability",
  );
  await rm(root, { recursive: true, force: true });
});

test("ignores ambient declaration files", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts": "export const boot = true;\n",
    "src/types/wasm.d.ts": "declare module 'wasm';\n",
  });

  const report = await auditReachability({ rootDir: root });

  assert.equal(report.unreachableCount, 0);
  await rm(root, { recursive: true, force: true });
});

test("counts a dynamic import as a reachability edge", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts":
      'const later = () => import("./game/lazy");\nexport { later };\n',
    "src/game/lazy.ts": "export const lazy = 1;\n",
  });

  const report = await auditReachability({ rootDir: root });

  assert.equal(report.unreachableCount, 0);
  await rm(root, { recursive: true, force: true });
});

test("does not let an archived docs preview confer reachability", async () => {
  const root = await fixture({
    "index.html": '<script type="module" src="/src/main.ts"></script>',
    "src/main.ts": "export const boot = true;\n",
    "docs/research/assets/preview/index.html":
      '<script type="module" src="/src/game/archived.ts"></script>',
    "src/game/archived.ts": "export const archived = 1;\n",
  });

  const report = await auditReachability({ rootDir: root });

  assert.equal(report.unreachableCount, 1);
  assert.equal(report.unreachable[0].path, "src/game/archived.ts");
  await rm(root, { recursive: true, force: true });
});

test("quarantined modules are excluded from the unreachable budget", async () => {
  // Their unreachability is intentional and permanent. Counting them would
  // create pressure to "fix" them by wiring them — the opposite of intent.
  const report = await auditReachability();
  const quarantinedInBudget = report.unreachable.filter((entry) =>
    report.quarantined.includes(entry.path),
  );
  assert.deepEqual(quarantinedInBudget, []);
});

test("the live tree has no quarantine violations", async () => {
  const report = await auditReachability();
  assert.deepEqual(
    report.quarantineViolations,
    [],
    "a module an accepted decision forbids has become reachable",
  );
});

test("deferred modules stay in the unreachable budget", async () => {
  // The asymmetry with quarantine is the whole design. Quarantine is a
  // permanent accepted decision, so excluding it is right. Deferral is
  // temporary and conditional — it is supposed to resolve — so it must keep
  // counting or the budget stops applying pressure exactly where pressure is
  // still wanted. If deferral also bought an exemption, this map would be an
  // escape hatch and the budget would stop meaning anything.
  const report = await auditReachability();
  assert.ok(report.deferred.length > 0, "fixture requires a deferred module");

  for (const entry of report.deferred) {
    assert.ok(
      report.unreachable.some((row) => row.path === entry.path),
      `${entry.path} is deferred but was dropped from the budget`,
    );
  }
});

test("every deferred module carries a precondition and a rationale", async () => {
  // An entry without a stated precondition is not a deferral, it is an excuse:
  // nothing says what would unblock it, so nothing can ever discharge it.
  const report = await auditReachability();
  for (const entry of report.deferred) {
    assert.ok(
      entry.precondition && entry.precondition.length > 0,
      `${entry.path} has no precondition`,
    );
    assert.ok(
      entry.rationale && entry.rationale.length > 0,
      `${entry.path} has no rationale`,
    );
  }
});

test("the unreachable report annotates which modules are deferred", async () => {
  const report = await auditReachability();
  const deferredPaths = new Set(report.deferred.map((entry) => entry.path));
  for (const row of report.unreachable) {
    assert.equal(
      Boolean(row.deferred),
      deferredPaths.has(row.path),
      `${row.path} deferral annotation disagrees with the registry`,
    );
  }
});

test("the live registries are not stale", async () => {
  const report = await auditReachability();
  assert.deepEqual(
    report.staleRegistryEntries,
    [],
    "a registry entry names a missing module, or a deferred module was wired",
  );
});

test("a registry entry naming a missing module is stale", () => {
  // The detector is tested directly rather than through a fixture tree,
  // because the registries name paths in this repository — any fixture root
  // would report every entry as stale and prove nothing.
  const stale = findStaleRegistryEntries({
    knownPaths: ["src/game/real.ts"],
    reachablePaths: [],
    quarantined: ["src/game/deleted.ts"],
    deferred: [],
  });

  assert.equal(stale.length, 1);
  assert.equal(stale[0].path, "src/game/deleted.ts");
  assert.equal(stale[0].registry, "QUARANTINED");
  assert.match(stale[0].reason, /does not exist/);
});

test("a deferred module that became reachable is stale", () => {
  // The failure this prevents: someone meets the precondition and wires the
  // module, but leaves the entry behind. The registry then claims wiring is
  // blocked by a precondition that was already met — folklore that outlives
  // the fact it described.
  const stale = findStaleRegistryEntries({
    knownPaths: ["src/game/wired.ts"],
    reachablePaths: ["src/game/wired.ts"],
    quarantined: [],
    deferred: ["src/game/wired.ts"],
  });

  assert.equal(stale.length, 1);
  assert.equal(stale[0].registry, "DEFERRED");
  assert.match(stale[0].reason, /precondition was met/);
});

test("a blocker shared by two deferrals is grouped with a line total", () => {
  // The question a flat precondition list cannot answer: which single missing
  // capability is holding back the most code? Free-text preconditions state the
  // same gap in different words, so the shared cause stays invisible.
  const groups = summarizeSharedBlockers(
    new Map([
      ["a.ts", { sharedBlocker: "missing-light-state" }],
      ["b.ts", { sharedBlocker: "missing-light-state" }],
    ]),
    [
      { path: "a.ts", lines: 56 },
      { path: "b.ts", lines: 91 },
    ],
  );

  assert.equal(groups.length, 1);
  assert.equal(groups[0].blocker, "missing-light-state");
  assert.deepEqual(groups[0].paths, ["a.ts", "b.ts"]);
  assert.equal(groups[0].lines, 147);
});

test("a blocker unique to one module is not promoted to a shared blocker", () => {
  // Promoting it would restate that module's own precondition under a second
  // heading, padding the report without adding information.
  assert.deepEqual(
    summarizeSharedBlockers(
      new Map([
        ["a.ts", { sharedBlocker: "only-i-need-this" }],
        ["b.ts", { sharedBlocker: null }],
      ]),
      [
        { path: "a.ts", lines: 10 },
        { path: "b.ts", lines: 20 },
      ],
    ),
    [],
  );
});

test("shared blocker line totals count only what is still in the budget", () => {
  // Totals come from the unreachable rows, not the registry. A module that was
  // wired but whose entry lingers must not inflate the figure — the stale-entry
  // check will fail the audit for it, and until someone fixes that the number
  // still has to describe reality.
  const groups = summarizeSharedBlockers(
    new Map([
      ["wired.ts", { sharedBlocker: "shared" }],
      ["still-blocked.ts", { sharedBlocker: "shared" }],
    ]),
    [{ path: "still-blocked.ts", lines: 40 }],
  );

  assert.equal(groups[0].lines, 40, "a wired module must not add lines");
});

test("the live shared-blocker groups agree with the registry", async () => {
  const report = await auditReachability();
  const byPath = new Map(
    report.deferred.map((entry) => [entry.path, entry.sharedBlocker]),
  );

  for (const group of report.sharedBlockers) {
    assert.ok(
      group.paths.length > 1,
      `${group.blocker} was promoted with a single module`,
    );
    for (const path of group.paths) {
      assert.equal(
        byPath.get(path),
        group.blocker,
        `${path} is grouped under a blocker it does not declare`,
      );
    }
  }
});

test("a correctly-registered deferred module is not stale", () => {
  assert.deepEqual(
    findStaleRegistryEntries({
      knownPaths: ["src/game/blocked.ts"],
      reachablePaths: [],
      quarantined: [],
      deferred: ["src/game/blocked.ts"],
    }),
    [],
  );
});

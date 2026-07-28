import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { auditReachability } from "./audit-runtime-reachability.mjs";

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

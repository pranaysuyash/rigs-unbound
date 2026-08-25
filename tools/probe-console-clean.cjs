#!/usr/bin/env node
/**
 * Probe: does the game boot with a clean console (no deprecation warnings)?
 *
 * Exists for S2 evidence of the PCFSoftShadowMap -> PCFShadowMap fix
 * (renderer.ts). Loads the live game on canonical port 4173, drives it into
 * the world, and fails if any console message matches /deprecated/i.
 */

const { chromium } = require(
  process.env.RIGS_PLAYWRIGHT_MODULE ||
    "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright",
);

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const hits = [];
  page.on("console", (msg) => {
    if (/deprecated/i.test(msg.text())) hits.push(msg.text());
  });
  page.on("pageerror", (err) => hits.push(`PAGEERROR: ${err.message}`));

  await page.goto("http://localhost:4173/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  // Enter the world so the renderer and shadow map actually initialize.
  const enter = page
    .locator("button", { hasText: /enter|start|begin/i })
    .first();
  if (await enter.count()) {
    await enter.click().catch(() => {});
    await page.waitForTimeout(3000);
  }
  await page.waitForTimeout(2000);

  console.log(
    hits.length ? "FAIL — deprecation/page errors:" : "PASS — clean console",
  );
  for (const h of hits) console.log("  ", h);
  await browser.close();
  process.exitCode = hits.length ? 1 : 0;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

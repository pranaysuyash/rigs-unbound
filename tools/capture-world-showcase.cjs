/**
 * Capture a clean showcase pass over every authored site.
 *
 * Build-in-public needs the same shots again every time the world changes: each
 * place seen from its approach, in daylight, with and without the HUD. Producing
 * them by hand is how a project ends up illustrated by whatever screenshot someone
 * happened to take, so this is a tool rather than a one-off.
 *
 * It starts its own Vite server on an unused port instead of reusing a long-running
 * one, because a dev server that has been up for hours can serve a stale module
 * graph and the whole point of a showcase pass is that it shows current code.
 *
 * Output: docs/reviews/assets/showcase/<site>-{world,hud}.png
 *
 *   node tools/capture-world-showcase.cjs
 */

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 20, label: "world showcase capture" });

const PORT = Number(process.env.RIGS_SHOWCASE_PORT || 5211);
const OUT_DIR = path.resolve(__dirname, "../docs/reviews/assets/showcase");
const VIEWPORT = { width: 1440, height: 810 };

/** Distance to stand back from a site centre, in metres. */
const APPROACH = 42;

async function waitForServer(url, attempts = 40) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url);
      if (response.ok) return true;
    } catch {
      // Server not up yet.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const vite = spawn("npx", ["vite", "--port", String(PORT), "--strictPort"], {
    cwd: path.resolve(__dirname, ".."),
    stdio: "pipe",
  });
  vite.stderr.on("data", (chunk) => process.stderr.write(String(chunk)));

  const url = `http://127.0.0.1:${PORT}/`;
  if (!(await waitForServer(url))) {
    vite.kill("SIGTERM");
    throw new Error(`Vite never became ready on ${PORT}`);
  }

  const browser = await chromium.launch({ channel: "chrome", headless: true });
  let page;
  const written = [];

  try {
    page = await browser.newPage({ viewport: VIEWPORT });

    // A cleared store boots the world at its authored morning rather than whatever
    // time the last session left behind, so every pass is comparable to the last.
    await page.addInitScript(() => {
      try {
        window.localStorage.clear();
      } catch {
        // Storage unavailable; the default seed still boots.
      }
    });

    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });

    await page.goto(url, { waitUntil: "load" });
    await page.waitForFunction(() => typeof window.placeRig === "function", {
      timeout: 30_000,
    });

    await page.evaluate(() => {
      const enter = Array.from(document.querySelectorAll("button")).find(
        (button) => /enter the field/i.test(button.textContent ?? ""),
      );
      enter?.click();
    });
    await page.waitForTimeout(1200);

    const sites = await page.evaluate(
      () => JSON.parse(window.render_game_to_text()).sites,
    );

    for (const site of sites) {
      // Stand back along +Z and look at the place, so the landmark is in frame
      // rather than behind the camera.
      await page.evaluate(
        ({ site, approach }) => {
          window.placeRig(site.x, site.z - approach, 0);
          window.restoreActiveRigForAcceptance?.();
        },
        { site, approach: APPROACH },
      );
      // Let the suspension settle and the camera boom catch up.
      await page.waitForTimeout(1400);

      const hudPath = path.join(OUT_DIR, `${site.id}-hud.png`);
      await page.screenshot({ path: hudPath });
      written.push(hudPath);

      await page.evaluate(() => {
        const canvas = document.getElementById("game-canvas");
        document.querySelectorAll("#game-shell > *, body > *").forEach((el) => {
          if (el !== canvas && !el.contains(canvas)) {
            el.setAttribute("data-showcase-hidden", "1");
            el.style.display = "none";
          }
        });
      });
      await page.waitForTimeout(400);

      const worldPath = path.join(OUT_DIR, `${site.id}-world.png`);
      await page.screenshot({ path: worldPath });
      written.push(worldPath);

      await page.evaluate(() => {
        document.querySelectorAll("[data-showcase-hidden]").forEach((el) => {
          el.style.display = "";
          el.removeAttribute("data-showcase-hidden");
        });
      });

      process.stdout.write(`captured ${site.id} (${site.name})\n`);
    }

    if (consoleErrors.length > 0) {
      process.stderr.write(
        `\nconsole errors during capture:\n  ${consoleErrors.join("\n  ")}\n`,
      );
    } else {
      process.stdout.write("\nno console errors during capture\n");
    }
  } finally {
    // Independent closes: a failure in one must not strand the others.
    await page?.close().catch(() => {});
    await browser.close().catch(() => {});
    vite.kill("SIGTERM");
  }

  process.stdout.write(`\n${written.length} files in ${OUT_DIR}\n`);
}

main().catch((error) => {
  process.stderr.write(`${String(error?.stack ?? error)}\n`);
  process.exit(1);
});

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);
const { spawnSync } = require("node:child_process");
const path = require("node:path");

const { armWatchdog } = require("./browser-watchdog.cjs");

armWatchdog({
  minutes: 10,
  label: "shell accessibility acceptance",
});

const TARGET_URL =
  process.env.RIGS_ACCESSIBILITY_URL ||
  "http://127.0.0.1:4173/?proof=1";

const VIEWPORT = {
  width: Number(process.env.RIGS_ACCESSIBILITY_WIDTH || 390),
  height: Number(process.env.RIGS_ACCESSIBILITY_HEIGHT || 844),
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function ensureCanonicalDevServer() {
  if (process.env.RIGS_ACCESSIBILITY_AUTOSTART !== "1") return;
  const startResult = spawnSync(process.execPath, [
    path.resolve(__dirname, "start-canonical-dev-server.cjs"),
  ], {
    encoding: "utf8",
    stdio: "pipe",
  });
  if (startResult.status !== 0) {
    throw new Error(
      `Failed to start canonical dev server:\n${startResult.stdout || ""}${startResult.stderr || ""}`,
    );
  }
}

function nodeName(node) {
  return node?.name?.value ?? null;
}

function nodeRole(node) {
  return node?.role?.value ?? null;
}

function luminance(channel) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function contrastRatio(rgbA, rgbB) {
  const l1 =
    0.2126 * luminance(rgbA[0]) +
    0.7152 * luminance(rgbA[1]) +
    0.0722 * luminance(rgbA[2]);
  const l2 =
    0.2126 * luminance(rgbB[0]) +
    0.7152 * luminance(rgbB[1]) +
    0.0722 * luminance(rgbB[2]);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function collectAccessibleHits(nodes, wantedNames) {
  return nodes
    .filter((node) => wantedNames.has(nodeName(node)))
    .map((node) => ({
      role: nodeRole(node),
      name: nodeName(node),
      ignored: Boolean(node.ignored),
      nodeId: node.nodeId,
    }));
}

(async () => {
  ensureCanonicalDevServer();
  const browser = await chromium.launch({
    channel: "chrome",
    headless: process.env.RIGS_ACCESSIBILITY_HEADFUL === "1" ? false : true,
  });
  const context = await browser.newContext({
    viewport: VIEWPORT,
  });
  const page = await context.newPage();
  const consoleProblems = [];

  page.on("console", (message) => {
    if (message.type() === "error" || message.type() === "warning") {
      consoleProblems.push(`${message.type()}: ${message.text()}`);
    }
  });
  page.on("pageerror", (error) =>
    consoleProblems.push(`pageerror: ${error.message}`),
  );

  try {
    await page.goto(TARGET_URL, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("#profile-status");
    await page.waitForSelector("#save-status");

    const domState = await page.evaluate(() => {
      const profile = document.querySelector("#profile-status");
      const save = document.querySelector("#save-status");
      const diagnostics = document.querySelector("#runtime-diagnostics");
      const profileBox = profile?.getBoundingClientRect();
      const saveBox = save?.getBoundingClientRect();
      const visibleBox = (rect) =>
        Boolean(rect && rect.width > 0 && rect.height > 0);
      const parseColor = (value) => {
        const match = value
          .replace(/\s+/g, "")
          .match(/^rgba?\((\d+),(\d+),(\d+)(?:,([0-9.]+))?\)$/i);
        if (!match) {
          throw new Error(`Unsupported color format: ${value}`);
        }
        return [
          Number(match[1]),
          Number(match[2]),
          Number(match[3]),
          Number(match[4] ?? 1),
        ];
      };
      const blend = (fg, bg) => {
        const alpha = fg[3];
        return [
          Math.round(fg[0] * alpha + bg[0] * (1 - alpha)),
          Math.round(fg[1] * alpha + bg[1] * (1 - alpha)),
          Math.round(fg[2] * alpha + bg[2] * (1 - alpha)),
        ];
      };
      const solidBackground = (element) => {
        let current = element;
        while (current) {
          const style = getComputedStyle(current);
          const background = style.backgroundColor;
          if (background && background !== "rgba(0, 0, 0, 0)" && background !== "transparent") {
            return parseColor(background);
          }
          current = current.parentElement;
        }
        return parseColor(getComputedStyle(document.body).backgroundColor);
      };
      const computeContrast = (element) => {
        const style = getComputedStyle(element);
        const fg = parseColor(style.color);
        const bg = solidBackground(element);
        const effectiveFg =
          fg[3] < 1 ? blend(fg, bg) : [fg[0], fg[1], fg[2]];
        const l1 =
          0.2126 *
            (effectiveFg[0] / 255 <= 0.03928
              ? effectiveFg[0] / 255 / 12.92
              : ((effectiveFg[0] / 255 + 0.055) / 1.055) ** 2.4) +
          0.7152 *
            (effectiveFg[1] / 255 <= 0.03928
              ? effectiveFg[1] / 255 / 12.92
              : ((effectiveFg[1] / 255 + 0.055) / 1.055) ** 2.4) +
          0.0722 *
            (effectiveFg[2] / 255 <= 0.03928
              ? effectiveFg[2] / 255 / 12.92
              : ((effectiveFg[2] / 255 + 0.055) / 1.055) ** 2.4);
        const l2 =
          0.2126 *
            (bg[0] / 255 <= 0.03928
              ? bg[0] / 255 / 12.92
              : ((bg[0] / 255 + 0.055) / 1.055) ** 2.4) +
          0.7152 *
            (bg[1] / 255 <= 0.03928
              ? bg[1] / 255 / 12.92
              : ((bg[1] / 255 + 0.055) / 1.055) ** 2.4) +
          0.0722 *
            (bg[2] / 255 <= 0.03928
              ? bg[2] / 255 / 12.92
              : ((bg[2] / 255 + 0.055) / 1.055) ** 2.4);
        const lighter = Math.max(l1, l2);
        const darker = Math.min(l1, l2);
        return {
          ratio: (lighter + 0.05) / (darker + 0.05),
          foreground: effectiveFg,
          background: bg,
        };
      };

      return {
        url: location.href,
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        profileText: profile?.textContent?.trim() ?? "",
        saveText: save?.textContent?.trim() ?? "",
        profileRole: profile?.getAttribute("role"),
        profileLive: profile?.getAttribute("aria-live"),
        saveRole: save?.getAttribute("role"),
        saveLive: save?.getAttribute("aria-live"),
        saveAtomic: save?.getAttribute("aria-atomic"),
        diagnosticsHidden: diagnostics?.hidden ?? null,
        profileVisible:
          Boolean(profile) &&
          getComputedStyle(profile).display !== "none" &&
          getComputedStyle(profile).visibility !== "hidden" &&
          visibleBox(profileBox),
        saveVisible:
          Boolean(save) &&
          getComputedStyle(save).display !== "none" &&
          getComputedStyle(save).visibility !== "hidden" &&
          visibleBox(saveBox),
        profileContrast: profile ? computeContrast(profile) : null,
        saveContrast: save ? computeContrast(save) : null,
        overlap:
          profileBox && saveBox
            ? !(
                profileBox.bottom <= saveBox.top ||
                saveBox.bottom <= profileBox.top ||
                profileBox.right <= saveBox.left ||
                saveBox.right <= profileBox.left
              )
            : null,
      };
    });

    const client = await context.newCDPSession(page);
    const { nodes } = await client.send("Accessibility.getFullAXTree");
    const wantedNames = new Set([domState.profileText, domState.saveText]);
    const hits = collectAccessibleHits(nodes, wantedNames);

    assert(domState.profileVisible, "Profile status is not visible in DOM");
    assert(domState.saveVisible, "Save status is not visible in DOM");
    assert(domState.diagnosticsHidden === true, "Diagnostics surface should stay hidden");
    assert(
      domState.profileRole === "status" && domState.profileLive === "polite",
      `Profile status lost its announcement contract: ${JSON.stringify({
        role: domState.profileRole,
        live: domState.profileLive,
      })}`,
    );
    assert(
      domState.saveRole === "status" &&
        domState.saveLive === "polite" &&
        domState.saveAtomic === "true",
      `Save status lost its announcement contract: ${JSON.stringify({
        role: domState.saveRole,
        live: domState.saveLive,
        atomic: domState.saveAtomic,
      })}`,
    );
    assert(
      domState.overlap === false,
      `Status bands overlap in the mobile shell: ${JSON.stringify(domState)}`,
    );
    assert(
      domState.profileContrast?.ratio >= 4.5,
      `Profile contrast is too low: ${JSON.stringify(domState.profileContrast)}`,
    );
    assert(
      domState.saveContrast?.ratio >= 4.5,
      `Save contrast is too low: ${JSON.stringify(domState.saveContrast)}`,
    );
    assert(
      hits.some((hit) => hit.name === domState.profileText && !hit.ignored),
      `Profile line missing from accessibility tree: ${JSON.stringify({
        profileText: domState.profileText,
        hits,
      })}`,
    );
    assert(
      hits.some((hit) => hit.name === domState.saveText && !hit.ignored),
      `Save line missing from accessibility tree: ${JSON.stringify({
        saveText: domState.saveText,
        hits,
      })}`,
    );

    const result = {
      url: domState.url,
      viewport: VIEWPORT,
      profile: {
        text: domState.profileText,
        role: domState.profileRole,
        live: domState.profileLive,
        visible: domState.profileVisible,
      },
      save: {
        text: domState.saveText,
        role: domState.saveRole,
        live: domState.saveLive,
        atomic: domState.saveAtomic,
        visible: domState.saveVisible,
      },
      diagnosticsHidden: domState.diagnosticsHidden,
      overlap: domState.overlap,
      accessibilityHits: hits,
      consoleProblems,
    };

    console.log(JSON.stringify(result, null, 2));
    const ok = consoleProblems.length === 0;
    process.exit(ok ? 0 : 1);
  } catch (error) {
    console.error(String(error && error.stack ? error.stack : error));
    console.error(
      JSON.stringify(
        {
          consoleProblems,
        },
        null,
        2,
      ),
    );
    process.exit(1);
  } finally {
    await Promise.race([
      browser.close(),
      new Promise((resolve) =>
        setTimeout(() => {
          console.warn("Chrome teardown exceeded 5 seconds.");
          resolve();
        }, 5000),
      ),
    ]);
  }
})();

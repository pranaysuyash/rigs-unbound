/**
 * Trailer capture: records a scripted cinematic run of Rigs Unbound to video.
 *
 * Usage:
 *   node tools/capture-trailer.cjs
 *   RIGS_UNBOUND_URL=http://127.0.0.1:4174/ node tools/capture-trailer.cjs
 *   RIGS_TRAILER_HEADLESS=1 node tools/capture-trailer.cjs
 *
 * Output (in docs/comms/assets/):
 *   trailer-raw.webm   Playwright's capture
 *   trailer.mp4        H.264, social-ready (requires ffmpeg)
 *   trailer.gif        short loop of the plough-trail beat (requires ffmpeg)
 *
 * ## Why this drives the keyboard instead of the test hooks
 *
 * The acceptance harness uses `window.applyRigInput(...)`, which fast-forwards the
 * fixed step and renders one frame at the end. That is exactly right for asserting
 * behaviour and exactly wrong for video: it produces a slideshow. This script holds
 * real keys down and lets real time pass, so the requestAnimationFrame loop renders
 * every frame and the motion is smooth.
 *
 * `window.placeRig` is still used, but only between beats, where a jump cut is
 * wanted anyway. Crossing 500 m of terrain in a tractor at 11 m/s is not footage.
 *
 * ## How the video is captured
 *
 * This is an **offline render**, not a realtime screen recording.
 *
 * Two realtime approaches were tried and rejected. Playwright's `recordVideo` needs
 * Playwright's own bundled ffmpeg as a separate download. Driving Chrome's
 * `Page.startScreencast` directly avoided that, but Chrome throttles rendering for
 * occluded windows and it produced 2.4 fps — fine for a UI walkthrough, useless for
 * a vehicle in motion.
 *
 * So instead: the kernel is deterministic, and `applyRigInput(input, ms)` advances
 * the fixed step *and* renders. Advancing exactly 1/30 s per screenshot therefore
 * produces frame-accurate 30 fps output no matter how slowly the capture runs. It
 * takes a few minutes of wall clock to make ~40 s of perfectly smooth video.
 *
 * ## Which browser
 *
 * Uses the system-installed Google Chrome through Playwright's `channel` option,
 * so no browser download is required. Playwright creates a clean temporary profile;
 * the user's own Chrome profile, sessions, and cookies are never touched.
 *
 * ## Why headful by default
 *
 * WebGL under headless Chromium usually falls back to a software rasteriser, which
 * both looks worse and drops frames. Headful uses the real GPU. Set
 * `RIGS_TRAILER_HEADLESS=1` if you need it to run without a display and accept the
 * quality cost.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

const TARGET_URL =
  process.env.RIGS_UNBOUND_URL ||
  "https://rigs-unbound.suyashpranay.chatgpt.site/";

const OUTPUT_DIR = path.resolve(__dirname, "../docs/comms/assets");
const WIDTH = 1280;
const HEIGHT = 720;

/** Beat log, printed at the end so a failed run says which beat it died on. */
const beats = [];

function note(label) {
  beats.push(label);
  process.stdout.write(`  · ${label}\n`);
}

/** Hold a set of keys for a duration, in real time, so frames actually render. */
async function hold(page, keys, ms) {
  for (const key of keys) await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  for (const key of keys) await page.keyboard.up(key);
}

async function readState(page) {
  return page.evaluate(() => JSON.parse(window.render_game_to_text()));
}

/**
 * Point the rig at a target and settle, without moving it.
 *
 * Used before a driving beat so the camera opens on a good line instead of
 * spending the first two seconds turning around.
 */
async function face(page, x, z) {
  await page.evaluate(
    ([tx, tz]) => {
      const s = JSON.parse(window.render_game_to_text());
      const rig = s.activeRig;
      // Heading 0 faces +Z; this matches the kernel's forward vector.
      const heading = Math.atan2(tx - rig.x, tz - rig.z);
      window.placeRig(rig.x, rig.z, heading);
    },
    [x, z],
  );
}

/** Find real terrain matching a predicate, so beats survive world retuning. */
async function findGround(page, predicate) {
  return page.evaluate((source) => {
    const test = new Function("probe", `return (${source})(probe);`);
    for (let index = 1; index < 6000; index += 1) {
      const angle = index * 2.399963;
      const radius = Math.sqrt(index / 6000) * 175;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      window.placeRig(x, z);
      const s = JSON.parse(window.render_game_to_text());
      const probe = {
        x,
        z,
        surface: s.activeRig.terrain.surface,
        grade: s.activeRig.terrain.grade,
        grip: s.activeRig.terrain.grip,
        water: s.activeRig.terrain.waterDepth,
      };
      if (test(probe)) return { x, z, ...probe };
    }
    return null;
  }, predicate.toString());
}

/** Target frame interval for offline rendering, in ms. 30 fps. */
const FRAME_MS = 1000 / 30;

const NONE = {};
const GO = { accelerate: true };
const GO_LEFT = { accelerate: true, steerLeft: true };
const GO_RIGHT = { accelerate: true, steerRight: true };
const BACK = { brake: true };

/**
 * The storyboard, as data.
 *
 * Each segment optionally runs `before` once, then advances the simulation by
 * exactly `FRAME_MS` per captured frame with `input` held. Because the kernel is
 * deterministic and `applyRigInput` steps *and* renders, the resulting sequence is
 * frame-accurate 30 fps regardless of how slowly the capture actually runs.
 *
 * This is an offline render, not a realtime recording. It exists because Chrome's
 * compositor throttles occluded windows, which produced a 2.4 fps screencast — fine
 * for a UI walkthrough, useless for a vehicle in motion.
 */
function storyboard(ground) {
  return [
    { label: "title plate", ms: 1600, input: NONE, step: false },
    {
      label: "establish",
      ms: 2600,
      input: GO,
      before: async (page) => {
        // Dispatch directly rather than hit-testing: an overlay above the welcome
        // plate makes Playwright's actionability check spin until timeout, and the
        // trailer only needs the panel dismissed, not a real pointer path.
        await page.evaluate(() => {
          document.getElementById("enter-world")?.click();
        });
        await page.evaluate(() => window.selectCamera("chase"));
      },
    },
    { label: "curve away", ms: 1600, input: GO_LEFT },
    {
      label: "plough down",
      ms: 2600,
      input: GO,
      before: async (page) => {
        if (ground.field) {
          await page.evaluate(
            ([x, z]) => window.placeRig(x, z, 0),
            [ground.field.x, ground.field.z],
          );
        }
        await engagePlough(page);
      },
    },
    { label: "long right arc", ms: 3000, input: GO_RIGHT },
    { label: "long left arc", ms: 2600, input: GO_LEFT },
    {
      label: "world memory, top-down",
      ms: 3000,
      input: GO,
      before: async (page) =>
        page.evaluate(() => window.selectCamera("top-down")),
    },
    {
      label: "the hill wins",
      ms: 3400,
      input: GO,
      before: async (page) => {
        await page.evaluate(() => window.selectCamera("chase"));
        if (ground.steep) {
          await page.evaluate(
            ([x, z, h]) => window.placeRig(x, z, h),
            [ground.steep.x, ground.steep.z, ground.steep.uphill],
          );
        }
      },
    },
    { label: "back off", ms: 1400, input: BACK },
    { label: "the run-up", ms: 3400, input: GO },
    {
      label: "the marsh takes the tractor",
      ms: 3400,
      input: GO,
      before: async (page) => {
        if (ground.marsh) {
          await page.evaluate(
            ([x, z]) => window.placeRig(x, z, 0),
            [ground.marsh.x, ground.marsh.z],
          );
        }
      },
    },
    {
      label: "same ground, different machine",
      ms: 3400,
      input: GO,
      before: async (page) => {
        // Rig switching is now proximity-gated, so bring the tractor to the
        // buggy before swapping, then take the buggy to the marsh.
        await page.evaluate(() => {
          const s = JSON.parse(window.render_game_to_text());
          const buggy = s.rigs["toy-buggy"];
          window.placeRig(buggy.x, buggy.z);
          window.selectRig("toy-buggy");
        });
        if (ground.marsh) {
          await page.evaluate(
            ([x, z]) => window.placeRig(x, z, 0),
            [ground.marsh.x, ground.marsh.z],
          );
        }
      },
    },
    {
      label: "fog of war",
      ms: 2600,
      input: NONE,
      step: false,
      before: async (page) => page.evaluate(() => window.toggleFieldMap()),
    },
    {
      label: "survey out",
      ms: 2800,
      input: GO,
      before: async (page) =>
        page.evaluate(() => {
          window.toggleFieldMap();
          window.selectCamera("survey");
        }),
    },
  ];
}

/** Render the storyboard offline, one screenshot per simulated frame. */
async function renderOffline(page, frameDir, ground) {
  fs.rmSync(frameDir, { recursive: true, force: true });
  fs.mkdirSync(frameDir, { recursive: true });

  let index = 0;
  for (const segment of storyboard(ground)) {
    note(segment.label);
    if (segment.before) await segment.before(page);
    const frames = Math.max(1, Math.round(segment.ms / FRAME_MS));
    for (let frame = 0; frame < frames; frame += 1) {
      if (segment.step !== false) {
        await page.evaluate(
          ([input, ms]) => window.applyRigInput(input, ms),
          [segment.input, FRAME_MS],
        );
      }
      await page.screenshot({
        path: path.join(
          frameDir,
          `frame-${String(index).padStart(6, "0")}.jpg`,
        ),
        type: "jpeg",
        quality: 92,
      });
      index += 1;
    }
  }
  return index;
}

/**
 * Engage the plough, verifying it actually engaged.
 *
 * `performRigAction` is a single context action resolved by a priority chain:
 * release cargo, else attach cargo, else collect nearby salvage, else toggle the
 * plough. A salvage node within reach therefore swallows the first press — which
 * is correct gameplay and silently cost the first trailer its furrow trail
 * ("0 furrows, 0 deformed cells"). Press until the attachment reports engaged.
 */
async function engagePlough(page, attempts = 4) {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const engaged = await page.evaluate(() => {
      const before = JSON.parse(window.render_game_to_text());
      const plough = before.activeRig.attachments.find(
        (a) => a.id === "field-plough",
      );
      if (plough && plough.engaged) return true;
      window.performRigAction();
      const after = JSON.parse(window.render_game_to_text());
      const now = after.activeRig.attachments.find(
        (a) => a.id === "field-plough",
      );
      return Boolean(now && now.engaged);
    });
    if (engaged) return true;
  }
  process.stdout.write("  ! plough would not engage\n");
  return false;
}

/** Find the heading at a point with the steepest climb, by sampling headings. */
async function bestUphillHeading(page, x, z) {
  return page.evaluate(
    ([px, pz]) => {
      let bestHeading = 0;
      let bestGrade = -Infinity;
      for (let i = 0; i < 16; i += 1) {
        const heading = (i / 16) * Math.PI * 2;
        window.placeRig(px, pz, heading);
        const grade = JSON.parse(window.render_game_to_text()).activeRig.terrain
          .grade;
        if (grade > bestGrade) {
          bestGrade = grade;
          bestHeading = heading;
        }
      }
      return { heading: bestHeading, grade: bestGrade };
    },
    [x, z],
  );
}

/** Resolve every location the storyboard needs, once, before rendering starts. */
async function resolveGround(page) {
  // Target the authored tilled field by name rather than the first grass cell the
  // spiral scan happens to hit. The previous run ploughed a tiny isolated grass
  // patch and produced two furrows instead of a trail.
  const field = await page.evaluate(() => {
    const sites = JSON.parse(window.render_game_to_text()).sites;
    if (Array.isArray(sites)) {
      const found = sites.find((site) => site.id === "long-furrow");
      if (found) return { x: found.x, z: found.z };
    }
    return null;
  });
  const marsh = await findGround(
    page,
    (probe) => probe.surface === "mud" || probe.water > 0.15,
  );
  const steepPoint = await findGround(
    page,
    (probe) => probe.grade > 0.3 && probe.surface !== "water",
  );
  let steep = null;
  if (steepPoint) {
    const uphill = await bestUphillHeading(page, steepPoint.x, steepPoint.z);
    steep = {
      ...steepPoint,
      uphill: uphill.heading,
      uphillGrade: uphill.grade,
    };
  }
  process.stdout.write(
    `Locations — field: ${field ? "ok" : "MISSING"}, ` +
      `marsh: ${marsh ? "ok" : "MISSING"}, ` +
      `steep: ${steep ? `grade ${steep.uphillGrade.toFixed(2)}` : "MISSING"}\n`,
  );
  return { field, marsh, steep };
}

/**
 * Hard ceiling on a capture run.
 *
 * Belt and braces alongside the cleanup block: if anything still manages to keep
 * the event loop alive — a browser handle that will not close, a hung CDP call —
 * this fires and takes the process down rather than leaving it resident. `unref`
 * keeps the timer itself from extending the run.
 */
async function main() {
  const watchdog = armWatchdog({ minutes: 20, label: "trailer capture" });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const headless = process.env.RIGS_TRAILER_HEADLESS === "1";

  process.stdout.write(`Recording ${TARGET_URL}\n`);
  process.stdout.write(`Mode: ${headless ? "headless" : "headful (GPU)"}\n`);

  // Prefer the system-installed Chrome via `channel`, so this tool needs no
  // ~120 MB `playwright install` download and no bundled-browser version pinning.
  // Playwright launches a clean throwaway profile — it does not touch the user's
  // real Chrome profile, sessions, or cookies. Falls back to a bundled Chromium if
  // one happens to be installed.
  const launchOptions = {
    headless,
    args: [
      "--autoplay-policy=no-user-gesture-required",
      "--enable-gpu",
      "--use-angle=metal",
      "--hide-scrollbars",
      // Chrome throttles rendering for occluded/background windows, which starves
      // the screencast. These keep it drawing even when the window is not focused.
      "--disable-backgrounding-occluded-windows",
      "--disable-renderer-backgrounding",
      "--disable-background-timer-throttling",
      "--window-position=0,0",
    ],
  };

  let browser;
  try {
    browser = await chromium.launch({ ...launchOptions, channel: "chrome" });
    process.stdout.write("Browser: system Google Chrome\n");
  } catch (channelError) {
    process.stdout.write(
      `System Chrome unavailable (${String(channelError).slice(0, 90)}); trying bundled Chromium\n`,
    );
    browser = await chromium.launch(launchOptions);
    process.stdout.write("Browser: bundled Chromium\n");
  }

  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();
  const frameDir = path.join(
    process.env.TMPDIR || "/tmp",
    "rigs-unbound-trailer-frames",
  );
  let capturedFrames = 0;
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));

  try {
    await page.goto(TARGET_URL, { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
      {
        timeout: 60_000,
      },
    );

    // Clear any prior session so the trailer always shows a fresh field.
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        /* storage may be blocked; the run is still valid */
      }
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
      {
        timeout: 60_000,
      },
    );

    // Resolve locations BEFORE rendering, so no probe teleports appear on camera.
    const ground = await resolveGround(page);
    await page.evaluate(() => window.placeRig(0, 12, 0));

    capturedFrames = await renderOffline(page, frameDir, ground);
    process.stdout.write(`\nRendered ${capturedFrames} frames at 30 fps\n`);

    const final = await readState(page);
    process.stdout.write(
      `\nFinal state: ${final.worldMemory.furrowCount} furrows, ` +
        `${final.worldMemory.deformedCells} deformed cells, ` +
        `${Math.round(final.worldMemory.surveyedFraction * 100)}% surveyed\n`,
    );
    if (consoleErrors.length > 0) {
      process.stdout.write(
        `\nWARNING: ${consoleErrors.length} console/page errors captured:\n` +
          consoleErrors
            .slice(0, 5)
            .map((line) => `  ! ${line}\n`)
            .join(""),
      );
    } else {
      process.stdout.write("Console: clean\n");
    }
  } finally {
    // Close each resource independently and never let one failure strand the
    // browser. A leaked Playwright browser keeps node alive forever: an earlier
    // run failed during setup, skipped `browser.close()`, and sat for 14 h 41 m
    // holding an invisible Chrome while the harness reported it as exited.
    for (const [label, close] of [
      ["context", () => context.close()],
      ["browser", () => browser.close()],
    ]) {
      try {
        await close();
      } catch (closeError) {
        process.stdout.write(
          `warn: ${label} close failed: ${String(closeError).slice(0, 120)}\n`,
        );
      }
    }

    if (capturedFrames > 0) {
      process.stdout.write(
        `\nCaptured ${capturedFrames} frames = ${(capturedFrames / 30).toFixed(1)}s of video\n`,
      );
      encode(frameDir, capturedFrames);
    } else {
      process.stdout.write("\nNo frames captured.\n");
    }
  }

  clearTimeout(watchdog);
  process.stdout.write(`\nBeats recorded: ${beats.length}\n`);
}

/** Encode the offline-rendered frames with the system ffmpeg. */
function encode(frameDir, frameCount) {
  const mp4 = path.join(OUTPUT_DIR, "trailer.mp4");
  const gif = path.join(OUTPUT_DIR, "trailer.gif");
  const poster = path.join(OUTPUT_DIR, "trailer-poster.jpg");

  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-framerate",
        "30",
        "-i",
        path.join(frameDir, "frame-%06d.jpg"),
        // Fade in from black, and out at the end, so it reads as a cut piece.
        "-vf",
        `format=yuv420p,fade=t=in:st=0:d=0.6,fade=t=out:st=${(frameCount / 30 - 0.8).toFixed(2)}:d=0.8`,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "20",
        "-movflags",
        "+faststart",
        mp4,
      ],
      { stdio: "pipe" },
    );
    process.stdout.write(
      `MP4: ${mp4} (${(fs.statSync(mp4).size / 1024).toFixed(0)} KB)\n`,
    );
  } catch (error) {
    const detail =
      error && error.stderr
        ? error.stderr.toString().slice(-500)
        : String(error);
    process.stdout.write(`MP4 encode FAILED: ${detail}\n`);
    return;
  }

  // A poster frame from the plough-trail beat, for the post's preview image.
  try {
    execFileSync(
      "ffmpeg",
      ["-y", "-ss", "9", "-i", mp4, "-frames:v", "1", "-q:v", "2", poster],
      { stdio: "pipe" },
    );
    process.stdout.write(`Poster: ${poster}\n`);
  } catch {
    /* non-fatal */
  }

  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-ss",
        "6",
        "-t",
        "7",
        "-i",
        mp4,
        "-vf",
        "fps=15,scale=640:-2:flags=lanczos,split[a][b];[a]palettegen[p];[b][p]paletteuse",
        gif,
      ],
      { stdio: "pipe" },
    );
    process.stdout.write(
      `GIF: ${gif} (${(fs.statSync(gif).size / 1024).toFixed(0)} KB)\n`,
    );
  } catch (error) {
    process.stdout.write(
      `GIF encode skipped: ${String(error).slice(0, 140)}\n`,
    );
  }
}

main().catch((error) => {
  process.stderr.write(
    `\nTrailer capture failed after ${beats.length} beats\n`,
  );
  process.stderr.write(
    `${error && error.stack ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});

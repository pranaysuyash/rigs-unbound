/**
 * Render the trailer's audio from the game's own synth, then mux it in.
 *
 * Usage:
 *   node tools/add-trailer-audio.cjs
 *   RIGS_UNBOUND_URL=http://127.0.0.1:4173/ node tools/add-trailer-audio.cjs
 *
 * Output (docs/comms/assets/):
 *   trailer-audio.wav      the rendered soundtrack
 *   trailer-with-audio.mp4 the muxed trailer
 *
 * ## Why the audio is synthesised rather than licensed
 *
 * `src/game/audio.ts` is a pure oscillator/noise graph — no samples. That means the
 * engine voice is a few dozen numbers, and it can be reproduced exactly outside the
 * browser from the same telemetry the game feeds it. So the trailer's soundtrack is
 * not a music bed laid over gameplay; it *is* the machine, pitched by the same speed
 * and slip values the player hears. No asset licensing, no provenance register entry.
 *
 * ## Why it replays instead of recording
 *
 * Browsers cannot render `AudioContext` output to a file without a virtual audio
 * device. But the kernel is deterministic: replaying the same storyboard with the
 * same seed produces the same telemetry, frame for frame. So this runs the storyboard
 * again *without screenshots* — seconds instead of minutes — collects telemetry per
 * 1/30 s frame, and synthesises from that. Determinism is what makes the audio line
 * up with picture it never saw.
 *
 * Mirrors `VOICES` and `SURFACE_TONE` in `src/game/audio.ts`. If those change, change
 * these; they are duplicated deliberately because this is an offline renderer and
 * importing browser audio code into node would drag in the Web Audio API.
 */

const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const playwrightModule =
  process.env.RIGS_PLAYWRIGHT_MODULE ||
  "/Users/pranay/Projects/skills/testing/playwright-skill/node_modules/playwright";
const { chromium } = require(playwrightModule);

const { armWatchdog } = require("./browser-watchdog.cjs");

// A browser script that cannot exit is worse than one that fails.
armWatchdog({ minutes: 25, label: "trailer audio mux" });

const TARGET_URL = process.env.RIGS_UNBOUND_URL || "http://127.0.0.1:4173/";
const OUTPUT_DIR = path.resolve(__dirname, "../docs/comms/assets");
const SOURCE_MP4 = path.join(OUTPUT_DIR, "trailer.mp4");
const WAV_PATH = path.join(OUTPUT_DIR, "trailer-audio.wav");
const OUT_MP4 = path.join(OUTPUT_DIR, "trailer-with-audio.mp4");

const FRAME_MS = 1000 / 30;
const SAMPLE_RATE = 48000;

/** Mirrors VOICES in src/game/audio.ts. */
const VOICES = {
  "utility-tractor": {
    idleHz: 42,
    spanHz: 78,
    detuneCents: 26,
    cutoffIdleHz: 260,
    cutoffLoadHz: 1150,
    level: 0.3,
    shape: "sawtooth",
  },
  "toy-buggy": {
    idleHz: 96,
    spanHz: 340,
    detuneCents: 11,
    cutoffIdleHz: 520,
    cutoffLoadHz: 3200,
    level: 0.2,
    shape: "square",
  },
  "marsh-skimmer": {
    idleHz: 64,
    spanHz: 150,
    detuneCents: 18,
    cutoffIdleHz: 340,
    cutoffLoadHz: 1800,
    level: 0.26,
    shape: "sawtooth",
  },
};

/** Mirrors SURFACE_TONE in src/game/audio.ts. */
const SURFACE_TONE = {
  track: 1500,
  grass: 900,
  tilled: 620,
  rock: 2100,
  sand: 780,
  mud: 420,
  water: 340,
};

const clamp = (v, lo, hi) => (v < lo ? lo : v > hi ? hi : v);

// -----------------------------------------------------------------------------
// Telemetry replay
// -----------------------------------------------------------------------------

/**
 * Replay the storyboard and sample telemetry once per video frame.
 *
 * The beat table is duplicated from `capture-trailer.cjs` rather than imported,
 * because that module runs its own browser and encodes on load. Keep the two in
 * sync; a mismatch shows up immediately as audio that peaks in the wrong place.
 */
async function collectTelemetry() {
  // System Chrome via `channel`, so this needs no bundled-browser download. The
  // telemetry pass never renders anything the user sees, so headless is fine.
  const launchOptions = {
    headless: true,
    args: ["--disable-renderer-backgrounding", "--hide-scrollbars"],
  };
  let browser;
  try {
    browser = await chromium.launch({ ...launchOptions, channel: "chrome" });
  } catch {
    browser = await chromium.launch(launchOptions);
  }
  const context = await browser.newContext({
    viewport: { width: 640, height: 360 },
  });
  const page = await context.newPage();
  const frames = [];

  try {
    await page.goto(TARGET_URL, { waitUntil: "load", timeout: 60_000 });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
      { timeout: 60_000 },
    );
    await page.evaluate(() => {
      try {
        window.localStorage.clear();
        window.sessionStorage.clear();
      } catch {
        /* storage may be blocked */
      }
    });
    await page.reload({ waitUntil: "load" });
    await page.waitForFunction(
      () => typeof window.render_game_to_text === "function",
      { timeout: 60_000 },
    );
    await page.evaluate(() => {
      document.getElementById("enter-world")?.click();
    });

    const sites = await page.evaluate(
      () => JSON.parse(window.render_game_to_text()).sites ?? [],
    );
    const site = (id) => sites.find((s) => s.id === id) ?? null;

    const marsh = site("sunken-flats");
    const field = site("long-furrow");
    const quarry = site("quarry-shelf");

    // Same shape and durations as the picture storyboard.
    const beats = [
      { ms: 1600, input: {}, step: false },
      { ms: 2600, input: { accelerate: true } },
      { ms: 1600, input: { accelerate: true, steerLeft: true } },
      { ms: 2600, input: { accelerate: true }, at: field },
      { ms: 3000, input: { accelerate: true, steerRight: true } },
      { ms: 2600, input: { accelerate: true, steerLeft: true } },
      { ms: 3000, input: { accelerate: true } },
      { ms: 3400, input: { accelerate: true }, at: quarry },
      { ms: 1400, input: { brake: true } },
      { ms: 3400, input: { accelerate: true } },
      { ms: 3400, input: { accelerate: true }, at: marsh },
      { ms: 3400, input: { accelerate: true }, at: marsh, rig: "toy-buggy" },
      { ms: 2600, input: {}, step: false },
      { ms: 2800, input: { accelerate: true } },
    ];

    for (const beat of beats) {
      if (beat.rig) {
        await page.evaluate((id) => {
          const s = JSON.parse(window.render_game_to_text());
          const target = s.rigs[id];
          window.placeRig(target.x, target.z);
          window.selectRig(id);
        }, beat.rig);
      }
      if (beat.at) {
        await page.evaluate(
          ([x, z]) => window.placeRig(x, z, 0),
          [beat.at.x, beat.at.z],
        );
      }
      const count = Math.max(1, Math.round(beat.ms / FRAME_MS));
      for (let i = 0; i < count; i += 1) {
        const sample = await page.evaluate(
          ([input, ms, doStep]) => {
            if (doStep) window.applyRigInput(input, ms);
            const s = JSON.parse(window.render_game_to_text());
            const rig = s.activeRig;
            const profileTop =
              rig.id === "toy-buggy"
                ? 21
                : rig.id === "marsh-skimmer"
                  ? 15
                  : 11;
            return {
              rigId: rig.id,
              speedRatio: Math.min(1, Math.abs(rig.speed) / profileTop),
              slip: rig.terrain?.slip ?? 0,
              load: rig.terrain?.engineLoad ?? 0,
              surface: rig.terrain?.surface ?? "grass",
              stalled: rig.terrain?.stalled ?? false,
              waterDepth: rig.terrain?.waterDepth ?? 0,
            };
          },
          [beat.input, FRAME_MS, beat.step !== false],
        );
        frames.push(sample);
      }
    }
  } finally {
    for (const close of [() => context.close(), () => browser.close()]) {
      try {
        await close();
      } catch {
        /* teardown races are not worth reporting */
      }
    }
  }
  return frames;
}

// -----------------------------------------------------------------------------
// Offline synthesis
// -----------------------------------------------------------------------------

/** One-pole lowpass, the cheap stand-in for the graph's BiquadFilter. */
function makeLowpass() {
  let z = 0;
  return (x, cutoffHz) => {
    const a = 1 - Math.exp((-2 * Math.PI * cutoffHz) / SAMPLE_RATE);
    z += a * (x - z);
    return z;
  };
}

function makeBandpass() {
  const lp = makeLowpass();
  let prev = 0;
  return (x, centreHz) => {
    const low = lp(x, centreHz);
    const out = low - prev;
    prev = low;
    return out;
  };
}

/** Deterministic noise, so two renders of the same trailer sound identical. */
function makeNoise(seed = 0x2f6e2b1) {
  let s = seed;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x3fffffff - 1;
  };
}

function sawtooth(phase) {
  return 2 * (phase - Math.floor(phase + 0.5));
}

function square(phase) {
  return phase - Math.floor(phase) < 0.5 ? 1 : -1;
}

/**
 * Render the soundtrack.
 *
 * Engine: two detuned oscillators through a lowpass whose cutoff opens with load,
 * exactly as the runtime graph does. Tyres: noise through a bandpass centred on the
 * surface, gained by speed and slip. Parameters are smoothed per sample toward their
 * per-frame targets, which is what `setTargetAtTime` does in the browser and what
 * stops every frame boundary from clicking.
 */
function synthesise(frames) {
  const samplesPerFrame = Math.round(SAMPLE_RATE / 30);
  const total = frames.length * samplesPerFrame;
  const out = new Float32Array(total);

  const engineLp = makeLowpass();
  const tyreBp = makeBandpass();
  const noise = makeNoise();

  let phaseA = 0;
  let phaseB = 0;
  // Smoothed parameter state.
  let freq = 40;
  let cutoff = 300;
  let engineGain = 0;
  let tyreGain = 0;
  let tyreTone = 900;

  const smooth = (current, target, tau) =>
    current + (target - current) * (1 - Math.exp(-1 / (tau * SAMPLE_RATE)));

  let write = 0;
  for (const frame of frames) {
    const voice = VOICES[frame.rigId] ?? VOICES["utility-tractor"];
    const revs = clamp(frame.speedRatio + frame.slip * 0.55, 0, 1.35);
    const load = clamp(frame.load * 0.7 + frame.slip * 0.5, 0, 1);

    const targetFreq = voice.idleHz + voice.spanHz * revs;
    const targetCutoff =
      voice.cutoffIdleHz + (voice.cutoffLoadHz - voice.cutoffIdleHz) * load;
    const targetEngine = voice.level * (0.32 + load * 0.68);
    const spray =
      frame.surface === "mud" || frame.surface === "water"
        ? 1.6
        : frame.surface === "sand"
          ? 1.25
          : frame.surface === "tilled"
            ? 0.9
            : 0.45;
    const targetTyre = clamp(
      (frame.speedRatio * 0.12 + frame.slip * 0.34) * spray,
      0,
      0.34,
    );
    const targetTone = SURFACE_TONE[frame.surface] ?? 900;
    const detune = Math.pow(2, voice.detuneCents / 1200);
    const shape = voice.shape === "square" ? square : sawtooth;

    for (let i = 0; i < samplesPerFrame; i += 1) {
      freq = smooth(freq, targetFreq, 0.06);
      cutoff = smooth(cutoff, targetCutoff, 0.08);
      engineGain = smooth(engineGain, targetEngine, 0.08);
      tyreGain = smooth(tyreGain, targetTyre, 0.07);
      tyreTone = smooth(tyreTone, targetTone, 0.12);

      phaseA += freq / SAMPLE_RATE;
      phaseB += (freq * 1.005 * detune) / SAMPLE_RATE;
      if (phaseA > 1e6) phaseA -= 1e6;
      if (phaseB > 1e6) phaseB -= 1e6;

      const engineRaw = (shape(phaseA) + shape(phaseB)) * 0.5;
      const engine = engineLp(engineRaw, cutoff) * engineGain;
      const tyre = tyreBp(noise(), tyreTone) * tyreGain;

      out[write] = engine + tyre;
      write += 1;
    }
  }

  // Normalise to a comfortable social-video level, then soft-clip.
  let peak = 0;
  for (let i = 0; i < total; i += 1) peak = Math.max(peak, Math.abs(out[i]));
  const gain = peak > 0 ? 0.72 / peak : 1;
  for (let i = 0; i < total; i += 1) {
    out[i] = Math.tanh(out[i] * gain * 1.15);
  }

  // Short fades so the track does not start or end on a discontinuity.
  const fade = Math.min(SAMPLE_RATE * 0.4, Math.floor(total / 8));
  for (let i = 0; i < fade; i += 1) {
    const k = i / fade;
    out[i] *= k;
    out[total - 1 - i] *= k;
  }
  return out;
}

function writeWav(samples, filePath) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  for (let i = 0; i < samples.length; i += 1) {
    const v = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(v * 32767), 44 + i * 2);
  }
  fs.writeFileSync(filePath, buffer);
}

async function main() {
  if (!fs.existsSync(SOURCE_MP4)) {
    throw new Error(
      `No silent trailer at ${SOURCE_MP4}; run capture-trailer first.`,
    );
  }

  process.stdout.write(
    `Replaying storyboard for telemetry from ${TARGET_URL}\n`,
  );
  const frames = await collectTelemetry();
  process.stdout.write(
    `Collected ${frames.length} frames (${(frames.length / 30).toFixed(1)}s)\n`,
  );

  const samples = synthesise(frames);
  writeWav(samples, WAV_PATH);
  process.stdout.write(
    `WAV: ${WAV_PATH} (${(fs.statSync(WAV_PATH).size / 1024).toFixed(0)} KB)\n`,
  );

  execFileSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      SOURCE_MP4,
      "-i",
      WAV_PATH,
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "160k",
      // Trim audio to the shorter of the two so a telemetry drift cannot pad the end.
      "-shortest",
      "-movflags",
      "+faststart",
      OUT_MP4,
    ],
    { stdio: "pipe" },
  );
  process.stdout.write(
    `MP4: ${OUT_MP4} (${(fs.statSync(OUT_MP4).size / 1024).toFixed(0)} KB)\n`,
  );
}

main().catch((error) => {
  process.stderr.write(
    `${error && error.stack ? error.stack : String(error)}\n`,
  );
  process.exitCode = 1;
});

/**
 * Procedural rig audio.
 *
 * Every sound here is synthesised at runtime from the traversal model's own
 * numbers — engine load, wheel slip, surface, impact speed. There are no audio
 * assets, which means no download cost, no licensing surface, and nothing to add
 * to the asset provenance register.
 *
 * More importantly it means the audio *is* telemetry: the engine note rises with
 * load, the tyre layer roars when `wheel.slip` climbs, and a plume of dust always
 * arrives with the sound of losing grip. `DESIGN.md` asks for "a layered
 * mechanical voice: idle, load, traction, damage, tool"; this is the first four.
 *
 * ## Autoplay policy
 *
 * Browsers refuse to start an `AudioContext` before a user gesture. `unlock()`
 * must therefore be called from a real click or keypress handler, and everything
 * else is a no-op until it succeeds. Failure is silent and non-fatal: a muted game
 * is a far better outcome than a boot exception.
 *
 * ## Accessibility
 *
 * Audio is never the only channel for anything. Slip has dust, impacts have camera
 * shake and a condition readout, stalling has a HUD diagnostic. Muting loses
 * nothing mechanical, per the UI rules in `DESIGN.md`.
 */

import type { EffectiveRig, RigId, RigState, WorldPhase } from "./contracts";
import { deriveRigFeedback } from "./feedback";
import { clamp } from "./noise";
import { SURFACES, type SurfaceId } from "./world";

/**
 * Per-rig voice parameters.
 *
 * These live here rather than in `RigProfile` because they are presentation, and
 * the gameplay kernel must stay free of view concerns. The mapping is by rig id,
 * so adding a rig without a voice degrades to the fallback rather than failing.
 */
interface VoiceProfile {
  /** Idle fundamental, in Hz. */
  idleHz: number;
  /** Additional Hz at full engine speed. */
  spanHz: number;
  /** Detune of the second oscillator, in cents. Wider reads as rougher. */
  detune: number;
  /** Filter cutoff at idle, in Hz. */
  cutoffIdleHz: number;
  /** Filter cutoff at full load, in Hz. */
  cutoffLoadHz: number;
  /** Master level for this voice. */
  level: number;
  /** Oscillator shape. Sawtooth is buzzy; square is hollower. */
  shape: OscillatorType;
}

const VOICES: Readonly<Record<RigId, VoiceProfile>> = {
  // A slow, lugging diesel: low fundamental, wide detune for the uneven beat.
  "utility-tractor": {
    idleHz: 42,
    spanHz: 78,
    detune: 26,
    cutoffIdleHz: 260,
    cutoffLoadHz: 1150,
    level: 0.3,
    shape: "sawtooth",
  },
  // A small high-revving motor: higher, tighter, brighter.
  "toy-buggy": {
    idleHz: 96,
    spanHz: 340,
    detune: 11,
    cutoffIdleHz: 520,
    cutoffLoadHz: 3200,
    level: 0.2,
    shape: "square",
  },
  // A broad lift-fan drone: steadier than either combustion voice, with load
  // expressed as pressure and spray rather than fake tyre contact.
  "marsh-skimmer": {
    idleHz: 58,
    spanHz: 128,
    detune: 7,
    cutoffIdleHz: 420,
    cutoffLoadHz: 2200,
    level: 0.24,
    shape: "triangle",
  },
  "heavy-utility-tow-recovery-01": {
    idleHz: 38,
    spanHz: 70,
    detune: 28,
    cutoffIdleHz: 240,
    cutoffLoadHz: 1100,
    level: 0.32,
    shape: "sawtooth",
  },
  "heavy-salvage-crane-02": {
    idleHz: 34,
    spanHz: 65,
    detune: 30,
    cutoffIdleHz: 220,
    cutoffLoadHz: 1000,
    level: 0.35,
    shape: "sawtooth",
  },
  "snow-crawler-expedition-01": {
    idleHz: 46,
    spanHz: 85,
    detune: 22,
    cutoffIdleHz: 280,
    cutoffLoadHz: 1300,
    level: 0.28,
    shape: "sawtooth",
  },
  "harvester-combined-cultivator-01": {
    idleHz: 40,
    spanHz: 72,
    detune: 25,
    cutoffIdleHz: 250,
    cutoffLoadHz: 1120,
    level: 0.3,
    shape: "sawtooth",
  },
  "sentinel-mobile-fort-01": {
    idleHz: 32,
    spanHz: 60,
    detune: 32,
    cutoffIdleHz: 200,
    cutoffLoadHz: 950,
    level: 0.38,
    shape: "sawtooth",
  },
  "aero-skimmer-survey-01": {
    idleHz: 68,
    spanHz: 160,
    detune: 8,
    cutoffIdleHz: 480,
    cutoffLoadHz: 2500,
    level: 0.22,
    shape: "triangle",
  },
  "aero-cargo-freighter-02": {
    idleHz: 52,
    spanHz: 110,
    detune: 10,
    cutoffIdleHz: 380,
    cutoffLoadHz: 1900,
    level: 0.26,
    shape: "triangle",
  },
  "torque-field-cutter-02": {
    idleHz: 44,
    spanHz: 80,
    detune: 24,
    cutoffIdleHz: 270,
    cutoffLoadHz: 1200,
    level: 0.31,
    shape: "sawtooth",
  },
  "spark-dune-runner-02": {
    idleHz: 105,
    spanHz: 380,
    detune: 12,
    cutoffIdleHz: 580,
    cutoffLoadHz: 3500,
    level: 0.18,
    shape: "square",
  },
  "marsh-dredger-heavy-02": {
    idleHz: 50,
    spanHz: 100,
    detune: 9,
    cutoffIdleHz: 360,
    cutoffLoadHz: 1800,
    level: 0.25,
    shape: "triangle",
  },
  "hauler-road-train-01": {
    idleHz: 36,
    spanHz: 75,
    detune: 26,
    cutoffIdleHz: 230,
    cutoffLoadHz: 1050,
    level: 0.33,
    shape: "sawtooth",
  },
  "construction-excavator-01": {
    idleHz: 42,
    spanHz: 78,
    detune: 27,
    cutoffIdleHz: 260,
    cutoffLoadHz: 1180,
    level: 0.32,
    shape: "sawtooth",
  },
  "micro-scout-pipe-crawler-01": {
    idleHz: 120,
    spanHz: 400,
    detune: 15,
    cutoffIdleHz: 650,
    cutoffLoadHz: 4000,
    level: 0.15,
    shape: "square",
  },
};

const FALLBACK_VOICE: VoiceProfile = VOICES["utility-tractor"];

/** Bandpass centre for each surface's tyre layer, in Hz. */
const SURFACE_TONE: Readonly<Record<SurfaceId, number>> = {
  track: 1500,
  grass: 900,
  tilled: 620,
  rock: 2100,
  sand: 780,
  mud: 420,
  water: 340,
};

export class RigAudio {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;

  private engineA: OscillatorNode | null = null;
  private engineB: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  private tyreSource: AudioBufferSourceNode | null = null;
  private tyreGain: GainNode | null = null;
  private tyreFilter: BiquadFilterNode | null = null;

  private shellOscillator: OscillatorNode | null = null;
  private shellGain: GainNode | null = null;

  private enabled = true;
  private currentVoice: RigId | null = null;

  /** True once the browser has allowed an audio context to run. */
  get running(): boolean {
    return this.context !== null && this.context.state === "running";
  }

  /**
   * Start or resume audio. Safe to call repeatedly; must originate from a user
   * gesture the first time.
   */
  async unlock(): Promise<void> {
    if (!this.enabled) return;
    try {
      if (!this.context) {
        const Ctor =
          window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!Ctor) return;
        this.context = new Ctor();
        this.build();
      }
      if (this.context.state === "suspended") {
        await this.context.resume();
      }
    } catch {
      // No audio is an acceptable outcome; never let it break the game loop.
      this.context = null;
    }
  }

  private build(): void {
    const context = this.context;
    if (!context) return;

    this.master = context.createGain();
    this.master.gain.value = this.enabled ? 0.85 : 0;
    this.master.connect(context.destination);

    // Engine: two detuned oscillators through a lowpass that opens under load.
    this.engineFilter = context.createBiquadFilter();
    this.engineFilter.type = "lowpass";
    this.engineFilter.Q.value = 3.2;
    this.engineGain = context.createGain();
    this.engineGain.gain.value = 0;
    this.engineFilter.connect(this.engineGain).connect(this.master);

    this.engineA = context.createOscillator();
    this.engineB = context.createOscillator();
    this.engineA.connect(this.engineFilter);
    this.engineB.connect(this.engineFilter);
    this.engineA.start();
    this.engineB.start();

    // Tyre and surface: looping white noise through a bandpass whose centre is the
    // surface and whose gain is speed and slip.
    const seconds = 2;
    const buffer = context.createBuffer(
      1,
      context.sampleRate * seconds,
      context.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    // A cheap deterministic LCG rather than Math.random: identical every session,
    // which keeps the mix reproducible when comparing recordings.
    let seed = 0x2f6e2b1;
    for (let index = 0; index < channel.length; index += 1) {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      channel[index] = (seed / 0x3fffffff - 1) * 0.6;
    }

    this.tyreFilter = context.createBiquadFilter();
    this.tyreFilter.type = "bandpass";
    this.tyreFilter.Q.value = 0.85;
    this.tyreGain = context.createGain();
    this.tyreGain.gain.value = 0;
    this.tyreFilter.connect(this.tyreGain).connect(this.master);

    this.tyreSource = context.createBufferSource();
    this.tyreSource.buffer = buffer;
    this.tyreSource.loop = true;
    this.tyreSource.connect(this.tyreFilter);
    this.tyreSource.start();

    // State Shell: Resonant harmonic sine oscillator modulated by integrity
    this.shellGain = context.createGain();
    this.shellGain.gain.value = 0;
    this.shellGain.connect(this.master);

    this.shellOscillator = context.createOscillator();
    this.shellOscillator.type = "sine";
    this.shellOscillator.frequency.value = 110; // Low A tone
    this.shellOscillator.connect(this.shellGain);
    this.shellOscillator.start();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (this.master && this.context) {
      this.master.gain.setTargetAtTime(
        enabled ? 0.85 : 0,
        this.context.currentTime,
        0.05,
      );
    }
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Track the active rig's state.
   *
   * All parameter changes use `setTargetAtTime` so nothing clicks: the fixed step
   * updates these values 60 times a second, and stepped assignment would be
   * audible as zipper noise.
   */
  update(
    rig: RigState,
    profile: EffectiveRig,
    phase: WorldPhase,
    paused: boolean,
  ): void {
    const context = this.context;
    if (
      !context ||
      !this.engineA ||
      !this.engineB ||
      !this.engineGain ||
      !this.engineFilter ||
      !this.tyreGain ||
      !this.tyreFilter
    ) {
      return;
    }

    const voice = VOICES[rig.id] ?? FALLBACK_VOICE;
    const feedback = deriveRigFeedback(rig, profile);
    if (this.currentVoice !== rig.id) {
      this.currentVoice = rig.id;
      this.engineA.type = voice.shape;
      this.engineB.type = voice.shape;
      this.engineB.detune.setValueAtTime(voice.detune, context.currentTime);
    }

    const now = context.currentTime;
    // Slip raises perceived revs without raising road speed, which is exactly what
    // wheelspin sounds like.
    const revs = clamp(
      feedback.speedRatio + feedback.tractionLoss * 0.55,
      0,
      1.35,
    );
    const load = feedback.driveLoad;

    const frequency = voice.idleHz + voice.spanHz * revs;
    this.engineA.frequency.setTargetAtTime(frequency, now, 0.06);
    this.engineB.frequency.setTargetAtTime(frequency * 1.005, now, 0.06);
    this.engineFilter.frequency.setTargetAtTime(
      voice.cutoffIdleHz + (voice.cutoffLoadHz - voice.cutoffIdleHz) * load,
      now,
      0.08,
    );

    const nightDamping = phase === "night" ? 0.82 : 1;
    const engineLevel = paused
      ? 0
      : voice.level * (0.32 + load * 0.68) * nightDamping;
    this.engineGain.gain.setTargetAtTime(engineLevel, now, 0.08);

    const surface =
      SURFACES[rig.telemetry.surfaceId as SurfaceId] ?? SURFACES.grass;
    const tone = SURFACE_TONE[surface.id] ?? 900;
    this.tyreFilter.frequency.setTargetAtTime(tone, now, 0.12);
    const contact =
      rig.mobility.kind === "ground"
        ? rig.mobility.wheels.filter((wheel) => wheel.contact).length / 4
        : rig.mobility.cushionPressure;
    const motionLayer =
      rig.mobility.kind === "ground"
        ? feedback.speedRatio * 0.1 + feedback.tractionLoss * 0.3
        : feedback.speedRatio * 0.14 +
          (1 - rig.mobility.cushionPressure) * 0.12;
    const tyreLevel = paused
      ? 0
      : clamp(motionLayer * surface.spray * contact, 0, 0.34);
    this.tyreGain.gain.setTargetAtTime(tyreLevel, now, 0.07);

    // Modulate State Shell overcharge hum frequency and level
    if (this.shellOscillator && this.shellGain) {
      const shellFreq = 110 + feedback.integrityRatio * 55; // Pitch rises with full integrity
      const shellLevel = paused ? 0 : (1 - feedback.integrityRatio) * 0.12; // Louder when strained
      this.shellOscillator.frequency.setTargetAtTime(shellFreq, now, 0.1);
      this.shellGain.gain.setTargetAtTime(shellLevel, now, 0.1);
    }
  }

  /**
   * One-shot impact: a filtered noise burst with a fast decay.
   *
   * Built and discarded per hit rather than kept alive, because impacts are rare
   * and a pooled voice would need its own envelope bookkeeping for no benefit.
   */
  impact(strength: number): void {
    const context = this.context;
    if (!context || !this.master || !this.enabled) return;
    const level = clamp(strength, 0, 1);
    if (level < 0.05) return;

    const now = context.currentTime;
    const duration = 0.16 + level * 0.22;

    const buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * duration),
      context.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    let seed = 0x51a3f7;
    for (let index = 0; index < channel.length; index += 1) {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      const decay = 1 - index / channel.length;
      channel[index] = (seed / 0x3fffffff - 1) * decay * decay;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    // A heavier hit is a duller, lower thud.
    filter.frequency.value = 900 - level * 520;
    const gain = context.createGain();
    gain.gain.value = 0.34 * level;
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /** A short confirmation chirp for pickups and installs. */
  chirp(frequency = 660): void {
    const context = this.context;
    if (!context || !this.master || !this.enabled) return;
    const now = context.currentTime;
    const oscillator = context.createOscillator();
    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      frequency * 1.5,
      now + 0.09,
    );
    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.13, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2);
    oscillator.connect(gain).connect(this.master);
    oscillator.start(now);
    oscillator.stop(now + 0.22);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  }

  /** A low rumble for plough engagement — grinding earth, not a clean chirp. */
  ploughCut(): void {
    const context = this.context;
    if (!context || !this.master || !this.enabled) return;
    const now = context.currentTime;
    const duration = 0.35;

    const buffer = context.createBuffer(
      1,
      Math.ceil(context.sampleRate * duration),
      context.sampleRate,
    );
    const channel = buffer.getChannelData(0);
    let seed = 0x8c3f1a;
    for (let index = 0; index < channel.length; index += 1) {
      seed = (Math.imul(seed, 1103515245) + 12345) & 0x7fffffff;
      const envelope =
        index < duration * context.sampleRate * 0.15
          ? index / (duration * context.sampleRate * 0.15)
          : 1 -
            (index - duration * context.sampleRate * 0.15) /
              (duration * context.sampleRate * 0.85);
      channel[index] = (seed / 0x3fffffff - 1) * 0.4 * envelope;
    }

    const source = context.createBufferSource();
    source.buffer = buffer;
    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 280;
    const gain = context.createGain();
    gain.gain.value = 0.22;
    source.connect(filter).connect(gain).connect(this.master);
    source.start(now);
    source.stop(now + duration);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  /** A warm confirmation tone for crop delivery — deeper than chirp, more resonant. */
  harvestDeliver(): void {
    const context = this.context;
    if (!context || !this.master || !this.enabled) return;
    const now = context.currentTime;

    const osc1 = context.createOscillator();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(330, now);
    osc1.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    const osc2 = context.createOscillator();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(220, now);
    osc2.frequency.exponentialRampToValueAtTime(330, now + 0.15);

    const gain = context.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

    osc1.connect(gain).connect(this.master);
    osc2.connect(gain);
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.5);
    osc2.stop(now + 0.5);
    osc1.onended = () => {
      osc1.disconnect();
      osc2.disconnect();
      gain.disconnect();
    };
  }

  /** Low ominous drone that builds as storm approaches. */
  stormApproach(intensity: number): void {
    const context = this.context;
    if (!context || !this.master || !this.enabled) return;
    const now = context.currentTime;

    const osc = context.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(48 + intensity * 20, now);

    const filter = context.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 120 + intensity * 80;
    filter.Q.value = 4;

    const gain = context.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08 * intensity, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

    osc.connect(filter).connect(gain).connect(this.master);
    osc.start(now);
    osc.stop(now + 1.3);
    osc.onended = () => {
      osc.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
  }

  dispose(): void {
    try {
      this.engineA?.stop();
      this.engineB?.stop();
      this.tyreSource?.stop();
      void this.context?.close();
    } catch {
      // Disposal races during page teardown are not worth reporting.
    }
    this.context = null;
  }
}

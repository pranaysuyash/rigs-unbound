import * as THREE from "three";

const MAX_DUST = 260;
const MAX_EXHAUST = 100;

/**
 * Owns the two GPU particle pools: ballistic wheel-slip dust/mud roost and
 * diesel exhaust smoke. Extracted verbatim from GameRenderer (ADR-0054 unit 2);
 * emission policy (when to call emit*) stays with the renderer's per-frame rig
 * feedback logic, while buffer simulation and draw setup live here.
 */
export class ParticleFXPresenter {
  private dust!: THREE.Points;
  private readonly dustPositions = new Float32Array(MAX_DUST * 3);
  private readonly dustVelocities = new Float32Array(MAX_DUST * 3);
  private readonly dustLife = new Float32Array(MAX_DUST);
  private dustCursor = 0;

  private exhaust!: THREE.Points;
  private readonly exhaustPositions = new Float32Array(MAX_EXHAUST * 3);
  private readonly exhaustVelocities = new Float32Array(MAX_EXHAUST * 3);
  private readonly exhaustLife = new Float32Array(MAX_EXHAUST);
  private exhaustCursor = 0;

  constructor(scene: THREE.Scene) {
    // Dust pool
    const dustGeometry = new THREE.BufferGeometry();
    this.dustPositions.fill(-9999);
    dustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.dustPositions, 3),
    );
    this.dust = new THREE.Points(
      dustGeometry,
      new THREE.PointsMaterial({
        color: 0xbaa882,
        size: 1.1,
        transparent: true,
        opacity: 0.65,
        depthWrite: false,
      }),
    );
    this.dust.frustumCulled = false;
    scene.add(this.dust);

    // Exhaust pool
    const exhaustGeometry = new THREE.BufferGeometry();
    this.exhaustPositions.fill(-9999);
    exhaustGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(this.exhaustPositions, 3),
    );
    this.exhaust = new THREE.Points(
      exhaustGeometry,
      new THREE.PointsMaterial({
        color: 0x3d3a36,
        size: 0.85,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      }),
    );
    this.exhaust.frustumCulled = false;
    scene.add(this.exhaust);
  }

  /**
   * Emit dust and mud roost particles from a slipping wheel or water wake.
   *
   * Tied to `wheel.slip` and the surface's own `spray`, so the particle plume is a
   * readout of the traction model rather than decoration: a plume means you are
   * losing grip right now, on this ground.
   */
  emitDust(
    x: number,
    y: number,
    z: number,
    strength: number,
    speed: number,
    heading = 0,
  ): void {
    const bursts = Math.min(5, Math.max(2, Math.round(strength * 5)));
    for (let burst = 0; burst < bursts; burst += 1) {
      const index = this.dustCursor;
      this.dustCursor = (this.dustCursor + 1) % MAX_DUST;
      const offset = index * 3;
      this.dustPositions[offset] = x + (Math.random() - 0.5) * 0.3;
      this.dustPositions[offset + 1] = y + Math.random() * 0.15;
      this.dustPositions[offset + 2] = z + (Math.random() - 0.5) * 0.3;

      // Ballistic rooster ejection: backward along rig heading with upward lift
      const spread = (Math.random() - 0.5) * 0.8;
      const backAngle = heading + Math.PI + spread;
      const horizSpeed =
        (1.2 + speed * 0.35 + strength * 1.8) * (0.8 + Math.random() * 0.4);

      this.dustVelocities[offset] = Math.sin(backAngle) * horizSpeed;
      this.dustVelocities[offset + 1] =
        1.4 + strength * 2.2 + Math.random() * 1.2;
      this.dustVelocities[offset + 2] = Math.cos(backAngle) * horizSpeed;
      this.dustLife[index] = 0.65 + strength * 0.6 + Math.random() * 0.3;
    }
  }

  updateDust(delta: number): void {
    for (let index = 0; index < MAX_DUST; index += 1) {
      if (this.dustLife[index]! <= 0) continue;
      const offset = index * 3;
      this.dustLife[index] = this.dustLife[index]! - delta;
      if (this.dustLife[index]! <= 0) {
        this.dustPositions[offset + 1] = -9999;
        continue;
      }
      const velocityY = this.dustVelocities[offset + 1]!;
      this.dustPositions[offset] =
        this.dustPositions[offset]! + this.dustVelocities[offset]! * delta;
      this.dustPositions[offset + 1] =
        this.dustPositions[offset + 1]! + velocityY * delta;
      this.dustPositions[offset + 2] =
        this.dustPositions[offset + 2]! +
        this.dustVelocities[offset + 2]! * delta;
      // Air drag on horizontal velocity, gravity on vertical
      this.dustVelocities[offset] =
        this.dustVelocities[offset]! * Math.max(0, 1 - delta * 1.8);
      this.dustVelocities[offset + 2] =
        this.dustVelocities[offset + 2]! * Math.max(0, 1 - delta * 1.8);
      this.dustVelocities[offset + 1] = velocityY - 4.5 * delta;
    }
    (
      this.dust.geometry.getAttribute("position") as THREE.BufferAttribute
    ).needsUpdate = true;
  }

  emitExhaust(x: number, y: number, z: number, intensity: number): void {
    const index = this.exhaustCursor;
    this.exhaustCursor = (this.exhaustCursor + 1) % MAX_EXHAUST;
    const offset = index * 3;
    this.exhaustPositions[offset] = x + (Math.random() - 0.5) * 0.12;
    this.exhaustPositions[offset + 1] = y;
    this.exhaustPositions[offset + 2] = z + (Math.random() - 0.5) * 0.12;

    this.exhaustVelocities[offset] = (Math.random() - 0.5) * 0.35;
    this.exhaustVelocities[offset + 1] =
      1.1 + intensity * 1.6 + Math.random() * 0.4;
    this.exhaustVelocities[offset + 2] = (Math.random() - 0.5) * 0.35;
    this.exhaustLife[index] = 0.75 + intensity * 0.45;
  }

  updateExhaust(delta: number): void {
    for (let index = 0; index < MAX_EXHAUST; index += 1) {
      if (this.exhaustLife[index]! <= 0) continue;
      const offset = index * 3;
      this.exhaustLife[index] = this.exhaustLife[index]! - delta;
      if (this.exhaustLife[index]! <= 0) {
        this.exhaustPositions[offset + 1] = -9999;
        continue;
      }
      this.exhaustPositions[offset] =
        this.exhaustPositions[offset]! +
        this.exhaustVelocities[offset]! * delta;
      this.exhaustPositions[offset + 1] =
        this.exhaustPositions[offset + 1]! +
        this.exhaustVelocities[offset + 1]! * delta;
      this.exhaustPositions[offset + 2] =
        this.exhaustPositions[offset + 2]! +
        this.exhaustVelocities[offset + 2]! * delta;
      this.exhaustVelocities[offset + 1] =
        this.exhaustVelocities[offset + 1]! * Math.max(0, 1 - delta * 0.9);
    }
    (
      this.exhaust.geometry.getAttribute("position") as THREE.BufferAttribute
    ).needsUpdate = true;
  }

  /** Release every GPU resource owned by the particle pools. */
  dispose(): void {
    this.dust.geometry.dispose();
    (this.dust.material as THREE.Material).dispose();
    this.exhaust.geometry.dispose();
    (this.exhaust.material as THREE.Material).dispose();
  }
}

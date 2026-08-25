import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { FXAAShader } from "three/examples/jsm/shaders/FXAAShader.js";

type FXAAUniforms = {
  resolution: {
    value: {
      set: (x: number, y: number) => void;
    };
  };
};

export const CinematicColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    vignetteDarkness: { value: 0.36 },
    vignetteOffset: { value: 1.15 },
    saturation: { value: 1.07 },
    contrast: { value: 1.05 },
    exposure: { value: 1.02 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float vignetteDarkness;
    uniform float vignetteOffset;
    uniform float saturation;
    uniform float contrast;
    uniform float exposure;
    varying vec2 vUv;

    void main() {
      vec4 tex = texture2D(tDiffuse, vUv);
      vec3 color = tex.rgb * exposure;

      // Filmic S-curve contrast
      color = (color - 0.5) * contrast + 0.5;

      // Saturation adjustment
      float luma = dot(color, vec3(0.2126, 0.7152, 0.0722));
      color = mix(vec3(luma), color, saturation);

      // Cinematic Vignette
      vec2 uv = (vUv - vec2(0.5)) * vec2(vignetteOffset);
      float vig = clamp(1.0 - dot(uv, uv) * vignetteDarkness, 0.0, 1.0);
      color *= vig;

      gl_FragColor = vec4(color, tex.a);
    }
  `,
};

/**
 * Owns the EffectComposer chain: RenderPass -> UnrealBloom -> cinematic color
 * grade -> FXAA. Extracted verbatim from GameRenderer (ADR-0054 unit 1); the
 * pass order and every uniform default are part of the visual contract and
 * must not change during extraction.
 */
export class PostProcessingPipeline {
  readonly composer: EffectComposer;
  private readonly bloomPass: UnrealBloomPass;
  private readonly fxaaPass: ShaderPass;

  constructor(
    renderer: THREE.WebGLRenderer,
    scene: THREE.Scene,
    camera: THREE.PerspectiveCamera,
  ) {
    this.composer = new EffectComposer(renderer);
    this.composer.addPass(new RenderPass(scene, camera));

    // Bloom pass for emissive materials and bright highlights
    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.45, // strength
      0.38, // radius
      0.82, // threshold
    );
    this.composer.addPass(this.bloomPass);

    // Cinematic Color Grading & Vignette Pass
    const colorGradePass = new ShaderPass(CinematicColorGradeShader);
    this.composer.addPass(colorGradePass);

    // FXAA anti-aliasing (cheaper than MSAA, works with WebGPU)
    const fxaaPass = new ShaderPass(FXAAShader);
    const fxaaUniforms = fxaaPass.material.uniforms as FXAAUniforms;
    fxaaUniforms.resolution.value.set(
      1 / (window.innerWidth * renderer.getPixelRatio()),
      1 / (window.innerHeight * renderer.getPixelRatio()),
    );
    this.composer.addPass(fxaaPass);
    this.fxaaPass = fxaaPass;
  }

  setSize(width: number, height: number, pixelRatio: number): void {
    this.composer.setSize(width, height);

    // Update FXAA resolution
    const fxaaUniforms = this.fxaaPass.material.uniforms as FXAAUniforms;
    fxaaUniforms.resolution.value.set(
      1 / (width * pixelRatio),
      1 / (height * pixelRatio),
    );
  }

  render(): void {
    this.composer.render();
  }
}

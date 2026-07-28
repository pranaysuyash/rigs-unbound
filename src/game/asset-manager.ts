/**
 * Centralized asset manager for textures, models, and environment maps.
 * Provides caching, deduplication, async loading with promises, and easy disposal.
 */

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * Centralized asset manager for textures, models, and environment maps.
 * Provides caching, deduplication, async loading with promises, and easy disposal.
 */
export class AssetManager {
  private textures = new Map<string, THREE.Texture>();
  private models = new Map<string, THREE.Group>();
  private environments = new Map<string, THREE.Texture>();

  constructor(
    private readonly gltfLoader: GLTFLoader,
    private readonly textureLoader: THREE.TextureLoader,
    private readonly cubeTextureLoader: THREE.CubeTextureLoader,
    private readonly pmremGenerator: THREE.PMREMGenerator,
  ) {}

  /**
   * Load a texture with caching.
   * @param key Unique cache key
   * @param url Texture URL
   * @param options Optional texture configuration
   */
  async loadTexture(
    key: string,
    url: string,
    options: {
      colorSpace?: THREE.ColorSpace;
      wrapS?: THREE.Wrapping;
      wrapT?: THREE.Wrapping;
      minFilter?: THREE.TextureFilter;
      magFilter?: THREE.MagnificationTextureFilter;
      anisotropy?: number;
      flipY?: boolean;
    } = {},
  ): Promise<THREE.Texture> {
    if (this.textures.has(key)) {
      return this.textures.get(key)!;
    }

    const texture = await this.textureLoader.loadAsync(url);

    // Apply default PBR-friendly settings
    texture.colorSpace = options.colorSpace ?? THREE.SRGBColorSpace;
    texture.wrapS = options.wrapS ?? THREE.RepeatWrapping;
    texture.wrapT = options.wrapT ?? THREE.RepeatWrapping;
    texture.minFilter = options.minFilter ?? THREE.LinearMipmapLinearFilter;
    texture.magFilter = options.magFilter ?? THREE.LinearFilter;
    texture.anisotropy = options.anisotropy ?? 16;
    texture.flipY = options.flipY ?? true;
    texture.needsUpdate = true;

    this.textures.set(key, texture);
    return texture;
  }

  /**
   * Load a GLTF/GLB model with caching.
   * @param key Unique cache key
   * @param url Model URL
   * @param options Optional model processing options
   */
  async loadModel(
    key: string,
    url: string,
    options: {
      castShadow?: boolean;
      receiveShadow?: boolean;
      scale?: number;
      center?: boolean;
    } = {},
  ): Promise<THREE.Group> {
    if (this.models.has(key)) {
      return this.models.get(key)!.clone(true);
    }

    const gltf = await this.gltfLoader.loadAsync(url);
    const root = gltf.scene ?? gltf.scenes[0];
    if (!root) {
      throw new Error(`Model ${url} has no scene`);
    }

    // Apply default settings
    root.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = options.castShadow ?? true;
        child.receiveShadow = options.receiveShadow ?? true;
        if (child.material) {
          child.material.envMapIntensity = 1.0;
        }
      }
    });

    if (options.center !== false) {
      const box = new THREE.Box3().setFromObject(root);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      root.position.sub(center);

      if (options.scale) {
        const maxDim = Math.max(size.x, size.y, size.z);
        const scale = options.scale / maxDim;
        root.scale.setScalar(scale);
      }
    }

    this.models.set(key, root);
    return root.clone(true);
  }

  /**
   * Load an HDR environment map and generate a prefiltered PMREM.
   * @param key Unique cache key
   * @param url HDR file URL
   */
  async loadEnvironment(key: string, url: string): Promise<THREE.Texture> {
    if (this.environments.has(key)) {
      return this.environments.get(key)!;
    }

    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const rgbeLoader = new RGBELoader();
    const dataTexture = rgbeLoader.parse(buffer);
    const texture = new THREE.DataTexture(
      dataTexture.data,
      dataTexture.width,
      dataTexture.height,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.needsUpdate = true;

    const envMap = this.pmremGenerator.fromEquirectangular(texture).texture;
    texture.dispose();

    this.environments.set(key, envMap);
    return envMap;
  }

  /**
   * Load a cube texture (skybox) with caching.
   * @param key Unique cache key
   * @param urls Array of 6 face URLs [px, nx, py, ny, pz, nz]
   */
  async loadCubeTexture(
    key: string,
    urls: string[],
  ): Promise<THREE.CubeTexture> {
    if (this.environments.has(key)) {
      return this.environments.get(key) as THREE.CubeTexture;
    }

    const texture = await this.cubeTextureLoader.loadAsync(urls);
    texture.mapping = THREE.CubeReflectionMapping;
    this.environments.set(key, texture);
    return texture;
  }

  /**
   * Get a cached texture by key.
   */
  getTexture(key: string): THREE.Texture | undefined {
    return this.textures.get(key);
  }

  /**
   * Get a cached model by key (returns clone).
   */
  getModel(key: string): THREE.Group | undefined {
    const model = this.models.get(key);
    return model ? model.clone(true) : undefined;
  }

  /**
   * Get a cached environment map by key.
   */
  getEnvironment(key: string): THREE.Texture | undefined {
    return this.environments.get(key);
  }

  /**
   * Check if a texture is cached.
   */
  hasTexture(key: string): boolean {
    return this.textures.has(key);
  }

  /**
   * Check if a model is cached.
   */
  hasModel(key: string): boolean {
    return this.models.has(key);
  }

  /**
   * Check if an environment is cached.
   */
  hasEnvironment(key: string): boolean {
    return this.environments.has(key);
  }

  /**
   * Preload multiple assets in parallel.
   */
  async preload(
    assets: Array<{
      type: "texture" | "model" | "environment" | "cubeTexture";
      key: string;
      url: string;
      urls?: string[];
      options?: any;
    }>,
  ): Promise<void> {
    await Promise.all(
      assets.map((asset) => {
        switch (asset.type) {
          case "texture":
            return this.loadTexture(asset.key, asset.url, asset.options);
          case "model":
            return this.loadModel(asset.key, asset.url, asset.options);
          case "environment":
            return this.loadEnvironment(asset.key, asset.url);
          case "cubeTexture":
            return this.loadCubeTexture(asset.key, asset.urls!);
          default:
            return Promise.resolve();
        }
      }),
    );
  }

  /**
   * Dispose all cached assets and clear caches.
   */
  dispose(): void {
    this.textures.forEach((t) => t.dispose());
    this.textures.clear();

    this.models.forEach((m) => {
      m.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
    });
    this.models.clear();

    this.environments.forEach((t) => t.dispose());
    this.environments.clear();
  }
}

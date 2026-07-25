import * as THREE from 'three';
import {
  createPatchworkTractorEnvironment,
  createPatchworkTractorLookDevLights,
  createPatchworkTractorModel,
  framePatchworkTractorCamera,
} from '../generated/createPatchworkTractorModel';

const status = document.querySelector<HTMLDivElement>('#status');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd7d1c8);

const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.01, 100);
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
document.body.appendChild(renderer.domElement);

const model = createPatchworkTractorModel({ castShadow: true, receiveShadow: true, textureAnisotropy: 4 });
scene.add(model);
scene.add(createPatchworkTractorLookDevLights('neutral'));
scene.environment = createPatchworkTractorEnvironment(renderer);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(24, 24),
  new THREE.MeshStandardMaterial({ color: 0xc0b9af, roughness: 0.92, metalness: 0 }),
);
ground.rotation.x = -Math.PI / 2;
ground.position.y = -0.015;
ground.receiveShadow = true;
scene.add(ground);

function frame() {
  framePatchworkTractorCamera(camera, model, { margin: 1.2, azimuthDeg: 42, elevationDeg: 16 });
}

function resize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  frame();
}

frame();
window.addEventListener('resize', resize);
status?.replaceChildren('Blockout evaluation preview · front three-quarter · plain renderer');
status?.setAttribute('data-state', 'ready');

function render() {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

// Evidence hooks keep the browser capture deterministic without coupling this
// intake page to the production renderer or game state contract.
Object.assign(window, {
  getAssetPreviewEvidence: () => ({
    schemaVersion: 1,
    assetId: 'tractor-isolated-reconstruction-reference',
    passId: 'blockout',
    camera: { azimuthDeg: 42, elevationDeg: 16, fov: camera.fov },
    renderer: { toneMapping: 'ACESFilmicToneMapping', exposure: renderer.toneMappingExposure, composer: false },
    modelBounds: new THREE.Box3().setFromObject(model).toJSON(),
    meshCount: (() => {
      let count = 0;
      model.traverse((object) => { if (object instanceof THREE.Mesh) count += 1; });
      return count;
    })(),
    ready: status?.dataset.state === 'ready',
  }),
});

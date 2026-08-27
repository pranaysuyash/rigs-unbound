import * as THREE from "three";
import {
  createSnowCrawlerEnvironment,
  createSnowCrawlerLookDevLights,
  createSnowCrawlerModel,
  frameSnowCrawlerCamera,
  snowCrawlerDimensionsFromBlockout,
  type SnowCrawlerViewpoint,
} from "../authored/createSnowCrawlerModel";
import { blockoutFor } from "../../../../src/game/rig-blockout";

const viewpoints: Record<string, SnowCrawlerViewpoint> = {
  "front-three-quarter": { azimuthDeg: -24, elevationDeg: 10 },
  "rear-three-quarter": { azimuthDeg: 142, elevationDeg: 14 },
  side: { azimuthDeg: 90, elevationDeg: 10 },
  "plow-close-up": { azimuthDeg: -16, elevationDeg: 6, distanceScale: 0.55 },
  "roof-detail": { azimuthDeg: 48, elevationDeg: 36, distanceScale: 0.6 },
};

const canvas = document.createElement("canvas");
document.body.appendChild(canvas);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  canvas,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight, false);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.95;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#e8e5df");

const camera = new THREE.PerspectiveCamera(
  32,
  window.innerWidth / window.innerHeight,
  0.01,
  100,
);

// The DIMENSIONS lane is live here too: the review surface renders the same
// blockout-derived model the renderer will mount, not a hand-sized stand-in.
const dims = snowCrawlerDimensionsFromBlockout(
  blockoutFor("snow-crawler-expedition-01"),
);
const model = createSnowCrawlerModel({
  dimensions: dims,
  qualityPriority: "reference-fidelity",
  castShadow: true,
  receiveShadow: true,
});
scene.add(model);

model.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;
  object.castShadow = true;
  object.receiveShadow = true;
});

const bounds = new THREE.Box3().setFromObject(model);
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(16, 16),
  new THREE.MeshStandardMaterial({
    color: "#d8d4cd",
    roughness: 0.96,
    metalness: 0,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = bounds.min.y - 0.02;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(16, 32, 0xc4beb5, 0xd0cbc3);
grid.position.y = floor.position.y + 0.002;
(grid.material as THREE.Material).transparent = true;
(grid.material as THREE.Material).opacity = 0.05;
scene.add(grid);

const environment = createSnowCrawlerEnvironment(renderer);
scene.environment = environment;

let lights: THREE.Group | null = null;
let currentView = "front-three-quarter";
let currentLighting: "neutral" | "grazing" | "reference" = "neutral";

function setLights(mode: typeof currentLighting): void {
  if (lights) scene.remove(lights);
  currentLighting = mode;
  lights = createSnowCrawlerLookDevLights(mode);
  scene.add(lights);
}

function frameView(name: string): void {
  const viewpoint = viewpoints[name];
  if (!viewpoint) throw new Error(`Unknown viewpoint: ${name}`);
  currentView = name;
  frameSnowCrawlerCamera(camera, model, viewpoint);
  updatePressedButtons();
}

function updatePressedButtons(): void {
  document
    .querySelectorAll<HTMLButtonElement>("[data-view]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.view === currentView),
      );
    });
  document
    .querySelectorAll<HTMLButtonElement>("[data-light]")
    .forEach((button) => {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.light === currentLighting),
      );
    });
  const status = document.querySelector<HTMLParagraphElement>("#status");
  if (status)
    status.textContent = `${currentView} · ${currentLighting} lighting · authored rebuild`;
}

function addControls(): void {
  const views = document.querySelector<HTMLDivElement>("#view-controls");
  const lighting = document.querySelector<HTMLDivElement>("#light-controls");
  if (!views || !lighting) return;
  for (const name of Object.keys(viewpoints)) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = name;
    button.dataset.view = name;
    button.addEventListener("click", () => frameView(name));
    views.appendChild(button);
  }
  for (const mode of ["neutral", "grazing", "reference"] as const) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = `${mode} light`;
    button.dataset.light = mode;
    button.addEventListener("click", () => setLights(mode));
    lighting.appendChild(button);
  }
}

function resize(): void {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  frameView(currentView);
}

setLights(currentLighting);
addControls();
frameView(currentView);
window.addEventListener("resize", resize);

// Deliberate browser-review surface for automated evidence capture.
(window as Window & { snowCrawlerReview?: unknown }).snowCrawlerReview = {
  renderer,
  scene,
  camera,
  model,
  setView: frameView,
  setLighting: setLights,
  getState: () => ({
    currentView,
    currentLighting,
    modelChildren: model.children.length,
  }),
};

function render(): void {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

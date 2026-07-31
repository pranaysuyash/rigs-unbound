import * as THREE from "three";
import {
  createFieldPlough01Environment,
  createFieldPlough01LookDevLights,
  createFieldPlough01Model,
  frameFieldPlough01Camera,
} from "../authored/createFieldPloughModel";

type Viewpoint = {
  azimuthDeg: number;
  elevationDeg: number;
};

const viewpoints: Record<string, Viewpoint> = {
  "front-three-quarter": { azimuthDeg: -24, elevationDeg: 10 },
  "rear-three-quarter": { azimuthDeg: 142, elevationDeg: 14 },
  side: { azimuthDeg: 90, elevationDeg: 10 },
  "underside-attachment-close-up": { azimuthDeg: -18, elevationDeg: -12 },
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
renderer.toneMappingExposure = 1.0;

const scene = new THREE.Scene();
scene.background = new THREE.Color("#e8e5df");

const camera = new THREE.PerspectiveCamera(
  32,
  window.innerWidth / window.innerHeight,
  0.01,
  100,
);
const model = createFieldPlough01Model({
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
  new THREE.PlaneGeometry(14, 14),
  new THREE.MeshStandardMaterial({
    color: "#d8d4cd",
    roughness: 0.96,
    metalness: 0,
  }),
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = bounds.min.y - 0.04;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(14, 28, 0xc4beb5, 0xd0cbc3);
grid.position.y = floor.position.y + 0.002;
grid.material.transparent = true;
grid.material.opacity = 0.05;
scene.add(grid);

const environment = createFieldPlough01Environment(renderer);
scene.environment = environment;

let lights: THREE.Group | null = null;
let currentView = "front-three-quarter";
let currentLighting: "neutral" | "grazing" | "reference" = "neutral";

function setLights(mode: typeof currentLighting): void {
  if (lights) scene.remove(lights);
  currentLighting = mode;
  lights = createFieldPlough01LookDevLights(mode);
  scene.add(lights);
}

function frameView(name: string): void {
  const viewpoint = viewpoints[name];
  if (!viewpoint) throw new Error(`Unknown viewpoint: ${name}`);
  currentView = name;
  frameFieldPlough01Camera(camera, model, {
    ...viewpoint,
    margin: name === "underside-attachment-close-up" ? 1.2 : 1.25,
  });
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
    status.textContent = `${currentView} · ${currentLighting} lighting · visual rebuild`;
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
(window as Window & { fieldPloughReview?: unknown }).fieldPloughReview = {
  renderer,
  scene,
  camera,
  model,
  setView: frameView,
  setLighting: setLights,
  createVariant: (
    variant: {
      shareCount?: 3 | 4;
      wearLevel?: number;
      paintColor?: THREE.ColorRepresentation;
    } = {},
  ) => {
    return createFieldPlough01Model(variant);
  },
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

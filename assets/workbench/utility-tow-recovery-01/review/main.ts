import * as THREE from "three";
import {
  createUtilityTowModel,
  type UtilityTowModelOptions,
} from "../authored/createUtilityTowModel";

type Viewpoint = {
  azimuthDeg: number;
  elevationDeg: number;
  margin: number;
  target?: [number, number, number];
};

// Azimuth 0 looks at the rig nose (+Z is rig-forward in the ground frame).
const viewpoints: Record<string, Viewpoint> = {
  "front-three-quarter": { azimuthDeg: -26, elevationDeg: 11, margin: 1.3 },
  "rear-three-quarter": { azimuthDeg: 142, elevationDeg: 14, margin: 1.3 },
  side: { azimuthDeg: 90, elevationDeg: 9, margin: 1.3 },
  "boom-close-up": {
    azimuthDeg: 150,
    elevationDeg: 6,
    margin: 2.6,
    target: [0, 1.9, -1.4],
  },
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
  120,
);
const model = createUtilityTowModel({ castShadow: true, receiveShadow: true });
scene.add(model);

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
floor.position.y = bounds.min.y - 0.04;
floor.receiveShadow = true;
scene.add(floor);

const grid = new THREE.GridHelper(16, 32, 0xc4beb5, 0xd0cbc3);
grid.position.y = floor.position.y + 0.002;
grid.material.transparent = true;
grid.material.opacity = 0.05;
scene.add(grid);

function makeLights(mode: "neutral" | "grazing"): THREE.Group {
  const group = new THREE.Group();
  group.name = `lookdev-${mode}`;
  const key = new THREE.DirectionalLight(0xfff2e2, mode === "grazing" ? 2.4 : 2.0);
  key.position.set(
    mode === "grazing" ? 6 : 5,
    mode === "grazing" ? 2.2 : 9,
    mode === "grazing" ? -4 : 6,
  );
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 40;
  const shadowExtents = 7;
  key.shadow.camera.left = -shadowExtents;
  key.shadow.camera.right = shadowExtents;
  key.shadow.camera.top = shadowExtents;
  key.shadow.camera.bottom = -shadowExtents;
  group.add(key);
  const fill = new THREE.DirectionalLight(0xd8e6f2, 0.7);
  fill.position.set(-6, 5, -3);
  group.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 0.5);
  rim.position.set(0, 6, -9);
  group.add(rim);
  group.add(new THREE.HemisphereLight(0xf4efe7, 0x8a8478, 0.55));
  return group;
}

let lights: THREE.Group | null = null;
let currentView = "front-three-quarter";
let currentLighting: "neutral" | "grazing" = "neutral";

function setLights(mode: "neutral" | "grazing"): void {
  if (lights) scene.remove(lights);
  currentLighting = mode;
  lights = makeLights(mode);
  scene.add(lights);
}

function frameView(name: string): void {
  const viewpoint = viewpoints[name];
  if (!viewpoint) throw new Error(`Unknown viewpoint: ${name}`);
  currentView = name;
  const target = new THREE.Vector3(...(viewpoint.target ?? [0, 0, 0]));
  if (!viewpoint.target) {
    const box = new THREE.Box3().setFromObject(model);
    box.getCenter(target);
  }
  const radius = new THREE.Box3().setFromObject(model)
    .getSize(new THREE.Vector3())
    .length() / 2;
  const distance =
    (radius * viewpoint.margin) / Math.sin((camera.fov * Math.PI) / 360);
  const azimuth = (viewpoint.azimuthDeg * Math.PI) / 180;
  const elevation = (viewpoint.elevationDeg * Math.PI) / 180;
  camera.position.set(
    target.x + distance * Math.sin(azimuth) * Math.cos(elevation),
    target.y + distance * Math.sin(elevation),
    target.z + distance * Math.cos(azimuth) * Math.cos(elevation),
  );
  camera.lookAt(target);
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
  for (const mode of ["neutral", "grazing"] as const) {
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
(window as Window & { utilityTowReview?: unknown }).utilityTowReview = {
  renderer,
  scene,
  camera,
  model,
  setView: frameView,
  setLighting: setLights,
  createVariant: (variant: UtilityTowModelOptions = {}) =>
    createUtilityTowModel(variant),
  getState: () => ({
    currentView,
    currentLighting,
    modelChildren: model.children.map((child) => child.name),
  }),
};

function render(): void {
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

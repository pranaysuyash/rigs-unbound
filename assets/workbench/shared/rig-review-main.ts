import * as THREE from "three";

/**
 * Shared generic review surface for any authored rig workbench factory.
 *
 * `?rig=<workbench-id>` (a directory under `assets/workbench/`) loads that
 * rig's `authored/create*Model.ts` factory and exposes the same window-key
 * contract the individual review pages use, so
 * `tools/capture-rig-model-review.cjs` can capture evidence for every rig
 * without each workbench carrying a bespoke review page.
 *
 * Factories that export their own environment/lighting/camera helpers (like
 * the snow crawler) keep their bespoke pages; this surface is the baseline
 * for the Wave-1 fleet wiring where the factories are self-sized.
 */

const rigId = new URLSearchParams(window.location.search).get("rig");
if (!rigId) {
  document.querySelector("#status")!.textContent =
    "Missing ?rig=<workbench-id> query parameter.";
  throw new Error("rig-review: ?rig query parameter required");
}

const factories = import.meta.glob("../*/authored/create*Model.ts");
const matchKey = Object.keys(factories).find((key) =>
  key.includes(`/${rigId}/authored/`),
);
if (!matchKey) {
  document.querySelector("#status")!.textContent = `No authored factory for ${rigId}.`;
  throw new Error(`rig-review: no authored factory matches ${rigId}`);
}

type FactoryModule = Record<string, unknown>;
const module = (await factories[matchKey]!()) as FactoryModule;
const createName = Object.keys(module).find(
  (name) => name.startsWith("create") && typeof module[name] === "function",
);
if (!createName) {
  throw new Error(`rig-review: ${matchKey} exports no create* function`);
}
const createModel = module[createName] as (options?: unknown) => THREE.Group;

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

const model = createModel({});
scene.add(model);

model.traverse((object) => {
  if (!(object instanceof THREE.Mesh)) return;
  object.castShadow = true;
  object.receiveShadow = true;
});

const bounds = new THREE.Box3().setFromObject(model);
const centre = bounds.getCenter(new THREE.Vector3());
const radius = bounds.getBoundingSphere(new THREE.Sphere()).radius;
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(radius * 8, radius * 8),
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

const grid = new THREE.GridHelper(radius * 8, 32, 0xc4beb5, 0xd0cbc3);
grid.position.y = floor.position.y + 0.002;
(grid.material as THREE.Material).transparent = true;
(grid.material as THREE.Material).opacity = 0.05;
scene.add(grid);

/** Neutral three-point studio rig; grazing rakes one low key light. */
function buildLights(mode: "neutral" | "grazing" | "reference"): THREE.Group {
  const group = new THREE.Group();
  const key = new THREE.DirectionalLight(0xfff4e0, mode === "grazing" ? 2.4 : 1.9);
  key.position.set(
    mode === "grazing" ? centre.x + radius * 0.15 : centre.x + radius * 1.2,
    centre.y + (mode === "grazing" ? radius * 0.25 : radius * 1.6),
    centre.z + radius * 1.8,
  );
  key.castShadow = true;
  key.shadow.camera.left = -radius * 2;
  key.shadow.camera.right = radius * 2;
  key.shadow.camera.top = radius * 2;
  key.shadow.camera.bottom = -radius * 2;
  key.shadow.camera.far = radius * 12;
  group.add(key);

  const fill = new THREE.DirectionalLight(0xdfe8f2, 0.7);
  fill.position.set(centre.x - radius * 1.5, centre.y + radius * 0.8, centre.z + radius * 0.6);
  group.add(fill);

  const rim = new THREE.DirectionalLight(0xffffff, mode === "reference" ? 1.1 : 0.6);
  rim.position.set(centre.x, centre.y + radius * 1.2, centre.z - radius * 2);
  group.add(rim);

  group.add(new THREE.HemisphereLight(0xf4efe6, 0x8d8a84, 0.55));
  return group;
}

const viewpoints: Record<string, { azimuthDeg: number; elevationDeg: number; distanceScale?: number }> = {
  "front-three-quarter": { azimuthDeg: -24, elevationDeg: 10 },
  "rear-three-quarter": { azimuthDeg: 142, elevationDeg: 14 },
  side: { azimuthDeg: 90, elevationDeg: 10 },
};

let lights: THREE.Group | null = null;
let currentView = "front-three-quarter";
let currentLighting: "neutral" | "grazing" | "reference" = "neutral";

function setLights(mode: typeof currentLighting): void {
  if (lights) scene.remove(lights);
  currentLighting = mode;
  lights = buildLights(mode);
  scene.add(lights);
}

function frameView(name: string): void {
  const viewpoint = viewpoints[name];
  if (!viewpoint) throw new Error(`Unknown viewpoint: ${name}`);
  currentView = name;
  const distance =
    (radius / Math.sin((camera.fov * Math.PI) / 360)) *
    1.15 *
    (viewpoint.distanceScale ?? 1);
  const azimuth = (viewpoint.azimuthDeg * Math.PI) / 180;
  const elevation = (viewpoint.elevationDeg * Math.PI) / 180;
  camera.position.set(
    centre.x + distance * Math.cos(elevation) * Math.sin(azimuth),
    centre.y + distance * Math.sin(elevation),
    centre.z + distance * Math.cos(elevation) * Math.cos(azimuth),
  );
  camera.lookAt(centre);
  updatePressedButtons();
}

function updatePressedButtons(): void {
  document.querySelectorAll<HTMLButtonElement>("[data-view]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.view === currentView));
  });
  document.querySelectorAll<HTMLButtonElement>("[data-light]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.light === currentLighting));
  });
  const status = document.querySelector<HTMLParagraphElement>("#status");
  if (status)
    status.textContent = `${rigId} · ${createName} · ${currentView} · ${currentLighting}`;
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
(window as Window & { rigReview?: unknown }).rigReview = {
  renderer,
  scene,
  camera,
  model,
  setView: frameView,
  setLighting: setLights,
  getState: () => ({
    rigId,
    factory: createName,
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

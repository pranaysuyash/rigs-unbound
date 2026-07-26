/**
 * Hood Dashboard UI: Diegetic analog instrument panel for Hood Camera view.
 *
 * Appears on screen when cameraMode === 'hood'. Animates speedometer needle,
 * engine strain gauge, surface grip meter, and winch tension using GSAP.
 */

import { gsap } from "gsap";
import type { GameState, RigState } from "./contracts";

export interface HoodDashboardController {
  element: HTMLElement;
  update(state: GameState): void;
  show(): void;
  hide(): void;
  isVisible(): boolean;
  dispose(): void;
}

export function createHoodDashboardUI(
  container: HTMLElement,
): HoodDashboardController {
  const panel = document.createElement("div");
  panel.id = "hood-dashboard-panel";
  panel.className = "hood-dashboard-panel hidden";

  panel.innerHTML = `
    <div class="hood-dash-frame">
      <!-- Left Dial: Speedometer -->
      <div class="dash-dial speed-dial">
        <svg class="dial-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" class="dial-bg" />
          <path d="M 20 75 A 35 35 0 1 1 80 75" class="dial-arc" />
          <line id="speed-needle" x1="50" y1="50" x2="50" y2="20" class="dial-needle" />
          <circle cx="50" cy="50" r="5" class="dial-cap" />
        </svg>
        <div class="dial-readout">
          <span id="speed-val">0.0</span>
          <label>M/S</label>
        </div>
      </div>

      <!-- Center Cluster: Strain & Surface Grip -->
      <div class="dash-center-cluster">
        <div class="cluster-gauge">
          <label>ENGINE STRAIN</label>
          <div class="bar-track">
            <div id="strain-bar-fill" class="bar-fill strain-fill"></div>
          </div>
        </div>
        <div class="cluster-gauge">
          <label>SURFACE GRIP</label>
          <div class="bar-track">
            <div id="grip-bar-fill" class="bar-fill grip-fill"></div>
          </div>
        </div>
        <div class="surface-badge" id="surface-name-badge">TRACK</div>
      </div>

      <!-- Right Dial: Tachometer & Winch Tension -->
      <div class="dash-dial tach-dial">
        <svg class="dial-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" class="dial-bg" />
          <path d="M 20 75 A 35 35 0 1 1 80 75" class="dial-arc redline-arc" />
          <line id="tacho-needle" x1="50" y1="50" x2="50" y2="20" class="dial-needle tach-needle" />
          <circle cx="50" cy="50" r="5" class="dial-cap" />
        </svg>
        <div class="dial-readout">
          <span id="strain-percent">0%</span>
          <label>LOAD</label>
        </div>
      </div>
    </div>
  `;

  container.appendChild(panel);

  let visible = false;
  let lastSpeed = 0;
  let lastStrain = 0;

  const controller: HoodDashboardController = {
    element: panel,

    isVisible() {
      return visible;
    },

    show() {
      if (visible) return;
      visible = true;
      panel.classList.remove("hidden");
      gsap.fromTo(
        panel,
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4, ease: "power2.out" },
      );
    },

    hide() {
      if (!visible) return;
      visible = false;
      gsap.to(panel, {
        y: 40,
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          panel.classList.add("hidden");
        },
      });
    },

    update(state: GameState) {
      const activeRig: RigState | undefined = state.rigs[state.activeRigId];
      if (!activeRig) return;

      if (state.cameraMode === "hood") {
        controller.show();
      } else {
        controller.hide();
        return;
      }

      const speed = Math.abs(activeRig.speed);
      const strain = activeRig.strain;
      const grip = activeRig.telemetry.grip;

      // Update Text Readouts
      const speedVal = panel.querySelector("#speed-val");
      const strainPercent = panel.querySelector("#strain-percent");
      const surfaceBadge = panel.querySelector("#surface-name-badge");

      if (speedVal) speedVal.textContent = speed.toFixed(1);
      if (strainPercent)
        strainPercent.textContent = `${Math.round(strain * 100)}%`;
      if (surfaceBadge)
        surfaceBadge.textContent = activeRig.telemetry.surfaceId.toUpperCase();

      // Smooth Needle Angle Updates via GSAP
      const speedNeedle = panel.querySelector("#speed-needle");
      const tachoNeedle = panel.querySelector("#tacho-needle");
      const strainFill = panel.querySelector("#strain-bar-fill") as HTMLElement;
      const gripFill = panel.querySelector("#grip-bar-fill") as HTMLElement;

      const speedAngle = -120 + Math.min(speed / 25, 1) * 240;
      const strainAngle = -120 + Math.min(strain, 1) * 240;

      if (speedNeedle && Math.abs(speed - lastSpeed) > 0.05) {
        gsap.to(speedNeedle, {
          rotation: speedAngle,
          transformOrigin: "50% 50%",
          duration: 0.15,
          overwrite: true,
        });
        lastSpeed = speed;
      }

      if (tachoNeedle && Math.abs(strain - lastStrain) > 0.02) {
        gsap.to(tachoNeedle, {
          rotation: strainAngle,
          transformOrigin: "50% 50%",
          duration: 0.15,
          overwrite: true,
        });
        lastStrain = strain;
      }

      if (strainFill) {
        strainFill.style.width = `${Math.min(strain * 100, 100)}%`;
      }
      if (gripFill) {
        gripFill.style.width = `${Math.min(grip * 100, 100)}%`;
      }
    },

    dispose() {
      panel.remove();
    },
  };

  return controller;
}

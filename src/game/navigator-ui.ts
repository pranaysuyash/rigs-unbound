/**
 * Navigator UI: Tactical opportunity radar and waypoint targeting system.
 *
 * Provides high-resolution radar, salvage node pings, and waypoint targeting.
 * Accessible on desktop via tactical overlay toggle or phone companion view.
 */

import type { GameState, RigState } from "./contracts";
import { WORLD_SITES } from "./world";
import { deriveRadioSignal } from "./radio-scanner";
import { deriveRumorGraph } from "./rumor-graph";

export interface Waypoint {
  id: string;
  x: number;
  z: number;
  label: string;
  createdAt: number;
}

export interface NavigatorController {
  element: HTMLElement;
  update(state: GameState): void;
  setWaypoint(x: number, z: number, label?: string): Waypoint;
  clearWaypoint(id: string): void;
  getWaypoints(): readonly Waypoint[];
  dispose(): void;
}

export function createNavigatorUI(container: HTMLElement): NavigatorController {
  const panel = document.createElement("div");
  panel.id = "navigator-panel";
  panel.className = "navigator-panel";

  panel.innerHTML = `
    <div class="nav-frame">
      <div class="nav-header">
        <span class="nav-title">TACTICAL RADAR & NAVIGATOR</span>
        <span id="nav-coords" class="nav-coords">X: 0.0 Z: 0.0</span>
      </div>

      <div class="nav-radar-viewport">
        <svg id="nav-radar-svg" class="nav-radar-svg" viewBox="-100 -100 200 200">
          <circle cx="0" cy="0" r="90" fill="none" stroke="rgba(107,201,196,0.2)" stroke-width="1" />
          <circle cx="0" cy="0" r="60" fill="none" stroke="rgba(107,201,196,0.15)" stroke-dasharray="3,3" />
          <circle cx="0" cy="0" r="30" fill="none" stroke="rgba(107,201,196,0.15)" stroke-dasharray="3,3" />
          <line x1="-90" y1="0" x2="90" y2="0" stroke="rgba(107,201,196,0.25)" />
          <line x1="0" y1="-90" x2="0" y2="90" stroke="rgba(107,201,196,0.25)" />

          <!-- Radar Sweep Beam -->
          <line id="radar-sweep" x1="0" y1="0" x2="0" y2="-90" stroke="rgba(107,201,196,0.6)" stroke-width="1.5" />

          <!-- World Sites Group -->
          <g id="radar-sites-group"></g>
          <!-- Active Rig Blip -->
          <circle id="radar-rig-blip" cx="0" cy="0" r="3.5" fill="#e89d43" stroke="#fff" stroke-width="1" />
          <!-- Waypoints Group -->
          <g id="radar-waypoints-group"></g>
        </svg>
      </div>

      <div class="nav-footer">
        <span id="nav-waypoint-info">WAYPOINT: NONE</span>
        <span id="nav-signal-info">RADIO: QUIET</span>
        <button id="clear-waypoints-btn" class="nav-btn">CLEAR PINGS</button>
      </div>
    </div>
  `;

  container.appendChild(panel);

  const waypoints: Waypoint[] = [];
  let radarAngle = 0;

  const radarSvg = panel.querySelector(
    "#nav-radar-svg",
  ) as SVGSVGElement | null;
  const clearBtn = panel.querySelector("#clear-waypoints-btn");

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      waypoints.length = 0;
    });
  }

  // Click on radar to set a target waypoint
  if (radarSvg) {
    radarSvg.addEventListener("click", (evt) => {
      const rect = radarSvg.getBoundingClientRect();
      const clickX = evt.clientX - rect.left;
      const clickY = evt.clientY - rect.top;

      // Map SVG viewport coordinates (-100 to 100)
      const svgX = (clickX / rect.width) * 200 - 100;
      const svgZ = (clickY / rect.height) * 200 - 100;

      // Scale up to world coordinates (world radius ~200)
      const worldX = svgX * 2;
      const worldZ = svgZ * 2;

      controller.setWaypoint(worldX, worldZ, `PING ${waypoints.length + 1}`);
    });
  }

  const controller: NavigatorController = {
    element: panel,

    getWaypoints() {
      return waypoints;
    },

    setWaypoint(x: number, z: number, label = "WAYPOINT"): Waypoint {
      const wp: Waypoint = {
        id: `wp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        x,
        z,
        label,
        createdAt: Date.now(),
      };
      waypoints.push(wp);
      return wp;
    },

    clearWaypoint(id: string) {
      const idx = waypoints.findIndex((w) => w.id === id);
      if (idx !== -1) waypoints.splice(idx, 1);
    },

    update(state: GameState) {
      const activeRig: RigState | undefined = state.rigs[state.activeRigId];
      if (!activeRig) return;

      // Update Rig Coordinates
      const coordsText = panel.querySelector("#nav-coords");
      if (coordsText) {
        coordsText.textContent = `X: ${activeRig.x.toFixed(1)} Z: ${activeRig.z.toFixed(1)}`;
      }

      // Rotate Sweep Beam
      const sweepLine = panel.querySelector("#radar-sweep");
      if (sweepLine) {
        radarAngle = (radarAngle + 2) % 360;
        sweepLine.setAttribute("transform", `rotate(${radarAngle} 0 0)`);
      }

      // Position Rig Blip
      const rigBlip = panel.querySelector("#radar-rig-blip");
      if (rigBlip) {
        // Map world position to radar scale (world scale 200 -> radar 100)
        const radarX = (activeRig.x / 200) * 90;
        const radarZ = (activeRig.z / 200) * 90;
        rigBlip.setAttribute("cx", String(radarX));
        rigBlip.setAttribute("cy", String(radarZ));
      }

      // Render World Sites
      const sitesGroup = panel.querySelector("#radar-sites-group");
      if (sitesGroup) {
        const rumorGraph = deriveRumorGraph(state);
        const knownSites = WORLD_SITES.flatMap((site) => {
          const node = rumorGraph.nodes[site.id];
          return node && node.status !== "undiscovered"
            ? [{ site, status: node.status }]
            : [];
        });
        const undiscoveredSites = WORLD_SITES.filter(
          (site) => rumorGraph.nodes[site.id]?.status === "undiscovered",
        );
        const signal = deriveRadioSignal(
          activeRig.x,
          activeRig.z,
          undiscoveredSites.map((site) => ({
            name: site.id,
            x: site.x,
            z: site.z,
          })),
        );
        const trace =
          signal.nearestTargetName === null
            ? null
            : (undiscoveredSites.find(
                (site) => site.id === signal.nearestTargetName,
              ) ?? null);

        sitesGroup.innerHTML = [
          ...knownSites.map(({ site, status }) => {
            const sx = (site.x / 200) * 90;
            const sz = (site.z / 200) * 90;
            return status === "rumored"
              ? `<circle cx="${sx}" cy="${sz}" r="2.8" fill="none" stroke="rgba(232,157,67,0.9)" stroke-width="1.2" stroke-dasharray="2,1" />`
              : `<circle cx="${sx}" cy="${sz}" r="2" fill="rgba(107,201,196,0.6)" />`;
          }),
          ...(trace
            ? [
                `<circle cx="${(trace.x / 200) * 90}" cy="${(trace.z / 200) * 90}" r="3" fill="none" stroke="rgba(232,157,67,0.9)" stroke-width="1.2" stroke-dasharray="2,2" />`,
              ]
            : []),
        ].join("");

        const signalInfo = panel.querySelector("#nav-signal-info");
        if (signalInfo) {
          signalInfo.textContent = trace
            ? `RADIO: ${Math.round(signal.distanceMeters)}M TRACE`
            : "RADIO: QUIET";
        }
      }

      // Render Waypoint Markers
      const waypointsGroup = panel.querySelector("#radar-waypoints-group");
      const infoText = panel.querySelector("#nav-waypoint-info");

      if (waypointsGroup) {
        waypointsGroup.innerHTML = waypoints
          .map((wp) => {
            const wx = (wp.x / 200) * 90;
            const wz = (wp.z / 200) * 90;
            return `
              <g class="wp-group">
                <circle cx="${wx}" cy="${wz}" r="4" fill="none" stroke="#e89d43" stroke-width="1.5" />
                <line x1="${wx - 3}" y1="${wz}" x2="${wx + 3}" y2="${wz}" stroke="#e89d43" stroke-width="1" />
                <line x1="${wx}" y1="${wz - 3}" x2="${wx}" y2="${wz + 3}" stroke="#e89d43" stroke-width="1" />
              </g>
            `;
          })
          .join("");
      }

      if (infoText) {
        const last = waypoints[waypoints.length - 1];
        if (last) {
          const dist = Math.hypot(last.x - activeRig.x, last.z - activeRig.z);
          infoText.textContent = `TARGET: ${last.label} (${dist.toFixed(0)}M)`;
        } else {
          infoText.textContent = "WAYPOINT: NONE";
        }
      }
    },

    dispose() {
      panel.remove();
    },
  };

  return controller;
}

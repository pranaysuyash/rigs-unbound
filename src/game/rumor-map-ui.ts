/**
 * Rumor Map UI: Interactive SVG field-kit blueprint overlay for Rigs Unbound.
 *
 * Choreographed using GSAP timeline animations for node entrances, vector edge
 * rendering, and inspector panel slides.
 */

import { gsap } from "gsap";
import type { GameState } from "./contracts";
import {
  deriveRumorGraph,
  type RumorGraph,
  type RumorNode,
} from "./rumor-graph";

export interface RumorMapController {
  element: HTMLElement;
  open(state: GameState): void;
  close(): void;
  isOpen(): boolean;
  update(state: GameState): void;
  dispose(): void;
}

export function createRumorMapUI(
  container: HTMLElement,
  onClose?: () => void,
): RumorMapController {
  const overlay = document.createElement("div");
  overlay.id = "rumor-map-overlay";
  overlay.className = "rumor-map-overlay hidden";

  overlay.innerHTML = `
    <div class="rumor-map-frame">
      <header class="rumor-map-header">
        <div class="rumor-map-title-block">
          <span class="rumor-map-badge">FIELD KIT ATLAS</span>
          <h2>PATCHWORK RUMOR GRAPH</h2>
        </div>
        <div class="rumor-map-stats">
          <span id="rumor-stat-nodes">DISCOVERIES: 0/0</span>
          <span id="rumor-stat-salvage">SALVAGE: 0</span>
        </div>
        <button id="rumor-map-close-btn" class="rumor-map-close-btn" aria-label="Close Map">✕ CLOSE [M]</button>
      </header>

      <div class="rumor-map-viewport">
        <svg id="rumor-map-svg" class="rumor-map-svg" viewBox="-200 -200 400 400" preserveAspectRatio="xMidYMid meet">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="0.5"/>
            </pattern>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="-200" y="-200" width="400" height="400" fill="url(#grid)" />
          <g id="rumor-edges-group"></g>
          <g id="rumor-nodes-group"></g>
        </svg>

        <!-- Inspector Card -->
        <aside id="rumor-inspector" class="rumor-inspector hidden">
          <div class="inspector-badge" id="inspector-badge">SITE DETAILS</div>
          <h3 id="inspector-title">Node Title</h3>
          <p id="inspector-desc">Node description and survey details go here.</p>
          <div class="inspector-meta">
            <div class="meta-row"><span>BIOME:</span> <strong id="inspector-biome">-</strong></div>
            <div class="meta-row"><span>VERB:</span> <strong id="inspector-verb">-</strong></div>
            <div class="meta-row"><span>REQUIRED:</span> <strong id="inspector-req">-</strong></div>
            <div class="meta-row"><span>STATUS:</span> <strong id="inspector-status">-</strong></div>
          </div>
        </aside>
      </div>

      <footer class="rumor-map-footer">
        <span>NAVIGATION: DRAG / TAP NODE FOR DETAILS</span>
        <span>RIGS UNBOUND FIELD INSTRUMENT v0.1</span>
      </footer>
    </div>
  `;

  container.appendChild(overlay);

  const closeBtn = overlay.querySelector("#rumor-map-close-btn");
  closeBtn?.addEventListener("click", () => {
    controller.close();
    if (onClose) onClose();
  });

  let currentGraph: RumorGraph | null = null;
  let activeTimeline: gsap.core.Timeline | null = null;
  let currentlyOpen = false;

  const controller: RumorMapController = {
    element: overlay,

    isOpen() {
      return currentlyOpen;
    },

    open(state: GameState) {
      currentlyOpen = true;
      overlay.classList.remove("hidden");
      controller.update(state);

      // GSAP Entrance Timeline
      if (activeTimeline) activeTimeline.kill();
      activeTimeline = gsap.timeline();

      activeTimeline
        .fromTo(
          overlay,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.35, ease: "power2.out" },
        )
        .fromTo(
          ".rumor-node-circle",
          { scale: 0, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.7)",
          },
          "-=0.15",
        );
    },

    close() {
      if (!currentlyOpen) return;
      currentlyOpen = false;

      if (activeTimeline) activeTimeline.kill();
      activeTimeline = gsap.timeline({
        onComplete: () => {
          overlay.classList.add("hidden");
        },
      });

      activeTimeline.to(overlay, {
        opacity: 0,
        scale: 0.98,
        duration: 0.25,
        ease: "power2.in",
      });
    },

    update(state: GameState) {
      currentGraph = deriveRumorGraph(state);

      // Update Header Stats
      const statNodes = overlay.querySelector("#rumor-stat-nodes");
      const statSalvage = overlay.querySelector("#rumor-stat-salvage");
      if (statNodes) {
        statNodes.textContent = `DISCOVERIES: ${currentGraph.stats.discoveredCount}/${currentGraph.stats.totalNodes}`;
      }
      if (statSalvage) {
        statSalvage.textContent = `SALVAGE: ${state.salvage}`;
      }

      // Render Edges
      const edgesGroup = overlay.querySelector("#rumor-edges-group");
      if (edgesGroup) {
        edgesGroup.innerHTML = currentGraph.edges
          .map((edge) => {
            const fromNode = currentGraph!.nodes[edge.fromId];
            const toNode = currentGraph!.nodes[edge.toId];
            if (!fromNode || !toNode) return "";

            const strokeColor = edge.active
              ? "rgba(107, 201, 196, 0.75)"
              : "rgba(255, 255, 255, 0.15)";
            const dashAttr = edge.active ? "" : 'stroke-dasharray="4,4"';

            return `<line x1="${fromNode.x}" y1="${fromNode.z}" x2="${toNode.x}" y2="${toNode.z}" 
              stroke="${strokeColor}" stroke-width="1.8" ${dashAttr} />`;
          })
          .join("");
      }

      // Render Nodes
      const nodesGroup = overlay.querySelector("#rumor-nodes-group");
      if (nodesGroup) {
        nodesGroup.innerHTML = Object.values(currentGraph.nodes)
          .map((node) => {
            let fillColor = "#333";
            let strokeColor = "#666";
            let radius = 6;

            if (node.status === "visited") {
              fillColor = "#e89d43"; // Amber
              strokeColor = "#fff";
              radius = 8;
            } else if (node.status === "completed") {
              fillColor = "#6bc9c4"; // Cyan
              strokeColor = "#fff";
              radius = 9;
            } else if (node.status === "rumored") {
              fillColor = "rgba(232, 157, 67, 0.25)";
              strokeColor = "#e89d43";
              radius = 7;
            }

            return `
              <g class="rumor-node-group" data-id="${node.id}" style="cursor: pointer;">
                <circle class="rumor-node-circle" cx="${node.x}" cy="${node.z}" r="${radius}" 
                  fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" filter="${node.status !== "undiscovered" ? "url(#glow)" : ""}" />
                <text x="${node.x}" y="${node.z + 14}" fill="rgba(255,255,255,0.85)" font-size="7" text-anchor="middle" font-family="monospace">${node.title}</text>
              </g>
            `;
          })
          .join("");

        // Attach node click listeners to populate inspector card
        nodesGroup.querySelectorAll(".rumor-node-group").forEach((group) => {
          group.addEventListener("click", () => {
            const nodeId = group.getAttribute("data-id");
            if (nodeId && currentGraph && currentGraph.nodes[nodeId]) {
              showInspector(currentGraph.nodes[nodeId]);
            }
          });
        });
      }
    },

    dispose() {
      if (activeTimeline) activeTimeline.kill();
      overlay.remove();
    },
  };

  function showInspector(node: RumorNode) {
    const inspector = overlay.querySelector("#rumor-inspector");
    if (!inspector) return;

    inspector.classList.remove("hidden");
    const badge = inspector.querySelector("#inspector-badge");
    const title = inspector.querySelector("#inspector-title");
    const desc = inspector.querySelector("#inspector-desc");
    const biome = inspector.querySelector("#inspector-biome");
    const verb = inspector.querySelector("#inspector-verb");
    const req = inspector.querySelector("#inspector-req");
    const status = inspector.querySelector("#inspector-status");

    if (badge) badge.textContent = node.type.toUpperCase();
    if (title) title.textContent = node.title;
    if (desc) desc.textContent = node.description;
    if (biome) biome.textContent = node.biome ?? "N/A";
    if (verb) verb.textContent = node.verb ?? "N/A";
    if (req) req.textContent = node.requiredCapability ?? "None";
    if (status) status.textContent = node.status.toUpperCase();

    // GSAP Inspector Slide-In
    gsap.fromTo(
      inspector,
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
    );
  }

  return controller;
}

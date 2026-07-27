/**
 * Campaign Progression & Contract Engine.
 *
 * Connects Rumor Map site discoveries into active delivery contracts, unlocking
 * regional berths, module blueprints, and scrap rewards upon completion.
 */

import type { GameState, RigCapability } from "./contracts";


export interface CampaignContract {
  id: string;
  title: string;
  description: string;
  originSiteId: string;
  destinationSiteId: string;
  requiredCapability?: RigCapability;
  rewardScrap: number;
  status: "locked" | "available" | "active" | "completed";
}

export const CAMPAIGN_CONTRACTS: readonly CampaignContract[] = [
  {
    id: "contract-sunken-relay",
    title: "Sunken Flats Submerged Relay",
    description: "Transport heavy relay equipment from Home Farm to the Sunken Flats causeway.",
    originSiteId: "home-farm",
    destinationSiteId: "sunken-flats",
    requiredCapability: "tow",
    rewardScrap: 250,
    status: "available",
  },
  {
    id: "contract-ridge-ascent",
    title: "Launch Ridge Beacon Delivery",
    description: "Deliver high-gain antenna components to the summit of Launch Ridge.",
    originSiteId: "home-farm",
    destinationSiteId: "launch-ridge",
    requiredCapability: "jump",
    rewardScrap: 400,
    status: "locked",
  },
  {
    id: "contract-marsh-ford",
    title: "Marsh Skimmer Supply Run",
    description: "Ford the flooded basin to deliver emergency field rations to the Marsh Depot.",
    originSiteId: "home-farm",
    destinationSiteId: "marsh-depot",
    requiredCapability: "ford",
    rewardScrap: 350,
    status: "locked",
  },
];

export function deriveCampaignContracts(state: GameState): CampaignContract[] {
  const discoveredSiteIds = new Set(state.discoveries.map((d) => d.id));

  return CAMPAIGN_CONTRACTS.map((contract) => {
    // Contract is available if origin site is discovered
    const originDiscovered = discoveredSiteIds.has(contract.originSiteId) || contract.originSiteId === "home-farm";
    const isCompleted = state.cargoRelay.status === "complete" && contract.id === "contract-sunken-relay";

    let status: CampaignContract["status"] = "locked";
    if (isCompleted) {
      status = "completed";
    } else if (state.cargoRelay.status === "active" && contract.id === "contract-sunken-relay") {
      status = "active";
    } else if (originDiscovered) {
      status = "available";
    }

    return {
      ...contract,
      status,
    };
  });
}

export function activeContractCount(state: GameState): number {
  return deriveCampaignContracts(state).filter((c) => c.status === "active").length;
}

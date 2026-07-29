/**
 * Campaign Progression & Contract Engine.
 *
 * Connects Rumor Map site discoveries into active delivery contracts, unlocking
 * regional berths, module blueprints, and scrap rewards upon completion.
 */

import type { RigCapability } from "./contracts";

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
    description:
      "Transport heavy relay equipment from the Home Silo to the Sunken Flats causeway.",
    originSiteId: "home-silo",
    destinationSiteId: "sunken-flats",
    requiredCapability: "tow",
    rewardScrap: 250,
    status: "available",
  },
  {
    id: "contract-ridge-ascent",
    title: "Launch Ridge Beacon Delivery",
    description:
      "Deliver high-gain antenna components to the summit of Launch Ridge.",
    originSiteId: "home-silo",
    destinationSiteId: "launch-ridge",
    requiredCapability: "jump",
    rewardScrap: 400,
    status: "locked",
  },
  {
    // Dormant: "marsh-depot" is not yet an authored world site. The mission
    // generator skips contracts whose sites do not resolve, so this entry
    // stays inert until the world-content tranche lands the Marsh Depot.
    id: "contract-marsh-ford",
    title: "Marsh Skimmer Supply Run",
    description:
      "Ford the flooded basin to deliver emergency field rations to the Marsh Depot.",
    originSiteId: "home-silo",
    destinationSiteId: "marsh-depot",
    requiredCapability: "ford",
    rewardScrap: 350,
    status: "locked",
  },
];


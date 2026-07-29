/**
 * Campaign Progression & Contract Engine.
 *
 * Connects Rumor Map site discoveries into active delivery contracts, unlocking
 * regional berths, module blueprints, and scrap rewards upon completion.
 */

import type { RigCapability } from "./contracts";
import type { SettlementNeedOutcomeId } from "./settlement-needs";

export interface CampaignContract {
  id: string;
  title: string;
  description: string;
  originSiteId: string;
  destinationSiteId: string;
  requiredCapability?: RigCapability;
  settlementOutcomeId?: SettlementNeedOutcomeId;
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
    settlementOutcomeId: "sunken-flats-causeway",
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
    settlementOutcomeId: "launch-ridge-repeater",
    rewardScrap: 400,
    status: "locked",
  },
  {
    id: "contract-marsh-ford",
    title: "Marsh Skimmer Supply Run",
    description:
      "Ford the flooded basin to deliver emergency field rations to the Marsh Depot.",
    originSiteId: "home-silo",
    destinationSiteId: "marsh-depot",
    requiredCapability: "ford",
    settlementOutcomeId: "marsh-depot-relief",
    rewardScrap: 350,
    status: "locked",
  },
];

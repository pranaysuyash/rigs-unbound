import { describe, expect, it } from "vitest";
import { activeContractCount, deriveCampaignContracts } from "./campaign";
import { createInitialState } from "./state";

describe("campaign contracts engine", () => {
  it("derives available initial campaign contracts at Home Farm", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    const contracts = deriveCampaignContracts(state);
    expect(contracts.length).toBeGreaterThan(0);

    const initialContract = contracts.find((c) => c.id === "contract-sunken-relay");
    expect(initialContract).toBeDefined();
    expect(initialContract?.status).toBe("available");
  });

  it("updates contract status to active when cargo relay is active", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    state.cargoRelay.status = "active";
    state.cargoRelay.cargo.attachedRigId = "utility-tractor";

    const contracts = deriveCampaignContracts(state);
    const initialContract = contracts.find((c) => c.id === "contract-sunken-relay");
    expect(initialContract?.status).toBe("active");
    expect(activeContractCount(state)).toBe(1);
  });

  it("marks contract completed upon cargo delivery completion", () => {
    const state = createInitialState("CAMPAIGN-TEST");
    state.cargoRelay.status = "complete";

    const contracts = deriveCampaignContracts(state);
    const initialContract = contracts.find((c) => c.id === "contract-sunken-relay");
    expect(initialContract?.status).toBe("completed");
  });
});

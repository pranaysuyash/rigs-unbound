/**
 * Radial Quick-Action Control Wheel System.
 *
 * Provides a diegetic 360° quick-action menu for toggling and operating
 * vehicle systems (winch, tire inflation, diff locks, seismic scanner, radio).
 */

import type { GameState } from "./contracts";

export interface RadialMenuItem {
  id: string;
  label: string;
  category: "winch" | "tires" | "drivetrain" | "sensors" | "radio";
  active: boolean;
  available: boolean;
  badgeText?: string;
}

export interface RadialMenuState {
  isOpen: boolean;
  selectedIndex: number;
  items: RadialMenuItem[];
}

export function deriveRadialMenuItems(state: GameState): RadialMenuItem[] {
  const activeRig = state.rigs[state.activeRigId];

  return [
    {
      id: "winch-spool-in",
      label: "Spool Winch In",
      category: "winch",
      active: false,
      available: activeRig?.modules.includes("winch") ?? false,
      badgeText: "Tension",
    },
    {
      id: "winch-spool-out",
      label: "Spool Winch Out",
      category: "winch",
      active: false,
      available: activeRig?.modules.includes("winch") ?? false,
    },
    {
      id: "air-down-tires",
      label: "Air Down Tires (Mud)",
      category: "tires",
      active: false,
      available: true,
      badgeText: "15 PSI",
    },
    {
      id: "air-up-tires",
      label: "Air Up Tires (Highway)",
      category: "tires",
      active: false,
      available: true,
      badgeText: "35 PSI",
    },
    {
      id: "lock-differential",
      label: "Diff Lock (100%)",
      category: "drivetrain",
      active: false,
      available: true,
      badgeText: "Locked",
    },
    {
      id: "fire-seismic-pulse",
      label: "Seismic Ground Pulse",
      category: "sensors",
      active: false,
      available: activeRig?.modules.includes("survey-mast") ?? false,
      badgeText: "Acoustic",
    },
    {
      id: "tune-radio",
      label: "Scan Radio Frequency",
      category: "radio",
      active: true,
      available: true,
      badgeText: "FM",
    },
  ];

}

export function createInitialRadialMenuState(state: GameState): RadialMenuState {
  return {
    isOpen: false,
    selectedIndex: 0,
    items: deriveRadialMenuItems(state),
  };
}

export function selectRadialMenuItem(
  menu: RadialMenuState,
  index: number,
): { updatedMenu: RadialMenuState; selectedItem: RadialMenuItem | null } {
  if (index < 0 || index >= menu.items.length) {
    return { updatedMenu: menu, selectedItem: null };
  }

  const selectedItem = menu.items[index]!;
  if (!selectedItem.available) {
    return { updatedMenu: menu, selectedItem: null };
  }

  const updatedItems = menu.items.map((item, i) => ({
    ...item,
    active: i === index ? !item.active : item.active,
  }));

  return {
    updatedMenu: {
      ...menu,
      selectedIndex: index,
      items: updatedItems,
    },
    selectedItem,
  };
}

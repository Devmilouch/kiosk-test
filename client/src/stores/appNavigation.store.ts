import { create } from "zustand";

type AppScreen = "upload" | "form" | "export";

interface AppNavigationState {
  // State
  currentScreen: AppScreen;

  // Actions
  setScreen: (screen: AppScreen) => void;
  navigateToUpload: () => void;
  navigateToForm: () => void;
  navigateToExport: () => void;
}

export const useAppNavigationStore = create<AppNavigationState>(set => ({
  // Initial state
  currentScreen: "upload",

  // Actions
  setScreen: screen => {
    console.log(`Navigating to screen: ${screen}`);
    set({ currentScreen: screen });
  },

  navigateToUpload: () => {
    console.log("Navigating to upload screen");
    set({ currentScreen: "upload" });
  },
  navigateToForm: () => {
    console.log("Navigating to form screen");
    set({ currentScreen: "form" });
  },
  navigateToExport: () => {
    console.log("Navigating to export screen");
    set({ currentScreen: "export" });
  },
}));

import { create } from "zustand";
import type { AppScreen } from "@/types";

interface AppStore {
  screen: AppScreen;
  setScreen: (screen: AppScreen) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  screen: "home",
  setScreen: (screen) => set({ screen }),
}));

import { create } from "zustand";
import type { UserProgress, BlockInstruction } from "@/types";
import {
  loadProgress,
  saveProgress,
  isLevelCompleted,
  unlockNextLevel,
} from "@/persistence";

interface ProgressStore {
  progress: UserProgress;
  loaded: boolean;
  load: () => void;
  completeLevel: (
    levelId: number,
    points: number,
    badge: string,
    solution: BlockInstruction[]
  ) => void;
  setSolution: (levelId: number, solution: BlockInstruction[]) => void;
  reset: () => void;
}

export const useProgressStore = create<ProgressStore>((set, get) => ({
  progress: {
    completedLevels: [],
    points: 0,
    badges: [],
    currentLevel: 1,
    solutions: {},
  },
  loaded: false,
  load: () => {
    set({ progress: loadProgress(), loaded: true });
  },
  completeLevel: (levelId, points, badge, solution) => {
    const state = get();
    const already = isLevelCompleted(state.progress, levelId);
    let progress = { ...state.progress };
    progress.solutions[levelId] = solution;

    if (!already) {
      progress = unlockNextLevel(progress, levelId);
      progress.completedLevels = [...progress.completedLevels, levelId];
      progress.points += points;
      if (badge && !progress.badges.includes(badge)) {
        progress.badges = [...progress.badges, badge];
      }
    }

    saveProgress(progress);
    set({ progress });
  },
  setSolution: (levelId, solution) => {
    const state = get();
    const progress = { ...state.progress };
    progress.solutions[levelId] = solution;
    saveProgress(progress);
    set({ progress });
  },
  reset: () => {
    const p = loadProgress();
    // keep as is; full reset handled via persistence.resetProgress
    set({ progress: p });
  },
}));

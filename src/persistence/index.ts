import type { UserProgress } from "@/types";

const STORAGE_KEY = "codemotion_progress";

const DEFAULT_PROGRESS: UserProgress = {
  completedLevels: [],
  points: 0,
  badges: [],
  currentLevel: 1,
  solutions: {},
};

export const loadProgress = (): UserProgress => {
  if (typeof window === "undefined") return DEFAULT_PROGRESS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PROGRESS;
    const parsed = JSON.parse(raw) as UserProgress;
    return { ...DEFAULT_PROGRESS, ...parsed };
  } catch {
    return DEFAULT_PROGRESS;
  }
};

export const saveProgress = (progress: UserProgress): void => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // ignore quota errors
  }
};

export const resetProgress = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
};

export const isLevelCompleted = (progress: UserProgress, levelId: number) =>
  progress.completedLevels.includes(levelId);

export const unlockNextLevel = (
  progress: UserProgress,
  completedLevelId: number
): UserProgress => {
  const next = completedLevelId + 1;
  const currentLevel = Math.max(progress.currentLevel, next);
  return { ...progress, currentLevel };
};

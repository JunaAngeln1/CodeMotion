import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  loadProgress,
  saveProgress,
  resetProgress,
  isLevelCompleted,
  unlockNextLevel,
} from "./index";
import type { UserProgress } from "@/types";

const DEFAULT_PROGRESS: UserProgress = {
  completedLevels: [],
  points: 0,
  badges: [],
  currentLevel: 1,
  solutions: {},
};

beforeEach(() => {
  localStorage.removeItem("codemotion_progress");
});

afterEach(() => {
  localStorage.removeItem("codemotion_progress");
});

describe("persistence", () => {
  it("debe devolver progreso por defecto cuando no hay datos", () => {
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it("debe guardar y cargar progreso", () => {
    const progress: UserProgress = {
      ...DEFAULT_PROGRESS,
      completedLevels: [1, 2],
      points: 250,
      badges: ["Iniciador", "Navegante"],
      currentLevel: 3,
    };
    saveProgress(progress);
    expect(loadProgress()).toEqual(progress);
  });

  it("debe reiniciar el progreso", () => {
    saveProgress({
      ...DEFAULT_PROGRESS,
      completedLevels: [1],
      points: 100,
    });
    resetProgress();
    expect(loadProgress()).toEqual(DEFAULT_PROGRESS);
  });

  it("isLevelCompleted debe detectar niveles completados", () => {
    const progress: UserProgress = {
      ...DEFAULT_PROGRESS,
      completedLevels: [1, 3],
    };
    expect(isLevelCompleted(progress, 1)).toBe(true);
    expect(isLevelCompleted(progress, 2)).toBe(false);
    expect(isLevelCompleted(progress, 3)).toBe(true);
  });

  it("unlockNextLevel debe actualizar currentLevel", () => {
    const progress: UserProgress = {
      ...DEFAULT_PROGRESS,
      completedLevels: [1],
      currentLevel: 1,
    };
    const updated = unlockNextLevel(progress, 1);
    expect(updated.currentLevel).toBe(2);
  });

  it("unlockNextLevel no debe reducir currentLevel", () => {
    const progress: UserProgress = {
      ...DEFAULT_PROGRESS,
      completedLevels: [1],
      currentLevel: 5,
    };
    const updated = unlockNextLevel(progress, 1);
    expect(updated.currentLevel).toBe(5);
  });
});

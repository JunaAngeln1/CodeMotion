import { create } from "zustand";
import type { RobotState, Direction } from "@/types";

const initialRobot: RobotState = {
  x: 0,
  y: 0,
  direction: "east",
  targetX: 0,
  targetY: 0,
};

interface RobotStore {
  robot: RobotState;
  setRobot: (robot: RobotState) => void;
  moveTo: (x: number, y: number) => void;
  setDirection: (direction: Direction) => void;
  reset: (start: RobotState) => void;
}

export const useRobotStore = create<RobotStore>((set) => ({
  robot: initialRobot,
  setRobot: (robot) => set({ robot }),
  moveTo: (x, y) =>
    set((state) => ({ robot: { ...state.robot, x, y } })),
  setDirection: (direction) =>
    set((state) => ({ robot: { ...state.robot, direction } })),
  reset: (start) => set({ robot: start }),
}));

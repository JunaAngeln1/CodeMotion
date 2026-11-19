export type Direction = "north" | "east" | "south" | "west";

export type InstructionType = "move" | "turnLeft" | "turnRight" | "repeat";

export interface BlockInstruction {
  id: string;
  type: InstructionType;
  times?: number;
  children?: BlockInstruction[];
}

export interface RobotState {
  x: number;
  y: number;
  direction: Direction;
  targetX: number;
  targetY: number;
}

export interface Level {
  id: number;
  title: string;
  explanation: string;
  startX: number;
  startY: number;
  startDirection: Direction;
  goalX: number;
  goalY: number;
  obstacles: { x: number; y: number }[];
  gridSize: number;
  validSolution: BlockInstruction[];
  points: number;
  badge: string;
}

export interface UserProgress {
  completedLevels: number[];
  points: number;
  badges: string[];
  currentLevel: number;
  solutions: Record<number, BlockInstruction[]>;
}

export type GestureType = "none" | "pinch" | "open" | "thumbsUp" | "fist";

export interface GestureState {
  type: GestureType;
  confidence: number;
  x: number;
  y: number;
  isTracking: boolean;
}

export type AppScreen = "home" | "levels" | "lab" | "results" | "achievements";

export type ExecutionStatus = "idle" | "running" | "completed" | "failed" | "stopped";

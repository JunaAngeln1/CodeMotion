import type { BlockInstruction, Direction, RobotState } from "@/types";

const ROTATE_LEFT: Record<Direction, Direction> = {
  north: "west",
  west: "south",
  south: "east",
  east: "north",
};
const ROTATE_RIGHT: Record<Direction, Direction> = {
  north: "east",
  east: "south",
  south: "west",
  west: "north",
};
const MOVE_DELTA: Record<Direction, { x: number; y: number }> = {
  north: { x: 0, y: -1 },
  east: { x: 1, y: 0 },
  south: { x: 0, y: 1 },
  west: { x: -1, y: 0 },
};

export type EngineStep =
  | { kind: "turn"; direction: Direction }
  | { kind: "move"; x: number; y: number }
  | { kind: "obstacle"; x: number; y: number }
  | { kind: "goal" }
  | { kind: "done"; won: boolean };

export interface EngineContext {
  program: BlockInstruction[];
  gridSize: number;
  obstacles: { x: number; y: number }[];
  goalX: number;
  goalY: number;
  start: RobotState;
  stepDelayMs: number;
}

export function* interpretProgram(ctx: EngineContext): Generator<EngineStep> {
  const robot: RobotState = { ...ctx.start };
  const maxSteps = 500;
  let steps = 0;

  function* walk(instructions: BlockInstruction[]): Generator<EngineStep> {
    for (const instr of instructions) {
      if (steps++ > maxSteps) {
        yield { kind: "done", won: false };
        return;
      }
      yield* executeInstr(instr);
    }
  };

  function* executeInstr(instr: BlockInstruction): Generator<EngineStep> {
    switch (instr.type) {
      case "turnLeft":
        robot.direction = ROTATE_LEFT[robot.direction];
        yield { kind: "turn", direction: robot.direction };
        break;
      case "turnRight":
        robot.direction = ROTATE_RIGHT[robot.direction];
        yield { kind: "turn", direction: robot.direction };
        break;
      case "move": {
        const d = MOVE_DELTA[robot.direction];
        const nx = robot.x + d.x;
        const ny = robot.y + d.y;
        const hit = ctx.obstacles.some((o) => o.x === nx && o.y === ny);
        const out =
          nx < 0 || nx >= ctx.gridSize || ny < 0 || ny >= ctx.gridSize;
        if (hit || out) {
          yield { kind: "obstacle", x: nx, y: ny };
          return;
        }
        robot.x = nx;
        robot.y = ny;
        yield { kind: "move", x: robot.x, y: robot.y };
        if (robot.x === ctx.goalX && robot.y === ctx.goalY) {
          yield { kind: "goal" };
          return;
        }
        break;
      }
      case "repeat": {
        const times = instr.times || 1;
        const children = instr.children || [];
        for (let i = 0; i < times; i++) {
          yield* walk(children);
        }
        break;
      }
    }
  }

  yield* walk(ctx.program);
  yield { kind: "done", won: robot.x === ctx.goalX && robot.y === ctx.goalY };
}

export const rotateLeft = (d: Direction) => ROTATE_LEFT[d];
export const rotateRight = (d: Direction) => ROTATE_RIGHT[d];
export const moveDelta = (d: Direction) => MOVE_DELTA[d];

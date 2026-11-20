import { describe, it, expect } from "vitest";
import { interpretProgram } from "./interpreter";
import type { BlockInstruction, RobotState, Direction } from "@/types";

const makeCtx = (overrides: Partial<{
  program: BlockInstruction[];
  gridSize: number;
  obstacles: { x: number; y: number }[];
  goalX: number;
  goalY: number;
  start: RobotState;
  stepDelayMs: number;
}> = {}) => ({
  program: [],
  gridSize: 6,
  obstacles: [],
  goalX: 0,
  goalY: 0,
  start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
  stepDelayMs: 0,
  ...overrides,
});

describe("interpretProgram", () => {
  it("debe mover el robot hacia adelante", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "move" }],
      goalX: 1,
      goalY: 0,
      start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
    }))];

    const move = steps.find((s) => s.kind === "move");
    expect(move).toEqual({ kind: "move", x: 1, y: 0 });
    const done = steps.find((s) => s.kind === "done");
    expect(done).toEqual({ kind: "done", won: true });
  });

  it("debe girar a la derecha", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "turnRight" }],
      start: { x: 0, y: 0, direction: "north" as Direction, targetX: 0, targetY: 0 },
    }))];

    const turn = steps.find((s) => s.kind === "turn");
    expect(turn).toEqual({ kind: "turn", direction: "east" as Direction });
  });

  it("debe girar a la izquierda", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "turnLeft" }],
      start: { x: 0, y: 0, direction: "north" as Direction, targetX: 0, targetY: 0 },
    }))];

    const turn = steps.find((s) => s.kind === "turn");
    expect(turn).toEqual({ kind: "turn", direction: "west" });
  });

  it("debe detectar obstáculo y detenerse", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "move" }],
      obstacles: [{ x: 1, y: 0 }],
      start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
    }))];

    const obstacle = steps.find((s) => s.kind === "obstacle");
    expect(obstacle).toEqual({ kind: "obstacle", x: 1, y: 0 });
  });

  it("debe detectar salida del tablero como obstáculo", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "move" }],
      gridSize: 1,
      start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
    }))];

    const obstacle = steps.find((s) => s.kind === "obstacle");
    expect(obstacle).toBeDefined();
  });

  it("debe ejecutar un bloque repeat con hijos", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{
        id: "1",
        type: "repeat",
        times: 3,
        children: [{ id: "1a", type: "move" }],
      }],
      goalX: 3,
      goalY: 0,
      start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
    }))];

    const moves = steps.filter((s) => s.kind === "move");
    expect(moves).toHaveLength(3);
    const done = steps.find((s) => s.kind === "done");
    expect(done).toEqual({ kind: "done", won: true });
  });

  it("debe reportar no ganado si no llega a la meta", () => {
    const steps = [...interpretProgram(makeCtx({
      program: [{ id: "1", type: "move" }],
      goalX: 5,
      goalY: 0,
      start: { x: 0, y: 0, direction: "east" as Direction, targetX: 0, targetY: 0 },
    }))];

    const done = steps.find((s) => s.kind === "done");
    expect(done).toEqual({ kind: "done", won: false });
  });
});

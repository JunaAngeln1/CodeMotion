import { useEffect, useCallback, useRef } from "react";
import { useProgramStore } from "@/store/programStore";
import { useRobotStore } from "@/store/robotStore";
import { interpretProgram } from "@/engine/interpreter";
import type { BlockInstruction, Direction } from "@/types";

export interface UseProgramRunnerProps {
  level: {
    gridSize: number;
    obstacles: { x: number; y: number }[];
    goalX: number;
    goalY: number;
    startX: number;
    startY: number;
    startDirection: Direction;
  };
  program: BlockInstruction[];
  onComplete: (won: boolean) => void;
}

export const useProgramRunner = ({
  level,
  program,
  onComplete,
}: UseProgramRunnerProps) => {
  // Only execution status should subscribe this hook to store updates.
  const status = useProgramStore((state) => state.status);
  const inputsRef = useRef({ program, level, onComplete });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    inputsRef.current = { program, level, onComplete };
  }, [program, level, onComplete]);

  // Effect cleanup must not publish store updates.
  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    stopInterval();
    const state = useProgramStore.getState();
    if (state.status === "running") state.setStatus("stopped");
  }, [stopInterval]);

  const { gridSize, startX, startY, startDirection, goalX, goalY } = level;

  useEffect(() => {
    if (status !== "running") return;

    // Capture the program at start. Parent renders and callback identity changes
    // must not reset the robot or replace the active generator.
    const inputs = inputsRef.current;
    if (inputs.program.length === 0) {
      useProgramStore.getState().setStatus("idle");
      return;
    }

    const start = {
      x: startX, y: startY, direction: startDirection,
      targetX: startX, targetY: startY,
    };
    useRobotStore.getState().setRobot(start);
    useProgramStore.getState().setCurrentStep(0);
    const generator = interpretProgram({
      program: structuredClone(inputs.program),
      gridSize,
      obstacles: inputs.level.obstacles,
      goalX, goalY, start, stepDelayMs: 600,
    });
    let cancelled = false;

    const finish = (won: boolean) => {
      if (cancelled) return;
      cancelled = true;
      stopInterval();
      useProgramStore.getState().setStatus(won ? "completed" : "failed");
      inputsRef.current.onComplete(won);
    };

    intervalRef.current = setInterval(() => {
      if (cancelled || useProgramStore.getState().status !== "running") {
        stopInterval();
        return;
      }
      const result = generator.next();
      const { robot, setRobot } = useRobotStore.getState();
      if (result.done) {
        finish(robot.x === goalX && robot.y === goalY);
        return;
      }
      const state = useProgramStore.getState();
      state.setCurrentStep(state.currentStep + 1);
      const step = result.value;
      switch (step.kind) {
        case "turn":
          setRobot({ ...robot, direction: step.direction });
          break;
        case "move":
          setRobot({ ...robot, x: step.x, y: step.y, targetX: step.x, targetY: step.y });
          break;
        case "goal":
          finish(true);
          break;
        case "obstacle":
          finish(false);
          break;
        case "done":
          finish(step.won);
          break;
      }
    }, 600);

    return () => {
      cancelled = true;
      stopInterval();
    };
  }, [status, gridSize, startX, startY, startDirection, goalX, goalY, stopInterval]);

  return { stop };
};

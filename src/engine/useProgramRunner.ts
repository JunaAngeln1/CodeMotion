import { useEffect, useCallback, useRef } from "react";
import { useProgramStore } from "@/store/programStore";
import { useRobotStore } from "@/store/robotStore";
import { interpretProgram } from "@/engine/interpreter";
import type { BlockInstruction, Direction } from "@/types";

interface UseProgramRunnerProps {
  level: {
    gridSize: number;
    obstacles: { x: number; y: number }[];
    goalX: number;
    goalY: number;
    startX: number;
    startY: number;
    startDirection: string;
  };
  program: BlockInstruction[];
  onComplete: (won: boolean) => void;
}

export const useProgramRunner = ({
  level,
  program,
  onComplete,
}: UseProgramRunnerProps) => {
  const { status, setStatus, currentStep, setCurrentStep } = useProgramStore();
  const { setRobot, robot } = useRobotStore();
  const generatorRef = useRef<Generator<any> | null>(null);
  const runningRef = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resetRobot = useCallback(() => {
    setRobot({
      x: level.startX,
      y: level.startY,
      direction: level.startDirection as Direction,
      targetX: level.startX,
      targetY: level.startY,
    });
  }, [level, setRobot]);

  const stop = useCallback(() => {
    runningRef.current = false;
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    generatorRef.current = null;
    setStatus("idle");
  }, [setStatus]);

  const runStep = useCallback(() => {
    if (!generatorRef.current) return;
    const result = generatorRef.current.next();
    if (result.done) {
      stop();
      const won = robot.x === level.goalX && robot.y === level.goalY;
      onComplete(won);
      return;
    }
    const step = result.value;
    setCurrentStep(currentStep + 1);

    switch (step.kind) {
      case "turn":
        setRobot({
          ...robot,
          direction: step.direction,
          targetX: robot.x,
          targetY: robot.y,
        });
        break;
      case "move":
        setRobot({
          ...robot,
          x: step.x,
          y: step.y,
          targetX: step.x,
          targetY: step.y,
        });
        break;
      case "goal":
        stop();
        onComplete(true);
        return;
      case "obstacle":
        stop();
        onComplete(false);
        return;
      case "done":
        stop();
        onComplete(step.won);
        return;
    }
  }, [level, robot, robot.x, robot.y, setRobot, setStatus, setCurrentStep, onComplete, stop]);

  useEffect(() => {
    return () => stop();
  }, [stop]);

  useEffect(() => {
    if (status === "running" && !runningRef.current && program.length > 0) {
      runningRef.current = true;
      resetRobot();
      generatorRef.current = interpretProgram({
        program,
        gridSize: level.gridSize,
        obstacles: level.obstacles,
        goalX: level.goalX,
        goalY: level.goalY,
        start: {
          x: level.startX,
          y: level.startY,
            direction: level.startDirection as Direction,
          targetX: level.startX,
          targetY: level.startY,
        },
          stepDelayMs: 600,
      });
      intervalRef.current = setInterval(runStep, 600);
    } else if (status !== "running") {
      stop();
    }
  }, [status, program.length, runStep, resetRobot, stop]);

  return { stop };
};

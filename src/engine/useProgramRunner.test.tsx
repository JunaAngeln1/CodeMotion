import { StrictMode, createElement } from "react";
import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useProgramRunner } from "./useProgramRunner";
import { useProgramStore } from "@/store/programStore";
import { useRobotStore } from "@/store/robotStore";
import type { BlockInstruction } from "@/types";

const level = {
  gridSize: 6, obstacles: [], goalX: 2, goalY: 0,
  startX: 0, startY: 0, startDirection: "east" as const,
};
const program: BlockInstruction[] = [
  { id: "1", type: "move" }, { id: "2", type: "move" },
];

beforeEach(() => {
  vi.useFakeTimers();
  useProgramStore.setState({ program, status: "idle", currentStep: 0 });
  useRobotStore.getState().reset({ x: 0, y: 0, targetX: 0, targetY: 0, direction: "east" });
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
});

// LabScreen subscribes to the whole store and creates a new callback each render.
function useLabRunner(onComplete: (won: boolean) => void) {
  const state = useProgramStore();
  return useProgramRunner({ level, program: state.program, onComplete: (won) => onComplete(won) });
}

describe("useProgramRunner regression", () => {
  it("does not publish store updates while idle or re-rendering", () => {
    const listener = vi.fn();
    const unsubscribe = useProgramStore.subscribe(listener);
    try {
      const { rerender } = renderHook(() => useLabRunner(vi.fn()));
      rerender();
      expect(listener).not.toHaveBeenCalled();
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      unsubscribe();
    }
  });

  it("runs without restarting when the parent callback changes", () => {
    const complete = vi.fn();
    renderHook(() => useLabRunner(complete));
    act(() => useProgramStore.getState().setStatus("running"));
    act(() => vi.advanceTimersByTime(600));
    expect(useRobotStore.getState().robot.x).toBe(1);
    act(() => vi.advanceTimersByTime(600));
    expect(useRobotStore.getState().robot.x).toBe(2);
    act(() => vi.advanceTimersByTime(1800));
    expect(complete).toHaveBeenCalledExactlyOnceWith(true);
    expect(useProgramStore.getState().status).toBe("completed");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("stops on request without reporting a result", () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useLabRunner(complete));
    act(() => useProgramStore.getState().setStatus("running"));
    act(() => vi.advanceTimersByTime(600));
    act(() => result.current.stop());
    act(() => vi.advanceTimersByTime(3000));
    expect(useRobotStore.getState().robot.x).toBe(1);
    expect(useProgramStore.getState().status).toBe("stopped");
    expect(complete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("cleans up timers on unmount without mutating the store", () => {
    const complete = vi.fn();
    const { unmount } = renderHook(() => useLabRunner(complete));
    act(() => useProgramStore.getState().setStatus("running"));
    const listener = vi.fn();
    const unsubscribe = useProgramStore.subscribe(listener);
    unmount();
    unsubscribe();
    expect(listener).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("handles StrictMode without duplicate timers or results", () => {
    const complete = vi.fn();
    useProgramStore.getState().setStatus("running");
    renderHook(() => useLabRunner(complete), {
      wrapper: ({ children }) => createElement(StrictMode, null, children),
    });
    expect(vi.getTimerCount()).toBe(1);
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("does not stay running with an empty program", () => {
    useProgramStore.setState({ program: [], status: "running" });
    renderHook(() => useLabRunner(vi.fn()));
    expect(useProgramStore.getState().status).toBe("idle");
    expect(vi.getTimerCount()).toBe(0);
  });

  it("uses the latest completion callback without restarting execution", () => {
    const oldComplete = vi.fn();
    const latestComplete = vi.fn();
    const { rerender } = renderHook(({ complete }) => useLabRunner(complete), {
      initialProps: { complete: oldComplete },
    });
    act(() => useProgramStore.getState().setStatus("running"));
    act(() => vi.advanceTimersByTime(600));
    rerender({ complete: latestComplete });
    expect(useRobotStore.getState().robot.x).toBe(1);
    act(() => vi.advanceTimersByTime(1800));
    expect(oldComplete).not.toHaveBeenCalled();
    expect(latestComplete).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("reports collision failure exactly once", () => {
    const complete = vi.fn();
    renderHook(() => {
      const state = useProgramStore();
      useProgramRunner({
        level: { ...level, obstacles: [{ x: 1, y: 0 }] },
        program: state.program,
        onComplete: (won) => complete(won),
      });
    });
    act(() => useProgramStore.getState().setStatus("running"));
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).toHaveBeenCalledExactlyOnceWith(false);
    expect(useProgramStore.getState().status).toBe("failed");
    expect(useRobotStore.getState().robot.x).toBe(0);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("can restart after stopping", () => {
    const complete = vi.fn();
    const { result } = renderHook(() => useLabRunner(complete));
    act(() => useProgramStore.getState().setStatus("running"));
    act(() => vi.advanceTimersByTime(600));
    act(() => result.current.stop());
    act(() => useProgramStore.getState().setStatus("running"));
    expect(useRobotStore.getState().robot.x).toBe(0);
    act(() => vi.advanceTimersByTime(3000));
    expect(complete).toHaveBeenCalledExactlyOnceWith(true);
  });

  it("does not notify subscribers when status and step do not change", () => {
    const listener = vi.fn();
    const unsubscribe = useProgramStore.subscribe(listener);
    try {
      useProgramStore.getState().setStatus("idle");
      useProgramStore.getState().setCurrentStep(0);
      expect(listener).not.toHaveBeenCalled();
    } finally {
      unsubscribe();
    }
  });
});

import { StrictMode, type ReactNode } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { HomeScreen } from "./HomeScreen";
import { Layout } from "@/components/layout/Layout";
import { ProgramDemo } from "@/components/home/ProgramDemo";
import { useProgressStore } from "@/store/progressStore";
import { useProgramStore } from "@/store/programStore";
import { useRobotStore } from "@/store/robotStore";
import type { UserProgress } from "@/types";

// Semantics/timer tests do not need animation frames. Animations are checked in-browser.
vi.mock("framer-motion", async () => {
  const { createElement } = await import("react");
  const element = (tag: string) => (props: Record<string, unknown>) => {
    const { initial: _initial, animate: _animate, transition: _transition, whileInView: _inView, viewport: _viewport, children, ...rest } = props;
    return createElement(tag, rest, children as ReactNode);
  };
  return { motion: { div: element("div"), section: element("section"), g: element("g") }, useReducedMotion: () => true };
});

const freshProgress = (): UserProgress => ({ completedLevels: [], points: 0, badges: [], currentLevel: 1, solutions: {} });
const renderHome = () => render(<MemoryRouter><HomeScreen /></MemoryRouter>);

beforeEach(() => {
  vi.useFakeTimers();
  localStorage.clear();
  useProgressStore.setState({ progress: freshProgress(), loaded: true });
  useProgramStore.getState().resetProgram();
});
afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("interactive home", () => {
  it("offers working navigation and clearly locked future missions", () => {
    renderHome();
    expect(screen.getByRole("link", { name: /Empezar aventura/ }).getAttribute("href")).toBe("/laboratorio/1");
    expect(screen.getByRole("link", { name: /Seleccionar nivel/ }).getAttribute("href")).toBe("/niveles");
    expect(screen.getByRole("link", { name: /Misión 1:.*Disponible/ }).getAttribute("href")).toBe("/laboratorio/1");
    expect((screen.getByRole("button", { name: /Misión 2:.*Bloqueada/ }) as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("0");
  });

  it("continues at the next mission and shows actual points and next reward", () => {
    useProgressStore.setState({ progress: { ...freshProgress(), completedLevels: [1, 2], currentLevel: 3, points: 250, badges: ["Iniciador", "Navegante"] } });
    renderHome();
    expect(screen.getByRole("link", { name: /Continuar misión/ }).getAttribute("href")).toBe("/laboratorio/3");
    expect(screen.getByText("250")).toBeTruthy();
    expect(screen.getByText("Explorador")).toBeTruthy();
    expect(screen.getByRole("progressbar").getAttribute("aria-valuenow")).toBe("2");
    expect(screen.getByRole("link", { name: /Misión 1:.*Completada/ })).toBeTruthy();
  });

  it("celebrates all five missions without linking to a nonexistent sixth", () => {
    useProgressStore.setState({ progress: { ...freshProgress(), completedLevels: [1, 2, 3, 4, 5], currentLevel: 6 } });
    const { container } = renderHome();
    expect(screen.getByRole("link", { name: /Ver mis logros/ }).getAttribute("href")).toBe("/reconocimientos");
    expect(screen.getByText("¡Todas las misiones superadas!")).toBeTruthy();
    expect(container.querySelector('a[href="/laboratorio/6"]')).toBeNull();
  });

  it("runs two real moves and a goal without changing any game store or storage", () => {
    const storageWrite = vi.spyOn(Storage.prototype, "setItem");
    const progress = useProgressStore.getState().progress;
    const program = useProgramStore.getState();
    const robot = useRobotStore.getState();
    const { container } = render(<ProgramDemo />);
    fireEvent.click(screen.getByRole("button", { name: "¡Pruébalo!" }));
    act(() => vi.advanceTimersByTime(800));
    expect(container.querySelector(".home-demo__scene")?.getAttribute("data-position")).toBe("1");
    act(() => vi.advanceTimersByTime(800));
    expect(container.querySelector(".home-demo__scene")?.getAttribute("data-position")).toBe("2");
    act(() => vi.advanceTimersByTime(800));
    expect(screen.getByRole("button", { name: "Volver a probar" })).toBeTruthy();
    expect(useProgressStore.getState().progress).toBe(progress);
    expect(useProgramStore.getState()).toBe(program);
    expect(useRobotStore.getState()).toBe(robot);
    expect(storageWrite).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("can cancel and replay the demo, and cleans timers on unmount", () => {
    const { container, unmount } = render(<ProgramDemo />);
    fireEvent.click(screen.getByRole("button", { name: "¡Pruébalo!" }));
    act(() => vi.advanceTimersByTime(800));
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar demostración" }));
    act(() => vi.advanceTimersByTime(5000));
    expect(container.querySelector(".home-demo__scene")?.getAttribute("data-position")).toBe("0");
    expect(screen.getByRole("button", { name: "¡Pruébalo!" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "¡Pruébalo!" }));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("responds when the robot is greeted", () => {
    render(<ProgramDemo />);
    fireEvent.click(screen.getByRole("button", { name: "Saludar al robot" }));
    expect(screen.getByRole("status").textContent).toBe("¡Choca esos cinco, explorador!");
  });

  it("restores persisted progress once through Layout, including in StrictMode", () => {
    const saved = { ...freshProgress(), completedLevels: [1], points: 100, currentLevel: 2, badges: ["Iniciador"] };
    localStorage.setItem("codemotion_progress", JSON.stringify(saved));
    useProgressStore.setState({ progress: freshProgress(), loaded: false });
    const load = vi.spyOn(useProgressStore.getState(), "load");
    render(<StrictMode><MemoryRouter><Routes><Route element={<Layout />}><Route index element={<HomeScreen />} /></Route></Routes></MemoryRouter></StrictMode>);
    expect(load).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("link", { name: /Continuar misión/ }).getAttribute("href")).toBe("/laboratorio/2");
    expect(useProgressStore.getState().progress).toEqual(saved);
  });
});

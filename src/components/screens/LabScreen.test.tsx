import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LabScreen } from "./LabScreen";
import { useProgramStore } from "@/store/programStore";
import { useRobotStore } from "@/store/robotStore";
import { useProgressStore } from "@/store/progressStore";

vi.mock("@/components/board/Scene3D", () => ({ Scene3D: () => <div>Tablero 3D</div> }));
vi.mock("@/components/gesture/GestureCamera", () => ({ GestureCamera: ({ onRequestReset }: { onRequestReset: () => void }) => <button onClick={onRequestReset}>Request gesture reset</button> }));

beforeEach(() => {
  useProgramStore.setState({ program: [{ id: "saved", type: "move" }], status: "idle", currentStep: 0 });
  useRobotStore.getState().moveTo(3, 2);
});
afterEach(cleanup);
const renderLab = () => render(<MemoryRouter initialEntries={["/laboratorio/1"]}><Routes><Route path="/laboratorio/:levelId" element={<LabScreen />} /></Routes></MemoryRouter>);

describe("safe challenge restart", () => {
  it("keeps the program until a reset is explicitly confirmed", () => {
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(useProgramStore.getState().program).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Conservar mis bloques" }));
    expect(useProgramStore.getState().program).toHaveLength(1);
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    const progress = useProgressStore.getState().progress;
    fireEvent.click(screen.getByRole("button", { name: "Sí, reiniciar" }));
    expect(useProgramStore.getState().program).toHaveLength(0);
    expect(useRobotStore.getState().robot).toEqual({ x: 0, y: 0, targetX: 0, targetY: 0, direction: "east" });
    expect(useProgressStore.getState().progress).toBe(progress);
  });

  it("stops execution and asks for confirmation on a gesture request", () => {
    renderLab();
    fireEvent.click(screen.getByRole("button", { name: "Ejecutar" }));
    fireEvent.click(screen.getByRole("button", { name: "Cámara y gestos" }));
    fireEvent.click(screen.getByRole("button", { name: "Request gesture reset" }));
    expect(useProgramStore.getState().status).toBe("stopped");
    expect(useProgramStore.getState().program).toHaveLength(1);
    expect(screen.getByRole("dialog")).toBeTruthy();
  });
});

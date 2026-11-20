import { cleanup, fireEvent, render, screen, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { Editor } from "./Editor";
import { EditorToolbar } from "./EditorToolbar";
import { useProgramStore } from "@/store/programStore";
import { LEVELS } from "@/levels/data";

beforeEach(() => useProgramStore.getState().resetProgram());
afterEach(cleanup);

describe("laboratory editor controls", () => {
  it("shows all four blocks and an empty program", () => {
    render(<Editor level={LEVELS[0]} onComplete={() => {}} />);
    for (const name of ["Avanzar", "Girar izquierda", "Girar derecha", "Repetir N veces"]) {
      expect(screen.getByRole("button", { name })).toBeTruthy();
    }
    expect(screen.getByText("Aquí empieza tu algoritmo")).toBeTruthy();
  });

  it("adds and deletes instructions without starting a drag", () => {
    render(<Editor level={LEVELS[0]} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Avanzar" }));
    expect(useProgramStore.getState().program).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Mover instrucción 1: Avanzar" })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Eliminar instrucción 1: Avanzar" }));
    expect(useProgramStore.getState().program).toHaveLength(0);
  });

  it("shares shaped visuals between library and sequence with unique gradient IDs", () => {
    const { container } = render(<Editor level={LEVELS[0]} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Avanzar" }));
    fireEvent.click(screen.getByRole("button", { name: "Avanzar" }));
    expect(container.querySelectorAll(".code-piece__shape")).toHaveLength(6);
    const ids = [...container.querySelectorAll("linearGradient")].map((node) => node.id);
    expect(new Set(ids).size).toBe(6);
    for (const shape of container.querySelectorAll(".code-piece__shape")) {
      expect(shape.getAttribute("aria-hidden")).toBe("true");
    }
    expect(screen.getByRole("button", { name: "Mover instrucción 2: Avanzar" })).toBeTruthy();
  });

  it("keeps repeat inputs usable and within bounds", () => {
    render(<Editor level={LEVELS[0]} onComplete={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Repetir N veces" }));
    fireEvent.change(screen.getByRole("spinbutton", { name: /Repeticiones/ }), { target: { value: "25" } });
    expect(useProgramStore.getState().program[0].times).toBe(20);
  });

  it("keeps execution controls separate and locks editing while running", () => {
    render(<><Editor level={LEVELS[0]} onComplete={() => {}} /><EditorToolbar /></>);
    const execute = screen.getByRole("button", { name: "Ejecutar" }) as HTMLButtonElement;
    expect(execute.disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Avanzar" }));
    fireEvent.click(execute);
    expect(useProgramStore.getState().status).toBe("running");
    expect((screen.getByRole("button", { name: "Avanzar" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Detener" }));
    expect(useProgramStore.getState().status).toBe("stopped");
    fireEvent.click(screen.getByRole("button", { name: "Reiniciar" }));
    expect(useProgramStore.getState().program).toHaveLength(0);
    act(() => useProgramStore.getState().setStatus("idle"));
  });
});

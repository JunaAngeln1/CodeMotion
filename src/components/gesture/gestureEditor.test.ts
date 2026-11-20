import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { GestureEditorController } from "./gestureEditor";
import { EMPTY_GESTURE_FRAME, type GestureFrame } from "./gestureRecognition";
import { useProgramStore } from "@/store/programStore";

let hit: Element | null;
let controller: GestureEditorController;
const reset = vi.fn();
const frame = (type: GestureFrame["type"], extra: Partial<GestureFrame> = {}): GestureFrame => ({ ...EMPTY_GESTURE_FRAME, type, candidate: type, isTracking: true, x: 0.5, y: 0.5, ...extra });
const element = (selector: string) => document.querySelector(selector)!;
const send = (type: GestureFrame["type"], extra: Partial<GestureFrame> = {}) => controller.process(frame(type, extra));

beforeEach(() => {
  useProgramStore.getState().resetProgram();
  reset.mockClear();
  document.body.innerHTML = '<button data-gesture-type="move">Avanzar</button><div class="lab-program-scroll" data-gesture-drop><ol></ol></div><div data-gesture-trash>Eliminar</div><button data-gesture-click id="choice">Elegir</button>';
  hit = element("[data-gesture-type]");
  vi.stubGlobal("innerWidth", 1024);
  vi.stubGlobal("innerHeight", 768);
  Object.defineProperty(document, "elementFromPoint", { value: vi.fn(() => hit), configurable: true });
  controller = new GestureEditorController(vi.fn(), reset);
});
afterEach(() => { controller.dispose(); document.body.innerHTML = ""; vi.unstubAllGlobals(); });

describe("gesture editor transactions", () => {
  it("adds only when an armed pinch is released over the program", () => {
    send("pinch"); // Must show an open hand first.
    expect(useProgramStore.getState().program).toHaveLength(0);
    send("open"); send("pinch");
    expect(useProgramStore.getState().program).toHaveLength(0);
    hit = element("[data-gesture-drop]"); send("pinch"); send("open"); send("open");
    expect(useProgramStore.getState().program.map((block) => block.type)).toEqual(["move"]);
  });
  it("cancels outside drops and tracking loss without changing the program", () => {
    send("open"); send("pinch"); hit = document.body; send("open");
    expect(useProgramStore.getState().program).toHaveLength(0);
    hit = element("[data-gesture-type]"); send("open"); send("pinch");
    controller.process({ ...EMPTY_GESTURE_FRAME });
    hit = element("[data-gesture-drop]"); send("open");
    expect(useProgramStore.getState().program).toHaveLength(0);
    expect(document.querySelector("[data-gesture-hover]")).toBeNull();
  });
  it("reorders by ID and can delete by dropping on the trash", () => {
    useProgramStore.getState().setProgram([{ id: "a", type: "move" }, { id: "b", type: "turnRight" }, { id: "c", type: "move" }]);
    const list = element("ol");
    for (const [i, id] of ["a", "b", "c"].entries()) {
      const row = document.createElement("li"); row.dataset.gestureBlockId = id;
      row.getBoundingClientRect = () => new DOMRect(400, 200 + i * 100, 400, 60);
      list.append(row);
    }
    hit = element('[data-gesture-block-id="a"]'); send("open"); send("pinch");
    hit = element("[data-gesture-drop]"); send("open", { y: 0.72 });
    expect(useProgramStore.getState().program.map((block) => block.id)).toEqual(["b", "c", "a"]);
    hit = element('[data-gesture-block-id="c"]'); send("pinch");
    hit = element("[data-gesture-trash]"); send("open");
    expect(useProgramStore.getState().program.map((block) => block.id)).toEqual(["b", "a"]);
  });
  it("activates only explicit buttons with pinch/open over the same button", () => {
    const click = vi.fn(); const button = element("#choice"); button.addEventListener("click", click);
    hit = button; send("open"); send("pinch"); send("open"); send("open");
    expect(click).toHaveBeenCalledTimes(1);
    send("pinch"); hit = document.body; send("open");
    expect(click).toHaveBeenCalledTimes(1);
  });
  it("requests reset instead of clearing blocks and ignores commands inside a dialog", () => {
    useProgramStore.getState().addBlock("move");
    send("fist", { action: "reset" });
    expect(reset).toHaveBeenCalledTimes(1);
    expect(useProgramStore.getState().program).toHaveLength(1);
    const dialog = document.createElement("dialog"); dialog.setAttribute("open", ""); document.body.append(dialog);
    send("thumbsUp", { action: "execute" });
    expect(useProgramStore.getState().status).toBe("idle");
  });
  it("executes a program, locks block edits and still allows Stop", () => {
    useProgramStore.getState().addBlock("move");
    send("thumbsUp", { action: "execute" });
    expect(useProgramStore.getState().status).toBe("running");
    send("open"); send("pinch"); hit = element("[data-gesture-drop]"); send("open");
    expect(useProgramStore.getState().program).toHaveLength(1);
    const button = element("#choice"); button.addEventListener("click", () => useProgramStore.getState().setStatus("stopped"));
    hit = button; send("pinch"); send("open");
    expect(useProgramStore.getState().status).toBe("stopped");
  });

  it("does not interfere with a mouse or keyboard drag", () => {
    const dragging = document.createElement("div"); dragging.className = "code-piece--dragging"; document.body.append(dragging);
    useProgramStore.getState().addBlock("move");
    send("thumbsUp", { action: "execute" });
    send("fist", { action: "reset" });
    expect(useProgramStore.getState().status).toBe("idle");
    expect(reset).not.toHaveBeenCalled();
    expect(useProgramStore.getState().program).toHaveLength(1);
  });

  it("auto-scrolls a long program without mutating its instructions", () => {
    const list = element(".lab-program-scroll") as HTMLElement;
    list.style.overflowY = "auto";
    list.getBoundingClientRect = () => new DOMRect(400, 200, 400, 400);
    Object.defineProperty(list, "scrollHeight", { value: 900 });
    Object.defineProperty(list, "clientHeight", { value: 400 });
    hit = list;
    send("open", { y: 585 / 768 });
    expect(list.scrollTop).toBe(10);
    expect(useProgramStore.getState().program).toHaveLength(0);
  });
});

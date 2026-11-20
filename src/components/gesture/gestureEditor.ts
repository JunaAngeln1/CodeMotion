import { useProgramStore } from "@/store/programStore";
import { BLOCK_VISUALS } from "@/components/blocks/blockDefinitions";
import type { InstructionType } from "@/types";
import type { GestureFrame } from "./gestureRecognition";

type Drag = { source: "library"; type: InstructionType } | { source: "program"; id: string; type: InstructionType } | { source: "click"; button: HTMLButtonElement };
type Drop = { zone: "program"; index: number; marker: HTMLElement } | { zone: "trash"; marker: HTMLElement };
export interface GestureEditorView { label: string | null; target: "program" | "trash" | null; message: string }
export const INITIAL_EDITOR_VIEW: GestureEditorView = { label: null, target: null, message: "Muestra la mano abierta para empezar." };
const isInstruction = (value: string | undefined): value is InstructionType => value === "move" || value === "turnLeft" || value === "turnRight" || value === "repeat";

// Gesture and mouse interaction call the same store actions. No synthetic drags.
export class GestureEditorController {
  private drag: Drag | null = null;
  private previous = "none";
  private armed = false;
  private hover: HTMLElement | null = null;
  private marker: HTMLElement | null = null;
  private view = INITIAL_EDITOR_VIEW;
  private unknownSince: number | null = null;
  private onChange: (view: GestureEditorView) => void;
  private requestReset: () => void;

  constructor(onChange: (view: GestureEditorView) => void, requestReset: () => void) {
    this.onChange = onChange;
    this.requestReset = requestReset;
  }

  private publish(message: string, target: GestureEditorView["target"] = null) {
    const next: GestureEditorView = { label: this.drag && this.drag.source !== "click" ? BLOCK_VISUALS[this.drag.type].label : null, target, message };
    if (next.message !== this.view.message || next.label !== this.view.label || next.target !== this.view.target) {
      this.view = next;
      this.onChange(next);
    }
  }

  private highlight(hover: HTMLElement | null, marker: HTMLElement | null = null) {
    if (this.hover !== hover) {
      this.hover?.removeAttribute("data-gesture-hover");
      hover?.setAttribute("data-gesture-hover", "true");
      this.hover = hover;
    }
    if (this.marker !== marker) {
      this.marker?.removeAttribute("data-gesture-target");
      marker?.setAttribute("data-gesture-target", "true");
      this.marker = marker;
    }
  }

  private cancel(message: string) {
    this.drag = null;
    this.highlight(null);
    this.publish(message);
  }

  private dropAt(element: Element | null, y: number): Drop | null {
    const trash = element?.closest<HTMLElement>("[data-gesture-trash]");
    if (trash) return { zone: "trash", marker: trash };
    const area = element?.closest<HTMLElement>("[data-gesture-drop]");
    if (!area) return null;
    const sourceId = this.drag?.source === "program" ? this.drag.id : null;
    const rows = [...area.querySelectorAll<HTMLElement>("[data-gesture-block-id]")].filter((row) => row.dataset.gestureBlockId !== sourceId);
    const index = rows.findIndex((row) => { const rect = row.getBoundingClientRect(); return y < rect.top + rect.height / 2; });
    return { zone: "program", index: index < 0 ? rows.length : index, marker: index < 0 ? area : rows[index] };
  }

  private autoScroll(x: number, y: number, element: Element | null) {
    if (element?.closest(".gesture-camera-panel") || document.querySelector("dialog[open]")) return;
    const list = document.querySelector<HTMLElement>(".lab-program-scroll");
    if (list) {
      const rect = list.getBoundingClientRect();
      if (list.scrollHeight > list.clientHeight && getComputedStyle(list).overflowY === "auto" && x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        if (y < rect.top + 32) list.scrollTop -= 10;
        if (y > rect.bottom - 32) list.scrollTop += 10;
        return;
      }
    }
    const footer = document.querySelector(".lab-toolbar")?.getBoundingClientRect().height ?? 72;
    if (y < 110) window.scrollBy(0, -10);
    else if (y > window.innerHeight - footer - 36) window.scrollBy(0, 10);
  }

  process(frame: GestureFrame) {
    if (!frame.isTracking || !Number.isFinite(frame.x) || !Number.isFinite(frame.y)) {
      this.armed = false;
      this.previous = "none";
      this.cancel("Mano no detectada. Abre la mano para continuar.");
      return;
    }
    if (document.querySelector(".code-piece--dragging")) {
      this.armed = false;
      this.cancel("Termina el movimiento con el mouse o teclado antes de usar gestos.");
      return;
    }
    const x = Math.max(0, Math.min(window.innerWidth - 1, frame.x * window.innerWidth));
    const y = Math.max(0, Math.min(window.innerHeight - 1, frame.y * window.innerHeight));
    const element = document.elementFromPoint(x, y);
    const dialog = document.querySelector("dialog[open]");
    const state = useProgramStore.getState();
    const isNewPinch = frame.type === "pinch" && this.previous !== "pinch";
    this.previous = frame.type;

    if (frame.action && !dialog) {
      if (this.drag) { this.armed = false; this.cancel("Suelta el bloque antes de ejecutar o reiniciar."); return; }
      if (frame.action === "execute" && state.status !== "running" && state.program.length) {
        state.setStatus("running");
        this.publish("Ejecutando tu programa.");
      } else if (frame.action === "reset" && (state.program.length || state.status === "running")) {
        this.armed = false;
        this.requestReset();
        this.publish("Confirma el reinicio o elige conservar tus bloques.");
      }
      return;
    }
    if (state.status === "running" && this.drag && this.drag.source !== "click") this.cancel("Programa en ejecución. Puedes detenerlo con el botón Detener.");
    if (dialog && this.drag?.source !== "click") this.cancel("Haz pinza sobre una opción y abre la mano para elegirla.");
    if (frame.type === "open") this.armed = true;
    if (this.drag && frame.type === "none") {
      this.unknownSince ??= performance.now();
      if (performance.now() - this.unknownSince > 1200) { this.armed = false; this.cancel("Movimiento cancelado. Vuelve a mostrar la mano abierta."); }
    } else this.unknownSince = null;
    if (this.drag && (frame.type === "fist" || frame.type === "thumbsUp")) {
      this.armed = false;
      this.cancel("Movimiento cancelado sin cambiar tus bloques.");
      return;
    }

    const clickable = element?.closest<HTMLButtonElement>("button[data-gesture-click]");
    const allowedButton = clickable && !clickable.disabled && (!dialog || dialog.contains(clickable)) ? clickable : null;
    const library = !dialog && state.status !== "running" ? element?.closest<HTMLElement>("[data-gesture-type]") : null;
    const block = !dialog && state.status !== "running" ? element?.closest<HTMLElement>("[data-gesture-block-id]") : null;
    if ((frame.type === "open" || frame.type === "pinch") && (frame.candidate === "open" || frame.candidate === "pinch")) this.autoScroll(x, y, element);

    if (isNewPinch && this.armed && !this.drag) {
      this.armed = false;
      if (allowedButton) this.drag = { source: "click", button: allowedButton };
      else if (isInstruction(library?.dataset.gestureType) && !(library instanceof HTMLButtonElement && library.disabled)) this.drag = { source: "library", type: library.dataset.gestureType };
      else if (block) {
        const instruction = state.program.find((item) => item.id === block.dataset.gestureBlockId);
        if (instruction) this.drag = { source: "program", id: instruction.id, type: instruction.type };
      }
    }
    if (!this.drag) { this.highlight(allowedButton ?? library ?? block ?? null); return; }
    if (this.drag.source === "click") {
      this.highlight(allowedButton === this.drag.button ? this.drag.button : null);
      this.publish("Abre la mano sobre el mismo botón para pulsarlo.");
      if (frame.type === "open") {
        const button = this.drag.button;
        this.drag = null;
        this.highlight(null);
        if (allowedButton === button && button.isConnected && !button.disabled) button.click();
        this.publish("Opción seleccionada.");
      }
      return;
    }
    const drop = this.dropAt(element, y);
    this.highlight(null, drop?.marker ?? null);
    this.publish(drop ? drop.zone === "trash" ? "Abre la mano para eliminar el bloque." : "Abre la mano para colocar el bloque aquí." : "Mueve el bloque a Tu programa. Abrir fuera cancela el movimiento.", drop?.zone ?? null);
    if (frame.type !== "open") return;
    const drag = this.drag;
    this.drag = null;
    this.highlight(null);
    // Read the live state: mouse edits may have happened while the hand moved.
    const current = useProgramStore.getState();
    if (!drop || current.status === "running") { this.publish("Movimiento cancelado. Tus bloques no cambiaron."); return; }
    if (drop.zone === "trash") {
      if (drag.source === "program") current.removeBlock(drag.id);
      this.publish("Bloque descartado.");
    } else if (drag.source === "library") {
      current.insertBlock(drag.type, drop.index, drag.type === "repeat" ? 3 : undefined);
      this.publish("Bloque añadido a tu programa.");
    } else {
      const from = current.program.findIndex((item) => item.id === drag.id);
      if (from >= 0 && from !== drop.index) current.moveBlock(from, drop.index);
      this.publish("Instrucciones ordenadas.");
    }
  }

  dispose() { this.drag = null; this.highlight(null); }
}

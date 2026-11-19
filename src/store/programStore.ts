import { create } from "zustand";
import { produce } from "immer";
import type { BlockInstruction, ExecutionStatus } from "@/types";

const newBlockId = () => Math.random().toString(36).slice(2, 9);

interface ProgramStore {
  program: BlockInstruction[];
  status: ExecutionStatus;
  currentStep: number;
  setProgram: (program: BlockInstruction[]) => void;
  addBlock: (type: BlockInstruction["type"], times?: number) => void;
  updateBlock: (id: string, patch: Partial<BlockInstruction>) => void;
  removeBlock: (id: string) => void;
  moveBlock: (fromIndex: number, toIndex: number) => void;
  setStatus: (status: ExecutionStatus) => void;
  setCurrentStep: (step: number) => void;
  resetProgram: () => void;
}

export const useProgramStore = create<ProgramStore>((set) => ({
  program: [],
  status: "idle",
  currentStep: 0,
  setProgram: (program) => set({ program }),
  addBlock: (type, times) =>
    set(
      produce((state) => {
        state.program.push({
          id: newBlockId(),
          type,
          ...(times !== undefined ? { times } : {}),
        });
      })
    ),
  updateBlock: (id, patch) =>
    set(
      produce((state) => {
        const block = state.program.find((b: BlockInstruction) => b.id === id);
        if (block) Object.assign(block, patch);
      })
    ),
  removeBlock: (id) =>
    set(
      produce((state) => {
        state.program = state.program.filter((b: BlockInstruction) => b.id !== id);
      })
    ),
  moveBlock: (fromIndex, toIndex) =>
    set(
      produce((state) => {
        const [removed] = state.program.splice(fromIndex, 1);
        state.program.splice(toIndex, 0, removed);
      })
    ),
  setStatus: (status) => set({ status }),
  setCurrentStep: (step) => set({ currentStep: step }),
  resetProgram: () => set({ program: [], status: "idle", currentStep: 0 }),
}));

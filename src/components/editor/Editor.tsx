import { Blocks, ListOrdered } from "lucide-react";
import { useProgramStore } from "@/store/programStore";
import { BlockLibrary } from "@/components/blocks/BlockItem";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { useProgramRunner } from "@/engine/useProgramRunner";
import type { InstructionType, Level } from "@/types";

interface EditorProps {
  level: Level;
  onComplete: (won: boolean) => void;
}

export const Editor = ({ level, onComplete }: EditorProps) => {
  const { program, addBlock, status } = useProgramStore();
  useProgramRunner({ level, program, onComplete });
  const handleAdd = (type: InstructionType) => addBlock(type, type === "repeat" ? 3 : undefined);

  return (
    <div className="lab-editor-content">
      <section className="shrink-0 border-b border-slate-700/70 p-4" aria-labelledby="block-library-title">
        <h2 id="block-library-title" className="mb-1 flex items-center gap-2 font-semibold text-white"><Blocks size={18} className="text-electric-400" /> Bloques disponibles</h2>
        <p className="mb-3 text-xs text-slate-400">Toca un bloque para añadirlo a tu programa.</p>
        <BlockLibrary onAdd={handleAdd} disabled={status === "running"} />
      </section>
      <section className="lab-program-section" aria-labelledby="program-title">
        <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-3 pt-4">
          <h2 id="program-title" className="flex items-center gap-2 font-semibold text-white"><ListOrdered size={18} className="text-purple-400" /> Tu programa</h2>
          <span className="rounded-md bg-slate-700/60 px-2 py-1 text-xs text-slate-300">{program.length} bloques</span>
        </div>
        <div className="lab-program-scroll" data-gesture-drop><EditorCanvas /></div>
      </section>
    </div>
  );
};

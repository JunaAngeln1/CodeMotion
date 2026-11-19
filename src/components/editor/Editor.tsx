import { useProgramStore } from "@/store/programStore";
import { BlockLibrary } from "@/components/blocks/BlockItem";
import { EditorCanvas } from "@/components/editor/EditorCanvas";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useProgramRunner } from "@/engine/useProgramRunner";
import type { Level } from "@/types";

interface EditorProps {
  level: Level;
  onComplete: (won: boolean) => void;
}

export const Editor = ({ level, onComplete }: EditorProps) => {
  const { program, addBlock } = useProgramStore();
  useProgramRunner({
    level,
    program,
    onComplete,
  });

  const handleAdd = (type: string) => {
    if (type === "repeat") {
      addBlock("repeat", 3);
    } else {
      addBlock(type as any);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Biblioteca de bloques
            </h3>
            <BlockLibrary onAdd={handleAdd} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">
              Tu programa
            </h3>
            <EditorCanvas />
          </div>
        </div>
      </div>
      <EditorToolbar />
    </div>
  );
};

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockInstruction } from "@/types";

interface BlockItemProps {
  block: BlockInstruction;
  inEditor: boolean;
  onRemove?: () => void;
  onTimesChange?: (val: number) => void;
}

export const BlockItem = ({
  block,
  inEditor,
  onRemove,
  onTimesChange,
}: BlockItemProps) => {
  const {
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleTimesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, parseInt(e.target.value) || 1);
    if (block.type === "repeat") onTimesChange?.(v);
  };

  const typeLabels: Record<string, string> = {
    move: "Avanzar",
    turnLeft: "Girar izquierda",
    turnRight: "Girar derecha",
    repeat: "Repetir",
  };

  const typeColors: Record<string, string> = {
    move: "bg-slate-800 border-slate-600 text-slate-300",
    turnLeft: "bg-purple-600/20 border-purple-500/50 text-purple-400",
    turnRight: "bg-purple-600/20 border-purple-500/50 text-purple-400",
    repeat: "bg-orange-600/20 border-orange-500/50 text-orange-400",
  };

  return (
    <div
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl p-3 border shadow-soft cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${typeColors[block.type]}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{typeLabels[block.type]}</span>
        {inEditor && (
          <button
            onClick={() => onRemove?.()}
            className="text-slate-500 hover:text-red-400 transition-colors"
            aria-label="Eliminar bloque"
          >
            ✕
          </button>
        )}
      </div>
      {block.type === "repeat" && block.times !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-slate-400">Veces:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={block.times}
            onChange={handleTimesChange}
            className="w-16 bg-slate-900 border border-slate-700 rounded text-center text-xs text-slate-200 focus:ring-2 focus:ring-electric-500"
          />
        </div>
      )}
    </div>
  );
};

export const BlockLibrary = ({ onAdd }: { onAdd: (type: string) => void }) => {
  const blocks: { type: string; label: string; color: string }[] = [
    { type: "move", label: "Avanzar", color: "bg-slate-800 border-slate-600 text-slate-300" },
    { type: "turnLeft", label: "Girar izquierda", color: "bg-purple-600/20 border-purple-500/50 text-purple-400" },
    { type: "turnRight", label: "Girar derecha", color: "bg-purple-600/20 border-purple-500/50 text-purple-400" },
    { type: "repeat", label: "Repetir N veces", color: "bg-orange-600/20 border-orange-500/50 text-orange-400" },
  ];

  return (
    <div className="space-y-2">
      {blocks.map((b) => (
        <button
          key={b.type}
          onClick={() => onAdd(b.type)}
          className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl border shadow-soft hover:bg-slate-700/50 transition-colors ${b.color} text-left`}
        >
          <span className="text-sm font-medium">{b.label}</span>
          <span className="text-xs text-slate-500">+</span>
        </button>
      ))}
    </div>
  );
};

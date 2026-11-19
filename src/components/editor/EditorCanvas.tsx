import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { BlockInstruction } from "@/types";
import { useProgramStore } from "@/store/programStore";
export const EditorCanvas = () => {
  const { program, removeBlock, moveBlock, updateBlock } = useProgramStore();
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const fromIndex = program.findIndex((block) => block.id === active.id);
    const toIndex = program.findIndex((block) => block.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) moveBlock(fromIndex, toIndex);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={program.map((b) => b.id)}
        strategy={verticalListSortingStrategy}
      >
        {program.map((block) => (
          <SortableBlockItem
            key={block.id}
            block={block}
            onRemove={() => removeBlock(block.id)}
            onTimesChange={(val) => updateBlock(block.id, { times: val })}
          />
        ))}
      </SortableContext>
      <DragOverlay />
    </DndContext>
  );
};

type SortableBlockItemProps = {
  block: BlockInstruction;
  onRemove: () => void;
  onTimesChange: (val: number) => void;
};

const SortableBlockItem = ({
  block,
  onRemove,
  onTimesChange,
}: SortableBlockItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`rounded-xl p-3 border shadow-soft cursor-grab active:cursor-grabbing transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      } ${typeColors[block.type]}`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium">{typeLabels[block.type]}</span>
        <button
          onClick={onRemove}
          className="text-slate-500 hover:text-red-400 transition-colors"
          aria-label="Eliminar bloque"
        >
          ✕
        </button>
      </div>
      {block.type === "repeat" && block.times !== undefined && (
        <div className="flex items-center gap-2 mt-2">
          <label className="text-xs text-slate-400">Veces:</label>
          <input
            type="number"
            min="1"
            max="20"
            value={block.times}
            onChange={(e) => {
              const v = Math.max(1, parseInt(e.target.value) || 1);
              onTimesChange(v);
            }}
            className="w-16 bg-slate-900 border border-slate-700 rounded text-center text-xs text-slate-200 focus:ring-2 focus:ring-electric-500"
          />
        </div>
      )}
    </div>
  );
};

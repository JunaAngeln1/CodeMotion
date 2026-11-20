import {
  closestCenter, DndContext, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useState } from "react";
import { ListPlus } from "lucide-react";
import { BlockItem } from "@/components/blocks/BlockItem";
import { useProgramStore } from "@/store/programStore";

export const EditorCanvas = () => {
  const { program, removeBlock, moveBlock, updateBlock, status } = useProgramStore();
  const disabled = status === "running";
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setDropTarget(null);
    if (disabled || !over || active.id === over.id) return;
    const fromIndex = program.findIndex((block) => block.id === active.id);
    const toIndex = program.findIndex((block) => block.id === over.id);
    if (fromIndex >= 0 && toIndex >= 0) moveBlock(fromIndex, toIndex);
  };

  if (program.length === 0) {
    return (
      <div className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-600 bg-slate-900/30 p-5 text-center">
        <ListPlus size={28} className="text-electric-400" />
        <p className="text-sm font-medium text-slate-200">Aquí empieza tu algoritmo</p>
        <p className="max-w-64 text-xs leading-relaxed text-slate-400">Añade bloques desde arriba. El robot seguirá las instrucciones en orden.</p>
      </div>
    );
  }
  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}
      onDragOver={({ active, over }) => setDropTarget(over && over.id !== active.id ? String(over.id) : null)}
      onDragCancel={() => setDropTarget(null)}>
      <SortableContext items={program.map((b) => b.id)} strategy={verticalListSortingStrategy}>
        <ol className="code-sequence" aria-label="Secuencia de instrucciones">
          {program.map((block, index) => (
            <BlockItem
              key={block.id} block={block} index={index} disabled={disabled} inEditor isDropTarget={dropTarget === block.id}
              onRemove={() => removeBlock(block.id)}
              onTimesChange={(times) => updateBlock(block.id, { times })}
            />
          ))}
        </ol>
      </SortableContext>
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Arrastra desde el asa para ordenar. Con teclado: espacio para agarrar, flechas para mover y espacio para soltar.</p>
    </DndContext>
  );
};

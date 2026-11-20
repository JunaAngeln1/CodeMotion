import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Minus, Plus, Trash2 } from "lucide-react";
import { BlockShape, BlockSymbol } from "./BlockVisual";
import { BLOCK_VISUALS } from "./blockDefinitions";
import type { BlockInstruction, InstructionType } from "@/types";

interface BlockItemProps {
  block: BlockInstruction;
  inEditor: boolean;
  index?: number;
  disabled?: boolean;
  isDropTarget?: boolean;
  onRemove?: () => void;
  onTimesChange?: (value: number) => void;
}

export const BlockItem = ({
  block, inEditor, index = 0, disabled = false, isDropTarget = false, onRemove, onTimesChange,
}: BlockItemProps) => {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id, disabled: disabled || !inEditor,
  });
  const visual = BLOCK_VISUALS[block.type];
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`code-piece code-piece--${block.type} code-piece--program ${isDragging ? "code-piece--dragging" : ""} ${isDropTarget ? "code-piece--target" : ""}`}
      data-disabled={disabled || undefined} data-gesture-block-id={block.id}>
      <BlockShape type={block.type} />
      <div className="code-piece__row">
        <button type="button" ref={setActivatorNodeRef} {...attributes} {...listeners}
          disabled={disabled} aria-label={`Mover instrucción ${index + 1}: ${visual.label}`}
          className="code-piece__handle touch-none">
          <GripVertical size={19} aria-hidden="true" />
        </button>
        <span className="code-piece__order" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
        <BlockSymbol type={block.type} />
        <span className="code-piece__label">{visual.label}</span>
        {inEditor && (
          <button type="button" onClick={onRemove} disabled={disabled} data-gesture-click aria-label={`Eliminar instrucción ${index + 1}: ${visual.label}`}
            className="code-piece__delete"><Trash2 size={17} aria-hidden="true" /></button>
        )}
      </div>
      {block.type === "repeat" && (
        <div className="code-piece__loop-count">
          <label htmlFor={`repeat-times-${block.id}`}>Repeticiones</label>
          <span className="gesture-stepper">
            <button type="button" data-gesture-click disabled={disabled || (block.times ?? 3) <= 1} aria-label={`Disminuir repeticiones de instrucción ${index + 1}`} onClick={() => onTimesChange?.(Math.max(1, (block.times ?? 3) - 1))}><Minus size={16} /></button>
            <input id={`repeat-times-${block.id}`} type="number" inputMode="numeric" min={1} max={20} value={block.times ?? 3} disabled={disabled}
              onChange={(event) => onTimesChange?.(Math.min(20, Math.max(1, parseInt(event.target.value) || 1)))} />
            <button type="button" data-gesture-click disabled={disabled || (block.times ?? 3) >= 20} aria-label={`Aumentar repeticiones de instrucción ${index + 1}`} onClick={() => onTimesChange?.(Math.min(20, (block.times ?? 3) + 1))}><Plus size={16} /></button>
          </span>
          <span>veces</span>
        </div>
      )}
    </li>
  );
};

export const BlockLibrary = ({ onAdd, disabled = false }: { onAdd: (type: InstructionType) => void; disabled?: boolean }) => {
  const types: InstructionType[] = ["move", "turnLeft", "turnRight", "repeat"];
  return (
    <div className="code-library">
      {types.map((type) => (
        <button type="button" key={type} disabled={disabled} aria-label={BLOCK_VISUALS[type].libraryLabel} data-gesture-type={type}
          onClick={() => onAdd(type)} className={`code-piece code-piece--${type} code-piece--library`}>
          <BlockShape type={type} />
          <span className="code-piece__library-content">
            <BlockSymbol type={type} />
            <span className="code-piece__text">
              <span className="code-piece__label">{BLOCK_VISUALS[type].label}</span>
              <span className="code-piece__detail">{BLOCK_VISUALS[type].detail}</span>
            </span>
          </span>
          <Plus size={12} className="code-piece__plus" aria-hidden="true" />
        </button>
      ))}
    </div>
  );
};

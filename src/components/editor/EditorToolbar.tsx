import { useProgramStore } from "@/store/programStore";
import { Button } from "@/components/ui/Button";
import { Play, Square, RotateCcw } from "lucide-react";
import type { ExecutionStatus } from "@/types";

const STATUS_LABELS: Record<ExecutionStatus, string> = {
  idle: "Listo para programar", running: "Ejecutando…", completed: "Meta alcanzada",
  failed: "Inténtalo de nuevo", stopped: "Ejecución detenida",
};

export const EditorToolbar = ({ onReset }: { onReset?: () => void }) => {
  const { status, setStatus, program, resetProgram } = useProgramStore();
  const isRunning = status === "running";
  return (
    <footer className="lab-toolbar" aria-label="Controles del programa">
      <div className="lab-status" role="status">
        <span className={`h-2 w-2 shrink-0 rounded-full ${isRunning ? "animate-pulse bg-green-400" : "bg-electric-400"}`} />
        <span>{STATUS_LABELS[status]}</span>
      </div>
      <div className="lab-actions">
        <Button variant="ghost" onClick={onReset ?? resetProgram} disabled={isRunning} data-gesture-click>
          <RotateCcw size={18} className="shrink-0" /><span>Reiniciar</span>
        </Button>
        <Button variant="danger" onClick={() => setStatus("stopped")} disabled={!isRunning} data-gesture-click>
          <Square size={16} className="shrink-0" /><span>Detener</span>
        </Button>
        <Button variant="primary" onClick={() => setStatus("running")} disabled={isRunning || program.length === 0} data-gesture-click>
          <Play size={18} className="shrink-0" /><span>Ejecutar</span>
        </Button>
      </div>
    </footer>
  );
};

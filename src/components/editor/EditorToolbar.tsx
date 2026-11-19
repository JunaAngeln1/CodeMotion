import { useProgramStore } from "@/store/programStore";
import { Button } from "@/components/ui/Button";
import { Play, Pause, RotateCcw } from "lucide-react";

export const EditorToolbar = () => {
  const { status, setStatus, program, resetProgram } = useProgramStore();

  const isRunning = status === "running";

  const handleExecute = () => setStatus("running");
  const handleStop = () => setStatus("idle");
  const handleReset = () => {
    setStatus("idle");
    resetProgram();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Programa
        </span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === "running"
            ? "bg-green-500/20 text-green-400 animate-pulse"
            : status === "completed"
              ? "bg-green-500/20 text-green-400"
              : status === "failed"
                ? "bg-red-500/20 text-red-400"
                : "bg-slate-700 text-slate-500"
        }`}>
          {status}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="ghost" onClick={handleReset} disabled={isRunning}>
          <RotateCcw className="w-4 h-4" /> Reiniciar
        </Button>
        <Button variant="danger" onClick={handleStop} disabled={!isRunning}>
          <Pause className="w-4 h-4" /> Detener
        </Button>
        <Button
          variant="primary"
          onClick={handleExecute}
          disabled={isRunning || program.length === 0}
        >
          <Play className="w-4 h-4" /> Ejecutar
        </Button>
      </div>
    </div>
  );
};

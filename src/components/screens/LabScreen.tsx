import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Flag } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { useProgramStore } from "@/store/programStore";
import { getLevelById } from "@/levels/data";
import { isLevelCompleted } from "@/persistence";
import { Scene3D } from "@/components/board/Scene3D";
import { Editor } from "@/components/editor/Editor";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { GestureCamera } from "@/components/gesture/GestureCamera";
import { ResetConfirmation } from "@/components/gesture/ResetConfirmation";
import { useRobotStore } from "@/store/robotStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const LabScreen = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [cameraOpen, setCameraOpen] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);
  const { progress, completeLevel } = useProgressStore();
  const id = Number(levelId);
  const level = getLevelById(id);

  if (!level) {
    return <div className="card space-y-4"><h1>Nivel no encontrado</h1><Link to="/niveles" className="btn-ghost">Volver a niveles</Link></div>;
  }

  const alreadyCompleted = isLevelCompleted(progress, id);
  const handleComplete = (won: boolean) => {
    const program = useProgramStore.getState().program;
    if (won && !alreadyCompleted) {
      completeLevel(id, level.points, level.badge, program);
      navigate(`/resultados?won=true&points=${level.points}&badge=${encodeURIComponent(level.badge)}&levelId=${id}`);
    } else {
      navigate(`/resultados?won=${won}&levelId=${id}`);
    }
  };
  const requestReset = () => {
    const state = useProgramStore.getState();
    if (state.status === "running") state.setStatus("stopped");
    setResetRequested(true);
  };
  const confirmReset = () => {
    useProgramStore.getState().resetProgram();
    useRobotStore.getState().reset({ x: level.startX, y: level.startY, direction: level.startDirection, targetX: level.startX, targetY: level.startY });
    setResetRequested(false);
  };

  return (
    <div className="lab-screen">
      <header className="lab-heading">
        <div className="flex min-w-0 items-start gap-3">
          <Link to="/niveles" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white" aria-label="Volver a niveles">
            <ArrowLeft size={20} />
          </Link>
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold uppercase tracking-wider text-electric-400">Desafío {level.id} de 5</span>
              <span className="text-slate-500">·</span>
              <span className="text-slate-400">{level.points} puntos</span>
              {alreadyCompleted && <Badge variant="green">Completado</Badge>}
            </div>
            <h1 className="text-xl font-bold text-white sm:text-2xl">{level.title}</h1>
            <p className="mt-1 max-w-4xl text-sm leading-relaxed text-slate-400">{level.explanation}</p>
          </div>
        </div>
        <div className="lab-camera-toggle">
          <button type="button" className="btn-ghost min-h-11 text-sm" onClick={() => setCameraOpen((open) => !open)} aria-expanded={cameraOpen} aria-controls="gesture-panel">
            <Camera size={18} /> Cámara y gestos
          </button>
          {cameraOpen && (
            <GestureCamera key={level.id} onRequestReset={requestReset} onClose={() => setCameraOpen(false)} enabled />
          )}
        </div>
      </header>

      <div className="lab-workspace">
        <Card padded={false} className="lab-board" role="region" aria-label="Tablero del desafío">
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-slate-700/70 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-white"><Flag size={16} className="text-electric-400" /> Tu misión</h2>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400" /> Meta</span>
              <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-red-400" /> Obstáculo</span>
            </div>
          </div>
          <div className="lab-scene">
            <Scene3D gridSize={level.gridSize} obstacles={level.obstacles} goalX={level.goalX} goalY={level.goalY} />
          </div>
          <p className="shrink-0 border-t border-slate-700/70 px-4 py-2 text-xs text-slate-400">Lleva al robot hasta la meta verde. En pantallas grandes puedes arrastrar con el mouse para girar la vista.</p>
        </Card>
        <Card padded={false} className="lab-editor" role="region" aria-label="Editor de programación">
          <Editor key={level.id} level={level} onComplete={handleComplete} />
        </Card>
      </div>
      <EditorToolbar onReset={requestReset} />
      {resetRequested && <ResetConfirmation onCancel={() => setResetRequested(false)} onConfirm={confirmReset} />}
    </div>
  );
};

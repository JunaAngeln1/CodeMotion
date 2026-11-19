import { useParams, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useProgressStore } from "@/store/progressStore";
import { useProgramStore } from "@/store/programStore";
import { getLevelById } from "@/levels/data";
import { isLevelCompleted } from "@/persistence";
import { Scene3D } from "@/components/board/Scene3D";
import { Editor } from "@/components/editor/Editor";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export const LabScreen = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const { setScreen } = useAppStore();
  const { progress, completeLevel } = useProgressStore();
  const { program } = useProgramStore();

  const id = Number(levelId);
  const level = getLevelById(id);

  if (!level) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400">
        <p>Nivel no encontrado</p>
        <Button
          variant="ghost"
          onClick={() => {
            setScreen("levels");
            navigate("/niveles");
          }}
        >
          Volver a niveles
        </Button>
      </div>
    );
  }

  const alreadyCompleted = isLevelCompleted(progress, id);

  const handleComplete = (won: boolean) => {
    if (won && !alreadyCompleted) {
      completeLevel(id, level.points, level.badge, program);
      navigate(
        `/resultados?won=true&points=${level.points}&badge=${encodeURIComponent(level.badge)}&levelId=${id}`
      );
    } else if (!won) {
      navigate(`/resultados?won=false&levelId=${id}`);
    } else {
      navigate(`/resultados?won=true&levelId=${id}`);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100svh-16rem)]">
      <Card className="flex-1 min-w-0 p-0">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h2 className="font-bold text-white">
              Nivel {level.id} — {level.title}
            </h2>
            <p className="text-sm text-slate-400">{level.explanation}</p>
          </div>
          <div className="flex items-center gap-2">
            <BadgeMini variant={alreadyCompleted ? "green" : "info"} text={alreadyCompleted ? "Completado" : "Activo"} />
            <span className="text-xs text-slate-400">{level.points} pts</span>
          </div>
        </div>
        <div className="flex-1 bg-slate-950 rounded-b-2xl overflow-hidden flex items-center justify-center p-2">
          <Scene3D
            gridSize={level.gridSize}
            obstacles={level.obstacles}
            goalX={level.goalX}
            goalY={level.goalY}
          />
        </div>
      </Card>

      <Card className="w-full lg:w-96 p-0 flex flex-col h-full">
        <div className="p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-white">Editor de bloques</h2>
          <Button variant="ghost" onClick={() => { setScreen("levels"); navigate("/niveles"); }}>
            Volver
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <Editor level={level} onComplete={handleComplete} />
        </div>
      </Card>
    </div>
  );
};

const BadgeMini = ({ variant, text }: { variant: "green" | "info"; text: string }) => {
  const styles: Record<string, string> = {
    green: "bg-green-500/20 text-green-400 border border-green-500/40",
    info: "bg-electric-500/20 text-electric-400 border border-electric-500/40",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium border ${styles[variant]}`}>
      {text}
    </span>
  );
};

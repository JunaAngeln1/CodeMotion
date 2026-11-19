import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useProgressStore } from "@/store/progressStore";
import { LEVELS } from "@/levels/data";
import type { Level } from "@/types";
import { isLevelCompleted } from "@/persistence";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Lock, CheckCircle2 } from "lucide-react";

export const LevelsScreen = () => {
  const navigate = useNavigate();
  const { setScreen } = useAppStore();
  const { progress } = useProgressStore();

  return (
    <div className="space-y-6">
      <div className="card">
        <h1 className="text-2xl font-bold text-white mb-2">Selecciona un desafío</h1>
        <p className="text-slate-400">
          Completa los niveles en orden. Cada uno enseña un concepto nuevo de
          programación.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {LEVELS.map((level: Level) => {
          const completed = isLevelCompleted(progress, level.id);
          const unlocked = progress.currentLevel >= level.id;
          return (
            <Card
              key={level.id}
              padded={false}
              className={`group relative overflow-hidden cursor-pointer border ${
                completed
                  ? "border-green-500/50 bg-green-500/5"
                  : unlocked
                    ? "border-slate-600 hover:border-electric-400"
                    : "border-slate-700/50 opacity-60 grayscale"
              }`}
            >
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-sm font-semibold text-slate-300">
                    Nivel {level.id}
                  </span>
                  {completed ? (
                    <Badge variant="success">Completado</Badge>
                  ) : !unlocked ? (
                    <Badge variant="warning">Bloqueado</Badge>
                  ) : null}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {level.title}
                </h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-3">
                  {level.explanation}
                </p>
                <div className="flex items-center justify-between">
                  <Badge variant="info">{level.points} pts</Badge>
                  {unlocked ? (
                    <Link
                      to={`/laboratorio/${level.id}`}
                      onClick={() => {
                        setScreen("lab");
                        navigate(`/laboratorio/${level.id}`);
                      }}
                      className="w-8 h-8 bg-electric-500 text-slate-900 rounded-lg flex items-center justify-center text-xs font-bold shadow-glow hover:scale-110 transition-transform"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <Lock className="w-4 h-4 text-slate-500" />
                  )}
                </div>
              </div>
              {completed && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <CheckCircle2 className="w-10 h-10 text-green-400" />
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <div className="card border-slate-700">
        <p className="text-sm text-slate-400">
          💡 Puedes usar el mouse o el reconocimiento gestual con tu cámara web
          en cualquier nivel.
        </p>
      </div>
    </div>
  );
};

import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useProgressStore } from "@/store/progressStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressIndicator } from "@/components/ui/ProgressIndicator";
import { Play, Zap, Star } from "lucide-react";

export const HomeScreen = () => {
  const navigate = useNavigate();
  const { setScreen } = useAppStore();
  const { progress } = useProgressStore();

  const startLevel = (id: number) => {
    setScreen("lab");
    navigate(`/laboratorio/${id}`);
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bienvenido a CodeMotion
            </h1>
            <p className="text-slate-400 mb-4">
              Aprende a programar un robot 3D con bloques visuales y gestos de
              mano. Supera cinco desafíos progresivos.
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge variant="electric">Bloques visuales</Badge>
              <Badge variant="purple">Reconocimiento gestual</Badge>
              <Badge variant="green">Three.js 3D</Badge>
              <Badge variant="orange">Cinco niveles</Badge>
            </div>
          </div>
          <div className="w-full md:w-64 flex flex-col gap-3">
            <Button variant="primary" onClick={() => startLevel(1)} className="w-full">
              <Play className="w-5 h-5" /> Empezar desafío 1
            </Button>
            <Button variant="ghost" onClick={() => setScreen("levels")} className="w-full">
              <Zap className="w-5 h-5" /> Seleccionar nivel
            </Button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Star className="w-5 h-5 text-electric-400" /> Tu progreso
        </h2>
        <ProgressIndicator
          value={progress.completedLevels.length}
          max={5}
          label="Niveles completados"
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400">Niveles completados</div>
            <div className="text-2xl font-bold text-electric-400">
              {progress.completedLevels.length}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400">Puntos totales</div>
            <div className="text-2xl font-bold text-white">{progress.points}</div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400">Insignias</div>
            <div className="text-2xl font-bold text-purple-400">
              {progress.badges.length}
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700">
            <div className="text-xs text-slate-400">Nivel actual</div>
            <div className="text-2xl font-bold text-white">
              {progress.currentLevel}
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Cómo jugar</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-electric-400">1</div>
            <div>
              <div className="font-medium text-white">Arrastra bloques</div>
              <div className="text-sm text-slate-400">
                Construye tu programa con los bloques de Avanzar, Girar y Repetir.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-purple-400">2</div>
            <div>
              <div className="font-medium text-white">Ejecuta y observa</div>
              <div className="text-sm text-slate-400">
                Ejecuta el programa y mira al robot moverse en 3D.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-green-400">3</div>
            <div>
              <div className="font-medium text-white">Llega a la meta</div>
              <div className="text-sm text-slate-400">
                El robot debe llegar realmente a la casilla meta.
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-orange-400">4</div>
            <div>
              <div className="font-medium text-white">Usa gestos (opcional)</div>
              <div className="text-sm text-slate-400">
                Controla todo también con tu cámara web y MediaPipe.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

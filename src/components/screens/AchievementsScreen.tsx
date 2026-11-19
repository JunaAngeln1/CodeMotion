import { useProgressStore } from "@/store/progressStore";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Trophy, Zap, Target } from "lucide-react";

const ACHIEVEMENTS = [
  {
    id: "iniciador",
    title: "Iniciador",
    icon: <PlayIcon />,
    color: "text-electric-400",
    bg: "bg-electric-500/10",
    border: "border-electric-500/20",
    desc: "Completa tu primer desafío.",
  },
  {
    id: "navegante",
    title: "Navegante",
    icon: <Zap className="text-purple-400" />,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    desc: "Aprende a girar y cambiar de dirección.",
  },
  {
    id: "explorador",
    title: "Explorador",
    icon: <Target className="text-green-400" />,
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    desc: "Evita obstáculos y encuentra el camino.",
  },
  {
    id: "ciclista",
    title: "Ciclista",
    icon: <Zap className="text-orange-400" />,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/20",
    desc: "Domina los ciclos de repetición.",
  },
  {
    id: "maestro",
    title: "Maestro CodeMotion",
    icon: <Trophy className="text-yellow-400" />,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    desc: "Completa la misión final.",
  },
];

function PlayIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 ${className}`
      }
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export const AchievementsScreen = () => {
  const { progress } = useProgressStore();
  const has = (id: string) => progress.badges.some((b: string) => b === id);

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">Reconocimientos</h1>
        </div>
        <p className="text-slate-400 mt-1">
          Colecciona insignias al completar desafíos.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((a) => {
          const earned = has(a.id);
          return (
            <Card
              key={a.id}
              className={`p-5 text-center transition-all ${
                earned
                  ? "border-yellow-400/40 bg-yellow-500/5 shadow-glow"
                  : "border-slate-700 opacity-70 grayscale hover:opacity-100"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 ${earned ? a.bg : "bg-slate-800"} ${a.border}`}>
                {a.icon}
              </div>
              <h3 className={`font-bold mb-1 ${earned ? "text-white" : "text-slate-500"}`}>
                {a.title}
              </h3>
              <p className={`text-xs ${earned ? "text-slate-300" : "text-slate-600"}`}>
                {a.desc}
              </p>
              {earned && (
                <Badge variant="purple" className="mt-3">
                  Desbloqueado
                </Badge>
              )}
            </Card>
          );
        })}
      </div>

      <div className="card">
        <h2 className="text-lg font-bold text-white mb-4">Estadísticas</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400">Niveles completados</div>
            <div className="text-2xl font-bold text-electric-400">
              {progress.completedLevels.length} / 5
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400">Insignias obtenidas</div>
            <div className="text-2xl font-bold text-purple-400">
              {progress.badges.length} / 5
            </div>
          </div>
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700">
            <div className="text-xs text-slate-400">Puntos totales</div>
            <div className="text-2xl font-bold text-white">
              {progress.points}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

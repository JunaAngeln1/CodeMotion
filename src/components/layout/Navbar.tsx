import { useAppStore } from "@/store/appStore";
import { useProgressStore } from "@/store/progressStore";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

const SCREENS: { id: string; label: string; path: string }[] = [
  { id: "home", label: "Inicio", path: "/" },
  { id: "levels", label: "Niveles", path: "/niveles" },
  { id: "lab", label: "Laboratorio", path: "/laboratorio" },
  { id: "results", label: "Resultados", path: "/resultados" },
  { id: "achievements", label: "Reconocimientos", path: "/reconocimientos" },
];

export const Navbar = () => {
  const { screen, setScreen } = useAppStore();
  const { progress } = useProgressStore();

  const goTo = (id: string) => {
    setScreen(id as any);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/90 backdrop-blur border-b border-slate-700 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            goTo("home");
          }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-electric-400 to-purple-500 rounded-lg flex items-center justify-center shadow-glow">
            <span className="text-[10px] font-bold text-slate-900">CM</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Code<span className="text-electric-400">Motion</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {SCREENS.map((s) => {
            const active = screen === s.id;
            return (
              <Button
                key={s.id}
                variant="ghost"
                onClick={() => goTo(s.id)}
                className={
                  active
                    ? "bg-electric-500/20 text-electric-400 border-electric-500/50"
                    : ""
                }
              >
                {s.label}
              </Button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs text-slate-400">Puntos</span>
            <span className="text-sm font-bold text-electric-400">
              {progress.points}
            </span>
          </div>
          <Badge variant="purple">{progress.badges.length} insignia(s)</Badge>
        </div>
      </div>
    </nav>
  );
};

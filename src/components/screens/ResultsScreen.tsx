import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import { useProgressStore } from "@/store/progressStore";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { CheckCircle2, ArrowRight, RotateCcw } from "lucide-react";

export const ResultsScreen = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setScreen } = useAppStore();
  const { progress } = useProgressStore();

  const won = searchParams.get("won") === "true";
  const points = Number(searchParams.get("points")) || 0;
  const badge = searchParams.get("badge") || undefined;
  const levelId = Number(searchParams.get("levelId")) || 1;

  const nextId = levelId + 1;
  const nextUnlocked = progress.currentLevel >= nextId;

  const goHome = () => {
    setScreen("home");
    navigate("/");
  };
  const goLevels = () => {
    setScreen("levels");
    navigate("/niveles");
  };
  const goNext = () => {
    setScreen("lab");
    navigate(`/laboratorio/${nextId}`);
  };
  const retry = () => {
    setScreen("lab");
    navigate(`/laboratorio/${levelId}`);
  };

  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6">
      <div className="card w-full max-w-md p-8">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
          won ? "bg-green-500/20 text-green-400 border border-green-500/40 shadow-glow" : "bg-red-500/20 text-red-400 border border-red-500/40"
        }`}>
          {won ? (
            <CheckCircle2 className="w-8 h-8" />
          ) : (
            <RotateCcw className="w-8 h-8" animate-spin />
          )}
        </div>
        <h1 className="text-2xl font-bold text-white mb-1">
          {won ? "¡Desafío superado!" : "Sigue intentando"}
        </h1>
        <p className="text-slate-400 mb-6">
          {won
            ? `El robot llegó a la meta. Ganaste ${points} puntos.`
            : "El robot no llegó a la meta. Revisa tus bloques e inténtalo de nuevo."}
        </p>

        {won && badge && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <Badge variant="purple">Nueva insignia: {badge}</Badge>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          {won ? (
            <>
              {nextUnlocked ? (
                <Button variant="primary" onClick={goNext} className="flex-1">
                  <ArrowRight className="w-4 h-4" /> Siguiente nivel
                </Button>
              ) : (
                <Button variant="primary" onClick={goLevels} className="flex-1">
                  Ver niveles
                </Button>
              )}
              <Button variant="ghost" onClick={retry} className="flex-1">
                Volver a intentar
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={retry} className="flex-1">
              Volver a intentar
            </Button>
          )}
          <Button variant="ghost" onClick={goHome} className="flex-1">
            Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

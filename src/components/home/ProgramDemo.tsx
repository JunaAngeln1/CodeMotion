import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, Flag, Play, RotateCcw, Sparkles } from "lucide-react";
import { BlockShape } from "@/components/blocks/BlockVisual";
import { interpretProgram } from "@/engine/interpreter";
import { HomeRobot } from "./HomeRobot";

const GREETINGS = ["¡Hola! ¿Programamos juntos?", "¡Choca esos cinco, explorador!", "Tú pones las ideas. ¡Yo me muevo!", "¡Cada gran misión empieza con un bloque!"];
type DemoPhase = "idle" | "running" | "won";

export const ProgramDemo = () => {
  const [phase, setPhase] = useState<DemoPhase>("idle");
  const [position, setPosition] = useState(0);
  const [greeting, setGreeting] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (phase !== "running") return;
    // Use the real interpreter, but never the game's stores or persistence.
    const program = interpretProgram({
      program: [{ id: "demo-1", type: "move" }, { id: "demo-2", type: "move" }],
      gridSize: 3, obstacles: [], goalX: 2, goalY: 1,
      start: { x: 0, y: 1, direction: "east", targetX: 0, targetY: 1 }, stepDelayMs: 800,
    });
    const timer = setInterval(() => {
      const next = program.next();
      if (next.done) {
        clearInterval(timer);
        setPhase("won");
      } else if (next.value.kind === "move") {
        setPosition(next.value.x);
      } else if (next.value.kind === "goal") {
        clearInterval(timer);
        setPhase("won");
      }
    }, 800);
    return () => clearInterval(timer);
  }, [phase]);

  const run = () => {
    setPosition(0);
    setPhase("running");
  };
  const reset = () => {
    setPhase("idle");
    setPosition(0);
  };
  const message = phase === "won" ? "¡Lo lograste! Dos bloques, dos pasos." : phase === "running"
    ? `Avanzar: paso ${Math.min(position + 1, 2)} de 2…`
    : GREETINGS[greeting % GREETINGS.length];

  return (
    <section className="home-demo" aria-labelledby="home-demo-title">
      <div className="home-demo__heading">
        <div><span className="home-eyebrow">PRUEBA RÁPIDA</span><h2 id="home-demo-title">Dos bloques. ¡Y a la meta!</h2></div>
        <span className="home-demo__tag"><span /> Interactivo</span>
      </div>
      <div className="home-demo__scene" data-position={position}>
        <span className="home-demo__orbit home-demo__orbit--one" aria-hidden="true" />
        <span className="home-demo__orbit home-demo__orbit--two" aria-hidden="true" />
        <Sparkles className="home-demo__spark" size={24} aria-hidden="true" />
        <p className="home-demo__speech" role="status">{message}</p>
        <div className="home-demo__track" aria-hidden="true">
          {[0, 1, 2].map((tile) => <span key={tile} className={`home-demo__tile ${tile <= position ? "home-demo__tile--visited" : ""} ${tile === 2 ? "home-demo__tile--goal" : ""}`}>{tile === 2 ? <Flag size={20} /> : <span />}</span>)}
        </div>
        <motion.div className="home-demo__robot" initial={false} animate={{ left: `${16.6667 + position * 33.3333}%` }}
          transition={{ duration: reducedMotion ? 0 : 0.45, ease: "easeInOut" }}>
          <HomeRobot greeting={greeting} happy={phase === "won"} onGreet={() => setGreeting((value) => value + 1)} />
        </motion.div>
        {phase === "won" && <div className="home-demo__celebration" aria-hidden="true">
          {["#67e8f9", "#c084fc", "#fbbf24", "#4ade80", "#67e8f9", "#fb923c"].map((color, i) => <span key={i} style={{ left: `${12 + i * 15}%`, backgroundColor: color, animationDelay: `${i * 0.07}s` }} />)}
        </div>}
      </div>
      <ol className="home-demo__sequence" aria-label="Programa de demostración">
        {[0, 1].map((step) => (
          <li key={step} aria-current={phase === "running" && Math.min(position, 1) === step ? "step" : undefined}
            className={`code-piece code-piece--move home-demo__instruction ${phase === "running" && Math.min(position, 1) === step ? "home-demo__instruction--active" : ""}`}>
            <BlockShape type="move" /><ArrowRight size={16} aria-hidden="true" /><span>Avanzar</span>
            <span className="sr-only">, instrucción {step + 1}</span>
          </li>
        ))}
        <li className={`home-demo__finish ${phase === "won" ? "home-demo__finish--won" : ""}`}><Flag size={18} aria-hidden="true" /> Meta</li>
      </ol>
      <div className="home-demo__controls">
        <button type="button" className="home-demo__play" onClick={run} disabled={phase === "running"}>
          {phase === "won" ? <Check size={18} /> : <Play size={18} />} {phase === "running" ? "Ejecutando…" : phase === "won" ? "Volver a probar" : "¡Pruébalo!"}
        </button>
        <button type="button" className="home-demo__reset" onClick={reset} disabled={phase === "idle"} aria-label="Reiniciar demostración"><RotateCcw size={18} /></button>
      </div>
      <p className="home-demo__note">Solo es una prueba. Tu progreso y tus puntos no cambian.</p>
    </section>
  );
};

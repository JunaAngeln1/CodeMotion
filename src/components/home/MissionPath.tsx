import { Link } from "react-router-dom";
import { ArrowRight, Check, Flag, Lock, Repeat2, Route, Sparkles } from "lucide-react";
import { LEVELS } from "@/levels/data";
import type { UserProgress } from "@/types";

const MISSION_ICONS = [Flag, Route, Route, Repeat2, Sparkles];
const CONCEPTS = ["Tus primeras instrucciones", "Dale un giro a la aventura", "Encuentra una ruta segura", "Menos bloques, más pasos", "Pon a prueba tus ideas"];

export const MissionPath = ({ progress }: { progress: UserProgress }) => (
  <section className="home-missions" aria-labelledby="home-missions-title">
    <div className="home-section-heading">
      <div><span className="home-eyebrow">TU MAPA DE AVENTURAS</span><h2 id="home-missions-title">Cinco misiones. Un gran programador.</h2></div>
      <Link to="/niveles" className="home-text-link">Ver todos los niveles <ArrowRight size={16} aria-hidden="true" /></Link>
    </div>
    <ol className="home-mission-track" aria-label="Camino de misiones">
      {LEVELS.map((level, index) => {
        const complete = progress.completedLevels.includes(level.id);
        const available = complete || level.id <= progress.currentLevel;
        const Icon = complete ? Check : available ? MISSION_ICONS[index] : Lock;
        const status = complete ? "Completada" : available ? "Disponible" : "Bloqueada";
        const content = <>
          <span className={`home-mission__node ${complete ? "home-mission__node--complete" : available ? "home-mission__node--active" : ""}`}><Icon size={23} aria-hidden="true" /></span>
          <span className="home-mission__body">
            <span className="home-mission__number">MISIÓN 0{level.id}</span>
            <span className="home-mission__title">{level.title}</span>
            <span className="home-mission__concept">{CONCEPTS[index]}</span>
            <span className={`home-mission__status ${available ? "home-mission__status--available" : ""}`}>{complete ? "¡Buen trabajo!" : available ? "¡Vamos allá!" : "Completa la anterior"}{available && <ArrowRight size={14} aria-hidden="true" />}</span>
          </span>
        </>;
        return <li key={level.id}>
          {available ? <Link to={`/laboratorio/${level.id}`} className={`home-mission ${complete ? "home-mission--complete" : "home-mission--available"}`} aria-label={`Misión ${level.id}: ${level.title}. ${status}`}>{content}</Link>
            : <button type="button" className="home-mission home-mission--locked" disabled aria-label={`Misión ${level.id}: ${level.title}. ${status}`}>{content}</button>}
        </li>;
      })}
    </ol>
  </section>
);

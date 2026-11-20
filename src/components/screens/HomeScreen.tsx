import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Blocks, Flag, Hand, Medal, Play, Rocket, Sparkles, Trophy } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";
import { LEVELS } from "@/levels/data";
import { ProgramDemo } from "@/components/home/ProgramDemo";
import { MissionPath } from "@/components/home/MissionPath";
import "@/components/home/home.css";

export const HomeScreen = () => {
  const progress = useProgressStore((state) => state.progress);
  const reducedMotion = useReducedMotion();
  const completed = LEVELS.filter((level) => progress.completedLevels.includes(level.id)).length;
  const next = LEVELS.find((level) => !progress.completedLevels.includes(level.id));
  const hasStarted = completed > 0;

  return (
    <div className="home-page">
      <motion.section className="home-hero" aria-labelledby="home-title" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div className="home-hero__copy">
          <span className="home-hero__eyebrow"><Sparkles size={15} aria-hidden="true" /> TU CENTRO DE MISIONES</span>
          <h1 id="home-title">Tu próxima aventura empieza con <span>un bloque.</span></h1>
          <p>Un robot, tus ideas y un mundo por descubrir. Construye instrucciones, supera desafíos y descubre todo lo que puedes crear.</p>
          <div className="home-hero__actions">
            <Link to={next ? `/laboratorio/${next.id}` : "/reconocimientos"} className="home-primary-link">
              <Rocket size={21} aria-hidden="true" /> {next ? hasStarted ? "Continuar misión" : "Empezar aventura" : "Ver mis logros"}<ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link to="/niveles" className="home-secondary-link"><Flag size={18} aria-hidden="true" /> Seleccionar nivel</Link>
          </div>
          <div className="home-hero__features"><span><Blocks size={16} aria-hidden="true" /> Aprende jugando</span><span><Hand size={16} aria-hidden="true" /> Con mouse o gestos</span></div>
          <div className="home-hero__hint"><span className="home-hero__hint-icon"><Play size={16} fill="currentColor" aria-hidden="true" /></span><p>¿Tu primera vez?<strong> ¡Prueba los bloques antes de empezar!</strong></p></div>
          <div className="home-hero__decoration" aria-hidden="true"><span>{"{ }"}</span><span>↻</span><span>→</span></div>
        </div>
        <ProgramDemo />
      </motion.section>

      <motion.section className="home-progress" aria-labelledby="home-progress-title" initial={reducedMotion ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.12 }}>
        <div className="home-progress__journey">
          <span className="home-progress__icon"><Rocket size={24} aria-hidden="true" /></span>
          <div><h2 id="home-progress-title">{completed === LEVELS.length ? "¡Todas las misiones superadas!" : hasStarted ? `¡Ya completaste ${completed} de ${LEVELS.length} misiones!` : "Tu gran aventura está por comenzar"}</h2>
            <p>{next ? `Próxima misión: ${next.title}` : "Puedes volver a jugar y probar nuevas soluciones."}</p>
            <div className="home-progress__bar" role="progressbar" aria-label="Misiones completadas" aria-valuemin={0} aria-valuemax={LEVELS.length} aria-valuenow={completed}><span style={{ width: `${completed / LEVELS.length * 100}%` }} /></div>
          </div>
        </div>
        <div className="home-progress__stat"><Trophy size={22} aria-hidden="true" /><strong>{progress.points}</strong><span>Puntos ganados</span></div>
        <Link to="/reconocimientos" className="home-progress__stat home-progress__stat--link" aria-label={`Ver mis ${progress.badges.length} insignias`}><Medal size={22} aria-hidden="true" /><strong>{progress.badges.length}<small> / {LEVELS.length}</small></strong><span>Mis insignias <ArrowRight size={12} aria-hidden="true" /></span></Link>
      </motion.section>

      <motion.div initial={reducedMotion ? false : { opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.1 }} transition={{ duration: 0.45 }}>
        <MissionPath progress={progress} />
        {next && <p className="home-next-reward"><Medal size={17} aria-hidden="true" /> Tu próxima insignia: <strong>{next.badge}</strong><span>· Completa «{next.title}» para conseguirla.</span></p>}
      </motion.div>

      <section className="home-discover" aria-labelledby="home-discover-title">
        <div className="home-section-heading"><div><span className="home-eyebrow">NO NECESITAS SABER PROGRAMAR</span><h2 id="home-discover-title">Solo necesitas curiosidad.</h2></div></div>
        <div className="home-learning-grid">
          <article><span className="home-learning-icon home-learning-icon--blue"><Blocks size={26} aria-hidden="true" /></span><span className="home-learning-number">01</span><h3>Imagina y construye</h3><p>Combina piezas para decirle al robot qué hacer. ¡Cada bloque es una idea!</p></article>
          <article><span className="home-learning-icon home-learning-icon--purple"><Play size={26} aria-hidden="true" /></span><span className="home-learning-number">02</span><h3>Prueba y descubre</h3><p>Observa cómo se mueve. Si algo no sale, cambia un bloque y vuelve a probar.</p></article>
          <article><span className="home-learning-icon home-learning-icon--orange"><Medal size={26} aria-hidden="true" /></span><span className="home-learning-number">03</span><h3>Celebra cada logro</h3><p>Alcanza la meta, desbloquea misiones y consigue tus propias insignias.</p></article>
        </div>
        <p className="home-access-note"><Hand size={18} aria-hidden="true" /> Juega con el mouse o tocando la pantalla. Si quieres usar gestos, activa la cámara dentro del laboratorio.</p>
      </section>
    </div>
  );
};

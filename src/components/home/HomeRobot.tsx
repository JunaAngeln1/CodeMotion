import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface HomeRobotProps {
  greeting: number;
  happy: boolean;
  onGreet: () => void;
}

export const HomeRobot = ({ greeting, happy, onGreet }: HomeRobotProps) => {
  const bodyGradient = useId();
  const reducedMotion = useReducedMotion();
  return (
    <button type="button" className="home-robot" aria-label="Saludar al robot" onClick={onGreet}>
      <svg viewBox="0 0 180 210" fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={bodyGradient} x1="45" y1="90" x2="130" y2="172" gradientUnits="userSpaceOnUse">
            <stop stopColor="#67e8f9" /><stop offset="1" stopColor="#0891b2" />
          </linearGradient>
        </defs>
        <ellipse cx="90" cy="197" rx="50" ry="8" fill="#020617" opacity=".25" />
        <path d="M89 35V22" stroke="#c084fc" strokeWidth="6" strokeLinecap="round" />
        <circle cx="89" cy="17" r="8" fill="#c084fc" />
        <circle cx="86" cy="14" r="2.5" fill="#f3e8ff" />
        <rect x="61" y="159" width="21" height="28" rx="7" fill="#6b90b1" />
        <rect x="100" y="159" width="21" height="28" rx="7" fill="#6b90b1" />
        <rect x="51" y="179" width="35" height="14" rx="6" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
        <rect x="96" y="179" width="35" height="14" rx="6" fill="#334155" stroke="#94a3b8" strokeWidth="2" />
        <rect x="46" y="99" width="88" height="68" rx="20" fill={`url(#${bodyGradient})`} stroke="#a5f3fc" strokeWidth="2" />
        <rect x="64" y="115" width="52" height="32" rx="11" fill="#0e5068" />
        <path d="m80 131 7 6 13-14" stroke="#a5f3fc" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="78" cy="156" r="3" fill="#e0f2fe" /><circle cx="90" cy="156" r="3" fill="#e0f2fe" /><circle cx="102" cy="156" r="3" fill="#e0f2fe" />
        <path d="M43 112 32 138" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
        <circle cx="30" cy="142" r="10" fill="#22d3ee" stroke="#a5f3fc" strokeWidth="2" />
        <motion.g key={greeting} style={{ originX: "135px", originY: "110px" }}
          animate={{ rotate: reducedMotion ? 0 : [0, -22, 12, -22, 10, 0] }} transition={{ duration: 1.1, ease: "easeInOut" }}>
          <path d="m137 110 17-22" stroke="#94a3b8" strokeWidth="13" strokeLinecap="round" />
          <path d="M154 89V75m0 8 10-7m-9 9 13 1" stroke="#a5f3fc" strokeWidth="6" strokeLinecap="round" />
          <circle cx="155" cy="88" r="9" fill="#22d3ee" />
        </motion.g>
        <rect x="35" y="37" width="110" height="71" rx="24" fill="#164e63" stroke="#67e8f9" strokeWidth="3" />
        <rect x="43" y="45" width="94" height="53" rx="18" fill="#0b213b" />
        <g className="home-robot__eyes">
          <rect x="60" y="61" width="12" height="17" rx="6" fill="#a5f3fc" />
          <rect x="108" y="61" width="12" height="17" rx="6" fill="#a5f3fc" />
          <circle cx="64" cy="65" r="2" fill="white" /><circle cx="112" cy="65" r="2" fill="white" />
        </g>
        <path d={happy ? "M78 82Q90 98 102 82" : "M81 84Q90 91 99 84"} stroke="#67e8f9" strokeWidth="3" strokeLinecap="round" />
        <rect x="29" y="59" width="8" height="26" rx="4" fill="#c084fc" />
        <rect x="143" y="59" width="8" height="26" rx="4" fill="#c084fc" />
      </svg>
    </button>
  );
};

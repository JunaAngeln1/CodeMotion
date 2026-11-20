import { useId } from "react";
import { BLOCK_VISUALS } from "./blockDefinitions";
import type { InstructionType } from "@/types";

// Only the decorative background is shaped. Controls and focus rings are never clipped.
export const BlockShape = ({ type }: { type: InstructionType }) => {
  const gradient = useId();
  const rightEdge = type === "repeat"
    ? "V27 H232 Q223 27 223 36 V45 Q223 54 232 54 H238 V60"
    : "V60";
  return (
    <svg className="code-piece__shape" viewBox="0 0 240 88" preserveAspectRatio="none" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--piece-start)" />
          <stop offset="100%" stopColor="var(--piece-end)" />
        </linearGradient>
      </defs>
      <path
        d={`M14 8 H38 L45 16 H71 L78 8 H226 Q238 8 238 20 ${rightEdge} Q238 74 226 74 H78 L71 83 H45 L38 74 H14 Q2 74 2 62 V20 Q2 8 14 8 Z`}
        fill={`url(#${gradient})`} stroke="var(--piece-edge)" strokeWidth="1.2" vectorEffect="non-scaling-stroke"
      />
      <path d="M15 12 H36 L43 20 H73 L80 12 H225" fill="none" stroke="white" strokeOpacity="0.18" strokeWidth="1" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export const BlockSymbol = ({ type }: { type: InstructionType }) => {
  const Icon = BLOCK_VISUALS[type].icon;
  return <span className="code-piece__symbol" aria-hidden="true"><Icon strokeWidth={2.5} /></span>;
};

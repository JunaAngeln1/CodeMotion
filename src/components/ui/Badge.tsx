import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "success" | "warning" | "info" | "purple" | "electric" | "green" | "orange";
}

const BADGE_STYLES: Record<string, string> = {
  success: "bg-green-500/20 text-green-400 border border-green-500/40",
  warning: "bg-orange-500/20 text-orange-400 border border-orange-500/40",
  info: "bg-electric-500/20 text-electric-400 border border-electric-500/40",
  purple: "bg-purple-500/20 text-purple-400 border border-purple-500/40",
  electric: "bg-electric-500/20 text-electric-400 border border-electric-500/40",
  green: "bg-green-500/20 text-green-400 border border-green-500/40",
  orange: "bg-orange-500/20 text-orange-400 border border-orange-500/40",
};

const Badge = ({ className, variant = "info", children, ...props }: BadgeProps) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${BADGE_STYLES[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  );
};

export { Badge };

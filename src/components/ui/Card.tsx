import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padded?: boolean;
}

const Card = ({ className, padded = true, children, ...props }: CardProps) => {
  return (
    <div
      className={`bg-slate-800/60 border border-slate-700 rounded-2xl shadow-soft ${
        padded ? "p-6" : "p-0"
      } ${className ?? ""}`}
      {...props}
    >
      {children}
    </div>
  );
};

export { Card };

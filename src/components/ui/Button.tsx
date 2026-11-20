import { type ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "danger";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, disabled, ...props }, ref) => {
    const base =
      "inline-flex min-h-11 items-center justify-center gap-2 font-semibold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none";
    const variants: Record<string, string> = {
      primary:
        "px-5 py-2.5 bg-electric-500 text-slate-900 shadow-glow hover:scale-105 active:scale-95",
      ghost:
        "px-4 py-2.5 bg-slate-800 border border-slate-600 text-slate-300 hover:bg-slate-700 hover:border-slate-500",
      danger:
        "px-4 py-2.5 bg-red-600 text-white hover:bg-red-500",
    };
    return (
      <button
        ref={ref}
        className={`${base} ${variants[variant]} ${className ?? ""}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };

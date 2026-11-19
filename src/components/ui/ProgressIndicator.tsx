interface ProgressIndicatorProps {
  value: number;
  max: number;
  label?: string;
}

const ProgressIndicator = ({ value, max, label }: ProgressIndicatorProps) => {
  const pct = max === 0 ? 0 : Math.min(100, (value / max) * 100);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-xs font-semibold text-slate-300">
        <span>{label ?? "Progreso"}</span>
        <span>{value} / {max}</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-electric-400 to-purple-500 shadow-glow transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export { ProgressIndicator };

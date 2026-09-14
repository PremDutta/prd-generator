import { CircleCheck, CircleX, Gauge } from "lucide-react";

const GRADE_STYLES = {
  A: "bg-emerald-100 text-emerald-700",
  B: "bg-lime-100 text-lime-700",
  C: "bg-amber-100 text-amber-700",
  D: "bg-orange-100 text-orange-700",
  F: "bg-red-100 text-red-700",
};

const BAR_COLORS = {
  A: "bg-emerald-500",
  B: "bg-lime-500",
  C: "bg-amber-500",
  D: "bg-orange-500",
  F: "bg-red-500",
};

export default function QualityScore({ score }) {
  if (!score) return null;

  return (
    <div className="card p-4">
      <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
        <Gauge size={13} /> Quality score
      </p>

      <div className="mb-2 flex items-baseline gap-2">
        <span className="font-mono text-3xl leading-none tracking-tight text-slate-900">{score.score}</span>
        <span className="text-sm text-slate-400">/ 100</span>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${GRADE_STYLES[score.grade]}`}>
          {score.grade}
        </span>
      </div>

      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${BAR_COLORS[score.grade]}`}
          style={{ width: `${score.score}%` }}
        />
      </div>

      <ul className="space-y-2 text-xs">
        {score.checks.map((check) => (
          <li key={check.id} className="flex gap-2">
            {check.passed ? (
              <CircleCheck size={14} className="mt-px shrink-0 text-emerald-500" />
            ) : (
              <CircleX size={14} className="mt-px shrink-0 text-red-500" />
            )}
            <span className={check.passed ? "text-slate-400" : "text-slate-700"}>
              <span className="font-medium">{check.label}</span>
              {!check.passed && <span className="block text-slate-500">{check.detail}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

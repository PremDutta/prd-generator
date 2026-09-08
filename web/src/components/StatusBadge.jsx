const COLORS = {
  Draft: "bg-slate-100 text-slate-600 ring-slate-200",
  "In Review": "bg-amber-50 text-amber-700 ring-amber-200",
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const DOTS = {
  Draft: "bg-slate-400",
  "In Review": "bg-amber-500",
  Approved: "bg-emerald-500",
};

export default function StatusBadge({ status }) {
  const key = COLORS[status] ? status : "Draft";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${COLORS[key]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${DOTS[key]}`} />
      {status || "Draft"}
    </span>
  );
}

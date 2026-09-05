const COLORS = {
  Draft: "bg-slate-100 text-slate-600",
  "In Review": "bg-amber-100 text-amber-700",
  Approved: "bg-emerald-100 text-emerald-700",
};

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${COLORS[status] || COLORS.Draft}`}>
      {status || "Draft"}
    </span>
  );
}

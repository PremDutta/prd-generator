export default function Stat({ value, label }) {
  return (
    <div className="card px-6 py-5 text-center">
      <div className="text-3xl font-bold text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

export default function Stat({ value, label, icon }) {
  return (
    <div className="card px-6 py-5 text-center">
      {icon && <div className="mb-1 text-xl">{icon}</div>}
      <div className="font-mono text-3xl font-normal tracking-tight text-slate-900">{value}</div>
      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

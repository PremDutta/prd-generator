export default function Stat({ value, label, icon: Icon }) {
  return (
    <div className="card card-hover flex items-center gap-4 px-5 py-4">
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-brand-50 text-brand-600">
          <Icon size={18} />
        </div>
      )}
      <div>
        <div className="font-mono text-2xl font-normal leading-none tracking-tight text-slate-900">{value}</div>
        <div className="mt-1.5 text-sm text-slate-500">{label}</div>
      </div>
    </div>
  );
}

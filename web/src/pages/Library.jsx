import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Search, TriangleAlert, Copy, Download, Trash2 } from "lucide-react";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { STATUSES } from "../constants.js";
import { countGaps } from "../gaps.js";
import { LibraryRowSkeleton } from "../components/Skeleton.jsx";

export default function Library() {
  const [prds, setPrds] = useState([]);
  const [templates, setTemplates] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    api.listPrds({ search, status: statusFilter }).then(setPrds).finally(() => setLoading(false));
  };

  useEffect(load, [search, statusFilter]);
  useEffect(() => {
    api.getConfig().then((cfg) => setTemplates(cfg.templates));
  }, []);

  const sorted = [...prds].sort((a, b) => {
    if (sortBy === "updated") return new Date(b.updatedAt) - new Date(a.updatedAt);
    if (sortBy === "created") return new Date(b.createdAt) - new Date(a.createdAt);
    return a.name.localeCompare(b.name);
  });

  const duplicate = async (id) => {
    await api.duplicatePrd(id);
    load();
  };

  const remove = async (id) => {
    await api.deletePrd(id);
    setPendingDelete(null);
    load();
  };

  return (
    <div>
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
        <BookOpen size={22} className="text-brand-600" /> My PRDs
      </h1>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="relative">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="input pl-8" placeholder="Search by name or tag..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="input" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select className="input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="updated">Sort: Last updated</option>
          <option value="created">Sort: Created</option>
          <option value="name">Sort: Name</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          <LibraryRowSkeleton />
          <LibraryRowSkeleton />
          <LibraryRowSkeleton />
        </div>
      ) : sorted.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No PRDs match. <Link to="/new" className="text-brand-600 hover:underline">Create one</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((prd) => (
            <div key={prd.id} className="card card-hover flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/prds/${prd.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{prd.name}</Link>
                  <StatusBadge status={prd.status} />
                </div>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs text-slate-400">
                  <span>{templates[prd.templateId]?.name || "PRD"} • Updated {new Date(prd.updatedAt || prd.createdAt).toLocaleString()}</span>
                  {prd.tags?.length ? <span>• {prd.tags.join(", ")}</span> : null}
                  {countGaps(prd.content) > 0 ? (
                    <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                      • <TriangleAlert size={11} /> {countGaps(prd.content)} gap{countGaps(prd.content) > 1 ? "s" : ""}
                    </span>
                  ) : null}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/prds/${prd.id}`} className="btn-secondary text-xs">Open</Link>
                <button className="btn-ghost text-xs" title="Duplicate" onClick={() => duplicate(prd.id)}><Copy size={14} /></button>
                <a className="btn-ghost text-xs" title="Download" href={api.exportUrl(prd.id, "markdown")}><Download size={14} /></a>
                {pendingDelete === prd.id ? (
                  <button className="btn text-xs bg-red-600 text-white shadow-soft hover:bg-red-700" onClick={() => remove(prd.id)}>
                    Confirm delete
                  </button>
                ) : (
                  <button className="btn-ghost text-xs" title="Delete" onClick={() => setPendingDelete(prd.id)}><Trash2 size={14} /></button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

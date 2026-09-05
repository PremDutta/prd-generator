import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import StatusBadge from "../components/StatusBadge.jsx";

const STATUSES = ["Draft", "In Review", "Approved"];

export default function Library() {
  const [prds, setPrds] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("updated");
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = () => {
    api.listPrds({ search, status: statusFilter }).then(setPrds);
  };

  useEffect(load, [search, statusFilter]);

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
      <h1 className="mb-6 text-2xl font-bold text-slate-900">📚 My PRDs</h1>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <input className="input" placeholder="🔍 Search by name or tag..." value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {sorted.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">
          No PRDs match. <Link to="/new" className="text-brand-600 hover:underline">Create one</Link>.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((prd) => (
            <div key={prd.id} className="card flex items-center justify-between p-4">
              <div>
                <div className="flex items-center gap-2">
                  <Link to={`/prds/${prd.id}`} className="font-semibold text-slate-900 hover:text-brand-600">{prd.name}</Link>
                  <StatusBadge status={prd.status} />
                </div>
                <p className="mt-0.5 text-xs text-slate-400">
                  Updated {new Date(prd.updatedAt || prd.createdAt).toLocaleString()}
                  {prd.tags?.length ? ` • ${prd.tags.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/prds/${prd.id}`} className="btn-secondary text-xs">Open</Link>
                <button className="btn-ghost text-xs" title="Duplicate" onClick={() => duplicate(prd.id)}>⧉</button>
                <a className="btn-ghost text-xs" title="Download" href={api.exportUrl(prd.id, "markdown")}>📥</a>
                {pendingDelete === prd.id ? (
                  <button className="btn text-xs bg-red-600 text-white hover:bg-red-700" onClick={() => remove(prd.id)}>
                    Confirm delete
                  </button>
                ) : (
                  <button className="btn-ghost text-xs" title="Delete" onClick={() => setPendingDelete(prd.id)}>🗑️</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

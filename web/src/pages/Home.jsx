import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { api } from "../api.js";
import Stat from "../components/Stat.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { StatSkeleton, PrdCardSkeleton } from "../components/Skeleton.jsx";

export default function Home() {
  const [prds, setPrds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listPrds().then(setPrds).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const weekCutoff = Date.now() - 7 * 86400 * 1000;
  const thisWeek = prds.filter((p) => new Date(p.createdAt).getTime() >= weekCutoff).length;
  const approved = prds.filter((p) => p.status === "Approved").length;

  return (
    <div>
      <section className="mb-14 text-center">
        <h1 className="text-5xl font-normal tracking-tight text-slate-900 sm:text-6xl">
          PRDs that read like a <span className="text-brand-600">Senior PM</span> wrote them
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg font-normal text-slate-500">
          Paste your rough notes. Get a structured, FAANG-quality PRD in minutes — with
          honest gaps flagged instead of invented numbers.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <Link to="/new" className="btn-primary gap-2 px-6 py-3 text-base"><Sparkles size={18} /> Create New PRD</Link>
          <Link to="/library" className="btn-secondary px-6 py-3 text-base">Browse Library</Link>
        </div>
      </section>

      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loading ? (
          <>
            <StatSkeleton />
            <StatSkeleton />
            <StatSkeleton />
          </>
        ) : (
          <>
            <Stat value={prds.length} label="Total PRDs" />
            <Stat value={thisWeek} label="Created this week" />
            <Stat value={approved} label="Approved" />
          </>
        )}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">Recent PRDs</h2>
          <Link to="/library" className="text-sm font-medium text-brand-600 hover:text-brand-700">
            View all &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <PrdCardSkeleton />
            <PrdCardSkeleton />
            <PrdCardSkeleton />
            <PrdCardSkeleton />
          </div>
        ) : prds.length === 0 ? (
          <div className="card p-10 text-center text-slate-500">
            No PRDs yet. <Link to="/new" className="text-brand-600 hover:underline">Create your first one</Link>.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {prds.slice(0, 6).map((prd) => (
              <Link key={prd.id} to={`/prds/${prd.id}`} className="card card-hover p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{prd.name}</span>
                  <StatusBadge status={prd.status} />
                </div>
                <p className="mt-1 text-xs text-slate-400">{new Date(prd.createdAt).toLocaleDateString()}</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

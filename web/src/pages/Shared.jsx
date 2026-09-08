import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Save, CircleCheckBig } from "lucide-react";
import { api } from "../api.js";
import MarkdownView from "../components/MarkdownView.jsx";
import { Skeleton, SectionCardSkeleton } from "../components/Skeleton.jsx";

export default function Shared() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [prd, setPrd] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getShared(shareId).then(setPrd).catch((e) => setError(e.message));
  }, [shareId]);

  const importPrd = async () => {
    const imported = await api.importShared(shareId);
    setSaved(true);
    setTimeout(() => navigate(`/prds/${imported.id}`), 800);
  };

  if (error) return <p className="text-red-600">{error}</p>;

  if (!prd) {
    return (
      <div className="mx-auto max-w-3xl animate-fade-in">
        <Skeleton className="mb-4 h-8 w-64" />
        <SectionCardSkeleton />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <div className="mb-4 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-700">
        This PRD was shared with you as a read-only link.
      </div>
      <h1 className="mb-4 text-2xl font-bold tracking-tight text-slate-900">{prd.name}</h1>
      <div className="card p-6">
        <MarkdownView content={prd.content} />
      </div>
      <button className="btn-primary mt-4 gap-2" onClick={importPrd} disabled={saved}>
        {saved ? <><CircleCheckBig size={16} /> Saved to your library</> : <><Save size={16} /> Save to My PRDs</>}
      </button>
    </div>
  );
}

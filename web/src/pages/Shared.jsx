import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../api.js";

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
  if (!prd) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 rounded-lg bg-brand-50 px-4 py-2 text-sm text-brand-700">
        This PRD was shared with you as a read-only link.
      </div>
      <h1 className="mb-4 text-2xl font-bold text-slate-900">{prd.name}</h1>
      <div className="card whitespace-pre-wrap p-6 text-sm text-slate-700">{prd.content}</div>
      <button className="btn-primary mt-4" onClick={importPrd} disabled={saved}>
        {saved ? "✅ Saved to your library" : "💾 Save to My PRDs"}
      </button>
    </div>
  );
}

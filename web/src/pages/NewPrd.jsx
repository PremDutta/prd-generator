import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { STATUSES } from "../constants.js";

export default function NewPrd() {
  const navigate = useNavigate();
  const [models, setModels] = useState({});
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Draft");
  const [tags, setTags] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [strictMode, setStrictMode] = useState(true);
  const [model, setModel] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConfig().then((cfg) => {
      setModels(cfg.models);
      setModel(Object.keys(cfg.models)[0]);
    });
  }, []);

  const generate = async () => {
    if (!name.trim() || !rawInput.trim()) {
      setError("Please fill in the PRD name and your notes.");
      return;
    }
    setError("");
    setGenerating(true);
    setSteps([]);

    try {
      await api.generatePrd(
        {
          name: name.trim(),
          rawInput: rawInput.trim(),
          status,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          strictMode,
          model,
        },
        (event) => {
          if (event.type === "progress") {
            setSteps((prev) => {
              const others = prev.filter((s) => s.sectionId !== event.sectionId);
              return [...others, event];
            });
          } else if (event.type === "complete") {
            navigate(`/prds/${event.prd.id}`);
          } else if (event.type === "error") {
            setError(event.message);
            setGenerating(false);
          }
        }
      );
    } catch (e) {
      setError(e.message);
      setGenerating(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 text-2xl font-bold text-slate-900">✨ Create New PRD</h1>
      <p className="mb-6 text-slate-500">Paste your rough notes below. The more context, the better the PRD.</p>

      <div className="card space-y-4 p-6">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">PRD Name</label>
          <input className="input" placeholder="e.g., Multi-Format Data Export" value={name} onChange={(e) => setName(e.target.value)} disabled={generating} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)} disabled={generating}>
              {STATUSES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Tags (comma separated)</label>
            <input className="input" placeholder="growth, mobile, Q1" value={tags} onChange={(e) => setTags(e.target.value)} disabled={generating} />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Your Notes / Requirements</label>
          <textarea
            className="input h-64 font-mono text-sm"
            placeholder={"Feature: Data export in multiple formats\n\nProblem:\n- Users can only export to CSV\n- Enterprise customers need Excel and PDF\n\nUsers:\n- Enterprise finance teams\n\nTimeline: Q1"}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            disabled={generating}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4 rounded-lg bg-slate-50 p-3">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={strictMode} onChange={(e) => setStrictMode(e.target.checked)} disabled={generating} />
            Strict mode (no invented numbers)
          </label>
          <select className="input w-auto" value={model} onChange={(e) => setModel(e.target.value)} disabled={generating}>
            {Object.entries(models).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {generating && (
          <div className="space-y-1.5 rounded-lg border border-slate-200 bg-white p-4">
            {steps.map((s) => (
              <div key={s.sectionId} className="flex items-center gap-2 text-sm">
                <span>{s.state === "done" ? "✅" : "⏳"}</span>
                <span className={s.state === "done" ? "text-slate-500" : "font-medium text-slate-900"}>{s.sectionName}</span>
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary w-full py-3" onClick={generate} disabled={generating}>
          {generating ? "Generating..." : "🚀 Generate PRD"}
        </button>
      </div>
    </div>
  );
}

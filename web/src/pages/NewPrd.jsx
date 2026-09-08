import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Rocket, Check } from "lucide-react";
import { api } from "../api.js";
import { STATUSES } from "../constants.js";

export default function NewPrd() {
  const navigate = useNavigate();
  const [models, setModels] = useState({});
  const [templates, setTemplates] = useState({});
  const [templateId, setTemplateId] = useState("faang");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Draft");
  const [tags, setTags] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [strictMode, setStrictMode] = useState(true);
  const [model, setModel] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [oneLiner, setOneLiner] = useState("");
  const [team, setTeam] = useState("");
  const [contributors, setContributors] = useState("");
  const [resources, setResources] = useState("");
  const [generating, setGenerating] = useState(false);
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConfig().then((cfg) => {
      setModels(cfg.models);
      setModel(cfg.defaultModel || Object.keys(cfg.models)[0] || "");
      setTemplates(cfg.templates);
    });
  }, []);

  const generate = async () => {
    if (!name.trim() || !rawInput.trim()) {
      setError("Please fill in the PRD name and your notes.");
      return;
    }
    if (!model) {
      setError("No AI provider is configured. Set GROQ_API_KEY or ANTHROPIC_API_KEY in server/.env.");
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
          templateId,
          meta: {
            oneLiner: oneLiner.trim(),
            team: team.trim(),
            contributors: contributors.trim(),
            resources: resources.trim(),
          },
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

  const templateList = Object.values(templates);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900">
        <Sparkles size={22} className="text-brand-600" /> Create New PRD
      </h1>
      <p className="mb-6 text-slate-500">Paste your rough notes below. The more context, the better the PRD.</p>

      <div className="card space-y-5 p-6">
        {templateList.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Template</label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {templateList.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  disabled={generating}
                  onClick={() => setTemplateId(t.id)}
                  className={`relative rounded-xl border p-3.5 text-left transition-all duration-150 ${
                    templateId === t.id
                      ? "border-brand-300 bg-brand-25 shadow-soft ring-1 ring-brand-500"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-xs"
                  }`}
                >
                  {templateId === t.id && (
                    <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-white">
                      <Check size={10} strokeWidth={3} />
                    </span>
                  )}
                  <p className="pr-5 text-sm font-semibold tracking-tight text-slate-900">{t.name}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{t.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

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
          <button type="button" className="text-xs font-medium text-brand-600 hover:text-brand-700" onClick={() => setShowDetails((v) => !v)}>
            {showDetails ? "− Hide" : "+ Add"} optional details (one-liner, team, contributors, resources)
          </button>
          {showDetails && (
            <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3">
              <input className="input" placeholder="One-line description" value={oneLiner} onChange={(e) => setOneLiner(e.target.value)} disabled={generating} />
              <div className="grid grid-cols-2 gap-3">
                <input className="input" placeholder="Team (e.g. Growth)" value={team} onChange={(e) => setTeam(e.target.value)} disabled={generating} />
                <input className="input" placeholder="Contributors (PM, Design, Eng)" value={contributors} onChange={(e) => setContributors(e.target.value)} disabled={generating} />
              </div>
              <input className="input" placeholder="Resources (e.g. Figma: <link>, Analytics: <link>)" value={resources} onChange={(e) => setResources(e.target.value)} disabled={generating} />
            </div>
          )}
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
            {Object.keys(models).length === 0 && <option value="">No provider configured</option>}
            {Object.entries(models).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {generating && (
          <div className="animate-fade-in rounded-xl border border-slate-200 bg-white p-4">
            {templateList.length > 0 && (
              <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500 ease-out"
                  style={{
                    width: `${Math.round(
                      (steps.filter((s) => s.state === "done").length /
                        (templates[templateId]?.sections.length || steps.length || 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            )}
            <div className="space-y-1.5">
              {steps.map((s) => (
                <div key={s.sectionId} className="flex items-center gap-2 text-sm">
                  <span className={s.state === "done" ? "text-emerald-500" : "animate-pulse text-brand-500"}>
                    {s.state === "done" ? <Check size={14} strokeWidth={3} /> : <span className="block h-2 w-2 rounded-full bg-current" />}
                  </span>
                  <span className={s.state === "done" ? "text-slate-400" : "font-medium text-slate-900"}>{s.sectionName}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button className="btn-primary w-full gap-2 py-3" onClick={generate} disabled={generating}>
          <Rocket size={16} /> {generating ? "Generating..." : "Generate PRD"}
        </button>
      </div>
    </div>
  );
}

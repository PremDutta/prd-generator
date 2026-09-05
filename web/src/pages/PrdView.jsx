import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api.js";
import { parseSections, buildContent } from "../prdContent.js";
import SectionCard from "../components/SectionCard.jsx";

const STATUSES = ["Draft", "In Review", "Approved"];

export default function PrdView() {
  const { id } = useParams();
  const [prd, setPrd] = useState(null);
  const [sections, setSections] = useState([]);
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.getConfig().then((cfg) => setSections(cfg.sections));
    api.getPrd(id).then(setPrd).catch((e) => setError(e.message));
  }, [id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!prd || sections.length === 0) return <p className="text-slate-500">Loading...</p>;

  const sectionsContent = parseSections(prd.content || "", sections);

  const saveSection = async (sectionId, newText) => {
    const updatedContent = buildContent(prd.name, { ...sectionsContent, [sectionId]: newText }, sections);
    const updated = await api.updatePrd(prd.id, { content: updatedContent });
    setPrd(updated);
  };

  const regenerateSection = async (sectionId, feedback) => {
    const section = sections.find((s) => s.id === sectionId);
    const result = await api.regenerateSection(prd.id, sectionId, {
      feedback,
      previousContent: sectionsContent[sectionId] || "",
    });
    setPrd(result.prd);
  };

  const changeStatus = async (status) => {
    const updated = await api.updatePrd(prd.id, { status });
    setPrd(updated);
  };

  const share = async () => {
    const { shareId } = await api.share(prd.id);
    setShareLink(`${window.location.origin}/shared/${shareId}`);
  };

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link to="/library" className="text-sm text-slate-500 hover:text-slate-700">&larr; All PRDs</Link>
          <h1 className="mt-1 text-2xl font-bold text-slate-900">{prd.name}</h1>
          <p className="text-xs text-slate-400">Created {new Date(prd.createdAt).toLocaleString()}</p>
        </div>
        <select className="input w-auto" value={prd.status} onChange={(e) => changeStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        <a className="btn-secondary" href={api.exportUrl(prd.id, "markdown")}>📄 Markdown</a>
        <a className="btn-secondary" href={api.exportUrl(prd.id, "html")}>🌐 HTML</a>
        <a className="btn-secondary" href={api.exportUrl(prd.id, "docx")}>📝 Word</a>
        <button className="btn-secondary" onClick={share}>🔗 Share</button>
      </div>

      {shareLink && (
        <div className="mb-6 rounded-lg border border-brand-200 bg-brand-50 p-3 text-sm">
          <code className="break-all">{shareLink}</code>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => (
          <SectionCard
            key={section.id}
            section={section}
            content={sectionsContent[section.id] || ""}
            onSave={(text) => saveSection(section.id, text)}
            onRegenerate={(feedback) => regenerateSection(section.id, feedback)}
          />
        ))}
      </div>
    </div>
  );
}

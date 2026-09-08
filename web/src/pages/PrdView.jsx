import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, TriangleAlert, FileText, Globe, FileType, Link2, SquarePen } from "lucide-react";
import { api } from "../api.js";
import { parseSections, buildContent } from "../prdContent.js";
import { findGaps } from "../gaps.js";
import SectionCard from "../components/SectionCard.jsx";
import { STATUSES } from "../constants.js";
import { PrdViewSkeleton } from "../components/Skeleton.jsx";
import { sectionIcon } from "../icons.js";

export default function PrdView() {
  const { id } = useParams();
  const [prd, setPrd] = useState(null);
  const [template, setTemplate] = useState(null);
  const [shareLink, setShareLink] = useState("");
  const [error, setError] = useState("");
  const [editingMeta, setEditingMeta] = useState(false);
  const [metaDraft, setMetaDraft] = useState({});
  const [activeId, setActiveId] = useState(null);

  useEffect(() => {
    setPrd(null);
    setTemplate(null);
    Promise.all([api.getPrd(id), api.getConfig()])
      .then(([prdData, cfg]) => {
        setPrd(prdData);
        setTemplate(cfg.templates[prdData.templateId] || Object.values(cfg.templates)[0]);
      })
      .catch((e) => setError(e.message));
  }, [id]);

  // Scroll-spy: the active section is the last one whose top has scrolled
  // past a fixed offset near the top of the viewport. Recomputed from actual
  // element positions on every scroll (rAF-throttled) rather than relying on
  // IntersectionObserver, whose entries only cover elements whose intersecting
  // state just changed — that leaves long sections' highlight stale while
  // scrolling through their middle.
  useEffect(() => {
    if (!template) return undefined;
    const ids = template.sections.map((s) => s.id);
    const OFFSET = 120;
    let ticking = false;

    const update = () => {
      ticking = false;
      let current = ids[0];
      for (const sid of ids) {
        const el = document.getElementById(`section-${sid}`);
        if (el && el.getBoundingClientRect().top - OFFSET <= 0) current = sid;
      }
      setActiveId(current);
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [template, prd?.id]);

  if (error) return <p className="text-red-600">{error}</p>;
  if (!prd || !template) return <PrdViewSkeleton />;

  const sections = template.sections;
  const sectionsContent = parseSections(prd.content || "", sections);
  const gaps = findGaps(sectionsContent, sections);

  const saveSection = async (sectionId, newText) => {
    const updatedContent = buildContent(prd.name, { ...sectionsContent, [sectionId]: newText }, sections);
    const updated = await api.updatePrd(prd.id, { content: updatedContent });
    setPrd(updated);
  };

  const previewRegenerate = async (sectionId, feedback) => {
    const result = await api.regenerateSection(prd.id, sectionId, {
      feedback,
      previousContent: sectionsContent[sectionId] || "",
    });
    return result.sectionContent;
  };

  const changeStatus = async (status) => {
    const updated = await api.updatePrd(prd.id, { status });
    setPrd(updated);
  };

  const share = async () => {
    const { shareId } = await api.share(prd.id);
    setShareLink(`${window.location.origin}/shared/${shareId}`);
  };

  const startEditMeta = () => {
    setMetaDraft(prd.meta || {});
    setEditingMeta(true);
  };

  const saveMeta = async () => {
    const updated = await api.updatePrd(prd.id, { meta: metaDraft });
    setPrd(updated);
    setEditingMeta(false);
  };

  const meta = prd.meta || {};
  const hasMeta = meta.oneLiner || meta.team || meta.contributors || meta.resources;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link to="/library" className="inline-flex items-center gap-1 text-sm text-slate-400 transition-colors hover:text-slate-600">
            <ArrowLeft size={14} /> All PRDs
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">{prd.name}</h1>
          <p className="text-xs text-slate-400">
            {template.name} • Created {new Date(prd.createdAt).toLocaleString()}
          </p>
        </div>
        <select className="input w-auto" value={prd.status} onChange={(e) => changeStatus(e.target.value)}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="card mb-8 p-4">
        {editingMeta ? (
          <div className="space-y-2">
            <input className="input" placeholder="One-line description" value={metaDraft.oneLiner || ""} onChange={(e) => setMetaDraft({ ...metaDraft, oneLiner: e.target.value })} />
            <div className="grid grid-cols-2 gap-2">
              <input className="input" placeholder="Team" value={metaDraft.team || ""} onChange={(e) => setMetaDraft({ ...metaDraft, team: e.target.value })} />
              <input className="input" placeholder="Contributors" value={metaDraft.contributors || ""} onChange={(e) => setMetaDraft({ ...metaDraft, contributors: e.target.value })} />
            </div>
            <input className="input" placeholder="Resources" value={metaDraft.resources || ""} onChange={(e) => setMetaDraft({ ...metaDraft, resources: e.target.value })} />
            <div className="flex gap-2">
              <button className="btn-primary text-xs" onClick={saveMeta}>Save</button>
              <button className="btn-secondary text-xs" onClick={() => setEditingMeta(false)}>Cancel</button>
            </div>
          </div>
        ) : hasMeta ? (
          <div className="flex items-start justify-between text-sm text-slate-600">
            <div className="space-y-0.5">
              {meta.oneLiner && <p className="font-medium text-slate-800">{meta.oneLiner}</p>}
              {meta.team && <p><span className="text-slate-400">Team:</span> {meta.team}</p>}
              {meta.contributors && <p><span className="text-slate-400">Contributors:</span> {meta.contributors}</p>}
              {meta.resources && <p><span className="text-slate-400">Resources:</span> {meta.resources}</p>}
            </div>
            <button className="btn-ghost gap-1.5 text-xs" onClick={startEditMeta}><SquarePen size={13} /> Edit</button>
          </div>
        ) : (
          <button className="text-xs font-medium text-brand-600 hover:text-brand-700" onClick={startEditMeta}>
            + Add team / contributors / resources
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          {sections.map((section) => (
            <SectionCard
              key={section.id}
              section={section}
              content={sectionsContent[section.id] || ""}
              history={(prd.history && prd.history[section.id]) || []}
              onSave={(text) => saveSection(section.id, text)}
              onRegeneratePreview={(feedback) => previewRegenerate(section.id, feedback)}
            />
          ))}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          {gaps.length > 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4 shadow-xs">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-100">
                  <TriangleAlert size={12} />
                </span>
                {gaps.length} gap{gaps.length > 1 ? "s" : ""} need{gaps.length === 1 ? "s" : ""} input
              </p>
              <ul className="mt-2.5 max-h-64 space-y-1.5 overflow-y-auto pl-7 text-xs text-amber-700">
                {gaps.map((g, i) => (
                  <li key={i}>
                    <a href={`#section-${g.sectionId}`} className="font-medium underline decoration-amber-300 underline-offset-2 hover:text-amber-900">{g.sectionName}</a>: {g.detail}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">On this page</p>
            <nav className="max-h-64 space-y-0.5 overflow-y-auto text-sm">
              {sections.map((section) => {
                const SectionIcon = sectionIcon(section.id);
                const isActive = section.id === activeId;
                return (
                  <a
                    key={section.id}
                    href={`#section-${section.id}`}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors ${
                      isActive ? "bg-brand-50 font-medium text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <SectionIcon size={13} className={`shrink-0 ${isActive ? "text-brand-500" : "text-slate-400"}`} />
                    <span className="truncate">{section.name}</span>
                  </a>
                );
              })}
            </nav>
          </div>

          <div className="card p-4">
            <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-slate-400">Export &amp; share</p>
            <div className="grid grid-cols-2 gap-2">
              <a className="btn-secondary justify-start gap-1.5 text-xs" href={api.exportUrl(prd.id, "markdown")}><FileText size={13} /> Markdown</a>
              <a className="btn-secondary justify-start gap-1.5 text-xs" href={api.exportUrl(prd.id, "html")}><Globe size={13} /> HTML</a>
              <a className="btn-secondary justify-start gap-1.5 text-xs" href={api.exportUrl(prd.id, "docx")}><FileType size={13} /> Word</a>
              <button className="btn-secondary justify-start gap-1.5 text-xs" onClick={share}><Link2 size={13} /> Share</button>
            </div>
            {shareLink && (
              <div className="mt-3 rounded-lg border border-brand-200 bg-brand-50 p-2.5 text-xs">
                <code className="break-all text-brand-700">{shareLink}</code>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

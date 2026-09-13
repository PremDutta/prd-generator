import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Save, CircleCheckBig, Eye, Copy, Check, LinkIcon, Sparkles } from "lucide-react";
import { api } from "../api.js";
import MarkdownView from "../components/MarkdownView.jsx";
import { stripDocTitle } from "../prdContent.js";
import { Skeleton, SectionCardSkeleton } from "../components/Skeleton.jsx";

export default function Shared() {
  const { shareId } = useParams();
  const navigate = useNavigate();
  const [prd, setPrd] = useState(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.getShared(shareId).then(setPrd).catch((e) => setError(e.message));
  }, [shareId]);

  const importPrd = async () => {
    const imported = await api.importShared(shareId);
    setSaved(true);
    setTimeout(() => navigate(`/prds/${imported.id}`), 800);
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(prd.content || "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="animate-fade-in py-24 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <LinkIcon size={24} />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">This link isn&rsquo;t available</h1>
        <p className="mx-auto mt-3 max-w-md text-slate-500">
          The PRD may have been deleted, or the share link was revoked.
        </p>
        <Link to="/" className="btn-secondary mt-8">Go to PRD Generator</Link>
      </div>
    );
  }

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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
          <Eye size={12} /> Shared with you &middot; read-only
        </span>
        <div className="flex items-center gap-2">
          <button className="btn-secondary gap-1.5 text-xs" onClick={copyMarkdown}>
            {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy markdown</>}
          </button>
          <button className="btn-primary gap-1.5 text-xs" onClick={importPrd} disabled={saved}>
            {saved ? <><CircleCheckBig size={14} /> Saved</> : <><Save size={14} /> Save a copy</>}
          </button>
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">{prd.name}</h1>
      <p className="mt-1.5 text-sm text-slate-400">Product Requirements Document</p>

      <div className="card mt-6 p-8">
        <MarkdownView content={stripDocTitle(prd.content)} />
      </div>

      <div className="mt-8 flex flex-col items-center gap-3 rounded-[10px] border border-dashed border-slate-200 px-6 py-8 text-center">
        <p className="text-sm text-slate-500">Want one of these for your own feature?</p>
        <Link to="/new" className="btn-primary gap-2">
          <Sparkles size={16} /> Create your own PRD
        </Link>
      </div>
    </div>
  );
}

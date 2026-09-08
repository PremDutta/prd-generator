import { useState } from "react";
import { History, SquarePen, RefreshCw, CircleCheckBig } from "lucide-react";
import MarkdownView from "./MarkdownView.jsx";
import { SkeletonText } from "./Skeleton.jsx";
import { sectionIcon } from "../icons.js";

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function SectionCard({ section, content, history, onSave, onRegeneratePreview }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [feedback, setFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [preview, setPreview] = useState(null); // { text } once a regenerate has been previewed
  const [error, setError] = useState("");

  const Icon = sectionIcon(section.id);

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const regenerate = async () => {
    if (!feedback.trim()) return;
    setRefining(true);
    setError("");
    try {
      const text = await onRegeneratePreview(feedback.trim());
      setPreview(text);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefining(false);
    }
  };

  const acceptPreview = () => {
    onSave(preview);
    setPreview(null);
    setFeedback("");
    setShowRefine(false);
  };

  const discardPreview = () => {
    setPreview(null);
  };

  const restore = (entry) => {
    onSave(entry.content);
    setShowHistory(false);
  };

  return (
    <div id={`section-${section.id}`} className="card animate-fade-in p-5 scroll-mt-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
            <Icon size={16} strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">{section.name}</h3>
            <p className="font-mono text-xs text-slate-400">{wordCount(content)} words</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {history?.length > 0 && (
            <div className="relative">
              <button className="btn-ghost gap-1.5 text-xs" onClick={() => setShowHistory((v) => !v)}>
                <History size={13} /> History ({history.length})
              </button>
              {showHistory && (
                <div className="absolute right-0 z-10 mt-1.5 w-64 animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-elevated">
                  {history
                    .slice()
                    .reverse()
                    .map((entry, i) => (
                      <button
                        key={i}
                        className="block w-full rounded-lg px-2.5 py-2 text-left text-xs text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                        onClick={() => restore(entry)}
                      >
                        Restore version from {new Date(entry.savedAt).toLocaleString()}
                      </button>
                    ))}
                </div>
              )}
            </div>
          )}
          {!editing && (
            <button
              className="btn-ghost gap-1.5 text-xs"
              onClick={() => {
                setDraft(content);
                setEditing(true);
              }}
            >
              <SquarePen size={13} /> Edit
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="space-y-2">
          <textarea
            className="input h-56 font-mono text-sm"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="flex gap-2">
            <button className="btn-primary text-xs" onClick={save}>Save</button>
            <button className="btn-secondary text-xs" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <MarkdownView content={content} />
      )}

      {refining && (
        <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          <SkeletonText lines={3} />
        </div>
      )}

      {preview !== null && (
        <div className="mt-4 animate-fade-in space-y-3 rounded-xl bg-brand-25 p-3 ring-1 ring-inset ring-brand-100">
          <p className="text-xs font-semibold text-brand-700">Proposed rewrite — accept to replace the current version (the old one is kept in History)</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Current</p>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-2.5 shadow-xs">
                <MarkdownView content={content} />
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-slate-500">Proposed</p>
              <div className="max-h-64 overflow-y-auto rounded-lg bg-white p-2.5 shadow-xs ring-1 ring-inset ring-brand-200">
                <MarkdownView content={preview} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary gap-1.5 text-xs" onClick={acceptPreview}><CircleCheckBig size={14} /> Accept</button>
            <button className="btn-secondary text-xs" onClick={discardPreview}>Discard</button>
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
        {showRefine ? (
          <div className="space-y-2">
            <input
              className="input text-sm"
              placeholder="What should change? e.g. make the timeline more aggressive"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              disabled={preview !== null}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-primary gap-1.5 text-xs" disabled={!feedback.trim() || refining || preview !== null} onClick={regenerate}>
                <RefreshCw size={13} className={refining ? "animate-spin" : ""} /> {refining ? "Refining..." : "Regenerate"}
              </button>
              <button className="btn-secondary text-xs" onClick={() => { setShowRefine(false); setPreview(null); }}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 transition-colors hover:text-brand-700" onClick={() => setShowRefine(true)}>
            <RefreshCw size={13} /> Refine with AI
          </button>
        )}
      </div>
    </div>
  );
}

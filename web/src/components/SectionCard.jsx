import { useState } from "react";

function wordCount(text) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export default function SectionCard({ section, content, onSave, onRegenerate }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(content);
  const [feedback, setFeedback] = useState("");
  const [refining, setRefining] = useState(false);
  const [showRefine, setShowRefine] = useState(false);
  const [error, setError] = useState("");

  const save = () => {
    onSave(draft);
    setEditing(false);
  };

  const regenerate = async () => {
    if (!feedback.trim()) return;
    setRefining(true);
    setError("");
    try {
      await onRegenerate(feedback.trim());
      setFeedback("");
      setShowRefine(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setRefining(false);
    }
  };

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
            <span>{section.icon}</span> {section.name}
          </h3>
          <p className="text-xs text-slate-400">{wordCount(content)} words</p>
        </div>
        {!editing && (
          <button
            className="btn-ghost text-xs"
            onClick={() => {
              setDraft(content);
              setEditing(true);
            }}
          >
            Edit
          </button>
        )}
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
        <div className="prose prose-sm max-w-none whitespace-pre-wrap text-slate-700">{content}</div>
      )}

      <div className="mt-4 border-t border-slate-100 pt-3">
        {showRefine ? (
          <div className="space-y-2">
            <input
              className="input text-sm"
              placeholder="What should change? e.g. make the timeline more aggressive"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button className="btn-primary text-xs" disabled={!feedback.trim() || refining} onClick={regenerate}>
                {refining ? "Refining..." : "Regenerate"}
              </button>
              <button className="btn-secondary text-xs" onClick={() => setShowRefine(false)}>Cancel</button>
            </div>
          </div>
        ) : (
          <button className="text-xs font-medium text-brand-600 hover:text-brand-700" onClick={() => setShowRefine(true)}>
            🔄 Refine with AI
          </button>
        )}
      </div>
    </div>
  );
}

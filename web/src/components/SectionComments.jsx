import { useState } from "react";
import { MessageSquare, Check, Trash2, CornerDownLeft } from "lucide-react";

function timeAgo(iso) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString();
}

// Shared by the owner's section cards and the public share view. `askAuthor` is
// on for reviewers arriving via a share link, who have no account to identify them.
export default function SectionComments({ comments = [], onAdd, onToggle, onDelete, askAuthor = false }) {
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState(() => localStorage.getItem("prd-reviewer-name") || "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const unresolved = comments.filter((c) => !c.resolved).length;

  const submit = async () => {
    if (!body.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      await onAdd({ body: body.trim(), author: author.trim() || "Anonymous" });
      if (askAuthor && author.trim()) localStorage.setItem("prd-reviewer-name", author.trim());
      setBody("");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <button
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageSquare size={13} />
        {comments.length === 0
          ? "Comment"
          : `${comments.length} comment${comments.length > 1 ? "s" : ""}`}
        {unresolved > 0 && (
          <span className="rounded-full bg-amber-100 px-1.5 text-[11px] font-semibold text-amber-700">{unresolved} open</span>
        )}
      </button>

      {open && (
        <div className="mt-3 animate-fade-in space-y-2.5">
          {comments.map((c) => (
            <div
              key={c.id}
              className={`rounded-lg border p-2.5 text-sm ${
                c.resolved ? "border-slate-200 bg-slate-50 opacity-60" : "border-slate-200 bg-surface"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">
                    <span className="font-medium text-slate-600">{c.author}</span> &middot; {timeAgo(c.createdAt)}
                    {c.resolved && " · resolved"}
                  </p>
                  <p className={`mt-0.5 text-slate-700 ${c.resolved ? "line-through" : ""}`}>{c.body}</p>
                </div>
                {(onToggle || onDelete) && (
                  <div className="flex shrink-0 gap-1">
                    {onToggle && (
                      <button
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-emerald-600"
                        title={c.resolved ? "Reopen" : "Resolve"}
                        onClick={() => onToggle(c.id, !c.resolved)}
                      >
                        <Check size={13} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="rounded p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-red-600"
                        title="Delete"
                        onClick={() => onDelete(c.id)}
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {askAuthor && (
            <input
              className="input text-sm"
              placeholder="Your name"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          )}
          <textarea
            className="input h-16 text-sm"
            placeholder="Leave a comment on this section..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
            }}
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button className="btn-primary gap-1.5 text-xs" disabled={!body.trim() || busy} onClick={submit}>
            <CornerDownLeft size={13} /> {busy ? "Posting..." : "Comment"}
          </button>
        </div>
      )}
    </div>
  );
}

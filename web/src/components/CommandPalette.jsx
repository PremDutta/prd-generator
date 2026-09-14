import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, FileText, Plus, House, BookOpen, CornerDownLeft } from "lucide-react";
import { api } from "../api.js";

const NAV_ACTIONS = [
  { id: "nav-new", label: "Create new PRD", hint: "Page", icon: Plus, to: "/new" },
  { id: "nav-library", label: "Browse library", hint: "Page", icon: BookOpen, to: "/library" },
  { id: "nav-home", label: "Go home", hint: "Page", icon: House, to: "/" },
];

export default function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [prds, setPrds] = useState([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    // Also opened by the navbar's search affordance, so the shortcut is
    // discoverable rather than hidden knowledge.
    const onRequest = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-palette", onRequest);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-palette", onRequest);
    };
  }, []);

  // Loaded fresh each time it opens so a just-created PRD is immediately findable.
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
      return;
    }
    api.listPrds().then(setPrds).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    const prdItems = prds
      .filter((p) => !q || p.name.toLowerCase().includes(q) || (p.tags || []).some((t) => t.toLowerCase().includes(q)))
      .slice(0, 6)
      .map((p) => ({ id: p.id, label: p.name, hint: p.status, icon: FileText, to: `/prds/${p.id}` }));
    const navItems = NAV_ACTIONS.filter((a) => !q || a.label.toLowerCase().includes(q));
    return [...prdItems, ...navItems];
  }, [prds, query]);

  useEffect(() => {
    setActive((a) => Math.min(a, Math.max(items.length - 1, 0)));
  }, [items.length]);

  if (!open) return null;

  const run = (item) => {
    setOpen(false);
    navigate(item.to);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % Math.max(items.length, 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a - 1 + items.length) % Math.max(items.length, 1));
    } else if (e.key === "Enter" && items[active]) {
      e.preventDefault();
      run(items[active]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/25 px-4 pt-[12vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg animate-fade-in overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2.5 border-b border-slate-100 px-4">
          <Search size={16} className="shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            className="w-full bg-transparent py-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
            placeholder="Search PRDs or jump to a page..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <kbd className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 font-mono text-[10px] text-slate-400">esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-1.5">
          {items.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-slate-400">No matches</p>
          ) : (
            items.map((item, i) => (
              <button
                key={item.id}
                className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                  i === active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-50"
                }`}
                onMouseEnter={() => setActive(i)}
                onClick={() => run(item)}
              >
                <item.icon size={15} className={i === active ? "text-brand-500" : "text-slate-400"} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.hint && <span className="text-xs text-slate-400">{item.hint}</span>}
                {i === active && <CornerDownLeft size={13} className="text-brand-400" />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

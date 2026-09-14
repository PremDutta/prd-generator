import { Link, NavLink } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import ThemeToggle from "./ThemeToggle.jsx";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
    isActive ? "text-brand-700 bg-brand-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-surface/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-soft">
            P
          </span>
          PRD Generator
        </Link>
        <nav className="flex items-center gap-1">
          <button
            className="mr-1 hidden items-center gap-2 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-400 transition-colors hover:border-slate-300 hover:text-slate-600 sm:flex"
            onClick={() => window.dispatchEvent(new CustomEvent("open-command-palette"))}
          >
            <Search size={13} />
            Search
            <kbd className="rounded border border-slate-200 px-1 font-mono text-[10px]">⌘K</kbd>
          </button>
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/library" className={linkClass}>Library</NavLink>
          <ThemeToggle />
          <Link to="/new" className="btn-primary ml-2 gap-1.5">
            <Plus size={16} />
            <span className="hidden sm:inline">New PRD</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}

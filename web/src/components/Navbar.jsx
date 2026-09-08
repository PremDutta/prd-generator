import { Link, NavLink } from "react-router-dom";

const linkClass = ({ isActive }) =>
  `px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 ${
    isActive ? "text-brand-700 bg-brand-50" : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
  }`;

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <Link to="/" className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight text-slate-900">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white shadow-soft">
            P
          </span>
          PRD Generator
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink to="/" end className={linkClass}>Home</NavLink>
          <NavLink to="/library" className={linkClass}>Library</NavLink>
          <Link to="/new" className="btn-primary ml-2">
            + New PRD
          </Link>
        </nav>
      </div>
    </header>
  );
}

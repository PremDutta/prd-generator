import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/70 bg-surface/50">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-slate-400 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-gradient-to-br from-brand-500 to-brand-700 text-[10px] font-bold text-white">
            P
          </span>
          <span>PRD Generator</span>
        </div>
        <div className="flex items-center gap-5">
          <Link to="/new" className="transition-colors hover:text-slate-600">New PRD</Link>
          <Link to="/library" className="transition-colors hover:text-slate-600">Library</Link>
          <a
            href="https://github.com/PremDutta/prd-generator"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-slate-600"
          >
            GitHub
          </a>
        </div>
        <span>Built by Prem Dutta</span>
      </div>
    </footer>
  );
}

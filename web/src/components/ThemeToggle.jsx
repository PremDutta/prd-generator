import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

const STORAGE_KEY = "prd-theme";

export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const dark = saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
  return dark;
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
  }, [dark]);

  return (
    <button
      className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-900"
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
      onClick={() => setDark((v) => !v)}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}

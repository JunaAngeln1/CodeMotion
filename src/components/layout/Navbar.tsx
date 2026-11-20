import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useProgressStore } from "@/store/progressStore";

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const progress = useProgressStore((state) => state.progress);
  const links = [
    { label: "Inicio", path: "/", end: true },
    { label: "Niveles", path: "/niveles" },
    { label: "Laboratorio", path: `/laboratorio/${Math.min(5, progress.currentLevel)}` },
    { label: "Reconocimientos", path: "/reconocimientos" },
  ];
  const navigation = (mobile = false) => links.map((link) => (
    <NavLink
      key={link.label}
      to={link.path}
      end={link.end}
      onClick={() => setMenuOpen(false)}
      className={({ isActive }) => `flex min-h-11 items-center rounded-xl px-3 text-sm font-medium transition-colors ${
        mobile ? "w-full" : ""
      } ${isActive ? "bg-electric-500/10 text-electric-400" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
    >
      {link.label}
    </NavLink>
  ));

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-slate-700 bg-slate-900/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" onClick={() => setMenuOpen(false)} className="flex min-h-11 shrink-0 items-center gap-2" aria-label="CodeMotion, inicio">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-electric-400 to-purple-500 text-[10px] font-bold text-slate-900">CM</span>
          <span className="text-lg font-bold tracking-tight text-white sm:text-xl">Code<span className="text-electric-400">Motion</span></span>
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-1 lg:flex">{navigation()}</nav>
        <div className="flex items-center gap-3">
          <span className="whitespace-nowrap text-xs text-slate-400"><strong className="text-sm text-electric-400">{progress.points}</strong> pts</span>
          <span className="hidden rounded-lg bg-purple-500/10 px-3 py-2 text-xs text-purple-400 sm:inline">{progress.badges.length} insignias</span>
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-700 text-slate-200 lg:hidden"
            aria-label={menuOpen ? "Cerrar navegación" : "Abrir navegación"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {menuOpen && <nav id="mobile-navigation" aria-label="Navegación móvil" className="space-y-1 border-t border-slate-700 p-3 shadow-soft lg:hidden">{navigation(true)}</nav>}
    </header>
  );
};

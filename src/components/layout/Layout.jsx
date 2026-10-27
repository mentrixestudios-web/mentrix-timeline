import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Play, 
  Layers, 
  Calendar, 
  Trophy, 
  User, 
  Flame, 
  Coins 
} from "lucide-react";
import { getCoins, getStreak } from "@/utils/gameStorage";

export default function Layout({ children }) {
  const location = useLocation();
  const pathname = location.pathname;

  const coins = getCoins();
  const streak = getStreak();

  const navItems = [
    { label: "Jugar", path: "/", icon: Play },
    { label: "Categorías", path: "/categorias", icon: Layers },
    { label: "Desafío", path: "/desafio", icon: Calendar },
    { label: "Récords", path: "/estadisticas", icon: Trophy },
    { label: "Perfil", path: "/perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col md:flex-row">
      {/* =========================================
          DESKTOP SIDEBAR (Visible en >= 768px)
         ========================================= */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-slate-950/80 p-5 shrink-0 sticky top-0 h-screen">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-xl shadow-lg shadow-blue-500/30">
            ⏳
          </div>
          <div>
            <h1 className="font-black text-base tracking-wide text-white">LÍNEA DE TIEMPO</h1>
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Mentrix Studios</p>
          </div>
        </div>

        {/* Currency & Streak Stats */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/50 uppercase font-semibold">Monedas</p>
              <p className="font-extrabold text-sm text-white">{coins}</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-400 shrink-0" />
            <div>
              <p className="text-[10px] text-white/50 uppercase font-semibold">Racha</p>
              <p className="font-extrabold text-sm text-white">{streak} d</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info */}
        <div className="pt-4 border-t border-white/10 text-center">
          <p className="text-white/30 text-xs">Mentrix: Línea de Tiempo v1.0</p>
        </div>
      </aside>

      {/* =========================================
          MAIN CONTENT AREA
         ========================================= */}
      <main className="flex-1 min-h-screen flex flex-col pb-20 md:pb-6 overflow-x-hidden">
        {/* Mobile Header Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-white/10 bg-slate-950/80 sticky top-0 z-30 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="text-lg">⏳</span>
            <span className="font-black text-sm tracking-wide text-white">LÍNEA DE TIEMPO</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs font-bold text-amber-300">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{coins}</span>
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 px-2 py-1 rounded-lg text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" />
                <span>{streak}</span>
              </div>
            )}
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-4 py-4 md:py-8">
          {children}
        </div>
      </main>

      {/* =========================================
          MOBILE BOTTOM NAVIGATION (Visible en < 768px)
         ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-white/10 backdrop-blur-lg px-2 py-2 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                isActive
                  ? "text-blue-400"
                  : "text-white/40 hover:text-white/80"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

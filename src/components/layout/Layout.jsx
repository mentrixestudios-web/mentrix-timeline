import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Play, 
  Layers, 
  Calendar, 
  Trophy, 
  User, 
  Flame, 
  Coins, 
  Hourglass, 
  Clock, 
  ShoppingBag,
  Sparkles
} from "lucide-react";
import TopBar from "@/components/common/TopBar";
import { getCoins, getStreak } from "@/utils/gameStorage";

export default function Layout({ children }) {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const [coins, setCoins] = useState(getCoins());
  const [streak, setStreak] = useState(getStreak());

  useEffect(() => {
    const handleUpdate = () => {
      setCoins(getCoins());
      setStreak(getStreak());
    };
    window.addEventListener("mt_storage_updated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("mt_storage_updated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isGamePage = pathname === "/juego";
  const isShopPage = pathname === "/tienda" || pathname === "/tiendamonedas";
  const showNav = !isGamePage && !isShopPage;

  const navItems = [
    { label: "Jugar", path: "/", icon: Play },
    { label: "Categorías", path: "/categorias", icon: Layers },
    { label: "Desafío", path: "/desafio", icon: Calendar },
    { label: "Récords", path: "/estadisticas", icon: Trophy },
    { label: "Perfil", path: "/perfil", icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col md:flex-row selection:bg-amber-500/30">
      {/* =========================================
          DESKTOP SIDEBAR (Visible en >= 768px)
         ========================================= */}
      {showNav && (
        <aside className="hidden md:flex flex-col w-64 border-r border-amber-500/20 bg-gradient-to-b from-[#0b1328] via-[#090d1c] to-[#0a0e1a] p-5 shrink-0 sticky top-0 h-screen z-30 shadow-2xl select-none">
          {/* Brand con estética de viajero del tiempo */}
          <Link to="/" className="flex items-center gap-3.5 mb-6 group">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[14px] flex items-center justify-center">
                <Hourglass className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider text-amber-100 flex items-center gap-1">
                <span>LÍNEA DE TIEMPO</span>
              </h1>
              <p className="text-[10px] text-amber-400/80 font-bold uppercase tracking-widest flex items-center gap-1">
                <span>Mentrix Studios</span>
              </p>
            </div>
          </Link>

          {/* Currency & Streak Stats */}
          <div className="grid grid-cols-2 gap-2.5 mb-4">
            <Link
              to="/tienda"
              className="bg-[#0e172e] border border-amber-500/30 hover:border-amber-400/60 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm transition-all group"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] text-amber-200/60 uppercase font-bold tracking-wider">Tienda</p>
                <p className="font-black text-xs text-amber-300 truncate">{coins.toLocaleString()}</p>
              </div>
            </Link>

            <div className="bg-[#0e172e] border border-orange-500/30 rounded-2xl p-2.5 flex items-center gap-2.5 shadow-sm">
              <div className="w-7 h-7 rounded-xl bg-orange-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-[9px] text-orange-200/60 uppercase font-bold tracking-wider">Racha</p>
                <p className="font-black text-xs text-orange-300">{streak} d</p>
              </div>
            </div>
          </div>

          {/* Botón directo a Tienda en Barra Lateral */}
          <Link
            to="/tienda"
            className="flex items-center justify-center gap-2 mb-6 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-400/40 hover:border-amber-400 text-amber-200 text-xs font-black shadow-sm transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
            <span>Tienda de Monedas</span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white border border-amber-400/40 shadow-lg shadow-blue-600/30"
                      : "text-white/60 hover:text-amber-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-300" : "text-white/40"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer info */}
          <div className="pt-4 border-t border-amber-500/15 text-center">
            <p className="text-white/30 text-[11px] font-medium flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-amber-400/50" />
              <span>Mentrix: Línea de Tiempo v1.0</span>
            </p>
          </div>
        </aside>
      )}

      {/* =========================================
          MAIN CONTENT AREA
         ========================================= */}
      <main className={`flex-1 min-h-screen flex flex-col ${showNav ? "pb-20 md:pb-8" : "pb-4"} overflow-x-hidden relative`}>
        {/* Glow de fondo cósmico / dorado */}
        <div className="fixed top-0 right-0 w-80 md:w-96 h-80 md:h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none overflow-hidden" />
        <div className="fixed bottom-0 left-0 md:left-64 w-64 md:w-80 h-64 md:h-80 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none overflow-hidden" />

        {/* Dynamic page content */}
        <div className="flex-1 w-full max-w-4xl mx-auto px-2.5 sm:px-6 py-2.5 sm:py-6 relative z-10">
          {/* Barra Superior idéntica de Mentrix en todas las pantallas principales */}
          {showNav && <TopBar />}
          {children}
        </div>
      </main>

      {/* =========================================
          MOBILE BOTTOM NAVIGATION (Visible en < 768px cuando showNav es true)
         ========================================= */}
      {showNav && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-amber-500/20 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? "text-amber-400 font-extrabold scale-105"
                    : "text-white/40 hover:text-amber-200"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}

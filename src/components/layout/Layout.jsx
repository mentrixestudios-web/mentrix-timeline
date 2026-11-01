import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Trophy, 
  User, 
  Shield, 
  Hourglass, 
  Calendar, 
  Swords, 
  BookOpen, 
  Download,
  Sparkles
} from "lucide-react";
import TopBar from "@/components/common/TopBar";
import { getCoins, getStreak } from "@/utils/gameStorage";
import { 
  usePwaInstall, 
  PwaFloatingBanner, 
  PwaInstallModal 
} from "@/components/pwa/InstallPwaBanner";

export default function Layout({ children }) {
  const location = useLocation();
  const pathname = location.pathname.toLowerCase();

  const [coins, setCoins] = useState(getCoins());
  const [streak, setStreak] = useState(getStreak());

  const { 
    isStandalone, 
    isIos, 
    showInstructionsModal, 
    setShowInstructionsModal, 
    triggerInstall 
  } = usePwaInstall();

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
  const showNav = !isGamePage;

  // Navegación principal (idéntica a Estudio Bíblico)
  const mainNavItems = [
    { path: "/", label: "Inicio / Jugar", mobileLabel: "Jugar", icon: Home },
    { path: "/estadisticas", label: "Logros y Récords", mobileLabel: "Logros", icon: Trophy },
    { path: "/estadisticas", label: "Galería y Cartas", mobileLabel: "Museo", icon: Shield },
    { path: "/perfil", label: "Mi Perfil", mobileLabel: "Perfil", icon: User },
  ];

  // Módulos de juego (accesos directos en barra lateral de escritorio)
  const quickModules = [
    { path: "/config-ronda?modo=clasico", label: "Línea de Tiempo", emoji: "⏳", accent: "text-purple-300" },
    { path: "/duelo-amigos", label: "Duelo Histórico", emoji: "⚔️", accent: "text-blue-300" },
    { path: "/desafio", label: "Desafío Diario", emoji: "📅", accent: "text-emerald-300" },
    { path: "/estadisticas", label: "Museo del Tiempo", emoji: "🏛️", accent: "text-amber-300" },
  ];

  return (
    <div className="min-h-screen bg-[#070b16] text-white flex flex-col lg:flex-row selection:bg-amber-500/30">
      
      {/* =======================================================
          BARRA LATERAL DE ESCRITORIO (Visible solo en >= 1024px)
          Estilo y estructura idéntica a Mentrix Estudio Bíblico
         ======================================================= */}
      {showNav && (
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 bg-[#080d1e]/95 backdrop-blur-xl border-r border-amber-500/15 z-50 px-4 py-6 select-none shadow-2xl">
          
          {/* Logo y Encabezado */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0e1b3d] to-indigo-950/60 border border-blue-400/20 mb-6 hover:border-amber-400/40 transition-all group"
          >
            <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform shrink-0">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center overflow-hidden">
                <img 
                  src="./icons/icon-192.png" 
                  alt="Mentrix" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white truncate flex items-center gap-1.5">
                <span>Mentrix Cronos</span>
              </div>
              <div className="text-[11px] text-amber-300/80 font-medium truncate">
                Línea de Tiempo Histórica
              </div>
            </div>
          </Link>

          {/* Navegación Principal */}
          <div className="mb-6">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navegación Principal
            </div>
            <nav className="space-y-1.5">
              {mainNavItems.map((item, idx) => {
                const Icon = item.icon;
                const active = location.pathname === item.path && (idx === 0 ? location.pathname === "/" : true);
                return (
                  <Link
                    key={item.label + idx}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      active
                        ? "bg-blue-600/25 text-blue-300 border border-blue-400/35 shadow-lg shadow-blue-950/50"
                        : "text-slate-300/75 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-blue-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Accesos Directos a Módulos de Juego */}
          <div className="mb-auto">
            <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Módulos de Juego
            </div>
            <div className="space-y-1.5">
              {quickModules.map((mod) => {
                const active = location.pathname + location.search === mod.path;
                return (
                  <Link
                    key={mod.label}
                    to={mod.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? "bg-purple-600/25 text-white border border-purple-400/35 shadow-md shadow-purple-950/50"
                        : "text-slate-300/80 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span className="text-base leading-none">{mod.emoji}</span>
                    <span className="truncate">{mod.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Botón Instalar Aplicación PWA en Computador (Idéntico a Estudio Bíblico) */}
          {!isStandalone && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={triggerInstall}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600/90 to-indigo-600/90 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-blue-950/50 border border-blue-300/25 transition-all cursor-pointer group"
              >
                <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                <span>Instalar Aplicación</span>
              </button>
              <p className="text-[10px] text-center text-slate-400 mt-1.5 mb-0">
                Ábrela directo desde tu escritorio o celular
              </p>
            </div>
          )}
        </aside>
      )}

      {/* =======================================================
          ÁREA PRINCIPAL DE CONTENIDO
         ======================================================= */}
      <main className={`flex-1 min-h-screen flex flex-col ${showNav ? "pb-24 lg:pb-8 lg:pl-72" : "pb-4"} overflow-x-hidden relative`}>
        {/* Glows de fondo cósmico / dorado */}
        <div className="fixed top-0 right-0 w-80 md:w-96 h-80 md:h-96 bg-blue-600/10 rounded-full blur-[130px] pointer-events-none overflow-hidden" />
        <div className="fixed bottom-0 left-0 lg:left-72 w-72 md:w-80 h-72 md:h-80 bg-amber-500/5 rounded-full blur-[110px] pointer-events-none overflow-hidden" />

        <div className="flex-1 w-full max-w-md lg:!max-w-5xl mx-auto px-3 sm:px-6 py-3 sm:py-6 relative z-10">
          {showNav && <TopBar />}
          {children}
        </div>
      </main>

      {/* =======================================================
          BARRA INFERIOR MÓVIL (Visible en celulares < 1024px)
         ======================================================= */}
      {showNav && (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090e1f]/95 border-t border-amber-500/20 backdrop-blur-xl px-2 py-1.5 flex items-center justify-around shadow-2xl">
          {mainNavItems.map((item, idx) => {
            const Icon = item.icon;
            const active = location.pathname === item.path && (idx === 0 ? location.pathname === "/" : true);
            return (
              <Link
                key={item.mobileLabel + idx}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-2xl transition-all ${
                  active
                    ? "text-amber-400 font-extrabold scale-105"
                    : "text-white/40 hover:text-amber-200"
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? "text-amber-400" : "text-white/40"}`} />
                <span className="text-[10px]">{item.mobileLabel}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Botón flotante PWA estilo ARANPRO (Aparece en móviles y pantallas) */}
      <PwaFloatingBanner />

      {/* Modal tutorial de instalación para iOS y navegadores */}
      <PwaInstallModal
        open={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        isIos={isIos}
      />
    </div>
  );
}

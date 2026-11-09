import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  Trophy, 
  User, 
  Shield, 
  Download
} from "lucide-react";
import TopBar from "@/components/common/TopBar";
import AppErrorBoundary from "@/components/common/AppErrorBoundary";
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

  const isGamePage = pathname === "/juego" || pathname === "/juego-online";
  const showNav = !isGamePage;

  // Navegación principal (idéntica a Estudio Bíblico, con vistas separadas para Logros y Museo)
  const mainNavItems = [
    { path: "/", label: "Inicio / Jugar", mobileLabel: "Jugar", icon: Home },
    { path: "/logros", label: "Logros y Récords", mobileLabel: "Logros", icon: Trophy },
    { path: "/estadisticas", label: "Museo y Cartas", mobileLabel: "Museo", icon: Shield },
    { path: "/perfil", label: "Mi Perfil", mobileLabel: "Perfil", icon: User },
  ];

  const isNavItemActive = (item) => {
    const search = location.search.toLowerCase();
    if (item.path === "/") {
      return pathname === "/" || pathname === "";
    }
    if (item.path === "/logros") {
      return (
        pathname === "/logros" ||
        (pathname === "/estadisticas" && (search.includes("tab=logros") || search.includes("tab=records")))
      );
    }
    if (item.path === "/estadisticas") {
      return (
        pathname === "/museo" ||
        (pathname === "/estadisticas" && !search.includes("tab=logros") && !search.includes("tab=records"))
      );
    }
    return pathname === item.path.toLowerCase();
  };

  // Módulos de juego (accesos directos en barra lateral de escritorio)
  const quickModules = [
    { path: "/config-ronda?modo=clasico", label: "Línea de Tiempo", emoji: "⏳" },
    { path: "/duelo-amigos", label: "Duelo Histórico", emoji: "⚔️" },
    { path: "/desafio", label: "Desafío Diario", emoji: "📅" },
    { path: "/estadisticas", label: "Museo del Tiempo", emoji: "🏛️" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col lg:flex-row selection:bg-blue-500/30">
      
      {/* =======================================================
          BARRA LATERAL DE ESCRITORIO (Visible solo en >= 1024px)
          Exacto mismo fondo slate-950/95 y bordes de Estudio Bíblico
         ======================================================= */}
      {showNav && (
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:left-0 bg-slate-950/95 border-r border-white/10 z-50 px-4 py-6 select-none shadow-2xl">
          
          {/* Logo y Encabezado */}
          <Link
            to="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-2xl bg-gradient-to-r from-[#1a1405]/80 to-blue-950/70 border border-amber-500/40 mb-6 hover:border-amber-400/70 shadow-[0_0_18px_rgba(245,158,11,0.08)] transition-all group"
          >
            <img
              src="./icons/icon-192.png"
              alt="Mentrix"
              className="w-11 h-11 rounded-xl border border-white/15 shadow-md object-cover shrink-0"
            />
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white truncate">Mentrix Cronos</div>
              <div className="text-[11px] text-amber-300/80 font-medium truncate">Línea de Tiempo Histórica</div>
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
                const active = isNavItemActive(item);
                return (
                  <Link
                    key={item.label + idx}
                    to={item.path}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                      active
                        ? "bg-amber-500/15 text-amber-200 border border-amber-400/45 shadow-lg shadow-amber-900/20"
                        : "text-slate-300/75 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "text-amber-400" : "text-slate-400"}`} />
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
                        ? "bg-amber-500/10 text-white border border-amber-400/35 shadow-md shadow-amber-950/30"
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
      <main className={`flex-1 min-h-screen flex flex-col ${showNav ? "pb-28 lg:pb-8 lg:pl-72" : "pb-4"} overflow-x-hidden relative bg-gradient-to-br from-[#070b16] via-[#091124] to-[#050812]`}>
        <div className="flex-1 w-full max-w-md lg:!max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-6 relative z-10">
          {showNav && <TopBar />}
          <AppErrorBoundary resetKey={location.pathname + location.search}>
            {children}
          </AppErrorBoundary>
        </div>
      </main>

      {/* =======================================================
          BARRA INFERIOR MÓVIL (Visible en celulares < 1024px)
          Superficie sólida de alto contraste y margen ergonómico
          para barra de 3 botones de Android y navegación por gestos
         ======================================================= */}
      {showNav && (
        <nav
          className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-[#0b1328] via-[#101c3a] to-[#16264c] border-t-2 border-amber-400/50 px-2.5 pt-2 flex items-center justify-around gap-1.5 shadow-[0_-10px_30px_rgba(0,0,0,0.92)] select-none"
          style={{ paddingBottom: "max(0.6rem, env(safe-area-inset-bottom))" }}
        >
          {mainNavItems.map((item, idx) => {
            const Icon = item.icon;
            const active = isNavItemActive(item);
            return (
              <Link
                key={item.mobileLabel + idx}
                to={item.path}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 min-h-[50px] py-1.5 px-2 rounded-2xl transition-all active:scale-95 ${
                  active
                    ? "bg-gradient-to-b from-amber-500/25 to-amber-600/15 border border-amber-400/65 text-amber-300 font-extrabold shadow-md shadow-amber-950/50"
                    : "bg-white/[0.04] border border-white/10 text-slate-200/80 hover:text-white hover:bg-white/10 font-semibold"
                }`}
              >
                {active && (
                  <span className="absolute top-0 left-4 right-4 h-0.5 rounded-full bg-amber-300" />
                )}
                <Icon className={`w-5 h-5 ${active ? "text-amber-300 fill-amber-400/25" : "text-slate-300/85"}`} />
                <span className="text-[11px] leading-none tracking-tight">{item.mobileLabel}</span>
              </Link>
            );
          })}
        </nav>
      )}

      {/* Botón flotante PWA estilo ARANPRO (Sólo en Home para no obstaculizar botones en pantallas secundarias) */}
      {(pathname === "/" || pathname === "") && <PwaFloatingBanner />}

      {/* Modal tutorial de instalación para iOS y navegadores */}
      <PwaInstallModal
        open={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        isIos={isIos}
      />
    </div>
  );
}

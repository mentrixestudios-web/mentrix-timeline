import React, { useEffect, useState } from "react";
import { Download, Share, X, CheckCircle2 } from "lucide-react";
import { playSfx } from "@/utils/soundSystem";
import { usePwaInstall } from "@/hooks/usePwaInstall";

export { usePwaInstall };

/**
 * Banner flotante de instalación PWA estilo "Pill" (idéntico a la imagen compartida)
 */
export function PwaFloatingBanner() {
  const { isStandalone, triggerInstall } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone) {
      setDismissed(true);
      return;
    }

    const lastDismissed = localStorage.getItem("mt_pwa_banner_dismissed");
    if (lastDismissed) {
      const diffDays = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 3) {
        setDismissed(true);
        return;
      }
    }

    const timer = setTimeout(() => {
      setDismissed(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [isStandalone]);

  const handleDismiss = (e) => {
    e.stopPropagation();
    playSfx("tap");
    setDismissed(true);
    localStorage.setItem("mt_pwa_banner_dismissed", Date.now().toString());
  };

  if (dismissed || isStandalone) return null;

  return (
    <div className="fixed bottom-20 lg:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300 select-none">
      <div 
        onClick={triggerInstall}
        className="w-full bg-[#08151f]/95 hover:bg-[#0c1e2d]/95 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_12px_36px_rgba(0,0,0,0.7)] backdrop-blur-xl rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 cursor-pointer transition-all group"
      >
        {/* Isotipo Menti en círculo */}
        <div className="relative w-10 h-10 shrink-0 rounded-full bg-slate-950 border border-emerald-500/40 p-1 flex items-center justify-center shadow-md shadow-emerald-950/60">
          <img 
            src="./mentrix-mascot-transparent.png" 
            alt="Menti" 
            className="w-full h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform" 
          />
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>

        {/* Textos informativos */}
        <div className="flex-1 min-w-0 pr-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Instalar App Mentrix (PWA)
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 leading-none">
              Rápido
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-slate-300/85 leading-snug line-clamp-2 mt-0.5 mb-0">
            Accede a tus partidas y duelos directo desde tu pantalla de inicio sin descargas pesadas.
          </p>
        </div>

        {/* Botón Acción + Botón Cerrar */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={triggerInstall}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-950/80 border border-emerald-300/30 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Instalar</span>
          </button>
          
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Descartar"
            aria-label="Cerrar banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Modal Tutorial de Instalación PWA (Paso a paso para iOS Safari y navegadores de escritorio)
 */
export function PwaInstallModal({ open, onClose, isIos }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-3xl bg-slate-900 border border-blue-400/30 p-5 sm:p-6 text-white shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado con Menti */}
        <div className="flex items-center gap-3.5 mb-4">
          <img src="./icons/icon-192.png" alt="Mentrix" className="w-12 h-12 rounded-2xl border border-white/15 object-cover shrink-0" />
          <div className="min-w-0">
            <h3 className="text-base font-bold text-white m-0">Instalar Mentrix Cronos</h3>
            <p className="text-xs text-blue-300 m-0">Acceso directo sin tiendas de aplicaciones</p>
          </div>
        </div>

        {isIos ? (
          <div className="space-y-3 text-sm text-slate-200 bg-slate-950/70 rounded-2xl p-4 border border-white/10">
            <p className="m-0 font-bold text-amber-300 text-xs uppercase tracking-wider">
              En iPhone / iPad (Safari):
            </p>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <span>
                Toca el botón <strong>Compartir</strong> <Share className="inline w-4 h-4 text-blue-400 mx-0.5" /> en la barra de Safari.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <span>
                Selecciona <strong>“Agregar a pantalla de inicio”</strong> ➕.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                3
              </span>
              <span>
                Confirma tocando <strong>Agregar</strong> arriba a la derecha. ¡Listo!
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-200 bg-slate-950/70 rounded-2xl p-4 border border-white/10">
            <p className="m-0 font-bold text-cyan-300 text-xs uppercase tracking-wider">
              Instalación rápida en tu dispositivo:
            </p>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>En computador (Chrome / Edge):</strong> haz clic en el ícono de instalar{" "}
                <Download className="inline w-3.5 h-3.5 text-cyan-300" /> en el extremo derecho de la barra de direcciones.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>En celular Android:</strong> abre el menú del navegador (⋮) y toca{" "}
                <strong>“Instalar aplicación”</strong> o <strong>“Agregar a pantalla principal”</strong>.
              </span>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 font-semibold text-sm text-white transition-all cursor-pointer"
        >
          ¡Entendido!
        </button>
      </div>
    </div>
  );
}

/**
 * Tarjeta fija permanente para instalar la PWA (para el menú de ajustes o el perfil)
 */
export function PwaPermanentInstallCard({ source = "perfil", onInstalled }) {
  const { isStandalone, triggerInstall, showInstructionsModal, setShowInstructionsModal, isIos } = usePwaInstall();

  if (isStandalone) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-3 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-200">App Instalada en tu Dispositivo</div>
            <div className="text-[10px] text-white/50">Disfrutas de pantalla completa y juego offline</div>
          </div>
        </div>
        <span className="text-[10px] text-emerald-300 font-mono font-bold bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 rounded-full shrink-0">
          PWA Activa ✓
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-emerald-400/35 bg-gradient-to-br from-emerald-950/50 via-teal-950/40 to-slate-900/70 p-3.5 shadow-lg relative overflow-hidden group">
        <div className="flex items-start gap-3 mb-2.5">
          <div className="relative w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <Download className="w-5 h-5 text-emerald-300 group-hover:scale-110 transition-transform" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight m-0">
                Instalar Aplicación (PWA)
              </h4>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Fijo
              </span>
            </div>
            <p className="text-[11px] text-slate-300/85 leading-snug mt-1 mb-0">
              Instala Mentrix Cronos en tu pantalla de inicio para jugar a pantalla completa, más rápido y sin conexión.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            playSfx("tap");
            triggerInstall();
            if (onInstalled) onInstalled();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md shadow-emerald-950/60 transition-all hover:scale-[1.01] active:scale-98 cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Instalar en este Dispositivo</span>
        </button>
      </div>

      <PwaInstallModal
        open={showInstructionsModal}
        onClose={() => setShowInstructionsModal(false)}
        isIos={isIos}
      />
    </>
  );
}

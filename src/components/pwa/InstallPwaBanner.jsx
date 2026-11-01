import React, { useEffect, useState } from "react";
import { Download, Share, X, CheckCircle2, Sparkles } from "lucide-react";
import { playSfx } from "@/utils/soundSystem";

let deferredPromptGlobal = null;
const listeners = new Set();

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPromptGlobal = e;
    listeners.forEach((fn) => fn(deferredPromptGlobal));
  });

  window.addEventListener("appinstalled", () => {
    deferredPromptGlobal = null;
    listeners.forEach((fn) => fn(null));
  });
}

export function usePwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState(deferredPromptGlobal);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);

  useEffect(() => {
    const checkStandalone = () => {
      const standalone =
        window.matchMedia?.("(display-mode: standalone)")?.matches ||
        window.navigator?.standalone === true ||
        document.referrer.includes("android-app://");
      setIsStandalone(Boolean(standalone));
    };
    checkStandalone();

    const ua = window.navigator?.userAgent || "";
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(Boolean(ios));

    const handler = (promptEvent) => {
      setDeferredPrompt(promptEvent);
      checkStandalone();
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const triggerInstall = async () => {
    playSfx("tap");
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
          deferredPromptGlobal = null;
          setDeferredPrompt(null);
        }
      } catch {}
      return;
    }
    setShowInstructionsModal(true);
  };

  return {
    canInstallNative: Boolean(deferredPrompt),
    isStandalone,
    isIos,
    showInstructionsModal,
    setShowInstructionsModal,
    triggerInstall,
  };
}

/**
 * Banner flotante de instalación PWA estilo "Pill" (como en ARANPRO)
 */
export function PwaFloatingBanner() {
  const { isStandalone, isIos, triggerInstall, setShowInstructionsModal } = usePwaInstall();
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Si ya está instalada como app nativa/PWA, no mostrar
    if (isStandalone) {
      setDismissed(true);
      return;
    }

    // Verificar si el usuario la descartó recientemente (3 días)
    const lastDismissed = localStorage.getItem("mt_pwa_banner_dismissed");
    if (lastDismissed) {
      const diffDays = (Date.now() - parseInt(lastDismissed, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 3) {
        setDismissed(true);
        return;
      }
    }

    // Mostrar después de un delay de 1.5s para no bloquear la carga inicial
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
    <div className="fixed bottom-20 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div 
        onClick={triggerInstall}
        className="w-full bg-[#0a1820]/95 hover:bg-[#0c1e28]/95 border border-emerald-500/40 hover:border-emerald-400 shadow-[0_12px_36px_rgba(0,0,0,0.7)] backdrop-blur-xl rounded-2xl sm:rounded-full px-3.5 py-2.5 sm:px-4 sm:py-3 flex items-center justify-between gap-3 cursor-pointer transition-all group"
      >
        {/* Isotipo Menti en círculo */}
        <div className="relative w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-emerald-950 via-[#0a1820] to-[#040e14] border border-emerald-500/50 p-1 flex items-center justify-center shadow-md shadow-emerald-950/60">
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
            Accede directo desde tu pantalla de inicio sin descargas pesadas ni tiendas.
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
      <div className="w-full max-w-md rounded-3xl bg-gradient-to-b from-[#0e172e] via-[#090d1c] to-[#0a0e1a] border border-amber-400/40 p-5 sm:p-6 text-white shadow-2xl relative select-none">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
          aria-label="Cerrar modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Encabezado con Menti */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-700 p-0.5 shadow-lg shadow-amber-500/20 shrink-0">
            <div className="w-full h-full bg-[#0a0e1a] rounded-[14px] flex items-center justify-center overflow-hidden">
              <img src="./mentrix-mascot-transparent.png" alt="Mentrix" className="w-9 h-9 object-contain" />
            </div>
          </div>
          <div className="min-w-0">
            <h3 className="text-base font-black text-amber-100 m-0">Instalar Mentrix: Línea de Tiempo</h3>
            <p className="text-xs text-amber-300/80 font-medium m-0">Juega sin conexión y directo desde tu pantalla</p>
          </div>
        </div>

        {isIos ? (
          <div className="space-y-3 text-sm text-slate-200 bg-slate-950/80 rounded-2xl p-4 border border-amber-500/20">
            <p className="m-0 font-bold text-amber-300 text-xs uppercase tracking-wider">
              En iPhone / iPad (Safari):
            </p>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                1
              </span>
              <span>
                Toca el botón <strong>Compartir</strong> <Share className="inline w-4 h-4 text-blue-400 mx-0.5" /> en la barra inferior de Safari.
              </span>
            </div>
            <div className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-300 flex items-center justify-center text-xs font-bold shrink-0">
                2
              </span>
              <span>
                Baja un poco en el menú y selecciona <strong>“Agregar a pantalla de inicio”</strong> ➕.
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
          <div className="space-y-3 text-sm text-slate-200 bg-slate-950/80 rounded-2xl p-4 border border-amber-500/20">
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
          className="mt-5 w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 font-black text-sm text-[#0a0e1a] shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          ¡Entendido, vamos a jugar!
        </button>
      </div>
    </div>
  );
}

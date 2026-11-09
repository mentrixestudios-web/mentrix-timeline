import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  Volume2, 
  VolumeX, 
  Music, 
  Bell, 
  BellOff, 
  X, 
  Sparkles,
  Info,
  FileText,
  Shield,
  Download,
  RefreshCw,
  CheckCircle2
} from "lucide-react";
import TermsAndConditionsModal from "./TermsAndConditionsModal";
import PrivacyPolicyModal from "./PrivacyPolicyModal";
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  isMusicEnabled, 
  setMusicEnabled, 
  getMasterVolume, 
  setMasterVolume, 
  playSfx 
} from "@/utils/soundSystem";
import { 
  setNotificationsEnabled, 
  sendTestNotification, 
  isNotificationsEnabled 
} from "@/utils/notificationSystem";
import { compareVersionStrings, fetchLatestAppInfo, getInstalledAppInfo } from "@/lib/appVersion";
import { PwaPermanentInstallCard } from "@/components/pwa/InstallPwaBanner";
import { toast } from "sonner";

export default function AudioSettingsButton({
  buttonClassName = "rounded-lg bg-white/10 border border-white/15 p-1 sm:p-1.5 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer",
  iconClassName = "w-3.5 h-3.5",
}) {
  const [open, setOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [sound, setSound] = useState(isSoundEnabled());
  const [music, setMusic] = useState(isMusicEnabled());
  const [volume, setVolume] = useState(getMasterVolume());
  const [updating, setUpdating] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  const [appInfo, setAppInfo] = useState({
    version: "2.7.0",
    build: "30",
    appName: "Mentrix Línea de Tiempo",
  });

  const [updateState, setUpdateState] = useState({
    checking: false,
    checked: false,
    available: false,
    latestVersion: null,
    message: "Toca para buscar si existe una versión más reciente.",
  });

  useEffect(() => {
    let mounted = true;
    getInstalledAppInfo().then((info) => {
      if (mounted) setAppInfo(info);
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleCheckUpdates = useCallback(async () => {
    setUpdateState((prev) => ({
      ...prev,
      checking: true,
      checked: true,
      message: "Buscando actualizaciones disponibles...",
    }));

    try {
      const latest = await fetchLatestAppInfo();
      const isNewerVersion = compareVersionStrings(latest.version, appInfo.version) > 0;
      const isNewerBuild =
        compareVersionStrings(latest.version, appInfo.version) === 0 &&
        Number(latest.build || 0) > Number(appInfo.build || 0);
      const available = isNewerVersion || isNewerBuild;

      setUpdateState({
        checking: false,
        checked: true,
        available,
        latestVersion: `${latest.version} (build ${latest.build})`,
        message: available
          ? `¡Hay una nueva versión disponible: ${latest.version} (build ${latest.build})!`
          : "Tu app ya cuenta con la última versión disponible.",
      });
    } catch {
      setUpdateState({
        checking: false,
        checked: true,
        available: false,
        latestVersion: null,
        message: "No fue posible verificar actualizaciones en este momento.",
      });
    }
  }, [appInfo.build, appInfo.version]);

  const handleApplyUpdate = useCallback(async () => {
    setUpdating(true);
    try {
      if ("serviceWorker" in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const reg of registrations) {
          await reg.unregister();
        }
      }
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch (err) {
      console.warn("Error al limpiar caché:", err);
    }
    window.location.reload();
  }, []);

  const toggleSound = () => {
    const next = !sound;
    setSound(next);
    setSoundEnabled(next);
    if (next) playSfx("coin");
  };

  const toggleMusic = () => {
    const next = !music;
    setMusic(next);
    setMusicEnabled(next);
    playSfx("tap");
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setMasterVolume(val);
  };

  const requestNotif = async () => {
    playSfx("tap");
    if (typeof Notification === "undefined") {
      toast.error("Notificaciones no soportadas en este navegador");
      return;
    }
    if (notifEnabled) {
      setNotifEnabled(false);
      setNotificationsEnabled(false);
      toast.message("Notificaciones desactivadas", { duration: 2500 });
      return;
    }
    try {
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setNotifEnabled(true);
        setNotificationsEnabled(true);
        toast.success("¡Notificaciones activadas con éxito! ⏳✨");
        playSfx("correct");
      } else {
        setNotifEnabled(false);
        setNotificationsEnabled(false);
        toast.info("Permiso de notificaciones denegado");
      }
    } catch {
      toast.error("Error al solicitar notificaciones");
    }
  };

  const handleTestNotification = async () => {
    playSfx("tap");
    const ok = await sendTestNotification();
    if (!ok) {
      toast.error("Activa las notificaciones primero para probar");
      return;
    }
    toast.message("Te llegará una notificación de prueba en 5 segundos.", { duration: 3000 });
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          playSfx("click");
          setOpen(true);
        }}
        aria-label="Configuración de audio y juego"
        className={buttonClassName}
        type="button"
      >
        <Settings className={`${iconClassName} ${sound || music ? "text-cyan-300" : "text-white/60"}`} />
      </motion.button>

      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/85"
                onClick={() => setOpen(false)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-sm max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#0c162e] via-[#091124] to-[#070b18] border-2 border-amber-400/50 rounded-3xl p-5 shadow-[0_15px_50px_rgba(0,0,0,0.9)] text-white select-none"
              >
                <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full pointer-events-none" />

                <div className="flex items-center justify-between pb-3 mb-4 border-b border-amber-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-amber-100 uppercase tracking-wider">
                        Configuración
                      </h3>
                      <p className="text-[10px] text-amber-300/70 font-semibold">
                        Ajustes de Sonido, Nube y Sistema
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* SECCIÓN VERSIÓN Y ACTUALIZACIONES */}
                  <div className="rounded-2xl border border-white/15 bg-white/[0.04] p-3 shadow-inner">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-extrabold text-white">Versión de la app</div>
                        <div className="mt-0.5 text-[10px] text-amber-300 font-mono font-bold">
                          v{appInfo.version} · build {appInfo.build}
                        </div>
                      </div>
                      <div className="rounded-lg bg-emerald-500/20 border border-emerald-400/30 px-2 py-0.5 text-[9px] font-extrabold text-emerald-300 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        <span>Instalada</span>
                      </div>
                    </div>

                    <div className="mt-2.5 rounded-xl border border-white/10 bg-black/30 p-2.5">
                      <div className="flex items-start gap-2">
                        <Download
                          className={`mt-0.5 h-4 w-4 shrink-0 ${
                            updateState.available ? "text-emerald-300 animate-bounce" : "text-white/45"
                          }`}
                        />
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold text-white/90">Estado de actualización</div>
                          <div className="text-[10px] leading-relaxed text-white/60">
                            {updateState.message}
                          </div>
                          {updateState.latestVersion ? (
                            <div className="mt-1 text-[10px] font-semibold text-amber-300">
                              Última detectada: {updateState.latestVersion}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {updateState.available && (
                      <button
                        type="button"
                        onClick={handleApplyUpdate}
                        disabled={updating}
                        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-3 py-2.5 text-[11px] font-black text-slate-950 shadow-lg shadow-emerald-500/30 transition-all hover:scale-[1.02] active:scale-98 cursor-pointer"
                      >
                        <RefreshCw className={`h-4 w-4 ${updating ? "animate-spin" : ""}`} />
                        {updating ? "Actualizando e instalando..." : "¡Actualizar ahora!"}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleCheckUpdates}
                      disabled={updateState.checking || updating}
                      className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-amber-300/25 bg-amber-500/10 px-3 py-1.5 text-[10px] font-extrabold text-amber-200 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${updateState.checking ? "animate-spin" : ""}`} />
                      {updateState.checking ? "Verificando..." : "Buscar actualizaciones"}
                    </button>

                    <button
                      type="button"
                      onClick={handleApplyUpdate}
                      disabled={updating}
                      className="mt-1.5 text-[9px] text-slate-400 hover:text-amber-300 underline text-center w-full block cursor-pointer transition-colors"
                    >
                      Forzar recarga / Refrescar caché
                    </button>
                  </div>

                  {/* Tarjeta permanente de Instalación PWA */}
                  <PwaPermanentInstallCard source="settings" onInstalled={() => setOpen(false)} />

                  {/* Efectos de sonido */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${sound ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/40"}`}>
                        {sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Efectos de Sonido</p>
                        <p className="text-[10px] text-white/50">Aciertos, cartas y recompensas</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleSound}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${sound ? "bg-amber-500" : "bg-white/20"}`}
                    >
                      <motion.div
                        layout
                        className={`w-5 h-5 rounded-full bg-white shadow-md ${sound ? "ml-auto" : "ml-0"}`}
                      />
                    </button>
                  </div>

                  {/* Música ambiental */}
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${music ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/40"}`}>
                        <Music className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Música de Época</p>
                        <p className="text-[10px] text-white/50">Ambiente de viaje temporal</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleMusic}
                      className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${music ? "bg-purple-500" : "bg-white/20"}`}
                    >
                      <motion.div
                        layout
                        className={`w-5 h-5 rounded-full bg-white shadow-md ${music ? "ml-auto" : "ml-0"}`}
                      />
                    </button>
                  </div>

                  {/* Slider de volumen */}
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-amber-200/80 font-bold">
                      <span>Volumen Maestro</span>
                      <span className="text-amber-300">{Math.round(volume * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="w-full accent-amber-400 bg-white/10 h-2 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Notificaciones */}
                  <div className="p-2.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${notifEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>
                          {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white leading-tight">Notificaciones PWA</p>
                          <p className="text-[10px] text-white/50">Desafíos y récord diario</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={requestNotif}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-colors cursor-pointer ${
                          notifEnabled
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                            : "bg-white/10 text-white/80 hover:bg-white/20 border border-white/10"
                        }`}
                      >
                        {notifEnabled ? "Activo ✓" : "Activar"}
                      </button>
                    </div>
                    {notifEnabled && (
                      <button
                        type="button"
                        onClick={handleTestNotification}
                        className="w-full text-[10px] py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-amber-200 font-semibold transition-all cursor-pointer border border-white/10 text-center"
                      >
                        Probar notificación (5s) ⏳
                      </button>
                    )}
                  </div>

                  {/* Aspectos Legales */}
                  <div className="pt-2 space-y-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        setOpen(false);
                        setShowTerms(true);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-amber-200/90">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span>Términos y Condiciones</span>
                      </div>
                      <span className="text-[10px] text-white/40">›</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        playSfx("tap");
                        setOpen(false);
                        setShowPrivacy(true);
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-[11px] font-bold text-cyan-200/90">
                        <Shield className="w-4 h-4 text-cyan-400" />
                        <span>Política de Privacidad</span>
                      </div>
                      <span className="text-[10px] text-white/40">›</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <strong className="text-amber-200">{appInfo.appName}</strong>
                  </span>
                  <span className="font-mono">v{appInfo.version}</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <TermsAndConditionsModal open={showTerms} onClose={() => setShowTerms(false)} />
      <PrivacyPolicyModal open={showPrivacy} onClose={() => setShowPrivacy(false)} />
    </>
  );
}

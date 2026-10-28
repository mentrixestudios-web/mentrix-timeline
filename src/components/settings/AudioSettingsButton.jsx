import React, { useState, useEffect } from "react";
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
  Info
} from "lucide-react";
import { 
  isSoundEnabled, 
  setSoundEnabled, 
  isMusicEnabled, 
  setMusicEnabled, 
  getMasterVolume, 
  setMasterVolume, 
  playSfx 
} from "@/utils/soundSystem";
import { toast } from "sonner";

export default function AudioSettingsButton({
  buttonClassName = "rounded-lg bg-white/10 border border-white/15 p-1 sm:p-1.5 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer",
  iconClassName = "w-3.5 h-3.5",
}) {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(isSoundEnabled());
  const [music, setMusic] = useState(isMusicEnabled());
  const [volume, setVolume] = useState(getMasterVolume());
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

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
    try {
      const res = await Notification.requestPermission();
      if (res === "granted") {
        setNotifEnabled(true);
        toast.success("¡Notificaciones activadas!");
        playSfx("correct");
      } else {
        setNotifEnabled(false);
        toast.info("Permiso de notificaciones denegado");
      }
    } catch {
      toast.error("Error al solicitar notificaciones");
    }
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

      {/* Renderizado mediante Portal en document.body para evitar que cualquier elemento lo tape */}
      {typeof document !== "undefined" && createPortal(
        <AnimatePresence>
          {open && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
              {/* Fondo oscuro con desenfoque que cierra al hacer clic */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/75 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />

              {/* Modal Centrado */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 15 }}
                transition={{ duration: 0.2 }}
                className="relative z-10 w-full max-w-sm bg-gradient-to-b from-[#0c162e] via-[#091124] to-[#070b18] border-2 border-amber-400/50 rounded-3xl p-5 shadow-[0_15px_50px_rgba(0,0,0,0.9)] text-white select-none overflow-hidden"
              >
                {/* Luz ambiental dorada en la esquina */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                {/* Header del modal */}
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
                        Ajustes de Sonido y Sistema
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

                {/* Opciones de Audio */}
                <div className="space-y-3.5">
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
                  <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${notifEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>
                        {notifEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white leading-tight">Notificaciones</p>
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
                </div>

                {/* App Info Footer */}
                <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <strong className="text-amber-200">Mentrix Línea de Tiempo</strong>
                  </span>
                  <span className="font-mono">v1.0.0</span>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}

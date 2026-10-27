import React, { useState, useEffect, useRef } from "react";
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
  buttonClassName = "rounded-lg bg-white/10 border border-white/15 p-1.5 hover:bg-white/20 transition-all flex items-center justify-center cursor-pointer",
  iconClassName = "w-4 h-4 text-white/70",
}) {
  const [open, setOpen] = useState(false);
  const [sound, setSound] = useState(isSoundEnabled());
  const [music, setMusic] = useState(isMusicEnabled());
  const [volume, setVolume] = useState(getMasterVolume());
  const [notifEnabled, setNotifEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
  const panelRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

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
    <div className="relative inline-block" ref={panelRef}>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          playSfx("click");
          setOpen(!open);
        }}
        aria-label="Configuración de audio y juego"
        className={buttonClassName}
        type="button"
      >
        <Settings className={`${iconClassName} ${sound || music ? "text-cyan-300" : "text-white/60"}`} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-11 right-0 w-72 bg-gradient-to-b from-[#0c162e] to-[#090d1c] border border-amber-500/30 rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 text-white"
          >
            {/* Header del modal */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                <h3 className="font-extrabold text-sm text-amber-100">Configuración</h3>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Opciones de Audio */}
            <div className="space-y-3">
              {/* Efectos de sonido */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${sound ? "bg-amber-500/20 text-amber-300" : "bg-white/5 text-white/40"}`}>
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
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${sound ? "bg-amber-500" : "bg-white/20"}`}
                >
                  <motion.div
                    layout
                    className={`w-5 h-5 rounded-full bg-white shadow-md ${sound ? "ml-auto" : "ml-0"}`}
                  />
                </button>
              </div>

              {/* Música ambiental */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${music ? "bg-purple-500/20 text-purple-300" : "bg-white/5 text-white/40"}`}>
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
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${music ? "bg-purple-500" : "bg-white/20"}`}
                >
                  <motion.div
                    layout
                    className={`w-5 h-5 rounded-full bg-white shadow-md ${music ? "ml-auto" : "ml-0"}`}
                  />
                </button>
              </div>

              {/* Slider de volumen */}
              <div className="pt-2">
                <div className="flex justify-between text-[10px] text-amber-200/60 font-bold mb-1">
                  <span>Volumen General</span>
                  <span>{Math.round(volume * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-full accent-amber-400 bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Notificaciones */}
              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${notifEnabled ? "bg-emerald-500/20 text-emerald-300" : "bg-white/5 text-white/40"}`}>
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
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors ${
                    notifEnabled
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  {notifEnabled ? "Activo" : "Activar"}
                </button>
              </div>
            </div>

            {/* App Info Footer */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                Mentrix Línea de Tiempo
              </span>
              <span>v1.0.0</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

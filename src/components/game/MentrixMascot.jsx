import React, { useState, useEffect } from "react";
import { Hourglass, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIMELINE_MESSAGES = {
  idle: [
    "¿Crees que dominas la historia universal? Demuéstramelo. ⏳",
    "El tiempo es relativo... pero el orden de los hechos no. 😏",
    "¿Qué acontecimiento ocurrió primero? Elige la época exacta.",
    "Un paso en falso y cambias el curso de la historia. ⚡",
    "Observa bien las pistas de cada siglo antes de colocar tu carta.",
  ],
  correct: [
    "¡Exacto! Tu sentido del tiempo es impecable. 🎯",
    "¡Boom! Esa carta encaja a la perfección en la historia. 🔥",
    "¡Impresionante! La línea del tiempo sigue creciendo sin fisuras. ⏳",
    "Veo que conoces tu historia... continúa así, crononauta. 👏",
  ],
  wrong: [
    "¡Error histórico! Esa época no coincide en absoluto. 😬",
    "¡Ups! El efecto mariposa no perdona... Pierdes un corazón. 💔",
    "Casi, pero te adelantaste varios siglos en el tiempo. 🤷",
    "¡No! Ese invento ocurrió mucho antes. Recalculando coordenadas... ⏳",
  ],
  victory: [
    "¡Maestro del Tiempo! Has colocado 10 acontecimientos sin quebrar la historia. 👑✨",
    "¡Increíble precisión cronológica! Eres un verdadero viajero temporal. 🏆",
  ],
  gameover: [
    "¡Paradoja temporal! Se te acabaron las vidas. 💀",
    "El tiempo te ha vencido hoy... pero las eras están listas para tu revancha. 🔄",
  ],
};

export default function MentrixMascot({
  status = "idle",
  customMessage = null,
  size = "md",
  layout = "default", // 'default' | 'hero' | 'compact'
}) {
  const [msgIndex, setMsgIndex] = useState(0);

  const pool = TIMELINE_MESSAGES[status] || TIMELINE_MESSAGES.idle;

  useEffect(() => {
    if (customMessage) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % pool.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [pool.length, customMessage]);

  const currentMessage = customMessage || pool[msgIndex % pool.length];

  if (layout === "compact") {
    return (
      <div className="flex items-center gap-2.5 bg-blue-600/15 border border-amber-400/30 rounded-2xl p-2.5 max-w-md w-full shadow-md backdrop-blur-md">
        <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
          <img
            src="/mentrix-mascot.png"
            alt="Menti"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(245,158,11,0.3)]"
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-wider mb-0.5">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>Menti</span>
          </div>
          <p className="text-xs text-amber-100/90 font-medium leading-tight truncate">
            {currentMessage}
          </p>
        </div>
      </div>
    );
  }

  // Layout default / hero: ESTÁNDAR FLOTANTE DE MENTRIX ESTUDIO BÍBLICO (Sin contenedor cuadrado)
  const isSm = size === "sm";
  return (
    <div className="w-full flex flex-col items-center gap-2 max-w-md mx-auto relative select-none py-1">
      {/* Núcleo Flotante con Resplandor Áureo */}
      <div className="relative flex items-center justify-center">
        {/* Anillo astrolabio giratorio tenue */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          className={`absolute ${isSm ? "w-24 h-24" : "w-28 h-28 sm:w-32 sm:h-32"} rounded-full border border-dashed border-amber-400/25 pointer-events-none`}
        />
        {/* Resplandor áureo y cósmico */}
        <div className={`absolute ${isSm ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28"} bg-gradient-to-r from-amber-500/20 via-blue-500/15 to-purple-500/15 rounded-full blur-2xl pointer-events-none`} />

        {/* Mascota Menti Flotando Libre */}
        <motion.div
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          className={`relative z-10 ${isSm ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28"} flex items-center justify-center cursor-pointer`}
        >
          <img
            src="/mentrix-mascot.png"
            alt="Menti Viajero del Tiempo"
            className="w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
          />
        </motion.div>
      </div>

      {/* Badge Menti Viajero del Tiempo */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 border border-amber-400/35 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
        <Hourglass className="w-3 h-3 text-amber-400 animate-spin-slow" />
        <span>Menti · Viajero del Tiempo</span>
      </div>

      {/* Cápsula de Diálogo estilo Estudio Bíblico */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMessage}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.25 }}
          className="relative bg-blue-600/20 border border-amber-400/25 backdrop-blur-md rounded-full px-5 py-2 shadow-lg shadow-blue-950/40 max-w-sm text-center"
        >
          <p className="text-white/95 text-xs sm:text-sm font-medium leading-relaxed">
            "{currentMessage}"
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

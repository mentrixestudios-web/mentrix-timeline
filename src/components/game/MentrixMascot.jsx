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

  if (layout === "hero") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-br from-[#0c162e] via-[#0b1328] to-[#121c3b] border border-amber-500/30 rounded-3xl p-5 shadow-[0_8px_30px_rgba(245,158,11,0.12)] max-w-2xl mx-auto backdrop-blur-md">
        {/* Mascota con resplandor dorado */}
        <div className="relative shrink-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-amber-500/15 rounded-full blur-xl scale-125" />
          <motion.img
            src="./mentrix-mascot.png"
            alt="Menti Viajero del Tiempo"
            className="w-28 h-28 sm:w-32 sm:h-32 object-contain relative z-10 filter drop-shadow-[0_8px_16px_rgba(234,179,8,0.25)]"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>

        {/* Diálogo pergamino digital */}
        <div className="flex-1 text-center sm:text-left space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-black text-amber-300">
            <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
            <span className="tracking-wider uppercase">Menti · Viajero del Tiempo</span>
          </div>

          <AnimatePresence mode="wait">
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-sm sm:text-base font-semibold text-amber-50/90 leading-relaxed font-sans"
            >
              "{currentMessage}"
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Layout default / compacto
  return (
    <div className="flex items-center gap-3 bg-gradient-to-br from-[#0c162e] to-[#0f172a] border border-amber-500/30 rounded-2xl p-3 max-w-md w-full shadow-lg backdrop-blur-md">
      <div className="w-14 h-14 shrink-0 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-amber-500/10 rounded-full blur-md" />
        <img
          src="./mentrix-mascot.png"
          alt="Menti"
          className="w-full h-full object-contain relative z-10 filter drop-shadow-[0_4px_8px_rgba(245,158,11,0.2)]"
        />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-1 text-[11px] font-black text-amber-400 uppercase tracking-wider mb-0.5">
          <Hourglass className="w-3 h-3 text-amber-400" />
          <span>Menti · Guía Temporal</span>
        </div>
        <p className="text-xs sm:text-sm text-amber-100/90 font-medium leading-snug">
          {currentMessage}
        </p>
      </div>
    </div>
  );
}

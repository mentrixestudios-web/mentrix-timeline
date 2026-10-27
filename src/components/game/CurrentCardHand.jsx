import React from "react";
import { HelpCircle, Sparkles, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

export default function CurrentCardHand({ event, cardsPlaced = 0, targetGoal = 10 }) {
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md mx-auto bg-gradient-to-br from-[#0e1c3d] via-[#091228] to-[#122247] border-2 border-amber-400/60 rounded-3xl p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.22)] backdrop-blur-xl"
    >
      {/* Etiqueta superior */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/10 border border-amber-400/50 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Tu carta en mano</span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 px-3 py-1 rounded-full text-xs font-black">
          <Hourglass className="w-3.5 h-3.5 text-amber-400 animate-spin-slow" />
          <span>¿Año incógnita?</span>
        </div>
      </div>

      {/* Título de la carta */}
      <h2 className="text-white font-black text-base sm:text-lg leading-snug">
        {event.title}
      </h2>

      {/* Reseña o pista histórica */}
      {event.description && (
        <p className="text-xs text-amber-100/70 mt-2 line-clamp-2 leading-relaxed font-medium">
          {event.description}
        </p>
      )}

      {/* Instrucción visual con acabado dorado */}
      <div className="mt-3.5 pt-2.5 border-t border-amber-500/20 flex items-center justify-between text-[11px] text-amber-200/50 font-medium">
        <span>Toca una ranura <strong>[+]</strong> en la línea temporal</span>
        <span className="text-amber-400 font-extrabold">{cardsPlaced} / {targetGoal} cartas</span>
      </div>
    </motion.div>
  );
}

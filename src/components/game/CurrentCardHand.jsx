import React from "react";
import { HelpCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export default function CurrentCardHand({ event, cardsPlaced = 0, targetGoal = 10 }) {
  if (!event) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full max-w-md mx-auto bg-gradient-to-br from-blue-950/80 via-slate-900/95 to-indigo-950/80 border-2 border-blue-400/50 rounded-2xl p-4 shadow-[0_0_30px_rgba(59,130,246,0.25)] backdrop-blur-xl"
    >
      {/* Etiqueta superior */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-500/20 border border-blue-400/40 text-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
          <Sparkles className="w-3 h-3 text-blue-400" />
          <span>Tu carta en mano</span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-black">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>¿Año incógnita?</span>
        </div>
      </div>

      {/* Título de la carta */}
      <h2 className="text-white font-extrabold text-base sm:text-lg leading-snug">
        {event.title}
      </h2>

      {/* Reseña o pista */}
      {event.description && (
        <p className="text-xs text-white/60 mt-1.5 line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      )}

      {/* Instrucción visual */}
      <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/40">
        <span>Toca una ranura <strong>[+]</strong> en la línea de tiempo</span>
        <span className="text-blue-400 font-semibold">{cardsPlaced} / {targetGoal} cartas</span>
      </div>
    </motion.div>
  );
}

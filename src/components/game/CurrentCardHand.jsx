import React from "react";
import { Sparkles, Hourglass, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function getCenturyHint(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `Siglo ${c} a.C. (Época Antigua)`;
  }
  const c = Math.ceil(year / 100);
  if (c <= 5) return `Siglo ${c} d.C. (Edad Antigua)`;
  if (c <= 15) return `Siglo ${c} d.C. (Edad Media)`;
  if (c <= 18) return `Siglo ${c} d.C. (Edad Moderna)`;
  return `Siglo ${c} d.C. (Edad Contemporánea)`;
}

export default function CurrentCardHand({
  event,
  cardsPlaced = 0,
  targetGoal = 10,
  lupaActive = false,
}) {
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

      {/* Pista de Lupa si está activa */}
      <AnimatePresence>
        {lupaActive && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2.5 p-2 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center gap-2 text-xs text-amber-200 font-extrabold shadow-sm"
          >
            <Search className="w-4 h-4 text-amber-300 shrink-0" />
            <span>Pista Revelada: {getCenturyHint(event.year)}</span>
          </motion.div>
        )}
      </AnimatePresence>

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

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Hourglass, Sparkles } from "lucide-react";

export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const statusStyles = {
    default: "bg-gradient-to-r from-[#0c162e] via-[#0b1328] to-[#0e1a38] border-amber-500/25 hover:border-amber-400/60 shadow-lg",
    justPlaced: "bg-gradient-to-r from-emerald-950/90 to-[#0b1328] border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)] scale-[1.02]",
    error: "bg-gradient-to-r from-red-950/90 to-[#0b1328] border-red-500 shadow-[0_0_25px_rgba(239,68,68,0.4)]",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`relative w-full rounded-2xl border p-4 transition-all duration-300 backdrop-blur-md ${statusStyles[status] || statusStyles.default}`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Placa Dorada del Año Histórico */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-500/25 via-yellow-500/15 to-amber-600/20 border border-amber-400/50 text-amber-300 px-3.5 py-1.5 rounded-xl font-black text-sm sm:text-base tracking-wider shadow-sm">
          <Hourglass className="w-3.5 h-3.5 text-amber-400" />
          <span>{event.yearFormatted}</span>
        </div>

        {/* Botón de info / detalles */}
        {event.description && (
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1.5 rounded-xl text-amber-200/50 hover:text-amber-200 hover:bg-white/10 transition-colors"
            title="Ver más información histórica"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Título del acontecimiento */}
      <h3 className="text-amber-50 font-extrabold text-sm sm:text-base mt-2.5 leading-snug">
        {event.title}
      </h3>

      {/* Reseña histórica desplegable */}
      <AnimatePresence>
        {showDetails && event.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2.5 pt-2.5 border-t border-amber-500/20"
          >
            <p className="text-xs text-amber-100/75 leading-relaxed font-normal">
              {event.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

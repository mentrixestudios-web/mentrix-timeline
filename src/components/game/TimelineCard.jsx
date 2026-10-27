import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Calendar } from "lucide-react";

export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const statusStyles = {
    default: "bg-slate-900/90 border-white/15 hover:border-blue-400/50 shadow-md",
    justPlaced: "bg-emerald-950/80 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)] scale-[1.02]",
    error: "bg-red-950/80 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.35)]",
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
        {/* Año en badge destacado */}
        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border border-amber-500/40 text-amber-300 px-3 py-1 rounded-xl font-black text-sm tracking-wider shadow-sm">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{event.yearFormatted}</span>
        </div>

        {/* Botón de info / detalles */}
        {event.description && (
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="p-1 rounded-lg text-white/40 hover:text-white/90 hover:bg-white/10 transition-colors"
            title="Ver más información"
          >
            <Info className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Título del evento */}
      <h3 className="text-white font-bold text-sm sm:text-base mt-2.5 leading-snug">
        {event.title}
      </h3>

      {/* Descripción desplegable */}
      <AnimatePresence>
        {showDetails && event.description && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-2 pt-2 border-t border-white/10"
          >
            <p className="text-xs text-white/70 leading-relaxed font-normal">
              {event.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

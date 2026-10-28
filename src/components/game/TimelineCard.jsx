import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Info, Hourglass, Sparkles, BookOpen, ChevronDown, CheckCircle2 } from "lucide-react";

function getCenturyTag(year) {
  if (year < 0) {
    const c = Math.ceil(Math.abs(year) / 100);
    return `Siglo ${c} a.C. · Antigüedad`;
  }
  const c = Math.ceil(year / 100);
  if (c <= 5) return `Siglo ${c} d.C. · Era Clásica`;
  if (c <= 15) return `Siglo ${c} d.C. · Edad Media`;
  if (c <= 18) return `Siglo ${c} d.C. · Edad Moderna`;
  return `Siglo ${c} d.C. · Época Contemporánea`;
}

export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
}) {
  const [showDetails, setShowDetails] = useState(false);

  const statusStyles = {
    default: "border-amber-400/40 bg-gradient-to-br from-[#0d1a38] via-[#091126] to-[#132247] shadow-[0_4px_20px_rgba(0,0,0,0.4)]",
    justPlaced: "border-emerald-400 bg-gradient-to-br from-emerald-950/80 via-[#0a1828] to-[#0c1f38] shadow-[0_0_30px_rgba(16,185,129,0.35)] ring-2 ring-emerald-400/50 scale-[1.01]",
    error: "border-red-500 bg-gradient-to-br from-red-950/80 via-[#180a14] to-[#0d1120] shadow-[0_0_30px_rgba(239,68,68,0.35)] ring-2 ring-red-500/50",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className={`relative w-full max-w-md mx-auto rounded-3xl border-2 p-4 transition-all duration-300 backdrop-blur-xl ${statusStyles[status] || statusStyles.default}`}
    >
      {/* Resplandor decorativo de esquina */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

      {/* CABECERA DE LA CARTA: AÑO HISTÓRICO Y NÓDULO DE ORDEN */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        
        {/* Placa Dorada Metálica del Año */}
        <div className="flex items-center gap-2 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-slate-950 px-3.5 py-1.5 rounded-2xl font-black text-sm sm:text-base tracking-wider shadow-lg shadow-amber-500/30">
          <Hourglass className="w-4 h-4 fill-slate-950" />
          <span>{event.yearFormatted}</span>
        </div>

        {/* Tag del Siglo y Época */}
        <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-200/80">
          <span>{getCenturyTag(event.year)}</span>
        </div>
      </div>

      {/* CUERPO: TÍTULO DEL ACONTECIMIENTO */}
      <div className="mt-3 relative z-10">
        <h3 className="text-white font-black text-base sm:text-lg leading-snug tracking-tight">
          {event.title}
        </h3>
      </div>

      {/* FOOTER DE LA CARTA: BOTÓN DESPLEGABLE DE RESEÑA */}
      {event.description && (
        <div className="mt-2.5 pt-2 border-t border-white/10 relative z-10">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-[11px] font-bold text-amber-300/80 hover:text-amber-200 transition-colors cursor-pointer group"
          >
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-400" />
              <span>{showDetails ? "Ocultar crónica histórica" : "Leer crónica histórica"}</span>
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-amber-400 transition-transform duration-200 ${showDetails ? "rotate-180" : ""}`} />
          </button>

          {/* Reseña desplegable estilo códice digital */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2 pt-2 border-t border-amber-500/20"
              >
                <div className="p-2.5 rounded-xl bg-black/40 border border-amber-500/20 text-xs text-amber-100/90 leading-relaxed font-sans font-medium">
                  {event.description}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

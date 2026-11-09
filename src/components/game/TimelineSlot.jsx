import React from "react";
import { Plus, Sparkles, Snowflake, ArrowDown, ArrowUp, Hourglass } from "lucide-react";
import { motion } from "framer-motion";

export default function TimelineSlot({
  onSelect,
  disabled = false,
  isFrozen = false,
  prevYear = null,
  nextYear = null,
  label = null,
}) {
  // Generar etiqueta contextual inteligente si no se pasó una manual
  let displayLabel = label;
  let slotType = "between"; // 'before' | 'between' | 'after'

  if (!displayLabel) {
    if (!prevYear && nextYear) {
      displayLabel = `Antes de ${nextYear}`;
      slotType = "before";
    } else if (prevYear && nextYear) {
      displayLabel = `Entre ${prevYear} y ${nextYear}`;
      slotType = "between";
    } else if (prevYear && !nextYear) {
      displayLabel = `Después de ${prevYear}`;
      slotType = "after";
    } else {
      displayLabel = "Insertar carta aquí";
    }
  }

  // Si la ranura fue congelada / descartada por el comodín Congelador
  if (isFrozen) {
    return (
      <div className="relative flex items-center justify-center my-2.5 w-full max-w-md mx-auto select-none pointer-events-none">
        {/* Línea conectora de fondo */}
        <div className="absolute inset-x-0 h-0.5 bg-cyan-500/20 top-1/2 -translate-y-1/2" />
        
        <div className="relative z-10 flex items-center gap-1.5 py-1.5 px-3.5 rounded-full border border-cyan-400/40 bg-cyan-950/80 text-cyan-300/60 text-[11px] font-black shadow-[0_0_15px_rgba(6,182,212,0.15)]">
          <Snowflake className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
          <span>❄️ DESCARTADO POR CONGELADOR</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center my-2.5 w-full max-w-md mx-auto select-none">
      {/* Guía luminosa central del eje temporal */}
      <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-amber-500/30 to-transparent top-1/2 -translate-y-1/2" />

      {/* Botón interactivo de portal temporal */}
      <motion.button
        type="button"
        whileHover={{ scale: disabled ? 1 : 1.04, y: -1 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        disabled={disabled}
        onClick={onSelect}
        className={`group relative z-10 flex items-center justify-center gap-2 py-2 px-4 rounded-2xl border transition-all duration-200 cursor-pointer shadow-md ${
          disabled
            ? "opacity-35 cursor-not-allowed border-white/10 bg-[#0b1328]/80 text-white/40"
            : "border-amber-400/60 hover:border-amber-300 bg-gradient-to-r from-[#0d1b3a] via-[#132247] to-[#0d1b3a] hover:from-amber-500/20 hover:via-yellow-500/20 hover:to-amber-500/20 text-amber-200 hover:text-white shadow-[0_0_20px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]"
        }`}
      >
        {/* Core de energía con icono */}
        <div className="w-6 h-6 rounded-xl bg-amber-500/20 group-hover:bg-amber-400 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:text-slate-950 transition-all shrink-0 shadow-sm">
          {slotType === "before" ? (
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          ) : slotType === "after" ? (
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          ) : (
            <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform duration-300" />
          )}
        </div>

        {/* Texto del intervalo histórico */}
        <span className="text-xs font-black tracking-wide text-amber-100 group-hover:text-amber-200 transition-colors">
          {displayLabel}
        </span>

        {/* Chispita decorativa en hover */}
        {!disabled && (
          <Sparkles className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
        )}
      </motion.button>
    </div>
  );
}

import React from "react";
import { Plus, Sparkles, Snowflake, ArrowDown, ArrowUp } from "lucide-react";

/**
 * TimelineSlot: Portal Temporal Magnético Compacto
 * En lugar de un botón tosco y repetitivo, actúa como una ranura magnética elegante,
 * esbelta y de alta precisión táctil.
 */
export default function TimelineSlot({
  onSelect,
  disabled = false,
  isFrozen = false,
  prevYear = null,
  nextYear = null,
  label = null,
}) {
  let displayRange = label;
  let slotType = "between";

  if (!displayRange) {
    if (!prevYear && nextYear) {
      displayRange = `Antes de ${nextYear}`;
      slotType = "before";
    } else if (prevYear && nextYear) {
      displayRange = `${prevYear} ➔ ${nextYear}`;
      slotType = "between";
    } else if (prevYear && !nextYear) {
      displayRange = `Después de ${prevYear}`;
      slotType = "after";
    } else {
      displayRange = "Insertar aquí";
    }
  }

  // Ranura congelada por poder de Congelador
  if (isFrozen) {
    return (
      <div className="relative flex items-center justify-center my-1.5 w-full max-w-md mx-auto select-none pointer-events-none">
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full border border-cyan-400/40 bg-cyan-950/85 text-cyan-300 text-[10px] font-black shadow-[0_0_12px_rgba(6,182,212,0.2)]">
          <Snowflake className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>DESCARTADO POR CONGELADOR</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center my-1.5 w-full max-w-md mx-auto select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`group relative z-10 flex items-center justify-center gap-2 py-1.5 px-3.5 sm:px-4 rounded-full border transition-all duration-200 cursor-pointer ${
          disabled
            ? "opacity-30 cursor-not-allowed border-white/10 bg-[#0a0e1c] text-white/30"
            : "border-amber-400/50 hover:border-amber-300 bg-gradient-to-r from-[#0d1630]/90 via-[#16254d]/90 to-[#0d1630]/90 hover:from-amber-500/25 hover:via-yellow-500/30 hover:to-amber-500/25 active:scale-95 shadow-[0_2px_12px_rgba(0,0,0,0.5),0_0_14px_rgba(245,158,11,0.18)] hover:shadow-[0_0_22px_rgba(245,158,11,0.35)]"
        }`}
      >
        {/* Nodo portal magnético circular */}
        <div className="w-5 h-5 rounded-full bg-amber-500/20 group-hover:bg-amber-400 border border-amber-400/60 flex items-center justify-center text-amber-300 group-hover:text-slate-950 transition-colors shrink-0 shadow-sm">
          {slotType === "before" ? (
            <ArrowUp className="w-3 h-3" />
          ) : slotType === "after" ? (
            <ArrowDown className="w-3 h-3" />
          ) : (
            <Plus className="w-3 h-3" />
          )}
        </div>

        {/* Texto de la ranura: limpio y compacto */}
        <span className="text-[11px] sm:text-xs font-black tracking-wide text-amber-100/90 group-hover:text-amber-200">
          {displayRange}
        </span>

        {!disabled && (
          <Sparkles className="w-3 h-3 text-amber-400 opacity-60 group-hover:opacity-100 group-hover:rotate-12 transition-all shrink-0" />
        )}
      </button>
    </div>
  );
}

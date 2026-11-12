import React from "react";
import { Plus, Sparkles, Snowflake, ArrowDown, ArrowUp } from "lucide-react";

/**
 * TimelineSlot: Portal Temporal Magnético Ultra Compacto
 * - En reposo: Ranura compacta y sutil con pulso "[ + ]" y rango de años en tipografía fina.
 * - Al pasar el dedo o tocar: Se ilumina en dorado con efecto de "Portal Temporal Abierto".
 * - Ahorra más del 35% de espacio vertical, permitiendo ver muchas cartas en pantalla.
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

  // Ranura descartada por Congelador de Eras
  if (isFrozen) {
    return (
      <div className="relative flex items-center justify-center my-1 w-full max-w-md mx-auto select-none pointer-events-none">
        <div className="flex items-center gap-1.5 py-0.5 px-3 rounded-full border border-cyan-400/40 bg-cyan-950/80 text-cyan-300 text-[10px] font-black shadow-[0_0_10px_rgba(6,182,212,0.15)]">
          <Snowflake className="w-3 h-3 text-cyan-400" />
          <span>❄️ DESCARTADO</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex items-center justify-center my-1 w-full max-w-md mx-auto select-none">
      <button
        type="button"
        disabled={disabled}
        onClick={onSelect}
        className={`group relative z-10 flex items-center justify-center gap-2 py-1 px-3 sm:px-3.5 rounded-full border transition-all duration-200 cursor-pointer ${
          disabled
            ? "opacity-25 cursor-not-allowed border-white/5 bg-[#080d1a] text-white/20"
            : "border-amber-400/40 hover:border-amber-300 active:border-amber-200 bg-[#0a1124]/90 hover:bg-gradient-to-r hover:from-amber-500/25 hover:via-yellow-500/30 hover:to-amber-500/25 active:scale-95 shadow-[0_2px_10px_rgba(0,0,0,0.6)] hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]"
        }`}
      >
        {/* Nodo portal magnético circular */}
        <div className="w-4 h-4 rounded-full bg-amber-500/20 group-hover:bg-amber-400 group-active:scale-110 border border-amber-400/50 flex items-center justify-center text-amber-300 group-hover:text-slate-950 transition-all shrink-0">
          {slotType === "before" ? (
            <ArrowUp className="w-2.5 h-2.5" />
          ) : slotType === "after" ? (
            <ArrowDown className="w-2.5 h-2.5" />
          ) : (
            <Plus className="w-2.5 h-2.5" />
          )}
        </div>

        {/* Rango de años en tipografía fina y legible */}
        <span className="text-[10px] sm:text-[11px] font-bold tracking-tight text-amber-200/80 group-hover:text-white transition-colors">
          {displayRange}
        </span>

        {!disabled && (
          <Sparkles className="w-2.5 h-2.5 text-amber-400 opacity-40 group-hover:opacity-100 group-hover:rotate-12 transition-all shrink-0" />
        )}
      </button>
    </div>
  );
}

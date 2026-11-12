import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass, ChevronDown, ChevronUp, User, Lightbulb, Info } from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

/**
 * TimelineCard: Chip Cronológico Compacto e Inteligente
 * - En reposo: Es un chip esbelto, elegante y limpio que muestra el año y el título del acontecimiento.
 *   Permite ver muchos hitos en la pantalla del celular sin saturar ni hacer scroll infinito.
 * - Al tocar: Se expande suavemente revelando toda la información (descripción, dato curioso, figura histórica).
 */
export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
}) {
  const [expanded, setExpanded] = useState(false);

  if (!event) return null;

  const era = getEraByYear(event.year);
  const centuryText = getCenturyLabel(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";

  const isJustPlaced = status === "justPlaced";
  const isError = status === "error";

  let borderClasses = era.borderDefault;
  let ringClasses = "";
  if (isJustPlaced) {
    borderClasses = "border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.35)]";
    ringClasses = "ring-2 ring-emerald-400/60";
  } else if (isError) {
    borderClasses = "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]";
    ringClasses = "ring-2 ring-rose-500/60";
  }

  return (
    <div
      onClick={() => setExpanded((prev) => !prev)}
      className={`relative w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl border-2 transition-all duration-200 bg-gradient-to-br ${era.cardBg} ${borderClasses} ${ringClasses} select-none overflow-hidden cursor-pointer active:scale-[0.99] shadow-md`}
    >
      {/* Resplandor sutil de fondo según era */}
      <div className={`absolute top-0 right-0 w-28 h-28 ${era.accentGlow} rounded-full blur-xl pointer-events-none`} />

      {/* ========================================================
          VISTA CHIP COMPACTA (SIEMPRE VISIBLE)
          Año destacado en medallón + Icono + Título + Flecha indicadora
         ======================================================== */}
      <div className="p-3 sm:p-3.5 flex items-center justify-between gap-2.5 relative z-10">
        {/* Medallón de Año en Relieve */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-md shrink-0 bg-gradient-to-r ${era.headerBg}`}>
          <Hourglass className="w-3.5 h-3.5 shrink-0" />
          <span>{event.yearFormatted}</span>
        </div>

        {/* Título y Categoría */}
        <div className="flex-1 min-w-0 pr-1 text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-sm shrink-0" title={event.category}>
              {categoryIcon}
            </span>
            <h3 className="text-white font-extrabold text-xs sm:text-sm leading-snug tracking-tight truncate">
              {event.title}
            </h3>
          </div>
          <span className="text-[10px] text-amber-200/75 font-semibold block tracking-wide truncate">
            {centuryText} · {era.badgeLabel}
          </span>
        </div>

        {/* Botón indicador para desplegar */}
        <div className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center text-slate-300 shrink-0 transition-colors">
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-amber-300" />
          ) : (
            <ChevronDown className="w-4 h-4 text-amber-300/80" />
          )}
        </div>
      </div>

      {/* ========================================================
          PANEL EXPANDIBLE: DETALLES, HISTORIA Y DATO CURIOSO
         ======================================================== */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="px-3.5 pb-3.5 pt-1 border-t border-white/10 space-y-2.5 relative z-10 text-left"
          >
            {/* Descripción Completa */}
            {event.description && (
              <p className="text-xs text-slate-200/95 leading-relaxed font-normal bg-black/35 p-3 rounded-2xl border border-white/10">
                {event.description}
              </p>
            )}

            {/* Dato Curioso */}
            {event.datoCurioso && (
              <div className={`p-2.5 rounded-2xl border flex items-start gap-2 text-[11px] leading-relaxed shadow-sm ${era.curioBg}`}>
                <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                <p>
                  <strong className="text-amber-200 font-bold">Dato curioso:</strong> {event.datoCurioso}
                </p>
              </div>
            )}

            {/* Pie expandido: Figura clave y sello */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
              {event.personajeClave ? (
                <div className="flex items-center gap-1.5 font-medium truncate max-w-[75%]">
                  <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-amber-200/80">Figura clave:</span>
                  <span className="text-white font-semibold truncate">{event.personajeClave}</span>
                </div>
              ) : (
                <div />
              )}

              <div className="text-[9px] uppercase tracking-widest font-black opacity-60">
                {era.sealText}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

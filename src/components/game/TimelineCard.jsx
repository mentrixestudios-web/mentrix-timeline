import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass, ChevronDown, ChevronUp, User, Lightbulb, Sparkles } from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

/**
 * TimelineCard: Chip Cronológico con Revelación Épica al Acertar
 * - Al acertar (status === 'justPlaced'): Se despliega por 1.5s en verde esmeralda resplandeciente,
 *   con el año en grande y confeti dorado, antes de colapsar suavemente a chip compacto.
 * - En reposo: Chip esbelto, limpio y expandible bajo demanda con un toque.
 */
export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
  hardcoreMode = false,
}) {
  const [expanded, setExpanded] = useState(false);

  // Efecto de Revelación Épica: si acaba de ser colocada, se muestra expandida temporalmente
  const isJustPlaced = status === "justPlaced";
  const isError = status === "error";

  useEffect(() => {
    if (isJustPlaced) {
      setExpanded(true);
      const timer = setTimeout(() => {
        setExpanded(false);
      }, 1600); // 1.6s de celebración y luego se contrae suavemente
      return () => clearTimeout(timer);
    }
  }, [isJustPlaced]);

  if (!event) return null;

  const era = getEraByYear(event.year);
  const centuryText = getCenturyLabel(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";

  let borderClasses = era.borderDefault;
  let ringClasses = "";
  let glowHeader = era.headerBg;

  if (isJustPlaced) {
    borderClasses = "border-emerald-400 shadow-[0_0_35px_rgba(16,185,129,0.5)]";
    ringClasses = "ring-2 ring-emerald-400/80";
    glowHeader = "from-emerald-400 via-teal-400 to-green-500 text-slate-950";
  } else if (isError) {
    borderClasses = "border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.35)]";
    ringClasses = "ring-2 ring-rose-500/60";
  }

  // En modo hardcore, los años del tablero quedan ocultos como desafío ciego (salvo que acabe de colocarse)
  const showYear = !hardcoreMode || isJustPlaced;

  return (
    <motion.div
      layout
      initial={isJustPlaced ? { scale: 0.9, opacity: 0, y: -10 } : false}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      onClick={() => setExpanded((prev) => !prev)}
      className={`relative w-full max-w-md mx-auto rounded-2xl sm:rounded-3xl border-2 transition-all duration-300 bg-gradient-to-br ${era.cardBg} ${borderClasses} ${ringClasses} select-none overflow-hidden cursor-pointer active:scale-[0.99] shadow-md`}
    >
      {/* Resplandor sutil de fondo según era */}
      <div className={`absolute top-0 right-0 w-28 h-28 ${era.accentGlow} rounded-full blur-xl pointer-events-none`} />

      {/* Banner de Acierto Temporal durante la Revelación */}
      {isJustPlaced && (
        <div className="bg-emerald-500/25 border-b border-emerald-400/40 px-3 py-1 flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-300 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>¡COORDINADA TEMPORAL EXACTA!</span>
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
        </div>
      )}

      {/* ========================================================
          VISTA CHIP COMPACTA (SIEMPRE VISIBLE)
          Año destacado en medallón + Icono + Título + Flecha indicadora
         ======================================================== */}
      <div className="p-2.5 sm:p-3 flex items-center justify-between gap-2.5 relative z-10">
        {/* Medallón de Año en Relieve */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-black text-xs sm:text-sm tracking-wide shadow-md shrink-0 bg-gradient-to-r ${glowHeader} ${isJustPlaced ? "scale-105 transition-transform" : ""}`}>
          <Hourglass className="w-3.5 h-3.5 shrink-0" />
          <span>{showYear ? event.yearFormatted : "??? d.C."}</span>
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
            className="px-3 pb-3 pt-1 border-t border-white/10 space-y-2 relative z-10 text-left"
          >
            {/* Ilustración o Imagen de la Carta si existe */}
            {event.image && (
              <div className="w-full h-32 rounded-2xl overflow-hidden relative border border-white/10 shadow-md">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Descripción Completa */}
            {event.description && (
              <p className="text-xs text-slate-200/95 leading-relaxed font-normal bg-black/35 p-2.5 rounded-2xl border border-white/10">
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
    </motion.div>
  );
}

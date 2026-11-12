import React from "react";
import { Hourglass, Sparkles, User, Lightbulb } from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

export default function TimelineCard({
  event,
  status = "default", // 'default' | 'justPlaced' | 'error'
  index = 0,
}) {
  if (!event) return null;

  const era = getEraByYear(event.year);
  const centuryText = getCenturyLabel(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";

  // Estilos de estado especial (acierto / error)
  const isJustPlaced = status === "justPlaced";
  const isError = status === "error";

  let borderClasses = era.borderDefault;
  let ringClasses = "";
  if (isJustPlaced) {
    borderClasses = "border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]";
    ringClasses = "ring-2 ring-emerald-400/60";
  } else if (isError) {
    borderClasses = "border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.4)]";
    ringClasses = "ring-2 ring-rose-500/60";
  }

  return (
    <div
      className={`relative w-full max-w-md mx-auto rounded-3xl border-2 p-4 transition-all duration-300 bg-gradient-to-br ${era.cardBg} ${borderClasses} ${ringClasses} select-none overflow-hidden`}
    >
      {/* 1. Decoración de carta física de mesa: remaches y textura de fondo */}
      <div className={`absolute top-0 right-0 w-36 h-36 ${era.accentGlow} rounded-full blur-2xl pointer-events-none`} />
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-white/20 bg-white/10 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-white/20 bg-white/10 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-white/20 bg-white/10 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-white/20 bg-white/10 pointer-events-none" />

      {/* 2. Cabecera con Medallón de Fecha y Sello de Época */}
      <div className="flex items-center justify-between gap-2 relative z-10">
        {/* Medallón de Fecha en relieve (como moneda o sello antiguo) */}
        <div className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl font-black text-sm sm:text-base tracking-wider shadow-lg bg-gradient-to-r ${era.headerBg}`}>
          <Hourglass className="w-4 h-4 shrink-0" />
          <span>{event.yearFormatted}</span>
        </div>

        {/* Sello heráldico de la Era Histórica */}
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold border backdrop-blur-sm shadow-sm ${era.stampBg}`}>
          <span>{era.icono}</span>
          <span className="tracking-wide uppercase">{centuryText}</span>
          <span className="opacity-50">·</span>
          <span className="hidden sm:inline opacity-90">{era.badgeLabel}</span>
        </div>
      </div>

      {/* 3. Título del acontecimiento histórico */}
      <div className="mt-3 relative z-10">
        <div className="flex items-start gap-2">
          <span className="text-base sm:text-lg shrink-0 mt-0.5" title={event.category}>
            {categoryIcon}
          </span>
          <h3 className="text-white font-extrabold text-base sm:text-lg leading-snug tracking-tight">
            {event.title}
          </h3>
        </div>

        {event.description && (
          <p className="mt-2 text-xs text-slate-200/90 leading-relaxed font-normal bg-black/25 p-2.5 rounded-2xl border border-white/10">
            {event.description}
          </p>
        )}
      </div>

      {/* 4. Dato curioso pedagógico (destacado con calidez) */}
      {event.datoCurioso && (
        <div className={`mt-2.5 p-2.5 rounded-2xl border relative z-10 flex items-start gap-2 text-[11px] leading-relaxed shadow-sm ${era.curioBg}`}>
          <Lightbulb className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
          <p>
            <strong className="text-amber-200 font-bold">Dato curioso:</strong> {event.datoCurioso}
          </p>
        </div>
      )}

      {/* 5. Pie de carta: Figura clave y sello de colección */}
      <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] relative z-10 text-slate-300">
        {event.personajeClave ? (
          <div className="flex items-center gap-1.5 font-medium truncate max-w-[70%]">
            <User className="w-3 h-3 text-amber-400 shrink-0" />
            <span className="text-amber-200/80">Figura:</span>
            <span className="text-white font-semibold truncate">{event.personajeClave}</span>
          </div>
        ) : (
          <div />
        )}

        <div className="text-[9px] uppercase tracking-widest font-black opacity-60">
          {era.sealText}
        </div>
      </div>
    </div>
  );
}

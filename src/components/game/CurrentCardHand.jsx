import React from "react";
import { Sparkles, Search, HelpCircle, ArrowDown, User } from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

export default function CurrentCardHand({
  event,
  cardsPlaced = 0,
  targetGoal = 10,
  lupaActive = false,
  anclaActive = false,
}) {
  if (!event) return null;

  const era = getEraByYear(event.year);
  const centuryText = getCenturyLabel(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";

  // Determinar tercio temporal para el Ancla Temporal
  const getAnclaHint = (year) => {
    if (year < 500) return "🏛️ Pasado Remoto y Era Clásica (Primer tercio)";
    if (year <= 1800) return "⚔️ Época Medieval y Renacimiento (Segundo tercio)";
    return "🚀 Era Industrial y Contemporánea (Tercer tercio)";
  };

  return (
    <div className="relative w-full max-w-md mx-auto rounded-3xl p-4 bg-gradient-to-br from-[#12102e] via-[#0d1633] to-[#1a1236] border-2 border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.28)] ring-1 ring-amber-400/40 select-none overflow-hidden">
      {/* Halo de energía temporal activo */}
      <div className="absolute top-0 right-1/4 w-40 h-20 bg-amber-400/15 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/15 rounded-full blur-xl pointer-events-none" />

      {/* Remaches de carta de juego */}
      <div className="absolute top-2 left-2 w-2 h-2 rounded-full border border-amber-400/40 bg-amber-400/20 pointer-events-none" />
      <div className="absolute top-2 right-2 w-2 h-2 rounded-full border border-amber-400/40 bg-amber-400/20 pointer-events-none" />
      <div className="absolute bottom-2 left-2 w-2 h-2 rounded-full border border-amber-400/40 bg-amber-400/20 pointer-events-none" />
      <div className="absolute bottom-2 right-2 w-2 h-2 rounded-full border border-amber-400/40 bg-amber-400/20 pointer-events-none" />

      {/* Cabecera: Tu Carta Activa + Insignia de Año Incógnita */}
      <div className="flex items-center justify-between gap-2 mb-2.5 relative z-10">
        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-yellow-500/15 border border-amber-400/50 text-amber-300 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>Tu Carta Activa</span>
        </div>

        <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-amber-500/20 border-2 border-amber-400/70 text-amber-300 px-3.5 py-1 rounded-2xl text-xs font-black shadow-[0_0_15px_rgba(245,158,11,0.25)]">
          <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>¿Año Secreto?</span>
        </div>
      </div>

      {/* Ilustración / Imagen de la Carta si existe */}
      {event.image && (
        <div className="w-full h-32 rounded-2xl overflow-hidden mb-2.5 relative border border-amber-400/30 shadow-md">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}

      {/* Título de la carta con icono temático */}
      <div className="flex items-start gap-2 relative z-10">
        <span className="text-xl shrink-0 mt-0.5">{categoryIcon}</span>
        <h2 className="text-white font-extrabold text-base sm:text-lg leading-snug tracking-tight">
          {event.title}
        </h2>
      </div>

      {/* Pista revelada con Lupa del Siglo */}
      {lupaActive && (
        <div className="mt-2.5 p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/30 to-yellow-500/20 border-2 border-amber-400/80 flex items-center gap-2.5 text-xs text-amber-100 font-extrabold shadow-md relative z-10">
          <Search className="w-4 h-4 text-amber-300 shrink-0" />
          <span>
            🔍 Pista Revelada: <strong className="text-amber-200">{centuryText} ({era.nombre})</strong>
          </span>
        </div>
      )}

      {/* Pista revelada con Ancla Temporal */}
      {anclaActive && (
        <div className="mt-2 p-2.5 rounded-2xl bg-teal-500/25 border-2 border-teal-400/80 flex items-center gap-2.5 text-xs text-teal-100 font-extrabold shadow-md relative z-10">
          <span className="text-base shrink-0">⚓</span>
          <span>
            Ancla Fijada: <strong className="text-teal-200">{getAnclaHint(event.year)}</strong>
          </span>
        </div>
      )}

      {/* Descripción histórica */}
      {event.description && !lupaActive && (
        <p className="text-xs text-amber-50/90 mt-2.5 leading-relaxed font-normal relative z-10 bg-black/35 p-2.5 rounded-2xl border border-amber-400/25">
          {event.description}
        </p>
      )}

      {/* Figura Clave */}
      {event.personajeClave && !lupaActive && (
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-300/80 font-medium relative z-10">
          <User className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Figura histórica:</span>
          <span className="text-white font-bold">{event.personajeClave}</span>
        </div>
      )}

      {/* Pie de carta: Llamado a la acción y progreso */}
      <div className="mt-3 pt-2.5 border-t border-amber-500/25 flex items-center justify-between text-[11px] text-amber-200/90 font-bold relative z-10">
        <span className="flex items-center gap-1.5 text-amber-300">
          <ArrowDown className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
          <span>
            Toca una ranura <strong>[+]</strong> en la línea
          </span>
        </span>
        <span className="text-amber-300 font-black bg-black/50 px-2.5 py-0.5 rounded-full border border-amber-400/40 shadow-inner">
          {cardsPlaced} / {targetGoal}
        </span>
      </div>
    </div>
  );
}

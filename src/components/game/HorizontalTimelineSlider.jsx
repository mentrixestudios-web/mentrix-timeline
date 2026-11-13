import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Search, 
  HelpCircle, 
  Hourglass, 
  Check, 
  AlertCircle 
} from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

/**
 * HorizontalTimelineSlider: Vista Deslizador / Carrusel Horizontal estilo Hitster / Timeline
 * - Línea de tiempo horizontal continua con cartas colocadas en orden cronológico.
 * - La carta activa se ubica visualmente en el espacio seleccionado, resaltada con borde naranja resplandeciente.
 * - Muestra la cápsula con el rango temporal estimado (ej. "1976 – 1984").
 * - Botón central [ ENVIAR ] flanqueado por flechas [ ← ] y [ → ] para desplazar la posición de inserción con un dedo.
 * - Soporte para navegación con teclado (flechas izquierda/derecha y Enter).
 * - Indicador superior de progreso con puntos de colores (verde para aciertos, rojo/naranja para fallos).
 */
export default function HorizontalTimelineSlider({
  timeline = [],
  currentCard,
  targetGoal = 10,
  score = 0,
  lives = 3,
  maxLives = 3,
  categoryInfo,
  onInsert,
  disabled = false,
  frozenSlots = [],
  lupaActive = false,
  anclaActive = false,
  hardcoreMode = false,
  justPlacedId = null,
}) {
  // Índice del slot seleccionado (0 a timeline.length)
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(() => {
    return Math.floor(timeline.length / 2);
  });

  const scrollContainerRef = useRef(null);
  const activeCardRef = useRef(null);

  // Cuando cambia la carta activa o la longitud de la línea de tiempo, asegurar índice válido
  useEffect(() => {
    setSelectedSlotIndex((prev) => {
      if (prev > timeline.length) return timeline.length;
      if (prev < 0) return 0;
      return prev;
    });
  }, [timeline.length, currentCard?.id]);

  // Centrar suavemente la carta activa al cambiar de posición
  useEffect(() => {
    if (activeCardRef.current && scrollContainerRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedSlotIndex]);

  // Navegación por teclado (Flecha Izquierda, Flecha Derecha, Enter)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (disabled) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedSlotIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedSlotIndex((prev) => Math.min(timeline.length, prev + 1));
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (currentCard && !disabled) {
          onInsert(selectedSlotIndex);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [timeline.length, currentCard, disabled, selectedSlotIndex, onInsert]);

  const moveLeft = () => {
    if (selectedSlotIndex > 0 && !disabled) {
      setSelectedSlotIndex((prev) => prev - 1);
    }
  };

  const moveRight = () => {
    if (selectedSlotIndex < timeline.length && !disabled) {
      setSelectedSlotIndex((prev) => prev + 1);
    }
  };

  const handleSend = () => {
    if (disabled || !currentCard) return;
    onInsert(selectedSlotIndex);
  };

  // Cálculo del texto del rango temporal dinámico para la carta activa
  const getIntervalLabel = (slotIdx) => {
    if (timeline.length === 0) return "Cualquier año inicial";
    if (slotIdx === 0) {
      return `Antes de ${timeline[0]?.yearFormatted || "???"}`;
    }
    if (slotIdx === timeline.length) {
      return `Después de ${timeline[timeline.length - 1]?.yearFormatted || "???"}`;
    }
    const prevYear = timeline[slotIdx - 1]?.yearFormatted || "???";
    const nextYear = timeline[slotIdx]?.yearFormatted || "???";
    return `${prevYear} – ${nextYear}`;
  };

  // Cálculo de dots de progreso superiores (verde para acertados, naranja para vidas perdidas, gris para pendientes)
  const progressDots = Array.from({ length: targetGoal }).map((_, idx) => {
    if (idx < score) return "correct";
    const lostLives = maxLives - lives;
    if (idx >= score && idx < score + lostLives) return "lost";
    return "pending";
  });

  const isSlotFrozen = frozenSlots.includes(selectedSlotIndex);

  return (
    <div className="w-full flex flex-col justify-between select-none py-2 space-y-3">
      {/* ══════════════════════════════════════════════════════════════
          CABECERA SUPERIOR: Nombre del Mazo / Tema y Puntos de Progreso
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between px-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="text-xl shrink-0">
            {CATEGORY_ICONS[categoryInfo?.id] || categoryInfo?.icon || "📜"}
          </span>
          <span className="text-white font-extrabold text-sm sm:text-base tracking-tight truncate max-w-[200px]">
            {categoryInfo?.name || "Línea de Tiempo"}
          </span>
        </div>

        {/* Puntos de progreso estilo la imagen */}
        <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10 shadow-inner">
          {progressDots.map((type, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                type === "correct"
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] scale-110"
                  : type === "lost"
                  ? "bg-orange-500 shadow-[0_0_6px_rgba(249,115,22,0.8)]"
                  : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          PISTA HORIZONTAL: EJE TEMPORAL CON CARTAS Y PREVIEW ACTIVA
         ══════════════════════════════════════════════════════════════ */}
      <div className="relative w-full py-4 overflow-hidden">
        {/* Eje de tiempo central luminoso horizontal que atraviesa el carrusel */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500/30 via-amber-400/70 to-purple-500/30 shadow-[0_0_12px_rgba(245,158,11,0.4)] pointer-events-none z-0" />

        {/* Contenedor con scroll horizontal suave */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto px-6 sm:px-12 py-6 no-scrollbar relative z-10 scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* Slot Inicial 0 (si no está seleccionado, botón discreto para saltar a él) */}
          {selectedSlotIndex !== 0 && (
            <button
              type="button"
              onClick={() => setSelectedSlotIndex(0)}
              className="shrink-0 w-8 h-28 sm:h-36 rounded-2xl border border-dashed border-white/20 hover:border-amber-400/60 bg-white/5 hover:bg-amber-400/10 flex flex-col items-center justify-center text-white/40 hover:text-amber-300 transition-all cursor-pointer group"
              title="Colocar al principio de la historia"
            >
              <span className="text-xs group-hover:scale-125 transition-transform">+</span>
            </button>
          )}

          {/* Si el slot 0 está seleccionado, renderizar aquí la Carta Activa Preview */}
          {selectedSlotIndex === 0 && currentCard && (
            <div ref={activeCardRef} className="shrink-0" style={{ scrollSnapAlign: "center" }}>
              <ActiveCardPreview
                event={currentCard}
                intervalText={getIntervalLabel(0)}
                lupaActive={lupaActive}
                anclaActive={anclaActive}
                isFrozen={isSlotFrozen}
              />
            </div>
          )}

          {/* Renderizado de cartas colocadas y slots intermedios / finales */}
          {timeline.map((event, idx) => {
            const slotAfter = idx + 1;
            const isSelectedHere = selectedSlotIndex === slotAfter;

            return (
              <React.Fragment key={event.id}>
                {/* Carta Colocada */}
                <div className="shrink-0" style={{ scrollSnapAlign: "center" }}>
                  <PlacedTimelineCard
                    event={event}
                    status={justPlacedId === event.id ? "justPlaced" : "default"}
                    hardcoreMode={hardcoreMode}
                  />
                </div>

                {/* Si este slot intermedio / final está seleccionado, renderizar la Carta Activa Preview */}
                {isSelectedHere && currentCard && (
                  <div ref={activeCardRef} className="shrink-0" style={{ scrollSnapAlign: "center" }}>
                    <ActiveCardPreview
                      event={currentCard}
                      intervalText={getIntervalLabel(slotAfter)}
                      lupaActive={lupaActive}
                      anclaActive={anclaActive}
                      isFrozen={isSlotFrozen}
                    />
                  </div>
                )}

                {/* Si no está seleccionado y no es el último, o es el último y no está seleccionado, mostrar dropzone discreto */}
                {!isSelectedHere && (
                  <button
                    type="button"
                    onClick={() => setSelectedSlotIndex(slotAfter)}
                    className="shrink-0 w-8 h-28 sm:h-36 rounded-2xl border border-dashed border-white/20 hover:border-amber-400/60 bg-white/5 hover:bg-amber-400/10 flex flex-col items-center justify-center text-white/40 hover:text-amber-300 transition-all cursor-pointer group"
                    title={`Colocar después de ${event.title}`}
                  >
                    <span className="text-xs group-hover:scale-125 transition-transform">+</span>
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          CONTROLES INFERIORES: [ ← ]  [   ENVIAR   ]  [ → ]
         ══════════════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-center gap-3 sm:gap-4 pt-1 pb-2">
        {/* Flecha Izquierda */}
        <button
          type="button"
          onClick={moveLeft}
          disabled={selectedSlotIndex <= 0 || disabled}
          aria-label="Mover a la izquierda"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed border border-purple-400/40 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>

        {/* Botón Central Grande: [ ENVIAR ] */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !currentCard || isSlotFrozen}
          className="flex-1 max-w-xs py-3.5 sm:py-4 px-6 rounded-full bg-gradient-to-r from-orange-500 via-rose-500 to-orange-600 hover:from-orange-400 hover:via-rose-400 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base uppercase tracking-widest shadow-xl shadow-orange-500/35 border-2 border-orange-300/60 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>ENVIAR</span>
          <Send className="w-4 h-4 ml-0.5" />
        </button>

        {/* Flecha Derecha */}
        <button
          type="button"
          onClick={moveRight}
          disabled={selectedSlotIndex >= timeline.length || disabled}
          aria-label="Mover a la derecha"
          className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed border border-purple-400/40 text-white flex items-center justify-center shadow-lg shadow-purple-900/40 active:scale-90 transition-all cursor-pointer"
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
        </button>
      </div>

      {/* Indicador de ayuda sutil para teclado */}
      <div className="text-center text-[11px] text-white/40 hidden sm:block">
        💡 Usa las teclas <strong className="text-white/60">←</strong> y <strong className="text-white/60">→</strong> para mover la carta y <strong className="text-white/60">Enter</strong> para enviar
      </div>
    </div>
  );
}

/**
 * PlacedTimelineCard: Carta ya ubicada en el tablero horizontal
 */
function PlacedTimelineCard({ event, status = "default", hardcoreMode = false }) {
  if (!event) return null;

  const era = getEraByYear(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";
  const isJustPlaced = status === "justPlaced";
  const showYear = !hardcoreMode || isJustPlaced;

  return (
    <motion.div
      layout
      initial={isJustPlaced ? { scale: 0.85, opacity: 0 } : false}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-40 sm:w-48 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 bg-[#181b30] border-2 transition-all duration-300 flex flex-col justify-between shadow-xl ${
        isJustPlaced
          ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/60"
          : "border-white/10 hover:border-white/20"
      }`}
      style={{ height: "230px" }}
    >
      {/* 1. Medallón / Badge de Mazo en la esquina superior izquierda */}
      <div className="absolute top-2 left-2 z-10 w-7 h-7 rounded-xl bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-sm shadow-md" title={event.category}>
        {categoryIcon}
      </div>

      {/* 2. Ilustración / Imagen de la Carta */}
      <div className="w-full h-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 flex items-center justify-center">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br ${era.cardBg}`}>
            <span className="text-3xl sm:text-4xl filter drop-shadow-md">{categoryIcon}</span>
            <span className="text-[9px] uppercase tracking-wider text-white/50 mt-1 font-bold">
              {era.badgeLabel}
            </span>
          </div>
        )}
      </div>

      {/* 3. Cápsula / Pill del Año */}
      <div className="my-1.5 flex justify-center">
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-md border ${
          isJustPlaced
            ? "bg-emerald-500 text-slate-950 border-emerald-300"
            : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
        }`}>
          {showYear ? event.yearFormatted : "??? d.C."}
        </div>
      </div>

      {/* 4. Título y Subtítulo */}
      <div className="text-center px-1">
        <h4 className="text-white font-extrabold text-xs sm:text-sm leading-tight line-clamp-2">
          {event.title}
        </h4>
        <span className="text-[10px] text-white/50 block truncate mt-0.5">
          {event.personajeClave ? event.personajeClave : era.nombre}
        </span>
      </div>
    </motion.div>
  );
}

/**
 * ActiveCardPreview: Carta activa a colocar en el carrusel (resaltada con borde naranja resplandeciente)
 */
function ActiveCardPreview({
  event,
  intervalText = "",
  lupaActive = false,
  anclaActive = false,
  isFrozen = false,
}) {
  if (!event) return null;

  const era = getEraByYear(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";

  return (
    <motion.div
      layout
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1.05, opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`relative w-44 sm:w-52 rounded-2xl sm:rounded-3xl p-3 bg-gradient-to-b from-[#241c38] to-[#15172d] border-2 border-orange-500 ring-4 ring-orange-500/30 shadow-[0_0_35px_rgba(249,115,22,0.45)] flex flex-col justify-between z-20 ${
        isFrozen ? "opacity-60 grayscale" : ""
      }`}
      style={{ height: "255px" }}
    >
      {/* Medallón de Mazo */}
      <div className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-xl bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 flex items-center justify-center text-sm shadow-md" title={event.category}>
        {categoryIcon}
      </div>

      {/* Badge "Tu Carta Activa" */}
      <div className="absolute top-2.5 right-2.5 z-10 px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1">
        <Sparkles className="w-2.5 h-2.5" />
        <span>ACTIVA</span>
      </div>

      {/* Ilustración / Imagen de la Carta */}
      <div className="w-full h-24 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-indigo-950 border border-orange-400/40 flex items-center justify-center">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center bg-gradient-to-br from-amber-500/10 via-purple-500/10 to-indigo-900/30">
            <span className="text-4xl filter drop-shadow-md">{categoryIcon}</span>
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mt-1">
              ¿Año Secreto?
            </span>
          </div>
        )}
      </div>

      {/* Cápsula / Pill Dinámica del Rango Temporal Estimado (Estilo Imagen del usuario) */}
      <div className="my-1.5 flex justify-center">
        <div className="px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-orange-300/60 truncate max-w-full">
          {intervalText}
        </div>
      </div>

      {/* Título de la Carta */}
      <div className="text-center px-1">
        <h4 className="text-white font-black text-xs sm:text-sm leading-tight line-clamp-2">
          {event.title}
        </h4>
        <span className="text-[10px] text-amber-300/80 font-semibold block truncate mt-0.5">
          {event.personajeClave ? event.personajeClave : event.category}
        </span>
      </div>

      {/* Pistas especiales activas si aplicaron poderes */}
      {lupaActive && (
        <div className="mt-1 px-1.5 py-0.5 rounded-lg bg-amber-400/20 border border-amber-400/50 text-[10px] text-amber-200 font-bold text-center truncate">
          🔍 Siglo: {getCenturyLabel(event.year)}
        </div>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Search, 
  HelpCircle, 
  Hourglass, 
  Check, 
  AlertCircle,
  Info,
  X,
  User,
  Lightbulb
} from "lucide-react";
import { getEraByYear, getCenturyLabel, CATEGORY_ICONS } from "@/data/erasConfig";

/**
 * HorizontalTimelineSlider: Vista Deslizador / Carrusel Horizontal estilo Mentrix Crononauta
 * - Línea de tiempo horizontal continua con cartas colocadas en orden cronológico.
 * - Carta activa resaltada con borde naranja resplandeciente y rango dinámico conciso.
 * - Botón original [ FIJAR ÉPOCA ⚡ ] flanqueado por flechas [ ← ] y [ → ].
 * - Inspección completa de información: al presionar cualquier carta o su icono (i),
 *   se abre una ficha histórica detallada con su contexto, descripción completa, figura clave y dato curioso.
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
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(() => {
    return Math.floor(timeline.length / 2);
  });

  // Estado para la ficha de inspección detallada de una carta
  const [inspectedCard, setInspectedCard] = useState(null);

  const scrollContainerRef = useRef(null);
  const activeCardRef = useRef(null);

  // Asegurar índice válido
  useEffect(() => {
    setSelectedSlotIndex((prev) => {
      if (prev > timeline.length) return timeline.length;
      if (prev < 0) return 0;
      return prev;
    });
  }, [timeline.length, currentCard?.id]);

  // Centrar la carta activa en el scroll
  useEffect(() => {
    if (activeCardRef.current && scrollContainerRef.current) {
      activeCardRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }, [selectedSlotIndex]);

  // Navegación por teclado
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

  // Formato conciso del rango para que nunca se trunque con "..." en pantallas móviles
  const getIntervalLabel = (slotIdx) => {
    if (timeline.length === 0) return "Cualquier época";
    if (slotIdx === 0) {
      return `Antes de ${timeline[0]?.yearFormatted || "???"}`;
    }
    if (slotIdx === timeline.length) {
      return `Después de ${timeline[timeline.length - 1]?.yearFormatted || "???"}`;
    }
    const prev = timeline[slotIdx - 1];
    const next = timeline[slotIdx];
    const prevClean = String(prev?.yearFormatted || "").replace(/\s*(d\.C\.|a\.C\.)/i, "");
    const nextClean = String(next?.yearFormatted || "");
    return `${prevClean} – ${nextClean}`;
  };

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

        {/* Puntos de progreso */}
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
        {/* Eje de tiempo central continuo */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-blue-500/30 via-amber-400/70 to-purple-500/30 shadow-[0_0_12px_rgba(245,158,11,0.4)] pointer-events-none z-0" />

        {/* Contenedor horizontal con scroll */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-3 sm:gap-4 overflow-x-auto px-6 sm:px-12 py-6 no-scrollbar relative z-10 scroll-smooth"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {/* Slot Inicial 0 (si no está seleccionado) */}
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

          {/* Carta Activa en Slot 0 */}
          {selectedSlotIndex === 0 && currentCard && (
            <div ref={activeCardRef} className="shrink-0" style={{ scrollSnapAlign: "center" }}>
              <ActiveCardPreview
                event={currentCard}
                intervalText={getIntervalLabel(0)}
                lupaActive={lupaActive}
                anclaActive={anclaActive}
                isFrozen={isSlotFrozen}
                onInspect={() => setInspectedCard({ ...currentCard, isPlaced: false })}
              />
            </div>
          )}

          {/* Cartas colocadas en orden */}
          {timeline.map((event, idx) => {
            const slotAfter = idx + 1;
            const isSelectedHere = selectedSlotIndex === slotAfter;

            return (
              <React.Fragment key={event.id}>
                {/* Carta Colocada (Click para inspeccionar) */}
                <div className="shrink-0" style={{ scrollSnapAlign: "center" }}>
                  <PlacedTimelineCard
                    event={event}
                    status={justPlacedId === event.id ? "justPlaced" : "default"}
                    hardcoreMode={hardcoreMode}
                    onInspect={() => setInspectedCard({ ...event, isPlaced: true })}
                  />
                </div>

                {/* Carta Activa en Slot Intermedio / Final */}
                {isSelectedHere && currentCard && (
                  <div ref={activeCardRef} className="shrink-0" style={{ scrollSnapAlign: "center" }}>
                    <ActiveCardPreview
                      event={currentCard}
                      intervalText={getIntervalLabel(slotAfter)}
                      lupaActive={lupaActive}
                      anclaActive={anclaActive}
                      isFrozen={isSlotFrozen}
                      onInspect={() => setInspectedCard({ ...currentCard, isPlaced: false })}
                    />
                  </div>
                )}

                {/* Dropzone para saltar directamente */}
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
          CONTROLES INFERIORES ORIGINALES: [ ← ]  [ FIJAR ÉPOCA ⚡ ]  [ → ]
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

        {/* Botón Central Original Mentrix: [ FIJAR ÉPOCA ⚡ ] */}
        <button
          type="button"
          onClick={handleSend}
          disabled={disabled || !currentCard || isSlotFrozen}
          className="flex-1 max-w-xs py-3.5 sm:py-4 px-5 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:via-orange-400 hover:to-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-sm sm:text-base uppercase tracking-wider shadow-xl shadow-orange-500/35 border-2 border-amber-300/70 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-200" />
          <span>FIJAR ÉPOCA</span>
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

      <div className="text-center text-[11px] text-white/50">
        💡 Toca cualquier carta para <strong className="text-amber-300">desplegar su historia completa y datos curiosos</strong>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MODAL DE INFORMACIÓN COMPLETA (FICHA HISTÓRICA DEL HITO)
         ══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {inspectedCard && (
          <CardDetailModal
            event={inspectedCard}
            onClose={() => setInspectedCard(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * PlacedTimelineCard: Carta colocada en el tablero horizontal con botón de información
 */
function PlacedTimelineCard({ event, status = "default", hardcoreMode = false, onInspect }) {
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
      onClick={onInspect}
      className={`relative w-40 sm:w-48 rounded-2xl sm:rounded-3xl p-2.5 sm:p-3 bg-[#181b30] border-2 transition-all duration-300 flex flex-col justify-between shadow-xl cursor-pointer hover:border-amber-400/50 active:scale-[0.98] ${
        isJustPlaced
          ? "border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)] ring-2 ring-emerald-400/60"
          : "border-white/10"
      }`}
      style={{ height: "235px" }}
    >
      {/* 1. Medallón / Badge de Mazo en la esquina superior izquierda */}
      <div 
        className="absolute top-2 left-2 z-10 w-7 h-7 rounded-xl bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-sm shadow-md"
        title={`Mazo: ${event.category}`}
      >
        {categoryIcon}
      </div>

      {/* 2. Botón de Información para desplegar detalles */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (onInspect) onInspect();
        }}
        className="absolute top-2 right-2 z-10 w-6 h-6 rounded-lg bg-black/60 hover:bg-amber-500/25 border border-white/20 text-white/70 hover:text-amber-300 flex items-center justify-center transition-colors shadow-sm"
        title="Ver detalles e historia completa"
      >
        <Info className="w-3.5 h-3.5" />
      </button>

      {/* 3. Ilustración / Imagen de la Carta */}
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

      {/* 4. Cápsula / Pill del Año */}
      <div className="my-1.5 flex justify-center">
        <div className={`px-2.5 py-0.5 rounded-full text-xs font-black shadow-md border ${
          isJustPlaced
            ? "bg-emerald-500 text-slate-950 border-emerald-300"
            : "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
        }`}>
          {showYear ? event.yearFormatted : "??? d.C."}
        </div>
      </div>

      {/* 5. Título y Subtítulo */}
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
  onInspect,
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
      onClick={onInspect}
      className={`relative w-44 sm:w-52 rounded-2xl sm:rounded-3xl p-3 bg-gradient-to-b from-[#241c38] to-[#15172d] border-2 border-orange-500 ring-4 ring-orange-500/30 shadow-[0_0_35px_rgba(249,115,22,0.45)] flex flex-col justify-between z-20 cursor-pointer hover:ring-orange-400/60 active:scale-[1.02] ${
        isFrozen ? "opacity-60 grayscale" : ""
      }`}
      style={{ height: "260px" }}
    >
      {/* Medallón de Mazo */}
      <div 
        className="absolute top-2.5 left-2.5 z-10 w-7 h-7 rounded-xl bg-orange-500/30 backdrop-blur-sm border border-orange-400/50 flex items-center justify-center text-sm shadow-md"
        title={`Mazo: ${event.category}`}
      >
        {categoryIcon}
      </div>

      {/* Badge "ACTIVA" + Botón de Info */}
      <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (onInspect) onInspect();
          }}
          className="w-5 h-5 rounded-md bg-black/60 hover:bg-orange-500/30 border border-orange-400/40 text-orange-200 flex items-center justify-center shadow-sm"
          title="Ver detalles y contexto histórico"
        >
          <Info className="w-3 h-3" />
        </button>

        <span className="px-2 py-0.5 rounded-full bg-orange-500 text-white font-black text-[9px] uppercase tracking-wider shadow-sm flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5" />
          <span>ACTIVA</span>
        </span>
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

      {/* Cápsula Dinámica del Rango Temporal Estimado */}
      <div className="my-1.5 flex justify-center">
        <div className="px-3 py-1 rounded-full text-[11px] sm:text-xs font-black bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md shadow-orange-500/25 border border-orange-300/60 truncate max-w-full">
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

/**
 * CardDetailModal: Ficha histórica completa que se despliega al tocar cualquier carta
 */
function CardDetailModal({ event, onClose }) {
  if (!event) return null;

  const era = getEraByYear(event.year);
  const centuryText = getCenturyLabel(event.year);
  const categoryIcon = CATEGORY_ICONS[event.category] || "📜";
  const isPlaced = event.isPlaced;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl p-5 sm:p-6 border-2 bg-gradient-to-br ${era.cardBg} ${era.borderDefault} shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto`}
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-colors shadow-md"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera: Era, Mazo y Año */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-black/50 border border-white/20 flex items-center justify-center text-xl shadow-md">
            {categoryIcon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-300 text-xs font-black uppercase tracking-wider">
                {era.badgeLabel}
              </span>
              <span className="text-white/40 text-xs">·</span>
              <span className="text-white/60 text-xs">{centuryText}</span>
            </div>
            <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">
              {era.sealText}
            </p>
          </div>
        </div>

        {/* Medallón de Año o ¿Año Secreto? */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-black/40 border border-white/10 shadow-inner">
          <span className="text-xs text-white/70 font-semibold">Coordenada Temporal:</span>
          {isPlaced ? (
            <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-black text-sm shadow-md">
              {event.yearFormatted}
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-orange-500/25 border border-orange-400/60 text-orange-200 font-black text-xs flex items-center gap-1.5 shadow-sm">
              <HelpCircle className="w-3.5 h-3.5 text-orange-300" />
              <span>¿Año Secreto? (Usa tus pistas)</span>
            </span>
          )}
        </div>

        {/* Título Principal */}
        <h3 className="text-white font-black text-lg sm:text-xl leading-snug">
          {event.title}
        </h3>

        {/* Descripción Histórica Completa */}
        {event.description && (
          <div className="p-3.5 rounded-2xl bg-black/35 border border-white/10 text-slate-200 text-xs sm:text-sm leading-relaxed">
            <p>{event.description}</p>
          </div>
        )}

        {/* Dato Curioso Destacado */}
        {event.datoCurioso && (
          <div className={`p-3.5 rounded-2xl border flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed shadow-sm ${era.curioBg}`}>
            <Lightbulb className="w-5 h-5 text-amber-300 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold block mb-0.5">¿Sabías que...?</strong>
              <p className="text-amber-100/90">{event.datoCurioso}</p>
            </div>
          </div>
        )}

        {/* Figura Clave / Personaje */}
        {event.personajeClave && (
          <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/5 border border-white/10 text-xs">
            <User className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-white/60">Figura histórica clave:</span>
            <span className="text-amber-200 font-bold">{event.personajeClave}</span>
          </div>
        )}

        {/* Botón de cierre o acción */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            Entendido
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

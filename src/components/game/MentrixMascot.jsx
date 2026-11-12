import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass, Sparkles, Compass, Zap, Flame, ShieldAlert, Award, MessageCircle } from "lucide-react";

/**
 * Personalidad de Menti: El Crononauta / Sabio Viajero del Tiempo ⏳
 * A diferencia del Menti bíblico (pastoral/espiritual), el Menti de Línea de Tiempo
 * es un explorador audaz de eras, amante de las paradojas, la ciencia, los hitos
 * de la humanidad y los giros históricos. Es motivador, perspicaz y guía al jugador
 * con pistas cronológicas y frases épicas.
 */
export const CRONONAUTA_MESSAGES = {
  idle: [
    "¡Ajustando coordenadas temporales! ¿En qué era encaja esta carta? ⏳",
    "El tiempo es un río continuo... no dejes que una paradoja te arrastre. 🌊",
    "¿Antes o después? Confía en tu intuición histórica, crononauta. 🧭",
    "Un milenio puede parecer lejano, pero los hechos están conectados. ✨",
    "¡Mírale la tecnología o el contexto al evento! Ahí está la clave temporal. 🔍",
    "¿Antigüedad, Medioevo o Era Moderna? Siembra el hito en su lugar. 🏛️",
    "El efecto mariposa está en tus manos. ¡Vamos por esa racha! 🦋",
    "¡Estoy calibrando el vórtice temporal contigo! Tómate un segundo para pensar. ⚙️",
  ],
  correct: [
    "¡Impecable! Las líneas temporales se alinean a la perfección. 🎯✨",
    "¡Exacto en el siglo! Tu brújula cronológica no falla. 🔥",
    "¡Boom! Esa época encaja como un engranaje suizo en la historia. ⚙️",
    "¡Extraordinario viaje! Avanzas a través de los siglos sin titubear. 🏆",
    "¡Sigue así, maestro del tiempo! La historia te da la razón. 👏",
  ],
  wrong: [
    "¡Paradoja temporal leve! Te adelantaste o atrasaste unos siglos. 😬",
    "¡Cuidado con la grieta temporal! Perdimos un corazón, pero recalibramos ya. 💔",
    "No pasa nada, crononauta: hasta los grandes historiadores recalculan. 🔄",
    "Ese suceso ocurrió en otra era. ¡Respira y fíjate en los siglos vecinos! ⏳",
  ],
  streak: [
    "¡En llamas temporales! Llevas una racha digna de un guardián del tiempo. 🔥🚀",
    "¡Tu memoria histórica está sincronizada con el Big Bang! ⚡",
    "¡Nadie detiene a este crononauta! ¡Sigamos sumando hitos! ⭐",
  ],
  victory: [
    "¡HAS CONQUISTADO EL TIEMPO! Ordenaste la historia sin quebrar el continuo. 👑⏳",
    "¡Hazaña legendaria! Las eras del mundo te reconocen como su guardián. 🏆✨",
  ],
  gameover: [
    "¡Paradoja temporal total! Las coordenadas colapsaron... pero el tiempo da revancha. 🔄",
    "Un salto en el tiempo fallido es solo experiencia para el próximo viaje. ¡Vamos de nuevo! 💪",
  ],
  // Consejos específicos por modo
  duelo: [
    "En este duelo temporal, cada siglo cuenta. ¡Demuestra quién manda en la historia! ⚔️",
    "Analizo mis propios archivos cronológicos... pero tú tienes gran intuición. 😏",
  ],
  diario: [
    "El desafío del día exige precisión absoluta. ¡Haz que este día sea memorable! 📅",
  ],
  contrarreloj: [
    "¡El vórtice se cierra rápido! Decide con rapidez pero con cabeza fría. ⚡⏳",
  ],
};

export default function MentrixMascot({
  status = "idle",
  customMessage = null,
  size = "md", // 'sm' | 'md' | 'lg' | 'mini'
  layout = "default", // 'default' (estático/tarjeta) | 'floating' (flotante interactivo estilo EB) | 'compact'
  modo = "clasico",
  streak = 0,
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const [bubbleOpen, setBubbleOpen] = useState(true);

  // Determinar el pool de frases según estado y modo
  let activePool = CRONONAUTA_MESSAGES[status] || CRONONAUTA_MESSAGES.idle;
  if (streak >= 3 && status === "correct") {
    activePool = CRONONAUTA_MESSAGES.streak;
  } else if (modo === "duelo" && status === "idle") {
    activePool = CRONONAUTA_MESSAGES.duelo;
  } else if (modo === "contrarreloj" && status === "idle") {
    activePool = CRONONAUTA_MESSAGES.contrarreloj;
  } else if (modo === "diario" && status === "idle") {
    activePool = CRONONAUTA_MESSAGES.diario;
  }

  // Cambio automático y suave de frases cada 6 segundos si está quieto
  useEffect(() => {
    if (customMessage) return;
    const timer = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % activePool.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [customMessage, activePool]);

  // Al cambiar de estado (p.ej acierto o error), resetear y abrir la burbuja
  useEffect(() => {
    setMsgIndex(0);
    setBubbleOpen(true);
  }, [status, customMessage]);

  const currentMessage = customMessage || activePool[msgIndex % activePool.length];

  const handleMascotTap = () => {
    setBouncing(true);
    setMsgIndex((prev) => (prev + 1) % activePool.length);
    setBubbleOpen(true);
    setTimeout(() => setBouncing(false), 300);
  };

  // ═════════════════════════════════════════════════════════════
  // 1. LAYOUT FLOTANTE (ESTILO ESTUDIO BÍBLICO MEJORADO)
  // Flota en la esquina inferior derecha o en el lateral durante el juego
  // No obstaculiza los clics del tablero (pointer-events-none en el contenedor)
  // ═════════════════════════════════════════════════════════════
  if (layout === "floating") {
    return (
      <div className="fixed bottom-20 right-3 z-40 flex flex-col items-end gap-2 pointer-events-none select-none">
        {/* Burbuja de diálogo de Menti Crononauta */}
        <AnimatePresence>
          {bubbleOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              transition={{ duration: 0.25 }}
              onClick={() => setBubbleOpen(false)}
              className="pointer-events-auto max-w-[210px] sm:max-w-xs cursor-pointer bg-gradient-to-br from-[#120a2e]/95 via-[#0d153a]/95 to-[#070b1a]/95 border border-amber-400/40 rounded-2xl p-2.5 sm:p-3 shadow-xl shadow-amber-500/10 backdrop-blur-md"
            >
              <div className="flex items-center justify-between gap-1.5 mb-1 pb-1 border-b border-amber-400/20">
                <div className="flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: "6s" }} />
                  <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                    Menti Crononauta
                  </span>
                </div>
                <span className="text-[9px] text-amber-300/60 font-semibold">Toca para cambiar</span>
              </div>
              <p className="text-xs text-amber-100 font-medium leading-snug">
                {currentMessage}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mascota Flotante con halo cronológico */}
        <div className="relative pointer-events-auto flex items-center justify-center">
          {/* Anillo de energía temporal giratorio */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="absolute -inset-1.5 rounded-full border border-dashed border-amber-400/40 pointer-events-none"
          />
          <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full pointer-events-none" />

          <motion.div
            animate={{
              y: bouncing ? [0, -8, 0] : [0, -6, 0],
              scale: bouncing ? 0.95 : 1,
            }}
            transition={{
              y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
              scale: { duration: 0.2 },
            }}
            onClick={handleMascotTap}
            className="relative w-16 h-16 sm:w-20 sm:h-20 cursor-pointer active:scale-95 transition-transform drop-shadow-[0_4px_16px_rgba(245,158,11,0.4)]"
          >
            <img
              src="/mascota-menti-tiempo.png"
              alt="Menti Viajero del Tiempo"
              width="80"
              height="80"
              decoding="async"
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                // Fallback automático al webp original si faltara el png
                e.currentTarget.src = "/mentrix-mascot.webp";
              }}
            />

            {/* Badge de status si hay acierto o error */}
            {status === "correct" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg border border-white">
                ✓
              </span>
            )}
            {status === "wrong" && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center shadow-lg border border-white">
                ✕
              </span>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // 2. LAYOUT COMPACTO (PARA BARRAS O MODALES)
  // ═════════════════════════════════════════════════════════════
  if (layout === "compact") {
    return (
      <div 
        onClick={handleMascotTap}
        className="flex items-center gap-2.5 bg-gradient-to-r from-blue-950/60 via-purple-950/50 to-amber-950/30 border border-amber-400/30 rounded-2xl p-2.5 max-w-md w-full shadow-md cursor-pointer active:scale-98 transition-all"
      >
        <div className="w-11 h-11 shrink-0 relative flex items-center justify-center drop-shadow-md">
          <img
            src="/mascota-menti-tiempo.png"
            alt="Menti"
            width="44"
            height="44"
            decoding="async"
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => { e.currentTarget.src = "/mentrix-mascot.webp"; }}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-black text-amber-400 uppercase tracking-wider mb-0.5">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>Menti Crononauta</span>
          </div>
          <p className="text-xs text-amber-100/90 font-medium leading-tight truncate">
            {currentMessage}
          </p>
        </div>
      </div>
    );
  }

  // ═════════════════════════════════════════════════════════════
  // 3. LAYOUT DEFAULT (CENTRAL ANIMADO CON ORBE TEMPORAL)
  // ═════════════════════════════════════════════════════════════
  const isSm = size === "sm";
  const sizeRem = isSm ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28";

  return (
    <div className="w-full flex flex-col items-center gap-2 max-w-md mx-auto relative select-none py-1">
      {/* Orbe cósmico de fondo */}
      <div className="relative flex items-center justify-center">
        {/* Anillo orbital temporal giratorio */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className={`absolute ${isSm ? "w-24 h-24" : "w-28 h-28 sm:w-32 sm:h-32"} rounded-full border border-dashed border-amber-400/35 pointer-events-none`}
        />
        <div className={`absolute ${isSm ? "w-20 h-20" : "w-24 h-24 sm:w-28 sm:h-28"} bg-gradient-to-tr from-amber-500/20 via-purple-600/15 to-cyan-500/10 rounded-full blur-sm pointer-events-none`} />

        {/* Mascota con rebote suave */}
        <motion.div
          animate={{
            y: bouncing ? [0, -8, 0] : [0, -6, 0],
            scale: bouncing ? 0.95 : 1,
          }}
          transition={{
            y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" },
            scale: { duration: 0.2 },
          }}
          onClick={handleMascotTap}
          className={`relative z-10 ${sizeRem} flex items-center justify-center cursor-pointer active:scale-95 transition-transform drop-shadow-[0_8px_25px_rgba(245,158,11,0.35)]`}
        >
          <img
            src="/mascota-menti-tiempo.png"
            alt="Menti Viajero del Tiempo"
            width="112"
            height="112"
            decoding="async"
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => { e.currentTarget.src = "/mentrix-mascot.webp"; }}
          />
        </motion.div>
      </div>

      {/* Identificador de Crononauta */}
      <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 via-purple-600/15 to-cyan-500/15 border border-amber-400/35 text-amber-300 text-[10px] sm:text-[11px] font-black uppercase tracking-wider shadow-sm">
        <Hourglass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
        <span>Menti Crononauta</span>
      </div>

      {/* Bocadillo de diálogo dinámico */}
      <motion.div
        key={currentMessage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleMascotTap}
        className="text-center px-4 py-2 rounded-2xl bg-gradient-to-b from-blue-950/60 to-purple-950/60 border border-amber-400/30 text-xs sm:text-sm text-amber-100/90 font-medium max-w-sm shadow-md cursor-pointer hover:border-amber-400/60 active:scale-98 transition-all"
      >
        "{currentMessage}"
      </motion.div>
    </div>
  );
}

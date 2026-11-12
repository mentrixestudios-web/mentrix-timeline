import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hourglass, Sparkles } from "lucide-react";

/**
 * Personalidad de Menti: El Crononauta / Sabio Viajero del Tiempo ⏳
 * Diseño con bordes dorados y estilo cósmico de Línea de Tiempo.
 */
export const CRONONAUTA_MESSAGES = {
  idle: [
    "Ajustando coordenadas temporales... ¿En qué época ocurrió este hito? ⏳",
    "El tiempo es continuo... observa bien los siglos vecinos antes de colocar tu carta. 🧭",
    "¿Antes o después? Confía en tu intuición histórica, crononauta. ✨",
    "Fíjate en la tecnología o vestimenta del evento, ahí está la clave temporal. 🔍",
    "¡Sin prisa! Cada carta colocada en su era correcta fortalece tu racha. 🏛️",
    "El efecto mariposa está en tus manos. ¡Vamos por esa línea perfecta! 🦋",
    "Calibrando el vórtice temporal... ¡Tú tienes la respuesta exacta! ⚙️",
  ],
  correct: [
    "¡Exacto en el siglo! Tu brújula cronológica está calibrada a la perfección. 🎯✨",
    "¡Boom! Esa época encaja sin quebrar el continuo temporal. 🔥",
    "¡Extraordinaria jugada! La historia sigue su curso correcto. 👏",
  ],
  wrong: [
    "¡Paradoja temporal! Te adelantaste o atrasaste en los siglos. ¡Recalibramos ya! 💔",
    "No te preocupes, crononauta: ¡la próxima época es tuya! 🔄",
  ],
  streak: [
    "¡En llamas temporales! Llevas una racha digna de un guardián del tiempo. 🔥🚀",
    "¡Nadie detiene a este crononauta! ¡Sigamos sumando hitos! ⭐",
  ],
  victory: [
    "¡HAS CONQUISTADO EL TIEMPO! Ordenaste las eras sin fisuras. 👑⏳",
  ],
  gameover: [
    "¡Paradoja total! Las coordenadas colapsaron... pero el tiempo siempre da revancha. 🔄",
  ],
};

export default function MentrixMascot({
  status = "idle",
  customMessage = null,
  size = "md",
  layout = "default", // 'default' | 'floating' | 'compact'
  modo = "clasico",
  streak = 0,
}) {
  const [msgIndex, setMsgIndex] = useState(0);
  const [bouncing, setBouncing] = useState(false);
  const [showBubble, setShowBubble] = useState(true);

  let activePool = CRONONAUTA_MESSAGES[status] || CRONONAUTA_MESSAGES.idle;
  if (streak >= 3 && status === "correct") {
    activePool = CRONONAUTA_MESSAGES.streak;
  }

  // Rotación suave de mensajes
  useEffect(() => {
    if (customMessage) return;
    const interval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % activePool.length);
    }, 7000);
    return () => clearInterval(timer => clearInterval(timer));
  }, [customMessage, activePool]);

  useEffect(() => {
    setMsgIndex(0);
    setShowBubble(true);
  }, [status, customMessage]);

  const currentMsg = customMessage || activePool[msgIndex % activePool.length];

  const handleTouch = (e) => {
    if (e) e.stopPropagation();
    setBouncing(true);
    setMsgIndex((prev) => (prev + 1) % activePool.length);
    setShowBubble((prev) => !prev);
    setTimeout(() => setBouncing(false), 300);
  };

  // ═══════════════════════════════════════════════════════════════
  // 1. LAYOUT FLOTANTE (ESTILO LÍNEA DE TIEMPO CON BORDES DORADOS)
  // Ubicado de forma cómoda y ergonómica. La burbuja tiene esquinas
  // redondeadas, backdrop-blur y elegantes bordes dorados ámbar.
  // ═══════════════════════════════════════════════════════════════
  if (layout === "floating") {
    return (
      <div 
        className="fixed bottom-20 right-3 z-30 flex flex-col items-end gap-2 pointer-events-none select-none max-w-[85vw] sm:max-w-md"
        style={{ touchAction: "manipulation" }}
      >
        {/* Mascota Flotante */}
        <div className="relative pointer-events-auto">
          {/* Halo áureo sutil de fondo */}
          <div className="absolute inset-0 -m-3 bg-amber-500/15 rounded-full blur-xl pointer-events-none" />

          <motion.div
            animate={{
              y: bouncing ? [0, -8, 0] : [0, -6, 0],
              scale: bouncing ? 0.95 : 1,
            }}
            transition={{
              y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
              scale: { duration: 0.2 },
            }}
            onClick={handleTouch}
            className="relative w-14 h-14 sm:w-16 sm:h-16 cursor-pointer active:scale-90 transition-transform drop-shadow-[0_8px_20px_rgba(245,158,11,0.35)]"
          >
            <img
              src="/mascota-menti-tiempo.png"
              alt="Menti Crononauta"
              width="64"
              height="64"
              decoding="async"
              className="w-full h-full object-contain pointer-events-none"
              onError={(e) => {
                e.currentTarget.src = "/mentrix-mascot.webp";
              }}
            />
          </motion.div>
        </div>

        {/* Burbuja estilo Línea de Tiempo: cápsula con bordes dorados y fondo estelar */}
        <AnimatePresence>
          {showBubble && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              onClick={() => setShowBubble(false)}
              className="pointer-events-auto cursor-pointer bg-[#0a1228]/90 hover:bg-[#0e1834]/95 backdrop-blur-xl border-2 border-amber-400/60 hover:border-amber-400 rounded-3xl px-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.7),0_0_15px_rgba(245,158,11,0.2)] max-w-xs transition-all"
            >
              <div className="flex items-center justify-between gap-1 mb-1 pb-1 border-b border-amber-400/20">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                  <Hourglass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
                  Menti Crononauta
                </span>
                <span className="text-[9px] text-amber-300/60 font-semibold">Toca para ocultar</span>
              </div>
              <p className="text-amber-50 text-xs sm:text-[13px] text-center font-medium leading-relaxed">
                {currentMsg}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 2. LAYOUT COMPACTO
  // ═══════════════════════════════════════════════════════════════
  if (layout === "compact") {
    return (
      <div 
        onClick={handleTouch}
        className="flex items-center gap-2.5 bg-[#0a1228]/90 backdrop-blur-md border border-amber-400/40 rounded-2xl p-2.5 max-w-md w-full shadow-md cursor-pointer active:scale-98 transition-all"
      >
        <div className="w-10 h-10 shrink-0 relative flex items-center justify-center">
          <img
            src="/mascota-menti-tiempo.png"
            alt="Menti"
            width="40"
            height="40"
            decoding="async"
            className="w-full h-full object-contain pointer-events-none"
            onError={(e) => { e.currentTarget.src = "/mentrix-mascot.webp"; }}
          />
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-1 text-[10px] font-black text-amber-300 uppercase tracking-wider mb-0.5">
            <Hourglass className="w-3 h-3 text-amber-400" />
            <span>Menti Crononauta</span>
          </div>
          <p className="text-xs text-amber-100 font-medium leading-tight truncate">
            {currentMsg}
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // 3. LAYOUT DEFAULT (CENTRADO)
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="w-full flex flex-col items-center gap-2 max-w-md mx-auto relative select-none py-1">
      <div className="relative flex items-center justify-center">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-500/15 rounded-full blur-xl pointer-events-none absolute inset-0 m-auto" />
        <motion.div
          animate={{
            y: bouncing ? [0, -8, 0] : [0, -6, 0],
            scale: bouncing ? 0.95 : 1,
          }}
          transition={{
            y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
            scale: { duration: 0.2 },
          }}
          onClick={handleTouch}
          className="relative z-10 w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center cursor-pointer active:scale-95 transition-transform drop-shadow-[0_8px_30px_rgba(245,158,11,0.35)]"
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

      {/* Cápsula centrada con bordes dorados */}
      <motion.div
        key={currentMsg}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={handleTouch}
        className="text-center px-6 py-2.5 rounded-full bg-[#0a1228]/90 backdrop-blur-md border border-amber-400/50 text-xs sm:text-sm text-amber-100 font-medium max-w-xs shadow-lg shadow-amber-950/40 cursor-pointer active:scale-98 transition-all"
      >
        {currentMsg}
      </motion.div>
    </div>
  );
}

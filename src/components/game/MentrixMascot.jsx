import React, { useState, useEffect } from "react";

const TIMELINE_MESSAGES = {
  idle: [
    "¿Crees que dominas la historia? Demuéstramelo. ⏳",
    "El tiempo es relativo... pero el orden de los hechos no. 😏",
    "¿Qué ocurrió primero? Arrastra o toca una ranura.",
    "Un paso en falso y cambias el curso de la historia. ⚡",
  ],
  correct: [
    "¡Exacto! Tu sentido del tiempo es impecable. 🎯",
    "¡Boom! Esa carta va justo ahí. Bien jugado. 🔥",
    "¡Impresionante! La línea del tiempo crece. ⏳",
    "Veo que conoces tu historia... continúa así. 👏",
  ],
  wrong: [
    "¡Error histórico! Esa época no coincide. 😬",
    "¡Ups! El efecto mariposa no perdona... Pierdes un corazón. 💔",
    "Casi, pero te adelantaste varios siglos en el tiempo. 🤷",
    "¡No! Ese invento fue mucho antes. Recalculando... ⏳",
  ],
  victory: [
    "¡Maestro del Tiempo! Has conquistado esta era. 👑✨",
    "¡Increíble precisión cronológica! Eres imparable. 🏆",
  ],
  gameover: [
    "¡Paradoja temporal! Se te acabaron las vidas. 💀",
    "El tiempo te ha vencido hoy... pero puedes volver a intentarlo. 🔄",
  ],
};

export default function MentrixMascot({
  status = "idle",
  customMessage = null,
  size = "md",
}) {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (customMessage) {
      setMsg(customMessage);
      return;
    }
    const pool = TIMELINE_MESSAGES[status] || TIMELINE_MESSAGES.idle;
    setMsg(pool[Math.floor(Math.random() * pool.length)]);
  }, [status, customMessage]);

  const sizeClasses = {
    sm: "w-14 h-14",
    md: "w-20 h-20",
    lg: "w-28 h-28",
  };

  return (
    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl p-3 max-w-md w-full shadow-lg backdrop-blur-sm">
      <div className={`${sizeClasses[size]} shrink-0 relative flex items-center justify-center`}>
        <img
          src="./mentrix-mascot.webp"
          alt="Menti"
          className="w-full h-full object-contain filter drop-shadow(0 4px 12px rgba(59,130,246,0.3))"
          onError={(e) => {
            // Fallback si la imagen no carga
            e.currentTarget.style.display = "none";
          }}
        />
      </div>
      <div className="flex-1 text-left">
        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-0.5">Menti · Guía Temporal</p>
        <p className="text-sm text-white/90 font-medium leading-snug">{msg}</p>
      </div>
    </div>
  );
}
